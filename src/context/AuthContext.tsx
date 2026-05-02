import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
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
  login: (provider?: AuthProvider) => void;
  continueAsGuest: () => void;
  logout: () => void;
  handleAuthCallback: (callbackUrl: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

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

  const value: AuthContextType = {
    status,
    session,
    isAuthenticated: status === 'authenticated',
    isGuest: status === 'guest',
    isAuthEnabled: authEnabled,
    authError,
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
