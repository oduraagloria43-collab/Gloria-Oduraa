import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Retrieve values with fallback to prevent crashes on initial workspace loads
const supabaseUrl = (typeof process !== 'undefined' ? process.env?.SUPABASE_URL : undefined) || 
                    ((import.meta as any).env?.VITE_SUPABASE_URL) || 
                    '';
const supabaseKey = (typeof process !== 'undefined' ? process.env?.SUPABASE_ANON_KEY : undefined) || 
                    ((import.meta as any).env?.VITE_SUPABASE_ANON_KEY) || 
                    '';

export const supabase: SupabaseClient = createClient(
  supabaseUrl || 'https://placeholder-project.supabase.co',
  supabaseKey || 'placeholder-anon-key'
);

export function getSupabase(): SupabaseClient {
  return supabase;
}

export default supabase;
