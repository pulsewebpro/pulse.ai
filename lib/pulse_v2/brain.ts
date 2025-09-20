import type { SessionState, ChatMessage } from './types';

function lastUserText(messages: ChatMessage[]): string {
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i];
    if (m && m.role === 'user' && typeof m.content === 'string') return m.content;
  }
  return '';
}

export async function nextAssistant(arg1?: any, arg2?: any): Promise<{
  text: string;
  reply: string;
  actions: any[];
  state: SessionState;
  chips?: string[];
}> {
  let messages: ChatMessage[] = [];
  let prev: SessionState = { history: [], lang: 'es', premium: false };

  if (Array.isArray(arg1)) {
    // firma antigua: (messages, state)
    messages = arg1 as ChatMessage[];
    prev = (arg2 as SessionState) ?? prev;
  } else if (arg1 && typeof arg1 === 'object') {
    // firma nueva: ({ messages?, state?, text?/prompt?/message? })
    if (Array.isArray(arg1.messages)) messages = arg1.messages as ChatMessage[];
    if (arg1.state) prev = { ...prev, ...(arg1.state as SessionState) };
    const maybe = arg1.text ?? arg1.prompt ?? arg1.message;
    if (maybe) messages.push({ role: 'user', content: String(maybe) });
  }

  const textIn = lastUserText(messages);

  const reply = textIn
    ? `Preview lista para: ${textIn}`
    : 'Hola, soy Pulse ☕⚡. Dime tu idea y te saco una preview.';

  const clean: ChatMessage[] = [];
  if (textIn) clean.push({ role: 'user', content: textIn });
  clean.push({ role: 'assistant', content: reply });

  const state: SessionState = { ...prev, history: [ ...(prev.history ?? []), ...clean ] };

  return { text: reply, reply, actions: [], state, chips: ['Hero','Grid','CTA'] };
}

export const PULSE_BRAIN_VERSION = 'safe-stub-v2';
