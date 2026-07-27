import type { CollectionConfig } from '../types';

/**
 * Coleções do CMS.
 *
 * Cada coleção corresponde a um tipo em `src/content/types.ts`. Os rótulos e as
 * ajudas estão em português, porque quem edita é a equipa de comunicação do
 * Município, não uma equipa técnica.
 *
 * Regra seguida em todos os campos de texto visível: `localized: true` apenas
 * onde faz sentido traduzir. O corpo de uma notícia local é `localized`, mas o
 * nome de uma freguesia não — «Sambade» é Sambade em qualquer língua.
 */

const publishedAt = {
  name: 'publishedAt',
  type: 'date' as const,
  label: 'Data de publicação',
  required: true,
  admin: { position: 'sidebar' as const },
};

export const Alerts: CollectionConfig = {
  slug: 'alertas',
  labels: { singular: 'Alerta', plural: 'Alertas' },
  admin: {
    useAsTitle: 'title',
    group: 'Comunicação',
    description:
      'Barra no topo de todas as páginas. Use só para o que é mesmo urgente: proteção civil, cortes de água, risco de incêndio, estradas cortadas.',
  },
  fields: [
    { name: 'title', type: 'text', label: 'Mensagem', required: true, localized: true },
    {
      name: 'severity',
      type: 'select',
      label: 'Gravidade',
      required: true,
      options: [
        { label: 'Informação (azul)', value: 'info' },
        { label: 'Aviso (laranja)', value: 'warning' },
        { label: 'Alerta (vermelho, não se pode dispensar)', value: 'danger' },
      ],
    },
    { name: 'href', type: 'text', label: 'Ligação para detalhes' },
    { name: 'startsAt', type: 'date', label: 'Mostrar a partir de', required: true },
    {
      name: 'endsAt',
      type: 'date',
      label: 'Deixar de mostrar em',
      required: true,
      admin: { description: 'Obrigatório. Evita que um aviso fique meses no ar.' },
    },
  ],
};

export const News: CollectionConfig = {
  slug: 'noticias',
  labels: { singular: 'Notícia', plural: 'Notícias' },
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'category', 'publishedAt'], group: 'Comunicação' },
  versions: { drafts: true },
  fields: [
    { name: 'title', type: 'text', label: 'Título', required: true, localized: true },
    {
      name: 'slug',
      type: 'text',
      label: 'Endereço (slug)',
      required: true,
      unique: true,
      admin: { description: 'Sem acentos e sem espaços. Depois de publicado, não mude.' },
    },
    publishedAt,
    {
      name: 'category',
      type: 'select',
      label: 'Rubrica',
      required: true,
      options: [
        'Município',
        'Cultura',
        'Ação Social',
        'Ambiente',
        'Educação',
        'Economia',
        'Desporto',
        'Obras',
        'Saúde',
      ].map((value) => ({ label: value, value })),
    },
    {
      name: 'summary',
      type: 'textarea',
      label: 'Resumo',
      required: true,
      localized: true,
      admin: {
        description:
          'Uma ou duas frases completas. Aparece nas listagens e nas partilhas — não é o início do texto cortado.',
      },
    },
    { name: 'body', type: 'richText', label: 'Texto', required: true, localized: true },
    { name: 'image', type: 'upload', relationTo: 'media', label: 'Imagem' },
    { name: 'tags', type: 'text', label: 'Etiquetas', hasMany: true } as never,
    {
      name: 'archive',
      type: 'select',
      label: 'Arquivo',
      options: [{ label: 'COVID-19', value: 'covid-19' }],
      admin: { description: 'Marca a notícia como histórica. Sai das listagens correntes.' },
    },
  ],
};

