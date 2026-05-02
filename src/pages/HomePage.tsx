import { useState, useEffect } from 'react';
import {
  TrashIcon,
  HeartIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { AnimatePresence, motion } from 'framer-motion';
import { useHome } from '../context/HomeContext';
import { useConfig } from '../context/ConfigContext';
import { useFavourites } from '../context/FavouritesContext';
import { ApiTimeoutError, generateRecipe } from '../services/recipeApi';
import type { Recipe } from '../types';

export default function HomePage() {
  const { ingredients, setIngredients } = useHome();
  const { pantryItems, pantryItemStatus, setPantryItemStatus, spices, dietaryRequirements } = useConfig();
  const { setFavourites } = useFavourites();

  type Difficulty = 'easy' | 'medium' | 'complex';
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pantryOpen, setPantryOpen] = useState(true);
  const [addedToFav, setAddedToFav] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');

  const handleAddIngredient = () => {
    if (input.trim() === '') return;
    const newItems = input.split(',').map((s) => s.trim()).filter(Boolean);
    setIngredients((prev) => [...prev, ...newItems]);
    setInput('');
  };

  const handleRemoveIngredient = (index: number) => {
    setIngredients((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemovePantryItem = (item: string) => {
    setPantryItemStatus((prev) => ({ ...prev, [item]: false }));
  };

  const handleGenerateRecipe = async () => {
    if (ingredients.length === 0) {
      setError('Add at least one fresh ingredient before generating a recipe.');
      return;
    }

    setLoading(true);
    setRecipe(null);
    setError(null);
    setAddedToFav(false);

    const tickedPantryItems = pantryItems.filter((item) => pantryItemStatus[item]);

    try {
      const recipeData = await generateRecipe({
        ingredients: [...ingredients],
        pantryItems: tickedPantryItems,
        spices: spices.length === 0 ? 'all' : spices,
        dietaryRestrictions: dietaryRequirements,
        difficulty: difficulty.toLowerCase() as Difficulty,
      });

      if (recipeData.error) {
        setError(recipeData.error);
        return;
      }
      setRecipe(recipeData);
    } catch (error) {
      if (error instanceof ApiTimeoutError) {
        setError('The request timed out — the server might be warming up. Please try again.');
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddToFavourites = () => {
    if (!recipe) return;
    setFavourites((prev) => [...prev, recipe]);
    setAddedToFav(true);
  };

  const loadingMessages = [
    'Finding the perfect recipe…',
    'Checking your ingredients…',
    'Consulting the chef…',
    'Almost there…',
    'Stirring the pot…',
    'Adding a pinch of magic…',
  ];
  const [loadingMsgIndex, setLoadingMsgIndex] = useState(0);

  useEffect(() => {
    if (!loading) { setLoadingMsgIndex(0); return; }
    const interval = setInterval(() => {
      setLoadingMsgIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [loading]);

  const activePantry = pantryItems.filter((item) => pantryItemStatus[item]);
  const difficultyOptions: { value: Difficulty; label: string }[] = [
    { value: 'easy', label: 'Easy' },
    { value: 'medium', label: 'Medium' },
    { value: 'complex', label: 'Complex' },
  ];
  const nutrition = recipe?.caloriesPerServing;
  const hasNutrition = Boolean(
    nutrition?.calories?.trim() &&
    nutrition?.protein?.trim() &&
    nutrition?.carbs?.trim(),
  );
  const sectionBadgeClass = 'gradient-green-badge inline-flex h-14 w-14 items-center justify-center rounded-[20px] text-xl font-black text-white shadow-[0_16px_34px_rgba(22,163,74,0.22)]';
  const fieldClass = 'w-full rounded-2xl border border-input-border bg-input-bg px-5 py-4 text-lg text-text-primary placeholder:text-text-secondary transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-accent dark:bg-white/5';

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="glass-card rounded-[40px] border border-white/80 px-6 py-8 shadow-card-lg backdrop-blur-2xl dark:border-white/10 sm:px-10 sm:py-12">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/70 px-4 py-2 text-xs font-black uppercase tracking-[0.28em] text-accent dark:border-white/10 dark:bg-white/5">
          <span className="gradient-green-badge h-2.5 w-2.5 rounded-full" aria-hidden="true" />
          Pantry to plate
        </div>
        <h1 className="mt-6 max-w-4xl text-5xl font-extrabold leading-[0.95] tracking-tighter sm:text-6xl lg:text-[72px]">
          Cook with what&apos;s already in your <span className="gradient-text-green">kitchen.</span>
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-text-secondary sm:text-lg">
          Add your fresh ingredients and we&apos;ll create a recipe just for you.
        </p>
      </div>

      <section className="glass-card rounded-[40px] border border-white/80 p-6 shadow-card-lg backdrop-blur-2xl dark:border-white/10 sm:p-10">
        <div className="flex items-start gap-4">
          <div className={sectionBadgeClass}>01</div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
              Fresh Ingredients
            </h2>
            <p className="mt-3 max-w-2xl text-base leading-7 text-text-secondary sm:text-lg">
              Add one or many ingredients and build your recipe foundation.
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 lg:flex-row">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddIngredient()}
            placeholder="e.g. chicken, tomatoes, garlic"
            className={fieldClass}
          />
          <button
            onClick={handleAddIngredient}
            className="rounded-2xl bg-slate-900 px-8 py-4 text-lg font-bold text-white shadow-xl transition hover:bg-slate-800 active:scale-[0.98] dark:bg-white/10 dark:hover:bg-white/20"
          >
            Add
          </button>
        </div>

        {ingredients.length > 0 ? (
          <div className="mt-6 flex flex-wrap gap-3">
            <AnimatePresence>
              {ingredients.map((ingredient, index) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 10, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.92 }}
                  transition={{ duration: 0.18 }}
                  key={index}
                  className="inline-flex"
                >
                  <span
                    className="inline-flex items-center gap-2 rounded-full border border-white/80 px-4 py-2 text-sm font-semibold shadow-sm dark:border-white/10"
                    style={{
                      background: 'var(--color-chip-sky-bg)',
                      color: 'var(--color-chip-sky-text)',
                    }}
                  >
                    {ingredient}
                    <button
                      onClick={() => handleRemoveIngredient(index)}
                      className="rounded-full p-1 transition-colors hover:bg-danger hover:text-white"
                      aria-label={`Remove ${ingredient}`}
                    >
                      <TrashIcon className="h-3.5 w-3.5" />
                    </button>
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <p className="mt-6 text-base text-text-secondary">No fresh ingredients added yet.</p>
        )}
      </section>

      <section className="glass-card rounded-[40px] border border-white/80 p-6 shadow-card-lg backdrop-blur-2xl dark:border-white/10 sm:p-10">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className={sectionBadgeClass}>02</div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">Pantry Staples</h2>
              <p className="mt-3 max-w-2xl text-base leading-7 text-text-secondary sm:text-lg">
                Use your saved pantry items to fill in the gaps around fresh ingredients.
              </p>
            </div>
          </div>
          <button
            onClick={() => setPantryOpen(!pantryOpen)}
            className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/80 bg-white/60 text-text-secondary transition hover:bg-white/80 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
            aria-label={pantryOpen ? 'Collapse pantry staples' : 'Expand pantry staples'}
          >
            {pantryOpen ? (
              <ChevronUpIcon className="h-5 w-5" />
            ) : (
              <ChevronDownIcon className="h-5 w-5" />
            )}
          </button>
        </div>

        <AnimatePresence initial={false}>
          {pantryOpen ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-8">
                {activePantry.length > 0 ? (
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {activePantry.map((item) => (
                      <div
                        key={item}
                        className="flex items-center justify-between rounded-[24px] border border-white/80 bg-white/45 px-4 py-4 text-sm shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/5"
                      >
                        <span className="font-semibold text-text-primary">{item}</span>
                        <button
                          onClick={() => handleRemovePantryItem(item)}
                          className="rounded-xl p-2 text-text-secondary transition hover:bg-white/70 hover:text-danger dark:hover:bg-white/10"
                          aria-label={`Remove ${item} from pantry`}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-base text-text-secondary">
                    No pantry staples active. Add some in{' '}
                    <a href="/configuration" className="font-semibold text-accent underline underline-offset-4">Configuration</a>.
                  </p>
                )}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </section>

      <fieldset className="glass-card rounded-[32px] border border-white/80 p-5 shadow-card dark:border-white/10 sm:p-6">
        <legend className="text-sm font-black uppercase tracking-[0.2em] text-text-secondary">
          Difficulty
        </legend>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {difficultyOptions.map((option) => (
            <label key={option.value} className="cursor-pointer">
              <input
                type="radio"
                name="difficulty"
                value={option.value}
                checked={difficulty === option.value}
                onChange={() => setDifficulty(option.value)}
                className="peer sr-only"
              />
              <span className="block rounded-2xl border border-white/80 bg-white/50 px-4 py-3 text-center text-sm font-bold uppercase tracking-[0.14em] text-text-secondary transition-all peer-focus-visible:ring-2 peer-focus-visible:ring-accent peer-checked:border-transparent peer-checked:bg-accent peer-checked:text-white dark:border-white/10 dark:bg-white/5">
                {option.label}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <button
        onClick={handleGenerateRecipe}
        disabled={loading}
        className="gradient-green-cta flex w-full items-center justify-center gap-3 rounded-[2rem] px-10 py-5 text-xl font-extrabold text-white shadow-[0_24px_60px_rgba(22,163,74,0.32)] transition duration-200 hover:scale-[1.01] hover:opacity-95 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100 sm:text-2xl"
      >
        {loading ? (
          <>
            <svg className="h-6 w-6 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l4-4-4-4v4a8 8 0 100 16 8 8 0 01-8-8z" />
            </svg>
            {loadingMessages[loadingMsgIndex]}
          </>
        ) : (
          <>
            <SparklesIcon className="h-6 w-6" />
            Generate Recipe
          </>
        )}
      </button>

      {error ? (
        <div
          className="glass-card rounded-[28px] border border-white/80 px-6 py-5 text-base font-semibold dark:border-white/10"
          style={{
            background: 'var(--color-chip-warm-bg)',
            color: 'var(--color-chip-warm-text)',
          }}
        >
          {error}
        </div>
      ) : null}

      {loading ? (
        <div
          className="glass-card overflow-hidden rounded-[40px] border border-white/80 shadow-card-lg dark:border-white/10"
          aria-hidden="true"
        >
          <div className="border-b border-white/70 bg-white/45 px-6 py-6 dark:border-white/10 dark:bg-white/5">
            <div className="h-8 w-3/4 rounded-full bg-bg-tertiary" />
          </div>
          <div className="space-y-6 px-6 py-6 sm:px-8 sm:py-8">
            <div>
              <div className="mb-4 h-3 w-24 rounded-full bg-bg-tertiary" />
              <div className="space-y-3">
                <div className="h-5 w-full rounded-full bg-bg-tertiary" />
                <div className="h-5 w-5/6 rounded-full bg-bg-tertiary" />
                <div className="h-5 w-3/4 rounded-full bg-bg-tertiary" />
              </div>
            </div>
            <div>
              <div className="mb-4 h-3 w-28 rounded-full bg-bg-tertiary" />
              <div className="space-y-3">
                <div className="h-5 w-full rounded-full bg-bg-tertiary" />
                <div className="h-5 w-full rounded-full bg-bg-tertiary" />
                <div className="h-5 w-2/3 rounded-full bg-bg-tertiary" />
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <AnimatePresence>
        {recipe ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 10 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="glass-card overflow-hidden rounded-[40px] border border-white/80 shadow-card-lg dark:border-white/10"
          >
            <div className="flex items-start justify-between gap-4 border-b border-white/70 bg-white/45 px-6 py-6 dark:border-white/10 dark:bg-white/5 sm:px-8">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.28em] text-text-secondary">Your recipe</p>
                <h2 className="mt-3 text-2xl font-black leading-snug sm:text-3xl">{recipe.recipe}</h2>
              </div>
              <button
                onClick={handleAddToFavourites}
                disabled={addedToFav}
                className={`flex-shrink-0 rounded-2xl p-3 transition-all duration-150 ${
                  addedToFav
                    ? 'scale-110 text-danger'
                    : 'text-text-secondary hover:scale-110 hover:text-danger'
                }`}
                style={addedToFav ? { background: 'rgba(239, 68, 68, 0.1)' } : undefined}
                title={addedToFav ? 'Added to favourites' : 'Add to favourites'}
                aria-label={addedToFav ? 'Added to favourites' : 'Add to favourites'}
              >
                {addedToFav ? (
                  <HeartSolidIcon className="h-7 w-7" />
                ) : (
                  <HeartIcon className="h-7 w-7" />
                )}
              </button>
            </div>

            <div className="space-y-8 px-6 py-6 sm:px-8 sm:py-8">
              {hasNutrition ? (
                <div className="rounded-[28px] border border-white/80 bg-white/45 p-5 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/5 sm:p-6">
                  <h3 className="mb-4 text-xs font-black uppercase tracking-[0.28em] text-text-secondary">
                    Nutrition per serving
                  </h3>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border border-white/80 bg-white/55 px-4 py-3 dark:border-white/10 dark:bg-white/5">
                      <p className="text-[11px] font-black uppercase tracking-[0.2em] text-text-secondary">Calories</p>
                      <p className="mt-2 text-lg font-black text-text-primary">{nutrition?.calories}</p>
                    </div>
                    <div className="rounded-2xl border border-white/80 bg-white/55 px-4 py-3 dark:border-white/10 dark:bg-white/5">
                      <p className="text-[11px] font-black uppercase tracking-[0.2em] text-text-secondary">Protein</p>
                      <p className="mt-2 text-lg font-black text-text-primary">{nutrition?.protein}</p>
                    </div>
                    <div className="rounded-2xl border border-white/80 bg-white/55 px-4 py-3 dark:border-white/10 dark:bg-white/5">
                      <p className="text-[11px] font-black uppercase tracking-[0.2em] text-text-secondary">Carbs</p>
                      <p className="mt-2 text-lg font-black text-text-primary">{nutrition?.carbs}</p>
                    </div>
                  </div>
                </div>
              ) : null}

              {recipe.ingredients ? (
                <div>
                  <h3 className="mb-4 text-xs font-black uppercase tracking-[0.28em] text-text-secondary">
                    Ingredients
                  </h3>
                  <ul className="space-y-3">
                    {recipe.ingredients.map((ing, i) => (
                      <li key={i} className="flex items-start gap-3 text-base leading-7 text-text-primary">
                        <span className="mt-3 h-2 w-2 flex-shrink-0 rounded-full bg-accent" />
                        {ing}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {recipe.instructions ? (
                <div>
                  <h3 className="mb-4 text-xs font-black uppercase tracking-[0.28em] text-text-secondary">
                    Instructions
                  </h3>
                  <p className="whitespace-pre-line text-base leading-8 text-text-primary">
                    {Array.isArray(recipe.instructions)
                      ? recipe.instructions.join('\n')
                      : recipe.instructions}
                  </p>
                </div>
              ) : null}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
