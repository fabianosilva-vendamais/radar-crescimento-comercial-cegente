import { randomBytes } from "crypto";

/**
 * Código de relatório LONGO e NÃO ADIVINHÁVEL para a rota /r/{codigo}.
 * Formato: RC-XXXXXXXX-XXXXXXXX-XXXXXXXX (24 caracteres de entropia,
 * ~120 bits) usando um alfabeto base32 sem caracteres ambíguos.
 */
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // sem I, L, O, 0, 1 (mesmo alfabeto do protótipo)

export function genReportCode(): string {
  const bytes = randomBytes(24);
  let out = "";
  for (let i = 0; i < 24; i++) {
    if (i === 8 || i === 16) out += "-";
    out += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return "RC-" + out;
}
