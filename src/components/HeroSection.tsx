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
import type { LeadStep1Response, UtmParams } from '../types/qa';
import { WaitlistSuccessBurst } from './WaitlistSuccessBurst';
import { submitLeadStep1 } from '../services/qaClient';
import type { Locale, SiteTranslations } from '../i18n/translations';
import type { LegalModalKind } from './LegalModal';

interface HeroSectionProps {
  locale: Locale;
  t: SiteTranslations;
  utm: UtmParams;
  activeLead: LeadStep1Response | null;
  onStep1Success: (res: LeadStep1Response) => void;
  onResetLead: () => void;
  onJumpToStep2: () => void;
  onJumpToLiveAudit: () => void;
  onOpenLegal: (kind: LegalModalKind) => void;
}

export function HeroSection({
  locale,
  t,
  utm,
  activeLead,
  onStep1Success,
  onResetLead,
  onJumpToStep2,
  onJumpToLiveAudit,
  onOpenLegal,
}: HeroSectionProps) {
  const [email, setEmail] = useState('');
  const [consentGdpr, setConsentGdpr] = useState(false);
  const [honeypot, setHoneypot] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [invalidField, setInvalidField] = useState<'email' | 'gdpr' | null>(null);
  const emailRef = useRef<HTMLInputElement | null>(null);
  const gdprRef = useRef<HTMLInputElement | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setInvalidField(null);

    const trimmed = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmed)) {
      setError(t.hero.emailError);
      setInvalidField('email');
      emailRef.current?.focus();
      return;
    }

    if (!consentGdpr) {
      setError(t.hero.gdprError);
      setInvalidField('gdpr');
      gdprRef.current?.focus();
      return;
    }

    setSubmitting(true);
    try {
      const data = await submitLeadStep1({
        email: trimmed,
        consentGdpr: true,
        source: 'hero',
        locale,
        companyWebsite: honeypot,
        ...utm,
      });
      onStep1Success(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.hero.fallbackError);
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
              {t.hero.headline}
            </h1>

            <p className="mt-6 text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-[60ch]">
              {t.hero.subheadline}
            </p>

            <div className="mt-8 max-w-xl">
              {activeLead ? (
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
                  <div className="min-w-0 flex-1 space-y-2">
                    <p className="text-sm font-semibold text-slate-900 dark:text-[#F8FAFC]">
                      {activeLead.alreadyRegistered ? t.hero.confirmedAlready : t.hero.confirmedNew}{' '}
                      <span className="font-mono font-normal text-slate-700 dark:text-slate-300 break-all">
                        ({activeLead.entry.email})
                      </span>
                    </p>
                    {activeLead.welcomeEmailSent && (
                      <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                        {t.hero.welcomeEmailNotice}
                      </p>
                    )}
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                      {t.hero.nextStepsLine}
                    </p>
                    <div className="pt-1 flex flex-wrap items-center gap-4 text-xs">
                      <button
                        type="button"
                        onClick={onJumpToStep2}
                        className="inline-flex items-center gap-1 font-medium text-[#1E40AF] dark:text-[#60A5FA] hover:underline underline-offset-4 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E40AF] dark:focus-visible:outline-[#60A5FA] rounded-sm"
                      >
                        <span>{t.hero.completeStep2Cta}</span>
                        <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEmail('');
                          setConsentGdpr(false);
                          setError(null);
                          onResetLead();
                        }}
                        className="font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:underline underline-offset-4 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E40AF] dark:focus-visible:outline-[#60A5FA] rounded-sm"
                      >
                        {t.hero.registerAnother}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="space-y-3">
                  {/* Anti-spam honeypot field */}
                  <div className="sr-only" aria-hidden="true">
                    <label htmlFor="hero-company-website">Website</label>
                    <input
                      id="hero-company-website"
                      type="text"
                      tabIndex={-1}
                      autoComplete="off"
                      value={honeypot}
                      onChange={(e) => setHoneypot(e.target.value)}
                    />
                  </div>

                  {/* Step 1: Single email field + button */}
                  <div className="flex flex-col sm:flex-row gap-2.5">
                    <div className="flex-1 min-w-0">
                      <label htmlFor="hero-email" className="sr-only">
                        {t.hero.emailLabel}
                      </label>
                      <input
                        ref={emailRef}
                        id="hero-email"
                        type="email"
                        required
                        autoComplete="email"
                        aria-invalid={invalidField === 'email'}
                        aria-describedby={
                          error && invalidField === 'email' ? 'hero-form-error' : undefined
                        }
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (error) {
                            setError(null);
                            setInvalidField(null);
                          }
                        }}
                        placeholder={t.hero.emailPlaceholder}
                        className={`w-full px-4 py-3 min-h-[46px] text-sm bg-white dark:bg-[#111827] text-slate-900 dark:text-[#F8FAFC] placeholder:text-slate-500 dark:placeholder:text-slate-400 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                          invalidField === 'email'
                            ? 'border-rose-500 dark:border-rose-500 focus:border-rose-600 focus:ring-rose-500/20'
                            : 'border-slate-300 dark:border-slate-700 focus:border-[#1E40AF] dark:focus:border-[#3B82F6] focus:ring-[#1E40AF]/15 dark:focus:ring-[#3B82F6]/25'
                        }`}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-5 py-3 min-h-[46px] text-sm font-medium text-white bg-[#1E40AF] hover:bg-[#1D4ED8] dark:bg-[#2563EB] dark:hover:bg-[#3B82F6] disabled:opacity-60 active:scale-[0.99] rounded-lg transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E40AF] dark:focus-visible:outline-[#60A5FA]"
                    >
                      {submitting ? t.hero.submitting : t.hero.submit}
                    </button>
                  </div>

                  {/* GDPR explicit consent (Annexe B) */}
                  <div className="flex items-start gap-2.5 pt-0.5">
                    <input
                      ref={gdprRef}
                      id="hero-gdpr-consent"
                      type="checkbox"
                      checked={consentGdpr}
                      aria-invalid={invalidField === 'gdpr'}
                      aria-describedby={
                        error && invalidField === 'gdpr' ? 'hero-form-error' : undefined
                      }
                      onChange={(e) => {
                        setConsentGdpr(e.target.checked);
                        if (error) {
                          setError(null);
                          setInvalidField(null);
                        }
                      }}
                      className="mt-0.5 h-4 w-4 rounded border-slate-300 dark:border-slate-700 text-[#1E40AF] focus:ring-[#1E40AF] cursor-pointer shrink-0"
                    />
                    <label
                      htmlFor="hero-gdpr-consent"
                      className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed cursor-pointer"
                    >
                      {t.hero.gdprLabelPrefix}{' '}
                      <button
                        type="button"
                        onClick={() => onOpenLegal('privacy')}
                        className="font-medium text-[#1E40AF] dark:text-[#60A5FA] hover:underline underline-offset-4 cursor-pointer"
                      >
                        {t.hero.gdprPrivacyLink}
                      </button>
                      {t.hero.gdprLabelSuffix}
                    </label>
                  </div>

                  {error && (
                    <p
                      id="hero-form-error"
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
                      <span>{t.hero.reassurance}</span>
                    </span>
                    <span aria-hidden="true" className="hidden sm:inline text-slate-300 dark:text-slate-700">
                      ·
                    </span>
                    <button
                      type="button"
                      onClick={onJumpToLiveAudit}
                      className="min-h-[44px] inline-flex items-center gap-1 font-medium text-[#1E40AF] hover:text-[#1D4ED8] dark:text-[#60A5FA] dark:hover:text-[#93C5FD] hover:underline underline-offset-4 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E40AF] dark:focus-visible:outline-[#60A5FA] rounded-sm"
                    >
                      <span>{t.hero.jumpToAudit}</span>
                      <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* S7 — Aperçu stylisé d'un rapport d'audit */}
          <div className="lg:col-span-5">
            <div
              role="group"
              aria-label={t.hero.workbenchAria}
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
                  {t.hero.highRisk}
                </span>
              </div>

              <div className="divide-y divide-slate-200 dark:divide-slate-800">
                {t.hero.checks.map((item) => (
                  <div key={item.area} className="px-5 py-4 flex items-start gap-3">
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
                    {t.hero.promptHeader}
                  </span>
                  <button
                    type="button"
                    onClick={onJumpToLiveAudit}
                    className="inline-flex items-center justify-end min-h-[44px] text-xs font-medium text-[#1E40AF] dark:text-[#60A5FA] hover:underline underline-offset-4 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E40AF] dark:focus-visible:outline-[#60A5FA] rounded-sm"
                  >
                    {t.hero.runLiveCheck}
                  </button>
                </div>
                <p className="font-mono text-xs text-slate-800 dark:text-slate-200 leading-relaxed">
                  {t.hero.promptBody}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
