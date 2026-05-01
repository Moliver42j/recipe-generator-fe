import {
  ClipboardDocumentIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import { useState } from 'react';
import { useConfig } from '../context/ConfigContext';
import { useHome } from '../context/HomeContext';

export default function ExportPage() {
  const { pantryItems, spices, dietaryRequirements } = useConfig();
  const { ingredients } = useHome();
  const [copied, setCopied] = useState(false);

  const buildExportText = () => {
    const sections = [
      `Pantry Items: ${pantryItems.length > 0 ? pantryItems.join(', ') : 'None'}`,
      `Fresh Ingredients: ${ingredients.length > 0 ? ingredients.join(', ') : 'None'}`,
      `Spices: ${spices.length > 0 ? spices.join(', ') : 'None'}`,
      `Dietary Requirements: ${dietaryRequirements.length > 0 ? dietaryRequirements.join(', ') : 'None'}`,
    ];
    return sections.join('\n');
  };

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(buildExportText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert(buildExportText());
    }
  };

  const dataGroups = [
    {
      label: 'Pantry Items',
      items: pantryItems,
      chipBg: 'var(--color-chip-olive-bg)',
      chipText: 'var(--color-chip-olive-text)',
      icon: '🍽️',
    },
    {
      label: 'Fresh Ingredients',
      items: ingredients,
      chipBg: 'var(--color-chip-sky-bg)',
      chipText: 'var(--color-chip-sky-text)',
      icon: '🥬',
    },
    {
      label: 'Spices',
      items: spices,
      chipBg: 'var(--color-chip-amber-bg)',
      chipText: 'var(--color-chip-amber-text)',
      icon: '🌶️',
    },
    {
      label: 'Dietary Requirements',
      items: dietaryRequirements,
      chipBg: 'var(--color-chip-warm-bg)',
      chipText: 'var(--color-chip-warm-text)',
      icon: '🥗',
    },
  ];
  const groupCardClass = 'glass-card rounded-[32px] border border-white/80 p-6 shadow-card backdrop-blur-2xl dark:border-white/10 sm:p-8';

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="glass-card rounded-[40px] border border-white/80 px-6 py-8 shadow-card-lg backdrop-blur-2xl dark:border-white/10 sm:px-10 sm:py-12">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/70 px-4 py-2 text-xs font-black uppercase tracking-[0.28em] text-accent dark:border-white/10 dark:bg-white/5">
          Copy and share
        </div>
        <h1 className="mt-6 text-5xl font-extrabold leading-[0.95] tracking-tighter sm:text-6xl">Export Data</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-text-secondary sm:text-lg">
          View and copy all your saved ingredients and preferences.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {dataGroups.map((group) => (
          <div key={`${group.label}-stat`} className="glass-card rounded-3xl border border-white/80 p-5 shadow-card backdrop-blur-2xl dark:border-white/10">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-text-secondary">{group.label}</p>
            <p className="mt-3 text-4xl font-black" style={{ color: group.chipText }}>{group.items.length}</p>
          </div>
        ))}
      </div>

      <button
        onClick={handleCopyToClipboard}
        className="gradient-green-cta flex items-center gap-3 rounded-2xl px-8 py-5 text-lg font-extrabold text-white shadow-[0_24px_60px_rgba(22,163,74,0.28)] transition duration-200 hover:scale-[1.02] hover:opacity-95 active:scale-[0.98]"
      >
        {copied ? (
          <>
            <CheckIcon className="h-5 w-5" />
            Copied to clipboard!
          </>
        ) : (
          <>
            <ClipboardDocumentIcon className="h-5 w-5" />
            Copy to Clipboard
          </>
        )}
      </button>

      <div className="grid gap-4 md:grid-cols-2">
        {dataGroups.map((group) => (
          <div key={group.label} className={groupCardClass}>
            <div className="mb-5 flex items-center gap-3">
              <span
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl text-lg"
                style={{ background: group.chipBg }}
                aria-hidden="true"
              >
                {group.icon}
              </span>
              <h2 className="text-sm font-black uppercase tracking-[0.24em] text-text-secondary">{group.label}</h2>
              <span
                className="ml-auto inline-flex min-w-8 items-center justify-center rounded-full px-3 py-1 text-xs font-black"
                style={{ background: group.chipBg, color: group.chipText }}
              >
                {group.items.length}
              </span>
            </div>
            {group.items.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {group.items.map((item, i) => (
                  <span
                    key={i}
                    className="inline-flex rounded-full border border-white/70 px-4 py-2 text-sm font-semibold shadow-sm dark:border-white/10"
                    style={{ background: group.chipBg, color: group.chipText }}
                  >
                    {item}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-base text-text-secondary">None added yet.</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
