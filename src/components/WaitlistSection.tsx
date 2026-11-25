import { useState, type FormEvent, type RefObject } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import type { BuilderTool, WaitlistResponse } from '../types/qa';
import { WaitlistSuccessBurst } from './WaitlistSuccessBurst';

interface WaitlistSectionProps {
  emailInputRef: RefObject<HTMLInputElement | null>;
  latestSignup: WaitlistResponse | null;
  waitlistCount: number | null;
  onWaitlistSuccess: (res: WaitlistResponse) => void;
}

const BUILDER_TOOLS: BuilderTool[] = ['Lovable', 'Bolt', 'Cursor', 'Replit', 'v0', 'Other'];

const PAIN_POINTS = [
  'Flows breaking after new prompts',
  'Exposed API keys or open database tables',
  'Auth and Stripe checkout bugs in production',
  'Mobile layout glitches before launch',
];

export function WaitlistSection({
  emailInputRef,
  latestSignup,
  waitlistCount,
  onWaitlistSuccess,
}: WaitlistSectionProps) {
  const [email, setEmail] = useState('');
  const [builderTool, setBuilderTool] = useState<BuilderTool>('Lovable');
  const [appUrl, setAppUrl] = useState('');
  const [painPoint, setPainPoint] = useState(PAIN_POINTS[0]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localResult, setLocalResult] = useState<WaitlistResponse | null>(null);
  const [dismissedParent, setDismissedParent] = useState(false);

  const activeConfirmation = localResult || (!dismissedParent ? latestSignup : null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const trimmedEmail = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: trimmedEmail,
          builderTool,
          appUrl: appUrl.trim() || undefined,
          painPoint,
          source: 'waitlist-section',
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data?.error || 'Could not complete signup. Please check your details.');
        return;
      }
      const typed = data as WaitlistResponse;
      setLocalResult(typed);
      setDismissedParent(false);
      onWaitlistSuccess(typed);
    } catch {
      setError('Network error while submitting your request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section
      id="waitlist"
      className="py-20 lg:py-28 bg-white dark:bg-[#0D1321] border-t border-slate-200 dark:border-slate-800/90 transition-colors duration-150"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-5">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Early access cohort
            </p>
            <h2
              className="mt-3 font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-[#F8FAFC]"
              style={{ textWrap: 'balance' }}
            >
              Verify everything before your next launch.
            </h2>
            <p className="mt-4 text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              Reserve your spot for automated testing, security verification, and one-prompt fixes.
              Share what you are building and we will prioritize teams launching in the next 30 days.
            </p>

            <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 space-y-3 text-sm text-slate-600 dark:text-slate-300">
              <p>
                <span className="font-semibold text-slate-900 dark:text-[#F8FAFC]">
                  What early members receive:
                </span>{' '}
                unlimited preview checks during beta, live secret & table-rule scanning, and direct
                onboarding with our founding team.
              </p>
              {waitlistCount !== null && waitlistCount > 0 && (
                <p className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                  {waitlistCount} {waitlistCount === 1 ? 'builder has' : 'builders have'} requested
                  early access from this workspace.
                </p>
              )}
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="p-7 sm:p-9 bg-[#F8FAFC] dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl">
              {activeConfirmation ? (
                <motion.div
                  key={activeConfirmation.entry.email}
                  role="status"
                  initial={{ opacity: 0, y: 8, scale: 0.985 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="relative space-y-4"
                >
                  <WaitlistSuccessBurst />
                  <div className="flex items-start gap-3">
                    <motion.div
                      initial={{ scale: 0.65, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.3, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
                      className="shrink-0 mt-0.5"
                    >
                      <CheckCircle2 className="w-6 h-6 text-emerald-700 dark:text-emerald-400" />
                    </motion.div>
                    <div>
                      <h3 className="font-display text-xl font-semibold text-slate-900 dark:text-[#F8FAFC]">
                        {activeConfirmation.alreadyRegistered
                          ? 'Your early access spot is confirmed.'
                          : 'Welcome to the Proofline waitlist.'}
                      </h3>
                      <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                        We registered{' '}
                        <span className="font-mono text-slate-900 dark:text-white">
                          {activeConfirmation.entry.email}
                        </span>{' '}
                        with{' '}
                        <span className="font-medium text-slate-900 dark:text-white">
                          {activeConfirmation.entry.builderTool}
                        </span>{' '}
                        priority access. We will reach out as soon as your invite batch opens.
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
                    <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                      Registered {new Date(activeConfirmation.entry.createdAt).toLocaleDateString()}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setLocalResult(null);
                        setDismissedParent(true);
                        setEmail('');
                        setAppUrl('');
                      }}
                      className="text-xs font-medium text-[#1E40AF] dark:text-[#60A5FA] hover:underline underline-offset-4 cursor-pointer"
                    >
                      Register another team email
                    </button>
                  </div>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="waitlist-email"
                        className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
                      >
                        Email address
                      </label>
                      <input
                        ref={emailInputRef}
                        id="waitlist-email"
                        type="email"
                        required
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="founder@company.com"
                        className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-[#090D16] text-slate-900 dark:text-[#F8FAFC] placeholder:text-slate-400 dark:placeholder:text-slate-500 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:border-[#1E40AF] dark:focus:border-[#3B82F6] focus:ring-2 focus:ring-[#1E40AF]/15 dark:focus:ring-[#3B82F6]/25"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="waitlist-builder"
                        className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
                      >
                        Primary AI builder
                      </label>
                      <select
                        id="waitlist-builder"
                        value={builderTool}
                        onChange={(e) => setBuilderTool(e.target.value as BuilderTool)}
                        className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-[#090D16] text-slate-900 dark:text-[#F8FAFC] border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:border-[#1E40AF] dark:focus:border-[#3B82F6] focus:ring-2 focus:ring-[#1E40AF]/15 dark:focus:ring-[#3B82F6]/25 cursor-pointer"
                      >
                        {BUILDER_TOOLS.map((tool) => (
                          <option key={tool} value={tool}>
                            {tool}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="waitlist-url"
                      className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
                    >
                      App or preview URL (optional)
                    </label>
                    <input
                      id="waitlist-url"
                      type="url"
                      value={appUrl}
                      onChange={(e) => setAppUrl(e.target.value)}
                      placeholder="https://myapp.lovable.app"
                      className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-[#090D16] text-slate-900 dark:text-[#F8FAFC] placeholder:text-slate-400 dark:placeholder:text-slate-500 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:border-[#1E40AF] dark:focus:border-[#3B82F6] focus:ring-2 focus:ring-[#1E40AF]/15 dark:focus:ring-[#3B82F6]/25"
                    />
                  </div>

                  <div>
                    <span className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
                      What worries you most before shipping?
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {PAIN_POINTS.map((option) => {
                        const selected = painPoint === option;
                        return (
                          <button
                            key={option}
                            type="button"
                            onClick={() => setPainPoint(option)}
                            aria-pressed={selected}
                            className={`px-3.5 py-2.5 text-left text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                              selected
                                ? 'bg-white dark:bg-[#161F33] border-[#1E40AF] dark:border-[#3B82F6] text-[#1E40AF] dark:text-[#93C5FD]'
                                : 'bg-white/70 dark:bg-[#090D16] border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                            }`}
                          >
                            {option}
                          </button>
                        );
                      })}
                    </div>
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

                  <div className="pt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      No spam. Only your early access invite and cohort updates.
                    </p>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-6 py-3 text-sm font-medium text-white bg-[#1E40AF] hover:bg-[#1D4ED8] dark:bg-[#2563EB] dark:hover:bg-[#3B82F6] disabled:opacity-60 active:scale-[0.99] rounded-lg transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E40AF] dark:focus-visible:outline-[#60A5FA]"
                    >
                      {submitting ? 'Submitting...' : 'Reserve Early Access'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
