import { ButtonLink } from '@/shared/components/Button';
import { Container, Section } from '@/shared/components/Layout';
import { ProblemNavigation } from '@/shared/sections/ProblemNavigation';
import styles from './NotFoundPage.module.css';

export default function NotFoundPage() {
  return (
    <>
      <Section labelledBy="nf-title">
        <Container>
          <p className={styles.code}>404</p>
          <h1 id="nf-title" className={styles.title}>
            This page doesn’t exist.
          </h1>
          <p className={styles.lead}>The link may be old, or the page may have moved. Here are good places to continue.</p>
          <div className={styles.actions}>
            <ButtonLink to="/" icon="arrowRight">
              Go to the homepage
            </ButtonLink>
            <ButtonLink to="/intelligence/chat" variant="secondary">
              Ask Prodigi Intelligence
            </ButtonLink>
          </div>
        </Container>
      </Section>
      <ProblemNavigation tone="sunken" />
    </>
  );
}
