import { getFromLocalStorage, removeFromLocalStorage, saveToLocalStorage } from '../utils/storageUtils.ts';

const AUTH_SESSION_STORAGE_KEY = 'authSession';
const AUTH_PKCE_STORAGE_KEY = 'authPkceSession';
const DEFAULT_EXPIRES_IN_SECONDS = 3600;

export interface AuthSession {
  accessToken: string;
  idToken?: string;
  tokenType: string;
  expiresAt: number;
}

export type AuthProvider = 'Google' | 'SignInWithApple';

interface CognitoAuthConfig {
  appClientId: string;
  hostedUiDomain: string;
  redirectUri: string;
  logoutUri: string;
  tokenEndpoint: string;
}

interface PkceSession {
  codeVerifier: string;
  state: string;
}

interface CognitoTokenResponse {
  access_token?: string;
  id_token?: string;
  token_type?: string;
  expires_in?: number | string;
  error?: string;
  error_description?: string;
}

function isPlaceholder(value: string): boolean {
  return value.trim().length === 0 || value.includes('REPLACE_ME');
}

function sanitizeDomain(domain: string): string {
  if (domain.startsWith('http://') || domain.startsWith('https://')) {
    return domain;
  }
  return `https://${domain}`;
}

function getEnvValue(key: string): string {
  const runtimeEnv = (globalThis as typeof globalThis & { __AUTH_ENV__?: Record<string, string | undefined> }).__AUTH_ENV__;
  if (runtimeEnv && key in runtimeEnv) {
    return runtimeEnv[key] ?? '';
  }

  const viteEnv = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env;
  return viteEnv?.[key] ?? '';
}

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function generateRandomString(byteLength = 64): string {
  const randomBytes = new Uint8Array(byteLength);
  crypto.getRandomValues(randomBytes);
  return base64UrlEncode(randomBytes);
}

async function generateCodeChallenge(codeVerifier: string): Promise<string> {
  const verifierBytes = new TextEncoder().encode(codeVerifier);
  const digest = await crypto.subtle.digest('SHA-256', verifierBytes);
  return base64UrlEncode(new Uint8Array(digest));
}

function savePkceSession(session: PkceSession): void {
  sessionStorage.setItem(AUTH_PKCE_STORAGE_KEY, JSON.stringify(session));
}

function getStoredPkceSession(): PkceSession | null {
  const serializedSession = sessionStorage.getItem(AUTH_PKCE_STORAGE_KEY);
  if (!serializedSession) {
    return null;
  }

  try {
    const parsedSession = JSON.parse(serializedSession) as Partial<PkceSession>;
    if (!parsedSession.codeVerifier || !parsedSession.state) {
      sessionStorage.removeItem(AUTH_PKCE_STORAGE_KEY);
      return null;
    }
    return {
      codeVerifier: parsedSession.codeVerifier,
      state: parsedSession.state,
    };
  } catch {
    sessionStorage.removeItem(AUTH_PKCE_STORAGE_KEY);
    return null;
  }
}

function clearPkceSession(): void {
  sessionStorage.removeItem(AUTH_PKCE_STORAGE_KEY);
}

function getCognitoAuthConfig(): CognitoAuthConfig | null {
  const appClientId = getEnvValue('VITE_COGNITO_APP_CLIENT_ID');
  const hostedUiDomain = getEnvValue('VITE_COGNITO_HOSTED_UI_DOMAIN');
  const redirectUri = getEnvValue('VITE_COGNITO_REDIRECT_URI');
  const logoutUri = getEnvValue('VITE_COGNITO_LOGOUT_URI');

  if ([appClientId, hostedUiDomain, redirectUri, logoutUri].some(isPlaceholder)) {
    return null;
  }

  const sanitizedDomain = sanitizeDomain(hostedUiDomain);

  return {
    appClientId,
    hostedUiDomain: sanitizedDomain,
    redirectUri,
    logoutUri,
    tokenEndpoint: `${sanitizedDomain}/oauth2/token`,
  };
}

export function isAuthEnabled(): boolean {
  return getCognitoAuthConfig() !== null;
}

