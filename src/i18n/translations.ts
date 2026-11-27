import type {
  BuilderTool,
  DatabaseTool,
  FindingCategory,
  FindingSeverity,
  MonthlyBudget,
  PricingPlanId,
  UserScale,
} from '../types/qa';

export type Locale = 'fr' | 'en';

export function formatBuilderLabel(tool: BuilderTool, locale: Locale): string {
  if (tool === 'Other' && locale === 'fr') {
    return 'Autre';
  }
  return tool;
}

export interface SiteTranslations {
  meta: {
    title: string;
    description: string;
  };
  skipLink: string;
  nav: {
    primaryAria: string;
    mobileAria: string;
    report: string;
    howItWorks: string;
    liveAudit: string;
    pricing: string;
    faq: string;
    cta: string;
    openMenu: string;
    closeMenu: string;
    appearance: string;
    language: string;
  };
  theme: {
    groupLabel: string;
    dark: string;
    light: string;
  };
  languageToggle: {
    groupLabel: string;
  };
  hero: {
    headline: string;
    subheadline: string;
    emailLabel: string;
    emailPlaceholder: string;
    gdprLabelPrefix: string;
    gdprPrivacyLink: string;
    gdprLabelSuffix: string;
    submit: string;
    submitting: string;
    reassurance: string;
    jumpToAudit: string;
    emailError: string;
    gdprError: string;
    fallbackError: string;
    confirmedAlready: string;
    confirmedNew: string;
    welcomeEmailNotice: string;
    nextStepsLine: string;
    completeStep2Cta: string;
    registerAnother: string;
    workbenchAria: string;
    highRisk: string;
    runLiveCheck: string;
    promptHeader: string;
    promptBody: string;
    checks: Array<{
      severity: 'Critical' | 'Warning';
      area: string;
      message: string;
      location: string;
    }>;
  };
  howItWorks: {
    heading: string;
    subheading: string;
    detectHeading: string;
    detections: Array<{ title: string; description: string }>;
    stepsHeading: string;
    steps: Array<{ title: string; description: string }>;
    audienceHeading: string;
    audiences: Array<{ title: string; description: string }>;
  };
  sampleReport: {
    heading: string;
    intro: string;
    openLabel: string;
    closeLabel: string;
    appLabel: string;
    summary: string;
    evidenceLabel: string;
    impactLabel: string;
    fixLabel: string;
    findings: Array<{
      severity: FindingSeverity;
      title: string;
      evidence: string;
      impact: string;
      fix: string;
    }>;
    flowHeading: string;
    flowSteps: Array<{ step: string; desktop: string; mobile: string; status: 'pass' | 'warn' }>;
    diffHeading: string;
    beforeLabel: string;
    afterLabel: string;
    diffs: Array<{ check: string; before: string; after: string; status: 'pass' | 'fail' }>;
    limits: string;
  };
  studio: {
    badge: string;
    heading: string;
    subheading: string;
    tablistAria: string;
    tabScreenshot: string;
    tabChat: string;
    uploadLabel: string;
    loadDemo: string;
    remove: string;
    dropTitle: string;
    dropHint: string;
    uploadedAltFallback: string;
    replace: string;
    builtWith: string;
    focusArea: string;
    focusPlaceholder: string;
    runAudit: string;
    inspecting: string;
    checkingTitle: string;
    checkingSubtitlePrefix: string;
    checkingSubtitleSuffix: string;
    emptyTitle: string;
    emptyDescBefore: string;
    emptyDescAfter: string;
    findingSingular: string;
    findingPlural: string;
    auditSummary: string;
    copyAllFixes: string;
    copiedAllFixes: string;
    askAdvisor: string;
    pasteInto: string;
    copyFixPrompt: string;
    copied: string;
    severityLabels: Record<FindingSeverity, string>;
    categoryLabels: Record<FindingCategory, string>;
    readinessLabels: {
      'Ready to Ship': string;
      'Needs Fixes': string;
      'High Risk': string;
    };
    advisorTitle: string;
    stackContext: string;
    undoReset: string;
    resetThread: string;
    you: string;
    advisorName: string;
    now: string;
    copiedResponse: string;
    copy: string;
    copySnippet: string;
    copiedSnippet: string;
    codeBlockLabel: string;
    enterToSendHint: string;
    preparingChecks: string;
    retryMessage: string;
    chatPlaceholderPrefix: string;
    chatPlaceholderSuffix: string;
    chatInputAria: string;
    send: string;
    starterPrompts: string[];
    welcomeMessage: string;
    resetMessage: string;
    demoFocusDefault: string;
    exampleResultNotice: string;
    exampleReplyLabel: string;
    chatPrivacyNote: string;
    askAdvisorPrefix: string;
    askAdvisorMiddle: string;
    askAdvisorSuffix: string;
    errors: {
      invalidFileType: string;
      fileTooLarge: string;
      fileReadError: string;
      demoFailed: string;
      noScreenshot: string;
      auditFailed: string;
      chatFailed: string;
    };
    announcements: {
      screenshotLoaded: string;
      demoLoaded: string;
      screenshotRemoved: string;
      copied: string;
      auditComplete: (status: string, count: number) => string;
    };
  };
  proofPricingFaq: {
    trustHeading: string;
    trustSubheading: string;
    trustCards: Array<{
      title: string;
      detail: string;
    }>;
    pricingHeading: string;
    pricingSubheading: string;
    pricingDisclaimer: string;
    pricingPlans: Array<{
      id: PricingPlanId;
      name: string;
      priceRange: string;
      cadence: string;
      description: string;
      bullets: string[];
      cta: string;
      ctaRecorded: string;
    }>;
    faqHeading: string;
    faqItems: Array<{
      question: string;
      answer: string;
    }>;
  };
  funnel: {
    heading: string;
    subheading: string;
    benefitsLead: string;
    benefitsBody: string;
    countLabel: (count: number) => string;
    step1Title: string;
    emailLabel: string;
    emailPlaceholder: string;
    gdprLabelPrefix: string;
    gdprPrivacyLink: string;
    gdprLabelSuffix: string;
    step1Submit: string;
    step1Submitting: string;
    emailError: string;
    gdprError: string;
    fallbackError: string;
    confirmedTitleAlready: string;
    confirmedTitleNew: string;
    confirmedSubtitle: string;
    welcomeEmailNotice: string;
    shareTitle: string;
    shareX: string;
    shareLinkedIn: string;
    shareCopy: string;
    shareCopied: string;
    shareText: string;
    step2Badge: string;
    step2Title: string;
    step2Subtitle: string;
    builderLabel: string;
    databaseLabel: string;
    databaseOptions: Array<{ value: DatabaseTool; label: string }>;
    usersLabel: string;
    usersOptions: Array<{ value: UserScale; label: string }>;
    painLabel: string;
    painPoints: string[];
    planLabel: string;
    planOptions: Array<{ value: PricingPlanId; label: string }>;
    budgetLabel: string;
    budgetOptions: Array<{ value: MonthlyBudget; label: string }>;
    urlLabel: string;
    urlPlaceholder: string;
    ownershipCheckbox: string;
    ownershipError: string;
    urlError: string;
    interviewCheckbox: string;
    step2Submit: string;
    step2Submitting: string;
    step2SavedTitle: string;
    step2SavedSubtitle: string;
    editStep2: string;
    registerAnother: string;
  };
  footer: {
    tagline: string;
    legal: string;
    privacy: string;
    contact: string;
    copyright: string;
  };
  legalModals: {
    close: string;
    legalTitle: string;
    legalBody: string[];
    privacyTitle: string;
    privacyBody: string[];
    contactTitle: string;
    contactBody: string[];
    contactEmail: string;
  };
}

