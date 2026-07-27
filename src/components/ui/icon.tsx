import type { SVGProps } from 'react';
import { cn } from '@/lib/utils';

/**
 * Alle Symbole der Seite als Vektor. Kein einziges Icon ist ein Rasterbild.
 *
 * 24×24-Raster, 1.75px Strichstärke, `currentColor` – dadurch erben Symbole
 * Farbe und Kontrast vom umgebenden Text und funktionieren im Dark Mode und
 * im Kontrastmodus ohne Sonderbehandlung.
 */
const paths = {
  search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14ZM20 20l-4.2-4.2',
  menu: 'M4 7h16M4 12h16M4 17h16',
  close: 'M6 6l12 12M18 6 6 18',
  chevronDown: 'm6 9 6 6 6-6',
  chevronUp: 'm6 15 6-6 6 6',
  chevronRight: 'm9 6 6 6-6 6',
  chevronLeft: 'm15 6-6 6 6 6',
  arrowRight: 'M4 12h15m-6-6 6 6-6 6',
  arrowLeft: 'M20 12H5m6 6-6-6 6-6',
  arrowUp: 'M12 20V5m-6 6 6-6 6 6',
  external: 'M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5',
  globe: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18ZM3.5 9h17M3.5 15h17M12 3c2.2 2.4 3.3 5.3 3.3 9s-1.1 6.6-3.3 9c-2.2-2.4-3.3-5.3-3.3-9S9.8 5.4 12 3Z',
  accessibility:
    'M12 3.2a1.4 1.4 0 1 0 0 2.8 1.4 1.4 0 0 0 0-2.8ZM4.5 8.2c2.4.8 5 1.2 7.5 1.2s5.1-.4 7.5-1.2M12 9.4v5m0 0-2.8 6.2M12 14.4l2.8 6.2',
  sun: 'M12 6.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM12 2v2m0 16v2M2 12h2m16 0h2M4.9 4.9l1.5 1.5m11.2 11.2 1.5 1.5M19.1 4.9l-1.5 1.5M6.4 17.6l-1.5 1.5',
  moon: 'M20 14.2A8.4 8.4 0 0 1 9.8 4 8.5 8.5 0 1 0 20 14.2Z',
  phone:
    'M6.2 3.5h3l1.5 3.8-2 1.4a12 12 0 0 0 5.6 5.6l1.4-2 3.8 1.5v3a2 2 0 0 1-2.2 2A16.8 16.8 0 0 1 4.2 5.7a2 2 0 0 1 2-2.2Z',
  mail: 'M3.5 6.5h17v11h-17zM3.5 7l8.5 6 8.5-6',
  clock: 'M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16ZM12 7.5V12l3 2',
  mapPin: 'M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11ZM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z',
  calendar: 'M4.5 6.5h15v14h-15zM4.5 11h15M8.5 3.5v4m7-4v4',
  fileText: 'M6 3.5h7.5L18.5 8v12.5h-12.5zM13.5 3.5V8H18M9 12.5h6M9 16h6',
  download: 'M12 4v11m0 0-4-4m4 4 4-4M5 19.5h14',
  building:
    'M4.5 20.5V6.2l7.5-3 7.5 3v14.3M4.5 20.5h15M9 20.5v-4.2h6v4.2M8 10h2m4 0h2M8 13.2h2m4 0h2',
  users:
    'M9 11.5a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4ZM2.8 19.8a6.2 6.2 0 0 1 12.4 0M16 5.4a3.2 3.2 0 0 1 0 6.2M17 13.9a6.2 6.2 0 0 1 4.2 5.9',
  droplet: 'M12 3.2s5.8 6 5.8 9.6A5.8 5.8 0 0 1 6.2 12.8C6.2 9.2 12 3.2 12 3.2Z',
  recycle:
    'M8.6 4.9 6.4 8.6M4 12.4l2.4 4.1h4.1M15.4 4.9l2.2 3.7M20 12.4l-2.4 4.1h-4.4M9.4 20.5H7.2M12.4 3.3h-2.2M14.2 18.6l2 1.9-2 1.9M6.6 6.3 4 6.9l.6 2.6M19.4 9.5l.6-2.6-2.6-.6',
  flame:
    'M12 21c3.3 0 5.5-2.1 5.5-5 0-4.4-4.4-5.6-3.4-10.6-2.8 1-4.6 3.9-4.6 6.1 0 .9.2 1.6.5 2.2-1-.2-1.8-1-2.2-2.1-1 1.3-1.3 2.7-1.3 4.4 0 2.9 2.2 5 5.5 5Z',
  trash: 'M5 7h14M9.5 7V4.5h5V7M6.8 7l.8 13h8.8l.8-13M10.5 10.5v6.2m3-6.2v6.2',
  euro: 'M17.5 6.5a6.5 6.5 0 1 0 0 11M4.5 10.5H12M4.5 13.5H12',
  chart: 'M4.5 19.5h15M7.5 19.5v-6m4.5 6V6.5m4.5 13v-9',
  gavel: 'M4 20.5h8M13.5 4.2 19.8 10.5M17 3.5l3.5 3.5M11.5 6.4l3.4 3.4M13.9 9.8l-8 8-2.9-2.9 8-8',
  wrench: 'M20 6.1a5 5 0 0 1-6.5 6.5L6 20a2.1 2.1 0 0 1-3-3l7.4-7.5A5 5 0 0 1 17 3l-3 3 1 3 3 1 2-3.9Z',
  graduation: 'M12 4 2.5 8.5 12 13l9.5-4.5L12 4ZM6.5 10.8v5c0 1.4 2.5 2.7 5.5 2.7s5.5-1.3 5.5-2.7v-5M20.5 9v5.5',
  heart: 'M12 20s-7.5-4.7-7.5-9.6A4.4 4.4 0 0 1 12 7.6a4.4 4.4 0 0 1 7.5 2.8c0 4.9-7.5 9.6-7.5 9.6Z',
  briefcase: 'M3.5 8.5h17v11h-17zM8.5 8.5V6a1.5 1.5 0 0 1 1.5-1.5h4A1.5 1.5 0 0 1 15.5 6v2.5M3.5 13h17',
  camera:
    'M3.5 8.5h3.7l1.5-2.3h6.6l1.5 2.3h3.7v11h-17zM12 17.2a3.3 3.3 0 1 0 0-6.6 3.3 3.3 0 0 0 0 6.6Z',
  alert: 'M12 4.5 2.8 20h18.4L12 4.5ZM12 10v4m0 2.6h.01',
  info: 'M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16ZM12 11v5.5M12 8h.01',
  check: 'm5 12.5 4.5 4.5L19 7.5',
  checkCircle: 'M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16ZM8.5 12.2l2.4 2.4 4.6-4.8',
  xCircle: 'M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16ZM9.4 9.4l5.2 5.2m0-5.2-5.2 5.2',
  plus: 'M12 5v14M5 12h14',
  minus: 'M5 12h14',
  filter: 'M3.5 5.5h17l-6.5 7.6v5.6l-4 2.3v-7.9L3.5 5.5Z',
  leaf: 'M20 4c0 9-5.2 13.5-10.5 13.5A4.5 4.5 0 0 1 5 13C5 7.7 11 4 20 4ZM4 20c2.5-3.6 5.5-6.3 9-8',
  book: 'M4 5.2A2.2 2.2 0 0 1 6.2 3H19v15.5H6.2A2.2 2.2 0 0 0 4 20.7V5.2ZM4 18.4A2.2 2.2 0 0 1 6.2 16.2H19',
  megaphone: 'M4 10.5v3a1.5 1.5 0 0 0 1.5 1.5H8l7 4.5V6L8 10.5H5.5A1.5 1.5 0 0 0 4 12ZM8 15v5.5h2.5M18.5 9.5a3.5 3.5 0 0 1 0 5',
  ticket: 'M4 7.5h16v3a2 2 0 0 0 0 4v3H4v-3a2 2 0 0 0 0-4v-3ZM10 7.5v9',
  home: 'M4 10.5 12 4l8 6.5v9.5h-5.5v-5.5h-5V20H4v-9.5Z',
  key: 'M15.5 4a4.5 4.5 0 1 0-4 6.7L4 18.2V20.5h3v-2h2v-2h2l1.3-1.3A4.5 4.5 0 0 0 15.5 4ZM16.6 7.4h.01',
  scale: 'M12 4v16M7 20h10M6 8h12M6 8 3.5 14h5L6 8Zm12 0-2.5 6h5L18 8Z',
  lightbulb: 'M9.2 17.5h5.6M10 20.5h4M12 3.5a5.5 5.5 0 0 0-3.3 9.9c.5.4.8 1 .8 1.6h5c0-.6.3-1.2.8-1.6A5.5 5.5 0 0 0 12 3.5Z',
  bus: 'M5 5.5h14v10H5zM5 15.5v3h3v-3m8 0v3h3v-3M5 11h14M8 8.2h.01M16 8.2h.01',
  wifiOff: 'M2.5 8.5a16 16 0 0 1 5-3M21.5 8.5a16 16 0 0 0-6.6-3.4M6.5 12.5a10 10 0 0 1 2.6-1.6M17.5 12.5a10 10 0 0 0-2.1-1.4M9.8 16.2a5 5 0 0 1 4.4 0M12 20h.01M3 3l18 18',
} as const;

export type IconName = keyof typeof paths;

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  name: IconName;
  /** Kantenlänge in px. Standard 20 – passt zur Zeilenhöhe des Fließtexts. */
  size?: number;
  /** Sichtbarer Name für Screenreader. Ohne Titel gilt das Symbol als dekorativ. */
  title?: string;
}

export function Icon({ name, size = 20, title, className, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('shrink-0', className)}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      focusable="false"
      {...props}
    >
      {title ? <title>{title}</title> : null}
      <path d={paths[name]} />
    </svg>
  );
}

export const iconNames = Object.keys(paths) as IconName[];
