"use client";
import {useState} from "react";
import {InfluxResultado} from "@/components/InfluxResultado";
const CENARIOS=[
 {nome:"Todas as respostas no nível 1",ans:[1,1,1,1,1,1,1,1,1]},
 {nome:"Respostas variadas",ans:[4,3,2,3,2,1,4,2,3]},
 {nome:"Todas as respostas no nível 4",ans:[4,4,4,4,4,4,4,4,4]}
];
export default function ExemploInflux(){
 const [cenario,setCenario]=useState(0);
 return <main style={{fontFamily:"Arial,sans-serif",background:"#F3F6F9",minHeight:"100vh",padding:"25px 14px",color:"#102F55"}}>
  <div style={{maxWidth:710,margin:"0 auto"}}>
   <div style={{background:"#102F55",color:"white",padding:20,borderRadius:15,marginBottom:20}}>
    <strong style={{fontSize:18}}>Prévia da devolutiva · VendaMais</strong>
    <p style={{margin:"7px 0 0",fontSize:14}}>Exemplos simulados para revisão. Nenhum dado é salvo e nenhum e-mail é enviado.</p>
   </div>
   <div style={{display:"flex",flexWrap:"wrap",gap:9,marginBottom:21}}>
    {CENARIOS.map((x,i)=><button key={x.nome} onClick={()=>setCenario(i)} style={{cursor:"pointer",padding:"12px 13px",borderRadius:10,fontWeight:700,border:"1px solid #CCD6DD",background:cenario===i?"#BADA00":"white",color:"#102F55",fontSize:13}}>{x.nome}</button>)}
   </div>
   <InfluxResultado nome="Participante de exemplo" ans={CENARIOS[cenario].ans}/>
  </div>
 </main>
}
