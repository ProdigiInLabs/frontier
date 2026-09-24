import { useRouteEntry } from '@/routing/useRouteEntry';
import { config } from '@/core/config/env';
import { ButtonLink } from '@/shared/components/Button';
import { CtaBand } from '@/shared/components/CtaBand';
import { Container, Section, SectionHeader } from '@/shared/components/Layout';
import { StateMessage } from '@/shared/components/StateMessage';
import { DemoGrid } from '@/shared/sections/DemoGrid';
import { FaqSection } from '@/shared/sections/FaqSection';
import { PageHero } from '@/shared/sections/PageHero';
import { IntegrationArchitecture } from '@/shared/visuals/IntegrationArchitecture';
import styles from './DemosPage.module.css';

const layers = [
  { title: 'Interface', text: 'The chat, agent, search and voice experiences you can open here.' },
  { title: 'AI client', text: 'One typed client the interface talks to. It never holds provider keys.' },
  { title: 'Service contract', text: 'Chat, agent, search and voice operations with typed requests and streamed events.' },
  { title: 'Adapter', text: 'Demo mode: a local engine over this site’s content. Production: an HTTP adapter.' },
  { title: 'Backend AI service', text: 'Your models, tools, retrieval and systems — with credentials kept on the server.' },
];

export default function DemosPage() {
  const route = useRouteEntry();
  return (
    <>
      <PageHero
        eyebrow="Interactive demos"
        pillar="intelligence"
        title="See what Prodigi builds."
        lead="Five working experiences — conversational AI, an agent workflow, AI search, a voice interface and an enterprise integration flow. Open one and use it."
        actions={
          <ButtonLink to="/intelligence/chat" variant="accent" icon="arrowRight">
            Start with AI Chat
          </ButtonLink>
        }
      />

      <Section labelledBy="grid-title">
        <Container>
          <SectionHeader id="grid-title" title="Choose an experience" />
          <DemoGrid />
          {config.demoMode && (
            <div className={styles.notice}>
              <StateMessage tone="info" title="These experiences run in demo mode.">
                Answers come from a local engine over this website’s own content, and agent and integration steps are simulated. No AI model or
                business system is connected, and nothing you type leaves your browser.
              </StateMessage>
            </div>
          )}
        </Container>
      </Section>

      <Section tone="sunken" labelledBy="how-title">
        <Container>
          <div className={styles.split}>
            <div>
              <SectionHeader
                id="how-title"
                eyebrow="How the demos are built"
                pillar="intelligence"
                title="Built to be connected to real AI."
                lead="The interface depends on a service contract, not on a provider. Swapping the demo engine for a production backend changes one configuration value — not the UI."
              />
              <ol className={styles.layers}>
                {layers.map((layer, index) => (
                  <li key={layer.title}>
                    <span className={styles.index}>{String(index + 1).padStart(2, '0')}</span>
                    <div>
                      <h3 className={styles.layerTitle}>{layer.title}</h3>
                      <p className={styles.layerText}>{layer.text}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
            <IntegrationArchitecture flowing={false} />
          </div>
        </Container>
      </Section>

      <FaqSection ids={route.faqIds} />
      <CtaBand title="Want this running on your data?" text="Tell us which systems and knowledge the AI should use, and what it should be allowed to do." topic="integrate-ai" />
    </>
  );
}
