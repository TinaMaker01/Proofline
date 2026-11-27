import type { Locale } from '../i18n/translations';
import type {
  BuilderTool,
  LeadRecord,
  LeadStep1Payload,
  LeadStep1Response,
  LeadStep2Payload,
  PricingPlanId,
  ScreenshotAnalysisResult,
  UtmParams,
} from '../types/qa';

const LEADS_STORAGE_KEY = 'proofline-leads-v2';
const EVENTS_STORAGE_KEY = 'proofline-events-v2';

interface StoredEvent {
  eventType: string;
  planId?: PricingPlanId;
  email?: string;
  utm?: UtmParams;
  createdAt: string;
}

function readStoredLeads(): LeadRecord[] {
  try {
    const raw = window.localStorage.getItem(LEADS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as LeadRecord[]) : [];
  } catch {
    return [];
  }
}

function writeStoredLeads(leads: LeadRecord[]): void {
  try {
    window.localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(leads));
  } catch {
    // Ignore storage quota or privacy-mode restrictions
  }
}

function appendStoredEvent(event: StoredEvent): void {
  try {
    const raw = window.localStorage.getItem(EVENTS_STORAGE_KEY);
    const existing = raw ? (JSON.parse(raw) as StoredEvent[]) : [];
    const next = Array.isArray(existing) ? [...existing, event] : [event];
    window.localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(next.slice(-100)));
  } catch {
    // Ignore storage quota restrictions
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

export async function fetchLeadCount(): Promise<number> {
  const localCount = readStoredLeads().length;
  try {
    const res = await fetch('/api/leads');
    if (res.ok) {
      const data = (await res.json()) as { configured?: boolean; totalCount?: number | null };
      if (data.configured && typeof data.totalCount === 'number') {
        return data.totalCount;
      }
    }
  } catch {
    // Fallback to local count
  }
  return localCount;
}

export function getSavedActiveLead(): LeadRecord | null {
  const leads = readStoredLeads();
  return leads.length > 0 ? leads[leads.length - 1] : null;
}

/**
 * Envoie une inscription au serveur. Toute réponse autre qu’un succès lève une
 * erreur : un contact non enregistré ne doit jamais être annoncé comme inscrit.
 */
async function postLead(body: object, failureMessage: string): Promise<Response> {
  let res: Response;
  try {
    res = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error(failureMessage);
  }
  if (!res.ok) {
    const errData = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(errData?.error || failureMessage);
  }
  return res;
}

export async function submitLeadStep1(payload: LeadStep1Payload): Promise<LeadStep1Response> {
  const normalizedEmail = payload.email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(normalizedEmail)) {
    throw new Error(
      payload.locale === 'fr'
        ? 'Saisis une adresse e-mail valide.'
        : 'Please enter a valid email address.'
    );
  }
  if (!payload.consentGdpr) {
    throw new Error(
      payload.locale === 'fr'
        ? 'Accepte la politique de confidentialité pour t’inscrire.'
        : 'Please accept the privacy policy to register.'
    );
  }

  const res = await postLead(
    { action: 'step1', ...payload, email: normalizedEmail },
    payload.locale === 'fr'
      ? 'Ton inscription n’a pas été enregistrée. Réessaie dans un instant.'
      : 'Your signup was not saved. Please try again in a moment.'
  );
  const data = (await res.json()) as {
    alreadyRegistered?: boolean;
    welcomeEmailSent?: boolean;
    entry?: { email: string; createdAt: string };
    totalCount?: number;
  };

  // Copie locale, seulement après confirmation du serveur (continuité étape 2).
  const localLeads = readStoredLeads();
  const existing = localLeads.find((item) => item.email === normalizedEmail);
  const entry: LeadRecord = {
    ...(existing ?? { email: normalizedEmail, consentGdpr: true }),
    email: data.entry?.email || normalizedEmail,
    createdAt: data.entry?.createdAt || existing?.createdAt || new Date().toISOString(),
  };
  if (!existing) {
    writeStoredLeads([...localLeads, entry]);
  }

  return {
    ok: true,
    alreadyRegistered: Boolean(data.alreadyRegistered),
    welcomeEmailSent: Boolean(data.welcomeEmailSent),
    entry,
    totalCount: data.totalCount ?? 0,
  };
}

