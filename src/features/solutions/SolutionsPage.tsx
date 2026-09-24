import { industries } from '@/content/industries';
import { useRouteEntry } from '@/routing/useRouteEntry';
import { ButtonLink } from '@/shared/components/Button';
import { CtaBand } from '@/shared/components/CtaBand';
import { Container, Section, SectionHeader } from '@/shared/components/Layout';
import { FaqSection } from '@/shared/sections/FaqSection';
import { PageHero } from '@/shared/sections/PageHero';
import { PersonaGuide } from '@/shared/sections/PersonaGuide';
import { ProblemNavigation } from '@/shared/sections/ProblemNavigation';
import styles from './SolutionsPage.module.css';

export default function SolutionsPage() {
  const route = useRouteEntry();
  return (
    <>
      <PageHero
        eyebrow="Solutions"
        title="Start with what you’re trying to solve."
        lead="Prodigi doesn’t start with technology. It starts with what the business is trying to accomplish — then chooses the product, digital or intelligence work that gets you there."
        actions={
          <ButtonLink to="/contact" icon="arrowRight">
            Start a Conversation
          </ButtonLink>
        }
      />
      <ProblemNavigation />
      <PersonaGuide tone="sunken" />

      <Section labelledBy="ind-title">
        <Container>
          <SectionHeader
            id="ind-title"
            eyebrow="Industries"
            title="Technology patterns we can apply to your industry."
            lead="The underlying patterns — conversational support, search over knowledge, document processing, workflow automation — carry across industries. These are examples of where they fit."
          />
          <ul className={styles.industries}>
            {industries.map((industry) => (
              <li key={industry.name} className={styles.industry}>
                <h3 className={styles.name}>{industry.name}</h3>
                <ul className={styles.patterns}>
                  {industry.patterns.map((pattern) => (
                    <li key={pattern}>{pattern}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      <FaqSection ids={route.faqIds} />
      <CtaBand title="Not sure which of these fits?" text="Describe the situation in your own words. We’ll point to the right starting point." topic="explore-idea" />
    </>
  );
}
