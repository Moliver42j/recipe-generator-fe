import { useState } from 'react';
import {
  TrashIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useFavourites } from '../context/FavouritesContext';
import type { Recipe } from '../types';

export default function FavouritesPage() {
  const { favourites, setFavourites } = useFavourites();
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const saveFavourites = (updated: Recipe[]) => {
    setFavourites(updated);
  };

  const handleDelete = (index: number) => {
    saveFavourites(favourites.filter((_, i) => i !== index));
    setConfirmDelete(null);
  };

  const handleEdit = (recipe: Recipe, index: number) => {
    setEditingRecipe({ ...recipe });
    setEditIndex(index);
  };

  const handleSaveEdit = () => {
    if (editingRecipe !== null && editIndex !== null) {
      const updated = [...favourites];
      updated[editIndex] = editingRecipe;
      saveFavourites(updated);
      setEditingRecipe(null);
      setEditIndex(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingRecipe(null);
    setEditIndex(null);
  };

  const fieldClass = 'w-full rounded-2xl border border-input-border bg-input-bg px-5 py-4 text-base text-text-primary transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-accent dark:bg-white/5';

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="glass-card rounded-[40px] border border-white/80 px-6 py-8 shadow-card-lg backdrop-blur-2xl dark:border-white/10 sm:px-10 sm:py-12">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/70 px-4 py-2 text-xs font-black uppercase tracking-[0.28em] text-accent dark:border-white/10 dark:bg-white/5">
          Saved recipes
        </div>
        <h1 className="mt-6 text-5xl font-extrabold leading-[0.95] tracking-tighter sm:text-6xl">Favourites</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-text-secondary sm:text-lg">
          Your saved recipes — edit or remove them anytime.
        </p>
      </div>

      {favourites.length === 0 ? (
        <div className="glass-card rounded-[40px] border border-white/80 px-8 py-16 text-center shadow-card-lg backdrop-blur-2xl dark:border-white/10">
          <div
            className="gradient-green-cta mb-5 inline-flex h-20 w-20 items-center justify-center rounded-[28px] text-3xl text-white shadow-[0_20px_45px_rgba(22,163,74,0.24)]"
            aria-hidden="true"
          >
            ♡
          </div>
          <p className="text-2xl font-black text-text-primary">No favourites yet.</p>
          <p className="mt-2 text-base text-text-secondary">
            Generate a recipe and hit the heart to save it here.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {favourites.map((recipe, index) => (
            <div
              key={index}
              className="glass-card overflow-hidden rounded-[32px] border border-white/80 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-card-lg dark:border-white/10"
              style={{
                borderLeft: editIndex === index ? '4px solid var(--color-accent-secondary)' : '4px solid var(--color-accent)',
              }}
            >
              {editIndex === index && editingRecipe ? (
                <div className="space-y-6 bg-white/35 p-6 dark:bg-white/5 sm:p-8">
                  <div className="flex items-center gap-2 pb-1">
                    <span
                      className="inline-flex items-center rounded-full px-3 py-1 text-xs font-black uppercase tracking-[0.24em]"
                      style={{ background: 'var(--color-chip-olive-bg)', color: 'var(--color-chip-olive-text)' }}
                    >
                      Editing
                    </span>
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-black uppercase tracking-[0.28em] text-text-secondary">
                      Recipe Name
                    </label>
                    <input
                      type="text"
                      value={editingRecipe.recipe}
                      onChange={(e) => setEditingRecipe({ ...editingRecipe, recipe: e.target.value })}
                      className={fieldClass}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-black uppercase tracking-[0.28em] text-text-secondary">
                      Ingredients (comma-separated)
                    </label>
                    <textarea
                      value={editingRecipe.ingredients.join(', ')}
                      onChange={(e) =>
                        setEditingRecipe({ ...editingRecipe, ingredients: e.target.value.split(',').map((s) => s.trim()) })
                      }
                      rows={3}
                      className={`${fieldClass} resize-none`}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-black uppercase tracking-[0.28em] text-text-secondary">
                      Instructions
                    </label>
                    <textarea
                      value={editingRecipe.instructions}
                      onChange={(e) => setEditingRecipe({ ...editingRecipe, instructions: e.target.value })}
                      rows={5}
                      className={`${fieldClass} resize-none`}
                    />
                  </div>
                  <div className="flex flex-wrap gap-3 pt-1">
                    <button
                      onClick={handleSaveEdit}
                      className="flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-extrabold text-white transition hover:scale-[1.01] hover:opacity-95 active:scale-[0.98]"
                      style={{ background: 'var(--color-success)' }}
                    >
                      <CheckIcon className="h-4 w-4" /> Save changes
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="flex items-center gap-2 rounded-2xl border border-white/80 bg-white/70 px-6 py-3 text-sm font-bold text-text-secondary transition hover:bg-white dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
                    >
                      <XMarkIcon className="h-4 w-4" /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-6 sm:p-8">
                  <div className="mb-5 flex items-start justify-between gap-4">
                    <h3 className="text-2xl font-black leading-snug">{recipe.recipe}</h3>
                    <div className="flex flex-shrink-0 gap-2">
                      <button
                        onClick={() => handleEdit(recipe, index)}
                        className="rounded-2xl border border-white/80 bg-white/60 p-3 text-text-secondary transition hover:bg-white hover:text-accent dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
                        title="Edit"
                        aria-label="Edit recipe"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      {confirmDelete === index ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDelete(index)}
                            className="rounded-2xl px-4 py-3 text-xs font-black uppercase tracking-[0.2em] text-white transition hover:opacity-95"
                            style={{ background: 'var(--color-danger)' }}
                          >
                            Confirm delete
                          </button>
                          <button
                            onClick={() => setConfirmDelete(null)}
                            className="rounded-2xl border border-white/80 bg-white/70 px-4 py-3 text-xs font-black uppercase tracking-[0.2em] text-text-secondary transition hover:bg-white dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDelete(index)}
                          className="rounded-2xl border border-white/80 bg-white/60 p-3 text-text-secondary transition hover:bg-white hover:text-danger dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
                          title="Delete"
                          aria-label="Delete recipe"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {recipe.ingredients ? (
                    <div className="mb-6">
                      <h4 className="mb-3 text-xs font-black uppercase tracking-[0.28em] text-text-secondary">
                        Ingredients
                      </h4>
                      <ul className="space-y-2">
                        {recipe.ingredients.map((ing, i) => (
                          <li key={i} className="flex items-start gap-3 text-base leading-7">
                            <span className="mt-3 h-2 w-2 flex-shrink-0 rounded-full bg-accent" />
                            {ing}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  {recipe.instructions ? (
                    <div>
                      <h4 className="mb-3 text-xs font-black uppercase tracking-[0.28em] text-text-secondary">
                        Instructions
                      </h4>
                      <p className="whitespace-pre-line text-base leading-8">
                        {recipe.instructions}
                      </p>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
