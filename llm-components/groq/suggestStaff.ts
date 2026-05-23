import groq from './model';
import { STAFF_ROUTING_PROMPT } from './prompt';
import type { StaffSuggestionResult } from './types';

/**
 * Uses Groq to suggest the best staff member for a ticket.
 */
export async function suggestStaff(
  ticket: {
    title: string;
    tag: string;
    priority: string;
    notes?: string | null;
  },
  staff: {
    id: string;
    name: string;
    specialty: string;
  }[]
): Promise<StaffSuggestionResult> {
  const staffList = staff
    .map((s, i) => `${i + 1}. ID: ${s.id} | Name: ${s.name} | Specialty: ${s.specialty}`)
    .join('\n');

  const userMessage = `
Ticket Details:
- Title: ${ticket.title}
- Tag: ${ticket.tag}
- Priority: ${ticket.priority}
- Notes: ${ticket.notes ?? 'None'}

Available Staff:
${staffList}

Pick the best staff member for this ticket. Return JSON only.
`.trim();

  const completion = await groq.chat.completions.create({
    model: process.env.GROQ_MODEL ?? 'llama3-8b-8192',
    messages: [
      { role: 'system', content: STAFF_ROUTING_PROMPT },
      { role: 'user', content: userMessage },
    ],
    temperature: 0.2,
    max_tokens: 100,
    response_format: { type: 'json_object' },
  });

  const raw = completion.choices[0]?.message?.content ?? '{}';

  let parsed: Partial<StaffSuggestionResult>;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error(`Groq returned invalid JSON: ${raw}`);
  }

  const validId = staff.find(s => s.id === parsed.staff_id)?.id ?? staff[0].id;

  return {
    staff_id: validId,
    reason: parsed.reason ?? 'Best match based on specialty.',
  };
}