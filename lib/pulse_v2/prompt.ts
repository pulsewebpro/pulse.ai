export type PromptInput = { text?: string; sector?: string; lang?: 'es'|'en'|'fr' };

export function buildPrompt(input: PromptInput = {}): string {
  const t = (input.text || 'landing minimalista').trim();
  const s = input.sector ? ` (${input.sector})` : '';
  return `Genera preview para: ${t}${s}. Estilo limpio, A11y AA, CTA claro.`;
}

/* Compatibilidad: import {prompt} / import default */
export const prompt = buildPrompt;
export default buildPrompt;
