import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { aiClient } from '@/core/services/ai/ai-client';
import { isAbort, userMessage } from '@/core/services/ai/errors';
import type { ChatRequest } from '@/core/services/ai/types';
import { analytics } from '@/core/services/analytics/analytics-service';
import { createId } from '@/shared/utils/id';
import { truncate } from '../shared/format';
import { chatStore, patchMessage } from './chat-store';
import type { ChatMessage, ChatPhase, Conversation, SendSource } from './types';
import { MAX_INPUT_LENGTH } from './suggestions';

const NO_MESSAGES: ChatMessage[] = [];
/** Turns sent as context with each request. */
const CONTEXT_TURNS = 20;

const plain = (text: string) => text.replace(/\*\*/g, '').replace(/^\s*[-*•]\s+/gm, '').replace(/\s+/g, ' ').trim();

function toRequest(conversationId: string, history: ChatMessage[]): ChatRequest {
  return {
    conversationId,
    messages: history
      .filter((m) => m.content.trim() && (m.role === 'user' || m.status === 'complete' || m.status === 'stopped'))
      .slice(-CONTEXT_TURNS)
      .map(({ role, content }) => ({ role, content })),
  };
}

export function useChat() {
  const conversations = useSyncExternalStore(chatStore.subscribe, chatStore.getSnapshot, chatStore.getServerSnapshot);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [phase, setPhase] = useState<ChatPhase>('idle');
  const [error, setError] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const controllerRef = useRef<AbortController | null>(null);
  const startedRef = useRef(false);

  const active: Conversation | null = conversations.find((c) => c.id === activeId) ?? null;
  const messages = active?.messages ?? NO_MESSAGES;
  const busy = phase !== 'idle';

  useEffect(() => {
    const controllers = controllerRef;
    return () => controllers.current?.abort();
  }, []);

  const run = useCallback(async (conversationId: string, history: ChatMessage[]) => {
    const controller = new AbortController();
    controllerRef.current = controller;
    const assistantId = createId('msg');
    const assistant: ChatMessage = { id: assistantId, role: 'assistant', content: '', status: 'streaming', createdAt: Date.now() };

    chatStore.update(
      (list) => list.map((c) => (c.id === conversationId ? { ...c, messages: [...c.messages, assistant], updatedAt: Date.now() } : c)),
      { persist: false },
    );
    setError(null);
    setAnnouncement('');
    setPhase('connecting');

    try {
      let streaming = false;
      for await (const event of aiClient.chat(toRequest(conversationId, history), { signal: controller.signal })) {
        if (event.type === 'delta') {
          if (!streaming) {
            streaming = true;
            setPhase('streaming');
          }
          patchMessage(conversationId, assistantId, (m) => ({ content: m.content + event.text }), { persist: false });
        } else if (event.type === 'sources') {
          patchMessage(conversationId, assistantId, () => ({ sources: event.sources.slice(0, 6) }), { persist: false });
        } else if (event.type === 'follow_ups') {
          patchMessage(conversationId, assistantId, () => ({ followUps: event.suggestions.slice(0, 4) }), { persist: false });
        }
      }
      let finalText = '';
      patchMessage(conversationId, assistantId, (m) => {
        finalText = m.content;
        return { status: 'complete' };
      });
      setAnnouncement(`Prodigi Intelligence replied: ${plain(finalText)}`);
    } catch (caught) {
      if (isAbort(caught)) {
        patchMessage(conversationId, assistantId, () => ({ status: 'stopped' }));
        setAnnouncement('Response stopped.');
      } else {
        // Keep partial text (marked interrupted); drop an empty placeholder.
        patchMessage(conversationId, assistantId, (m) => (m.content.trim() ? { status: 'interrupted' } : null));
        setError(userMessage(caught));
      }
    } finally {
      if (controllerRef.current === controller) controllerRef.current = null;
      setPhase('idle');
    }
  }, []);

  const send = useCallback(
    (text: string, source: SendSource = 'input'): boolean => {
      const content = text.trim().slice(0, MAX_INPUT_LENGTH);
      if (!content || controllerRef.current) return false;

      const now = Date.now();
      const userTurn: ChatMessage = { id: createId('msg'), role: 'user', content, createdAt: now };
      let conversationId = active?.id ?? null;
      let history: ChatMessage[];

      if (!conversationId) {
        const id = createId('conv');
        conversationId = id;
        history = [userTurn];
        chatStore.update((list) => [{ id, title: truncate(content, 48), createdAt: now, updatedAt: now, messages: [userTurn] }, ...list]);
        setActiveId(id);
      } else {
        const id = conversationId;
        history = [...messages, userTurn];
        chatStore.update((list) => list.map((c) => (c.id === id ? { ...c, messages: [...c.messages, userTurn], updatedAt: now } : c)));
      }

      if (!startedRef.current) {
        startedRef.current = true;
        analytics.track('demo_start', { experience: 'chat', mode: aiClient.mode });
      }
      analytics.track('chat_message_sent', { mode: aiClient.mode, source, turn: history.filter((m) => m.role === 'user').length });

      void run(conversationId, history);
      return true;
    },
    [active, messages, run],
  );

  /** Re-sends the last user message after an error. */
  const retry = useCallback(() => {
    if (!active || controllerRef.current) return;
    const lastUser = active.messages.map((m) => m.role).lastIndexOf('user');
    if (lastUser < 0) return;
    const history = active.messages.slice(0, lastUser + 1);
    const id = active.id;
    // Drop anything after the last user turn (an interrupted partial reply).
    chatStore.update((list) => list.map((c) => (c.id === id ? { ...c, messages: history } : c)));
    analytics.track('chat_message_sent', { mode: aiClient.mode, source: 'retry', turn: history.filter((m) => m.role === 'user').length });
    void run(id, history);
  }, [active, run]);

  const stop = useCallback(() => controllerRef.current?.abort(), []);

  const reset = useCallback((id: string | null) => {
    controllerRef.current?.abort();
    setActiveId(id);
    setError(null);
    setAnnouncement('');
  }, []);

  const newConversation = useCallback(() => reset(null), [reset]);
  const select = useCallback((id: string) => reset(id), [reset]);

  const remove = useCallback(
    (id: string) => {
      if (id === activeId) reset(null);
      chatStore.update((list) => list.filter((c) => c.id !== id));
    },
    [activeId, reset],
  );

  return { conversations, active, activeId, messages, phase, busy, error, announcement, send, retry, stop, newConversation, select, remove };
}
