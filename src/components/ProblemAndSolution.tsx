import { AlertTriangle, EyeOff, UserX } from 'lucide-react';
import type { SiteTranslations } from '../i18n/translations';

interface ProblemAndSolutionProps {
  t: SiteTranslations;
}

const FEAR_ICONS = [AlertTriangle, EyeOff, UserX] as const;

export function ProblemAndSolution({ t }: ProblemAndSolutionProps) {
  return (
    <section
      id="problem"
      className="scroll-mt-20 py-20 lg:py-24 bg-[#F8FAFC] dark:bg-[#090D16] border-t border-slate-200 dark:border-slate-800/90 transition-colors duration-150"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10 space-y-20">
        {/* S3 — Le problème (3 peurs) */}
        <div>
          <div className="max-w-2xl">
            <h2
              className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-[#F8FAFC]"
              style={{ textWrap: 'balance' }}
            >
              {t.problemSolution.problemHeading}
            </h2>
            <p className="mt-4 max-w-[54ch] text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              {t.problemSolution.problemSubheading}
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {t.problemSolution.fears.map((fear, idx) => {
              const Icon = FEAR_ICONS[idx % FEAR_ICONS.length];
              return (
                <article
                  key={fear.title}
                  className="p-6 sm:p-7 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col gap-3"
                >
                  <Icon
                    className="w-5 h-5 text-amber-700 dark:text-amber-400 shrink-0"
                    aria-hidden="true"
                  />
                  <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-[#F8FAFC] leading-snug">
                    {fear.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {fear.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>

        {/* S4 — La solution (3 étapes) & S6 — Pour qui */}
        <div className="pt-14 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-6 space-y-6">
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-[#F8FAFC]">
              {t.problemSolution.solutionHeading}
            </h2>
            <div className="divide-y divide-slate-200 dark:divide-slate-800 border-y border-slate-200 dark:border-slate-800">
              {t.problemSolution.solutionSteps.map((step) => (
                <div key={step.title} className="py-5">
                  <h3 className="font-display text-base font-semibold text-slate-900 dark:text-[#F8FAFC]">
                    {step.title}
                  </h3>
                  <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-6 space-y-6">
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-[#F8FAFC]">
              {t.problemSolution.audienceHeading}
            </h2>
            <div className="divide-y divide-slate-200 dark:divide-slate-800 border-y border-slate-200 dark:border-slate-800">
              {t.problemSolution.audiences.map((aud) => (
                <div key={aud.title} className="py-5">
                  <h3 className="font-display text-base font-semibold text-slate-900 dark:text-[#F8FAFC]">
                    {aud.title}
                  </h3>
                  <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {aud.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
