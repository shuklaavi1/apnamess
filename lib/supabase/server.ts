import { createClient as createSupabaseClient } from '@supabase/supabase-js';

/**
 * Server-only Supabase client for admin operations (e.g. seed scripts, user administration).
 * NEVER expose or import this file in client-side components.
 */
export function createAdminServerClient() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    '';

  const serviceKey =
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    '';

  if (!supabaseUrl || !serviceKey) {
    throw new Error('Missing Supabase server configuration variables');
  }

  return createSupabaseClient(supabaseUrl, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
