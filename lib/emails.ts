import { supabaseAdmin } from './supabase';
import { resend } from '@/lib/resend';
import { triggerEmailAnalysis } from './email_analysis';

export async function saveEmail(payload: { data: { email_id: string; from: string; subject: string } }) {
  const {
    email_id,
    from,
    subject,
  } = payload.data;

  const { data: fullEmail, error: emailError } = await resend.emails.receiving.get(email_id);

  if (emailError || !fullEmail) {
    const message = emailError?.message ?? 'Failed to fetch receiving email';
    console.error('❌ Error fetching full email:', message);
    throw new Error(message);
  }

  console.log('📨 Full email fetched:', fullEmail);

  const fromHeader = fullEmail.headers?.from ?? from;
  const fromEmail = fromHeader?.match(/<(.+)>/)?.[1] ?? from;
  const fromName = fromHeader?.match(/^"?(.+?)"?\s*</)?.[1] ?? null;

  const { data, error } = await supabaseAdmin
    .from('emails')
    .insert({
      from_email: fromEmail,
      from_name: fromName,
      subject: subject ?? '(no subject)',
      body_text: fullEmail.text ?? null,
      body_html: fullEmail.html ?? null,
      received_at: new Date().toISOString(),
      status: 'unread'
    })
    .select('id')
    .single();

  if (error) {
    console.error('❌ Error saving email:', error.message);
    throw error;
  }

  console.log('✅ Email saved with id:', data.id);

  // Kick off analysis in the background — does not block the webhook response
  triggerEmailAnalysis({
    id: data.id,
    subject: subject ?? null,
    body_text: fullEmail.text ?? null,
    from_name: fromName,
  });

  return data;
}