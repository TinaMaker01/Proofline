import { useRef, useState, type FormEvent } from 'react';
import { motion } from 'motion/react';
import {
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  AlertTriangle,
  Lock,
} from 'lucide-react';
import type { BuilderTool, WaitlistResponse } from '../types/qa';
import { WaitlistSuccessBurst } from './WaitlistSuccessBurst';

interface HeroSectionProps {
  onWaitlistSuccess: (res: WaitlistResponse) => void;
  onJumpToLiveAudit: () => void;
}

const BUILDER_OPTIONS: BuilderTool[] = ['Lovable', 'Bolt', 'Cursor', 'Replit', 'v0', 'Other'];

const SAMPLE_WORKBENCH_CHECKS = [
  {
    severity: 'Critical',
    area: 'Secret Exposure',
    message: 'STRIPE_SECRET bundled in client JS',
    location: 'CheckoutForm.tsx:142',
  },
  {
    severity: 'Critical',
    area: 'Access Control',
    message: 'public.users returns 1,482 rows without auth',
    location: 'RLS_ENABLED=false',
  },
  {
    severity: 'Warning',
    area: 'Broken Flow · 390px',
    message: 'Primary Pay button clips outside modal viewport',
    location: 'mobile-checkout',
  },
] as const;

export function HeroSection({ onWaitlistSuccess, onJumpToLiveAudit }: HeroSectionProps) {
  const [email, setEmail] = useState('');
  const [builderTool, setBuilderTool] = useState<BuilderTool>('Lovable');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<WaitlistResponse | null>(null);
  const emailRef = useRef<HTMLInputElement | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const trimmed = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmed)) {
      setError('Enter a valid email address so we can send your invite.');
      emailRef.current?.focus();
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
    <section className="pt-10 pb-16 lg:pt-16 lg:pb-24 bg-[#F8FAFC] dark:bg-[#090D16] transition-colors duration-150">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          <div className="lg:col-span-7 flex flex-col justify-center">
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
              Code generated in minutes is fragile in production. Proofline continuously tests your
              Lovable, Bolt, Cursor, and Replit flows—catching leaked keys, open tables, and broken
              screens before real customers hit an error.
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
                    <CheckCircle2
                      className="w-5 h-5 text-emerald-700 dark:text-emerald-400"
                      aria-hidden="true"
                    />
                  </motion.div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-900 dark:text-[#F8FAFC]">
                      {submitted.alreadyRegistered
                        ? 'You are already on the Proofline early access list.'
                        : 'You are on the early access list.'}
                    </p>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                      We saved{' '}
                      <span className="font-mono text-slate-900 dark:text-white break-all">
                        {submitted.entry.email}
                      </span>{' '}
                      for{' '}
                      <span className="font-medium text-slate-900 dark:text-white">
                        {submitted.entry.builderTool}
                      </span>{' '}
                      beta access.
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-4 text-xs">
                      <button
                        type="button"
                        onClick={onJumpToLiveAudit}
                        className="inline-flex items-center gap-1 font-medium text-[#1E40AF] dark:text-[#60A5FA] hover:underline underline-offset-4 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E40AF] dark:focus-visible:outline-[#60A5FA] rounded-sm"
                      >
                        <span>Try the live screenshot audit</span>
                        <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSubmitted(null);
                          setEmail('');
                          setError(null);
                        }}
                        className="font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:underline underline-offset-4 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E40AF] dark:focus-visible:outline-[#60A5FA] rounded-sm"
                      >
                        Register another email
                      </button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="space-y-3">
                  <div className="flex flex-col sm:flex-row gap-2.5">
                    <div className="flex-1 min-w-0">
                      <label htmlFor="hero-email" className="sr-only">
                        Work or personal email
                      </label>
                      <input
                        ref={emailRef}
                        id="hero-email"
                        type="email"
                        required
                        autoComplete="email"
                        aria-invalid={Boolean(error)}
                        aria-describedby={error ? 'hero-email-error' : undefined}
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (error) setError(null);
                        }}
                        placeholder="you@yourstartup.com"
                        className={`w-full px-4 py-3 min-h-[46px] text-sm bg-white dark:bg-[#111827] text-slate-900 dark:text-[#F8FAFC] placeholder:text-slate-500 dark:placeholder:text-slate-400 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                          error
                            ? 'border-rose-500 dark:border-rose-500 focus:border-rose-600 focus:ring-rose-500/20'
                            : 'border-slate-300 dark:border-slate-700 focus:border-[#1E40AF] dark:focus:border-[#3B82F6] focus:ring-[#1E40AF]/15 dark:focus:ring-[#3B82F6]/25'
                        }`}
                      />
                    </div>

                    <div className="sm:w-36">
                      <label htmlFor="hero-builder" className="sr-only">
                        Built with tool
                      </label>
                      <select
                        id="hero-builder"
                        aria-label="Built with AI builder"
                        value={builderTool}
                        onChange={(e) => setBuilderTool(e.target.value as BuilderTool)}
                        className="w-full px-3 py-3 min-h-[46px] text-sm bg-white dark:bg-[#111827] text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:border-[#1E40AF] dark:focus:border-[#3B82F6] focus:ring-2 focus:ring-[#1E40AF]/15 dark:focus:ring-[#3B82F6]/25 transition-colors cursor-pointer"
                      >
                        {BUILDER_OPTIONS.map((tool) => (
                          <option key={tool} value={tool}>
                            {tool}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-5 py-3 min-h-[46px] text-sm font-medium text-white bg-[#1E40AF] hover:bg-[#1D4ED8] dark:bg-[#2563EB] dark:hover:bg-[#3B82F6] disabled:opacity-60 active:scale-[0.99] rounded-lg transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E40AF] dark:focus-visible:outline-[#60A5FA]"
                    >
                      {submitting ? 'Joining...' : 'Get Early Access'}
                    </button>
                  </div>

                  {error && (
                    <p
                      id="hero-email-error"
                      role="alert"
                      className="flex items-center gap-1.5 text-xs text-rose-700 dark:text-rose-400"
                    >
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                      <span>{error}</span>
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-600 dark:text-slate-400 pt-1">
                    <span className="inline-flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-[#1E40AF] dark:text-[#60A5FA]" aria-hidden="true" />
                      <span>Zero code retention · Free during beta</span>
                    </span>
                    <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">
                      ·
                    </span>
                    <button
                      type="button"
                      onClick={onJumpToLiveAudit}
                      className="inline-flex items-center gap-1 font-medium text-[#1E40AF] hover:text-[#1D4ED8] dark:text-[#60A5FA] dark:hover:text-[#93C5FD] hover:underline underline-offset-4 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E40AF] dark:focus-visible:outline-[#60A5FA] rounded-sm"
                    >
                      <span>Try the live screenshot audit</span>
                      <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Authored Proofline Diagnostic Preview Surface */}
          <div className="lg:col-span-5">
            <div
              aria-label="Sample Proofline verification report"
              className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] shadow-sm dark:shadow-none"
            >
              <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0D1321] flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    aria-hidden="true"
                    className="w-2 h-2 rounded-full bg-rose-600 dark:bg-rose-400 shrink-0"
                  />
                  <span className="font-mono text-xs text-slate-700 dark:text-slate-300 truncate">
                    pay-beta.my-bolt-app.com/checkout
                  </span>
                </div>
                <span className="text-xs font-medium text-rose-700 dark:text-rose-400 whitespace-nowrap shrink-0">
                  High Risk
                </span>
              </div>

              <div className="divide-y divide-slate-200 dark:divide-slate-800">
                {SAMPLE_WORKBENCH_CHECKS.map((item) => (
                  <div key={item.message} className="px-5 py-4 flex items-start gap-3">
                    {item.severity === 'Critical' ? (
                      <ShieldAlert
                        className="w-4 h-4 text-rose-700 dark:text-rose-400 shrink-0 mt-0.5"
                        aria-hidden="true"
                      />
                    ) : (
                      <AlertTriangle
                        className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5"
                        aria-hidden="true"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-slate-900 dark:text-[#F8FAFC]">
                          {item.area}
                        </span>
                        <span className="font-mono text-[11px] text-slate-600 dark:text-slate-400">
                          {item.location}
                        </span>
                      </div>
                      <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                        {item.message}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="px-5 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-[#090D16]/70">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                    Generated fix prompt · Paste into Bolt
                  </span>
                  <button
                    type="button"
                    onClick={onJumpToLiveAudit}
                    className="text-xs font-medium text-[#1E40AF] dark:text-[#60A5FA] hover:underline underline-offset-4 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E40AF] dark:focus-visible:outline-[#60A5FA] rounded-sm"
                  >
                    Run live check
                  </button>
                </div>
                <p className="font-mono text-xs text-slate-800 dark:text-slate-200 leading-relaxed">
                  “Move Stripe secret keys into a server route at /api/checkout and enforce RLS on
                  public.users before returning customer rows.”
                </p>
              </div>
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
