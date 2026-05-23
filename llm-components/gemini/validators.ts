import type { GeminiAnalysisResult } from './types';

export function isValidReplySuggestions(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

export function normalizeReplySuggestions(value: unknown): string[] {
  const suggestions = isValidReplySuggestions(value)
    ? value.slice(0, 3)
    : [];

  while (suggestions.length < 3) {
    suggestions.push('Thank you for contacting support. A team member will follow up with you shortly.');
  }

  return suggestions;
}

export function isGeminiAnalysisResult(value: Partial<GeminiAnalysisResult>): value is GeminiAnalysisResult {
  return (
    typeof value.summary === 'string' &&
    typeof value.core_issue === 'string' &&
    Array.isArray(value.reply_suggestions) &&
    value.reply_suggestions.length === 3
  );
}