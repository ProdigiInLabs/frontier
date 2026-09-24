import { AppLink } from '@/shared/components/AppLink';
import { Icon } from '@/shared/components/Icon';
import { LogoMark } from '@/shared/components/Logo';
import { Spinner } from '@/shared/components/Spinner';
import { MarkdownLite } from '../shared/MarkdownLite';
import type { ChatMessage as Message } from './types';
import styles from './ChatMessage.module.css';

interface Props {
  message: Message;
  /** Follow-ups are offered only on the latest reply, when idle. */
  showFollowUps: boolean;
  onFollowUp: (text: string) => void;
}

export function ChatMessage({ message, showFollowUps, onFollowUp }: Props) {
  if (message.role === 'user') {
    return (
      <li className={styles.user}>
        <p className={styles.bubble}>
          <span className="sr-only">You: </span>
          {message.content}
        </p>
      </li>
    );
  }

  const streaming = message.status === 'streaming';
  const waiting = streaming && !message.content;
  const sources = message.sources ?? [];
  const followUps = message.followUps ?? [];

  return (
    <li className={styles.assistant} aria-busy={streaming || undefined}>
      <div className={styles.author}>
        <span className={styles.avatar} aria-hidden="true">
          <LogoMark size={14} />
        </span>
        <span className={styles.name}>Prodigi Intelligence</span>
      </div>

      <div className={styles.body}>
        {waiting ? (
          <Spinner label="Connecting to Prodigi Intelligence…" />
        ) : (
          <div className={styles.content} data-streaming={streaming}>
            {message.content ? <MarkdownLite text={message.content} /> : <p className={styles.note}>Stopped before a response was generated.</p>}
          </div>
        )}

        {message.status === 'stopped' && message.content && <p className={styles.note}>Stopped</p>}
        {message.status === 'interrupted' && <p className={styles.note}>Response interrupted</p>}

        {!streaming && sources.length > 0 && (
          <div className={styles.sources}>
            <p className={styles.label}>Sources</p>
            <ul className={styles.sourceList}>
              {sources.map((source, index) => (
                <li key={`${source.id}-${index}`}>
                  <AppLink to={source.url} className={styles.source}>
                    <span className={styles.sourceIndex} aria-hidden="true">
                      {index + 1}
                    </span>
                    <span className={styles.sourceText}>
                      <span className={styles.sourceTitle}>{source.title}</span>
                      {source.snippet && <span className={styles.sourceSnippet}>{source.snippet}</span>}
                    </span>
                    <Icon name={/^https?:/.test(source.url) ? 'external' : 'arrowUpRight'} size={16} className={styles.sourceIcon} />
                  </AppLink>
                </li>
              ))}
            </ul>
          </div>
        )}

        {showFollowUps && followUps.length > 0 && (
          <div className={styles.followUps}>
            <p className={styles.label}>Suggested follow-ups</p>
            <ul className={styles.followUpList}>
              {followUps.map((text) => (
                <li key={text}>
                  <button type="button" className={styles.followUp} onClick={() => onFollowUp(text)}>
                    <Icon name="arrowRight" size={16} />
                    <span>{text}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </li>
  );
}
