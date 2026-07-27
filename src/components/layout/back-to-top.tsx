'use client';

import { useEffect, useState } from 'react';
import { Icon } from '@/components/ui/icon';

/**
 * Salto para o início da página. Só aparece depois de dois ecrãs de altura,
 * para não estorvar em páginas curtas, e coloca o foco no início — um simples
 * deslocamento deixaria o teclado para trás.
 */
export function BackToTop({ label }: { label: string }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > window.innerHeight * 2);
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      data-print="hide"
      onClick={() => {
        window.scrollTo({ top: 0 });
        document.getElementById('conteudo')?.focus();
      }}
      className="fixed bottom-24 end-4 z-30 inline-flex size-12 items-center justify-center rounded-pill border border-line-strong bg-surface text-ink shadow-[var(--shadow-2)] hover:bg-primary-100 lg:bottom-6"
      aria-label={label}
      title={label}
    >
      <Icon name="arrowUp" size={20} />
    </button>
  );
}
