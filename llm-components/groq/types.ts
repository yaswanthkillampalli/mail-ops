export type EmailTag =
  | 'Network'
  | 'Hardware'
  | 'Software'
  | 'Access'
  | 'Billing'
  | 'Complaint'
  | 'Info';

export type EmailPriority = 'Critical' | 'High' | 'Medium' | 'Low';

export type EmailSentiment = 'Angry' | 'Frustrated' | 'Neutral' | 'Positive';

export interface GroqAnalysisResult {
  tag: EmailTag;
  priority: EmailPriority;
  sentiment: EmailSentiment;
  escalation: boolean;
}

export interface StaffSuggestionResult {
  staff_id: string;
  reason: string;
}