export const Events: CollectionConfig = {
  slug: 'eventos',
  labels: { singular: 'Evento', plural: 'Eventos' },
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'startDate', 'location'], group: 'Comunicação' },
  versions: { drafts: true },
  fields: [
    { name: 'title', type: 'text', label: 'Título', required: true, localized: true },
    { name: 'slug', type: 'text', label: 'Endereço (slug)', required: true, unique: true },
    { name: 'summary', type: 'textarea', label: 'Resumo', required: true, localized: true },
    { name: 'description', type: 'richText', label: 'Descrição', localized: true },
    {
      name: 'category',
      type: 'select',
      label: 'Categoria',
      required: true,
      options: ['Cultura', 'Feira', 'Desporto', 'Sessão pública', 'Infantil', 'Formação', 'Música'].map(
        (value) => ({ label: value, value }),
      ),
    },
    { name: 'startDate', type: 'date', label: 'Data de início', required: true },
    { name: 'endDate', type: 'date', label: 'Data de fim' },
    {
      name: 'startTime',
      type: 'text',
      label: 'Hora de início',
      admin: { placeholder: '21:30', description: 'Formato 24 horas. Em branco = todo o dia.' },
    },
    { name: 'endTime', type: 'text', label: 'Hora de fim', admin: { placeholder: '23:00' } },
    { name: 'location', type: 'text', label: 'Local', required: true },
    { name: 'freguesia', type: 'relationship', relationTo: 'freguesias', label: 'Freguesia' },
    { name: 'organiser', type: 'text', label: 'Organização' },
    { name: 'price', type: 'text', label: 'Entrada', localized: true },
    { name: 'geo', type: 'point', label: 'Coordenadas' },
    { name: 'image', type: 'upload', relationTo: 'media', label: 'Imagem' },
  ],
};

export const Services: CollectionConfig = {
  slug: 'servicos',
  labels: { singular: 'Serviço', plural: 'Serviços' },
  admin: {
    useAsTitle: 'title',
    group: 'Serviços',
    description:
      'Cada serviço responde sempre às mesmas perguntas: para quem, o que trazer, quanto tempo demora, quanto custa e como se faz.',
  },
  versions: { drafts: true },
  fields: [
    { name: 'title', type: 'text', label: 'Nome do serviço', required: true, localized: true },
    { name: 'slug', type: 'text', label: 'Endereço (slug)', required: true, unique: true },
    {
      name: 'area',
      type: 'select',
      label: 'Área',
      required: true,
      options: [
        { label: 'Balcão e certidões', value: 'balcao' },
        { label: 'Urbanismo e obras', value: 'urbanismo' },
        { label: 'Água, saneamento e resíduos', value: 'agua-e-residuos' },
        { label: 'Taxas e licenças', value: 'taxas-e-licencas' },
        { label: 'Ação social', value: 'acao-social' },
        { label: 'Educação', value: 'educacao' },
        { label: 'Saúde e animais', value: 'saude' },
        { label: 'Apoios e candidaturas', value: 'apoios' },
      ],
    },
    {
      name: 'summary',
      type: 'textarea',
      label: 'Numa frase',
      required: true,
      localized: true,
      admin: { description: 'O que a pessoa consegue fazer aqui. Sem linguagem de despacho.' },
    },
    {
      name: 'channels',
      type: 'select',
      label: 'Canais',
      required: true,
      hasMany: true,
      options: [
        { label: 'Online', value: 'online' },
        { label: 'Presencial', value: 'presencial' },
        { label: 'Correio', value: 'correio' },
        { label: 'Telefone', value: 'telefone' },
      ],
    },
    { name: 'onlineUrl', type: 'text', label: 'Endereço do serviço online' },
    { name: 'audience', type: 'textarea', label: 'A quem se destina', required: true, localized: true },
    { name: 'processingTime', type: 'text', label: 'Prazo de resposta', required: true, localized: true },
    {
      name: 'fee',
      type: 'text',
      label: 'Custo',
      required: true,
      localized: true,
      admin: { description: '«Gratuito» é uma resposta válida — mas tem de estar escrita.' },
    },
    {
      name: 'requiredDocuments',
      type: 'array',
      label: 'Documentos necessários',
      required: true,
      fields: [{ name: 'item', type: 'text', label: 'Documento', required: true, localized: true }],
    },
    {
      name: 'steps',
      type: 'array',
      label: 'Passos',
      required: true,
      fields: [
        { name: 'title', type: 'text', label: 'Passo', required: true, localized: true },
        { name: 'detail', type: 'textarea', label: 'Explicação', required: true, localized: true },
      ],
    },
    {
      name: 'legislation',
      type: 'array',
      label: 'Enquadramento legal',
      fields: [{ name: 'item', type: 'text', label: 'Diploma', required: true, localized: true }],
    },
    { name: 'department', type: 'text', label: 'Serviço responsável', required: true },
    { name: 'forms', type: 'relationship', relationTo: 'documentos', label: 'Formulários', hasMany: true },
    { name: 'relatedServices', type: 'relationship', relationTo: 'servicos', label: 'Serviços relacionados', hasMany: true },
    { name: 'icon', type: 'text', label: 'Símbolo', required: true, admin: { description: 'Nome do símbolo. Ver /styleguide.' } },
    { name: 'featured', type: 'checkbox', label: 'Destacar na página inicial' },
  ],
};

