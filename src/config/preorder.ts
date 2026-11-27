import type { PricingPlanId } from '../types/qa';

/**
 * Module précommande (cahier des charges §6.6, modèle A : précommande remboursable).
 *
 * Désactivé tant que la configuration est incomplète : aucun bouton, aucune CGV,
 * aucun message de retour de paiement ne s'affiche.
 *
 * Pour activer :
 *   1. Créer un lien de paiement hébergé chez le prestataire (Stripe Payment Links,
 *      Lemon Squeezy, Paddle…) et vérifier qu'il accepte les vendeurs de ton pays.
 *   2. Régler dans le tableau de bord du prestataire les URL de retour :
 *      https://<domaine>/?preorder=success et https://<domaine>/?preorder=cancel
 *   3. Remplir les champs ci-dessous (le montant doit être identique à celui du lien).
 *   4. Faire relire les CGV et la politique de remboursement
 *      (src/i18n/preorderTranslations.ts), puis passer `legalReviewed` à true.
 *
 * Ces valeurs sont publiques (envoyées au navigateur) : jamais de clé secrète ici.
 */
export interface PreorderOffer {
  /** Lien de paiement hébergé, en https. */
  paymentUrl: string;
  /** Montant exact débité, dans l'unité principale de la devise (ex. 19 pour 19 €). */
  amount: number;
}

export interface PreorderConfig {
  legalReviewed: boolean;
  sellerName: string;
  sellerAddress: string;
  sellerEmail: string;
  providerName: string;
  /** Code ISO 4217, ex. EUR. */
  currency: string;
  /** Date de livraison estimée, au format AAAA-MM-JJ. */
  deliveryDate: string;
  /** Délai maximal de remboursement, en jours. */
  refundDelayDays: number;
  /** Seules les formules listées ici proposent le bouton « Précommander ». */
  offers: Partial<Record<PricingPlanId, PreorderOffer>>;
}

export const PREORDER_CONFIG: PreorderConfig = {
  legalReviewed: false,
  sellerName: '',
  sellerAddress: '',
  sellerEmail: '',
  providerName: '',
  currency: 'EUR',
  deliveryDate: '',
  refundDelayDays: 14,
  offers: {
    // 'one-time': { paymentUrl: 'https://buy.stripe.com/...', amount: 19 },
  },
};

function isHttpsUrl(value: string): boolean {
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
}

function parseIsoDate(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00Z`);
  // Rejette les dates impossibles (ex. 2027-02-31) que Date reporterait au mois suivant.
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value) ? date : null;
}

/**
 * Retourne la configuration utilisable, ou null si le module doit rester masqué.
 * Une date de livraison dépassée retire les boutons d'achat mais conserve les
 * pages légales, dont les acheteurs existants ont encore besoin.
 */
export function resolvePreorder(
  config: PreorderConfig,
  now: Date = new Date()
): PreorderConfig | null {
  const delivery = parseIsoDate(config.deliveryDate);
  const requiredText = [
    config.sellerName,
    config.sellerAddress,
    config.sellerEmail,
    config.providerName,
  ];

  if (
    !config.legalReviewed ||
    !delivery ||
    requiredText.some((value) => !value.trim()) ||
    !/^[A-Z]{3}$/.test(config.currency) ||
    !(config.refundDelayDays > 0)
  ) {
    return null;
  }

  const validOffers = Object.entries(config.offers).filter(
    ([, offer]) => offer && isHttpsUrl(offer.paymentUrl) && offer.amount > 0
  );
  if (validOffers.length === 0) return null;

  const isPastDelivery = now.getTime() >= delivery.getTime() + 24 * 60 * 60 * 1000;

  return {
    ...config,
    offers: isPastDelivery ? {} : Object.fromEntries(validOffers),
  };
}

export const ACTIVE_PREORDER = resolvePreorder(PREORDER_CONFIG);
