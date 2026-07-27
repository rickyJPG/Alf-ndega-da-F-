import { cn } from '@/lib/utils';

/**
 * Brasão do Município de Alfândega da Fé.
 *
 * Desenhado segundo a ordenação heráldica oficial (parecer da Comissão de
 * Heráldica da Associação dos Arqueólogos Portugueses de 20/11/1934, aprovado
 * em 27/04/1935): «Escudo de negro, com uma torre torreada de prata, aberta e
 * iluminada de vermelho, tendo o torreado acompanhado por sete abelhas de ouro
 * postas em semicírculo, voltadas ao centro. Coroa mural de prata de quatro
 * torres. Listel branco com os dizeres "Vila de Alfândega da Fé" a negro.»
 *
 * Este ficheiro é um redesenho vetorial dessa ordenação. Se a autarquia tiver
 * o brasão oficial em SVG, substitua aqui o conteúdo — tem de ser vetorial,
 * o portal não usa um único símbolo em píxeis.
 *
 * Duas variantes:
 *   `cor`  — a cheio, para o cabeçalho e páginas institucionais
 *   `mono` — a uma cor (herda `currentColor`), para contextos escuros
 */
export function Brasao({
  className,
  size = 48,
  variant = 'cor',
  withListel = false,
  title,
}: {
  className?: string;
  size?: number;
  variant?: 'cor' | 'mono';
  /** Mostra o listel «VILA DE ALFÂNDEGA DA FÉ». Só é legível a partir de ±90 px. */
  withListel?: boolean;
  /** Nome acessível. Sem ele, o brasão é tratado como decorativo. */
  title?: string;
}) {
  const mono = variant === 'mono';

  const field = mono ? 'none' : '#181B1E';
  const silver = mono ? 'none' : '#E9EDF0';
  const silverLine = mono ? 'currentColor' : '#79838C';
  const red = mono ? 'currentColor' : '#B4232E';
  const gold = mono ? 'currentColor' : '#D6A21E';
  const goldLine = mono ? 'currentColor' : '#A67A12';

  const viewH = withListel ? 92 : 78;

  /**
   * As sete abelhas de ouro, em semicírculo à volta do torreado e voltadas ao
   * centro. Ângulos de 0° a 180° em passos de 30°, sobre um arco centrado no
   * eixo da torre.
   */
  const bees = Array.from({ length: 7 }, (_, i) => {
    const angle = (Math.PI / 6) * i; // 0..180°
    const cx = 32 - 18 * Math.cos(angle);
    const cy = 44 - 16 * Math.sin(angle);
    const deg = 90 - (angle * 180) / Math.PI;
    return { cx: Math.round(cx * 10) / 10, cy: Math.round(cy * 10) / 10, deg };
  });

  return (
    <svg
      viewBox={`0 0 64 ${viewH}`}
      width={size}
      height={(size * viewH) / 64}
      className={cn('shrink-0', className)}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      {title ? <title>{title}</title> : null}

      {/* Coroa mural de prata, de quatro torres (grau de vila) */}
      <g fill={silver} stroke={silverLine} strokeWidth="1">
        <path d="M5 4h9v5h7V4h9v5h7V4h9v5h7V4h6v11H5V4Z" />
        <rect x="5" y="15.5" width="54" height="4.5" rx="1.2" />
      </g>

      {/* Escudo de negro */}
      <path
        d="M8 23h48v23.5C56 58.5 47.4 67.6 32 72.5 16.6 67.6 8 58.5 8 46.5V23Z"
        fill={field}
        stroke={silverLine}
        strokeWidth="2.2"
        strokeLinejoin="round"
      />

      {/* Torre torreada de prata, aberta e iluminada de vermelho */}
      <g stroke={silverLine} strokeWidth="1" strokeLinejoin="round">
        {/* corpo principal, com ameias */}
        <path d="M23.5 42v-3h3.4v3h3.4v-3h3.4v3h3.4v-3h3.4v3h3.4v22h-17Z" fill={silver} />
        {/* torreado (a torre pequena no topo), com ameias */}
        <path d="M27.5 39v-8h2.2v-2.6h1.9V31h1.9v-2.6h1.9V31h1.1v8" fill={silver} />
      </g>
      {/* porta aberta de vermelho */}
      <path d="M29 64v-6.2a3 3 0 0 1 6 0V64Z" fill={red} />
      {/* frestas iluminadas de vermelho */}
      <rect x="30.4" y="45.5" width="3.2" height="5" rx="1.4" fill={red} />
      <rect x="30.8" y="33" width="2.4" height="3.6" rx="1.1" fill={red} />

      {/* Sete abelhas de ouro, em semicírculo, voltadas ao centro */}
      <g fill={gold} stroke={mono ? 'none' : goldLine} strokeWidth="0.4">
        {bees.map(({ cx, cy, deg }) => (
          <g key={`${cx}-${cy}`} transform={`translate(${cx} ${cy}) rotate(${deg})`}>
            <ellipse cx="0" cy="0.6" rx="1.7" ry="2.3" />
            <ellipse cx="-1.5" cy="-1.2" rx="1.5" ry="0.9" transform="rotate(-32)" />
            <ellipse cx="1.5" cy="-1.2" rx="1.5" ry="0.9" transform="rotate(32)" />
          </g>
        ))}
      </g>

      {withListel ? (
        <g>
          <path
            d="M6 76q26 8 52 0l-1.5 8q-24.5 7-49 0Z"
            fill={mono ? 'none' : '#FFFFFF'}
            stroke={silverLine}
            strokeWidth="1"
            strokeLinejoin="round"
          />
          <text
            x="32"
            y="82.6"
            textAnchor="middle"
            fontSize="4.4"
            fontWeight="600"
            letterSpacing="0.2"
            fill={mono ? 'currentColor' : '#181B1E'}
            style={{ fontFamily: 'inherit' }}
          >
            VILA DE ALFÂNDEGA DA FÉ
          </text>
        </g>
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
