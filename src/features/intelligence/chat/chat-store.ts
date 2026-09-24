import { readJson, writeJson } from '@/shared/utils/storage';
import type { ChatMessage, Conversation } from './types';

/**
 * Conversation history as a tiny external store over localStorage.
 * Read through useSyncExternalStore: the server snapshot is always empty, so
 * prerendered HTML is the empty state and history appears after hydration.
 * Streaming updates stay in memory; history is written when a turn settles.
 */

export const STORAGE_KEY = 'prodigi.chat.conversations';
export const MAX_CONVERSATIONS = 20;
export const MAX_MESSAGES = 50;

const EMPTY: Conversation[] = [];
const listeners = new Set<() => void>();
let state: Conversation[] | null = null;

const isObject = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;

function sanitizeMessage(value: unknown): ChatMessage | null {
  if (!isObject(value)) return null;
  const { id, role, content, createdAt } = value;
  if (typeof id !== 'string' || (role !== 'user' && role !== 'assistant') || typeof content !== 'string') return null;
  const message: ChatMessage = { id, role, content, createdAt: typeof createdAt === 'number' ? createdAt : 0 };
  if (role === 'assistant') {
    // A turn that was streaming when the page closed can never finish.
    message.status = value.status === 'complete' || value.status === 'interrupted' ? value.status : 'stopped';
    if (Array.isArray(value.sources)) {
      message.sources = value.sources.filter(
        (s): s is NonNullable<ChatMessage['sources']>[number] => isObject(s) && typeof s.id === 'string' && typeof s.title === 'string' && typeof s.url === 'string',
      );
    }
    if (Array.isArray(value.followUps)) message.followUps = value.followUps.filter((s): s is string => typeof s === 'string');
  }
  return message;
}

function sanitize(raw: unknown): Conversation[] {
  if (!Array.isArray(raw)) return [];
  const result: Conversation[] = [];
  for (const item of raw) {
    if (!isObject(item) || typeof item.id !== 'string' || !Array.isArray(item.messages)) continue;
    const messages = item.messages.map(sanitizeMessage).filter((m): m is ChatMessage => m !== null);
    if (!messages.length) continue;
    result.push({
      id: item.id,
      title: typeof item.title === 'string' && item.title ? item.title : 'Conversation',
      createdAt: typeof item.createdAt === 'number' ? item.createdAt : 0,
      updatedAt: typeof item.updatedAt === 'number' ? item.updatedAt : 0,
      messages,
    });
  }
  return cap(result);
}

function cap(list: Conversation[]): Conversation[] {
  return [...list]
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, MAX_CONVERSATIONS)
    .map((c) => (c.messages.length > MAX_MESSAGES ? { ...c, messages: c.messages.slice(-MAX_MESSAGES) } : c));
}

function current(): Conversation[] {
  state ??= sanitize(readJson<unknown>(STORAGE_KEY, []));
  return state;
}

export const chatStore = {
  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot: current,
  getServerSnapshot: (): Conversation[] => EMPTY,

  /** Applies an update. `persist: false` keeps it in memory (streaming deltas). */
  update(fn: (list: Conversation[]) => Conversation[], { persist = true }: { persist?: boolean } = {}): void {
    state = cap(fn(current()));
    listeners.forEach((listener) => listener());
    if (persist) writeJson(STORAGE_KEY, state);
  },
};

/** Updates one message in one conversation. */
export function patchMessage(
  conversationId: string,
  messageId: string,
  patch: (message: ChatMessage) => Partial<ChatMessage> | null,
  options?: { persist?: boolean },
): void {
  chatStore.update(
    (list) =>
      list.map((conversation) => {
        if (conversation.id !== conversationId) return conversation;
        const messages = conversation.messages.flatMap((message) => {
          if (message.id !== messageId) return [message];
          const next = patch(message);
          return next === null ? [] : [{ ...message, ...next }];
        });
        return { ...conversation, messages };
      }),
    options,
  );
}
