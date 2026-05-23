import type { EmailPriority, EmailSentiment, EmailTag } from './types';

const TAGS: EmailTag[] = [
  'Network',
  'Hardware',
  'Software',
  'Access',
  'Billing',
  'Complaint',
  'Info',
];

const PRIORITIES: EmailPriority[] = ['Critical', 'High', 'Medium', 'Low'];
const SENTIMENTS: EmailSentiment[] = ['Angry', 'Frustrated', 'Neutral', 'Positive'];

export function isValidTag(value: unknown): value is EmailTag {
  return typeof value === 'string' && TAGS.includes(value as EmailTag);
}

export function isValidPriority(value: unknown): value is EmailPriority {
  return typeof value === 'string' && PRIORITIES.includes(value as EmailPriority);
}

export function isValidSentiment(value: unknown): value is EmailSentiment {
  return typeof value === 'string' && SENTIMENTS.includes(value as EmailSentiment);
}