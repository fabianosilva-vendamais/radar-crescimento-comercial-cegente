"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./env";

/**
 * Cliente de navegador com a chave anônima (pública). Usado para o login
 * do admin via Supabase Auth e para chamar a função agregada do telão.
 */
let _client: SupabaseClient | null = null;
export function supabaseBrowser(): SupabaseClient {
  if (!_client) {
    _client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: true, autoRefreshToken: true },
    });
  }
  return _client;
}

export function supabaseConfigured(): boolean {
  return !!SUPABASE_URL && !!SUPABASE_ANON_KEY;
}
