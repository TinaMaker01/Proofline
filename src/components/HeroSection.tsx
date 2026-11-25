import { useState, type FormEvent } from 'react';
import { motion } from 'motion/react';
import {
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Lock,
  FileCheck2,
  ServerOff,
} from 'lucide-react';
import type { BuilderTool, WaitlistResponse } from '../types/qa';
import { WaitlistSuccessBurst } from './WaitlistSuccessBurst';
import { ThemeToggle, type ThemeMode } from './ThemeToggle';

interface HeroSectionProps {
  theme: ThemeMode;
  onChangeTheme: (next: ThemeMode) => void;
  onWaitlistSuccess: (res: WaitlistResponse) => void;
  onJumpToLiveAudit: () => void;
}

const HERO_IMAGE_PATH = '/src/assets/images/hero_qa_studio_1795597423963.jpg';

const BUILDER_OPTIONS: BuilderTool[] = ['Lovable', 'Bolt', 'Cursor', 'Replit', 'v0', 'Other'];

const SECURITY_TRUST_MARKERS = [
  {
    icon: ShieldCheck,
    label: 'Security Verified',
    detail: 'OWASP Top 10 & secret exposure checks',
  },
  {
    icon: Lock,
    label: 'SOC 2 Type II Aligned',
    detail: 'Enterprise access & audit controls',
  },
  {
    icon: ServerOff,
    label: 'Zero Code Retention',
    detail: 'Isolated ephemeral sandbox runs',
  },
  {
    icon: FileCheck2,
    label: 'RLS & Auth Audited',
    detail: 'Supabase, Firebase & API boundaries',
  },
];

