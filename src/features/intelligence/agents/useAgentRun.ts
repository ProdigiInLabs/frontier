import { useCallback, useEffect, useReducer, useRef } from 'react';
import { aiClient } from '@/core/services/ai/ai-client';
import { isAbort, userMessage } from '@/core/services/ai/errors';
import type { AgentRequest } from '@/core/services/ai/types';
import { initialRun, runReducer } from './run-state';

export function useAgentRun() {
  const [state, dispatch] = useReducer(runReducer, initialRun);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const controllers = controllerRef;
    return () => controllers.current?.abort();
  }, []);

  const run = useCallback(async (request: AgentRequest) => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    const isCurrent = () => controllerRef.current === controller;

    dispatch({ type: 'start', goal: request.goal });
    try {
      for await (const event of aiClient.runAgent(request, { signal: controller.signal })) {
        if (!isCurrent() || controller.signal.aborted) break;
        dispatch({ type: 'event', event });
      }
      if (isCurrent()) dispatch(controller.signal.aborted ? { type: 'cancel' } : { type: 'finish' });
    } catch (error) {
      if (!isCurrent()) return; // superseded by a newer run
      dispatch(isAbort(error) ? { type: 'cancel' } : { type: 'error', message: userMessage(error) });
    } finally {
      if (isCurrent()) controllerRef.current = null;
    }
  }, []);

  const cancel = useCallback(() => controllerRef.current?.abort(), []);

  return { state, run, cancel };
}
