import groq from './model';
import { SYSTEM_PROMPT } from './prompt';
import {
  isValidPriority,
  isValidSentiment,
  isValidTag,
} from './validators';
import type { GroqAnalysisResult } from './types';
/**
 * Runs fast Groq classification on an incoming email.
 * Returns tag, priority, sentiment, and escalation flag.
 */
export async function classifyEmail(
  subject: string,
  bodyText: string,
  fromName?: string | null
): Promise<GroqAnalysisResult> {
  const userMessage = `
From: ${fromName ?? 'Unknown'}
Subject: ${subject}
Body:
${bodyText}
`.trim();

  const completion = await groq.chat.completions.create({
    model: process.env.GROQ_MODEL ?? 'llama3-8b-8192',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userMessage },
    ],
    temperature: 0.1,
    max_tokens: 100,
    response_format: { type: 'json_object' },
  });

  const raw = completion.choices[0]?.message?.content ?? '{}';

  let parsed: Partial<GroqAnalysisResult>;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error(`Groq returned invalid JSON: ${raw}`);
  }

  return {
    tag: isValidTag(parsed.tag) ? parsed.tag : 'Info',
    priority: isValidPriority(parsed.priority) ? parsed.priority : 'Medium',
    sentiment: isValidSentiment(parsed.sentiment) ? parsed.sentiment : 'Neutral',
    escalation: typeof parsed.escalation === 'boolean' ? parsed.escalation : false,
  };
}