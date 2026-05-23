import { getStaff } from '@/lib/queries';

export async function GET() {
  const staff = await getStaff();
  return Response.json(staff);
}