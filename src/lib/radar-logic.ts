/**
 * Lógica determinística do Radar de Crescimento Comercial — portada VERBATIM
 * do protótipo "Radar de Crescimento Comercial.dc.html" (classe Component,
 * get DATA / compute / bandOf / lead). Nenhum texto, pergunta, cálculo, faixa,
 * classificação ou regra foi alterado.
 *
 * Pontuação: cada dimensão soma 3 perguntas (3 a 15); o total soma as 5
 * dimensões (15 a 75). As 4 classificações e o cálculo do lead (Quente/Morno/
 * Nutrição — interno, nunca visível ao participante) são cópia fiel do protótipo.
 *
 * Não editar as constantes de negócio sem uma nova versão do protótipo.
 */

/* eslint-disable */

export type Dim = { name: string; short: string; strong: string; rec: string };

export const DATA = (() => {
  const D: any = {};
  D.dims = [
    { name: "Clareza estratégica", short: "Estratégia", strong: "A empresa demonstra clareza sobre onde quer crescer e quais frentes priorizar. Essa direção facilita concentrar energia comercial no que mais gera resultado.", rec: "Sua empresa pode ter oportunidades para definir melhor onde crescer, quais clientes priorizar, quais mercados atacar e quais movimentos comerciais devem receber mais energia." },
    { name: "Diferenciação e proposta de valor", short: "Valor", strong: "A equipe consegue comunicar diferenciais e vender valor sem depender só de preço. Esse é um ativo poderoso para proteger margem e ganhar preferência.", rec: "Sua empresa pode ter oportunidades para comunicar melhor seus diferenciais, vender mais valor e reduzir a dependência de preço ou desconto." },
    { name: "Máquina comercial", short: "Processo", strong: "Há processo, geração de oportunidades e acompanhamento de indicadores. Essa base traz previsibilidade e permite escalar com mais segurança.", rec: "Sua empresa pode ter oportunidades para estruturar melhor funil, prospecção, CRM, indicadores, acompanhamento de oportunidades e previsibilidade de vendas." },
    { name: "Equipe e liderança", short: "Equipe", strong: "A equipe vende de forma consultiva e a liderança acompanha a execução com método. Isso eleva o padrão de toda a operação comercial.", rec: "Sua empresa pode ter oportunidades para preparar melhor vendedores e líderes, fortalecer rituais de gestão e melhorar a execução comercial no dia a dia." },
    { name: "Execução e crescimento", short: "Execução", strong: "A estratégia vira execução, com responsáveis, prazos e acompanhamento. O crescimento depende mais de método do que de esforço isolado.", rec: "Sua empresa pode ter oportunidades para transformar planos em ações concretas, com responsáveis, prazos, acompanhamento e disciplina de execução." },
  ];
  D.q = [
    { type: "scale", dim: 0, t: "A empresa tem clareza sobre onde quer crescer nos próximos 12 meses." },
    { type: "scale", dim: 0, t: "Temos prioridades comerciais bem definidas, e não apenas metas genéricas de crescimento." },
    { type: "scale", dim: 0, t: "Sabemos quais clientes, mercados ou segmentos devem receber mais foco comercial." },
    { type: "scale", dim: 1, t: "Nossa equipe consegue explicar claramente por que o cliente deveria escolher nossa empresa e não o concorrente." },
    { type: "scale", dim: 1, t: "Conseguimos vender valor sem depender excessivamente de preço, desconto ou condição comercial." },
    { type: "scale", dim: 1, t: "Nossa proposta comercial comunica bem os diferenciais, benefícios e resultados que entregamos ao cliente." },
    { type: "scale", dim: 2, t: "Temos um processo comercial claro, com etapas, responsabilidades e próximos passos bem definidos." },
    { type: "scale", dim: 2, t: "A empresa gera oportunidades comerciais de forma consistente, e não apenas quando o mercado está aquecido." },
    { type: "scale", dim: 2, t: "Acompanhamos indicadores comerciais importantes, como oportunidades, conversão, ticket médio, ciclo de vendas e motivos de perda." },
    { type: "scale", dim: 3, t: "Nossa equipe comercial está preparada para vender de forma consultiva e conduzir melhor as negociações." },
    { type: "scale", dim: 3, t: "Os líderes comerciais acompanham a execução com frequência, método e conversas produtivas com o time." },
    { type: "scale", dim: 3, t: "Temos rituais de gestão comercial, como reuniões, análise de pipeline, acompanhamento de metas e planos de ação." },
    { type: "scale", dim: 4, t: "A empresa transforma estratégia em execução, com responsáveis, prazos e acompanhamento." },
    { type: "scale", dim: 4, t: "Hoje, nosso crescimento depende mais de método e gestão do que apenas do esforço individual de algumas pessoas." },
    { type: "scale", dim: 4, t: "Se quisermos crescer mais, sabemos quais mudanças comerciais precisam ser feitas primeiro." },
    { type: "open", t: "Na sua visão, qual é hoje o maior obstáculo para a empresa crescer mais?" },
    { type: "single", key: "interesse", t: "Você gostaria de receber uma leitura consultiva da VendaMais sobre os principais pontos identificados neste diagnóstico?", opts: ["Sim, por WhatsApp", "Sim, por e-mail", "Sim, por telefone", "Talvez, posso avaliar depois", "Não neste momento"] },
    { type: "single", key: "tema", t: "Qual tema faria mais sentido aprofundar em uma conversa com a VendaMais?", opts: ["Estratégia comercial", "Crescimento de vendas", "Treinamento da equipe comercial", "Liderança comercial", "Prospecção e geração de oportunidades", "Gestão de carteira de clientes", "Negociação e defesa de valor", "CRM, indicadores e rotina comercial", "Estruturação do processo comercial", "Consultoria comercial", "Outro"] },
  ];
  D.scale = [
    { v: 1, t: "Discordo totalmente" },
    { v: 2, t: "Discordo parcialmente" },
    { v: 3, t: "Neutro / em desenvolvimento" },
    { v: 4, t: "Concordo parcialmente" },
    { v: 5, t: "Concordo totalmente" },
  ];
  D.classes = [
    { min: 15, max: 30, name: "Crescimento vulnerável", desc: "A empresa possui oportunidades importantes de estruturação comercial. O crescimento pode depender muito de esforço individual, relacionamento pessoal, mercado aquecido ou ação direta dos sócios e líderes.", msg: "Sua empresa parece ter espaço relevante para estruturar melhor estratégia, processo, equipe e execução comercial. O crescimento pode estar acontecendo, mas provavelmente ainda depende demais de pessoas-chave, improviso ou oportunidades pontuais." },
    { min: 31, max: 45, name: "Crescimento em construção", desc: "A empresa já possui algumas práticas comerciais importantes, mas ainda pode ter gargalos de clareza, processo, liderança, indicadores ou previsibilidade.", msg: "Sua empresa já tem elementos importantes para crescer, mas ainda pode evoluir na organização da estratégia comercial, na gestão da equipe e na transformação de oportunidades em resultados previsíveis." },
    { min: 46, max: 60, name: "Crescimento estruturado", desc: "A empresa possui uma base comercial mais organizada, com boas práticas em estratégia, equipe, processo e gestão, mas ainda pode encontrar gargalos para escalar.", msg: "Sua empresa demonstra boa maturidade comercial. O próximo desafio pode ser transformar essa estrutura em crescimento mais previsível, escalável e menos dependente de pessoas específicas." },
    { min: 61, max: 75, name: "Crescimento escalável", desc: "A empresa demonstra alto nível de maturidade comercial, com clareza estratégica, processo, equipe, liderança e execução bem encaminhados.", msg: "Sua empresa apresenta sinais de maturidade comercial elevada. O desafio passa a ser acelerar crescimento com consistência, proteger diferenciais e manter execução forte à medida que a operação ganha escala." },
  ];
  D.ufs = ["AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"];
  D.cargos = ["Sócio ou proprietário", "CEO ou presidente", "Diretor comercial", "Diretor (outras áreas)", "Gerente comercial", "Gerente (outras áreas)", "Coordenador ou supervisor", "Consultor ou vendedor", "Outro"];
  D.segmentos = ["Indústria", "Distribuição / Atacado", "Varejo", "Serviços", "Tecnologia / Software", "Construção / Imobiliário", "Agronegócio", "Saúde", "Educação", "Logística / Transporte", "Outro"];
  D.vends = ["1 a 3", "4 a 10", "11 a 25", "26 a 50", "Mais de 50", "Não se aplica"];
  D.unids = ["1 unidade", "2 a 5 unidades", "6 a 20 unidades", "Mais de 20 unidades"];
  D.fats = ["Até R$ 500 mil/mês", "De R$ 500 mil a R$ 1 milhão/mês", "De R$ 1 milhão a R$ 3 milhões/mês", "De R$ 3 milhões a R$ 10 milhões/mês", "Acima de R$ 10 milhões/mês", "Prefiro não informar"];
  D.nextSteps = {
    "Crescimento vulnerável": "Escolha um único ponto de atenção deste radar para organizar nos próximos 30 dias. Comece pelo gargalo indicado acima — pequenas rotinas de estratégia e processo já reduzem a dependência de pessoas-chave.",
    "Crescimento em construção": "Transforme as práticas que já existem em rotina consistente. Priorize o gargalo indicado acima e defina responsáveis, indicadores e um ritual semanal de acompanhamento.",
    "Crescimento estruturado": "O foco agora é previsibilidade e escala. Use o gargalo indicado para padronizar o que funciona e reduzir a dependência de pessoas específicas.",
    "Crescimento escalável": "Proteja seus diferenciais e mantenha execução forte enquanto cresce. Compare unidades ou equipes, documente as melhores práticas e teste iniciativas ampliáveis com segurança.",
  };
  return D;
})();

