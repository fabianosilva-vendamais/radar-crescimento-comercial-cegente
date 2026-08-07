"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { S } from "@/lib/style";
import { DATA, bandOf, score100, dim10, fmt10 } from "@/lib/radar-logic";

const D: any = DATA;

export default function TelaoPage() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const r = await fetch("/api/telao", { cache: "no-store" });
        const d = await r.json();
        if (alive) {
          setStats(d);
          setLoaded(true);
        }
      } catch {
        if (alive) setLoaded(true);
      }
    }
    load();
    const t = setInterval(load, 15000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, []);

  const count = stats?.total ?? 0;
  const ready = !!stats?.ready;

  const live = useMemo(() => {
    if (!ready || !stats) return null;
    // avg_overall e dims chegam nas somas brutas (15..75 / 3..15) e são
    // convertidos para a escala de exibição (0..100 / 0..10).
    const rawAvg = stats.avg_overall;
    const liveAvg = score100(rawAvg);
    const cls = D.classes.find((c: any) => rawAvg >= c.min && rawAvg <= c.max) || D.classes[0];
    const dimVals: number[] = stats.dims || [];
    const dimAvgs = D.dims.map((d: any, i: number) => ({ name: d.name, score: dimVals[i] == null ? 0 : dimVals[i] }));
    const enrich = (d: any) => {
      const b = bandOf(d.score);
      return { ...d, disp: fmt10(dim10(d.score)), pct: Math.round((dim10(d.score) as number) * 10), color: b.color, label: b.label };
    };
    const sorted = [...dimAvgs].sort((a, b) => b.score - a.score);
    const temas = (stats.temas || []).slice(0, 4).map((t: any) => ({ pct: Math.round((t.n / count) * 100), label: t.label }));
    return {
      liveAvg,
      liveStage: cls.name,
      liveGap: stats.gap || "—",
      liveDims: sorted.map(enrich),
      liveForces: sorted.slice(0, 2).map(enrich),
      liveDiffs: sorted.slice(-2).reverse().map(enrich),
      liveTemas: temas,
    };
  }, [stats, ready, count]);

  return (
    <div data-screen-label="Painel do evento" style={S("min-height:100vh;background:#101318;color:#fff;padding:28px 24px 40px;")}>
      <div style={S("max-width:1240px;margin:0 auto;display:flex;flex-direction:column;gap:22px;")}>
        <div style={S("display:flex;align-items:center;gap:16px;flex-wrap:wrap;")}>
          <div>
            <div style={S("font:700 12px Archivo;letter-spacing:.16em;color:#E8A44A;text-transform:uppercase;")}>VendaMais + Cegente · Panorama ao vivo</div>
            <h2 style={S("margin:4px 0 0;font:800 30px Archivo;")}>Radar de Crescimento Comercial</h2>
          </div>
          <div style={S("margin-left:auto;display:flex;align-items:center;gap:12px;")}>
            <button onClick={() => router.push("/")} style={S("padding:9px 14px;border-radius:999px;font:600 13px Archivo;cursor:pointer;border:1px solid #3A3E47;background:transparent;color:#C9CCD3;")}>Sair do telão</button>
          </div>
        </div>

        {loaded && !ready && (
          <div style={S("border:1px dashed #3A3E47;border-radius:20px;padding:70px 30px;text-align:center;display:flex;flex-direction:column;gap:10px;")}>
            <div style={S("font:800 40px Archivo;color:#E8A44A;")}>{count}</div>
            <div style={S("font:600 18px Archivo;color:#C9CCD3;")}>respostas recebidas até agora</div>
            <div style={S("font:400 15px/1.5 Archivo;color:#7C818B;")}>Os indicadores agregados aparecem a partir de 10 respostas, para preservar o anonimato dos participantes.</div>
          </div>
        )}

        {ready && live && (
          <>
            <div style={S("display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px;")}>
              <div style={S("background:#181C23;border:1px solid #262B34;border-radius:20px;padding:24px;display:flex;flex-direction:column;gap:8px;justify-content:center;")}>
                <div style={S("font:800 64px/1 Archivo;color:#E8A44A;")}>{count}</div>
                <div style={S("font:600 17px Archivo;color:#C9CCD3;")}>diagnósticos respondidos</div>
                <div style={S("font:400 14px Archivo;color:#7C818B;")}>Nota média do grupo: <strong style={S("color:#fff;")}>{live.liveAvg}</strong> / 100</div>
                <div style={S("border-top:1px solid #262B34;padding-top:10px;")}>
                  <div style={S("font:700 11px Archivo;letter-spacing:.1em;text-transform:uppercase;color:#7C818B;")}>Estágio médio do grupo</div>
                  <div style={S("font:800 20px Archivo;color:#E8A44A;margin-top:2px;")}>{live.liveStage}</div>
                </div>
                <div style={S("font:400 14px Archivo;color:#7C818B;")}>Gargalo mais comum:<br /><strong style={S("color:#fff;font-size:16px;")}>{live.liveGap}</strong></div>
              </div>
              <div style={S("background:#181C23;border:1px solid #262B34;border-radius:20px;padding:24px;display:flex;flex-direction:column;gap:11px;")}>
                <div style={S("font:700 12px Archivo;letter-spacing:.1em;text-transform:uppercase;color:#7C818B;")}>As cinco dimensões, da mais forte à mais fraca</div>
                {live.liveDims.map((d: any, i: number) => (
                  <div key={i}>
                    <div style={S("display:flex;justify-content:space-between;gap:8px;font:600 15px Archivo;margin-bottom:4px;")}>
                      <span>{d.name}</span>
                      <span style={S(`white-space:nowrap;color:${d.color};`)}>{d.disp} · {d.label}</span>
                    </div>
                    <div style={S("height:9px;background:#262B34;border-radius:999px;overflow:hidden;")}>
                      <div style={S(`height:9px;border-radius:999px;background:${d.color};width:${d.pct}%;`)} />
                    </div>
                  </div>
                ))}
                <div style={S("font:400 12px/1.6 Archivo;color:#7C818B;border-top:1px solid #262B34;padding-top:8px;")}>Cada dimensão vale de 0 a 10. Verde: bem estruturada · Âmbar: em desenvolvimento · Vermelho: ponto crítico.</div>
              </div>
              <div style={S("display:flex;flex-direction:column;gap:16px;")}>
                <div style={S("background:#181C23;border:1px solid #262B34;border-radius:20px;padding:20px;display:flex;flex-direction:column;gap:10px;")}>
                  <div style={S("font:700 12px Archivo;letter-spacing:.1em;text-transform:uppercase;color:#4FA46F;")}>Maiores forças do grupo</div>
                  {live.liveForces.map((f: any, i: number) => (
                    <div key={i}>
                      <div style={S("display:flex;justify-content:space-between;gap:8px;font:700 15px Archivo;margin-bottom:3px;")}>
                        <span>{f.name}</span>
                        <span style={S(`white-space:nowrap;color:${f.color};font-size:13px;`)}>{f.disp} de 10</span>
                      </div>
                      <div style={S("height:8px;background:#262B34;border-radius:999px;overflow:hidden;")}>
                        <div style={S(`height:8px;border-radius:999px;background:${f.color};width:${f.pct}%;`)} />
                      </div>
                    </div>
                  ))}
                </div>
                <div style={S("background:#181C23;border:1px solid #262B34;border-radius:20px;padding:20px;display:flex;flex-direction:column;gap:10px;")}>
                  <div style={S("font:700 12px Archivo;letter-spacing:.1em;text-transform:uppercase;color:#E07B74;")}>Maiores dificuldades</div>
                  {live.liveDiffs.map((f: any, i: number) => (
                    <div key={i}>
                      <div style={S("display:flex;justify-content:space-between;gap:8px;font:700 15px Archivo;margin-bottom:3px;")}>
                        <span>{f.name}</span>
                        <span style={S(`white-space:nowrap;color:${f.color};font-size:13px;`)}>{f.disp} de 10</span>
                      </div>
                      <div style={S("height:8px;background:#262B34;border-radius:999px;overflow:hidden;")}>
                        <div style={S(`height:8px;border-radius:999px;background:${f.color};width:${f.pct}%;`)} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div style={S("font:700 13px Archivo;letter-spacing:.1em;text-transform:uppercase;color:#7C818B;margin-top:4px;")}>Temas mais desejados para conversar com a VendaMais</div>
            <div style={S("display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px;")}>
              {live.liveTemas.map((p: any, i: number) => (
                <div key={i} style={S("background:#181C23;border:1px solid #262B34;border-radius:20px;padding:22px;")}>
                  <div style={S("font:800 44px/1 Archivo;color:#E8A44A;")}>{p.pct}%</div>
                  <div style={S("height:8px;background:#262B34;border-radius:999px;overflow:hidden;margin-top:12px;")}>
                    <div style={S(`height:8px;background:#E8A44A;border-radius:999px;width:${p.pct}%;`)} />
                  </div>
                  <div style={S("font:600 14px/1.4 Archivo;color:#9CA1AB;margin-top:10px;")}>{p.label}</div>
                </div>
              ))}
            </div>
          </>
        )}

        <div style={S("display:flex;align-items:center;gap:16px;justify-content:center;")}>
          <div style={S("width:150px;height:46px;background:rgba(255,255,255,.92);border-radius:9px;padding:4px;")}>
            <img src="/logo-vendamais.jpg" alt="VendaMais" style={S("width:100%;height:100%;object-fit:contain;")} />
          </div>
          <div style={S("width:120px;height:46px;background:rgba(255,255,255,.92);border-radius:9px;padding:4px;")}>
            <img src="/logo-cegente.png" alt="Cegente" style={S("width:100%;height:100%;object-fit:contain;")} />
          </div>
        </div>
        <div style={S("text-align:center;font:400 12px Archivo;color:#5C616B;")}>Painel agregado e anônimo — nenhum dado individual é exibido. Uma iniciativa VendaMais em parceria com Cegente.</div>
      </div>
    </div>
  );
}
