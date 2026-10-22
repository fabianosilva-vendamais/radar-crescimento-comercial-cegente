"use client";
import {avaliar,textoResultado,DIMENSOES} from "@/lib/influx";
const box:React.CSSProperties={background:"white",borderRadius:22,padding:24,boxShadow:"0 12px 40px #12283612",border:"1px solid #E6E2DA"};
export function InfluxResultado({nome,ans}:{nome:string;ans:number[]}){
 const r=avaliar(ans),t=textoResultado(nome,ans);
 return <div style={box}>
  <div style={{fontWeight:800,color:"#B6273D",fontSize:13,letterSpacing:1}}>SUA DEVOLUTIVA INDIVIDUAL</div>
  <h1 style={{fontSize:27,lineHeight:1.2,margin:"12px 0"}}>{nome.split(" ")[0]}, seu Perfil de Liderança</h1>
  <p style={{lineHeight:1.55,color:"#55616B"}}>Uma leitura inicial sobre sua atuação em três dimensões da liderança.</p>
  {r.dims.map((v,i)=><div key={i} style={{marginTop:24}}>
   <div style={{display:"flex",justifyContent:"space-between",fontSize:14,fontWeight:800,marginBottom:8}}><span>{DIMENSOES[i]}</span><span>{v.toFixed(1).replace(".",",")} / 4</span></div>
   <div style={{height:12,background:"#E8E6E3",borderRadius:20,overflow:"hidden"}}><div style={{width:String(v/4*100)+"%",height:"100%",background:["#BB3040","#D9973B","#315D73"][i],borderRadius:20}}/></div>
  </div>)}
  <div style={{borderTop:"1px solid #E5E3DF",marginTop:27,paddingTop:17,lineHeight:1.65}}>
   <h2 style={{fontSize:17,margin:"0 0 5px"}}>Sua fortaleza relativa</h2><p style={{margin:"0 0 20px"}}>{t.fort}</p>
   <h2 style={{fontSize:17,margin:"0 0 5px"}}>Sua oportunidade de evolução</h2><p style={{margin:"0 0 20px"}}>{t.gap}</p>
   <div style={{background:"#F8F1E6",borderRadius:13,padding:17}}><h2 style={{fontSize:17,margin:"0 0 5px"}}>Um próximo passo</h2><p style={{margin:0}}>{t.passo}</p></div>
  </div>
  <p style={{fontSize:12,lineHeight:1.55,color:"#61707B",marginTop:20}}>{t.ressalva}</p>
 </div>;
}
