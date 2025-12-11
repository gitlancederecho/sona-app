// src/lib/api/streams.ts
// API module for fetching stream data from Supabase

import { supabase } from 'src/lib/supabase';

export type Stream = {
  id: string;
  title: string;
  playback_url: string | null;
  status: 'live' | 'ended' | 'scheduled';
  user_id: string;
  created_at: string;
  started_at?: string | null;
  ended_at?: string | null;
};

/**
 * Fetch all streams with status = 'live'
 * Returns streams ordered by started_at (most recent first)
 */
export async function getLiveStreams(): Promise<{ data: Stream[] | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('streams')
      .select('*')
      .eq('status', 'live')
      .order('started_at', { ascending: false });

    if (error) {
      console.error('[streams] getLiveStreams error:', error);
      return { data: null, error: new Error(error.message) };
    }

    return { data: data as Stream[], error: null };
  } catch (e: any) {
    console.error('[streams] getLiveStreams exception:', e);
    return { data: null, error: e };
  }
}

/**
 * Fetch a single stream by ID
 * Returns the stream metadata including playback_url
 */
export async function getStreamById(id: string): Promise<{ data: Stream | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('streams')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('[streams] getStreamById error:', error);
      return { data: null, error: new Error(error.message) };
    }

    return { data: data as Stream | null, error: null };
  } catch (e: any) {
    console.error('[streams] getStreamById exception:', e);
    return { data: null, error: e };
  }
}
