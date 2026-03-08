export type AuditCategory = 'home' | 'plp' | 'pdp' | 'checkout' | 'accessibility';
export type AuditType = 'cro' | 'accessibility';

export interface AuditRule {
  id: string;
  category: AuditCategory;
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  referenceUrl: string;
  checkLogic?: string;
}

export interface AuditResult {
  ruleId: string;
  passed: boolean;
  score: number;
  observation: string;
  recommendation: string;
  screenshot?: string;
}

export interface FullAuditReport {
  url: string;
  timestamp: string;
  overallScore: number;
  results: AuditResult[];
  detectedType: AuditCategory;
  lang: string;
  auditType: AuditType;
}
