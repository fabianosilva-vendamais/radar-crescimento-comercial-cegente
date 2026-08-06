import { compute, lead } from "./radar-logic";
import { diaHora } from "./datetime";

/**
 * Reconstrói o array de respostas de 18 posições usado por compute()/lead():
 *   ans[0..14] = as 15 respostas de escala (tabela respostas.valores)
 *   ans[15]    = maior obstáculo (texto aberto)
 *   ans[16]    = interesse na devolutiva
 *   ans[17]    = tema de interesse
 */
export function buildAns(valores: any[] | null, obstaculo: any, interesse: any, tema: any): any[] {
  const scale = Array.isArray(valores) ? valores : [];
  const ans = new Array(18);
  for (let i = 0; i < 15; i++) ans[i] = scale[i];
  ans[15] = obstaculo || "";
  ans[16] = interesse || "";
  ans[17] = tema || "";
  return ans;
}

/** Constrói a linha da tabela resultados a partir das respostas e do perfil. */
export function buildResultadoRow(participanteId: string, perfil: any, ans: any[]) {
  const R = compute(ans);
  const ld = lead({ cargo: perfil.cargo, fat: perfil.fat, vend: perfil.vend, ans });
  const dimScore = (i: number) => (R.dims[i] && R.dims[i].score != null ? R.dims[i].score : null);
  return {
    participante_id: participanteId,
    overall: R.overall,
    classificacao: R.cls ? R.cls.name : null,
    dim1: dimScore(0),
    dim2: dimScore(1),
    dim3: dimScore(2),
    dim4: dimScore(3),
    dim5: dimScore(4),
    forte: R.strong ? R.strong.name : null,
    gargalo: R.gap ? R.gap.name : null,
    lead_classe: ld.cls,
    lead_fit: ld.fit,
  };
}

/**
 * Converte uma linha do banco (participante + respostas + emails +
 * acompanhamento) no formato de "record" usado pelo painel/relatório,
 * idêntico ao formato do protótipo (com .ans, .mail, dia, hora...).
 */
export function shapeRecord(p: any, valores: any[] | null, email: any | null, acomp: any | null) {
  const { dia, hora } = diaHora(p.created_at);
  const ans = buildAns(valores, p.obstaculo, p.interesse, p.tema);
  return {
    id: p.id,
    code: p.codigo,
    nome: p.nome,
    empresa: p.empresa,
    email: p.email,
    whats: p.whats || "",
    cidade: p.cidade,
    uf: p.uf,
    cargo: p.cargo,
    segmento: p.segmento,
    vend: p.vend,
    unid: p.unid,
    fat: p.fat,
    obstaculo: p.obstaculo || "",
    interesse: p.interesse || "",
    tema: p.tema || "",
    dia,
    hora,
    completed: p.completed !== false,
    mail: email
      ? { status: email.status, tries: email.tries, date: email.last_date, err: email.last_err || "" }
      : { status: "fila", tries: 0, date: "—", err: "" },
    comStatus: acomp ? acomp.status_comercial : "Novo",
    contatado: acomp ? !!acomp.contatado : false,
    obs: acomp ? acomp.observacao || "" : "",
    ans,
  };
}
