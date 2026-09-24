import type { ReactNode } from 'react';

const escape = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Wraps words that start with a matched term in <mark>. Built by splitting
 * plain text, so nothing is ever parsed as HTML.
 */
export function Highlight({ text, terms }: { text: string; terms: readonly string[] }): ReactNode {
  const words = [...new Set(terms.map((t) => t.trim().toLowerCase()).filter((t) => t.length > 1))]
    .sort((a, b) => b.length - a.length)
    .map(escape);
  if (!words.length) return text;
  const pattern = new RegExp(`(\\b(?:${words.join('|')})[\\p{L}\\p{N}]*)`, 'giu');
  return text.split(pattern).map((part, index) => (index % 2 === 1 ? <mark key={index}>{part}</mark> : part));
}
