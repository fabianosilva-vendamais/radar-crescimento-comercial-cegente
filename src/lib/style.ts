import type { CSSProperties } from "react";

/**
 * Converte uma string CSS inline ("prop:val;prop:val") em objeto de estilo do
 * React. Permite reproduzir VERBATIM os estilos inline do protótipo, evitando
 * erros de transcrição e preservando a identidade visual exatamente.
 */
export function S(css: string): CSSProperties {
  const style: Record<string, string> = {};
  for (const rule of css.split(";")) {
    const idx = rule.indexOf(":");
    if (idx < 0) continue;
    const prop = rule.slice(0, idx).trim();
    const val = rule.slice(idx + 1).trim();
    if (!prop) continue;
    const camel = prop.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    style[camel] = val;
  }
  return style as CSSProperties;
}
