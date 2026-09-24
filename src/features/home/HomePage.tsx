import { brandLines, pillars } from '@/content/home';
import { site } from '@/content/site';
import { useRouteEntry } from '@/routing/useRouteEntry';
import { AppLink } from '@/shared/components/AppLink';
import { ButtonLink } from '@/shared/components/Button';
import { CtaBand } from '@/shared/components/CtaBand';
import { Icon } from '@/shared/components/Icon';
import { Container, Section, SectionHeader } from '@/shared/components/Layout';
import { DemoGrid } from '@/shared/sections/DemoGrid';
import { EntityFacts } from '@/shared/sections/EntityFacts';
import { FaqSection } from '@/shared/sections/FaqSection';
import { IntelligenceMap } from '@/shared/sections/IntelligenceMap';
import { PersonaGuide } from '@/shared/sections/PersonaGuide';
import { ProblemNavigation } from '@/shared/sections/ProblemNavigation';
import { SystemDiagram } from '@/shared/visuals/SystemDiagram';
import { ValueChain } from '@/shared/visuals/ValueChain';
import { ChatPreview } from './ChatPreview';
import styles from './HomePage.module.css';

export default function HomePage() {
  const route = useRouteEntry();
  return (
    <>
      {/* ---------- Hero ---------- */}
      <section className={styles.hero} aria-labelledby="hero-title">
        <Container size="wide">
          <div className={styles.heroGrid}>
            <div>
              <p className={styles.heroEyebrow}>
                {pillars.map((pillar) => (
                  <span key={pillar.id} data-pillar={pillar.id}>
                    {pillar.name}
                  </span>
                ))}
              </p>
              <h1 id="hero-title" className={styles.heroTitle}>
                {brandLines.heroTitle.map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </h1>
              <p className={styles.heroLead}>{site.summary}</p>
              <div className={styles.heroActions}>
                <ButtonLink to="/contact" size="lg" icon="arrowRight">
                  Start a Conversation
                </ButtonLink>
                <ButtonLink to="/intelligence" size="lg" variant="secondary">
                  Explore Intelligence
                </ButtonLink>
                <AppLink to="/work" className={styles.heroTertiary}>
                  See What We Build
                  <Icon name="arrowRight" size={16} />
                </AppLink>
              </div>
            </div>
            <div className={styles.heroVisual}>
              <SystemDiagram />
            </div>
          </div>
        </Container>
      </section>

      {/* ---------- Philosophy ---------- */}
      <Section labelledBy="philosophy-title">
        <Container>
          <h2 id="philosophy-title" className={styles.statement}>
            <span>{brandLines.philosophy[0]}</span>
            <span className={styles.statementMuted}>{brandLines.philosophy[1]}</span>
          </h2>
          <ol className={styles.pillars}>
            {pillars.map((pillar, index) => (
              <li key={pillar.id} className={styles.pillar} data-pillar={pillar.id}>
                <span className={styles.pillarIndex} aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3 className={styles.pillarName}>
                  <AppLink to={pillar.to} className={styles.pillarLink}>
                    {pillar.name}
                  </AppLink>
                </h3>
                <p className={styles.pillarVerb}>{pillar.verb}</p>
                <p className={styles.pillarText}>{pillar.description}</p>
                <Icon name="arrowUpRight" size={20} className={styles.pillarArrow} />
              </li>
            ))}
          </ol>
        </Container>
      </Section>

      <ProblemNavigation tone="sunken" />

      {/* ---------- Value chain ---------- */}
      <Section id="value-chain" labelledBy="chain-title">
        <Container>
          <SectionHeader
            id="chain-title"
            eyebrow="How it connects"
            title={
              <>
                {brandLines.journey[0]}
                <br />
                {brandLines.journey[1]}
              </>
            }
            lead="A product creates a digital experience. The experience creates data. Data makes intelligence possible, and intelligence makes automation useful. Prodigi can start at any stage."
          />
          <ValueChain />
        </Container>
      </Section>

      {/* ---------- Intelligence ---------- */}
      <Section tone="inverse" labelledBy="intel-title" className={styles.intel}>
        <Container>
          <div className={styles.intelHead}>
            <SectionHeader
              id="intel-title"
              eyebrow="Prodigi Intelligence"
              pillar="intelligence"
              title={
                <>
                  {brandLines.aiWhere[0]}
                  <br />
                  {brandLines.aiWhere[1]}
                </>
              }
              lead={brandLines.problemFirst}
              actions={
                <>
                  <ButtonLink to="/intelligence" variant="accent" icon="arrowRight">
                    Experience Prodigi Intelligence
                  </ButtonLink>
                  <ButtonLink to="/intelligence/ai-strategy" variant="secondary">
                    Find your AI opportunity
                  </ButtonLink>
                </>
              }
            />
            <ChatPreview />
          </div>
          <IntelligenceMap />
        </Container>
      </Section>

      {/* ---------- Demos ---------- */}
      <Section labelledBy="demos-title">
        <Container>
          <SectionHeader
            id="demos-title"
            eyebrow="Interactive"
            title="See it working, not just described."
            lead="Chat, agents, search, voice and an enterprise integration flow — running in your browser in demo mode, on the same contracts a production backend would use."
            actions={
              <ButtonLink to="/demo" variant="secondary" icon="arrowRight">
                All demos
              </ButtonLink>
            }
          />
          <DemoGrid />
        </Container>
      </Section>

      <PersonaGuide tone="sunken" />

      {/* ---------- Entity (GEO/AEO) ---------- */}
      <Section labelledBy="entity-title">
        <Container>
          <div className={styles.entity}>
            <SectionHeader id="entity-title" eyebrow="In one paragraph" title="What is Prodigi?" lead={site.definition} />
            <EntityFacts />
          </div>
        </Container>
      </Section>

      <FaqSection ids={route.faqIds} title="More about Prodigi" />

      <CtaBand
        title="Tell us what you’re trying to accomplish."
        text={site.principle}
        secondary={{ label: 'Explore Intelligence', to: '/intelligence' }}
      />
    </>
  );
}
