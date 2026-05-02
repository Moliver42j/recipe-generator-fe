import type { Recipe } from '../types';
import type { AuthSession } from './authService';

const DEFAULT_RECIPE_API_URL = 'https://n9f4glumj7.execute-api.eu-west-1.amazonaws.com/default/recipeApi';
const REQUEST_TIMEOUT_MS = 30000;

export interface AccountState {
  ingredients: string[];
  pantryItems: string[];
  pantryItemStatus: Record<string, boolean>;
  spices: string[];
  dietaryRequirements: string[];
  favourites: Recipe[];
  theme: string;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface PersistedAccountState {
  ingredients: string[];
  pantryItems: string[];
  pantryItemStatus: Record<string, boolean>;
  spices: string[];
  dietaryRequirements: string[];
  favourites: Recipe[];
  theme: string;
}

interface MigrateGuestPayload {
  deviceId: string;
  guestState: PersistedAccountState;
}

interface MigrateGuestResponse {
  migrated: boolean;
  state: AccountState;
}

export class AccountApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'AccountApiError';
    this.status = status;
  }
}

export function resolveAccountApiBaseUrl(recipeApiUrl: string): string {
  const configuredRecipeUrl = (recipeApiUrl.trim() || DEFAULT_RECIPE_API_URL).replace(/\/+$/, '');
  const recipeSuffix = '/recipeApi';
  const withoutRecipePath = configuredRecipeUrl.endsWith(recipeSuffix)
    ? configuredRecipeUrl.slice(0, -recipeSuffix.length)
    : configuredRecipeUrl;
  return withoutRecipePath.replace(/\/+$/, '');
}

function getApiBaseUrl(): string {
  return resolveAccountApiBaseUrl((import.meta.env.VITE_API_URL as string | undefined) ?? DEFAULT_RECIPE_API_URL);
}

function createAuthorizationHeader(session: AuthSession): string {
  return `${session.tokenType} ${session.accessToken}`;
}

async function accountFetch<TResponse>(path: string, session: AuthSession, init: RequestInit): Promise<TResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${getApiBaseUrl()}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        Authorization: createAuthorizationHeader(session),
        ...init.headers,
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      const message = await response.text();
      throw new AccountApiError(response.status, message || `Request failed with status ${response.status}`);
    }

    return (await response.json()) as TResponse;
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new AccountApiError(408, 'Account request timed out. Please try again.');
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

export function buildPersistedAccountState(payload: PersistedAccountState): PersistedAccountState {
  return {
    ingredients: payload.ingredients,
    pantryItems: payload.pantryItems,
    pantryItemStatus: payload.pantryItemStatus,
    spices: payload.spices,
    dietaryRequirements: payload.dietaryRequirements,
    favourites: payload.favourites,
    theme: payload.theme,
  };
}

export async function getAccountState(session: AuthSession): Promise<AccountState> {
  return accountFetch<AccountState>('/account/state', session, { method: 'GET' });
}

export async function putAccountState(session: AuthSession, state: PersistedAccountState): Promise<AccountState> {
  return accountFetch<AccountState>('/account/state', session, {
    method: 'PUT',
    body: JSON.stringify(state),
  });
}

export async function migrateGuestState(session: AuthSession, payload: MigrateGuestPayload): Promise<MigrateGuestResponse> {
  return accountFetch<MigrateGuestResponse>('/account/migrate-guest', session, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