export const Documents: CollectionConfig = {
  slug: 'documentos',
  labels: { singular: 'Documento', plural: 'Documentos' },
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'type', 'year'], group: 'Serviços' },
  fields: [
    { name: 'title', type: 'text', label: 'Título', required: true, localized: true },
    { name: 'slug', type: 'text', label: 'Endereço (slug)', required: true, unique: true },
    {
      name: 'type',
      type: 'select',
      label: 'Tipo',
      required: true,
      options: [
        { label: 'Formulário', value: 'formulario' },
        { label: 'Regulamento', value: 'regulamento' },
        { label: 'Edital', value: 'edital' },
        { label: 'Ata', value: 'ata' },
        { label: 'Relatório', value: 'relatorio' },
        { label: 'Plano', value: 'plano' },
        { label: 'Aviso', value: 'aviso' },
        { label: 'Dados abertos', value: 'dados' },
      ],
    },
    { name: 'summary', type: 'textarea', label: 'Resumo', localized: true },
    { name: 'year', type: 'number', label: 'Ano', required: true },
    publishedAt,
    { name: 'file', type: 'upload', relationTo: 'media', label: 'Ficheiro', required: true },
    {
      name: 'extractedText',
      type: 'textarea',
      label: 'Texto extraído',
      admin: {
        readOnly: true,
        description:
          'Preenchido automaticamente a partir do PDF. Alimenta a pesquisa dentro dos documentos.',
      },
    },
    {
      name: 'onlinePath',
      type: 'text',
      label: 'Caminho para tratar online',
      admin: { description: 'Se o assunto também se resolve online, indique aqui o endereço.' },
    },
  ],
};

export const Consultations: CollectionConfig = {
  slug: 'consultas-publicas',
  labels: { singular: 'Consulta pública', plural: 'Consultas públicas' },
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'startsAt', 'endsAt'], group: 'Transparência' },
  fields: [
    { name: 'title', type: 'text', label: 'Título', required: true, localized: true },
    { name: 'slug', type: 'text', label: 'Endereço (slug)', required: true, unique: true },
    { name: 'summary', type: 'textarea', label: 'Resumo', required: true, localized: true },
    { name: 'body', type: 'richText', label: 'Texto', localized: true },
    { name: 'startsAt', type: 'date', label: 'Início do prazo', required: true },
    { name: 'endsAt', type: 'date', label: 'Fim do prazo', required: true },
    { name: 'area', type: 'text', label: 'Área', required: true },
    {
      name: 'howTo',
      type: 'array',
      label: 'Como participar',
      required: true,
      fields: [{ name: 'item', type: 'text', label: 'Forma', required: true, localized: true }],
    },
    { name: 'documents', type: 'relationship', relationTo: 'documentos', label: 'Documentos', hasMany: true },
    { name: 'contactEmail', type: 'email', label: 'Endereço para contributos', required: true },
  ],
};

export const Freguesias: CollectionConfig = {
  slug: 'freguesias',
  labels: { singular: 'Freguesia', plural: 'Freguesias' },
  admin: { useAsTitle: 'name', group: 'Município' },
  fields: [
    { name: 'name', type: 'text', label: 'Nome', required: true },
    { name: 'slug', type: 'text', label: 'Endereço (slug)', required: true, unique: true },
    { name: 'seat', type: 'text', label: 'Sede', required: true },
    { name: 'president', type: 'text', label: 'Presidente da Junta', required: true },
    { name: 'phone', type: 'text', label: 'Telefone' },
    { name: 'email', type: 'email', label: 'Correio eletrónico' },
    { name: 'area', type: 'number', label: 'Área (km²)', required: true },
    { name: 'population', type: 'number', label: 'População', required: true },
    {
      name: 'villages',
      type: 'array',
      label: 'Lugares',
      fields: [{ name: 'name', type: 'text', label: 'Lugar', required: true }],
    },
    { name: 'geo', type: 'point', label: 'Coordenadas', required: true },
    { name: 'description', type: 'textarea', label: 'Descrição', required: true, localized: true },
  ],
};

