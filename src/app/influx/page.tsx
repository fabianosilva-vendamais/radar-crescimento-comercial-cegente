"use client";
import {useState} from "react";
import {PERGUNTAS,ESCALA,EXEMPLOS,FAIXAS,type PerfilInflux} from "@/lib/influx";
import {InfluxBrand} from "@/components/InfluxBrand";
import {InfluxResultado} from "@/components/InfluxResultado";
const estados=["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];
const inp:React.CSSProperties={width:"100%",boxSizing:"border-box",padding:"14px",fontSize:15,border:"1px solid #D5DADD",background:"#fff",borderRadius:12,color:"#173552"};
const btn:React.CSSProperties={width:"100%",border:0,borderRadius:12,padding:"16px 18px",background:"#BADA00",color:"#102F55",fontWeight:900,fontSize:15,cursor:"pointer"};
const box:React.CSSProperties={background:"white",borderRadius:22,padding:24,boxShadow:"0 12px 40px #12283612",border:"1px solid #E6E2DA"};
const initial:PerfilInflux={nome:"",email:"",whats:"",cargo:"",empresa:"",cidade:"",uf:"",vend:"",consent:false};
const fieldLabel:React.CSSProperties={display:"block",fontSize:13,fontWeight:700,marginBottom:6};
function Field({label,children}:{label:string;children:React.ReactNode}){return <label><span style={fieldLabel}>{label}</span>{children}</label>}
export default function InfluxPage(){
 const [form,setForm]=useState<PerfilInflux>(initial);
 const [step,setStep]=useState<"cadastro"|"questoes"|"resultado">("cadastro");
 const [idx,setIdx]=useState(0),[answers,setAnswers]=useState<number[]>(Array(9).fill(0));
 const [busy,setBusy]=useState(false),[error,setError]=useState(""),[code,setCode]=useState("");
 const [marketing,setMarketing]=useState(false);
 const set=(k:keyof PerfilInflux,v:string|boolean)=>setForm(p=>({...p,[k]:v}));
 const begin=(e:React.FormEvent)=>{e.preventDefault();if(!form.consent){setError("Confirme seu consentimento.");return;}setError("");setStep("questoes");window.scrollTo(0,0)};
 const next=async()=>{
  if(!answers[idx]){setError("Selecione uma alternativa.");return;}setError("");
  if(idx<8){setIdx(i=>i+1);window.scrollTo(0,0);return;}
  setBusy(true);
  try{
   const res=await fetch("/api/influx/submit",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({form,ans:answers,marketing})});
   const data=await res.json();if(!res.ok)throw new Error(data.error||"Não foi possível salvar o resultado.");
   setCode(data.code);setStep("resultado");window.scrollTo(0,0);
  }catch(e:any){setError(e?.message||"Falha na conexão. Tente novamente.");}
  finally{setBusy(false);}
 };
 return <main style={{minHeight:"100vh",background:"#F3F6F9",fontFamily:"Archivo,Arial,sans-serif",color:"#173552"}}>
  <InfluxBrand/>
  <div style={{maxWidth:670,margin:"auto",padding:"30px 16px 65px"}}>
   {step!=="resultado"&&<div style={{marginBottom:18}}>
    <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"#536C7F",fontWeight:800,marginBottom:9}}>
     <span>{step==="cadastro"?"CADASTRO":"AFIRMAÇÃO "+String(idx+1)+" DE 9"}</span><span>{step==="cadastro"?"0":String(Math.round((idx+1)/9*100))}%</span>
    </div>
    <div style={{height:6,borderRadius:6,background:"#DDE6EE",overflow:"hidden"}}><div style={{height:6,width:(step==="cadastro"?0:(idx+1)/9*100)+"%",background:"#BADA00"}}/></div>
   </div>}
   {step==="cadastro"&&<section style={box}>
    <div style={{fontWeight:900,color:"#102F55",letterSpacing:1.2,fontSize:12}}>EXPERIÊNCIA DE LIDERANÇA · INFLUX + VENDAMAIS</div>
    <h1 style={{fontSize:31,lineHeight:1.2,margin:"10px 0 14px"}}>Como está sua liderança hoje?</h1>
    <p style={{fontSize:15,color:"#536C7F",lineHeight:1.55,marginBottom:25}}>Em poucos minutos, descubra como você percebe nove práticas essenciais de liderança. Ao final, receba uma devolutiva objetiva com suas fortalezas, oportunidades de evolução e uma ação prática para começar.</p>
    <form onSubmit={begin} style={{display:"grid",gap:15}}>
     <Field label="Nome completo *"><input style={inp} required autoComplete="name" value={form.nome} onChange={e=>set("nome",e.target.value)}/></Field>
     <Field label="E-mail *"><input style={inp} type="email" required autoComplete="email" value={form.email} onChange={e=>set("email",e.target.value)}/></Field>
     <Field label="WhatsApp com DDD *"><input style={inp} type="tel" required autoComplete="tel" value={form.whats} onChange={e=>set("whats",e.target.value)}/></Field>
     <Field label="Cargo *"><input style={inp} required placeholder="Ex.: franqueado, gestor, diretor" value={form.cargo} onChange={e=>set("cargo",e.target.value)}/></Field>
     <Field label="Empresa / unidade *"><input style={inp} required placeholder="Ex.: inFlux — Centro" value={form.empresa} onChange={e=>set("empresa",e.target.value)}/></Field>
     <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:12}}>
      <Field label="Cidade *"><input style={inp} required value={form.cidade} onChange={e=>set("cidade",e.target.value)}/></Field>
      <Field label="UF *"><select required style={inp} value={form.uf} onChange={e=>set("uf",e.target.value)}><option value="">UF</option>{estados.map(x=><option key={x}>{x}</option>)}</select></Field>
     </div>
     <Field label="Quantas pessoas atuam diretamente em vendas na sua operação? *"><select required style={inp} value={form.vend} onChange={e=>set("vend",e.target.value)}><option value="">Selecione uma faixa</option>{FAIXAS.map(x=><option key={x} value={x}>{x==="Não tenho equipe comercial"?x:x+" vendedores"}</option>)}</select></Field>
     <label style={{display:"flex",gap:10,fontSize:12,lineHeight:1.55,color:"#53626D",alignItems:"flex-start"}}>
      <input type="checkbox" required checked={form.consent} onChange={e=>set("consent",e.target.checked)} style={{marginTop:3,width:17,height:17,flexShrink:0}}/>
      <span>Autorizo a VendaMais a tratar minhas informações e respostas para produzir e enviar o resultado desta autoavaliação.</span>
     </label>
     <label style={{display:"flex",gap:10,fontSize:12,lineHeight:1.55,color:"#53626D",alignItems:"flex-start"}}><input type="checkbox" checked={marketing} onChange={e=>setMarketing(e.target.checked)} style={{marginTop:3,width:17,height:17,flexShrink:0}}/><span>Também autorizo receber contato da VendaMais sobre programas de desenvolvimento e soluções comerciais (opcional).</span></label>
     {error&&<p role="alert" style={{margin:0,color:"#102F55",fontWeight:700}}>{error}</p>}
     <button style={btn} type="submit">Começar avaliação →</button>
    </form>
   </section>}
   {step==="questoes"&&<section style={box}>
    <h1 style={{fontSize:23,lineHeight:1.4,margin:"0 0 25px"}}>{PERGUNTAS[idx]}</h1>
    <p style={{fontSize:13,color:"#536C7F",lineHeight:1.55,background:"#EFF4F7",padding:"11px 12px",borderRadius:10}}>Para ajudar a responder: {EXEMPLOS[idx]} Escolha o nível mais próximo da sua prática habitual.</p>
    <div style={{display:"grid",gap:10}}>
     {ESCALA.map((v,i)=><button type="button" key={i} aria-pressed={answers[idx]===i+1} onClick={()=>{setAnswers(a=>a.map((n,k)=>k===idx?i+1:n));setError("");}} style={{display:"flex",alignItems:"center",textAlign:"left",gap:13,border:answers[idx]===i+1?"2px solid #87A900":"1px solid #D9DEE0",background:answers[idx]===i+1?"#F1F8DF":"white",borderRadius:13,padding:13,cursor:"pointer",font:"inherit",fontSize:14,color:"#163452",lineHeight:1.45}}>
      <b style={{borderRadius:8,padding:"9px 12px",background:answers[idx]===i+1?"#102F55":"#E8EFF5",color:answers[idx]===i+1?"#BADA00":"#163452"}}>{i+1}</b><span style={{display:"block"}}><strong style={{fontSize:15,display:"block",color:"#102F55",marginBottom:3}}>{v.split("|")[0].trim()}</strong><span style={{fontSize:13,color:"#526778",lineHeight:1.45}}>{v.split("|")[1].trim()}</span></span>
     </button>)}
    </div>
    {error&&<p role="alert" style={{color:"#102F55",fontSize:13}}>{error}</p>}
    <div style={{display:"grid",gridTemplateColumns:"1fr 2fr",gap:10,marginTop:23}}>
     <button type="button" onClick={()=>{if(idx===0)setStep("cadastro");else setIdx(n=>n-1);setError("");}} style={{...btn,background:"#E7EDF2",color:"#102F55"}}>Voltar</button>
     <button type="button" disabled={busy||!answers[idx]} onClick={next} style={{...btn,opacity:busy?.55:1}}>{busy?"Salvando…":idx===8?"Ver minha análise →":"Próxima →"}</button>
    </div>
   </section>}
   {step==="resultado"&&<><InfluxResultado nome={form.nome} ans={answers}/><p style={{fontWeight:700,color:"#315D73",textAlign:"center"}}>Sua análise está pronta. Ela também foi preparada para envio por e-mail.</p><p style={{fontSize:12,color:"#6C7680",textAlign:"center"}}>Código do relatório: {code}</p></>}
   <p style={{textAlign:"center",fontSize:12,color:"#77818A",marginTop:25}}>Metodologia VendaMais de Desenvolvimento de Lideranças • Evento inFlux</p>
  </div>
 </main>;
}
