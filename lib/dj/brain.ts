export type PlanKey = "ventas" | "reservas" | "blog" | "creador" | "social";

/**
 * Estado mínimo que usa el generador para decidir copy/preview/flags.
 * Añade campos si tu app los requiere, pero estos bastan para compilar.
 */
export type BrainMem = {
  plan: PlanKey;
  locale: "es" | "en" | "fr";
  watermark: boolean;
  memoryPremium: boolean;
  previewReady: boolean;
};

/** Valores por defecto seguros */
export const defaultBrain: BrainMem = {
  plan: "ventas",
  locale: "es",
  watermark: true,
  memoryPremium: false,
  previewReady: false,
};

/** Estado in-memory súper simple (puedes reemplazar por tu store real) */
let _brain: BrainMem = { ...defaultBrain };

export function getBrain(): BrainMem {
  return _brain;
}

export function setBrain(update: Partial<BrainMem>) {
  _brain = { ..._brain, ...update };
}

/** Helpers rápidos */
export const markPreviewReady = () => setBrain({ previewReady: true });
export const enableWatermark = () => setBrain({ watermark: true });
export const disableWatermark = () => setBrain({ watermark: false });
