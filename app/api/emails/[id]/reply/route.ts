import { supabaseAdmin } from '@/lib/supabase';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params; // ← await params first
  const { to, subject, body, was_ai_suggestion } = await request.json();

  // send via Resend
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: `Support <support@yashcodes.tech>`,
      to: [to],
      subject: `Re: ${subject}`,
      text: body,
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    return Response.json({ error: err }, { status: 500 });
  }

  const { error } = await supabaseAdmin
    .from('replies')
    .insert({
      email_id: id, // ← use destructured id
      reply_body: body,
      was_ai_suggestion: was_ai_suggestion ?? false,
    });

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ success: true });
}