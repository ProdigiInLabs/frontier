import { ButtonLink } from '@/shared/components/Button';
import { LogoMark } from '@/shared/components/Logo';
import styles from './ChatPreview.module.css';

/** A static example exchange that previews the chat product and links into it. */
export function ChatPreview() {
  return (
    <figure className={styles.preview}>
      <div className={styles.bar}>
        <LogoMark size={16} />
        <span>Prodigi Intelligence</span>
        <span className={styles.barHint}>Example exchange</span>
      </div>
      <div className={styles.body}>
        <p className={styles.user}>Can AI answer customer questions using our own product data?</p>
        <div className={styles.ai}>
          <p>
            Yes — by connecting a model to your catalogue and help content through retrieval (RAG). It answers from approved sources, cites
            them, and hands over to a person when it should.
          </p>
          <p className={styles.sources}>
            <span>Sources</span> AI search · Enterprise integration
          </p>
        </div>
      </div>
      <figcaption className={styles.foot}>
        <ButtonLink to="/intelligence/chat" variant="accent" size="sm" icon="arrowRight">
          Try AI Chat
        </ButtonLink>
      </figcaption>
    </figure>
  );
}
