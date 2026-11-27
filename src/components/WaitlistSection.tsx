import { useEffect, useRef, useState, type FormEvent, type RefObject } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, AlertCircle, Share2, Copy, Check } from 'lucide-react';
import type {
  BuilderTool,
  DatabaseTool,
  LeadStep1Response,
  MonthlyBudget,
  PricingPlanId,
  UserScale,
  UtmParams,
} from '../types/qa';
import { WaitlistSuccessBurst } from './WaitlistSuccessBurst';
import { normalizeOptionalHttpUrl, submitLeadStep1, submitLeadStep2 } from '../services/qaClient';
import { formatBuilderLabel, type Locale, type SiteTranslations } from '../i18n/translations';
import type { LegalModalKind } from './LegalModal';

interface WaitlistSectionProps {
  locale: Locale;
  t: SiteTranslations;
  utm: UtmParams;
  emailInputRef: RefObject<HTMLInputElement | null>;
  activeLead: LeadStep1Response | null;
  selectedPlan: PricingPlanId | null;
  leadCount: number | null;
  onStep1Success: (res: LeadStep1Response) => void;
  onResetLead: () => void;
  onOpenLegal: (kind: LegalModalKind) => void;
}

const BUILDER_TOOLS: BuilderTool[] = ['Lovable', 'Bolt', 'Cursor', 'Replit', 'v0', 'Other'];

// En dessous de ce seuil, le compteur d’inscrits dessert la page plus qu’il ne rassure.
const MIN_VISIBLE_LEAD_COUNT = 20;

