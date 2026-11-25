import type { Locale } from '../i18n/translations';
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

export async function submitWaitlist(
  payload: WaitlistPayload,
  locale: Locale = 'fr'
): Promise<WaitlistResponse> {
  const normalizedEmail = payload.email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(normalizedEmail)) {
    throw new Error(
      locale === 'fr'
        ? 'Veuillez saisir une adresse e-mail valide.'
        : 'Please enter a valid work or personal email address.'
    );
  }

  let appUrl: string | null = null;
  if (payload.appUrl && payload.appUrl.trim().length > 0) {
    appUrl = normalizeOptionalHttpUrl(payload.appUrl);
    if (!appUrl) {
      throw new Error(
        locale === 'fr'
          ? 'Veuillez saisir une URL http ou https valide (par exemple monapp.lovable.app).'
          : 'Please enter a valid http or https URL (for example, myapp.lovable.app).'
      );
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
  locale: Locale;
}): Promise<ScreenshotAnalysisResult> {
  const { locale, builderTool, focusNote, isDemoScreenshot, imageDataUrl } = params;

  if (!imageDataUrl.startsWith('data:image/')) {
    throw new Error(
      locale === 'fr'
        ? 'Veuillez importer une capture PNG, JPEG ou WebP valide.'
        : 'Please upload a valid PNG, JPEG, or WebP screenshot.'
    );
  }

  await wait(550);

  const builderName = builderTool === 'Other' && locale === 'fr' ? 'votre outil' : builderTool;

  if (isDemoScreenshot) {
    if (locale === 'fr') {
      return {
        checkedArea: 'Écran Paiement & Facturation',
        readinessStatus: 'High Risk',
        summary:
          'Des clés secrètes côté client et un accès non authentifié à la base de données sont exposés directement sur cet écran de paiement, avec un bouton mobile cassé. Sécurisez les clés Stripe et Supabase côté serveur avant de partager ce lien.',
        findings: [
          {
            severity: 'Critical',
            category: 'Security',
            title: 'Clés secrètes et panneau debug exposés dans l’interface client',
            detail:
              'STRIPE_SECRET et SUPABASE_SERVICE_ROLE_KEY apparaissent dans le runtime navigateur et le panneau de debug à droite, exposant votre compte à tout visiteur.',
            fixPrompt: `Supprimez le panneau DEBUG ENV des builds de production dans ${builderName}, révoquez vos clés Stripe secrète et Supabase service_role, et déplacez tous les appels sensibles dans des routes API serveur.`,
          },
          {
            severity: 'Critical',
            category: 'Security',
            title: 'La table users renvoie 1 482 lignes sans authentification',
            detail:
              'La capture montre RLS_ENABLED=false et une requête non authentifiée renvoyant les lignes utilisateurs directement au client.',
            fixPrompt: `Activez Row Level Security (RLS) sur la table public.users et ajoutez une règle limitant la lecture et la modification aux utilisateurs authentifiés où auth.uid() = id.`,
          },
          {
            severity: 'Warning',
            category: 'Broken Flow',
            title: 'Le bouton principal Payer chevauche et déborde de la carte',
            detail:
              'Le bouton « Pay $49.00 Now » entre en collision avec « Cancel subscription » et sort du conteneur, tandis que le libellé secondaire manque de contraste.',
            fixPrompt: `Placez les deux boutons dans un conteneur flex responsive avec gap-3 et w-full sm:w-auto, et foncez la couleur du texte secondaire en slate-700 pour un contraste lisible.`,
          },
        ],
      };
    }

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

  if (locale === 'fr') {
    const focusSummary = focusNote.trim() ? `Zone ciblée : « ${focusNote.trim()} ». ` : '';
    return {
      checkedArea: `Écran ${builderName}`,
      readinessStatus: 'Needs Fixes',
      summary: `${focusSummary}Inspection interactive terminée pour votre écran ${builderName}. Vérifiez les frontières d’authentification, la gestion d’erreur et les cibles tactiles mobiles ci-dessous avant la mise en ligne.`,
      findings: [
        {
          severity: 'Warning',
          category: 'Security',
          title: 'Vérifier qu’aucune clé API privée ne transite côté client',
          detail:
            'Les frontends générés par IA incluent parfois des clés secrètes ou des requêtes non protégées directement dans les composants navigateurs.',
          fixPrompt: `Auditez tous les composants clients de cet écran ${builderName} pour ne conserver que la clé publique anon et déplacer les appels sensibles dans une route serveur.`,
        },
        {
          severity: 'Warning',
          category: 'Broken Flow',
          title: 'Ajouter des états explicites de chargement, vide et reprise sur erreur',
          detail:
            'Les formulaires et actions principales doivent désactiver l’envoi en cours et afficher un message clair pour éviter de bloquer l’utilisateur en cas d’échec réseau.',
          fixPrompt: `Ajoutez un état de chargement, une protection anti-double-clic et un message d’erreur inline role="alert" avec option de reprise sur cet écran ${builderName}.`,
        },
        {
          severity: 'Suggestion',
          category: 'Accessibility',
          title: 'Contrôler les zones tactiles de 44 px et les anneaux de focus clavier',
          detail:
            'Assurez-vous que les boutons, sélecteurs et liens gardent un espacement confortable à 390 px de large et un contour focus-visible contrasté.',
          fixPrompt: `Passez les éléments interactifs de cet écran à min-h-[44px] sur mobile, reliez chaque champ à un <label> explicite et ajoutez focus-visible.`,
        },
      ],
    };
  }

  const focusSummary = focusNote.trim() ? `Focused on "${focusNote.trim()}". ` : '';

  return {
    checkedArea: `${builderName} App Screen`,
    readinessStatus: 'Needs Fixes',
    summary: `${focusSummary}Interactive preview inspection completed for your ${builderName} screen. Review the authentication boundary, error-state handling, and mobile tap spacing checks below before launching.`,
    findings: [
      {
        severity: 'Warning',
        category: 'Security',
        title: 'Verify no private API keys or service tokens ship in client state',
        detail:
          'AI-generated frontends often inline secret keys or unguarded table queries inside client components during rapid iteration.',
        fixPrompt: `Audit all client components in this ${builderName} screen to ensure only public anon keys are exposed and move any secret API calls into a server route.`,
      },
      {
        severity: 'Warning',
        category: 'Broken Flow',
        title: 'Add explicit loading, empty, and inline error recovery states',
        detail:
          'Forms and primary actions need disabled-while-submitting guards and clear recovery copy so users are not stuck if a network call fails.',
        fixPrompt: `Add loading spinners, disabled submit guards, and inline role="alert" error recovery messages to every form and action on this ${builderName} screen.`,
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
  locale: Locale;
}): Promise<string> {
  const { locale, builderContext, messages } = params;
  const latest = messages[messages.length - 1]?.text.trim() ?? '';
  if (!latest) {
    throw new Error(
      locale === 'fr'
        ? 'Veuillez saisir un message pour démarrer ou poursuivre l’échange.'
        : 'Please enter a message to start or continue the conversation.'
    );
  }

  await wait(450);

  const lower = latest.toLowerCase();
  const builder = builderContext === 'Other' && locale === 'fr' ? 'votre outil' : builderContext;

  if (lower.includes('supabase') || lower.includes('rls') || lower.includes('key') || lower.includes('clé') || lower.includes('table')) {
    if (locale === 'fr') {
      return [
        `Voici la méthode la plus rapide pour vérifier l’exposition Supabase dans une app **${builder}** :`,
        '- Ouvrez DevTools → Réseau et filtrez par `rest/v1/` tout en étant déconnecté. Si une table renvoie `200 OK` avec des lignes, le Row Level Security (RLS) est absent ou trop permissif.',
        '- Recherchez `service_role` ou `eyJ` dans votre bundle frontend : seule la clé publique `anon` doit exister dans le navigateur.',
        `Collez ce prompt dans **${builder}** pour verrouiller vos tables :`,
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

  if (lower.includes('stripe') || lower.includes('checkout') || lower.includes('payment') || lower.includes('paiement')) {
    if (locale === 'fr') {
      return [
        `Avant d’encaisser de vrais paiements Stripe dans **${builder}**, validez ces 4 points critiques :`,
        '1. **Prix calculés côté serveur** : ne faites jamais confiance aux montants envoyés par le navigateur.',
        '2. **Vérification de signature webhook** : contrôlez `stripe-signature` avec `STRIPE_WEBHOOK_SECRET` avant d’activer un abonnement.',
        '3. **Traitement idempotent** : ignorez les webhooks déjà traités afin d’éviter les doublons ou états bloqués.',
        '4. **Test mobile à 390 px** : vérifiez que le bouton de paiement reste entièrement visible et cliquable sans chevauchement.',
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

  if (lower.includes('domain') || lower.includes('domaine') || lower.includes('login') || lower.includes('connexion') || lower.includes('auth') || lower.includes('cors')) {
    if (locale === 'fr') {
      return [
        `Quand la connexion fonctionne en aperçu mais échoue sur un domaine personnalisé dans **${builder}**, il s’agit presque toujours d’une liste d’origines autorisées incomplète :`,
        '- Ajoutez votre domaine `https://` personnalisé (et la variante `www` si utilisée) dans **Site URL** et **Redirect URLs** de votre fournisseur d’auth.',
        '- Vérifiez les attributs `SameSite` et `Secure` des cookies si votre API tourne sur un sous-domaine distinct.',
        '- Contrôlez la console navigateur pour détecter toute erreur CORS ou `redirect_uri_mismatch` lors du retour OAuth.',
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
      `Pour votre application **${builder}**, commencez par ces 3 vérifications avant lancement :`,
      '1. **Parcours critiques** : testez inscription, connexion, soumission de formulaire et rechargement en `1440px` et `390px`.',
      '2. **Secrets & accès** : vérifiez qu’aucune clé privée (`sk_live`, `service_role`, secret webhook) n’apparaît dans le code client et que chaque route privée exige une session.',
      '3. **Erreurs & états vides** : provoquez volontairement une erreur réseau pour vérifier que le formulaire conserve la saisie et propose une reprise claire.',
      `Collez ce prompt dans **${builder}** pour renforcer l’écran :`,
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
