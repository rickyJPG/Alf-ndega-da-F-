import { localePath, type Locale } from '@/i18n/config';
import type {
  Consultation,
  DocumentItem,
  EventItem,
  Freguesia,
  Meeting,
  NewsItem,
  ServiceItem,
} from '@/content/types';

/**
 * Todos os endereços legíveis num só lugar.
 *
 * Se um padrão de caminho mudar, muda aqui — e acrescenta-se uma linha em
 * redirects.ts. Nenhum caminho é remendado a meio do código.
 */

export const serviceAreas = [
  'balcao',
  'urbanismo',
  'agua-e-residuos',
  'taxas-e-licencas',
  'acao-social',
  'educacao',
  'saude',
  'apoios',
] as const;

export type ServiceAreaSlug = (typeof serviceAreas)[number];

export const serviceAreaLabels: Record<ServiceAreaSlug, { pt: string; en: string; es: string; fr: string }> = {
  balcao: {
    pt: 'Balcão e certidões',
    en: 'Counter and certificates',
    es: 'Ventanilla y certificados',
    fr: 'Guichet et certificats',
  },
  urbanismo: {
    pt: 'Urbanismo e obras',
    en: 'Planning and building',
    es: 'Urbanismo y obras',
    fr: 'Urbanisme et travaux',
  },
  'agua-e-residuos': {
    pt: 'Água, saneamento e resíduos',
    en: 'Water, sewerage and waste',
    es: 'Agua, saneamiento y residuos',
    fr: 'Eau, assainissement et déchets',
  },
  'taxas-e-licencas': {
    pt: 'Taxas e licenças',
    en: 'Fees and licences',
    es: 'Tasas y licencias',
    fr: 'Taxes et licences',
  },
  'acao-social': { pt: 'Ação social', en: 'Social support', es: 'Acción social', fr: 'Action sociale' },
  educacao: { pt: 'Educação', en: 'Education', es: 'Educación', fr: 'Éducation' },
  saude: { pt: 'Saúde e animais', en: 'Health and animals', es: 'Salud y animales', fr: 'Santé et animaux' },
  apoios: {
    pt: 'Apoios e candidaturas',
    en: 'Grants and applications',
    es: 'Ayudas y convocatorias',
    fr: 'Aides et candidatures',
  },
};

export const serviceAreaIcons: Record<ServiceAreaSlug, string> = {
  balcao: 'fileText',
  urbanismo: 'building',
  'agua-e-residuos': 'droplet',
  'taxas-e-licencas': 'euro',
  'acao-social': 'heart',
  educacao: 'graduation',
  saude: 'heart',
  apoios: 'briefcase',
};

export const routes = {
  home: (locale: Locale) => localePath(locale, '/'),

  services: (locale: Locale) => localePath(locale, '/servicos'),
  serviceArea: (locale: Locale, area: string) => localePath(locale, `/servicos/${area}`),
  service: (locale: Locale, service: Pick<ServiceItem, 'area' | 'slug'>) =>
    localePath(locale, `/servicos/${service.area}/${service.slug}`),

  news: (locale: Locale) => localePath(locale, '/noticias'),
  newsItem: (locale: Locale, item: Pick<NewsItem, 'date' | 'slug'>) =>
    localePath(locale, `/noticias/${item.date.slice(0, 4)}/${item.date.slice(5, 7)}/${item.slug}`),

  events: (locale: Locale) => localePath(locale, '/eventos'),
  event: (locale: Locale, event: Pick<EventItem, 'slug'>) =>
    localePath(locale, `/eventos/${event.slug}`),
  eventIcs: (event: Pick<EventItem, 'slug'>) => `/api/eventos/${event.slug}.ics`,

  documents: (locale: Locale) => localePath(locale, '/documentos'),
  document: (locale: Locale, document: Pick<DocumentItem, 'slug'>) =>
    localePath(locale, `/documentos/${document.slug}`),

  transparency: (locale: Locale) => localePath(locale, '/transparencia'),
  budget: (locale: Locale) => localePath(locale, '/transparencia/orcamento'),
  openData: (locale: Locale) => localePath(locale, '/transparencia/dados-abertos'),
  consultations: (locale: Locale) => localePath(locale, '/transparencia/consultas-publicas'),
  consultation: (locale: Locale, item: Pick<Consultation, 'slug'>) =>
    localePath(locale, `/transparencia/consultas-publicas/${item.slug}`),

  municipality: (locale: Locale) => localePath(locale, '/municipio'),
  contacts: (locale: Locale) => localePath(locale, '/municipio/contactos'),
  freguesias: (locale: Locale) => localePath(locale, '/municipio/freguesias'),
  freguesia: (locale: Locale, item: Pick<Freguesia, 'slug'>) =>
    localePath(locale, `/municipio/freguesias/${item.slug}`),
  meetings: (locale: Locale) => localePath(locale, '/municipio/reunioes'),
  meeting: (locale: Locale, item: Pick<Meeting, 'slug'>) =>
    localePath(locale, `/municipio/reunioes/${item.slug}`),
  procurement: (locale: Locale) => localePath(locale, '/municipio/contratacao-publica'),

  participate: (locale: Locale) => localePath(locale, '/viver-e-participar'),
  reports: (locale: Locale) => localePath(locale, '/viver-e-participar/ocorrencias'),
  participatoryBudget: (locale: Locale) =>
    localePath(locale, '/viver-e-participar/orcamento-participativo'),

  booking: (locale: Locale) => localePath(locale, '/servicos/marcacoes'),
  payments: (locale: Locale) => localePath(locale, '/servicos/pagamentos'),
  citizenArea: (locale: Locale) => localePath(locale, '/servicos/balcao-digital'),
  wasteCalendar: (locale: Locale) => localePath(locale, '/servicos/agua-e-residuos/recolha'),

  visit: (locale: Locale) => localePath(locale, '/visitar'),
  search: (locale: Locale, query?: string) =>
    localePath(locale, query ? `/pesquisa?q=${encodeURIComponent(query)}` : '/pesquisa'),
  accessibility: (locale: Locale) => localePath(locale, '/acessibilidade'),
  sitemap: (locale: Locale) => localePath(locale, '/mapa-do-site'),
};
