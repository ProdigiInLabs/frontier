import { useRouteEntry } from '@/routing/useRouteEntry';
import { ButtonLink } from '@/shared/components/Button';
import { CtaBand } from '@/shared/components/CtaBand';
import { Container, Section, SectionHeader } from '@/shared/components/Layout';
import { DemoGrid } from '@/shared/sections/DemoGrid';
import { FaqSection } from '@/shared/sections/FaqSection';
import { IntelligenceMap } from '@/shared/sections/IntelligenceMap';
import { PageHero } from '@/shared/sections/PageHero';
import { AiJourney } from '@/shared/visuals/AiJourney';
import { IntegrationArchitecture } from '@/shared/visuals/IntegrationArchitecture';
import { ExperienceLauncher } from './ExperienceLauncher';
import styles from './IntelligencePage.module.css';

const principles = [
  { title: 'The problem comes first.', text: 'We start with the decision or task that costs you most — then decide whether AI is the right tool. Often it is. Sometimes it isn’t.' },
  { title: 'Connected, not bolted on.', text: 'AI that can’t see your data or act through your systems stays a demo. We integrate it with what you already run.' },
  { title: 'Measured before it scales.', text: 'Quality, cost, security and reliability are measured against real cases before anything reaches production.' },
];

export default function IntelligencePage() {
  const route = useRouteEntry();
  return (
    <>
      <PageHero
        eyebrow="Prodigi Intelligence"
        pillar="intelligence"
        title="Where should AI fit into your business?"
        lead="AI is everywhere. Knowing where it actually belongs is the hard part."
        actions={
          <>
            <ButtonLink to="/intelligence#capabilities" variant="accent" icon="arrowRight">
              Explore AI
            </ButtonLink>
            <ButtonLink to="/contact?topic=integrate-ai" variant="secondary">
              Talk to Prodigi
            </ButtonLink>
          </>
        }
        visual={<ExperienceLauncher />}
      >
        <p className={styles.heroNote}>
          Prodigi helps businesses discover AI opportunities, design the right architecture, connect AI to existing systems and turn intelligent
          capabilities into useful products and workflows.
        </p>
      </PageHero>

      <Section labelledBy="principles-title">
        <Container>
          <SectionHeader
            id="principles-title"
            eyebrow="Our position"
            pillar="intelligence"
            size="large"
            title={
              <>
                You don’t need AI everywhere.
                <br />
                You need it where it matters.
              </>
            }
          />
          <ol className={styles.principles}>
            {principles.map((principle, index) => (
              <li key={principle.title} className={styles.principle}>
                <span className={styles.principleIndex} aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3 className={styles.principleTitle}>{principle.title}</h3>
                <p className={styles.principleText}>{principle.text}</p>
              </li>
            ))}
          </ol>
        </Container>
      </Section>

      <Section id="capabilities" tone="sunken" labelledBy="map-title">
        <Container>
          <SectionHeader
            id="map-title"
            eyebrow="Capability map"
            pillar="intelligence"
            title="What Prodigi Intelligence covers."
            lead="Start with one capability or combine them. Items marked Interactive open a working experience."
          />
          <IntelligenceMap />
        </Container>
      </Section>

      <Section id="start" labelledBy="journey-title">
        <Container>
          <SectionHeader
            id="journey-title"
            eyebrow="Where do I start?"
            pillar="intelligence"
            title="From first question to production, in seven steps."
            lead="Most AI projects stall between an impressive demo and a dependable system. This path is how we close that gap."
          />
          <AiJourney />
          <div className={styles.journeyActions}>
            <ButtonLink to="/contact?topic=integrate-ai" variant="accent" icon="arrowRight">
              Find Your AI Opportunity
            </ButtonLink>
            <ButtonLink to="/intelligence/ai-strategy" variant="secondary">
              How AI discovery works
            </ButtonLink>
          </div>
        </Container>
      </Section>

      <Section tone="inverse" labelledBy="arch-title">
        <Container>
          <div className={styles.arch}>
            <SectionHeader
              id="arch-title"
              eyebrow="Enterprise integration"
              pillar="intelligence"
              title="Connect intelligence to the systems you already use."
              lead="AI should not live separately from the business. It reads from — and acts through — your applications, data and knowledge, with credentials, permissions and logging kept on the server."
              actions={
                <>
                  <ButtonLink to="/demo/enterprise-ai" variant="accent" icon="arrowRight">
                    See the integration flow
                  </ButtonLink>
                  <ButtonLink to="/intelligence/integrations" variant="secondary">
                    Enterprise AI integration
                  </ButtonLink>
                </>
              }
            />
            <IntegrationArchitecture />
          </div>
        </Container>
      </Section>

      <Section labelledBy="demos-title">
        <Container>
          <SectionHeader id="demos-title" eyebrow="Interactive" pillar="intelligence" title="Enter the product." lead="Each experience runs in your browser in demo mode — on the same service contracts a production AI backend implements." />
          <DemoGrid />
        </Container>
      </Section>

      <FaqSection ids={route.faqIds} eyebrow="Definitions" title="AI, defined plainly." />
      <CtaBand title="Not sure where AI fits?" text="Describe your business and the work that slows it down. We’ll help you find where AI changes the outcome." topic="integrate-ai" secondary={{ label: 'Try AI Chat', to: '/intelligence/chat' }} />
    </>
  );
}
