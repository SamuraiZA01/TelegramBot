import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

// Fixed: Corrected the syntax error where credentials were not treated as strings.
const supabaseUrl = 'https://ccqhokceyjduzrrhazzt.supabase.co';
const supabaseAnonKey = 'sb_secret_nLTNoy9mOhWS4LbUOb9sGQ_zOxv-bIl';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);