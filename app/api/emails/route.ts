import { getEmailsWithAnalysis } from '@/lib/queries';

export async function GET() {
  const emails = await getEmailsWithAnalysis();
  return Response.json(emails);
}