"use client";
import {useCallback,useEffect,useState} from "react";
import {InfluxBrand} from "@/components/InfluxBrand";
type Dim={nome:string;media:number|null};
type Pratica={nome:string;dimensao:string;media:number|null};
type Resumo={total:number;mediaGeral:number|null;dimensoes:Dim[];praticas:Pratica[];niveis:{nivel:number;total:number}[];atualizadoEm:string};
const C={navy:"#102F55",green:"#BADA00",purple:"#39318A",pale:"#F3F6F9",muted:"#57718B"};
const card:React.CSSProperties={background:"white",borderRadius:19,border:"1px solid #E0E8F0",padding:"22px",boxShadow:"0 6px 23px #102F5512"};
const input:React.CSSProperties={padding:"14px 16px",width:"100%",boxSizing:"border-box",border:"1px solid #C9D7E4",borderRadius:12,fontSize:16,color:C.navy};
const button:React.CSSProperties={background:C.green,color:C.navy,border:0,borderRadius:12,fontWeight:900,fontSize:16,padding:"15px 20px",cursor:"pointer"};
function fmt(n:number|null){return typeof n==="number"?n.toFixed(2).replace(".",","):"—";}
function Barra({valor,color}:{valor:number|null;color:string}){return <div style={{height:13,background:"#EAF0F5",borderRadius:50,marginTop:13,overflow:"hidden"}}><div style={{height:"100%",background:color,borderRadius:50,width:typeof valor==="number"?(valor/4*100)+"%":"0%",transition:"width .4s"}}/></div>}
function Dashboard({dados,onReload,onLogout,loading}:{dados:Resumo;onReload:()=>void;onLogout:()=>void;loading:boolean}){
 const order=[...dados.dimensoes].filter(d=>d.media!==null).sort((a,b)=>(b.media||0)-(a.media||0));
 return <main style={{maxWidth:1250,margin:"auto",padding:"28px 18px 70px"}}>
  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:20,flexWrap:"wrap",marginBottom:23}}>
   <div><div style={{fontSize:12,color:C.purple,fontWeight:900,letterSpacing:1.5}}>PALESTRA DE LIDERANÇA · INFLUX</div><h1 style={{fontSize:"clamp(27px, 4vw, 43px)",lineHeight:1.1,color:C.navy,margin:"9px 0 8px"}}>O retrato da liderança na sala</h1><p style={{color:C.muted,margin:0,fontSize:15}}>Resultados coletivos do autodiagnóstico VendaMais</p></div>
   <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}><button onClick={onReload} disabled={loading} style={{...button,fontSize:13,padding:"11px 14px",background:C.navy,color:"white"}}>{loading?"Atualizando…":"Atualizar agora"}</button><button onClick={onLogout} style={{...button,fontSize:13,padding:"11px 14px",background:"#E8EEF3"}}>Sair</button></div>
  </div>
  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(240px,1fr))",gap:18,marginBottom:22}}>
   <section style={{...card,background:C.navy,color:"white",border:0}}>
    <div style={{fontSize:13,color:"#D8E6F3",fontWeight:750}}>Participantes que concluíram</div>
    <div style={{fontSize:"clamp(56px, 8vw, 96px)",fontWeight:900,letterSpacing:"-3px",lineHeight:1.2,color:C.green,marginTop:12}}>{dados.total}</div>
    <p style={{fontSize:14,color:"#E6F0F8",marginBottom:0}}>avaliações respondidas</p>
   </section>
   <section style={card}>
    <div style={{fontSize:13,color:C.muted,fontWeight:800}}>Média geral de autopercepção</div>
    <div style={{fontSize:"clamp(56px, 8vw, 96px)",fontWeight:900,letterSpacing:"-3px",lineHeight:1.2,color:C.navy,marginTop:12}}>{fmt(dados.mediaGeral)}<span style={{fontSize:23,letterSpacing:0,color:C.muted}}> / 4</span></div>
    <Barra valor={dados.mediaGeral} color={C.green}/>
    <p style={{fontSize:13,lineHeight:1.5,color:C.muted,marginBottom:0}}>Média das nove práticas, considerando todos os participantes que concluíram.</p>
   </section>
  </div>
  <section style={{...card,marginBottom:22}}>
   <h2 style={{margin:"0 0 5px",fontSize:23,color:C.navy}}>As três dimensões da liderança</h2>
   <p style={{color:C.muted,margin:"5px 0 19px",lineHeight:1.5}}>Média de cada dimensão, na escala de 1 a 4.</p>
   <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(195px,1fr))",gap:18}}>
   {dados.dimensoes.map((d,i)=><div key={d.nome} style={{background:"#F7FAFD",borderRadius:14,padding:17,border:"1px solid #E8EDF2"}}>
    <div style={{fontSize:16,color:C.navy,fontWeight:850,minHeight:42}}>{d.nome}</div>
    <div style={{fontSize:38,color:C.navy,fontWeight:900,margin:"12px 0"}}>{fmt(d.media)}<span style={{fontSize:14,color:C.muted}}> / 4</span></div>
    <Barra valor={d.media} color={[C.purple,"#8FAF00",C.navy][i]}/>
   </div>)}
   </div>
   {dados.total>=5&&order.length>0&&<p style={{fontSize:15,lineHeight:1.55,background:"#F0F6E1",padding:16,borderRadius:12,color:C.navy,margin:"19px 0 0"}}>
    <strong>Reflexão para a plateia:</strong> entre as três dimensões, <strong>{order[0].nome}</strong> apresenta a maior média relativa. Uma média mais alta não significa domínio pleno; vale observar as diferenças entre as práticas específicas.
   </p>}
  </section>
  <section style={{...card,marginBottom:22}}>
   <h2 style={{fontSize:23,color:C.navy,margin:"0 0 5px"}}>Como a plateia se percebe em cada prática</h2>
   <p style={{color:C.muted,lineHeight:1.5,margin:"5px 0 20px"}}>Uma visão coletiva das nove competências para apoiar a conversa durante a palestra.</p>
   <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(255px,1fr))",gap:15}}>
   {dados.praticas.map((p,i)=><div key={p.nome} style={{padding:"15px",border:"1px solid #E3EAF1",borderRadius:12}}>
    <div style={{fontSize:11,color:C.purple,fontWeight:800,marginBottom:7}}>{p.dimensao}</div>
    <div style={{display:"flex",justifyContent:"space-between",gap:12,alignItems:"baseline"}}><span style={{color:C.navy,fontSize:14,fontWeight:750,lineHeight:1.4}}>{p.nome}</span><b style={{color:C.navy,whiteSpace:"nowrap"}}>{fmt(p.media)}</b></div>
    <Barra valor={p.media} color={i<3?C.purple:i<6?"#8FAF00":C.navy}/>
   </div>)}
   </div>
  </section>
  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10}}>
   <span style={{fontSize:13,color:C.muted}}>Atualização automática a cada 15 segundos. Última consulta: {new Date(dados.atualizadoEm).toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit",second:"2-digit"})}.</span>
   <span style={{fontSize:12,color:C.muted}}>Dados agregados · sem nomes ou contatos individuais · autopercepção</span>
  </div>
 </main>;
}
export default function InfluxPalco(){
 const [email,setEmail]=useState("karen@vendamais.com.br");
 const [senha,setSenha]=useState("");
 const [resumo,setResumo]=useState<Resumo|null>(null);
 const [autenticado,setAutenticado]=useState(false);
 const [carregando,setCarregando]=useState(false);
 const [erro,setErro]=useState("");
 const consultar=useCallback(async()=>{
  try{const r=await fetch("/api/influx/palco",{cache:"no-store",credentials:"same-origin"});
   if(r.status===401){setAutenticado(false);setResumo(null);return;}
   if(!r.ok)throw Error("Não foi possível atualizar os indicadores.");
   const v:Resumo=await r.json();setResumo(v);setAutenticado(true);setErro("");
  }catch(e:any){setErro(e?.message||"Sem conexão. Tente novamente.");}
 },[]);
 useEffect(()=>{void consultar();const id=setInterval(()=>void consultar(),15000);return()=>clearInterval(id);},[consultar]);
 async function entrar(e:React.FormEvent){
  e.preventDefault();setCarregando(true);setErro("");
  try{const r=await fetch("/api/influx/palco",{method:"POST",headers:{"Content-Type":"application/json"},credentials:"same-origin",body:JSON.stringify({email,senha})});
   const d=await r.json();if(!r.ok)throw Error(d.error||"Não foi possível entrar.");
   setSenha("");await consultar();
  }catch(e:any){setErro(e.message||"Não foi possível entrar.");}
  finally{setCarregando(false);}
 }
 async function sair(){await fetch("/api/influx/palco",{method:"DELETE",credentials:"same-origin"});setAutenticado(false);setResumo(null);setSenha("");}
 return <div style={{minHeight:"100vh",background:C.pale,fontFamily:"Archivo,Arial,sans-serif",color:C.navy}}>
  <InfluxBrand compact/>
  {autenticado&&resumo?<Dashboard dados={resumo} onReload={()=>void consultar()} onLogout={()=>void sair()} loading={carregando}/>:<main style={{maxWidth:510,margin:"45px auto",padding:"0 18px"}}>
   <section style={{...card,padding:"30px 25px"}}>
    <div style={{color:C.purple,letterSpacing:1.2,fontWeight:900,fontSize:12}}>ACESSO DA PALESTRANTE</div>
    <h1 style={{fontSize:29,lineHeight:1.2,margin:"13px 0 10px"}}>Painel da Karen</h1>
    <p style={{color:C.muted,lineHeight:1.6,fontSize:15,margin:"0 0 22px"}}>Acompanhe quantas pessoas responderam e como a plateia avalia suas práticas de liderança.</p>
    <form onSubmit={entrar} style={{display:"grid",gap:16}}>
     <label style={{fontSize:13,fontWeight:800}}>E-mail<input required type="email" autoComplete="username" value={email} onChange={e=>setEmail(e.target.value)} style={{...input,display:"block",marginTop:8}}/></label>
     <label style={{fontSize:13,fontWeight:800}}>Senha<input required type="password" autoComplete="current-password" value={senha} onChange={e=>setSenha(e.target.value)} style={{...input,display:"block",marginTop:8}}/></label>
     <button disabled={carregando} type="submit" style={button}>{carregando?"Entrando…":"Entrar no painel"}</button>
    </form>
    {erro&&<p role="alert" style={{color:"#B12340",fontWeight:700,fontSize:13,marginTop:18}}>{erro}</p>}
   </section>
  </main>}
 </div>;
}
