import type { PreorderConfig, PreorderOffer } from '../config/preorder';
import {
  PREORDER_TRANSLATIONS,
  formatAmount,
  formatDeliveryDate,
} from '../i18n/preorderTranslations';
import type { Locale } from '../i18n/translations';
import type { PricingPlanId } from '../types/qa';
import type { LegalModalKind } from './LegalModal';

interface PreorderOfferBoxProps {
  locale: Locale;
  planId: PricingPlanId;
  planName: string;
  config: PreorderConfig;
  offer: PreorderOffer;
  onPreorderClick: (planId: PricingPlanId) => void;
  onOpenLegal: (kind: LegalModalKind) => void;
}

const LINK_CLASS =
  'py-0.5 underline underline-offset-4 hover:text-slate-900 dark:hover:text-[#F8FAFC] cursor-pointer rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E40AF] dark:focus-visible:outline-[#60A5FA]';

export function PreorderOfferBox({
  locale,
  planId,
  planName,
  config,
  offer,
  onPreorderClick,
  onOpenLegal,
}: PreorderOfferBoxProps) {
  const p = PREORDER_TRANSLATIONS[locale];
  const amount = formatAmount(offer.amount, config.currency, locale);
  const deliveryDate = formatDeliveryDate(config.deliveryDate, locale);

  return (
    <div className="mt-5 pt-5 border-t border-slate-200 dark:border-slate-800">
      <p className="text-xs font-semibold text-amber-800 dark:text-amber-300">{p.badge}</p>

      <dl className="mt-3 space-y-1.5 text-sm text-slate-700 dark:text-slate-300">
        {[
          [p.itemLabel, p.items[planId]],
          [p.amountLabel, amount],
          [p.deliveryLabel, deliveryDate],
        ].map(([label, value]) => (
          <div key={label} className="flex justify-between gap-4">
            <dt className="text-slate-600 dark:text-slate-400 shrink-0">{label}</dt>
            <dd className="text-right font-medium">{value}</dd>
          </div>
        ))}
      </dl>

      <p className="mt-3 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
        {p.refundSummary(deliveryDate)}
      </p>
      <p className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600 dark:text-slate-400">
        <button type="button" onClick={() => onOpenLegal('terms')} className={LINK_CLASS}>
          {p.termsLink}
        </button>
        <button type="button" onClick={() => onOpenLegal('refund')} className={LINK_CLASS}>
          {p.refundLink}
        </button>
      </p>

      <a
        href={offer.paymentUrl}
        rel="noopener"
        onClick={() => onPreorderClick(planId)}
        aria-label={p.ctaAriaLabel(planName, amount)}
        className="mt-4 flex items-center justify-center w-full px-4 py-3 min-h-[44px] text-sm font-medium rounded-lg border border-[#1E40AF] dark:border-[#60A5FA] text-[#1E40AF] dark:text-[#60A5FA] hover:bg-blue-50 dark:hover:bg-[#161F33] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E40AF] dark:focus-visible:outline-[#60A5FA]"
      >
        {p.cta}
      </a>
    </div>
  );
}
