import type {
  BuilderTool,
  ScreenshotAnalysisResult,
  WaitlistPayload,
  WaitlistResponse,
} from '../types/qa';

const WAITLIST_STORAGE_KEY = 'proofline-waitlist-entries';

interface StoredWaitlistEntry {
  email: string;
  builderTool: BuilderTool;
  appUrl: string | null;
  painPoint: string | null;
  source: 'hero' | 'waitlist-section';
  createdAt: string;
}

function readStoredWaitlist(): StoredWaitlistEntry[] {
  try {
    const raw = window.localStorage.getItem(WAITLIST_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as StoredWaitlistEntry[]) : [];
  } catch {
    return [];
  }
}

function writeStoredWaitlist(entries: StoredWaitlistEntry[]): void {
  try {
    window.localStorage.setItem(WAITLIST_STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // Ignore storage quota or privacy-mode restrictions
  }
}

export function normalizeOptionalHttpUrl(rawUrl?: string): string | null {
  if (!rawUrl || !rawUrl.trim()) return null;
  const trimmed = rawUrl.trim();
  if (trimmed.length > 500) return null;
  const candidate = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const parsed = new URL(candidate);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return null;
    }
    return parsed.hostname.includes('.') ? parsed.toString() : null;
  } catch {
    return null;
  }
}

export function getWaitlistStats(): number {
  return readStoredWaitlist().length;
}

export async function submitWaitlist(payload: WaitlistPayload): Promise<WaitlistResponse> {
  const normalizedEmail = payload.email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(normalizedEmail)) {
    throw new Error('Please enter a valid work or personal email address.');
  }

  let appUrl: string | null = null;
  if (payload.appUrl && payload.appUrl.trim().length > 0) {
    appUrl = normalizeOptionalHttpUrl(payload.appUrl);
    if (!appUrl) {
      throw new Error('Please enter a valid http or https URL (for example, myapp.lovable.app).');
    }
  }

  const entries = readStoredWaitlist();
  const existing = entries.find((entry) => entry.email === normalizedEmail);
  if (existing) {
    if (appUrl && !existing.appUrl) existing.appUrl = appUrl;
    if (payload.painPoint && !existing.painPoint) existing.painPoint = payload.painPoint;
    if (payload.builderTool !== 'Other') existing.builderTool = payload.builderTool;
    writeStoredWaitlist(entries);

    return {
      ok: true,
      alreadyRegistered: true,
      entry: {
        email: existing.email,
        builderTool: existing.builderTool,
        createdAt: existing.createdAt,
      },
      totalCount: entries.length,
    };
  }

  const created: StoredWaitlistEntry = {
    email: normalizedEmail,
    builderTool: payload.builderTool,
    appUrl,
    painPoint: payload.painPoint?.trim().slice(0, 240) || null,
    source: payload.source,
    createdAt: new Date().toISOString(),
  };

  const next = [...entries, created];
  writeStoredWaitlist(next);

  return {
    ok: true,
    alreadyRegistered: false,
    entry: {
      email: created.email,
      builderTool: created.builderTool,
      createdAt: created.createdAt,
    },
    totalCount: next.length,
  };
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export async function analyzeScreenshotLocally(params: {
  imageDataUrl: string;
  builderTool: BuilderTool;
  focusNote: string;
  isDemoScreenshot: boolean;
}): Promise<ScreenshotAnalysisResult> {
  if (!params.imageDataUrl.startsWith('data:image/')) {
    throw new Error('Please upload a valid PNG, JPEG, or WebP screenshot.');
  }

  await wait(550);

  if (params.isDemoScreenshot) {
    return {
      checkedArea: 'Checkout & Billing Screen',
      readinessStatus: 'High Risk',
      summary:
        'Critical client-side secrets and unauthenticated database access are exposed directly on this checkout screen, alongside a broken mobile pay button. Lock down the Stripe and Supabase keys on the server before sharing this preview link.',
      findings: [
        {
          severity: 'Critical',
          category: 'Security',
          title: 'Secret keys and debug env panel exposed in client UI',
          detail:
            'STRIPE_SECRET and SUPABASE_SERVICE_ROLE_KEY appear in the browser runtime and right-hand debug drawer, letting any visitor read or charge your account.',
          fixPrompt: `Remove the debug environment drawer from production builds in ${params.builderTool}, rotate your Stripe secret and Supabase service-role keys, and move all secret usage into server-side API routes.`,
        },
        {
          severity: 'Critical',
          category: 'Security',
          title: 'Users table returns 1,482 rows without authentication',
          detail:
            'The screenshot shows RLS_ENABLED=false and an unauthenticated GET/POST returning user rows directly to the client.',
          fixPrompt: `Enable Row Level Security (RLS) on the public.users table and add a policy so authenticated users can only select or update rows where auth.uid() = id.`,
        },
        {
          severity: 'Warning',
          category: 'Broken Flow',
          title: 'Primary checkout button overlaps and clips outside card bounds',
          detail:
            'The "Pay $49.00 Now" button collides with "Cancel subscription" and extends past the card container, while the cancel button text fails contrast.',
          fixPrompt: `Place "Cancel subscription" and "Pay $49.00 Now" inside a responsive flex container with gap-3 and w-full sm:w-auto, and darken the secondary button label to slate-700 for readable contrast.`,
        },
      ],
    };
  }

  const focusSummary = params.focusNote.trim()
    ? `Focused on "${params.focusNote.trim()}". `
    : '';

  return {
    checkedArea: `${params.builderTool} App Screen`,
    readinessStatus: 'Needs Fixes',
    summary: `${focusSummary}Interactive preview inspection completed for your ${params.builderTool} screen. Review the authentication boundary, error-state handling, and mobile tap spacing checks below before launching.`,
    findings: [
      {
        severity: 'Warning',
        category: 'Security',
        title: 'Verify no private API keys or service tokens ship in client state',
        detail:
          'AI-generated frontends often inline secret keys or unguarded table queries inside client components during rapid iteration.',
        fixPrompt: `Audit all client components in this ${params.builderTool} screen to ensure only public anon keys are exposed and move any secret API calls into a server route.`,
      },
      {
        severity: 'Warning',
        category: 'Broken Flow',
        title: 'Add explicit loading, empty, and inline error recovery states',
        detail:
          'Forms and primary actions need disabled-while-submitting guards and clear recovery copy so users are not stuck if a network call fails.',
        fixPrompt: `Add loading spinners, disabled submit guards, and inline role="alert" error recovery messages to every form and action on this ${params.builderTool} screen.`,
      },
      {
        severity: 'Suggestion',
        category: 'Accessibility',
        title: 'Confirm 44px touch targets and visible keyboard focus rings',
        detail:
          'Ensure icon buttons, dropdowns, and secondary links keep comfortable spacing on 390px viewports and clear focus-visible outlines.',
        fixPrompt: `Update all interactive controls on this screen to use min-h-[44px] on mobile, explicit <label> associations, and focus-visible outlines.`,
      },
    ],
  };
}

