import { businessProblems } from '@/content/home';
import { AppLink } from '@/shared/components/AppLink';
import { Icon } from '@/shared/components/Icon';
import { Container, Section, SectionHeader } from '@/shared/components/Layout';
import styles from './ProblemNavigation.module.css';

/** "What are you trying to solve?" — navigation by business problem. */
export function ProblemNavigation({ tone = 'default' }: { tone?: 'default' | 'sunken' }) {
  return (
    <Section id="solve" tone={tone} labelledBy="solve-title">
      <Container>
        <SectionHeader
          id="solve-title"
          eyebrow="Start with the problem"
          title="What are you trying to solve?"
          lead="You don’t need to know our service categories. Pick the statement closest to where you are."
        />
        <ul className={styles.grid}>
          {businessProblems.map((problem) => (
            <li key={problem.statement}>
              <AppLink to={problem.to} className={styles.card}>
                <span className={styles.statement}>{problem.statement}</span>
                <span className={styles.answer}>
                  <Icon name="arrowRight" size={16} />
                  {problem.answer}
                </span>
              </AppLink>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
