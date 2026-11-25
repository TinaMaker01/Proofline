import { ThemeToggle, type ThemeMode } from './ThemeToggle';

interface FooterProps {
  theme: ThemeMode;
  onChangeTheme: (next: ThemeMode) => void;
}

export function Footer({ theme, onChangeTheme }: FooterProps) {
  return (
    <footer className="py-12 bg-[#F8FAFC] dark:bg-[#090D16] border-t border-slate-200 dark:border-slate-800/90 transition-colors duration-150">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <a
            href="#"
            className="font-display text-lg font-bold tracking-tight text-slate-900 dark:text-[#F8FAFC] whitespace-nowrap"
          >
            Proofline
          </a>
          <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
            Continuous testing and security verification for AI-generated apps. Screenshots are
            analyzed in memory and never stored.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-6 text-xs text-slate-600 dark:text-slate-400">
          <a
            href="#how-it-works"
            className="hover:text-slate-900 dark:hover:text-[#F8FAFC] transition-colors"
          >
            How it works
          </a>
          <a
            href="#live-audit"
            className="hover:text-slate-900 dark:hover:text-[#F8FAFC] transition-colors"
          >
            Live Audit
          </a>
          <a
            href="#proof"
            className="hover:text-slate-900 dark:hover:text-[#F8FAFC] transition-colors"
          >
            Proof
          </a>
          <a
            href="#waitlist"
            className="hover:text-slate-900 dark:hover:text-[#F8FAFC] transition-colors"
          >
            Early Access
          </a>
          <ThemeToggle theme={theme} onChangeTheme={onChangeTheme} />
          <span className="text-slate-400 dark:text-slate-500">© 2026 Proofline</span>
        </div>
      </div>
    </footer>
  );
}
