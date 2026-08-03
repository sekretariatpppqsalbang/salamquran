import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Default Supabase configuration parameters provided by user
const DEFAULT_SUPABASE_URL = 'https://tlmjvpkknclelfsclvae.supabase.co';
const DEFAULT_SUPABASE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRsbWp2cGtrbmNsZWxmc2NsdmFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUzODU0NDIsImV4cCI6MjEwMDk2MTQ0Mn0.dZznkc6kB8fN4vcBc5tv0__2ic5XRh_NyeqkMDHYrS8';

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
    (typeof process !== 'undefined' && (process.env?.SUPABASE_PUBLISHABLE_KEY || process.env?.SUPABASE_SECRET_KEY)) ||
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
