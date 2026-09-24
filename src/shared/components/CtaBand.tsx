import { useId } from 'react';
import type { ContactTopicId } from '@/content/types';
import { ButtonLink } from './Button';
import { Container, Section } from './Layout';
import styles from './CtaBand.module.css';

interface CtaBandProps {
  title: string;
  text: string;
  topic?: ContactTopicId;
  secondary?: { label: string; to: string };
}

/** Closing call to action. Links into the contact flow with the topic pre-selected. */
export function CtaBand({ title, text, topic, secondary }: CtaBandProps) {
  const id = useId();
  return (
    <Section tone="inverse" labelledBy={id} className={styles.band}>
      <Container>
        <div className={styles.inner}>
          <div>
            <h2 id={id} className={styles.title}>
              {title}
            </h2>
            <p className={styles.text}>{text}</p>
          </div>
          <div className={styles.actions}>
            <ButtonLink to={topic ? `/contact?topic=${topic}` : '/contact'} size="lg" icon="arrowRight">
              Start a Conversation
            </ButtonLink>
            {secondary && (
              <ButtonLink to={secondary.to} variant="secondary" size="lg">
                {secondary.label}
              </ButtonLink>
            )}
          </div>
        </div>
      </Container>
    </Section>
  );
}
