import {gerarLeitura,notaFormatada} from "./influx-report";

const esc=(x:unknown)=>String(x??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");

export function emailInflux(nome:string,answers:number[],reportUrl:string):string{
 const r=gerarLeitura(answers);
 const primeiro=nome.trim().split(" ")[0]||"Líder";
 const prioridade=r.prioridades[0];
 const dimensoes=r.dimensoes.map(d=>
  '<tr><td style="padding:12px 0;border-bottom:1px solid #E0E7EE;color:#102F55;font-size:15px;font-weight:700">'+esc(d.nome)+'</td>'+
  '<td align="right" style="padding:12px 0;border-bottom:1px solid #E0E7EE;white-space:nowrap;font-size:15px;font-weight:700;color:#102F55">'+notaFormatada(d.valor)+' / 4</td></tr>'
 ).join("");
 const subtitulo=(s:string)=>'<h2 style="font-size:19px;line-height:1.3;color:#102F55;margin:23px 0 10px">'+esc(s)+'</h2>';
 const texto=(s:string)=>'<p style="font-size:14px;line-height:1.6;color:#19324D;margin:6px 0 12px">'+esc(s)+'</p>';
 return '<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>'+
 '<body style="background:#F3F6F9;padding:20px 12px;margin:0;font-family:Arial,Helvetica,sans-serif;color:#19324D">'+
 '<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;max-width:640px;margin:auto;background:#fff;border-radius:16px;overflow:hidden"><tr><td style="background:#102F55;padding:25px 23px;border-top:7px solid #BADA00">'+
 '<div style="font-size:19px;color:#fff;font-weight:800">VendaMais <span style="color:#BADA00">×</span> inFlux</div>'+
 '<div style="font-size:12px;color:#BADA00;letter-spacing:1px;margin-top:10px">DESENVOLVIMENTO DE LIDERANÇAS</div>'+
 '<h1 style="font-size:27px;color:#fff;line-height:1.2;margin:12px 0 6px">Seu Perfil de Liderança</h1></td></tr>'+
 '<tr><td style="padding:25px 23px">'+
 texto("Olá, "+primeiro+"! Suas respostas oferecem uma primeira visão de como você percebe sua atuação nas três dimensões da liderança.")+
 subtitulo("Suas dimensões da liderança")+
 '<p style="font-size:12px;color:#54677A">Média de cada dimensão, na escala de 1 a 4.</p>'+
 '<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse">'+dimensoes+'</table>'+
 subtitulo("Sua principal fortaleza")+texto(r.resumoForte)+
 subtitulo("Sua oportunidade de evolução")+texto(r.resumoEvolucao)+
 '<div style="background:#F1F6E5;border:1px solid #DCE8C1;padding:17px 15px;margin:20px 0;border-radius:12px">'+
 '<div style="color:#102F55;font-size:12px;letter-spacing:1px;font-weight:800">SUA PRIMEIRA AÇÃO</div>'+
 '<h3 style="font-size:17px;color:#102F55;margin:10px 0 7px">'+esc(prioridade.titulo)+'</h3>'+
 texto(prioridade.acao)+'</div>'+
 '<p align="center" style="margin:25px 0"><a href="'+esc(reportUrl)+'" style="display:inline-block;background:#102F55;color:#fff;text-decoration:none;font-weight:700;font-size:14px;padding:14px 21px;border-radius:9px">Ver minha devolutiva online</a></p>'+
 '<p style="font-size:12px;line-height:1.55;color:#54677A">Este resultado reflete sua autopercepção em nove afirmações. É uma análise inicial, não uma avaliação completa de competências.</p>'+
 '</td></tr><tr><td style="background:#102F55;color:#EAF1F9;padding:17px 23px;font-size:12px">Desenvolvimento de Lideranças · VendaMais | Evento inFlux</td></tr></table></body></html>';
}
