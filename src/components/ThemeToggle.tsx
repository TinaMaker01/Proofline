import { Moon, Sun } from 'lucide-react';

export type ThemeMode = 'dark' | 'light';

interface ThemeToggleProps {
  theme: ThemeMode;
  onChangeTheme: (next: ThemeMode) => void;
  groupLabel?: string;
  darkLabel?: string;
  lightLabel?: string;
}

export function ThemeToggle({
  theme,
  onChangeTheme,
  groupLabel = 'Thème visuel',
  darkLabel = 'Sombre',
  lightLabel = 'Clair',
}: ThemeToggleProps) {
  return (
    <div
      role="group"
      aria-label={groupLabel}
      className="inline-flex items-center gap-0.5 p-0.5 rounded-lg bg-slate-200/80 dark:bg-[#111827] border border-slate-300/70 dark:border-slate-800 shrink-0"
    >
      <button
        type="button"
        onClick={() => onChangeTheme('dark')}
        aria-pressed={theme === 'dark'}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[44px] lg:min-h-[32px] text-xs font-medium rounded-md transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E40AF] dark:focus-visible:outline-[#60A5FA] ${
          theme === 'dark'
            ? 'bg-[#1E293B] text-[#F8FAFC]'
            : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
        }`}
      >
        <Moon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        <span>{darkLabel}</span>
      </button>

      <button
        type="button"
        onClick={() => onChangeTheme('light')}
        aria-pressed={theme === 'light'}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[44px] lg:min-h-[32px] text-xs font-medium rounded-md transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E40AF] dark:focus-visible:outline-[#60A5FA] ${
          theme === 'light'
            ? 'bg-white text-slate-900 shadow-2xs'
            : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
        }`}
      >
        <Sun className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        <span>{lightLabel}</span>
      </button>
    </div>
  );
}
