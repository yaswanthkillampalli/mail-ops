import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { status } = await request.json();

  const updateData: { status: string; resolved_at?: string } = { status };

  // set resolved_at if resolving
  if (status === 'Resolved') {
    updateData.resolved_at = new Date().toISOString();
  }

  const { error } = await supabaseAdmin
    .from('tickets')
    .update(updateData)
    .eq('id', id);

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ success: true });
}