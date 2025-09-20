import type { SessionState, ChatMessage } from './types';

/** Stub seguro para compilar y desplegar. Reemplazable luego por el real. */
export async function nextAssistant(input?: any): Promise<{ reply: string; state: SessionState; chips?: string[] }> {
  const text  = input?.text ?? input?.prompt ?? input?.message ?? '';
  const prev: SessionState = input?.state ?? { history: [], lang: 'es', premium: false };
  const reply = text
    ? `Preview lista para: ${text}`
    : 'Hola, soy Pulse ☕⚡. Dime tu idea y te saco una preview.';

  const clean: ChatMessage[] = [];
  if (text) clean.push({ role:'user', content:text });
  clean.push({ role:'assistant', content:reply });

  const state: SessionState = { ...prev, history: [...(prev.history||[]), ...clean] };
  return { reply, state, chips: ['Hero', 'Grid', 'CTA'] };
}

export const PULSE_BRAIN_VERSION = 'safe-stub-v1';
