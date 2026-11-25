import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { SiteTranslations } from '../i18n/translations';

interface ProofAndFAQProps {
  t: SiteTranslations;
}

export function ProofAndFAQ({ t }: ProofAndFAQProps) {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <>
      <section
        id="proof"
        className="scroll-mt-20 py-20 lg:py-28 bg-white dark:bg-[#0D1321] border-t border-slate-200 dark:border-slate-800/90 transition-colors duration-150"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="max-w-2xl">
            <h2
              className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-[#F8FAFC]"
              style={{ textWrap: 'balance' }}
            >
              {t.proofFaq.proofHeading}
            </h2>
            <p className="mt-3 max-w-[54ch] text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              {t.proofFaq.proofSubheading}
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {t.proofFaq.caseStudies.map((study) => (
              <article
                key={study.name}
                className="p-7 bg-[#F8FAFC] dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col justify-between"
              >
                <div>
                  <p
                    className="font-display text-lg font-semibold text-slate-900 dark:text-[#F8FAFC] tabular-nums"
                    style={{ textWrap: 'balance' }}
                  >
                    {study.metric}
                  </p>
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                    <span>{study.timeframe}</span>
                    <span aria-hidden="true" className="mx-2 text-slate-300 dark:text-slate-700">
                      ·
                    </span>
                    <span>{study.stack}</span>
                  </p>
                  <p className="mt-5 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    “{study.quote}”
                  </p>
                </div>

                <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800">
                  <p className="text-sm font-semibold text-slate-900 dark:text-[#F8FAFC]">
                    {study.name}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                    {study.role}, {study.company}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="faq"
        className="scroll-mt-20 py-20 lg:py-24 bg-[#F8FAFC] dark:bg-[#090D16] border-t border-slate-200 dark:border-slate-800/90 transition-colors duration-150"
      >
        <div className="max-w-4xl mx-auto px-6 lg:px-10">
          <div className="max-w-2xl">
            <h2
              className="font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-[#F8FAFC]"
              style={{ textWrap: 'balance' }}
            >
              {t.proofFaq.faqHeading}
            </h2>
          </div>

          <div className="mt-10 divide-y divide-slate-200 dark:divide-slate-800 border-y border-slate-200 dark:border-slate-800">
            {t.proofFaq.faqItems.map((item, idx) => {
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
