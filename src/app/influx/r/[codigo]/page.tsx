"use client";
import {useEffect,useState} from "react";
import {useParams} from "next/navigation";
import {InfluxResultado} from "@/components/InfluxResultado";
import {InfluxBrand} from "@/components/InfluxBrand";
export default function RelatorioInflux(){
 const params=useParams(),[data,setData]=useState<{nome:string;ans:number[]}|null>(null),[erro,setErro]=useState("");
 const code=String(params?.codigo||"");
 useEffect(()=>{fetch("/api/influx/report?code="+encodeURIComponent(code),{cache:"no-store"}).then(async r=>{if(!r.ok)throw Error("Relatório não encontrado.");return r.json()}).then(setData).catch(e=>setErro(e.message));},[code]);
 return <main style={{minHeight:"100vh",background:"#F3F6F9",fontFamily:"Archivo,Arial,sans-serif",padding:"0"}}><InfluxBrand compact/><div style={{maxWidth:700,margin:"auto",padding:"28px 15px 70px"}}>
  <div style={{textAlign:"center",fontWeight:800,fontSize:15,marginBottom:20,color:"#102F55"}}>Sua devolutiva pessoal · VendaMais + inFlux</div>
  {erro?<p role="alert">{erro}</p>:data?<InfluxResultado nome={data.nome} ans={data.ans}/>:<p>Carregando sua devolutiva…</p>}
 </div></main>;
}
