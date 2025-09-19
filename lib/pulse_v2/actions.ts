// PULSE · Parser simple de @ACTION{} y utilidades de señal
import type { PulseAction, PulseActionType } from "./types";

const actionRe = /@ACTION\s*\{([\s\S]*?)\}/gm;

export const parseAssistant = (raw: string): { text: string; actions: PulseAction[] } => {
  const actions: PulseAction[] = [];
  let text = raw;

  let m: RegExpExecArray | null;
  while ((m = actionRe.exec(raw)) !== null) {
    try {
      const obj = JSON.parse(m[1].trim());
      if (obj?.type) actions.push({ type: obj.type as PulseActionType, payload: obj.payload || {} });
    } catch { /* ignora bloque inválido */ }
  }
  text = raw.replace(actionRe, "").trim();
  return { text, actions };
};

// Señales para consent-gating (planes)
const POSITIVE = ["ok","dale","sí","si","me gusta","me encanta","seguir","continuar","perfecto","genial","vamos","vale","va","okey","okey!","ok!"];
export const hasPositiveSignal = (s: string) => {
  const t = (s||"").toLowerCase();
  return POSITIVE.some(p => t.includes(p));
};

// Heurísticas rápidas
export const wantsChange = (s: string) => {
  const t = (s||"").toLowerCase();
  return /(cambia|cambiar|otro|más|menos|minimal|tech|color|tono|cta)/.test(t);
};

export const intentFrom = (s: string): "sell"|"book"|"leads"|"other" => {
  const t = (s||"").toLowerCase();
  if (/(vender|venta|tienda|e-?commerce|comprar|cartas|productos|shop)/.test(t)) return "sell";
  if (/(reserva|reservas|cita|booking|agenda|turno)/.test(t)) return "book";
  if (/(lead|contacto|captar|clientes|consulta)/.test(t)) return "leads";
  return "other";
};
