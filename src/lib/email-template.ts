import { compute, DATA, score100, dim10, fmt10 } from "./radar-logic";

/**
 * Gera o HTML do e-mail da leitura do Radar de Crescimento Comercial.
 * Espelha a leitura completa da tela de resultado: nota 0..100, dimensões
 * 0..10 com leitura executiva, ponto mais forte, diagnóstico central, as
 * três prioridades, plano de 90 dias, decisão inicial e próximo passo.
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
  const overall = score100(R.overall);
  const overallTxt = overall == null ? "—" : String(overall);
  const clsName = R.cls ? R.cls.name : "Dados insuficientes";
  const clsDesc = R.cls ? R.cls.desc : "Não houve respostas válidas suficientes para calcular a leitura.";
  const clsMsg = R.cls ? R.cls.msg : "";
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
      const c = d.band ? d.band.color : "#8A857A";
      const w = d.score == null ? 0 : Math.max(0, Math.min(100, Math.round((dim10(d.score) as number) * 10)));
      const rest = 100 - w;
      const label = d.score == null ? "ND" : `${fmt10(dim10(d.score))}/10 · ${d.band.label}`;
      const barCell =
        w <= 0
          ? `<tr><td width="100%" style="font-size:1px;">&nbsp;</td></tr>`
          : rest <= 0
          ? `<tr><td width="100%" height="8" style="background-color:${c};border-radius:8px;font-size:1px;line-height:1px;">&nbsp;</td></tr>`
          : `<tr><td width="${w}%" height="8" style="background-color:${c};border-radius:8px;font-size:1px;line-height:1px;">&nbsp;</td><td width="${rest}%" style="font-size:1px;">&nbsp;</td></tr>`;
      const reading = d.reading
        ? `\n          <tr><td style="font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:19px;color:#6B6F76;padding-bottom:14px;">${esc(d.reading)}</td></tr>`
        : "";
      return `          <tr><td style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#33363C;padding-bottom:3px;">${esc(d.name)} <strong style="color:${c};">— ${esc(label)}</strong></td></tr>
          <tr><td style="padding-bottom:6px;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">${barCell}</table></td></tr>${reading}`;
    })
    .join("\n");

  const strongName = R.strong ? esc(R.strong.name) : "—";
  const strongScore = R.strong ? fmt10(dim10(R.strong.score)) : "—";
  const strongTxt = R.strong ? esc(D.dims[R.strong.i].strong) : "";

  const ruleBlock = R.rule
    ? `      <tr><td style="font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:bold;letter-spacing:1.5px;color:#C82A1E;text-transform:uppercase;padding:24px 0 10px;">Diagnóstico central</td></tr>
      <tr><td>
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"><tr>
          <td width="4" style="background-color:#C82A1E;border-radius:4px;font-size:1px;line-height:1px;">&nbsp;</td>
          <td width="16" style="font-size:1px;">&nbsp;</td>
          <td style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:21px;color:#33363C;"><strong style="font-size:16px;color:#16181D;">${esc(R.rule.title)}</strong><br>${esc(R.rule.msg)}</td>
        </tr></table>
      </td></tr>`
    : "";

  const prioRows = (R.prios || [])
    .map(
      (p: any, i: number) => `      <tr><td style="${i < 2 ? "padding-bottom:10px;" : ""}">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#FAF7F1;border-radius:10px;"><tr><td style="padding:16px 18px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:21px;color:#33363C;">
          <strong style="color:#16181D;">${p.n}. ${esc(p.dim)} (${fmt10(dim10(p.score))}/10)</strong><br>
          <strong>O que identificamos:</strong> ${esc(p.prob)}<br>
          <strong>Por que isso trava o crescimento:</strong> ${esc(p.cons)}<br>
          <strong style="color:#C82A1E;">Por onde começar:</strong> ${esc(p.act)}
        </td></tr></table>
      </td></tr>`
    )
    .join("\n");

  const planRows = (R.plan || [])
    .map(
      (ph: any, k: number) => `      <tr><td style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:21px;color:#33363C;${k < 2 ? "padding-bottom:10px;" : ""}">
        <strong style="color:#16181D;">${esc(ph.title)}</strong> — ${esc(ph.goal)}<br>${esc(ph.act)}
      </td></tr>`
    )
    .join("\n");

  const decision = R.prios && R.prios[0] ? esc(R.prios[0].act) : "";
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
<span style="display:none;font-size:1px;color:#EEEAE0;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${esc(clsName)} — ${overallTxt} de 100 pontos. Sua leitura completa: diagnóstico central, três prioridades e plano de 90 dias.</span>
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
      <td align="center" style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#9CA1AB;padding-top:8px;">VendaMais &nbsp;•&nbsp; Cegente</td>
    </tr></table>
  </td></tr>

  <!-- Corpo -->
  <tr><td style="background-color:#FFFFFF;padding:32px;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
      <tr><td style="font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:24px;color:#16181D;">
        Olá, <strong>${nome}</strong>.<br><br>
        Obrigado por responder o Radar de Crescimento Comercial. Esta é a sua leitura completa — guarde este e-mail para consultar quando quiser.
      </td></tr>

      <!-- Resultado geral -->
      <tr><td style="padding:20px 0;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#16181D;border-radius:12px;">
          <tr><td style="padding:22px 24px;" align="center">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
              <td align="center" style="font-family:Arial,Helvetica,sans-serif;font-size:44px;line-height:48px;font-weight:bold;color:#FFFFFF;">${overallTxt}<span style="font-size:16px;color:#B9BDC6;font-weight:normal;">/100</span></td>
            </tr><tr>
              <td align="center" style="font-family:Arial,Helvetica,sans-serif;font-size:19px;font-weight:bold;color:#E8A44A;padding-top:4px;">${esc(clsName)}</td>
            </tr><tr>
              <td align="center" style="font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:19px;color:#C9CCD3;padding-top:8px;">${esc(clsDesc)}</td>
            </tr><tr>
              <td align="center" style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#8A857A;padding-top:10px;">${local}</td>
            </tr></table>
          </td></tr>
        </table>
      </td></tr>

      ${clsMsg ? `<tr><td style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:22px;color:#33363C;padding-bottom:6px;"><strong>${esc(clsMsg)}</strong></td></tr>` : ""}

      <!-- Dimensões -->
      <tr><td style="font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:bold;letter-spacing:1.5px;color:#8A857A;text-transform:uppercase;padding:18px 0 12px;">Radar das cinco dimensões (0 a 10)</td></tr>
      <tr><td style="padding-bottom:6px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
${dimRows}
        </table>
      </td></tr>

      <!-- Onde você está mais forte -->
      <tr><td style="font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:bold;letter-spacing:1.5px;color:#1E7F4F;text-transform:uppercase;padding:18px 0 10px;">Onde você está mais forte</td></tr>
      <tr><td style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:21px;color:#33363C;">
        <strong style="color:#16181D;">${strongName} — ${strongScore}/10</strong><br>${strongTxt}
      </td></tr>

${ruleBlock}

      <!-- Prioridades -->
      <tr><td style="font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:bold;letter-spacing:1.5px;color:#8A857A;text-transform:uppercase;padding:24px 0 4px;">Suas três prioridades</td></tr>
      <tr><td style="font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:19px;color:#8A857A;padding-bottom:10px;">Os pontos que, resolvidos primeiro, destravam o restante.</td></tr>
${prioRows}

      <!-- Plano 90 dias -->
      <tr><td style="font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:bold;letter-spacing:1.5px;color:#8A857A;text-transform:uppercase;padding:24px 0 10px;">Plano dos próximos 90 dias</td></tr>
${planRows}

      <!-- Decisão -->
      ${decision ? `<tr><td style="padding:24px 0 0;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#16181D;border-radius:12px;"><tr><td style="padding:20px 22px;">
          <span style="font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:bold;letter-spacing:1.5px;color:#E8A44A;text-transform:uppercase;">Uma decisão para começar</span><br>
          <span style="font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:19px;color:#9CA1AB;">Se você escolher uma única ação para iniciar na próxima semana, comece por:</span><br><br>
          <span style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:22px;font-weight:bold;color:#FFFFFF;">${decision}</span>
        </td></tr></table>
      </td></tr>` : ""}

      <!-- Próximo passo -->
      ${nextStep ? `<tr><td style="padding:14px 0 0;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#23405C;border-radius:12px;"><tr><td style="padding:20px 22px;">
          <span style="font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:bold;letter-spacing:1.5px;color:#9FC0E0;text-transform:uppercase;">Próximo passo</span><br><br>
          <span style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:21px;color:#D6E1EC;">${nextStep}</span>
        </td></tr></table>
      </td></tr>` : ""}

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
        <strong style="color:#33363C;">VendaMais</strong> em parceria com <strong style="color:#33363C;">Cegente</strong>
      </td></tr>
    </table>
  </td></tr>

  <!-- Rodapé -->
  <tr><td style="background-color:#16181D;border-radius:0 0 16px 16px;padding:20px 32px;" align="center">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
      <td align="center" style="font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:17px;color:#9CA1AB;">
        Você recebeu este e-mail porque participou do Radar de Crescimento Comercial.<br>
        Evento VendaMais + Cegente
      </td>
    </tr></table>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}
