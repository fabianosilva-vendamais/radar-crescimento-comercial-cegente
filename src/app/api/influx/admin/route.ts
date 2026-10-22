import {NextResponse} from "next/server";
import {timingSafeEqual} from "crypto";
import {influxDb} from "@/lib/influx-db";
import {avaliar,prioridadeComercial} from "@/lib/influx";
export const runtime="nodejs";export const dynamic="force-dynamic";
function permitido(req:Request){
 const secret=process.env.INFLUX_ADMIN_SECRET||"";
 const raw=(req.headers.get("authorization")||"").replace(/^Bearer\s+/i,"");
 const a=Buffer.from(secret),b=Buffer.from(raw);
 return !!secret && a.length===b.length && timingSafeEqual(a,b);
}
export async function GET(req:Request){
 if(!permitido(req))return NextResponse.json({error:"Acesso restrito."},{status:401});
 const {data,error}=await influxDb().rpc("influx_admin_records",{p_secret:process.env.INFLUX_ADMIN_SECRET});
 if(error){console.error("influx_admin_records",error.code);return NextResponse.json({error:"Falha ao consultar inscrições."},{status:503});}
 const records=(Array.isArray(data)?data:[]).map((p:any)=>{
  let dims:number[]=[];try{dims=avaliar(p.respostas).dims.map(x=>Math.round(x*100)/100);}catch{}
  const priority=prioridadeComercial(p.vend);
  return {...p,dimensoes:dims,prioridade:priority.classe,scoreFit:priority.fit,
    emailStatus:p.email_status||"fila",emailErro:p.email_erro||"",
    interesse:p.autoriza_contato?"Autorizou contato":"Sem autorização comercial",status:"Novo"};
 });
 return NextResponse.json({records},{headers:{"Cache-Control":"no-store"}});
}
