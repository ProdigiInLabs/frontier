import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { useSearchParams } from 'react-router';
import { config } from '@/core/config/env';
import { analytics } from '@/core/services/analytics/analytics-service';
import { EMAIL_PATTERN, submitContact } from '@/core/services/contact/contact-service';
import type { ContactSubmission } from '@/core/services/contact/contact-service';
import { contactTimelines, contactTopics, isContactTopic } from '@/content/contact';
import { useRouteEntry } from '@/routing/useRouteEntry';
import { Button } from '@/shared/components/Button';
import { ChoiceCards, TextArea, TextField } from '@/shared/components/Field';
import { Container, Section } from '@/shared/components/Layout';
import { StateMessage } from '@/shared/components/StateMessage';
import { FaqSection } from '@/shared/sections/FaqSection';
import { PageHero } from '@/shared/sections/PageHero';
import styles from './ContactPage.module.css';

type Errors = Partial<Record<keyof ContactSubmission, string>>;
type Status = { state: 'idle' } | { state: 'sending' } | { state: 'sent'; channel: 'api' | 'email' } | { state: 'error' };

const steps = ['Your goal', 'About you', 'Details'] as const;

const empty: ContactSubmission = { topic: 'build-product', topicOther: '', name: '', email: '', company: '', details: '', timeline: '', website: '' };

function validate(step: number, data: ContactSubmission): Errors {
  const errors: Errors = {};
  if (step === 0 && data.topic === 'other' && !data.topicOther.trim()) errors.topicOther = 'Tell us briefly what you have in mind.';
  if (step === 1) {
    if (!data.name.trim()) errors.name = 'Please enter your name.';
    if (!EMAIL_PATTERN.test(data.email.trim())) errors.email = 'Please enter a valid email address.';
  }
  if (step === 2 && data.details.trim().length < 20) errors.details = 'A sentence or two helps us prepare — at least 20 characters.';
  return errors;
}

