"use client";
import {useState} from "react";
type R={id:string;created_at:string;nome:string;email:string;whats:string;cargo:string;empresa:string;cidade:string;uf:string;vend:string;prioridade:string;scoreFit:number;interesse:string;emailStatus:string;emailErro:string;dimensoes:number[];respostas:number[];status:string};
const inp:React.CSSProperties={padding:"11px 13px",border:"1px solid #D1D6DB",borderRadius:9,fontSize:15,boxSizing:"border-box",width:"100%"};
const btn:React.CSSProperties={background:"#102F55",color:"#fff",border:0,borderRadius:9,padding:"11px 17px",cursor:"pointer",fontWeight:800};
export default function AdminInflux(){
 const [senha,setSenha]=useState(""),[token,setToken]=useState(""),[rows,setRows]=useState<R[]>([]),[erro,setErro]=useState(""),[load,setLoad]=useState(false),[filter,setFilter]=useState("Todos");
 async function atualizar(t:string){
  setLoad(true);setErro("");
  try{const r=await fetch("/api/influx/admin",{headers:{Authorization:"Bearer "+t},cache:"no-store"});if(!r.ok)throw Error("Não autorizado ou indisponível.");const d=await r.json();setRows(d.records||[]);}
  catch(e:any){setErro(e.message);}finally{setLoad(false);}
 }
 async function entrar(e:React.FormEvent){
  e.preventDefault();setErro("");setLoad(true);
  try{const r=await fetch("/api/influx/admin",{headers:{Authorization:"Bearer "+senha},cache:"no-store"});if(!r.ok)throw Error("Senha incorreta ou acesso indisponível.");const d=await r.json();setRows(d.records||[]);setToken(senha);setSenha("");}
  catch(e:any){setErro(e.message);}finally{setLoad(false);}
 }
 function exportar(){
  const filtered=rows.filter(x=>filter==="Todos"||x.prioridade===filter);
  const fields=["Data e hora","Nome","E-mail","WhatsApp","Cargo","Empresa/unidade","Cidade","UF","Faixa de vendedores","Qualificação comercial","Pontuação de aderência","Autorização comercial","Status de envio do e-mail","Situação comercial","Nota — O Líder","Nota — O Líder da Equipe","Nota — O Líder do Negócio",...Array.from({length:9},(_,i)=>"Resposta "+(i+1))];
  const safe=(v:unknown)=>{
    const raw=String(v??"");
    // Evita a execução de fórmulas se a planilha for aberta no Excel.
    const value=/^[=+@\-\t\r]/.test(raw)?"'"+raw:raw;
    return '"'+value.replace(/"/g,'""')+'"';
  };
  const csv="\uFEFF"+[fields.map(safe).join(";"),...filtered.map(r=>{
    const values=[r.created_at,r.nome,r.email,r.whats,r.cargo,r.empresa,r.cidade,r.uf,r.vend,r.prioridade,r.scoreFit,r.interesse==="Autorizou contato"?"Sim":"Não",r.emailStatus,r.status,
      ...(r.dimensoes||[]).map(n=>typeof n==="number"?n.toFixed(2).replace(".",","):""),
      ...Array.from({length:9},(_,i)=>r.respostas?.[i]??"")];
    return values.map(safe).join(";");
  })].join("\r\n");
  const url=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8"}));
  const a=document.createElement("a");a.href=url;a.download="radar-influx-dados-completos.csv";a.click();URL.revokeObjectURL(url);
 }
 const view=rows.filter(x=>filter==="Todos"||x.prioridade===filter);
 return <main style={{minHeight:"100vh",background:"#F3F6F9",fontFamily:"Archivo,Arial,sans-serif",color:"#182832",padding:"25px 14px"}}>
  <div style={{maxWidth:1150,margin:"auto"}}>
   <h1 style={{fontSize:27,marginBottom:5}}>Radar Influx · Painel Comercial</h1>
   <p style={{color:"#586771",marginTop:0}}>Acesso restrito à VendaMais. Os perfis comerciais não alteram a devolutiva individual.</p>
   {!token?<form onSubmit={entrar} style={{maxWidth:400,background:"white",padding:25,borderRadius:16,display:"grid",gap:12,marginTop:25}}>
    <label>Senha administrativa<input type="password" required style={inp} value={senha} onChange={e=>setSenha(e.target.value)}/></label>
    <button style={btn} disabled={load}>Entrar</button>
   </form>:<>
    <div style={{display:"flex",gap:12,flexWrap:"wrap",alignItems:"center",margin:"23px 0"}}>
     <b>{rows.length} inscrições</b>
     <select style={{...inp,width:"auto"}} value={filter} onChange={e=>setFilter(e.target.value)}>
      {["Todos","Prioritário","Acompanhar","Nutrição"].map(x=><option key={x}>{x}</option>)}
     </select>
     <button style={btn} onClick={exportar}>Exportar CSV</button>
     <button style={{...btn,background:"#7AAB00"}} onClick={()=>atualizar(token)} disabled={load}>Atualizar</button>
     <button style={{...btn,background:"#727D84"}} onClick={()=>{setToken("");setRows([])}}>Sair</button>
    </div>
    <div style={{overflowX:"auto",borderRadius:14,background:"white",border:"1px solid #E2E4E4"}}>
     <table style={{borderCollapse:"collapse",minWidth:950,width:"100%",fontSize:13}}>
      <thead style={{background:"#102F55",color:"white"}}><tr>{["Participante","Cargo / unidade","Local","Equipe de vendas","Prioridade","3 dimensões (1–4)","E-mail","Autorização comercial"].map(x=><th key={x} style={{padding:12,textAlign:"left"}}>{x}</th>)}</tr></thead>
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
   {erro&&<p role="alert" style={{color:"#102F55",fontWeight:800}}>{erro}</p>}
  </div>
 </main>;
}
