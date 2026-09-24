import type { Source } from '@/core/services/ai/types';

export type MessageStatus = 'streaming' | 'complete' | 'stopped' | 'interrupted';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: number;
  /** Assistant messages only. */
  status?: MessageStatus;
  sources?: Source[];
  followUps?: string[];
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
}

export type ChatPhase = 'idle' | 'connecting' | 'streaming';

export type SendSource = 'input' | 'suggestion' | 'follow_up' | 'retry';
