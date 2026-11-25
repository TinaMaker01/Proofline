import type { BuilderTool, FindingCategory, FindingSeverity } from '../types/qa';

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
    howItWorks: string;
    liveAudit: string;
    proof: string;
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
    builderLabel: string;
    builderAria: string;
    submit: string;
    submitting: string;
    reassurance: string;
    jumpToAudit: string;
    emailError: string;
    fallbackError: string;
    confirmedAlready: string;
    confirmedNew: string;
    savedPrefix: string;
    savedMiddle: string;
    savedSuffix: string;
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
    outcomes: Array<{
      title: string;
      description: string;
    }>;
  };
  bento: {
    heading: string;
    subheading: string;
    flowTitle: string;
    flowDesc: string;
    flowSteps: Array<{
      step: string;
      desktop: string;
      mobile: string;
      status: 'pass' | 'warn';
    }>;
    guardTitle: string;
    guardDesc: string;
    guardItems: Array<{
      label: string;
      tag: string;
    }>;
    promptTitle: string;
    promptDesc: string;
    samplePromptLabel: string;
    samplePromptBody: string;
    shieldTitle: string;
    shieldDesc: string;
    shieldDiffs: Array<{
      check: string;
      baselineLabel: string;
      baseline: string;
      previewLabel: string;
      preview: string;
      status: 'pass' | 'fail';
    }>;
  };
  studio: {
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
  proofFaq: {
    proofHeading: string;
    proofSubheading: string;
    caseStudies: Array<{
      metric: string;
      timeframe: string;
      quote: string;
      name: string;
      role: string;
      company: string;
      stack: string;
    }>;
    faqHeading: string;
    faqItems: Array<{
      question: string;
      answer: string;
    }>;
  };
  waitlist: {
    heading: string;
    subheading: string;
    benefitsLead: string;
    benefitsBody: string;
    countLabel: (count: number) => string;
    confirmedTitleAlready: string;
    confirmedTitleNew: string;
    confirmedBodyPrefix: string;
    confirmedBodyMiddle: string;
    confirmedBodySuffix: string;
    registeredOn: string;
    registerAnother: string;
    emailLabel: string;
    emailPlaceholder: string;
    builderLabel: string;
    urlLabel: string;
    urlPlaceholder: string;
    painLegend: string;
    painPoints: string[];
    noSpam: string;
    submit: string;
    submitting: string;
    emailError: string;
    urlError: string;
    fallbackError: string;
  };
  footer: {
    tagline: string;
    earlyAccess: string;
    copyright: string;
  };
}

