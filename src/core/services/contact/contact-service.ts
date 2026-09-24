import { config } from '@/core/config/env';
import { contactTopics } from '@/content/contact';
import type { ContactTopicId } from '@/content/types';

export interface ContactSubmission {
  topic: ContactTopicId;
  topicOther: string;
  name: string;
  email: string;
  company: string;
  details: string;
  timeline: string;
  /** Honeypot — must stay empty. */
  website: string;
}

export type ContactResult = { channel: 'api' } | { channel: 'email'; href: string };

export class ContactError extends Error {}

const topicLabel = (id: ContactTopicId) => contactTopics.find((topic) => topic.id === id)?.label ?? id;

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function buildEmailBody(data: ContactSubmission): string {
  const topic = data.topic === 'other' && data.topicOther ? `Other — ${data.topicOther}` : topicLabel(data.topic);
  return [
    `Looking to solve: ${topic}`,
    `Name: ${data.name}`,
    `Company: ${data.company || '—'}`,
    `Email: ${data.email}`,
    `Timeline: ${data.timeline || '—'}`,
    '',
    'Project details:',
    data.details,
  ].join('\n');
}

/**
 * Sends the enquiry. With VITE_CONTACT_ENDPOINT configured it POSTs JSON;
 * otherwise it falls back to composing an email — the behaviour of the
 * previous site, where every call to action was a mailto: link.
 */
export async function submitContact(data: ContactSubmission): Promise<ContactResult> {
  if (data.website) return { channel: 'api' }; // silently drop bots

  if (config.contactEndpoint) {
    const response = await fetch(config.contactEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        topic: data.topic,
        topicLabel: topicLabel(data.topic),
        topicOther: data.topicOther,
        name: data.name,
        email: data.email,
        company: data.company,
        details: data.details,
        timeline: data.timeline,
        source: 'prodigi-web',
      }),
    }).catch(() => {
      throw new ContactError('network');
    });
    if (!response.ok) throw new ContactError(`status ${response.status}`);
    return { channel: 'api' };
  }

  const subject = `Prodigi enquiry — ${topicLabel(data.topic)}${data.company ? ` · ${data.company}` : ''}`;
  const href = `mailto:${config.contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(buildEmailBody(data))}`;
  return { channel: 'email', href };
}
