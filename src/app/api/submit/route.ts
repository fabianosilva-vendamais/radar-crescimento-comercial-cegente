import { NextResponse, after } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { DATA } from "@/lib/radar-logic";
import { buildResultadoRow } from "@/lib/records";
import { genReportCode } from "@/lib/code";
import { renderEmail, emailSubject } from "@/lib/email-template";
import { queueSend } from "@/lib/mailer";
import { reportBaseUrl } from "@/lib/env";
import { diaHora } from "@/lib/datetime";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Dá folga para o envio do e-mail em segundo plano (after) concluir na função
// serverless da Vercel. 30s cabe no limite do plano Hobby (até 60s).
export const maxDuration = 30;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function bad(msg: string) {
  return NextResponse.json({ error: msg }, { status: 400 });
}

export async function POST(req: Request) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return bad("Corpo inválido.");
  }
  const f = body?.form || {};
  const ans = body?.ans;
  const D: any = DATA;

  // Validação — sem alterar nenhuma regra do diagnóstico.
  // ans tem 18 posições: [0..14] escala (1..5); [15] obstáculo (texto);
  // [16] interesse; [17] tema.
  if (!Array.isArray(ans) || ans.length !== 18) return bad("Respostas incompletas.");
  for (let i = 0; i < 15; i++) {
    const v = ans[i];
    if (!Number.isInteger(v) || v < 1 || v > 5) return bad("Resposta fora da escala.");
  }
  const obstaculo = String(ans[15] || "").trim();
  const interesse = String(ans[16] || "").trim();
  const tema = String(ans[17] || "").trim();
  const interesseOpts: string[] = D.q[16].opts;
  const temaOpts: string[] = D.q[17].opts;
  if (!interesseOpts.includes(interesse)) return bad("Interesse inválido.");
  if (!temaOpts.includes(tema)) return bad("Tema inválido.");

  const nome = String(f.nome || "").trim();
  const empresa = String(f.empresa || "").trim();
  const email = String(f.email || "").trim();
  const whats = String(f.whats || "").trim();
  const cidade = String(f.cidade || "").trim();
  const uf = String(f.uf || "").trim();
  const cargo = String(f.cargo || "").trim();
  const segmento = String(f.segmento || "").trim();
  const vend = String(f.vend || "").trim();
  const unid = String(f.unid || "").trim();
  const fat = String(f.fat || "").trim();

  if (!nome || !empresa || !cidade) return bad("Preencha nome, empresa e cidade.");
  if (!EMAIL_RE.test(email)) return bad("E-mail inválido.");
  if (!whats) return bad("Preencha o WhatsApp.");
  if (!(D.ufs as string[]).includes(uf)) return bad("Estado inválido.");
  if (!(D.cargos as string[]).includes(cargo)) return bad("Cargo inválido.");
  if (!(D.segmentos as string[]).includes(segmento)) return bad("Segmento inválido.");
  if (!(D.vends as string[]).includes(vend)) return bad("Equipe comercial inválida.");
  if (!(D.unids as string[]).includes(unid)) return bad("Unidades inválidas.");
  if (!(D.fats as string[]).includes(fat)) return bad("Faturamento inválido.");
  if (f.consent !== true) return bad("É necessário autorizar o uso dos dados.");

  const db = supabaseAdmin();
  const code = genReportCode();
  const scale = ans.slice(0, 15);
  const perfil = { nome, empresa, email, whats, cidade, uf, cargo, segmento, vend, unid, fat, obstaculo, interesse, tema };

  // 1) participante
  const { data: part, error: perr } = await db
    .from("participantes")
    .insert({
      codigo: code,
      origem: "Evento VendaMais + Cegente",
      nome,
      empresa,
      email,
      whats,
      cidade,
      uf,
      cargo,
      segmento,
      vend,
      unid,
      fat,
      obstaculo,
      interesse,
      tema,
      consent: true,
      completed: true,
    })
    .select("id, created_at")
    .single();
  if (perr || !part) {
    return NextResponse.json({ error: "Falha ao salvar o participante." }, { status: 500 });
  }

  // 2) respostas + 3) resultados + 4) emails(fila) + 5) acompanhamento
  const resultadoRow = buildResultadoRow(part.id, perfil, ans);
  const [{ error: rErr }, { error: reErr }] = await Promise.all([
    db.from("respostas").insert({ participante_id: part.id, valores: scale }),
    db.from("resultados").insert(resultadoRow),
    db.from("emails").insert({ participante_id: part.id, status: "fila", tries: 0, last_date: "—", last_err: "" }),
    db.from("acompanhamento").insert({ participante_id: part.id }),
  ]);
  if (rErr || reErr) {
    return NextResponse.json({ error: "Falha ao salvar as respostas." }, { status: 500 });
  }

  // Envio do e-mail em segundo plano (fila + 3 tentativas), sem atrasar a resposta.
  after(async () => {
    try {
      const base = reportBaseUrl() || new URL(req.url).origin;
      const reportUrl = `${base}/r/${code}`;
      const html = renderEmail(perfil, ans, code, reportUrl);
      const result = await queueSend(email, emailSubject(), html);
      const { dia, hora } = diaHora(part.created_at);
      await db
        .from("emails")
        .update({
          status: result.ok ? "enviado" : "erro",
          tries: result.tries,
          last_date: `${dia} ${hora}`,
          last_err: result.ok ? "" : result.error,
          updated_at: new Date().toISOString(),
        })
        .eq("participante_id", part.id);
    } catch (e: any) {
      await db
        .from("emails")
        .update({ status: "erro", last_err: (e && e.message) || "Falha no envio", updated_at: new Date().toISOString() })
        .eq("participante_id", part.id);
    }
  });

  return NextResponse.json({ code });
}
