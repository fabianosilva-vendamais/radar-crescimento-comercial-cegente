"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { S } from "@/lib/style";
import { DATA, compute, lead, score100, dim10, fmt10 } from "@/lib/radar-logic";
import { supabaseBrowser, supabaseConfigured } from "@/lib/supabase-browser";
import ResultView from "@/components/ResultView";

const D: any = DATA;

const avg = (a: number[]) => (a.length ? Math.round(a.reduce((x, y) => x + y, 0) / a.length) : 0);
function bar(list: any[]) {
  const mx = Math.max(1, ...list.map((x) => x.n));
  return list.map((x) => ({ ...x, pct: Math.round((x.n / mx) * 100) }));
}
function cnt(arr: any[]) {
  const m: Record<string, number> = {};
  arr.forEach((x) => {
    if (x) m[x] = (m[x] || 0) + 1;
  });
  return Object.entries(m).sort((a, b) => b[1] - a[1]).map(([name, n]) => ({ name, n }));
}
const intShort = (x: string) => (!x ? "—" : x.indexOf("Sim") === 0 ? x.replace("Sim, por ", "Sim · ") : x.indexOf("Talvez") === 0 ? "Talvez" : "Não");
const mailChip = (s: string): [string, string] =>
  s === "enviado" ? ["#EAF3EC", "#1E7F4F"] : s === "erro" ? ["#FBEDEC", "#9A2B26"] : s === "fila" ? ["#FBF1EA", "#B4841E"] : ["#EFEAE0", "#8A857A"];
const leadChip = (c: string): [string, string] => (c === "Quente" ? ["#FBEDEC", "#9A2B26"] : c === "Morno" ? ["#FBF1EA", "#B4841E"] : ["#EFEAE0", "#6B6F76"]);
const leadColor = (c: string) => (c === "Quente" ? "#9A2B26" : c === "Morno" ? "#B4841E" : "#6B6F76");

