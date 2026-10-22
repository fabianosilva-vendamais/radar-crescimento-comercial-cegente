import {NextResponse} from "next/server";
import {supabaseAdmin} from "@/lib/supabase-server";
import {ORIGEM_INFLUX} from "@/lib/influx";
export const runtime="nodejs";export const dynamic="force-dynamic";
export async function GET(req:Request){
 const code=new URL(req.url).searchParams.get("code")?.toUpperCase().trim();
 if(!code||!/^LI-[A-Z2-9-]+$/.test(code))return NextResponse.json({error:"Código inválido."},{status:400});
 const db=supabaseAdmin();
 const {data:p}=await db.from("participantes").select("id,nome,codigo").eq("codigo",code).eq("origem",ORIGEM_INFLUX).maybeSingle();
 if(!p)return NextResponse.json({error:"Relatório não encontrado."},{status:404});
 const {data:a}=await db.from("respostas").select("valores").eq("participante_id",p.id).maybeSingle();
 if(!a||!Array.isArray(a.valores)||a.valores.length!==9)return NextResponse.json({error:"Respostas incompletas."},{status:404});
 return NextResponse.json({nome:p.nome,ans:a.valores},{headers:{"Cache-Control":"no-store"}});
}
