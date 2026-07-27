import { SearchIndex, type SearchDocument } from './engine';
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
import { tx } from '@/content/types';
import type { Locale } from '@/i18n/config';
import { localePath } from '@/i18n/config';
import { routes } from '@/lib/routes';
import { formatDate } from '@/lib/format';

/**
 * Constrói o índice de pesquisa a partir de todos os conteúdos.
 *
 * Corre no servidor e fica em cache uma vez por língua. Com um CMS que tenha
 * webhooks, chama-se `resetSearchIndex()` no momento da publicação.
 */
const cache = new Map<Locale, SearchIndex>();

export async function buildSearchDocuments(locale: Locale): Promise<SearchDocument[]> {
  const [services, news, archived, events, documents, consultations, meetings, freguesias] =
    await Promise.all([
      getServices(),
      getNews({ limit: 500 }),
      getNewsArchive('covid-19'),
      getAllEvents(),
      getDocuments(),
      getConsultations(),
      getMeetings(),
      getFreguesias(),
    ]);

  const entries: SearchDocument[] = [];

  for (const service of services) {
    entries.push({
      id: service.id,
      type: 'servico',
      section: 'Serviços',
      title: tx(service.title, locale),
      summary: tx(service.summary, locale),
      body: [
        tx(service.audience, locale),
        tx(service.processingTime, locale),
        tx(service.fee, locale),
        ...tx(service.requiredDocuments, locale),
        ...service.steps.map((step) => `${tx(step.title, locale)} ${tx(step.detail, locale)}`),
        ...(service.legislation ? tx(service.legislation, locale) : []),
        service.department,
      ].join(' '),
      href: routes.service(locale, service),
    });
  }

  for (const item of [...news, ...archived]) {
    const [year, month] = item.date.split('-');
    entries.push({
      id: item.id,
      type: 'noticia',
      section: item.category,
      title: tx(item.title, locale),
      summary: tx(item.summary, locale),
      body: tx(item.body, locale).join(' '),
      href: localePath(locale, `/noticias/${year}/${month}/${item.slug}`),
      year: Number(year),
      date: item.date,
    });
  }

  for (const event of events) {
    entries.push({
      id: event.id,
      type: 'evento',
      section: event.category,
      title: tx(event.title, locale),
      summary: tx(event.summary, locale),
      body: [
        event.location,
        event.organiser ?? '',
        formatDate(event.startDate, locale),
        ...(event.description ? tx(event.description, locale) : []),
      ].join(' '),
      href: localePath(locale, `/eventos/${event.slug}`),
      year: Number(event.startDate.slice(0, 4)),
      date: event.startDate,
    });
  }

  for (const document of documents) {
    entries.push({
      id: document.id,
      type: 'documento',
      section: document.type,
      title: tx(document.title, locale),
      summary: document.summary ? tx(document.summary, locale) : tx(document.file.label, locale),
      body: '',
      fileText: document.file.extractedText ?? '',
      href: localePath(locale, `/documentos/${document.slug}`),
      year: document.year,
      date: document.publishedAt,
    });
  }

  for (const consultation of consultations) {
    entries.push({
      id: consultation.id,
      type: 'consulta',
      section: consultation.area,
      title: tx(consultation.title, locale),
      summary: tx(consultation.summary, locale),
      body: [
        ...(consultation.body ? tx(consultation.body, locale) : []),
        ...tx(consultation.howTo, locale),
      ].join(' '),
      fileText: consultation.documents.map((doc) => doc.extractedText ?? '').join(' '),
      href: localePath(locale, `/transparencia/consultas-publicas/${consultation.slug}`),
      year: Number(consultation.endsAt.slice(0, 4)),
      date: consultation.endsAt,
    });
  }

  for (const meeting of meetings) {
    entries.push({
      id: meeting.id,
      type: 'reuniao',
      section: meeting.body === 'camara' ? 'Câmara Municipal' : 'Assembleia Municipal',
      title: `${meeting.body === 'camara' ? 'Reunião' : 'Sessão'} de ${formatDate(meeting.date, locale)}`,
      summary: meeting.agenda.slice(0, 3).join(' · '),
      body: [...meeting.agenda, ...meeting.decisions.map((d) => `${d.title} ${d.outcome}`)].join(' '),
      fileText: meeting.minutes?.extractedText ?? '',
      href: localePath(locale, `/municipio/reunioes/${meeting.slug}`),
      year: Number(meeting.date.slice(0, 4)),
      date: meeting.date,
    });
  }

  for (const freguesia of freguesias) {
    entries.push({
      id: freguesia.id,
      type: 'freguesia',
      section: 'Freguesias',
      title: freguesia.name,
      summary: tx(freguesia.description, locale),
      body: [freguesia.seat, freguesia.president, ...freguesia.villages].join(' '),
      href: localePath(locale, `/municipio/freguesias/${freguesia.slug}`),
    });
  }

  entries.push(...staticPages(locale));

  return entries;
}

/** Páginas editoriais sem coleção própria. */
function staticPages(locale: Locale): SearchDocument[] {
  const pages: Array<[string, string, string, string]> = [
    ['/municipio/contactos', 'Contactos', 'Morada, telefone, horário de atendimento e números de emergência.', 'Município'],
    ['/transparencia/orcamento', 'Orçamento e contas', 'Explorador interactivo da despesa municipal por área.', 'Transparência'],
    ['/transparencia/dados-abertos', 'Dados abertos', 'Conjuntos de dados em CSV e JSON, livres de utilizar.', 'Transparência'],
    ['/servicos/marcacoes', 'Marcar atendimento', 'Escolha o serviço, o dia e a hora do seu atendimento.', 'Serviços'],
    ['/viver-e-participar/ocorrencias', 'Comunicar ocorrência', 'Buracos, iluminação, resíduos: comunique com foto e localização.', 'Participação'],
    ['/viver-e-participar/orcamento-participativo', 'Orçamento Participativo', 'Propor, votar e acompanhar os projetos escolhidos pelos munícipes.', 'Participação'],
    ['/servicos/agua-e-residuos/recolha', 'Calendário de recolha de resíduos', 'O que passa e quando, freguesia a freguesia.', 'Ambiente'],
    ['/visitar', 'Visitar Alfândega da Fé', 'Lagos do Sabor, percursos pedestres, cereja, azeite e castanha.', 'Turismo'],
    ['/acessibilidade', 'Declaração de Acessibilidade', 'Nível de conformidade, limitações conhecidas e como pedir ajuda.', 'Institucional'],
    ['/privacidade', 'Política de privacidade', 'Que dados tratamos, com que fundamento e durante quanto tempo.', 'Institucional'],
  ];

  return pages.map(([href, title, summary, section]) => ({
    id: `page${href.replace(/\//g, '-')}`,
    type: 'pagina' as const,
    section,
    title,
    summary,
    body: '',
    href: localePath(locale, href),
  }));
}

export async function getSearchIndex(locale: Locale): Promise<SearchIndex> {
  const cached = cache.get(locale);
  if (cached) return cached;

  const index = new SearchIndex(await buildSearchDocuments(locale));
  cache.set(locale, index);
  return index;
}

/** Chamar depois de publicar no CMS. */
export function resetSearchIndex(): void {
  cache.clear();
}
