import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Telão: lê APENAS a função agregada e anônima telao_stats() com a chave
 * anônima. Nenhum dado individual trafega — a função só devolve agregados
 * (e apenas a contagem quando há menos de 10 respostas).
 */
export async function GET() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return NextResponse.json({ error: "Configuração ausente." }, { status: 500 });
  }
  const anon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await anon.rpc("telao_stats");
  if (error) {
    return NextResponse.json({ error: "Falha ao carregar o painel." }, { status: 500 });
  }
  return NextResponse.json(data || { total: 0, ready: false });
}
