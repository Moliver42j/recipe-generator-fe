import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';

const REQUIRED_ENV_VARS = [
  'USER_STATE_TABLE_NAME',
  'COGNITO_USER_POOL_ID',
  'COGNITO_APP_CLIENT_ID',
  'COGNITO_ISSUER',
];

const JSON_HEADERS = {
  'Content-Type': 'application/json',
};

const EMPTY_PERSISTED_STATE = {
  ingredients: [],
  pantryItems: [],
  pantryItemStatus: {},
  spices: [],
  dietaryRequirements: [],
  favourites: [],
  theme: '',
};

let documentClientPromise;

function createResponse(statusCode, payload) {
  return {
    statusCode,
    headers: JSON_HEADERS,
    body: JSON.stringify(payload),
  };
}

function parseJsonBody(body) {
  if (!body || typeof body !== 'string') {
    return { payload: {}, malformed: false };
  }

  try {
    const parsed = JSON.parse(body);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return { payload: {}, malformed: false };
    }
    return { payload: parsed, malformed: false };
  } catch {
    return { payload: {}, malformed: true };
  }
}

function normalizeStringArray(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return Array.from(
    new Set(
      value.map((item) => (typeof item === 'string' ? item.trim() : '')).filter(Boolean),
    ),
  );
}

function normalizePantryItemStatus(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }

  const normalized = {};
  for (const [key, itemValue] of Object.entries(value)) {
    const trimmed = typeof key === 'string' ? key.trim() : '';
    if (!trimmed) {
      continue;
    }

    if (typeof itemValue === 'boolean') {
      normalized[trimmed] = itemValue;
      continue;
    }

    if (itemValue === 'true') {
      normalized[trimmed] = true;
      continue;
    }

    if (itemValue === 'false') {
      normalized[trimmed] = false;
    }
  }

  return normalized;
}

function normalizeFavourites(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  const bySignature = new Map();

  for (const item of value) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      continue;
    }

    const recipe = typeof item.recipe === 'string' ? item.recipe.trim() : '';
    const ingredients = normalizeStringArray(item.ingredients);
    const instructions = Array.isArray(item.instructions)
      ? item.instructions.map((step) => (typeof step === 'string' ? step.trim() : '')).filter(Boolean)
      : typeof item.instructions === 'string'
        ? item.instructions.trim()
        : '';
    const descriptionStart = typeof item.descriptionStart === 'string' ? item.descriptionStart.trim() : undefined;
    const descriptionEnd = typeof item.descriptionEnd === 'string' ? item.descriptionEnd.trim() : undefined;
    const link = typeof item.link === 'string' ? item.link.trim() : undefined;
    const error = typeof item.error === 'string' ? item.error.trim() : undefined;

    if (!recipe || ingredients.length === 0) {
      continue;
    }

    const caloriesPerServing =
      item.caloriesPerServing && typeof item.caloriesPerServing === 'object' && !Array.isArray(item.caloriesPerServing)
        ? {
            calories:
              typeof item.caloriesPerServing.calories === 'string' ? item.caloriesPerServing.calories.trim() : '',
            protein: typeof item.caloriesPerServing.protein === 'string' ? item.caloriesPerServing.protein.trim() : '',
            carbs: typeof item.caloriesPerServing.carbs === 'string' ? item.caloriesPerServing.carbs.trim() : '',
          }
        : undefined;

    const normalizedFavourite = {
      ...item,
      recipe,
      ingredients,
      instructions,
      ...(descriptionStart ? { descriptionStart } : {}),
      ...(descriptionEnd ? { descriptionEnd } : {}),
      ...(link ? { link } : {}),
      ...(error ? { error } : {}),
      ...(caloriesPerServing ? { caloriesPerServing } : {}),
    };

    const signature = `${recipe}::${ingredients.join('|')}`;
    bySignature.set(signature, normalizedFavourite);
  }

  return Array.from(bySignature.values());
}

export function normalizePersistedState(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return { ...EMPTY_PERSISTED_STATE };
  }

  return {
    ingredients: normalizeStringArray(payload.ingredients),
    pantryItems: normalizeStringArray(payload.pantryItems),
    pantryItemStatus: normalizePantryItemStatus(payload.pantryItemStatus),
    spices: normalizeStringArray(payload.spices),
    dietaryRequirements: normalizeStringArray(payload.dietaryRequirements),
    favourites: normalizeFavourites(payload.favourites),
    theme: typeof payload.theme === 'string' ? payload.theme.trim() : '',
  };
}

