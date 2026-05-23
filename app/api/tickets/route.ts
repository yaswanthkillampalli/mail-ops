import { createTicket } from '@/lib/queries';

export async function POST(request: Request) {
  const { email_id, title, tag, priority } = await request.json();

  const result = await createTicket({ email_id, title, tag, priority });

  if (result.error === 'exists')
    return Response.json({ error: 'Ticket already exists' }, { status: 400 });

  if (result.error)
    return Response.json({ error: result.error }, { status: 500 });

  return Response.json({ ticket: result.ticket });
}