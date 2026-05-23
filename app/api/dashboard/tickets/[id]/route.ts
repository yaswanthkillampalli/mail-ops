import { supabaseAdmin } from '@/lib/supabase';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { status } = await request.json();

  const updateData: any = { status };

  // set resolved_at if resolving
  if (status === 'Resolved') {
    updateData.resolved_at = new Date().toISOString();
  }

  const { error } = await supabaseAdmin
    .from('tickets')
    .update(updateData)
    .eq('id', params.id);

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ success: true });
}