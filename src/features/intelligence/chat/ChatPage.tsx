import { useEffect, useRef, useState } from 'react';
import { SidebarSlot } from '@/layout/application-shell/sidebar-slot';
import { Button } from '@/shared/components/Button';
import { Icon } from '@/shared/components/Icon';
import { StateMessage } from '@/shared/components/StateMessage';
import { AboutExperience } from '../shared/AboutExperience';
import { AppPageHeader } from '../shared/AppPageHeader';
import { DemoNotice } from '../shared/DemoNotice';
import { ModeBadge } from '../shared/ModeBadge';
import { ChatMessage } from './ChatMessage';
import { Composer } from './Composer';
import { ConversationHistory } from './ConversationHistory';
import { promptSuggestions } from './suggestions';
import { useChat } from './useChat';
import styles from './ChatPage.module.css';

/** Distance from the bottom (px) within which the thread keeps following new text. */
const STICK_THRESHOLD = 72;

export default function ChatPage() {
  const chat = useChat();
  const { messages, phase, busy, error } = chat;
  const scrollRef = useRef<HTMLDivElement>(null);
  const stickRef = useRef(true);
  const [atBottom, setAtBottom] = useState(true);

  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const near = el.scrollHeight - el.scrollTop - el.clientHeight < STICK_THRESHOLD;
    stickRef.current = near;
    setAtBottom(near);
  };

  // Follow the newest message unless the reader has scrolled up.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    // The empty state reads from the top; a thread follows its newest message.
    if (messages.length === 0) el.scrollTop = 0;
    else if (stickRef.current) el.scrollTop = el.scrollHeight;
  }, [messages, error, phase]);

  const follow = () => {
    stickRef.current = true;
  };

  const send = (text: string, source: Parameters<typeof chat.send>[1]) => {
    follow();
    return chat.send(text, source);
  };

  const jumpToLatest = () => {
    const el = scrollRef.current;
    if (!el) return;
    follow();
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  };

  const switchTo = (fn: () => void) => {
    follow();
    fn();
  };

  const lastAssistantIndex = messages.map((m) => m.role).lastIndexOf('assistant');
  const empty = messages.length === 0;

  return (
    <div className={styles.page}>
      <div className={styles.app}>
        <div className={styles.bar}>
          <div className={styles.barInner}>
            <AppPageHeader
              compact
              eyebrow="Chat"
              title="Prodigi Intelligence"
              lead="Ask. Explore. Understand."
              badges={<ModeBadge />}
              actions={
                <>
                  <a href="#about" className={styles.aboutLink} aria-label="About this experience">
                    <Icon name="info" size={16} />
                    <span>About</span>
                  </a>
                  <Button
                    variant="secondary"
                    size="sm"
                    icon="plus"
                    iconPosition="start"
                    className={styles.newButton}
                    onClick={() => switchTo(chat.newConversation)}
                    disabled={empty}
                  >
                    New conversation
                  </Button>
                </>
              }
            />
          </div>
        </div>

        <div className={styles.viewport}>
          <div ref={scrollRef} className={styles.scroll} onScroll={onScroll}>
            <div className={styles.thread}>
              {empty ? (
                <div className={styles.empty}>
                  <h2 className={styles.emptyTitle}>Start a conversation with Prodigi Intelligence.</h2>
                  <p className={styles.emptyLead}>Ask about building products, improving a digital presence, or where AI fits a business.</p>
                  <ul className={styles.suggestions} aria-label="Suggested questions">
                    {promptSuggestions.map((prompt) => (
                      <li key={prompt}>
                        <button type="button" className={styles.suggestion} onClick={() => send(prompt, 'suggestion')} disabled={busy}>
                          <span>{prompt}</span>
                          <Icon name="arrowUpRight" size={16} />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <section aria-labelledby="chat-log-heading" aria-busy={busy}>
                  <h2 id="chat-log-heading" className="sr-only">
                    Conversation
                  </h2>
                  <ol className={styles.messages}>
                    {messages.map((message, index) => (
                      <ChatMessage
                        key={message.id}
                        message={message}
                        showFollowUps={!busy && !error && index === lastAssistantIndex && index === messages.length - 1}
                        onFollowUp={(text) => send(text, 'follow_up')}
                      />
                    ))}
                  </ol>
                </section>
              )}

              {error && (
                <div className={styles.error}>
                  <StateMessage
                    tone="error"
                    title="Something went wrong. Please try again."
                    action={
                      <Button variant="secondary" size="sm" icon="refresh" iconPosition="start" onClick={() => switchTo(chat.retry)}>
                        Retry
                      </Button>
                    }
                  >
                    {error}
                  </StateMessage>
                </div>
              )}
            </div>
          </div>

          {!atBottom && !empty && (
            <button type="button" className={styles.jump} onClick={jumpToLatest}>
              <Icon name="chevronDown" size={16} />
              <span>Jump to latest</span>
            </button>
          )}
        </div>

        <div className={styles.dock}>
          <div className={styles.dockInner}>
            <Composer busy={busy} onSend={(text) => send(text, 'input')} onStop={chat.stop} />
            <DemoNotice compact>
              Answers come from a local engine over Prodigi’s published content. No AI model is connected and nothing you type leaves this page.
            </DemoNotice>
          </div>
        </div>
      </div>

      {/* Announces settled replies only — never individual streamed fragments. */}
      <div role="status" aria-live="polite" className="sr-only">
        {chat.announcement}
      </div>

      <div className={styles.aboutWrap}>
        <AboutExperience
          path="/intelligence/chat"
          intro="This is a working chat interface: streamed answers, sources, follow-ups and conversation history. It runs on the same service contract a production AI backend implements."
          links={[{ label: 'How Prodigi Intelligence works', to: '/intelligence' }]}
          cta={{ label: 'Talk to Prodigi about AI chat', to: '/contact?topic=integrate-ai' }}
        />
      </div>

      <SidebarSlot>
        <ConversationHistory
          conversations={chat.conversations}
          activeId={chat.activeId}
          onSelect={(id) => switchTo(() => chat.select(id))}
          onDelete={chat.remove}
          onNew={() => switchTo(chat.newConversation)}
        />
      </SidebarSlot>
    </div>
  );
}
