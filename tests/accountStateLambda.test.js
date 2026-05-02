import test from 'node:test';
import assert from 'node:assert/strict';
import { createHandler, mergeGuestIntoPersistedState, normalizePersistedState } from '../account-state-lambda/index.mjs';

const env = {
  USER_STATE_TABLE_NAME: 'user-state-table',
  COGNITO_USER_POOL_ID: 'eu-west-1_pool',
  COGNITO_APP_CLIENT_ID: 'client-id',
  COGNITO_ISSUER: 'https://cognito-idp.eu-west-1.amazonaws.com/eu-west-1_pool',
};

function createInMemoryStore(seed = {}) {
  const table = new Map(Object.entries(seed));

  return {
    table,
    async getByUserId(userId) {
      return table.get(userId) ?? null;
    },
    async put(record) {
      table.set(record.userId, record);
      return record;
    },
  };
}

function buildEvent({ method, path, sub = 'user-123', iss = env.COGNITO_ISSUER, body }) {
  return {
    rawPath: path,
    body: body ? JSON.stringify(body) : undefined,
    requestContext: {
      http: {
        method,
      },
      authorizer: {
        jwt: {
          claims: {
            sub,
            iss,
            client_id: env.COGNITO_APP_CLIENT_ID,
          },
        },
      },
    },
  };
}

test('normalizePersistedState normalizes invalid payloads', () => {
  assert.deepEqual(normalizePersistedState(null), {
    ingredients: [],
    pantryItems: [],
    pantryItemStatus: {},
    spices: [],
    dietaryRequirements: [],
    favourites: [],
    theme: '',
  });
});

test('mergeGuestIntoPersistedState merges arrays and pantry booleans safely', () => {
  const merged = mergeGuestIntoPersistedState(
    {
      ingredients: ['tomato'],
      pantryItems: ['salt'],
      pantryItemStatus: { salt: false },
      spices: ['pepper'],
      dietaryRequirements: [],
      favourites: [],
      theme: '',
    },
    {
      ingredients: ['tomato', 'onion'],
      pantryItems: ['salt', 'oil'],
      pantryItemStatus: { salt: true, oil: true },
      spices: ['pepper', 'paprika'],
      dietaryRequirements: ['vegan'],
      favourites: [],
      theme: 'dark',
    },
  );

  assert.deepEqual(merged, {
    ingredients: ['tomato', 'onion'],
    pantryItems: ['salt', 'oil'],
    pantryItemStatus: { salt: true, oil: true },
    spices: ['pepper', 'paprika'],
    dietaryRequirements: ['vegan'],
    favourites: [],
    theme: 'dark',
  });
});

test('createHandler migrates guest state once per device id (idempotent)', async () => {
  const store = createInMemoryStore();
  const handler = createHandler({
    env,
    now: () => '2026-01-01T00:00:00.000Z',
    stateStoreFactory: async () => store,
  });

  const payload = {
    deviceId: 'device-1',
    guestState: {
      ingredients: ['tomato'],
      pantryItems: [],
      pantryItemStatus: {},
      spices: [],
      dietaryRequirements: [],
      favourites: [],
      theme: 'dark',
    },
  };

  const first = await handler(buildEvent({ method: 'POST', path: '/account/migrate-guest', body: payload }));
  const second = await handler(buildEvent({ method: 'POST', path: '/account/migrate-guest', body: payload }));

  assert.equal(first.statusCode, 200);
  assert.equal(second.statusCode, 200);
  assert.equal(JSON.parse(first.body).migrated, true);
  assert.equal(JSON.parse(second.body).migrated, false);
});

test('createHandler enforces authenticated claim issuer/client constraints', async () => {
  const store = createInMemoryStore();
  const handler = createHandler({
    env,
    stateStoreFactory: async () => store,
  });

  const response = await handler(
    buildEvent({
      method: 'GET',
      path: '/account/state',
      iss: 'https://unexpected-issuer.example.com',
    }),
  );

  assert.equal(response.statusCode, 401);
});

test('createHandler returns 400 for malformed JSON bodies', async () => {
  const store = createInMemoryStore();
  const handler = createHandler({
    env,
    stateStoreFactory: async () => store,
  });

  const response = await handler({
    rawPath: '/account/state',
    body: '{not-json',
    requestContext: {
      http: { method: 'PUT' },
      authorizer: {
        jwt: {
          claims: {
            sub: 'user-123',
            iss: env.COGNITO_ISSUER,
            client_id: env.COGNITO_APP_CLIENT_ID,
          },
        },
      },
    },
  });

  assert.equal(response.statusCode, 400);
});
