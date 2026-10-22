import {avaliar,DIMENSOES,PERGUNTAS,ACOES,textoResultado} from "./influx";
const escape=(v:string)=>String(v||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
export function emailInflux(nome:string,answers:number[],reportUrl:string):string{
 const a=avaliar(answers),t=textoResultado(nome,answers);
 const rows=a.dims.map((v,i)=>'<tr><td style="padding:10px 0;border-bottom:1px solid #EEE;"><b>'+escape(DIMENSOES[i])+'</b></td><td style="text-align:right;border-bottom:1px solid #EEE;">'+v.toFixed(1).replace(".",",")+' / 4</td></tr>').join("");
 return '<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"></head>'+
 '<body style="margin:0;padding:30px 12px;background:#F4F2ED;color:#1A2833;font-family:Arial,sans-serif">'+
 '<table role="presentation" cellspacing="0" cellpadding="0" style="max-width:600px;width:100%;margin:auto;background:white;border-radius:14px;overflow:hidden"><tr><td style="padding:26px 30px;background:#14232E;color:white"><b style="font-size:23px">VendaMais</b><p style="font-size:13px;color:#E6B269">Encontro de liderança • inFlux</p><h1 style="font-size:23px;margin:20px 0 0">Seu Perfil de Liderança</h1></td></tr>'+
 '<tr><td style="padding:30px"><p>Olá, <b>'+escape(nome.split(" ")[0])+'</b>.</p><p>Obrigado por participar do autodiagnóstico. Veja sua leitura inicial nas três dimensões da liderança:</p>'+
 '<table role="presentation" style="width:100%;border-collapse:collapse">'+rows+'</table>'+
 '<h2 style="font-size:18px;margin-top:30px">Sua fortaleza relativa</h2><p>'+escape(t.fort)+'</p>'+
 '<h2 style="font-size:18px">Sua oportunidade de evolução</h2><p>'+escape(t.gap)+'</p>'+
 '<div style="background:#F7F1E6;padding:20px;border-radius:12px"><b>Uma ação para começar</b><p>'+escape(t.passo)+'</p></div>'+
 '<p><a href="'+escape(reportUrl)+'" style="background:#B6273D;display:inline-block;color:white;padding:14px 18px;text-decoration:none;border-radius:8px"><b>Consultar minha devolutiva</b></a></p>'+
 '<p style="font-size:12px;line-height:1.55;color:#69747D">'+escape(t.ressalva)+'</p></td></tr>'+
 '<tr><td style="padding:19px 30px;background:#14232E;color:#D6DBDE;font-size:12px">Metodologia VendaMais de Desenvolvimento de Lideranças</td></tr></table></body></html>';
}
