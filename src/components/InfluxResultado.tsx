"use client";
import {gerarDevolutiva,notaFormatada} from "@/lib/influx-devolutiva";

const C={azul:"#102F55",verde:"#BADA00",texto:"#19324D",muted:"#506578",linha:"#E0E7EE",base:"#F3F6F9"};
const card:React.CSSProperties={background:"#fff",border:"1px solid #E2E9F0",borderRadius:18,padding:"23px 20px",boxShadow:"0 8px 30px rgba(12,46,84,.055)"};
const h2:React.CSSProperties={fontSize:21,lineHeight:1.3,color:C.azul,margin:"0 0 13px"};
const p:React.CSSProperties={fontSize:15,lineHeight:1.65,color:C.texto,margin:"8px 0 0"};

export function InfluxResultado({nome,ans}:{nome:string;ans:number[]}){
 const r=gerarDevolutiva(ans);
 const primeiroNome=nome.trim().split(" ")[0]||"Líder";
 return <article style={{display:"grid",gap:17,fontFamily:"Archivo,Arial,sans-serif",color:C.texto}}>
  <section style={{...card,background:C.azul,color:"white",border:"none",padding:"29px 24px"}}>
   <div style={{fontSize:12,fontWeight:800,letterSpacing:1.2,color:C.verde}}>VENDAMAIS · DESENVOLVIMENTO DE LIDERANÇAS</div>
   <h1 style={{fontSize:28,lineHeight:1.15,margin:"13px 0 11px",color:"white"}}>Seu Perfil de Liderança</h1>
   <p style={{fontSize:15,lineHeight:1.6,margin:0,color:"#EEF4FA"}}>{primeiroNome}, este é um retrato inicial das práticas de liderança que você reconhece hoje — e de como pode transformá-las em ações.</p>
  </section>
  <section style={card}>
   <h2 style={h2}>O que suas respostas revelam</h2>
   <p style={p}>{r.visaoGeral}</p>
  </section>
  <section style={card}>
   <h2 style={h2}>Suas três dimensões de liderança</h2>
   <p style={{fontSize:13,lineHeight:1.5,color:C.muted,margin:"0 0 15px"}}>Pontuação média de 1 a 4. Cada dimensão reúne três práticas da metodologia VendaMais.</p>
   {r.dimensoes.map((d,i)=><div key={d.nome} style={{padding:"19px 0",borderTop:i?"1px solid "+C.linha:"none"}}>
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,color:C.azul,fontWeight:850,fontSize:16}}>
     <span>{d.nome}</span><span style={{whiteSpace:"nowrap"}}>{notaFormatada(d.nota)} / 4</span>
    </div>
    <div role="meter" aria-label={d.nome} aria-valuemin={1} aria-valuemax={4} aria-valuenow={d.nota} style={{height:9,background:"#E8EEF3",borderRadius:9,margin:"11px 0",overflow:"hidden"}}>
     <div style={{width:(d.nota/4*100)+"%",height:"100%",background:i===0?"#8C89C8":i===1?C.verde:"#477CA7",borderRadius:9}}/>
    </div>
    <p style={{...p,fontSize:14,margin:"0"}}>{d.leitura}</p>
   </div>)}
  </section>
  <section style={card}>
   <h2 style={h2}>A leitura para o seu desenvolvimento</h2>
   <div style={{borderLeft:"4px solid "+C.verde,padding:"1px 0 3px 14px",marginBottom:19}}>
    <h3 style={{fontSize:16,lineHeight:1.4,color:C.azul,margin:"0 0 7px"}}>{r.tituloForca}</h3>
    <p style={{...p,fontSize:14,margin:0}}>{r.textoForca}</p>
   </div>
   <div style={{borderLeft:"4px solid "+C.azul,padding:"1px 0 3px 14px"}}>
    <h3 style={{fontSize:16,lineHeight:1.4,color:C.azul,margin:"0 0 7px"}}>Onde concentrar sua evolução</h3>
    <p style={{...p,fontSize:14,margin:0}}>{r.oportunidade}</p>
   </div>
  </section>
  <section style={{...card,background:"#F6F9F0"}}>
   <div style={{fontWeight:850,fontSize:11,letterSpacing:1.25,color:C.azul,marginBottom:10}}>TRANSFORME O RESULTADO EM PRÁTICA</div>
   <h2 style={h2}>Seu roteiro para os próximos 15 dias</h2>
   <p style={{...p,fontSize:14,marginBottom:8}}>Três movimentos possíveis, um em cada dimensão. A proposta é começar pequeno, testar na rotina e observar resultados — não tentar mudar tudo de uma vez.</p>
   {r.plano.map((item,i)=><div key={item.dimensao} style={{borderTop:"1px solid #DFE6DB",padding:"17px 0 7px",display:"flex",gap:13}}>
    <div style={{width:31,height:31,borderRadius:9,background:C.azul,color:"white",display:"flex",justifyContent:"center",alignItems:"center",fontWeight:900,flexShrink:0,fontSize:14}}>{i+1}</div>
    <div>
     <div style={{fontSize:12,fontWeight:850,color:"#506578"}}>{item.quando} · {item.dimensao}</div>
     <h3 style={{fontSize:16,lineHeight:1.4,color:C.azul,margin:"5px 0 7px"}}>{item.titulo}</h3>
     <p style={{...p,fontSize:14,margin:"0 0 9px"}}>{item.acao}</p>
     <p style={{fontSize:13,lineHeight:1.5,color:C.muted,margin:"0"}}><b>Observe:</b> {item.indicador}</p>
    </div>
   </div>)}
  </section>
  <section style={{...card,background:"#EAF1F6"}}>
   <h2 style={{...h2,fontSize:18}}>Como saber se você evoluiu?</h2>
   <p style={{...p,fontSize:14}}>{r.desafioFinal}</p>
   <p style={{fontSize:12,lineHeight:1.6,color:C.muted,margin:"17px 0 0"}}>{r.ressalva}</p>
  </section>
 </article>;
}
