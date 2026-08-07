"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { S } from "@/lib/style";
import { DATA } from "@/lib/radar-logic";
import ResultView from "@/components/ResultView";

type Screen = "home" | "ident" | "profile" | "scale" | "quiz" | "proc" | "result" | "reopen";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const D: any = DATA;

const emptyForm = {
  nome: "",
  empresa: "",
  email: "",
  whats: "",
  cidade: "",
  uf: "",
  cargo: "",
  segmento: "",
  vend: "",
  unid: "",
  fat: "",
  consent: false,
};

function chip(t: string, sel: boolean, on: () => void) {
  return { t, on, bc: sel ? "#C82A1E" : "#D8D2C4", bg: sel ? "#FBF1EC" : "#fff", fg: sel ? "#A6211A" : "#33363C" };
}

export default function ParticipantPage() {
  const router = useRouter();
  const [screen, setScreen] = useState<Screen>("home");
  const [qi, setQi] = useState(0);
  const [ans, setAns] = useState<any[]>(() => new Array(18).fill(undefined));
  const [form, setForm] = useState({ ...emptyForm });
  const [errId, setErrId] = useState("");
  const [errProf, setErrProf] = useState("");
  const [errGen, setErrGen] = useState("");
  const [resumeAsk, setResumeAsk] = useState(false);
  const [draft, setDraft] = useState<any>(null);

  const [resultProfile, setResultProfile] = useState<any>(null);
  const [resCode, setResCode] = useState("");
  const [saveSt, setSaveSt] = useState<"saving" | "saved">("saving");
  const [mailSt, setMailSt] = useState<"idle" | "fila" | "enviado" | "erro">("idle");

  const [reopen, setReopen] = useState("");
  const [reopenErr, setReopenErr] = useState("");

  const hydrated = useRef(false);
  const pollRef = useRef<any>(null);
  // Espelho sempre atualizado das respostas — evita "closure velha" quando a
  // última pergunta (single) dispara o envio automático via setTimeout.
  const ansRef = useRef<any[]>(ans);
  useEffect(() => {
    ansRef.current = ans;
  }, [ans]);

  // Recuperação de rascunho (localStorage) — igual ao protótipo
  useEffect(() => {
    try {
      const d = JSON.parse(localStorage.getItem("radar_draft") || "null");
      if (d && (d.form?.nome || (Array.isArray(d.ans) && d.ans.some((a: any) => a !== undefined && a !== null)))) {
        setDraft(d);
        setResumeAsk(true);
      }
    } catch {}
    hydrated.current = true;
  }, []);

  // Salvamento automático do rascunho
  useEffect(() => {
    if (!hydrated.current) return;
    if (screen === "result" || screen === "proc") return;
    try {
      localStorage.setItem("radar_draft", JSON.stringify({ form, ans, qi, step: screen }));
    } catch {}
  }, [form, ans, qi, screen]);

  function clearDraft() {
    try {
      localStorage.removeItem("radar_draft");
    } catch {}
  }

  function setF(k: string, v: any) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function setOpen(i: number, v: string) {
    setAns((prev) => {
      const next = [...prev];
      next[i] = v;
      ansRef.current = next;
      return next;
    });
  }

  // Responde e (para escala/single) avança automaticamente, como no protótipo.
  function answer(i: number, v: any) {
    setAns((prev) => {
      const next = [...prev];
      next[i] = v;
      ansRef.current = next;
      return next;
    });
    if (D.q[i].type !== "open") {
      setTimeout(() => {
        setScreen((sc) => {
          if (sc !== "quiz") return sc;
          setQi((cur) => {
            if (cur === i) {
              if (i < 17) return i + 1;
              onGenerate();
            }
            return cur;
          });
          return sc;
        });
      }, 240);
    }
  }

  // ---- Navegação do topo (home) ----
  const startFlow = () => {
    setResumeAsk(false);
    setScreen("ident");
  };
  const onResume = () => {
    const d = draft;
    if (d) {
      setForm({ ...emptyForm, ...d.form });
      setAns(Array.isArray(d.ans) ? d.ans : new Array(18).fill(undefined));
      setQi(d.qi || 0);
      setResumeAsk(false);
      setScreen(d.step && d.step !== "home" ? d.step : "ident");
    }
  };
  const onDiscard = () => {
    clearDraft();
    setResumeAsk(false);
    setDraft(null);
  };

  // ---- Identificação ----
  function onIdentNext() {
    const f = form;
    const miss: string[] = [];
    if (!f.nome.trim()) miss.push("nome");
    if (!f.empresa.trim()) miss.push("empresa");
    if (!EMAIL_RE.test(f.email.trim())) miss.push("e-mail válido");
    if (!f.whats.trim()) miss.push("WhatsApp");
    if (!f.cidade.trim()) miss.push("cidade");
    if (!f.uf || f.uf === "UF") miss.push("estado");
    if (!f.cargo) miss.push("cargo");
    if (miss.length) {
      setErrId("Preencha para continuar: " + miss.join(", ") + ".");
      return;
    }
    setErrId("");
    setScreen("profile");
  }

  // ---- Perfil ----
  function onProfNext() {
    const f = form;
    const miss: string[] = [];
    if (!f.segmento) miss.push("segmento");
    if (!f.vend) miss.push("equipe comercial");
    if (!f.unid) miss.push("unidades");
    if (!f.fat) miss.push("faturamento");
    if (!f.consent) miss.push("autorização de uso dos dados");
    if (miss.length) {
      setErrProf("Falta preencher: " + miss.join(", ") + ".");
      return;
    }
    setErrProf("");
    setScreen("scale");
  }

  // ---- Gerar leitura (envio ao servidor) ----
  async function onGenerate() {
    // Lê do ref (sempre atualizado) para não perder a última resposta quando o
    // envio é disparado automaticamente logo após o setAns.
    const current = ansRef.current;
    const first = current.findIndex((a, i) => i < 15 && (a === undefined || a === null));
    if (first >= 0) {
      setQi(first);
      setScreen("quiz");
      return;
    }
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      setErrGen("Sem conexão com a internet. Suas respostas estão salvas neste aparelho — verifique a conexão e toque em “Tentar novamente”.");
      setScreen("proc");
      return;
    }
    setErrGen("");
    setScreen("proc");
    setSaveSt("saving");
    setMailSt("idle");
    try {
      const payload = {
        form,
        ans: [
          ...current.slice(0, 15).map((v) => Number(v)),
          current[15] || "",
          current[16] || "",
          current[17] || "",
        ],
      };
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.code) {
        setErrGen(data.error || "Não foi possível gerar a leitura agora. Toque em “Tentar novamente”.");
        return;
      }
      clearDraft();
      setResultProfile({
        nome: form.nome,
        empresa: form.empresa,
        cidade: form.cidade,
        uf: form.uf,
        email: form.email.trim(),
        code: data.code,
      });
      setResCode(data.code);
      setSaveSt("saved");
      setMailSt("fila");
      setScreen("result");
      startMailPolling(data.code);
    } catch {
      setErrGen("Falha de conexão. Suas respostas estão salvas neste aparelho — toque em “Tentar novamente”.");
    }
  }

  function startMailPolling(code: string) {
    if (pollRef.current) clearInterval(pollRef.current);
    let tries = 0;
    pollRef.current = setInterval(async () => {
      tries++;
      try {
        const r = await fetch(`/api/mail-status?code=${encodeURIComponent(code)}`);
        const d = await r.json();
        if (d.status === "enviado") {
          setMailSt("enviado");
          clearInterval(pollRef.current);
        } else if (d.status === "erro") {
          setMailSt("erro");
          clearInterval(pollRef.current);
        }
      } catch {}
      if (tries >= 12) clearInterval(pollRef.current);
    }, 2500);
  }

  useEffect(() => () => pollRef.current && clearInterval(pollRef.current), []);

  async function onResendMail() {
    setMailSt("fila");
    try {
      await fetch("/api/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: resCode }),
      });
      startMailPolling(resCode);
    } catch {}
  }

  // ---- Reabrir leitura ----
  async function onReopenGo() {
    const c = reopen.trim().toUpperCase();
    if (!c) {
      setReopenErr("Digite o código da leitura.");
      return;
    }
    try {
      const r = await fetch(`/api/report?code=${encodeURIComponent(c)}`);
      if (!r.ok) {
        setReopenErr("Código não encontrado. Confira o código no e-mail ou na tela final.");
        return;
      }
      router.push(`/r/${encodeURIComponent(c)}`);
    } catch {
      setReopenErr("Falha de conexão. Tente novamente.");
    }
  }

  const backHome = () => {
    setScreen("home");
    setResumeAsk(false);
  };

  // =====================================================================
  // Render
  // =====================================================================

  if (screen === "result" && resultProfile) {
    return (
      <div style={S("min-height:100vh;font-family:'Archivo',system-ui,sans-serif;color:#16181D;background:#F4F2ED;")}>
        <ResultView
          profile={resultProfile}
          ans={ans}
          showStatus
          saveState={saveSt}
          mailState={mailSt}
          mailEmail={resultProfile.email}
          onResend={onResendMail}
          onHome={backHome}
        />
      </div>
    );
  }

  return (
    <div style={S("min-height:100vh;font-family:'Archivo',system-ui,sans-serif;color:#16181D;background:#F4F2ED;")}>
      {screen === "home" && (
        <div data-screen-label="Tela inicial" style={S("max-width:540px;margin:0 auto;padding:28px 20px 40px;display:flex;flex-direction:column;gap:20px;")}>
          <div style={S("display:flex;align-items:center;justify-content:center;gap:14px;flex-wrap:wrap;")}>
            <div style={S("width:168px;height:52px;background:#fff;border:1px solid #E6E1D6;border-radius:10px;padding:5px;")}>
              <img src="/logo-vendamais.jpg" alt="Logo VendaMais" style={S("width:100%;height:100%;object-fit:contain;")} />
            </div>
            <div style={S("width:130px;height:52px;background:#fff;border:1px solid #E6E1D6;border-radius:10px;padding:5px;")}>
              <img src="/logo-cegente.png" alt="Logo Cegente" style={S("width:100%;height:100%;object-fit:contain;")} />
            </div>
          </div>
          <div style={S("text-align:center;display:flex;flex-direction:column;gap:12px;margin-top:8px;")}>
            <div style={S("font:700 12px Archivo;letter-spacing:.14em;color:#C82A1E;text-transform:uppercase;")}>VendaMais + Cegente · São José do Rio Preto</div>
            <h1 style={S("margin:0;font:800 34px/1.12 Archivo;letter-spacing:-.01em;color:#16181D;")}>Radar de Crescimento Comercial</h1>
            <p style={S("margin:0;font:400 17px/1.5 Archivo;color:#4C4F56;")}>Uma análise rápida para identificar os pontos que podem acelerar ou limitar o crescimento da sua empresa.</p>
          </div>
          <div style={S("background:#FFFFFF;border:1px solid #E6E1D6;border-radius:16px;padding:20px;display:flex;flex-direction:column;gap:10px;")}>
            <p style={S("margin:0;font:400 15px/1.55 Archivo;color:#33363C;")}>Antes de crescer mais, uma empresa precisa entender com clareza onde estão suas maiores oportunidades e gargalos comerciais. Este diagnóstico foi criado pela VendaMais para ajudar empresários e líderes comerciais a refletirem sobre estratégia, diferenciação, processo, equipe e execução.</p>
            <div style={S("display:flex;gap:8px;flex-wrap:wrap;margin-top:2px;")}>
              <span style={S("font:600 13px Archivo;color:#16181D;background:#EEEAE0;border-radius:999px;padding:6px 12px;")}>3 a 5 minutos</span>
              <span style={S("font:600 13px Archivo;color:#16181D;background:#EEEAE0;border-radius:999px;padding:6px 12px;")}>15 perguntas</span>
              <span style={S("font:600 13px Archivo;color:#16181D;background:#EEEAE0;border-radius:999px;padding:6px 12px;")}>Leitura imediata</span>
            </div>
          </div>
          {resumeAsk && (
            <div style={S("background:#FBF1EA;border:1px solid #E6C6A6;border-radius:14px;padding:16px;display:flex;flex-direction:column;gap:10px;")}>
              <div style={S("font:600 15px Archivo;color:#7A4A18;")}>Encontramos um preenchimento em andamento neste aparelho. Deseja continuar de onde parou?</div>
              <div style={S("display:flex;gap:10px;")}>
                <button onClick={onResume} style={S("flex:1;padding:12px;background:#C82A1E;color:#fff;border:none;border-radius:10px;font:600 15px Archivo;cursor:pointer;")}>Continuar</button>
                <button onClick={onDiscard} style={S("flex:1;padding:12px;background:#fff;color:#7A4A18;border:1px solid #E6C6A6;border-radius:10px;font:600 15px Archivo;cursor:pointer;")}>Começar de novo</button>
              </div>
            </div>
          )}
          <button onClick={startFlow} style={S("width:100%;padding:18px;background:#C82A1E;color:#fff;border:none;border-radius:14px;font:700 18px Archivo;cursor:pointer;box-shadow:0 6px 18px rgba(200,42,30,.26);")}>Iniciar diagnóstico</button>
          <p style={S("margin:0;text-align:center;font:400 13px/1.5 Archivo;color:#6B6F76;")}>Não é uma prova, é um espelho. Responda conforme a realidade atual da sua empresa — quanto mais honestas as respostas, mais útil será a leitura.</p>
          <div style={S("border-top:1px solid #E6E1D6;padding-top:16px;display:flex;justify-content:center;gap:18px;flex-wrap:wrap;")}>
            <a href="#" onClick={(e) => { e.preventDefault(); setScreen("reopen"); }} style={S("font:600 13px Archivo;")}>Reabrir leitura</a>
            <a href="/admin" style={S("font:600 13px Archivo;")}>Painel administrativo</a>
            <a href="/telao" style={S("font:600 13px Archivo;")}>Painel do evento</a>
          </div>
          <div style={S("text-align:center;font:400 11px Archivo;color:#B0AA9D;")}>Uma iniciativa VendaMais em parceria com Cegente.</div>
        </div>
      )}

      {screen === "ident" && (
        <div data-screen-label="Identificação" style={S("max-width:540px;margin:0 auto;padding:24px 20px 48px;display:flex;flex-direction:column;gap:18px;")}>
          <div style={S("display:flex;align-items:center;justify-content:space-between;")}>
            <button onClick={backHome} style={S("background:none;border:none;font:600 15px Archivo;color:#C82A1E;cursor:pointer;padding:8px 0;")}>‹ Voltar</button>
            <span style={S("font:600 12px Archivo;letter-spacing:.1em;color:#8A857A;text-transform:uppercase;")}>Etapa 1 de 3</span>
          </div>
          <div>
            <h2 style={S("margin:0 0 6px;font:800 26px Archivo;color:#16181D;")}>Sobre você</h2>
            <p style={S("margin:0;font:400 15px/1.5 Archivo;color:#4C4F56;")}>Usamos esses dados para gerar sua leitura e, se você desejar, enviar a devolutiva consultiva.</p>
          </div>
          {[
            { k: "nome", label: "Nome completo *", ph: "Seu nome", type: "text" },
            { k: "empresa", label: "Empresa *", ph: "Nome da empresa", type: "text" },
            { k: "email", label: "E-mail *", ph: "voce@empresa.com.br", type: "email" },
            { k: "whats", label: "WhatsApp *", ph: "(00) 00000-0000", type: "tel" },
          ].map((fld) => (
            <label key={fld.k} style={S("display:flex;flex-direction:column;gap:6px;")}>
              <span style={S("font:600 14px Archivo;color:#33363C;")}>{fld.label}</span>
              <input type={fld.type} value={(form as any)[fld.k]} onChange={(e) => setF(fld.k, e.target.value)} placeholder={fld.ph} style={S("padding:14px;border:1px solid #D8D2C4;border-radius:12px;font:400 16px Archivo;background:#fff;color:#16181D;")} />
            </label>
          ))}
          <div style={S("display:flex;gap:12px;")}>
            <label style={S("flex:1;display:flex;flex-direction:column;gap:6px;")}>
              <span style={S("font:600 14px Archivo;color:#33363C;")}>Cidade *</span>
              <input value={form.cidade} onChange={(e) => setF("cidade", e.target.value)} placeholder="Sua cidade" style={S("padding:14px;border:1px solid #D8D2C4;border-radius:12px;font:400 16px Archivo;background:#fff;color:#16181D;")} />
            </label>
            <label style={S("width:120px;display:flex;flex-direction:column;gap:6px;")}>
              <span style={S("font:600 14px Archivo;color:#33363C;")}>Estado *</span>
              <select value={form.uf} onChange={(e) => setF("uf", e.target.value)} style={S("padding:14px;border:1px solid #D8D2C4;border-radius:12px;font:400 16px Archivo;background:#fff;color:#16181D;")}>
                {["UF", ...D.ufs].map((u: string) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </label>
          </div>
          <div style={S("display:flex;flex-direction:column;gap:8px;")}>
            <span style={S("font:600 14px Archivo;color:#33363C;")}>Cargo ou função *</span>
            <div style={S("display:flex;flex-wrap:wrap;gap:8px;")}>
              {D.cargos.map((c: string) => {
                const ch = chip(c, form.cargo === c, () => setF("cargo", c));
                return (
                  <button key={c} onClick={ch.on} style={S(`padding:11px 14px;border-radius:999px;font:600 14px Archivo;cursor:pointer;border:1px solid ${ch.bc};background:${ch.bg};color:${ch.fg};`)}>{c}</button>
                );
              })}
            </div>
          </div>
          {errId && (
            <div style={S("background:#FBEDEC;border:1px solid #E4B4B1;border-radius:12px;padding:12px 14px;font:600 14px Archivo;color:#9A2B26;")}>{errId}</div>
          )}
          <button onClick={onIdentNext} style={S("width:100%;padding:16px;background:#C82A1E;color:#fff;border:none;border-radius:14px;font:700 17px Archivo;cursor:pointer;")}>Continuar</button>
        </div>
      )}

      {screen === "profile" && (
        <div data-screen-label="Perfil da empresa" style={S("max-width:540px;margin:0 auto;padding:24px 20px 48px;display:flex;flex-direction:column;gap:20px;")}>
          <div style={S("display:flex;align-items:center;justify-content:space-between;")}>
            <button onClick={() => setScreen("ident")} style={S("background:none;border:none;font:600 15px Archivo;color:#C82A1E;cursor:pointer;padding:8px 0;")}>‹ Voltar</button>
            <span style={S("font:600 12px Archivo;letter-spacing:.1em;color:#8A857A;text-transform:uppercase;")}>Etapa 2 de 3</span>
          </div>
          <div>
            <h2 style={S("margin:0 0 6px;font:800 26px Archivo;color:#16181D;")}>Sobre a empresa</h2>
            <p style={S("margin:0;font:400 15px/1.5 Archivo;color:#4C4F56;")}>Essas informações contextualizam sua leitura — elas não alteram sua pontuação.</p>
          </div>
          {[
            { title: "Segmento de atuação *", opts: D.segmentos, key: "segmento" },
            { title: "Equipe comercial *", opts: D.vends, key: "vend" },
            { title: "Unidades / filiais *", opts: D.unids, key: "unid" },
            { title: "Faixa de faturamento mensal *", opts: D.fats, key: "fat" },
          ].map((g) => (
            <div key={g.title} style={S("display:flex;flex-direction:column;gap:8px;")}>
              <span style={S("font:600 14px Archivo;color:#33363C;")}>{g.title}</span>
              <div style={S("display:flex;flex-wrap:wrap;gap:8px;")}>
                {g.opts.map((c: string) => {
                  const ch = chip(c, (form as any)[g.key] === c, () => setF(g.key, c));
                  return (
                    <button key={c} onClick={ch.on} style={S(`padding:11px 14px;border-radius:999px;font:600 14px Archivo;cursor:pointer;border:1px solid ${ch.bc};background:${ch.bg};color:${ch.fg};`)}>{c}</button>
                  );
                })}
              </div>
            </div>
          ))}
          <button onClick={() => setF("consent", !form.consent)} style={S(`display:flex;gap:12px;align-items:flex-start;text-align:left;padding:14px;border-radius:12px;cursor:pointer;border:1px solid ${form.consent ? "#1E7F4F" : "#D8D2C4"};background:${form.consent ? "#F2F8F3" : "#fff"};`)}>
            <span style={S(`flex:none;width:24px;height:24px;border-radius:7px;border:2px solid ${form.consent ? "#1E7F4F" : "#D8D2C4"};background:${form.consent ? "#1E7F4F" : "#fff"};color:#fff;font:700 15px/20px Archivo;text-align:center;`)}>{form.consent ? "✓" : ""}</span>
            <span style={S("font:400 13px/1.45 Archivo;color:#33363C;")}>Ao enviar minhas respostas, autorizo a VendaMais e a Cegente a utilizarem as informações para fins de análise, relacionamento e envio de comunicações relacionadas ao evento, conteúdos e possíveis conversas consultivas. Meus dados não serão vendidos a terceiros. *</span>
          </button>
          {errProf && (
            <div style={S("background:#FBEDEC;border:1px solid #E4B4B1;border-radius:12px;padding:12px 14px;font:600 14px Archivo;color:#9A2B26;")}>{errProf}</div>
          )}
          <button onClick={onProfNext} style={S("width:100%;padding:16px;background:#C82A1E;color:#fff;border:none;border-radius:14px;font:700 17px Archivo;cursor:pointer;")}>Continuar</button>
        </div>
      )}

      {screen === "scale" && (
        <div data-screen-label="Escala de respostas" style={S("max-width:540px;margin:0 auto;padding:24px 20px 48px;display:flex;flex-direction:column;gap:18px;")}>
          <div style={S("display:flex;align-items:center;justify-content:space-between;")}>
            <button onClick={() => setScreen("profile")} style={S("background:none;border:none;font:600 15px Archivo;color:#C82A1E;cursor:pointer;padding:8px 0;")}>‹ Voltar</button>
            <span style={S("font:600 12px Archivo;letter-spacing:.1em;color:#8A857A;text-transform:uppercase;")}>Etapa 3 de 3</span>
          </div>
          <div>
            <h2 style={S("margin:0 0 6px;font:800 26px Archivo;color:#16181D;")}>Como responder</h2>
            <p style={S("margin:0;font:400 15px/1.5 Archivo;color:#4C4F56;")}>A maioria das perguntas usa uma escala de concordância. Escolha o quanto cada afirmação representa a realidade da sua empresa hoje.</p>
          </div>
          <div style={S("display:flex;flex-direction:column;gap:10px;")}>
            {D.scale.map((s: any) => (
              <div key={s.v} style={S("display:flex;gap:14px;align-items:center;background:#fff;border:1px solid #E6E1D6;border-radius:14px;padding:14px;")}>
                <span style={S("flex:none;width:34px;height:34px;border-radius:10px;background:#EEEAE0;color:#23405C;font:800 16px/34px Archivo;text-align:center;")}>{s.v}</span>
                <strong style={S("font:700 15px Archivo;color:#16181D;")}>{s.t}</strong>
              </div>
            ))}
          </div>
          <button onClick={() => { const f = ans.findIndex((a, i) => i < 15 && a === undefined); setQi(f >= 0 ? f : 0); setScreen("quiz"); }} style={S("width:100%;padding:16px;background:#C82A1E;color:#fff;border:none;border-radius:14px;font:700 17px Archivo;cursor:pointer;")}>Começar o diagnóstico</button>
        </div>
      )}

      {screen === "quiz" && (() => {
        const i = qi;
        const q = D.q[i];
        const a = ans[i];
        const qDim = q.type === "scale" ? "Dimensão " + (q.dim + 1) + " · " + D.dims[q.dim].name : q.type === "open" ? "Pergunta aberta" : "Interesse";
        const qShowNext = q.type === "open" || (q.type === "single" && a !== undefined);
        const qNextLabel = i < 17 ? "Continuar" : "Ver minha leitura";
        const onQNext = () => {
          if (q.type === "open" && ans[i] === undefined) setOpen(i, "");
          if (i < 17) setQi(i + 1);
          else onGenerate();
        };
        return (
          <div data-screen-label="Questionário" style={S("max-width:540px;margin:0 auto;padding:16px 20px 48px;display:flex;flex-direction:column;gap:16px;")}>
            <div style={S("position:sticky;top:0;background:#F4F2ED;padding:8px 0 10px;z-index:5;")}>
              <div style={S("display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;")}>
                <button onClick={() => { if (i > 0) setQi(i - 1); else setScreen("scale"); }} style={S("background:none;border:none;font:600 14px Archivo;color:#C82A1E;cursor:pointer;padding:6px 0;")}>‹ Voltar</button>
                <span style={S("font:600 13px Archivo;color:#6B6F76;")}>{i + 1} de 18</span>
              </div>
              <div style={S("height:6px;background:#E4DFD3;border-radius:999px;overflow:hidden;")}>
                <div style={S(`height:6px;background:#C82A1E;border-radius:999px;transition:width .25s;width:${Math.round((i / 18) * 100)}%;`)} />
              </div>
            </div>
            <div style={S("font:700 12px Archivo;letter-spacing:.12em;color:#C82A1E;text-transform:uppercase;")}>{qDim}</div>
            <h2 style={S("margin:0;font:800 22px/1.32 Archivo;color:#16181D;")}>{q.t}</h2>
            {q.type === "scale" && (
              <div style={S("display:flex;flex-direction:column;gap:9px;")}>
                {D.scale.map((s: any) => {
                  const sel = a === s.v;
                  return (
                    <button key={s.v} onClick={() => answer(i, s.v)} style={S(`display:flex;gap:12px;align-items:center;text-align:left;padding:14px;border-radius:13px;cursor:pointer;border:2px solid ${sel ? "#C82A1E" : "#E6E1D6"};background:${sel ? "#FBF1EC" : "#fff"};min-height:56px;`)}>
                      <span style={S(`flex:none;width:30px;height:30px;border-radius:9px;background:${sel ? "#C82A1E" : "#EEEAE0"};color:${sel ? "#fff" : "#C82A1E"};font:800 15px/30px Archivo;text-align:center;`)}>{s.v}</span>
                      <strong style={S("font:700 15px Archivo;color:#16181D;")}>{s.t}</strong>
                    </button>
                  );
                })}
              </div>
            )}
            {q.type === "single" && (
              <div style={S("display:flex;flex-direction:column;gap:9px;")}>
                {q.opts.map((o: string) => {
                  const sel = a === o;
                  return (
                    <button key={o} onClick={() => answer(i, o)} style={S(`text-align:left;padding:14px;border-radius:13px;cursor:pointer;border:2px solid ${sel ? "#C82A1E" : "#E6E1D6"};background:${sel ? "#FBF1EC" : "#fff"};font:600 15px Archivo;color:#16181D;min-height:52px;`)}>{o}</button>
                  );
                })}
              </div>
            )}
            {q.type === "open" && (
              <div style={S("display:flex;flex-direction:column;gap:10px;")}>
                <textarea value={a || ""} onChange={(e) => setOpen(i, e.target.value)} rows={4} placeholder="Escreva com suas palavras (opcional)" style={S("padding:14px;border:1px solid #D8D2C4;border-radius:12px;font:400 16px Archivo;background:#fff;color:#16181D;resize:vertical;")} />
              </div>
            )}
            {qShowNext && (
              <button onClick={onQNext} style={S("width:100%;padding:15px;background:#C82A1E;color:#fff;border:none;border-radius:13px;font:700 16px Archivo;cursor:pointer;")}>{qNextLabel}</button>
            )}
            <div style={S("text-align:center;font:400 12px Archivo;color:#B0AA9D;")}>Suas respostas ficam salvas automaticamente neste aparelho.</div>
          </div>
        );
      })()}

      {screen === "proc" && (
        <div data-screen-label="Processando" style={S("max-width:540px;margin:0 auto;padding:100px 24px;display:flex;flex-direction:column;gap:22px;align-items:center;text-align:center;")}>
          {errGen ? (
            <>
              <div style={S("background:#FBEDEC;border:1px solid #E4B4B1;border-radius:12px;padding:14px 16px;font:600 14px/1.45 Archivo;color:#9A2B26;")}>{errGen}</div>
              <button onClick={onGenerate} style={S("width:100%;padding:16px;background:#C82A1E;color:#fff;border:none;border-radius:14px;font:700 17px Archivo;cursor:pointer;")}>Tentar novamente</button>
              <button onClick={() => { setQi(17); setScreen("quiz"); }} style={S("width:100%;padding:14px;background:#fff;color:#C82A1E;border:1px solid #E0BCA8;border-radius:14px;font:600 16px Archivo;cursor:pointer;")}>Revisar minhas respostas</button>
            </>
          ) : (
            <>
              <div style={S("width:54px;height:54px;border-radius:50%;border:5px solid #E4DFD3;border-top-color:#C82A1E;animation:rxspin .9s linear infinite;")} />
              <h2 style={S("margin:0;font:800 24px Archivo;color:#16181D;")}>Gerando sua leitura</h2>
              <p style={S("margin:0;font:400 16px/1.55 Archivo;color:#4C4F56;animation:rxpulse 2s ease infinite;")}>Estamos organizando suas respostas e identificando onde sua empresa está mais forte e onde pode haver gargalos.</p>
            </>
          )}
        </div>
      )}

      {screen === "reopen" && (
        <div data-screen-label="Reabrir leitura" style={S("max-width:460px;margin:0 auto;padding:40px 20px;display:flex;flex-direction:column;gap:16px;")}>
          <button onClick={backHome} style={S("align-self:flex-start;background:none;border:none;font:600 15px Archivo;color:#C82A1E;cursor:pointer;padding:6px 0;")}>‹ Voltar</button>
          <h2 style={S("margin:0;font:800 26px Archivo;color:#16181D;")}>Reabrir leitura</h2>
          <p style={S("margin:0;font:400 15px/1.5 Archivo;color:#4C4F56;")}>Digite o código que você recebeu na tela de resultado e no e-mail.</p>
          <input value={reopen} onChange={(e) => { setReopen(e.target.value); setReopenErr(""); }} placeholder="Ex.: RC-XXXXXXXX-XXXXXXXX-XXXXXXXX" style={S("padding:16px;border:1px solid #D8D2C4;border-radius:12px;font:600 17px ui-monospace,monospace;background:#fff;color:#16181D;text-transform:uppercase;")} />
          {reopenErr && (
            <div style={S("background:#FBEDEC;border:1px solid #E4B4B1;border-radius:12px;padding:12px 14px;font:600 14px Archivo;color:#9A2B26;")}>{reopenErr}</div>
          )}
          <button onClick={onReopenGo} style={S("padding:16px;background:#C82A1E;color:#fff;border:none;border-radius:12px;font:700 16px Archivo;cursor:pointer;")}>Abrir leitura</button>
        </div>
      )}
    </div>
  );
}
