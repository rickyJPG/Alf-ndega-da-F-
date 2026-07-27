import type { Locale } from '@/i18n/config';

/**
 * Inhaltsmodell.
 *
 * Die Typen bilden 1:1 die Collections des Headless-CMS ab (siehe cms/).
 * Solange kein CMS angeschlossen ist, liefern die Module in src/content/data
 * dieselben Strukturen aus TypeScript-Dateien. Der Zugriff läuft immer über
 * src/content/index.ts – wird auf Payload umgestellt, ändert sich nur dort
 * etwas, nicht in den Seiten.
 */

/** Portugiesisch ist Pflicht, Übersetzungen sind optional. */
export type Localized<T = string> = { pt: T } & Partial<Record<Exclude<Locale, 'pt'>, T>>;

export function tx<T>(value: Localized<T>, locale: Locale): T {
  return (value[locale] ?? value.pt) as T;
}

export interface MediaImage {
  src: string;
  alt: Localized;
  width: number;
  height: number;
  /** Sehr kleines Vorschaubild als Data-URL – verhindert Layout-Sprünge. */
  blurDataURL?: string;
  credit?: string;
}

export interface FileAsset {
  href: string;
  label: Localized;
  format: 'pdf' | 'docx' | 'xlsx' | 'csv' | 'json' | 'zip';
  bytes: number;
  /** Extrahierter Text – speist die Volltextsuche über PDF-Inhalte. */
  extractedText?: string;
}

// --- Alerts ------------------------------------------------------------------

export interface Alert {
  id: string;
  severity: 'info' | 'warning' | 'danger';
  title: Localized;
  href?: string;
  startsAt: string;
  endsAt: string;
}

// --- Notícias ----------------------------------------------------------------

export type NewsCategory =
  | 'Município'
  | 'Cultura'
  | 'Ação Social'
  | 'Ambiente'
  | 'Educação'
  | 'Economia'
  | 'Desporto'
  | 'Obras'
  | 'Saúde';

export interface NewsItem {
  id: string;
  slug: string;
  /** Publikationsdatum, ISO. Bestimmt auch die URL: /noticias/2026/07/<slug> */
  date: string;
  updatedAt?: string;
  category: NewsCategory;
  title: Localized;
  summary: Localized;
  /** Absätze als Klartext – im CMS ein Rich-Text-Feld. */
  body: Localized<string[]>;
  image?: MediaImage;
  tags?: string[];
  /** Aus der Hauptnavigation entfernt, im Archiv weiter auffindbar. */
  archive?: 'covid-19';
  featured?: boolean;
}

// --- Eventos ------------------------------------------------------------------

export type EventCategory =
  | 'Cultura'
  | 'Feira'
  | 'Desporto'
  | 'Sessão pública'
  | 'Infantil'
  | 'Formação'
  | 'Música';

export interface EventItem {
  id: string;
  slug: string;
  title: Localized;
  summary: Localized;
  description?: Localized<string[]>;
  category: EventCategory;
  /** ISO-Datum. Mehrtägige Ereignisse setzen endDate. */
  startDate: string;
  endDate?: string;
  /** 24-Stunden-Format „21:30“. Fehlt es, gilt „Todo o dia“. */
  startTime?: string;
  endTime?: string;
  location: string;
  freguesia?: string;
  organiser?: string;
  price?: Localized;
  image?: MediaImage;
  /** Geokoordinaten für die Kartenansicht. */
  geo?: { lat: number; lon: number };
}

// --- Serviços -------------------------------------------------------------------

export type ServiceArea =
  | 'balcao'
  | 'urbanismo'
  | 'agua-e-residuos'
  | 'taxas-e-licencas'
  | 'acao-social'
  | 'educacao'
  | 'saude'
  | 'apoios'
  | 'economia';

export type LifeEvent =
  | 'construir-ou-remodelar'
  | 'abrir-negocio'
  | 'mudar-de-casa'
  | 'ter-um-filho'
  | 'estudar'
  | 'apoio-social'
  | 'animais'
  | 'ambiente';

export interface ServiceStep {
  title: Localized;
  detail: Localized;
}

export interface ServiceItem {
  id: string;
  slug: string;
  area: ServiceArea;
  title: Localized;
  /** Ein Satz, der erklärt, was hier passiert. */
  summary: Localized;
  lifeEvents: LifeEvent[];
  channels: ('online' | 'presencial' | 'correio' | 'telefone')[];
  onlineUrl?: string;
  /** Erwartete Bearbeitungsdauer als Klartext („até 15 dias úteis“). */
  processingTime: Localized;
  /** Gebühr als Klartext. „Gratuito“ ist ein gültiger Wert. */
  fee: Localized;
  audience: Localized;
  requiredDocuments: Localized<string[]>;
  steps: ServiceStep[];
  legislation?: Localized<string[]>;
  forms?: string[];
  relatedServices?: string[];
  department: string;
  icon: string;
  featured?: boolean;
}

// --- Documentos ------------------------------------------------------------------

export type DocumentType =
  | 'formulario'
  | 'regulamento'
  | 'edital'
  | 'ata'
  | 'relatorio'
  | 'plano'
  | 'aviso'
  | 'dados';

