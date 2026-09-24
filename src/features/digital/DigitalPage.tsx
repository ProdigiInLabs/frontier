import { useRouteEntry } from '@/routing/useRouteEntry';
import { AppLink } from '@/shared/components/AppLink';
import { ButtonLink } from '@/shared/components/Button';
import { CtaBand } from '@/shared/components/CtaBand';
import { Container, Section, SectionHeader } from '@/shared/components/Layout';
import { FaqSection } from '@/shared/sections/FaqSection';
import { PageHero } from '@/shared/sections/PageHero';
import { VisibilityStack } from '@/shared/visuals/VisibilityStack';
import styles from '@/features/pillar.module.css';

const groups = [
  {
    title: 'Discoverable',
    text: 'Be found — in search, in answers and in AI-generated responses.',
    items: ['SEO', 'AEO', 'GEO', 'Content'],
    link: { label: 'Visibility', to: '/digital/seo' },
  },
  {
    title: 'Usable',
    text: 'Explain clearly, load fast and make the next step obvious.',
    items: ['Website development', 'E-commerce', 'UX/UI', 'Digital transformation'],
    link: { label: 'Websites & e-commerce', to: '/digital/web' },
  },
  {
    title: 'Connected',
    text: 'Link channels, data and follow-up so growth compounds.',
    items: ['Social media', 'Digital marketing', 'Marketing automation', 'Analytics', 'Conversion optimization'],
    link: { label: 'Growth & analytics', to: '/digital/marketing' },
  },
];

export default function DigitalPage() {
  const route = useRouteEntry();
  return (
    <>
      <PageHero
        eyebrow="Digital"
        pillar="digital"
        title="Make your business digitally discoverable, usable and connected."
        lead="Your website, your visibility and your marketing are one system. Prodigi designs them together — so the people looking for you find you, understand you and take the next step."
        actions={
          <>
            <ButtonLink to="/contact?topic=improve-website" icon="arrowRight">
              Start a Conversation
            </ButtonLink>
            <ButtonLink to="/digital/seo" variant="secondary">
              Improve visibility
            </ButtonLink>
          </>
        }
      />

      <Section labelledBy="groups-title">
        <Container>
          <SectionHeader id="groups-title" eyebrow="Capabilities" pillar="digital" title="Three jobs every digital presence has to do." />
          <div className={styles.groups} data-cols="3">
            {groups.map((group) => (
              <div key={group.title} className={styles.group} data-pillar="digital">
                <h3 className={styles.groupTitle}>{group.title}</h3>
                <p className={styles.groupText}>{group.text}</p>
                <ul className={styles.groupList}>
                  {group.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <AppLink to={group.link.to} className={styles.groupLink}>
                  {group.link.label} →
                </AppLink>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <Section tone="sunken" labelledBy="vis-title">
        <Container>
          <div className={styles.split}>
            <SectionHeader
              id="vis-title"
              eyebrow="Search is changing"
              pillar="digital"
              title="Visibility now has three layers."
              lead="People still search. They also ask assistants and read AI-generated answers. SEO, AEO and GEO make sure you show up in all three — and they share the same foundation."
              actions={
                <>
                  <ButtonLink to="/digital/aeo" variant="secondary">
                    What is AEO?
                  </ButtonLink>
                  <ButtonLink to="/digital/geo" variant="secondary">
                    What is GEO?
                  </ButtonLink>
                </>
              }
            />
            <VisibilityStack />
          </div>
        </Container>
      </Section>

      <FaqSection ids={route.faqIds} title="SEO, AEO and GEO — answered" />
      <CtaBand title="Does your website explain what you do?" text="Share your site and what you need it to achieve. We’ll show where it helps and where it gets in the way." topic="improve-website" secondary={{ label: 'Improve visibility', to: '/contact?topic=visibility' }} />
    </>
  );
}
