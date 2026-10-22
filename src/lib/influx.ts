/** Autodiagnóstico inFlux. Cada questão preserva uma das nove competências da metodologia VendaMais. */
export const ORIGEM_INFLUX = "Evento inFlux — Liderança";
export const FAIXAS = ["Não tenho equipe comercial","1–4","5–9","10–29","30–49","50–99","100 ou mais"] as const;
export const DIMENSOES = ["O Líder","O Líder da Equipe","O Líder do Negócio"] as const;
export const CAPACIDADES = [
 "Responsabilidade diante dos desafios","Clareza nas conversas","Gestão das prioridades",
 "Desenvolvimento de pessoas","Acompanhamento da execução","Confiança e colaboração",
 "Decisões baseadas em dados","Uso inteligente da tecnologia","Visão de oportunidades de crescimento"
] as const;
export const PERGUNTAS = [
 "Quando enfrento um problema ou uma situação de pressão, assumo minha responsabilidade e concentro meus esforços no que posso resolver.",
 "Nas conversas com minha equipe, escuto, explico o que espero e deixo claro quem fará o quê e quais são os próximos passos.",
 "Consigo organizar minha agenda e priorizar o que é importante para a gestão, sem passar o dia apenas apagando incêndios.",
 "Ajudo minha equipe a evoluir com orientação, prática e feedback, para que as pessoas consigam assumir mais responsabilidades sozinhas.",
 "Transformo as metas em ações claras, com responsáveis e acompanhamento frequente, para que a equipe avance de verdade.",
 "Crio um ambiente em que as pessoas confiam umas nas outras, participam e colaboram para resolver problemas.",
 "Antes de tomar decisões, analiso os números, procuro entender por que os resultados aconteceram e escolho ações com base nisso.",
 "Uso dados, ferramentas digitais ou inteligência artificial para melhorar minhas análises, meu planejamento e minhas decisões.",
 "Avalio o potencial dos clientes e do mercado para escolher as melhores oportunidades e direcionar as ações de crescimento."
] as const;
/** Mantida integralmente a escala aprovada por Carol. O valor mede autopercepção da frequência e autonomia na prática. */
export const ESCALA = [
 "Ainda não faço | Não sei bem como colocar em prática.",
 "Faço com ajuda | Sei o que preciso fazer, mas ainda preciso de orientação.",
 "Já faço sozinho | Consigo colocar em prática, mas nem sempre com segurança.",
 "Faço com confiança | Sei como agir, mesmo nas situações mais difíceis."
] as const;
export const EXEMPLOS = [
 "Pense na última dificuldade relevante da sua operação.",
 "Pense nas conversas sobre expectativas, responsabilidades e entregas.",
 "Pense em quanto tempo sobra para planejar e desenvolver pessoas.",
 "Pense em como você ensina, dá feedback e delega no cotidiano.",
 "Pense na frequência com que acompanha metas, responsáveis e prazos.",
 "Pense em como as pessoas reagem quando precisam discordar ou pedir ajuda.",
 "Pense na última decisão importante sobre desempenho.",
 "Pense nas ferramentas que realmente usa, não nas que apenas conhece.",
 "Pense em como escolhe onde a equipe deve concentrar seu esforço."
] as const;
export const ACOES = [
 "Na próxima dificuldade, separe fatos do que você pode influenciar. Escolha uma ação sob sua responsabilidade, com prazo, e comunique-a.",
 "No fim de uma conversa importante, confirme em voz alta: qual entrega, quem responde por ela e até quando. Registre o combinado.",
 "Reserve dois blocos semanais de 30 minutos para planejar e desenvolver pessoas; revise o que consumiu sua agenda.",
 "Escolha uma pessoa, uma habilidade e uma tarefa real. Oriente, observe a prática, dê feedback e combine o próximo acompanhamento.",
 "Escolha uma meta da semana, traduza-a em três ações com donos e prazos e acompanhe o avanço em uma reunião de 15 minutos.",
 "Em uma reunião, peça primeiro sugestões da equipe para um problema real; combine como testar uma ideia e reconhecer contribuições.",
 "Escolha um indicador fora do esperado. Levante duas hipóteses para a causa, confira os dados e decida uma ação verificável.",
 "Escolha uma rotina de gestão; use uma ferramenta digital ou de IA para organizar informação ou testar hipóteses e valide a saída.",
 "Liste as três maiores oportunidades de expansão, por potencial e esforço. Defina uma prioridade e a próxima ação comercial."
] as const;
export const SINAIS = [
 "A equipe percebe decisões mais objetivas diante de problemas e menos transferência de culpa.",
 "Menos dúvidas sobre responsabilidades, prazos e retrabalho.",
 "Mais tempo dedicado à gestão e menos urgências que poderiam ser evitadas.",
 "Pessoas executando novas responsabilidades com menos dependência da liderança.",
 "Compromissos acompanhados e ações concluídas dentro do prazo.",
 "Mais sugestões, participação e resolução colaborativa de problemas.",
 "Decisões que mencionam causas e indicadores, não apenas impressões.",
 "Informações mais úteis para decidir e menos tempo gasto em tarefas repetitivas.",
 "Ações comerciais concentradas em oportunidades com potencial identificado."
] as const;
export const PORQUE = [
 "Sob pressão, a equipe observa a reação do líder para decidir como agir. Responsabilidade e foco reduzem paralisia.",
 "Clareza evita que boas intenções virem atrasos, dúvidas e retrabalho.",
 "Sem espaço para o importante, a liderança fica prisioneira das urgências e deixa de desenvolver a operação.",
 "Desenvolver autonomia reduz a dependência do gestor e aumenta a capacidade de execução.",
 "Uma meta só orienta o trabalho quando se transforma em compromissos e cadência de acompanhamento.",
 "Confiança melhora a circulação de informações e permite resolver problemas antes de se agravarem.",
 "Analisar causas permite atacar problemas reais em vez de reagir a oscilações dos números.",
 "Tecnologia só agrega valor quando facilita análises ou decisões, e não por ser uma novidade.",
 "Priorizar potencial evita dispersão comercial e melhora a qualidade da alocação de tempo."
] as const;
export type PerfilInflux = {
 nome:string;email:string;whats:string;cargo:string;empresa:string;cidade:string;uf:string;vend:string;consent:boolean;
};
export function avaliar(ans:number[]){
 if(!Array.isArray(ans)||ans.length!==9||ans.some(x=>!Number.isInteger(x)||x<1||x>4))throw new Error("Respostas inválidas.");
 const dims=[0,1,2].map(i=>(ans[i*3]+ans[i*3+1]+ans[i*3+2])/3);
 const total=ans.reduce((a,b)=>a+b,0)/9;
 const max=Math.max(...dims),min=Math.min(...dims);
 const melhores=dims.map((x,i)=>x===max?i:-1).filter(x=>x>=0);
 const desenvolvimento=dims.map((x,i)=>x===min?i:-1).filter(x=>x>=0);
 const menorResposta=Math.min(...ans);
 const menores=ans.map((x,i)=>x===menorResposta?i:-1).filter(x=>x>=0);
 return {
  dims,total,
  fortalezas:melhores.map(i=>DIMENSOES[i]),
  oportunidades:desenvolvimento.map(i=>DIMENSOES[i]),
  foco:menores.map(i=>({competencia:CAPACIDADES[i],acao:ACOES[i],indice:i})),
  prioridade:menores[0],
  equilibrado:max===min
 };
}
export function prioridadeComercial(faixa:string){
 if(["30–49","50–99","100 ou mais"].includes(faixa))return {classe:"Prioritário",fit:100};
 if(faixa==="10–29")return {classe:"Acompanhar",fit:65};
 return {classe:"Nutrição",fit:30};
}
export function textoResultado(nome:string,a:number[]){
 const r=avaliar(a);
 const fort=r.equilibrado?"Você percebe as três dimensões em níveis próximos; isso não significa que todas as práticas estejam igualmente consolidadas.":"As práticas que você percebe como mais desenvolvidas concentram-se em "+r.fortalezas.join(" e ")+".";
 const gap=r.equilibrado?"Mesmo quando as dimensões estão equilibradas, vale olhar com atenção para os comportamentos com menor nota.":"Sua maior oportunidade relativa de evolução aparece em "+r.oportunidades.join(" e ")+".";
 return {fort,gap,passo:r.foco[0].acao,ressalva:"Este autodiagnóstico expressa sua percepção sobre nove práticas específicas. Não é uma avaliação completa de competências, nem uma classificação definitiva da sua liderança."};
}
