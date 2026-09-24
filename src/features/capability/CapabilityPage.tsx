import { useLocation } from 'react-router';
import { capabilityByPath } from '@/content/capabilities';
import { ButtonLink } from '@/shared/components/Button';
import { CtaBand } from '@/shared/components/CtaBand';
import { Definition } from '@/shared/components/Definition';
import { Container, Section, SectionHeader } from '@/shared/components/Layout';
import { normalizePath } from '@/routing/manifest';
import { FaqSection } from '@/shared/sections/FaqSection';
import { PageHero } from '@/shared/sections/PageHero';
import { RelatedLinks } from '@/shared/sections/RelatedLinks';
import { CapabilityVisual, visualTitles } from '@/shared/visuals/CapabilityVisual';
import NotFoundPage from '@/features/not-found/NotFoundPage';
import styles from './CapabilityPage.module.css';

/** Template for every Product / Digital / Intelligence detail page (content/capabilities.ts). */
export default function CapabilityPage() {
  const { pathname } = useLocation();
  const page = capabilityByPath.get(normalizePath(pathname));
  if (!page) return <NotFoundPage />;

  return (
    <>
      <PageHero
        eyebrow={page.eyebrow}
        pillar={page.pillar}
        title={page.title}
        lead={page.lead}
        actions={
          <>
            <ButtonLink to={`/contact?topic=${page.cta.topic}`} icon="arrowRight">
              Start a Conversation
            </ButtonLink>
            {page.secondaryAction && (
              <ButtonLink to={page.secondaryAction.to} variant="secondary">
                {page.secondaryAction.label}
              </ButtonLink>
            )}
          </>
        }
      />

      <Section spacing="compact">
        <Container>
          <Definition question={page.definition.question} answer={page.definition.answer} />
        </Container>
      </Section>

      <Section labelledBy="offerings-title" spacing="compact">
        <Container>
          <SectionHeader id="offerings-title" eyebrow="Capabilities" pillar={page.pillar} title={page.offerings.title} />
          <ul className={styles.offerings}>
            {page.offerings.items.map((item) => (
              <li key={item.title} className={styles.offering}>
                <h3 className={styles.offeringTitle}>{item.title}</h3>
                <p className={styles.offeringText}>{item.description}</p>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      {page.visual && (
        <Section tone="sunken" labelledBy="visual-title">
          <Container>
            <SectionHeader id="visual-title" eyebrow="How it works" pillar={page.pillar} title={visualTitles[page.visual]} />
            <CapabilityVisual visual={page.visual} />
          </Container>
        </Section>
      )}

      {page.process && (
        <Section labelledBy="process-title">
          <Container>
            <SectionHeader id="process-title" eyebrow="Approach" pillar={page.pillar} title={page.process.title} />
            <ol className={styles.steps}>
              {page.process.steps.map((step, index) => (
                <li key={step.title} className={styles.step}>
                  <span className={styles.stepIndex} aria-hidden="true">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <h3 className={styles.stepTitle}>{step.title}</h3>
                  <p className={styles.stepText}>{step.description}</p>
                </li>
              ))}
            </ol>
          </Container>
        </Section>
      )}

      {page.useCases && (
        <Section labelledBy="usecases-title" spacing="compact">
          <Container>
            <SectionHeader id="usecases-title" eyebrow="Principles" pillar={page.pillar} title={page.useCases.title} />
            <ul className={styles.principles}>
              {page.useCases.items.map((item) => (
                <li key={item.title}>
                  <h3 className={styles.offeringTitle}>{item.title}</h3>
                  <p className={styles.offeringText}>{item.description}</p>
                </li>
              ))}
            </ul>
          </Container>
        </Section>
      )}

      <FaqSection ids={page.faqIds} />
      <RelatedLinks paths={page.related} />
      <CtaBand title={page.cta.title} text={page.cta.text} topic={page.cta.topic} />
    </>
  );
}
