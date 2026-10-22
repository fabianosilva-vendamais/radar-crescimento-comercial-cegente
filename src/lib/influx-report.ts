import {avaliar,ACOES,CAPACIDADES,DIMENSOES,PORQUE,SINAIS,ESCALA} from "./influx";

const DIM_TITULOS=[
 "Como você conduz a própria atuação",
 "Como transforma pessoas em uma equipe mais autônoma",
 "Como liga decisões ao desempenho do negócio"
] as const;
const DIM_DESCRICOES=[
 "Autogestão, comunicação e postura diante de desafios.",
 "Desenvolvimento de pessoas, execução e ambiente de colaboração.",
 "Uso de indicadores, tecnologia e oportunidades comerciais."
] as const;
const DIM_ORIENTACOES=[
 "Seu próximo ganho nessa dimensão vem de administrar a pressão, dar clareza aos acordos e proteger tempo para as prioridades.",
 "Seu próximo ganho vem de formar pessoas mais independentes, estabelecer compromissos claros e estimular colaboração.",
 "Seu próximo ganho vem de transformar informações sobre resultados, ferramentas e oportunidades em decisões melhores."
] as const;

export type ItemLeitura = {
 indice:number;dimensao:string;titulo:string;nota:number;nivel:string;interpreta:string;
 porque:string;acao:string;evidencia:string;
};
export function gerarLeitura(ans:number[]){
 const r=avaliar(ans);
 const items:ItemLeitura[]=ans.map((v,i)=>{
  const titulo=CAPACIDADES[i];
  const interpreta=v===1
   ?"Você percebe que ainda não transformou essa prática em parte da sua rotina. O ponto de partida é experimentar uma ação pequena e concreta."
   :v===2?"Você já reconhece como essa prática funciona, mas ainda depende de orientação ou apoio para executá-la."
   :v===3?"Você já realiza essa prática de forma independente; vale fortalecer a consistência e a segurança em situações menos previsíveis."
   :"Você se percebe capaz de realizar essa prática com autonomia, inclusive diante de situações difíceis. Procure multiplicá-la na equipe.";
  return {indice:i,dimensao:DIMENSOES[Math.floor(i/3)],titulo,nota:v,nivel:ESCALA[v-1].split("|")[0].trim(),
   interpreta,porque:PORQUE[i],acao:ACOES[i],evidencia:SINAIS[i]};
 });
 const dimensoes=r.dims.map((v,i)=>{
  const entradas=items.slice(i*3,i*3+3);
  const melhor=[...entradas].sort((a,b)=>b.nota-a.nota||a.indice-b.indice)[0];
  const foco=[...entradas].sort((a,b)=>a.nota-b.nota||a.indice-b.indice)[0];
  const descricao=v<=1.65?"O resultado sugere que essas práticas ainda estão em fase inicial de construção."
   :v<=2.55?"Há práticas em desenvolvimento que podem ganhar mais autonomia com aplicação e acompanhamento."
   :v<=3.45?"Você já percebe autonomia em parte dessas práticas; o ganho agora está em sustentar consistência e segurança."
   :"Você percebe boa autonomia nas práticas desta dimensão; o desafio é preservar essa qualidade e desenvolvê-la na equipe.";
  return {nome:DIMENSOES[i],titulo:DIM_TITULOS[i],descricao,definicao:DIM_DESCRICOES[i],orientacao:DIM_ORIENTACOES[i],
   valor:v,maisForte:melhor,paraEvoluir:foco,itens:entradas};
 });
 // Cada competência é lida individualmente, não apenas pelas médias.
 const ordenados=[...items].sort((a,b)=>a.nota-b.nota||a.indice-b.indice);
 // Balanceia o plano: uma prática prioritária de cada dimensão; evita que a experiência fique concentrada num único tema.
 const selecionados=[...dimensoes].map((d)=>d.paraEvoluir).sort((a,b)=>a.nota-b.nota||a.indice-b.indice);
 const allFour=ans.every(v=>v===4);
 const inicias=ans.every(v=>v<=2);
 const amplitude=Math.max(...r.dims)-Math.min(...r.dims);
 const resumo=allFour
  ?"Você relata confiança e autonomia nas nove práticas. É um sinal positivo de autopercepção, mas o desenvolvimento continua: teste essas habilidades em situações novas e procure evidências concretas na equipe."
  :inicias?"Você reconhece várias práticas que ainda está construindo. Esse reconhecimento é um ponto de partida: o objetivo agora não é mudar tudo, mas começar por comportamentos observáveis e repetíveis."
  :amplitude<0.34?"Suas três dimensões ficaram próximas entre si. Mais importante que a média é perceber quais comportamentos específicos merecem atenção e onde você já atua com mais independência."
  :"Há diferenças entre suas três dimensões. Isso é comum: liderar a si mesmo, desenvolver pessoas e conduzir o negócio exigem práticas distintas. O caminho é aproveitar suas forças e desenvolver o que hoje depende de mais esforço.";
 const resumoForte=r.equilibrado?"As dimensões têm resultados iguais; veja suas práticas individuais mais consistentes.": "Sua dimensão relativamente mais desenvolvida é "+r.fortalezas.join(" e ")+". Isso não significa domínio absoluto.";
 const resumoEvolucao=r.equilibrado?"Não há uma dimensão isoladamente mais baixa; usamos as respostas por competência para definir prioridades.":"A dimensão relativamente menos desenvolvida é "+r.oportunidades.join(" e ")+". Isso não é um rótulo de desempenho.";
 return {
  total:r.total,dimensoes,items,
  fortalezas:[...items].sort((a,b)=>b.nota-a.nota||a.indice-b.indice).slice(0,3),
  prioridades:selecionados,outrasOportunidades:ordenados.slice(0,3),
  resumo,resumoForte,resumoEvolucao,allFour,inicias,
  plano:[
   {semana:"Semana 1",titulo:"Observe e escolha",orientacao:"Escolha a primeira prática do plano. Identifique uma situação real em que ela aparece e registre como você agiu hoje.",foco:selecionados[0]},
   {semana:"Semana 2",titulo:"Experimente na rotina",orientacao:"Execute a ação da primeira prioridade em duas oportunidades. Registre o que funcionou e o que travou.",foco:selecionados[0]},
   {semana:"Semana 3",titulo:"Amplie para a equipe",orientacao:"Inclua a segunda prioridade em uma conversa ou rotina de gestão. Peça feedback sobre o comportamento observado.",foco:selecionados[1]},
   {semana:"Semana 4",titulo:"Consolide e acompanhe",orientacao:"Teste a terceira prioridade. Reavalie as nove práticas e compare suas respostas com exemplos concretos do dia a dia.",foco:selecionados[2]}
  ],
  ressalva:"Esta devolutiva se baseia na sua autopercepção em nove afirmações. Não substitui avaliação de competências com observação, indicadores ou feedback de outras pessoas. Notas são pontos de reflexão, não aprovação, reprovação ou diagnóstico definitivo."
 };
}
export function notaFormatada(n:number){return n.toFixed(1).replace(".",",");}
