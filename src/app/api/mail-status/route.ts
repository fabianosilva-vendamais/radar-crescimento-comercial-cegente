import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Status do e-mail para um código de leitura (o código é o token de acesso).
export async function GET(req: Request) {
  const code = new URL(req.url).searchParams.get("code");
  if (!code) return NextResponse.json({ error: "Código ausente." }, { status: 400 });
  const db = supabaseAdmin();
  const { data: part } = await db
    .from("participantes")
    .select("id")
    .eq("codigo", code)
    .maybeSingle();
  if (!part) return NextResponse.json({ error: "Não encontrado." }, { status: 404 });
  const { data: mail } = await db
    .from("emails")
    .select("status, tries, last_err")
    .eq("participante_id", part.id)
    .maybeSingle();
  return NextResponse.json({
    status: mail?.status || "fila",
    tries: mail?.tries || 0,
    error: mail?.last_err || "",
  });
}