export const People: CollectionConfig = {
  slug: 'pessoas',
  labels: { singular: 'Pessoa', plural: 'Pessoas' },
  admin: { useAsTitle: 'name', group: 'Município' },
  fields: [
    { name: 'name', type: 'text', label: 'Nome', required: true },
    { name: 'role', type: 'text', label: 'Cargo', required: true, localized: true },
    {
      name: 'body',
      type: 'select',
      label: 'Órgão',
      required: true,
      options: [
        { label: 'Executivo Municipal', value: 'executivo' },
        { label: 'Assembleia Municipal', value: 'assembleia' },
      ],
    },
    {
      name: 'portfolio',
      type: 'array',
      label: 'Pelouros',
      fields: [{ name: 'item', type: 'text', label: 'Pelouro', required: true, localized: true }],
    },
    { name: 'email', type: 'email', label: 'Correio eletrónico' },
  ],
};

export const Meetings: CollectionConfig = {
  slug: 'reunioes',
  labels: { singular: 'Reunião', plural: 'Reuniões' },
  admin: { useAsTitle: 'slug', defaultColumns: ['date', 'body', 'kind'], group: 'Transparência' },
  fields: [
    { name: 'slug', type: 'text', label: 'Endereço (slug)', required: true, unique: true },
    { name: 'date', type: 'date', label: 'Data', required: true },
    {
      name: 'body',
      type: 'select',
      label: 'Órgão',
      required: true,
      options: [
        { label: 'Câmara Municipal', value: 'camara' },
        { label: 'Assembleia Municipal', value: 'assembleia' },
      ],
    },
    {
      name: 'kind',
      type: 'select',
      label: 'Tipo',
      required: true,
      options: [
        { label: 'Ordinária', value: 'ordinaria' },
        { label: 'Extraordinária', value: 'extraordinaria' },
      ],
    },
    { name: 'isPublic', type: 'checkbox', label: 'Pública' },
    {
      name: 'agenda',
      type: 'array',
      label: 'Ordem do dia',
      required: true,
      admin: { description: 'Um ponto por linha. É este texto que a pesquisa percorre.' },
      fields: [{ name: 'item', type: 'text', label: 'Ponto', required: true }],
    },
    {
      name: 'decisions',
      type: 'array',
      label: 'Deliberações',
      fields: [
        { name: 'title', type: 'text', label: 'Deliberação', required: true },
        {
          name: 'outcome',
          type: 'select',
          label: 'Resultado',
          required: true,
          options: [
            { label: 'Aprovado', value: 'aprovado' },
            { label: 'Rejeitado', value: 'rejeitado' },
            { label: 'Retirado', value: 'retirado' },
          ],
        },
        { name: 'votes', type: 'text', label: 'Votação' },
      ],
    },
    { name: 'agendaFile', type: 'upload', relationTo: 'media', label: 'Ordem do dia (ficheiro)' },
    { name: 'minutes', type: 'upload', relationTo: 'media', label: 'Ata' },
    { name: 'livestreamUrl', type: 'text', label: 'Transmissão' },
  ],
};

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Ficheiro', plural: 'Ficheiros' },
  admin: { useAsTitle: 'alt', group: 'Comunicação' },
  fields: [
    {
      name: 'alt',
      type: 'text',
      label: 'Texto alternativo',
      required: true,
      localized: true,
      admin: {
        description:
          'Descreva o que se vê, para quem não vê. Se a imagem for apenas decorativa, escreva um espaço.',
      },
    },
    { name: 'credit', type: 'text', label: 'Créditos' },
  ],
};

export const collections: CollectionConfig[] = [
  Alerts,
  News,
  Events,
  Services,
  Documents,
  Consultations,
  Freguesias,
  People,
  Meetings,
  Media,
];
