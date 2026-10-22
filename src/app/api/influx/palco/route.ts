import {NextRequest,NextResponse} from "next/server";
import {COOKIE_PALCO,confirmarCredenciais,criarSessao,sessaoValida} from "@/lib/influx-palco-auth";
import {influxDb} from "@/lib/influx-db";
import {CAPACIDADES,DIMENSOES,avaliar} from "@/lib/influx";
export const runtime="nodejs";
export const dynamic="force-dynamic";
const headers={"Cache-Control":"private, no-store, max-age=0","X-Robots-Tag":"noindex, nofollow"};
const tentativas=new Map<string,{count:number,expires:number}>();
function naoAutorizado(){return NextResponse.json({error:"Acesso restrito."},{status:401,headers});}
function intervalo(ip:string){
 const now=Date.now(),current=tentativas.get(ip);
 if(!current||current.expires<now){tentativas.set(ip,{count:1,expires:now+15*60*1000});return false;}
 if(current.count>=8)return true;
 current.count++;return false;
}
export async function POST(req:NextRequest){
 try{
  if(Number(req.headers.get("content-length")||0)>4096)return NextResponse.json({error:"Requisição inválida."},{status:400,headers});
  const ip=(req.headers.get("x-forwarded-for")||"unknown").split(",")[0].trim();
  if(intervalo(ip))return NextResponse.json({error:"Muitas tentativas. Aguarde 15 minutos."},{status:429,headers});
  const body=await req.json();
  if(typeof body?.email!=="string"||typeof body?.senha!=="string"||body.email.length>256||body.senha.length>256)return naoAutorizado();
  if(!confirmarCredenciais(body.email,body.senha))return naoAutorizado();
  tentativas.delete(ip);
  const response=NextResponse.json({ok:true},{headers});
  response.cookies.set(COOKIE_PALCO,criarSessao(),{
   httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"strict",path:"/api/influx/palco",maxAge:8*60*60
  });
  return response;
 }catch(e){return NextResponse.json({error:"Não foi possível autenticar."},{status:400,headers});}
}
export async function DELETE(){
 const response=NextResponse.json({ok:true},{headers});
 response.cookies.set(COOKIE_PALCO,"",{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"strict",path:"/api/influx/palco",maxAge:0});
 return response;
}
export async function GET(req:NextRequest){
 if(!sessaoValida(req.cookies.get(COOKIE_PALCO)?.value))return naoAutorizado();
 const secret=process.env.INFLUX_ADMIN_SECRET;
 if(!secret)return NextResponse.json({error:"Painel não configurado."},{status:503,headers});
 try{
  const {data,error}=await influxDb().rpc("influx_admin_records",{p_secret:secret});
  if(error){console.error("palco_aggregate_rpc",error.code);return NextResponse.json({error:"Dados momentaneamente indisponíveis."},{status:503,headers});}
  const valid=(Array.isArray(data)?data:[]).map((p:any)=>{
   const a=p.respostas;
   try{return {ans:a,calc:avaliar(a)};}catch{return null;}
  }).filter((x):x is {ans:number[],calc:ReturnType<typeof avaliar>}=>!!x);
  const n=valid.length;
  const media=(values:number[])=>values.length?Math.round(values.reduce((a,b)=>a+b,0)/values.length*100)/100:null;
  const total=media(valid.map(p=>p.calc.total));
  const dims=DIMENSOES.map((label,i)=>({nome:label,media:media(valid.map(p=>p.calc.dims[i]))}));
  const praticas=CAPACIDADES.map((nome,i)=>({nome,dimensao:DIMENSOES[Math.floor(i/3)],media:media(valid.map(p=>p.ans[i]))}));
  const nivel=[1,2,3,4].map(i=>({nivel:i,total:valid.reduce((s,p)=>s+p.ans.filter(x=>x===i).length,0)}));
  return NextResponse.json({total:n,mediaGeral:total,dimensoes:dims,praticas,niveis:nivel,atualizadoEm:new Date().toISOString()},{headers});
 }catch(e){console.error("palco_aggregate_failure");return NextResponse.json({error:"Falha temporária na atualização."},{status:503,headers});}
}
