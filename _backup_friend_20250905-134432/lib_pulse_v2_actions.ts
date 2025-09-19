import type { ParsedAssistant, PulseAction } from "./types";
export const parseAssistant = (raw: string): ParsedAssistant => {
  const actions: PulseAction[] = [];
  const block = /@@ACTION\s*([\s\S]*?)\s*@@END/gm;
  let m: RegExpExecArray | null;
  while ((m = block.exec(raw)) !== null) {
    try {
      const obj = JSON.parse(m[1].trim());
      if (obj?.type && obj?.payload) actions.push({ type: obj.type, payload: obj.payload });
    } catch { /* ignora */ }
  }
  const text = raw.replace(block, "").trim();
  return { text, actions };
};
