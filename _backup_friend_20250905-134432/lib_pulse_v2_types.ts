export type Role = "user" | "assistant" | "system";
export type ChatMessage = { role: Role; content: string };

export type PulseActionType =
  | "CREATE_PREVIEW"
  | "OFFER_PLANS"
  | "GENERATE_SITE_ZIP"
  | "OPEN_CHECKOUT";

export type PulseAction = { type: PulseActionType; payload: Record<string, any> };
export type ParsedAssistant = { text: string; actions: PulseAction[] };
