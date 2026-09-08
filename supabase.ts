import { createClient } from '@supabase/supabase-js';

// Usa a service role key porque esta app não tem contas de utilizador —
// todas as chamadas ao Supabase acontecem no servidor (API routes / cron).
export function getSupabaseServerClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error('SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY em falta nas variáveis de ambiente.');
  }

  return createClient(url, key, {
    auth: { persistSession: false },
  });
}
