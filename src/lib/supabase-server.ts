import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ANON_KEY } from "./env";

/**
 * Cliente de servidor com a service_role — bypassa RLS para as gravações
 * transacionais (participante + respostas + resultados + email + código).
 * NUNCA importar este módulo em código de cliente.
 */
let _admin: SupabaseClient | null = null;
export function supabaseAdmin(): SupabaseClient {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      "Configuração ausente: defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY nas variáveis de ambiente."
    );
  }
  if (!_admin) {
    _admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return _admin;
}

/**
 * Verifica o token de acesso (Supabase Auth) de um admin autenticado.
 * Usado para proteger as rotas de leitura individual do painel.
 */
export async function verifyAdmin(accessToken: string | null): Promise<boolean> {
  if (!accessToken) return false;
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return false;
  try {
    const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data, error } = await client.auth.getUser(accessToken);
    return !error && !!data.user;
  } catch {
    return false;
  }
}

export function bearerFrom(req: Request): string | null {
  const h = req.headers.get("authorization") || req.headers.get("Authorization");
  if (!h) return null;
  const m = h.match(/^Bearer\s+(.+)$/i);
  return m ? m[1] : null;
}
