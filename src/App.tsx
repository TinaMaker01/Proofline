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

const THEME_STORAGE_KEY = 'proofline-theme';

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

export default function App() {
  const waitlistEmailRef = useRef<HTMLInputElement | null>(null);
  const [theme, setTheme] = useState<ThemeMode>(getInitialTheme);
  const [latestSignup, setLatestSignup] = useState<WaitlistResponse | null>(null);
  const [waitlistCount, setWaitlistCount] = useState<number | null>(null);

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
    fetch('/api/waitlist/stats')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && typeof data.totalCount === 'number') {
          setWaitlistCount(data.totalCount);
        }
      })
      .catch(() => {
        // Non-blocking optional stats check
      });
  }, []);

  function handleJoinWaitlist() {
    const section = document.getElementById('waitlist');
    section?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.setTimeout(() => {
      waitlistEmailRef.current?.focus({ preventScroll: true });
    }, 350);
  }

  function handleJumpToLiveAudit() {
    const section = document.getElementById('live-audit');
    section?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function handleWaitlistSuccess(res: WaitlistResponse) {
    setLatestSignup(res);
    setWaitlistCount(res.totalCount);
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] dark:bg-[#090D16] text-[#0F172A] dark:text-[#F8FAFC] transition-colors duration-150">
      <Navbar onJoinWaitlist={handleJoinWaitlist} />
      <main className="flex-1">
        <HeroSection
          theme={theme}
          onChangeTheme={setTheme}
          onWaitlistSuccess={handleWaitlistSuccess}
          onJumpToLiveAudit={handleJumpToLiveAudit}
        />
        <CapabilitiesBento />
        <LiveQAStudio />
        <ProofAndFAQ />
        <WaitlistSection
          emailInputRef={waitlistEmailRef}
          latestSignup={latestSignup}
          waitlistCount={waitlistCount}
          onWaitlistSuccess={handleWaitlistSuccess}
        />
      </main>
      <Footer theme={theme} onChangeTheme={setTheme} />
    </div>
  );
}
