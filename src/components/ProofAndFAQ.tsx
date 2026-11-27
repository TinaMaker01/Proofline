import { useState } from 'react';
import { ChevronDown, CheckCircle2, ShieldCheck } from 'lucide-react';
import { ACTIVE_PREORDER } from '../config/preorder';
import { PREORDER_TRANSLATIONS } from '../i18n/preorderTranslations';
import type { Locale, SiteTranslations } from '../i18n/translations';
import type { PricingPlanId } from '../types/qa';
import type { LegalModalKind } from './LegalModal';
import { PreorderOfferBox } from './PreorderOfferBox';

interface ProofAndFAQProps {
  locale: Locale;
  t: SiteTranslations;
  onPreorderClick: (planId: PricingPlanId) => void;
  onOpenLegal: (kind: LegalModalKind) => void;
  interestedPlan: PricingPlanId | null;
  onSelectPricingInterest: (planId: PricingPlanId) => void;
}

export function ProofAndFAQ({
  locale,
  t,
  onPreorderClick,
  onOpenLegal,
  interestedPlan,
  onSelectPricingInterest,
}: ProofAndFAQProps) {
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  // Les mentions « aucun paiement » ne sont remplacées que si un achat est réellement proposé.
  const preorderCopy =
    ACTIVE_PREORDER && Object.keys(ACTIVE_PREORDER.offers).length > 0
      ? PREORDER_TRANSLATIONS[locale]
      : null;

  return (
    <>
      {/* S8 — Preuve et confiance honnête (sans faux témoignages) */}
      <section
        id="proof"
        className="scroll-mt-20 py-14 lg:py-16 bg-white dark:bg-[#0D1321] border-t border-slate-200 dark:border-slate-800/90 transition-colors duration-150"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="max-w-2xl">
            <h2
              className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-[#F8FAFC]"
              style={{ textWrap: 'balance' }}
            >
              {t.proofPricingFaq.trustHeading}
            </h2>
            <p className="mt-3 max-w-[54ch] text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              {t.proofPricingFaq.trustSubheading}
            </p>
          </div>

          <ul className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
            {t.proofPricingFaq.trustCards.map((card) => (
              <li key={card.title} className="flex items-start gap-3.5">
                <ShieldCheck
                  className="w-5 h-5 mt-0.5 text-[#1E40AF] dark:text-[#60A5FA] shrink-0"
                  aria-hidden="true"
                />
                <div className="min-w-0">
                  <h3 className="font-display text-base font-semibold text-slate-900 dark:text-[#F8FAFC]">
                    {card.title}
                  </h3>
                  <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {card.detail}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* S9 — Tarification indicative (test de prix) */}
      <section
        id="pricing"
        className="scroll-mt-20 py-20 lg:py-24 bg-[#F8FAFC] dark:bg-[#090D16] border-t border-slate-200 dark:border-slate-800/90 transition-colors duration-150"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="max-w-2xl">
            <h2
              className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-[#F8FAFC]"
              style={{ textWrap: 'balance' }}
            >
              {t.proofPricingFaq.pricingHeading}
            </h2>
            <p className="mt-3 max-w-[54ch] text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              {preorderCopy?.pricingSubheading ?? t.proofPricingFaq.pricingSubheading}
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {t.proofPricingFaq.pricingPlans.map((plan) => {
              const isSelected = interestedPlan === plan.id;
              const offer = ACTIVE_PREORDER?.offers[plan.id];
              return (
                <article
                  key={plan.id}
                  className={`p-7 rounded-xl border flex flex-col transition-colors ${
                    // Avec des encadrés précommande de hauteurs inégales, les boutons suivent la liste.
                    preorderCopy ? 'justify-start' : 'justify-between'
                  } ${
                    isSelected
                      ? 'bg-white dark:bg-[#161F33] border-[#1E40AF] dark:border-[#3B82F6]'
                      : 'bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div>
                    <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-[#F8FAFC]">
                      {plan.name}
                    </h3>
                    <div className="mt-3 flex items-baseline gap-2">
                      <span className="font-display text-3xl font-bold text-slate-900 dark:text-[#F8FAFC] tabular-nums">
                        {plan.priceRange}
                      </span>
                      <span className="text-xs text-slate-600 dark:text-slate-400">
                        {plan.cadence}
                      </span>
                    </div>
                    <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {plan.description}
                    </p>

                    <ul className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800 space-y-2.5 text-sm text-slate-700 dark:text-slate-300">
                      {plan.bullets.map((bullet) => (
                        <li key={bullet} className="flex items-start gap-2">
                          <CheckCircle2
                            className="w-4 h-4 text-[#1E40AF] dark:text-[#60A5FA] shrink-0 mt-0.5"
                            aria-hidden="true"
                          />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-8">
                    <button
                      type="button"
                      onClick={() => onSelectPricingInterest(plan.id)}
                      aria-pressed={isSelected}
                      className={`w-full px-4 py-3 min-h-[44px] text-sm font-medium rounded-lg transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E40AF] dark:focus-visible:outline-[#60A5FA] ${
                        isSelected
                          ? 'bg-emerald-700 dark:bg-emerald-600 text-white'
                          : 'bg-[#1E40AF] hover:bg-[#1D4ED8] dark:bg-[#2563EB] dark:hover:bg-[#3B82F6] text-white'
                      }`}
                    >
                      {isSelected ? plan.ctaRecorded : plan.cta}
                    </button>
                    {ACTIVE_PREORDER && offer && (
                      <PreorderOfferBox
                        locale={locale}
                        planId={plan.id}
                        planName={plan.name}
                        config={ACTIVE_PREORDER}
                        offer={offer}
                        onPreorderClick={onPreorderClick}
                        onOpenLegal={onOpenLegal}
                      />
                    )}
                  </div>
                </article>
              );
            })}
          </div>

          <p className="mt-6 text-xs text-slate-600 dark:text-slate-400">
            {preorderCopy?.pricingDisclaimer ?? t.proofPricingFaq.pricingDisclaimer}
          </p>
        </div>
      </section>

      {/* S10 — FAQ */}
      <section
        id="faq"
        className="scroll-mt-20 py-20 lg:py-24 bg-white dark:bg-[#0D1321] border-t border-slate-200 dark:border-slate-800/90 transition-colors duration-150"
      >
        <div className="max-w-4xl mx-auto px-6 lg:px-10">
          <div className="max-w-2xl">
            <h2
              className="font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-[#F8FAFC]"
              style={{ textWrap: 'balance' }}
            >
              {t.proofPricingFaq.faqHeading}
            </h2>
          </div>

          <div className="mt-10 divide-y divide-slate-200 dark:divide-slate-800 border-y border-slate-200 dark:border-slate-800">
            {t.proofPricingFaq.faqItems.map((item, idx) => {
              const isOpen = openIdx === idx;
              const triggerId = `faq-trigger-${idx}`;
              const panelId = `faq-panel-${idx}`;
              return (
                <div key={item.question}>
                  <h3 className="m-0">
                    <button
                      id={triggerId}
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      onClick={() => setOpenIdx(isOpen ? null : idx)}
                      className="group w-full py-5 flex items-center justify-between gap-6 text-left cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E40AF] dark:focus-visible:outline-[#60A5FA] rounded-sm"
                    >
                      <span className="font-display text-base sm:text-lg font-semibold text-slate-900 dark:text-[#F8FAFC] group-hover:text-[#1E40AF] dark:group-hover:text-[#60A5FA] transition-colors">
                        {item.question}
                      </span>
                      <ChevronDown
                        aria-hidden="true"
                        className={`w-5 h-5 text-slate-500 dark:text-slate-400 shrink-0 transition-transform duration-150 ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                  </h3>
                  {isOpen && (
                    <div
                      id={panelId}
                      role="region"
                      aria-labelledby={triggerId}
                      className="pb-6 pr-8 max-w-[54ch] text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed"
                    >
                      {item.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
