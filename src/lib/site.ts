/**
 * Stammdaten der Institution. Diese Werte erscheinen in Kopf-/Fußzeile,
 * in den JSON-LD-Blöcken und im Offline-Fallback der PWA.
 */

export const site = {
  name: 'Município de Alfândega da Fé',
  shortName: 'Alfândega da Fé',
  legalName: 'Câmara Municipal de Alfândega da Fé',
  tagline: 'Portal do Município',
  /** In Produktion über NEXT_PUBLIC_SITE_URL setzen. */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.cm-alfandegadafe.pt',
  nif: '506 811 663',
  address: {
    street: 'Largo de D. Dinis',
    postalCode: '5350-014',
    city: 'Alfândega da Fé',
    district: 'Bragança',
    region: 'Trás-os-Montes',
    country: 'PT',
  },
  geo: { lat: 41.3444, lon: -6.9589 },
  contact: {
    phone: '279 468 120',
    phoneE164: '+351279468120',
    fax: '279 462 780',
    email: 'municipio@cm-alfandegadafe.pt',
    /** Ortsnetz – Hinweis nach Vorgabe der ANACOM. */
    callCost: 'Chamada para a rede fixa nacional',
  },
  openingHours: [
    { days: 'Segunda a sexta', hours: '09:00 – 12:30 e 14:00 – 17:30' },
    { days: 'Sábados, domingos e feriados', hours: 'Encerrado' },
  ],
  /** ISO-8601 für schema.org */
  openingHoursSpec: ['Mo-Fr 09:00-12:30', 'Mo-Fr 14:00-17:30'],
  emergency: [
    { label: 'Número Europeu de Emergência', number: '112' },
    { label: 'Bombeiros Voluntários de Alfândega da Fé', number: '279 462 121' },
    { label: 'GNR – Posto de Alfândega da Fé', number: '279 462 115' },
    { label: 'Centro de Saúde de Alfândega da Fé', number: '279 468 100' },
    { label: 'SNS 24', number: '808 24 24 24' },
    { label: 'Proteção Civil Municipal', number: '279 468 120' },
    { label: 'Águas – piquete de avarias (24 h)', number: '279 468 129' },
  ],
  tourism: {
    label: 'Posto de Turismo',
    phone: '279 462 739',
    email: 'turismo@cm-alfandegadafe.pt',
  },
  social: [
    { label: 'Facebook', href: 'https://www.facebook.com/municipioalfandegadafe' },
    { label: 'YouTube', href: 'https://www.youtube.com/@municipioalfandegadafe' },
    { label: 'Instagram', href: 'https://www.instagram.com/municipio_alfandegadafe' },
  ],
  /** Cookiefreies, self-hosted Analytics. Leer lassen = kein Tracking. */
  analytics: {
    plausibleDomain: process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN ?? '',
    plausibleScriptUrl: process.env.NEXT_PUBLIC_PLAUSIBLE_SCRIPT_URL ?? '',
  },
} as const;

export type Site = typeof site;
