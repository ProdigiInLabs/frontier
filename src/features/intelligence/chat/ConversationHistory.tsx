import { useId, useRef } from 'react';
import { Icon } from '@/shared/components/Icon';
import type { Conversation } from './types';
import styles from './ConversationHistory.module.css';

interface Props {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onNew: () => void;
}

/** Closes the off-canvas sidebar on small screens (the shell closes on Escape). */
function closeOffCanvas() {
  if (window.matchMedia('(min-width: 56rem)').matches) return;
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
}

/** Conversation history, rendered into the application shell sidebar. */
export function ConversationHistory({ conversations, activeId, onSelect, onDelete, onNew }: Props) {
  const headingId = useId();
  const newRef = useRef<HTMLButtonElement>(null);

  return (
    <section aria-labelledby={headingId} className={styles.history}>
      <div className={styles.head}>
        <h2 id={headingId} className={styles.title}>
          <Icon name="history" size={14} />
          Conversations
        </h2>
        <button
          ref={newRef}
          type="button"
          className={styles.iconButton}
          aria-label="New conversation"
          onClick={() => {
            onNew();
            closeOffCanvas();
          }}
        >
          <Icon name="plus" size={16} />
        </button>
      </div>

      {conversations.length === 0 ? (
        <p className={styles.empty}>Your conversations appear here. They’re saved only in this browser.</p>
      ) : (
        <ul className={styles.list}>
          {conversations.map((conversation) => {
            const current = conversation.id === activeId;
            return (
              <li key={conversation.id} className={styles.item} data-current={current}>
                <button
                  type="button"
                  className={styles.select}
                  aria-current={current ? 'true' : undefined}
                  onClick={() => {
                    onSelect(conversation.id);
                    closeOffCanvas();
                  }}
                >
                  {conversation.title}
                </button>
                <button
                  type="button"
                  className={styles.delete}
                  aria-label={`Delete conversation: ${conversation.title}`}
                  onClick={() => {
                    onDelete(conversation.id);
                    newRef.current?.focus();
                  }}
                >
                  <Icon name="trash" size={16} />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
