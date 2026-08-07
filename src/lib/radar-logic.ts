/**
 * Lógica do Radar de Crescimento Comercial — Evento VendaMais + Cegente.
 *
 * PERGUNTAS E MATEMÁTICA (inalteradas desde o protótipo):
 *   - 15 perguntas de escala (1..5), 3 por dimensão; soma interna 3..15 por
 *     dimensão e 15..75 no total. As faixas de classificação e o cálculo do
 *     lead (Quente/Morno/Nutrição — interno) são os mesmos do protótipo.
 *
 * EXIBIÇÃO (escala humana, a pedido da VendaMais):
 *   - Total exibido em 0..100:  score100 = (soma - 15) / 60 * 100.
 *     As 4 classificações caem em faixas redondas: 0-25 / 26-50 / 51-75 / 76-100.
 *   - Dimensões exibidas em 0..10: dim10 = (soma - 3) / 12 * 10.
 *   O banco continua gravando as somas brutas; a conversão é só de exibição.
 *
 * PROFUNDIDADE (leitura consultiva para diretores comerciais e CEOs):
 *   - qInsights: para cada uma das 15 perguntas, o que a resposta baixa
 *     revela, por que trava o crescimento e por onde começar.
 *   - dimReadings: leitura executiva de cada dimensão em 3 faixas.
 *   - rules: diagnóstico central cruzando dimensões (padrões como
 *     "direção sem motor", "máquina que empurra preço" etc.).
 *   - prios: as 3 prioridades (pergunta mais fraca de cada uma das 3
 *     dimensões mais fracas) + plano de 90 dias.
 */

/* eslint-disable */

export type Dim = { name: string; short: string; strong: string; rec: string };

