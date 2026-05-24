import { supabaseAdmin } from './supabase';
import { classifyEmail } from '@/llm-components/groq';
import { analyzeEmail } from '@/llm-components/cerebras';

// ─── Types ────────────────────────────────────────────────────────────────────

interface EmailPayload {
	id: string;
	subject: string | null;
	body_text: string | null;
	from_name: string | null;
}

async function ensureAnalysisRow(emailId: string): Promise<void> {
	const { data: existingRow, error: lookupError } = await supabaseAdmin
		.from('email_analysis')
		.select('id')
		.eq('email_id', emailId)
		.maybeSingle();

	if (lookupError) {
		console.error('❌ Failed to look up analysis row:', lookupError.message);
		throw lookupError;
	}

	if (existingRow) {
		return;
	}

	const { error } = await supabaseAdmin
		.from('email_analysis')
		.insert({ email_id: emailId });

	if (error) {
		console.error('❌ Failed to ensure analysis row:', error.message);
		throw error;
	}

	console.log('🆕 Analysis row ensured for email:', emailId);
}

async function getEmailPayload(emailId: string): Promise<EmailPayload> {
	const { data, error } = await supabaseAdmin
		.from('emails')
		.select('id, subject, body_text, from_name')
		.eq('id', emailId)
		.single();

	if (error) {
		console.error('❌ Failed to load email for analysis:', error.message);
		throw error;
	}

	if (!data) {
		throw new Error('Email not found');
	}

	return data;
}

async function upsertGroqAnalysis(email: EmailPayload, result: {
	tag: string;
	priority: string;
	sentiment: string;
	escalation: boolean;
}): Promise<void> {
	const { data: updatedRows, error: updateError } = await supabaseAdmin
		.from('email_analysis')
		.update({
			email_id: email.id,
			tag: result.tag,
			priority: result.priority,
			sentiment: result.sentiment,
			escalation: result.escalation,
		})
		.eq('email_id', email.id)
		.select('id');

	if (updateError) {
		console.error('❌ Groq DB update failed:', updateError.message);
		return;
	}

	if ((updatedRows ?? []).length > 0) {
		console.log('✅ Groq analysis saved for email:', email.id, result);
		return;
	}

	const { error: insertError } = await supabaseAdmin
		.from('email_analysis')
		.insert({
			email_id: email.id,
			tag: result.tag,
			priority: result.priority,
			sentiment: result.sentiment,
			escalation: result.escalation,
		});

	if (insertError) {
		console.error('❌ Groq DB insert failed:', insertError.message);
		return;
	}

	console.log('✅ Groq analysis saved for email:', email.id, result);
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

		await upsertGroqAnalysis(email, result);
	} catch (err) {
		console.error('❌ Groq analysis error for email:', email.id, err);
	}
}

// ─── Step 2b: Cerebras → update summary, core_issue, reply_suggestions ─────────

async function runCerebrasAnalysis(email: EmailPayload): Promise<void> {
	try {
		console.log('🔮 Cerebras analysis started for email:', email.id);

		const result = await analyzeEmail(
			email.subject ?? '(no subject)',
			email.body_text ?? '',
			email.from_name
		);

		const { data: updatedRows, error: updateError } = await supabaseAdmin
			.from('email_analysis')
			.update({
				email_id: email.id,
				summary: result.summary,
				core_issue: result.core_issue,
				reply_suggestions: result.reply_suggestions,
			})
			.eq('email_id', email.id)
			.select('id');

		if (updateError) {
			console.error('❌ Cerebras DB update failed:', updateError.message);
			return;
		}

		if ((updatedRows ?? []).length > 0) {
			console.log('✅ Cerebras analysis saved for email:', email.id);
			return;
		}

		const { error: insertError } = await supabaseAdmin
			.from('email_analysis')
			.insert({
				email_id: email.id,
				summary: result.summary,
				core_issue: result.core_issue,
				reply_suggestions: result.reply_suggestions,
			});

		if (insertError) {
			console.error('❌ Cerebras DB insert failed:', insertError.message);
			return;
		}

		console.log('✅ Cerebras analysis saved for email:', email.id);
	} catch (err) {
		console.error('❌ Cerebras analysis error for email:', email.id, err);
	}
}

async function runAnalysisPipeline(email: EmailPayload): Promise<void> {
	await ensureAnalysisRow(email.id);
	await Promise.all([
		runGroqAnalysis(email),
		runCerebrasAnalysis(email),
	]);
}

// ─── Main export: call this from saveEmail ────────────────────────────────────

/**
 * Ensures an analysis row exists, then fires Groq and Cerebras in parallel.
 * Non-blocking — the webhook can return 200 while this runs in the background.
 */
export async function triggerEmailAnalysis(email: EmailPayload): Promise<void> {
	void runAnalysisPipeline(email).catch(err => {
		console.error('❌ Background analysis pipeline failed for email:', email.id, err);
	});
}

export async function reanalyzeEmail(emailId: string): Promise<void> {
	const email = await getEmailPayload(emailId);
	await runAnalysisPipeline(email);
}
