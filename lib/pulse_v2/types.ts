export type Role = 'user' | 'assistant' | 'system';
export interface ChatMessage { role: Role; content: string; ts?: number; }
export interface SessionState { id?: string; lang?: 'es'|'en'|'fr'; premium?: boolean; history: ChatMessage[]; }
