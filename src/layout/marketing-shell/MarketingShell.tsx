import { Outlet } from 'react-router';
import { ConsentBanner } from '@/layout/consent/ConsentBanner';
import { Footer } from '@/layout/footer/Footer';
import { Header } from '@/layout/navbar/Header';
import styles from './MarketingShell.module.css';

/** Corporate experience: global header, content, footer. */
export function MarketingShell() {
  return (
    <div className={styles.shell}>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Header />
      <main id="main" tabIndex={-1} className={styles.main}>
        <Outlet />
      </main>
      <Footer />
      <ConsentBanner />
    </div>
  );
}
