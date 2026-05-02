import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import {
  buildCognitoLoginUrl,
  buildCognitoLogoutUrl,
  clearAuthSession,
  getStoredAuthSession,
  isAuthEnabled,
  parseAuthCallback,
  saveAuthSession,
  type AuthProvider,
  type AuthSession,
} from '../services/authService';

type AuthStatus = 'guest' | 'authenticated';

interface AuthContextType {
  status: AuthStatus;
  session: AuthSession | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  isAuthEnabled: boolean;
  authError: string | null;
  userFirstName: string | null;
  login: (provider?: AuthProvider) => void;
  continueAsGuest: () => void;
  logout: () => void;
  handleAuthCallback: (callbackUrl: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

function decodeJwtPayload(token?: string): Record<string, unknown> | null {
  if (!token) {
    return null;
  }
  const sections = token.split('.');
  if (sections.length < 2) {
    return null;
  }

  try {
    const base64 = sections[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const decoded = atob(padded);
    const parsed = JSON.parse(decoded) as unknown;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return null;
    }
    return parsed as Record<string, unknown>;
  } catch {
    return null;
  }
}

function getFirstNameFromSession(session: AuthSession | null): string | null {
  if (!session) {
    return null;
  }

  const idTokenPayload = decodeJwtPayload(session.idToken);
  const accessTokenPayload = decodeJwtPayload(session.accessToken);
  const preferredClaim =
    idTokenPayload?.given_name ??
    idTokenPayload?.name ??
    accessTokenPayload?.given_name ??
    accessTokenPayload?.name;

  if (typeof preferredClaim === 'string' && preferredClaim.trim()) {
    return preferredClaim.trim().split(/\s+/)[0];
  }

  const email = idTokenPayload?.email ?? accessTokenPayload?.email;
  if (typeof email === 'string' && email.includes('@')) {
    const firstSegment = email.split('@')[0]?.trim();
    if (firstSegment) {
      return firstSegment;
    }
  }

  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(() => getStoredAuthSession());
  const [authError, setAuthError] = useState<string | null>(null);

  const handleAuthCallback = useCallback(async (callbackUrl: string) => {
    const parsedSession = await parseAuthCallback(callbackUrl);
    saveAuthSession(parsedSession);
    setSession(parsedSession);
  }, []);

  const login = useCallback((provider?: AuthProvider) => {
    void (async () => {
      setAuthError(null);
      const loginUrl = await buildCognitoLoginUrl(undefined, provider);
      if (!loginUrl) {
        setAuthError('Social login is not configured for this deployment.');
        return;
      }
      window.location.assign(loginUrl);
    })().catch((error) => {
      const message = error instanceof Error ? error.message : 'Unable to start sign-in. Please try again.';
      setAuthError(message);
    });
  }, []);

  const continueAsGuest = useCallback(() => {
    clearAuthSession();
    setSession(null);
    setAuthError(null);
  }, []);

  const logout = useCallback(() => {
    clearAuthSession();
    setSession(null);
    setAuthError(null);

    const logoutUrl = buildCognitoLogoutUrl();
    if (logoutUrl) {
      window.location.assign(logoutUrl);
    }
  }, []);

  const authEnabled = isAuthEnabled();
  const status: AuthStatus = session ? 'authenticated' : 'guest';
  const userFirstName = useMemo(() => getFirstNameFromSession(session), [session]);

  const value: AuthContextType = {
    status,
    session,
    isAuthenticated: status === 'authenticated',
    isGuest: status === 'guest',
    isAuthEnabled: authEnabled,
    authError,
    userFirstName,
    login,
    continueAsGuest,
    logout,
    handleAuthCallback,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
