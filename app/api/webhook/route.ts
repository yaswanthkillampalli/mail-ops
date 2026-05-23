import { saveEmail } from '@/lib/emails';

export async function POST(request: Request) {
  try {
    const payload = await request.json();

    console.log('📧 Incoming webhook payload:', JSON.stringify(payload, null, 2));

    // save raw email to DB
    const email = await saveEmail(payload);

    return Response.json({ received: true, email_id: email.id });

  } catch (error: any) {
    console.error('❌ Webhook error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}