function csv(name: string, rows: any[][]) {
  const esc = (v: any) => {
    v = v == null ? "" : String(v);
    return /[";\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v;
  };
  const txt = rows.map((r) => r.map(esc).join(";")).join("\n");
  const b = new Blob(["﻿" + txt], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(b);
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}

// Barras reutilizáveis (mesma marcação do protótipo)
function BarRows({ items, color, valueKey }: { items: any[]; color: string | null; valueKey: string }) {
  return (
    <>
      {items.map((d, i) => (
        <div key={i}>
          <div style={S("display:flex;justify-content:space-between;font:600 13px Archivo;color:#33363C;margin-bottom:3px;")}>
            <span>{d.name}</span>
            <span>{d[valueKey]}</span>
          </div>
          <div style={S("height:7px;background:#EFEAE0;border-radius:999px;overflow:hidden;")}>
            <div style={S(`height:7px;background:${color || d.color};border-radius:999px;width:${d.pct}%;`)} />
          </div>
        </div>
      ))}
    </>
  );
}

export default function AdminPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [pw, setPw] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [pwErr, setPwErr] = useState("");
  const [loading, setLoading] = useState(false);

  const [records, setRecords] = useState<any[]>([]);
  const [tab, setTab] = useState<"geral" | "part" | "mail" | "export">("geral");
  const [filters, setFilters] = useState<any>({ segmento: "Todos", cargo: "Todos", estagio: "Todos", fat: "Todos", interesse: "Todos", tema: "Todos", lead: "Todos", uf: "Todos", mail: "Todos" });
  const [selId, setSelId] = useState<string | null>(null);
  const [viewRec, setViewRec] = useState<any>(null);
  const [edits, setEdits] = useState<Record<string, any>>({});

  const configured = supabaseConfigured();

  // Sessão
  useEffect(() => {
    if (!configured) {
      setAuthed(false);
      return;
    }
    const sb = supabaseBrowser();
    sb.auth.getSession().then(({ data }) => {
      if (data.session) {
        setToken(data.session.access_token);
        setAuthed(true);
      } else {
        setAuthed(false);
      }
    });
    const { data: sub } = sb.auth.onAuthStateChange((_e, session) => {
      setToken(session?.access_token || null);
      setAuthed(!!session);
    });
    return () => sub.subscription.unsubscribe();
  }, [configured]);

  const fetchRecords = useCallback(async (tk: string) => {
    const r = await fetch("/api/admin/records", { headers: { Authorization: `Bearer ${tk}` }, cache: "no-store" });
    if (r.ok) {
      const d = await r.json();
      setRecords(d.records || []);
    }
  }, []);

  useEffect(() => {
    if (authed && token) fetchRecords(token);
  }, [authed, token, fetchRecords]);

  async function doLogin() {
    setPwErr("");
    setLoading(true);
    try {
      const sb = supabaseBrowser();
      const { data, error } = await sb.auth.signInWithPassword({ email: emailInput.trim(), password: pw });
      if (error || !data.session) {
        setPwErr("Não foi possível entrar. Verifique e-mail e senha.");
      } else {
        setToken(data.session.access_token);
        setAuthed(true);
        setPw("");
      }
    } catch {
      setPwErr("Falha de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  async function doLogout() {
    try {
      await supabaseBrowser().auth.signOut();
    } catch {}
    setAuthed(false);
    setRecords([]);
  }

  async function saveAcomp(id: string, patch: any) {
    if (!token) return;
    try {
      await fetch("/api/admin/acompanhamento", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id, ...patch }),
      });
    } catch {}
  }

  async function resend(code: string) {
    try {
      await fetch("/api/resend", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code }) });
      setTimeout(() => token && fetchRecords(token), 2500);
    } catch {}
  }

  // ---- Cálculos do painel ----
  const view = useMemo(() => {
    const recs = records;
    const done = recs.filter((r) => r.completed);
    const results = done.map((r) => ({ r, res: compute(r.ans) }));
    const mails = done.map((r) => r.mail);
    const intSim = done.filter((r) => (r.ans[16] || "").indexOf("Sim") === 0).length;
    const leadsQ = done.filter((r) => lead(r).cls === "Quente").length;
    const admStats = [
      { n: recs.length, label: "Participantes" },
      { n: done.length, label: "Diagnósticos concluídos" },
      { n: mails.filter((m) => m.status === "enviado").length, label: "E-mails enviados" },
      { n: mails.filter((m) => m.status === "erro").length, label: "E-mails com erro" },
      { n: intSim, label: "Querem devolutiva" },
      { n: leadsQ, label: "Leads quentes" },
    ];
    const admAvg = results.length ? score100(avg(results.map((x) => x.res.overall).filter((x: any) => x != null) as number[])) : "—";
    const admDims = D.dims.map((d: any, i: number) => {
      const sc = avg(results.map((x) => x.res.dims[i].score).filter((x: any) => x != null) as number[]);
      return { name: d.name, score: results.length ? fmt10(dim10(sc)) : "—", pct: results.length ? Math.round((dim10(sc) as number) * 10) : 0 };
    });
    const admStages = bar(D.classes.map((c: any) => ({ name: c.name, n: results.filter((x) => x.res.cls && x.res.cls.name === c.name).length })));
    const admLead = bar(["Quente", "Morno", "Nutrição"].map((c) => ({ name: c, n: done.filter((r) => lead(r).cls === c).length, color: leadColor(c) })));
    const admGap = bar(cnt(results.map((x) => (x.res.gap ? x.res.gap.name : null))));
    const admSeg = bar(cnt(done.map((r) => r.segmento)).slice(0, 6));
    const admTema = bar(cnt(done.map((r) => r.ans[17])).slice(0, 6));

    const F = filters;
    const filtered = recs.filter((r) => {
      const res = r.completed ? compute(r.ans) : null;
      const ld = lead(r).cls;
      const it = r.ans[16] || "";
      if (F.segmento !== "Todos" && r.segmento !== F.segmento) return false;
      if (F.cargo !== "Todos" && r.cargo !== F.cargo) return false;
      if (F.estagio !== "Todos" && (!res || !res.cls || res.cls.name !== F.estagio)) return false;
      if (F.fat !== "Todos" && r.fat !== F.fat) return false;
      if (F.interesse !== "Todos") {
        const g = it.indexOf("Sim") === 0 ? "Sim" : it.indexOf("Talvez") === 0 ? "Talvez" : it ? "Não" : "";
        if (g !== F.interesse) return false;
      }
      if (F.tema !== "Todos" && r.ans[17] !== F.tema) return false;
      if (F.lead !== "Todos" && ld !== F.lead) return false;
      if (F.uf !== "Todos" && r.uf !== F.uf) return false;
      if (F.mail !== "Todos" && r.mail.status !== F.mail) return false;
      return true;
    });
    const admFilters = [
      { label: "Segmento", key: "segmento", opts: ["Todos", ...D.segmentos] },
      { label: "Cargo", key: "cargo", opts: ["Todos", ...D.cargos] },
      { label: "Estágio", key: "estagio", opts: ["Todos", ...D.classes.map((c: any) => c.name)] },
      { label: "Faturamento", key: "fat", opts: ["Todos", ...D.fats] },
      { label: "Interesse", key: "interesse", opts: ["Todos", "Sim", "Talvez", "Não"] },
      { label: "Tema", key: "tema", opts: ["Todos", ...D.q[17].opts] },
      { label: "Prioridade", key: "lead", opts: ["Todos", "Quente", "Morno", "Nutrição"] },
      { label: "Estado", key: "uf", opts: ["Todos", ...Array.from(new Set(recs.map((r) => r.uf).filter(Boolean)))] },
      { label: "E-mail", key: "mail", opts: ["Todos", "enviado", "fila", "erro"] },
    ];
    return { recs, done, results, admStats, admAvg, admDims, admStages, admLead, admGap, admSeg, admTema, filtered, admFilters };
  }, [records, filters]);

  const sel = view.recs.find((r) => r.id === selId);

  function onExportFull() {
    const head = ["Origem", "Código", "Data", "Hora", "Nome", "Empresa", "Cargo", "E-mail", "WhatsApp", "Cidade", "UF", "Segmento", "Vendedores", "Unidades", "Faturamento", ...Array.from({ length: 15 }, (_, i) => "P" + (i + 1)), "Maior obstáculo", "Interesse devolutiva", "Tema de interesse", "Score total (0-100)", "Classificação", "Clareza estratégica (0-10)", "Diferenciação e valor (0-10)", "Máquina comercial (0-10)", "Equipe e liderança (0-10)", "Execução e crescimento (0-10)", "Principal gargalo", "Prioridade comercial"];
    const rows = view.done.map((r) => {
      const res = compute(r.ans);
      const ld = lead(r).cls;
      return ["Evento VendaMais + Cegente", r.code, r.dia, r.hora, r.nome, r.empresa, r.cargo, r.email, r.whats, r.cidade, r.uf, r.segmento, r.vend, r.unid, r.fat, ...Array.from({ length: 15 }, (_, i) => r.ans[i]), r.ans[15], r.ans[16], r.ans[17], score100(res.overall), res.cls ? res.cls.name : "", ...res.dims.map((d: any) => fmt10(dim10(d.score))), res.gap ? res.gap.name : "", ld];
    });
    csv("radar-participantes.csv", [head, ...rows]);
  }
  function onExportLeads() {
    const head = ["Prioridade", "Nome", "Empresa", "Cargo", "E-mail", "WhatsApp", "Cidade/UF", "Segmento", "Faturamento", "Score (0-100)", "Classificação", "Principal gargalo", "Tema de interesse", "Interesse"];
    const rows = view.done
      .filter((r) => lead(r).cls !== "Nutrição")
      .sort((a, b) => (({ Quente: 0, Morno: 1 } as any)[lead(a).cls] - ({ Quente: 0, Morno: 1 } as any)[lead(b).cls]))
      .map((r) => {
        const res = compute(r.ans);
        return [lead(r).cls, r.nome, r.empresa, r.cargo, r.email, r.whats, r.cidade + "/" + r.uf, r.segmento, r.fat, score100(res.overall), res.cls ? res.cls.name : "", res.gap ? res.gap.name : "", r.ans[17], r.ans[16]];
      });
    csv("radar-leads.csv", [head, ...rows]);
  }

  // ---- Render ----
  if (authed === null) {
    return <div style={S("min-height:100vh;background:#EDEAE2;display:flex;align-items:center;justify-content:center;font:600 15px Archivo;color:#8A857A;")}>Carregando…</div>;
  }

  if (viewRec) {
    return (
      <div style={S("min-height:100vh;background:#F4F2ED;")}>
        <ResultView profile={{ ...viewRec, code: viewRec.code }} ans={viewRec.ans} backLabel="Voltar ao painel" onBack={() => setViewRec(null)} />
      </div>
    );
  }

  if (!authed) {
    return (
      <div style={S("min-height:100vh;background:#F4F2ED;")}>
        <div data-screen-label="Login administrativo" style={S("max-width:420px;margin:0 auto;padding:60px 20px;display:flex;flex-direction:column;gap:16px;")}>
          <a href="/" style={S("align-self:flex-start;background:none;border:none;font:600 15px Archivo;color:#C82A1E;cursor:pointer;padding:6px 0;")}>‹ Voltar</a>
          <div style={S("font:700 12px Archivo;letter-spacing:.12em;color:#C82A1E;text-transform:uppercase;")}>Acesso restrito · VendaMais</div>
          <h2 style={S("margin:0;font:800 26px Archivo;color:#16181D;")}>Painel administrativo</h2>
          {!configured && (
            <div style={S("background:#FBEDEC;border:1px solid #E4B4B1;border-radius:12px;padding:12px 14px;font:600 13px/1.5 Archivo;color:#9A2B26;")}>Configuração do Supabase ausente. Defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY.</div>
          )}
          <label style={S("display:flex;flex-direction:column;gap:6px;")}>
            <span style={S("font:600 14px Archivo;color:#33363C;")}>E-mail</span>
            <input type="email" value={emailInput} onChange={(e) => { setEmailInput(e.target.value); setPwErr(""); }} placeholder="voce@vendamais.com.br" style={S("padding:16px;border:1px solid #D8D2C4;border-radius:12px;font:400 16px Archivo;background:#fff;color:#16181D;")} />
          </label>
          <input type="password" value={pw} onChange={(e) => { setPw(e.target.value); setPwErr(""); }} onKeyDown={(e) => e.key === "Enter" && doLogin()} placeholder="Senha de acesso" style={S("padding:16px;border:1px solid #D8D2C4;border-radius:12px;font:400 16px Archivo;background:#fff;color:#16181D;")} />
          {pwErr && (
            <div style={S("background:#FBEDEC;border:1px solid #E4B4B1;border-radius:12px;padding:12px 14px;font:600 14px Archivo;color:#9A2B26;")}>{pwErr}</div>
          )}
          <button onClick={doLogin} disabled={loading} style={S("padding:16px;background:#C82A1E;color:#fff;border:none;border-radius:12px;font:700 16px Archivo;cursor:pointer;")}>{loading ? "Entrando…" : "Entrar"}</button>
          <p style={S("margin:0;font:400 12px/1.5 Archivo;color:#9B968B;")}>Acesso exclusivo da equipe VendaMais, autenticado pelo Supabase Auth.</p>
        </div>
      </div>
    );
  }

  const setF = (k: string, v: string) => setFilters((prev: any) => ({ ...prev, [k]: v }));
  const admCols = ["Nome", "Empresa", "Cargo", "Cidade/UF", "Segmento", "Faturamento", "Score", "Estágio", "Gargalo", "Interesse", "Tema", "E-mail", "Lead", "Data"];

  return (
    <div data-screen-label="Painel administrativo" style={S("min-height:100vh;background:#EDEAE2;")}>
      <div style={S("background:#16181D;color:#fff;padding:14px 20px;display:flex;align-items:center;gap:14px;flex-wrap:wrap;")}>
        <div>
          <div style={S("font:700 11px Archivo;letter-spacing:.12em;color:#E8A44A;text-transform:uppercase;")}>VendaMais + Cegente</div>
          <div style={S("font:800 17px Archivo;")}>Radar — Painel administrativo</div>
        </div>
        <div style={S("margin-left:auto;display:flex;gap:8px;flex-wrap:wrap;")}>
          {([["geral", "Visão geral"], ["part", "Participantes"], ["mail", "E-mails"], ["export", "Exportar"]] as const).map(([id, t]) => {
            const s = tab === id;
            return (
              <button key={id} onClick={() => setTab(id as any)} style={S(`padding:9px 14px;border-radius:999px;font:600 13px Archivo;cursor:pointer;border:1px solid ${s ? "#C82A1E" : "#3A3E47"};background:${s ? "#C82A1E" : "transparent"};color:${s ? "#fff" : "#C9CCD3"};`)}>{t}</button>
            );
          })}
          <button onClick={() => window.open("/telao", "_blank")} style={S("padding:9px 14px;border-radius:999px;font:600 13px Archivo;cursor:pointer;border:1px solid #3A3E47;background:transparent;color:#C9CCD3;")}>Telão ↗</button>
          <button onClick={doLogout} style={S("padding:9px 14px;border-radius:999px;font:600 13px Archivo;cursor:pointer;border:1px solid #3A3E47;background:transparent;color:#C9CCD3;")}>Sair</button>
        </div>
      </div>
      <div style={S("max-width:1180px;margin:0 auto;padding:18px 20px 60px;display:flex;flex-direction:column;gap:16px;")}>
        {tab === "geral" && (
          <>
            <div style={S("display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;")}>
              {view.admStats.map((s, i) => (
                <div key={i} style={S("background:#fff;border:1px solid #E6E1D6;border-radius:14px;padding:14px;")}>
                  <div style={S("font:800 26px Archivo;color:#16181D;")}>{s.n}</div>
                  <div style={S("font:600 12px/1.35 Archivo;color:#6B6F76;")}>{s.label}</div>
                </div>
              ))}
            </div>
            <div style={S("display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:14px;")}>
              <div style={S("background:#fff;border:1px solid #E6E1D6;border-radius:16px;padding:18px;display:flex;flex-direction:column;gap:10px;")}>
                <div style={S("font:700 13px Archivo;letter-spacing:.06em;text-transform:uppercase;color:#8A857A;")}>Média por dimensão (de 10) · geral: <span style={S("color:#C82A1E;font-size:16px;")}>{view.admAvg}</span>/100</div>
                <BarRows items={view.admDims} color="#C82A1E" valueKey="score" />
              </div>
              <div style={S("background:#fff;border:1px solid #E6E1D6;border-radius:16px;padding:18px;display:flex;flex-direction:column;gap:10px;")}>
                <div style={S("font:700 13px Archivo;letter-spacing:.06em;text-transform:uppercase;color:#8A857A;")}>Distribuição por estágio</div>
                <BarRows items={view.admStages} color="#16181D" valueKey="n" />
              </div>
              <div style={S("background:#fff;border:1px solid #E6E1D6;border-radius:16px;padding:18px;display:flex;flex-direction:column;gap:10px;")}>
                <div style={S("font:700 13px Archivo;letter-spacing:.06em;text-transform:uppercase;color:#8A857A;")}>Prioridade comercial (lead)</div>
                <BarRows items={view.admLead} color={null} valueKey="n" />
              </div>
              <div style={S("background:#fff;border:1px solid #E6E1D6;border-radius:16px;padding:18px;display:flex;flex-direction:column;gap:10px;")}>
                <div style={S("font:700 13px Archivo;letter-spacing:.06em;text-transform:uppercase;color:#8A857A;")}>Principal gargalo do grupo</div>
                <BarRows items={view.admGap} color="#9A2B26" valueKey="n" />
              </div>
              <div style={S("background:#fff;border:1px solid #E6E1D6;border-radius:16px;padding:18px;display:flex;flex-direction:column;gap:10px;")}>
                <div style={S("font:700 13px Archivo;letter-spacing:.06em;text-transform:uppercase;color:#8A857A;")}>Segmentos</div>
                <BarRows items={view.admSeg} color="#23405C" valueKey="n" />
              </div>
              <div style={S("background:#fff;border:1px solid #E6E1D6;border-radius:16px;padding:18px;display:flex;flex-direction:column;gap:10px;")}>
                <div style={S("font:700 13px Archivo;letter-spacing:.06em;text-transform:uppercase;color:#8A857A;")}>Temas mais desejados</div>
                <BarRows items={view.admTema} color="#B4841E" valueKey="n" />
              </div>
            </div>
          </>
        )}

        {tab === "part" && (
          <>
            <div style={S("display:flex;gap:8px;flex-wrap:wrap;")}>
              {view.admFilters.map((f) => (
                <label key={f.key} style={S("display:flex;flex-direction:column;gap:3px;")}>
                  <span style={S("font:600 11px Archivo;letter-spacing:.06em;text-transform:uppercase;color:#8A857A;")}>{f.label}</span>
                  <select value={filters[f.key]} onChange={(e) => setF(f.key, e.target.value)} style={S("padding:8px 10px;border:1px solid #D8D2C4;border-radius:9px;font:600 13px Archivo;background:#fff;color:#16181D;max-width:180px;")}>
                    {f.opts.map((o: string) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </label>
              ))}
            </div>
            <div style={S("font:600 13px Archivo;color:#6B6F76;")}>{view.filtered.length + " participante" + (view.filtered.length === 1 ? "" : "s") + (view.filtered.length !== view.recs.length ? " (de " + view.recs.length + ")" : "")}</div>
            {view.filtered.length === 0 ? (
              <div style={S("background:#fff;border:1px dashed #D8D2C4;border-radius:16px;padding:40px;text-align:center;font:600 15px Archivo;color:#8A857A;")}>Nenhum participante encontrado com os filtros atuais.</div>
            ) : (
              <div style={S("overflow-x:auto;background:#fff;border:1px solid #E6E1D6;border-radius:16px;")}>
                <table style={S("border-collapse:collapse;width:100%;min-width:1240px;font:400 13px Archivo;")}>
                  <thead>
                    <tr>
                      {admCols.map((c) => (
                        <th key={c} style={S("text-align:left;padding:12px 10px;font:700 11px Archivo;letter-spacing:.05em;text-transform:uppercase;color:#8A857A;border-bottom:1px solid #E6E1D6;white-space:nowrap;")}>{c}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {view.filtered.map((r) => {
                      const res = r.completed ? compute(r.ans) : null;
                      const ld = lead(r).cls;
                      const m = r.mail;
                      const [mb, mf] = mailChip(m.status);
                      const [lb, lf] = leadChip(ld);
                      const fat = (r.fat || "").replace("/mês", "").replace("De ", "").replace("Prefiro não informar", "—");
                      return (
                        <tr key={r.id} onClick={() => setSelId(r.id)} style={S("cursor:pointer;")}>
                          <td style={S("padding:11px 10px;border-bottom:1px solid #F0EBE0;font-weight:700;color:#16181D;white-space:nowrap;")}>{r.nome}</td>
                          <td style={S("padding:11px 10px;border-bottom:1px solid #F0EBE0;white-space:nowrap;")}>{r.empresa}</td>
                          <td style={S("padding:11px 10px;border-bottom:1px solid #F0EBE0;white-space:nowrap;")}>{r.cargo}</td>
                          <td style={S("padding:11px 10px;border-bottom:1px solid #F0EBE0;white-space:nowrap;")}>{r.cidade + "/" + r.uf}</td>
                          <td style={S("padding:11px 10px;border-bottom:1px solid #F0EBE0;white-space:nowrap;")}>{r.segmento}</td>
                          <td style={S("padding:11px 10px;border-bottom:1px solid #F0EBE0;white-space:nowrap;")}>{fat}</td>
                          <td style={S("padding:11px 10px;border-bottom:1px solid #F0EBE0;font-weight:800;color:#C82A1E;")}>{res && res.overall != null ? score100(res.overall) + "/100" : "—"}</td>
                          <td style={S("padding:11px 10px;border-bottom:1px solid #F0EBE0;white-space:nowrap;")}>{res && res.cls ? res.cls.name : "Incompleto"}</td>
                          <td style={S("padding:11px 10px;border-bottom:1px solid #F0EBE0;white-space:nowrap;")}>{res && res.gap ? res.gap.name : "—"}</td>
                          <td style={S("padding:11px 10px;border-bottom:1px solid #F0EBE0;")}>{intShort(r.ans[16])}</td>
                          <td style={S("padding:11px 10px;border-bottom:1px solid #F0EBE0;white-space:nowrap;")}>{r.ans[17] || "—"}</td>
                          <td style={S("padding:11px 10px;border-bottom:1px solid #F0EBE0;")}><span style={S(`font:700 11px Archivo;letter-spacing:.04em;text-transform:uppercase;border-radius:999px;padding:4px 9px;background:${mb};color:${mf};`)}>{m.status}</span></td>
                          <td style={S("padding:11px 10px;border-bottom:1px solid #F0EBE0;")}><span style={S(`font:800 11px Archivo;border-radius:7px;padding:4px 8px;background:${lb};color:${lf};`)}>{ld}</span></td>
                          <td style={S("padding:11px 10px;border-bottom:1px solid #F0EBE0;white-space:nowrap;color:#6B6F76;")}>{r.dia + " " + r.hora}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {tab === "mail" && (
          <div style={S("background:#fff;border:1px solid #E6E1D6;border-radius:16px;overflow-x:auto;")}>
            <table style={S("border-collapse:collapse;width:100%;min-width:760px;font:400 13px Archivo;")}>
              <thead>
                <tr>
                  {["Destinatário", "Status", "Tentativas", "Último envio", "Último erro", "Ação"].map((h) => (
                    <th key={h} style={S("text-align:left;padding:12px;font:700 11px Archivo;letter-spacing:.05em;text-transform:uppercase;color:#8A857A;border-bottom:1px solid #E6E1D6;")}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {view.done.map((r) => {
                  const m = r.mail;
                  const [mb, mf] = mailChip(m.status);
                  return (
                    <tr key={r.id}>
                      <td style={S("padding:11px 12px;border-bottom:1px solid #F0EBE0;")}><strong>{r.nome}</strong><br /><span style={S("color:#6B6F76;")}>{r.email}</span></td>
                      <td style={S("padding:11px 12px;border-bottom:1px solid #F0EBE0;")}><span style={S(`font:700 11px Archivo;letter-spacing:.04em;text-transform:uppercase;border-radius:999px;padding:4px 9px;background:${mb};color:${mf};`)}>{m.status}</span></td>
                      <td style={S("padding:11px 12px;border-bottom:1px solid #F0EBE0;")}>{m.tries}</td>
                      <td style={S("padding:11px 12px;border-bottom:1px solid #F0EBE0;color:#6B6F76;")}>{m.date}</td>
                      <td style={S("padding:11px 12px;border-bottom:1px solid #F0EBE0;color:#9A2B26;")}>{m.err || "—"}</td>
                      <td style={S("padding:11px 12px;border-bottom:1px solid #F0EBE0;")}><button onClick={() => resend(r.code)} style={S("padding:7px 12px;background:#EEEAE0;color:#C82A1E;border:none;border-radius:999px;font:600 12px Archivo;cursor:pointer;")}>Reenviar</button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {tab === "export" && (
          <>
            <div style={S("display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:14px;")}>
              <div style={S("background:#fff;border:1px solid #E6E1D6;border-radius:16px;padding:20px;display:flex;flex-direction:column;gap:10px;")}>
                <strong style={S("font:700 16px Archivo;color:#16181D;")}>Participantes e resultados</strong>
                <span style={S("font:400 13px/1.5 Archivo;color:#6B6F76;")}>Perfil completo, respostas P1–P15, obstáculo, tema, interesse, score total, por dimensão, gargalo e prioridade comercial.</span>
                <button onClick={onExportFull} style={S("padding:13px;background:#C82A1E;color:#fff;border:none;border-radius:11px;font:700 14px Archivo;cursor:pointer;")}>Exportar CSV</button>
              </div>
              <div style={S("background:#fff;border:1px solid #E6E1D6;border-radius:16px;padding:20px;display:flex;flex-direction:column;gap:10px;")}>
                <strong style={S("font:700 16px Archivo;color:#16181D;")}>Somente leads para follow-up</strong>
                <span style={S("font:400 13px/1.5 Archivo;color:#6B6F76;")}>Contato, cargo, empresa, WhatsApp, prioridade, gargalo e tema — pronto para a equipe comercial.</span>
                <button onClick={onExportLeads} style={S("padding:13px;background:#C82A1E;color:#fff;border:none;border-radius:11px;font:700 14px Archivo;cursor:pointer;")}>Exportar CSV</button>
              </div>
            </div>
            <div style={S("font:400 12px/1.5 Archivo;color:#9B968B;")}>Os arquivos abrem no Excel (separador ponto e vírgula, UTF-8). Origem registrada: Evento VendaMais + Cegente.</div>
          </>
        )}
      </div>

      {sel && (
        <AdminDrawer
          sel={sel}
          edits={edits[sel.id] || { comStatus: sel.comStatus, contatado: sel.contatado, obs: sel.obs }}
          onEdit={(patch: any) => setEdits((e) => ({ ...e, [sel.id]: { ...(e[sel.id] || { comStatus: sel.comStatus, contatado: sel.contatado, obs: sel.obs }), ...patch } }))}
          onSave={(patch: any) => saveAcomp(sel.id, patch)}
          onClose={() => setSelId(null)}
          onOpenReport={() => { if (sel.completed) { setViewRec(sel); setSelId(null); } }}
          onResend={() => resend(sel.code)}
        />
      )}
    </div>
  );
}

// Painel lateral de detalhe do participante
function AdminDrawer({ sel, edits, onEdit, onSave, onClose, onOpenReport, onResend }: any) {
  const res = sel.completed ? compute(sel.ans) : null;
  const ld = lead(sel).cls;
  const m = sel.mail;
  const [lb, lf] = leadChip(ld);
  const selComOpts = ["Novo", "Em contato", "Reunião agendada", "Proposta enviada", "Cliente", "Sem interesse"];
  const ct = !!edits.contatado;

  return (
    <>
      <div style={S("position:fixed;inset:0;background:rgba(20,22,26,.5);z-index:40;")} onClick={onClose} />
      <div style={S("position:fixed;top:0;right:0;bottom:0;width:min(520px,100%);background:#F7F5EF;z-index:41;overflow-y:auto;padding:20px;display:flex;flex-direction:column;gap:14px;box-shadow:-12px 0 40px rgba(0,0,0,.2);")}>
        <div style={S("display:flex;justify-content:space-between;align-items:center;")}>
          <strong style={S("font:800 18px Archivo;color:#16181D;")}>{sel.nome}</strong>
          <button onClick={onClose} style={S("background:none;border:none;font:700 22px Archivo;color:#6B6F76;cursor:pointer;padding:4px 8px;")}>×</button>
        </div>
        <div style={S("font:400 14px/1.6 Archivo;color:#4C4F56;")}>
          {sel.empresa} · {sel.cidade}, {sel.uf}<br />{sel.cargo} · {sel.segmento}<br />{sel.vend} vendedores · {sel.unid} · {sel.fat}<br />{sel.email}{sel.whats ? <><br />WhatsApp: {sel.whats}</> : null}
        </div>
        <div style={S("display:flex;gap:8px;flex-wrap:wrap;")}>
          <span style={S("font:700 13px/1.4 Archivo;background:#16181D;color:#fff;border-radius:10px;padding:6px 12px;")}>{res && res.overall != null ? score100(res.overall) : "—"}/100 · {res && res.cls ? res.cls.name : "Incompleto"}</span>
          <span style={S(`font:700 13px/1.4 Archivo;background:${lb};color:${lf};border-radius:10px;padding:6px 12px;`)}>Lead {ld}</span>
        </div>
        <div style={S("background:#fff;border:1px solid #E6E1D6;border-radius:14px;padding:14px;display:flex;flex-direction:column;gap:8px;")}>
          <div style={S("font:700 12px Archivo;letter-spacing:.06em;text-transform:uppercase;color:#8A857A;")}>Dimensões</div>
          {(res ? res.dims.map((d: any) => ({ name: d.name, txt: d.score == null ? "—" : fmt10(dim10(d.score)) + "/10", fg: d.score == null ? "#8A857A" : d.score >= 12 ? "#1E7F4F" : d.score >= 8 ? "#B4841E" : "#9A2B26", pct: d.score == null ? 0 : Math.round((dim10(d.score) as number) * 10) })) : []).map((d: any, i: number) => (
            <div key={i}>
              <div style={S("display:flex;justify-content:space-between;gap:8px;font:600 13px Archivo;color:#33363C;margin-bottom:3px;")}><span>{d.name}</span><span style={S(`white-space:nowrap;color:${d.fg};`)}>{d.txt}</span></div>
              <div style={S("height:6px;background:#EFEAE0;border-radius:999px;overflow:hidden;")}><div style={S(`height:6px;background:${d.fg};border-radius:999px;width:${d.pct}%;`)} /></div>
            </div>
          ))}
        </div>
        <div style={S("background:#fff;border:1px solid #E6E1D6;border-radius:14px;padding:14px;display:flex;flex-direction:column;gap:6px;")}>
          <div style={S("font:700 12px Archivo;letter-spacing:.06em;text-transform:uppercase;color:#8A857A;")}>Contexto comercial (interno)</div>
          <div style={S("font:400 13px/1.6 Archivo;color:#33363C;")}>Principal gargalo: <strong>{res && res.gap ? res.gap.name : "—"}</strong><br />Interesse em devolutiva: <strong>{sel.ans[16] || "—"}</strong><br />Tema de interesse: <strong>{sel.ans[17] || "—"}</strong></div>
          {sel.ans[15] ? <div style={S("font:400 13px/1.5 Archivo;color:#33363C;background:#FAF7F1;border-radius:10px;padding:10px;")}>Maior obstáculo: “{sel.ans[15]}”</div> : null}
        </div>
        <div style={S("background:#fff;border:1px solid #E6E1D6;border-radius:14px;padding:14px;display:flex;flex-direction:column;gap:10px;")}>
          <div style={S("font:700 12px Archivo;letter-spacing:.06em;text-transform:uppercase;color:#8A857A;")}>Acompanhamento comercial</div>
          <label style={S("display:flex;flex-direction:column;gap:4px;")}><span style={S("font:600 12px Archivo;color:#6B6F76;")}>Status comercial</span>
            <select value={edits.comStatus} onChange={(e) => { onEdit({ comStatus: e.target.value }); onSave({ status_comercial: e.target.value }); }} style={S("padding:10px;border:1px solid #D8D2C4;border-radius:9px;font:600 13px Archivo;background:#fff;")}>
              {selComOpts.map((o) => (<option key={o} value={o}>{o}</option>))}
            </select>
          </label>
          <button onClick={() => { const v = !ct; onEdit({ contatado: v }); onSave({ contatado: v }); }} style={S(`padding:11px;border-radius:10px;font:600 13px Archivo;cursor:pointer;border:1px solid ${ct ? "#1E7F4F" : "#D8D2C4"};background:${ct ? "#EAF3EC" : "#fff"};color:${ct ? "#1E7F4F" : "#33363C"};`)}>{ct ? "✓ Contatado" : "Marcar como contatado"}</button>
          <label style={S("display:flex;flex-direction:column;gap:4px;")}><span style={S("font:600 12px Archivo;color:#6B6F76;")}>Observação interna</span>
            <textarea value={edits.obs} onChange={(e) => onEdit({ obs: e.target.value })} onBlur={(e) => onSave({ observacao: e.target.value })} rows={2} placeholder="Anotações da equipe VendaMais" style={S("padding:10px;border:1px solid #D8D2C4;border-radius:9px;font:400 13px Archivo;resize:vertical;")} />
          </label>
        </div>
        <div style={S("display:flex;gap:10px;flex-wrap:wrap;")}>
          <button onClick={onOpenReport} style={S("flex:1;padding:13px;background:#C82A1E;color:#fff;border:none;border-radius:11px;font:700 14px Archivo;cursor:pointer;")}>Abrir leitura completa</button>
          <button onClick={onResend} style={S("flex:1;padding:13px;background:#fff;color:#C82A1E;border:1px solid #E0BCA8;border-radius:11px;font:600 14px Archivo;cursor:pointer;")}>{m.status === "erro" ? "Reenviar (erro)" : "Reenviar e-mail"}</button>
        </div>
      </div>
    </>
  );
}
