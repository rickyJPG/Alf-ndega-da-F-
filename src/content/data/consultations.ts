import type { Consultation, Tender } from '../types';
import { offsetDays } from './clock';

/**
 * Laufende und abgeschlossene öffentliche Konsultationen.
 * Auf der alten Seite waren sie tief vergraben – hier stehen sie mit
 * Restfrist auf der Startseite.
 */
export const consultations: Consultation[] = [
  {
    id: 'c-apoios-freguesias',
    slug: 'regulamento-de-apoios-as-freguesias',
    title: {
      pt: 'Regulamento de apoio às Juntas de Freguesia',
      en: 'By-law on support for parish councils',
      es: 'Reglamento de apoyo a las Juntas de Parroquia',
      fr: 'Règlement d’aide aux conseils de paroisse',
    },
    summary: {
      pt: 'Define os critérios e os montantes das transferências do Município para as doze freguesias.',
      en: 'Sets the criteria and amounts of transfers from the Council to the twelve parishes.',
      es: 'Define los criterios y los importes de las transferencias del Ayuntamiento a las doce parroquias.',
      fr: 'Définit les critères et les montants des transferts vers les douze paroisses.',
    },
    body: {
      pt: [
        'O projeto de regulamento fixa uma dotação base por freguesia e uma componente variável em função da população, da área e do número de lugares.',
        'Substitui a prática atual de atribuição caso a caso, tornando previsível o valor com que cada Junta pode contar no início do ano.',
        'A consulta decorre nos termos do artigo 101.º do Código do Procedimento Administrativo.',
      ],
    },
    startsAt: offsetDays(-18),
    endsAt: offsetDays(12),
    area: 'Município',
    howTo: {
      pt: [
        'Preencha o formulário de participação disponível nesta página.',
        'Ou envie a sua posição por email para consultas@cm-alfandegadafe.pt.',
        'Ou entregue em papel no balcão de atendimento, nos Paços do Concelho.',
      ],
      en: [
        'Fill in the participation form on this page.',
        'Or send your comments to consultas@cm-alfandegadafe.pt.',
        'Or hand them in on paper at the town hall counter.',
      ],
    },
    documents: [
      {
        href: '/documentos/regulamento-apoios-freguesias-projeto.pdf',
        label: { pt: 'Projeto de regulamento', en: 'Draft by-law' },
        format: 'pdf',
        bytes: 486_400,
        extractedText:
          'Projeto de Regulamento de Apoio às Juntas de Freguesia do Município de Alfândega da Fé. Artigo 1.º Objeto. Artigo 2.º Âmbito. Artigo 3.º Dotação base. Artigo 4.º Componente variável. Critérios: população residente, área da freguesia, número de lugares.',
      },
      {
        href: '/documentos/regulamento-apoios-freguesias-nota-justificativa.pdf',
        label: { pt: 'Nota justificativa', en: 'Explanatory note' },
        format: 'pdf',
        bytes: 194_560,
      },
    ],
    contactEmail: 'consultas@cm-alfandegadafe.pt',
  },
  {
    id: 'c-transito-centro',
    slug: 'plano-de-transito-do-centro-da-vila',
    title: {
      pt: 'Plano de trânsito do centro da vila',
      en: 'Traffic plan for the town centre',
      es: 'Plan de tráfico del centro de la villa',
      fr: 'Plan de circulation du centre-bourg',
    },
    summary: {
      pt: 'Proposta de sentido único no Largo de D. Dinis e de mais 40 lugares de estacionamento.',
      en: 'Proposal for a one-way system at Largo de D. Dinis and 40 more parking spaces.',
      es: 'Propuesta de sentido único en el Largo de D. Dinis y 40 plazas más de aparcamiento.',
      fr: 'Proposition de sens unique au Largo de D. Dinis et 40 places de stationnement en plus.',
    },
    body: {
      pt: [
        'A proposta prevê a inversão do sentido de circulação na Rua da Corredoura e a criação de um parque de estacionamento junto ao mercado.',
        'Inclui ainda seis lugares reservados a pessoas com mobilidade condicionada e dois lugares de carga e descarga com horário limitado.',
        'Estão marcadas duas sessões públicas de esclarecimento, indicadas na agenda deste portal.',
      ],
    },
    startsAt: offsetDays(-5),
    endsAt: offsetDays(25),
    area: 'Obras e Mobilidade',
    howTo: {
      pt: [
        'Participe no formulário desta página.',
        'Ou compareça numa das duas sessões públicas de esclarecimento.',
      ],
      en: ['Use the form on this page.', 'Or come to one of the two public information sessions.'],
    },
    documents: [
      {
        href: '/documentos/plano-transito-centro.pdf',
        label: { pt: 'Plano de trânsito proposto', en: 'Proposed traffic plan' },
        format: 'pdf',
        bytes: 2_411_724,
        extractedText:
          'Plano de trânsito do centro da vila de Alfândega da Fé. Largo de D. Dinis sentido único. Rua da Corredoura inversão de sentido. Estacionamento junto ao mercado municipal. Lugares reservados a pessoas com mobilidade condicionada. Cargas e descargas.',
      },
    ],
    contactEmail: 'consultas@cm-alfandegadafe.pt',
  },
  {
    id: 'c-taxas-2027',
    slug: 'tabela-de-taxas-2027',
    title: {
      pt: 'Tabela de taxas e licenças para 2027',
      en: 'Fees and licences schedule for 2027',
      es: 'Tabla de tasas y licencias para 2027',
      fr: 'Barème des taxes et licences pour 2027',
    },
    summary: {
      pt: 'Atualização anual, com isenção alargada para obras de reabilitação no centro histórico.',
      en: 'Annual update, with a wider exemption for renovation work in the historic centre.',
      es: 'Actualización anual, con exención ampliada para obras de rehabilitación en el centro histórico.',
      fr: 'Mise à jour annuelle, avec exonération élargie pour la réhabilitation du centre historique.',
    },
    startsAt: offsetDays(9),
    endsAt: offsetDays(39),
    area: 'Finanças',
    howTo: {
      pt: ['A consulta abre no dia indicado. Pode subscrever a newsletter para ser avisado.'],
      en: ['The consultation opens on the date shown. Subscribe to the newsletter to be notified.'],
    },
    documents: [],
    contactEmail: 'consultas@cm-alfandegadafe.pt',
  },
  {
    id: 'c-plano-agua',
    slug: 'plano-de-eficiencia-hidrica',
    title: {
      pt: 'Plano municipal de eficiência hídrica',
      en: 'Municipal water efficiency plan',
      es: 'Plan municipal de eficiencia hídrica',
      fr: 'Plan municipal d’efficacité hydrique',
    },
    summary: {
      pt: 'Consulta encerrada. Foram recebidos 34 contributos, todos respondidos no relatório final.',
      en: 'Closed. 34 contributions were received, all answered in the final report.',
      es: 'Consulta cerrada. Se recibieron 34 aportaciones, todas respondidas en el informe final.',
      fr: 'Consultation close. 34 contributions reçues, toutes traitées dans le rapport final.',
    },
    startsAt: offsetDays(-95),
    endsAt: offsetDays(-35),
    area: 'Ambiente',
    howTo: { pt: ['O período de participação terminou.'], en: ['The participation period has ended.'] },
    documents: [
      {
        href: '/documentos/plano-eficiencia-hidrica-relatorio.pdf',
        label: { pt: 'Relatório de ponderação dos contributos', en: 'Report on the contributions received' },
        format: 'pdf',
        bytes: 921_600,
        extractedText:
          'Relatório de ponderação da consulta pública do plano municipal de eficiência hídrica. Trinta e quatro contributos. Redução de perdas na rede. Reutilização de água para rega de espaços verdes. Contadores inteligentes.',
      },
    ],
    contactEmail: 'consultas@cm-alfandegadafe.pt',
  },
];

