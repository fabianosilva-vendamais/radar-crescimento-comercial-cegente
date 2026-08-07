"use client";

import { S } from "@/lib/style";
import { compute, DATA, score100, dim10, fmt10 } from "@/lib/radar-logic";

export type ResultProfile = {
  nome: string;
  empresa: string;
  cidade: string;
  uf: string;
  code: string;
  dia?: string;
  hora?: string;
};

type Props = {
  profile: ResultProfile;
  ans: any[];
  backLabel?: string;
  onBack?: () => void;
  demoBadge?: boolean;
  showStatus?: boolean;
  saveState?: "saving" | "saved";
  mailState?: "idle" | "fila" | "enviado" | "erro";
  mailEmail?: string;
  onResend?: () => void;
  onHome?: () => void;
};

export default function ResultView(props: Props) {
  const { profile: p, ans } = props;
  const R = compute(ans);
  const D: any = DATA;

  // Radar — 5 eixos (72°), raio proporcional à nota 0..10 da dimensão
  const cx = 190,
    cy = 160,
    r = 104;
  const pt = (i: number, k: number) => {
    const a = ((-90 + i * 72) * Math.PI) / 180;
    return [cx + r * k * Math.cos(a), cy + r * k * Math.sin(a)];
  };
  const frac = (score: number | null) => (score == null ? 0 : (score - 3) / 12);
  const radarRings = [0.25, 0.5, 0.75, 1].map((k) =>
    [0, 1, 2, 3, 4].map((i) => pt(i, k).map((n) => n.toFixed(1)).join(",")).join(" ")
  );
  const radarAxes = [0, 1, 2, 3, 4].map((i) => {
    const [x, y] = pt(i, 1);
    return { x: x.toFixed(1), y: y.toFixed(1) };
  });
  const radarPoly = R.dims.map((d: any, i: number) => pt(i, frac(d.score)).map((n) => n.toFixed(1)).join(",")).join(" ");
  const radarDots = R.dims.map((d: any, i: number) => {
    const [x, y] = pt(i, frac(d.score));
    return { x: x.toFixed(1), y: y.toFixed(1) };
  });
  const radarLabels = R.dims.map((d: any, i: number) => {
    const a = ((-90 + i * 72) * Math.PI) / 180;
    const lx = cx + (r + 18) * Math.cos(a),
      ly = cy + (r + 16) * Math.sin(a);
    const c = Math.cos(a);
    const mid = Math.abs(c) < 0.3;
    const yOff = i === 0 ? -14 : 0;
    return {
      lx: ((lx / 380) * 100).toFixed(2),
      ty: (((ly + yOff) / 330) * 100).toFixed(2),
      tx: mid ? "-50%" : c > 0 ? "0" : "-100%",
      ta: mid ? "center" : c > 0 ? "left" : "right",
      t: d.short,
      s: fmt10(dim10(d.score)),
    };
  });

  const rScore = score100(R.overall);
  const rClsName = R.cls ? R.cls.name : "Dados insuficientes";
  const rClsDesc = R.cls ? R.cls.desc : "";
  const rClsMsg = R.cls ? R.cls.msg : "";

  const rStrongName = R.strong ? R.strong.name : "—";
  const rStrongScore = R.strong ? fmt10(dim10(R.strong.score)) : "—";
  const rStrongTxt = R.strong ? D.dims[R.strong.i].strong : "";
  const rNextStep = R.cls ? D.nextSteps[R.cls.name] : "";
  const rDecision = R.prios && R.prios[0] ? R.prios[0].act : "";

  const mailState = props.mailState || "idle";
  const rSaveLine = props.saveState === "saving" ? "Salvando suas respostas…" : "Respostas salvas com sucesso ✓";
  const rSaveFg = props.saveState === "saving" ? "#B4841E" : "#1E7F4F";
  const rMailLine =
    mailState === "idle"
      ? "Preparando envio do e-mail…"
      : mailState === "fila"
      ? "E-mail na fila de envio…"
      : mailState === "erro"
      ? "Não foi possível enviar agora — toque em “Reenviar por e-mail”."
      : "E-mail enviado para " + (props.mailEmail || "") + " ✓";
  const rMailFg = mailState === "enviado" ? "#1E7F4F" : mailState === "erro" ? "#9A2B26" : "#B4841E";
  const rShowResend = mailState === "enviado" || mailState === "erro";

  const rDate = (p.dia || "") + (p.hora ? " · " + p.hora : "");

  return (
    <div data-screen-label="Resultado" style={S("max-width:620px;margin:0 auto;padding:24px 20px 56px;display:flex;flex-direction:column;gap:18px;")}>
      {props.backLabel ? (
        <button onClick={props.onBack} style={S("align-self:flex-start;background:none;border:none;font:600 15px Archivo;color:#C82A1E;cursor:pointer;padding:6px 0;")}>‹ {props.backLabel}</button>
      ) : null}
      {props.demoBadge ? (
        <div style={S("background:#EDEFF4;border:1px solid #BFC9DA;border-radius:10px;padding:10px 14px;font:600 13px Archivo;color:#334A66;")}>Exemplo com dados de demonstração</div>
      ) : null}
      <div style={S("display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;align-items:baseline;")}>
        <div>
          <div style={S("font:700 12px Archivo;letter-spacing:.12em;color:#C82A1E;text-transform:uppercase;")}>Radar de Crescimento Comercial</div>
          <h2 style={S("margin:4px 0 2px;font:800 24px Archivo;color:#16181D;")}>{p.nome}</h2>
          <div style={S("font:400 14px Archivo;color:#6B6F76;")}>{p.empresa} · {p.cidade}, {p.uf}</div>
        </div>
        {rDate ? <div style={S("text-align:right;font:400 12px/1.5 Archivo;color:#8A857A;")}>{rDate}</div> : null}
      </div>

      {/* Nota geral + classificação */}
      <div style={S("background:#16181D;border-radius:20px;padding:26px 22px;color:#fff;display:flex;flex-direction:column;gap:12px;")}>
        <div style={S("display:flex;align-items:baseline;gap:14px;flex-wrap:wrap;")}>
          <span style={S("font:800 60px/1 Archivo;letter-spacing:-.02em;")}>{rScore == null ? "—" : rScore}</span>
          <span style={S("font:400 15px Archivo;color:#B9BDC6;")}>de 100 pontos</span>
        </div>
        <div style={S("font:800 22px Archivo;color:#E8A44A;")}>{rClsName}</div>
        <p style={S("margin:0;font:400 15px/1.55 Archivo;color:#C9CCD3;")}>{rClsDesc}</p>
        <p style={S("margin:0;font:600 15px/1.55 Archivo;color:#fff;border-left:3px solid #C82A1E;padding-left:12px;")}>{rClsMsg}</p>
      </div>

      {props.showStatus ? (
        <div style={S("background:#fff;border:1px solid #E6E1D6;border-radius:14px;padding:14px 16px;display:flex;flex-direction:column;gap:8px;")}>
          <div style={S(`font:600 14px Archivo;color:${rSaveFg};`)}>{rSaveLine}</div>
          <div style={S("display:flex;align-items:center;gap:10px;flex-wrap:wrap;")}>
            <span style={S(`font:600 14px Archivo;color:${rMailFg};`)}>{rMailLine}</span>
            {rShowResend ? (
              <button onClick={props.onResend} style={S("padding:8px 14px;background:#EEEAE0;color:#C82A1E;border:none;border-radius:999px;font:600 13px Archivo;cursor:pointer;")}>Reenviar por e-mail</button>
            ) : null}
          </div>
        </div>
      ) : null}

      {/* Radar + leitura por dimensão (0 a 10) */}
      <div style={S("background:#fff;border:1px solid #E6E1D6;border-radius:20px;padding:20px;display:flex;flex-direction:column;gap:6px;align-items:center;")}>
        <div style={S("align-self:flex-start;font:700 13px Archivo;letter-spacing:.08em;text-transform:uppercase;color:#8A857A;")}>Radar das cinco dimensões</div>
        <div style={S("align-self:flex-start;font:400 13px Archivo;color:#8A857A;")}>Cada dimensão vale de 0 a 10.</div>
        <div style={S("position:relative;width:100%;max-width:400px;")}>
          <svg viewBox="0 0 380 330" style={S("width:100%;display:block;")}>
            {radarRings.map((rg: string, i: number) => (
              <polygon key={i} points={rg} style={S("fill:none;stroke:#E4DFD3;stroke-width:1;")} />
            ))}
            {radarAxes.map((ax: { x: string; y: string }, i: number) => (
              <line key={i} x1="190" y1="160" x2={ax.x} y2={ax.y} style={S("stroke:#E4DFD3;stroke-width:1;")} />
            ))}
            <polygon points={radarPoly} style={S("fill:rgba(200,42,30,.14);stroke:#C82A1E;stroke-width:2.5;stroke-linejoin:round;")} />
            {radarDots.map((d: { x: string; y: string }, i: number) => (
              <circle key={i} cx={d.x} cy={d.y} r="4" style={S("fill:#C82A1E;")} />
            ))}
          </svg>
          {radarLabels.map((lb: any, i: number) => (
            <div key={i} style={S(`position:absolute;left:${lb.lx}%;top:${lb.ty}%;transform:translate(${lb.tx},-50%);text-align:${lb.ta};white-space:nowrap;`)}>
              <div style={S("font:600 12px Archivo;color:#5A554B;")}>{lb.t}</div>
              <div style={S("font:800 14px Archivo;color:#16181D;")}>{lb.s}</div>
            </div>
          ))}
        </div>
        <div style={S("width:100%;display:flex;flex-direction:column;gap:16px;margin-top:6px;")}>
          {R.dims.map((d: any, i: number) => {
            const fg = d.band ? d.band.color : "#8A857A";
            const pct = d.score == null ? 0 : Math.round((dim10(d.score) as number) * 10);
            const txt = d.score == null ? "—" : fmt10(dim10(d.score)) + "/10 · " + d.band.label;
            return (
              <div key={i}>
                <div style={S("display:flex;justify-content:space-between;gap:8px;font:600 13px Archivo;color:#33363C;margin-bottom:4px;")}>
                  <span>{d.name}</span>
                  <span style={S(`white-space:nowrap;color:${fg};`)}>{txt}</span>
                </div>
                <div style={S("height:8px;background:#EFEAE0;border-radius:999px;overflow:hidden;")}>
                  <div style={S(`height:8px;border-radius:999px;background:${fg};width:${pct}%;`)} />
                </div>
                {d.reading ? <p style={S("margin:6px 0 0;font:400 13px/1.55 Archivo;color:#4C4F56;")}>{d.reading}</p> : null}
              </div>
            );
          })}
        </div>
      </div>

      {/* Onde você está mais forte */}
      <div style={S("background:#fff;border:1px solid #E6E1D6;border-radius:20px;padding:20px;display:flex;flex-direction:column;gap:8px;")}>
        <div style={S("font:700 13px Archivo;letter-spacing:.08em;text-transform:uppercase;color:#1E7F4F;")}>Onde você está mais forte</div>
        <div style={S("font:700 16px Archivo;color:#16181D;")}>{rStrongName} <span style={S("color:#1E7F4F;")}>— {rStrongScore}/10</span></div>
        <p style={S("margin:0;font:400 14px/1.55 Archivo;color:#4C4F56;")}>{rStrongTxt}</p>
      </div>

      {/* Diagnóstico central */}
      {R.rule ? (
        <div style={S("background:#fff;border:1px solid #E6E1D6;border-left:4px solid #C82A1E;border-radius:20px;padding:20px;display:flex;flex-direction:column;gap:8px;")}>
          <div style={S("font:700 13px Archivo;letter-spacing:.08em;text-transform:uppercase;color:#C82A1E;")}>Diagnóstico central</div>
          <div style={S("font:800 18px Archivo;color:#16181D;")}>{R.rule.title}</div>
          <p style={S("margin:0;font:400 15px/1.6 Archivo;color:#33363C;")}>{R.rule.msg}</p>
        </div>
      ) : null}

      {/* As três prioridades */}
      {R.prios && R.prios.length ? (
        <div style={S("display:flex;flex-direction:column;gap:12px;")}>
          <div>
            <div style={S("font:700 13px Archivo;letter-spacing:.08em;text-transform:uppercase;color:#8A857A;")}>Suas três prioridades</div>
            <div style={S("font:400 13px Archivo;color:#8A857A;margin-top:2px;")}>Os pontos que, resolvidos primeiro, destravam o restante.</div>
          </div>
          {R.prios.map((pr: any, i: number) => (
            <div key={i} style={S("background:#fff;border:1px solid #E6E1D6;border-radius:18px;padding:18px;display:flex;flex-direction:column;gap:10px;")}>
              <div style={S("display:flex;align-items:center;gap:10px;")}>
                <span style={S("flex:none;width:30px;height:30px;border-radius:50%;background:#16181D;color:#fff;font:800 15px/30px Archivo;text-align:center;")}>{pr.n}</span>
                <strong style={S("font:700 16px Archivo;color:#16181D;")}>{pr.dim}</strong>
                <span style={S("margin-left:auto;font:700 14px Archivo;color:#9A2B26;")}>{fmt10(dim10(pr.score))}/10</span>
              </div>
              <div>
                <span style={S("font:700 12px Archivo;letter-spacing:.06em;text-transform:uppercase;color:#8A857A;")}>O que identificamos</span>
                <br />
                <span style={S("font:400 14px/1.55 Archivo;color:#33363C;")}>{pr.prob}</span>
              </div>
              <div>
                <span style={S("font:700 12px Archivo;letter-spacing:.06em;text-transform:uppercase;color:#8A857A;")}>Por que isso trava o crescimento</span>
                <br />
                <span style={S("font:400 14px/1.55 Archivo;color:#33363C;")}>{pr.cons}</span>
              </div>
              <div style={S("background:#FBF1EA;border-radius:12px;padding:12px;")}>
                <span style={S("font:700 12px Archivo;letter-spacing:.06em;text-transform:uppercase;color:#C82A1E;")}>Por onde começar</span>
                <br />
                <span style={S("font:600 14px/1.55 Archivo;color:#16181D;")}>{pr.act}</span>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {/* Plano dos próximos 90 dias */}
      {R.plan && R.prios && R.prios.length ? (
        <div style={S("background:#fff;border:1px solid #E6E1D6;border-radius:20px;padding:20px;display:flex;flex-direction:column;gap:14px;")}>
          <div style={S("font:700 13px Archivo;letter-spacing:.08em;text-transform:uppercase;color:#8A857A;")}>Plano dos próximos 90 dias</div>
          {R.plan.map((ph: any, i: number) => (
            <div key={i} style={S("display:flex;gap:14px;")}>
              <div style={S("flex:none;width:4px;border-radius:4px;background:#C82A1E;")} />
              <div style={S("display:flex;flex-direction:column;gap:4px;")}>
                <strong style={S("font:700 15px Archivo;color:#16181D;")}>{ph.title}</strong>
                <span style={S("font:600 13px Archivo;color:#C82A1E;")}>{ph.goal}</span>
                <span style={S("font:400 14px/1.55 Archivo;color:#33363C;")}>{ph.act}</span>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {/* Uma decisão para começar */}
      {rDecision ? (
        <div style={S("background:#16181D;border-radius:20px;padding:22px;color:#fff;display:flex;flex-direction:column;gap:8px;")}>
          <div style={S("font:700 13px Archivo;letter-spacing:.08em;text-transform:uppercase;color:#E8A44A;")}>Uma decisão para começar</div>
          <p style={S("margin:0;font:400 14px/1.5 Archivo;color:#C9CCD3;")}>Se você escolher uma única ação para iniciar na próxima semana, comece por:</p>
          <p style={S("margin:0;font:700 16px/1.5 Archivo;color:#fff;")}>{rDecision}</p>
        </div>
      ) : null}

      {/* Próximo passo */}
      {rNextStep ? (
        <div style={S("background:#23405C;border-radius:20px;padding:22px;color:#fff;display:flex;flex-direction:column;gap:8px;")}>
          <div style={S("font:700 13px Archivo;letter-spacing:.08em;text-transform:uppercase;color:#9FC0E0;")}>Próximo passo</div>
          <p style={S("margin:0;font:400 15px/1.6 Archivo;color:#D6E1EC;")}>{rNextStep}</p>
        </div>
      ) : null}

      {props.onHome ? (
        <div style={S("border-top:1px solid #E6E1D6;padding-top:16px;text-align:center;")}>
          <a href="#" onClick={(e) => { e.preventDefault(); props.onHome?.(); }} style={S("font:600 14px Archivo;")}>Voltar ao início</a>
        </div>
      ) : null}
    </div>
  );
}
