import type { Localized } from '../types';

/**
 * Redaktionelle Seiten.
 *
 * Alles, was keine eigene Collection braucht: Institutionelles, Tourismus,
 * Rechtliches. Aufgebaut aus Blöcken statt aus freiem HTML – dadurch bleiben
 * Überschriftenhierarchie, Textbreite und Abstände überall gleich, egal wer
 * die Seite pflegt.
 *
 * Im CMS entspricht das einem Feld vom Typ „Blocks“ auf der Collection
 * `Paginas`; die Blocktypen unten sind eins zu eins die verfügbaren Bausteine.
 */

export type PageBlock =
  | { type: 'prose'; heading?: Localized; paragraphs: Localized<string[]> }
  | { type: 'list'; heading: Localized; items: Localized<string[]>; icon?: string }
  | {
      type: 'links';
      heading: Localized;
      links: { href: string; label: Localized; text?: Localized; external?: boolean }[];
    }
  | { type: 'steps'; heading: Localized; steps: { title: Localized; detail: Localized }[] }
  | { type: 'people'; heading: Localized; body: 'executivo' | 'assembleia' }
  | { type: 'tenders'; heading: Localized }
  | { type: 'datasets'; heading: Localized }
  | { type: 'contact'; heading: Localized }
  | { type: 'sitemap'; heading: Localized }
  | { type: 'callout'; tone: 'info' | 'warning' | 'success'; heading: Localized; body: Localized };

export interface EditorialPage {
  /** Pfad ohne Sprachpräfix und ohne führenden Schrägstrich. */
  path: string;
  title: Localized;
  lead: Localized;
  /** Pfad des übergeordneten Eintrags für die Brotkrume. */
  parent?: { path: string; label: Localized };
  blocks: PageBlock[];
  updatedAt: string;
  tone?: 'default' | 'discover';
}

const pt = (value: string): Localized => ({ pt: value });
const ptList = (value: string[]): Localized<string[]> => ({ pt: value });

const MUNICIPIO = { path: 'municipio', label: pt('Município') };
const PARTICIPAR = { path: 'viver-e-participar', label: pt('Viver e Participar') };
const VISITAR = { path: 'visitar', label: pt('Visitar') };
const SERVICOS = { path: 'servicos', label: pt('Serviços') };
const TRANSPARENCIA = { path: 'transparencia', label: pt('Transparência') };

