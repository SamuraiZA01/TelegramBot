import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

// Fixed: Corrected the syntax error where credentials were not treated as strings.
const supabaseUrl = 'https://ccqhokceyjduzrrhazzt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNjcWhva2NleWpkdXpycmhhenp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwODM0OTksImV4cCI6MjA4NDY1OTQ5OX0.fqbfI4dpdqcwOm4nzcWLFnnJbmKUN6RqAdncrDRA-b0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);