import { useState } from 'react';
import { X } from 'lucide-react';
import type { PreorderConfig } from '../config/preorder';
import { PREORDER_TRANSLATIONS, formatDeliveryDate } from '../i18n/preorderTranslations';
import type { Locale } from '../i18n/translations';

const QUERY_KEY = 'preorder';

function readReturnStatus(): 'success' | 'cancel' | null {
  const value = new URLSearchParams(window.location.search).get(QUERY_KEY);
  return value === 'success' || value === 'cancel' ? value : null;
}

interface PreorderReturnNoticeProps {
  locale: Locale;
  config: PreorderConfig;
}

/**
 * Message affiché au retour de la page de paiement. Purement informatif : l'URL est
 * falsifiable, seul le prestataire (reçu / webhook) confirme un paiement (§6.6.1).
 */
export function PreorderReturnNotice({ locale, config }: PreorderReturnNoticeProps) {
  const [status, setStatus] = useState(readReturnStatus);

  if (!status) return null;

  const p = PREORDER_TRANSLATIONS[locale];
  const isSuccess = status === 'success';
  const paragraphs = isSuccess
    ? p.successBody(formatDeliveryDate(config.deliveryDate, locale), config.providerName)
    : [p.cancelBody];

  function dismiss() {
    const url = new URL(window.location.href);
    url.searchParams.delete(QUERY_KEY);
    window.history.replaceState(null, '', url);
    setStatus(null);
  }

  return (
    <section
      aria-labelledby="preorder-return-title"
      className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827]"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-6 flex items-start justify-between gap-4">
        <div>
          <h2
            id="preorder-return-title"
            className="font-display text-xl font-semibold text-slate-900 dark:text-[#F8FAFC]"
          >
            {isSuccess ? p.successTitle : p.cancelTitle}
          </h2>
          <div className="mt-2 space-y-2 max-w-[54ch] text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {paragraphs.map((text) => (
              <p key={text}>{text}</p>
            ))}
            <p>
              <a
                href={`mailto:${config.sellerEmail}`}
                className="font-mono text-[#1E40AF] dark:text-[#60A5FA] hover:underline underline-offset-4"
              >
                {config.sellerEmail}
              </a>
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label={p.dismiss}
          className="inline-flex shrink-0 items-center justify-center w-11 h-11 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E40AF] dark:focus-visible:outline-[#60A5FA]"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}
