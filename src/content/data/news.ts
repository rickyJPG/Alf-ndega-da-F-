import type { NewsItem } from '../types';

/**
 * Notícias. Datas fixas — conteúdo de arquivo não se desloca no tempo.
 * Os conteúdos retomam matérias reais do município (redução da dívida,
 * Festa da Cereja, Prémio Mestre José Rodrigues, Dia dos Avós).
 */
export const news: NewsItem[] = [
  {
    id: 'n-2026-07-18-endividamento',
    slug: 'municipio-sai-da-situacao-de-excesso-de-endividamento',
    date: '2026-07-18',
    category: 'Município',
    featured: true,
    title: {
      pt: 'Município sai da situação de excesso de endividamento',
      en: 'The municipality is no longer in excessive debt',
      es: 'El municipio sale de la situación de endeudamiento excesivo',
      fr: 'La commune sort de la situation d’endettement excessif',
    },
    summary: {
      pt: 'Ao fim de dez anos, Alfândega da Fé deixa de estar abrangida pelo mecanismo de recuperação financeira. A dívida total desceu para 4,1 milhões de euros.',
      en: 'After ten years, Alfândega da Fé is out of the financial recovery mechanism. Total debt is down to 4.1 million euros.',
      es: 'Tras diez años, Alfândega da Fé sale del mecanismo de recuperación financiera. La deuda total baja a 4,1 millones de euros.',
      fr: 'Après dix ans, Alfândega da Fé quitte le mécanisme de redressement financier. La dette totale descend à 4,1 millions d’euros.',
    },
    body: {
      pt: [
        'O Município de Alfândega da Fé deixou oficialmente a situação de excesso de endividamento em que se encontrava desde 2016. A confirmação chegou por ofício da Direção-Geral das Autarquias Locais.',
        'A dívida total do Município desceu de 12,7 milhões de euros, em 2016, para 4,1 milhões no fecho de contas de 2025 — um valor abaixo do limite legal aplicável à autarquia.',
        'Na prática, o Município recupera margem para contrair empréstimos de investimento e deixa de estar sujeito às restrições de contratação previstas no regime de saneamento financeiro.',
        'O executivo assinala que a redução foi conseguida sem aumento da carga fiscal sobre as famílias e sem despedimentos, através da renegociação de contratos de fornecimento, da redução de encargos financeiros e da concentração do investimento em obras comparticipadas por fundos comunitários.',
        'A prestação de contas de 2025, com o detalhe da execução orçamental, está disponível na área de Transparência deste portal.',
      ],
    },
    image: {
      src: '/images/noticias/orcamento.svg',
      alt: {
        pt: 'Gráfico abstrato composto por quadrados azuis de tamanhos diferentes.',
        en: 'Abstract chart made of blue squares of different sizes.',
      },
      width: 1200,
      height: 675,
    },
    tags: ['contas', 'orçamento', 'dívida'],
  },
  {
    id: 'n-2026-07-14-cereja-balanco',
    slug: 'campanha-da-cereja-fecha-com-2900-toneladas',
    date: '2026-07-14',
    category: 'Economia',
    featured: true,
    title: {
      pt: 'Campanha da cereja fecha com 2 900 toneladas colhidas',
      en: 'Cherry season closes with 2,900 tonnes harvested',
      es: 'La campaña de la cereza cierra con 2 900 toneladas recogidas',
      fr: 'La campagne de la cerise se termine avec 2 900 tonnes récoltées',
    },
    summary: {
      pt: 'Apesar das chuvas de maio, a produção ficou apenas 6 % abaixo do ano anterior. O preço médio pago ao produtor subiu para 2,40 €/kg.',
      en: 'Despite the May rains, production was only 6% below last year. The average price paid to growers rose to €2.40/kg.',
      es: 'Pese a las lluvias de mayo, la producción quedó solo un 6 % por debajo del año anterior. El precio medio al productor subió a 2,40 €/kg.',
      fr: 'Malgré les pluies de mai, la production n’est inférieure que de 6 % à celle de l’an dernier. Le prix moyen payé au producteur monte à 2,40 €/kg.',
    },
    body: {
      pt: [
        'A campanha da cereja de 2026 terminou com cerca de 2 900 toneladas colhidas no concelho, segundo os dados reunidos junto das organizações de produtores.',
        'As chuvas da primeira quinzena de maio provocaram perdas nas variedades mais precoces, sobretudo nas encostas viradas a norte. As variedades tardias compensaram parcialmente.',
        'O preço médio pago ao produtor situou-se nos 2,40 €/kg, acima dos 2,15 €/kg do ano anterior.',
        'O Município mantém em funcionamento o apoio à instalação de redes anti-chuva, com candidaturas abertas até 30 de setembro.',
      ],
    },
    image: {
      src: '/images/noticias/cereja.svg',
      alt: {
        pt: 'Cerejas maduras fora de foco sobre o verde do cerejal.',
        en: 'Graphic motif with stylised cherries in shades of red.',
      },
      width: 1200,
      height: 675,
    },
    tags: ['cereja', 'agricultura', 'apoios'],
  },
  {
    id: 'n-2026-07-09-agua-obras',
    slug: 'obras-na-rede-de-agua-de-vilarelhos',
    date: '2026-07-09',
    category: 'Obras',
    featured: true,
    title: {
      pt: 'Rede de água de Vilarelhos em obras até setembro',
      en: 'Water network in Vilarelhos under repair until September',
      es: 'La red de agua de Vilarelhos en obras hasta septiembre',
      fr: 'Le réseau d’eau de Vilarelhos en travaux jusqu’en septembre',
    },
    summary: {
      pt: 'A substituição de 3,2 km de conduta vai reduzir as perdas na rede. Haverá cortes pontuais, sempre anunciados na véspera.',
      en: 'Replacing 3.2 km of pipe will cut network losses. There will be short supply cuts, always announced the day before.',
      es: 'La sustitución de 3,2 km de conducción reducirá las pérdidas de la red. Habrá cortes puntuales, siempre avisados la víspera.',
      fr: 'Le remplacement de 3,2 km de conduite réduira les pertes du réseau. Des coupures ponctuelles seront annoncées la veille.',
    },
    body: {
      pt: [
        'Começaram esta semana os trabalhos de substituição da conduta de abastecimento de água de Vilarelhos, num total de 3,2 quilómetros.',
        'A conduta atual, em fibrocimento, tem mais de quarenta anos e é responsável por perdas estimadas em 38 % do volume aduzido.',
        'Durante a obra haverá cortes de abastecimento pontuais. Cada corte é anunciado na véspera, no portal e por aviso afixado na Junta de Freguesia.',
        'A empreitada tem um prazo de execução de dois meses e um valor de 214 500 euros, comparticipado em 85 % pelo PO SEUR.',
      ],
    },
    image: {
      src: '/images/noticias/agua.svg',
      alt: {
        pt: 'Linhas onduladas azuis que sugerem o correr da água.',
        en: 'Blue wavy lines suggesting running water.',
      },
      width: 1200,
      height: 675,
    },
    tags: ['água', 'obras', 'vilarelhos'],
  },
  {
    id: 'n-2026-07-02-manuais',
    slug: 'manuais-escolares-gratuitos-2026-2027',
    date: '2026-07-02',
    category: 'Educação',
    title: {
      pt: 'Manuais escolares gratuitos: levantamento a partir de 1 de setembro',
      en: 'Free school textbooks: collection from 1 September',
      es: 'Libros de texto gratuitos: recogida a partir del 1 de septiembre',
      fr: 'Manuels scolaires gratuits : retrait à partir du 1er septembre',
    },
    summary: {
      pt: 'Todos os alunos do concelho, do 1.º ao 12.º ano, têm direito aos manuais sem custos. Não é preciso preencher formulário.',
      en: 'Every pupil in the municipality, years 1 to 12, gets textbooks at no cost. No form to fill in.',
      es: 'Todos los alumnos del municipio, de 1.º a 12.º, tienen derecho a los libros sin coste. No hay que rellenar ningún formulario.',
      fr: 'Tous les élèves de la commune, de la 1re à la 12e année, reçoivent les manuels gratuitement. Aucun formulaire à remplir.',
    },
    body: {
      pt: [
        'O levantamento dos manuais escolares para o ano letivo 2026/2027 decorre entre 1 e 12 de setembro, na secretaria do Agrupamento de Escolas de Alfândega da Fé.',
        'A gratuitidade abrange todos os alunos residentes no concelho, do 1.º ao 12.º ano, independentemente do escalão de ação social escolar.',
        'Não é necessário requerimento. Basta apresentar o cartão de cidadão do aluno ou do encarregado de educação.',
        'Os manuais são para devolver no final do ano letivo, em condições de reutilização — exceto os cadernos de fichas do 1.º ciclo.',
      ],
    },
    image: {
      src: '/images/noticias/escolas.svg',
      alt: {
        pt: 'Barras verticais azuis de alturas diferentes.',
        en: 'Vertical blue bars of varying heights.',
      },
      width: 1200,
      height: 675,
    },
    tags: ['educação', 'escolas', 'apoios'],
  },
  {
    id: 'n-2026-06-24-premio-jose-rodrigues',
    slug: 'premio-mestre-jose-rodrigues-candidaturas',
    date: '2026-06-24',
    category: 'Cultura',
    title: {
      pt: 'Prémio Mestre José Rodrigues: candidaturas abertas',
      en: 'Mestre José Rodrigues Prize: applications open',
      es: 'Premio Maestro José Rodrigues: convocatoria abierta',
      fr: 'Prix Mestre José Rodrigues : candidatures ouvertes',
    },
    summary: {
      pt: 'A vertente académica distingue trabalhos de investigação sobre arte contemporânea portuguesa. O prazo termina a 30 de setembro.',
      en: 'The academic strand rewards research on Portuguese contemporary art. Deadline 30 September.',
      es: 'La modalidad académica premia trabajos de investigación sobre arte contemporáneo portugués. El plazo acaba el 30 de septiembre.',
      fr: 'Le volet académique récompense des recherches sur l’art contemporain portugais. Date limite : 30 septembre.',
    },
    body: {
      pt: [
        'Estão abertas as candidaturas à edição de 2026 do Prémio Mestre José Rodrigues, na vertente académica e de investigação.',
        'Podem concorrer dissertações de mestrado e teses de doutoramento concluídas nos últimos três anos, sobre escultura, desenho ou arte pública em Portugal.',
        'O prémio tem o valor de 3 000 euros e inclui a publicação do trabalho vencedor.',
        'As candidaturas são entregues por correio eletrónico até 30 de setembro de 2026. O regulamento completo está disponível no catálogo de documentos.',
      ],
    },
    tags: ['cultura', 'prémio', 'candidaturas'],
  },
  {
    id: 'n-2026-06-08-festa-cereja',
    slug: 'festa-da-cereja-2026-em-numeros',
    date: '2026-06-08',
    category: 'Cultura',
    title: {
      pt: 'Festa da Cereja&co reuniu 18 mil visitantes',
      en: 'Cereja&co festival drew 18,000 visitors',
      es: 'La Fiesta de la Cereza&co reunió a 18 000 visitantes',
      fr: 'La Fête de la Cerise&co a réuni 18 000 visiteurs',
    },
    summary: {
      pt: 'Três dias de mercado de produtores, provas e concertos. Os produtores locais esgotaram o stock no domingo à tarde.',
      en: 'Three days of producers’ market, tastings and concerts. Local growers sold out by Sunday afternoon.',
      es: 'Tres días de mercado de productores, catas y conciertos. Los productores locales agotaron existencias el domingo por la tarde.',
      fr: 'Trois jours de marché de producteurs, dégustations et concerts. Les producteurs locaux ont tout vendu dimanche après-midi.',
    },
    body: {
      pt: [
        'A edição de 2026 da Festa da Cereja&co decorreu de 5 a 7 de junho e recebeu cerca de 18 mil visitantes, segundo a estimativa da organização.',
        'O mercado de produtores reuniu 42 expositores do concelho e da região. A maioria esgotou o stock no domingo à tarde.',
        'O programa incluiu provas comentadas, showcooking, o concurso da melhor cereja e concertos no Largo do Município.',
        'A próxima edição está marcada para o primeiro fim de semana de junho de 2027.',
      ],
    },
    image: {
      src: '/images/noticias/cereja.svg',
      alt: {
        pt: 'Cerejas maduras fora de foco sobre o verde do cerejal.',
        en: 'Graphic motif with stylised cherries in shades of red.',
      },
      width: 1200,
      height: 675,
    },
    tags: ['cereja', 'festa', 'turismo'],
  },
  {
    id: 'n-2026-05-28-recolha-seletiva',
    slug: 'novos-ecopontos-nas-freguesias',
    date: '2026-05-28',
    category: 'Ambiente',
    title: {
      pt: 'Mais 24 ecopontos distribuídos pelas freguesias',
      en: '24 more recycling points across the parishes',
      es: '24 nuevos puntos de reciclaje repartidos por las parroquias',
      fr: '24 points de tri supplémentaires dans les paroisses',
    },
    summary: {
      pt: 'A rede passa a ter 96 ecopontos. Nenhum lugar do concelho fica a mais de 400 metros do mais próximo.',
      en: 'The network now has 96 points. No village is more than 400 metres from the nearest one.',
      es: 'La red pasa a tener 96 puntos. Ningún núcleo queda a más de 400 metros del más cercano.',
      fr: 'Le réseau compte désormais 96 points. Aucun hameau n’est à plus de 400 mètres du plus proche.',
    },
    body: {
      pt: [
        'Foram instalados 24 novos ecopontos em doze localidades do concelho, elevando a rede para 96 pontos de recolha seletiva.',
        'Com esta ampliação, nenhum lugar do concelho fica a mais de 400 metros do ecoponto mais próximo.',
        'A taxa de recolha seletiva no concelho subiu de 21 % para 29 % nos últimos três anos.',
        'O calendário de recolha por freguesia pode ser consultado e subscrito neste portal.',
      ],
    },
    image: {
      src: '/images/noticias/ambiente.svg',
      alt: {
        pt: 'Composição de quadrados verdes de tamanhos diferentes.',
        en: 'Composition of green squares of varying sizes.',
      },
      width: 1200,
      height: 675,
    },
    tags: ['ambiente', 'resíduos', 'reciclagem'],
  },
  {
    id: 'n-2026-05-12-apoio-idosos',
    slug: 'teleassistencia-chega-a-140-idosos',
    date: '2026-05-12',
    category: 'Ação Social',
    title: {
      pt: 'Teleassistência chega a 140 idosos do concelho',
      en: 'Telecare now reaches 140 older residents',
      es: 'La teleasistencia llega a 140 mayores del municipio',
      fr: 'La téléassistance atteint 140 personnes âgées de la commune',
    },
    summary: {
      pt: 'O serviço é gratuito para maiores de 65 anos que vivam sozinhos. A adesão faz-se na Ação Social ou por telefone.',
      en: 'The service is free for over-65s living alone. Sign up at the social services desk or by phone.',
      es: 'El servicio es gratuito para mayores de 65 años que vivan solos. La inscripción se hace en Acción Social o por teléfono.',
      fr: 'Le service est gratuit pour les plus de 65 ans vivant seuls. Inscription au service social ou par téléphone.',
    },
    body: {
      pt: [
        'O programa municipal de teleassistência abrange atualmente 140 pessoas com mais de 65 anos residentes no concelho.',
        'O equipamento permite pedir ajuda com um botão, 24 horas por dia, e está ligado a uma central que aciona a família, os bombeiros ou o INEM.',
        'O serviço é gratuito para pessoas com mais de 65 anos que vivam sozinhas ou passem o dia sozinhas.',
        'A adesão pode ser feita presencialmente no serviço de Ação Social ou pelo telefone 279 468 120.',
      ],
    },
    image: {
      src: '/images/noticias/social.svg',
      alt: {
        pt: 'Barras verticais azuis de alturas diferentes.',
        en: 'Vertical blue bars of varying heights.',
      },
      width: 1200,
      height: 675,
    },
    tags: ['ação social', 'idosos', 'saúde'],
  },
  {
    id: 'n-2026-04-20-orcamento-participativo',
    slug: 'orcamento-participativo-2026-abre-propostas',
    date: '2026-04-20',
    category: 'Município',
    title: {
      pt: 'Orçamento Participativo 2026: 150 mil euros para decidir',
      en: 'Participatory budget 2026: €150,000 for residents to allocate',
      es: 'Presupuesto Participativo 2026: 150 000 euros para decidir',
      fr: 'Budget participatif 2026 : 150 000 euros à décider',
    },
    summary: {
      pt: 'Podem propor todas as pessoas com mais de 16 anos que vivam, trabalhem ou estudem no concelho.',
      en: 'Anyone over 16 who lives, works or studies in the municipality can submit a proposal.',
      es: 'Puede proponer cualquier persona mayor de 16 años que viva, trabaje o estudie en el municipio.',
      fr: 'Toute personne de plus de 16 ans qui vit, travaille ou étudie dans la commune peut proposer.',
    },
    body: {
      pt: [
        'A quinta edição do Orçamento Participativo de Alfândega da Fé tem uma dotação de 150 mil euros, divididos por três vertentes: geral, jovem e sénior.',
        'As propostas são apresentadas online ou em papel, nos Paços do Concelho e nas Juntas de Freguesia.',
        'Cada proposta não pode ultrapassar 50 mil euros e tem de ser executável no prazo de um ano.',
        'A votação decorre em outubro, presencialmente e no portal, com o cartão de cidadão.',
      ],
    },
    tags: ['participação', 'orçamento participativo'],
  },
  {
    id: 'n-2023-04-03-covid-arquivo',
    slug: 'arquivo-medidas-covid-19',
    date: '2023-04-03',
    category: 'Saúde',
    archive: 'covid-19',
    title: {
      pt: 'Arquivo: medidas municipais durante a pandemia de COVID-19',
      en: 'Archive: municipal measures during the COVID-19 pandemic',
      es: 'Archivo: medidas municipales durante la pandemia de COVID-19',
      fr: 'Archives : mesures municipales pendant la pandémie de COVID-19',
    },
    summary: {
      pt: 'Página de arquivo. As medidas descritas deixaram de vigorar. Mantém-se acessível por interesse histórico e de transparência.',
      en: 'Archive page. The measures described are no longer in force. Kept accessible for the record.',
      es: 'Página de archivo. Las medidas descritas ya no están en vigor. Se mantiene por interés histórico y de transparencia.',
      fr: 'Page d’archives. Les mesures décrites ne sont plus en vigueur. Conservée pour mémoire.',
    },
    body: {
      pt: [
        'Esta página reúne, para memória futura, as medidas adotadas pelo Município entre 2020 e 2023 no contexto da pandemia de COVID-19.',
        'Nenhuma das medidas aqui descritas se mantém em vigor.',
        'Para informação de saúde atualizada, contacte a Unidade de Saúde Familiar de Alfândega da Fé ou a linha SNS 24 (808 24 24 24).',
      ],
    },
    tags: ['arquivo', 'covid-19'],
  },
];

export const newsCategories = [...new Set(news.map((item) => item.category))].sort();
