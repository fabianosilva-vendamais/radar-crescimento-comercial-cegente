"use client";
import {useEffect,useState} from "react";
import {supabaseBrowser,supabaseConfigured} from "@/lib/supabase-browser";
type R={id:string;created_at:string;nome:string;email:string;whats:string;cargo:string;empresa:string;cidade:string;uf:string;vend:string;prioridade:string;scoreFit:number;interesse:string;emailStatus:string;emailErro:string;dimensoes:number[];status:string};
const inp:React.CSSProperties={padding:"11px 13px",border:"1px solid #D1D6DB",borderRadius:9,fontSize:15,boxSizing:"border-box",width:"100%"};
const btn:React.CSSProperties={background:"#B6273D",color:"white",border:0,borderRadius:9,padding:"11px 17px",cursor:"pointer",fontWeight:800};
export default function AdminInflux(){
 const [email,setEmail]=useState(""),[senha,setSenha]=useState(""),[token,setToken]=useState(""),[rows,setRows]=useState<R[]>([]),[erro,setErro]=useState(""),[load,setLoad]=useState(false),[filter,setFilter]=useState("Todos");
 useEffect(()=>{if(supabaseConfigured())supabaseBrowser().auth.getSession().then(({data})=>setToken(data.session?.access_token||""));},[]);
 useEffect(()=>{if(token)atualizar(token);},[token]);
 async function atualizar(t:string){
  setLoad(true);setErro("");
  try{const r=await fetch("/api/influx/admin",{headers:{Authorization:"Bearer "+t},cache:"no-store"});if(!r.ok)throw Error("Não autorizado ou indisponível.");const d=await r.json();setRows(d.records||[]);}
  catch(e:any){setErro(e.message);}finally{setLoad(false);}
 }
 async function entrar(e:React.FormEvent){
  e.preventDefault();setErro("");setLoad(true);
  try{const {data,error}=await supabaseBrowser().auth.signInWithPassword({email,password:senha});if(error||!data.session)throw Error(error?.message||"Não foi possível autenticar.");setToken(data.session.access_token);}
  catch(e:any){setErro(e.message);}finally{setLoad(false);}
 }
 function exportar(){
  const filtered=rows.filter(x=>filter==="Todos"||x.prioridade===filter);
  const fields=["created_at","nome","email","whats","cargo","empresa","cidade","uf","vend","prioridade","scoreFit","interesse","emailStatus","status"];
  const cell=(v:unknown)=>'"'+String(v??"").replace(/"/g,'""')+'"';
  const csv="\uFEFF"+[fields.join(";"),...filtered.map(r=>fields.map(k=>cell((r as any)[k])).join(";"))].join("\r\n");
  const url=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8"}));const a=document.createElement("a");a.href=url;a.download="radar-influx-participantes.csv";a.click();URL.revokeObjectURL(url);
 }
 const view=rows.filter(x=>filter==="Todos"||x.prioridade===filter);
 if(!supabaseConfigured())return <p>O acesso administrativo ainda não está configurado.</p>;
 return <main style={{minHeight:"100vh",background:"#F4F2ED",fontFamily:"Archivo,Arial,sans-serif",color:"#182832",padding:"25px 14px"}}>
  <div style={{maxWidth:1150,margin:"auto"}}>
   <h1 style={{fontSize:27,marginBottom:5}}>Radar Influx · Painel Comercial</h1>
   <p style={{color:"#586771",marginTop:0}}>Acesso restrito à VendaMais. Os perfis comerciais não alteram a devolutiva individual.</p>
   {!token?<form onSubmit={entrar} style={{maxWidth:400,background:"white",padding:25,borderRadius:16,display:"grid",gap:12,marginTop:25}}>
    <label>E-mail administrador<input type="email" required style={inp} value={email} onChange={e=>setEmail(e.target.value)}/></label>
    <label>Senha<input type="password" required style={inp} value={senha} onChange={e=>setSenha(e.target.value)}/></label>
    <button style={btn} disabled={load}>Entrar</button>
   </form>:<>
    <div style={{display:"flex",gap:12,flexWrap:"wrap",alignItems:"center",margin:"23px 0"}}>
     <b>{rows.length} inscrições</b>
     <select style={{...inp,width:"auto"}} value={filter} onChange={e=>setFilter(e.target.value)}>
      {["Todos","Prioritário","Acompanhar","Nutrição"].map(x=><option key={x}>{x}</option>)}
     </select>
     <button style={btn} onClick={exportar}>Exportar CSV</button>
     <button style={{...btn,background:"#385B70"}} onClick={()=>atualizar(token)} disabled={load}>Atualizar</button>
     <button style={{...btn,background:"#727D84"}} onClick={async()=>{await supabaseBrowser().auth.signOut();setToken("");setRows([])}}>Sair</button>
    </div>
    <div style={{overflowX:"auto",borderRadius:14,background:"white",border:"1px solid #E2E4E4"}}>
     <table style={{borderCollapse:"collapse",minWidth:950,width:"100%",fontSize:13}}>
      <thead style={{background:"#14232E",color:"white"}}><tr>{["Participante","Cargo / unidade","Local","Equipe de vendas","Prioridade","3 dimensões (1–4)","E-mail","Autorização comercial"].map(x=><th key={x} style={{padding:12,textAlign:"left"}}>{x}</th>)}</tr></thead>
      <tbody>{view.map(r=><tr key={r.id} style={{borderBottom:"1px solid #E7E7E7"}}>
       <td style={{padding:12}}><b>{r.nome}</b><div>{r.email}</div><div>{r.whats}</div></td>
       <td style={{padding:12}}><b>{r.cargo}</b><div>{r.empresa}</div></td>
       <td style={{padding:12}}>{r.cidade}/{r.uf}</td>
       <td style={{padding:12}}>{r.vend}</td>
       <td style={{padding:12,fontWeight:800}}>{r.prioridade}</td>
       <td style={{padding:12}}>{r.dimensoes.map(x=>x.toFixed(1).replace(".",",")).join(" · ")}</td>
       <td style={{padding:12}}>{r.emailStatus}</td><td style={{padding:12}}>{r.interesse==="Autorizou contato"?"Sim":"Não"}</td>
      </tr>)}</tbody>
     </table>
    </div>
   </>}
   {erro&&<p role="alert" style={{color:"#B6273D",fontWeight:800}}>{erro}</p>}
  </div>
 </main>;
}
