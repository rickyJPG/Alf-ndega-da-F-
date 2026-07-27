import type { DocumentItem } from '../types';

/**
 * Catálogo de formulários e documentos.
 *
 * O campo `extractedText` alimenta a pesquisa em texto integral: procura-se
 * também dentro dos PDF e não só nos títulos. Ao ligar um CMS, um passo de
 * extração (pdftotext ou equivalente) preenche este campo no carregamento.
 */
export const documents: DocumentItem[] = [
  {
    id: 'd-form-contrato-agua',
    slug: 'requerimento-contrato-de-agua',
    type: 'formulario',
    area: 'agua-e-residuos',
    year: 2026,
    publishedAt: '2026-01-15',
    lifeEvents: ['mudar-de-casa'],
    onlinePath: '/servicos/agua-e-residuos/contrato-de-agua',
    title: {
      pt: 'Contrato de fornecimento de água',
      en: 'Water supply contract',
      es: 'Contrato de suministro de agua',
      fr: 'Contrat de fourniture d’eau',
    },
    summary: {
      pt: 'Para pôr a água em seu nome quando muda de casa.',
      en: 'To put the water in your name when you move house.',
    },
    file: {
      href: '/documentos/requerimento-contrato-agua.pdf',
      label: { pt: 'Requerimento de contrato de água', en: 'Water contract application' },
      format: 'pdf',
      bytes: 143_360,
      extractedText:
        'Requerimento contrato de fornecimento de água município de Alfândega da Fé. Nome, NIF, morada de instalação, leitura do contador, IBAN para débito direto, caução.',
    },
  },
  {
    id: 'd-form-certidao',
    slug: 'requerimento-de-certidao',
    type: 'formulario',
    area: 'urbanismo',
    year: 2026,
    publishedAt: '2026-01-15',
    lifeEvents: ['construir-ou-remodelar', 'mudar-de-casa'],
    onlinePath: '/servicos/balcao/certidoes',
    title: {
      pt: 'Pedido de certidão',
      en: 'Certificate request',
      es: 'Solicitud de certificado',
      fr: 'Demande de certificat',
    },
    summary: {
      pt: 'Certidão de teor, de localização, de destaque ou de compropriedade.',
      en: 'Certificate of content, location, plot division or co-ownership.',
    },
    file: {
      href: '/documentos/requerimento-certidao.pdf',
      label: { pt: 'Pedido de certidão', en: 'Certificate request' },
      format: 'pdf',
      bytes: 118_784,
      extractedText:
        'Pedido de certidão. Certidão de teor. Certidão de localização. Certidão de destaque de parcela. Certidão de compropriedade. Artigo matricial. Descrição predial. Finalidade.',
    },
  },
  {
    id: 'd-form-licenca-obra',
    slug: 'requerimento-licenca-de-obra',
    type: 'formulario',
    area: 'urbanismo',
    year: 2026,
    publishedAt: '2026-02-03',
    lifeEvents: ['construir-ou-remodelar'],
    onlinePath: '/servicos/urbanismo/licenca-de-construcao',
    title: {
      pt: 'Licenciamento de obra particular',
      en: 'Private building permit application',
      es: 'Licencia de obra particular',
      fr: 'Demande de permis de construire',
    },
    file: {
      href: '/documentos/requerimento-licenca-obra.pdf',
      label: { pt: 'Requerimento de licenciamento de obra', en: 'Building permit application' },
      format: 'pdf',
      bytes: 231_424,
      extractedText:
        'Requerimento licenciamento obra particular. Construção nova, ampliação, alteração, demolição. Projeto de arquitetura. Termo de responsabilidade. Levantamento topográfico. RJUE Decreto-Lei 555/99.',
    },
  },
  {
    id: 'd-form-apoio-social',
    slug: 'requerimento-apoio-social',
    type: 'formulario',
    area: 'acao-social',
    year: 2026,
    publishedAt: '2026-01-20',
    lifeEvents: ['apoio-social'],
    title: {
      pt: 'Pedido de apoio social',
      en: 'Social support application',
      es: 'Solicitud de ayuda social',
      fr: 'Demande d’aide sociale',
    },
    summary: {
      pt: 'Apoio ao arrendamento, medicamentos, obras em casa e tarifário social da água.',
      en: 'Rent, medicines, home repairs and the social water tariff.',
    },
    file: {
      href: '/documentos/requerimento-apoio-social.pdf',
      label: { pt: 'Pedido de apoio social', en: 'Social support application' },
      format: 'pdf',
      bytes: 176_128,
      extractedText:
        'Pedido de apoio social. Rendimento per capita do agregado familiar. Apoio ao arrendamento. Comparticipação em medicamentos. Obras de conservação em habitação própria. Tarifa social de água.',
    },
  },
  {
    id: 'd-form-ruido',
    slug: 'requerimento-licenca-especial-de-ruido',
    type: 'formulario',
    area: 'taxas-e-licencas',
    year: 2026,
    publishedAt: '2026-01-15',
    lifeEvents: ['abrir-negocio'],
    onlinePath: '/servicos/taxas-e-licencas/licenca-especial-de-ruido',
    title: {
      pt: 'Licença especial de ruído',
      en: 'Special noise permit',
      es: 'Licencia especial de ruido',
      fr: 'Autorisation spéciale de bruit',
    },
    file: {
      href: '/documentos/requerimento-ruido.pdf',
      label: { pt: 'Licença especial de ruído', en: 'Special noise permit' },
      format: 'pdf',
      bytes: 98_304,
      extractedText:
        'Requerimento licença especial de ruído. Festa, arraial, obra fora do período diurno, espetáculo ao ar livre. Data, hora de início e de fim. Regulamento Geral do Ruído.',
    },
  },
  {
    id: 'd-form-ocupacao-via',
    slug: 'requerimento-ocupacao-via-publica',
    type: 'formulario',
    area: 'taxas-e-licencas',
    year: 2026,
    publishedAt: '2026-01-15',
    lifeEvents: ['abrir-negocio', 'construir-ou-remodelar'],
    title: {
      pt: 'Ocupação da via pública',
      en: 'Occupation of public space',
      es: 'Ocupación de la vía pública',
      fr: 'Occupation de la voie publique',
    },
    file: {
      href: '/documentos/requerimento-ocupacao-via.pdf',
      label: { pt: 'Ocupação da via pública', en: 'Occupation of public space' },
      format: 'pdf',
      bytes: 106_496,
      extractedText:
        'Requerimento ocupação da via pública. Esplanada, andaime, tapume, contentor de obra, banca de venda. Área em metros quadrados. Período de ocupação.',
    },
  },
  {
    id: 'd-form-transporte-escolar',
    slug: 'requerimento-transporte-escolar',
    type: 'formulario',
    area: 'educacao',
    year: 2026,
    publishedAt: '2026-05-02',
    lifeEvents: ['estudar', 'ter-um-filho'],
    onlinePath: '/servicos/educacao/transporte-escolar',
    title: {
      pt: 'Transporte escolar',
      en: 'School transport',
      es: 'Transporte escolar',
      fr: 'Transport scolaire',
    },
    file: {
      href: '/documentos/requerimento-transporte-escolar.pdf',
      label: { pt: 'Pedido de transporte escolar', en: 'School transport application' },
      format: 'pdf',
      bytes: 87_040,
      extractedText:
        'Pedido de transporte escolar. Aluno, ano de escolaridade, estabelecimento de ensino, morada, distância à escola, passe.',
    },
  },
  {
    id: 'd-reg-taxas',
    slug: 'regulamento-de-taxas-e-licencas',
    type: 'regulamento',
    area: 'taxas-e-licencas',
    year: 2026,
    publishedAt: '2026-01-02',
    title: {
      pt: 'Regulamento Municipal de Taxas e Licenças',
      en: 'Municipal by-law on fees and licences',
      es: 'Reglamento Municipal de Tasas y Licencias',
      fr: 'Règlement municipal des taxes et licences',
    },
    summary: {
      pt: 'Todas as taxas cobradas pelo Município, com a tabela de valores em vigor.',
      en: 'Every fee charged by the Council, with the current schedule of amounts.',
    },
    file: {
      href: '/documentos/regulamento-taxas-licencas-2026.pdf',
      label: { pt: 'Regulamento de Taxas e Licenças 2026', en: 'Fees and Licences By-law 2026' },
      format: 'pdf',
      bytes: 1_363_148,
      extractedText:
        'Regulamento Municipal de Taxas e Licenças. Tabela de taxas. Certidões. Licenças de construção. Ocupação da via pública. Publicidade. Ruído. Mercados e feiras. Cemitérios. Canil. Isenções e reduções.',
    },
  },
  {
    id: 'd-reg-urbanizacao',
    slug: 'regulamento-de-urbanizacao-e-edificacao',
    type: 'regulamento',
    area: 'urbanismo',
    year: 2024,
    publishedAt: '2024-06-11',
    title: {
      pt: 'Regulamento Municipal de Urbanização e Edificação',
      en: 'Municipal by-law on urbanisation and building',
    },
    file: {
      href: '/documentos/rmue-2024.pdf',
      label: { pt: 'RMUE', en: 'Urbanisation and building by-law' },
      format: 'pdf',
      bytes: 2_097_152,
      extractedText:
        'Regulamento Municipal de Urbanização e Edificação. Instrução dos pedidos. Obras de escassa relevância urbanística. Ocupação da via pública por motivo de obras. Cedências. Compensações.',
    },
  },
  {
    id: 'd-reg-op',
    slug: 'regulamento-do-orcamento-participativo',
    type: 'regulamento',
    area: 'municipio',
    year: 2026,
    publishedAt: '2026-03-10',
    title: {
      pt: 'Regulamento do Orçamento Participativo',
      en: 'Participatory budget rules',
      es: 'Reglamento del Presupuesto Participativo',
      fr: 'Règlement du budget participatif',
    },
    file: {
      href: '/documentos/regulamento-op-2026.pdf',
      label: { pt: 'Regulamento do Orçamento Participativo', en: 'Participatory budget rules' },
      format: 'pdf',
      bytes: 419_430,
      extractedText:
        'Regulamento do Orçamento Participativo de Alfândega da Fé. Vertente geral, jovem e sénior. Limite de cinquenta mil euros por proposta. Idade mínima dezasseis anos. Votação presencial e online.',
    },
  },
  {
    id: 'd-plano-pdm',
    slug: 'plano-diretor-municipal',
    type: 'plano',
    area: 'urbanismo',
    year: 2023,
    publishedAt: '2023-09-28',
    onlinePath: '/servicos/urbanismo/consultar-o-pdm',
    title: {
      pt: 'Plano Diretor Municipal — regulamento',
      en: 'Municipal Master Plan — rules',
      es: 'Plan Director Municipal — reglamento',
      fr: 'Plan directeur municipal — règlement',
    },
    summary: {
      pt: 'O documento que define o que pode ser construído em cada classe de solo.',
      en: 'The document that sets what may be built on each class of land.',
    },
    file: {
      href: '/documentos/pdm-regulamento.pdf',
      label: { pt: 'Regulamento do PDM', en: 'Master plan rules' },
      format: 'pdf',
      bytes: 3_355_443,
      extractedText:
        'Plano Diretor Municipal de Alfândega da Fé. Regulamento. Solo urbano. Solo rústico. Espaços agrícolas. Espaços florestais. Espaços de atividades económicas. Reserva Agrícola Nacional. Reserva Ecológica Nacional. Índices de utilização. Cércea máxima.',
    },
  },
  {
    id: 'd-contas-2025',
    slug: 'prestacao-de-contas-2025',
    type: 'relatorio',
    area: 'transparencia',
    year: 2025,
    publishedAt: '2026-04-28',
    title: {
      pt: 'Prestação de contas de 2025',
      en: '2025 annual accounts',
      es: 'Rendición de cuentas de 2025',
      fr: 'Comptes de l’exercice 2025',
    },
    summary: {
      pt: 'Relatório de gestão, balanço e demonstração de resultados, aprovados pela Assembleia Municipal.',
      en: 'Management report, balance sheet and income statement, approved by the Municipal Assembly.',
    },
    file: {
      href: '/documentos/prestacao-contas-2025.pdf',
      label: { pt: 'Prestação de contas 2025', en: '2025 annual accounts' },
      format: 'pdf',
      bytes: 5_452_595,
      extractedText:
        'Prestação de contas do Município de Alfândega da Fé exercício de 2025. Relatório de gestão. Balanço. Demonstração de resultados. Execução orçamental da receita e da despesa. Dívida total. Endividamento. Fundos disponíveis.',
    },
  },
  {
    id: 'd-orcamento-2026',
    slug: 'orcamento-e-gop-2026',
    type: 'plano',
    area: 'transparencia',
    year: 2026,
    publishedAt: '2025-12-19',
    onlinePath: '/transparencia/orcamento',
    title: {
      pt: 'Orçamento e Grandes Opções do Plano 2026',
      en: '2026 budget and plan priorities',
      es: 'Presupuesto y grandes opciones del plan 2026',
      fr: 'Budget et grandes options du plan 2026',
    },
    file: {
      href: '/documentos/orcamento-2026.pdf',
      label: { pt: 'Orçamento 2026', en: '2026 budget' },
      format: 'pdf',
      bytes: 2_936_012,
      extractedText:
        'Orçamento do Município de Alfândega da Fé para 2026. Grandes Opções do Plano. Plano Plurianual de Investimentos. Receitas correntes e de capital. Despesas correntes e de capital. Funções gerais, sociais, económicas.',
    },
  },
  {
    id: 'd-dados-orcamento',
    slug: 'dados-abertos-orcamento-2026',
    type: 'dados',
    area: 'transparencia',
    year: 2026,
    publishedAt: '2026-01-08',
    title: {
      pt: 'Orçamento 2026 em formato aberto',
      en: '2026 budget in open format',
      es: 'Presupuesto 2026 en formato abierto',
      fr: 'Budget 2026 en format ouvert',
    },
    summary: {
      pt: 'A execução orçamental por rubrica, em CSV. Atualizada mensalmente.',
      en: 'Budget execution by line, in CSV. Updated monthly.',
    },
    file: {
      href: '/dados/orcamento-2026.csv',
      label: { pt: 'Orçamento 2026 (dados abertos)', en: '2026 budget (open data)' },
      format: 'csv',
      bytes: 48_128,
    },
  },
  {
    id: 'd-edital-transito',
    slug: 'edital-condicionamento-de-transito-feira',
    type: 'edital',
    area: 'municipio',
    year: 2026,
    publishedAt: '2026-07-10',
    title: {
      pt: 'Edital: condicionamento de trânsito para a feira anual',
      en: 'Notice: traffic restrictions for the annual fair',
    },
    file: {
      href: '/documentos/edital-transito-feira.pdf',
      label: { pt: 'Edital n.º 41/2026', en: 'Notice no. 41/2026' },
      format: 'pdf',
      bytes: 76_800,
      extractedText:
        'Edital condicionamento de trânsito feira anual de Sambade. Corte da estrada municipal. Percurso alternativo. Estacionamento proibido.',
    },
  },
  {
    id: 'd-edital-agua',
    slug: 'edital-interrupcao-do-abastecimento',
    type: 'edital',
    area: 'agua-e-residuos',
    year: 2026,
    publishedAt: '2026-07-08',
    title: {
      pt: 'Edital: interrupção do abastecimento de água em Vilarelhos',
      en: 'Notice: water supply interruption in Vilarelhos',
    },
    file: {
      href: '/documentos/edital-agua-vilarelhos.pdf',
      label: { pt: 'Edital n.º 39/2026', en: 'Notice no. 39/2026' },
      format: 'pdf',
      bytes: 71_680,
      extractedText:
        'Edital interrupção do abastecimento de água Vilarelhos substituição de conduta. Período previsto. Recomendações aos consumidores.',
    },
  },
  {
    id: 'd-aviso-op',
    slug: 'aviso-abertura-orcamento-participativo',
    type: 'aviso',
    area: 'municipio',
    year: 2026,
    publishedAt: '2026-04-20',
    onlinePath: '/viver-e-participar/orcamento-participativo',
    title: {
      pt: 'Aviso de abertura do Orçamento Participativo 2026',
      en: 'Notice opening the 2026 participatory budget',
    },
    file: {
      href: '/documentos/aviso-op-2026.pdf',
      label: { pt: 'Aviso de abertura', en: 'Opening notice' },
      format: 'pdf',
      bytes: 92_160,
      extractedText:
        'Aviso de abertura do Orçamento Participativo 2026. Dotação de cento e cinquenta mil euros. Prazo de apresentação de propostas. Sessões de esclarecimento nas freguesias.',
    },
  },
  {
    id: 'd-relatorio-agua',
    slug: 'relatorio-qualidade-da-agua-2025',
    type: 'relatorio',
    area: 'agua-e-residuos',
    year: 2025,
    publishedAt: '2026-03-14',
    title: {
      pt: 'Qualidade da água para consumo humano — 2025',
      en: 'Drinking water quality — 2025',
      es: 'Calidad del agua de consumo humano — 2025',
      fr: 'Qualité de l’eau potable — 2025',
    },
    summary: {
      pt: '99,4 % das análises em conformidade. Resultados por freguesia e por parâmetro.',
      en: '99.4% of samples compliant. Results by parish and by parameter.',
    },
    file: {
      href: '/documentos/qualidade-agua-2025.pdf',
      label: { pt: 'Relatório da qualidade da água 2025', en: '2025 water quality report' },
      format: 'pdf',
      bytes: 1_048_576,
      extractedText:
        'Relatório anual da qualidade da água para consumo humano. Controlo de rotina. Coliformes. Escherichia coli. Cloro residual livre. Nitratos. Percentagem de cumprimento. Zonas de abastecimento.',
    },
  },
  {
    id: 'd-plano-emergencia',
    slug: 'plano-municipal-de-emergencia',
    type: 'plano',
    area: 'municipio',
    year: 2024,
    publishedAt: '2024-11-05',
    title: {
      pt: 'Plano Municipal de Emergência de Proteção Civil',
      en: 'Municipal civil protection emergency plan',
    },
    file: {
      href: '/documentos/plano-emergencia.pdf',
      label: { pt: 'Plano Municipal de Emergência', en: 'Municipal emergency plan' },
      format: 'pdf',
      bytes: 4_194_304,
      extractedText:
        'Plano Municipal de Emergência de Proteção Civil de Alfândega da Fé. Riscos naturais. Incêndios rurais. Ondas de calor. Vagas de frio. Cheias. Zonas de concentração e apoio à população. Meios e recursos.',
    },
  },
  {
    id: 'd-dados-ocorrencias',
    slug: 'dados-abertos-ocorrencias',
    type: 'dados',
    area: 'transparencia',
    year: 2026,
    publishedAt: '2026-07-01',
    title: {
      pt: 'Ocorrências comunicadas pelos munícipes',
      en: 'Problems reported by residents',
    },
    summary: {
      pt: 'Categoria, freguesia, data e estado de cada ocorrência. Sem dados pessoais.',
      en: 'Category, parish, date and status of each report. No personal data.',
    },
    file: {
      href: '/dados/ocorrencias-2026.json',
      label: { pt: 'Ocorrências 2026 (JSON)', en: '2026 reports (JSON)' },
      format: 'json',
      bytes: 122_880,
    },
  },
];

export function findDocument(slug: string): DocumentItem | undefined {
  return documents.find((item) => item.slug === slug);
}

export const documentYears = [...new Set(documents.map((d) => d.year))].sort((a, b) => b - a);
