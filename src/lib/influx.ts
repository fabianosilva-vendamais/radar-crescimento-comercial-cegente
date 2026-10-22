export const ORIGEM_INFLUX = "Evento inFlux — Liderança";
export const FAIXAS = ["Não tenho equipe comercial","1–4","5–9","10–29","30–49","50–99","100 ou mais"] as const;
export const DIMENSOES = ["O Líder","O Líder da Equipe","O Líder do Negócio"] as const;
export const CAPACIDADES = [
  "Autorresponsabilidade","Comunicação","Autogestão",
  "Desenvolvimento de pessoas","Disciplina de execução","Confiança e colaboração",
  "Decisões por indicadores","Inteligência digital","Visão de crescimento"
] as const;
export const PERGUNTAS = [
  "Diante de dificuldades e situações de pressão, assumo minha responsabilidade e direciono minhas ações para aquilo que posso resolver ou influenciar.",
  "Conduzo conversas com clareza, escuta e assertividade, garantindo alinhamento sobre expectativas, responsabilidades e próximos passos.",
  "Organizo minhas prioridades e minha agenda para dedicar tempo ao que realmente importa na gestão, sem ficar refém das urgências do dia a dia.",
  "Desenvolvo as habilidades da minha equipe por meio de orientação, prática e feedback, preparando as pessoas para assumir responsabilidades com autonomia.",
  "Transformo objetivos em ações e compromissos claros, mantendo uma rotina de acompanhamento que sustenta a execução e os resultados da equipe.",
  "Promovo um ambiente de confiança e colaboração, no qual as pessoas participam das decisões e trabalham juntas para resolver problemas.",
  "Analiso indicadores e investigo as causas dos resultados para tomar decisões e direcionar ações com base em evidências.",
  "Utilizo dados, ferramentas digitais e inteligência artificial para ampliar minha capacidade de análise, planejamento e tomada de decisão.",
  "Analiso o potencial de clientes e mercados para definir prioridades e direcionar ações que gerem crescimento para o negócio."
] as const;
export const ESCALA = [
  "Preciso desenvolver — ainda não sei como aplicar",
  "Estou desenvolvendo — sei como fazer, mas preciso de apoio",
  "Aplico com consistência — consigo aplicar, mas ainda tenho dúvidas",
  "Aplico com autonomia — aplico com segurança e independência"
] as const;
export const ACOES = [
  "Em uma situação difícil desta semana, anote o que está sob seu controle e defina uma ação concreta de sua responsabilidade.",
  "Na próxima conversa com sua equipe, confirme expectativas, responsáveis e próximos passos com cada pessoa.",
  "Bloqueie na agenda dois períodos para planejamento e desenvolvimento da equipe, protegidos das urgências.",
  "Escolha um profissional, identifique uma habilidade a desenvolver e combine prática, feedback e acompanhamento.",
  "Defina uma prioridade da equipe com responsável, prazo e uma reunião curta para verificar os compromissos.",
  "Convide a equipe a propor soluções para um problema real e construa acordos de colaboração.",
  "Antes de decidir sobre um resultado, consulte um indicador e investigue ao menos uma causa possível.",
  "Escolha uma tarefa recorrente da gestão e teste uma ferramenta digital ou de IA para ganhar capacidade de análise.",
  "Revise o potencial dos clientes ou territórios e escolha uma oportunidade de crescimento para priorizar."
] as const;
export type PerfilInflux = {
  nome: string; email: string; whats: string; cargo: string; empresa: string; cidade: string; uf: string; vend: string; consent: boolean;
};
export function avaliar(ans: number[]) {
  if (!Array.isArray(ans) || ans.length !== 9 || ans.some(x => !Number.isInteger(x) || x < 1 || x > 4)) throw new Error("Respostas inválidas.");
  const dims = [0,1,2].map(i => (ans[i*3] + ans[i*3+1] + ans[i*3+2]) / 3);
  const total = ans.reduce((a,b)=>a+b,0)/9;
  const max = Math.max(...dims), min = Math.min(...dims);
  const melhores = dims.map((x,i)=> x===max ? i : -1).filter(x=>x>=0);
  const desenvolvimento = dims.map((x,i)=> x===min ? i : -1).filter(x=>x>=0);
  const menorResposta = Math.min(...ans);
  const menores = ans.map((x,i)=>x===menorResposta?i:-1).filter(x=>x>=0);
  return {
    dims, total,
    fortalezas: melhores.map(i=>DIMENSOES[i]),
    oportunidades: desenvolvimento.map(i=>DIMENSOES[i]),
    foco: menores.map(i=>({competencia:CAPACIDADES[i],acao:ACOES[i],indice:i})),
    prioridade: menores[0],
    equilibrado: max===min,
  };
}
export function prioridadeComercial(faixa: string) {
  if (["30–49","50–99","100 ou mais"].includes(faixa)) return {classe:"Prioritário", fit:100};
  if (faixa==="10–29") return {classe:"Acompanhar",fit:65};
  return {classe:"Nutrição",fit:30};
}
export function textoResultado(nome: string, a: number[]) {
  const r=avaliar(a);
  const fort = r.equilibrado ? "Você percebe suas três dimensões em níveis semelhantes." : "Sua fortaleza relativa está em " + r.fortalezas.join(" e ") + ".";
  const gap = r.equilibrado ? "Seu próximo passo é fortalecer práticas específicas, mesmo com equilíbrio entre as dimensões." : "Sua principal oportunidade relativa de evolução está em " + r.oportunidades.join(" e ") + ".";
  return { fort, gap, passo:r.foco[0].acao, ressalva:"Esta é uma autoavaliação inicial da sua percepção sobre nove práticas de liderança; não representa avaliação completa de competências ou maturidade." };
}
