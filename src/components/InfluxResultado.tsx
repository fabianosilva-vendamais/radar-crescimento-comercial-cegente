"use client";
import {gerarLeitura,notaFormatada} from "@/lib/influx-report";

const C={azul:"#102F55",verde:"#BADA00",texto:"#19324D",muted:"#54677A",linha:"#E0E7EE"};
const card:React.CSSProperties={background:"#fff",border:"1px solid #E2E9F0",borderRadius:18,padding:"21px 19px",boxShadow:"0 8px 30px rgba(12,46,84,.06)"};

export function InfluxResultado({nome,ans}:{nome:string;ans:number[]}){
 const r=gerarLeitura(ans);
 const primeiroNome=nome.trim().split(" ")[0]||"Líder";
 const prioridade=r.prioridades[0];
 return <article style={{display:"grid",gap:15,fontFamily:"Archivo,Arial,sans-serif",color:C.texto}}>
  <section style={{...card,background:C.azul,color:"white",border:"none",padding:"26px 22px"}}>
   <div style={{fontSize:12,fontWeight:850,letterSpacing:1.25,color:C.verde}}>VENDAMAIS · DESENVOLVIMENTO DE LIDERANÇAS</div>
   <h1 style={{fontSize:27,lineHeight:1.18,margin:"12px 0 10px",color:"white"}}>Seu Perfil de Liderança</h1>
   <p style={{fontSize:15,lineHeight:1.6,margin:0,color:"#EDF4FC"}}>{primeiroNome}, suas respostas oferecem uma primeira visão de como você percebe sua atuação nas três dimensões da liderança.</p>
  </section>
  <section style={card}>
   <h2 style={{fontSize:20,color:C.azul,margin:"0 0 7px"}}>Suas dimensões da liderança</h2>
   <p style={{fontSize:13,lineHeight:1.5,color:C.muted,margin:"0 0 14px"}}>Média de cada dimensão, na escala de 1 a 4.</p>
   {r.dimensoes.map((d,i)=><div key={d.nome} style={{padding:"12px 0",borderTop:i?"1px solid "+C.linha:"none"}}>
    <div style={{display:"flex",justifyContent:"space-between",gap:12,alignItems:"center",fontSize:15,fontWeight:800,color:C.azul}}>
     <span>{d.nome}</span><span style={{whiteSpace:"nowrap"}}>{notaFormatada(d.valor)} / 4</span>
    </div>
    <div role="meter" aria-label={d.nome} aria-valuemin={1} aria-valuemax={4} aria-valuenow={d.valor} style={{height:9,background:"#E8EEF3",borderRadius:9,marginTop:8,overflow:"hidden"}}>
     <div style={{height:"100%",width:(d.valor/4*100)+"%",background:C.verde,borderRadius:9}}/>
    </div>
   </div>)}
  </section>
  <section style={card}>
   <h2 style={{fontSize:19,color:C.azul,margin:"0 0 15px"}}>O que merece sua atenção</h2>
   <div style={{borderLeft:"4px solid "+C.verde,paddingLeft:13,marginBottom:17}}>
    <strong style={{color:C.azul,fontSize:15}}>Sua principal fortaleza</strong>
    <p style={{fontSize:14,lineHeight:1.55,margin:"6px 0 0"}}>{r.resumoForte}</p>
   </div>
   <div style={{borderLeft:"4px solid "+C.azul,paddingLeft:13}}>
    <strong style={{color:C.azul,fontSize:15}}>Sua oportunidade de evolução</strong>
    <p style={{fontSize:14,lineHeight:1.55,margin:"6px 0 0"}}>{r.resumoEvolucao}</p>
   </div>
  </section>
  <section style={{...card,background:"#F1F6E5",border:"1px solid #DCE8C1"}}>
   <div style={{fontSize:11,fontWeight:850,letterSpacing:1,color:C.azul,marginBottom:8}}>SUA PRIMEIRA AÇÃO</div>
   <h2 style={{fontSize:19,color:C.azul,margin:"0 0 10px"}}>{prioridade.titulo}</h2>
   <p style={{fontSize:14,lineHeight:1.6,margin:0}}>{prioridade.acao}</p>
  </section>
  <section style={{textAlign:"center",padding:"3px 12px"}}>
   <p style={{fontSize:13,fontWeight:750,color:C.azul,margin:"8px 0"}}>Sua liderança pode evoluir ainda mais com a VendaMais.</p>
   <p style={{fontSize:12,lineHeight:1.6,color:C.muted,margin:"6px 0"}}>Este resultado reflete sua autopercepção em nove afirmações. É uma análise inicial, não uma avaliação completa de competências.</p>
  </section>
 </article>;
}
