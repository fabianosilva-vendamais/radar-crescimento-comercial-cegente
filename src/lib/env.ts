/**
 * Leitura centralizada de variáveis de ambiente.
 * Todas as chaves ficam SOMENTE em variáveis de ambiente — nunca no código.
 * Aceita tanto os nomes NEXT_PUBLIC_* (necessários no navegador) quanto os
 * nomes sem prefixo no servidor.
 *
 * Compatível com o novo formato de chaves do Supabase:
 *   - chave publicável  (sb_publishable_...) → substitui a "anon key"
 *   - chave secreta      (sb_secret_...)     → substitui a "service_role key"
 * A biblioteca @supabase/supabase-js aceita ambos os formatos como substitutos
 * diretos — basta trocar o VALOR da variável.
 */

export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";

// Chave pública (navegador): anon key OU chave publicável (sb_publishable_...)
export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  "";

// Somente servidor — jamais exposto ao navegador.
// service_role key OU chave secreta (sb_secret_...)
export const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SECRET_KEY ||
  "";

export const SMTP_HOST = process.env.SMTP_HOST || "";
export const SMTP_PORT = parseInt(process.env.SMTP_PORT || "465", 10);
export const SMTP_USER = process.env.SMTP_USER || "";
export const SMTP_PASS = process.env.SMTP_PASS || "";
export const EMAIL_FROM =
  process.env.EMAIL_FROM || "VendaMais + Cegente";

/**
 * URL pública base para o link do relatório no e-mail: {REPORT_BASE_URL}/r/{codigo}
 * Fallback para a URL da Vercel quando REPORT_BASE_URL não estiver definida.
 */
export function reportBaseUrl(): string {
  const explicit = process.env.REPORT_BASE_URL;
  if (explicit) return explicit.replace(/\/+$/, "");
  const vercel = process.env.VERCEL_URL;
  if (vercel) return `https://${vercel}`.replace(/\/+$/, "");
  return "";
}
