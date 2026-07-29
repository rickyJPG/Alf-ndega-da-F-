import type { MetadataRoute } from 'next';
import { site } from '@/lib/site';
import { defaultLocale, localeHtmlLang, localePath, locales } from '@/i18n/config';
import { editorialPages } from '@/content/data/pages';
import {
  getAllEvents,
  getConsultations,
  getDocuments,
  getFreguesias,
  getMeetings,
  getNews,
  getNewsArchive,
  getServices,
} from '@/content';
import { allNavigationHrefs } from '@/lib/navigation';

/**
 * Mapa do sítio com alternativas hreflang para as quatro línguas.
 *
 * Ficam de fora as páginas que não pertencem ao índice: resultados de
 * pesquisa, guia de estilo e páginas de erro.
 */
const EXCLUDED = new Set(['/pesquisa', '/styleguide', '/guia-de-imagens']);

function entry(path: string, lastModified: string, priority: number, changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency']) {
  const languages: Record<string, string> = {};
  for (const locale of locales) {
    languages[localeHtmlLang[locale]] = `${site.url}${localePath(locale, path)}`;
  }

  return {
    url: `${site.url}${localePath(defaultLocale, path)}`,
    lastModified,
    changeFrequency,
    priority,
    alternates: { languages },
  } satisfies MetadataRoute.Sitemap[number];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const today = new Date().toISOString().slice(0, 10);

  const [services, news, archived, events, documents, consultations, meetings, freguesias] =
    await Promise.all([
      getServices(),
      getNews({ limit: 1000 }),
      getNewsArchive('covid-19'),
      getAllEvents(),
      getDocuments(),
      getConsultations(),
      getMeetings(),
      getFreguesias(),
    ]);

  const entries: MetadataRoute.Sitemap = [entry('/', today, 1, 'daily')];

  for (const href of allNavigationHrefs()) {
    if (href === '/' || EXCLUDED.has(href)) continue;
    entries.push(entry(href, today, 0.8, 'weekly'));
  }

  for (const page of editorialPages) {
    entries.push(entry(`/${page.path}`, page.updatedAt, 0.6, 'monthly'));
  }

  for (const service of services) {
    entries.push(entry(`/servicos/${service.area}/${service.slug}`, today, 0.9, 'monthly'));
  }

  for (const item of [...news, ...archived]) {
    entries.push(
      entry(
        `/noticias/${item.date.slice(0, 4)}/${item.date.slice(5, 7)}/${item.slug}`,
        item.updatedAt ?? item.date,
        item.archive ? 0.2 : 0.7,
        'yearly',
      ),
    );
  }

  for (const event of events) {
    entries.push(entry(`/eventos/${event.slug}`, today, 0.6, 'weekly'));
  }

  for (const document of documents) {
    entries.push(entry(`/documentos/${document.slug}`, document.publishedAt, 0.5, 'yearly'));
  }

  for (const consultation of consultations) {
    entries.push(
      entry(
        `/transparencia/consultas-publicas/${consultation.slug}`,
        consultation.startsAt,
        consultation.endsAt >= today ? 0.9 : 0.3,
        'weekly',
      ),
    );
  }

  for (const meeting of meetings) {
    entries.push(entry(`/municipio/reunioes/${meeting.slug}`, meeting.date, 0.4, 'yearly'));
  }

  for (const freguesia of freguesias) {
    entries.push(entry(`/municipio/freguesias/${freguesia.slug}`, today, 0.5, 'monthly'));
  }

  // Entradas repetidas (destinos de navegação que também são páginas editoriais)
  const seen = new Set<string>();
  return entries.filter((item) => {
    if (seen.has(item.url)) return false;
    seen.add(item.url);
    return true;
  });
}
