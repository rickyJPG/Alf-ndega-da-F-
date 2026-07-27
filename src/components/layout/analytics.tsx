'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';
import { site } from '@/lib/site';

const CONSENT_KEY = 'cmadf:consent';

/**
 * Medição de audiência sem cookies, com Plausible alojado no próprio servidor.
 *
 * Sem Google Analytics, sem cookies, sem guardar endereços IP e sem criar
 * perfis. O script só é carregado depois de dado o consentimento expresso —
 * e logo que este seja dado no aviso.
 *
 * Sem NEXT_PUBLIC_PLAUSIBLE_DOMAIN não acontece absolutamente nada.
 */
export function Analytics() {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    function read() {
      try {
        const raw = window.localStorage.getItem(CONSENT_KEY);
        if (!raw) return false;
        return Boolean((JSON.parse(raw) as { analytics?: boolean }).analytics);
      } catch {
        return false;
      }
    }

    setAllowed(read());

    const onConsent = (event: Event) => {
      const detail = (event as CustomEvent<{ analytics: boolean }>).detail;
      setAllowed(Boolean(detail?.analytics));
    };

    window.addEventListener('cmadf:consent', onConsent);
    return () => window.removeEventListener('cmadf:consent', onConsent);
  }, []);

  const { plausibleDomain, plausibleScriptUrl } = site.analytics;
  if (!allowed || !plausibleDomain || !plausibleScriptUrl) return null;

  return (
    <Script
      defer
      data-domain={plausibleDomain}
      src={plausibleScriptUrl}
      strategy="lazyOnload"
    />
  );
}
