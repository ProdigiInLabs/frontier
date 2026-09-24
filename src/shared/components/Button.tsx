import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { AppLink } from './AppLink';
import { Icon } from './Icon';
import type { IconName } from './Icon';
import styles from './Button.module.css';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'accent';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface CommonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: IconName;
  iconPosition?: 'start' | 'end';
  children: ReactNode;
  className?: string;
}

const classes = (variant: ButtonVariant, size: ButtonSize, className?: string) =>
  [styles.button, styles[variant], styles[size], className].filter(Boolean).join(' ');

function Content({ icon, iconPosition = 'end', children }: Pick<CommonProps, 'icon' | 'iconPosition' | 'children'>) {
  return (
    <>
      {icon && iconPosition === 'start' && <Icon name={icon} size={18} className={styles.icon} />}
      <span>{children}</span>
      {icon && iconPosition === 'end' && <Icon name={icon} size={18} className={styles.icon} />}
    </>
  );
}

export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition,
  className,
  children,
  type = 'button',
  ...rest
}: CommonProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type={type} className={classes(variant, size, className)} {...rest}>
      <Content icon={icon} iconPosition={iconPosition}>
        {children}
      </Content>
    </button>
  );
}

export function ButtonLink({
  to,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition,
  className,
  children,
  onClick,
}: CommonProps & { to: string; onClick?: () => void }) {
  return (
    <AppLink to={to} className={classes(variant, size, className)} onClick={onClick}>
      <Content icon={icon} iconPosition={iconPosition}>
        {children}
      </Content>
    </AppLink>
  );
}
