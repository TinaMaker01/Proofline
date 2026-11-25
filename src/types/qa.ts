export type BuilderTool = 'Lovable' | 'Bolt' | 'Cursor' | 'Replit' | 'v0' | 'Other';

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
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

export interface WaitlistPayload {
  email: string;
  builderTool: BuilderTool;
  appUrl?: string;
  painPoint?: string;
  source: 'hero' | 'waitlist-section';
}

export interface WaitlistResponse {
  ok: boolean;
  alreadyRegistered: boolean;
  entry: {
    email: string;
    builderTool: BuilderTool;
    createdAt: string;
  };
  totalCount: number;
}
