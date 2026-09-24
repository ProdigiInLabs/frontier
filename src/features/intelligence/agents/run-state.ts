import type { AgentEvent, AgentGoal, AgentResult, AgentStepKind, ToolCall } from '@/core/services/ai/types';

export type StepState = 'pending' | 'running' | 'done' | 'stopped' | 'failed';
export type RunStatus = 'idle' | 'running' | 'complete' | 'cancelled' | 'error';

export interface StepLog {
  message: string;
  tool?: ToolCall;
}

export interface StepView {
  id: string;
  kind: AgentStepKind;
  title: string;
  state: StepState;
  durationMs?: number;
  logs: StepLog[];
}

export interface RunState {
  status: RunStatus;
  goal: AgentGoal | null;
  steps: StepView[];
  result: AgentResult | null;
  error: string | null;
}

export type RunAction =
  | { type: 'start'; goal: AgentGoal }
  | { type: 'event'; event: AgentEvent }
  | { type: 'finish' }
  | { type: 'cancel' }
  | { type: 'error'; message: string };

export const initialRun: RunState = { status: 'idle', goal: null, steps: [], result: null, error: null };

const settle = (steps: StepView[], to: StepState) => steps.map((s) => (s.state === 'running' ? { ...s, state: to } : s));

function apply(state: RunState, event: AgentEvent): RunState {
  switch (event.type) {
    case 'plan':
      return { ...state, steps: event.steps.map((s) => ({ ...s, state: 'pending', logs: [] })) };
    case 'step_started':
      return { ...state, steps: state.steps.map((s) => (s.id === event.stepId ? { ...s, state: 'running' } : s)) };
    case 'log':
      return {
        ...state,
        steps: state.steps.map((s) =>
          s.id === event.stepId ? { ...s, logs: [...s.logs, { message: event.message, ...(event.tool ? { tool: event.tool } : {}) }] } : s,
        ),
      };
    case 'step_completed':
      return { ...state, steps: state.steps.map((s) => (s.id === event.stepId ? { ...s, state: 'done', durationMs: event.durationMs } : s)) };
    case 'result':
      return { ...state, status: 'complete', result: event.result, steps: settle(state.steps, 'done') };
    default:
      return state;
  }
}

export function runReducer(state: RunState, action: RunAction): RunState {
  switch (action.type) {
    case 'start':
      return { ...initialRun, status: 'running', goal: action.goal };
    case 'event':
      return apply(state, action.event);
    case 'finish':
      return state.status === 'running' ? { ...state, status: 'complete', steps: settle(state.steps, 'done') } : state;
    case 'cancel':
      return { ...state, status: 'cancelled', steps: settle(state.steps, 'stopped') };
    case 'error':
      return { ...state, status: 'error', error: action.message, steps: settle(state.steps, 'failed') };
  }
}

/** Short status line for the live region, e.g. "Step 3 of 7: Calling tools". */
export function describeRun(state: RunState): string {
  const total = state.steps.length;
  switch (state.status) {
    case 'idle':
      return '';
    case 'running': {
      const index = state.steps.findIndex((s) => s.state === 'running');
      if (index >= 0) return `Step ${index + 1} of ${total}: ${state.steps[index]!.title}`;
      return total ? `Planned ${total} steps` : 'Starting the agent…';
    }
    case 'complete':
      return state.result ? `Completed. Result ready: ${state.result.title}.` : 'Completed.';
    case 'cancelled':
      return 'Run cancelled. No further steps were taken.';
    case 'error':
      return 'The run failed.';
  }
}
