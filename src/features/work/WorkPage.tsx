import { buildPatterns, products } from '@/content/work';
import { ButtonLink } from '@/shared/components/Button';
import { CtaBand } from '@/shared/components/CtaBand';
import { Container, Section, SectionHeader } from '@/shared/components/Layout';
import { DemoGrid } from '@/shared/sections/DemoGrid';
import { PageHero } from '@/shared/sections/PageHero';
import styles from './WorkPage.module.css';

export default function WorkPage() {
  return (
    <>
      <PageHero
        eyebrow="Work"
        title="What Prodigi builds."
        lead="Our own products, the kinds of systems we engineer for others, and working experiences you can try right now."
        actions={
          <>
            <ButtonLink to="/contact?topic=build-product" icon="arrowRight">
              Start a Conversation
            </ButtonLink>
            <ButtonLink to="/demo" variant="secondary">
              Try the demos
            </ButtonLink>
          </>
        }
      />

      <Section labelledBy="products-title">
        <Container>
          <SectionHeader id="products-title" eyebrow="Our products" pillar="product" title="Products we build for ourselves." lead="Building our own products keeps our engineering honest: we live with the architecture decisions we recommend." />
          <ul className={styles.products}>
            {products.map((product) => (
              <li key={product.name} className={styles.product}>
                <p className={styles.kind}>{product.kind}</p>
                <h3 className={styles.productName}>{product.name}</h3>
                <p className={styles.productText}>{product.description}</p>
                <ul className={styles.points}>
                  {product.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      <Section tone="sunken" labelledBy="patterns-title">
        <Container>
          <SectionHeader id="patterns-title" eyebrow="What we engineer" title="Systems, not just screens." />
          <ul className={styles.patterns}>
            {buildPatterns.map((pattern, index) => (
              <li key={pattern.title}>
                <span className={styles.index}>{String(index + 1).padStart(2, '0')}</span>
                <h3 className={styles.patternTitle}>{pattern.title}</h3>
                <p className={styles.patternText}>{pattern.description}</p>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      <Section labelledBy="try-title">
        <Container>
          <SectionHeader id="try-title" eyebrow="Try it" pillar="intelligence" title="Working experiences, in your browser." />
          <DemoGrid />
        </Container>
      </Section>

      <CtaBand title="Want to see relevant work for your situation?" text="Tell us what you’re building. We’ll walk you through how we would approach it." topic="build-product" />
    </>
  );
}
