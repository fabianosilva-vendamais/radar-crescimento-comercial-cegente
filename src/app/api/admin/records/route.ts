import { NextResponse } from "next/server";
import { supabaseAdmin, verifyAdmin, bearerFrom } from "@/lib/supabase-server";
import { shapeRecord } from "@/lib/records";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Lista todos os participantes com respostas, e-mail e acompanhamento,
 * no formato de "record" do painel. Protegido: exige admin autenticado
 * (Supabase Auth) — leitura individual só para o admin.
 */
export async function GET(req: Request) {
  const token = bearerFrom(req);
  if (!(await verifyAdmin(token))) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }
  const db = supabaseAdmin();
  const [{ data: parts }, { data: resps }, { data: mails }, { data: acomps }] = await Promise.all([
    db.from("participantes").select("*").order("created_at", { ascending: true }),
    db.from("respostas").select("participante_id, valores"),
    db.from("emails").select("*"),
    db.from("acompanhamento").select("*"),
  ]);

  const respBy = new Map((resps || []).map((r: any) => [r.participante_id, r.valores]));
  const mailBy = new Map((mails || []).map((m: any) => [m.participante_id, m]));
  const acompBy = new Map((acomps || []).map((a: any) => [a.participante_id, a]));

  const records = (parts || []).map((p: any) =>
    shapeRecord(p, respBy.get(p.id) || [], mailBy.get(p.id) || null, acompBy.get(p.id) || null)
  );
  return NextResponse.json({ records });
}
