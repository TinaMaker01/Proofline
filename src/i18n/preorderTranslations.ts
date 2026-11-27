import type { PreorderConfig } from '../config/preorder';
import type { PricingPlanId } from '../types/qa';
import type { Locale } from './translations';

export function formatAmount(amount: number, currency: string, locale: Locale): string {
  const formatted = new Intl.NumberFormat(locale === 'fr' ? 'fr-FR' : 'en-GB', {
    style: 'currency',
    currency,
  }).format(amount);
  return `${formatted} (${currency})`;
}

export function formatDeliveryDate(isoDate: string, locale: Locale): string {
  return new Intl.DateTimeFormat(locale === 'fr' ? 'fr-FR' : 'en-GB', {
    dateStyle: 'long',
    timeZone: 'UTC',
  }).format(new Date(`${isoDate}T00:00:00Z`));
}

interface PreorderTranslations {
  pricingSubheading: string;
  pricingDisclaimer: string;
  badge: string;
  itemLabel: string;
  amountLabel: string;
  deliveryLabel: string;
  items: Record<PricingPlanId, string>;
  cta: string;
  ctaAriaLabel: (planName: string, amount: string) => string;
  refundSummary: (deliveryDate: string) => string;
  termsLink: string;
  refundLink: string;
  successTitle: string;
  successBody: (deliveryDate: string, providerName: string) => string[];
  cancelTitle: string;
  cancelBody: string;
  dismiss: string;
  termsTitle: string;
  termsBody: (config: PreorderConfig) => string[];
  refundTitle: string;
  refundBody: (config: PreorderConfig) => string[];
  privacyAddendum: (providerName: string) => string;
}

