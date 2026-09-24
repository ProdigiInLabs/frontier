import type { ContactTopicId } from './types';

export const contactTopics: { id: ContactTopicId; label: string; hint: string }[] = [
  { id: 'build-product', label: 'Build a product', hint: 'A new web, mobile or SaaS product' },
  { id: 'modernize', label: 'Modernize an application', hint: 'An existing system that needs to move forward' },
  { id: 'improve-website', label: 'Improve our website', hint: 'Site, e-commerce or UX' },
  { id: 'visibility', label: 'Improve digital visibility', hint: 'SEO, AEO, GEO, content, marketing' },
  { id: 'integrate-ai', label: 'Integrate AI', hint: 'Chat, assistants, search or AI on our systems' },
  { id: 'automate', label: 'Automate a workflow', hint: 'A process that takes too much manual effort' },
  { id: 'explore-idea', label: 'Explore an idea', hint: 'Not fully defined yet — that’s fine' },
  { id: 'other', label: 'Other', hint: 'Something else' },
];

export const contactTimelines = ['As soon as possible', 'Within 3 months', 'In 3–6 months', 'Just exploring'] as const;

export function isContactTopic(value: string | null): value is ContactTopicId {
  return contactTopics.some((topic) => topic.id === value);
}
