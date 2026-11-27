export interface LeadsEnv {
  supabaseUrl?: string;
  supabaseServiceKey?: string;
  resendApiKey?: string;
  resendFromEmail?: string;
  resendReplyTo?: string;
}

export interface ServiceResponse {
  status: number;
  body: Record<string, unknown>;
}

const VALID_BUILDERS = new Set(['Lovable', 'Bolt', 'Cursor', 'Replit', 'v0', 'Other']);
const VALID_DATABASES = new Set(['Supabase', 'Firebase', 'Other', 'Unknown']);
const VALID_USER_SCALES = new Set(['0', '1-50', '51-500', '500+']);
const VALID_PLANS = new Set(['one-time', 'monthly', 'agency']);
const VALID_BUDGETS = new Set(['<20', '20-49', '50-99', '100+']);
const VALID_EVENTS = new Set(['pricing_interest', 'preorder_click']);

function readEnv(override?: LeadsEnv): Required<LeadsEnv> {
  return {
    supabaseUrl: (override?.supabaseUrl ?? process.env.SUPABASE_URL ?? '').trim().replace(/\/$/, ''),
    supabaseServiceKey: (
      override?.supabaseServiceKey ??
      process.env.SUPABASE_SERVICE_ROLE_KEY ??
      ''
    ).trim(),
    resendApiKey: (override?.resendApiKey ?? process.env.RESEND_API_KEY ?? '').trim(),
    resendFromEmail: (override?.resendFromEmail ?? process.env.RESEND_FROM_EMAIL ?? '').trim(),
    resendReplyTo: (override?.resendReplyTo ?? process.env.RESEND_REPLY_TO ?? '').trim(),
  };
}

function isValidEmail(email: string): boolean {
  return email.length >= 5 && email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

function sanitizeOptionalHttpUrl(rawUrl: unknown): string | null {
  if (typeof rawUrl !== 'string' || !rawUrl.trim()) return null;
  const trimmed = rawUrl.trim();
  if (trimmed.length > 500) return null;
  const candidate = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const parsed = new URL(candidate);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null;
    return parsed.hostname.includes('.') ? parsed.toString() : null;
  } catch {
    return null;
  }
}

function pickStr(val: unknown, maxLen = 200): string | null {
  if (typeof val !== 'string') return null;
  const trimmed = val.trim();
  return trimmed ? trimmed.slice(0, maxLen) : null;
}

