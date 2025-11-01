// src/lib/api/auth.ts
import { supabase } from "src/lib/supabase";

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { session: data.session, error };
}

export async function signUpWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  return { session: data.session, error };
}

export async function signOut() {
  await supabase.auth.signOut();
}
