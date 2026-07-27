/**
 * Einzige Anlaufstelle für Inhalte.
 *
 * Seiten importieren ausschließlich aus diesem Modul, nie direkt aus
 * src/content/data. Beim Anschluss von Payload CMS werden hier die
 * Lesefunktionen gegen API-Aufrufe getauscht – die Seiten bleiben unberührt.
 * Alle Funktionen sind async, damit dieser Wechsel keine Signaturänderung ist.
 */
import { activeAlerts } from './data/alerts';
import { budget2026, budgetYears, expensePerInhabitant } from './data/budget';
import {
  consultations,
  findConsultation,
  openConsultations,
  openTenders,
  tenders,
} from './data/consultations';
import { documents, documentYears, findDocument } from './data/documents';
import { eventCategories, events } from './data/events';
import { freguesias, findFreguesia, totalArea, totalPopulation } from './data/freguesias';
import { assembleia, executivo, findMeeting, latestMeeting, meetings, people } from './data/governance';
import { news, newsCategories } from './data/news';
import { featuredServices, findService, services } from './data/services';
import {
  availableSlots,
  bookableServices,
  fireRisk,
  fireRiskAdvice,
  occurrences,
  participatoryProjects,
  wasteSchedules,
} from './data/services-operational';
import type {
  Alert,
  Consultation,
  DocumentItem,
  EventItem,
  Freguesia,
  Meeting,
  NewsItem,
  Occurrence,
  ServiceItem,
  Tender,
} from './types';

const todayIso = () => new Date().toISOString().slice(0, 10);

// --- Alerts --------------------------------------------------------------------

export async function getActiveAlerts(): Promise<Alert[]> {
  return activeAlerts(todayIso());
}

// --- Notícias ------------------------------------------------------------------

export async function getNews(options?: {
  limit?: number;
  category?: string;
  includeArchive?: boolean;
}): Promise<NewsItem[]> {
  let list = [...news].sort((a, b) => b.date.localeCompare(a.date));
  if (!options?.includeArchive) list = list.filter((item) => !item.archive);
  if (options?.category) list = list.filter((item) => item.category === options.category);
  return options?.limit ? list.slice(0, options.limit) : list;
}

export async function getNewsArchive(archive: string): Promise<NewsItem[]> {
  return news.filter((item) => item.archive === archive).sort((a, b) => b.date.localeCompare(a.date));
}

export async function getNewsItem(
  year: string,
  month: string,
  slug: string,
): Promise<NewsItem | undefined> {
  return news.find(
    (item) => item.slug === slug && item.date.startsWith(`${year}-${month.padStart(2, '0')}`),
  );
}

export async function getNewsCategories(): Promise<string[]> {
  return newsCategories;
}

