import {gerarLeitura,notaFormatada} from "./influx-report";

const CONTEXTO=[
 "Quando responsabilidade, comunicação e prioridades não viram hábitos, a gestão pode ficar refém de urgências e combinados pouco claros.",
 "Sem orientação, acompanhamento e confiança no cotidiano, a equipe pode continuar dependente do líder para avançar.",
 "Quando dados, tecnologia e análise de oportunidades ainda não orientam a rotina, decisões comerciais podem ficar mais reativas."
] as const;

function descricaoNivel(n:number){
 if(n===1)return "Você assinalou que ainda não realiza essa prática.";
 if(n===2)return "Você relata que ainda precisa de apoio para colocá-la em prática.";
 if(n===3)return "Você relata autonomia, mas ainda pode ganhar consistência.";
 return "Você relata segurança e autonomia, inclusive diante de situações difíceis.";
}

export function gerarDevolutiva(ans:number[]){
 const r=gerarLeitura(ans);
 const menor=Math.min(...ans),maior=Math.max(...ans);
 const todosIguais=menor===maior;
 const dimIguais=r.dimensoes.every(d=>d.valor===r.dimensoes[0].valor);
 const focoMaisBaixo=r.items.filter(x=>x.nota===menor);
 const focoMaisAlto=r.items.filter(x=>x.nota===maior);
 const nivelDescricao=descricaoNivel(menor);
 const visaoGeral=todosIguais
  ? menor===1
   ? "Você indicou que ainda não coloca em prática as nove situações avaliadas. Em vez de tentar mudar tudo ao mesmo tempo, o melhor ponto de partida é criar hábitos simples de autogestão, desenvolvimento de pessoas e decisões comerciais. O roteiro abaixo traduz isso em três ações observáveis."
   : menor===2
    ? "Você assinalou “Faço com ajuda” nas nove situações. Seu próximo desafio é ganhar autonomia nas decisões, no acompanhamento da equipe e na análise do negócio. Comece praticando cada uma dessas frentes com compromissos verificáveis."
    : menor===3
     ? "Você assinalou “Já faço sozinho” nas nove situações. O próximo ganho pode vir de consistência: praticar também nas semanas difíceis, observar os resultados e pedir feedback sobre a forma como lidera."
     : "Você relata autonomia e confiança nas nove práticas. Seu próximo passo é verificar se elas se sustentam sob pressão e se a equipe percebe os mesmos comportamentos, usando evidências e feedback."
  : dimIguais
   ? "As médias das três dimensões são iguais, mas suas respostas individuais variam. Por isso, a leitura mais útil está nos comportamentos específicos em que você percebe maior ou menor autonomia."
   : "Suas respostas mostram graus diferentes de autonomia entre práticas e dimensões. Isso não é uma nota de aprovação ou reprovação: ajuda a reconhecer o que já consegue fazer e a escolher um próximo comportamento observável para desenvolver.";

 const dimensoes=r.dimensoes.map((d,i)=>{
  const notas=d.itens.map(x=>x.nota);
  const minimo=Math.min(...notas),maximo=Math.max(...notas);
  const principais=d.itens.filter(x=>x.nota===maximo).map(x=>x.titulo.toLowerCase());
  const gaps=d.itens.filter(x=>x.nota===minimo).map(x=>x.titulo.toLowerCase());
  const leitura=minimo===maximo
   ? minimo===1
    ? "Nas três práticas desta dimensão, você indicou que ainda não as realiza. "+CONTEXTO[i]
    : minimo===2
     ? "Você relata depender de ajuda nas três práticas. O desafio é transformar orientação em execução mais autônoma."
     : minimo===3
      ? "Você já percebe autonomia nas três práticas. Vale escolher uma delas para ganhar regularidade e segurança mesmo sob pressão."
      : "Você relata confiança nas três práticas. Vale buscar feedback e resultados observáveis para confirmar se essa percepção também aparece na equipe e no negócio."
   : "Você relata mais autonomia em "+principais.join(" e ")+" ("+maximo+"/4). Já "+gaps.join(" e ")+" ("+minimo+"/4) aparece como uma oportunidade concreta de desenvolvimento.";
  return {nome:d.nome,nota:d.valor,leitura,
   foco:d.paraEvoluir.titulo,acao:d.paraEvoluir.acao,
   motivo:d.paraEvoluir.porque};
 });

 let tituloForca:string,textoForca:string;
 if(todosIguais){
  tituloForca="O que este resultado permite concluir";
  textoForca=menor===1
   ? "O padrão das respostas é transversal: a necessidade de desenvolvimento aparece na autogestão, na liderança da equipe e na gestão do negócio, não em uma competência isolada. A prioridade é construir uma rotina mínima em cada frente antes de ampliar a complexidade."
   : menor===4
    ? "Você demonstra confiança na própria atuação nas nove práticas. Como não há diferenças nas notas, não é possível eleger uma fortaleza isolada; vale validar sua percepção com exemplos, indicadores e feedback da equipe."
    : "As nove práticas receberam o mesmo nível. Não há evidência aqui para apontar uma fortaleza específica, mas há um caminho: praticar, registrar evidências e refazer a reflexão com mais exemplos concretos.";
 }else{
  const destaque=focoMaisAlto[0];
  tituloForca=maior>=3?"Um recurso que você já pode aproveitar":"Onde já existe um começo";
  textoForca="Entre as nove práticas, "+destaque.titulo.toLowerCase()+" recebeu "+maior+"/4. "+descricaoNivel(maior)+" Isso pode apoiar os próximos passos, sem significar domínio completo da competência.";
 }
 const oportunidade=todosIguais
  ? menor===4
   ? "Seu desafio é comprovar a consistência dessas práticas na realidade: peça a alguém da equipe um exemplo recente e compare com sua autopercepção."
   : "Seu ponto de partida sugerido é tornar três comportamentos visíveis: assumir e registrar um compromisso, desenvolver alguém da equipe com feedback e analisar um indicador antes de decidir. A sequência abaixo transforma essas intenções em ações concretas."
  : "Entre suas respostas, "+focoMaisBaixo[0].titulo.toLowerCase()+" recebeu "+menor+"/4. "+nivelDescricao+" "+focoMaisBaixo[0].porque;

 const periodos=["Dias 1 a 3","Dias 4 a 9","Dias 10 a 15"];
 const plano=r.prioridades.map((item,i)=>({
  quando:periodos[i],dimensao:item.dimensao,titulo:item.titulo,
  acao:item.acao,indicador:item.evidencia
 }));
 return {
  visaoGeral,dimensoes,tituloForca,textoForca,oportunidade,plano,
  desafioFinal:"Ao final de 15 dias, registre quais ações você colocou em prática, um exemplo concreto e o que mudou. A evolução aparece nos comportamentos observados, não apenas na pontuação.",
  ressalva:"Leitura inicial baseada na sua autopercepção em nove afirmações; não substitui avaliação de competências, observação de resultados nem feedback de outras pessoas."
 };
}
export {notaFormatada};