export function WaitlistSection({
  locale,
  t,
  utm,
  emailInputRef,
  activeLead,
  selectedPlan,
  leadCount,
  onStep1Success,
  onResetLead,
  onOpenLegal,
}: WaitlistSectionProps) {
  // Step 1 state
  const [email, setEmail] = useState('');
  const [consentGdpr, setConsentGdpr] = useState(false);
  const [honeypot, setHoneypot] = useState('');
  const [step1Submitting, setStep1Submitting] = useState(false);
  const [step1Error, setStep1Error] = useState<string | null>(null);
  const [step1InvalidField, setStep1InvalidField] = useState<'email' | 'gdpr' | null>(null);
  const gdprRef = useRef<HTMLInputElement | null>(null);

  // Step 2 state (optional qualification)
  const [builderTool, setBuilderTool] = useState<BuilderTool>('Lovable');
  const [databaseTool, setDatabaseTool] = useState<DatabaseTool>('Supabase');
  const [userScale, setUserScale] = useState<UserScale>('1-50');
  const [painPointIdx, setPainPointIdx] = useState(0);
  const [interestedPlan, setInterestedPlan] = useState<PricingPlanId>(selectedPlan ?? 'monthly');
  const [monthlyBudget, setMonthlyBudget] = useState<MonthlyBudget>('20-49');
  const [appUrl, setAppUrl] = useState('');
  const [ownsAppConfirmed, setOwnsAppConfirmed] = useState(false);
  const [interviewOptIn, setInterviewOptIn] = useState(false);
  const [step2Submitting, setStep2Submitting] = useState(false);
  const [step2Error, setStep2Error] = useState<string | null>(null);
  const [step2InvalidField, setStep2InvalidField] = useState<'url' | 'ownership' | null>(null);
  const [step2Saved, setStep2Saved] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  const appUrlRef = useRef<HTMLInputElement | null>(null);
  const ownsRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (selectedPlan) {
      setInterestedPlan(selectedPlan);
    }
  }, [selectedPlan]);

  async function handleStep1Submit(e: FormEvent) {
    e.preventDefault();
    setStep1Error(null);
    setStep1InvalidField(null);

    const trimmedEmail = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmedEmail)) {
      setStep1Error(t.funnel.emailError);
      setStep1InvalidField('email');
      emailInputRef.current?.focus();
      return;
    }

    if (!consentGdpr) {
      setStep1Error(t.funnel.gdprError);
      setStep1InvalidField('gdpr');
      gdprRef.current?.focus();
      return;
    }

    setStep1Submitting(true);
    try {
      const data = await submitLeadStep1({
        email: trimmedEmail,
        consentGdpr: true,
        source: 'final-cta',
        locale,
        companyWebsite: honeypot,
        ...utm,
      });
      setStep2Saved(false);
      onStep1Success(data);
    } catch (err) {
      setStep1Error(err instanceof Error ? err.message : t.funnel.fallbackError);
    } finally {
      setStep1Submitting(false);
    }
  }

  async function handleStep2Submit(e: FormEvent) {
    e.preventDefault();
    if (!activeLead) return;

    setStep2Error(null);
    setStep2InvalidField(null);

    const trimmedUrl = appUrl.trim();
    if (trimmedUrl) {
      if (normalizeOptionalHttpUrl(trimmedUrl) === null) {
        setStep2Error(t.funnel.urlError);
        setStep2InvalidField('url');
        appUrlRef.current?.focus();
        return;
      }
      if (!ownsAppConfirmed) {
        setStep2Error(t.funnel.ownershipError);
        setStep2InvalidField('ownership');
        ownsRef.current?.focus();
        return;
      }
    }

    setStep2Submitting(true);
    try {
      await submitLeadStep2({
        email: activeLead.entry.email,
        builderTool,
        databaseTool,
        userScale,
        painPoint: t.funnel.painPoints[painPointIdx],
        interestedPlan,
        monthlyBudget,
        appUrl: trimmedUrl || undefined,
        ownsAppConfirmed,
        interviewOptIn,
        locale,
      });
      setStep2Saved(true);
    } catch (err) {
      setStep2Error(err instanceof Error ? err.message : t.funnel.fallbackError);
    } finally {
      setStep2Submitting(false);
    }
  }

  function handleCopyShareLink() {
    const shareUrl = typeof window !== 'undefined' ? window.location.origin : 'https://proofline-rouge.vercel.app';
    navigator.clipboard
      ?.writeText(shareUrl)
      .then(() => {
        setCopiedShare(true);
        window.setTimeout(() => setCopiedShare(false), 2000);
      })
      .catch(() => {
        // Ignore clipboard errors
      });
  }

  const pageUrl =
    typeof window !== 'undefined' ? encodeURIComponent(window.location.origin) : '';
  const encodedShareText = encodeURIComponent(t.funnel.shareText);

  return (
    <section
      id="waitlist"
      className="scroll-mt-20 py-20 lg:py-28 bg-[#F8FAFC] dark:bg-[#090D16] border-t border-slate-200 dark:border-slate-800/90 transition-colors duration-150"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-5">
            <h2
              className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-[#F8FAFC]"
              style={{ textWrap: 'balance' }}
            >
              {t.funnel.heading}
            </h2>
            <p className="mt-4 text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              {t.funnel.subheading}
            </p>

            <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 space-y-3 text-sm text-slate-600 dark:text-slate-300">
              <p>
                <span className="font-semibold text-slate-900 dark:text-[#F8FAFC]">
                  {t.funnel.benefitsLead}
                </span>{' '}
                {t.funnel.benefitsBody}
              </p>
              {leadCount !== null && leadCount >= MIN_VISIBLE_LEAD_COUNT && (
                <p className="text-xs text-slate-600 dark:text-slate-400 tabular-nums">
                  {t.funnel.countLabel(leadCount)}
                </p>
              )}
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="p-7 sm:p-9 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl">
              {!activeLead ? (
                /* ÉTAPE 1 — Champ e-mail unique + consentement RGPD */
                <form onSubmit={handleStep1Submit} noValidate className="space-y-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#1E40AF] dark:text-[#60A5FA]">
                    {t.funnel.step1Title}
                  </p>

                  {/* Honeypot anti-spam */}
                  <div className="sr-only" aria-hidden="true">
                    <label htmlFor="waitlist-company-website">Website</label>
                    <input
                      id="waitlist-company-website"
                      type="text"
                      tabIndex={-1}
                      autoComplete="off"
                      value={honeypot}
                      onChange={(e) => setHoneypot(e.target.value)}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="waitlist-email"
                      className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
                    >
                      {t.funnel.emailLabel}
                    </label>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input
                        ref={emailInputRef}
                        id="waitlist-email"
                        type="email"
                        required
                        autoComplete="email"
                        aria-invalid={step1InvalidField === 'email'}
                        aria-describedby={
                          step1Error && step1InvalidField === 'email'
                            ? 'waitlist-step1-error'
                            : undefined
                        }
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (step1Error) {
                            setStep1Error(null);
                            setStep1InvalidField(null);
                          }
                        }}
                        placeholder={t.funnel.emailPlaceholder}
                        className={`flex-1 min-w-0 px-4 py-3 min-h-[46px] text-sm bg-white dark:bg-[#090D16] text-slate-900 dark:text-[#F8FAFC] placeholder:text-slate-500 dark:placeholder:text-slate-400 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                          step1InvalidField === 'email'
                            ? 'border-rose-500 dark:border-rose-500 focus:border-rose-600 focus:ring-rose-500/20'
                            : 'border-slate-300 dark:border-slate-700 focus:border-[#1E40AF] dark:focus:border-[#3B82F6] focus:ring-[#1E40AF]/15 dark:focus:ring-[#3B82F6]/25'
                        }`}
                      />
                      <button
                        type="submit"
                        disabled={step1Submitting}
                        className="px-6 py-3 min-h-[46px] text-sm font-medium text-white bg-[#1E40AF] hover:bg-[#1D4ED8] dark:bg-[#2563EB] dark:hover:bg-[#3B82F6] disabled:opacity-60 active:scale-[0.99] rounded-lg transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E40AF] dark:focus-visible:outline-[#60A5FA]"
                      >
                        {step1Submitting ? t.funnel.step1Submitting : t.funnel.step1Submit}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <input
                      ref={gdprRef}
                      id="waitlist-gdpr-consent"
                      type="checkbox"
                      checked={consentGdpr}
                      aria-invalid={step1InvalidField === 'gdpr'}
                      aria-describedby={
                        step1Error && step1InvalidField === 'gdpr'
                          ? 'waitlist-step1-error'
                          : undefined
                      }
                      onChange={(e) => {
                        setConsentGdpr(e.target.checked);
                        if (step1Error) {
                          setStep1Error(null);
                          setStep1InvalidField(null);
                        }
                      }}
                      className="mt-0.5 h-4 w-4 rounded border-slate-300 dark:border-slate-700 text-[#1E40AF] focus:ring-[#1E40AF] cursor-pointer shrink-0"
                    />
                    <label
                      htmlFor="waitlist-gdpr-consent"
                      className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed cursor-pointer"
                    >
                      {t.funnel.gdprLabelPrefix}{' '}
                      <button
                        type="button"
                        onClick={() => onOpenLegal('privacy')}
                        className="font-medium text-[#1E40AF] dark:text-[#60A5FA] hover:underline underline-offset-4 cursor-pointer"
                      >
                        {t.funnel.gdprPrivacyLink}
                      </button>
                      {t.funnel.gdprLabelSuffix}
                    </label>
                  </div>

                  {step1Error && (
                    <p
                      id="waitlist-step1-error"
                      role="alert"
                      className="flex items-center gap-1.5 text-xs text-rose-700 dark:text-rose-400"
                    >
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                      <span>{step1Error}</span>
                    </p>
                  )}
                </form>
              ) : (
                /* PAGE / ÉTAPE 2 — Remerciement + Partage + Qualification optionnelle (§6.2 & §6.3) */
                <div className="space-y-6">
                  <motion.div
                    key={activeLead.entry.email}
                    role="status"
                    initial={{ opacity: 0, y: 8, scale: 0.985 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className="relative pb-6 border-b border-slate-200 dark:border-slate-800 space-y-4"
                  >
                    <WaitlistSuccessBurst />
                    <div className="flex items-start gap-3">
                      <CheckCircle2
                        className="w-6 h-6 text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5"
                        aria-hidden="true"
                      />
                      <div className="min-w-0 flex-1">
                        <h3 className="font-display text-xl font-semibold text-slate-900 dark:text-[#F8FAFC]">
                          {activeLead.alreadyRegistered
                            ? t.funnel.confirmedTitleAlready
                            : t.funnel.confirmedTitleNew}
                        </h3>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                          <span className="font-mono text-slate-900 dark:text-white break-all">
                            {activeLead.entry.email}
                          </span>{' '}
                          — {t.funnel.confirmedSubtitle}
                        </p>
                        {activeLead.welcomeEmailSent && (
                          <p className="mt-1 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                            {t.funnel.welcomeEmailNotice}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Boutons de partage (S6.3) */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                          <Share2 className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>{t.funnel.shareTitle}</span>
                        </span>
                        <a
                          href={`https://twitter.com/intent/tweet?text=${encodedShareText}&url=${pageUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-[#1E40AF] dark:hover:border-[#60A5FA] transition-colors"
                        >
                          {t.funnel.shareX}
                        </a>
                        <a
                          href={`https://www.linkedin.com/sharing/share-offsite/?url=${pageUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-[#1E40AF] dark:hover:border-[#60A5FA] transition-colors"
                        >
                          {t.funnel.shareLinkedIn}
                        </a>
                        <button
                          type="button"
                          onClick={handleCopyShareLink}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-[#1E40AF] dark:hover:border-[#60A5FA] cursor-pointer transition-colors"
                        >
                          {copiedShare ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" aria-hidden="true" />
                              <span>{t.funnel.shareCopied}</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" aria-hidden="true" />
                              <span>{t.funnel.shareCopy}</span>
                            </>
                          )}
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setEmail('');
                          setConsentGdpr(false);
                          setStep1Error(null);
                          setStep2Saved(false);
                          onResetLead();
                        }}
                        className="text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:underline underline-offset-4 cursor-pointer"
                      >
                        {t.funnel.registerAnother}
                      </button>
                    </div>
                  </motion.div>

                  {step2Saved ? (
                    <div
                      role="status"
                      className="p-5 rounded-lg bg-[#F8FAFC] dark:bg-[#090D16] border border-slate-200 dark:border-slate-800 space-y-2"
                    >
                      <p className="text-sm font-semibold text-slate-900 dark:text-[#F8FAFC]">
                        {t.funnel.step2SavedTitle}
                      </p>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                        {t.funnel.step2SavedSubtitle}
                      </p>
                      <button
                        type="button"
                        onClick={() => setStep2Saved(false)}
                        className="text-xs font-medium text-[#1E40AF] dark:text-[#60A5FA] hover:underline underline-offset-4 cursor-pointer"
                      >
                        {t.funnel.editStep2}
                      </button>
                    </div>
                  ) : (
                    /* Formulaire de qualification Étape 2 (§6.2) */
                    <form onSubmit={handleStep2Submit} noValidate className="space-y-5">
                      <div>
                        <p className="text-xs font-semibold text-[#1E40AF] dark:text-[#60A5FA]">
                          {t.funnel.step2Badge}
                        </p>
                        <h4 className="mt-1 font-display text-lg font-semibold text-slate-900 dark:text-[#F8FAFC]">
                          {t.funnel.step2Title}
                        </h4>
                        <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                          {t.funnel.step2Subtitle}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label
                            htmlFor="step2-builder"
                            className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
                          >
                            {t.funnel.builderLabel}
                          </label>
                          <select
                            id="step2-builder"
                            value={builderTool}
                            onChange={(e) => setBuilderTool(e.target.value as BuilderTool)}
                            className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-[#090D16] text-slate-900 dark:text-[#F8FAFC] border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:border-[#1E40AF] dark:focus:border-[#3B82F6] cursor-pointer"
                          >
                            {BUILDER_TOOLS.map((tool) => (
                              <option key={tool} value={tool}>
                                {formatBuilderLabel(tool, locale)}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label
                            htmlFor="step2-database"
                            className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
                          >
                            {t.funnel.databaseLabel}
                          </label>
                          <select
                            id="step2-database"
                            value={databaseTool}
                            onChange={(e) => setDatabaseTool(e.target.value as DatabaseTool)}
                            className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-[#090D16] text-slate-900 dark:text-[#F8FAFC] border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:border-[#1E40AF] dark:focus:border-[#3B82F6] cursor-pointer"
                          >
                            {t.funnel.databaseOptions.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label
                            htmlFor="step2-users"
                            className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
                          >
                            {t.funnel.usersLabel}
                          </label>
                          <select
                            id="step2-users"
                            value={userScale}
                            onChange={(e) => setUserScale(e.target.value as UserScale)}
                            className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-[#090D16] text-slate-900 dark:text-[#F8FAFC] border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:border-[#1E40AF] dark:focus:border-[#3B82F6] cursor-pointer"
                          >
                            {t.funnel.usersOptions.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label
                            htmlFor="step2-plan"
                            className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
                          >
                            {t.funnel.planLabel}
                          </label>
                          <select
                            id="step2-plan"
                            value={interestedPlan}
                            onChange={(e) => setInterestedPlan(e.target.value as PricingPlanId)}
                            className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-[#090D16] text-slate-900 dark:text-[#F8FAFC] border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:border-[#1E40AF] dark:focus:border-[#3B82F6] cursor-pointer"
                          >
                            {t.funnel.planOptions.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="step2-budget"
                          className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
                        >
                          {t.funnel.budgetLabel}
                        </label>
                        <select
                          id="step2-budget"
                          value={monthlyBudget}
                          onChange={(e) => setMonthlyBudget(e.target.value as MonthlyBudget)}
                          className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-[#090D16] text-slate-900 dark:text-[#F8FAFC] border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:border-[#1E40AF] dark:focus:border-[#3B82F6] cursor-pointer"
                        >
                          {t.funnel.budgetOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <fieldset>
                        <legend className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
                          {t.funnel.painLabel}
                        </legend>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {t.funnel.painPoints.map((option, idx) => {
                            const selected = painPointIdx === idx;
                            return (
                              <button
                                key={option}
                                type="button"
                                onClick={() => setPainPointIdx(idx)}
                                aria-pressed={selected}
                                className={`px-3.5 py-2.5 text-left text-xs font-medium rounded-lg border transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E40AF] dark:focus-visible:outline-[#60A5FA] ${
                                  selected
                                    ? 'bg-[#F8FAFC] dark:bg-[#161F33] border-[#1E40AF] dark:border-[#3B82F6] text-[#1E40AF] dark:text-[#93C5FD]'
                                    : 'bg-white dark:bg-[#090D16] border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                                }`}
                              >
                                {option}
                              </button>
                            );
                          })}
                        </div>
                      </fieldset>

                      <div className="space-y-3 pt-1">
                        <div>
                          <label
                            htmlFor="step2-url"
                            className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
                          >
                            {t.funnel.urlLabel}
                          </label>
                          <input
                            ref={appUrlRef}
                            id="step2-url"
                            type="text"
                            inputMode="url"
                            aria-invalid={step2InvalidField === 'url'}
                            value={appUrl}
                            onChange={(e) => {
                              setAppUrl(e.target.value);
                              if (step2Error) {
                                setStep2Error(null);
                                setStep2InvalidField(null);
                              }
                            }}
                            placeholder={t.funnel.urlPlaceholder}
                            className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-[#090D16] text-slate-900 dark:text-[#F8FAFC] placeholder:text-slate-500 dark:placeholder:text-slate-400 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:border-[#1E40AF] dark:focus:border-[#3B82F6] focus:ring-2 focus:ring-[#1E40AF]/15 dark:focus:ring-[#3B82F6]/25"
                          />
                        </div>

                        {appUrl.trim().length > 0 && (
                          <div className="flex items-start gap-2.5">
                            <input
                              ref={ownsRef}
                              id="step2-ownership"
                              type="checkbox"
                              checked={ownsAppConfirmed}
                              aria-invalid={step2InvalidField === 'ownership'}
                              onChange={(e) => {
                                setOwnsAppConfirmed(e.target.checked);
                                if (step2Error) {
                                  setStep2Error(null);
                                  setStep2InvalidField(null);
                                }
                              }}
                              className="mt-0.5 h-4 w-4 rounded border-slate-300 dark:border-slate-700 text-[#1E40AF] focus:ring-[#1E40AF] cursor-pointer shrink-0"
                            />
                            <label
                              htmlFor="step2-ownership"
                              className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed cursor-pointer"
                            >
                              {t.funnel.ownershipCheckbox}
                            </label>
                          </div>
                        )}

                        <div className="flex items-start gap-2.5">
                          <input
                            id="step2-interview"
                            type="checkbox"
                            checked={interviewOptIn}
                            onChange={(e) => setInterviewOptIn(e.target.checked)}
                            className="mt-0.5 h-4 w-4 rounded border-slate-300 dark:border-slate-700 text-[#1E40AF] focus:ring-[#1E40AF] cursor-pointer shrink-0"
                          />
                          <label
                            htmlFor="step2-interview"
                            className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed cursor-pointer"
                          >
                            {t.funnel.interviewCheckbox}
                          </label>
                        </div>
                      </div>

                      {step2Error && (
                        <p
                          role="alert"
                          className="flex items-center gap-1.5 text-xs text-rose-700 dark:text-rose-400"
                        >
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                          <span>{step2Error}</span>
                        </p>
                      )}

                      <div className="pt-1 flex justify-end">
                        <button
                          type="submit"
                          disabled={step2Submitting}
                          className="px-6 py-3 text-sm font-medium text-white bg-[#1E40AF] hover:bg-[#1D4ED8] dark:bg-[#2563EB] dark:hover:bg-[#3B82F6] disabled:opacity-60 rounded-lg transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E40AF] dark:focus-visible:outline-[#60A5FA]"
                        >
                          {step2Submitting ? t.funnel.step2Submitting : t.funnel.step2Submit}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
