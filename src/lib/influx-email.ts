import {gerarDevolutiva,notaFormatada} from "./influx-devolutiva";

const esc=(x:unknown)=>String(x??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
const p=(s:string)=>'<p style="font-size:14px;line-height:1.6;color:#19324D;margin:7px 0 13px">'+esc(s)+'</p>';
const h=(s:string)=>'<h2 style="font-size:20px;line-height:1.35;color:#102F55;margin:25px 0 11px">'+esc(s)+'</h2>';
export function emailInflux(nome:string,answers:number[],reportUrl:string):string{
 const r=gerarDevolutiva(answers);
 const primeiro=nome.trim().split(" ")[0]||"Líder";
 const dims=r.dimensoes.map(d=>
  '<tr><td style="padding:16px 0;border-top:1px solid #E0E7EE">'+
  '<div style="color:#102F55;font-size:15px;font-weight:800">'+esc(d.nome)+' <span style="white-space:nowrap;float:right">'+notaFormatada(d.nota)+' / 4</span></div>'+
  p(d.leitura)+'</td></tr>'
 ).join("");
 const passos=r.plano.map((item,i)=>
  '<div style="margin:14px 0;padding:15px;border-left:4px solid #BADA00;background:#F5F8EF">'+
  '<div style="font-size:12px;font-weight:800;color:#506578">'+esc(item.quando)+' · '+esc(item.dimensao)+'</div>'+
  '<h3 style="font-size:16px;line-height:1.4;color:#102F55;margin:6px 0">'+esc((i+1)+". "+item.titulo)+'</h3>'+
  p(item.acao)+'<p style="font-size:12px;line-height:1.5;color:#506578;margin:0"><b>Observe:</b> '+esc(item.indicador)+'</p></div>'
 ).join("");
 return '<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>'+
 '<body style="margin:0;padding:19px 10px;background:#F3F6F9;font-family:Arial,Helvetica,sans-serif;color:#19324D">'+
 '<table role="presentation" cellspacing="0" cellpadding="0" style="max-width:650px;width:100%;margin:auto;background:#fff;border-radius:14px;overflow:hidden"><tr><td style="background:#102F55;border-top:7px solid #BADA00;padding:25px 23px">'+
 '<div style="color:#BADA00;font-size:12px;font-weight:800;letter-spacing:1px">VENDAMAIS · DESENVOLVIMENTO DE LIDERANÇAS</div>'+
 '<h1 style="font-size:28px;line-height:1.2;color:#fff;margin:13px 0 5px">Seu Perfil de Liderança</h1></td></tr>'+
 '<tr><td style="padding:25px 23px">'+
 p("Olá, "+primeiro+"! Suas respostas mostram como você percebe sua atuação e sugerem passos concretos para avançar.")+
 h("O que suas respostas revelam")+p(r.visaoGeral)+
 h("Suas três dimensões")+
 '<p style="font-size:12px;color:#506578">Média de 1 a 4, com leitura baseada nas três práticas de cada dimensão.</p>'+
 '<table role="presentation" cellspacing="0" cellpadding="0" style="width:100%;border-collapse:collapse">'+dims+'</table>'+
 h(r.tituloForca)+p(r.textoForca)+
 h("Onde concentrar sua evolução")+p(r.oportunidade)+
 h("Seu roteiro para os próximos 15 dias")+
 p("Três ações pequenas, uma em cada dimensão. Teste na rotina e observe o que muda.")+passos+
 h("Como acompanhar sua evolução")+p(r.desafioFinal)+
 '<p style="text-align:center;margin:29px 0"><a href="'+esc(reportUrl)+'" style="background:#102F55;color:#fff;padding:14px 20px;border-radius:9px;font-weight:700;text-decoration:none;display:inline-block">Abrir minha devolutiva online</a></p>'+
 '<p style="color:#506578;font-size:12px;line-height:1.55">'+esc(r.ressalva)+'</p>'+
 '</td></tr><tr><td style="background:#102F55;padding:17px 23px;font-size:12px;color:#EDF4FC">Metodologia de Desenvolvimento de Lideranças · VendaMais | Evento inFlux</td></tr></table></body></html>';
}
