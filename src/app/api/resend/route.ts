import { NextResponse, after } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { shapeProfileAndAns } from "@/lib/shape-profile";
import { renderEmail, emailSubject } from "@/lib/email-template";
import { queueSend } from "@/lib/mailer";
import { reportBaseUrl } from "@/lib/env";
import { diaHora } from "@/lib/datetime";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Dá folga para o envio do e-mail em segundo plano (after) concluir na função
// serverless da Vercel. 30s cabe no limite do plano Hobby (até 60s).
export const maxDuration = 30;

// Reenvia o e-mail da leitura. O código é o token de acesso — vale tanto
// para o participante (tela de resultado) quanto para o admin (painel).
export async function POST(req: Request) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });
  }
  const code = String(body?.code || "").trim();
  if (!code) return NextResponse.json({ error: "Código ausente." }, { status: 400 });

  const db = supabaseAdmin();
  const { data: part } = await db.from("participantes").select("*").eq("codigo", code).maybeSingle();
  if (!part) return NextResponse.json({ error: "Não encontrado." }, { status: 404 });
  const { data: resp } = await db
    .from("respostas")
    .select("valores")
    .eq("participante_id", part.id)
    .maybeSingle();
  const { data: mail } = await db
    .from("emails")
    .select("tries")
    .eq("participante_id", part.id)
    .maybeSingle();

  const { perfil, ans } = shapeProfileAndAns(part, resp?.valores || []);
  const priorTries = mail?.tries || 0;

  after(async () => {
    const base = reportBaseUrl() || new URL(req.url).origin;
    const reportUrl = `${base}/r/${code}`;
    const html = renderEmail(perfil, ans, code, reportUrl);
    const result = await queueSend(part.email, emailSubject(), html);
    const { dia, hora } = diaHora(new Date().toISOString());
    await db
      .from("emails")
      .update({
        status: result.ok ? "enviado" : "erro",
        tries: priorTries + result.tries,
        last_date: `${dia} ${hora}`,
        last_err: result.ok ? "" : result.error,
        updated_at: new Date().toISOString(),
      })
      .eq("participante_id", part.id);
  });

  return NextResponse.json({ ok: true });
}
