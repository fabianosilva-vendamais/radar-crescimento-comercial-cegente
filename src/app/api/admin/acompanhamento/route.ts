import { NextResponse } from "next/server";
import { supabaseAdmin, verifyAdmin, bearerFrom } from "@/lib/supabase-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Salva o acompanhamento comercial de um participante. Protegido (admin).
export async function POST(req: Request) {
  const token = bearerFrom(req);
  if (!(await verifyAdmin(token))) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });
  }
  const id = String(body?.id || "").trim();
  if (!id) return NextResponse.json({ error: "ID ausente." }, { status: 400 });

  const patch: any = { updated_at: new Date().toISOString() };
  if (typeof body.status_comercial === "string") patch.status_comercial = body.status_comercial;
  if (typeof body.contatado === "boolean") patch.contatado = body.contatado;
  if (typeof body.observacao === "string") patch.observacao = body.observacao;

  const db = supabaseAdmin();
  const { error } = await db.from("acompanhamento").update(patch).eq("participante_id", id);
  if (error) return NextResponse.json({ error: "Falha ao salvar." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
