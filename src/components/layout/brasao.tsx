import { cn } from '@/lib/utils';

/**
 * Brasão do Município.
 *
 * Composição heráldica: coroa mural de quatro torres (grau de vila), escudo de
 * prata com ramo de cerejeira — a cereja é a identidade do concelho — e faixa
 * ondada de azul no contrachefe, pelo rio Sabor.
 *
 * ATENÇÃO: este é um desenho representativo, não o brasão oficial. Antes do
 * lançamento, substitua o conteúdo de <ShieldArtwork> pelo brasão oficial em
 * SVG. Tem de ser vetorial — o portal não usa um único símbolo em píxeis.
 *
 * Duas variantes:
 *   `cor`  — a cheio, para o cabeçalho e páginas institucionais
 *   `mono` — a uma cor (herda `currentColor`), para o rodapé e o menu móvel
 */
export function Brasao({
  className,
  size = 48,
  variant = 'cor',
  title,
}: {
  className?: string;
  size?: number;
  variant?: 'cor' | 'mono';
  /** Nome acessível. Sem ele, o brasão é tratado como decorativo. */
  title?: string;
}) {
  const mono = variant === 'mono';

  const gold = mono ? 'currentColor' : '#C8912F';
  const goldDark = mono ? 'currentColor' : '#9A6C1E';
  const field = mono ? 'none' : '#FFFFFF';
  const outline = mono ? 'currentColor' : '#0F3D5C';
  const cherry = mono ? 'currentColor' : '#B4232E';
  const cherryDark = mono ? 'currentColor' : '#8E1B26';
  const leaf = mono ? 'currentColor' : '#1F6F5C';
  const water = mono ? 'currentColor' : '#1D6FA3';

  return (
    <svg
      viewBox="0 0 64 78"
      width={size}
      height={(size * 78) / 64}
      className={cn('shrink-0', className)}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      {title ? <title>{title}</title> : null}

      {/* Coroa mural de quatro torres */}
      <g fill={gold} stroke={goldDark} strokeWidth={mono ? 0 : 0.8}>
        <path d="M5 4h9v5h7V4h9v5h7V4h9v5h7V4h6v11H5V4Z" />
        <rect x="5" y="15.5" width="54" height="4.5" rx="1.2" />
      </g>

      {/* Escudo */}
      <path
        d="M8 23h48v23.5C56 58.5 47.4 67.6 32 72.5 16.6 67.6 8 58.5 8 46.5V23Z"
        fill={field}
        stroke={outline}
        strokeWidth="2.6"
        strokeLinejoin="round"
      />

      {/* Faixa ondada — o Sabor */}
      <path
        d="M9.6 55.5q5.6-3.4 11.2 0t11.2 0q5.6-3.4 11.2 0t11.2 0v5.2q-5.6 3.4-11.2 0t-11.2 0q-5.6 3.4-11.2 0t-11.2 0Z"
        fill={mono ? 'none' : water}
        stroke={mono ? 'currentColor' : 'none'}
        strokeWidth={mono ? 1.8 : 0}
        opacity={mono ? 0.85 : 1}
      />

      {/* Ramo de cerejeira */}
      <path
        d="M32 28v7m0 0-7.5 5.5M32 35l7.5 5.5"
        stroke={leaf}
        strokeWidth="2.6"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M32 29.5c3-3 7.2-3.8 10.6-2.2-2.2 3.2-6 4.6-9.4 3.8"
        fill={mono ? 'none' : leaf}
        stroke={mono ? 'currentColor' : 'none'}
        strokeWidth={mono ? 1.8 : 0}
      />

      <circle cx="24.5" cy="45" r="6" fill={cherry} />
      <circle cx="39.5" cy="45" r="6" fill={cherryDark} />
      {!mono ? (
        <>
          <circle cx="22.6" cy="43" r="1.6" fill="#FFFFFF" opacity="0.55" />
          <circle cx="37.6" cy="43" r="1.6" fill="#FFFFFF" opacity="0.45" />
        </>
      ) : null}
    </svg>
  );
}

/**
 * Bloco de identidade: brasão + designação oficial.
 *
 * É este conjunto que aparece no cabeçalho. A designação nunca é uma imagem —
 * é texto, para poder ser lida, pesquisada e ampliada.
 */
export function Wordmark({
  variant = 'cor',
  size = 52,
  className,
}: {
  variant?: 'cor' | 'mono';
  size?: number;
  className?: string;
}) {
  return (
    <span className={cn('flex items-center gap-3', className)}>
      <Brasao size={size} variant={variant} />
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            'text-[0.68rem] font-semibold tracking-[0.16em] uppercase',
            variant === 'cor' ? 'text-accent-700' : 'text-current opacity-80',
          )}
        >
          Município de
        </span>
        <span
          className={cn(
            // `text-ink` e não `text-primary-900`: o nome do município tem de
            // continuar legível quando a faixa de identidade fica escura.
            'mt-1 font-serif text-xl leading-tight font-semibold sm:text-2xl',
            variant === 'cor' ? 'text-ink' : 'text-current',
          )}
        >
          Alfândega da Fé
        </span>
        <span
          className={cn(
            'mt-0.5 text-xs',
            variant === 'cor' ? 'text-ink-muted' : 'text-current opacity-75',
          )}
        >
          Terra da cereja · Trás-os-Montes
        </span>
      </span>
    </span>
  );
}

/**
 * Motivo decorativo de cerejas.
 *
 * Usado com moderação — remate de secção, marca de água num bloco. É
 * decorativo, portanto invisível para as tecnologias de apoio.
 */
export function RamoDeCerejas({ className, size = 40 }: { className?: string; size?: number }) {
  return (
    <svg
      viewBox="0 0 48 40"
      width={size}
      height={(size * 40) / 48}
      className={cn('shrink-0', className)}
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M24 4c4-3 9.5-3.6 14 -1.2C35.4 7 30.6 8.8 26 7.6"
        fill="currentColor"
        opacity="0.35"
      />
      <path
        d="M24 6v6m0 0-8 8m8-8 8 8"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        fill="none"
        opacity="0.55"
      />
      <circle cx="16" cy="27" r="7" fill="currentColor" />
      <circle cx="32" cy="27" r="7" fill="currentColor" opacity="0.75" />
    </svg>
  );
}