/** Laufende Ausschreibungen und Stellenausschreibungen. */
export const tenders: Tender[] = [
  {
    id: 't-requalificacao-mercado',
    slug: 'requalificacao-do-mercado-municipal',
    title: {
      pt: 'Requalificação do Mercado Municipal',
      en: 'Refurbishment of the municipal market',
    },
    reference: 'CP 14/2026',
    kind: 'obra',
    publishedAt: offsetDays(-11),
    deadline: offsetDays(9),
    basePrice: 487_000,
    documents: [
      {
        href: '/documentos/cp-14-2026-caderno-encargos.pdf',
        label: { pt: 'Caderno de encargos', en: 'Contract specifications' },
        format: 'pdf',
        bytes: 1_887_436,
        extractedText:
          'Caderno de encargos concurso público requalificação do mercado municipal de Alfândega da Fé. Cobertura, instalações elétricas, bancas, acessibilidades, instalações sanitárias.',
      },
    ],
  },
  {
    id: 't-tecnico-superior-ambiente',
    slug: 'tecnico-superior-de-ambiente',
    title: {
      pt: 'Técnico Superior de Ambiente (1 posto)',
      en: 'Environmental officer (1 post)',
    },
    reference: 'PC 07/2026',
    kind: 'recrutamento',
    publishedAt: offsetDays(-6),
    deadline: offsetDays(4),
    documents: [
      {
        href: '/documentos/pc-07-2026-aviso.pdf',
        label: { pt: 'Aviso de abertura', en: 'Notice of opening' },
        format: 'pdf',
        bytes: 268_288,
        extractedText:
          'Procedimento concursal comum técnico superior área de ambiente. Licenciatura em engenharia do ambiente. Contrato de trabalho em funções públicas por tempo indeterminado.',
      },
    ],
  },
  {
    id: 't-aquisicao-viatura',
    slug: 'aquisicao-de-viatura-de-recolha',
    title: {
      pt: 'Aquisição de viatura de recolha de resíduos',
      en: 'Purchase of a refuse collection vehicle',
    },
    reference: 'CP 11/2026',
    kind: 'aquisicao',
    publishedAt: offsetDays(-21),
    deadline: offsetDays(-1),
    basePrice: 168_500,
    documents: [],
  },
  {
    id: 't-assistente-operacional',
    slug: 'assistentes-operacionais-cantinas',
    title: {
      pt: 'Assistentes operacionais para as cantinas escolares (3 postos)',
      en: 'School canteen assistants (3 posts)',
    },
    reference: 'PC 09/2026',
    kind: 'recrutamento',
    publishedAt: offsetDays(-2),
    deadline: offsetDays(18),
    documents: [],
  },
  {
    id: 't-concessao-bar',
    slug: 'concessao-do-bar-das-piscinas',
    title: {
      pt: 'Concessão do bar das Piscinas Municipais',
      en: 'Concession of the municipal pool bar',
    },
    reference: 'HP 03/2026',
    kind: 'concessao',
    publishedAt: offsetDays(-4),
    deadline: offsetDays(16),
    basePrice: 4_800,
    documents: [],
  },
];

export function openConsultations(today = new Date().toISOString().slice(0, 10)): Consultation[] {
  return consultations.filter((item) => item.startsAt <= today && item.endsAt >= today);
}

export function openTenders(today = new Date().toISOString().slice(0, 10)): Tender[] {
  return tenders.filter((item) => item.deadline >= today);
}

export function findConsultation(slug: string): Consultation | undefined {
  return consultations.find((item) => item.slug === slug);
}
