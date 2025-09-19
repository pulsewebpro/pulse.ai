type Usage = { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number } | null | undefined;

const EUR_PER_1K_PROMPT = Number(process.env.PULSE_EUR_PER_1K_PROMPT || "0.003");     // placeholder prudente
const EUR_PER_1K_COMPLETION = Number(process.env.PULSE_EUR_PER_1K_COMPLETION || "0.009"); // placeholder prudente

export function estimateCostEUR(usage: Usage) {
  if (!usage) return 0;
  const pin = usage.prompt_tokens || 0;
  const pout = usage.completion_tokens || 0;
  const cost = (pin / 1000) * EUR_PER_1K_PROMPT + (pout / 1000) * EUR_PER_1K_COMPLETION;
  return Number(cost.toFixed(5));
}

export function msFmt(ms: number) {
  if (ms < 1000) return `${ms} ms`;
  const s = (ms / 1000).toFixed(2);
  return `${s}s`;
}
