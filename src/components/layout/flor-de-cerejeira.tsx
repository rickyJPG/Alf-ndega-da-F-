/**
 * Padrão de flores de cerejeira do cabeçalho.
 *
 * Reproduz o motivo do sítio oficial: silhuetas de flor de cerejeira em dois
 * tons de vermelho, com pequenas folhas verde-azeitona, sobre a banda
 * vermelha da identidade. As cores vêm da própria página oficial
 * (#B43C34 para as flores claras, #8C0404 para as escuras, verde #A9B416).
 *
 * Puramente decorativo: aria-hidden, sem interação, por trás do conteúdo.
 */
export function PadraoCerejeira({ className }: { className?: string }) {
  // Uma flor de cerejeira: cinco pétalas arredondadas à volta do centro.
  const flor = (tone: string, opacity: number) =>
    [0, 72, 144, 216, 288]
      .map((deg) => {
        const rad = (deg * Math.PI) / 180;
        const cx = Math.round(Math.cos(rad) * 148) / 10;
        const cy = Math.round(Math.sin(rad) * 148) / 10;
        return `<circle cx="${cx}" cy="${cy}" r="11.5" fill="${tone}" opacity="${opacity}"/>`;
      })
      .join('') + `<circle r="5" fill="#8C0404" opacity="0.65"/>`;

  const folha = (tone: string, opacity: number) =>
    `<path d="M0 0q12-15 30-12q-10 17-30 12Z" fill="${tone}" opacity="${opacity}"/>`;

  const tile = `
    <g transform="translate(58 66)">${flor('#B43C34', 0.8)}</g>
    <g transform="translate(216 180) scale(1.3)">${flor('#8C0404', 0.5)}</g>
    <g transform="translate(320 48) scale(0.75)">${flor('#B43C34', 0.55)}</g>
    <g transform="translate(150 250) scale(0.9)">${flor('#B43C34', 0.65)}</g>
    <g transform="translate(126 150) rotate(-24)">${folha('#A9B416', 0.75)}</g>
    <g transform="translate(300 132) rotate(140)">${folha('#A9B416', 0.6)}</g>
    <g transform="translate(28 210) rotate(48) scale(0.8)">${folha('#8C0404', 0.5)}</g>
    <g transform="translate(352 262) rotate(-80) scale(0.9)">${folha('#A9B416', 0.55)}</g>
  `;

  return (
    <svg
      aria-hidden="true"
      focusable="false"
      className={className}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <pattern
          id="flores-cerejeira"
          width="392"
          height="308"
          patternUnits="userSpaceOnUse"
          dangerouslySetInnerHTML={{ __html: tile }}
        />
      </defs>
      <rect width="100%" height="100%" fill="url(#flores-cerejeira)" />
    </svg>
  );
}
