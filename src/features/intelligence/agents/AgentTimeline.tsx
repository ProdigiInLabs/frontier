import { aiClient } from '@/core/services/ai/ai-client';
import type { ToolCall } from '@/core/services/ai/types';
import { Badge } from '@/shared/components/Badge';
import { Icon } from '@/shared/components/Icon';
import { formatMs } from '../shared/format';
import { JsonBlock } from '../shared/JsonBlock';
import type { StepState, StepView } from './run-state';
import styles from './AgentTimeline.module.css';

const stateLabel: Record<StepState, string> = {
  pending: 'Pending',
  running: 'Running',
  done: 'Done',
  stopped: 'Stopped',
  failed: 'Failed',
};

function ToolCallView({ tool }: { tool: ToolCall }) {
  return (
    <div className={styles.tool}>
      <JsonBlock
        value={tool.input}
        label={
          <>
            <span className={styles.toolKind}>Tool call</span> <span className={styles.toolName}>{tool.name}</span>
          </>
        }
        meta={aiClient.mode === 'demo' ? <Badge tone="demo">Simulated</Badge> : undefined}
      />
      <p className={styles.toolOutput}>
        <span className={styles.toolKind}>Output</span>
        <span>{tool.output}</span>
      </p>
    </div>
  );
}

function Marker({ state, index }: { state: StepState; index: number }) {
  if (state === 'done') return <Icon name="check" size={14} />;
  if (state === 'failed' || state === 'stopped') return <Icon name={state === 'failed' ? 'alert' : 'stop'} size={12} />;
  if (state === 'running') return <span className={styles.pulse} />;
  return <span className={styles.number}>{index + 1}</span>;
}

/** Ordered execution timeline driven entirely by the agent event stream. */
export function AgentTimeline({ steps }: { steps: StepView[] }) {
  return (
    <ol className={styles.timeline}>
      {steps.map((step, index) => (
        <li key={step.id} className={styles.step} data-state={step.state} aria-current={step.state === 'running' ? 'step' : undefined}>
          <span className={styles.rail} aria-hidden="true">
            <span className={styles.marker}>
              <Marker state={step.state} index={index} />
            </span>
            {index < steps.length - 1 && <span className={styles.line} />}
          </span>

          <div className={styles.body}>
            <div className={styles.head}>
              <span className={styles.title}>{step.title}</span>
              <span className={styles.meta}>
                <span className="sr-only">Status: </span>
                {step.state === 'done' && step.durationMs !== undefined ? (
                  <>
                    <span className="sr-only">done in </span>
                    {formatMs(step.durationMs)}
                  </>
                ) : (
                  stateLabel[step.state]
                )}
              </span>
            </div>

            {step.logs.length > 0 && (
              <ul className={styles.logs}>
                {step.logs.map((log, i) => (
                  <li key={i} className={styles.log}>
                    <p>{log.message}</p>
                    {log.tool && <ToolCallView tool={log.tool} />}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
