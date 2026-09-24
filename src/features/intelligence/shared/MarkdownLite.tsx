import type { ReactNode } from 'react';
import styles from './MarkdownLite.module.css';

/**
 * Renders a deliberately small markdown subset as React nodes:
 *   - paragraphs separated by blank lines (single newlines become <br>)
 *   - **bold**
 *   - "- " / "* " bullet lines and "1. " numbered lines
 * Everything else is plain text, escaped by React. No HTML is ever injected.
 */

const BULLET = /^\s*[-*•]\s+/;
const NUMBERED = /^\s*\d+[.)]\s+/;

function inline(text: string): ReactNode[] {
  // Odd indexes are the captured bold runs. An unclosed "**" stays literal.
  return text
    .split(/\*\*(?=\S)(.+?)\*\*/g)
    .map((part, index) => (index % 2 === 1 ? <strong key={index}>{part}</strong> : part))
    .filter((part) => part !== '');
}

type Block = { kind: 'p'; lines: string[] } | { kind: 'ul' | 'ol'; items: string[] };

function parse(text: string): Block[] {
  const blocks: Block[] = [];
  for (const chunk of text.replace(/\r\n?/g, '\n').split(/\n\s*\n/)) {
    let last: Block | undefined;
    for (const raw of chunk.split('\n')) {
      const line = raw.trim();
      if (!line) continue;
      if (BULLET.test(line) || NUMBERED.test(line)) {
        const kind = BULLET.test(line) ? 'ul' : 'ol';
        const item = line.replace(kind === 'ul' ? BULLET : NUMBERED, '');
        if (last && last.kind === kind) last.items.push(item);
        else blocks.push((last = { kind, items: [item] }));
      } else if (last && last.kind === 'p') {
        last.lines.push(line);
      } else {
        blocks.push((last = { kind: 'p', lines: [line] }));
      }
    }
  }
  return blocks;
}

export function MarkdownLite({ text, className }: { text: string; className?: string }) {
  const blocks = parse(text);
  return (
    <div className={[styles.md, className].filter(Boolean).join(' ')}>
      {blocks.map((block, index) => {
        if (block.kind === 'p') {
          return (
            <p key={index}>
              {block.lines.map((line, i) => (
                <span key={i}>
                  {i > 0 && <br />}
                  {inline(line)}
                </span>
              ))}
            </p>
          );
        }
        const List = block.kind;
        return (
          <List key={index}>
            {block.items.map((item, i) => (
              <li key={i}>{inline(item)}</li>
            ))}
          </List>
        );
      })}
    </div>
  );
}
