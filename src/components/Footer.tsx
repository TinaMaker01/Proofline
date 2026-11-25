import { ThemeToggle, type ThemeMode } from './ThemeToggle';
import { LanguageToggle } from './LanguageToggle';
import type { Locale, SiteTranslations } from '../i18n/translations';

interface FooterProps {
  theme: ThemeMode;
  onChangeTheme: (next: ThemeMode) => void;
  locale: Locale;
  onChangeLocale: (next: Locale) => void;
  t: SiteTranslations;
}

export function Footer({ theme, onChangeTheme, locale, onChangeLocale, t }: FooterProps) {
  return (
    <footer className="py-12 bg-[#F8FAFC] dark:bg-[#090D16] border-t border-slate-200 dark:border-slate-800/90 transition-colors duration-150">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <a
            href="#"
            className="font-display text-lg font-bold tracking-tight text-slate-900 dark:text-[#F8FAFC] whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1E40AF] dark:focus-visible:outline-[#60A5FA] rounded-sm"
          >
            Proofline
          </a>
          <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400">{t.footer.tagline}</p>
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-3 text-xs text-slate-600 dark:text-slate-300">
          <a
            href="#how-it-works"
            className="hover:text-slate-900 dark:hover:text-[#F8FAFC] transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1E40AF] dark:focus-visible:outline-[#60A5FA] rounded-sm"
          >
            {t.nav.howItWorks}
          </a>
          <a
            href="#live-audit"
            className="hover:text-slate-900 dark:hover:text-[#F8FAFC] transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1E40AF] dark:focus-visible:outline-[#60A5FA] rounded-sm"
          >
            {t.nav.liveAudit}
          </a>
          <a
            href="#proof"
            className="hover:text-slate-900 dark:hover:text-[#F8FAFC] transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1E40AF] dark:focus-visible:outline-[#60A5FA] rounded-sm"
          >
            {t.nav.proof}
          </a>
          <a
            href="#faq"
            className="hover:text-slate-900 dark:hover:text-[#F8FAFC] transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1E40AF] dark:focus-visible:outline-[#60A5FA] rounded-sm"
          >
            {t.nav.faq}
          </a>
          <a
            href="#waitlist"
            className="hover:text-slate-900 dark:hover:text-[#F8FAFC] transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1E40AF] dark:focus-visible:outline-[#60A5FA] rounded-sm"
          >
            {t.footer.earlyAccess}
          </a>
          <LanguageToggle
            locale={locale}
            onChangeLocale={onChangeLocale}
            groupLabel={t.languageToggle.groupLabel}
          />
          <ThemeToggle
            theme={theme}
            onChangeTheme={onChangeTheme}
            groupLabel={t.theme.groupLabel}
            darkLabel={t.theme.dark}
            lightLabel={t.theme.light}
          />
          <span className="text-slate-600 dark:text-slate-400">{t.footer.copyright}</span>
        </div>
      </div>
    </footer>
  );
}