/** Cálculo do diagnóstico — cópia fiel de Component.compute(ans). */
export function compute(ans: any[]) {
  const D = DATA;
  const dims = D.dims.map((d: any, i: number) => {
    const vs = [ans[i * 3], ans[i * 3 + 1], ans[i * 3 + 2]].filter((v) => v >= 1 && v <= 5);
    return {
      i,
      name: d.name,
      short: d.short,
      valid: vs.length,
      score: vs.length === 3 ? vs.reduce((a: number, b: number) => a + b, 0) : vs.length ? Math.round((vs.reduce((a: number, b: number) => a + b, 0) / vs.length) * 3) : null,
    };
  });
  const valid = dims.filter((d: any) => d.score != null);
  const overall = valid.length === 5 ? valid.reduce((a: number, d: any) => a + d.score, 0) : valid.length ? Math.round((valid.reduce((a: number, d: any) => a + d.score, 0) / valid.length) * 5) : null;
  const cls = overall == null ? null : D.classes.find((c: any) => overall >= c.min && overall <= c.max) || D.classes[0];
  const strong = valid.length ? [...valid].sort((a: any, b: any) => b.score - a.score)[0] : null;
  const gap = valid.length ? [...valid].sort((a: any, b: any) => a.score - b.score)[0] : null;
  return { dims, overall, cls, strong, gap, interesse: ans[16] || null, tema: ans[17] || null, obstaculo: ans[15] || "" };
}