export async function buildCognitoLoginUrl(state?: string, identityProvider?: AuthProvider): Promise<string | null> {
  const config = getCognitoAuthConfig();
  if (!config) {
    return null;
  }

  const codeVerifier = generateRandomString();
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  const resolvedState = state ?? generateRandomString(16);

  savePkceSession({
    codeVerifier,
    state: resolvedState,
  });

  const params = new URLSearchParams({
    client_id: config.appClientId,
    response_type: 'code',
    scope: 'openid email profile',
    redirect_uri: config.redirectUri,
    state: resolvedState,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  });

  if (identityProvider) {
    params.set('identity_provider', identityProvider);
  }

  return `${config.hostedUiDomain}/oauth2/authorize?${params.toString()}`;
}

export function buildCognitoLogoutUrl(): string | null {
  const config = getCognitoAuthConfig();
  if (!config) {
    return null;
  }

  const params = new URLSearchParams({
    client_id: config.appClientId,
    logout_uri: config.logoutUri,
  });

  return `${config.hostedUiDomain}/logout?${params.toString()}`;
}

export function saveAuthSession(session: AuthSession): void {
  saveToLocalStorage(AUTH_SESSION_STORAGE_KEY, session);
}

export function clearAuthSession(): void {
  removeFromLocalStorage(AUTH_SESSION_STORAGE_KEY);
  clearPkceSession();
}

export function getStoredAuthSession(): AuthSession | null {
  const session = getFromLocalStorage<AuthSession>(AUTH_SESSION_STORAGE_KEY);
  if (!session) {
    return null;
  }

  if (session.expiresAt <= Date.now()) {
    clearAuthSession();
    return null;
  }

  return session;
}

async function exchangeAuthCodeForTokens(
  config: CognitoAuthConfig,
  authorizationCode: string,
  codeVerifier: string,
): Promise<CognitoTokenResponse> {
  const requestBody = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: config.appClientId,
    code: authorizationCode,
    redirect_uri: config.redirectUri,
    code_verifier: codeVerifier,
  });

  const response = await fetch(config.tokenEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: requestBody.toString(),
  });

  const payload = (await response.json()) as CognitoTokenResponse;
  if (!response.ok) {
    throw new Error(payload.error_description ?? payload.error ?? 'Authentication failed.');
  }

  return payload;
}

export async function parseAuthCallback(callbackUrl: string): Promise<AuthSession> {
  const callback = new URL(callbackUrl);
  const queryParams = callback.searchParams;
  const error = queryParams.get('error');
  if (error) {
    const description = queryParams.get('error_description');
    throw new Error(description ?? 'Authentication failed.');
  }

  const authorizationCode = queryParams.get('code');
  if (!authorizationCode) {
    throw new Error('Authentication callback did not include an authorization code.');
  }

  const config = getCognitoAuthConfig();
  if (!config) {
    throw new Error('Authentication is not configured for this environment.');
  }

  const pkceSession = getStoredPkceSession();
  if (!pkceSession) {
    throw new Error('Sign-in session expired. Please try signing in again.');
  }

  const callbackState = queryParams.get('state');
  if (!callbackState || callbackState !== pkceSession.state) {
    clearPkceSession();
    throw new Error('Authentication state could not be verified. Please try signing in again.');
  }

  let tokenResponse: CognitoTokenResponse;
  try {
    tokenResponse = await exchangeAuthCodeForTokens(config, authorizationCode, pkceSession.codeVerifier);
  } finally {
    clearPkceSession();
  }

  const accessToken = tokenResponse.access_token;
  if (!accessToken) {
    throw new Error('Authentication callback did not include an access token.');
  }

  const expiresInValue = tokenResponse.expires_in?.toString();
  const expiresIn = expiresInValue ? Number.parseInt(expiresInValue, 10) : DEFAULT_EXPIRES_IN_SECONDS;
  const validExpiresIn = Number.isFinite(expiresIn) && expiresIn > 0 ? expiresIn : DEFAULT_EXPIRES_IN_SECONDS;
  const tokenType = tokenResponse.token_type ?? 'Bearer';
  const idToken = tokenResponse.id_token ?? undefined;

  return {
    accessToken,
    idToken,
    tokenType,
    expiresAt: Date.now() + validExpiresIn * 1000,
  };
}
