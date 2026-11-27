import { useState } from 'react';
import { AlertTriangle, CheckCircle2, ChevronDown, ShieldAlert, XCircle } from 'lucide-react';
import type { SiteTranslations } from '../i18n/translations';

interface SampleReportProps {
  t: SiteTranslations;
}

const ICON_TONES = {
  pass: { Icon: CheckCircle2, className: 'text-emerald-700 dark:text-emerald-400' },
  warn: { Icon: AlertTriangle, className: 'text-amber-700 dark:text-amber-400' },
  fail: { Icon: XCircle, className: 'text-rose-700 dark:text-rose-400' },
} as const;

function StatusIcon({ status }: { status: keyof typeof ICON_TONES }) {
  const { Icon, className } = ICON_TONES[status];
  return <Icon className={`w-4 h-4 shrink-0 ${className}`} aria-hidden="true" />;
}

// Extraits fictifs : le même fichier, avant et après le correctif.
const CODE_BEFORE = `// CheckoutForm.tsx
const stripe = new Stripe(STRIPE_SECRET);
await stripe.charges.create(order);`;

const CODE_AFTER = `// CheckoutForm.tsx
await fetch('/api/checkout', {
  method: 'POST',
  body: JSON.stringify({ planId }),
});`;

export function SampleReport({ t }: SampleReportProps) {
  const copy = t.sampleReport;
  const [open, setOpen] = useState(false);

  return (
    <section
      id="sample-report"
      className="scroll-mt-20 py-20 lg:py-24 bg-[#F8FAFC] dark:bg-[#090D16] border-t border-slate-200 dark:border-slate-800/90 transition-colors duration-150"
    >
      <div className="max-w-4xl mx-auto px-6 lg:px-10">
        <h2
          className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-[#F8FAFC]"
          style={{ textWrap: 'balance' }}
        >
          {copy.heading}
        </h2>
        <p className="mt-4 max-w-[60ch] text-base text-slate-600 dark:text-slate-300 leading-relaxed">
          {copy.intro}
        </p>

        <h3 className="mt-10 font-display text-xl font-semibold tracking-tight text-slate-900 dark:text-[#F8FAFC]">
          {copy.fixDemo.title}
        </h3>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              title: copy.fixDemo.beforeTitle,
              caption: copy.fixDemo.beforeCaption,
              code: CODE_BEFORE,
              Icon: XCircle,
              tone: 'text-rose-700 dark:text-rose-400',
              border: 'border-rose-300 dark:border-rose-500/40',
            },
            {
              title: copy.fixDemo.afterTitle,
              caption: copy.fixDemo.afterCaption,
              code: CODE_AFTER,
              Icon: CheckCircle2,
              tone: 'text-emerald-700 dark:text-emerald-400',
              border: 'border-emerald-300 dark:border-emerald-500/40',
            },
          ].map(({ title, caption, code, Icon, tone, border }) => (
            <figure
              key={title}
              className={`min-w-0 flex flex-col rounded-xl border bg-white dark:bg-[#111827] ${border}`}
            >
              <figcaption className="px-5 pt-4">
                <span className={`flex items-center gap-2 text-sm font-semibold ${tone}`}>
                  <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                  {title}
                </span>
                <span className="mt-1.5 block text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {caption}
                </span>
              </figcaption>
              <pre
                tabIndex={0}
                className="overflow-x-auto px-5 py-4 font-mono text-xs leading-relaxed text-slate-800 dark:text-slate-200 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#1E40AF] dark:focus-visible:outline-[#60A5FA]"
              >
                <code>{code}</code>
              </pre>
            </figure>
          ))}
        </div>

        <details
          className="group mt-8 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] overflow-hidden"
          onToggle={(e) => setOpen(e.currentTarget.open)}
        >
          <summary className="list-none [&::-webkit-details-marker]:hidden flex items-center justify-between gap-4 px-5 sm:px-7 py-4 min-h-[56px] cursor-pointer text-sm font-semibold text-[#1E40AF] dark:text-[#60A5FA] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#1E40AF] dark:focus-visible:outline-[#60A5FA]">
            <span>{open ? copy.closeLabel : copy.openLabel}</span>
            <ChevronDown
              className="w-4 h-4 shrink-0 transition-transform duration-150 group-open:rotate-180"
              aria-hidden="true"
            />
          </summary>

          <div className="border-t border-slate-200 dark:border-slate-800 px-5 sm:px-7 py-6">
            <p className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
              <span className="font-mono text-xs text-slate-600 dark:text-slate-400 break-all">
                {copy.appLabel}
              </span>
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-rose-700 dark:text-rose-400">
                <ShieldAlert className="w-4 h-4" aria-hidden="true" />
                {t.studio.readinessLabels['High Risk']}
              </span>
            </p>
            <p className="mt-4 max-w-[65ch] text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
              {copy.summary}
            </p>

            <ol className="mt-6 divide-y divide-slate-200 dark:divide-slate-800 border-t border-slate-200 dark:border-slate-800">
              {copy.findings.map((finding) => (
                <li key={finding.title} className="py-6">
                  <p
                    className={`flex items-center gap-2 text-xs font-semibold ${
                      finding.severity === 'Critical'
                        ? 'text-rose-700 dark:text-rose-400'
                        : 'text-amber-700 dark:text-amber-400'
                    }`}
                  >
                    {finding.severity === 'Critical' ? (
                      <ShieldAlert className="w-4 h-4" aria-hidden="true" />
                    ) : (
                      <AlertTriangle className="w-4 h-4" aria-hidden="true" />
                    )}
                    {t.studio.severityLabels[finding.severity]}
                  </p>
                  <h3 className="mt-2 font-display text-lg font-semibold text-slate-900 dark:text-[#F8FAFC] leading-snug">
                    {finding.title}
                  </h3>
                  <dl className="mt-3 space-y-2 text-sm leading-relaxed">
                    {[
                      [copy.evidenceLabel, finding.evidence],
                      [copy.impactLabel, finding.impact],
                    ].map(([label, value]) => (
                      <div key={label}>
                        <dt className="inline font-semibold text-slate-900 dark:text-[#F8FAFC]">
                          {label}{' '}
                        </dt>
                        <dd className="inline text-slate-600 dark:text-slate-300 break-words">
                          {value}
                        </dd>
                      </div>
                    ))}
                    <div>
                      <dt className="font-semibold text-slate-900 dark:text-[#F8FAFC]">
                        {copy.fixLabel}
                      </dt>
                      <dd className="mt-1.5 font-mono text-xs leading-relaxed text-slate-700 dark:text-slate-200 bg-[#F8FAFC] dark:bg-[#090D16] rounded-lg p-3.5 break-words">
                        {finding.fix}
                      </dd>
                    </div>
                  </dl>
                </li>
              ))}
            </ol>

            <h3 className="pt-6 border-t border-slate-200 dark:border-slate-800 font-display text-base font-semibold text-slate-900 dark:text-[#F8FAFC]">
              {copy.flowHeading}
            </h3>
            <ul className="mt-3 space-y-2.5 text-xs">
              {copy.flowSteps.map((row) => (
                <li key={row.step} className="flex flex-wrap items-center gap-x-4 gap-y-1">
                  <span className="flex items-center gap-2 font-medium text-slate-900 dark:text-[#F8FAFC]">
                    <StatusIcon status={row.status} />
                    {row.step}
                  </span>
                  <span className="font-mono tabular-nums text-slate-600 dark:text-slate-400">
                    1440px → {row.desktop} · 390px → {row.mobile}
                  </span>
                </li>
              ))}
            </ul>

            <h3 className="mt-6 font-display text-base font-semibold text-slate-900 dark:text-[#F8FAFC]">
              {copy.diffHeading}
            </h3>
            <ul className="mt-3 space-y-2.5 text-xs">
              {copy.diffs.map((row) => (
                <li key={row.check} className="flex flex-wrap items-center gap-x-4 gap-y-1">
                  <span className="flex items-center gap-2 font-medium text-slate-900 dark:text-[#F8FAFC]">
                    <StatusIcon status={row.status} />
                    {row.check}
                  </span>
                  <span className="font-mono tabular-nums text-slate-600 dark:text-slate-400">
                    {copy.beforeLabel} {row.before} · {copy.afterLabel} {row.after}
                  </span>
                </li>
              ))}
            </ul>

            <p className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {copy.limits}
            </p>
          </div>
        </details>
      </div>
    </section>
  );
}
