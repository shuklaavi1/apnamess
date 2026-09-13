import { createBrowserClient } from '@supabase/ssr';

const DEFAULT_SUPABASE_URL = 'https://bhntfblikfphiaxcukdr.supabase.co';
const DEFAULT_SUPABASE_KEY = 'sb_publishable_Oj_JHlf7u1jC5Wm72UnywA_HGvLH8yE';

export function createClient() {
  const supabaseUrl =
    (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL.trim() !== '')
      ? process.env.NEXT_PUBLIC_SUPABASE_URL
      : (process.env.SUPABASE_URL && process.env.SUPABASE_URL.trim() !== '')
      ? process.env.SUPABASE_URL
      : DEFAULT_SUPABASE_URL;

  const supabaseKey =
    (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.trim() !== '')
      ? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
      : (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.trim() !== '')
      ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      : (process.env.SUPABASE_ANON_KEY && process.env.SUPABASE_ANON_KEY.trim() !== '')
      ? process.env.SUPABASE_ANON_KEY
      : DEFAULT_SUPABASE_KEY;

  return createBrowserClient(supabaseUrl, supabaseKey);
}
