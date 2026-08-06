import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { diaHora } from "@/lib/datetime";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Retorna os dados da leitura de um participante pelo código (token).
 * Devolve apenas o que o participante vê — nunca a prioridade comercial interna
 * nem as respostas qualitativas (obstáculo/interesse/tema).
 */
export async function GET(req: Request) {
  const code = new URL(req.url).searchParams.get("code");
  if (!code) return NextResponse.json({ error: "Código ausente." }, { status: 400 });
  const c = code.trim().toUpperCase();

  const db = supabaseAdmin();
  const { data: part } = await db
    .from("participantes")
    .select("id, codigo, nome, empresa, cidade, uf, created_at, completed")
    .eq("codigo", c)
    .maybeSingle();
  if (!part || part.completed === false) {
    return NextResponse.json({ error: "Código não encontrado." }, { status: 404 });
  }
  const { data: resp } = await db
    .from("respostas")
    .select("valores")
    .eq("participante_id", part.id)
    .maybeSingle();
  const { dia, hora } = diaHora(part.created_at);

  return NextResponse.json({
    profile: {
      nome: part.nome,
      empresa: part.empresa,
      cidade: part.cidade,
      uf: part.uf,
      code: part.codigo,
      dia,
      hora,
    },
    // apenas as 15 respostas de escala — suficiente para o radar/nota/dimensões
    ans: resp?.valores || [],
  });
}
