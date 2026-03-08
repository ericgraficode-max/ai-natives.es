export type AuditCategory = 'home' | 'plp' | 'pdp' | 'checkout';

export interface AuditRule {
  id: string;
  category: AuditCategory;
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  referenceUrl: string;
  checkLogic: string; // Internal instruction for the crawler/evaluator
}

export interface AuditResult {
  ruleId: string;
  passed: boolean;
  score: number; // 0 to 100
  observation: string;
  recommendation: string;
  screenshot?: string; // Base64 encoded JPEG
}

export interface FullAuditReport {
  url: string;
  timestamp: string;
  overallScore: number;
  results: AuditResult[];
}
