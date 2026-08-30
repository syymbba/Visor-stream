import { createClient } from '@supabase/supabase-js';
import { auth } from '../firebase';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Copy them from Supabase ' +
    'Dashboard > Project Settings > Data API into your .env file.'
  );
}

// This app authenticates with Firebase, not Supabase Auth. `accessToken`
// bridges the two via Supabase's Third-Party Auth support: Supabase must
// have Firebase configured as a Sign In provider (Dashboard > Authentication
// > Sign In / Providers > Firebase, using this project's Firebase project
// ID) so it can verify this ID token itself and populate auth.uid() with the
// Firebase UID inside RLS policies. Without that dashboard step, every
// owner-scoped policy in supabase/client_schema.sql denies access.
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  accessToken: async () => (await auth.currentUser?.getIdToken()) ?? null,
});
