import { faqGroups, faqs } from '@/content/faqs';
import type { FaqGroup } from '@/content/types';
import { AppLink } from '@/shared/components/AppLink';
import { CtaBand } from '@/shared/components/CtaBand';
import { FaqList } from '@/shared/components/FaqList';
import { Container, Section } from '@/shared/components/Layout';
import { PageHero } from '@/shared/sections/PageHero';
import styles from './ResourcesPage.module.css';

const order: FaqGroup[] = ['prodigi', 'intelligence', 'visibility', 'engagement'];

/** The answer hub (AEO): every question on the site, grouped, with direct answers. */
export default function ResourcesPage() {
  return (
    <>
      <PageHero
        eyebrow="Resources"
        title="Clear answers."
        lead="Plain-language answers to the questions we hear most — about Prodigi, AI, and being found online. Each answer starts with the direct answer."
      >
        <nav aria-label="Answer topics" className={styles.toc}>
          <ul>
            {order.map((group) => (
              <li key={group}>
                <AppLink to={`/resources#${group}`}>{faqGroups[group]}</AppLink>
              </li>
            ))}
          </ul>
        </nav>
      </PageHero>

      {order.map((group, index) => (
        <Section key={group} id={group} tone={index % 2 ? 'sunken' : 'default'} labelledBy={`${group}-title`} spacing="compact">
          <Container>
            <div className={styles.group}>
              <h2 id={`${group}-title`} className={styles.groupTitle}>
                {faqGroups[group]}
              </h2>
              <FaqList faqs={faqs.filter((faq) => faq.group === group)} openFirst />
            </div>
          </Container>
        </Section>
      ))}

      <CtaBand title="Have a question that isn’t here?" text="Ask it directly — or try asking Prodigi Intelligence." secondary={{ label: 'Ask AI Chat', to: '/intelligence/chat' }} />
    </>
  );
}
