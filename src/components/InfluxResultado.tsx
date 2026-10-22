"use client";
import {gerarLeitura,notaFormatada} from "@/lib/influx-report";
import {DIMENSOES} from "@/lib/influx";
const C={azul:"#102F55",verde:"#BADA00",fundo:"#F3F6F9",texto:"#19324D",muted:"#54677A",linha:"#E0E7EE",roxo:"#39318A"};
const box:React.CSSProperties={background:"white",borderRadius:20,padding:"23px 19px",boxShadow:"0 8px 30px rgba(12,46,84,.07)",border:"1px solid #E2E9F0"};
const tit:React.CSSProperties={fontSize:20,lineHeight:1.25,color:C.azul,margin:"0 0 13px",fontWeight:800};
const para:React.CSSProperties={lineHeight:1.65,color:C.texto,fontSize:15,margin:"8px 0 14px"};
const eyebrow:React.CSSProperties={fontSize:11,fontWeight:850,letterSpacing:1.3,color:C.roxo,textTransform:"uppercase",marginBottom:10};
export function InfluxResultado({nome,ans}:{nome:string;ans:number[]}){
 const r=gerarLeitura(ans);
 const first=nome.trim().split(" ")[0]||"Líder";
 return <article style={{display:"grid",gap:19,fontFamily:"Archivo,Arial,sans-serif"}}>
  <section style={{...box,background:C.azul,color:"#fff",border:"none",padding:"29px 22px",overflow:"hidden"}}>
   <div style={{fontSize:12,letterSpacing:1.5,fontWeight:900,color:C.verde}}>SEU PERFIL DE LIDERANÇA</div>
   <h1 style={{fontSize:29,lineHeight:1.12,margin:"14px 0 14px",color:"#fff"}}>{first}, suas respostas podem se transformar em ações.</h1>
   <p style={{fontSize:15,lineHeight:1.65,color:"#EDF4FC",margin:0}}>Você dedicou alguns minutos à reflexão. Agora recebe um roteiro prático para liderar melhor a si mesmo, desenvolver sua equipe e gerar resultados.</p>
   <div style={{marginTop:22,padding:"13px 16px",borderRadius:12,background:"#23486F",display:"flex",gap:12,alignItems:"center"}}>
    <span style={{fontSize:25,fontWeight:850,color:C.verde}}>3</span><span style={{fontSize:13,lineHeight:1.45}}>dimensões analisadas, nove práticas observadas e um plano de ação para as próximas quatro semanas.</span>
   </div>
  </section>
  <section style={box}>
   <div style={eyebrow}>Sua leitura em perspectiva</div>
   <h2 style={tit}>O que suas respostas mostram</h2>
   <p style={para}>{r.resumo}</p>
   <p style={para}><strong>Onde você se percebe mais forte:</strong> {r.resumoForte}</p>
   <p style={para}><strong>Onde vale investir energia:</strong> {r.resumoEvolucao}</p>
   <p style={{fontSize:13,lineHeight:1.55,color:C.muted,margin:"10px 0 0"}}>Não há resposta “certa” ou “errada”. O objetivo não é alcançar a nota máxima, mas identificar a próxima prática que fará diferença na sua rotina.</p>
  </section>
  <section style={box}>
   <div style={eyebrow}>Panorama individual</div>
   <h2 style={tit}>Suas três dimensões</h2>
   <p style={{...para,color:C.muted,marginTop:0}}>A escala vai de 1 a 4 e representa como você percebe a própria atuação hoje.</p>
   {r.dimensoes.map((d,i)=><div key={d.nome} style={{padding:"17px 0",borderTop:i?"1px solid "+C.linha:"none"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",gap:10,fontWeight:800,color:C.azul,fontSize:16}}>
     <span>{d.nome}</span><span style={{whiteSpace:"nowrap"}}>{notaFormatada(d.valor)} / 4</span>
    </div>
    <div style={{height:10,background:"#E6EBF0",borderRadius:10,overflow:"hidden",margin:"10px 0 13px"}}>
     <div style={{height:"100%",width:String(d.valor/4*100)+"%",background:i===0?C.roxo:i===1?"#7FA81B":C.azul,borderRadius:10}}/>
    </div>
    <p style={{fontSize:14,lineHeight:1.55,margin:"0 0 7px",color:C.texto}}>{d.descricao}</p>
    <p style={{fontSize:13,lineHeight:1.55,margin:0,color:C.muted}}>{d.orientacao}</p>
   </div>)}
  </section>
  <section style={box}>
   <div style={eyebrow}>Seus recursos</div>
   <h2 style={tit}>Práticas que você já pode aproveitar</h2>
   <p style={{...para,color:C.muted}}>Estas são as práticas nas quais você relata maior autonomia. Use-as como ponto de apoio para desenvolver as demais.</p>
   {r.fortalezas.map(item=><div key={item.indice} style={{padding:"15px 0",borderTop:"1px solid "+C.linha}}>
    <strong style={{fontSize:15,color:C.azul}}>{item.titulo}</strong>
    <span style={{marginLeft:8,fontSize:12,color:C.muted}}>Nível {item.nota}</span>
    <p style={{...para,fontSize:14,margin:"6px 0"}}>{item.interpreta}</p>
    <p style={{fontSize:13,color:C.muted,lineHeight:1.5,margin:"6px 0"}}><strong>Como perceber na prática:</strong> {item.evidencia}</p>
   </div>)}
  </section>
  <section style={box}>
   <div style={eyebrow}>Oportunidades de desenvolvimento</div>
   <h2 style={tit}>Três prioridades para agir agora</h2>
   <p style={{...para,color:C.muted}}>Escolhemos uma prática de cada dimensão, começando por aquelas em que você relatou menor autonomia. A ordem é uma sugestão, não um diagnóstico.</p>
   {r.prioridades.map((item,i)=><div key={item.indice} style={{borderRadius:15,background:i===0?"#F1F6E5":C.fundo,border:"1px solid "+(i===0?"#DCE9BB":C.linha),padding:17,marginTop:13}}>
    <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:9}}>
     <span style={{background:C.azul,color:"#fff",fontWeight:900,fontSize:12,minWidth:28,height:28,borderRadius:8,display:"inline-flex",justifyContent:"center",alignItems:"center"}}>{i+1}</span>
     <span style={{fontSize:12,color:C.muted,fontWeight:700}}>{item.dimensao} · nível {item.nota}</span>
    </div>
    <h3 style={{fontSize:18,color:C.azul,margin:"0 0 8px"}}>{item.titulo}</h3>
    <p style={{...para,fontSize:14}}>{item.interpreta}</p>
    <p style={{...para,fontSize:14}}><strong>Por que isso importa:</strong> {item.porque}</p>
    <div style={{borderLeft:"4px solid "+C.verde,paddingLeft:12,marginTop:12}}>
     <strong style={{fontSize:14,color:C.azul}}>O que fazer a partir de amanhã</strong>
     <p style={{...para,fontSize:14,marginBottom:8}}>{item.acao}</p>
     <strong style={{fontSize:13,color:C.azul}}>Sinal de evolução</strong>
     <p style={{fontSize:13,lineHeight:1.55,margin:"4px 0 0",color:C.muted}}>{item.evidencia}</p>
    </div>
   </div>)}
  </section>
  <section style={box}>
   <div style={eyebrow}>Plano de desenvolvimento</div>
   <h2 style={tit}>Seu próximo mês, semana a semana</h2>
   <p style={{...para,color:C.muted}}>Um plano simples para sair do insight e chegar ao comportamento observável.</p>
   {r.plano.map((p,i)=><div key={p.semana} style={{display:"flex",gap:14,padding:"16px 0",borderTop:"1px solid "+C.linha}}>
    <div style={{minWidth:36,height:36,borderRadius:10,background:i===3?C.verde:C.azul,color:i===3?C.azul:"white",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,fontWeight:900}}>{i+1}</div>
    <div><strong style={{fontSize:13,color:C.roxo}}>{p.semana}</strong><h3 style={{fontSize:16,color:C.azul,margin:"5px 0"}}>{p.titulo}</h3>
     <p style={{...para,fontSize:14,margin:"4px 0"}}>{p.orientacao}</p>
     <p style={{fontSize:13,color:C.muted,lineHeight:1.5,margin:"5px 0"}}><strong>Prática:</strong> {p.foco.titulo}</p>
    </div>
   </div>)}
  </section>
  <section style={box}>
   <div style={eyebrow}>Visão completa</div>
   <h2 style={tit}>As nove práticas, uma a uma</h2>
   <p style={{...para,color:C.muted}}>Consulte esta seção quando quiser trabalhar outra habilidade. Cada item mostra uma interpretação e uma ação concreta.</p>
   {r.dimensoes.map((d,i)=><div key={d.nome} style={{marginTop:18}}>
    <h3 style={{fontSize:16,color:C.azul,borderBottom:"2px solid "+C.verde,paddingBottom:9,marginBottom:12}}>{d.nome}</h3>
    {d.itens.map(item=><div key={item.indice} style={{padding:"12px 0 17px",borderBottom:"1px solid "+C.linha}}>
     <div style={{display:"flex",justifyContent:"space-between",gap:8,alignItems:"baseline"}}><strong style={{color:C.texto,fontSize:14}}>{item.titulo}</strong><small style={{whiteSpace:"nowrap",color:C.muted}}>Nível {item.nota}</small></div>
     <p style={{...para,fontSize:13,margin:"8px 0"}}>{item.interpreta}</p>
     <p style={{fontSize:13,lineHeight:1.55,color:C.muted,margin:"5px 0"}}><strong>Experimente:</strong> {item.acao}</p>
    </div>)}
   </div>)}
  </section>
  <section style={{...box,background:"#EAF1F6"}}>
   <h2 style={{...tit,fontSize:19}}>Uma última reflexão</h2>
   <p style={para}>O que você fará de maneira diferente na próxima conversa, reunião ou decisão? Escolha apenas uma prática, aplique e observe o efeito. Liderança melhora quando boas intenções viram ações consistentes.</p>
   <p style={{color:C.muted,fontSize:12,lineHeight:1.6,marginBottom:0}}>{r.ressalva}</p>
  </section>
 </article>;
}
