import { useEffect, useId, useRef, useState } from 'react';
import { useLocation } from 'react-router';
import { primaryNav } from '@/content/navigation';
import type { NavGroup } from '@/content/navigation';
import { AppLink, AppNavLink } from '@/shared/components/AppLink';
import { Badge } from '@/shared/components/Badge';
import { ButtonLink } from '@/shared/components/Button';
import { Icon } from '@/shared/components/Icon';
import { Logo } from '@/shared/components/Logo';
import { MobileNav } from './MobileNav';
import styles from './Header.module.css';

export function Header() {
  const { pathname } = useLocation();
  // Menu state is keyed to the path it was opened on: navigating closes menus.
  const [menu, setMenu] = useState<{ key: string; path: string } | null>(null);
  const openMenu = menu?.path === pathname ? menu.key : null;
  const mobileOpen = openMenu === '__mobile';
  const setOpenMenu = (update: string | null | ((current: string | null) => string | null)) => {
    const key = typeof update === 'function' ? update(openMenu) : update;
    setMenu(key ? { key, path: pathname } : null);
  };
  const setMobileOpen = (open: boolean) => setOpenMenu(open ? '__mobile' : null);
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Dismiss the open dropdown on outside click or Escape.
  useEffect(() => {
    if (!openMenu || mobileOpen) return;
    const onPointer = (event: PointerEvent) => {
      if (!navRef.current?.contains(event.target as Node)) setMenu(null);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        const trigger = navRef.current?.querySelector<HTMLButtonElement>(`[data-menu="${openMenu}"]`);
        setMenu(null);
        trigger?.focus();
      }
    };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [openMenu, mobileOpen]);

  return (
    <header className={styles.header} data-scrolled={scrolled || (openMenu !== null && !mobileOpen)}>
      <div className={styles.bar}>
        <AppLink to="/" className={styles.brand} aria-label="Prodigi home">
          <Logo />
        </AppLink>

        <nav ref={navRef} aria-label="Primary" className={styles.nav}>
          <ul className={styles.menu}>
            {primaryNav.map((group) =>
              group.children ? (
                <DropdownItem
                  key={group.label}
                  group={group}
                  open={openMenu === group.label}
                  active={pathname.startsWith(group.to)}
                  onToggle={() => setOpenMenu((current) => (current === group.label ? null : group.label))}
                />
              ) : (
                <li key={group.label}>
                  <AppNavLink to={group.to} className={styles.link}>
                    {group.label}
                  </AppNavLink>
                </li>
              ),
            )}
          </ul>
        </nav>

        <div className={styles.end}>
          <ButtonLink to="/contact" size="sm" className={styles.cta}>
            Start a Conversation
          </ButtonLink>
          <button
            type="button"
            className={styles.burger}
            aria-label="Open menu"
            aria-haspopup="dialog"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen(true)}
          >
            <Icon name="menu" size={22} />
          </button>
        </div>
      </div>
      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </header>
  );
}

function DropdownItem({
  group,
  open,
  active,
  onToggle,
}: {
  group: NavGroup;
  open: boolean;
  active: boolean;
  onToggle: () => void;
}) {
  const panelId = useId();
  return (
    <li className={styles.dropdown}>
      <button
        type="button"
        className={styles.link}
        data-menu={group.label}
        data-active={active || undefined}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={onToggle}
      >
        {group.label}
        <Icon name="chevronDown" size={14} className={styles.chevron} />
      </button>
      <div id={panelId} className={styles.panel} hidden={!open} data-pillar={group.pillar}>
        <div className={styles.panelInner}>
          {group.intro && (
            <div className={styles.panelIntro}>
              <p className={styles.panelEyebrow}>{group.label}</p>
              <p className={styles.panelTitle}>{group.intro.title}</p>
              <p className={styles.panelText}>{group.intro.text}</p>
              {group.featured && (
                <ButtonLink to={group.featured.to} variant="accent" size="sm" icon="arrowRight" className={styles.panelFeatured}>
                  {group.featured.label}
                </ButtonLink>
              )}
            </div>
          )}
          <ul className={styles.panelLinks} data-count={group.children!.length}>
            {group.children!.map((child) => (
              <li key={child.to}>
                <AppLink to={child.to} className={styles.panelLink}>
                  <span className={styles.panelLinkLabel}>
                    {child.label}
                    {child.interactive && <Badge tone="intelligence">Interactive</Badge>}
                  </span>
                  {child.description && <span className={styles.panelLinkDesc}>{child.description}</span>}
                </AppLink>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </li>
  );
}
