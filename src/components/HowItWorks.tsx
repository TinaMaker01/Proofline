import { Gauge, KeyRound, MessageSquareText, Route } from 'lucide-react';
import type { SiteTranslations } from '../i18n/translations';

interface HowItWorksProps {
  t: SiteTranslations;
}

// Même ordre que `howItWorks.detections`.
const DETECTION_ICONS = [KeyRound, Route, Gauge, MessageSquareText] as const;

export function HowItWorks({ t }: HowItWorksProps) {
  const copy = t.howItWorks;

  return (
    <section
      id="how-it-works"
      className="scroll-mt-20 py-20 lg:py-28 bg-white dark:bg-[#0D1321] border-t border-slate-200 dark:border-slate-800/90 transition-colors duration-150"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="max-w-2xl">
          <h2
            className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-[#F8FAFC]"
            style={{ textWrap: 'balance' }}
          >
            {copy.heading}
          </h2>
          <p className="mt-4 max-w-[60ch] text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            {copy.subheading}
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 lg:grid-cols-12 gap-x-12 gap-y-6">
          <h3 className="lg:col-span-4 font-display text-xl sm:text-2xl font-semibold tracking-tight text-slate-900 dark:text-[#F8FAFC]">
            {copy.detectHeading}
          </h3>
          <ul className="lg:col-span-8 divide-y divide-slate-200 dark:divide-slate-800 border-y border-slate-200 dark:border-slate-800">
            {copy.detections.map((item, idx) => {
              const Icon = DETECTION_ICONS[idx % DETECTION_ICONS.length];
              return (
                <li key={item.title} className="py-5 flex items-start gap-4">
                  <Icon
                    className="w-5 h-5 mt-0.5 shrink-0 text-[#1E40AF] dark:text-[#60A5FA]"
                    aria-hidden="true"
                  />
                  <div className="min-w-0">
                    <h4 className="font-display text-base font-semibold text-slate-900 dark:text-[#F8FAFC]">
                      {item.title}
                    </h4>
                    <p className="mt-1 max-w-[65ch] text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <h3 className="mt-16 font-display text-xl sm:text-2xl font-semibold tracking-tight text-slate-900 dark:text-[#F8FAFC]">
          {copy.stepsHeading}
        </h3>
        <ol className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
          {copy.steps.map((step) => (
            <li key={step.title} className="pt-4 border-t-2 border-[#1E40AF] dark:border-[#3B82F6]">
              <h4 className="font-display text-base font-semibold text-slate-900 dark:text-[#F8FAFC]">
                {step.title}
              </h4>
              <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {step.description}
              </p>
            </li>
          ))}
        </ol>

        <h3 className="mt-16 font-display text-xl sm:text-2xl font-semibold tracking-tight text-slate-900 dark:text-[#F8FAFC]">
          {copy.audienceHeading}
        </h3>
        <dl className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-5">
          {copy.audiences.map((audience) => (
            <div key={audience.title}>
              <dt className="text-sm font-semibold text-slate-900 dark:text-[#F8FAFC]">
                {audience.title}
              </dt>
              <dd className="mt-1 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {audience.description}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
