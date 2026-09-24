import { useEffect, useState } from 'react';
import { integrationLayers } from '@/content/intelligence';
import type { IntegrationLayerId } from '@/content/intelligence';
import { analytics } from '@/core/services/analytics/analytics-service';
import { Badge } from '@/shared/components/Badge';
import { Button } from '@/shared/components/Button';
import { ChoiceCards } from '@/shared/components/Field';
import { Icon } from '@/shared/components/Icon';
import { usePrefersReducedMotion } from '@/shared/hooks/usePrefersReducedMotion';
import { IntegrationArchitecture } from '@/shared/visuals/IntegrationArchitecture';
import { AboutExperience } from '../shared/AboutExperience';
import { AppPage } from '../shared/AppPage';
import { AppPageHeader } from '../shared/AppPageHeader';
import { JsonBlock } from '../shared/JsonBlock';
import { scenarios } from './scenarios';
import type { Scenario } from './scenarios';
import styles from './EnterpriseDemoPage.module.css';

const STEP_MS = 1100;
const LAST = integrationLayers.length - 1;
const layerIds: IntegrationLayerId[] = integrationLayers.map((layer) => layer.id);

export default function EnterpriseDemoPage() {
  const [scenarioId, setScenarioId] = useState<Scenario['id']>(scenarios[0]!.id);
  /** -1 = not started; otherwise the index of the active layer. */
  const [step, setStep] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const reduceMotion = usePrefersReducedMotion();

  const scenario = scenarios.find((s) => s.id === scenarioId) ?? scenarios[0]!;
  const finished = step === LAST;

  // Autoplay: advance one layer per tick until the result layer.
  useEffect(() => {
    if (!playing) return;
    const timer = window.setTimeout(() => {
      setStep((current) => Math.min(current + 1, LAST));
      if (step + 1 >= LAST) setPlaying(false);
    }, STEP_MS);
    return () => window.clearTimeout(timer);
  }, [playing, step]);

  const choose = (id: string) => {
    setScenarioId(id as Scenario['id']);
    setStep(-1);
    setPlaying(false);
  };

  const play = () => {
    analytics.track('demo_start', { experience: 'enterprise_integration', scenario: scenario.id });
    if (reduceMotion) {
      // No timed animation: show the whole trace; Previous/Next step through it.
      setStep(LAST);
      setPlaying(false);
      return;
    }
    setStep(finished || step < 0 ? 0 : step);
    setPlaying(true);
  };

  const go = (delta: number) => {
    setPlaying(false);
    setStep((current) => Math.max(0, Math.min(LAST, current + delta)));
  };

  const activeLayer = step >= 0 ? layerIds[step]! : null;
  const completed = step > 0 ? layerIds.slice(0, step) : [];
  const activeLabel = step >= 0 ? integrationLayers[step]!.label : '';
  const status =
    step < 0 ? '' : `Layer ${step + 1} of ${layerIds.length}: ${activeLabel}. ${scenario.trace[layerIds[step]!].summary}`;

  const playLabel = playing ? 'Playing…' : finished ? 'Replay' : step >= 0 ? 'Resume' : 'Play';

  return (
    <AppPage>
      <AppPageHeader
        eyebrow="Enterprise integration"
        title="From request to action"
        lead="Follow a request through Prodigi Intelligence — model, tools, APIs and retrieval — to your business systems and back as an answer or an action."
        badges={<Badge tone="demo">Simulation</Badge>}
      />

      <section aria-labelledby="scenario-heading" className={styles.scenarios}>
        <h2 id="scenario-heading" className="sr-only">
          Choose a scenario
        </h2>
        <ChoiceCards
          legend="Scenario"
          name="integration-scenario"
          columns={2}
          value={scenario.id}
          onChange={choose}
          options={scenarios.map((s) => ({ value: s.id, label: s.label, hint: s.route }))}
        />
      </section>

      <div className={styles.controls}>
        <div className={styles.request}>
          <span className={styles.actor}>{scenario.actor}</span>
          <p className={styles.requestText}>{scenario.request}</p>
        </div>
        <div className={styles.buttons}>
          {playing ? (
            <Button variant="secondary" icon="stop" iconPosition="start" onClick={() => setPlaying(false)}>
              Pause
            </Button>
          ) : (
            <Button variant="accent" icon={finished ? 'refresh' : 'arrowRight'} iconPosition={finished ? 'start' : 'end'} onClick={play}>
              {playLabel}
            </Button>
          )}
          <Button variant="ghost" icon="arrowLeft" iconPosition="start" onClick={() => go(-1)} disabled={step <= 0}>
            Previous
          </Button>
          <Button variant="ghost" icon="arrowRight" onClick={() => go(1)} disabled={step >= LAST}>
            Next
          </Button>
          <span className={styles.position} aria-hidden="true">
            {step < 0 ? '—' : `${step + 1}/${layerIds.length}`}
          </span>
        </div>
      </div>

      <p role="status" aria-live="polite" className="sr-only">
        {status}
      </p>

      <div className={styles.layout}>
        <section aria-labelledby="flow-heading" className={styles.flow}>
          <h2 id="flow-heading" className={styles.sectionTitle}>
            Flow
          </h2>
          <IntegrationArchitecture activeLayer={activeLayer} completed={completed} flowing={playing && !reduceMotion} headingLevel="h3" />
        </section>

        <section aria-labelledby="trace-heading" className={styles.trace}>
          <div className={styles.traceHead}>
            <h2 id="trace-heading" className={styles.sectionTitle}>
              Trace
            </h2>
            <Badge tone="demo">Simulated</Badge>
          </div>

          {step < 0 ? (
            <p className={styles.traceEmpty}>Press Play, or use Next, to follow the request layer by layer. Each step shows what happens and a sample of the data passed along.</p>
          ) : (
            <ol className={styles.traceList}>
              {layerIds.map((id, index) => {
                const layer = integrationLayers[index]!;
                const entry = scenario.trace[id];
                const state = index === step ? 'active' : index < step ? 'done' : 'pending';
                return (
                  <li key={id} className={styles.traceItem} data-state={state} aria-current={state === 'active' ? 'step' : undefined}>
                    <div className={styles.traceItemHead}>
                      <span className={styles.traceIndex} aria-hidden="true">
                        {state === 'done' ? <Icon name="check" size={12} /> : String(index + 1).padStart(2, '0')}
                      </span>
                      <h3 className={styles.traceTitle}>{layer.label}</h3>
                    </div>
                    {state !== 'pending' && (
                      <div className={styles.traceBody}>
                        <p>{entry.summary}</p>
                        {state === 'active' && <JsonBlock value={entry.payload} label="Sample payload — simulated" />}
                      </div>
                    )}
                  </li>
                );
              })}
            </ol>
          )}

          {finished && (
            <div className={styles.outcome} data-kind={scenario.outcome.kind}>
              <div className={styles.outcomeHead}>
                <Icon name={scenario.outcome.kind === 'approval' ? 'history' : 'check'} size={18} />
                <h3 className={styles.outcomeTitle}>{scenario.outcome.title}</h3>
                {scenario.outcome.kind === 'approval' && <Badge tone="demo">Pending</Badge>}
              </div>
              <p>{scenario.outcome.text}</p>
            </div>
          )}
        </section>
      </div>

      <AboutExperience
        path="/demo/enterprise-ai"
        intro="This is a simulation: scenario data is local to the page and no request is sent anywhere. The layers are the ones Prodigi designs and builds for production integrations."
        links={[
          { label: 'Enterprise integration architecture', to: '/intelligence/integrations' },
          { label: 'Prodigi Intelligence', to: '/intelligence' },
        ]}
        cta={{ label: 'Plan an AI integration', to: '/contact?topic=integrate-ai' }}
      />
    </AppPage>
  );
}