export async function submitLeadStep2(
  payload: LeadStep2Payload
): Promise<{ updatedLead: LeadRecord }> {
  const normalizedEmail = payload.email.trim().toLowerCase();
  const trimmedUrl = payload.appUrl?.trim() || '';

  let normalizedUrl: string | undefined;
  if (trimmedUrl) {
    const parsed = normalizeOptionalHttpUrl(trimmedUrl);
    if (!parsed) {
      throw new Error(
        payload.locale === 'fr'
          ? 'Saisis une URL http ou https valide (par exemple monapp.lovable.app).'
          : 'Enter a valid http or https URL (for example, myapp.lovable.app).'
      );
    }
    if (!payload.ownsAppConfirmed) {
      throw new Error(
        payload.locale === 'fr'
          ? 'Coche la case certifiant que tu es propriétaire de cette application pour demander un audit.'
          : 'Please confirm that you own this application before requesting an audit.'
      );
    }
    normalizedUrl = parsed;
  }

  const localLeads = readStoredLeads();
  const existingIdx = localLeads.findIndex((item) => item.email === normalizedEmail);
  const baseLead: LeadRecord =
    existingIdx >= 0
      ? localLeads[existingIdx]
      : {
          email: normalizedEmail,
          consentGdpr: true,
          createdAt: new Date().toISOString(),
        };

  const updatedLead: LeadRecord = {
    ...baseLead,
    builderTool: payload.builderTool ?? baseLead.builderTool,
    databaseTool: payload.databaseTool ?? baseLead.databaseTool,
    userScale: payload.userScale ?? baseLead.userScale,
    painPoint: payload.painPoint ?? baseLead.painPoint,
    interestedPlan: payload.interestedPlan ?? baseLead.interestedPlan,
    monthlyBudget: payload.monthlyBudget ?? baseLead.monthlyBudget,
    appUrl: normalizedUrl ?? baseLead.appUrl,
    ownsAppConfirmed: Boolean(normalizedUrl && payload.ownsAppConfirmed),
    interviewOptIn: Boolean(payload.interviewOptIn),
    step2Completed: true,
  };

  await postLead(
    { action: 'step2', ...payload, email: normalizedEmail, appUrl: normalizedUrl },
    payload.locale === 'fr'
      ? 'Tes réponses n’ont pas été enregistrées. Réessaie dans un instant.'
      : 'Your answers were not saved. Please try again in a moment.'
  );

  if (existingIdx >= 0) {
    localLeads[existingIdx] = updatedLead;
    writeStoredLeads(localLeads);
  } else {
    writeStoredLeads([...localLeads, updatedLead]);
  }

  return { updatedLead };
}

interface PlanEventParams {
  planId: PricingPlanId;
  email?: string;
  locale: Locale;
  utm?: UtmParams;
}

async function trackPlanEvent(
  eventType: 'pricing_interest' | 'preorder_click',
  params: PlanEventParams
): Promise<void> {
  appendStoredEvent({
    eventType,
    planId: params.planId,
    email: params.email,
    utm: params.utm,
    createdAt: new Date().toISOString(),
  });

  try {
    await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // La précommande quitte la page : la requête doit survivre à la navigation.
      keepalive: true,
      body: JSON.stringify({
        action: 'event',
        eventType,
        planId: params.planId,
        email: params.email,
        locale: params.locale,
        ...params.utm,
      }),
    });
  } catch {
    // Non-blocking analytics event
  }
}

export function trackPricingInterest(params: PlanEventParams): Promise<void> {
  return trackPlanEvent('pricing_interest', params);
}

