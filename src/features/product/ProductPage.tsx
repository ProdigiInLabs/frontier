import { site } from '@/content/site';
import { useRouteEntry } from '@/routing/useRouteEntry';
import { ButtonLink } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';
import { CtaBand } from '@/shared/components/CtaBand';
import { Container, Grid, Section, SectionHeader } from '@/shared/components/Layout';
import { FaqSection } from '@/shared/sections/FaqSection';
import { PageHero } from '@/shared/sections/PageHero';
import { ProductArchitecture } from '@/shared/visuals/ProductArchitecture';
import styles from '@/features/pillar.module.css';

const groups = [
  { title: 'Shape', items: ['Product discovery', 'UX/UI design'] },
  { title: 'Build', items: ['Web applications', 'Mobile applications', 'SaaS platforms', 'API platforms', 'Backend engineering'] },
  { title: 'Run', items: ['Cloud architecture', 'Microservices', 'DevOps', 'Security', 'Performance'] },
  { title: 'Evolve', items: ['Product modernization', 'Integration', 'AI readiness'] },
];

export default function ProductPage() {
  const route = useRouteEntry();
  return (
    <>
      <PageHero
        eyebrow="Product"
        pillar="product"
        title="Turn ideas into products."
        lead="From the first sketch to production — and the modernization of the systems you already run. Prodigi designs and engineers web, mobile and SaaS products with architecture that holds up after launch."
        actions={
          <>
            <ButtonLink to="/contact?topic=build-product" icon="arrowRight">
              Start a Conversation
            </ButtonLink>
            <ButtonLink to="/product/modernization" variant="secondary">
              Modernize an existing product
            </ButtonLink>
          </>
        }
      />

      <Section labelledBy="cap-title">
        <Container>
          <SectionHeader id="cap-title" eyebrow="Capabilities" pillar="product" title="Everything a product needs, end to end." lead="One team across discovery, design, engineering and operations — so decisions made early still make sense later." />
          <div className={styles.groups}>
            {groups.map((group) => (
              <div key={group.title} className={styles.group} data-pillar="product">
                <h3 className={styles.groupTitle}>{group.title}</h3>
                <ul className={styles.groupList}>
                  {group.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <Section tone="sunken" labelledBy="arch-title">
        <Container>
          <SectionHeader id="arch-title" eyebrow="Architecture" pillar="product" title="Designed in layers, so each can change on its own." lead="Select a layer to see what it is responsible for." />
          <ProductArchitecture />
        </Container>
      </Section>

      <Section labelledBy="paths-title">
        <Container>
          <SectionHeader id="paths-title" eyebrow="Where you are" pillar="product" title="New product, or one you already have?" />
          <Grid columns={2} as="ul">
            <li>
              <Card as="div" pillar="product" to="/product/engineering" cta="Product engineering" title="Starting from an idea" headingLevel="h3">
                <p>Discovery, UX and a first release sized to prove the idea — built on foundations that won’t need replacing once it works.</p>
              </Card>
            </li>
            <li>
              <Card as="div" pillar="product" to="/product/modernization" cta="Modernization" title="Improving what already runs" headingLevel="h3">
                <p>Assess what is worth keeping, put stable APIs in front of legacy parts and replace them one at a time — without a big-bang rewrite.</p>
              </Card>
            </li>
          </Grid>
        </Container>
      </Section>

      <Section tone="sunken" labelledBy="ready-title" spacing="compact">
        <Container>
          <div className={styles.split}>
            <SectionHeader
              id="ready-title"
              eyebrow="From product to intelligence"
              pillar="intelligence"
              title="Products built to be connected."
              lead="Clean APIs, event streams and well-structured data are what make AI integration possible later. We build them in from the start."
              actions={
                <ButtonLink to="/intelligence/integrations" variant="secondary" icon="arrowRight">
                  Enterprise AI integration
                </ButtonLink>
              }
            />
            <div>
              <h3 className={styles.chipsTitle}>Technologies we work with</h3>
              <ul className={styles.chips}>
                {site.technologies.map((tech) => (
                  <li key={tech}>{tech}</li>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </Section>

      <FaqSection ids={route.faqIds} />
      <CtaBand title="Have an idea that needs to become a product?" text="Tell us what it should do and who it is for. We’ll suggest the smallest useful first step." topic="build-product" />
    </>
  );
}