function unionArrays(first, second) {
  return Array.from(new Set([...first, ...second]));
}

function mergePantryStatuses(existing, incoming) {
  const merged = { ...existing };
  for (const [key, value] of Object.entries(incoming)) {
    if (typeof merged[key] !== 'boolean') {
      merged[key] = value;
      continue;
    }
    merged[key] = merged[key] || value;
  }
  return merged;
}

function mergeFavourites(existing, incoming) {
  const merged = new Map();

  for (const favourite of [...existing, ...incoming]) {
    const signature = `${favourite.recipe}::${favourite.ingredients.join('|')}`;
    merged.set(signature, favourite);
  }

  return Array.from(merged.values());
}

export function mergeGuestIntoPersistedState(existingState, guestState) {
  return {
    ingredients: unionArrays(existingState.ingredients, guestState.ingredients),
    pantryItems: unionArrays(existingState.pantryItems, guestState.pantryItems),
    pantryItemStatus: mergePantryStatuses(existingState.pantryItemStatus, guestState.pantryItemStatus),
    spices: unionArrays(existingState.spices, guestState.spices),
    dietaryRequirements: unionArrays(existingState.dietaryRequirements, guestState.dietaryRequirements),
    favourites: mergeFavourites(existingState.favourites, guestState.favourites),
    theme: existingState.theme || guestState.theme,
  };
}

export function normalizeMigratedDeviceIds(deviceIds) {
  if (!Array.isArray(deviceIds)) {
    return [];
  }

  return Array.from(
    new Set(
      deviceIds.map((value) => (typeof value === 'string' ? value.trim() : '')).filter(Boolean),
    ),
  );
}

function sanitizeUserRecord(item) {
  if (!item || typeof item !== 'object' || Array.isArray(item)) {
    return null;
  }

  return {
    userId: typeof item.userId === 'string' ? item.userId : '',
    state: normalizePersistedState(item.state),
    createdAt: typeof item.createdAt === 'string' ? item.createdAt : null,
    updatedAt: typeof item.updatedAt === 'string' ? item.updatedAt : null,
    migratedDeviceIds: normalizeMigratedDeviceIds(item.migratedDeviceIds),
  };
}

