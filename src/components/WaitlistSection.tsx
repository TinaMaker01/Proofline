import { useRef, useState, type FormEvent, type RefObject } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import type { BuilderTool, WaitlistResponse } from '../types/qa';
import { WaitlistSuccessBurst } from './WaitlistSuccessBurst';
import { normalizeOptionalHttpUrl, submitWaitlist } from '../services/qaClient';
import { formatBuilderLabel, type Locale, type SiteTranslations } from '../i18n/translations';

interface WaitlistSectionProps {
  locale: Locale;
  t: SiteTranslations;
  emailInputRef: RefObject<HTMLInputElement | null>;
  latestSignup: WaitlistResponse | null;
  waitlistCount: number | null;
  onWaitlistSuccess: (res: WaitlistResponse) => void;
}

const BUILDER_TOOLS: BuilderTool[] = ['Lovable', 'Bolt', 'Cursor', 'Replit', 'v0', 'Other'];

function isValidOptionalUrl(rawUrl: string): boolean {
  const trimmed = rawUrl.trim();
  if (!trimmed) return true;
  return normalizeOptionalHttpUrl(trimmed) !== null;
}

export function WaitlistSection({
  locale,
  t,
  emailInputRef,
  latestSignup,
  waitlistCount,
  onWaitlistSuccess,
}: WaitlistSectionProps) {
  const [email, setEmail] = useState('');
  const [builderTool, setBuilderTool] = useState<BuilderTool>('Lovable');
  const [appUrl, setAppUrl] = useState('');
  const [painPointIndex, setPainPointIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [invalidField, setInvalidField] = useState<'email' | 'appUrl' | null>(null);
  const [localResult, setLocalResult] = useState<WaitlistResponse | null>(null);
  const [dismissedParent, setDismissedParent] = useState(false);
  const appUrlInputRef = useRef<HTMLInputElement | null>(null);

  const activeConfirmation = localResult || (!dismissedParent ? latestSignup : null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setInvalidField(null);

    const trimmedEmail = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmedEmail)) {
      setError(t.waitlist.emailError);
      setInvalidField('email');
      emailInputRef.current?.focus();
      return;
    }

    if (!isValidOptionalUrl(appUrl)) {
      setError(t.waitlist.urlError);
      setInvalidField('appUrl');
      appUrlInputRef.current?.focus();
      return;
    }

    setSubmitting(true);
    try {
      const data = await submitWaitlist(
        {
          email: trimmedEmail,
          builderTool,
          appUrl: appUrl.trim() || undefined,
          painPoint: t.waitlist.painPoints[painPointIndex],
          source: 'waitlist-section',
        },
        locale
      );
      setLocalResult(data);
      setDismissedParent(false);
      onWaitlistSuccess(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.waitlist.fallbackError);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section
      id="waitlist"
      className="scroll-mt-20 py-20 lg:py-28 bg-white dark:bg-[#0D1321] border-t border-slate-200 dark:border-slate-800/90 transition-colors duration-150"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-5">
            <h2
              className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-[#F8FAFC]"
              style={{ textWrap: 'balance' }}
            >
              {t.waitlist.heading}
            </h2>
            <p className="mt-4 text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              {t.waitlist.subheading}
            </p>

            <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 space-y-3 text-sm text-slate-600 dark:text-slate-300">
              <p>
                <span className="font-semibold text-slate-900 dark:text-[#F8FAFC]">
                  {t.waitlist.benefitsLead}
                </span>{' '}
                {t.waitlist.benefitsBody}
              </p>
              {waitlistCount !== null && waitlistCount > 0 && (
                <p className="text-xs text-slate-600 dark:text-slate-400 tabular-nums">
                  {t.waitlist.countLabel(waitlistCount)}
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
                      <CheckCircle2
                        className="w-6 h-6 text-emerald-700 dark:text-emerald-400"
                        aria-hidden="true"
                      />
                    </motion.div>
                    <div>
                      <h3 className="font-display text-xl font-semibold text-slate-900 dark:text-[#F8FAFC]">
                        {activeConfirmation.alreadyRegistered
                          ? t.waitlist.confirmedTitleAlready
                          : t.waitlist.confirmedTitleNew}
                      </h3>
                      <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                        {t.waitlist.confirmedBodyPrefix}{' '}
                        <span className="font-mono text-slate-900 dark:text-white">
                          {activeConfirmation.entry.email}
                        </span>{' '}
                        {t.waitlist.confirmedBodyMiddle}{' '}
                        <span className="font-medium text-slate-900 dark:text-white">
                          {formatBuilderLabel(activeConfirmation.entry.builderTool, locale)}
                        </span>
                        {t.waitlist.confirmedBodySuffix}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
                    <span className="text-xs text-slate-600 dark:text-slate-400 tabular-nums">
                      {t.waitlist.registeredOn}{' '}
                      {new Date(activeConfirmation.entry.createdAt).toLocaleDateString(
                        locale === 'fr' ? 'fr-FR' : 'en-US'
                      )}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setLocalResult(null);
                        setDismissedParent(true);
                        setEmail('');
                        setAppUrl('');
                        setError(null);
                        setInvalidField(null);
                      }}
                      className="text-xs font-medium text-[#1E40AF] dark:text-[#60A5FA] hover:underline underline-offset-4 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E40AF] dark:focus-visible:outline-[#60A5FA] rounded-sm"
                    >
                      {t.waitlist.registerAnother}
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
                        {t.waitlist.emailLabel}
                      </label>
                      <input
                        ref={emailInputRef}
                        id="waitlist-email"
                        type="email"
                        required
                        autoComplete="email"
                        aria-invalid={invalidField === 'email'}
                        aria-describedby={
                          error && invalidField === 'email' ? 'waitlist-form-error' : undefined
                        }
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (error) {
                            setError(null);
                            setInvalidField(null);
                          }
                        }}
                        placeholder={t.waitlist.emailPlaceholder}
                        className={`w-full px-3.5 py-2.5 text-sm bg-white dark:bg-[#090D16] text-slate-900 dark:text-[#F8FAFC] placeholder:text-slate-500 dark:placeholder:text-slate-400 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                          invalidField === 'email'
                            ? 'border-rose-500 dark:border-rose-500 focus:border-rose-600 focus:ring-rose-500/20'
                            : 'border-slate-300 dark:border-slate-700 focus:border-[#1E40AF] dark:focus:border-[#3B82F6] focus:ring-[#1E40AF]/15 dark:focus:ring-[#3B82F6]/25'
                        }`}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="waitlist-builder"
                        className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
                      >
                        {t.waitlist.builderLabel}
                      </label>
                      <select
                        id="waitlist-builder"
                        value={builderTool}
                        onChange={(e) => setBuilderTool(e.target.value as BuilderTool)}
                        className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-[#090D16] text-slate-900 dark:text-[#F8FAFC] border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:border-[#1E40AF] dark:focus:border-[#3B82F6] focus:ring-2 focus:ring-[#1E40AF]/15 dark:focus:ring-[#3B82F6]/25 cursor-pointer"
                      >
                        {BUILDER_TOOLS.map((tool) => (
                          <option key={tool} value={tool}>
                            {formatBuilderLabel(tool, locale)}
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
                      {t.waitlist.urlLabel}
                    </label>
                    <input
                      ref={appUrlInputRef}
                      id="waitlist-url"
                      type="text"
                      inputMode="url"
                      aria-invalid={invalidField === 'appUrl'}
                      aria-describedby={
                        error && invalidField === 'appUrl' ? 'waitlist-form-error' : undefined
                      }
                      value={appUrl}
                      onChange={(e) => {
                        setAppUrl(e.target.value);
                        if (error) {
                          setError(null);
                          setInvalidField(null);
                        }
                      }}
                      placeholder={t.waitlist.urlPlaceholder}
                      className={`w-full px-3.5 py-2.5 text-sm bg-white dark:bg-[#090D16] text-slate-900 dark:text-[#F8FAFC] placeholder:text-slate-500 dark:placeholder:text-slate-400 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                        invalidField === 'appUrl'
                          ? 'border-rose-500 dark:border-rose-500 focus:border-rose-600 focus:ring-rose-500/20'
                          : 'border-slate-300 dark:border-slate-700 focus:border-[#1E40AF] dark:focus:border-[#3B82F6] focus:ring-[#1E40AF]/15 dark:focus:ring-[#3B82F6]/25'
                      }`}
                    />
                  </div>

                  <fieldset>
                    <legend className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
                      {t.waitlist.painLegend}
                    </legend>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {t.waitlist.painPoints.map((option, idx) => {
                        const selected = painPointIndex === idx;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setPainPointIndex(idx)}
                            aria-pressed={selected}
                            className={`px-3.5 py-2.5 text-left text-xs font-medium rounded-lg border transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E40AF] dark:focus-visible:outline-[#60A5FA] ${
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
                  </fieldset>

                  {error && (
                    <p
                      id="waitlist-form-error"
                      role="alert"
                      className="flex items-center gap-1.5 text-xs text-rose-700 dark:text-rose-400"
                    >
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                      <span>{error}</span>
                    </p>
                  )}

                  <div className="pt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      {t.waitlist.noSpam}
                    </p>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-6 py-3 text-sm font-medium text-white bg-[#1E40AF] hover:bg-[#1D4ED8] dark:bg-[#2563EB] dark:hover:bg-[#3B82F6] disabled:opacity-60 active:scale-[0.99] rounded-lg transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E40AF] dark:focus-visible:outline-[#60A5FA]"
                    >
                      {submitting ? t.waitlist.submitting : t.waitlist.submit}
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
