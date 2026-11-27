import { useEffect, useMemo, useRef, useState } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { HowItWorks } from './components/HowItWorks';
import { SampleReport } from './components/SampleReport';
import { LiveQAStudio } from './components/LiveQAStudio';
import { ProofAndFAQ } from './components/ProofAndFAQ';
import { WaitlistSection } from './components/WaitlistSection';
import { Footer } from './components/Footer';
import { LegalModal, type LegalModalKind } from './components/LegalModal';
import { PreorderReturnNotice } from './components/PreorderReturnNotice';
import type { ThemeMode } from './components/ThemeToggle';
import { ACTIVE_PREORDER } from './config/preorder';
import type { LeadStep1Response, PricingPlanId } from './types/qa';
import { fetchLeadCount, trackPreorderClick, trackPricingInterest } from './services/qaClient';
import { TRANSLATIONS, type Locale } from './i18n/translations';
import { captureUtmParams } from './utils/utm';

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
  const [activeLead, setActiveLead] = useState<LeadStep1Response | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<PricingPlanId | null>(null);
  const [leadCount, setLeadCount] = useState<number | null>(null);
  const [legalModal, setLegalModal] = useState<LegalModalKind>(null);

  const utm = useMemo(() => captureUtmParams(), []);
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
    void fetchLeadCount().then((count) => setLeadCount(count));
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

  function handleStep1Success(res: LeadStep1Response) {
    setActiveLead(res);
    setLeadCount(res.totalCount);
  }

  function handleResetLead() {
    setActiveLead(null);
  }

  function handleSelectPricingInterest(planId: PricingPlanId) {
    setSelectedPlan(planId);
    void trackPricingInterest({
      planId,
      email: activeLead?.entry.email,
      locale,
      utm,
    });
    scrollToSection('waitlist');
    if (!activeLead) {
      if (focusTimerRef.current !== null) {
        window.clearTimeout(focusTimerRef.current);
      }
      focusTimerRef.current = window.setTimeout(() => {
        waitlistEmailRef.current?.focus({ preventScroll: true });
        focusTimerRef.current = null;
      }, 350);
    }
  }

  function handlePreorderClick(planId: PricingPlanId) {
    void trackPreorderClick({
      planId,
      email: activeLead?.entry.email,
      locale,
      utm,
    });
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
        {ACTIVE_PREORDER && (
          <PreorderReturnNotice locale={locale} config={ACTIVE_PREORDER} />
        )}
        <HeroSection
          locale={locale}
          t={t}
          utm={utm}
          activeLead={activeLead}
          onStep1Success={handleStep1Success}
          onResetLead={handleResetLead}
          onJumpToStep2={() => scrollToSection('waitlist')}
          onJumpToLiveAudit={handleJumpToLiveAudit}
          onOpenLegal={setLegalModal}
        />
        <LiveQAStudio locale={locale} t={t} />
        <HowItWorks t={t} />
        <SampleReport t={t} />
        <ProofAndFAQ
          locale={locale}
          t={t}
          onPreorderClick={handlePreorderClick}
          onOpenLegal={setLegalModal}
          interestedPlan={selectedPlan}
          onSelectPricingInterest={handleSelectPricingInterest}
        />
        <WaitlistSection
          locale={locale}
          t={t}
          utm={utm}
          emailInputRef={waitlistEmailRef}
          activeLead={activeLead}
          selectedPlan={selectedPlan}
          leadCount={leadCount}
          onStep1Success={handleStep1Success}
          onResetLead={handleResetLead}
          onOpenLegal={setLegalModal}
        />
      </main>
      <Footer
        theme={theme}
        onChangeTheme={setTheme}
        locale={locale}
        onChangeLocale={setLocale}
        t={t}
        onOpenLegal={setLegalModal}
      />
      <LegalModal
        kind={legalModal}
        onClose={() => setLegalModal(null)}
        locale={locale}
        t={t}
      />
    </div>
  );
}