function formatPublicState(record) {
  return {
    ...record.state,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

function getHttpMethod(event) {
  return event?.requestContext?.http?.method ?? event?.httpMethod ?? '';
}

function getRawPath(event) {
  return event?.rawPath ?? event?.path ?? '';
}

function resolveSubjectFromClaims(claims) {
  if (!claims || typeof claims !== 'object' || Array.isArray(claims)) {
    return null;
  }

  const subject = typeof claims.sub === 'string' ? claims.sub.trim() : '';
  return subject || null;
}

function getJwtClaims(event) {
  return event?.requestContext?.authorizer?.jwt?.claims ?? event?.requestContext?.authorizer?.claims ?? null;
}

function validateJwtClaims(claims, env) {
  const subject = resolveSubjectFromClaims(claims);
  if (!subject) {
    return { ok: false, statusCode: 401, message: 'Missing authenticated subject claim.' };
  }

  const issuer = typeof claims.iss === 'string' ? claims.iss : '';
  if (issuer && issuer !== env.COGNITO_ISSUER) {
    return { ok: false, statusCode: 401, message: 'Token issuer mismatch.' };
  }

  const audience = claims.aud;
  if (typeof audience === 'string' && audience !== env.COGNITO_APP_CLIENT_ID) {
    return { ok: false, statusCode: 401, message: 'Token audience mismatch.' };
  }

  if (Array.isArray(audience) && !audience.includes(env.COGNITO_APP_CLIENT_ID)) {
    return { ok: false, statusCode: 401, message: 'Token audience mismatch.' };
  }

  const clientId = typeof claims.client_id === 'string' ? claims.client_id : '';
  if (clientId && clientId !== env.COGNITO_APP_CLIENT_ID) {
    return { ok: false, statusCode: 401, message: 'Token client mismatch.' };
  }

  return { ok: true, subject };
}

function ensureRequiredEnv(env) {
  for (const name of REQUIRED_ENV_VARS) {
    if (!env[name] || typeof env[name] !== 'string' || !env[name].trim()) {
      throw new Error(`Missing required environment variable: ${name}`);
    }
  }
}

async function createDocumentClient() {
  if (!documentClientPromise) {
    const client = new DynamoDBClient({});
    documentClientPromise = Promise.resolve(DynamoDBDocumentClient.from(client));
  }

  return documentClientPromise;
}

async function buildDynamoStateStore(env) {
  const documentClient = await createDocumentClient();
  const tableName = env.USER_STATE_TABLE_NAME;

  return {
    async getByUserId(userId) {
      const response = await documentClient.send(
        new GetCommand({
          TableName: tableName,
          Key: { userId },
        }),
      );

      return sanitizeUserRecord(response.Item ?? null);
    },
    async put(record) {
      await documentClient.send(
        new PutCommand({
          TableName: tableName,
          Item: {
            userId: record.userId,
            state: record.state,
            createdAt: record.createdAt,
            updatedAt: record.updatedAt,
            migratedDeviceIds: record.migratedDeviceIds,
          },
        }),
      );

      return record;
    },
  };
}

async function getStateOrDefault(store, userId) {
  const record = await store.getByUserId(userId);
  if (record) {
    return record;
  }

  return {
    userId,
    state: { ...EMPTY_PERSISTED_STATE },
    createdAt: null,
    updatedAt: null,
    migratedDeviceIds: [],
  };
}

function buildPutRecord(previous, userId, state, nowIsoString) {
  return {
    userId,
    state,
    createdAt: previous?.createdAt ?? nowIsoString,
    updatedAt: nowIsoString,
    migratedDeviceIds: previous?.migratedDeviceIds ?? [],
  };
}

function getDeviceIdFromMigrationRequest(body) {
  const deviceId = typeof body.deviceId === 'string' ? body.deviceId.trim() : '';
  return deviceId || null;
}

function routeMatches(rawPath, suffix) {
  return rawPath === suffix || rawPath.endsWith(suffix);
}

export function createHandler(options = {}) {
  const env = options.env ?? process.env;
  const now = options.now ?? (() => new Date().toISOString());
  const stateStoreFactory = options.stateStoreFactory ?? buildDynamoStateStore;
  let envValidated = false;

  return async function handler(event) {
    if (!envValidated) {
      ensureRequiredEnv(env);
      envValidated = true;
    }

    const claims = getJwtClaims(event);
    const authResult = validateJwtClaims(claims, env);
    if (!authResult.ok) {
      return createResponse(authResult.statusCode, { message: authResult.message });
    }

    const userId = authResult.subject;
    const method = getHttpMethod(event).toUpperCase();
    const rawPath = getRawPath(event);
    const stateStore = await stateStoreFactory(env);

    if (method === 'GET' && routeMatches(rawPath, '/account/state')) {
      const stateRecord = await getStateOrDefault(stateStore, userId);
      return createResponse(200, formatPublicState(stateRecord));
    }

    if (method === 'PUT' && routeMatches(rawPath, '/account/state')) {
      const { payload, malformed } = parseJsonBody(event?.body);
      if (malformed) {
        return createResponse(400, { message: 'Malformed JSON request body.' });
      }
      const normalizedState = normalizePersistedState(payload);
      const existingState = await stateStore.getByUserId(userId);
      const nextRecord = buildPutRecord(existingState, userId, normalizedState, now());
      await stateStore.put(nextRecord);
      return createResponse(200, formatPublicState(nextRecord));
    }

    if (method === 'POST' && routeMatches(rawPath, '/account/migrate-guest')) {
      const { payload, malformed } = parseJsonBody(event?.body);
      if (malformed) {
        return createResponse(400, { message: 'Malformed JSON request body.' });
      }
      const deviceId = getDeviceIdFromMigrationRequest(payload);
      if (!deviceId) {
        return createResponse(400, { message: 'deviceId is required.' });
      }

      const guestState = normalizePersistedState(payload.guestState);
      const existingRecord = await stateStore.getByUserId(userId);
      if (existingRecord) {
        return createResponse(200, {
          migrated: false,
          state: formatPublicState(existingRecord),
        });
      }

      const nextRecord = {
        userId,
        state: guestState,
        createdAt: now(),
        updatedAt: now(),
        migratedDeviceIds: normalizeMigratedDeviceIds([deviceId]),
      };
      await stateStore.put(nextRecord);

      return createResponse(200, {
        migrated: true,
        state: formatPublicState(nextRecord),
      });
    }

    return createResponse(404, { message: 'Route not found.' });
  };
}

export const handler = createHandler();
