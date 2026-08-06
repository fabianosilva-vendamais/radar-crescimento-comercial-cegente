"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { S } from "@/lib/style";
import ResultView from "@/components/ResultView";

export default function ReportPage() {
  const params = useParams();
  const router = useRouter();
  const codigo = decodeURIComponent(String(params?.codigo || "")).toUpperCase();
  const [state, setState] = useState<"loading" | "ok" | "notfound">("loading");
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const r = await fetch(`/api/report?code=${encodeURIComponent(codigo)}`);
        if (!r.ok) {
          if (alive) setState("notfound");
          return;
        }
        const d = await r.json();
        if (alive) {
          setData(d);
          setState("ok");
        }
      } catch {
        if (alive) setState("notfound");
      }
    })();
    return () => {
      alive = false;
    };
  }, [codigo]);

  return (
    <div style={S("min-height:100vh;font-family:'Archivo',system-ui,sans-serif;color:#16181D;background:#F4F2ED;")}>
      {state === "loading" && (
        <div data-screen-label="Carregando" style={S("max-width:540px;margin:0 auto;padding:100px 24px;display:flex;flex-direction:column;gap:22px;align-items:center;text-align:center;")}>
          <div style={S("width:54px;height:54px;border-radius:50%;border:5px solid #E4DFD3;border-top-color:#C82A1E;animation:rxspin .9s linear infinite;")} />
          <p style={S("margin:0;font:400 16px/1.55 Archivo;color:#4C4F56;")}>Abrindo sua leitura…</p>
        </div>
      )}
      {state === "notfound" && (
        <div data-screen-label="Não encontrado" style={S("max-width:460px;margin:0 auto;padding:60px 20px;display:flex;flex-direction:column;gap:16px;text-align:center;")}>
          <h2 style={S("margin:0;font:800 26px Archivo;color:#16181D;")}>Leitura não encontrada</h2>
          <p style={S("margin:0;font:400 15px/1.5 Archivo;color:#4C4F56;")}>Confira o código no e-mail ou na tela final do diagnóstico.</p>
          <a href="/" onClick={(e) => { e.preventDefault(); router.push("/"); }} style={S("font:600 15px Archivo;")}>Voltar ao início</a>
        </div>
      )}
      {state === "ok" && data && (
        <ResultView profile={data.profile} ans={data.ans} backLabel="Voltar" onBack={() => router.push("/")} />
      )}
    </div>
  );
}
