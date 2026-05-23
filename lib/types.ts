// lib/types.ts
export type EmailStatus = 'unread' | 'read' | 'archived';
export type Priority = 'Critical' | 'High' | 'Medium' | 'Low';
export type Tag = 'Network' | 'Hardware' | 'Software' | 'Access' | 'Billing' | 'Complaint' | 'Info';
export type Sentiment = 'Angry' | 'Frustrated' | 'Neutral' | 'Positive';

export type EmailWithAnalysis = Awaited<ReturnType<typeof import('./queries').getEmailsWithAnalysis>>[number];
export type RecentEmail = Awaited<ReturnType<typeof import('./queries').getRecentEmails>>[number];
export type Ticket = Awaited<ReturnType<typeof import('./queries').getTickets>>[number];
export type Reply = Awaited<ReturnType<typeof import('./queries').getReplies>>[number];