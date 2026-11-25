import { useState } from 'react';
import { Layers, ShieldCheck } from 'lucide-react';

const FLOW_IMAGE_PATH = '/src/assets/images/bento_flow_testing_1795597424389.jpg';
const SHIELD_IMAGE_PATH = '/src/assets/images/bento_security_shield_1795597424628.jpg';

export function CapabilitiesBento() {
  const [flowImgErr, setFlowImgErr] = useState(false);
  const [shieldImgErr, setShieldImgErr] = useState(false);

  return (
    <section
      id="how-it-works"
      className="py-20 lg:py-28 bg-white dark:bg-[#0D1321] border-t border-slate-200 dark:border-slate-800/90 transition-colors duration-150"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="max-w-2xl">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            How Proofline protects your launch
          </p>
          <h2
            className="mt-3 font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-[#F8FAFC]"
            style={{ textWrap: 'balance' }}
          >
            AI tools move fast. Silent regressions move faster.
          </h2>
          <p className="mt-4 text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            Fixing a button on your pricing page shouldn’t break Stripe webhooks or expose your user
            table. Proofline watches every change so non-technical builders ship with engineering
            rigor.
          </p>
        </div>

        {/* Asymmetric 3-column Bento Grid */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 01 — Wide Span */}
          <article className="lg:col-span-2 bg-[#F8FAFC] dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden flex flex-col justify-between">
            <div className="p-7 sm:p-8">
              <p className="text-xs font-mono tabular-nums text-slate-500 dark:text-[#60A5FA]">01</p>
              <h3 className="mt-2 font-display text-2xl font-semibold tracking-tight text-slate-900 dark:text-[#F8FAFC]">
                Continuous Flow Verification
              </h3>
              <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">
                Every time you regenerate a screen or merge an edit, headless browsers walk through
                account creation, login, forms, and checkout across desktop and mobile viewports. If
                a button stops responding or a redirect loops, you know in under 90 seconds.
              </p>
            </div>
            <div className="px-7 sm:px-8 pb-7 sm:pb-8">
              <div className="aspect-[16/9] max-h-[260px] w-full rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-[#090D16]">
                {!flowImgErr ? (
                  <img
                    src={FLOW_IMAGE_PATH}
                    alt="Architectural blueprint sheets and tablet aligned on a stone surface representing structured automated test flows"
                    referrerPolicy="no-referrer"
                    onError={() => setFlowImgErr(true)}
                    className="w-full h-full object-cover dark:brightness-[0.9] dark:contrast-[1.04]"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center gap-2 text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-[#090D16]">
                    <Layers className="w-5 h-5 text-[#1E40AF] dark:text-[#60A5FA]" />
                    <span className="text-sm font-medium">Automated User Flow Verification</span>
                  </div>
                )}
              </div>
            </div>
          </article>

          {/* 02 — Narrow Span */}
          <article className="lg:col-span-1 bg-[#F8FAFC] dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-7 sm:p-8 flex flex-col justify-between">
            <div>
              <p className="text-xs font-mono tabular-nums text-slate-500 dark:text-[#60A5FA]">02</p>
              <h3 className="mt-2 font-display text-2xl font-semibold tracking-tight text-slate-900 dark:text-[#F8FAFC]">
                Exposure & Secret Guard
              </h3>
              <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                AI code generators frequently ship client-side API keys, permissive database rules,
                or unprotected admin endpoints. Proofline scans your live build and network traffic
                to make sure private data stays private.
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 space-y-3 text-sm text-slate-700 dark:text-slate-200">
              <div className="flex items-baseline justify-between gap-4">
                <span>Client bundle key scan</span>
                <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
                  Every deploy
                </span>
              </div>
              <div className="flex items-baseline justify-between gap-4">
                <span>Row-level access check</span>
                <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
                  Supabase & Firebase
                </span>
              </div>
              <div className="flex items-baseline justify-between gap-4">
                <span>Unauthenticated route probe</span>
                <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
                  API & webhooks
                </span>
              </div>
            </div>
          </article>

          {/* 03 — Narrow Span */}
          <article className="lg:col-span-1 bg-[#F8FAFC] dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-7 sm:p-8 flex flex-col justify-between">
            <div>
              <p className="text-xs font-mono tabular-nums text-slate-500 dark:text-[#60A5FA]">03</p>
              <h3 className="mt-2 font-display text-2xl font-semibold tracking-tight text-slate-900 dark:text-[#F8FAFC]">
                One-Prompt Auto-Fixes
              </h3>
              <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                You shouldn’t need to decipher CORS headers or TypeScript stack traces. Every issue
                comes with a plain-English explanation and a tested repair prompt ready to paste
                into Lovable, Bolt, or Cursor.
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                Sample generated repair prompt
              </p>
              <p className="font-mono text-xs leading-relaxed text-slate-700 dark:text-slate-200 bg-white dark:bg-[#090D16] border border-slate-200 dark:border-slate-800 rounded-lg p-3.5">
                “Move the Stripe secret lookup into a server route at /api/checkout and require an
                authenticated session before returning customer invoice rows.”
              </p>
            </div>
          </article>

          {/* 04 — Wide Span */}
          <article className="lg:col-span-2 bg-[#F8FAFC] dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden flex flex-col justify-between">
            <div className="p-7 sm:p-8">
              <p className="text-xs font-mono tabular-nums text-slate-500 dark:text-[#60A5FA]">04</p>
              <h3 className="mt-2 font-display text-2xl font-semibold tracking-tight text-slate-900 dark:text-[#F8FAFC]">
                Pre-Launch Regression Shield
              </h3>
              <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">
                Compare every new preview build against your last working release. Proofline
                isolates broken layouts, missing environment variables, and dead API calls before
                you share your link with investors, Product Hunt, or paying users.
              </p>
            </div>
            <div className="px-7 sm:px-8 pb-7 sm:pb-8">
              <div className="aspect-[16/9] max-h-[260px] w-full rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-[#090D16]">
                {!shieldImgErr ? (
                  <img
                    src={SHIELD_IMAGE_PATH}
                    alt="Precision brushed aluminum and frosted glass geometric enclosure representing layered application security"
                    referrerPolicy="no-referrer"
                    onError={() => setShieldImgErr(true)}
                    className="w-full h-full object-cover dark:brightness-[0.9] dark:contrast-[1.04]"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center gap-2 text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-[#090D16]">
                    <ShieldCheck className="w-5 h-5 text-[#1E40AF] dark:text-[#60A5FA]" />
                    <span className="text-sm font-medium">Pre-Launch Regression Shield</span>
                  </div>
                )}
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
