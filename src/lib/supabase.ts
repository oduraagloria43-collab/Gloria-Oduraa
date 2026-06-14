import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseClient: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!supabaseClient) {
    // Check both server-side (process.env) and client-side (import.meta.env) context sources
    const supabaseUrl = (typeof process !== 'undefined' ? process.env?.SUPABASE_URL : undefined) || 
                        ((import.meta as any).env?.VITE_SUPABASE_URL) || 
                        '';
    const supabaseKey = (typeof process !== 'undefined' ? process.env?.SUPABASE_ANON_KEY : undefined) || 
                        ((import.meta as any).env?.VITE_SUPABASE_ANON_KEY) || 
                        '';

    if (!supabaseUrl || !supabaseKey) {
      console.warn("SUPABASE_URL and SUPABASE_ANON_KEY environment variables are missing. Falling back to placeholder configuration to prevent application crash during startup.");
      supabaseClient = createClient(
        supabaseUrl || 'https://placeholder-project.supabase.co',
        supabaseKey || 'placeholder-anon-key'
      );
    } else {
      supabaseClient = createClient(supabaseUrl, supabaseKey);
    }
  }
  return supabaseClient;
}

export default getSupabase;
