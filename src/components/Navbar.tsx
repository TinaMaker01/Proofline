import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { ThemeToggle, type ThemeMode } from './ThemeToggle';
import { LanguageToggle } from './LanguageToggle';
import type { Locale, SiteTranslations } from '../i18n/translations';

interface NavbarProps {
  theme: ThemeMode;
  onChangeTheme: (next: ThemeMode) => void;
  locale: Locale;
  onChangeLocale: (next: Locale) => void;
  t: SiteTranslations;
  onJoinWaitlist: () => void;
}

export function Navbar({
  theme,
  onChangeTheme,
  locale,
  onChangeLocale,
  t,
  onJoinWaitlist,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '#how-it-works', label: t.nav.howItWorks },
    { href: '#live-audit', label: t.nav.liveAudit },
    { href: '#proof', label: t.nav.proof },
    { href: '#faq', label: t.nav.faq },
  ];

  useEffect(() => {
    if (!mobileMenuOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  return (
    <header className="sticky top-0 z-40 bg-[#F8FAFC]/90 dark:bg-[#090D16]/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/90 transition-colors duration-150">
      <div className="max-w-7xl mx-auto h-16 px-6 lg:px-10 flex items-center justify-between gap-4 sm:gap-6">
        <a
          href="#"
          className="font-display text-xl font-bold tracking-tight text-slate-900 dark:text-[#F8FAFC] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1E40AF] dark:focus-visible:outline-[#60A5FA] rounded-sm"
        >
          Proofline
        </a>

        <nav
          aria-label={t.nav.primaryAria}
          className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300"
        >
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="hover:text-slate-900 dark:hover:text-white hover:underline underline-offset-4 decoration-slate-300 dark:decoration-slate-600 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1E40AF] dark:focus-visible:outline-[#60A5FA] rounded-sm"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden lg:flex items-center gap-2">
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
          </div>

          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              onJoinWaitlist();
            }}
            className="px-4 py-2 min-h-[40px] text-sm font-medium text-white bg-[#1E40AF] hover:bg-[#1D4ED8] dark:bg-[#2563EB] dark:hover:bg-[#3B82F6] active:scale-[0.99] rounded-lg transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E40AF] dark:focus-visible:outline-[#60A5FA]"
          >
            {t.nav.cta}
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-primary-nav"
            aria-label={mobileMenuOpen ? t.nav.closeMenu : t.nav.openMenu}
            className="lg:hidden inline-flex items-center justify-center w-11 h-11 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-slate-800 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E40AF] dark:focus-visible:outline-[#60A5FA]"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" aria-hidden="true" />
            ) : (
              <Menu className="w-5 h-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <nav
          id="mobile-primary-nav"
          aria-label={t.nav.mobileAria}
          className="lg:hidden border-t border-slate-200/80 dark:border-slate-800/90 bg-[#F8FAFC] dark:bg-[#090D16] px-6 py-4 space-y-2"
        >
          <div className="md:hidden space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2.5 px-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-[#1E40AF] dark:hover:text-[#60A5FA] rounded-md transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E40AF] dark:focus-visible:outline-[#60A5FA]"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="pt-3 md:pt-0 md:border-t-0 border-t border-slate-200/80 dark:border-slate-800/90 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                {t.nav.language}
              </span>
              <LanguageToggle
                locale={locale}
                onChangeLocale={onChangeLocale}
                groupLabel={t.languageToggle.groupLabel}
              />
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                {t.nav.appearance}
              </span>
              <ThemeToggle
                theme={theme}
                onChangeTheme={onChangeTheme}
                groupLabel={t.theme.groupLabel}
                darkLabel={t.theme.dark}
                lightLabel={t.theme.light}
              />
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
