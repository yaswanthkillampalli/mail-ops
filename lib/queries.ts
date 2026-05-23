// lib/queries.ts
import { supabaseAdmin } from './supabase';

// ─── Dashboard Stats ────────────────────────────────────────────
export async function getDashboardStats() {
  const [emailsRes, ticketsRes] = await Promise.all([
    supabaseAdmin.from('emails').select('status'),
    supabaseAdmin.from('tickets').select('status, priority, resolved_at'),
  ]);

  const emails = emailsRes.data ?? [];
  const tickets = ticketsRes.data ?? [];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return {
    unread: emails.filter(e => e.status === 'unread').length,
    openTickets: tickets.filter(t => t.status === 'Open').length,
    critical: tickets.filter(t => t.priority === 'Critical').length,
    resolvedToday: tickets.filter(t =>
      t.status === 'Resolved' &&
      t.resolved_at &&
      new Date(t.resolved_at) >= today
    ).length,
  };
}

// ─── Recent Emails (with analysis joined) ───────────────────────
export async function getRecentEmails(limit = 5) {
  const { data, error } = await supabaseAdmin
    .from('emails')
    .select(`
      id,
      from_email,
      from_name,
      subject,
      body_text,
      status,
      received_at,
      email_analysis (
        tag,
        priority,
        sentiment,
        escalation,
        summary,
        core_issue
      )
    `)
    .order('received_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data ?? [];
}

// ─── All Emails (with analysis joined) ──────────────────────────
export async function getEmailsWithAnalysis() {
  const { data, error } = await supabaseAdmin
    .from('emails')
    .select(`
      id,
      from_email,
      from_name,
      subject,
      body_text,
      body_html,
      status,
      received_at,
      email_analysis (
        tag,
        priority,
        sentiment,
        escalation,
        summary,
        core_issue,
        reply_suggestions
      )
    `)
    .order('received_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

// ─── Single Email (with analysis + replies) ──────────────────────
export async function getEmailById(id: string) {
  const { data, error } = await supabaseAdmin
    .from('emails')
    .select(`
      *,
      email_analysis (*),
      replies (*)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

// ─── Recent Analysis ─────────────────────────────────────────────
export async function getRecentAnalysis(limit = 5) {
  const { data, error } = await supabaseAdmin
    .from('email_analysis')
    .select(`
      id,
      tag,
      priority,
      sentiment,
      escalation,
      core_issue,
      created_at,
      emails (
        subject,
        from_email,
        from_name
      )
    `)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data ?? [];
}

// ─── All Tickets ─────────────────────────────────────────────────
// export async function getTickets() {
//   const { data, error } = await supabaseAdmin
//     .from('tickets')
//     .select(`
//       *,
//       emails (
//         from_email,
//         from_name,
//         subject
//       )
//     `)
//     .order('created_at', { ascending: false });

//   if (error) throw error;
//   return data ?? [];
// }

// ─── All Replies ──────────────────────────────────────────────────
export async function getReplies() {
  const { data, error } = await supabaseAdmin
    .from('replies')
    .select(`
      *,
      emails (
        subject,
        from_email,
        from_name
      )
    `)
    .order('sent_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

// ─── Monitoring Stats ─────────────────────────────────────────────
export async function getMonitoringStats() {
  const { data, error } = await supabaseAdmin
    .from('email_analysis')
    .select('tag, priority, sentiment, created_at');

  if (error) throw error;
  const analysis = data ?? [];

  // Tag distribution
  const tagCounts = analysis.reduce((acc, a) => {
    acc[a.tag] = (acc[a.tag] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Priority distribution
  const priorityCounts = analysis.reduce((acc, a) => {
    acc[a.priority] = (acc[a.priority] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Sentiment distribution
  const sentimentCounts = analysis.reduce((acc, a) => {
    acc[a.sentiment] = (acc[a.sentiment] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    total: analysis.length,
    tagCounts,
    priorityCounts,
    sentimentCounts,
    lastRun: analysis[0]?.created_at ?? null,
  };
}

// ─── Create Ticket ────────────────────────────────────────────
export async function createTicket({
  email_id,
  title,
  tag,
  priority,
}: {
  email_id: string;
  title: string;
  tag: string;
  priority: string;
}) {
  // check if ticket already exists for this email
  const { data: existing } = await supabaseAdmin
    .from('tickets')
    .select('id')
    .eq('email_id', email_id)
    .maybeSingle();

  if (existing) return { error: 'exists' };

  const { data, error } = await supabaseAdmin
    .from('tickets')
    .insert({ email_id, title, tag, priority, status: 'Open' })
    .select('id')
    .single();

  if (error) return { error: error.message };
  return { ticket: data };
}

// Update ticket status
export async function updateTicketStatus(id: string, status: string) {
  const updateData: any = { status };
  if (status === 'Resolved') updateData.resolved_at = new Date().toISOString();

  const { error } = await supabaseAdmin
    .from('tickets')
    .update(updateData)
    .eq('id', id);

  if (error) throw error;
}

// ─── Get All Staff ────────────────────────────────────────────
export async function getStaff() {
  const { data, error } = await supabaseAdmin
    .from('staff')
    .select('id, name, email, specialty, avatar_initials')
    .eq('is_active', true)
    .order('name');

  if (error) throw error;
  return data ?? [];
}

// ─── Assign Ticket to Staff ───────────────────────────────────
export async function assignTicket(id: string, staff_id: string | null) {
  const { error } = await supabaseAdmin
    .from('tickets')
    .update({ assigned_to: staff_id })
    .eq('id', id);

  if (error) throw error;
}

export async function getTickets() {
  const { data, error } = await supabaseAdmin
    .from('tickets')
    .select(`
      *,
      emails (
        from_email,
        from_name,
        subject
      ),
      staff (
        id,
        name,
        specialty,
        avatar_initials
      )
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}