async function supabaseRequest(
  env: Required<LeadsEnv>,
  path: string,
  init: RequestInit
): Promise<Response> {
  return fetch(`${env.supabaseUrl}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: env.supabaseServiceKey,
      // Seules les anciennes clés service_role (JWT) vont dans Authorization ;
      // les clés sb_secret_ ne s'envoient que dans l'en-tête apikey.
      ...(env.supabaseServiceKey.startsWith('sb_')
        ? {}
        : { Authorization: `Bearer ${env.supabaseServiceKey}` }),
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  });
}

async function sendWelcomeEmail(
  env: Required<LeadsEnv>,
  email: string,
  locale: 'fr' | 'en'
): Promise<boolean> {
  if (!env.resendApiKey || !env.resendFromEmail) return false;

  const subject =
    locale === 'fr'
      ? 'Ton audit de sécurité est en route 🔐'
      : 'Your security audit is on the way 🔐';

  const text =
    locale === 'fr'
      ? [
          'Bonjour,',
          '',
          'Merci pour ton inscription à Proofline ! Ton accès pour un audit de sécurité passif et gratuit est bien enregistré.',
          '',
          'Ce qui se passe ensuite :',
          '1. Si tu as partagé le lien de ton app (ou complété l’étape 2), nous préparons ton rapport clair et sans jargon.',
          '2. Nous t’envoyons les constats prioritaires (clés exposées, règles de base de données, parcours critiques) avec des correctifs prêts à coller.',
          '',
          'En attendant, tu peux simplement répondre à cet e-mail : quelle est ta plus grande crainte pour ton app aujourd’hui ?',
          '',
          'À très vite,',
          'L’équipe Proofline',
          '',
          '---',
          'Pour ne plus recevoir d’e-mails, réponds avec « Désinscription ».',
        ].join('\n')
      : [
          'Hi there,',
          '',
          'Thanks for joining Proofline! Your free passive security audit request is confirmed.',
          '',
          'What happens next:',
          '1. Once you share your app link in step 2, we review visible exposures and critical flows.',
          '2. You get a clear, jargon-free report with copy-ready fixes.',
          '',
          'Quick question—just hit reply: what is your biggest worry about your app right now?',
          '',
          'Talk soon,',
          'The Proofline team',
          '',
          '---',
          'Reply "Unsubscribe" anytime to opt out.',
        ].join('\n');

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: env.resendFromEmail,
        to: [email],
        reply_to: env.resendReplyTo || undefined,
        subject,
        text,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function handleLeadsGet(envOverride?: LeadsEnv): Promise<ServiceResponse> {
  const env = readEnv(envOverride);
  if (!env.supabaseUrl || !env.supabaseServiceKey) {
    return {
      status: 200,
      body: { configured: false, totalCount: null },
    };
  }

  try {
    const res = await supabaseRequest(env, 'proofline_leads?select=id', {
      method: 'HEAD',
      headers: { Prefer: 'count=exact' },
    });
    if (!res.ok) {
      return { status: 200, body: { configured: true, totalCount: null } };
    }
    const contentRange = res.headers.get('content-range') || '';
    const match = contentRange.match(/\/(\d+)$/);
    const totalCount = match ? Number(match[1]) : null;
    return { status: 200, body: { configured: true, totalCount } };
  } catch {
    return { status: 200, body: { configured: true, totalCount: null } };
  }
}

export async function handleLeadsPost(
  rawBody: unknown,
  envOverride?: LeadsEnv
): Promise<ServiceResponse> {
  const body = (rawBody ?? {}) as Record<string, unknown>;
  const locale: 'fr' | 'en' = body.locale === 'en' ? 'en' : 'fr';

  // Silent bot trap (honeypot)
  if (typeof body.companyWebsite === 'string' && body.companyWebsite.trim().length > 0) {
    return { status: 200, body: { ok: true, ignored: true } };
  }

  const action = typeof body.action === 'string' ? body.action : 'step1';
  const env = readEnv(envOverride);
  const hasSupabase = Boolean(env.supabaseUrl && env.supabaseServiceKey);

  // Pricing interest or preorder click event
  if (action === 'event') {
    const eventType = pickStr(body.eventType, 60) || 'pricing_interest';
    if (!VALID_EVENTS.has(eventType)) {
      return { status: 400, body: { ok: false, error: 'Unsupported event type' } };
    }
    const planId = typeof body.planId === 'string' && VALID_PLANS.has(body.planId) ? body.planId : null;
    const email = pickStr(body.email, 254)?.toLowerCase() || null;

    if (!hasSupabase) {
      return {
        status: 503,
        body: { ok: false, configured: false, message: 'Lead storage not configured' },
      };
    }

    try {
      const eventRes = await supabaseRequest(env, 'proofline_events', {
        method: 'POST',
        headers: { Prefer: 'return=minimal' },
        body: JSON.stringify({
          event_type: eventType,
          plan_id: planId,
          email,
          locale,
          utm_source: pickStr(body.utmSource, 120),
          utm_medium: pickStr(body.utmMedium, 120),
          utm_campaign: pickStr(body.utmCampaign, 120),
        }),
      });
      if (!eventRes.ok) {
        return { status: 502, body: { ok: false, error: 'Failed to record event' } };
      }
      return { status: 201, body: { ok: true, configured: true } };
    } catch {
      return { status: 502, body: { ok: false, error: 'Failed to record event' } };
    }
  }

  const rawEmail = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  if (!isValidEmail(rawEmail)) {
    return {
      status: 400,
      body: {
        error:
          locale === 'fr'
            ? 'Veuillez saisir une adresse e-mail valide.'
            : 'Please enter a valid email address.',
      },
    };
  }

  // Step 1: initial email + GDPR consent
  if (action === 'step1') {
    if (body.consentGdpr !== true) {
      return {
        status: 400,
        body: {
          error:
            locale === 'fr'
              ? 'Veuillez accepter la politique de confidentialité pour vous inscrire.'
              : 'Please accept the privacy policy to register.',
        },
      };
    }

    if (!hasSupabase) {
      return {
        status: 503,
        body: { ok: false, configured: false, message: 'Lead storage not configured' },
      };
    }

    try {
      const checkRes = await supabaseRequest(
        env,
        `proofline_leads?email=eq.${encodeURIComponent(rawEmail)}&select=id,email,created_at`,
        { method: 'GET' }
      );
      const existing = (await checkRes.json()) as Array<{
        id: string;
        email: string;
        created_at: string;
      }>;

      if (Array.isArray(existing) && existing.length > 0) {
        const stats = await handleLeadsGet(env);
        return {
          status: 200,
          body: {
            ok: true,
            configured: true,
            alreadyRegistered: true,
            welcomeEmailSent: false,
            entry: {
              email: existing[0].email,
              createdAt: existing[0].created_at,
            },
            totalCount: (stats.body.totalCount as number | null) ?? 1,
          },
        };
      }

      const insertRes = await supabaseRequest(env, 'proofline_leads', {
        method: 'POST',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify({
          email: rawEmail,
          consent_gdpr: true,
          locale,
          source: body.source === 'final-cta' ? 'final-cta' : 'hero',
          utm_source: pickStr(body.utmSource, 120),
          utm_medium: pickStr(body.utmMedium, 120),
          utm_campaign: pickStr(body.utmCampaign, 120),
          utm_content: pickStr(body.utmContent, 120),
          utm_term: pickStr(body.utmTerm, 120),
          referrer: pickStr(body.referrer, 300),
        }),
      });

      if (!insertRes.ok) {
        return {
          status: 502,
          body: {
            error:
              locale === 'fr'
                ? 'Impossible d’enregistrer votre inscription pour le moment.'
                : 'Could not save your signup right now.',
          },
        };
      }

      const inserted = (await insertRes.json()) as Array<{ email: string; created_at: string }>;
      const welcomeEmailSent = await sendWelcomeEmail(env, rawEmail, locale);
      const stats = await handleLeadsGet(env);

      return {
        status: 201,
        body: {
          ok: true,
          configured: true,
          alreadyRegistered: false,
          welcomeEmailSent,
          entry: {
            email: inserted[0]?.email ?? rawEmail,
            createdAt: inserted[0]?.created_at ?? new Date().toISOString(),
          },
          totalCount: (stats.body.totalCount as number | null) ?? 1,
        },
      };
    } catch {
      return {
        status: 502,
        body: {
          error:
            locale === 'fr'
              ? 'Erreur réseau lors de l’enregistrement.'
              : 'Network error while saving signup.',
        },
      };
    }
  }

  // Step 2: optional qualification & audit ownership confirmation
  if (action === 'step2') {
    const rawUrl = typeof body.appUrl === 'string' ? body.appUrl.trim() : '';
    let appUrl: string | null = null;
    if (rawUrl.length > 0) {
      appUrl = sanitizeOptionalHttpUrl(rawUrl);
      if (!appUrl) {
        return {
          status: 400,
          body: {
            error:
              locale === 'fr'
                ? 'Veuillez saisir une URL http ou https valide (ex. monapp.lovable.app).'
                : 'Please enter a valid http or https URL (e.g. myapp.lovable.app).',
          },
        };
      }
      if (body.ownsAppConfirmed !== true) {
        return {
          status: 400,
          body: {
            error:
              locale === 'fr'
                ? 'Veuillez certifier être propriétaire de l’application pour demander un audit.'
                : 'Please certify that you own this application before requesting an audit.',
          },
        };
      }
    }

    if (!hasSupabase) {
      return {
        status: 503,
        body: { ok: false, configured: false, message: 'Lead storage not configured' },
      };
    }

    const patchPayload = {
      builder_tool:
        typeof body.builderTool === 'string' && VALID_BUILDERS.has(body.builderTool)
          ? body.builderTool
          : null,
      database_tool:
        typeof body.databaseTool === 'string' && VALID_DATABASES.has(body.databaseTool)
          ? body.databaseTool
          : null,
      user_scale:
        typeof body.userScale === 'string' && VALID_USER_SCALES.has(body.userScale)
          ? body.userScale
          : null,
      pain_point: pickStr(body.painPoint, 200),
      interested_plan:
        typeof body.interestedPlan === 'string' && VALID_PLANS.has(body.interestedPlan)
          ? body.interestedPlan
          : null,
      monthly_budget:
        typeof body.monthlyBudget === 'string' && VALID_BUDGETS.has(body.monthlyBudget)
          ? body.monthlyBudget
          : null,
      app_url: appUrl,
      owns_app_confirmed: Boolean(appUrl && body.ownsAppConfirmed === true),
      interview_opt_in: body.interviewOptIn === true,
      updated_at: new Date().toISOString(),
    };

    try {
      const res = await supabaseRequest(
        env,
        `proofline_leads?email=eq.${encodeURIComponent(rawEmail)}`,
        {
          method: 'PATCH',
          headers: { Prefer: 'return=minimal' },
          body: JSON.stringify(patchPayload),
        }
      );
      if (!res.ok) {
        return {
          status: 502,
          body: {
            error:
              locale === 'fr'
                ? 'Impossible d’enregistrer vos réponses de qualification.'
                : 'Could not save your qualification answers.',
          },
        };
      }
      return { status: 200, body: { ok: true, configured: true } };
    } catch {
      return {
        status: 502,
        body: {
          error:
            locale === 'fr'
              ? 'Erreur réseau lors de la mise à jour.'
              : 'Network error while updating.',
        },
      };
    }
  }

  return { status: 400, body: { error: 'Unsupported action' } };
}
