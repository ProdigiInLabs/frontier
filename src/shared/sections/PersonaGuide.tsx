import { personas } from '@/content/home';
import { AppLink } from '@/shared/components/AppLink';
import { Container, Section, SectionHeader } from '@/shared/components/Layout';
import styles from './PersonaGuide.module.css';

/** Every visitor type gets a direct answer and a next action. */
export function PersonaGuide({ tone = 'default' }: { tone?: 'default' | 'sunken' }) {
  return (
    <Section id="who" tone={tone} labelledBy="who-title">
      <Container>
        <SectionHeader id="who-title" eyebrow="Who we help" title="Your question, answered directly." />
        <ul className={styles.list}>
          {personas.map((persona) => (
            <li key={persona.role} className={styles.item}>
              <p className={styles.role}>{persona.role}</p>
              <h3 className={styles.question}>{persona.question}</h3>
              <p className={styles.answer}>{persona.answer}</p>
              <p className={styles.links}>
                {persona.links.map((link) => (
                  <AppLink key={link.to} to={link.to}>
                    {link.label}
                  </AppLink>
                ))}
              </p>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
