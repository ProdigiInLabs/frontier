import { useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { aiClient } from '@/core/services/ai/ai-client';
import type { AgentGoal } from '@/core/services/ai/types';
import { analytics } from '@/core/services/analytics/analytics-service';
import { Button } from '@/shared/components/Button';
import { ChoiceCards, TextArea } from '@/shared/components/Field';
import { StateMessage } from '@/shared/components/StateMessage';
import { AboutExperience } from '../shared/AboutExperience';
import { AppPage } from '../shared/AppPage';
import { AppPageHeader } from '../shared/AppPageHeader';
import { DemoNotice } from '../shared/DemoNotice';
import { ModeBadge } from '../shared/ModeBadge';
import { AgentResultCard } from './AgentResultCard';
import { AgentTimeline } from './AgentTimeline';
import { agentGoals, MAX_INSTRUCTIONS } from './goals';
import { describeRun } from './run-state';
import { useAgentRun } from './useAgentRun';
import styles from './AgentsPage.module.css';

export default function AgentsPage() {
  const [goal, setGoal] = useState<AgentGoal>('research');
  const [instructions, setInstructions] = useState('');
  const { state, run, cancel } = useAgentRun();
  const executionRef = useRef<HTMLElement>(null);

  const running = state.status === 'running';
  const selected = agentGoals.find((g) => g.id === goal) ?? agentGoals[0]!;
  const summary = describeRun(state);
  const progress = state.steps.filter((s) => s.state === 'done').length;

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (running) return;
    const text = instructions.trim();
    analytics.track('agent_run', { goal, mode: aiClient.mode, custom_instructions: text.length > 0 });
    void run({ goal, ...(text ? { instructions: text } : {}) });
    // On stacked layouts, bring the timeline into view as the run starts.
    if (!window.matchMedia('(min-width: 72rem)').matches) {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      executionRef.current?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    }
  };

  return (
    <AppPage>
      <AppPageHeader
        eyebrow="Agents"
        title="What should your agent accomplish?"
        lead="AI agents plan, call tools and reason through multi-step tasks — within explicit permissions. Pick a goal and watch each step as it happens."
        badges={<ModeBadge />}
      />

      <div className={styles.layout}>
        <section className={styles.config} aria-labelledby="agent-task-heading">
          <h2 id="agent-task-heading" className={styles.sectionTitle}>
            Task
          </h2>
          <form className={styles.form} onSubmit={onSubmit}>
            <fieldset className={styles.bare} disabled={running}>
              <legend className="sr-only">Agent task</legend>
              <ChoiceCards
                legend="Goal"
                name="agent-goal"
                columns={2}
                value={goal}
                onChange={(value) => setGoal(value as AgentGoal)}
                options={agentGoals.map((g) => ({ value: g.id, label: g.label, hint: g.description }))}
              />
              <TextArea
                label="Instructions"
                optional
                hint="Describe the task in a sentence. Leave empty to use the example."
                placeholder={selected.placeholder}
                rows={3}
                maxLength={MAX_INSTRUCTIONS}
                value={instructions}
                onChange={(event) => setInstructions(event.target.value)}
              />
            </fieldset>

            <div className={styles.controls}>
              {running ? (
                <Button
                  key="cancel"
                  variant="secondary"
                  icon="stop"
                  iconPosition="start"
                  onClick={(event) => {
                    // The run settles synchronously enough to re-render this slot as the
                    // submit button before the click's default action; never let it submit.
                    event.preventDefault();
                    cancel();
                  }}
                >
                  Cancel run
                </Button>
              ) : (
                <Button key="run" type="submit" variant="accent" icon={state.status === 'idle' ? 'arrowRight' : 'refresh'} iconPosition={state.status === 'idle' ? 'end' : 'start'}>
                  {state.status === 'idle' ? 'Run agent' : 'Run again'}
                </Button>
              )}
            </div>

            <DemoNotice>Agent runs are scripted. Tool calls are simulated and no system is read or changed.</DemoNotice>
          </form>
        </section>

        <section ref={executionRef} className={styles.execution} aria-labelledby="agent-execution-heading">
          <div className={styles.executionHead}>
            <h2 id="agent-execution-heading" className={styles.sectionTitle}>
              Execution
            </h2>
            {state.steps.length > 0 && (
              <span className={styles.counter} aria-hidden="true">
                {progress}/{state.steps.length}
              </span>
            )}
          </div>

          <p className={styles.status} role="status" aria-live="polite">
            {summary}
          </p>

          {state.status === 'idle' && (
            <StateMessage title="No run yet" icon="agent">
              Choose a goal and run the agent. Its plan, tool calls and reasoning appear here step by step.
            </StateMessage>
          )}

          {state.status === 'running' && state.steps.length === 0 && (
            <div className={styles.skeleton} aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
          )}

          {state.steps.length > 0 && <AgentTimeline steps={state.steps} />}

          {state.status === 'cancelled' && (
            <StateMessage tone="info" title="Run cancelled" icon="stop">
              The agent stopped before finishing. Steps already shown are unchanged; nothing else was run.
            </StateMessage>
          )}

          {state.status === 'error' && (
            <StateMessage
              tone="error"
              title="Something went wrong. Please try again."
              action={
                <Button type="button" variant="secondary" size="sm" icon="refresh" iconPosition="start" onClick={() => void run({ goal, ...(instructions.trim() ? { instructions: instructions.trim() } : {}) })}>
                  Retry
                </Button>
              }
            >
              {state.error}
            </StateMessage>
          )}

          {state.result && <AgentResultCard result={state.result} headingId="agent-result-title" />}
        </section>
      </div>

      <AboutExperience
        path="/intelligence/agents"
        intro="The timeline is driven by the same event stream a production agent backend emits: a plan, step start and completion, logs, tool calls and a final result."
        links={[
          { label: 'AI automation', to: '/intelligence/automation' },
          { label: 'Prodigi Intelligence', to: '/intelligence' },
        ]}
        cta={{ label: 'Discuss an agent for your workflow', to: '/contact?topic=automate' }}
      />
    </AppPage>
  );
}
