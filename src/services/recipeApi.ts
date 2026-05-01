import type { Recipe } from '../types';

const API_URL = 'https://n9f4glumj7.execute-api.eu-west-1.amazonaws.com/default/recipeApi';
const REQUEST_TIMEOUT_MS = 30000;
const RETRY_DELAY_MS = 1000;
const MAX_RETRIES = 1;

export interface GenerateRecipePayload {
  ingredients: string[];
  pantryItems: string[];
  spices: string[] | string;
  dietaryRestrictions: string[];
}

export class ApiTimeoutError extends Error {
  constructor() {
    super('Request timed out. Please try again.');
    this.name = 'ApiTimeoutError';
  }
}

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchRecipe(payload: GenerateRecipePayload): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    return await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ApiTimeoutError();
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function generateRecipe(payload: GenerateRecipePayload): Promise<Recipe> {
  let response: Response | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
    try {
      response = await fetchRecipe(payload);
      break;
    } catch (error) {
      const shouldRetry = attempt < MAX_RETRIES && (error instanceof TypeError || error instanceof ApiTimeoutError);
      if (!shouldRetry) {
        throw error;
      }
      await delay(RETRY_DELAY_MS);
    }
  }

  if (!response) {
    throw new ApiError(500, 'Failed to fetch recipe');
  }

  if (!response.ok) {
    const errorMessage = await response.text();
    throw new ApiError(response.status, `Error ${response.status}: ${errorMessage}`);
  }

  let result: { body?: string };
  try {
    result = await response.json();
  } catch {
    throw new ApiError(response.status, 'Received invalid response from server');
  }

  let recipeData: Recipe;
  try {
    if (typeof result.body !== 'string') {
      throw new Error('Missing body');
    }
    recipeData = JSON.parse(result.body);
  } catch {
    throw new ApiError(200, 'Received invalid response from server');
  }

  return recipeData;
}
