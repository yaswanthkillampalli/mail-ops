import { getDashboardStats } from '@/lib/queries';
export async function GET() {
  const stats = await getDashboardStats();
  return Response.json(stats);
}