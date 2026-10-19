import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://nnzdhpmppkqpncivaizm.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5uemRocG1wcGtxcG5jaXZhaXptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIyMzQ0NTcsImV4cCI6MjEwNzgxMDQ1N30.qCjyS-GIJNy0A-vOtAwnzhAC50XVzftERUBX1RXRgm0';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('[Supabase] Missing Supabase environment variables! Check .env');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

export default supabase;
