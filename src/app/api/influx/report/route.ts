import {NextResponse} from "next/server";
import {influxDb} from "@/lib/influx-db";
export const runtime="nodejs";export const dynamic="force-dynamic";
export async function GET(req:Request){
 const code=new URL(req.url).searchParams.get("code")?.toUpperCase().trim();
 if(!code||!/^LI-[A-Z0-9-]{20,75}$/.test(code))return NextResponse.json({error:"Código inválido."},{status:400});
 const {data,error}=await influxDb().rpc("influx_relatorio",{p_codigo:code});
 if(error){console.error("influx_relatorio",error.code,error.message);return NextResponse.json({error:"Consulta indisponível."},{status:503});}
 if(!data)return NextResponse.json({error:"Relatório não encontrado."},{status:404});
 return NextResponse.json(data,{headers:{"Cache-Control":"no-store"}});
}
