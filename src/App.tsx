import { useEffect, useRef, useState } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { CapabilitiesBento } from './components/CapabilitiesBento';
import { LiveQAStudio } from './components/LiveQAStudio';
import { ProofAndFAQ } from './components/ProofAndFAQ';
import { WaitlistSection } from './components/WaitlistSection';
import { Footer } from './components/Footer';
import type { ThemeMode } from './components/ThemeToggle';
import type { WaitlistResponse } from './types/qa';
import { getWaitlistStats } from './services/qaClient';
import { TRANSLATIONS, type Locale } from './i18n/translations';

const THEME_STORAGE_KEY = 'proofline-theme';
const LOCALE_STORAGE_KEY = 'proofline-locale';

function getInitialTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'dark';
  try {
    const saved = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') {
      return saved;
    }
  } catch {
    // Ignore storage restrictions
  }
  return 'dark';
}

function getInitialLocale(): Locale {
  if (typeof window === 'undefined') return 'fr';
  try {
    const saved = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    if (saved === 'en' || saved === 'fr') {
      return saved;
    }
  } catch {
    // Ignore storage restrictions
  }
  return 'fr';
}

export default function App() {
  const waitlistEmailRef = useRef<HTMLInputElement | null>(null);
  const focusTimerRef = useRef<number | null>(null);
  const [theme, setTheme] = useState<ThemeMode>(getInitialTheme);
  const [locale, setLocale] = useState<Locale>(getInitialLocale);
  const [latestSignup, setLatestSignup] = useState<WaitlistResponse | null>(null);
  const [waitlistCount, setWaitlistCount] = useState<number | null>(null);

  const t = TRANSLATIONS[locale];

  useEffect(() => {
    return () => {
      if (focusTimerRef.current !== null) {
        window.clearTimeout(focusTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Ignore storage restrictions
    }
  }, [theme]);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.title = t.meta.title;
    const descMeta = document.querySelector('meta[name="description"]');
    if (descMeta) {
      descMeta.setAttribute('content', t.meta.description);
    }
    try {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    } catch {
      // Ignore storage restrictions
    }
  }, [locale, t.meta.description, t.meta.title]);

  useEffect(() => {
    setWaitlistCount(getWaitlistStats());
  }, []);

  function scrollToSection(id: string) {
    const section = document.getElementById(id);
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    section?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  }

  function handleJoinWaitlist() {
    scrollToSection('waitlist');
    if (focusTimerRef.current !== null) {
      window.clearTimeout(focusTimerRef.current);
    }
    focusTimerRef.current = window.setTimeout(() => {
      waitlistEmailRef.current?.focus({ preventScroll: true });
      focusTimerRef.current = null;
    }, 350);
  }

  function handleJumpToLiveAudit() {
    scrollToSection('live-audit');
  }

  function handleWaitlistSuccess(res: WaitlistResponse) {
    setLatestSignup(res);
    setWaitlistCount(res.totalCount);
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] dark:bg-[#090D16] text-[#0F172A] dark:text-[#F8FAFC] transition-colors duration-150">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-4 focus:z-50 focus:px-4 focus:py-2.5 focus:rounded-lg focus:bg-[#1E40AF] focus:text-white focus:text-sm focus:font-medium focus:shadow-lg focus:outline-2 focus:outline-offset-2 focus:outline-white"
      >
        {t.skipLink}
      </a>
      <Navbar
        theme={theme}
        onChangeTheme={setTheme}
        locale={locale}
        onChangeLocale={setLocale}
        t={t}
        onJoinWaitlist={handleJoinWaitlist}
      />
      <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-none">
        <HeroSection
          locale={locale}
          t={t}
          onWaitlistSuccess={handleWaitlistSuccess}
          onJumpToLiveAudit={handleJumpToLiveAudit}
        />
        <CapabilitiesBento t={t} />
        <LiveQAStudio locale={locale} t={t} />
        <ProofAndFAQ t={t} />
        <WaitlistSection
          locale={locale}
          t={t}
          emailInputRef={waitlistEmailRef}
          latestSignup={latestSignup}
          waitlistCount={waitlistCount}
          onWaitlistSuccess={handleWaitlistSuccess}
        />
      </main>
      <Footer
        theme={theme}
        onChangeTheme={setTheme}
        locale={locale}
        onChangeLocale={setLocale}
        t={t}
      />
    </div>
  );
}
