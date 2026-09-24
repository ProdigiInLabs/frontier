import { useId, useState } from 'react';
import type { ReactElement, ReactNode } from 'react';
import { cloneElement } from 'react';
import styles from './Tooltip.module.css';

/**
 * Accessible tooltip: shows on hover and keyboard focus, hides on Escape,
 * and describes its trigger via aria-describedby. Supplementary text only.
 */
export function Tooltip({ content, children }: { content: ReactNode; children: ReactElement<Record<string, unknown>> }) {
  const id = useId();
  const [open, setOpen] = useState(false);
  return (
    // The wrapper only observes events bubbling from its focusable child.
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <span
      className={styles.wrapper}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      onKeyDown={(event) => event.key === 'Escape' && setOpen(false)}
    >
      {cloneElement(children, { 'aria-describedby': id })}
      <span role="tooltip" id={id} className={styles.tip} data-open={open}>
        {content}
      </span>
    </span>
  );
}
