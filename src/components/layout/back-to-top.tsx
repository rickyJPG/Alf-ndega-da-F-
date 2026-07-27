'use client';

import { useEffect, useState } from 'react';
import { Icon } from '@/components/ui/icon';

/**
 * Sprung zum Seitenanfang. Erscheint erst nach zwei Bildschirmhöhen, damit er
 * auf kurzen Seiten nicht im Weg steht, und setzt den Fokus auf den Anfang –
 * ein reiner Scroll würde die Tastaturposition zurücklassen.
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
