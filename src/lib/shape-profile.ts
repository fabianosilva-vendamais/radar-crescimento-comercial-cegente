import { buildAns } from "./records";

/**
 * Mapeia uma linha da tabela participantes para o objeto "perfil" completo,
 * incluindo o array de respostas reconstruído (para reenvio de e-mail).
 */
export function shapeRecordProfile(p: any) {
  return {
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
  };
}

/** Perfil + array de respostas (18 posições) a partir da linha do participante e das respostas. */
export function shapeProfileAndAns(p: any, valores: any[] | null) {
  return {
    perfil: shapeRecordProfile(p),
    ans: buildAns(valores, p.obstaculo, p.interesse, p.tema),
  };
}