export const TRANSLATIONS: Record<Locale, SiteTranslations> = {
  fr: {
    meta: {
      title: 'Proofline — QA & Sécurité continue pour vos apps créées par IA',
      description:
        'Tests automatisés, vérification de sécurité et correctifs en langage clair pour les applications créées avec Lovable, Bolt, Cursor, Replit et v0.',
    },
    skipLink: 'Aller au contenu principal',
    nav: {
      primaryAria: 'Navigation principale',
      mobileAria: 'Navigation mobile',
      howItWorks: 'Fonctionnement',
      liveAudit: 'Audit en direct',
      proof: 'Résultats',
      faq: 'FAQ',
      cta: 'Accès anticipé',
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
      headline: 'Livrez des apps créées par IA qui ne cassent ni ne fuient.',
      subheadline:
        'Le code généré en quelques minutes reste fragile en production. Proofline vérifie en continu vos parcours Lovable, Bolt, Cursor et Replit pour repérer les clés exposées, tables ouvertes et écrans cassés avant vos utilisateurs.',
      emailLabel: 'Adresse e-mail professionnelle ou personnelle',
      emailPlaceholder: 'vous@votrestartup.com',
      builderLabel: 'Outil utilisé',
      builderAria: 'Outil IA utilisé pour créer votre application',
      submit: 'Accès anticipé',
      submitting: 'Inscription...',
      reassurance: 'Aucune conservation du code · Gratuit pendant la bêta',
      jumpToAudit: 'Tester l’audit de capture en direct',
      emailError: 'Saisissez une adresse e-mail valide pour recevoir votre invitation.',
      fallbackError: 'Impossible d’enregistrer votre inscription pour le moment. Réessayez.',
      confirmedAlready: 'Vous êtes déjà sur la liste d’accès anticipé Proofline.',
      confirmedNew: 'Vous êtes inscrit sur la liste d’accès anticipé.',
      savedPrefix: 'Nous avons enregistré',
      savedMiddle: 'pour la bêta',
      savedSuffix: '.',
      registerAnother: 'Inscrire une autre adresse',
      workbenchAria: 'Exemple de rapport de vérification Proofline',
      highRisk: 'Risque élevé',
      runLiveCheck: 'Lancer un audit',
      promptHeader: 'Prompt correctif généré · À coller dans Bolt',
      promptBody:
        '« Déplacez les clés secrètes Stripe dans une route serveur /api/checkout et activez les règles RLS sur public.users avant de renvoyer des lignes clients. »',
      checks: [
        {
          severity: 'Critical',
          area: 'Fuite de secret',
          message: 'STRIPE_SECRET présent dans le bundle client JS',
          location: 'CheckoutForm.tsx:142',
        },
        {
          severity: 'Critical',
          area: 'Contrôle d’accès',
          message: 'public.users renvoie 1 482 lignes sans authentification',
          location: 'RLS_ENABLED=false',
        },
        {
          severity: 'Warning',
          area: 'Parcours cassé · 390px',
          message: 'Le bouton principal Payer dépasse hors de la modale mobile',
          location: 'mobile-checkout',
        },
      ],
      outcomes: [
        {
          title: 'Chaque parcours vérifié',
          description:
            'Inscriptions, paiements et formulaires sont testés dans de vrais navigateurs après chaque modification.',
        },
        {
          title: 'Rien n’est laissé exposé',
          description:
            'Détecte automatiquement les clés API publiques, tables Supabase ouvertes et routes sans authentification.',
        },
        {
          title: 'Correctifs en langage clair',
          description:
            'Obtenez des prompts prêts à coller dans Lovable, Bolt ou Cursor, sans toucher au terminal.',
        },
        {
          title: 'Mise en place en 2 minutes',
          description:
            'Connectez un lien de prévisualisation ou un dépôt. Proofline cartographie et protège vos routes en continu.',
        },
      ],
    },
    bento: {
      heading: 'Les outils IA vont vite. Les régressions silencieuses encore plus.',
      subheading:
        'Corriger un bouton sur votre page tarifaire ne devrait ni casser vos webhooks Stripe ni exposer votre table utilisateurs. Proofline surveille chaque changement avec la rigueur d’une équipe QA.',
      flowTitle: 'Vérification continue des parcours',
      flowDesc:
        'À chaque régénération d’écran ou mise à jour, de vrais navigateurs parcourent création de compte, connexion, formulaires et paiement sur ordinateur et mobile. Si un bouton ne répond plus ou qu’une redirection boucle, vous êtes alerté en moins de 90 secondes.',
      flowSteps: [
        {
          step: 'Inscription (/signup)',
          desktop: '200 OK · 1,1 s',
          mobile: '200 OK',
          status: 'pass',
        },
        {
          step: 'Vérification session',
          desktop: 'JWT scopé',
          mobile: 'JWT scopé',
          status: 'pass',
        },
        {
          step: 'Paiement Stripe',
          desktop: '200 OK · 1,4 s',
          mobile: 'Bouton coupé à 390px',
          status: 'warn',
        },
      ],
      guardTitle: 'Protection secrets & expositions',
      guardDesc:
        'Les générateurs IA publient souvent des clés API côté client, des règles de base trop permissives ou des endpoints admin non protégés. Proofline analyse votre build et le trafic réseau pour garder vos données privées.',
      guardItems: [
        { label: 'Scan de clés dans le bundle client', tag: 'Chaque déploiement' },
        { label: 'Contrôle d’accès par ligne (RLS)', tag: 'Supabase & Firebase' },
        { label: 'Test des routes sans session', tag: 'API & webhooks' },
      ],
      promptTitle: 'Correctifs en un seul prompt',
      promptDesc:
        'Inutile de déchiffrer des en-têtes CORS ou des traces TypeScript. Chaque anomalie est expliquée simplement avec un prompt testé, prêt à coller dans Lovable, Bolt ou Cursor.',
      samplePromptLabel: 'Exemple de prompt correctif généré',
      samplePromptBody:
        '« Déplacez l’appel secret Stripe dans une route serveur /api/checkout et exigez une session authentifiée avant de renvoyer les factures clients. »',
      shieldTitle: 'Bouclier anti-régression avant lancement',
      shieldDesc:
        'Comparez chaque nouvelle prévisualisation à votre dernière version fonctionnelle. Proofline isole les mises en page cassées, variables d’environnement manquantes et appels API morts avant le partage public.',
      shieldDiffs: [
        {
          check: 'Redirection auth (/dashboard)',
          baselineLabel: 'Dernier OK',
          baseline: '200 OK',
          previewLabel: 'Aperçu',
          preview: '200 OK',
          status: 'pass',
        },
        {
          check: 'POST /api/checkout',
          baselineLabel: 'Dernier OK',
          baseline: '200 OK',
          previewLabel: 'Aperçu',
          preview: '500 · STRIPE_WEBHOOK_SECRET manquant',
          status: 'fail',
        },
        {
          check: 'Scan du bundle public',
          baselineLabel: 'Dernier OK',
          baseline: '0 secret',
          previewLabel: 'Aperçu',
          preview: '0 secret',
          status: 'pass',
        },
      ],
    },
    studio: {
      heading: 'Lancez un audit en direct sur votre application.',
      subheading:
        'Importez ou collez une capture d’écran depuis Lovable, Bolt ou Cursor pour repérer les expositions visibles et défauts d’interface — ou discutez avec notre conseiller QA.',
      tablistAria: 'Modes du studio QA en direct',
      tabScreenshot: 'Audit de capture',
      tabChat: 'Conseiller QA & Sécurité',
      uploadLabel: 'Capture d’écran de l’application',
      loadDemo: 'Charger une capture de démo',
      remove: 'Retirer',
      dropTitle: 'Déposez, parcourez ou collez une capture (Ctrl+V)',
      dropHint:
        'PNG, JPEG ou WebP jusqu’à 8 Mo · Masquez vos données clients réelles · Analysée en mémoire, jamais stockée',
      uploadedAltFallback: 'Capture d’écran de l’application importée',
      replace: 'Remplacer',
      builtWith: 'Créé avec',
      focusArea: 'Zone à vérifier (optionnel)',
      focusPlaceholder: 'ex. Écran auth ou paiement',
      runAudit: 'Lancer l’audit QA & Sécurité',
      inspecting: 'Analyse de la capture...',
      checkingTitle: 'Vérification des parcours, de la mise en page et des expositions visibles',
      checkingSubtitlePrefix: 'Inspection de votre capture',
      checkingSubtitleSuffix: 'et rédaction des prompts correctifs prêts à coller...',
      emptyTitle: 'Votre rapport de diagnostic apparaîtra ici',
      emptyDescBefore: 'Importez une capture d’écran de connexion, tableau de bord ou paiement — ou cliquez sur',
      emptyDescAfter:
        'pour voir comment Proofline détecte les risques cachés et rédige des correctifs prêts à coller.',
      findingSingular: 'anomalie',
      findingPlural: 'anomalies',
      auditSummary: 'Résumé de l’audit',
      copyAllFixes: 'Copier tous les correctifs',
      copiedAllFixes: 'Tous copiés',
      askAdvisor: 'Demander au conseiller',
      pasteInto: 'À coller dans',
      copyFixPrompt: 'Copier le prompt',
      copied: 'Copié',
      severityLabels: {
        Critical: 'Critique',
        Warning: 'Avertissement',
        Suggestion: 'Suggestion',
      },
      categoryLabels: {
        Security: 'Sécurité',
        'Broken Flow': 'Parcours cassé',
        'Layout & UX': 'Interface & UX',
        Accessibility: 'Accessibilité',
      },
      readinessLabels: {
        'Ready to Ship': 'Prêt à livrer',
        'Needs Fixes': 'Correctifs requis',
        'High Risk': 'Risque élevé',
      },
      advisorTitle: 'Conseiller QA & Sécurité',
      stackContext: 'Outil ciblé :',
      undoReset: 'Annuler la réinitialisation',
      resetThread: 'Réinitialiser',
      you: 'Vous',
      advisorName: 'Conseiller Proofline',
      now: 'Maintenant',
      copiedResponse: 'Réponse copiée',
      copy: 'Copier',
      preparingChecks: 'Analyse de votre question et préparation des vérifications...',
      retryMessage: 'Réessayer',
      chatPlaceholderPrefix: 'Posez une question QA, auth ou sécurité sur votre app',
      chatPlaceholderSuffix: '...',
      chatInputAria: 'Poser une question QA ou sécurité au conseiller Proofline',
      send: 'Envoyer',
      starterPrompts: [
        'Comment vérifier si mes clés ou tables Supabase sont exposées dans une app Lovable ?',
        'Mon app Bolt fonctionne en aperçu mais la connexion échoue sur mon domaine personnalisé.',
        'Quels 5 contrôles faire avant d’encaisser de vrais paiements Stripe sur un MVP Cursor ?',
      ],
      welcomeMessage:
        'Interrogez-moi sur n’importe quel parcours fragile, bug d’authentification ou exposition potentielle dans votre app Lovable, Bolt, Cursor ou Replit. Je vous indique quoi vérifier et rédige un prompt correctif prêt à coller.',
      resetMessage:
        'Conversation réinitialisée. Posez votre question sur les tests, la sécurité ou la correction de votre application.',
      demoFocusDefault: 'Vérifier les secrets exposés, le paiement mobile cassé et les fuites de données.',
      askAdvisorPrefix: 'Dans mon app',
      askAdvisorMiddle: ', Proofline a signalé',
      askAdvisorSuffix: 'Comment vérifier ce correctif en toute sécurité ?',
      errors: {
        invalidFileType: 'Veuillez sélectionner une image PNG, JPEG ou WebP.',
        fileTooLarge: 'La capture d’écran doit faire moins de 8 Mo.',
        fileReadError: 'Impossible de lire le fichier image sélectionné.',
        demoFailed: 'Impossible de générer la capture de démonstration dans ce navigateur.',
        noScreenshot: 'Importez une capture ou chargez la capture de démo d’abord.',
        auditFailed: 'Impossible de finaliser l’audit de la capture.',
        chatFailed: 'Impossible de joindre le conseiller QA pour le moment.',
      },
      announcements: {
        screenshotLoaded: 'Capture chargée et prête pour l’audit.',
        demoLoaded: 'Capture d’application de démonstration chargée.',
        screenshotRemoved: 'Capture supprimée.',
        copied: 'Copié dans le presse-papiers.',
        auditComplete: (status, count) =>
          `Audit terminé : ${status}, ${count} ${count === 1 ? 'anomalie' : 'anomalies'}.`,
      },
    },
    proofFaq: {
      proofHeading: 'Conçu pour des créateurs qui lancent de vrais produits, pas des démos.',
      proofSubheading:
        'Retours mesurés auprès de notre cohorte pilote sur des lancements Lovable, Bolt et Cursor.',
      caseStudies: [
        {
          metric: '1 420 inscriptions le 1er jour, 0 échec de paiement',
          timeframe: 'Détecté 4 h avant le lancement',
          quote:
            'Avant Proofline, chaque nouveau prompt ressemblait à de la roulette russe. Il a repéré deux tables Supabase ouvertes et un bouton de paiement cassé sur Safari juste avant notre lancement, avec le prompt exact pour tout corriger en cinq minutes.',
          name: 'Maya Lin',
          role: 'Fondatrice',
          company: 'HearthLedger',
          stack: 'Créé avec Lovable',
        },
        {
          metric: 'De 6 déploiements cassés/semaine à 0',
          timeframe: 'Mesuré sur 30 jours',
          quote:
            'Je suis designer, pas ingénieur QA. Proofline vérifie automatiquement mon onboarding et ma facturation après chaque modification : je ne découvre plus les bugs via des clients mécontents.',
          name: 'Devon Park',
          role: 'Créateur solo',
          company: 'ClipBrief',
          stack: 'Créé avec Bolt',
        },
        {
          metric: '9 h/semaine de tests manuels économisées',
          timeframe: 'Sur 18 parcours clés',
          quote:
            'Notre équipe de deux personnes déploie chaque jour avec Cursor. Savoir en continu que rien n’a cassé et qu’aucun secret d’environnement n’a fuité nous permet d’avancer vite sereinement.',
          name: 'Hannah Morales',
          role: 'Co-fondatrice',
          company: 'RosterKit',
          stack: 'Créé avec Cursor',
        },
      ],
      faqHeading: 'Des réponses claires avant de connecter votre application.',
      faqItems: [
        {
          question: 'Dois-je savoir écrire des tests automatisés ou lire du code ?',
          answer:
            'Non. Indiquez votre URL de prévisualisation ou connectez votre dépôt : Proofline cartographie vos écrans principaux, les teste dans de vrais navigateurs et explique chaque anomalie en français clair avec un prompt correctif prêt à coller.',
        },
        {
          question: 'Quels outils de création IA sont pris en charge par Proofline ?',
          answer:
            'Proofline fonctionne avec toute application web générée via Lovable, Bolt, Cursor, Replit, v0 ou un stack personnalisé. Comme nous vérifions à la fois le comportement navigateur et les frontières réseau/sécurité déployées, vous n’avez rien à modifier.',
        },
        {
          question: 'Quels types d’expositions de sécurité vérifiez-vous ?',
          answer:
            'Nous recherchons les clés API exposées par erreur dans le bundle client, les règles Supabase ou Firebase trop permissives, les routes API non authentifiées, les signatures webhook manquantes et les panneaux de debug laissés en production.',
        },
        {
          question: 'Comment fonctionne l’accès anticipé et quel est le tarif ?',
          answer:
            'Nous intégrons nos partenaires pilotes par cohortes hebdomadaires. Les membres en accès anticipé bénéficient gratuitement des tests automatisés et contrôles de sécurité pendant la bêta, avec un tarif fondateur garanti au lancement.',
        },
      ],
    },
    waitlist: {
      heading: 'Vérifiez tout avant votre prochain lancement.',
      subheading:
        'Réservez votre place pour les tests automatisés, la vérification de sécurité et les correctifs en un prompt. Partagez votre projet pour être prioritaire si vous lancez sous 30 jours.',
      benefitsLead: 'Ce que reçoivent les premiers membres :',
      benefitsBody:
        'contrôles illimités de prévisualisation pendant la bêta, détection en direct des secrets et règles de base de données, et accompagnement direct avec l’équipe fondatrice.',
      countLabel: (count) =>
        `${count} ${count === 1 ? 'créateur a' : 'créateurs ont'} déjà demandé l’accès anticipé depuis cet espace.`,
      confirmedTitleAlready: 'Votre place en accès anticipé est confirmée.',
      confirmedTitleNew: 'Bienvenue sur la liste d’attente Proofline.',
      confirmedBodyPrefix: 'Nous avons bien enregistré',
      confirmedBodyMiddle: 'avec un accès prioritaire',
      confirmedBodySuffix: '. Nous vous contacterons dès l’ouverture de votre vague d’invitations.',
      registeredOn: 'Inscrit le',
      registerAnother: 'Inscrire un autre e-mail d’équipe',
      emailLabel: 'Adresse e-mail',
      emailPlaceholder: 'fondateur@entreprise.com',
      builderLabel: 'Outil IA principal',
      urlLabel: 'URL de l’app ou de prévisualisation (optionnel)',
      urlPlaceholder: 'https://monapp.lovable.app',
      painLegend: 'Qu’est-ce qui vous inquiète le plus avant de livrer ?',
      painPoints: [
        'Parcours qui cassent après de nouveaux prompts',
        'Clés API exposées ou tables ouvertes',
        'Bugs d’authentification et Stripe en production',
        'Défauts d’affichage mobile avant lancement',
      ],
      noSpam: 'Zéro spam. Uniquement votre invitation et le suivi de cohorte.',
      submit: 'Accès anticipé',
      submitting: 'Envoi...',
      emailError: 'Veuillez saisir une adresse e-mail valide.',
      urlError: 'Veuillez saisir une URL http ou https valide (par exemple monapp.lovable.app).',
      fallbackError: 'Impossible de finaliser l’inscription. Vérifiez vos informations.',
    },
    footer: {
      tagline:
        'Tests continus et vérification de sécurité pour vos apps créées par IA. Les captures sont analysées en mémoire et jamais stockées.',
      earlyAccess: 'Accès anticipé',
      copyright: '© 2026 Proofline',
    },
  },
  en: {
    meta: {
      title: 'Proofline — Continuous QA & Security for AI-Generated Apps',
      description:
        'Automated testing, security verification, and plain-English fixes for apps built with Lovable, Bolt, Cursor, Replit, and v0.',
    },
    skipLink: 'Skip to main content',
    nav: {
      primaryAria: 'Primary',
      mobileAria: 'Mobile navigation',
      howItWorks: 'How it works',
      liveAudit: 'Live Audit',
      proof: 'Proof',
      faq: 'FAQ',
      cta: 'Get Early Access',
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
      headline: 'Ship AI-built apps that never break or leak.',
      subheadline:
        'Code generated in minutes is fragile in production. Proofline continuously tests your Lovable, Bolt, Cursor, and Replit flows—catching leaked keys, open tables, and broken screens before real customers hit an error.',
      emailLabel: 'Work or personal email',
      emailPlaceholder: 'you@yourstartup.com',
      builderLabel: 'Built with tool',
      builderAria: 'Built with AI builder',
      submit: 'Get Early Access',
      submitting: 'Joining...',
      reassurance: 'Zero code retention · Free during beta',
      jumpToAudit: 'Try the live screenshot audit',
      emailError: 'Enter a valid email address so we can send your invite.',
      fallbackError: 'Could not save your signup right now. Please try again.',
      confirmedAlready: 'You are already on the Proofline early access list.',
      confirmedNew: 'You are on the early access list.',
      savedPrefix: 'We saved',
      savedMiddle: 'for',
      savedSuffix: 'beta access.',
      registerAnother: 'Register another email',
      workbenchAria: 'Sample Proofline verification report',
      highRisk: 'High Risk',
      runLiveCheck: 'Run live check',
      promptHeader: 'Generated fix prompt · Paste into Bolt',
      promptBody:
        '“Move Stripe secret keys into a server route at /api/checkout and enforce RLS on public.users before returning customer rows.”',
      checks: [
        {
          severity: 'Critical',
          area: 'Secret Exposure',
          message: 'STRIPE_SECRET bundled in client JS',
          location: 'CheckoutForm.tsx:142',
        },
        {
          severity: 'Critical',
          area: 'Access Control',
          message: 'public.users returns 1,482 rows without auth',
          location: 'RLS_ENABLED=false',
        },
        {
          severity: 'Warning',
          area: 'Broken Flow · 390px',
          message: 'Primary Pay button clips outside modal viewport',
          location: 'mobile-checkout',
        },
      ],
      outcomes: [
        {
          title: 'Every user flow verified',
          description:
            'Sign-ups, checkouts, and forms run in real browsers after every prompt you ship.',
        },
        {
          title: 'Nothing left exposed',
          description:
            'Flags public API keys, open Supabase tables, and missing auth checks automatically.',
        },
        {
          title: 'Fixes in plain English',
          description:
            'Get exact repair prompts to paste back into Lovable, Bolt, or Cursor—no terminal needed.',
        },
        {
          title: '2-minute onboarding',
          description:
            'Connect a preview link or repo. Proofline maps your routes and guards them nonstop.',
        },
      ],
    },
    bento: {
      heading: 'AI tools move fast. Silent regressions move faster.',
      subheading:
        'Fixing a button on your pricing page shouldn’t break Stripe webhooks or expose your user table. Proofline watches every change so non-technical builders ship with engineering rigor.',
      flowTitle: 'Continuous Flow Verification',
      flowDesc:
        'Every time you regenerate a screen or merge an edit, headless browsers walk through account creation, login, forms, and checkout across desktop and mobile viewports. If a button stops responding or a redirect loops, you know in under 90 seconds.',
      flowSteps: [
        { step: 'Sign up (/signup)', desktop: '200 OK · 1.1s', mobile: '200 OK', status: 'pass' },
        { step: 'Verify session', desktop: 'JWT scoped', mobile: 'JWT scoped', status: 'pass' },
        {
          step: 'Stripe checkout',
          desktop: '200 OK · 1.4s',
          mobile: 'CTA clipped at 390px',
          status: 'warn',
        },
      ],
      guardTitle: 'Exposure & Secret Guard',
      guardDesc:
        'AI code generators frequently ship client-side API keys, permissive database rules, or unprotected admin endpoints. Proofline scans your live build and network traffic to make sure private data stays private.',
      guardItems: [
        { label: 'Client bundle key scan', tag: 'Every deploy' },
        { label: 'Row-level access check', tag: 'Supabase & Firebase' },
        { label: 'Unauthenticated route probe', tag: 'API & webhooks' },
      ],
      promptTitle: 'One-Prompt Auto-Fixes',
      promptDesc:
        'You shouldn’t need to decipher CORS headers or TypeScript stack traces. Every issue comes with a plain-English explanation and a tested repair prompt ready to paste into Lovable, Bolt, or Cursor.',
      samplePromptLabel: 'Sample generated repair prompt',
      samplePromptBody:
        '“Move the Stripe secret lookup into a server route at /api/checkout and require an authenticated session before returning customer invoice rows.”',
      shieldTitle: 'Pre-Launch Regression Shield',
      shieldDesc:
        'Compare every new preview build against your last working release. Proofline isolates broken layouts, missing environment variables, and dead API calls before you share your link with investors, Product Hunt, or paying users.',
      shieldDiffs: [
        {
          check: 'Auth redirect (/dashboard)',
          baselineLabel: 'Last pass',
          baseline: '200 OK',
          previewLabel: 'Preview',
          preview: '200 OK',
          status: 'pass',
        },
        {
          check: 'POST /api/checkout',
          baselineLabel: 'Last pass',
          baseline: '200 OK',
          previewLabel: 'Preview',
          preview: '500 · missing STRIPE_WEBHOOK_SECRET',
          status: 'fail',
        },
        {
          check: 'Public bundle scan',
          baselineLabel: 'Last pass',
          baseline: '0 secrets',
          previewLabel: 'Preview',
          preview: '0 secrets',
          status: 'pass',
        },
      ],
    },
    studio: {
      heading: 'Run a live audit on your app right now.',
      subheading:
        'Upload or paste a screenshot from Lovable, Bolt, or Cursor to catch visible exposures and broken states—or chat with our QA advisor for a tailored pre-launch checklist.',
      tablistAria: 'Live QA Studio modes',
      tabScreenshot: 'Screenshot Audit',
      tabChat: 'QA & Security Advisor',
      uploadLabel: 'App screenshot',
      loadDemo: 'Load demo app screenshot',
      remove: 'Remove',
      dropTitle: 'Drop, browse, or paste screenshot (Ctrl+V)',
      dropHint:
        'PNG, JPEG, or WebP up to 8 MB · Crop real customer PII first · Analyzed in memory, never stored',
      uploadedAltFallback: 'Uploaded application screenshot',
      replace: 'Replace',
      builtWith: 'Built with',
      focusArea: 'Focus area (optional)',
      focusPlaceholder: 'e.g., Auth or checkout',
      runAudit: 'Run QA & Security Audit',
      inspecting: 'Inspecting screenshot...',
      checkingTitle: 'Checking flows, layout integrity, and visible exposures',
      checkingSubtitlePrefix: 'Reviewing your',
      checkingSubtitleSuffix: 'screenshot and drafting copy-ready repair prompts...',
      emptyTitle: 'Your diagnostic report appears here',
      emptyDescBefore: 'Upload a screenshot of any login page, dashboard, or checkout modal—or click',
      emptyDescAfter:
        'to see how Proofline surfaces hidden risks and writes ready-to-paste fix prompts.',
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
        'Ready to Ship': 'Ready to Ship',
        'Needs Fixes': 'Needs Fixes',
        'High Risk': 'High Risk',
      },
      advisorTitle: 'QA & Security Advisor',
      stackContext: 'Stack context:',
      undoReset: 'Undo reset',
      resetThread: 'Reset thread',
      you: 'You',
      advisorName: 'Proofline Advisor',
      now: 'Now',
      copiedResponse: 'Copied response',
      copy: 'Copy',
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
        'Ask me about any fragile flow, auth bug, or potential data exposure in your Lovable, Bolt, Cursor, or Replit app. I can walk you through what to check and write a repair prompt you can paste directly into your builder.',
      resetMessage:
        'Conversation reset. Ask anything about testing, securing, or fixing your AI-built app.',
      demoFocusDefault: 'Check for exposed secrets, broken checkout layout, and data leaks.',
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
    proofFaq: {
      proofHeading: 'Built for creators shipping real products, not weekend demos.',
      proofSubheading:
        'Verified outcomes from our early design partner cohort across Lovable, Bolt, and Cursor launches.',
      caseStudies: [
        {
          metric: '1,420 day-one signups, 0 checkout failures',
          timeframe: 'Caught 4 hours before launch',
          quote:
            'Before Proofline, every prompt tweak felt like roulette. It flagged two open Supabase tables and a broken Safari pay button right before our launch morning, and gave me the exact prompt to fix both in five minutes.',
          name: 'Maya Lin',
          role: 'Founder',
          company: 'HearthLedger',
          stack: 'Built with Lovable',
        },
        {
          metric: '6 broken deploys/week reduced to 0',
          timeframe: 'Measured over 30 days',
          quote:
            'I am a designer, not a QA engineer. Proofline checks my onboarding and billing flows automatically after every edit so I stopped discovering bugs through angry customer emails.',
          name: 'Devon Park',
          role: 'Solo Creator',
          company: 'ClipBrief',
          stack: 'Built with Bolt',
        },
        {
          metric: '9 hours/week of manual click-testing saved',
          timeframe: 'Across 18 core user flows',
          quote:
            'Our two-person team ships daily with Cursor. Having continuous verification that nothing broke and no environment secret leaked lets us move fast without hiring a dedicated QA lead.',
          name: 'Hannah Morales',
          role: 'Co-founder',
          company: 'RosterKit',
          stack: 'Built with Cursor',
        },
      ],
      faqHeading: 'Straight answers before you connect your app.',
      faqItems: [
        {
          question: 'Do I need to know how to write automated tests or read code?',
          answer:
            'No. You paste your preview URL or connect your repository, and Proofline automatically maps your primary screens, tests them in real browsers, and explains every issue in plain English with a copy-ready fix prompt.',
        },
        {
          question: 'Which AI app builders does Proofline support?',
          answer:
            'Proofline works with any web app generated by Lovable, Bolt, Cursor, Replit, v0, or custom stacks. Because we verify both live browser behavior and deployed network/security boundaries, you do not need to change frameworks.',
        },
        {
          question: 'What kind of security exposures do you check for?',
          answer:
            'We check for accidentally shipped API keys in client bundles, overly permissive Supabase or Firebase read/write rules, unauthenticated API endpoints, missing webhook signature checks, and debug panels left enabled in production.',
        },
        {
          question: 'How does early access work and what does it cost?',
          answer:
            'We are onboarding design partners in weekly cohorts. Early access members get full automated flow testing and security checks free during beta, plus locked-in founder pricing when we launch publicly.',
        },
      ],
    },
    waitlist: {
      heading: 'Verify everything before your next launch.',
      subheading:
        'Reserve your spot for automated testing, security verification, and one-prompt fixes. Share what you are building and we will prioritize teams launching in the next 30 days.',
      benefitsLead: 'What early members receive:',
      benefitsBody:
        'unlimited preview checks during beta, live secret & table-rule scanning, and direct onboarding with our founding team.',
      countLabel: (count) =>
        `${count} ${count === 1 ? 'builder has' : 'builders have'} requested early access from this workspace.`,
      confirmedTitleAlready: 'Your early access spot is confirmed.',
      confirmedTitleNew: 'Welcome to the Proofline waitlist.',
      confirmedBodyPrefix: 'We registered',
      confirmedBodyMiddle: 'with',
      confirmedBodySuffix:
        'priority access. We will reach out as soon as your invite batch opens.',
      registeredOn: 'Registered',
      registerAnother: 'Register another team email',
      emailLabel: 'Email address',
      emailPlaceholder: 'founder@company.com',
      builderLabel: 'Primary AI builder',
      urlLabel: 'App or preview URL (optional)',
      urlPlaceholder: 'https://myapp.lovable.app',
      painLegend: 'What worries you most before shipping?',
      painPoints: [
        'Flows breaking after new prompts',
        'Exposed API keys or open database tables',
        'Auth and Stripe checkout bugs in production',
        'Mobile layout glitches before launch',
      ],
      noSpam: 'No spam. Only your early access invite and cohort updates.',
      submit: 'Get Early Access',
      submitting: 'Submitting...',
      emailError: 'Please enter a valid email address.',
      urlError: 'Please enter a valid http or https URL (for example, myapp.lovable.app).',
      fallbackError: 'Could not complete signup. Please check your details.',
    },
    footer: {
      tagline:
        'Continuous testing and security verification for AI-generated apps. Screenshots are analyzed in memory and never stored.',
      earlyAccess: 'Early Access',
      copyright: '© 2026 Proofline',
    },
  },
};