/** Contact as a short discovery conversation: goal → who → details. */
export default function ContactPage() {
  const route = useRouteEntry();
  const [params] = useSearchParams();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<ContactSubmission>(empty);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>({ state: 'idle' });
  const formRef = useRef<HTMLFormElement>(null);
  const stepHeading = useRef<HTMLHeadingElement>(null);
  const moved = useRef(false);

  // Pre-select the topic from ?topic= (set by CTAs across the site).
  useEffect(() => {
    const topic = params.get('topic');
    // Runs after hydration on purpose: the prerendered page has no query string.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (isContactTopic(topic)) setData((current) => ({ ...current, topic }));
  }, [params]);

  useEffect(() => {
    if (moved.current) stepHeading.current?.focus();
  }, [step]);

  const update = <K extends keyof ContactSubmission>(key: K, value: ContactSubmission[K]) => {
    setData((current) => ({ ...current, [key]: value }));
    if (errors[key]) setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const focusFirstError = () =>
    requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());

  const next = () => {
    const found = validate(step, data);
    setErrors(found);
    if (Object.keys(found).length) return focusFirstError();
    moved.current = true;
    analytics.track('contact_step', { step: step + 2, topic: data.topic });
    setStep((current) => current + 1);
  };

  const back = () => {
    moved.current = true;
    setStep((current) => current - 1);
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (step < steps.length - 1) return next();
    const found = validate(step, data);
    setErrors(found);
    if (Object.keys(found).length) return focusFirstError();
    setStatus({ state: 'sending' });
    try {
      const result = await submitContact({ ...data, name: data.name.trim(), email: data.email.trim() });
      analytics.track('contact_submit', { topic: data.topic, channel: result.channel });
      if (result.channel === 'email') window.location.href = result.href;
      setStatus({ state: 'sent', channel: result.channel });
    } catch {
      setStatus({ state: 'error' });
    }
  };

  return (
    <>
      <PageHero
        eyebrow="Start a conversation"
        title="Let’s start with the problem."
        lead="Three short steps. The more we understand about what you’re trying to accomplish, the more useful the first conversation will be."
      />
      <Section labelledBy="contact-step-title">
        <Container>
          <div className={styles.layout}>
            <div className={styles.formCol}>
              {status.state === 'sent' ? (
                <div className={styles.done} role="status">
                  <h2 id="contact-step-title" className={styles.stepTitle}>
                    {status.channel === 'api' ? 'Thank you — your message is with us.' : 'Your email is ready to send.'}
                  </h2>
                  <p className={styles.doneText}>
                    {status.channel === 'api'
                      ? `We’ll reply to ${data.email}.`
                      : `Your email app should have opened with your answers filled in. If it didn’t, email ${config.contactEmail} directly.`}
                  </p>
                  <Button variant="secondary" onClick={() => { setStatus({ state: 'idle' }); setStep(0); setData(empty); }}>
                    Start another enquiry
                  </Button>
                </div>
              ) : (
                <form ref={formRef} onSubmit={onSubmit} noValidate className={styles.form} aria-describedby="contact-progress">
                  <ol id="contact-progress" className={styles.progress} aria-label="Progress">
                    {steps.map((label, index) => (
                      <li key={label} data-state={index < step ? 'done' : index === step ? 'current' : 'next'} aria-current={index === step ? 'step' : undefined}>
                        <span className={styles.progressIndex}>{index + 1}</span>
                        <span>{label}</span>
                      </li>
                    ))}
                  </ol>

                  <h2 id="contact-step-title" ref={stepHeading} tabIndex={-1} className="sr-only">
                    Step {step + 1} of {steps.length}: {steps[step]}
                  </h2>

                  {step === 0 && (
                    <div className={styles.fields}>
                      <ChoiceCards
                        legend="What are you looking to solve?"
                        name="topic"
                        value={data.topic}
                        onChange={(value) => update('topic', value as ContactSubmission['topic'])}
                        options={contactTopics.map((topic) => ({ value: topic.id, label: topic.label, hint: topic.hint }))}
                      />
                      {data.topic === 'other' && (
                        <TextField label="What do you have in mind?" value={data.topicOther} onChange={(e) => update('topicOther', e.target.value)} error={errors.topicOther} maxLength={200} />
                      )}
                    </div>
                  )}

                  {step === 1 && (
                    <div className={styles.fields}>
                      <p className={styles.legend}>Who should we reply to?</p>
                      <TextField label="Your name" autoComplete="name" value={data.name} onChange={(e) => update('name', e.target.value)} error={errors.name} maxLength={120} required />
                      <TextField label="Work email" type="email" autoComplete="email" inputMode="email" value={data.email} onChange={(e) => update('email', e.target.value)} error={errors.email} maxLength={200} required />
                      <TextField label="Company" autoComplete="organization" optional value={data.company} onChange={(e) => update('company', e.target.value)} maxLength={160} />
                    </div>
                  )}

                  {step === 2 && (
                    <div className={styles.fields}>
                      <TextArea
                        label="Project details"
                        hint="What exists today, what should change, and anything we should know — systems, constraints, deadlines."
                        value={data.details}
                        onChange={(e) => update('details', e.target.value)}
                        error={errors.details}
                        maxLength={4000}
                        rows={7}
                        required
                      />
                      <ChoiceCards
                        legend="When would you like to start?"
                        name="timeline"
                        value={data.timeline}
                        onChange={(value) => update('timeline', value)}
                        options={contactTimelines.map((value) => ({ value, label: value }))}
                      />
                    </div>
                  )}

                  {/* Honeypot: hidden from people and assistive tech. */}
                  <div className={styles.honeypot} aria-hidden="true">
                    <label>
                      Website
                      <input tabIndex={-1} autoComplete="off" value={data.website} onChange={(e) => update('website', e.target.value)} />
                    </label>
                  </div>

                  {status.state === 'error' && (
                    <StateMessage tone="error" title="Something went wrong. Please try again.">
                      You can also email us directly at <a href={`mailto:${config.contactEmail}`}>{config.contactEmail}</a>.
                    </StateMessage>
                  )}

                  <div className={styles.nav}>
                    {step > 0 && (
                      <Button variant="ghost" icon="arrowLeft" iconPosition="start" onClick={back}>
                        Back
                      </Button>
                    )}
                    <Button type="submit" icon="arrowRight" disabled={status.state === 'sending'} className={styles.primary}>
                      {step < steps.length - 1 ? 'Continue' : status.state === 'sending' ? 'Sending…' : config.contactEndpoint ? 'Send' : 'Compose email'}
                    </Button>
                  </div>
                </form>
              )}
            </div>

            <aside className={styles.aside} aria-label="What happens next">
              <h2 className={styles.asideTitle}>What happens next</h2>
              <ol className={styles.nextSteps}>
                <li>We read your answers and come prepared.</li>
                <li>A conversation about what you’re trying to accomplish.</li>
                <li>A proposal for the smallest useful first step.</li>
              </ol>
              <p className={styles.direct}>
                Prefer email? <a href={`mailto:${config.contactEmail}`}>{config.contactEmail}</a>
              </p>
            </aside>
          </div>
        </Container>
      </Section>
      <FaqSection ids={route.faqIds} />
    </>
  );
}
