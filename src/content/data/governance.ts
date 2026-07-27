import type { Meeting, Person } from '../types';

/**
 * Executivo, Assembleia Municipal e o arquivo de reuniões.
 *
 * Os pontos da ordem de trabalhos e as deliberações estão em texto simples e
 * não apenas em PDF anexo — só assim o arquivo é pesquisável por inteiro.
 */
export const people: Person[] = [
  {
    id: 'p-presidente',
    name: 'Eduardo Manuel Dobrões Tavares',
    role: { pt: 'Presidente da Câmara Municipal', en: 'Mayor', es: 'Alcalde', fr: 'Maire' },
    portfolio: {
      pt: ['Finanças', 'Obras municipais', 'Proteção civil', 'Recursos humanos'],
      en: ['Finance', 'Public works', 'Civil protection', 'Human resources'],
    },
    email: 'presidente@cm-alfandegadafe.pt',
    body: 'executivo',
  },
  {
    id: 'p-vice',
    name: 'Maria Manuel Rocha Cunha Silva',
    role: {
      pt: 'Vice-Presidente',
      en: 'Deputy Mayor',
      es: 'Vicealcaldesa',
      fr: 'Adjointe au maire',
    },
    portfolio: {
      pt: ['Ação social', 'Educação', 'Saúde', 'Cultura'],
      en: ['Social services', 'Education', 'Health', 'Culture'],
    },
    email: 'vice.presidencia@cm-alfandegadafe.pt',
    body: 'executivo',
  },
  {
    id: 'p-vereador-1',
    name: 'Rui Jorge Barracho Figueiredo',
    role: { pt: 'Vereador', en: 'Councillor', es: 'Concejal', fr: 'Conseiller' },
    portfolio: {
      pt: ['Ambiente', 'Águas e saneamento', 'Espaços verdes'],
      en: ['Environment', 'Water and sanitation', 'Green spaces'],
    },
    body: 'executivo',
  },
  {
    id: 'p-vereador-2',
    name: 'Vítor José Neves Bebiano',
    role: { pt: 'Vereador', en: 'Councillor', es: 'Concejal', fr: 'Conseiller' },
    portfolio: {
      pt: ['Desporto', 'Juventude', 'Associativismo'],
      en: ['Sport', 'Youth', 'Community associations'],
    },
    body: 'executivo',
  },
  {
    id: 'p-vereadora-3',
    name: 'Antónia Rosa Morais Vilares',
    role: { pt: 'Vereadora', en: 'Councillor', es: 'Concejala', fr: 'Conseillère' },
    portfolio: {
      pt: ['Desenvolvimento económico', 'Turismo', 'Agricultura'],
      en: ['Economic development', 'Tourism', 'Agriculture'],
    },
    body: 'executivo',
  },
  {
    id: 'p-am-presidente',
    name: 'Joaquim António Ferreira',
    role: {
      pt: 'Presidente da Assembleia Municipal',
      en: 'Chair of the Municipal Assembly',
      es: 'Presidente de la Asamblea Municipal',
      fr: 'Président de l’Assemblée municipale',
    },
    body: 'assembleia',
  },
  {
    id: 'p-am-secretaria-1',
    name: 'Sónia Cristina Pires',
    role: { pt: '1.ª Secretária', en: 'First Secretary' },
    body: 'assembleia',
  },
  {
    id: 'p-am-secretario-2',
    name: 'Nuno Miguel Barreira',
    role: { pt: '2.º Secretário', en: 'Second Secretary' },
    body: 'assembleia',
  },
];

export const executivo = people.filter((person) => person.body === 'executivo');
export const assembleia = people.filter((person) => person.body === 'assembleia');

