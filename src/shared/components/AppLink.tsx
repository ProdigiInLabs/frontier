import { forwardRef } from 'react';
import type { AnchorHTMLAttributes } from 'react';
import { Link, NavLink } from 'react-router';
import type { NavLinkProps } from 'react-router';
import { preloadRoute } from '@/routing/preload';

type AppLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
  to: string;
  nav?: false;
};

const isExternal = (to: string) => /^(https?:|mailto:|tel:)/.test(to);

/**
 * Internal links preload their route chunk on hover/focus, so navigation
 * feels instant without eagerly downloading every page.
 */
export const AppLink = forwardRef<HTMLAnchorElement, AppLinkProps>(function AppLink(
  { to, onMouseEnter, onFocus, children, ...rest },
  ref,
) {
  if (isExternal(to)) {
    const external = /^https?:/.test(to);
    return (
      <a ref={ref} href={to} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})} {...rest}>
        {children}
      </a>
    );
  }
  return (
    <Link
      ref={ref}
      to={to}
      onMouseEnter={(event) => {
        preloadRoute(to);
        onMouseEnter?.(event);
      }}
      onFocus={(event) => {
        preloadRoute(to);
        onFocus?.(event);
      }}
      {...rest}
    >
      {children}
    </Link>
  );
});

export const AppNavLink = forwardRef<HTMLAnchorElement, NavLinkProps & { to: string }>(function AppNavLink(
  { to, onMouseEnter, onFocus, ...rest },
  ref,
) {
  return (
    <NavLink
      ref={ref}
      to={to}
      onMouseEnter={(event) => {
        preloadRoute(to);
        onMouseEnter?.(event);
      }}
      onFocus={(event) => {
        preloadRoute(to);
        onFocus?.(event);
      }}
      {...rest}
    />
  );
});
