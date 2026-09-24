import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';

export const SidebarSlotContext = createContext<HTMLDivElement | null>(null);

/**
 * Lets an application page place contextual UI (e.g. conversation history)
 * in the shell sidebar. Client-only by nature: renders nothing during prerender.
 */
export function SidebarSlot({ children }: { children: ReactNode }) {
  const node = useContext(SidebarSlotContext);
  return node ? createPortal(children, node) : null;
}
