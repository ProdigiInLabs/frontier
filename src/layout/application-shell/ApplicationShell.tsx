import { useEffect, useRef, useState } from 'react';
import { Outlet, useLocation } from 'react-router';
import { config } from '@/core/config/env';
import { appNav } from '@/content/navigation';
import { AppLink, AppNavLink } from '@/shared/components/AppLink';
import { Badge } from '@/shared/components/Badge';
import { Icon } from '@/shared/components/Icon';
import { LogoMark } from '@/shared/components/Logo';
import { SidebarSlotContext } from './sidebar-slot';
import styles from './ApplicationShell.module.css';

const icons = {
  '/intelligence/chat': 'chat',
  '/intelligence/agents': 'agent',
  '/intelligence/search': 'search',
  '/intelligence/voice': 'voice',
  '/demo/enterprise-ai': 'flow',
  '/intelligence': 'sparkle',
  '/intelligence/automation': 'bolt',
  '/intelligence/integrations': 'plug',
  '/demo': 'layers',
} as const;

/**
 * Product mode. Shares tokens, type and components with the marketing site,
 * but uses a contextual navigation and a full-height workspace layout.
 */
export function ApplicationShell() {
  const { pathname } = useLocation();
  // Keyed to the path it was opened on, so navigating closes it without an effect.
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const menuOpen = menuPath === pathname;
  const setMenuOpen = (open: boolean) => setMenuPath(open ? pathname : null);
  const [slot, setSlot] = useState<HTMLDivElement | null>(null);
  const sidebarRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    sidebarRef.current?.querySelector<HTMLElement>('a, button')?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuPath(null);
        menuButtonRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  return (
    <div className={styles.shell} data-theme="dark" data-menu-open={menuOpen}>
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      <div className={styles.topbar}>
        <button
          ref={menuButtonRef}
          type="button"
          className={styles.iconButton}
          aria-label="Open Prodigi Intelligence navigation"
          aria-expanded={menuOpen}
          aria-controls="app-sidebar"
          onClick={() => setMenuOpen(true)}
        >
          <Icon name="sidebar" />
        </button>
        <AppLink to="/intelligence" className={styles.topbarBrand}>
          <LogoMark size={18} />
          <span>Prodigi Intelligence</span>
        </AppLink>
        {config.demoMode && <Badge tone="demo">Demo</Badge>}
      </div>

      <aside id="app-sidebar" ref={sidebarRef} className={styles.sidebar} aria-label="Prodigi Intelligence">
        <div className={styles.sidebarHead}>
          <AppLink to="/intelligence" className={styles.brand}>
            <LogoMark size={20} />
            <span className={styles.brandText}>
              <span className={styles.brandName}>Prodigi</span>
              <span className={styles.brandProduct}>Intelligence</span>
            </span>
          </AppLink>
          <button type="button" className={[styles.iconButton, styles.closeButton].join(' ')} aria-label="Close navigation" onClick={() => setMenuOpen(false)}>
            <Icon name="close" />
          </button>
        </div>

        <nav aria-label="Prodigi Intelligence" className={styles.nav}>
          {appNav.map((section) => (
            <div key={section.title} className={styles.navSection}>
              <p className={styles.navTitle}>{section.title}</p>
              <ul className={styles.navList}>
                {section.items.map((item) => (
                  <li key={item.to}>
                    <AppNavLink to={item.to} end className={styles.navLink}>
                      <Icon name={icons[item.to as keyof typeof icons] ?? 'chevronRight'} size={18} />
                      {item.label}
                    </AppNavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div ref={setSlot} className={styles.slot} />

        <div className={styles.sidebarFoot}>
          {config.demoMode && (
            <p className={styles.demoNote}>
              <Badge tone="demo">Demo mode</Badge>
              <span>Runs locally on Prodigi’s site content. No AI model or business system is connected.</span>
            </p>
          )}
          <AppLink to="/" className={styles.back}>
            <Icon name="arrowLeft" size={16} />
            Back to Prodigi
          </AppLink>
        </div>
      </aside>

      <button type="button" className={styles.scrim} aria-hidden="true" tabIndex={-1} onClick={() => setMenuOpen(false)} />

      <SidebarSlotContext.Provider value={slot}>
        <main id="main" tabIndex={-1} className={styles.main} inert={menuOpen ? true : undefined}>
          <Outlet />
        </main>
      </SidebarSlotContext.Provider>
    </div>
  );
}
