import test from 'node:test';
import assert from 'node:assert/strict';
import { buildCognitoLoginUrl, parseAuthCallback } from '../src/services/authService.ts';

class InMemoryStorage implements Storage {
  #store = new Map<string, string>();

  clear(): void {
    this.#store.clear();
  }

  getItem(key: string): string | null {
    return this.#store.get(key) ?? null;
  }

  key(index: number): string | null {
    return Array.from(this.#store.keys())[index] ?? null;
  }

  removeItem(key: string): void {
    this.#store.delete(key);
  }

  setItem(key: string, value: string): void {
    this.#store.set(key, value);
  }

  get length(): number {
    return this.#store.size;
  }
}

const localStorageMock = new InMemoryStorage();
const sessionStorageMock = new InMemoryStorage();

function setAuthEnv(): void {
  (globalThis as typeof globalThis & { __AUTH_ENV__?: Record<string, string> }).__AUTH_ENV__ = {
    VITE_COGNITO_APP_CLIENT_ID: 'client-id',
    VITE_COGNITO_HOSTED_UI_DOMAIN: 'example.auth.eu-west-1.amazoncognito.com',
    VITE_COGNITO_REDIRECT_URI: 'http://localhost:5173/auth/callback',
    VITE_COGNITO_LOGOUT_URI: 'http://localhost:5173/',
  };
}

function resetTestState(): void {
  localStorageMock.clear();
  sessionStorageMock.clear();
  globalThis.localStorage = localStorageMock;
  globalThis.sessionStorage = sessionStorageMock;
  setAuthEnv();
}

test('buildCognitoLoginUrl generates code flow URL and parseAuthCallback exchanges code for tokens', async () => {
  resetTestState();

  const loginUrl = await buildCognitoLoginUrl(undefined, 'Google');
  assert.ok(loginUrl);

  const loginParams = new URL(loginUrl).searchParams;
  const state = loginParams.get('state');
  assert.equal(loginParams.get('response_type'), 'code');
  assert.equal(loginParams.get('code_challenge_method'), 'S256');
  assert.ok(loginParams.get('code_challenge'));
  assert.equal(loginParams.get('identity_provider'), 'Google');
  assert.ok(state);

  const fetchCalls: Array<{ url: string; body: string }> = [];
  globalThis.fetch = (async (url: string | URL | Request, init?: RequestInit) => {
    fetchCalls.push({ url: String(url), body: (init?.body as string) ?? '' });
    return {
      ok: true,
      json: async () => ({
        access_token: 'access-token',
        id_token: 'id-token',
        token_type: 'Bearer',
        expires_in: 1200,
      }),
    } as Response;
  }) as typeof fetch;

  const session = await parseAuthCallback(`http://localhost:5173/auth/callback?code=abc123&state=${state}`);
  assert.equal(session.accessToken, 'access-token');
  assert.equal(session.idToken, 'id-token');
  assert.equal(session.tokenType, 'Bearer');
  assert.equal(fetchCalls.length, 1);
  assert.equal(fetchCalls[0]?.url, 'https://example.auth.eu-west-1.amazoncognito.com/oauth2/token');
  assert.match(fetchCalls[0]?.body ?? '', /grant_type=authorization_code/);
  assert.match(fetchCalls[0]?.body ?? '', /code_verifier=/);
  assert.equal(sessionStorageMock.getItem('authPkceSession'), null);
});

test('parseAuthCallback falls back to default expiration when expires_in is invalid', async () => {
  resetTestState();

  const loginUrl = await buildCognitoLoginUrl();
  assert.ok(loginUrl);
  const state = new URL(loginUrl).searchParams.get('state');
  assert.ok(state);

  globalThis.fetch = (async () => ({
    ok: true,
    json: async () => ({
      access_token: 'access-token',
      token_type: 'Bearer',
      expires_in: 'invalid',
    }),
  })) as typeof fetch;

  const beforeParse = Date.now();
  const session = await parseAuthCallback(`http://localhost:5173/auth/callback?code=abc123&state=${state}`);
  const expiresInMs = session.expiresAt - beforeParse;
  assert.ok(expiresInMs >= 3590000 && expiresInMs <= 3610000);
});

test('parseAuthCallback rejects when callback state does not match stored PKCE state', async () => {
  resetTestState();

  const loginUrl = await buildCognitoLoginUrl();
  assert.ok(loginUrl);

  await assert.rejects(
    () => parseAuthCallback('http://localhost:5173/auth/callback?code=abc123&state=wrong-state'),
    /Authentication state could not be verified/,
  );
  assert.equal(sessionStorageMock.getItem('authPkceSession'), null);
});
