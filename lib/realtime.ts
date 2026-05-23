// lib/realtime.ts
import { useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// separate client for realtime (client-side only)
const supabaseRealtime = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export function useRealtimeRefresh(
  tables: string[],
  onUpdate: () => void
) {
  useEffect(() => {
    const channels = tables.map((table) =>
      supabaseRealtime
        .channel(`realtime:${table}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table },
          () => onUpdate()
        )
        .subscribe()
    );

    return () => {
      channels.forEach(channel =>
        supabaseRealtime.removeChannel(channel)
      );
    };
  }, [tables, onUpdate]);
}