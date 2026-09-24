import type { SVGProps } from 'react';

/** Minimal line icon set (24px grid, 1.5 stroke). Decorative by default. */
const paths = {
  arrowRight: 'M5 12h14M13 6l6 6-6 6',
  arrowLeft: 'M19 12H5M11 18l-6-6 6-6',
  arrowUpRight: 'M7 17 17 7M8 7h9v9',
  chevronDown: 'm6 9 6 6 6-6',
  chevronRight: 'm9 6 6 6-6 6',
  menu: 'M4 7h16M4 12h16M4 17h16',
  close: 'M6 6l12 12M18 6 6 18',
  plus: 'M12 5v14M5 12h14',
  send: 'M5 12h13M12 5l7 7-7 7',
  stop: 'M7 7h10v10H7z',
  mic: 'M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3ZM5 11a7 7 0 0 0 14 0M12 18v3',
  search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14ZM20 20l-4-4',
  chat: 'M4 5h16v11H9l-5 4V5Z',
  agent: 'M12 3v3M5 9h14v10H5zM9 13h.01M15 13h.01M9 16h6',
  voice: 'M4 10v4M8 7v10M12 4v16M16 7v10M20 10v4',
  flow: 'M5 6h5v5H5zM14 13h5v5h-5zM10 8.5h2a2 2 0 0 1 2 2V13',
  bolt: 'M13 3 5 14h6l-1 7 8-11h-6l1-7Z',
  check: 'm5 12 4.5 4.5L19 7',
  alert: 'M12 8v5M12 16.5h.01M10.3 4.2 2.8 17.5A2 2 0 0 0 4.5 20.5h15a2 2 0 0 0 1.7-3L13.7 4.2a2 2 0 0 0-3.4 0Z',
  refresh: 'M20 11a8 8 0 1 0-2.3 5.7M20 5v6h-6',
  history: 'M4 12a8 8 0 1 0 2.3-5.7M4 5v4h4M12 8v4l3 2',
  sidebar: 'M4 5h16v14H4zM9 5v14',
  book: 'M5 4h10a4 4 0 0 1 4 4v12H9a4 4 0 0 1-4-4V4ZM5 16a4 4 0 0 1 4-4h10',
  layers: 'm12 3 9 5-9 5-9-5 9-5ZM3 13l9 5 9-5',
  plug: 'M9 3v5M15 3v5M6 8h12v3a6 6 0 0 1-12 0V8ZM12 17v4',
  mail: 'M4 6h16v12H4zM4 7l8 6 8-6',
  info: 'M12 11v5M12 8h.01M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z',
  trash: 'M5 7h14M10 7V4h4v3M7 7l1 13h8l1-13',
  sparkle: 'M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6',
  external: 'M14 5h5v5M19 5l-8 8M18 14v5H5V6h5',
} as const;

export type IconName = keyof typeof paths;

interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  name: IconName;
  size?: number;
  /** Provide a label only when the icon conveys meaning on its own. */
  label?: string;
}

export function Icon({ name, size = 20, label, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
      {...rest}
    >
      <path d={paths[name]} />
    </svg>
  );
}