/** Nachrichten mit gemeinsamen Schlagworten, ohne die aktuelle. */
export async function getRelatedNews(item: NewsItem, limit = 3): Promise<NewsItem[]> {
  const tags = new Set(item.tags ?? []);
  return news
    .filter((candidate) => candidate.id !== item.id && !candidate.archive)
    .map((candidate) => ({
      candidate,
      score:
        (candidate.category === item.category ? 2 : 0) +
        (candidate.tags ?? []).filter((tag) => tags.has(tag)).length,
    }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || b.candidate.date.localeCompare(a.candidate.date))
    .slice(0, limit)
    .map((entry) => entry.candidate);
}

// --- Eventos --------------------------------------------------------------------

export async function getEvents(options?: {
  from?: string;
  to?: string;
  category?: string;
  limit?: number;
}): Promise<EventItem[]> {
  const from = options?.from ?? todayIso();
  let list = events
    .filter((event) => (event.endDate ?? event.startDate) >= from)
    .sort((a, b) => a.startDate.localeCompare(b.startDate) || (a.startTime ?? '').localeCompare(b.startTime ?? ''));

  if (options?.to) list = list.filter((event) => event.startDate <= options.to!);
  if (options?.category) list = list.filter((event) => event.category === options.category);
  return options?.limit ? list.slice(0, options.limit) : list;
}

export async function getAllEvents(): Promise<EventItem[]> {
  return [...events].sort((a, b) => a.startDate.localeCompare(b.startDate));
}

export async function getEvent(slug: string): Promise<EventItem | undefined> {
  return events.find((event) => event.slug === slug);
}

export async function getEventCategories(): Promise<string[]> {
  return eventCategories;
}

// --- Serviços ---------------------------------------------------------------------

export async function getServices(options?: { area?: string; lifeEvent?: string }): Promise<ServiceItem[]> {
  let list = [...services];
  if (options?.area) list = list.filter((service) => service.area === options.area);
  if (options?.lifeEvent) {
    list = list.filter((service) => service.lifeEvents.includes(options.lifeEvent as never));
  }
  return list;
}

export async function getService(slug: string): Promise<ServiceItem | undefined> {
  return findService(slug);
}

export async function getFeaturedServices(): Promise<ServiceItem[]> {
  return featuredServices;
}

// --- Documentos ----------------------------------------------------------------------

export async function getDocuments(options?: {
  type?: string;
  area?: string;
  year?: number;
  lifeEvent?: string;
}): Promise<DocumentItem[]> {
  let list = [...documents].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  if (options?.type) list = list.filter((doc) => doc.type === options.type);
  if (options?.area) list = list.filter((doc) => doc.area === options.area);
  if (options?.year) list = list.filter((doc) => doc.year === options.year);
  if (options?.lifeEvent) {
    list = list.filter((doc) => doc.lifeEvents?.includes(options.lifeEvent as never));
  }
  return list;
}

export async function getDocument(slug: string): Promise<DocumentItem | undefined> {
  return findDocument(slug);
}

export async function getDocumentYears(): Promise<number[]> {
  return documentYears;
}

// --- Consultas e concursos --------------------------------------------------------------

export async function getConsultations(): Promise<Consultation[]> {
  return [...consultations].sort((a, b) => b.endsAt.localeCompare(a.endsAt));
}

export async function getOpenConsultations(): Promise<Consultation[]> {
  return openConsultations(todayIso());
}

export async function getConsultation(slug: string): Promise<Consultation | undefined> {
  return findConsultation(slug);
}

export async function getTenders(): Promise<Tender[]> {
  return [...tenders].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export async function getOpenTenders(): Promise<Tender[]> {
  return openTenders(todayIso());
}

// --- Freguesias -----------------------------------------------------------------------------

export async function getFreguesias(): Promise<Freguesia[]> {
  return freguesias;
}

export async function getFreguesia(slug: string): Promise<Freguesia | undefined> {
  return findFreguesia(slug);
}

export const municipalityTotals = { population: totalPopulation, area: totalArea };

// --- Órgãos e reuniões ------------------------------------------------------------------------

export async function getPeople(): Promise<typeof people> {
  return people;
}

export async function getExecutivo() {
  return executivo;
}

export async function getAssembleia() {
  return assembleia;
}

export async function getMeetings(options?: { body?: 'camara' | 'assembleia'; year?: number }): Promise<Meeting[]> {
  let list = [...meetings].sort((a, b) => b.date.localeCompare(a.date));
  if (options?.body) list = list.filter((meeting) => meeting.body === options.body);
  if (options?.year) list = list.filter((meeting) => meeting.date.startsWith(String(options.year)));
  return list;
}

export async function getMeeting(slug: string): Promise<Meeting | undefined> {
  return findMeeting(slug);
}

export async function getLatestMeeting(): Promise<Meeting> {
  return latestMeeting;
}

// --- Orçamento --------------------------------------------------------------------------------

export async function getBudget(year = 2026) {
  return budgetYears.find((entry) => entry.year === year) ?? budget2026;
}

export { expensePerInhabitant };

// --- Operacional --------------------------------------------------------------------------------

export async function getWasteSchedules() {
  return wasteSchedules;
}

export async function getFireRisk() {
  return { days: fireRisk, advice: fireRiskAdvice };
}

export async function getOccurrences(): Promise<Occurrence[]> {
  return [...occurrences].sort((a, b) => b.reportedAt.localeCompare(a.reportedAt));
}

export async function findOccurrence(reference: string): Promise<Occurrence | undefined> {
  return occurrences.find((item) => item.reference.toLowerCase() === reference.trim().toLowerCase());
}

export async function getParticipatoryProjects() {
  return participatoryProjects;
}

export async function getBookableServices() {
  return bookableServices;
}

export { availableSlots };

export * from './types';