export const meetings: Meeting[] = [
  {
    id: 'm-2026-07-13',
    slug: 'reuniao-ordinaria-13-07-2026',
    body: 'camara',
    kind: 'ordinaria',
    date: '2026-07-13',
    isPublic: true,
    agenda: [
      'Aprovação da ata da reunião anterior',
      'Informação sobre a saída da situação de excesso de endividamento',
      'Adjudicação da empreitada de substituição da conduta de água de Vilarelhos',
      'Atribuição de apoio financeiro à Banda Filarmónica Alfandeguense',
      'Isenção de taxas para a Feira Anual de Sambade',
      'Período de intervenção do público',
    ],
    decisions: [
      {
        title: 'Adjudicação da empreitada de substituição da conduta de água de Vilarelhos',
        outcome: 'aprovado',
        votes: 'Aprovado por unanimidade',
      },
      {
        title: 'Apoio financeiro de 7 500 € à Banda Filarmónica Alfandeguense',
        outcome: 'aprovado',
        votes: 'Aprovado por maioria, com uma abstenção',
      },
      {
        title: 'Isenção de taxas de ocupação para a Feira Anual de Sambade',
        outcome: 'aprovado',
        votes: 'Aprovado por unanimidade',
      },
    ],
    minutes: {
      href: '/documentos/ata-13-2026.pdf',
      label: { pt: 'Ata n.º 13/2026', en: 'Minutes no. 13/2026' },
      format: 'pdf',
      bytes: 312_320,
      extractedText:
        'Ata número treze de dois mil e vinte e seis reunião ordinária da Câmara Municipal de Alfândega da Fé. Endividamento. Conduta de água Vilarelhos. Banda Filarmónica. Feira de Sambade.',
    },
  },
  {
    id: 'm-2026-06-29',
    slug: 'reuniao-ordinaria-29-06-2026',
    body: 'camara',
    kind: 'ordinaria',
    date: '2026-06-29',
    isPublic: false,
    agenda: [
      'Aprovação da ata da reunião anterior',
      'Balanço da Festa da Cereja&co 2026',
      'Abertura de procedimento concursal para técnico superior de ambiente',
      'Atribuição de bolsas de estudo do ensino superior',
      'Alteração ao mapa de pessoal',
    ],
    decisions: [
      {
        title: 'Abertura de procedimento concursal para um técnico superior de ambiente',
        outcome: 'aprovado',
        votes: 'Aprovado por unanimidade',
      },
      {
        title: 'Atribuição de 22 bolsas de estudo do ensino superior',
        outcome: 'aprovado',
        votes: 'Aprovado por unanimidade',
      },
    ],
    minutes: {
      href: '/documentos/ata-12-2026.pdf',
      label: { pt: 'Ata n.º 12/2026', en: 'Minutes no. 12/2026' },
      format: 'pdf',
      bytes: 289_792,
      extractedText:
        'Ata número doze reunião ordinária. Festa da Cereja balanço. Procedimento concursal técnico superior ambiente. Bolsas de estudo ensino superior. Mapa de pessoal.',
    },
  },
  {
    id: 'm-2026-06-15',
    slug: 'reuniao-ordinaria-15-06-2026',
    body: 'camara',
    kind: 'ordinaria',
    date: '2026-06-15',
    isPublic: true,
    agenda: [
      'Aprovação da ata da reunião anterior',
      'Proposta de regulamento de apoio às Juntas de Freguesia',
      'Submissão a consulta pública do plano de trânsito do centro da vila',
      'Ratificação de despacho sobre risco de incêndio',
      'Período de intervenção do público',
    ],
    decisions: [
      {
        title: 'Submissão a consulta pública do projeto de regulamento de apoio às freguesias',
        outcome: 'aprovado',
        votes: 'Aprovado por unanimidade',
      },
      {
        title: 'Proposta de alteração do sentido de trânsito na Rua da Corredoura',
        outcome: 'retirado',
        votes: 'Retirado para análise técnica complementar',
      },
    ],
    minutes: {
      href: '/documentos/ata-11-2026.pdf',
      label: { pt: 'Ata n.º 11/2026', en: 'Minutes no. 11/2026' },
      format: 'pdf',
      bytes: 274_432,
      extractedText:
        'Ata número onze. Regulamento apoio Juntas de Freguesia consulta pública. Plano de trânsito centro da vila. Risco de incêndio despacho. Rua da Corredoura.',
    },
  },
  {
    id: 'm-2026-06-01',
    slug: 'reuniao-ordinaria-01-06-2026',
    body: 'camara',
    kind: 'ordinaria',
    date: '2026-06-01',
    isPublic: false,
    agenda: [
      'Aprovação da ata da reunião anterior',
      'Programa da Festa da Cereja&co 2026',
      'Apoio à instalação de redes anti-chuva em cerejais',
      'Contrato-programa com a Associação Desportiva',
    ],
    decisions: [
      {
        title: 'Apoio à instalação de redes anti-chuva, até 40 % do investimento',
        outcome: 'aprovado',
        votes: 'Aprovado por unanimidade',
      },
    ],
    minutes: {
      href: '/documentos/ata-10-2026.pdf',
      label: { pt: 'Ata n.º 10/2026', en: 'Minutes no. 10/2026' },
      format: 'pdf',
      bytes: 256_000,
      extractedText:
        'Ata número dez. Festa da Cereja programa. Redes anti-chuva cerejais apoio quarenta por cento. Contrato-programa associação desportiva.',
    },
  },
  {
    id: 'm-2026-05-18',
    slug: 'reuniao-ordinaria-18-05-2026',
    body: 'camara',
    kind: 'ordinaria',
    date: '2026-05-18',
    isPublic: true,
    agenda: [
      'Aprovação da ata da reunião anterior',
      'Instalação de 24 novos ecopontos',
      'Protocolo de teleassistência para pessoas idosas',
      'Período de intervenção do público',
    ],
    decisions: [
      { title: 'Aquisição e instalação de 24 ecopontos', outcome: 'aprovado', votes: 'Aprovado por unanimidade' },
      {
        title: 'Alargamento do programa de teleassistência a mais 40 utentes',
        outcome: 'aprovado',
        votes: 'Aprovado por unanimidade',
      },
    ],
    minutes: {
      href: '/documentos/ata-09-2026.pdf',
      label: { pt: 'Ata n.º 09/2026', en: 'Minutes no. 09/2026' },
      format: 'pdf',
      bytes: 243_712,
      extractedText:
        'Ata número nove. Ecopontos recolha seletiva. Teleassistência pessoas idosas protocolo. Intervenção do público.',
    },
  },
  {
    id: 'm-2026-04-27',
    slug: 'reuniao-extraordinaria-27-04-2026',
    body: 'camara',
    kind: 'extraordinaria',
    date: '2026-04-27',
    isPublic: false,
    agenda: ['Prestação de contas do exercício de 2025', 'Aplicação do resultado líquido do exercício'],
    decisions: [
      {
        title: 'Aprovação da prestação de contas de 2025',
        outcome: 'aprovado',
        votes: 'Aprovado por maioria, com dois votos contra',
      },
    ],
    minutes: {
      href: '/documentos/ata-08-2026.pdf',
      label: { pt: 'Ata n.º 08/2026', en: 'Minutes no. 08/2026' },
      format: 'pdf',
      bytes: 198_656,
      extractedText:
        'Ata número oito reunião extraordinária prestação de contas exercício de dois mil e vinte e cinco. Resultado líquido. Balanço. Demonstração de resultados.',
    },
  },
  {
    id: 'm-am-2026-06-30',
    slug: 'assembleia-municipal-30-06-2026',
    body: 'assembleia',
    kind: 'ordinaria',
    date: '2026-06-30',
    isPublic: true,
    agenda: [
      'Período antes da ordem do dia',
      'Apreciação da informação escrita do Presidente da Câmara',
      'Prestação de contas de 2025',
      'Primeira revisão ao orçamento de 2026',
    ],
    decisions: [
      {
        title: 'Prestação de contas de 2025',
        outcome: 'aprovado',
        votes: 'Aprovado por maioria',
      },
      { title: 'Primeira revisão ao orçamento de 2026', outcome: 'aprovado', votes: 'Aprovado por maioria' },
    ],
    minutes: {
      href: '/documentos/ata-am-02-2026.pdf',
      label: { pt: 'Ata da Assembleia n.º 02/2026', en: 'Assembly minutes no. 02/2026' },
      format: 'pdf',
      bytes: 331_776,
      extractedText:
        'Ata da sessão ordinária da Assembleia Municipal de Alfândega da Fé. Informação escrita do Presidente da Câmara. Prestação de contas. Revisão orçamental.',
    },
  },
  {
    id: 'm-am-2026-04-30',
    slug: 'assembleia-municipal-30-04-2026',
    body: 'assembleia',
    kind: 'ordinaria',
    date: '2026-04-30',
    isPublic: true,
    agenda: [
      'Período antes da ordem do dia',
      'Regulamento do Orçamento Participativo',
      'Autorização para contratação de empréstimo de médio e longo prazo',
    ],
    decisions: [
      { title: 'Regulamento do Orçamento Participativo', outcome: 'aprovado', votes: 'Aprovado por unanimidade' },
      {
        title: 'Autorização para contratação de empréstimo',
        outcome: 'rejeitado',
        votes: 'Rejeitado por maioria',
      },
    ],
    minutes: {
      href: '/documentos/ata-am-01-2026.pdf',
      label: { pt: 'Ata da Assembleia n.º 01/2026', en: 'Assembly minutes no. 01/2026' },
      format: 'pdf',
      bytes: 307_200,
      extractedText:
        'Ata da Assembleia Municipal. Regulamento do orçamento participativo. Empréstimo de médio e longo prazo rejeitado.',
    },
  },
];

export function findMeeting(slug: string): Meeting | undefined {
  return meetings.find((meeting) => meeting.slug === slug);
}

export const latestMeeting = [...meetings]
  .filter((meeting) => meeting.body === 'camara')
  .sort((a, b) => b.date.localeCompare(a.date))[0];
