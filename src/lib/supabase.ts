import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!url) throw new Error('Missing EXPO_PUBLIC_SUPABASE_URL. Create .env.local.');
if (!key) throw new Error('Missing EXPO_PUBLIC_SUPABASE_ANON_KEY. Add it to .env.local.');

if (__DEV__) {
  // Log minimal diagnostics without exposing secrets
  try {
    const safeUrl = new URL(url);
    console.log('[supabase] URL set:', safeUrl.host);
  } catch {}
}

// Use AsyncStorage only on native. On web, let Supabase use localStorage.
let nativeStorage: any = undefined;
if (Platform.OS !== 'web') {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    nativeStorage = require('@react-native-async-storage/async-storage').default;
  } catch {}
}

const authOptions: any = {
  autoRefreshToken: true,
  persistSession: true,
  // We are not using web URL callbacks in Expo Go
  detectSessionInUrl: false,
};
if (nativeStorage) authOptions.storage = nativeStorage;

export const supabase = createClient(url, key, {
  auth: authOptions,
});
