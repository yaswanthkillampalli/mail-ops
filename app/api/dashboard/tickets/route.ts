import { getTickets } from '@/lib/queries';
export async function GET() {
  const tickets = await getTickets();
  return Response.json(tickets);
}