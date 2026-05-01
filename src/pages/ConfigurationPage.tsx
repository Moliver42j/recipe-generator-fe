import { useState } from 'react';
import {
  TrashIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import { useConfig } from '../context/ConfigContext';

export default function ConfigurationPage() {
  const {
    pantryItems, setPantryItems,
    pantryItemStatus, setPantryItemStatus,
    spices, setSpices,
    dietaryRequirements, setDietaryRequirements,
  } = useConfig();

  const [pantryInput, setPantryInput] = useState('');
  const [spiceInput, setSpiceInput] = useState('');
  const [dietInput, setDietInput] = useState('');
  const [pantryOpen, setPantryOpen] = useState(true);
  const sectionBadgeClass = 'gradient-green-badge inline-flex h-14 w-14 items-center justify-center rounded-[20px] text-xl font-black text-white shadow-[0_16px_34px_rgba(22,163,74,0.22)]';
  const cardClass = 'glass-card rounded-[40px] border border-white/80 p-6 shadow-card-lg backdrop-blur-2xl dark:border-white/10 sm:p-10';
  const fieldClass = 'w-full rounded-2xl border border-input-border bg-input-bg px-5 py-4 text-lg text-text-primary placeholder:text-text-secondary transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-accent dark:bg-white/5';
  const chipClass = 'inline-flex items-center gap-2 rounded-full border border-white/80 px-4 py-2 text-sm font-semibold shadow-sm dark:border-white/10';

  const handleAddPantryItem = () => {
    if (pantryInput.trim() === '') return;
    const newItems = pantryInput.split(',').map((s) => s.trim()).filter((s) => s && !pantryItems.includes(s));
    if (newItems.length === 0) { setPantryInput(''); return; }

    setPantryItems((prev) => [...prev, ...newItems]);
    setPantryItemStatus((prev) => {
      const updated = { ...prev };
      newItems.forEach((item) => { updated[item] = true; });
      return updated;
    });
    setPantryInput('');
  };

  const handleCheckboxChange = (item: string) => {
    setPantryItemStatus((prev) => ({ ...prev, [item]: !prev[item] }));
  };

  const handleDeletePantryItem = (item: string) => {
    setPantryItems((prev) => prev.filter((p) => p !== item));
    setPantryItemStatus((prev) => {
      const updated = { ...prev };
      delete updated[item];
      return updated;
    });
  };

  const handleAddSpices = () => {
    if (spiceInput.trim() === '') return;
    const newItems = spiceInput.split(',').map((s) => s.trim()).filter((s) => s && !spices.includes(s));
    if (newItems.length > 0) setSpices((prev) => [...prev, ...newItems]);
    setSpiceInput('');
  };

  const handleRemoveSpice = (index: number) => {
    setSpices((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddDietary = () => {
    if (dietInput.trim() === '') return;
    const newItems = dietInput.split(',').map((s) => s.trim()).filter((s) => s && !dietaryRequirements.includes(s));
    if (newItems.length > 0) setDietaryRequirements((prev) => [...prev, ...newItems]);
    setDietInput('');
  };

  const handleRemoveDietary = (index: number) => {
    setDietaryRequirements((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="glass-card rounded-[40px] border border-white/80 px-6 py-8 shadow-card-lg backdrop-blur-2xl dark:border-white/10 sm:px-10 sm:py-12">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/70 px-4 py-2 text-xs font-black uppercase tracking-[0.28em] text-accent dark:border-white/10 dark:bg-white/5">
          Preferences
        </div>
        <h1 className="mt-6 text-5xl font-extrabold leading-[0.95] tracking-tighter sm:text-6xl">Configuration</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-text-secondary sm:text-lg">
          Manage your pantry staples, spices, and dietary preferences.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className={cardClass}>
          <div className="flex items-start gap-4">
            <div className={sectionBadgeClass}>01</div>
            <div className="w-full">
              <h2 className="mb-3 text-sm font-black uppercase tracking-[0.28em] text-text-secondary">Add Pantry Items</h2>
              <p className="text-base leading-7 text-text-secondary">Separate multiple pantry items with commas.</p>
            </div>
          </div>
          <div className="mt-8 flex flex-col gap-3 lg:flex-row">
            <input
              type="text"
              value={pantryInput}
              onChange={(e) => setPantryInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddPantryItem()}
              placeholder="e.g. rice, pasta, olive oil"
              className={fieldClass}
            />
            <button
              onClick={handleAddPantryItem}
              className="flex items-center justify-center gradient-green-cta rounded-2xl px-6 py-4 text-lg font-extrabold text-white shadow-[0_20px_45px_rgba(22,163,74,0.24)] transition hover:scale-[1.01] hover:opacity-95 active:scale-[0.98]"
              aria-label="Add pantry item"
            >
              <PlusIcon className="h-5 w-5" />
            </button>
          </div>
        </section>

        <section className={cardClass}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className={sectionBadgeClass}>02</div>
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-sm font-black uppercase tracking-[0.28em] text-text-secondary">
                    Pantry Items
                  </h2>
                  <span
                    className="inline-flex min-w-8 items-center justify-center rounded-full px-2 py-1 text-xs font-black"
                    style={{ background: 'var(--color-chip-olive-bg)', color: 'var(--color-chip-olive-text)' }}
                  >
                    {pantryItems.length}
                  </span>
                </div>
                <p className="mt-3 text-base leading-7 text-text-secondary">Toggle what you currently have available.</p>
              </div>
            </div>
            <button
              onClick={() => setPantryOpen(!pantryOpen)}
              className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/80 bg-white/60 text-text-secondary transition hover:bg-white/80 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
            >
              {pantryOpen ? (
                <ChevronUpIcon className="h-5 w-5 text-text-secondary" />
              ) : (
                <ChevronDownIcon className="h-5 w-5 text-text-secondary" />
              )}
            </button>
          </div>

          {pantryOpen ? (
            <div className="mt-8">
              {pantryItems.length > 0 ? (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {pantryItems.map((item) => (
                    <div
                      key={item}
                      className="flex items-center justify-between rounded-xl border border-white/70 bg-white/40 px-4 py-4 backdrop-blur-xl dark:border-white/10 dark:bg-white/5"
                    >
                      <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-3">
                        <input
                          type="checkbox"
                          checked={!!pantryItemStatus[item]}
                          onChange={() => handleCheckboxChange(item)}
                          className="h-4 w-4 flex-shrink-0 cursor-pointer rounded border-input-border"
                          style={{ accentColor: 'var(--color-accent)' }}
                        />
                        <span className={`truncate text-base font-semibold ${!pantryItemStatus[item] ? 'text-text-secondary line-through' : 'text-text-primary'}`}>
                          {item}
                        </span>
                      </label>
                      <button
                        onClick={() => handleDeletePantryItem(item)}
                        className="ml-3 rounded-xl p-2 text-text-secondary transition hover:bg-white/70 hover:text-danger dark:hover:bg-white/10"
                        aria-label={`Delete ${item}`}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-base text-text-secondary">No pantry items yet.</p>
              )}
            </div>
          ) : null}
        </section>
      </div>

      <section className={cardClass}>
        <div className="flex items-start gap-4">
          <div className={sectionBadgeClass}>03</div>
          <div className="w-full">
              <h2 className="mb-3 text-sm font-black uppercase tracking-[0.28em] text-text-secondary">Spices</h2>
              <p className="text-base leading-7 text-text-secondary">Leave this empty to let every spice be considered.</p>
          </div>
        </div>
        <div className="mt-8 flex flex-col gap-3 lg:flex-row">
          <input
            type="text"
            value={spiceInput}
            onChange={(e) => setSpiceInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddSpices()}
            placeholder="e.g. cumin, paprika, oregano"
            className={fieldClass}
          />
          <button
            onClick={handleAddSpices}
            className="flex items-center justify-center gradient-green-cta rounded-2xl px-6 py-4 text-lg font-extrabold text-white shadow-[0_20px_45px_rgba(22,163,74,0.24)] transition hover:scale-[1.01] hover:opacity-95 active:scale-[0.98]"
            aria-label="Add spice"
          >
            <PlusIcon className="h-5 w-5" />
          </button>
        </div>
        {spices.length > 0 ? (
          <div className="mt-6 flex flex-wrap gap-3">
            {spices.map((item, index) => (
              <span
                key={index}
                className={chipClass}
                style={{ background: 'var(--color-chip-amber-bg)', color: 'var(--color-chip-amber-text)' }}
              >
                {item}
                <button
                  onClick={() => handleRemoveSpice(index)}
                  className="rounded-full p-1 opacity-70 transition hover:bg-white/40 hover:opacity-100 dark:hover:bg-white/10"
                  aria-label={`Remove ${item}`}
                >
                  <TrashIcon className="h-3.5 w-3.5" />
                </button>
              </span>
            ))}
          </div>
        ) : (
          <p className="mt-6 text-base text-text-secondary">No spices added — all spices will be considered.</p>
        )}
      </section>

      <section className={cardClass}>
        <div className="flex items-start gap-4">
          <div className={sectionBadgeClass}>04</div>
          <div className="w-full">
              <h2 className="mb-3 text-sm font-black uppercase tracking-[0.28em] text-text-secondary">Dietary Requirements</h2>
              <p className="text-base leading-7 text-text-secondary">Add preferences like vegetarian or gluten-free.</p>
          </div>
        </div>
        <div className="mt-8 flex flex-col gap-3 lg:flex-row">
          <input
            type="text"
            value={dietInput}
            onChange={(e) => setDietInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddDietary()}
            placeholder="e.g. vegetarian, gluten-free"
            className={fieldClass}
          />
          <button
            onClick={handleAddDietary}
            className="flex items-center justify-center gradient-green-cta rounded-2xl px-6 py-4 text-lg font-extrabold text-white shadow-[0_20px_45px_rgba(22,163,74,0.24)] transition hover:scale-[1.01] hover:opacity-95 active:scale-[0.98]"
            aria-label="Add dietary requirement"
          >
            <PlusIcon className="h-5 w-5" />
          </button>
        </div>
        {dietaryRequirements.length > 0 ? (
          <div className="mt-6 flex flex-wrap gap-3">
            {dietaryRequirements.map((item, index) => (
              <span
                key={index}
                className={chipClass}
                style={{ background: 'var(--color-chip-accent-bg)', color: 'var(--color-chip-accent-text)' }}
              >
                {item}
                <button
                  onClick={() => handleRemoveDietary(index)}
                  className="rounded-full p-1 opacity-70 transition hover:bg-white/40 hover:opacity-100 dark:hover:bg-white/10"
                  aria-label={`Remove ${item}`}
                >
                  <TrashIcon className="h-3.5 w-3.5" />
                </button>
              </span>
            ))}
          </div>
        ) : (
          <p className="mt-6 text-base text-text-secondary">No dietary requirements set.</p>
        )}
      </section>
    </div>
  );
}