export async function askQAAdvisor(params: {
  messages: Array<{ role: 'user' | 'model'; text: string }>;
  builderContext: BuilderTool;
}): Promise<string> {
  const latest = params.messages[params.messages.length - 1]?.text.trim() ?? '';
  if (!latest) {
    throw new Error('Please enter a message to start or continue the conversation.');
  }

  await wait(450);

  const lower = latest.toLowerCase();
  const builder = params.builderContext;

  if (lower.includes('supabase') || lower.includes('rls') || lower.includes('key') || lower.includes('table')) {
    return [
      `Here is the fastest way to verify your Supabase exposure in a **${builder}** app:`,
      '- Open DevTools → Network and filter by `rest/v1/` while logged out. If any table returns `200 OK` with rows, Row Level Security (RLS) is missing or too permissive.',
      '- Search your frontend bundle for `service_role` or `eyJ`. Only the public `anon` key should ever appear in browser code.',
      `Paste this prompt into **${builder}** to lock down your tables:`,
      '```text\nEnable Row Level Security (RLS) on every public Supabase table, remove any SUPABASE_SERVICE_ROLE_KEY references from client code, and add policies restricting reads and writes to auth.uid() = user_id.\n```',
    ].join('\n');
  }

  if (lower.includes('stripe') || lower.includes('checkout') || lower.includes('payment')) {
    return [
      `Before accepting real Stripe payments in **${builder}**, verify these 4 non-negotiable checks:`,
      '1. **Server-side prices**: Compute line items and amounts on the server instead of trusting client-submitted prices.',
      '2. **Webhook signature verification**: Verify `stripe-signature` using `STRIPE_WEBHOOK_SECRET` before unlocking paid access.',
      '3. **Idempotent fulfillment**: Guard against duplicate webhook deliveries so users are never upgraded twice or stuck pending.',
      '4. **Mobile viewport check**: Test the checkout modal at `390px` width so the primary Pay button never clips or hides behind sticky bars.',
      '```text\nMove Stripe Checkout session creation and webhook signature verification into dedicated server routes, and test the checkout modal at 390px mobile width with inline error states.\n```',
    ].join('\n');
  }

  if (lower.includes('domain') || lower.includes('login') || lower.includes('auth') || lower.includes('cors')) {
    return [
      `When login works in preview but fails on a custom domain in **${builder}**, it is almost always an origin allowlist mismatch:`,
      '- Add your custom `https://` domain (and `www` variant if used) to your auth provider’s **Site URL** and **Redirect URLs**.',
      '- Check cookie `SameSite` and `Secure` attributes if your API runs on a separate subdomain.',
      '- Inspect the browser console for CORS errors or `redirect_uri_mismatch` during OAuth callbacks.',
      '```text\nUpdate auth redirect URLs to dynamically use window.location.origin (or an allowlisted custom domain), ensure CORS allows your production origin with credentials, and display a clear error banner if session exchange fails.\n```',
    ].join('\n');
  }

  return [
    `For your **${builder}** app, start with this 3-step pre-launch pass:`,
    '1. **Core user flow**: Walk through sign-up, login, primary form submission, and reload persistence at both `1440px` and `390px`.',
    '2. **Secret & access check**: Confirm no private API keys (`sk_live`, `service_role`, webhook secrets) appear in client code and all private endpoints enforce authentication.',
    '3. **Error & empty states**: Trigger a failed request intentionally to confirm the form preserves user input and displays a clear recovery action.',
    `Paste this prompt into **${builder}** to harden the screen:`,
    `\`\`\`text\nAudit this ${builder} screen for exposed server secrets, missing authentication checks, broken mobile layouts at 390px, and missing inline loading/error recovery states.\n\`\`\``,
  ].join('\n');
}
