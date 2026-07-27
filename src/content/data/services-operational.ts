import type {
  BookableService,
  FireRiskDay,
  Occurrence,
  ParticipatoryProject,
  WasteSchedule,
} from '../types';
import { offsetDays } from './clock';

/**
 * Betriebsdaten: Abfallkalender, Waldbrandrisiko, gemeldete Vorfälle,
 * Bürgerhaushalt und buchbare Sprechzeiten.
 *
 * In Produktion kommen Waldbrandstufe und Vorfälle aus einer Schnittstelle
 * (IPMA bzw. Fachverfahren); die Struktur bleibt dieselbe.
 */

// --- Abfallkalender ------------------------------------------------------------

/** 0 = Sonntag … 6 = Samstag */
export const wasteSchedules: WasteSchedule[] = [
  {
    freguesiaSlug: 'alfandega-da-fe',
    streams: { indiferenciado: [1, 3, 5], embalagens: [2], papel: [4], vidro: [6], monstros: [] },
    notes: {
      pt: 'Coloque o contentor na rua depois das 20:00 da véspera.',
      en: 'Put the bin out after 20:00 the evening before.',
    },
  },
  {
    freguesiaSlug: 'sambade',
    streams: { indiferenciado: [2, 5], embalagens: [3], papel: [3], vidro: [6], monstros: [] },
  },
  {
    freguesiaSlug: 'cerejais',
    streams: { indiferenciado: [1, 4], embalagens: [5], papel: [5], vidro: [6], monstros: [] },
  },
  {
    freguesiaSlug: 'vilarelhos',
    streams: { indiferenciado: [2, 5], embalagens: [4], papel: [4], vidro: [6], monstros: [] },
  },
  {
    freguesiaSlug: 'vilar-chao',
    streams: { indiferenciado: [3, 6], embalagens: [1], papel: [1], vidro: [6], monstros: [] },
  },
  {
    freguesiaSlug: 'agrobom-saldonha-vale-pereiro',
    streams: { indiferenciado: [1, 4], embalagens: [2], papel: [2], vidro: [6], monstros: [] },
  },
  {
    freguesiaSlug: 'eucisia-gouveia-valverde',
    streams: { indiferenciado: [2, 5], embalagens: [3], papel: [3], vidro: [6], monstros: [] },
  },
  {
    freguesiaSlug: 'ferradosa-sendim-da-serra',
    streams: { indiferenciado: [3, 6], embalagens: [4], papel: [4], vidro: [6], monstros: [] },
  },
  {
    freguesiaSlug: 'gebelim-soeima',
    streams: { indiferenciado: [1, 4], embalagens: [5], papel: [5], vidro: [6], monstros: [] },
  },
  {
    freguesiaSlug: 'parada-sendim-da-ribeira',
    streams: { indiferenciado: [2, 5], embalagens: [1], papel: [1], vidro: [6], monstros: [] },
  },
  {
    freguesiaSlug: 'pombal-vales',
    streams: { indiferenciado: [3, 6], embalagens: [2], papel: [2], vidro: [6], monstros: [] },
  },
  {
    freguesiaSlug: 'vilares-de-vilarica-vale-frechoso',
    streams: { indiferenciado: [1, 4], embalagens: [3], papel: [3], vidro: [6], monstros: [] },
  },
];

// --- Waldbrandrisiko ------------------------------------------------------------

/** Fünf Tage Vorschau nach IPMA-Skala. */
export const fireRisk: FireRiskDay[] = [
  { date: offsetDays(0), level: 4 },
  { date: offsetDays(1), level: 4 },
  { date: offsetDays(2), level: 3 },
  { date: offsetDays(3), level: 3 },
  { date: offsetDays(4), level: 2 },
];

