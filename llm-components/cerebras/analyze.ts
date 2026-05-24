import cerebras from './model';
import { SYSTEM_PROMPT } from './prompt';
import { normalizeReplySuggestions } from './validators';
import type { CerebrasAnalysisResult } from './types';

/**
 * Runs Cerebras deep analysis on an incoming email.
 * Returns summary, core_issue, and 3 reply suggestions.
 */
export async function analyzeEmail(
  subject: string,
  bodyText: string,
  fromName?: string | null
): Promise<CerebrasAnalysisResult> {
  const userMessage = `
From: ${fromName ?? 'Unknown'}
Subject: ${subject}
Body:
${bodyText}
`.trim();

  const response = await cerebras.chat.completions.create({
    model: process.env.CEREBRAS_MODEL ?? 'gpt-oss-120b',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userMessage },
    ],
    temperature: 0.4,
    max_tokens: 1024,
    response_format: { type: 'json_object' },
  });

  const raw = response.choices[0]?.message?.content ?? '{}';

  let parsed: Partial<CerebrasAnalysisResult>;
  try {
    const cleaned = raw.replace(/```json|```/g, '').trim();
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error(`Cerebras returned invalid JSON: ${raw}`);
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