export interface DocumentItem {
  id: string;
  slug: string;
  type: DocumentType;
  title: Localized;
  summary?: Localized;
  area: ServiceArea | 'municipio' | 'transparencia';
  year: number;
  publishedAt: string;
  file: FileAsset;
  /** Wenn der Vorgang auch online geht, steht der Weg hier. */
  onlinePath?: string;
  lifeEvents?: LifeEvent[];
}

// --- Consultas públicas -----------------------------------------------------------

export interface Consultation {
  id: string;
  slug: string;
  title: Localized;
  summary: Localized;
  body?: Localized<string[]>;
  startsAt: string;
  endsAt: string;
  area: string;
  /** Wie man teilnimmt – Formular, E-Mail, Papier. */
  howTo: Localized<string[]>;
  documents: FileAsset[];
  contactEmail: string;
}

// --- Editais / Concursos ------------------------------------------------------------

export interface Tender {
  id: string;
  slug: string;
  title: Localized;
  reference: string;
  kind: 'obra' | 'aquisicao' | 'servico' | 'recrutamento' | 'concessao';
  publishedAt: string;
  deadline: string;
  basePrice?: number;
  documents: FileAsset[];
}

// --- Freguesias ---------------------------------------------------------------------

export interface Freguesia {
  id: string;
  slug: string;
  name: string;
  seat: string;
  president: string;
  phone?: string;
  email?: string;
  /** Fläche in km². */
  area: number;
  population: number;
  villages: string[];
  geo: { lat: number; lon: number };
  description: Localized;
}

// --- Pessoas / Órgãos ----------------------------------------------------------------

export interface Person {
  id: string;
  name: string;
  role: Localized;
  party?: string;
  portfolio?: Localized<string[]>;
  email?: string;
  body: 'executivo' | 'assembleia';
}

// --- Reuniões -------------------------------------------------------------------------

export interface Meeting {
  id: string;
  slug: string;
  body: 'camara' | 'assembleia';
  kind: 'ordinaria' | 'extraordinaria';
  date: string;
  isPublic: boolean;
  /** Tagesordnungspunkte als Volltext – Grundlage der Sitzungssuche. */
  agenda: string[];
  decisions: { title: string; outcome: 'aprovado' | 'rejeitado' | 'retirado'; votes?: string }[];
  minutes?: FileAsset;
  agendaFile?: FileAsset;
  livestreamUrl?: string;
}

// --- Orçamento -------------------------------------------------------------------------

export interface BudgetCategory {
  id: string;
  label: Localized;
  /** Beträge in Euro. */
  amount: number;
  previousAmount: number;
  icon: string;
  children?: { label: Localized; amount: number; previousAmount: number }[];
}

export interface BudgetYear {
  year: number;
  revenue: number;
  expense: number;
  previousRevenue: number;
  previousExpense: number;
  inhabitants: number;
  categories: BudgetCategory[];
  documents: FileAsset[];
}

// --- Orçamento Participativo -------------------------------------------------------------

export interface ParticipatoryProject {
  id: string;
  slug: string;
  title: Localized;
  summary: Localized;
  freguesia: string;
  budget: number;
  votes: number;
  edition: number;
  strand: 'geral' | 'jovem' | 'senior';
  status: 'em-votacao' | 'vencedor' | 'em-execucao' | 'concluido' | 'nao-selecionado';
  /** Fortschritt in Prozent, nur bei status = em-execucao. */
  progress?: number;
}

// --- Resíduos ---------------------------------------------------------------------------

export type WasteStream = 'indiferenciado' | 'embalagens' | 'papel' | 'vidro' | 'monstros';

export interface WasteSchedule {
  freguesiaSlug: string;
  /** 0 = Sonntag … 6 = Samstag. */
  streams: Record<WasteStream, number[]>;
  notes?: Localized;
}

// --- Risco de incêndio ---------------------------------------------------------------------

export interface FireRiskDay {
  date: string;
  /** Offizielle IPMA-Skala 1–5. */
  level: 1 | 2 | 3 | 4 | 5;
}

// --- Ocorrências ------------------------------------------------------------------------------

export type OccurrenceStatus = 'recebida' | 'em-resolucao' | 'resolvida' | 'sem-seguimento';

export type OccurrenceCategory =
  | 'via-publica'
  | 'iluminacao'
  | 'residuos'
  | 'agua-e-saneamento'
  | 'espacos-verdes'
  | 'sinalizacao'
  | 'outro';

export interface Occurrence {
  reference: string;
  category: OccurrenceCategory;
  description: string;
  freguesia: string;
  geo: { lat: number; lon: number };
  status: OccurrenceStatus;
  reportedAt: string;
  resolvedAt?: string;
  /** Antwort der Verwaltung, sichtbar in der Statusverfolgung. */
  response?: string;
}

// --- Atendimento ---------------------------------------------------------------------------------

export interface BookableService {
  id: string;
  label: Localized;
  department: string;
  durationMinutes: number;
  bring: Localized<string[]>;
}
