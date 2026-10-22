import {NextResponse,after} from "next/server";
import {influxDb} from "@/lib/influx-db";
import {genReportCode} from "@/lib/code";
import {queueSend} from "@/lib/mailer";
import {emailInflux} from "@/lib/influx-email";
import {FAIXAS,avaliar,type PerfilInflux} from "@/lib/influx";
export const runtime="nodejs";export const dynamic="force-dynamic";export const maxDuration=45;
const EMAIL_RE=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function bad(error:string,status=400){return NextResponse.json({error},{status});}
export async function POST(req:Request){
 let input:any;
 try{input=await req.json();}catch{return bad("Requisição inválida.");}
 const raw=input?.form||{};
 const str=(v:unknown,n:number)=>String(v??"").trim().slice(0,n);
 const p:PerfilInflux={
  nome:str(raw.nome,130),email:str(raw.email,220).toLowerCase(),whats:str(raw.whats,35),
  cargo:str(raw.cargo,130),empresa:str(raw.empresa,170),cidade:str(raw.cidade,130),
  uf:str(raw.uf,2).toUpperCase(),vend:str(raw.vend,60),consent:raw.consent===true
 };
 const ans=input?.ans;
 if(!p.nome||!p.cargo||!p.empresa||!p.cidade||p.whats.replace(/\D/g,"").length<7||!p.uf||!EMAIL_RE.test(p.email))return bad("Preencha todos os campos de identificação.");
 if(!/^[A-Z]{2}$/.test(p.uf))return bad("Estado inválido.");
 if(!FAIXAS.some(x=>x===p.vend))return bad("Selecione uma faixa de vendedores.");
 if(!p.consent)return bad("É necessário consentimento para receber o resultado.");
 try{avaliar(ans)}catch{return bad("Responda às nove afirmações na escala de 1 a 4.");}
 const code=genReportCode().replace(/^RC-/,"LI-");
 let db:ReturnType<typeof influxDb>;
 try{db=influxDb();}catch{return bad("Armazenamento temporariamente indisponível.",503);}
 const {error}=await db.rpc("influx_registrar",{
  p_codigo:code,
  p_respostas:ans,
  p_dados:{...p,autoriza_contato:input?.marketing===true}
 });
 if(error){console.error("influx_registrar",JSON.stringify({code:error.code,message:error.message}));return bad("Falha ao registrar o resultado. Tente novamente.",503);}
 after(async()=>{
  let status="erro",tries=0,err="";
  try{
   const url=new URL(req.url).origin+"/influx/r/"+encodeURIComponent(code);
   const send=await queueSend(p.email,"Seu Perfil de Liderança | VendaMais • inFlux",emailInflux(p.nome,ans,url));
   status=send.ok?"enviado":"erro";tries=send.tries;err=send.error;
  }catch(e:any){err=String(e?.message||"Falha no envio").slice(0,300);}
  const secret=process.env.INFLUX_ADMIN_SECRET;
  if(secret){
   try{const result=await db.rpc("influx_email_status",{p_codigo:code,p_secret:secret,p_status:status,p_tries:tries,p_error:err});
    if(result.error)console.error("influx_email_status",result.error.code);
   }catch(e:any){console.error("influx_email_status_unavailable",String(e?.message||"Erro"));}
  }
 });
 return NextResponse.json({code});
}
export async function GET(){
 const db=influxDb();
 const {error}=await db.rpc("influx_relatorio",{p_codigo:"LI-TESTE-NAO-EXISTE"});
 return NextResponse.json({ready:!error,code:error?.code||null},{headers:{"Cache-Control":"no-store"}});
}
