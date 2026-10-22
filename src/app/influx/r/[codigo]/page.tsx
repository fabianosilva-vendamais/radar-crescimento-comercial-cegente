"use client";
import {useEffect,useState} from "react";
import {useParams} from "next/navigation";
import {InfluxResultado} from "../../page";
export default function RelatorioInflux(){
 const params=useParams(),[data,setData]=useState<{nome:string;ans:number[]}|null>(null),[erro,setErro]=useState("");
 const code=String(params?.codigo||"");
 useEffect(()=>{fetch("/api/influx/report?code="+encodeURIComponent(code),{cache:"no-store"}).then(async r=>{if(!r.ok)throw Error("Relatório não encontrado.");return r.json()}).then(setData).catch(e=>setErro(e.message));},[code]);
 return <main style={{minHeight:"100vh",background:"#F4F2ED",fontFamily:"Archivo,Arial,sans-serif",padding:"40px 14px"}}><div style={{maxWidth:650,margin:"auto"}}>
  <div style={{textAlign:"center",fontWeight:900,fontSize:23,marginBottom:24}}>VendaMais · inFlux</div>
  {erro?<p role="alert">{erro}</p>:data?<InfluxResultado nome={data.nome} ans={data.ans}/>:<p>Carregando sua devolutiva…</p>}
 </div></main>;
}
