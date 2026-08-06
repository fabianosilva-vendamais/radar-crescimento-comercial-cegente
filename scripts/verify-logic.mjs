// Verificação: a lógica portada (src/lib/radar-logic.ts) reproduz EXATAMENTE
// o protótipo "Radar de Crescimento Comercial.dc.html" — constantes de negócio
// e cálculos (compute / bandOf / lead), conferidos nos participantes de demo.
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

// 3) Constantes de negócio idênticas.
const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const pick = (arr, keys) => arr.map((o) => Object.fromEntries(keys.map((k) => [k, o[k]])));
check("dims", eq(pick(P.DATA.dims, ["name", "short", "strong", "rec"]), pick(mine.DATA.dims, ["name", "short", "strong", "rec"])));
check("q", eq(pick(P.DATA.q, ["type", "dim", "t", "key", "opts"]), pick(mine.DATA.q, ["type", "dim", "t", "key", "opts"])));
check("scale", eq(P.DATA.scale, mine.DATA.scale));
check("classes", eq(P.DATA.classes, mine.DATA.classes));
check("ufs", eq(P.DATA.ufs, mine.DATA.ufs));
check("cargos", eq(P.DATA.cargos, mine.DATA.cargos));
check("segmentos", eq(P.DATA.segmentos, mine.DATA.segmentos));
check("vends", eq(P.DATA.vends, mine.DATA.vends));
check("unids", eq(P.DATA.unids, mine.DATA.unids));
check("fats", eq(P.DATA.fats, mine.DATA.fats));
check("nextSteps", eq(P.DATA.nextSteps, mine.DATA.nextSteps));

// 4) bandOf idêntico em toda a faixa 3..15.
for (let s = 3; s <= 15; s++) check(`bandOf(${s})`, eq(P.bandOf(s), mine.bandOf(s)), JSON.stringify([P.bandOf(s), mine.bandOf(s)]));

// 5) compute + lead idênticos em todos os participantes de demonstração.
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

if (failures === 0) {
  console.log(`✓ Lógica idêntica ao protótipo — 11 blocos de constantes, bandOf(3..15) e compute/lead em ${cases} participantes de demonstração.`);
  process.exit(0);
} else {
  console.log(`\n✗ ${failures} divergência(s) encontrada(s).`);
  process.exit(1);
}