export function trackPreorderClick(params: PlanEventParams): Promise<void> {
  return trackPlanEvent('preorder_click', params);
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

async function analyzeScreenshotFallback(params: {
  imageDataUrl: string;
  builderTool: BuilderTool;
  focusNote: string;
  isDemoScreenshot: boolean;
  locale: Locale;
}): Promise<ScreenshotAnalysisResult> {
  const { locale, builderTool, isDemoScreenshot } = params;

  await wait(450);

  // Sans analyse en direct, seule la capture de démo a un exemple à montrer :
  // une capture réelle n’est jamais commentée sans avoir été lue.
  if (!isDemoScreenshot) {
    throw new Error(
      locale === 'fr'
        ? 'L’analyse en direct est indisponible : ta capture n’a pas été analysée. Réessaie plus tard.'
        : 'Live analysis is unavailable: your screenshot was not analyzed. Please try again later.'
    );
  }

  const builderName = builderTool === 'Other' && locale === 'fr' ? 'ton outil' : builderTool;

  if (locale === 'fr') {
    return {
      isExample: true,
      checkedArea: 'Écran Paiement & Facturation',
      readinessStatus: 'High Risk',
      summary:
        'Des clés secrètes côté client et un accès non authentifié à la base de données sont exposés directement sur cet écran de paiement, avec un bouton mobile cassé. Sécurise les clés Stripe et Supabase côté serveur avant de partager ce lien.',
      findings: [
        {
          severity: 'Critical',
          category: 'Security',
          title: 'Clés secrètes et panneau debug exposés dans l’interface client',
          detail:
            'STRIPE_SECRET et SUPABASE_SERVICE_ROLE_KEY apparaissent dans le navigateur et le panneau de debug à droite, exposant ton compte à tout visiteur.',
          fixPrompt: `Supprime le panneau DEBUG ENV des builds de production dans ${builderName}, révoque tes clés Stripe secrète et Supabase service_role, et déplace tous les appels sensibles dans des routes API serveur.`,
        },
        {
          severity: 'Critical',
          category: 'Security',
          title: 'La table users renvoie 1 482 lignes sans authentification',
          detail:
            'La capture montre RLS_ENABLED=false et une requête non authentifiée renvoyant les lignes utilisateurs directement au client.',
          fixPrompt: `Active Row Level Security (RLS) sur la table public.users et ajoute une règle limitant la lecture et la modification aux utilisateurs authentifiés où auth.uid() = id.`,
        },
        {
          severity: 'Warning',
          category: 'Broken Flow',
          title: 'Le bouton principal Payer chevauche et déborde de la carte',
          detail:
            'Le bouton « Pay $49.00 Now » entre en collision avec « Cancel subscription » et sort du conteneur, tandis que le libellé secondaire manque de contraste.',
          fixPrompt: `Place les deux boutons dans un conteneur flex responsive avec gap-3 et w-full sm:w-auto, et fonce la couleur du texte secondaire en slate-700 pour un contraste lisible.`,
        },
      ],
    };
  }

  return {
    isExample: true,
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
        fixPrompt: `Remove the debug environment drawer from production builds in ${builderName}, rotate your Stripe secret and Supabase service-role keys, and move all secret usage into server-side API routes.`,
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

async function askQAAdvisorFallback(params: {
  messages: Array<{ role: 'user' | 'model'; text: string }>;
  builderContext: BuilderTool;
  locale: Locale;
}): Promise<string> {
  const { locale, builderContext, messages } = params;
  const latest = messages[messages.length - 1]?.text.trim() ?? '';

  await wait(400);

  const lower = latest.toLowerCase();
  const builder = builderContext === 'Other' && locale === 'fr' ? 'ton outil' : builderContext;

  if (
    lower.includes('supabase') ||
    lower.includes('rls') ||
    lower.includes('key') ||
    lower.includes('clé') ||
    lower.includes('table')
  ) {
    if (locale === 'fr') {
      return [
        `Voici la méthode la plus rapide pour vérifier l’exposition Supabase dans une app **${builder}** :`,
        '- Ouvre DevTools → Réseau et filtre par `rest/v1/` tout en étant déconnecté. Si une table renvoie `200 OK` avec des lignes, le Row Level Security (RLS) est absent ou trop permissif.',
        '- Recherche `service_role` ou `eyJ` dans ton bundle frontend : seule la clé publique `anon` doit exister dans le navigateur.',
        `Colle ce prompt dans **${builder}** pour verrouiller tes tables :`,
        '```text\nActive Row Level Security (RLS) sur toutes les tables publiques Supabase, retire toute référence à SUPABASE_SERVICE_ROLE_KEY du code client, et ajoute des politiques limitant la lecture et l’écriture à auth.uid() = user_id.\n```',
      ].join('\n');
    }

    return [
      `Here is the fastest way to verify your Supabase exposure in a **${builder}** app:`,
      '- Open DevTools → Network and filter by `rest/v1/` while logged out. If any table returns `200 OK` with rows, Row Level Security (RLS) is missing or too permissive.',
      '- Search your frontend bundle for `service_role` or `eyJ`. Only the public `anon` key should ever appear in browser code.',
      `Paste this prompt into **${builder}** to lock down your tables:`,
      '```text\nEnable Row Level Security (RLS) on every public Supabase table, remove any SUPABASE_SERVICE_ROLE_KEY references from client code, and add policies restricting reads and writes to auth.uid() = user_id.\n```',
    ].join('\n');
  }

  if (
    lower.includes('stripe') ||
    lower.includes('checkout') ||
    lower.includes('payment') ||
    lower.includes('paiement')
  ) {
    if (locale === 'fr') {
      return [
        `Avant d’encaisser de vrais paiements Stripe dans **${builder}**, valide ces 4 points critiques :`,
        '1. **Prix calculés côté serveur** : ne fais jamais confiance aux montants envoyés par le navigateur.',
        '2. **Vérification de signature webhook** : contrôle `stripe-signature` avec `STRIPE_WEBHOOK_SECRET` avant d’activer un abonnement.',
        '3. **Traitement idempotent** : ignore les webhooks déjà traités afin d’éviter les doublons ou états bloqués.',
        '4. **Test mobile à 390 px** : vérifie que le bouton de paiement reste entièrement visible et cliquable sans chevauchement.',
        '```text\nDéplace la création de session Stripe Checkout et la vérification de signature webhook dans des routes serveur dédiées, puis vérifie la modale de paiement à 390px avec gestion d’erreur inline.\n```',
      ].join('\n');
    }

    return [
      `Before accepting real Stripe payments in **${builder}**, verify these 4 non-negotiable checks:`,
      '1. **Server-side prices**: Compute line items and amounts on the server instead of trusting client-submitted prices.',
      '2. **Webhook signature verification**: Verify `stripe-signature` using `STRIPE_WEBHOOK_SECRET` before unlocking paid access.',
      '3. **Idempotent fulfillment**: Guard against duplicate webhook deliveries so users are never upgraded twice or stuck pending.',
      '4. **Mobile viewport check**: Test the checkout modal at `390px` width so the primary Pay button never clips or hides behind sticky bars.',
      '```text\nMove Stripe Checkout session creation and webhook signature verification into dedicated server routes, and test the checkout modal at 390px mobile width with inline error states.\n```',
    ].join('\n');
  }

  if (
    lower.includes('domain') ||
    lower.includes('domaine') ||
    lower.includes('login') ||
    lower.includes('connexion') ||
    lower.includes('auth') ||
    lower.includes('cors')
  ) {
    if (locale === 'fr') {
      return [
        `Quand la connexion fonctionne en aperçu mais échoue sur un domaine personnalisé dans **${builder}**, il s’agit presque toujours d’une liste d’origines autorisées incomplète :`,
        '- Ajoute ton domaine `https://` personnalisé (et la variante `www` si utilisée) dans **Site URL** et **Redirect URLs** de ton fournisseur d’auth.',
        '- Vérifie les attributs `SameSite` et `Secure` des cookies si ton API tourne sur un sous-domaine distinct.',
        '- Contrôle la console navigateur pour détecter toute erreur CORS ou `redirect_uri_mismatch` lors du retour OAuth.',
        '```text\nMets à jour les URLs de redirection auth pour utiliser dynamiquement window.location.origin (ou le domaine personnalisé autorisé), configure CORS avec credentials pour l’origine de production et affiche un message d’erreur clair si l’échange de session échoue.\n```',
      ].join('\n');
    }

    return [
      `When login works in preview but fails on a custom domain in **${builder}**, it is almost always an origin allowlist mismatch:`,
      '- Add your custom `https://` domain (and `www` variant if used) to your auth provider’s **Site URL** and **Redirect URLs**.',
      '- Check cookie `SameSite` and `Secure` attributes if your API runs on a separate subdomain.',
      '- Inspect the browser console for CORS errors or `redirect_uri_mismatch` during OAuth callbacks.',
      '```text\nUpdate auth redirect URLs to dynamically use window.location.origin (or an allowlisted custom domain), ensure CORS allows your production origin with credentials, and display a clear error banner if session exchange fails.\n```',
    ].join('\n');
  }

  if (locale === 'fr') {
    return [
      `Pour ton application **${builder}**, commence par ces 3 vérifications avant lancement :`,
      '1. **Parcours critiques** : teste inscription, connexion, soumission de formulaire et rechargement en `1440px` et `390px`.',
      '2. **Secrets & accès** : vérifie qu’aucune clé privée (`sk_live`, `service_role`, secret webhook) n’apparaît dans le code client et que chaque route privée exige une session.',
      '3. **Erreurs & états vides** : provoque volontairement une erreur réseau pour vérifier que le formulaire conserve la saisie et propose une reprise claire.',
      `Colle ce prompt dans **${builder}** pour renforcer l’écran :`,
      `\`\`\`text\nAudite cet écran ${builder} pour supprimer toute clé serveur exposée, vérifier l’authentification sur les endpoints privés, corriger la mise en page mobile à 390px et ajouter des états de chargement et d’erreur inline.\n\`\`\``,
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

export async function analyzeScreenshotLocally(params: {
  imageDataUrl: string;
  builderTool: BuilderTool;
  focusNote: string;
  isDemoScreenshot: boolean;
  locale: Locale;
}): Promise<ScreenshotAnalysisResult> {
  if (!params.imageDataUrl.startsWith('data:image/')) {
    throw new Error(
      params.locale === 'fr'
        ? 'Importe une capture PNG, JPEG ou WebP valide.'
        : 'Please upload a valid PNG, JPEG, or WebP screenshot.'
    );
  }

  try {
    const response = await fetch('/api/analyze-screenshot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageDataUrl: params.imageDataUrl,
        builderTool: params.builderTool,
        focusNote: params.focusNote,
        locale: params.locale,
      }),
    });

    if (response.ok) {
      return (await response.json()) as ScreenshotAnalysisResult;
    }

    if (response.status === 404 || response.status === 503) {
      return analyzeScreenshotFallback(params);
    }

    const errData = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(
      errData?.error ||
        (params.locale === 'fr'
          ? 'Impossible de finaliser l’audit de la capture.'
          : 'Could not complete the screenshot audit.')
    );
  } catch (err) {
    if (err instanceof TypeError) {
      return analyzeScreenshotFallback(params);
    }
    throw err;
  }
}

export async function askQAAdvisor(params: {
  messages: Array<{ role: 'user' | 'model'; text: string }>;
  builderContext: BuilderTool;
  locale: Locale;
}): Promise<{ text: string; isExample: boolean }> {
  const latest = params.messages[params.messages.length - 1]?.text.trim() ?? '';
  if (!latest) {
    throw new Error(
      params.locale === 'fr'
        ? 'Saisis un message pour démarrer ou poursuivre l’échange.'
        : 'Please enter a message to start or continue the conversation.'
    );
  }

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: params.messages,
        builderContext: params.builderContext,
        locale: params.locale,
      }),
    });

    if (response.ok) {
      const data = (await response.json()) as { reply?: string };
      if (data.reply) return { text: data.reply, isExample: false };
    }

    if (response.status === 404 || response.status === 503) {
      return { text: await askQAAdvisorFallback(params), isExample: true };
    }

    const errData = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(
      errData?.error ||
        (params.locale === 'fr'
          ? 'Impossible de joindre le conseiller QA pour le moment.'
          : 'Could not reach the QA advisor right now.')
    );
  } catch (err) {
    if (err instanceof TypeError) {
      return { text: await askQAAdvisorFallback(params), isExample: true };
    }
    throw err;
  }
}