export const DATA = (() => {
  const D: any = {};
  D.dims = [
    { name: "Clareza estratégica", short: "Estratégia", strong: "A empresa demonstra saber onde quer crescer e o que priorizar — uma clareza que a maioria das empresas não tem. Use-a ativamente: toda decisão de estrutura, contratação e campanha fica mais barata quando existe um alvo definido.", rec: "Sua empresa pode ter oportunidades para definir melhor onde crescer, quais clientes priorizar, quais mercados atacar e quais movimentos comerciais devem receber mais energia." },
    { name: "Diferenciação e proposta de valor", short: "Valor", strong: "A equipe consegue vender valor sem se esconder atrás do preço — um ativo que se converte diretamente em margem. Proteja-o: documente os argumentos que funcionam, atualize as provas e monitore onde o desconto tenta voltar.", rec: "Sua empresa pode ter oportunidades para comunicar melhor seus diferenciais, vender mais valor e reduzir a dependência de preço ou desconto." },
    { name: "Máquina comercial", short: "Processo", strong: "A empresa fabrica demanda e enxerga o próprio funil — isso é previsibilidade, e previsibilidade é o que permite investir com coragem. Com essa base, cada melhoria de conversão ou de ciclo se converte em crescimento quase imediato.", rec: "Sua empresa pode ter oportunidades para estruturar melhor funil, prospecção, CRM, indicadores, acompanhamento de oportunidades e previsibilidade de vendas." },
    { name: "Equipe e liderança", short: "Equipe", strong: "Equipe preparada e liderança com método formam o multiplicador da operação: qualquer melhoria de estratégia ou de processo é absorvida rápido. Invista em manter esse padrão à medida que o time cresce.", rec: "Sua empresa pode ter oportunidades para preparar melhor vendedores e líderes, fortalecer rituais de gestão e melhorar a execução comercial no dia a dia." },
    { name: "Execução e crescimento", short: "Execução", strong: "A empresa conclui o que decide — o traço mais raro em operações comerciais. Essa disciplina autoriza ambição: movimentos maiores podem ser assumidos com a confiança de que sairão do papel.", rec: "Sua empresa pode ter oportunidades para transformar planos em ações concretas, com responsáveis, prazos, acompanhamento e disciplina de execução." },
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
  // Faixas internas inalteradas (15..75). Em 0..100 equivalem a
  // 0-25 / 26-50 / 51-75 / 76-100.
  D.classes = [
    { min: 15, max: 30, name: "Crescimento vulnerável", desc: "O crescimento existe enquanto pessoas específicas seguram a operação: os sócios vendem, os veteranos defendem a carteira e o mercado ajuda quando quer. Estratégia, processo e gestão ainda não formam um sistema — e isso torna o resultado imprevisível e difícil de delegar.", msg: "O ponto central não é esforço — provavelmente sua empresa já opera no limite dele. É arquitetura: enquanto a operação comercial depender de talento individual e de improviso, cada crescimento novo aumenta o risco em vez de diluí-lo. A boa notícia: neste estágio, poucas rotinas bem escolhidas produzem um salto visível em 90 dias." },
    { min: 31, max: 45, name: "Crescimento em construção", desc: "A empresa já construiu peças importantes — clientes conquistados, equipe formada, práticas que funcionam. Mas as peças ainda não trabalham como um sistema: falta conexão entre a direção definida, o processo que gera demanda e a gestão que garante execução.", msg: "Empresas neste estágio costumam alternar meses bons e ruins sem saber exatamente por quê. O desafio não é fazer mais — é transformar o que já funciona de forma isolada em rotina consistente, com dono, indicador e cadência. É a transição de “vendemos bem” para “sabemos por que vendemos”." },
    { min: 46, max: 60, name: "Crescimento estruturado", desc: "Há base organizada: direção razoavelmente clara, processo comercial reconhecível, liderança presente e execução que acontece. A empresa cresce por mérito do sistema, não apenas das pessoas — mas ainda existem gargalos específicos que limitam previsibilidade e escala.", msg: "Neste estágio, o crescimento raramente trava por falta de estrutura — trava nos detalhes dela: um elo fraco entre as dimensões, um indicador que ninguém acompanha, um padrão que nunca foi documentado. A alavanca agora é precisão: encontrar o gargalo específico e resolvê-lo antes de acelerar." },
    { min: 61, max: 75, name: "Crescimento escalável", desc: "A operação comercial funciona como um sistema maduro: estratégia clara, valor defendido sem guerra de preço, máquina previsível, liderança com método e execução disciplinada. É o perfil de empresa preparada para acelerar.", msg: "Seu desafio muda de natureza: não é mais construir estrutura, é protegê-la enquanto cresce. Escala testa tudo — cultura, padrão de qualidade, margem e ritmo de execução. As prioridades passam a ser documentar o que faz a empresa vencer, comparar times e unidades, e experimentar novas frentes sem contaminar o núcleo que já funciona." },
  ];
  D.ufs = ["AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"];
  D.cargos = ["Sócio ou proprietário", "CEO ou presidente", "Diretor comercial", "Diretor (outras áreas)", "Gerente comercial", "Gerente (outras áreas)", "Coordenador ou supervisor", "Consultor ou vendedor", "Outro"];
  D.segmentos = ["Indústria", "Distribuição / Atacado", "Varejo", "Serviços", "Tecnologia / Software", "Construção / Imobiliário", "Agronegócio", "Saúde", "Educação", "Logística / Transporte", "Outro"];
  D.vends = ["1 a 3", "4 a 10", "11 a 25", "26 a 50", "Mais de 50", "Não se aplica"];
  D.unids = ["1 unidade", "2 a 5 unidades", "6 a 20 unidades", "Mais de 20 unidades"];
  D.fats = ["Até R$ 500 mil/mês", "De R$ 500 mil a R$ 1 milhão/mês", "De R$ 1 milhão a R$ 3 milhões/mês", "De R$ 3 milhões a R$ 10 milhões/mês", "Acima de R$ 10 milhões/mês", "Prefiro não informar"];

  // Leitura executiva por dimensão, em 3 faixas (soma bruta: ≤7 crítico,
  // 8..11 em desenvolvimento, ≥12 bem estruturada).
  D.dimReadings = [
    {
      critico: "As respostas indicam que a empresa ainda cresce “para onde dá”, não “para onde decidiu”. Sem alvo definido, cada vendedor escolhe o próprio foco — e a energia comercial se dilui em oportunidades de baixo potencial. Definir onde crescer (e onde não crescer) é a decisão que destrava as demais.",
      desenvolvimento: "Existe direção, mas ela ainda não virou prioridade operacional: metas genéricas convivem com decisões caso a caso. O risco é a estratégia existir no discurso e não na agenda comercial da equipe. Falta traduzir a direção em poucas prioridades explícitas, com foco claro de clientes e mercados.",
      estruturado: "A empresa sabe onde quer crescer e consegue priorizar. Essa clareza é um multiplicador: torna as demais dimensões mais fáceis de estruturar, porque todo processo e toda meta passam a ter um alvo definido. O próximo passo é revisitar essa direção em ciclos regulares, para que ela acompanhe o mercado.",
    },
    {
      critico: "Quando a equipe não consegue explicar por que o cliente deveria escolher a empresa, quem explica é o preço — e ele sempre explica para baixo. As respostas sugerem margem sendo sacrificada para compensar uma proposta de valor que não está clara nem para dentro. Antes de treinar fechamento, é preciso definir e documentar o que torna a empresa a escolha certa.",
      desenvolvimento: "Os diferenciais existem, mas dependem de quem vende: alguns defendem valor, outros recorrem ao desconto. Essa inconsistência custa margem silenciosamente todos os meses. Padronizar o argumento — prova, história e números — é o caminho para a proposta de valor deixar de ser talento individual e virar patrimônio da empresa.",
      estruturado: "A empresa vende valor com consistência e protege margem — um ativo raro. O desafio passa a ser manter esse padrão à medida que a equipe cresce e o mercado pressiona: revisar provas, atualizar casos e monitorar onde o desconto tenta reaparecer.",
    },
    {
      critico: "A empresa vende, mas não fabrica venda: as oportunidades chegam por inércia — indicação, carteira, mercado — e não por um processo que gere demanda de forma deliberada. Sem funil, etapas e indicadores, previsão vira aposta. Para empresas neste perfil, este costuma ser o investimento de maior retorno.",
      desenvolvimento: "Há processo, mas com lacunas: etapas existem, indicadores são olhados às vezes, a geração de demanda oscila com o mercado. O sintoma clássico é a montanha-russa de resultados. Fechar essas lacunas — cadência de prospecção, CRM disciplinado, motivos de perda — transforma oscilação em previsibilidade.",
      estruturado: "A máquina existe e gira: demanda consistente, etapas claras, indicadores acompanhados. Com essa base, a empresa pode calibrar em vez de construir — melhorar a conversão por etapa, encurtar o ciclo e testar novos canais com risco controlado.",
    },
    {
      critico: "As respostas indicam uma equipe que executa como sabe, sem preparo consultivo e sem acompanhamento próximo da liderança. Nesse cenário, o resultado de cada mês depende de quem está inspirado. Liderança comercial presente — com rotina, não com cobrança pontual — é o que transforma um grupo de vendedores em um time.",
      desenvolvimento: "Existe liderança e existe equipe, mas o método ainda é irregular: reuniões acontecem quando dá, feedback quando sobra tempo, treinamento quando aparece problema. O custo é invisível: cada semana sem ritual de gestão é uma semana em que os melhores hábitos não se espalham. Formalizar a cadência é o próximo degrau.",
      estruturado: "Liderança com método e equipe preparada: a gestão comercial funciona como sistema de desenvolvimento, não apenas de cobrança. O desafio agora é formar novos líderes no mesmo padrão e garantir que o crescimento não dilua a qualidade da gestão.",
    },
    {
      critico: "Planos são feitos e morrem na semana seguinte: sem responsáveis, prazos e acompanhamento, a estratégia perde para a urgência do dia a dia. A empresa não tem um problema de ideias — tem um problema de conclusão. Instalar uma disciplina mínima de execução muda o retorno de todas as outras iniciativas.",
      desenvolvimento: "A execução acontece, mas depende de esforço e de memória: parte das decisões vira ação, parte se perde. O padrão típico é começar bem e desacelerar quando a rotina aperta. Rituais curtos de acompanhamento — decisão, dono, prazo, revisão — são suficientes para fechar esse vazamento.",
      estruturado: "A empresa transforma decisão em ação com consistência — provavelmente o traço mais raro entre as cinco dimensões. Essa disciplina permite ambição: dá para assumir movimentos maiores sabendo que serão executados. Proteja essa cultura ao crescer; ela é difícil de construir e fácil de perder.",
    },
  ];

  // Para cada uma das 15 perguntas: o que a resposta baixa revela, por que
  // trava o crescimento e por onde começar (ação concreta de 30 dias).
  D.qInsights = [
    { prob: "A empresa ainda não definiu com clareza onde pretende crescer nos próximos 12 meses.", cons: "Sem alvo, toda oportunidade parece boa — e a equipe gasta energia em clientes e mercados que não constroem o futuro da empresa.", act: "Reúna a liderança e defina por escrito as duas ou três frentes de crescimento do próximo ano — e, tão importante quanto, o que fica de fora. Comunique à equipe comercial em uma página." },
    { prob: "As metas de crescimento ainda são genéricas — falta desdobrá-las em prioridades comerciais concretas.", cons: "Meta sem prioridade vira loteria: cada um persegue o número do seu jeito, e a empresa não aprende o que realmente funciona.", act: "Transforme a meta anual em três prioridades trimestrais com dono e indicador — por exemplo: recuperar clientes inativos, aumentar mix nos clientes A, abrir um segmento específico." },
    { prob: "Não está claro quais clientes, mercados ou segmentos devem receber mais foco comercial.", cons: "Tratando todos os clientes como iguais, a empresa sobre-atende quem não cresce e sub-atende quem poderia dobrar.", act: "Classifique a carteira por potencial (não só por faturamento atual) e redistribua o tempo da equipe: os clientes de maior potencial merecem plano de conta e visita da liderança." },
    { prob: "A equipe não tem uma resposta forte e uniforme para “por que escolher a sua empresa e não o concorrente”.", cons: "Quando o vendedor não sabe dizer por que a empresa vale mais, o cliente decide pelo único critério que sobra: o preço.", act: "Construa com o time o argumento central de diferenciação — três motivos, cada um com uma prova concreta (caso, número, garantia) — e treine até todos falarem a mesma língua." },
    { prob: "A venda ainda depende demais de preço, desconto ou condição para fechar.", cons: "Cada ponto de desconto desnecessário sai direto da margem — é o dinheiro mais caro que a empresa perde, e o mais silencioso.", act: "Mapeie os descontos concedidos no último trimestre, identifique onde não eram necessários e crie alçadas claras: quem pode conceder o quê, em troca de quê." },
    { prob: "A proposta comercial descreve o produto, mas não comunica diferenciais, benefícios e resultados.", cons: "Proposta fraca obriga o cliente a comparar apenas números — e joga a decisão para o setor de compras, longe de quem percebe valor.", act: "Reformule o modelo de proposta: abra com o problema do cliente e o resultado esperado, mostre a solução com provas e deixe o preço como consequência — não como manchete." },
    { prob: "O processo comercial não tem etapas, responsabilidades e próximos passos definidos com clareza.", cons: "Sem processo, cada venda é artesanal: impossível treinar novos vendedores, prever resultado ou descobrir onde as oportunidades morrem.", act: "Desenhe o funil em cinco a sete etapas com critérios objetivos de avanço e um próximo passo obrigatório para cada oportunidade aberta — simples e dentro do CRM." },
    { prob: "A geração de oportunidades depende do mercado aquecido — não há um motor próprio de demanda.", cons: "Quem não fabrica demanda fica refém do ciclo econômico: cresce quando todos crescem e sofre quando todos sofrem.", act: "Estabeleça uma cadência mínima e inegociável de prospecção — contatos novos, reativações e pedidos de indicação por semana, por vendedor — e acompanhe como meta, não como sugestão." },
    { prob: "Os indicadores comerciais — conversão, ticket médio, ciclo, motivos de perda — não são acompanhados com regularidade.", cons: "Sem indicadores, a gestão discute opiniões: ninguém sabe onde a venda se perde, e as decisões corrigem sintomas em vez de causas.", act: "Escolha cinco indicadores e crie um painel semanal simples: oportunidades geradas, taxa de conversão, ticket médio, ciclo de venda e motivos de perda. Discuta-os toda semana, no mesmo horário." },
    { prob: "A equipe ainda vende de forma reativa — apresenta, cota e espera — em vez de conduzir a negociação de forma consultiva.", cons: "Vendedor que não investiga não diferencia: a conversa cai no produto, o produto cai na comparação e a comparação cai no preço.", act: "Treine um roteiro consultivo: diagnóstico antes de proposta, perguntas que revelam o custo do problema e fechamento baseado no que o cliente declarou valer. Pratique em role-play quinzenal." },
    { prob: "A liderança comercial acompanha resultados, mas não a execução — falta frequência, método e conversa individual.", cons: "Cobrar número sem acompanhar comportamento é gerenciar pelo retrovisor: quando a meta não vem, já é tarde para agir.", act: "Institua a rotina mínima do líder: reunião semanal de pipeline com o time e uma conversa individual quinzenal por vendedor — foco em comportamento e próximo passo, não só no número." },
    { prob: "Os rituais de gestão comercial — reunião de pipeline, análise de metas, planos de ação — ainda são irregulares.", cons: "Sem cadência, os problemas se acumulam em silêncio e explodem no fechamento do mês, quando não há mais tempo de reação.", act: "Monte o calendário fixo de gestão: pipeline toda segunda, indicadores toda sexta, plano de ação mensal. Curto, no mesmo horário, sem cancelamento — a constância vale mais que a duração." },
    { prob: "As decisões estratégicas não viram execução — faltam responsáveis, prazos e acompanhamento.", cons: "Estratégia sem execução é custo: consome horas de reunião e devolve frustração, enquanto o dia a dia segue exatamente igual.", act: "Adote a regra “toda decisão sai com dono e data”: registre cada iniciativa em uma lista única e revise quinzenalmente — o que atrasou aparece, e o que aparece se resolve." },
    { prob: "O crescimento ainda repousa sobre o esforço de poucas pessoas — não sobre método e gestão.", cons: "Dependência de pessoas-chave é um risco existencial disfarçado de virtude: basta uma saída, uma férias ou um desgaste para o resultado despencar.", act: "Documente como os melhores vendem — abordagem, argumento, negociação — e transforme em padrão treinável. O objetivo: o novo contratado chegar a 80% do veterano em 90 dias." },
    { prob: "Não há consenso sobre quais mudanças comerciais precisam ser feitas primeiro para crescer.", cons: "Sem sequência definida, a empresa tenta tudo ao mesmo tempo, não conclui nada — e conclui, errado, que “nada funciona”.", act: "Use este diagnóstico como ponto de partida: eleja um único gargalo, monte um plano de 90 dias com marcos quinzenais e só abra a segunda frente quando a primeira virar rotina." },
  ];

  // Diagnóstico central — padrões cruzando dimensões. Avaliadas em ordem;
  // a primeira que casar define a conclusão.
  D.rules = [
    { id: "R1", title: "Direção sem motor", msg: "A empresa sabe para onde quer ir, mas a máquina comercial não gera as oportunidades de que essa ambição precisa. O risco é a estratégia virar frustração: metas certas, funil vazio. Antes de revisar o plano, construa o motor — cadência de prospecção, funil disciplinado e indicadores semanais. Com a direção que você já tem, cada ponto de estrutura vira resultado rápido." },
    { id: "R2", title: "Valor que não escala", msg: "A empresa tem diferenciais reais, mas eles vivem em poucas cabeças — a equipe, no conjunto, ainda não sustenta a venda consultiva que esse posicionamento exige. Cada vendedor despreparado converte o seu diferencial em desconto. A alavanca é formação e liderança: transformar o argumento vencedor em padrão de equipe." },
    { id: "R3", title: "Operação no improviso", msg: "Sem direção clara e sem disciplina de execução, o crescimento acontece por evento — um cliente grande, uma safra boa, um vendedor inspirado — e não por sistema. É o perfil de empresa que mais sofre em mercado difícil e menos aproveita mercado bom. Comece pequeno e inegociável: uma direção por escrito e um ritual semanal de execução." },
    { id: "R4", title: "Máquina que empurra preço", msg: "O processo gera volume, mas sem uma proposta de valor forte cada negociação termina em desconto. É o padrão clássico do “vendemos muito e sobra pouco”. A prioridade não é gerar mais demanda — é armar a equipe para defender valor: argumento central, provas e alçadas de desconto." },
    { id: "R5", title: "Time bom remando sem mapa", msg: "A equipe e a liderança são o ponto alto da operação, mas a energia se dispersa por falta de direção. Talento sem foco produz atividade, não crescimento. Dê o alvo a esse time — segmentos prioritários, prioridades trimestrais — e a mesma energia produzirá o dobro." },
    { id: "R6", title: "Disciplina sem previsibilidade", msg: "A empresa executa bem o que decide, mas decide às cegas: sem máquina comercial, falta matéria-prima — demanda e dados — para a disciplina render. Com a cultura de execução que você já tem, estruturar funil, prospecção e indicadores tende a dar resultado mais rápido aqui do que na média das empresas." },
    { id: "R7", title: "Fundamentos primeiro", msg: "O diagnóstico aponta oportunidades em várias frentes ao mesmo tempo — e a tentação será atacar todas. Resista. Empresas que tentam consertar tudo simultaneamente não concluem nada. Eleja o gargalo indicado nesta leitura, concentre 90 dias nele e use a primeira vitória para financiar a segunda." },
    { id: "R8", title: "Sistema maduro, próximo jogo", msg: "As cinco dimensões operam em bom nível — o gargalo deixou de ser interno. O crescimento agora vem de escala e comparação: documentar o padrão vencedor, comparar equipes e unidades, testar novas frentes em piloto controlado e proteger margem e cultura durante a aceleração." },
    { id: "R0", title: "Conectar as pontas", msg: "A empresa tem peças em estágios diferentes de maturidade — algumas estruturadas, outras em construção. O maior ganho não está em criar nada novo, e sim em conectar o que já existe: a direção definida alimentando a máquina, a máquina alimentando a gestão, a gestão garantindo execução. O gargalo indicado nesta leitura é o elo por onde começar." },
  ];

  D.planPhases = [
    { title: "Primeiros 30 dias", goal: "Atacar o gargalo principal com uma rotina nova e visível." },
    { title: "Dias 31 a 60", goal: "Consolidar a primeira frente e abrir a segunda." },
    { title: "Dias 61 a 90", goal: "Medir resultados, padronizar o que funcionou e ampliar." },
  ];

  D.nextSteps = {
    "Crescimento vulnerável": "Não tente estruturar tudo de uma vez. Escolha o gargalo apontado nesta leitura e dedique 90 dias a ele, com um plano simples: uma rotina nova por mês, dono definido e revisão semanal. Empresas neste estágio costumam ver efeito antes do trimestre fechar — e é essa primeira vitória que financia as demais.",
    "Crescimento em construção": "Seu desafio é consistência, não invenção. Pegue as práticas que já funcionam de forma isolada e transforme-as em rotina com dono, indicador e cadência — começando pelo gargalo apontado acima. Em 90 dias, o objetivo é um só: sair de “depende da semana” para “acontece toda semana”.",
    "Crescimento estruturado": "Com a base que você já tem, o retorno está na precisão: resolva o gargalo específico apontado nesta leitura, documente o padrão do que funciona e compare equipes ou unidades para encontrar as melhores práticas internas. É o trabalho fino que separa uma operação boa de uma operação escalável.",
    "Crescimento escalável": "Proteja o sistema enquanto acelera: documente o que faz a empresa vencer, forme líderes no mesmo padrão e teste novas frentes em piloto — sem contaminar o núcleo que já entrega. E refaça este radar periodicamente: em operações maduras, os gargalos mudam de lugar mais rápido do que parece.",
  };
  return D;
})();

// ---------------------------------------------------------------------------
// Conversões de exibição (escala humana). O banco grava as somas brutas.
// ---------------------------------------------------------------------------

/** Nota exibida 0..100 a partir da soma bruta 15..75. */
export function score100(overall: number | null | undefined): number | null {
  return overall == null ? null : Math.round(((overall - 15) / 60) * 100);
}

/** Nota da dimensão exibida 0..10 (1 casa) a partir da soma bruta 3..15. */
export function dim10(score: number | null | undefined): number | null {
  return score == null ? null : Math.round(((score - 3) / 12) * 100) / 10;
}

/** Formata um valor 0..10 em pt-BR: 7.5 → "7,5"; 10 → "10"; null → "—". */
export function fmt10(n: number | null | undefined): string {
  if (n == null) return "—";
  const r = Math.round(n * 10) / 10;
  return Number.isInteger(r) ? String(r) : String(r).replace(".", ",");
}

// ---------------------------------------------------------------------------
// Cálculo (somas e faixas idênticas ao protótipo) + camada de interpretação
// ---------------------------------------------------------------------------

/** Faixa de cada dimensão — thresholds inalterados (soma bruta ≥12 / ≥8). */
export function bandOf(score: number) {
  return score >= 12 ? { label: "Bem estruturada", color: "#1E7F4F" } : score >= 8 ? { label: "Em desenvolvimento", color: "#B4841E" } : { label: "Ponto crítico", color: "#9A2B26" };
}

/** Diagnóstico central — primeiro padrão que casar (forte ≥12, fraco ≤8). */
export function centralRule(dims: any[], overall: number | null) {
  const R = DATA.rules;
  const s = (i: number) => (dims[i] ? dims[i].score : null);
  const ge = (i: number, n: number) => s(i) != null && s(i) >= n;
  const le = (i: number, n: number) => s(i) != null && s(i) <= n;
  if (ge(0, 12) && le(2, 8)) return R[0];
  if (ge(1, 12) && le(3, 8)) return R[1];
  if (le(0, 8) && le(4, 8)) return R[2];
  if (ge(2, 12) && le(1, 8)) return R[3];
  if (ge(3, 12) && le(0, 8)) return R[4];
  if (ge(4, 12) && le(2, 8)) return R[5];
  if (overall != null && overall <= 45) return R[6];
  if (dims.length === 5 && dims.every((d: any) => d.score != null && d.score >= 12)) return R[7];
  return R[8];
}

/**
 * Cálculo do diagnóstico. Somas, classificação, forte e gargalo idênticos ao
 * protótipo; adiciona a camada de interpretação (leituras por dimensão,
 * três prioridades, diagnóstico central e plano de 90 dias).
 */
export function compute(ans: any[]) {
  const D = DATA;
  const dims = D.dims.map((d: any, i: number) => {
    const vs = [ans[i * 3], ans[i * 3 + 1], ans[i * 3 + 2]].filter((v) => v >= 1 && v <= 5);
    const score = vs.length === 3 ? vs.reduce((a: number, b: number) => a + b, 0) : vs.length ? Math.round((vs.reduce((a: number, b: number) => a + b, 0) / vs.length) * 3) : null;
    const band = score == null ? null : bandOf(score);
    const reading = score == null ? null : score >= 12 ? D.dimReadings[i].estruturado : score >= 8 ? D.dimReadings[i].desenvolvimento : D.dimReadings[i].critico;
    return { i, name: d.name, short: d.short, valid: vs.length, score, band, reading };
  });
  const valid = dims.filter((d: any) => d.score != null);
  const overall = valid.length === 5 ? valid.reduce((a: number, d: any) => a + d.score, 0) : valid.length ? Math.round((valid.reduce((a: number, d: any) => a + d.score, 0) / valid.length) * 5) : null;
  const cls = overall == null ? null : D.classes.find((c: any) => overall >= c.min && overall <= c.max) || D.classes[0];
  const strong = valid.length ? [...valid].sort((a: any, b: any) => b.score - a.score)[0] : null;
  const gap = valid.length ? [...valid].sort((a: any, b: any) => a.score - b.score)[0] : null;

  // As 3 prioridades: dimensões mais fracas → pergunta mais fraca de cada uma.
  const weakest = [...valid].sort((a: any, b: any) => a.score - b.score || a.i - b.i).slice(0, 3);
  const prios = weakest.map((dm: any, k: number) => {
    let qi = -1, min = 6;
    for (let j = 0; j < 3; j++) {
      const v = ans[dm.i * 3 + j];
      if (v >= 1 && v <= 5 && v < min) { min = v; qi = dm.i * 3 + j; }
    }
    if (qi < 0) qi = dm.i * 3;
    const ins = D.qInsights[qi];
    return { n: k + 1, dimIndex: dm.i, dim: dm.name, short: dm.short, score: dm.score, qi, prob: ins.prob, cons: ins.cons, act: ins.act };
  });

  const rule = valid.length ? centralRule(dims, overall) : null;
  const plan = D.planPhases.map((ph: any, k: number) => ({
    ...ph,
    act: prios[k] ? prios[k].dim + ": " + prios[k].act : "Consolidar as rotinas iniciadas nas fases anteriores e transformá-las em padrão da equipe.",
  }));

  return { dims, overall, cls, strong, gap, prios, rule, plan, interesse: ans[16] || null, tema: ans[17] || null, obstaculo: ans[15] || "" };
}

/**
 * Prioridade comercial interna (Quente / Morno / Nutrição) — inalterada.
 * NUNCA visível ao participante.
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