export const editorialPages: EditorialPage[] = [
  // ---------------------------------------------------------------- Município
  {
    path: 'municipio',
    title: { pt: 'Município', en: 'The Council', es: 'Municipio', fr: 'La commune' },
    lead: {
      pt: 'Quem decide, quem faz e como pode acompanhar o trabalho da autarquia.',
      en: 'Who decides, who does the work, and how to follow it.',
    },
    updatedAt: '2026-07-01',
    blocks: [
      {
        type: 'links',
        heading: pt('Órgãos e serviços'),
        links: [
          {
            href: '/municipio/executivo',
            label: pt('Executivo Municipal'),
            text: pt('O presidente, a vice-presidente e os três vereadores, com os pelouros de cada um.'),
          },
          {
            href: '/municipio/assembleia',
            label: pt('Assembleia Municipal'),
            text: pt('O órgão que fiscaliza e aprova as grandes decisões do Município.'),
          },
          {
            href: '/municipio/reunioes',
            label: pt('Reuniões e sessões'),
            text: pt('Ordens do dia, atas e deliberações, pesquisáveis por texto.'),
          },
          {
            href: '/municipio/organograma',
            label: pt('Organograma e serviços'),
            text: pt('Como está organizada a Câmara e o que faz cada divisão.'),
          },
          {
            href: '/municipio/freguesias',
            label: pt('Freguesias'),
            text: pt('As doze freguesias e uniões de freguesias do concelho.'),
          },
          {
            href: '/municipio/contactos',
            label: pt('Contactos'),
            text: pt('Morada, telefones, horário de atendimento e números de emergência.'),
          },
          {
            href: '/municipio/recrutamento',
            label: pt('Recrutamento'),
            text: pt('Procedimentos concursais a decorrer e como concorrer.'),
          },
          {
            href: '/municipio/contratacao-publica',
            label: pt('Contratação pública'),
            text: pt('Empreitadas, aquisições e concessões com prazo aberto.'),
          },
        ],
      },
      {
        type: 'prose',
        heading: pt('O concelho'),
        paragraphs: ptList([
          'Alfândega da Fé fica no distrito de Bragança, em Trás-os-Montes, entre o vale da Vilariça e as encostas do Sabor. São 320 quilómetros quadrados, doze freguesias e cerca de 4 500 habitantes.',
          'O foral é de 1294, atribuído por D. Dinis — daí o nome do largo onde ficam os Paços do Concelho. A terra é conhecida pela cereja, mas vive também do azeite, da amêndoa, da castanha e, mais recentemente, do turismo em torno dos lagos do Sabor.',
        ]),
      },
    ],
  },
  {
    path: 'municipio/executivo',
    title: pt('Executivo Municipal'),
    lead: pt('Os cinco membros eleitos que dirigem a Câmara Municipal e os pelouros de cada um.'),
    parent: MUNICIPIO,
    updatedAt: '2026-07-01',
    blocks: [
      { type: 'people', heading: pt('Composição'), body: 'executivo' },
      {
        type: 'prose',
        heading: pt('Como funciona'),
        paragraphs: ptList([
          'A Câmara Municipal reúne ordinariamente de quinze em quinze dias. Uma em cada duas reuniões é pública e tem, no final, um período de intervenção aberto a qualquer munícipe.',
          'Para intervir, basta inscrever-se junto do secretariado até ao início da reunião. Não é preciso marcação prévia nem enviar a questão por escrito.',
        ]),
      },
      {
        type: 'links',
        heading: pt('Acompanhar as decisões'),
        links: [
          { href: '/municipio/reunioes', label: pt('Reuniões de Câmara') },
          { href: '/transparencia/orcamento', label: pt('Orçamento e contas') },
        ],
      },
    ],
  },
  {
    path: 'municipio/assembleia',
    title: pt('Assembleia Municipal'),
    lead: pt('O órgão deliberativo do Município: aprova o orçamento, os regulamentos e fiscaliza a Câmara.'),
    parent: MUNICIPIO,
    updatedAt: '2026-07-01',
    blocks: [
      { type: 'people', heading: pt('Mesa da Assembleia'), body: 'assembleia' },
      {
        type: 'prose',
        heading: pt('Composição e sessões'),
        paragraphs: ptList([
          'A Assembleia Municipal é composta por membros eleitos diretamente e pelos presidentes das doze juntas de freguesia do concelho.',
          'Reúne em sessão ordinária cinco vezes por ano — em fevereiro, abril, junho, setembro e dezembro — e em sessão extraordinária sempre que necessário. Todas as sessões são públicas.',
          'A ordem do dia é publicada com pelo menos cinco dias de antecedência nesta página e no edital afixado nos Paços do Concelho.',
        ]),
      },
      {
        type: 'links',
        heading: pt('Documentos'),
        links: [
          { href: '/municipio/reunioes?tipo=assembleia', label: pt('Atas das sessões') },
          { href: '/documentos?tipo=regulamento', label: pt('Regulamentos aprovados') },
        ],
      },
    ],
  },
  {
    path: 'municipio/organograma',
    title: pt('Organograma e serviços'),
    lead: pt('Como está organizada a Câmara Municipal e a quem se dirigir em cada assunto.'),
    parent: MUNICIPIO,
    updatedAt: '2026-05-20',
    blocks: [
      {
        type: 'list',
        heading: pt('Divisões e unidades'),
        items: ptList([
          'Divisão Administrativa e de Recursos Humanos — expediente, atendimento, licenciamentos diversos e pessoal.',
          'Divisão Financeira — orçamento, contabilidade, tesouraria, património e aprovisionamento.',
          'Divisão de Urbanismo — licenciamento de obras, PDM, fiscalização e cadastro.',
          'Divisão de Obras Municipais — empreitadas, rede viária, edifícios e iluminação pública.',
          'Divisão de Águas e Saneamento — abastecimento, ETAR, contadores e faturação da água.',
          'Divisão de Ambiente — recolha de resíduos, espaços verdes, cemitérios e defesa da floresta.',
          'Divisão de Ação Social — apoios sociais, habitação, saúde e programa sénior.',
          'Divisão de Educação, Cultura e Desporto — escolas, biblioteca, equipamentos desportivos e programação cultural.',
          'Gabinete de Apoio ao Empreendedor — acompanhamento de investimentos e zona industrial.',
          'Serviço Municipal de Proteção Civil — planeamento de emergência e risco de incêndio.',
        ]),
      },
      { type: 'contact', heading: pt('Contactos diretos') },
    ],
  },
  {
    path: 'municipio/recrutamento',
    title: pt('Recrutamento'),
    lead: pt('Procedimentos concursais a decorrer no Município e como apresentar candidatura.'),
    parent: MUNICIPIO,
    updatedAt: '2026-07-20',
    blocks: [
      { type: 'tenders', heading: pt('Procedimentos a decorrer') },
      {
        type: 'steps',
        heading: pt('Como concorrer'),
        steps: [
          {
            title: pt('Leia o aviso de abertura'),
            detail: pt('Indica os requisitos, o método de seleção e o prazo. É o documento que manda.'),
          },
          {
            title: pt('Reúna os documentos'),
            detail: pt('Currículo, certificado de habilitações e os comprovativos exigidos no aviso.'),
          },
          {
            title: pt('Entregue dentro do prazo'),
            detail: pt('Na plataforma indicada, por correio registado ou presencialmente. Candidaturas fora de prazo não são aceites.'),
          },
        ],
      },
      {
        type: 'callout',
        tone: 'info',
        heading: pt('Igualdade no acesso'),
        body: pt(
          'O Município garante a igualdade de oportunidades no acesso ao emprego. Se precisar de adaptações no processo de seleção por motivo de deficiência, indique-o na candidatura — são asseguradas sem qualquer custo.',
        ),
      },
    ],
  },
  {
    path: 'municipio/contratacao-publica',
    title: pt('Contratação pública'),
    lead: pt('Empreitadas, aquisições e concessões com procedimento aberto.'),
    parent: MUNICIPIO,
    updatedAt: '2026-07-20',
    blocks: [
      { type: 'tenders', heading: pt('Procedimentos a decorrer') },
      {
        type: 'prose',
        heading: pt('Onde ficam os contratos celebrados'),
        paragraphs: ptList([
          'Todos os contratos celebrados pelo Município são publicados no Portal BASE (base.gov.pt), como exige o Código dos Contratos Públicos.',
          'Nesta página publicamos os procedimentos com prazo aberto, para que quem queira concorrer os encontre sem ter de procurar no Diário da República.',
        ]),
      },
      {
        type: 'links',
        heading: pt('Ligações úteis'),
        links: [
          { href: 'https://www.base.gov.pt', label: pt('Portal BASE — contratos públicos'), external: true },
          { href: 'https://dre.pt', label: pt('Diário da República'), external: true },
        ],
      },
    ],
  },

  // ------------------------------------------------------- Viver e Participar
  {
    path: 'viver-e-participar',
    title: { pt: 'Viver e Participar', en: 'Living here' },
    lead: pt('O que acontece no concelho e como pode ter uma palavra a dizer.'),
    updatedAt: '2026-07-01',
    blocks: [
      {
        type: 'links',
        heading: pt('Participar'),
        links: [
          {
            href: '/viver-e-participar/ocorrencias',
            label: pt('Comunicar ocorrência'),
            text: pt('Um buraco, um candeeiro apagado, lixo por recolher. Com foto e ponto no mapa.'),
          },
          {
            href: '/viver-e-participar/orcamento-participativo',
            label: pt('Orçamento Participativo'),
            text: pt('Proponha uma obra, vote nas propostas e acompanhe a execução.'),
          },
          {
            href: '/transparencia/consultas-publicas',
            label: pt('Consultas públicas'),
            text: pt('Dê a sua opinião antes de o Município decidir.'),
          },
        ],
      },
      {
        type: 'links',
        heading: pt('Comunidade'),
        links: [
          { href: '/eventos', label: pt('Agenda cultural'), text: pt('Concertos, feiras, exposições e sessões públicas.') },
          { href: '/noticias', label: pt('Notícias'), text: pt('O que está a acontecer no concelho.') },
          { href: '/viver-e-participar/associacoes', label: pt('Associações'), text: pt('O movimento associativo do concelho e como apoiamos.') },
          { href: '/viver-e-participar/desporto', label: pt('Desporto'), text: pt('Piscinas, pavilhão, campos e escolinhas.') },
          { href: '/viver-e-participar/juventude', label: pt('Juventude'), text: pt('Espaço jovem, bolsas de estudo e programas de férias.') },
          { href: '/viver-e-participar/protecao-civil', label: pt('Proteção civil'), text: pt('Risco de incêndio, avisos e o que fazer numa emergência.') },
        ],
      },
    ],
  },
  {
    path: 'viver-e-participar/associacoes',
    title: pt('Associações'),
    lead: pt('O movimento associativo é o que segura a vida cultural e desportiva do concelho.'),
    parent: PARTICIPAR,
    updatedAt: '2026-04-10',
    blocks: [
      {
        type: 'prose',
        paragraphs: ptList([
          'Estão registadas no Município cerca de quarenta associações — culturais, desportivas, recreativas, de caça e pesca, de bombeiros e de solidariedade social.',
          'O apoio municipal é atribuído anualmente segundo o Regulamento de Apoio ao Associativismo: uma parte fixa para funcionamento e uma parte variável por atividade realizada.',
        ]),
      },
      {
        type: 'steps',
        heading: pt('Pedir apoio para a sua associação'),
        steps: [
          {
            title: pt('Registe a associação'),
            detail: pt('Estatutos, ata de eleição dos órgãos e NIPC. Faz-se uma vez.'),
          },
          {
            title: pt('Apresente o plano de atividades'),
            detail: pt('Até 31 de outubro, para o ano seguinte. É o que serve de base ao apoio.'),
          },
          {
            title: pt('Preste contas'),
            detail: pt('Relatório e contas do ano anterior, até 31 de março. Sem isto, não há novo apoio.'),
          },
        ],
      },
      {
        type: 'links',
        heading: pt('Documentos'),
        links: [{ href: '/documentos?tipo=regulamento', label: pt('Regulamentos municipais') }],
      },
    ],
  },
  {
    path: 'viver-e-participar/desporto',
    title: pt('Desporto'),
    lead: pt('Onde praticar, quando está aberto e quanto custa.'),
    parent: PARTICIPAR,
    updatedAt: '2026-06-15',
    blocks: [
      {
        type: 'list',
        heading: pt('Equipamentos municipais'),
        items: ptList([
          'Piscinas Municipais — descoberta (junho a setembro) e coberta (todo o ano), com aulas de natação para todas as idades.',
          'Pavilhão Multiusos — futsal, basquetebol, voleibol e ginástica; cedido a associações mediante marcação.',
          'Estádio Municipal — relvado sintético, iluminação e balneários.',
          'Campos polidesportivos nas freguesias de Sambade, Vilarelhos, Cerejais e Parada.',
          'Circuito de manutenção no jardim municipal, de acesso livre.',
        ]),
      },
      {
        type: 'prose',
        heading: pt('Programas'),
        paragraphs: ptList([
          'O programa «Mexa-se» oferece atividade física orientada a maiores de 55 anos, duas vezes por semana, em oito freguesias. A participação é gratuita.',
          'As escolinhas de desporto funcionam de outubro a junho, para crianças do 1.º ciclo, em articulação com o agrupamento de escolas.',
        ]),
      },
    ],
  },
  {
    path: 'viver-e-participar/juventude',
    title: pt('Juventude'),
    lead: pt('Bolsas, espaços e programas para quem tem entre 12 e 30 anos.'),
    parent: PARTICIPAR,
    updatedAt: '2026-06-30',
    blocks: [
      {
        type: 'list',
        heading: pt('O que existe'),
        items: ptList([
          'Bolsas de estudo do ensino superior — candidaturas de setembro a outubro, atribuídas por rendimento e mérito.',
          'Espaço Internet — computadores, impressão e apoio, de segunda a sexta.',
          'Programa de férias «Verão Ativo» — atividades para os 12 aos 17 anos, em julho e agosto.',
          'Cartão Jovem Municipal — descontos nas piscinas, na biblioteca e no comércio aderente.',
          'Orçamento Participativo Jovem — 50 mil euros decididos por quem tem entre 16 e 30 anos.',
        ]),
      },
      {
        type: 'links',
        heading: pt('Candidaturas'),
        links: [
          { href: '/documentos?situacao=estudar', label: pt('Formulários de educação e juventude') },
          { href: '/viver-e-participar/orcamento-participativo', label: pt('Orçamento Participativo Jovem') },
        ],
      },
    ],
  },
  {
    path: 'viver-e-participar/protecao-civil',
    title: pt('Proteção civil'),
    lead: pt('Risco de incêndio, avisos em vigor e o que fazer numa emergência.'),
    parent: PARTICIPAR,
    updatedAt: '2026-07-24',
    blocks: [
      {
        type: 'callout',
        tone: 'warning',
        heading: pt('Em caso de emergência'),
        body: pt(
          'Ligue 112. Diga onde está — freguesia, lugar e um ponto de referência —, o que se passa e quantas pessoas estão em risco. Não desligue antes de lhe dizerem que pode.',
        ),
      },
      {
        type: 'list',
        heading: pt('Período crítico de incêndios (1 de julho a 30 de setembro)'),
        items: ptList([
          'É proibido fazer fogueiras, queimar sobrantes e lançar foguetes.',
          'Máquinas agrícolas e motorroçadoras só até às 11:00, e sempre com extintor por perto.',
          'Mantenha uma faixa de 50 metros limpa à volta de casa — é obrigatório e salva vidas.',
          'Com risco muito elevado ou máximo, o acesso a espaços florestais fica condicionado.',
        ]),
      },
      {
        type: 'prose',
        heading: pt('Se tiver de sair de casa'),
        paragraphs: ptList([
          'Leve documentos, medicação e telemóvel com carregador. Feche portas e janelas, mas não tranque o portão exterior — os meios de socorro podem precisar de entrar.',
          'As zonas de concentração e apoio à população estão identificadas no Plano Municipal de Emergência: pavilhão multiusos, escolas e sedes de junta de freguesia.',
        ]),
      },
      {
        type: 'links',
        heading: pt('Documentos e ligações'),
        links: [
          { href: '/documentos/plano-municipal-de-emergencia', label: pt('Plano Municipal de Emergência') },
          { href: 'https://www.ipma.pt', label: pt('IPMA — risco de incêndio e meteorologia'), external: true },
          { href: 'https://prociv.gov.pt', label: pt('Autoridade Nacional de Emergência e Proteção Civil'), external: true },
        ],
      },
    ],
  },

  // -------------------------------------------------------------------- Serviços
  {
    path: 'servicos/balcao-digital',
    title: pt('Área de Munícipe'),
    lead: pt('Um sítio para tratar dos seus assuntos e acompanhar os processos que já entregou.'),
    parent: SERVICOS,
    updatedAt: '2026-06-01',
    blocks: [
      {
        type: 'callout',
        tone: 'info',
        heading: pt('Entrada com Chave Móvel Digital'),
        body: pt(
          'A autenticação faz-se com a Chave Móvel Digital ou com o Cartão de Cidadão e leitor. O Município não guarda a sua palavra-passe — a validação é feita pelos serviços do Estado.',
        ),
      },
      {
        type: 'list',
        heading: pt('O que pode fazer na sua área'),
        items: ptList([
          'Consultar faturas de água e pagar por referência.',
          'Comunicar a leitura do contador.',
          'Seguir o estado dos processos de urbanismo que entregou.',
          'Pedir certidões e recebê-las em PDF assinado.',
          'Ver as marcações de atendimento e desmarcar, se precisar.',
          'Consultar as ocorrências que comunicou e a resposta dos serviços.',
        ]),
      },
      {
        type: 'prose',
        heading: pt('Se preferir não usar a Internet'),
        paragraphs: ptList([
          'Tudo o que está na Área de Munícipe também se faz ao balcão ou por telefone. Não há qualquer serviço que exista apenas online.',
          'Se quiser aprender a usar o portal, o Espaço Internet dá apoio individual, sem marcação, de segunda a sexta à tarde.',
        ]),
      },
    ],
  },
  {
    path: 'servicos/pagamentos',
    title: pt('Pagar taxas e água'),
    lead: pt('Todas as formas de pagar ao Município, com e sem Internet.'),
    parent: SERVICOS,
    updatedAt: '2026-06-01',
    blocks: [
      {
        type: 'list',
        heading: pt('Como pode pagar'),
        items: ptList([
          'Multibanco ou homebanking, com a referência que vem na fatura.',
          'MB WAY, para valores até 750 €.',
          'Débito direto — a forma mais simples de não se esquecer. Ativa-se ao balcão com o IBAN.',
          'Ao balcão da Tesouraria, em numerário ou com cartão, das 09:00 às 12:30 e das 14:00 às 17:00.',
          'Nos CTT, apresentando a fatura.',
        ]),
      },
      {
        type: 'callout',
        tone: 'warning',
        heading: pt('Dificuldade em pagar?'),
        body: pt(
          'Fale connosco antes de a dívida crescer. É possível pedir um plano de pagamento em prestações e, em situação de carência comprovada, o tarifário social da água. O atendimento é confidencial.',
        ),
      },
      {
        type: 'links',
        heading: pt('Serviços relacionados'),
        links: [
          { href: '/servicos/agua-e-residuos/pagar-a-agua', label: pt('Pagar a água') },
          { href: '/servicos/agua-e-residuos/comunicar-leitura', label: pt('Comunicar a leitura do contador') },
          { href: '/servicos/acao-social/apoio-social', label: pt('Pedir apoio social') },
        ],
      },
    ],
  },

  // ----------------------------------------------------------------- Transparência
  {
    path: 'transparencia/dados-abertos',
    title: pt('Dados abertos'),
    lead: pt('Dados do Município em formatos abertos, livres de usar, reutilizar e redistribuir.'),
    parent: TRANSPARENCIA,
    updatedAt: '2026-07-01',
    blocks: [
      { type: 'datasets', heading: pt('Conjuntos de dados') },
      {
        type: 'prose',
        heading: pt('Licença'),
        paragraphs: ptList([
          'Os dados publicados nesta página estão disponíveis sob a licença Creative Commons Atribuição 4.0 (CC BY 4.0). Pode usá-los para qualquer fim, incluindo comercial, desde que indique a origem.',
          'Atribuição sugerida: «Fonte: Município de Alfândega da Fé».',
        ]),
      },
      {
        type: 'prose',
        heading: pt('Falta algum conjunto de dados?'),
        paragraphs: ptList([
          'Escreva para dados@cm-alfandegadafe.pt a dizer que dados gostaria de ver publicados e para que fim. Publicamos sempre que seja tecnicamente possível e não haja dados pessoais envolvidos.',
        ]),
      },
    ],
  },
  {
    path: 'transparencia/denuncias',
    title: pt('Plataforma de denúncias'),
    lead: pt('Canal de comunicação interna de irregularidades, nos termos da Lei n.º 93/2021.'),
    parent: TRANSPARENCIA,
    updatedAt: '2026-02-10',
    blocks: [
      {
        type: 'prose',
        paragraphs: ptList([
          'Este canal destina-se a comunicar infrações ocorridas no âmbito da atividade do Município: contratação pública, conflitos de interesses, corrupção, ambiente, segurança de produtos ou proteção de dados, entre outras previstas na lei.',
          'Pode denunciar quem tenha tido conhecimento da infração em contexto profissional — trabalhadores, prestadores de serviços, candidatos a emprego, voluntários e estagiários.',
        ]),
      },
      {
        type: 'list',
        heading: pt('O que lhe é garantido'),
        items: ptList([
          'Confidencialidade da sua identidade. Só a pessoa responsável pelo canal tem acesso.',
          'Aviso de receção em sete dias.',
          'Resposta sobre as medidas tomadas no prazo de três meses.',
          'Proteção contra retaliação — despedimento, alteração de funções ou qualquer forma de prejuízo.',
        ]),
      },
      {
        type: 'steps',
        heading: pt('Como apresentar'),
        steps: [
          {
            title: pt('Por escrito'),
            detail: pt('Para denuncias@cm-alfandegadafe.pt, ou em envelope fechado dirigido ao responsável pelo canal de denúncias, nos Paços do Concelho.'),
          },
          {
            title: pt('Presencialmente'),
            detail: pt('Mediante marcação, com registo escrito ou gravação, sempre com o seu consentimento.'),
          },
          {
            title: pt('Se preferir um canal externo'),
            detail: pt('Pode dirigir-se diretamente ao Mecanismo Nacional Anticorrupção ou à autoridade setorial competente.'),
          },
        ],
      },
    ],
  },

  // -------------------------------------------------------------------- Visitar
  {
    path: 'visitar',
    title: { pt: 'Visitar', en: 'Visit', es: 'Visitar', fr: 'Visiter' },
    lead: pt('Terra de cereja, de azeite e de água parada onde antes corria um rio bravo.'),
    tone: 'discover',
    updatedAt: '2026-05-30',
    blocks: [
      {
        type: 'links',
        heading: pt('O que ver e fazer'),
        links: [
          { href: '/visitar/lagos-do-sabor', label: pt('Lagos do Sabor'), text: pt('Cilhades, Medal e Santuários: três lagos entre penhascos.') },
          { href: '/visitar/percursos-pedestres', label: pt('Percursos pedestres'), text: pt('Trilhos marcados, de meia hora a um dia inteiro.') },
          { href: '/visitar/patrimonio', label: pt('Património'), text: pt('O castelo, o santuário e as igrejas das aldeias.') },
          { href: '/visitar/produtos-locais', label: pt('Produtos locais'), text: pt('Cereja, azeite, castanha e amêndoa.') },
          { href: '/visitar/cereja-co', label: pt('Cereja&co'), text: pt('A marca que junta os produtores do concelho.') },
          { href: '/visitar/onde-dormir-e-comer', label: pt('Onde dormir e comer') },
          { href: '/visitar/festas-e-feiras', label: pt('Festas e feiras') },
          { href: '/visitar/investir', label: pt('Investir'), text: pt('Zona industrial e apoios a quem cria emprego.') },
        ],
      },
      {
        type: 'prose',
        heading: pt('Como chegar'),
        paragraphs: ptList([
          'De carro, pelo IP2 até Vila Flor e depois pela N215, ou pela A4 saindo em Macedo de Cavaleiros. De Bragança são cerca de 55 minutos; do Porto, duas horas e meia.',
          'De autocarro, há carreiras diárias de e para Bragança e Vila Real. O Posto de Turismo (279 462 739) informa sobre horários.',
        ]),
      },
    ],
  },
  {
    path: 'visitar/lagos-do-sabor',
    title: pt('Lagos do Sabor'),
    lead: pt('Com a barragem do Baixo Sabor, o rio deu lugar a um conjunto de lagos de águas serenas entre encostas de xisto.'),
    parent: VISITAR,
    tone: 'discover',
    updatedAt: '2026-05-30',
    blocks: [
      {
        type: 'prose',
        paragraphs: ptList([
          'São três lagos — Cilhades, Medal e Santuários — ligados entre si por gargantas estreitas. A água é fria e limpa, e as encostas em socalco descem quase a pique.',
          'O miradouro de Cilhades, na freguesia de Parada e Sendim da Ribeira, é o ponto mais fácil de alcançar e o que dá a vista mais ampla. Há estacionamento a duzentos metros.',
        ]),
      },
      {
        type: 'list',
        heading: pt('O que fazer'),
        items: ptList([
          'Passeios de barco, com marcação prévia junto dos operadores locais.',
          'Canoagem e stand-up paddle nos meses quentes.',
          'Observação de aves — há águia-real, bufo-real e cegonha-preta.',
          'Pesca desportiva, com licença.',
          'Os percursos pedestres que ligam os miradouros ao antigo leito do rio.',
        ]),
      },
      {
        type: 'callout',
        tone: 'warning',
        heading: pt('Segurança na água'),
        body: pt(
          'Os lagos não têm vigilância. As margens são de declive acentuado e a profundidade aumenta depressa. Não se banhe sozinho e mantenha as crianças sempre à vista.',
        ),
      },
    ],
  },
  {
    path: 'visitar/percursos-pedestres',
    title: pt('Percursos pedestres'),
    lead: pt('Trilhos marcados pelo concelho, do passeio curto à caminhada de um dia.'),
    parent: VISITAR,
    tone: 'discover',
    updatedAt: '2026-04-18',
    blocks: [
      {
        type: 'list',
        heading: pt('Percursos assinalados'),
        items: ptList([
          'PR1 — Trilho da Cereja: 7,5 km, circular, dificuldade baixa. Parte do centro da vila pelos cerejais.',
          'PR2 — Caminho do Santuário: 5 km, ida e volta, subida constante até Nossa Senhora da Assunção.',
          'PR3 — Sabor de Cilhades: 9 km, circular, dificuldade média. Miradouros sobre os lagos.',
          'PR4 — Vale da Vilariça: 12 km, linear, dificuldade média. Hortas, vinha e olival.',
          'PR5 — Rota dos Moinhos: 6 km, circular, dificuldade baixa. Moinhos de água recuperados.',
        ]),
      },
      {
        type: 'list',
        heading: pt('Antes de partir'),
        items: ptList([
          'Leve água — em muitos troços não há fonte durante horas.',
          'Calçado que segure o tornozelo. O piso é de xisto solto em várias descidas.',
          'Verifique o risco de incêndio: com risco muito elevado ou máximo, o acesso é proibido.',
          'A rede de telemóvel falha em partes dos vales. Diga a alguém por onde vai.',
        ]),
      },
      {
        type: 'links',
        heading: pt('Mais informação'),
        links: [{ href: '/municipio/contactos', label: pt('Posto de Turismo — mapas e folhetos') }],
      },
    ],
  },
  {
    path: 'visitar/patrimonio',
    title: pt('Património'),
    lead: pt('O que ficou de oito séculos de foral, entre o castelo e as capelas das aldeias.'),
    parent: VISITAR,
    tone: 'discover',
    updatedAt: '2026-03-12',
    blocks: [
      {
        type: 'list',
        heading: pt('A não perder'),
        items: ptList([
          'Ruínas do Castelo de Alfândega da Fé — do que resta da fortificação medieval, com vista sobre a vila.',
          'Igreja Matriz de Alfândega da Fé — talha dourada setecentista.',
          'Santuário de Nossa Senhora da Assunção, em Vilarelhos — romaria em agosto.',
          'Pelourinho de Sambade — símbolo do antigo poder concelhio.',
          'Sítio arqueológico de Cilhades — vestígios romanos hoje junto à água.',
          'Casa da Cultura Mestre José Rodrigues — escultura do artista natural do concelho.',
        ]),
      },
      {
        type: 'prose',
        heading: pt('Visitas'),
        paragraphs: ptList([
          'As igrejas das aldeias abrem sobretudo aos domingos de manhã e nas festas. Fora dessas horas, o Posto de Turismo ajuda a contactar quem guarda a chave — é assim que funciona por cá.',
        ]),
      },
    ],
  },
  {
    path: 'visitar/produtos-locais',
    title: pt('Produtos locais'),
    lead: pt('A cereja é a mais conhecida. O azeite, a castanha e a amêndoa merecem a mesma atenção.'),
    parent: VISITAR,
    tone: 'discover',
    updatedAt: '2026-06-20',
    blocks: [
      {
        type: 'prose',
        heading: pt('Cereja'),
        paragraphs: ptList([
          'Alfândega da Fé é o maior produtor nacional de cereja. A colheita vai de maio a julho, consoante a variedade e a altitude — as encostas mais baixas começam primeiro.',
          'A campanha de 2026 rendeu cerca de 2 900 toneladas. Compra-se diretamente aos produtores, nas cooperativas e no mercado de produtores, aos sábados de manhã.',
        ]),
      },
      {
        type: 'prose',
        heading: pt('Azeite, castanha e amêndoa'),
        paragraphs: ptList([
          'O olival ocupa boa parte do território e dá um azeite de acidez baixa e sabor intenso, típico de Trás-os-Montes. Os lagares moem entre novembro e janeiro.',
          'A castanha chega em outubro e a amêndoa em agosto. A amendoeira em flor, em fevereiro e março, é ela própria motivo de visita.',
        ]),
      },
      {
        type: 'links',
        heading: pt('Onde comprar'),
        links: [
          { href: '/eventos', label: pt('Mercado de produtores — aos sábados') },
          { href: '/visitar/cereja-co', label: pt('Cereja&co') },
        ],
      },
    ],
  },
  {
    path: 'visitar/cereja-co',
    title: pt('Cereja&co'),
    lead: pt('A marca que junta os produtores do concelho e a festa que enche a vila em junho.'),
    parent: VISITAR,
    tone: 'discover',
    updatedAt: '2026-06-10',
    blocks: [
      {
        type: 'prose',
        paragraphs: ptList([
          'Cereja&co nasceu para dar um nome comum ao que se produz em Alfândega da Fé: a cereja, primeiro, mas também o azeite, a castanha, a amêndoa, o mel e os doces.',
          'A Festa da Cereja&co realiza-se no primeiro fim de semana de junho. Em 2026 recebeu cerca de 18 mil visitantes, com 42 expositores, provas comentadas e concertos no largo.',
        ]),
      },
      {
        type: 'list',
        heading: pt('Aderir à marca'),
        items: ptList([
          'Ter atividade produtiva no concelho.',
          'Cumprir o caderno de especificações da marca.',
          'Aceitar as visitas de verificação, uma por ano.',
        ]),
      },
    ],
  },
  {
    path: 'visitar/onde-dormir-e-comer',
    title: pt('Onde dormir e comer'),
    lead: pt('Alojamento e restaurantes no concelho, para quem fica mais do que um dia.'),
    parent: VISITAR,
    tone: 'discover',
    updatedAt: '2026-05-05',
    blocks: [
      {
        type: 'prose',
        paragraphs: ptList([
          'O concelho tem alojamento local, turismo rural e um parque de campismo municipal, além de um hotel na vila. No total, cerca de 250 camas.',
          'A lista atualizada, com contactos e preços indicativos, é mantida pelo Posto de Turismo e enviada por email a pedido — assim não fica desatualizada nesta página.',
        ]),
      },
      {
        type: 'list',
        heading: pt('À mesa'),
        items: ptList([
          'Posta à transmontana, feita com carne mirandesa.',
          'Butelo com casulas, no inverno.',
          'Alheiras e enchidos fumados das aldeias.',
          'Bola doce e economias, na Páscoa.',
          'Cereja em tudo — de compota a licor.',
        ]),
      },
      { type: 'contact', heading: pt('Posto de Turismo') },
    ],
  },
  {
    path: 'visitar/festas-e-feiras',
    title: pt('Festas e feiras'),
    lead: pt('O calendário que se repete todos os anos, aldeia a aldeia.'),
    parent: VISITAR,
    tone: 'discover',
    updatedAt: '2026-05-05',
    blocks: [
      {
        type: 'list',
        heading: pt('Ao longo do ano'),
        items: ptList([
          'Fevereiro e março — Amendoeiras em Flor, com percursos guiados.',
          'Junho — Festa da Cereja&co, no primeiro fim de semana.',
          'Junho — Santos Populares nas freguesias.',
          'Agosto — Romaria de Nossa Senhora da Assunção, em Vilarelhos; festas de emigrantes em quase todas as aldeias.',
          'Setembro — Feira Anual de Sambade: gado, artesanato e baile.',
          'Novembro — Magusto e feira da castanha.',
          'Dezembro — Mercado de Natal no largo do Município.',
        ]),
      },
      {
        type: 'links',
        heading: pt('Datas exatas'),
        links: [{ href: '/eventos', label: pt('Agenda do Município') }],
      },
    ],
  },
  {
    path: 'visitar/investir',
    title: pt('Investir em Alfândega da Fé'),
    lead: pt('Zona industrial, apoios e um interlocutor único para quem quer instalar-se.'),
    parent: VISITAR,
    updatedAt: '2026-04-02',
    blocks: [
      {
        type: 'prose',
        heading: pt('Zona Industrial'),
        paragraphs: ptList([
          'A Zona Industrial de Alfândega da Fé fica à entrada da vila, junto à N215, com acesso direto para pesados. Tem lotes infraestruturados de 1 000 a 5 000 m², com água, saneamento, eletricidade e fibra ótica.',
          'O preço de venda dos lotes é fixado pela tabela municipal e pode ser reduzido, ou o lote cedido a título gratuito, em função dos postos de trabalho criados.',
        ]),
      },
      {
        type: 'list',
        heading: pt('Apoios do Município'),
        items: ptList([
          'Isenção total ou parcial de taxas de urbanização e de construção.',
          'Redução do preço do lote em função do emprego criado.',
          'Isenção de derrama nos primeiros três anos de atividade.',
          'Acompanhamento do processo de licenciamento por um técnico designado.',
        ]),
      },
      {
        type: 'links',
        heading: pt('Falar connosco'),
        links: [
          { href: '/servicos/apoios/apoios-a-empresas', label: pt('Apoios a quem cria emprego') },
          { href: '/servicos/marcacoes', label: pt('Marcar reunião com o Gabinete de Apoio ao Empreendedor') },
        ],
      },
    ],
  },
  {
    path: 'visitar/investir/apoios',
    title: pt('Apoios ao empreendedor'),
    lead: pt('O que o Município faz por quem abre ou expande um negócio no concelho.'),
    parent: { path: 'visitar/investir', label: pt('Investir') },
    updatedAt: '2026-04-02',
    blocks: [
      {
        type: 'steps',
        heading: pt('Do primeiro contacto à abertura'),
        steps: [
          {
            title: pt('Conversa inicial'),
            detail: pt('Sem compromisso e sem papéis. Serve para perceber o que precisa e o que existe.'),
          },
          {
            title: pt('Levantamento de apoios'),
            detail: pt('Municipais, do IEFP e dos programas comunitários. Dizemos a que se pode candidatar e quando abrem.'),
          },
          {
            title: pt('Candidatura e licenciamento'),
            detail: pt('Um técnico acompanha o processo do início ao fim, incluindo a articulação com outras entidades.'),
          },
          {
            title: pt('Depois de abrir'),
            detail: pt('Continuamos disponíveis para o que for preciso — não é um apoio que acaba na inauguração.'),
          },
        ],
      },
      { type: 'contact', heading: pt('Gabinete de Apoio ao Empreendedor') },
    ],
  },

  // ------------------------------------------------------------------ Legal
  {
    path: 'ficha-tecnica',
    title: pt('Ficha técnica'),
    lead: pt('Quem é responsável por este portal e como foi feito.'),
    updatedAt: '2026-07-25',
    blocks: [
      {
        type: 'prose',
        heading: pt('Propriedade e responsabilidade editorial'),
        paragraphs: ptList([
          'Este portal é propriedade do Município de Alfândega da Fé, pessoa coletiva n.º 506 811 663, com sede no Largo de D. Dinis, 5350-014 Alfândega da Fé.',
          'A responsabilidade editorial é do Gabinete de Comunicação do Município. As correções e sugestões devem ser dirigidas a municipio@cm-alfandegadafe.pt.',
        ]),
      },
      {
        type: 'list',
        heading: pt('Tecnologia'),
        items: ptList([
          'Next.js com React Server Components e TypeScript.',
          'Tailwind CSS, com os tokens de design do Município.',
          'Componentes acessíveis assentes em Radix UI.',
          'Tipografia Source Serif 4 e Inter, alojadas no próprio servidor.',
          'Cartografia da OpenStreetMap, através da biblioteca Leaflet.',
          'Medição de utilização cookieless, apenas com consentimento.',
        ]),
      },
      {
        type: 'prose',
        heading: pt('Direitos'),
        paragraphs: ptList([
          'Os conteúdos deste portal podem ser reutilizados com indicação da fonte, salvo indicação em contrário. As fotografias e os logótipos de terceiros pertencem aos respetivos titulares.',
          'Os dados publicados em Dados Abertos estão disponíveis sob licença CC BY 4.0.',
        ]),
      },
    ],
  },
  {
    path: 'privacidade',
    title: pt('Política de privacidade'),
    lead: pt('Que dados tratamos, para quê, com que fundamento e durante quanto tempo.'),
    updatedAt: '2026-07-25',
    blocks: [
      {
        type: 'prose',
        heading: pt('Responsável pelo tratamento'),
        paragraphs: ptList([
          'O responsável pelo tratamento dos dados é o Município de Alfândega da Fé, Largo de D. Dinis, 5350-014 Alfândega da Fé.',
          'O Encarregado de Proteção de Dados pode ser contactado em epd@cm-alfandegadafe.pt ou por carta dirigida à morada acima, com a menção «Encarregado de Proteção de Dados».',
        ]),
      },
      {
        type: 'list',
        heading: pt('Que dados tratamos e porquê'),
        items: ptList([
          'Pedidos e requerimentos: nome, contactos e o que for necessário ao processo. Fundamento: exercício de funções de interesse público. Conservação: prazo legal do procedimento.',
          'Marcações de atendimento: nome, telefone e email, para confirmar e lembrar. Conservação: 12 meses.',
          'Comunicação de ocorrências: descrição, localização e, se os der, os seus contactos. Conservação: 3 anos.',
          'Newsletter: endereço de email e temas escolhidos. Fundamento: o seu consentimento. Conservação: até cancelar.',
          'Medição de utilização: dados agregados e anónimos, sem identificação de pessoas. Fundamento: o seu consentimento.',
        ]),
      },
      {
        type: 'list',
        heading: pt('Os seus direitos'),
        items: ptList([
          'Aceder aos dados que temos sobre si.',
          'Corrigir dados errados ou incompletos.',
          'Pedir o apagamento, quando não haja obrigação legal de conservar.',
          'Opor-se ao tratamento ou pedir a sua limitação.',
          'Retirar o consentimento a qualquer momento, sem afetar o que foi feito antes.',
          'Apresentar reclamação à Comissão Nacional de Proteção de Dados (cnpd.pt).',
        ]),
      },
      {
        type: 'prose',
        heading: pt('Preferências de acessibilidade e tema'),
        paragraphs: ptList([
          'As definições de tamanho de letra, contraste e tema ficam guardadas apenas no seu equipamento (armazenamento local do navegador). Não são enviadas para o servidor nem permitem identificá-lo.',
        ]),
      },
      {
        type: 'prose',
        heading: pt('Registo das atividades de tratamento'),
        paragraphs: ptList([
          'O Município mantém um registo das atividades de tratamento, nos termos do artigo 30.º do RGPD. Pode ser consultado mediante pedido ao Encarregado de Proteção de Dados.',
        ]),
      },
    ],
  },
  {
    path: 'cookies',
    title: pt('Cookies'),
    lead: pt('Este portal usa o mínimo indispensável — e pede autorização para o resto.'),
    updatedAt: '2026-07-25',
    blocks: [
      {
        type: 'list',
        heading: pt('Cookies e armazenamento essenciais'),
        items: ptList([
          'cmadf_locale — guarda o idioma escolhido. Duração: 1 ano.',
          'cmadf:prefs — guarda as preferências de acessibilidade e tema. Fica no seu navegador, não é enviado ao servidor.',
          'cmadf:consent — guarda a sua decisão sobre a medição de utilização, para não voltarmos a perguntar.',
          'cmadf:alerts-dismissed — lembra que já dispensou um aviso, durante a sessão.',
        ]),
      },
      {
        type: 'prose',
        heading: pt('Medição de utilização'),
        paragraphs: ptList([
          'Se autorizar, usamos uma ferramenta de estatísticas alojada nos nossos próprios servidores, que não instala cookies, não regista o endereço IP completo e não cria perfis de utilizadores.',
          'Serve apenas para sabermos que páginas são mais procuradas e onde as pessoas não encontram o que precisam. Se recusar, o portal funciona exatamente da mesma maneira.',
        ]),
      },
      {
        type: 'prose',
        heading: pt('Mudar de ideias'),
        paragraphs: ptList([
          'Pode alterar a sua decisão a qualquer momento, limpando os dados do sítio nas definições do navegador. Da próxima visita, voltamos a perguntar.',
        ]),
      },
    ],
  },
  {
    path: 'mapa-do-site',
    title: pt('Mapa do site'),
    lead: pt('Todas as secções do portal numa só página.'),
    updatedAt: '2026-07-25',
    blocks: [{ type: 'sitemap', heading: pt('Estrutura do portal') }],
  },
];

export function findEditorialPage(path: string): EditorialPage | undefined {
  return editorialPages.find((page) => page.path === path);
}
