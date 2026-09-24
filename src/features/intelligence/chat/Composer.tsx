import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import type { FormEvent, KeyboardEvent } from 'react';
import { Icon } from '@/shared/components/Icon';
import { MAX_INPUT_LENGTH } from './suggestions';
import styles from './Composer.module.css';

interface Props {
  busy: boolean;
  /** Returns true when the message was accepted. */
  onSend: (text: string) => boolean;
  onStop: () => void;
}

export function Composer({ busy, onSend, onStop }: Props) {
  const id = useId();
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  /** The composer had focus when the turn began, so focus follows the turn. */
  const keepFocus = useRef(false);

  // Autosize: grow with content; CSS caps the height at ~8 lines.
  useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  // While streaming the textarea is disabled: park focus on Stop, then return it.
  useEffect(() => {
    if (!keepFocus.current) return;
    if (busy) buttonRef.current?.focus();
    else {
      keepFocus.current = false;
      textareaRef.current?.focus();
    }
  }, [busy]);

  const submit = () => {
    if (busy) return;
    const active = document.activeElement;
    const focused = active === textareaRef.current || active === buttonRef.current;
    if (onSend(value)) {
      keepFocus.current = focused;
      setValue('');
    }
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    submit();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      submit();
    }
  };

  const length = value.length;
  const canSend = value.trim().length > 0 && !busy;

  return (
    <form className={styles.composer} onSubmit={onSubmit}>
      <label htmlFor={`${id}-input`} className="sr-only">
        Message Prodigi Intelligence
      </label>
      <div className={styles.field}>
        <textarea
          ref={textareaRef}
          id={`${id}-input`}
          className={styles.input}
          rows={1}
          value={value}
          maxLength={MAX_INPUT_LENGTH}
          placeholder={busy ? 'Prodigi Intelligence is responding…' : 'Ask about products, digital or AI…'}
          disabled={busy}
          enterKeyHint="send"
          aria-describedby={`${id}-hint ${id}-count`}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={onKeyDown}
        />
        <div className={styles.controls}>
          <span id={`${id}-count`} className={styles.count} data-near={length > MAX_INPUT_LENGTH * 0.9}>
            <span className="sr-only">Characters used: </span>
            {length}
            <span aria-hidden="true">/</span>
            <span className="sr-only"> of </span>
            {MAX_INPUT_LENGTH}
          </span>
          <button
            ref={buttonRef}
            type={busy ? 'button' : 'submit'}
            className={styles.action}
            data-busy={busy}
            aria-label={busy ? 'Stop generating' : 'Send message'}
            disabled={!busy && !canSend}
            onClick={
              busy
                ? (event) => {
                    // Stop re-renders this same button as "submit" before the default action runs.
                    event.preventDefault();
                    onStop();
                  }
                : undefined
            }
          >
            <Icon name={busy ? 'stop' : 'send'} size={18} />
          </button>
        </div>
      </div>
      <p id={`${id}-hint`} className={styles.hint}>
        <kbd>Enter</kbd> to send · <kbd>Shift</kbd> + <kbd>Enter</kbd> for a new line
      </p>
    </form>
  );
}
