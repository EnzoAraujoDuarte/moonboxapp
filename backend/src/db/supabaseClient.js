import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

const SUPABASE_KEY = SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY;

let supabase;

// Fallback para modo dev sem Supabase configurado
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.log('🔧 [DEV MODE] Supabase não configurado, usando mock client em memória');
  const { supabase: mockClient } = await import('./devMockClient.js');
  supabase = mockClient;
} else {
  console.log('🔗 [PROD MODE] Conectando ao Supabase:', SUPABASE_URL);
  supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export { supabase };


