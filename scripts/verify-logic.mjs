// Verificação da lógica do Radar contra o protótipo
// "Radar de Crescimento Comercial.dc.html".
//
// O que É conferido (deve bater 100% com o protótipo):
//   - as 15+3 perguntas (texto, tipo, dimensão e opções) e a escala 1..5;
//   - nomes e faixas internas das 4 classificações (15..75);
//   - nomes das 5 dimensões;
//   - catálogos (UFs, cargos, segmentos, equipes, unidades, faturamentos);
//   - bandOf (thresholds/cores/rótulos) em toda a faixa 3..15;
//   - compute (somas, classificação, forte, gargalo) e lead nos participantes
//     de demonstração do protótipo.
//
// O que NÃO é mais comparado literalmente: os textos consultivos
// (descrições de classificação, leituras, prioridades, diagnóstico central),
// aprofundados a pedido da VendaMais. A escala de EXIBIÇÃO é 0..100 / 0..10
// (conversão linear das somas brutas) e é conferida nos extremos abaixo.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import ts from "typescript";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

// 1) Extrai a classe Component do protótipo e obtém DATA/compute/bandOf/lead.
const html = fs.readFileSync(path.join(root, "Radar de Crescimento Comercial.dc.html"), "utf8");
const m = html.match(/<script[^>]*data-dc-script[^>]*>([\s\S]*?)<\/script>/);
if (!m) throw new Error("Script do protótipo não encontrado.");
const classCode = m[1].slice(m[1].indexOf("class Component"));
const factory = new Function("DCLogic", classCode + "\nreturn Component;");
class DCLogic {}
const Component = factory(DCLogic);
const proto = new Component();
const P = { DATA: proto.DATA, compute: proto.compute.bind(proto), bandOf: proto.bandOf.bind(proto), lead: proto.lead.bind(proto) };

// 2) Transpila e importa a minha lógica.
const tsSrc = fs.readFileSync(path.join(root, "src/lib/radar-logic.ts"), "utf8");
const js = ts.transpileModule(tsSrc, { compilerOptions: { module: "ESNext", target: "ES2020" } }).outputText;
const tmp = path.join(__dirname, "_radar-logic.mjs");
fs.writeFileSync(tmp, js);
const mine = await import(pathToFileURL(tmp).href);
fs.unlinkSync(tmp);

let failures = 0;
const check = (name, ok, detail = "") => {
  if (!ok) {
    failures++;
    console.log(`  ✗ ${name} ${detail}`);
  }
};

// 3) Perguntas, escala, faixas e catálogos idênticos.
const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const pick = (arr, keys) => arr.map((o) => Object.fromEntries(keys.map((k) => [k, o[k]])));
check("dims (nomes)", eq(pick(P.DATA.dims, ["name", "short"]), pick(mine.DATA.dims, ["name", "short"])));
check("q (perguntas)", eq(pick(P.DATA.q, ["type", "dim", "t", "key", "opts"]), pick(mine.DATA.q, ["type", "dim", "t", "key", "opts"])));
check("scale", eq(P.DATA.scale, mine.DATA.scale));
check("classes (faixas e nomes)", eq(pick(P.DATA.classes, ["min", "max", "name"]), pick(mine.DATA.classes, ["min", "max", "name"])));
check("nextSteps (chaves)", eq(Object.keys(P.DATA.nextSteps).sort(), Object.keys(mine.DATA.nextSteps).sort()));
check("ufs", eq(P.DATA.ufs, mine.DATA.ufs));
check("cargos", eq(P.DATA.cargos, mine.DATA.cargos));
check("segmentos", eq(P.DATA.segmentos, mine.DATA.segmentos));
check("vends", eq(P.DATA.vends, mine.DATA.vends));
check("unids", eq(P.DATA.unids, mine.DATA.unids));
check("fats", eq(P.DATA.fats, mine.DATA.fats));

// 4) bandOf idêntico em toda a faixa 3..15.
for (let s = 3; s <= 15; s++) check(`bandOf(${s})`, eq(P.bandOf(s), mine.bandOf(s)), JSON.stringify([P.bandOf(s), mine.bandOf(s)]));

// 5) compute + lead idênticos (parte numérica) nos participantes de demo.
const demo = P.DATA.demo || [];
let cases = 0;
for (const r of demo) {
  const ans = r.ans;
  const a = P.compute(ans);
  const b = mine.compute(ans);
  const norm = (x) => ({
    overall: x.overall,
    cls: x.cls ? x.cls.name : null,
    strong: x.strong ? [x.strong.name, x.strong.score] : null,
    gap: x.gap ? [x.gap.name, x.gap.score] : null,
    dims: x.dims.map((d) => d.score),
    interesse: x.interesse,
    tema: x.tema,
    obstaculo: x.obstaculo,
  });
  check(`compute ${r.code}`, eq(norm(a), norm(b)), JSON.stringify([norm(a), norm(b)]));
  const rr = { cargo: r.cargo, fat: r.fat, vend: r.vend, ans };
  check(`lead ${r.code}`, eq(P.lead(rr), mine.lead(rr)), JSON.stringify([P.lead(rr), mine.lead(rr)]));
  cases++;
}

// 6) Escala de exibição: conversão linear 15..75 → 0..100 e 3..15 → 0..10.
check("score100(15)=0", mine.score100(15) === 0);
check("score100(45)=50", mine.score100(45) === 50);
check("score100(75)=100", mine.score100(75) === 100);
check("dim10(3)=0", mine.dim10(3) === 0);
check("dim10(9)=5", mine.dim10(9) === 5);
check("dim10(15)=10", mine.dim10(15) === 10);
check("fmt10(4.2)", mine.fmt10(4.2) === "4,2");
check("fmt10(10)", mine.fmt10(10) === "10");

// 7) Camada de interpretação presente e consistente.
check("qInsights (15)", mine.DATA.qInsights.length === 15 && mine.DATA.qInsights.every((q) => q.prob && q.cons && q.act));
check("dimReadings (5×3)", mine.DATA.dimReadings.length === 5 && mine.DATA.dimReadings.every((d) => d.critico && d.desenvolvimento && d.estruturado));
check("rules (9)", mine.DATA.rules.length === 9 && mine.DATA.rules.every((r) => r.id && r.title && r.msg));
const full = mine.compute([2, 2, 2, 3, 2, 3, 2, 2, 1, 3, 2, 2, 2, 2, 2, "obst", "Sim, por WhatsApp", "Estratégia comercial"]);
check("compute.prios (3)", full.prios.length === 3 && full.prios.every((p) => p.prob && p.cons && p.act));
check("compute.rule", !!full.rule && !!full.rule.msg);
check("compute.plan (3)", full.plan.length === 3 && full.plan.every((p) => p.act));
check("compute.readings", full.dims.every((d) => d.reading));
const partial = mine.compute([3, 3, 2, 4, 3]);
check("compute parcial não quebra", Array.isArray(partial.prios) && partial.dims.length === 5);

if (failures === 0) {
  console.log(`✓ Matemática idêntica ao protótipo — perguntas, escala, faixas, bandOf(3..15) e compute/lead em ${cases} participantes de demonstração. Exibição 0-100/0-10 e camada de interpretação conferidas.`);
  process.exit(0);
} else {
  console.log(`\n✗ ${failures} divergência(s) encontrada(s).`);
  process.exit(1);
}