export function HeroSection({
  theme,
  onChangeTheme,
  onWaitlistSuccess,
  onJumpToLiveAudit,
}: HeroSectionProps) {
  const [email, setEmail] = useState('');
  const [builderTool, setBuilderTool] = useState<BuilderTool>('Lovable');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<WaitlistResponse | null>(null);
  const [imgError, setImgError] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const trimmed = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmed)) {
      setError('Enter a valid email address so we can send your invite.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: trimmed,
          builderTool,
          source: 'hero',
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data?.error || 'Could not save your signup right now. Please try again.');
        return;
      }
      setSubmitted(data as WaitlistResponse);
      onWaitlistSuccess(data as WaitlistResponse);
    } catch {
      setError('Network error while saving your email. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="pt-10 pb-16 lg:pt-14 lg:pb-24 bg-[#F8FAFC] dark:bg-[#090D16] transition-colors duration-150">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        {/* Hero Utility Row: Quiet compatibility kicker + Dark/Light toggle */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <p className="text-xs font-medium tracking-wide text-slate-500 dark:text-slate-400">
            <span>Built for Lovable</span>
            <span aria-hidden="true" className="mx-2 text-slate-300 dark:text-slate-700">
              ·
            </span>
            <span>Bolt</span>
            <span aria-hidden="true" className="mx-2 text-slate-300 dark:text-slate-700">
              ·
            </span>
            <span>Cursor</span>
            <span aria-hidden="true" className="mx-2 text-slate-300 dark:text-slate-700">
              ·
            </span>
            <span>Replit</span>
          </p>

          <ThemeToggle theme={theme} onChangeTheme={onChangeTheme} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
          <div className="lg:col-span-7 flex flex-col justify-between">
            <div>
              <h1
                className="font-display font-bold tracking-tight text-slate-900 dark:text-[#F8FAFC] leading-[1.06] max-w-2xl"
                style={{
                  fontSize: 'clamp(2.35rem, 4.2vw, 3.75rem)',
                  textWrap: 'balance',
                }}
              >
                Ship AI-built apps that never break or leak.
              </h1>

              <p className="mt-6 text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-[60ch]">
                Code generated in minutes is fragile in production. We continuously verify that
                everything is working and that nothing is exposed—testing your user flows, catching
                leaked keys or open tables, and writing plain-English fixes before real customers
                hit an error.
              </p>

              <div className="mt-8 max-w-xl">
                {submitted ? (
                  <motion.div
                    role="status"
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className="relative p-5 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl flex items-start gap-3.5"
                  >
                    <WaitlistSuccessBurst />
                    <motion.div
                      initial={{ scale: 0.7, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.3, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
                      className="shrink-0 mt-0.5"
                    >
                      <CheckCircle2 className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
                    </motion.div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-[#F8FAFC]">
                        {submitted.alreadyRegistered
                          ? 'You are already on the Proofline early access list.'
                          : 'You are on the early access list.'}
                      </p>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                        We saved{' '}
                        <span className="font-mono text-slate-900 dark:text-white">
                          {submitted.entry.email}
                        </span>{' '}
                        for{' '}
                        <span className="font-medium text-slate-900 dark:text-white">
                          {submitted.entry.builderTool}
                        </span>{' '}
                        beta access. Try the live screenshot audit below while you wait.
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} noValidate className="space-y-3">
                    <div className="flex flex-col sm:flex-row gap-2.5">
                      <label htmlFor="hero-email" className="sr-only">
                        Work or personal email
                      </label>
                      <input
                        id="hero-email"
                        type="email"
                        required
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@yourstartup.com"
                        className="flex-1 min-w-0 px-4 py-3 text-sm bg-white dark:bg-[#111827] text-slate-900 dark:text-[#F8FAFC] placeholder:text-slate-400 dark:placeholder:text-slate-500 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:border-[#1E40AF] dark:focus:border-[#3B82F6] focus:ring-2 focus:ring-[#1E40AF]/15 dark:focus:ring-[#3B82F6]/25 transition-colors"
                      />

                      <label htmlFor="hero-builder" className="sr-only">
                        Primary AI app builder
                      </label>
                      <select
                        id="hero-builder"
                        value={builderTool}
                        onChange={(e) => setBuilderTool(e.target.value as BuilderTool)}
                        className="sm:w-32 px-3 py-3 text-sm bg-white dark:bg-[#111827] text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:border-[#1E40AF] dark:focus:border-[#3B82F6] focus:ring-2 focus:ring-[#1E40AF]/15 dark:focus:ring-[#3B82F6]/25 transition-colors cursor-pointer"
                      >
                        {BUILDER_OPTIONS.map((tool) => (
                          <option key={tool} value={tool}>
                            {tool}
                          </option>
                        ))}
                      </select>

                      <button
                        type="submit"
                        disabled={submitting}
                        className="px-5 py-3 text-sm font-medium text-white bg-[#1E40AF] hover:bg-[#1D4ED8] dark:bg-[#2563EB] dark:hover:bg-[#3B82F6] disabled:opacity-60 active:scale-[0.99] rounded-lg transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E40AF] dark:focus-visible:outline-[#60A5FA]"
                      >
                        {submitting ? 'Joining...' : 'Request Early Access'}
                      </button>
                    </div>

                    {error && (
                      <p
                        role="alert"
                        className="flex items-center gap-1.5 text-xs text-rose-700 dark:text-rose-400"
                      >
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{error}</span>
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500 dark:text-slate-400 pt-1">
                      <span>Free during early access</span>
                      <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">
                        ·
                      </span>
                      <span>No test code required</span>
                      <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">
                        ·
                      </span>
                      <button
                        type="button"
                        onClick={onJumpToLiveAudit}
                        className="inline-flex items-center gap-1 font-medium text-[#1E40AF] hover:text-[#1D4ED8] dark:text-[#60A5FA] dark:hover:text-[#93C5FD] hover:underline underline-offset-4 cursor-pointer"
                      >
                        <span>Try the live screenshot audit</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>

            {/* Enterprise Security Trusted & Verified Assurance Section */}
            <div
              aria-label="Enterprise security verification standards"
              className="mt-9 pt-6 border-t border-slate-200/90 dark:border-slate-800/90"
            >
              <div className="flex items-center justify-between gap-4 mb-3.5">
                <p className="inline-flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
                  <ShieldCheck className="w-4 h-4 text-[#1E40AF] dark:text-[#60A5FA] shrink-0" />
                  <span>Security Trusted for Production & Enterprise Teams</span>
                </p>
                <span className="hidden sm:inline text-xs text-slate-500 dark:text-slate-400">
                  Verified continuous isolation
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-4">
                {SECURITY_TRUST_MARKERS.map((marker) => {
                  const Icon = marker.icon;
                  return (
                    <div key={marker.label} className="flex items-start gap-2.5">
                      <Icon className="w-4 h-4 text-[#1E40AF] dark:text-[#60A5FA] shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-900 dark:text-[#F8FAFC] leading-snug">
                          {marker.label}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug mt-0.5">
                          {marker.detail}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col">
            <div className="relative flex-1 min-h-[300px] lg:min-h-[420px] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-[#111827]">
              {!imgError ? (
                <img
                  src={HERO_IMAGE_PATH}
                  alt="Minimalist software studio desk displaying web application layouts and interface blueprints"
                  referrerPolicy="no-referrer"
                  onError={() => setImgError(true)}
                  className="w-full h-full lg:h-full object-cover dark:brightness-[0.9] dark:contrast-[1.04] transition-[filter] duration-150"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-[#111827] dark:to-[#1E293B] text-slate-600 dark:text-slate-300">
                  <ShieldCheck className="w-10 h-10 text-[#1E40AF] dark:text-[#60A5FA] mb-3" />
                  <p className="font-display font-semibold text-slate-900 dark:text-[#F8FAFC]">
                    Continuous Verification Workbench
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 text-center max-w-xs">
                    Automated browser checks, secret scanning, and plain-English fix prompts.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Full-width 4-column outcome strip below the hero split */}
        <div className="mt-14 pt-10 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <p className="font-display text-base font-semibold text-slate-900 dark:text-[#F8FAFC]">
              Every user flow verified
            </p>
            <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Sign-ups, checkouts, and forms run in real browsers after every prompt you ship.
            </p>
          </div>
          <div>
            <p className="font-display text-base font-semibold text-slate-900 dark:text-[#F8FAFC]">
              Nothing left exposed
            </p>
            <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Flags public API keys, open Supabase tables, and missing auth checks automatically.
            </p>
          </div>
          <div>
            <p className="font-display text-base font-semibold text-slate-900 dark:text-[#F8FAFC]">
              Fixes in plain English
            </p>
            <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Get exact repair prompts to paste back into Lovable, Bolt, or Cursor—no terminal
              needed.
            </p>
          </div>
          <div>
            <p className="font-display text-base font-semibold text-slate-900 dark:text-[#F8FAFC]">
              2-minute onboarding
            </p>
            <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Connect a preview link or repo. Proofline maps your routes and guards them nonstop.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
