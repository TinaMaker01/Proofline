import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { ACTIVE_PREORDER } from '../config/preorder';
import { PREORDER_TRANSLATIONS } from '../i18n/preorderTranslations';
import type { Locale, SiteTranslations } from '../i18n/translations';

export type LegalModalKind = 'legal' | 'privacy' | 'contact' | 'terms' | 'refund' | null;

interface LegalModalProps {
  kind: LegalModalKind;
  onClose: () => void;
  locale: Locale;
  t: SiteTranslations;
}

export function LegalModal({ kind, onClose, locale, t }: LegalModalProps) {
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!kind) return;
    closeBtnRef.current?.focus();

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [kind, onClose]);

  if (!kind) return null;

  const p = PREORDER_TRANSLATIONS[locale];
  let title: string;
  let paragraphs: string[];

  switch (kind) {
    case 'legal':
      title = t.legalModals.legalTitle;
      paragraphs = t.legalModals.legalBody;
      break;
    case 'privacy':
      title = t.legalModals.privacyTitle;
      paragraphs = ACTIVE_PREORDER
        ? [...t.legalModals.privacyBody, p.privacyAddendum(ACTIVE_PREORDER.providerName)]
        : t.legalModals.privacyBody;
      break;
    case 'contact':
      title = t.legalModals.contactTitle;
      paragraphs = t.legalModals.contactBody;
      break;
    case 'terms':
    case 'refund':
      // Ces pages n'existent que lorsque la précommande est activée.
      if (!ACTIVE_PREORDER) return null;
      title = kind === 'terms' ? p.termsTitle : p.refundTitle;
      paragraphs =
        kind === 'terms' ? p.termsBody(ACTIVE_PREORDER) : p.refundBody(ACTIVE_PREORDER);
      break;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="legal-modal-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-6 sm:p-7 shadow-xl"
      >
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <h2
            id="legal-modal-title"
            className="font-display text-xl font-semibold text-slate-900 dark:text-[#F8FAFC]"
          >
            {title}
          </h2>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            aria-label={t.legalModals.close}
            className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E40AF] dark:focus-visible:outline-[#60A5FA]"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          {paragraphs.map((text, idx) => (
            <p key={idx}>{text}</p>
          ))}
          {kind === 'contact' && (
            <p className="pt-1 font-mono text-sm text-[#1E40AF] dark:text-[#60A5FA]">
              <a
                href={`mailto:${t.legalModals.contactEmail}`}
                className="hover:underline underline-offset-4"
              >
                {t.legalModals.contactEmail}
              </a>
            </p>
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-white bg-[#1E40AF] hover:bg-[#1D4ED8] dark:bg-[#2563EB] dark:hover:bg-[#3B82F6] rounded-lg cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E40AF] dark:focus-visible:outline-[#60A5FA]"
          >
            {t.legalModals.close}
          </button>
        </div>
      </div>
    </div>
  );
}
