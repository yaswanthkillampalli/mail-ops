import { reanalyzeEmail } from '@/lib/email_analysis';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    await reanalyzeEmail(id);
    return Response.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to reanalyze email';

    if (message === 'Email not found') {
      return Response.json({ error: message }, { status: 404 });
    }

    return Response.json({ error: message }, { status: 500 });
  }
}