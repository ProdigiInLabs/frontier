import { findRoute } from '@/routing/manifest';
import { Card } from '@/shared/components/Card';
import { Container, Grid, Section, SectionHeader } from '@/shared/components/Layout';

/** Internal linking block built from the manifest (labels + descriptions stay in sync). */
export function RelatedLinks({ paths, title = 'Related' }: { paths: readonly string[]; title?: string }) {
  const entries = paths.map((path) => findRoute(path)).filter((entry) => entry !== undefined);
  if (!entries.length) return null;
  return (
    <Section spacing="compact" labelledBy="related-title">
      <Container>
        <SectionHeader id="related-title" eyebrow="Keep exploring" title={title} />
        <Grid columns={3} as="ul">
          {entries.map((entry) => (
            <li key={entry.path}>
              <Card as="div" to={entry.path} title={entry.label} cta="Explore">
                <p>{entry.meta.description}</p>
              </Card>
            </li>
          ))}
        </Grid>
      </Container>
    </Section>
  );
}
