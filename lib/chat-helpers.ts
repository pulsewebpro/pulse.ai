export type ChatMsg = { role: "system" | "user" | "assistant"; content: string };

const TOKENS_PER_CHAR = 0.25;

export function trimHistory(messages: ChatMsg[], maxTokens = 2200): ChatMsg[] {
  if (!messages?.length) return [];
  const kept: ChatMsg[] = [];
  let budget = maxTokens;

  const last = messages[messages.length - 1];
  budget -= est(last.content);
  kept.unshift(last);

  for (let i = messages.length - 2; i >= 0; i--) {
    const m = messages[i];
    const t = est(m.content);
    if (t <= budget) { kept.unshift(m); budget -= t; } else break;
  }
  return kept;
}

export function sanitizeMessageContent(text: string) {
  return (text || "")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, 5000);
}

export function est(text: string) {
  return Math.ceil((text || "").length * TOKENS_PER_CHAR);
}

/** Guarda suave de líneas: recorta a N líneas máximo. */
export function guardMaxLines(text: string, maxLines: number) {
  const lines = (text || "").split(/\r?\n/);
  if (lines.length <= maxLines) return text;
  return lines.slice(0, maxLines).join("\n") + " …";
}
