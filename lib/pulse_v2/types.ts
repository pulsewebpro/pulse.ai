export type Role = 'user' | 'assistant' | 'system';
export interface ChatMessage { role: Role; content: string; ts?: number; }

export type Stage = 'warmup' | 'collect' | 'generate' | 'chat' | 'done';

export interface SessionState {
  id?: string;
  lang?: 'es'|'en'|'fr';
  premium?: boolean;
  history: ChatMessage[];
  stage?: Stage;              // ← usado por /pages/api/pulse-chat.ts
  asked?: number;             // ← contador de preguntas
  slots?: Record<string, any>;// ← datos recogidos
}
