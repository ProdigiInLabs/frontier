import { pillars } from '@/content/home';
import { site } from '@/content/site';
import { useRouteEntry } from '@/routing/useRouteEntry';
import { ButtonLink } from '@/shared/components/Button';
import { CtaBand } from '@/shared/components/CtaBand';
import { Container, Section, SectionHeader } from '@/shared/components/Layout';
import { EntityFacts } from '@/shared/sections/EntityFacts';
import { FaqSection } from '@/shared/sections/FaqSection';
import { PageHero } from '@/shared/sections/PageHero';
import styles from './AboutPage.module.css';

const principles = [
  { title: 'Problem first', text: 'We ask what the business is trying to accomplish before we talk about technology.' },
  { title: 'Smallest useful step', text: 'Every engagement starts with a step you can evaluate — a discovery, a prototype, an audit or a scoped first release.' },
  { title: 'Keep what works', text: 'Existing systems usually hold real value. We assess before we replace.' },
  { title: 'Built to connect', text: 'APIs, clean data and clear boundaries, so today’s product can support tomorrow’s intelligence.' },
  { title: 'Honest about AI', text: 'We recommend AI where it changes the outcome — and say so when a simpler solution is better.' },
];

const engagement = [
  { title: 'Conversation', text: 'What you are trying to accomplish, what exists today and what constraints matter.' },
  { title: 'Discovery', text: 'A short, focused phase that turns the goal into a plan with clear outcomes.' },
  { title: 'Build', text: 'Iterative delivery with working software reviewed every cycle.' },
  { title: 'Evolve', text: 'Measure real use, improve what matters and add intelligence where it pays back.' },
];

export default function AboutPage() {
  const route = useRouteEntry();
  return (
    <>
      <PageHero
        eyebrow="About Prodigi"
        title="We start with what the business is trying to accomplish."
        lead={site.definition}
        actions={
          <ButtonLink to="/contact" icon="arrowRight">
            Start a Conversation
          </ButtonLink>
        }
      />

      <Section labelledBy="name-title">
        <Container>
          <SectionHeader id="name-title" eyebrow="The name" title="Product · Digital · Intelligence." lead="Three capabilities that are usually sold separately. We treat them as one connected system." />
          <ol className={styles.name}>
            {pillars.map((pillar) => (
              <li key={pillar.id} data-pillar={pillar.id}>
                <span className={styles.letter} aria-hidden="true">
                  {pillar.name.slice(0, 1)}
                </span>
                <h3 className={styles.pillarName}>{pillar.name}</h3>
                <p className={styles.verb}>{pillar.verb}</p>
                <p className={styles.text}>{pillar.description}</p>
              </li>
            ))}
          </ol>
        </Container>
      </Section>

      <Section tone="sunken" labelledBy="facts-title">
        <Container>
          <div className={styles.split}>
            <SectionHeader id="facts-title" eyebrow="At a glance" title="Prodigi, in facts." lead={`Our working principle: ${site.mission}`} />
            <EntityFacts />
          </div>
        </Container>
      </Section>

      <Section labelledBy="principles-title">
        <Container>
          <SectionHeader id="principles-title" eyebrow="How we work" title="Principles we hold ourselves to." />
          <ul className={styles.principles}>
            {principles.map((principle) => (
              <li key={principle.title}>
                <h3 className={styles.principleTitle}>{principle.title}</h3>
                <p className={styles.text}>{principle.text}</p>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      <Section tone="sunken" labelledBy="engage-title">
        <Container>
          <SectionHeader id="engage-title" eyebrow="Working together" title="How an engagement runs." />
          <ol className={styles.engagement}>
            {engagement.map((step, index) => (
              <li key={step.title}>
                <span className={styles.index}>{String(index + 1).padStart(2, '0')}</span>
                <h3 className={styles.principleTitle}>{step.title}</h3>
                <p className={styles.text}>{step.text}</p>
              </li>
            ))}
          </ol>
        </Container>
      </Section>

      <FaqSection ids={route.faqIds} />
      <CtaBand title="Tell us what you’re trying to accomplish." text="We’ll suggest the smallest useful first step." />
    </>
  );
}
