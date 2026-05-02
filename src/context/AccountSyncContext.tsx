import { useEffect, useMemo, useRef, type ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { useHome } from './HomeContext';
import { useConfig } from './ConfigContext';
import { useFavourites } from './FavouritesContext';
import type { Recipe } from '../types';
import {
  buildPersistedAccountState,
  getAccountState,
  migrateGuestState,
  putAccountState,
  type PersistedAccountState,
} from '../services/accountApi';
import { getFromLocalStorage } from '../utils/storageUtils';

const ACCOUNT_SYNC_DEBOUNCE_MS = 1200;
const DEVICE_ID_STORAGE_KEY = 'guestDeviceId';
const MIGRATION_MARKERS_STORAGE_KEY = 'guestMigrationMarkersByUser';

function createDeviceId(): string {
  return `device-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function getOrCreateDeviceId(): string {
  const existing = localStorage.getItem(DEVICE_ID_STORAGE_KEY);
  if (existing) {
    return existing;
  }
  const next = createDeviceId();
  localStorage.setItem(DEVICE_ID_STORAGE_KEY, next);
  return next;
}

function getStoredTheme(): string {
  return localStorage.getItem('theme') ?? '';
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const sections = token.split('.');
  if (sections.length < 2) {
    return null;
  }

  try {
    const base64 = sections[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const decoded = atob(padded);
    const payload = JSON.parse(decoded) as unknown;
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
      return null;
    }
    return payload as Record<string, unknown>;
  } catch {
    return null;
  }
}

function getSessionUserId(accessToken: string, idToken?: string): string | null {
  const idPayload = idToken ? decodeJwtPayload(idToken) : null;
  const accessPayload = decodeJwtPayload(accessToken);
  const sub = idPayload?.sub ?? accessPayload?.sub;
  return typeof sub === 'string' && sub.trim() ? sub.trim() : null;
}

function getStoredMigrationMarkers(): Record<string, string[]> {
  const raw = localStorage.getItem(MIGRATION_MARKERS_STORAGE_KEY);
  if (!raw) {
    return {};
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return {};
    }

    const result: Record<string, string[]> = {};
    for (const [userId, markers] of Object.entries(parsed)) {
      if (Array.isArray(markers)) {
        const normalized = markers
          .map((item) => (typeof item === 'string' ? item.trim() : ''))
          .filter(Boolean);
        if (normalized.length > 0) {
          result[userId] = Array.from(new Set(normalized));
        }
      }
    }
    return result;
  } catch {
    return {};
  }
}

function hasStoredMigrationMarker(userId: string, deviceId: string): boolean {
  const markersByUser = getStoredMigrationMarkers();
  return markersByUser[userId]?.includes(deviceId) ?? false;
}

function saveStoredMigrationMarker(userId: string, deviceId: string): void {
  const markersByUser = getStoredMigrationMarkers();
  const existing = markersByUser[userId] ?? [];
  if (existing.includes(deviceId)) {
    return;
  }
  const next = {
    ...markersByUser,
    [userId]: [...existing, deviceId],
  };
  localStorage.setItem(MIGRATION_MARKERS_STORAGE_KEY, JSON.stringify(next));
}

export function AccountSyncProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, session } = useAuth();
  const { ingredients, setIngredients } = useHome();
  const {
    pantryItems,
    setPantryItems,
    pantryItemStatus,
    setPantryItemStatus,
    spices,
    setSpices,
    dietaryRequirements,
    setDietaryRequirements,
  } = useConfig();
  const { favourites, setFavourites } = useFavourites();

  const hasHydratedRef = useRef(false);
  const isHydratingRef = useRef(false);
  const lastSyncedSignatureRef = useRef<string | null>(null);
  const hydratedSessionKeyRef = useRef<string | null>(null);
  const currentSessionKey = useMemo(() => {
    if (!session) {
      return null;
    }
    return getSessionUserId(session.accessToken, session.idToken) ?? session.accessToken;
  }, [session]);

  const localStateSnapshot = useMemo<PersistedAccountState>(() => (
    buildPersistedAccountState({
      ingredients,
      pantryItems,
      pantryItemStatus,
      spices,
      dietaryRequirements,
      favourites,
      theme: getStoredTheme(),
    })
  ), [
    dietaryRequirements,
    favourites,
    ingredients,
    pantryItemStatus,
    pantryItems,
    spices,
  ]);

  useEffect(() => {
    if (!isAuthenticated || !session) {
      hasHydratedRef.current = false;
      isHydratingRef.current = false;
      lastSyncedSignatureRef.current = null;
      hydratedSessionKeyRef.current = null;
      return;
    }

    if (!currentSessionKey || hydratedSessionKeyRef.current === currentSessionKey) {
      return;
    }

    let cancelled = false;
    isHydratingRef.current = true;
    hydratedSessionKeyRef.current = currentSessionKey;

    const applySyncedState = (synced: PersistedAccountState) => {
      setIngredients(synced.ingredients);
      setPantryItems(synced.pantryItems);
      setPantryItemStatus(synced.pantryItemStatus);
      setSpices(synced.spices);
      setDietaryRequirements(synced.dietaryRequirements);
      setFavourites(synced.favourites);
      lastSyncedSignatureRef.current = JSON.stringify(buildPersistedAccountState({
        ingredients: synced.ingredients,
        pantryItems: synced.pantryItems,
        pantryItemStatus: synced.pantryItemStatus,
        spices: synced.spices,
        dietaryRequirements: synced.dietaryRequirements,
        favourites: synced.favourites,
        theme: getStoredTheme(),
      }));
    };

    (async () => {
      try {
        const userId = getSessionUserId(session.accessToken, session.idToken);
        const deviceId = getOrCreateDeviceId();
        const guestState = buildPersistedAccountState({
          ingredients: getFromLocalStorage<string[]>('ingredients') ?? [],
          pantryItems: getFromLocalStorage<string[]>('pantryItems') ?? [],
          pantryItemStatus: getFromLocalStorage<Record<string, boolean>>('pantryItemStatus') ?? {},
          spices: getFromLocalStorage<string[]>('spices') ?? [],
          dietaryRequirements: getFromLocalStorage<string[]>('dietaryRequirements') ?? [],
          favourites: getFromLocalStorage<Recipe[]>('favourites') ?? [],
          theme: getStoredTheme(),
        });

        const shouldMigrateGuestState = Boolean(userId && !hasStoredMigrationMarker(userId, deviceId));
        if (shouldMigrateGuestState) {
          try {
            await migrateGuestState(session, { deviceId, guestState });
            if (userId) {
              saveStoredMigrationMarker(userId, deviceId);
            }
          } catch (migrationError) {
            console.error('Guest migration failed, falling back to account state fetch:', migrationError);
          }
        }

        const synced = await getAccountState(session);
        if (cancelled) {
          return;
        }

        applySyncedState(synced);
      } catch (stateError) {
        console.error('Account state hydration failed:', stateError);
        hydratedSessionKeyRef.current = null;
      } finally {
        if (!cancelled) {
          hasHydratedRef.current = true;
          isHydratingRef.current = false;
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    currentSessionKey,
    isAuthenticated,
    session,
    setDietaryRequirements,
    setFavourites,
    setIngredients,
    setPantryItems,
    setPantryItemStatus,
    setSpices,
  ]);

  useEffect(() => {
    if (!isAuthenticated || !session || !hasHydratedRef.current || isHydratingRef.current) {
      return;
    }

    const nextSignature = JSON.stringify(localStateSnapshot);
    if (nextSignature === lastSyncedSignatureRef.current) {
      return;
    }

    const timeoutId = setTimeout(() => {
      if (!session) {
        return;
      }

      putAccountState(session, localStateSnapshot)
        .then((synced) => {
          lastSyncedSignatureRef.current = JSON.stringify(buildPersistedAccountState({
            ingredients: synced.ingredients,
            pantryItems: synced.pantryItems,
            pantryItemStatus: synced.pantryItemStatus,
            spices: synced.spices,
            dietaryRequirements: synced.dietaryRequirements,
            favourites: synced.favourites,
            theme: localStateSnapshot.theme,
          }));
        })
        .catch((syncError) => {
          console.error('Account state sync failed:', syncError);
        });
    }, ACCOUNT_SYNC_DEBOUNCE_MS);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [
    isAuthenticated,
    localStateSnapshot,
    session,
  ]);

  return children;
}
