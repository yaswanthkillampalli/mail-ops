import { getRecentEmails } from "@/lib/queries";
export async function GET() {
  const emails = await getRecentEmails(5);
  return Response.json(emails);
}