/** Faixa de cada dimensão — cópia fiel de Component.bandOf(score). */
export function bandOf(score: number) {
  return score >= 12 ? { label: "Bem estruturada", color: "#1E7F4F" } : score >= 8 ? { label: "Em desenvolvimento", color: "#B4841E" } : { label: "Ponto crítico", color: "#9A2B26" };
}

/**
 * Prioridade comercial interna (Quente / Morno / Nutrição) — cópia fiel de
 * Component.lead(r). NUNCA visível ao participante.
 * r precisa conter: cargo, fat, vend e ans (com ans[15] = obstáculo, ans[16] = interesse).
 */
export function lead(r: any) {
  const ans = r.ans || [];
  const decisor = ["Sócio ou proprietário", "CEO ou presidente", "Diretor comercial", "Diretor (outras áreas)", "Gerente comercial"].includes(r.cargo);
  const infl = ["Gerente (outras áreas)", "Coordenador ou supervisor"].includes(r.cargo);
  const cargoPts = decisor ? 2 : infl ? 1 : 0;
  const fatPts = ({ "De R$ 1 milhão a R$ 3 milhões/mês": 2, "De R$ 3 milhões a R$ 10 milhões/mês": 2, "Acima de R$ 10 milhões/mês": 2, "De R$ 500 mil a R$ 1 milhão/mês": 1 } as any)[r.fat] || 0;
  const vendPts = ({ "11 a 25": 2, "26 a 50": 2, "Mais de 50": 2, "4 a 10": 1 } as any)[r.vend] || 0;
  const portePts = Math.max(fatPts, vendPts);
  const dor = (ans[15] || "").trim().length >= 15 ? 1 : 0;
  const interesse = ans[16] || "";
  const fit = cargoPts + portePts + dor;
  let cls;
  if (!interesse || interesse.indexOf("Não") === 0) cls = "Nutrição";
  else if (interesse.indexOf("Sim") === 0) cls = fit >= 3 ? "Quente" : "Morno";
  else cls = fit >= 3 ? "Morno" : "Nutrição";
  return { cls, cargoPts, portePts, dor, fit };
}
