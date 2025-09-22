import { PULSE_GUARDADO, PulseGoal } from "./persona";

export type PulseMemory = {
  name?: string;
  goal?: PulseGoal;
  sector?: string;
  style?: string;
  lastIdea?: string;
  jokesOn: boolean;
  createdAt: number;
  visits: number;
  version: string;
};

const KEY_MEM = `pulse.mem.${PULSE_GUARDADO}`;
const KEY_LOG = `pulse.log.${PULSE_GUARDADO}`;

// Back-compat: migrar claves antiguas si existen
const LEGACY_KEYS = [
  "pulseMemoryV1","pulseChatLogV1","pulsePersona_guardado7","pulseChat_guardado7"
];

export function migrateIfNeeded() {
  try {
    const existing = localStorage.getItem(KEY_MEM);
    if (!existing) {
      for (const k of LEGACY_KEYS) {
        const v = localStorage.getItem(k);
        if (v) {
          localStorage.setItem(KEY_MEM, v);
          // No borramos por si el usuario vuelve atrás
          break;
        }
      }
    }
  } catch {}
}

export function loadMemory(): PulseMemory {
  migrateIfNeeded();
  try {
    const raw = localStorage.getItem(KEY_MEM);
    if (raw) {
      const m = JSON.parse(raw) as PulseMemory;
      return { ...m, visits: (m.visits || 0) + 1 };
    }
  } catch {}
  return {
    jokesOn: true,
    goal: "desconocido",
    createdAt: Date.now(),
    visits: 1,
    version: PULSE_GUARDADO,
  };
}
export function saveMemory(m: PulseMemory){ localStorage.setItem(KEY_MEM, JSON.stringify(m)); }

export type Msg = { role: "pulse"|"user"|"system"; text: string; ts?: number };
export function loadLog(): Msg[] {
  migrateIfNeeded();
  try {
    const raw = localStorage.getItem(KEY_LOG);
    if (raw) return JSON.parse(raw) as Msg[];
  } catch {}
  return [];
}
export function saveLog(arr: Msg[]){ localStorage.setItem(KEY_LOG, JSON.stringify(arr)); }
