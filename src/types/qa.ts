export type BuilderTool = 'Lovable' | 'Bolt' | 'Cursor' | 'Replit' | 'v0' | 'Other';

export type DatabaseTool = 'Supabase' | 'Firebase' | 'Other' | 'Unknown';

export type UserScale = '0' | '1-50' | '51-500' | '500+';

export type PricingPlanId = 'one-time' | 'monthly' | 'agency';

export type MonthlyBudget = '<20' | '20-49' | '50-99' | '100+';

export type FindingSeverity = 'Critical' | 'Warning' | 'Suggestion';

export type FindingCategory =
  | 'Security'
  | 'Broken Flow'
  | 'Layout & UX'
  | 'Accessibility';

export interface ScreenshotFinding {
  severity: FindingSeverity;
  category: FindingCategory;
  title: string;
  detail: string;
  fixPrompt: string;
}

export interface ScreenshotAnalysisResult {
  summary: string;
  readinessStatus: 'Ready to Ship' | 'Needs Fixes' | 'High Risk';
  checkedArea: string;
  findings: ScreenshotFinding[];
  /** Résultat préécrit affiché quand l’analyse en direct est indisponible. */
  isExample?: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  /** Réponse préécrite affichée quand le conseiller en direct est indisponible. */
  isExample?: boolean;
}

export interface UtmParams {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  referrer?: string;
}

export interface LeadStep1Payload extends UtmParams {
  email: string;
  consentGdpr: boolean;
  source: 'hero' | 'final-cta';
  locale: 'fr' | 'en';
  companyWebsite?: string; // honeypot
}

export interface LeadStep2Payload {
  email: string;
  builderTool?: BuilderTool;
  databaseTool?: DatabaseTool;
  userScale?: UserScale;
  painPoint?: string;
  interestedPlan?: PricingPlanId;
  monthlyBudget?: MonthlyBudget;
  appUrl?: string;
  ownsAppConfirmed?: boolean;
  interviewOptIn?: boolean;
  locale: 'fr' | 'en';
}

export interface LeadRecord {
  email: string;
  consentGdpr: boolean;
  createdAt: string;
  builderTool?: BuilderTool;
  databaseTool?: DatabaseTool;
  userScale?: UserScale;
  painPoint?: string;
  interestedPlan?: PricingPlanId;
  monthlyBudget?: MonthlyBudget;
  appUrl?: string;
  ownsAppConfirmed?: boolean;
  interviewOptIn?: boolean;
  step2Completed?: boolean;
}

export interface LeadStep1Response {
  ok: boolean;
  alreadyRegistered: boolean;
  welcomeEmailSent: boolean;
  persistenceMode: 'remote' | 'local';
  entry: LeadRecord;
  totalCount: number;
}
