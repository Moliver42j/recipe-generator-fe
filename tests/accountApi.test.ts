import test from 'node:test';
import assert from 'node:assert/strict';
import { buildPersistedAccountState, resolveAccountApiBaseUrl } from '../src/services/accountApi.ts';

test('resolveAccountApiBaseUrl removes recipe route suffix and trailing slashes', () => {
  assert.equal(
    resolveAccountApiBaseUrl('https://example.com/default/recipeApi/'),
    'https://example.com/default',
  );
  assert.equal(
    resolveAccountApiBaseUrl('https://example.com/default/recipeApi'),
    'https://example.com/default',
  );
});

test('buildPersistedAccountState returns account payload structure unchanged', () => {
  const payload = buildPersistedAccountState({
    ingredients: ['tomato'],
    pantryItems: ['salt'],
    pantryItemStatus: { salt: true },
    spices: ['pepper'],
    dietaryRequirements: ['vegan'],
    favourites: [{ recipe: 'Soup', ingredients: ['tomato'], instructions: 'Boil' }],
    theme: 'dark',
  });

  assert.deepEqual(payload, {
    ingredients: ['tomato'],
    pantryItems: ['salt'],
    pantryItemStatus: { salt: true },
    spices: ['pepper'],
    dietaryRequirements: ['vegan'],
    favourites: [{ recipe: 'Soup', ingredients: ['tomato'], instructions: 'Boil' }],
    theme: 'dark',
  });
});
