import type { Locale } from '../i18n/translations';

interface LanguageToggleProps {
  locale: Locale;
  onChangeLocale: (next: Locale) => void;
  groupLabel: string;
}

export function LanguageToggle({ locale, onChangeLocale, groupLabel }: LanguageToggleProps) {
  return (
    <div
      role="group"
      aria-label={groupLabel}
      className="inline-flex items-center gap-0.5 p-0.5 rounded-lg bg-slate-200/80 dark:bg-[#111827] border border-slate-300/70 dark:border-slate-800 shrink-0"
    >
      <button
        type="button"
        onClick={() => onChangeLocale('fr')}
        aria-pressed={locale === 'fr'}
        className={`px-2.5 py-1.5 min-h-[32px] text-xs font-medium rounded-md transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E40AF] dark:focus-visible:outline-[#60A5FA] ${
          locale === 'fr'
            ? 'bg-white dark:bg-[#1E293B] text-slate-900 dark:text-[#F8FAFC] shadow-2xs dark:shadow-none'
            : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
        }`}
      >
        FR
      </button>
      <button
        type="button"
        onClick={() => onChangeLocale('en')}
        aria-pressed={locale === 'en'}
        className={`px-2.5 py-1.5 min-h-[32px] text-xs font-medium rounded-md transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E40AF] dark:focus-visible:outline-[#60A5FA] ${
          locale === 'en'
            ? 'bg-white dark:bg-[#1E293B] text-slate-900 dark:text-[#F8FAFC] shadow-2xs dark:shadow-none'
            : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
        }`}
      >
        EN
      </button>
    </div>
  );
}
