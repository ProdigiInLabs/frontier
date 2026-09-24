import { getFaqs } from '@/content/faqs';
import { FaqList } from '@/shared/components/FaqList';
import { Container, Section, SectionHeader } from '@/shared/components/Layout';

/** Renders the FAQs listed for this route in the manifest (the same ids feed FAQPage schema). */
export function FaqSection({ ids, title = 'Questions, answered', eyebrow = 'Answers' }: { ids: readonly string[] | 'all' | undefined; title?: string; eyebrow?: string }) {
  if (!ids?.length || ids === 'all') return null;
  return (
    <Section id="faq" labelledBy="faq-title">
      <Container>
        <div style={{ display: 'grid', gap: 'var(--space-8)' }}>
          <SectionHeader id="faq-title" eyebrow={eyebrow} title={title} />
          <FaqList faqs={getFaqs(ids)} />
        </div>
      </Container>
    </Section>
  );
}