export const TRANSLATIONS: Record<Locale, SiteTranslations> = {
  fr: {
    meta: {
      title: 'Proofline — Ton app générée par IA est-elle vraiment sûre ?',
      description:
        'Reçois un audit de sécurité passif gratuit pour ton app Lovable, Bolt, Cursor, Replit ou v0 : clés exposées, base de données ouverte, parcours cassés. Sans jargon.',
    },
    skipLink: 'Aller au contenu principal',
    nav: {
      primaryAria: 'Navigation principale',
      mobileAria: 'Navigation mobile',
      report: 'Exemple',
      howItWorks: 'Fonctionnement',
      liveAudit: 'Démo',
      pricing: 'Tarifs',
      faq: 'FAQ',
      cta: 'Audit gratuit',
      openMenu: 'Ouvrir le menu de navigation',
      closeMenu: 'Fermer le menu de navigation',
      appearance: 'Apparence',
      language: 'Langue',
    },
    theme: {
      groupLabel: 'Thème visuel',
      dark: 'Sombre',
      light: 'Clair',
    },
    languageToggle: {
      groupLabel: 'Langue du site',
    },
    hero: {
      headline: 'Ton app générée par IA est-elle vraiment sûre ?',
      subheadline:
        'Modifie ton app avec l’IA sans peur. Reçois un audit gratuit de sécurité :clés exposées, base de données ouverte, accès non protégés. Explications claires, sans jargon.',
      emailLabel: 'Ton adresse e-mail',
      emailPlaceholder: 'toi@tonprojet.com',
      gdprLabelPrefix: 'J’accepte de recevoir des informations sur ce produit et que mes données soient traitées selon la',
      gdprPrivacyLink: 'politique de confidentialité',
      gdprLabelSuffix: '. Je peux me désinscrire à tout moment.',
      submit: 'Recevoir mon audit gratuit',
      submitting: 'Envoi...',
      reassurance: 'Gratuit · Sans carte bancaire · Tests passifs uniquement',
      jumpToAudit: 'Essayer l’audit de capture en direct',
      emailError: 'Saisis une adresse e-mail valide pour recevoir ton audit.',
      gdprError: 'Coche l’accord de confidentialité ci-dessus pour continuer.',
      fallbackError: 'Impossible d’enregistrer ton inscription pour le moment.',
      confirmedAlready: 'Tu es déjà inscrit pour recevoir ton audit gratuit.',
      confirmedNew: 'Ton audit gratuit est en route !',
      welcomeEmailNotice: 'Un e-mail de confirmation t’a été envoyé.',
      nextStepsLine: 'Prochaine étape : précise ton outil et l’URL de ton app (optionnel, 30 secondes) pour prioriser ton audit.',
      completeStep2Cta: 'Compléter mes infos d’audit (étape 2)',
      registerAnother: 'Inscrire une autre adresse',
      workbenchAria: 'Aperçu d’un rapport d’audit Proofline',
      highRisk: 'Exemple · Risque critique',
      runLiveCheck: 'Tester sur une capture',
      promptHeader: 'Action recommandée · À coller dans Bolt',
      promptBody:
        '« Déplace les clés secrètes Stripe dans une route serveur /api/checkout et active les règles RLS sur public.users avant de renvoyer des lignes clients. »',
      checks: [
        {
          severity: 'Critical',
          area: 'Clé secrète exposée',
          message: 'STRIPE_SECRET détectée dans le code JavaScript du navigateur',
          location: 'CheckoutForm.tsx:142',
        },
        {
          severity: 'Critical',
          area: 'Base de données ouverte',
          message: 'La table users renvoie 1 482 lignes sans être connecté',
          location: 'RLS_ENABLED=false',
        },
        {
          severity: 'Warning',
          area: 'Parcours mobile · 390px',
          message: 'Le bouton Payer sort de l’écran sur téléphone après modification',
          location: 'mobile-checkout',
        },
      ],
    },
    howItWorks: {
      heading: 'Tu livres vite. Mais est-ce que tout tient vraiment en production ?',
      subheading:
        'Lovable, Bolt, Cursor et Replit génèrent une app en quelques heures, sans vérifier ce qui reste ouvert ni ce qui casse après coup.',
      detectHeading: 'Ce que nous détectons',
      detections: [
        {
          title: 'Clés et données exposées',
          description:
            'Clés API dans le code du navigateur, tables Supabase ou Firebase sans règles d’accès, formulaires sans protection.',
        },
        {
          title: 'Parcours cassés',
          description:
            'Inscription, connexion, formulaires et paiement Stripe vérifiés sur ordinateur et mobile.',
        },
        {
          title: 'Régressions après modification',
          description:
            'Ton dernier aperçu comparé à la version qui fonctionnait : variable d’environnement oubliée, appel API en erreur.',
        },
        {
          title: 'Correctifs sans jargon',
          description:
            'Chaque problème arrive avec sa gravité, son impact et un prompt prêt à coller dans ton outil.',
        },
      ],
      stepsHeading: 'Comment ça marche en 3 étapes',
      steps: [
        {
          title: '1. Tu nous indiques ton app',
          description:
            'Ton lien de prévisualisation, avec ta certification de propriété, ou une capture d’écran.',
        },
        {
          title: '2. Nous vérifions sans rien casser',
          description: 'Des contrôles passifs des clés, des règles d’accès et des parcours critiques.',
        },
        {
          title: '3. Tu reçois un rapport clair',
          description: 'En français simple, avec les correctifs à coller.',
        },
      ],
      audienceHeading: 'Pour qui ?',
      audiences: [
        {
          title: 'Créateurs sur Lovable, Bolt, Replit & Cursor',
          description: 'Tu as déjà des utilisateurs sur Supabase ou Firebase, avec Stripe.',
        },
        {
          title: 'Freelances livrant des apps IA',
          description: 'Tu veux un contrôle avant de remettre l’app à ton client.',
        },
        {
          title: 'Fondateurs sans équipe technique',
          description: 'Tu fais évoluer ton produit chaque semaine sans développeur pour relire.',
        },
      ],
    },
    sampleReport: {
      heading: 'Voici à quoi ressemble un rapport.',
      intro:
        'L’application et les résultats ci-dessous sont fictifs. Ils montrent la forme du rapport.',
      openLabel: 'Ouvrir le rapport d’exemple',
      closeLabel: 'Fermer le rapport d’exemple',
      appLabel: 'Exemple fictif · pay-beta.my-bolt-app.com',
      summary:
        '2 problèmes critiques et 1 point d’attention. Priorité : retirer la clé secrète du navigateur et fermer l’accès à la table users avant de partager le lien.',
      evidenceLabel: 'Constat :',
      impactLabel: 'Conséquence :',
      fixLabel: 'Prompt correctif',
      findings: [
        {
          severity: 'Critical',
          title: 'Clé secrète Stripe visible dans le navigateur',
          evidence: 'STRIPE_SECRET présente dans le code JavaScript (CheckoutForm.tsx:142).',
          impact: 'Un visiteur peut s’en servir pour agir sur ton compte Stripe.',
          fix: 'Révoque la clé secrète Stripe, puis déplace tous les appels qui l’utilisent dans une route serveur /api/checkout.',
        },
        {
          severity: 'Critical',
          title: 'La table users est lisible sans connexion',
          evidence: 'RLS désactivé : 1 482 lignes renvoyées à un visiteur non connecté.',
          impact: 'Les données de tes utilisateurs sont exposées.',
          fix: 'Active Row Level Security sur public.users et limite la lecture et la modification à auth.uid() = id.',
        },
        {
          severity: 'Warning',
          title: 'Bouton Payer coupé sur mobile',
          evidence: 'À 390 px de large, le bouton sort de l’écran depuis la dernière modification.',
          impact: 'Un client sur téléphone peut ne pas réussir à payer.',
          fix: 'Place les boutons dans un conteneur flex responsive (gap-3, w-full sm:w-auto) et vérifie le paiement à 390 px.',
        },
      ],
      flowHeading: 'Parcours vérifiés',
      flowSteps: [
        { step: 'Inscription (/signup)', desktop: '200 OK', mobile: '200 OK', status: 'pass' },
        { step: 'Vérification de session', desktop: 'JWT isolé', mobile: 'JWT isolé', status: 'pass' },
        { step: 'Paiement Stripe', desktop: '200 OK', mobile: 'Bouton coupé', status: 'warn' },
      ],
      diffHeading: 'Avant et après la dernière modification',
      beforeLabel: 'Avant :',
      afterLabel: 'Après :',
      diffs: [
        { check: 'Redirection après connexion', before: '200 OK', after: '200 OK', status: 'pass' },
        { check: 'Secrets dans le code public', before: '0', after: '1', status: 'fail' },
      ],
      limits:
        'Un audit passif porte uniquement sur ce qui est observable. Il ne garantit pas l’absence d’autres failles.',
    },
    studio: {
      badge: 'Démo interactive',
      heading: 'Teste dès maintenant l’audit sur une capture d’écran.',
      subheading:
        'Dépose ou colle une capture de ton app Lovable, Bolt ou Cursor (dont tu es propriétaire) pour voir un exemple d’analyse immédiate — ou pose une question au conseiller.',
      tablistAria: 'Modes du studio de démonstration',
      tabScreenshot: 'Audit de capture',
      tabChat: 'Conseiller QA & Sécurité',
      uploadLabel: 'Capture d’écran de ton application',
      loadDemo: 'Charger une capture de démo',
      remove: 'Retirer',
      dropTitle: 'Dépose, parcours ou colle une capture (Ctrl+V)',
      dropHint:
        'PNG, JPEG ou WebP jusqu’à 8 Mo · Uniquement tes propres apps · La capture est envoyée à Google Gemini : masque tes clés et les données clients',
      uploadedAltFallback: 'Capture d’écran importée',
      replace: 'Remplacer',
      builtWith: 'Créé avec',
      focusArea: 'Zone à vérifier (optionnel)',
      focusPlaceholder: 'ex. Écran auth ou paiement',
      runAudit: 'Lancer l’audit sur la capture',
      inspecting: 'Analyse en cours...',
      checkingTitle: 'Recherche d’expositions visibles, défauts de parcours et problèmes d’interface',
      checkingSubtitlePrefix: 'Inspection de ta capture',
      checkingSubtitleSuffix: 'et rédaction des prompts correctifs...',
      emptyTitle: 'Le rapport de diagnostic apparaîtra ici',
      emptyDescBefore: 'Importe une capture de connexion, tableau de bord ou paiement — ou clique sur',
      emptyDescAfter:
        'pour voir comment Proofline explique les risques sans jargon.',
      findingSingular: 'constat',
      findingPlural: 'constats',
      auditSummary: 'Résumé du diagnostic',
      copyAllFixes: 'Copier tous les correctifs',
      copiedAllFixes: 'Tous copiés',
      askAdvisor: 'Demander au conseiller',
      pasteInto: 'À coller dans',
      copyFixPrompt: 'Copier le prompt',
      copied: 'Copié',
      severityLabels: {
        Critical: 'Critique',
        Warning: 'Attention',
        Suggestion: 'Amélioration',
      },
      categoryLabels: {
        Security: 'Sécurité',
        'Broken Flow': 'Parcours cassé',
        'Layout & UX': 'Interface & UX',
        Accessibility: 'Accessibilité',
      },
      readinessLabels: {
        'Ready to Ship': 'Aucun blocage visible',
        'Needs Fixes': 'À corriger',
        'High Risk': 'Exposition critique',
      },
      advisorTitle: 'Conseiller QA & Sécurité',
      stackContext: 'Outil :',
      undoReset: 'Annuler',
      resetThread: 'Réinitialiser',
      you: 'Toi',
      advisorName: 'Conseiller Proofline',
      now: 'Maintenant',
      copiedResponse: 'Réponse copiée',
      copy: 'Copier',
      copySnippet: 'Copier',
      copiedSnippet: 'Copié',
      codeBlockLabel: 'Extrait',
      enterToSendHint: 'Entrée pour envoyer · Maj+Entrée pour une ligne',
      preparingChecks: 'Analyse de ta question et préparation des vérifications...',
      retryMessage: 'Réessayer',
      chatPlaceholderPrefix: 'Pose une question sécurité ou QA sur ton app',
      chatPlaceholderSuffix: '...',
      chatInputAria: 'Poser une question QA ou sécurité au conseiller Proofline',
      send: 'Envoyer',
      starterPrompts: [
        'Comment vérifier si mes clés ou tables Supabase sont exposées dans une app Lovable ?',
        'Mon app Bolt fonctionne en aperçu mais la connexion échoue sur mon domaine personnalisé.',
        'Quels 5 contrôles faire avant d’encaisser de vrais paiements Stripe sur un MVP Cursor ?',
      ],
      welcomeMessage:
        'Pose-moi une question sur un parcours fragile, une règle d’accès Supabase/Firebase ou un bug sur ton app Lovable, Bolt, Cursor ou Replit. Je t’indique quoi vérifier et comment le corriger simplement.',
      resetMessage:
        'Conversation réinitialisée. Pose ta question sur la sécurité ou la fiabilité de ton application.',
      demoFocusDefault: 'Vérifier les secrets exposés, le paiement mobile cassé et les fuites de données.',
      exampleResultNotice:
        'Exemple préécrit : l’analyse en direct est indisponible. Ces constats ne viennent pas d’une lecture de ta capture.',
      exampleReplyLabel: 'Réponse type préécrite · conseiller en direct indisponible',
      chatPrivacyNote: 'Tes messages sont envoyés à Google Gemini : n’y colle ni clé ni donnée personnelle.',
      askAdvisorPrefix: 'Dans mon app',
      askAdvisorMiddle: ', le diagnostic a signalé',
      askAdvisorSuffix: 'Comment vérifier ce correctif sans tout casser ?',
      errors: {
        invalidFileType: 'Sélectionne une image PNG, JPEG ou WebP.',
        fileTooLarge: 'La capture doit faire moins de 8 Mo.',
        fileReadError: 'Impossible de lire le fichier image.',
        demoFailed: 'Impossible de générer la capture de démo dans ce navigateur.',
        noScreenshot: 'Importe une capture ou charge la capture de démo d’abord.',
        auditFailed: 'Impossible de finaliser l’audit de la capture.',
        chatFailed: 'Impossible de joindre le conseiller QA pour le moment.',
      },
      announcements: {
        screenshotLoaded: 'Capture chargée et prête pour l’audit.',
        demoLoaded: 'Capture de démonstration chargée.',
        screenshotRemoved: 'Capture retirée.',
        copied: 'Copié dans le presse-papiers.',
        auditComplete: (status, count) =>
          `Audit terminé : ${status}, ${count} ${count === 1 ? 'constat' : 'constats'}.`,
      },
    },
    proofPricingFaq: {
      trustHeading: 'Transparence et confidentialité avant tout.',
      trustSubheading:
        'Proofline est actuellement en phase de validation avec ses premiers utilisateurs. Aucun faux témoignage : voici nos engagements concrets.',
      trustCards: [
        {
          title: 'Vérifications passives uniquement',
          detail:
            'Seulement sur les applications dont tu certifies être propriétaire. Aucun test destructif ni surcharge de ton serveur.',
        },
        {
          title: 'Ce que deviennent tes captures',
          detail:
            'Proofline n’enregistre pas tes captures. Elles sont envoyées à Google Gemini pour l’analyse et traitées selon les conditions de Google : masque toute donnée sensible avant l’envoi.',
        },
      ],
      pricingHeading: 'Tarifs indicatifs envisagés',
      pricingSubheading:
        'Ces formules sont en cours de test pour orienter le produit : cliquer sur « Ça m’intéresse » enregistre simplement ton intérêt, sans aucun paiement.',
      pricingDisclaimer: 'Montants indicatifs à l’étude — aucun paiement demandé pendant la bêta.',
      pricingPlans: [
        {
          id: 'one-time',
          name: 'Audit unique',
          priceRange: '19 – 49 €',
          cadence: 'ponctuel',
          description: 'Idéal avant un lancement Product Hunt, une démo client ou l’ouverture des paiements.',
          bullets: [
            'Contrôle complet des clés et règles d’accès',
            'Test des parcours connexion et paiement',
            'Rapport clair + prompts correctifs prêts à coller',
          ],
          cta: 'Ça m’intéresse',
          ctaRecorded: 'Intérêt enregistré ✓',
        },
        {
          id: 'monthly',
          name: 'Suivi mensuel',
          priceRange: '29 – 49 €',
          cadence: '/ mois',
          description: 'Pour les créateurs qui publient chaque semaine et veulent éviter les régressions silencieuses.',
          bullets: [
            'Vérifications automatiques après modification',
            'Alertes immédiates en cas de fuite ou panne',
            'Historique avant / après chaque mise à jour',
          ],
          cta: 'Ça m’intéresse',
          ctaRecorded: 'Intérêt enregistré ✓',
        },
        {
          id: 'agency',
          name: 'Équipe / agence',
          priceRange: '99 €+',
          cadence: '/ mois',
          description: 'Pensé pour les freelances et petites équipes qui livrent plusieurs apps IA à des clients.',
          bullets: [
            'Multi-projets pour tes clients',
            'Rapports partageables avant livraison',
            'Contrôles prioritaires sur plusieurs environnements',
          ],
          cta: 'Ça m’intéresse',
          ctaRecorded: 'Intérêt enregistré ✓',
        },
      ],
      faqHeading: 'Questions fréquentes',
      faqItems: [
        {
          question: 'Que deviennent mon code et mes données ?',
          answer:
            'Les audits passifs portent uniquement sur le comportement public de ton aperçu ou sur les captures fournies : nous ne demandons pas ton code source. Dans la démo, tes captures et messages sont envoyés à Google Gemini. Le détail des prestataires figure dans la politique de confidentialité.',
        },
        {
          question: 'As-tu besoin d’un accès à mon app ?',
          answer:
            'Pas nécessairement pour démarrer : l’URL publique de prévisualisation (avec ta confirmation de propriété) suffit pour détecter les clés exposées, règles d’accès ouvertes et parcours cassés.',
        },
        {
          question: 'Est-ce que ça marche avec Lovable, Bolt, Replit et Cursor ?',
          answer:
            'Oui. Proofline est conçu pour les applications générées avec Lovable, Bolt, Replit, Cursor et v0, notamment lorsqu’elles utilisent Supabase, Firebase ou Stripe.',
        },
        {
          question: 'Quand sera-t-il disponible ?',
          answer:
            'Nous réalisons actuellement les premiers audits manuels et assistés avec les inscrits de la liste prioritaire afin d’ajuster le produit à tes besoins réels.',
        },
        {
          question: 'Combien ça coûtera ?',
          answer:
            'Pendant cette phase de validation, ton premier audit est gratuit. Les formules indicatives vont d’environ 19–49 € pour un audit ponctuel à 29–49 €/mois pour un suivi continu, selon tes retours.',
        },
      ],
    },
    funnel: {
      heading: 'Reçois ton audit gratuit de sécurité.',
      subheading:
        'Un e-mail suffit pour démarrer. Tu pourras ensuite, si tu le souhaites, nous indiquer ton outil, ta formule préférée ou le lien de ton application.',
      benefitsLead: 'Ce que tu obtiens :',
      benefitsBody:
        'un contrôle passif de ton app (clés exposées, base de données ouverte, parcours cassés) et des explications claires sans jargon.',
      countLabel: (count) =>
        `${count} ${count === 1 ? 'fondateur s’est' : 'fondateurs se sont'} déjà inscrit${count === 1 ? '' : 's'} depuis cet espace.`,
      step1Title: 'Étape 1 sur 2 — Ton e-mail suffit pour commencer',
      emailLabel: 'Adresse e-mail',
      emailPlaceholder: 'toi@tonprojet.com',
      gdprLabelPrefix: 'J’accepte de recevoir des informations sur ce produit et que mes données soient traitées selon la',
      gdprPrivacyLink: 'politique de confidentialité',
      gdprLabelSuffix: '. Je peux me désinscrire à tout moment.',
      step1Submit: 'Recevoir mon audit gratuit',
      step1Submitting: 'Inscription...',
      emailError: 'Saisis une adresse e-mail valide.',
      gdprError: 'Coche la case d’accord RGPD pour continuer.',
      fallbackError: 'Impossible de finaliser l’inscription. Réessaie dans un instant.',
      confirmedTitleAlready: 'Tu es déjà inscrit pour l’audit gratuit.',
      confirmedTitleNew: 'Ton audit de sécurité est en route !',
      confirmedSubtitle:
        'Nous avons bien enregistré ton adresse. Tu peux compléter les questions facultatives ci-dessous pour accélérer ton audit et orienter le produit.',
      welcomeEmailNotice: 'Un e-mail de bienvenue vient de t’être envoyé.',
      shareTitle: 'Partager avec d’autres créateurs :',
      shareX: 'Partager sur X',
      shareLinkedIn: 'LinkedIn',
      shareCopy: 'Copier le lien',
      shareCopied: 'Lien copié',
      shareText: 'Je viens de demander un audit sécurité gratuit pour mon app IA sur Proofline.',
      step2Badge: 'Étape 2 (facultative · 30 secondes)',
      step2Title: 'Aide-nous à personnaliser ton audit gratuit',
      step2Subtitle:
        'Chaque réponse est optionnelle mais nous permet de préparer un audit adapté à ta stack et à ton budget.',
      builderLabel: 'Outil utilisé pour créer ton app',
      databaseLabel: 'Base de données',
      databaseOptions: [
        { value: 'Supabase', label: 'Supabase' },
        { value: 'Firebase', label: 'Firebase' },
        { value: 'Other', label: 'Autre' },
        { value: 'Unknown', label: 'Je ne sais pas' },
      ],
      usersLabel: 'Combien d’utilisateurs a ton app ?',
      usersOptions: [
        { value: '0', label: '0 (pas encore lancée)' },
        { value: '1-50', label: '1 – 50 utilisateurs' },
        { value: '51-500', label: '51 – 500 utilisateurs' },
        { value: '500+', label: '500+ utilisateurs' },
      ],
      painLabel: 'Ta plus grande crainte',
      painPoints: [
        'Failles de sécurité',
        'Bugs après modification',
        'Perte de données',
        'Autre',
      ],
      planLabel: 'Quelle formule t’intéresse ?',
      planOptions: [
        { value: 'one-time', label: 'Audit unique (19–49 €)' },
        { value: 'monthly', label: 'Suivi mensuel (29–49 €/mois)' },
        { value: 'agency', label: 'Équipe / agence (99 €+/mois)' },
      ],
      budgetLabel: 'Combien paierais-tu par mois pour être tranquille ?',
      budgetOptions: [
        { value: '<20', label: 'Moins de 20 €/mois' },
        { value: '20-49', label: '20 – 49 €/mois' },
        { value: '50-99', label: '50 – 99 €/mois' },
        { value: '100+', label: '100 €/mois et plus' },
      ],
      urlLabel: 'Lien de ton app pour l’audit gratuit (optionnel)',
      urlPlaceholder: 'https://monapp.lovable.app',
      ownershipCheckbox: 'Je certifie être propriétaire de cette application et j’autorise uniquement des vérifications passives non destructrices.',
      ownershipError: 'Coche la confirmation de propriété pour demander l’audit de ce lien.',
      urlError: 'Saisis une URL http ou https valide (par exemple monapp.lovable.app).',
      interviewCheckbox: 'J’accepte un court entretien de 15 minutes pour partager mon retour.',
      step2Submit: 'Enregistrer mes réponses',
      step2Submitting: 'Enregistrement...',
      step2SavedTitle: 'Merci ! Tes préférences d’audit sont enregistrées.',
      step2SavedSubtitle: 'Nous reviendrons vers toi très vite avec les résultats ou pour planifier ton audit.',
      editStep2: 'Modifier mes réponses',
      registerAnother: 'Inscrire une autre adresse e-mail',
    },
    footer: {
      tagline:
        'Audit de sécurité et vérification continue pour tes apps Lovable, Bolt, Cursor, Replit et v0.',
      legal: 'Mentions légales',
      privacy: 'Politique de confidentialité',
      contact: 'Contact',
      copyright: '© 2026 Proofline',
    },
    legalModals: {
      close: 'Fermer',
      legalTitle: 'Mentions légales',
      legalBody: [
        'Proofline est un projet de validation porté par une équipe indépendante dédiée à la qualité et à la sécurité des applications générées par IA.',
        'Hébergement du site : Vercel Inc. (vercel.com), accessible en HTTPS.',
        'Règle éthique d’audit : seules les applications dont le demandeur certifie être propriétaire sont soumises à des vérifications passives et non intrusives.',
      ],
      privacyTitle: 'Politique de confidentialité (RGPD)',
      privacyBody: [
        'Données collectées : adresse e-mail et accord de confidentialité ; réponses facultatives (outil, base de données, nombre d’utilisateurs, crainte, formule, budget, URL de l’app, certification de propriété, accord pour un entretien) ; langue, paramètres UTM, page de provenance ; clics sur les formules tarifaires, associés à ton e-mail si tu l’as saisi. Une copie reste dans le stockage local de ton navigateur.',
        'Démo (captures et messages) : ils transitent par notre serveur vers l’API Google Gemini, qui produit l’analyse ou la réponse. Proofline ne les enregistre pas. Google les traite selon les conditions de l’API Gemini (ai.google.dev/gemini-api/terms) : selon l’offre et le pays, ils peuvent être conservés un temps limité, utilisés pour améliorer ses services et relus par des personnes. N’envoie ni clé secrète ni donnée personnelle.',
        'Prestataires : Vercel (hébergement et journaux techniques, dont l’adresse IP), Supabase (base de données des inscriptions), Resend (envoi des e-mails), Google (API Gemini, et polices Google Fonts dont le chargement transmet ton adresse IP). Certains peuvent traiter des données hors de l’Union européenne.',
        'Finalité : envoi de ton audit gratuit, suivi du programme pilote et mesure d’intérêt produit. Aucune revente de données.',
        'Durée & droits : données conservées au maximum 12 mois après le dernier contact. Tu disposes d’un droit d’accès, de rectification et de suppression, sur simple demande à notre adresse de contact ou en répondant « Désinscription » à nos e-mails.',
      ],
      contactTitle: 'Contact & suppression des données',
      contactBody: [
        'Une question sur ton audit, un partenariat ou une demande de suppression de tes données RGPD ?',
        'Écris-nous directement en précisant l’adresse e-mail utilisée lors de ton inscription.',
      ],
      contactEmail: 'bonjour@proofline.app',
    },
  },
  en: {
    meta: {
      title: 'Proofline — Is Your AI-Generated App Actually Secure?',
      description:
        'Get a free passive security audit for your Lovable, Bolt, Cursor, Replit, or v0 app: exposed keys, open tables, unprotected endpoints. Clear answers, zero jargon.',
    },
    skipLink: 'Skip to main content',
    nav: {
      primaryAria: 'Primary',
      mobileAria: 'Mobile navigation',
      report: 'Example',
      howItWorks: 'How it works',
      liveAudit: 'Live Demo',
      pricing: 'Pricing',
      faq: 'FAQ',
      cta: 'Free Audit',
      openMenu: 'Open navigation menu',
      closeMenu: 'Close navigation menu',
      appearance: 'Appearance',
      language: 'Language',
    },
    theme: {
      groupLabel: 'Color theme',
      dark: 'Dark',
      light: 'Light',
    },
    languageToggle: {
      groupLabel: 'Site language',
    },
    hero: {
      headline: 'Is your AI-generated app actually secure?',
      subheadline:
        'Update your app with AI without the fear. Get a free passive security audit:leaked keys, open databases, unprotected access. Plain English, zero jargon.',
      emailLabel: 'Your email address',
      emailPlaceholder: 'you@yourproject.com',
      gdprLabelPrefix: 'I agree to receive updates about this product and have my data processed under the',
      gdprPrivacyLink: 'privacy policy',
      gdprLabelSuffix: '. I can unsubscribe at any time.',
      submit: 'Get My Free Audit',
      submitting: 'Submitting...',
      reassurance: 'Free · No credit card · Passive checks only',
      jumpToAudit: 'Try the live screenshot demo',
      emailError: 'Enter a valid email address so we can send your audit.',
      gdprError: 'Please accept the privacy policy above to continue.',
      fallbackError: 'Could not save your signup right now. Please try again.',
      confirmedAlready: 'You are already registered for a free audit.',
      confirmedNew: 'Your free security audit is on the way!',
      welcomeEmailNotice: 'A confirmation email has been sent to your inbox.',
      nextStepsLine: 'Next step: optionally share your builder stack and app URL (30 seconds) so we can prioritize your audit.',
      completeStep2Cta: 'Complete audit details (Step 2)',
      registerAnother: 'Register another email',
      workbenchAria: 'Sample Proofline audit report',
      highRisk: 'Example · Critical Risk',
      runLiveCheck: 'Try on a screenshot',
      promptHeader: 'Recommended fix · Paste into Bolt',
      promptBody:
        '“Move Stripe secret keys into a server route at /api/checkout and enforce RLS on public.users before returning customer rows.”',
      checks: [
        {
          severity: 'Critical',
          area: 'Exposed Secret Key',
          message: 'STRIPE_SECRET found in client-side browser JS bundle',
          location: 'CheckoutForm.tsx:142',
        },
        {
          severity: 'Critical',
          area: 'Open Database Table',
          message: 'public.users returns 1,482 rows without authentication',
          location: 'RLS_ENABLED=false',
        },
        {
          severity: 'Warning',
          area: 'Mobile Flow · 390px',
          message: 'Primary Pay button clips outside viewport after recent edit',
          location: 'mobile-checkout',
        },
      ],
    },
    howItWorks: {
      heading: 'You ship fast. But does everything hold up in production?',
      subheading:
        'Lovable, Bolt, Cursor, and Replit build an app in hours, without checking what stays exposed or what breaks afterwards.',
      detectHeading: 'What we detect',
      detections: [
        {
          title: 'Exposed keys and data',
          description:
            'API keys in browser code, Supabase or Firebase tables without access rules, unprotected forms.',
        },
        {
          title: 'Broken flows',
          description: 'Sign-up, login, forms, and Stripe checkout checked on desktop and mobile.',
        },
        {
          title: 'Regressions after an edit',
          description:
            'Your latest preview compared with the last working version: missing environment variable, failing API call.',
        },
        {
          title: 'Fixes without jargon',
          description:
            'Every issue comes with its severity, its impact, and a prompt ready to paste into your tool.',
        },
      ],
      stepsHeading: 'How it works in 3 steps',
      steps: [
        {
          title: '1. Point us to your app',
          description: 'Your preview link, with your ownership certification, or a screenshot.',
        },
        {
          title: '2. We check without breaking anything',
          description: 'Passive checks of keys, access rules, and critical flows.',
        },
        {
          title: '3. Get a clear report',
          description: 'Plain English, with fixes ready to paste.',
        },
      ],
      audienceHeading: 'Who is it for?',
      audiences: [
        {
          title: 'Creators on Lovable, Bolt, Replit & Cursor',
          description: 'You already have users on Supabase or Firebase, with Stripe.',
        },
        {
          title: 'Freelancers shipping AI-built apps',
          description: 'You want a check before handing the app to your client.',
        },
        {
          title: 'Non-technical founders',
          description: 'You ship updates weekly without a developer to review them.',
        },
      ],
    },
    sampleReport: {
      heading: 'Here is what a report looks like.',
      intro: 'The app and results below are fictional. They show the shape of the report.',
      openLabel: 'Open the sample report',
      closeLabel: 'Close the sample report',
      appLabel: 'Fictional example · pay-beta.my-bolt-app.com',
      summary:
        '2 critical issues and 1 warning. Priority: remove the secret key from the browser and close access to the users table before sharing the link.',
      evidenceLabel: 'Finding:',
      impactLabel: 'Impact:',
      fixLabel: 'Fix prompt',
      findings: [
        {
          severity: 'Critical',
          title: 'Stripe secret key visible in the browser',
          evidence: 'STRIPE_SECRET found in client-side JavaScript (CheckoutForm.tsx:142).',
          impact: 'A visitor can use it to act on your Stripe account.',
          fix: 'Revoke the Stripe secret key, then move every call that uses it into a server route at /api/checkout.',
        },
        {
          severity: 'Critical',
          title: 'The users table is readable without signing in',
          evidence: 'RLS disabled: 1,482 rows returned to a signed-out visitor.',
          impact: 'Your users’ data is exposed.',
          fix: 'Enable Row Level Security on public.users and limit reads and updates to auth.uid() = id.',
        },
        {
          severity: 'Warning',
          title: 'Pay button clipped on mobile',
          evidence: 'At 390px wide, the button leaves the screen since the latest edit.',
          impact: 'A customer on a phone may fail to pay.',
          fix: 'Put the buttons in a responsive flex container (gap-3, w-full sm:w-auto) and test checkout at 390px.',
        },
      ],
      flowHeading: 'Flows checked',
      flowSteps: [
        { step: 'Sign up (/signup)', desktop: '200 OK', mobile: '200 OK', status: 'pass' },
        { step: 'Session check', desktop: 'JWT scoped', mobile: 'JWT scoped', status: 'pass' },
        { step: 'Stripe checkout', desktop: '200 OK', mobile: 'Button clipped', status: 'warn' },
      ],
      diffHeading: 'Before and after the latest edit',
      beforeLabel: 'Before:',
      afterLabel: 'After:',
      diffs: [
        { check: 'Redirect after login', before: '200 OK', after: '200 OK', status: 'pass' },
        { check: 'Secrets in public code', before: '0', after: '1', status: 'fail' },
      ],
      limits:
        'A passive audit only covers what can be observed. It does not guarantee that no other flaw exists.',
    },
    studio: {
      badge: 'Interactive Demo',
      heading: 'Try a live screenshot audit right now.',
      subheading:
        'Upload or paste a screenshot of an app you own from Lovable, Bolt, or Cursor to preview an instant diagnostic—or ask our QA advisor a question.',
      tablistAria: 'Live Demo Studio modes',
      tabScreenshot: 'Screenshot Audit',
      tabChat: 'QA & Security Advisor',
      uploadLabel: 'App screenshot',
      loadDemo: 'Load demo app screenshot',
      remove: 'Remove',
      dropTitle: 'Drop, browse, or paste screenshot (Ctrl+V)',
      dropHint:
        'PNG, JPEG, or WebP up to 8 MB · Only apps you own · The screenshot is sent to Google Gemini: hide keys and customer data',
      uploadedAltFallback: 'Uploaded application screenshot',
      replace: 'Replace',
      builtWith: 'Built with',
      focusArea: 'Focus area (optional)',
      focusPlaceholder: 'e.g., Auth or checkout',
      runAudit: 'Run Screenshot Audit',
      inspecting: 'Inspecting screenshot...',
      checkingTitle: 'Checking visible exposures, broken flow cues, and layout issues',
      checkingSubtitlePrefix: 'Reviewing your',
      checkingSubtitleSuffix: 'screenshot and drafting copy-ready repair prompts...',
      emptyTitle: 'Your diagnostic report appears here',
      emptyDescBefore: 'Upload a screenshot of any login page, dashboard, or checkout modal—or click',
      emptyDescAfter:
        'to see how Proofline explains risks in plain English.',
      findingSingular: 'finding',
      findingPlural: 'findings',
      auditSummary: 'Audit Summary',
      copyAllFixes: 'Copy all fixes',
      copiedAllFixes: 'Copied all fixes',
      askAdvisor: 'Ask Advisor',
      pasteInto: 'Paste into',
      copyFixPrompt: 'Copy fix prompt',
      copied: 'Copied',
      severityLabels: {
        Critical: 'Critical',
        Warning: 'Warning',
        Suggestion: 'Suggestion',
      },
      categoryLabels: {
        Security: 'Security',
        'Broken Flow': 'Broken Flow',
        'Layout & UX': 'Layout & UX',
        Accessibility: 'Accessibility',
      },
      readinessLabels: {
        'Ready to Ship': 'No Visible Blockers',
        'Needs Fixes': 'Needs Fixes',
        'High Risk': 'Critical Exposure',
      },
      advisorTitle: 'QA & Security Advisor',
      stackContext: 'Stack:',
      undoReset: 'Undo',
      resetThread: 'Reset thread',
      you: 'You',
      advisorName: 'Proofline Advisor',
      now: 'Now',
      copiedResponse: 'Copied response',
      copy: 'Copy',
      copySnippet: 'Copy',
      copiedSnippet: 'Copied',
      codeBlockLabel: 'Snippet',
      enterToSendHint: 'Enter to send · Shift+Enter for a new line',
      preparingChecks: 'Reviewing your question and preparing checks...',
      retryMessage: 'Retry message',
      chatPlaceholderPrefix: 'Ask about testing, auth, or security in your',
      chatPlaceholderSuffix: 'app...',
      chatInputAria: 'Ask Proofline Advisor a QA or security question',
      send: 'Send',
      starterPrompts: [
        'How do I check if my Supabase keys or tables are exposed in a Lovable app?',
        'My Bolt app works in preview but login fails after deploying to a custom domain.',
        'What 5 checks should I run before taking real Stripe payments on a Cursor MVP?',
      ],
      welcomeMessage:
        'Ask me about any fragile flow, Supabase/Firebase access rule, or bug in your Lovable, Bolt, Cursor, or Replit app. I can walk you through what to check and write a copy-ready repair prompt.',
      resetMessage:
        'Conversation reset. Ask anything about testing, securing, or fixing your AI-built app.',
      demoFocusDefault: 'Check for exposed secrets, broken checkout layout, and data leaks.',
      exampleResultNotice:
        'Pre-written example: live analysis is unavailable. These findings do not come from reading your screenshot.',
      exampleReplyLabel: 'Pre-written sample reply · live advisor unavailable',
      chatPrivacyNote: 'Your messages are sent to Google Gemini: do not paste keys or personal data.',
      askAdvisorPrefix: 'In my',
      askAdvisorMiddle: 'app, Proofline flagged',
      askAdvisorSuffix: 'How should I verify the fix safely?',
      errors: {
        invalidFileType: 'Please choose a PNG, JPEG, or WebP screenshot.',
        fileTooLarge: 'Screenshot must be smaller than 8 MB.',
        fileReadError: 'Could not read the selected image file.',
        demoFailed: 'Could not generate the sample screenshot in this browser.',
        noScreenshot: 'Upload a screenshot or load the demo screenshot first.',
        auditFailed: 'Could not complete the screenshot audit.',
        chatFailed: 'Could not reach the QA advisor right now.',
      },
      announcements: {
        screenshotLoaded: 'Screenshot loaded and ready for audit.',
        demoLoaded: 'Demo app screenshot loaded.',
        screenshotRemoved: 'Screenshot removed.',
        copied: 'Copied to clipboard.',
        auditComplete: (status, count) =>
          `Screenshot audit complete: ${status}, ${count} ${count === 1 ? 'finding' : 'findings'}.`,
      },
    },
    proofPricingFaq: {
      trustHeading: 'Honest standards and privacy by default.',
      trustSubheading:
        'Proofline is in early validation with pilot builders. Rather than fabricated testimonials, here are our verifiable commitments.',
      trustCards: [
        {
          title: 'Passive checks only',
          detail:
            'Only on applications you certify you own. No destructive testing and no load on your server.',
        },
        {
          title: 'What happens to your screenshots',
          detail:
            'Proofline does not save your screenshots. They are sent to Google Gemini for analysis and handled under Google’s terms: hide any sensitive data before uploading.',
        },
      ],
      pricingHeading: 'Indicative plans under consideration',
      pricingSubheading:
        'We are testing which pricing fits best before launch. Clicking “I’m interested” only logs interest—no payment is collected.',
      pricingDisclaimer: 'Indicative pricing test only — free during validation.',
      pricingPlans: [
        {
          id: 'one-time',
          name: 'One-time audit',
          priceRange: '€19 – €49',
          cadence: 'one-off',
          description: 'Best before a launch, client handoff, or enabling live Stripe payments.',
          bullets: [
            'Full exposed-key & database-rule check',
            'Login, signup & checkout flow inspection',
            'Plain-English report + copy-ready fix prompts',
          ],
          cta: 'I’m interested',
          ctaRecorded: 'Interest noted ✓',
        },
        {
          id: 'monthly',
          name: 'Monthly monitoring',
          priceRange: '€29 – €49',
          cadence: '/ month',
          description: 'For active builders shipping weekly AI edits who want to catch silent regressions.',
          bullets: [
            'Automated checks after new updates',
            'Immediate alerts for leaks or broken flows',
            'Before/after verification history',
          ],
          cta: 'I’m interested',
          ctaRecorded: 'Interest noted ✓',
        },
        {
          id: 'agency',
          name: 'Team / Agency',
          priceRange: '€99+',
          cadence: '/ month',
          description: 'For freelancers and lean studios delivering multiple AI-built client apps.',
          bullets: [
            'Multi-project client workspaces',
            'Shareable pre-delivery audit reports',
            'Priority checks across staging & production',
          ],
          cta: 'I’m interested',
          ctaRecorded: 'Interest noted ✓',
        },
      ],
      faqHeading: 'Frequently asked questions',
      faqItems: [
        {
          question: 'What happens to my code and data?',
          answer:
            'Passive audits only look at your preview’s public behavior or the screenshots you provide: we do not ask for your source code. In the demo, your screenshots and messages are sent to Google Gemini. The privacy policy lists our providers.',
        },
        {
          question: 'Do you need repository or admin access to my app?',
          answer:
            'Not to start: your preview URL (with ownership confirmation) is enough to spot exposed keys, open database rules, and broken public flows.',
        },
        {
          question: 'Does it work with Lovable, Bolt, Replit, and Cursor?',
          answer:
            'Yes. Proofline is built specifically for apps created with Lovable, Bolt, Replit, Cursor, and v0—especially stacks using Supabase, Firebase, and Stripe.',
        },
        {
          question: 'When will it be available?',
          answer:
            'We are onboarding early builders now with manual and AI-assisted audits to shape the product around real launch needs.',
        },
        {
          question: 'How much will it cost?',
          answer:
            'Your initial validation audit is free. Indicative pricing ranges from €19–49 for a one-time audit to €29–49/month for ongoing monitoring.',
        },
      ],
    },
    funnel: {
      heading: 'Get your free security audit.',
      subheading:
        'An email is all it takes to start. Optionally share your builder stack, preferred plan, or app URL in step 2.',
      benefitsLead: 'What you receive:',
      benefitsBody:
        'a passive check of your app (exposed keys, open database tables, broken flows) with clear plain-English fixes.',
      countLabel: (count) =>
        `${count} ${count === 1 ? 'builder has' : 'builders have'} requested an audit from this workspace.`,
      step1Title: 'Step 1 of 2 — Email only to get started',
      emailLabel: 'Email address',
      emailPlaceholder: 'you@yourproject.com',
      gdprLabelPrefix: 'I agree to receive updates about this product and have my data processed under the',
      gdprPrivacyLink: 'privacy policy',
      gdprLabelSuffix: '. I can unsubscribe at any time.',
      step1Submit: 'Get My Free Audit',
      step1Submitting: 'Submitting...',
      emailError: 'Please enter a valid email address.',
      gdprError: 'Please accept the privacy policy to continue.',
      fallbackError: 'Could not complete signup. Please try again.',
      confirmedTitleAlready: 'You are already registered for a free audit.',
      confirmedTitleNew: 'Your security audit is on the way!',
      confirmedSubtitle:
        'We saved your email. Optionally complete the quick questions below to help us tailor your audit and pricing.',
      welcomeEmailNotice: 'A welcome email has just been sent to your inbox.',
      shareTitle: 'Share with fellow builders:',
      shareX: 'Share on X',
      shareLinkedIn: 'LinkedIn',
      shareCopy: 'Copy link',
      shareCopied: 'Link copied',
      shareText: 'I just requested a free security audit for my AI-built app on Proofline.',
      step2Badge: 'Step 2 (optional · 30 seconds)',
      step2Title: 'Help us tailor your free audit',
      step2Subtitle:
        'Every field is optional, and helps us prioritize your stack and pricing feedback.',
      builderLabel: 'Tool used to build your app',
      databaseLabel: 'Database',
      databaseOptions: [
        { value: 'Supabase', label: 'Supabase' },
        { value: 'Firebase', label: 'Firebase' },
        { value: 'Other', label: 'Other' },
        { value: 'Unknown', label: 'I don’t know' },
      ],
      usersLabel: 'How many users does your app have?',
      usersOptions: [
        { value: '0', label: '0 (not launched yet)' },
        { value: '1-50', label: '1 – 50 users' },
        { value: '51-500', label: '51 – 500 users' },
        { value: '500+', label: '500+ users' },
      ],
      painLabel: 'Your biggest concern',
      painPoints: [
        'Security vulnerabilities',
        'Bugs after edits',
        'Data loss',
        'Other',
      ],
      planLabel: 'Which plan interests you?',
      planOptions: [
        { value: 'one-time', label: 'One-time audit (€19–49)' },
        { value: 'monthly', label: 'Monthly monitoring (€29–49/mo)' },
        { value: 'agency', label: 'Team / Agency (€99+/mo)' },
      ],
      budgetLabel: 'How much would you pay per month for peace of mind?',
      budgetOptions: [
        { value: '<20', label: 'Under €20/month' },
        { value: '20-49', label: '€20 – €49/month' },
        { value: '50-99', label: '€50 – €99/month' },
        { value: '100+', label: '€100+/month' },
      ],
      urlLabel: 'App link for your free audit (optional)',
      urlPlaceholder: 'https://myapp.lovable.app',
      ownershipCheckbox: 'I certify that I own this application and authorize passive, non-destructive checks only.',
      ownershipError: 'Please certify ownership of this application to request an audit for this URL.',
      urlError: 'Please enter a valid http or https URL (for example, myapp.lovable.app).',
      interviewCheckbox: 'I’m open to a quick 15-minute feedback call.',
      step2Submit: 'Save my answers',
      step2Submitting: 'Saving...',
      step2SavedTitle: 'Thanks! Your audit preferences are saved.',
      step2SavedSubtitle: 'We will follow up shortly with next steps for your audit.',
      editStep2: 'Edit answers',
      registerAnother: 'Register another email address',
    },
    footer: {
      tagline:
        'Security audits and continuous verification for Lovable, Bolt, Cursor, Replit, and v0 apps.',
      legal: 'Legal Notice',
      privacy: 'Privacy Policy',
      contact: 'Contact',
      copyright: '© 2026 Proofline',
    },
    legalModals: {
      close: 'Close',
      legalTitle: 'Legal Notice',
      legalBody: [
        'Proofline is an early validation project dedicated to helping builders verify security and reliability in AI-generated web applications.',
        'Website hosting: Vercel Inc. (vercel.com), served over HTTPS.',
        'Audit ethics: only applications whose owner explicitly certifies ownership are reviewed using strictly passive, non-intrusive checks.',
      ],
      privacyTitle: 'Privacy Policy (GDPR)',
      privacyBody: [
        'Data collected: email address and privacy consent; optional answers (builder tool, database, user count, main concern, plan, budget, app URL, ownership certification, interview opt-in); language, UTM parameters, referring page; clicks on pricing plans, linked to your email if you entered it. A copy stays in your browser’s local storage.',
        'Demo (screenshots and messages): they pass through our server to the Google Gemini API, which produces the analysis or reply. Proofline does not save them. Google handles them under the Gemini API terms (ai.google.dev/gemini-api/terms): depending on the tier and country, they may be retained for a limited time, used to improve its services, and read by human reviewers. Do not send secret keys or personal data.',
        'Providers: Vercel (hosting and technical logs, including IP address), Supabase (signup database), Resend (email delivery), Google (Gemini API, and Google Fonts, whose loading shares your IP address). Some may process data outside the European Union.',
        'Purpose: delivering your free security audit, early-cohort follow-up, and product validation. Data is never sold.',
        'Retention & rights: retained at most 12 months after last contact. You may request access, correction, or deletion anytime via our contact address, or reply “Désinscription” (unsubscribe) to our emails.',
      ],
      contactTitle: 'Contact & Data Deletion',
      contactBody: [
        'Questions about your audit, partnership inquiries, or GDPR deletion requests?',
        'Reach out directly and include the email address used during signup.',
      ],
      contactEmail: 'bonjour@proofline.app',
    },
  },
};
