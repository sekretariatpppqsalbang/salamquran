import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Default Supabase configuration parameters provided by user
const DEFAULT_SUPABASE_URL = 'https://tlmjvpkknclelfsclvae.supabase.co';
const DEFAULT_SUPABASE_KEY = 'sb_publishable_iPJyWhLwJZiUGHHGmWEDcw_JpfGZr5h';

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseUrl(): string {
  const metaEnv = (import.meta as unknown as { env?: Record<string, string> }).env;
  return (
    metaEnv?.VITE_SUPABASE_URL ||
    (typeof process !== 'undefined' && process.env?.SUPABASE_URL) ||
    DEFAULT_SUPABASE_URL
  );
}

export function getSupabaseKey(): string {
  const metaEnv = (import.meta as unknown as { env?: Record<string, string> }).env;
  return (
    metaEnv?.VITE_SUPABASE_ANON_KEY ||
    (typeof process !== 'undefined' && process.env?.SUPABASE_PUBLISHABLE_KEY) ||
    DEFAULT_SUPABASE_KEY
  );
}

/**
 * Lazy initialization helper for Supabase client.
 * Prevents app crashes at module load time if environment variables or credentials are missing.
 */
export function getSupabase(): SupabaseClient {
  if (!supabaseInstance) {
    const url = getSupabaseUrl();
    const key = getSupabaseKey();
    supabaseInstance = createClient(url, key);
  }
  return supabaseInstance;
}

export const supabase = getSupabase();
