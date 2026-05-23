import { suggestStaff } from '@/llm-components/groq';
import { getStaff } from '@/lib/queries';

export async function POST(request: Request) {
  try {
    const { ticket } = await request.json();

    if (!ticket?.title || !ticket?.tag || !ticket?.priority) {
      return Response.json({ error: 'Missing ticket fields' }, { status: 400 });
    }

    const staff = await getStaff();

    if (staff.length === 0) {
      return Response.json({ error: 'No staff available' }, { status: 404 });
    }

    const suggestion = await suggestStaff(ticket, staff);
    return Response.json(suggestion);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return Response.json({ error: message }, { status: 500 });
  }
}