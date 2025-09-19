// PULSE · Tipos para Chat AMIGO (v2)
export type Role = "user" | "assistant";

export type PulseActionType =
  | "CREATE_PREVIEW"        // generar imagen preview 16:9
  | "APPLY_TWEAK"           // mini-edición post-imagen (color/tono/cta)
  | "SHOW_PLANS_GATED"      // mostrar planes solo tras señal positiva
  | "GENERATE_SITE_ZIP"     // preparar ZIP Next.js 5€
  | "OPEN_CHECKOUT";        // simular checkout

export type PulseAction = {
  type: PulseActionType;
  payload?: Record<string, any>;
};

export type ChatMessage = {
  role: Role;
  content: string;
  kind?: "text" | "preview" | "plans";
  previewUrl?: string;
};