export const fireRiskAdvice: Record<number, { pt: string; en: string }> = {
  1: {
    pt: 'Sem restrições especiais. Mantenha os terrenos limpos.',
    en: 'No special restrictions. Keep land clear of undergrowth.',
  },
  2: {
    pt: 'Evite fogueiras. Não deixe lixo nem vidro no mato.',
    en: 'Avoid open fires. Leave no litter or glass in scrubland.',
  },
  3: {
    pt: 'Queimadas proibidas. Cuidado com máquinas que produzam faísca.',
    en: 'Burning prohibited. Take care with spark-producing machinery.',
  },
  4: {
    pt: 'Proibido fazer fogo, fumar e usar maquinaria agrícola no mato. Circulação condicionada em zonas florestais.',
    en: 'No fire, no smoking and no farm machinery in scrubland. Restricted access to forest areas.',
  },
  5: {
    pt: 'Risco máximo. Proibido o acesso e a permanência em espaços florestais.',
    en: 'Extreme risk. Access to and presence in forest areas is prohibited.',
  },
};

// --- Ocorrências ------------------------------------------------------------------

export const occurrences: Occurrence[] = [
  {
    reference: 'OC-2026-0418',
    category: 'iluminacao',
    description: 'Candeeiro apagado junto ao número 22 da Rua da Corredoura.',
    freguesia: 'alfandega-da-fe',
    geo: { lat: 41.3449, lon: -6.9583 },
    status: 'resolvida',
    reportedAt: offsetDays(-14),
    resolvedAt: offsetDays(-9),
    response: 'Substituída a lâmpada e o balastro. Obrigado pela comunicação.',
  },
  {
    reference: 'OC-2026-0431',
    category: 'via-publica',
    description: 'Buraco com cerca de meio metro na estrada de acesso a Cerejais.',
    freguesia: 'cerejais',
    geo: { lat: 41.3612, lon: -6.9781 },
    status: 'em-resolucao',
    reportedAt: offsetDays(-6),
    response: 'Reparação prevista para a próxima semana, com a equipa de pavimentação.',
  },
  {
    reference: 'OC-2026-0437',
    category: 'residuos',
    description: 'Ecoponto do papel cheio há vários dias.',
    freguesia: 'sambade',
    geo: { lat: 41.3818, lon: -6.9441 },
    status: 'resolvida',
    reportedAt: offsetDays(-5),
    resolvedAt: offsetDays(-4),
    response: 'Recolha efetuada. Reforçámos a frequência neste ponto.',
  },
  {
    reference: 'OC-2026-0442',
    category: 'agua-e-saneamento',
    description: 'Rotura visível no passeio, com água a correr.',
    freguesia: 'vilarelhos',
    geo: { lat: 41.3148, lon: -7.0093 },
    status: 'em-resolucao',
    reportedAt: offsetDays(-2),
    response: 'Piquete no local. Reparação em curso.',
  },
  {
    reference: 'OC-2026-0445',
    category: 'espacos-verdes',
    description: 'Ramo partido sobre o passeio no jardim municipal.',
    freguesia: 'alfandega-da-fe',
    geo: { lat: 41.3453, lon: -6.9576 },
    status: 'recebida',
    reportedAt: offsetDays(-1),
  },
  {
    reference: 'OC-2026-0447',
    category: 'sinalizacao',
    description: 'Sinal de STOP tapado pela vegetação no cruzamento para Gebelim.',
    freguesia: 'gebelim-soeima',
    geo: { lat: 41.3995, lon: -6.9722 },
    status: 'recebida',
    reportedAt: offsetDays(0),
  },
];

// --- Orçamento Participativo -------------------------------------------------------

