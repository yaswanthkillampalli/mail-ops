import gemini from './model';
import { SYSTEM_PROMPT } from './prompt';
import { normalizeReplySuggestions } from './validators';
import type { GeminiAnalysisResult } from './types';

/**
 * Runs Gemini deep analysis on an incoming email.
 * Returns summary, core_issue, and 3 reply suggestions.
 */
export async function analyzeEmail(
  subject: string,
  bodyText: string,
  fromName?: string | null
): Promise<GeminiAnalysisResult> {
  const userMessage = `
From: ${fromName ?? 'Unknown'}
Subject: ${subject}
Body:
${bodyText}
`.trim();

  const response = await gemini.models.generateContent({
    model: process.env.GEMINI_MODEL ?? 'gemini-2.0-flash',
    config: {
      systemInstruction: SYSTEM_PROMPT,
      temperature: 0.4,
      maxOutputTokens: 1024,
      responseMimeType: 'application/json',
    },
    contents: userMessage,
  });

  const raw = response.text ?? '';

  let parsed: Partial<GeminiAnalysisResult>;
  try {
    const cleaned = raw.replace(/```json|```/g, '').trim();
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error(`Gemini returned invalid JSON: ${raw}`);
  }

  return {
    summary: typeof parsed.summary === 'string' ? parsed.summary : 'Support request received.',
    core_issue:
      typeof parsed.core_issue === 'string'
        ? parsed.core_issue
        : 'Issue details not extracted.',
    reply_suggestions: normalizeReplySuggestions(parsed.reply_suggestions),
  };
}