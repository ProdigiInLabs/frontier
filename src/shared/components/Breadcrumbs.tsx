import { useLocation } from 'react-router';
import { getBreadcrumbs } from '@/routing/manifest';
import { AppLink } from './AppLink';
import styles from './Breadcrumbs.module.css';

/** Visible breadcrumbs; the matching BreadcrumbList schema is emitted in <head>. */
export function Breadcrumbs() {
  const { pathname } = useLocation();
  const crumbs = getBreadcrumbs(pathname);
  if (crumbs.length < 2) return null;
  return (
    <nav aria-label="Breadcrumb" className={styles.nav}>
      <ol className={styles.list}>
        {crumbs.map((crumb, index) => {
          const last = index === crumbs.length - 1;
          return (
            <li key={crumb.path} className={styles.item}>
              {last ? (
                <span aria-current="page">{crumb.name}</span>
              ) : (
                <AppLink to={crumb.path}>{crumb.name}</AppLink>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