export const participatoryProjects: ParticipatoryProject[] = [
  {
    id: 'op-parque-canino',
    slug: 'parque-canino-no-jardim-municipal',
    title: { pt: 'Parque canino no jardim municipal', en: 'Dog park in the municipal garden' },
    summary: {
      pt: 'Espaço vedado de 600 m², com bebedouro, bancos e sombra.',
      en: 'A fenced 600 m² area with a water point, benches and shade.',
    },
    freguesia: 'alfandega-da-fe',
    budget: 28_000,
    votes: 412,
    edition: 2026,
    strand: 'geral',
    status: 'em-votacao',
  },
  {
    id: 'op-skate',
    slug: 'pista-de-skate',
    title: { pt: 'Pista de skate junto ao pavilhão', en: 'Skate park next to the sports hall' },
    summary: {
      pt: 'Pista modular em betão, com zona de iniciação para os mais novos.',
      en: 'A modular concrete park, with a beginners’ area for younger skaters.',
    },
    freguesia: 'alfandega-da-fe',
    budget: 46_500,
    votes: 388,
    edition: 2026,
    strand: 'jovem',
    status: 'em-votacao',
  },
  {
    id: 'op-percurso-senior',
    slug: 'percurso-de-manutencao-senior',
    title: { pt: 'Percurso de manutenção sénior', en: 'Senior fitness trail' },
    summary: {
      pt: 'Circuito de 800 m com piso regular, corrimão e nove estações de exercício.',
      en: 'An 800 m circuit with even paving, handrails and nine exercise stations.',
    },
    freguesia: 'alfandega-da-fe',
    budget: 34_000,
    votes: 501,
    edition: 2026,
    strand: 'senior',
    status: 'em-votacao',
  },
  {
    id: 'op-fontanario-sambade',
    slug: 'recuperacao-do-fontanario-de-sambade',
    title: { pt: 'Recuperação do fontanário de Sambade', en: 'Restoring the Sambade fountain' },
    summary: {
      pt: 'Limpeza da cantaria, reposição da bica e novo lajeado em redor.',
      en: 'Cleaning the stonework, restoring the spout and new paving around it.',
    },
    freguesia: 'sambade',
    budget: 19_800,
    votes: 336,
    edition: 2026,
    strand: 'geral',
    status: 'em-votacao',
  },
  {
    id: 'op-miradouro-cilhades',
    slug: 'miradouro-de-cilhades',
    title: { pt: 'Miradouro de Cilhades', en: 'Cilhades viewpoint' },
    summary: {
      pt: 'Plataforma acessível sobre os Lagos do Sabor, com painel interpretativo.',
      en: 'An accessible platform over the Sabor lakes, with an interpretive panel.',
    },
    freguesia: 'parada-sendim-da-ribeira',
    budget: 41_000,
    votes: 622,
    edition: 2025,
    strand: 'geral',
    status: 'em-execucao',
    progress: 65,
  },
  {
    id: 'op-biblioteca-jovem',
    slug: 'sala-de-estudo-na-biblioteca',
    title: { pt: 'Sala de estudo na biblioteca', en: 'Study room at the library' },
    summary: {
      pt: 'Doze lugares, tomadas em todas as mesas e horário alargado em época de exames.',
      en: 'Twelve places, sockets at every table and longer hours during exams.',
    },
    freguesia: 'alfandega-da-fe',
    budget: 22_400,
    votes: 447,
    edition: 2025,
    strand: 'jovem',
    status: 'concluido',
  },
  {
    id: 'op-horta-comunitaria',
    slug: 'horta-comunitaria',
    title: { pt: 'Horta comunitária', en: 'Community allotments' },
    summary: {
      pt: 'Vinte talhões, água de rega e arrecadação de alfaias partilhada.',
      en: 'Twenty plots, irrigation water and a shared tool shed.',
    },
    freguesia: 'alfandega-da-fe',
    budget: 31_500,
    votes: 289,
    edition: 2025,
    strand: 'geral',
    status: 'nao-selecionado',
  },
  {
    id: 'op-iluminacao-vilarelhos',
    slug: 'iluminacao-do-caminho-do-santuario',
    title: { pt: 'Iluminação do caminho do santuário', en: 'Lighting on the shrine path' },
    summary: {
      pt: 'Doze pontos de luz solar ao longo do acesso a Nossa Senhora da Assunção.',
      en: 'Twelve solar lights along the path to Nossa Senhora da Assunção.',
    },
    freguesia: 'vilarelhos',
    budget: 26_700,
    votes: 512,
    edition: 2025,
    strand: 'geral',
    status: 'em-execucao',
    progress: 30,
  },
];

