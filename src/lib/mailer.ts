import nodemailer, { type Transporter } from "nodemailer";
import { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } from "./env";

/**
 * Envio de e-mail via Nodemailer + SMTP (Gmail).
 * - Fila: os envios são serializados (um por vez) para não sobrecarregar o
 *   SMTP em picos de conclusões simultâneas.
 * - Até 3 tentativas em caso de erro, com backoff curto.
 * - Todas as credenciais vêm de variáveis de ambiente.
 */

let _transporter: Transporter | null = null;
function getTransporter(): Transporter {
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    throw new Error(
      "Configuração SMTP ausente: defina SMTP_HOST, SMTP_PORT, SMTP_USER e SMTP_PASS."
    );
  }
  if (!_transporter) {
    _transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465, // 465 = SSL; 587 = STARTTLS
      auth: { user: SMTP_USER, pass: SMTP_PASS },
      connectionTimeout: 8000,
      greetingTimeout: 8000,
      socketTimeout: 12000,
      pool: true,
      maxConnections: 1,
      maxMessages: 50,
    });
  }
  return _transporter;
}

const MAX_TRIES = 3;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Fila serial simples (cadeia de promises no mesmo processo).
let chain: Promise<any> = Promise.resolve();
function enqueue<T>(task: () => Promise<T>): Promise<T> {
  const run = chain.then(task, task);
  // impede que um erro na fila derrube os próximos itens
  chain = run.then(
    () => undefined,
    () => undefined
  );
  return run;
}

export type SendResult = { ok: boolean; tries: number; error: string };

async function sendOnce(to: string, subject: string, html: string): Promise<void> {
  const transporter = getTransporter();
  await transporter.sendMail({ from: "VendaMais <" + SMTP_USER + ">", to, subject, html });
}

/**
 * Enfileira o envio com até 3 tentativas. Resolve com o status final
 * (nunca rejeita) para que a rota possa registrar o resultado no banco.
 */
export function queueSend(to: string, subject: string, html: string): Promise<SendResult> {
  return enqueue(async () => {
    let lastErr = "";
    for (let attempt = 1; attempt <= MAX_TRIES; attempt++) {
      try {
        await sendOnce(to, subject, html);
        return { ok: true, tries: attempt, error: "" };
      } catch (e: any) {
        lastErr = (e && (e.message || String(e))) || "Falha desconhecida no envio";
        if (attempt < MAX_TRIES) await sleep(attempt * 800); // 800ms, 1600ms
      }
    }
    return { ok: false, tries: MAX_TRIES, error: lastErr };
  });
}
