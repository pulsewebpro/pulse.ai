import type { ChatMsg } from "./chat-helpers";

export function getPhaseInstruction(history: ChatMsg[], maxLines: number) {
  const assistantTurns = history.filter(m => m.role === "assistant").length;

  const BASE = `
REGLAS DURAS:
- Máx ${maxLines} líneas, siempre en 2 bloques.
- ❌ No listas ni markdown largos.
- ✅ Siempre A/B concretos.
- Cierres variados (no repitas la misma fórmula).
- Cada 3–4 turnos: añade celebración ligera.
- Reutiliza términos clave del usuario en cada micro-entrega.
`;

  if (assistantTurns <= 1) {
    return BASE + `
FASE 1 (inicio):
- Refleja la idea del usuario.
- Pregunta A/B inicial de dirección.
- Micro-entrega: 1 titular breve.
- Cliffhanger variado para invitar a elegir.
`;
  }
  if (assistantTurns === 2) {
    return BASE + `
FASE 2 (primer ladrillo):
- Usa palabras exactas del usuario.
- Propón UNA pieza (ej. Hero o CTA inicial).
- Pregunta A/B clara: variante A o B.
- Cliffhanger: “¿Quieres afinar esto o paso al siguiente paso?”
`;
  }
  return BASE + `
FASE PROGRESIVA:
- Avanza ficha a ficha con A/B en cada paso.
- Máx 5 líneas, 2 bloques obligatorios.
- Cada 3–4 turnos: celebra con tono entusiasta y humor café.
- Alterna cierres: evita repeticiones.
`;
}
