'use client';

import { useEffect } from 'react';

/**
 * Registra o service worker.
 *
 * Só em produção e só depois de a página estar carregada — o registo nunca
 * deve competir com o primeiro carregamento. Em desenvolvimento, qualquer
 * service worker antigo é removido, para não servir versões em cache.
 */
export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    if (process.env.NODE_ENV !== 'production') {
      void navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const registration of registrations) void registration.unregister();
      });
      return;
    }

    const register = () => {
      void navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => {
        /* Sem service worker o portal funciona na mesma. */
      });
    };

    if (document.readyState === 'complete') register();
    else window.addEventListener('load', register, { once: true });
  }, []);

  return null;
}