// --- Atendimento -----------------------------------------------------------------------

export const bookableServices: BookableService[] = [
  {
    id: 'b-urbanismo',
    label: { pt: 'Urbanismo e obras', en: 'Planning and building', es: 'Urbanismo y obras', fr: 'Urbanisme et travaux' },
    department: 'Divisão de Urbanismo',
    durationMinutes: 30,
    bring: {
      pt: ['Cartão de cidadão', 'Identificação do prédio (artigo matricial)', 'Projeto, se já existir'],
      en: ['Identity card', 'Property tax reference', 'The design, if you already have one'],
    },
  },
  {
    id: 'b-aguas',
    label: { pt: 'Águas e saneamento', en: 'Water and sewerage', es: 'Aguas y saneamiento', fr: 'Eau et assainissement' },
    department: 'Divisão de Águas e Saneamento',
    durationMinutes: 20,
    bring: {
      pt: ['Cartão de cidadão', 'Comprovativo de morada', 'IBAN, se quiser débito direto'],
      en: ['Identity card', 'Proof of address', 'IBAN, if you want direct debit'],
    },
  },
  {
    id: 'b-social',
    label: { pt: 'Ação social', en: 'Social support', es: 'Acción social', fr: 'Action sociale' },
    department: 'Divisão de Ação Social',
    durationMinutes: 45,
    bring: {
      pt: [
        'Cartão de cidadão de todo o agregado',
        'Comprovativos de rendimento dos últimos três meses',
        'Recibo de renda, se aplicável',
      ],
      en: [
        'Identity cards for the whole household',
        'Proof of income for the last three months',
        'Rent receipt, if applicable',
      ],
    },
  },
  {
    id: 'b-tesouraria',
    label: { pt: 'Tesouraria e pagamentos', en: 'Treasury and payments', es: 'Tesorería y pagos', fr: 'Trésorerie et paiements' },
    department: 'Divisão Financeira',
    durationMinutes: 15,
    bring: { pt: ['Fatura ou referência de pagamento'], en: ['Invoice or payment reference'] },
  },
  {
    id: 'b-empreendedor',
    label: { pt: 'Apoio ao empreendedor', en: 'Business support', es: 'Apoyo al emprendedor', fr: 'Aide aux entrepreneurs' },
    department: 'Gabinete de Apoio ao Empreendedor',
    durationMinutes: 45,
    bring: {
      pt: ['Ideia de negócio ou plano, mesmo que preliminar', 'Certidão permanente, se a empresa já existir'],
      en: ['Your business idea or plan, even a draft', 'Company registration, if the firm already exists'],
    },
  },
];

/**
 * Freie Termine der nächsten drei Wochen. Werktags 09:00–12:30 und
 * 14:00–17:00; einige Slots sind bewusst belegt, damit die Ansicht
 * realistisch aussieht.
 */
export function availableSlots(serviceId: string, dayIso: string): string[] {
  const day = new Date(`${dayIso}T00:00:00.000Z`);
  const weekday = day.getUTCDay();
  if (weekday === 0 || weekday === 6) return [];

  const service = bookableServices.find((item) => item.id === serviceId);
  const step = service?.durationMinutes ?? 30;

  const slots: string[] = [];
  for (const [startHour, endHour] of [
    [9, 12.5],
    [14, 17],
  ] as const) {
    for (let minutes = startHour * 60; minutes + step <= endHour * 60; minutes += step) {
      slots.push(
        `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`,
      );
    }
  }

  // Deterministische „Belegung“: hängt an Datum und Dienst, nicht an Zufall.
  const seed = [...`${dayIso}${serviceId}`].reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return slots.filter((_, index) => (seed + index * 7) % 3 !== 0);
}
