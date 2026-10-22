import {NextResponse} from "next/server";
import {supabaseAdmin,verifyAdmin,bearerFrom} from "@/lib/supabase-server";
import {ORIGEM_INFLUX,avaliar} from "@/lib/influx";
export const runtime="nodejs";export const dynamic="force-dynamic";
export async function GET(req:Request){
 if(!(await verifyAdmin(bearerFrom(req))))return NextResponse.json({error:"Acesso restrito."},{status:401});
 const db=supabaseAdmin();
 const {data:parts,error}=await db.from("participantes").select("id,created_at,nome,email,whats,cargo,empresa,cidade,uf,vend,interesse,origem").eq("origem",ORIGEM_INFLUX).order("created_at",{ascending:false}).limit(2000);
 if(error)return NextResponse.json({error:"Não foi possível consultar os participantes."},{status:500});
 const ids=(parts||[]).map(x=>x.id);
 if(!ids.length)return NextResponse.json({records:[]});
 const [{data:resps},{data:results},{data:emails},{data:acomp}]=await Promise.all([
  db.from("respostas").select("participante_id,valores").in("participante_id",ids),
  db.from("resultados").select("participante_id,lead_classe,lead_fit").in("participante_id",ids),
  db.from("emails").select("participante_id,status,last_err").in("participante_id",ids),
  db.from("acompanhamento").select("participante_id,status_comercial,contatado,observacao").in("participante_id",ids)
 ]);
 const map=(a:any[]|null|undefined)=>new Map((a||[]).map(x=>[x.participante_id,x]));
 const ra=map(resps),rr=map(results),ee=map(emails),aa=map(acomp);
 const records=(parts||[]).map(p=>{
  const values=ra.get(p.id)?.valores||[];
  let dimensoes:number[]=[];
  try{dimensoes=avaliar(values).dims.map(x=>Math.round(x*100)/100)}catch{}
  return {...p,dimensoes,respostas:values,prioridade:rr.get(p.id)?.lead_classe||"Acompanhar",
    scoreFit:rr.get(p.id)?.lead_fit||0,emailStatus:ee.get(p.id)?.status||"fila",
    emailErro:ee.get(p.id)?.last_err||"",status:aa.get(p.id)?.status_comercial||"Novo",
    contatado:!!aa.get(p.id)?.contatado,observacao:aa.get(p.id)?.observacao||""};
 });
 return NextResponse.json({records},{headers:{"Cache-Control":"no-store"}});
}
