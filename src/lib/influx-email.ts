import {gerarLeitura,notaFormatada} from "./influx-report";
const esc=(x:unknown)=>String(x??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
const para=(s:string)=>'<p style="color:#1A3350;font-size:15px;line-height:1.65;margin:8px 0 15px">'+esc(s)+'</p>';
const titulo=(s:string)=>'<h2 style="font-size:20px;line-height:1.3;margin:26px 0 12px;color:#102F55">'+esc(s)+'</h2>';
export function emailInflux(nome:string,answers:number[],reportUrl:string):string{
 const r=gerarLeitura(answers);
 const mini=r.dimensoes.map(d=>'<tr><td style="padding:12px 0;border-bottom:1px solid #DDE5EC;color:#102F55;font-size:14px;font-weight:700">'+esc(d.nome)+'</td>'+
 '<td align="right" style="padding:12px 0;border-bottom:1px solid #DDE5EC;font-weight:700;color:#102F55;white-space:nowrap">'+notaFormatada(d.valor)+' / 4</td></tr>').join("");
 const prios=r.prioridades.map((p,i)=>
 '<div style="margin:14px 0;padding:19px 18px;border:1px solid #DDE5EC;background:'+(i===0?"#F1F8DE":"#F6F9FC")+';border-radius:12px">'+
 '<div style="font-size:12px;color:#39318A;font-weight:700">PRIORIDADE '+(i+1)+' · '+esc(p.dimensao)+' · NÍVEL '+p.nota+'</div>'+
 '<h3 style="font-size:18px;color:#102F55;margin:9px 0">'+esc(p.titulo)+'</h3>'+
 para(p.interpreta)+para("Por que importa: "+p.porque)+
 '<p style="line-height:1.6;font-size:14px"><b>Comece assim:</b> '+esc(p.acao)+'</p>'+
 '<p style="line-height:1.6;font-size:14px"><b>Observe se está evoluindo:</b> '+esc(p.evidencia)+'</p></div>').join("");
 const plano=r.plano.map(p=>'<tr><td style="padding:14px 0;border-bottom:1px solid #E2E8EE;vertical-align:top;width:90px;font-size:13px;font-weight:700;color:#39318A">'+esc(p.semana)+'</td><td style="padding:14px 0;border-bottom:1px solid #E2E8EE"><b style="color:#102F55">'+esc(p.titulo)+'</b>'+para(p.orientacao)+'</td></tr>').join("");
 const analise=r.dimensoes.map(d=>titulo(d.nome)+para(d.descricao)+para(d.orientacao)+
 '<table style="width:100%;border-collapse:collapse">'+d.itens.map(p=>'<tr><td style="padding:13px 0;border-top:1px solid #E1E7ED">'+
 '<strong style="color:#102F55">'+esc(p.titulo)+' · '+p.nota+'/4</strong>'+para(p.interpreta)+
 '<p style="font-size:13px;line-height:1.55;color:#536779;margin:7px 0"><b>Para praticar:</b> '+esc(p.acao)+'</p></td></tr>').join("")+'</table>').join("");
 return '<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>'+
 '<body style="background:#F2F6FA;padding:25px 12px;margin:0;font-family:Arial,Helvetica,sans-serif;color:#102F55">'+
 '<table role="presentation" cellspacing="0" cellpadding="0" style="max-width:640px;width:100%;margin:auto;background:white;border-radius:16px;overflow:hidden"><tr><td style="background:#102F55;padding:28px 26px;border-top:7px solid #BADA00">'+
 '<div style="font-weight:800;font-size:21px;color:#fff">VendaMais <span style="color:#BADA00">×</span> inFlux</div>'+
 '<p style="font-size:12px;color:#BADA00;letter-spacing:1px">AUTODIAGNÓSTICO DE LIDERANÇA</p>'+
 '<h1 style="color:#fff;font-size:27px;line-height:1.2;margin:16px 0 5px">Seu Perfil de Liderança</h1>'+
 '<p style="color:#E1EAF5;font-size:14px">Uma devolutiva que você pode colocar em prática</p></td></tr>'+
 '<tr><td style="padding:27px 25px">'+
 para("Olá, "+nome.trim().split(" ")[0]+". Você dedicou alguns minutos para avaliar sua liderança. Agora é hora de transformar essa reflexão em ações concretas.")+
 titulo("O que suas respostas mostram")+para(r.resumo)+para(r.resumoForte)+para(r.resumoEvolucao)+
 titulo("Suas três dimensões")+'<table style="border-collapse:collapse;width:100%">'+mini+'</table>'+
 titulo("Três prioridades para desenvolver")+para("Selecionamos uma prática de cada dimensão, respeitando as respostas em que você percebe menor autonomia.")+prios+
 titulo("Seu plano para as próximas quatro semanas")+'<table style="border-collapse:collapse;width:100%">'+plano+'</table>'+
 titulo("Como estão as nove práticas")+para("A seguir, uma interpretação de cada resposta e uma ação que pode ajudar a desenvolver aquela prática.")+analise+
 '<div style="background:#EAF1F6;border-radius:12px;padding:18px;margin-top:27px">'+
 '<h2 style="font-size:19px;margin:0 0 9px">Uma última reflexão</h2>'+
 para("O que você fará de maneira diferente na próxima conversa, reunião ou decisão? Escolha uma prática e observe o efeito.")+'</div>'+
 '<p align="center" style="margin-top:30px"><a href="'+esc(reportUrl)+'" style="display:inline-block;background:#102F55;color:#fff;text-decoration:none;font-weight:700;font-size:15px;padding:16px 23px;border-radius:9px">Ver minha devolutiva no celular</a></p>'+
 '<p style="font-size:12px;line-height:1.5;color:#687988;margin-top:25px">'+esc(r.ressalva)+'</p>'+
 '</td></tr><tr><td style="padding:20px 25px;background:#102F55;color:#EAF1F9;font-size:12px">Desenvolvimento de Lideranças · VendaMais | Evento inFlux</td></tr></table></body></html>';
}
