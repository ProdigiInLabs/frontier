import { describe, expect, it } from 'vitest';
import { buildSystemInstruction, flattenKnowledge, knowledge } from '../knowledge/index.js';

describe('knowledge base', () => {
  it('loads a non-trivial, generated knowledge file', () => {
    expect(knowledge.faqs.length).toBeGreaterThan(10);
    expect(knowledge.entity.name).toBe('Prodigi');
    expect(knowledge.generatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('flattens every section into retrievable documents with a title and path', () => {
    const docs = flattenKnowledge();
    expect(docs.length).toBe(knowledge.faqs.length + knowledge.pages.length + knowledge.intelligenceCapabilities.length + knowledge.pillars.length);
    for (const doc of docs) {
      expect(doc.title.length).toBeGreaterThan(0);
      expect(doc.path.startsWith('/')).toBe(true);
    }
  });

  it('builds a system instruction that never claims to be Gemini', () => {
    const instruction = buildSystemInstruction();
    expect(instruction).toContain('Prodigi');
    expect(instruction.toLowerCase()).not.toMatch(/\bi am gemini\b|\bpowered by gemini\b/);
    expect(instruction).toMatch(/never invent/i);
  });
});
