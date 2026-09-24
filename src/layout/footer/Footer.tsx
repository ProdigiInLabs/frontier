import { config } from '@/core/config/env';
import { footerNav } from '@/content/navigation';
import { site } from '@/content/site';
import { AppLink } from '@/shared/components/AppLink';
import { Logo } from '@/shared/components/Logo';
import styles from './Footer.module.css';

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <Logo descriptor />
          {/* Entity statement, repeated verbatim site-wide for GEO consistency. */}
          <p className={styles.statement}>{site.definition}</p>
          <p className={styles.principle}>{site.principle}</p>
          <a className={styles.email} href={`mailto:${config.contactEmail}`}>
            {config.contactEmail}
          </a>
        </div>
        <nav aria-label="Footer" className={styles.nav}>
          {footerNav.map((column) => (
            <div key={column.title}>
              <h2 className={styles.heading}>{column.title}</h2>
              <ul className={styles.list}>
                {column.links.map((link) => (
                  <li key={link.to}>
                    <AppLink to={link.to}>{link.label}</AppLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>
      <div className={styles.base}>
        <p>© {new Date().getFullYear()} {site.legalName}. All rights reserved.</p>
        <p className={styles.acronym}>{site.acronym}</p>
      </div>
    </footer>
  );
}
