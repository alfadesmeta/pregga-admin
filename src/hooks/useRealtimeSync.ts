import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { invalidateCache } from './useSupabaseQuery';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

type TableName = 
  | 'profiles'
  | 'pregnant_profiles'
  | 'doula_profiles'
  | 'doula_assignments'
  | 'broadcast_requests'
  | 'broadcast_rejections'
  | 'conversations'
  | 'subscriptions'
  | 'weekly_content'
  | 'app_config'
  | 'deletion_requests';

interface TableCacheMapping {
  table: TableName;
  invalidatePatterns: string[];
}

const TABLE_CACHE_MAPPINGS: TableCacheMapping[] = [
  { 
    table: 'profiles', 
    invalidatePatterns: ['users', 'doulas', 'dashboard', 'admin'] 
  },
  { 
    table: 'pregnant_profiles', 
    invalidatePatterns: ['users', 'dashboard'] 
  },
  { 
    table: 'doula_profiles', 
    invalidatePatterns: ['doulas', 'dashboard', 'verifications'] 
  },
  { 
    table: 'doula_assignments', 
    invalidatePatterns: ['doulas', 'users', 'assignments'] 
  },
  { 
    table: 'broadcast_requests', 
    invalidatePatterns: ['broadcasts', 'dashboard'] 
  },
  { 
    table: 'broadcast_rejections', 
    invalidatePatterns: ['broadcasts'] 
  },
  { 
    table: 'conversations', 
    invalidatePatterns: ['conversations', 'chat', 'dashboard'] 
  },
  { 
    table: 'subscriptions', 
    invalidatePatterns: ['subscriptions', 'users', 'dashboard'] 
  },
  { 
    table: 'weekly_content', 
    invalidatePatterns: ['content', 'weekly'] 
  },
  { 
    table: 'app_config', 
    invalidatePatterns: ['config', 'settings'] 
  },
  { 
    table: 'deletion_requests', 
    invalidatePatterns: ['users', 'deletion'] 
  },
];

export function useRealtimeSync(): void {
  useEffect(() => {
    const channels = TABLE_CACHE_MAPPINGS.map(({ table, invalidatePatterns }) => {
      const channel = supabase
        .channel(`realtime:${table}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table },
          (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
            if (import.meta.env.DEV) {
              console.debug(`[Realtime] ${table} ${payload.eventType}`);
            }
            invalidatePatterns.forEach((pattern) => {
              invalidateCache(pattern);
            });
          }
        )
        .subscribe();

      return channel;
    });

    return () => {
      channels.forEach((channel) => {
        supabase.removeChannel(channel);
      });
    };
  }, []);
}

export function useRealtimeTable<T extends Record<string, unknown>>(
  table: TableName,
  callback: (payload: RealtimePostgresChangesPayload<T>) => void
): void {
  useEffect(() => {
    const channel = supabase
      .channel(`realtime:custom:${table}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table },
        callback as (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => void
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, callback]);
}
