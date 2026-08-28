'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

/**
 * As fotografias que passam por trás de «Como podemos ajudar?».
 *
 * Um portal municipal não precisa de animação — mas precisa de mostrar o
 * concelho, e uma fotografia só mostra um sítio. Daí a passagem lenta: sete
 * segundos por imagem, sem deslizes nem zoom, apenas um desvanecimento. Quem
 * não olhar para o fundo não dá por nada, que é como deve ser.
 *
 * Pára em três casos, e todos importam:
 *
 *   - **movimento reduzido** — o painel de acessibilidade escreve `data-motion`
 *     no elemento raiz, e a preferência do sistema também lá chega. Mudar a
 *     preferência com a página aberta pára a passagem à mesma, por isso o
 *     `MutationObserver`;
 *   - **separador escondido** — não vale a pena repintar o que ninguém vê;
 *   - **rato em cima ou foco lá dentro** — quem está a ler não quer que a
 *     imagem mude por baixo do texto.
 */

export interface Diapositivo {
  src: string;
  alt: string;
  externa: boolean;
}

const INTERVALO = 7000;

export function HeroSlideshow({ diapositivos }: { diapositivos: Diapositivo[] }) {
  const [atual, setAtual] = useState(0);
  const [parado, setParado] = useState(false);

  // A preferência por movimento reduzido, vinda do sistema ou do painel de
  // acessibilidade do portal. Lê-se no cliente, depois da montagem, para o
  // HTML do servidor e o do navegador serem iguais.
  const [semMovimento, setSemMovimento] = useState(false);

  useEffect(() => {
    const raiz = document.documentElement;
    const consulta = window.matchMedia('(prefers-reduced-motion: reduce)');

    const avaliar = () =>
      setSemMovimento(raiz.dataset.motion === 'reduced' || consulta.matches);

    avaliar();
    consulta.addEventListener('change', avaliar);

    const observador = new MutationObserver(avaliar);
    observador.observe(raiz, { attributes: true, attributeFilter: ['data-motion'] });

    return () => {
      consulta.removeEventListener('change', avaliar);
      observador.disconnect();
    };
  }, []);

  useEffect(() => {
    if (semMovimento || parado || diapositivos.length < 2) return;

    const escondido = () => setParado(document.hidden);
    document.addEventListener('visibilitychange', escondido);

    const relogio = window.setInterval(() => {
      setAtual((indice) => (indice + 1) % diapositivos.length);
    }, INTERVALO);

    return () => {
      window.clearInterval(relogio);
      document.removeEventListener('visibilitychange', escondido);
    };
  }, [semMovimento, parado, diapositivos.length]);

  return (
    <div
      className="absolute inset-0 -z-10"
      // Decoração: o que interessa está no cartão à frente. Anunciar cada
      // mudança de fotografia a um leitor de ecrã seria ruído.
      aria-hidden="true"
      onMouseEnter={() => setParado(true)}
      onMouseLeave={() => setParado(false)}
      onFocusCapture={() => setParado(true)}
      onBlurCapture={() => setParado(false)}
    >
      {diapositivos.map((diapositivo, indice) => (
        <Image
          key={diapositivo.src}
          src={diapositivo.src}
          alt=""
          fill
          priority={indice === 0}
          sizes="100vw"
          unoptimized={diapositivo.externa}
          className="object-cover transition-opacity duration-1000 motion-reduce:transition-none"
          style={{ opacity: indice === atual ? 1 : 0 }}
        />
      ))}
    </div>
  );
}
