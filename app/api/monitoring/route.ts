import { getMonitoringStats } from '@/lib/queries';

export async function GET() {
  const stats = await getMonitoringStats();
  return Response.json(stats);
}