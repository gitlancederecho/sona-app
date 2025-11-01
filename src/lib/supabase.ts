import { createClient } from '@supabase/supabase-js';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!url) throw new Error('Missing EXPO_PUBLIC_SUPABASE_URL. Create .env.local in project root.');
if (!key) throw new Error('Missing EXPO_PUBLIC_SUPABASE_ANON_KEY. Add it to .env.local.');

export const supabase = createClient(url, key);
