import {NextResponse,after} from "next/server";
import {supabaseAdmin} from "@/lib/supabase-server";
import {genReportCode} from "@/lib/code";
import {queueSend} from "@/lib/mailer";
import {emailInflux} from "@/lib/influx-email";
import {FAIXAS,ORIGEM_INFLUX,avaliar,prioridadeComercial,DIMENSOES, type PerfilInflux} from "@/lib/influx";
import {diaHora} from "@/lib/datetime";
export const runtime="nodejs";export const dynamic="force-dynamic";export const maxDuration=45;
const emailRE=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function bad(error:string,status=400){return NextResponse.json({error},{status});}
export async function POST(req:Request){
 let input:any;
 try{input=await req.json()}catch{return bad("Requisição inválida.");}
 const raw=input?.form||{};
 const str=(v:unknown,max:number)=>String(v??"").trim().slice(0,max);
 const p:PerfilInflux={
  nome:str(raw.nome,130),email:str(raw.email,220).toLowerCase(),whats:str(raw.whats,35),
  cargo:str(raw.cargo,130),empresa:str(raw.empresa,170),cidade:str(raw.cidade,130),
  uf:str(raw.uf,2).toUpperCase(),vend:str(raw.vend,60),consent:raw.consent===true
 };
 const ans=input?.ans;
 if(!p.nome||!p.cargo||!p.empresa||!p.cidade||!p.whats||!p.uf||!emailRE.test(p.email))return bad("Preencha todos os campos de identificação.");
 if(!/^[A-Z]{2}$/.test(p.uf))return bad("UF inválida.");
 if(!FAIXAS.some(x=>x===p.vend))return bad("Selecione uma faixa de equipe comercial.");
 if(!p.consent)return bad("É necessário autorizar o tratamento dos dados para participar.");
 let result:ReturnType<typeof avaliar>;
 try{result=avaliar(ans)}catch{return bad("Responda às nove afirmações com valores de 1 a 4.");}
 const {classe,fit}=prioridadeComercial(p.vend);
 const code=genReportCode().replace(/^RC-/,"LI-");
 const db=supabaseAdmin();
 const {data:part,error:pErr}=await db.from("participantes").insert({
  codigo:code,origem:ORIGEM_INFLUX,nome:p.nome,empresa:p.empresa,email:p.email,whats:p.whats,cidade:p.cidade,uf:p.uf,
  cargo:p.cargo,segmento:"Ensino de idiomas",vend:p.vend,unid:p.empresa,fat:"Não informado",
  obstaculo:"",interesse:"",tema:"",consent:true,completed:true
 }).select("id,created_at").single();
 if(pErr||!part){console.error("influx_participante",pErr?.code);return bad("Não foi possível salvar os dados. Tente novamente.",500);}
 const maior=Math.max(...result.dims),menor=Math.min(...result.dims);
 const fortes=result.dims.map((v,i)=>v===maior?DIMENSOES[i]:null).filter(Boolean).join(", ");
 const lacunas=result.dims.map((v,i)=>v===menor?DIMENSOES[i]:null).filter(Boolean).join(", ");
 const [{error:aErr},{error:rErr},{error:mErr},{error:cErr}]=await Promise.all([
  db.from("respostas").insert({participante_id:part.id,valores:ans}),
  db.from("resultados").insert({participante_id:part.id,overall:Math.round(result.total*10),classificacao:"Autopercepção de liderança",
   dim1:Math.round(result.dims[0]*10),dim2:Math.round(result.dims[1]*10),dim3:Math.round(result.dims[2]*10),
   dim4:null,dim5:null,forte:fortes,gargalo:lacunas,lead_classe:classe,lead_fit:fit}),
  db.from("emails").insert({participante_id:part.id,status:"fila",tries:0,last_date:"—",last_err:""}),
  db.from("acompanhamento").insert({participante_id:part.id,status_comercial:"Novo",contatado:false,observacao:""})
 ]);
 if(aErr||rErr||mErr||cErr){console.error("influx_save",aErr?.code,rErr?.code,mErr?.code,cErr?.code);return bad("O cadastro foi registrado, mas ocorreu uma falha na finalização. Solicite suporte.",500);}
 after(async()=>{
  const {dia,hora}=diaHora(part.created_at);
  try{
   const url=new URL(req.url).origin+"/influx/r/"+encodeURIComponent(code);
   const send=await queueSend(p.email,"Seu Perfil de Liderança | VendaMais • inFlux",emailInflux(p.nome,ans,url));
   await db.from("emails").update({status:send.ok?"enviado":"erro",tries:send.tries,last_date:dia+" "+hora,last_err:send.error,updated_at:new Date().toISOString()}).eq("participante_id",part.id);
  }catch(e:any){
   await db.from("emails").update({status:"erro",last_err:String(e?.message||"Falha SMTP").slice(0,400),updated_at:new Date().toISOString()}).eq("participante_id",part.id);
  }
 });
 return NextResponse.json({code});
}
