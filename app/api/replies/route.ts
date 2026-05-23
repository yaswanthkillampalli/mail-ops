import { getReplies } from '@/lib/queries';

export async function GET() {
  const replies = await getReplies();
  return Response.json(replies);
}