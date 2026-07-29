'use client';

import { useState } from 'react';
import { Icon } from '@/components/ui/icon';

/**
 * Vídeo do YouTube com carregamento adiado.
 *
 * Antes do clique não sai um único pedido do portal: o cartaz é local
 * (sem miniatura do YouTube) e o iframe só nasce quando a pessoa decide
 * ver o vídeo — e nasce em youtube-nocookie.com. É assim que se embebe
 * vídeo num sítio público sem pedir consentimento a quem nunca o vê.
 *
 * Sem `youtubeId`, mostra o cartaz com a indicação de que falta preencher
 * o ID no CMS — o editor vê logo o que está em falta, o munícipe vê um
 * bloco arrumado.
 */
export function VideoFacade({ title, youtubeId }: { title: string; youtubeId: string }) {
  const [playing, setPlaying] = useState(false);

  if (playing && youtubeId) {
    return (
      <div className="aspect-video overflow-hidden rounded-lg border border-line">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(youtubeId)}?autoplay=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="h-full w-full border-0"
        />
      </div>
    );
  }

  const poster = (
    <>
      <span
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_35%_30%,#8a4a45_0%,#5d2320_55%,#3a1513_100%)]"
      />
      <span className="relative flex flex-col items-center gap-3 p-6 text-center text-white">
        <span className="flex size-16 items-center justify-center rounded-pill bg-white/95 text-accent-700">
          <Icon name="chevronRight" size={30} className="translate-x-0.5" />
        </span>
        <span className="text-lg font-semibold">{title}</span>
        {youtubeId ? (
          <span className="text-sm text-white/80">
            O vídeo é carregado do YouTube apenas depois deste clique.
          </span>
        ) : (
          <span className="rounded-md bg-black/30 px-3 py-1 text-sm text-white/85">
            Por publicar — falta indicar o ID do vídeo no CMS.
          </span>
        )}
      </span>
    </>
  );

  if (!youtubeId) {
    return (
      <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-lg border border-line">
        {poster}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-lg border border-line"
    >
      {poster}
    </button>
  );
}
