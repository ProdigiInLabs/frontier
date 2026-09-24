import { useId } from 'react';
import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react';
import styles from './Field.module.css';

interface FieldShellProps {
  label: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  children: (ids: { inputId: string; describedBy: string | undefined; invalid: boolean }) => ReactNode;
}

function FieldShell({ label, hint, error, optional, children }: FieldShellProps) {
  const inputId = useId();
  const hintId = `${inputId}-hint`;
  const errorId = `${inputId}-error`;
  const describedBy = [hint && hintId, error && errorId].filter(Boolean).join(' ') || undefined;
  return (
    <div className={styles.field}>
      <label htmlFor={inputId} className={styles.label}>
        {label}
        {optional && <span className={styles.optional}> (optional)</span>}
      </label>
      {hint && (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      )}
      {children({ inputId, describedBy, invalid: Boolean(error) })}
      {error && (
        <p id={errorId} className={styles.error} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

type TextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> & {
  label: string;
  hint?: string;
  error?: string;
  optional?: boolean;
};

export function TextField({ label, hint, error, optional, ...rest }: TextFieldProps) {
  return (
    <FieldShell label={label} hint={hint} error={error} optional={optional}>
      {({ inputId, describedBy, invalid }) => (
        <input id={inputId} aria-describedby={describedBy} aria-invalid={invalid || undefined} className={styles.input} {...rest} />
      )}
    </FieldShell>
  );
}

type TextAreaProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'id'> & {
  label: string;
  hint?: string;
  error?: string;
  optional?: boolean;
};

export function TextArea({ label, hint, error, optional, ...rest }: TextAreaProps) {
  return (
    <FieldShell label={label} hint={hint} error={error} optional={optional}>
      {({ inputId, describedBy, invalid }) => (
        <textarea
          id={inputId}
          aria-describedby={describedBy}
          aria-invalid={invalid || undefined}
          className={[styles.input, styles.textarea].join(' ')}
          {...rest}
        />
      )}
    </FieldShell>
  );
}

interface ChoiceOption {
  value: string;
  label: string;
  hint?: string;
}

/** Radio group rendered as selectable cards. Native radios keep keyboard behaviour. */
export function ChoiceCards({
  legend,
  name,
  options,
  value,
  onChange,
  error,
  columns = 2,
}: {
  legend: string;
  name: string;
  options: ChoiceOption[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
  columns?: 1 | 2;
}) {
  const errorId = useId();
  return (
    <fieldset className={styles.fieldset} aria-describedby={error ? errorId : undefined}>
      <legend className={styles.legend}>{legend}</legend>
      <div className={styles.choices} data-columns={columns}>
        {options.map((option) => (
          <label key={option.value} className={styles.choice}>
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className={styles.radio}
            />
            <span className={styles.choiceText}>
              <span className={styles.choiceLabel}>{option.label}</span>
              {option.hint && <span className={styles.choiceHint}>{option.hint}</span>}
            </span>
          </label>
        ))}
      </div>
      {error && (
        <p id={errorId} className={styles.error} role="alert">
          {error}
        </p>
      )}
    </fieldset>
  );
}
