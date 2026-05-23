import { supabaseAdmin } from './supabase';
import { classifyEmail } from '@/llm-components/groq';
import { analyzeEmail } from '@/llm-components/gemini';

// ─── Types ────────────────────────────────────────────────────────────────────

interface EmailPayload {
	id: string;
	subject: string | null;
	body_text: string | null;
	from_name: string | null;
}

// ─── Step 1: Insert empty analysis row ───────────────────────────────────────

async function insertEmptyAnalysis(emailId: string): Promise<void> {
	const { error } = await supabaseAdmin
		.from('email_analysis')
		.insert({ email_id: emailId });

	if (error) {
		console.error('❌ Failed to insert empty analysis row:', error.message);
		throw error;
	}

	console.log('🆕 Empty analysis row created for email:', emailId);
}

// ─── Step 2a: Groq → update tag, priority, sentiment, escalation ─────────────

async function runGroqAnalysis(email: EmailPayload): Promise<void> {
	try {
		console.log('⚡ Groq analysis started for email:', email.id);

		const result = await classifyEmail(
			email.subject ?? '(no subject)',
			email.body_text ?? '',
			email.from_name
		);

		const { error } = await supabaseAdmin
			.from('email_analysis')
			.update({
				tag: result.tag,
				priority: result.priority,
				sentiment: result.sentiment,
				escalation: result.escalation,
			})
			.eq('email_id', email.id);

		if (error) {
			console.error('❌ Groq DB update failed:', error.message);
			return;
		}

		console.log('✅ Groq analysis saved for email:', email.id, result);
	} catch (err) {
		console.error('❌ Groq analysis error for email:', email.id, err);
	}
}

// ─── Step 2b: Gemini → update summary, core_issue, reply_suggestions ─────────

async function runGeminiAnalysis(email: EmailPayload): Promise<void> {
	try {
		console.log('🔮 Gemini analysis started for email:', email.id);

		const result = await analyzeEmail(
			email.subject ?? '(no subject)',
			email.body_text ?? '',
			email.from_name
		);

		const { error } = await supabaseAdmin
			.from('email_analysis')
			.update({
				summary: result.summary,
				core_issue: result.core_issue,
				reply_suggestions: result.reply_suggestions,
			})
			.eq('email_id', email.id);

		if (error) {
			console.error('❌ Gemini DB update failed:', error.message);
			return;
		}

		console.log('✅ Gemini analysis saved for email:', email.id);
	} catch (err) {
		console.error('❌ Gemini analysis error for email:', email.id, err);
	}
}

// ─── Main export: call this from saveEmail ────────────────────────────────────

/**
 * Inserts an empty analysis row, then fires Groq and Gemini in parallel.
 * Non-blocking — the webhook can return 200 while this runs in the background.
 */
export async function triggerEmailAnalysis(email: EmailPayload): Promise<void> {
	await insertEmptyAnalysis(email.id);

	// Fire both independently — neither waits for the other
	runGroqAnalysis(email);
	runGeminiAnalysis(email);
}
