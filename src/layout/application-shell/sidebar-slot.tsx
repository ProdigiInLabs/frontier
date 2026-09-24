import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface SidebarContextValue {
  /** Portal target inside the shell sidebar (null during prerender). */
  node: HTMLDivElement | null;
  /** Closes the off-canvas sidebar on small screens; no-op on desktop. */
  close: () => void;
}

export const SidebarSlotContext = createContext<SidebarContextValue>({ node: null, close: () => {} });

export const useShellSidebar = () => useContext(SidebarSlotContext);

/**
 * Lets an application page place contextual UI (e.g. conversation history)
 * in the shell sidebar. Client-only by nature: renders nothing during prerender.
 */
export function SidebarSlot({ children }: { children: ReactNode }) {
  const { node } = useContext(SidebarSlotContext);
  return node ? createPortal(children, node) : null;
}
