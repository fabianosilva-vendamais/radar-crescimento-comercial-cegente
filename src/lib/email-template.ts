import { compute, bandOf, DATA } from "./radar-logic";

/**
 * Gera o HTML do e-mail da leitura do Radar de Crescimento Comercial, preenchendo
 * dinamicamente: nome, nota (de 75), classificação, dimensões, ponto mais forte,
 * principal ponto de atenção, próximo passo e código do relatório.
 *
 * Todos os textos do diagnóstico (classificação, descrição, texto da dimensão
 * mais forte, recomendação do gargalo e próximo passo) vêm de radar-logic.ts e
 * são reproduzidos SEM alteração.
 */

type Profile = {
  nome: string;
  empresa: string;
  cidade: string;
  uf: string;
};

const esc = (s: any) =>
  String(s == null ? "" : s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

export function emailSubject(): string {
  return "Sua leitura do Radar de Crescimento Comercial está pronta";
}

export function renderEmail(profile: Profile, ans: any[], code: string, reportUrl: string): string {
  const R = compute(ans);
  const D: any = DATA;
  const nome = esc((profile.nome || "").split(" ")[0] || profile.nome || "");
  const overall = R.overall == null ? "—" : R.overall;
  const clsName = R.cls ? R.cls.name : "Dados insuficientes";
  const clsDesc = R.cls ? R.cls.desc : "Não houve respostas válidas suficientes para calcular a leitura.";
  const local = `${esc(profile.empresa)}, ${esc(profile.cidade)}/${esc(profile.uf)}`;

  // Dimensões — ordenadas da maior para a menor (estável)
  const dimsSorted = R.dims
    .map((d: any, i: number) => ({ ...d, order: i }))
    .sort((a: any, b: any) => {
      const av = a.score == null ? -1 : a.score;
      const bv = b.score == null ? -1 : b.score;
      if (bv !== av) return bv - av;
      return a.order - b.order;
    });

  const dimRows = dimsSorted
    .map((d: any) => {
      const c = d.score == null ? "#8A857A" : bandOf(d.score).color;
      const w = d.score == null ? 0 : Math.max(0, Math.min(100, Math.round((d.score / 15) * 100)));
      const rest = 100 - w;
      const label = d.score == null ? "ND" : d.score + "/15";
      const barCell =
        w <= 0
          ? `<tr><td width="100%" style="font-size:1px;">&nbsp;</td></tr>`
          : rest <= 0
          ? `<tr><td width="100%" height="8" style="background-color:${c};border-radius:8px;font-size:1px;line-height:1px;">&nbsp;</td></tr>`
          : `<tr><td width="${w}%" height="8" style="background-color:${c};border-radius:8px;font-size:1px;line-height:1px;">&nbsp;</td><td width="${rest}%" style="font-size:1px;">&nbsp;</td></tr>`;
      return `          <tr><td style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#33363C;padding-bottom:3px;">${esc(d.name)} <strong style="color:${c};">— ${label}</strong></td></tr>
          <tr><td style="padding-bottom:10px;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">${barCell}</table></td></tr>`;
    })
    .join("\n");

  const strongName = R.strong ? esc(R.strong.name) : "—";
  const strongScore = R.strong ? R.strong.score : "—";
  const strongTxt = R.strong ? esc(D.dims[R.strong.i].strong) : "";
  const gapName = R.gap ? esc(R.gap.name) : "—";
  const gapTxt = R.gap ? esc(D.dims[R.gap.i].rec) : "";
  const nextStep = R.cls ? esc(D.nextSteps[R.cls.name]) : "";

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light dark">
<title>Sua leitura do Radar de Crescimento Comercial está pronta</title>
</head>
<body style="margin:0;padding:0;background-color:#EEEAE0;">
<span style="display:none;font-size:1px;color:#EEEAE0;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${esc(clsName)} — ${overall} de 75 pontos. Sua leitura completa: onde você está mais forte, o principal ponto de atenção e o próximo passo.</span>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#EEEAE0;">
<tr><td align="center" style="padding:28px 12px;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;width:100%;">

  <!-- Cabeçalho -->
  <tr><td style="background-color:#16181D;border-radius:16px 16px 0 0;padding:26px 32px;" align="center">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
      <td align="center" style="font-family:Arial,Helvetica,sans-serif;font-size:12px;letter-spacing:3px;color:#E8A44A;text-transform:uppercase;font-weight:bold;">Evento VendaMais + Cegente</td>
    </tr><tr>
      <td align="center" style="font-family:Arial,Helvetica,sans-serif;font-size:22px;line-height:28px;color:#FFFFFF;font-weight:bold;padding-top:6px;">Radar de Crescimento<br>Comercial</td>
    </tr><tr>
      <td align="center" style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#9CA1AB;padding-top:8px;">VendaMais &nbsp;•&nbsp; Cegente &nbsp;•&nbsp; São José do Rio Preto</td>
    </tr></table>
  </td></tr>

  <!-- Corpo -->
  <tr><td style="background-color:#FFFFFF;padding:32px;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
      <tr><td style="font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:24px;color:#16181D;">
        Olá, <strong>${nome}</strong>.<br><br>
        Obrigado por participar do Radar de Crescimento Comercial. Esta é a sua leitura completa — guarde este e-mail para consultar quando quiser.
      </td></tr>

      <!-- Resultado geral -->
      <tr><td style="padding:20px 0;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#16181D;border-radius:12px;">
          <tr><td style="padding:22px 24px;" align="center">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
              <td align="center" style="font-family:Arial,Helvetica,sans-serif;font-size:44px;line-height:48px;font-weight:bold;color:#FFFFFF;">${overall}<span style="font-size:16px;color:#B9BDC6;font-weight:normal;">/75</span></td>
            </tr><tr>
              <td align="center" style="font-family:Arial,Helvetica,sans-serif;font-size:19px;font-weight:bold;color:#E8A44A;padding-top:4px;">${esc(clsName)}</td>
            </tr><tr>
              <td align="center" style="font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:19px;color:#C9CCD3;padding-top:8px;">${esc(clsDesc)}</td>
            </tr><tr>
              <td align="center" style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#8A857A;padding-top:10px;">Leitura ${esc(code)} &nbsp;•&nbsp; ${local}</td>
            </tr></table>
          </td></tr>
        </table>
      </td></tr>

      <!-- Dimensões -->
      <tr><td style="font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:bold;letter-spacing:1.5px;color:#8A857A;text-transform:uppercase;padding:4px 0 12px;">Radar das cinco dimensões</td></tr>
      <tr><td style="padding-bottom:6px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
${dimRows}
          <tr><td style="font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:16px;color:#8A857A;padding-top:4px;">Cada dimensão vale de 3 a 15. Verde: bem estruturada · Âmbar: em desenvolvimento · Vermelho: ponto crítico.</td></tr>
        </table>
      </td></tr>

      <!-- Onde você está mais forte -->
      <tr><td style="font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:bold;letter-spacing:1.5px;color:#1E7F4F;text-transform:uppercase;padding:24px 0 10px;">Onde você está mais forte</td></tr>
      <tr><td style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:21px;color:#33363C;">
        <strong style="color:#16181D;">${strongName} — ${strongScore}/15</strong><br>${strongTxt}
      </td></tr>

      <!-- Principal ponto de atenção -->
      <tr><td style="padding:24px 0 0;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#FBF1EA;border-radius:12px;"><tr><td style="padding:18px 20px;">
          <span style="font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:bold;letter-spacing:1px;color:#C82A1E;text-transform:uppercase;">Principal ponto de atenção: ${gapName}</span><br>
          <span style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:22px;color:#16181D;font-weight:bold;">${gapTxt}</span>
        </td></tr></table>
      </td></tr>

      <!-- Próximo passo -->
      <tr><td style="padding:20px 0 0;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#23405C;border-radius:12px;"><tr><td style="padding:20px 22px;">
          <span style="font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:bold;letter-spacing:1.5px;color:#9FC0E0;text-transform:uppercase;">Próximo passo</span><br><br>
          <span style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:22px;color:#D6E1EC;">${nextStep}</span>
        </td></tr></table>
      </td></tr>

      <!-- Botão -->
      <tr><td style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:21px;color:#6B6F76;padding:24px 0 16px;" align="center">
        Prefere ver a versão interativa, com o gráfico radar completo?
      </td></tr>
      <tr><td align="center" style="padding-bottom:26px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
          <td bgcolor="#C82A1E" style="border-radius:10px;mso-line-height-rule:exactly;">
            <a href="${esc(reportUrl)}" style="display:block;padding:15px 38px;font-family:Arial,Helvetica,sans-serif;font-size:16px;font-weight:bold;color:#FFFFFF;text-decoration:none;border-radius:10px;">Acessar minha leitura on-line</a>
          </td>
        </tr></table>
      </td></tr>

      <tr><td style="border-top:1px solid #E6E1D6;padding-top:20px;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:20px;color:#6B6F76;">
        Esta leitura é indicativa e foi construída a partir da sua percepção sobre a realidade atual da empresa.<br><br>
        Guarde o código <strong style="color:#16181D;">${esc(code)}</strong> para reabrir esta leitura quando quiser.<br><br>
        <strong style="color:#33363C;">VendaMais</strong> em parceria com <strong style="color:#33363C;">Cegente</strong>
      </td></tr>
    </table>
  </td></tr>

  <!-- Rodapé -->
  <tr><td style="background-color:#16181D;border-radius:0 0 16px 16px;padding:20px 32px;" align="center">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
      <td align="center" style="font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:17px;color:#9CA1AB;">
        Você recebeu este e-mail porque participou do Radar de Crescimento Comercial.<br>
        Evento VendaMais + Cegente &nbsp;•&nbsp; São José do Rio Preto
      </td>
    </tr></table>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}
