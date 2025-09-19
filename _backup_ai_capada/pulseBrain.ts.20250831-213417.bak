import frases from "../locales/es/pulse-chat.json";

export type BrainOutput = {
  state: "feedback" | "cierre" | "error";
  text: string;
  mood: "neutral" | "celebrate" | "oops";
};

const sectores: Record<string, keyof typeof frases["sector"]> = {
  "café": "cafeteria", "cafetería": "cafeteria", "barista": "cafeteria",
  "abogado": "abogado", "legal": "abogado", "despacho": "abogado",
  "restaurante": "restaurante", "carta": "restaurante", "menú": "restaurante",
  "tienda": "ecommerce", "ecommerce": "ecommerce", "carrito": "ecommerce",
  "hotel": "hotel", "habitaciones": "hotel", "reserva": "hotel",
  "portfolio": "creativo", "creativo": "creativo", "fotógrafo": "creativo", "diseñador": "creativo"
};

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random()*arr.length)]; }
export function frase(categoria: keyof typeof frases){ return pick(frases[categoria]); }

export function sectorize(input: string): string | null {
  const lower = input.toLowerCase();
  for (const key of Object.keys(sectores)) {
    if (lower.includes(key)) return sectores[key];
  }
  return null;
}

export function respondLocal(userText: string): BrainOutput {
  const sectorKey = sectorize(userText);
  const sectorLines = sectorKey ? frases.sector[sectorKey] : null;
  const lead = sectorLines ? pick(sectorLines) : pick(frases.feedback);
  const tail = pick(frases.cierre);
  const text = `${lead} ${tail}`;
  return { state: "cierre", text, mood: "celebrate" };
}
