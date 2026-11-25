import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

const FLOW_TRACE_STEPS = [
  { step: 'Sign up (/signup)', desktop: '200 OK · 1.1s', mobile: '200 OK', status: 'pass' },
  { step: 'Verify session', desktop: 'JWT scoped', mobile: 'JWT scoped', status: 'pass' },
  { step: 'Stripe checkout', desktop: '200 OK · 1.4s', mobile: 'CTA clipped at 390px', status: 'warn' },
] as const;

const REGRESSION_DIFFS = [
  { check: 'Auth redirect (/dashboard)', baseline: '200 OK', preview: '200 OK', status: 'pass' },
  { check: 'POST /api/checkout', baseline: '200 OK', preview: '500 · missing STRIPE_WEBHOOK_SECRET', status: 'fail' },
  { check: 'Public bundle scan', baseline: '0 secrets', preview: '0 secrets', status: 'pass' },
] as const;

export function CapabilitiesBento() {
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
            AI tools move fast. Silent regressions move faster.
          </h2>
          <p className="mt-4 max-w-[54ch] text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            Fixing a button on your pricing page shouldn’t break Stripe webhooks or expose your user
            table. Proofline watches every change so non-technical builders ship with engineering
            rigor.
          </p>
        </div>

        {/* Asymmetric 3-column Bento Grid */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Wide Span — Continuous Flow Verification */}
          <article className="lg:col-span-2 bg-[#F8FAFC] dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden flex flex-col justify-between">
            <div className="p-7 sm:p-8">
              <h3 className="font-display text-2xl font-semibold tracking-tight text-slate-900 dark:text-[#F8FAFC]">
                Continuous Flow Verification
              </h3>
              <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">
                Every time you regenerate a screen or merge an edit, headless browsers walk through
                account creation, login, forms, and checkout across desktop and mobile viewports. If
                a button stops responding or a redirect loops, you know in under 90 seconds.
              </p>
            </div>
            <div className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#090D16] divide-y divide-slate-200 dark:divide-slate-800">
              {FLOW_TRACE_STEPS.map((row) => (
                <div
                  key={row.step}
                  className="px-7 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-x-6 gap-y-1.5 text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {row.status === 'pass' ? (
                      <CheckCircle2
                        className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0"
                        aria-hidden="true"
                      />
                    ) : (
                      <AlertTriangle
                        className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0"
                        aria-hidden="true"
                      />
                    )}
                    <span className="font-medium text-slate-900 dark:text-[#F8FAFC]">
                      {row.step}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono tabular-nums">
                    <span className="text-slate-600 dark:text-slate-400">
                      1440px: {row.desktop}
                    </span>
                    <span
                      className={
                        row.status === 'warn'
                          ? 'text-amber-700 dark:text-amber-400 font-medium'
                          : 'text-slate-600 dark:text-slate-400'
                      }
                    >
                      390px: {row.mobile}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </article>

          {/* Narrow Span — Exposure & Secret Guard */}
          <article className="lg:col-span-1 bg-[#F8FAFC] dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-7 sm:p-8 flex flex-col justify-between">
            <div>
              <h3 className="font-display text-2xl font-semibold tracking-tight text-slate-900 dark:text-[#F8FAFC]">
                Exposure & Secret Guard
              </h3>
              <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                AI code generators frequently ship client-side API keys, permissive database rules,
                or unprotected admin endpoints. Proofline scans your live build and network traffic
                to make sure private data stays private.
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 space-y-3 text-sm text-slate-700 dark:text-slate-200">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5">
                <span>Client bundle key scan</span>
                <span className="font-mono text-xs text-slate-600 dark:text-slate-400 shrink-0">
                  Every deploy
                </span>
              </div>
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5">
                <span>Row-level access check</span>
                <span className="font-mono text-xs text-slate-600 dark:text-slate-400 shrink-0">
                  Supabase & Firebase
                </span>
              </div>
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5">
                <span>Unauthenticated route probe</span>
                <span className="font-mono text-xs text-slate-600 dark:text-slate-400 shrink-0">
                  API & webhooks
                </span>
              </div>
            </div>
          </article>

          {/* Narrow Span — One-Prompt Auto-Fixes */}
          <article className="lg:col-span-1 bg-[#F8FAFC] dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-7 sm:p-8 flex flex-col justify-between">
            <div>
              <h3 className="font-display text-2xl font-semibold tracking-tight text-slate-900 dark:text-[#F8FAFC]">
                One-Prompt Auto-Fixes
              </h3>
              <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                You shouldn’t need to decipher CORS headers or TypeScript stack traces. Every issue
                comes with a plain-English explanation and a tested repair prompt ready to paste
                into Lovable, Bolt, or Cursor.
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
              <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
                Sample generated repair prompt
              </p>
              <p className="font-mono text-xs leading-relaxed text-slate-700 dark:text-slate-200 bg-white dark:bg-[#090D16] border border-slate-200 dark:border-slate-800 rounded-lg p-3.5">
                “Move the Stripe secret lookup into a server route at /api/checkout and require an
                authenticated session before returning customer invoice rows.”
              </p>
            </div>
          </article>

          {/* Wide Span — Pre-Launch Regression Shield */}
          <article className="lg:col-span-2 bg-[#F8FAFC] dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden flex flex-col justify-between">
            <div className="p-7 sm:p-8">
              <h3 className="font-display text-2xl font-semibold tracking-tight text-slate-900 dark:text-[#F8FAFC]">
                Pre-Launch Regression Shield
              </h3>
              <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">
                Compare every new preview build against your last working release. Proofline
                isolates broken layouts, missing environment variables, and dead API calls before
                you share your link with investors, Product Hunt, or paying users.
              </p>
            </div>
            <div className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#090D16] divide-y divide-slate-200 dark:divide-slate-800">
              {REGRESSION_DIFFS.map((diff) => (
                <div
                  key={diff.check}
                  className="px-7 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-x-6 gap-y-1.5 text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {diff.status === 'pass' ? (
                      <CheckCircle2
                        className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0"
                        aria-hidden="true"
                      />
                    ) : (
                      <XCircle
                        className="w-4 h-4 text-rose-700 dark:text-rose-400 shrink-0"
                        aria-hidden="true"
                      />
                    )}
                    <span className="font-medium text-slate-900 dark:text-[#F8FAFC]">
                      {diff.check}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono tabular-nums">
                    <span className="text-slate-600 dark:text-slate-400">
                      Last pass: {diff.baseline}
                    </span>
                    <span
                      className={
                        diff.status === 'fail'
                          ? 'text-rose-700 dark:text-rose-400 font-medium'
                          : 'text-slate-600 dark:text-slate-400'
                      }
                    >
                      Preview: {diff.preview}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
