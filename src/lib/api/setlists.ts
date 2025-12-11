// src/lib/api/setlists.ts
// Typed API for Setlists (works in Expo Go)

import { supabase } from 'src/lib/supabase';

export type SetlistSong = {
  id: string;
  title: string;
  notes?: string;
};

export type Setlist = {
  id: string;
  user_id: string;
  title: string;
  songs: SetlistSong[];
  created_at: string;
};

export type CreateSetlistPayload = {
  title: string;
  songs: SetlistSong[];
};

export type UpdateSetlistPayload = Partial<CreateSetlistPayload>;

export async function getSetlistsForUser(userId: string): Promise<{ data: Setlist[] | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('setlists')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) return { data: null, error: new Error(error.message) };
    return { data: (data as Setlist[]) ?? [], error: null };
  } catch (e) {
    return { data: null, error: e instanceof Error ? e : new Error('Unknown error') };
  }
}

export async function getSetlistById(id: string): Promise<{ data: Setlist | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('setlists')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return { data: null, error: new Error(error.message) };
    return { data: data as Setlist, error: null };
  } catch (e) {
    return { data: null, error: e instanceof Error ? e : new Error('Unknown error') };
  }
}

export async function createSetlist(userId: string, payload: CreateSetlistPayload): Promise<{ data: Setlist | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('setlists')
      .insert({ user_id: userId, title: payload.title, songs: payload.songs })
      .select('*')
      .single();

    if (error) return { data: null, error: new Error(error.message) };
    return { data: data as Setlist, error: null };
  } catch (e) {
    return { data: null, error: e instanceof Error ? e : new Error('Unknown error') };
  }
}

export async function updateSetlist(id: string, payload: UpdateSetlistPayload): Promise<{ data: Setlist | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('setlists')
      .update(payload)
      .eq('id', id)
      .select('*')
      .single();

    if (error) return { data: null, error: new Error(error.message) };
    return { data: data as Setlist, error: null };
  } catch (e) {
    return { data: null, error: e instanceof Error ? e : new Error('Unknown error') };
  }
}

export async function deleteSetlist(id: string): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase
      .from('setlists')
      .delete()
      .eq('id', id);

    if (error) return { error: new Error(error.message) };
    return { error: null };
  } catch (e) {
    return { error: e instanceof Error ? e : new Error('Unknown error') };
  }
}