// Les textes juridiques ci-dessous sont des modèles à faire relire avant activation
// (`legalReviewed` dans src/config/preorder.ts).
export const PREORDER_TRANSLATIONS: Record<Locale, PreorderTranslations> = {
  fr: {
    pricingSubheading:
      'Tu peux simplement signaler ton intérêt, ou précommander une formule. Une précommande est un paiement réel pour un produit pas encore disponible, remboursé s’il n’est pas livré.',
    pricingDisclaimer:
      'Les fourchettes de prix restent indicatives. Seul le montant affiché dans l’encadré « Précommande » est débité.',
    badge: 'Précommande · produit pas encore disponible',
    itemLabel: 'Tu achètes',
    amountLabel: 'Montant',
    deliveryLabel: 'Livraison estimée',
    items: {
      'one-time': 'Un audit unique de ton application',
      monthly: 'Le premier mois de suivi mensuel',
      agency: 'Le premier mois de la formule Équipe / agence',
    },
    cta: 'Précommander',
    ctaAriaLabel: (planName, amount) => `Précommander la formule ${planName} pour ${amount}`,
    refundSummary: (date) => `Remboursement intégral si le produit n’est pas livré au ${date}.`,
    termsLink: 'Conditions générales de vente',
    refundLink: 'Politique de remboursement',
    successTitle: 'Merci ! Voici la suite de ta précommande.',
    successBody: (date, provider) => [
      `Si ton paiement a été accepté, ${provider} t’envoie un reçu par e-mail. Seul ce reçu confirme la précommande, pas l’affichage de cette page.`,
      `Livraison estimée : ${date}. Le produit n’est pas encore disponible ; nous te tiendrons informé par e-mail.`,
      'Pas de reçu ? Contacte-nous avant de payer une seconde fois.',
    ],
    cancelTitle: 'Précommande non finalisée',
    cancelBody:
      'Le paiement n’a pas été terminé depuis la page du prestataire. Tu peux réessayer depuis la section Tarifs.',
    dismiss: 'Fermer ce message',
    termsTitle: 'Conditions générales de vente (précommande)',
    termsBody: (c) => [
      `Vendeur : ${c.sellerName}, ${c.sellerAddress}. Contact : ${c.sellerEmail}.`,
      'Objet : précommande d’un service Proofline qui n’est pas encore disponible. Le contenu acheté et le montant sont indiqués sur la page avant le paiement.',
      `Prix et paiement : le montant affiché, en ${c.currency}, est réglé en une fois sur la page sécurisée de ${c.providerName}. Les taxes applicables sont précisées sur cette page. Proofline ne collecte ni ne stocke aucune donnée de carte.`,
      `Livraison : estimée au ${formatDeliveryDate(c.deliveryDate, 'fr')}. Si le produit n’est pas livré à cette date, la précommande est remboursée intégralement.`,
      'Rétractation : les droits légaux de rétractation et les garanties applicables dans ton pays de résidence restent acquis.',
    ],
    refundTitle: 'Politique de remboursement',
    refundBody: (c) => [
      `Si le produit n’est pas livré au ${formatDeliveryDate(c.deliveryDate, 'fr')}, tu es remboursé intégralement.`,
      `Le remboursement est effectué sur le moyen de paiement d’origine, via ${c.providerName}, dans un délai maximal de ${c.refundDelayDays} jours.`,
      `Pour toute demande, écris à ${c.sellerEmail} avec l’adresse e-mail utilisée lors du paiement.`,
      'Cette politique ne limite pas les droits que la loi t’accorde.',
    ],
    privacyAddendum: (provider) =>
      `Précommande : les données de paiement sont collectées et traitées directement par ${provider}. Proofline reçoit les informations nécessaires au suivi de la commande, jamais le numéro de carte.`,
  },
  en: {
    pricingSubheading:
      'You can simply register interest, or preorder a plan. A preorder is a real payment for a product that is not available yet, refunded if it is not delivered.',
    pricingDisclaimer:
      'Price ranges remain indicative. Only the amount shown in the “Preorder” box is charged.',
    badge: 'Preorder · product not available yet',
    itemLabel: 'You are buying',
    amountLabel: 'Amount',
    deliveryLabel: 'Estimated delivery',
    items: {
      'one-time': 'One audit of your application',
      monthly: 'The first month of monthly monitoring',
      agency: 'The first month of the Team / Agency plan',
    },
    cta: 'Preorder',
    ctaAriaLabel: (planName, amount) => `Preorder the ${planName} plan for ${amount}`,
    refundSummary: (date) => `Full refund if the product is not delivered by ${date}.`,
    termsLink: 'Terms of Sale',
    refundLink: 'Refund Policy',
    successTitle: 'Thank you! Here is what happens next.',
    successBody: (date, provider) => [
      `If your payment was accepted, ${provider} emails you a receipt. Only that receipt confirms the preorder, not this page.`,
      `Estimated delivery: ${date}. The product is not available yet; we will keep you posted by email.`,
      'No receipt? Contact us before paying a second time.',
    ],
    cancelTitle: 'Preorder not completed',
    cancelBody:
      'The payment was not completed on the provider’s page. You can try again from the Pricing section.',
    dismiss: 'Dismiss this message',
    termsTitle: 'Terms of Sale (preorder)',
    termsBody: (c) => [
      `Seller: ${c.sellerName}, ${c.sellerAddress}. Contact: ${c.sellerEmail}.`,
      'Subject: preorder of a Proofline service that is not available yet. What you buy and the amount are shown on the page before payment.',
      `Price and payment: the displayed amount, in ${c.currency}, is paid once on the secure ${c.providerName} page. Applicable taxes are stated on that page. Proofline never collects or stores card data.`,
      `Delivery: estimated for ${formatDeliveryDate(c.deliveryDate, 'en')}. If the product is not delivered by that date, the preorder is refunded in full.`,
      'Withdrawal: statutory withdrawal rights and warranties in your country of residence remain unaffected.',
    ],
    refundTitle: 'Refund Policy',
    refundBody: (c) => [
      `If the product is not delivered by ${formatDeliveryDate(c.deliveryDate, 'en')}, you receive a full refund.`,
      `Refunds go to the original payment method, via ${c.providerName}, within ${c.refundDelayDays} days at most.`,
      `For any request, write to ${c.sellerEmail} with the email address used at checkout.`,
      'This policy does not limit your statutory rights.',
    ],
    privacyAddendum: (provider) =>
      `Preorders: payment data is collected and processed directly by ${provider}. Proofline receives the information needed to track the order, never the card number.`,
  },
};
