import { cn } from '@/lib/utils';

/**
 * Wortmarke des Municípios.
 *
 * Das Wappen ist hier als schlichtes heraldisches Zeichen angelegt:
 * Schild mit vierturmiger Mauerkrone (Rangzeichen einer vila) und
 * Kirschzweig als lokales Motiv.
 *
 * Vor dem Livegang ersetzt die Verwaltung den Pfad-Inhalt durch das amtliche
 * Wappen als SVG (public/brasao.svg) – siehe README, Abschnitt „Wappen“.
 * Bewusst kein Rasterbild: das Zeichen muss auf 320px wie auf 4K scharf sein.
 */
export function Brasao({ className, size = 44 }: { className?: string; size?: number }) {
  return (
    <svg
      viewBox="0 0 64 76"
      width={size}
      height={(size * 76) / 64}
      className={cn('shrink-0', className)}
      aria-hidden="true"
      focusable="false"
    >
      {/* Mauerkrone */}
      <g fill="currentColor">
        <path d="M6 4h9v5h6V4h10v5h6V4h9v5h6V4h6v11H6V4Z" opacity="0.92" />
        <rect x="6" y="15" width="52" height="4" rx="1" />
      </g>

      {/* Schild */}
      <path
        d="M8 22h48v24c0 12.2-8.6 21.4-24 26-15.4-4.6-24-13.8-24-26V22Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
      />

      {/* Kirschzweig */}
      <g stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" fill="none">
        <path d="M32 30v6m0 0-6 5m6-5 6 5" />
      </g>
      <circle cx="24.5" cy="45" r="5.5" fill="currentColor" />
      <circle cx="39.5" cy="45" r="5.5" fill="currentColor" />
      <path
        d="M28 28c2.6-2.4 6-3.2 9-2.2"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
