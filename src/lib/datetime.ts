/**
 * Formata dia (dd/mm) e hora (HH:MM) no fuso do evento (America/Sao_Paulo),
 * reproduzindo o formato do protótipo (toLocaleDateString('pt-BR').slice(0,5)
 * e toTimeString().slice(0,5)).
 */
export function diaHora(iso: string): { dia: string; hora: string } {
  const d = new Date(iso);
  const parts = new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(d);
  const get = (t: string) => parts.find((p) => p.type === t)?.value || "";
  return { dia: `${get("day")}/${get("month")}`, hora: `${get("hour")}:${get("minute")}` };
}
