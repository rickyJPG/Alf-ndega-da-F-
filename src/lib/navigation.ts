import type { Locale } from '@/i18n/config';

/**
 * Informationsarchitektur. Sie folgt dem, was Menschen erledigen wollen –
 * nicht dem Organigramm. Maximal fünf Haupteinträge, maximal zwei Ebenen.
 *
 * Jede Seite ist damit in höchstens drei Klicks von der Startseite erreichbar:
 * Hauptnavigation → Mega-Menü-Eintrag → Detailseite.
 */

export type Translated = Record<Locale, string>;

export interface NavLink {
  /** Pfad ohne Sprachpräfix. localePath() setzt es davor. */
  href: string;
  label: Translated;
  description?: Translated;
  /** Hebt den Eintrag im Mega-Menü hervor (eine Spalte „Mais procurado“). */
  featured?: boolean;
}

export interface NavGroup {
  id: string;
  title: Translated;
  items: NavLink[];
}

export interface NavSection {
  id: string;
  href: string;
  label: Translated;
  description: Translated;
  groups: NavGroup[];
  /** Eigene visuelle Sprache erlaubt (Tourismus). */
  tone?: 'institutional' | 'discover';
}

const t = (pt: string, en: string, es: string, fr: string): Translated => ({ pt, en, es, fr });

export const mainNavigation: NavSection[] = [
  {
    id: 'servicos',
    href: '/servicos',
    label: t('Serviços', 'Services', 'Servicios', 'Services'),
    description: t(
      'Trate dos seus assuntos com o Município, online sempre que possível.',
      'Deal with the Council — online wherever possible.',
      'Resuelva sus trámites con el Ayuntamiento, en línea siempre que sea posible.',
      'Effectuez vos démarches auprès de la mairie, en ligne dès que possible.',
    ),
    groups: [
      {
        id: 'balcao',
        title: t('Balcão digital', 'Digital counter', 'Ventanilla digital', 'Guichet numérique'),
        items: [
          {
            href: '/servicos/balcao-digital',
            label: t('Área de Munícipe', 'Citizen account', 'Área del ciudadano', 'Espace citoyen'),
            description: t(
              'Entre com a Chave Móvel Digital e veja os seus processos.',
              'Sign in with your digital key and follow your cases.',
              'Entre con la clave móvil digital y consulte sus expedientes.',
              'Connectez-vous avec votre clé numérique et suivez vos dossiers.',
            ),
            featured: true,
          },
          {
            href: '/servicos/marcacoes',
            label: t('Marcar atendimento', 'Book an appointment', 'Reservar cita', 'Prendre rendez-vous'),
            featured: true,
          },
          {
            href: '/servicos/pagamentos',
            label: t('Pagar taxas e água', 'Pay fees and water', 'Pagar tasas y agua', 'Payer taxes et eau'),
            featured: true,
          },
          {
            href: '/documentos',
            label: t(
              'Formulários e requerimentos',
              'Forms and applications',
              'Formularios y solicitudes',
              'Formulaires et demandes',
            ),
          },
        ],
      },
      {
        id: 'territorio',
        title: t('Território e obras', 'Land and building', 'Territorio y obras', 'Territoire et travaux'),
        items: [
          {
            href: '/servicos/urbanismo',
            label: t('Urbanismo e obras', 'Planning and building', 'Urbanismo y obras', 'Urbanisme et travaux'),
          },
          {
            href: '/servicos/urbanismo/consultar-o-pdm',
            label: t('Consultar o PDM', 'Check the local plan', 'Consultar el PDM', 'Consulter le PLU'),
          },
          {
            href: '/servicos/urbanismo/licenca-de-construcao',
            label: t('Licença de construção', 'Building permit', 'Licencia de obra', 'Permis de construire'),
          },
          {
            href: '/servicos/taxas-e-licencas',
            label: t('Taxas e licenças', 'Fees and licences', 'Tasas y licencias', 'Taxes et licences'),
          },
        ],
      },
      {
        id: 'ambiente',
        title: t('Água e ambiente', 'Water and environment', 'Agua y medio ambiente', 'Eau et environnement'),
        items: [
          {
            href: '/servicos/agua-e-residuos',
            label: t('Água e saneamento', 'Water and sewerage', 'Agua y saneamiento', 'Eau et assainissement'),
          },
          {
            href: '/servicos/agua-e-residuos/recolha',
            label: t('Calendário de recolha', 'Collection calendar', 'Calendario de recogida', 'Calendrier de collecte'),
          },
          {
            href: '/servicos/agua-e-residuos/recolha-de-monstros',
            label: t('Recolha de monstros', 'Bulky waste pickup', 'Recogida de voluminosos', 'Collecte des encombrants'),
          },
        ],
      },
      {
        id: 'pessoas',
        title: t('Pessoas', 'People', 'Personas', 'Personnes'),
        items: [
          {
            href: '/servicos/acao-social',
            label: t('Ação social', 'Social support', 'Acción social', 'Action sociale'),
          },
          { href: '/servicos/educacao', label: t('Educação', 'Education', 'Educación', 'Éducation') },
          { href: '/servicos/saude', label: t('Saúde', 'Health', 'Salud', 'Santé') },
          {
            href: '/servicos/apoios',
            label: t('Apoios e candidaturas', 'Grants and applications', 'Ayudas y convocatorias', 'Aides et candidatures'),
          },
        ],
      },
    ],
  },

  {
    id: 'municipio',
    href: '/municipio',
    label: t('Município', 'The Council', 'Municipio', 'La commune'),
    description: t(
      'Quem decide, quem faz e como pode acompanhar.',
      'Who decides, who does the work, and how to follow it.',
      'Quién decide, quién ejecuta y cómo seguirlo.',
      'Qui décide, qui agit et comment suivre les décisions.',
    ),
    groups: [
      {
        id: 'orgaos',
        title: t('Órgãos', 'Bodies', 'Órganos', 'Instances'),
        items: [
          {
            href: '/municipio/executivo',
            label: t('Executivo Municipal', 'Executive board', 'Ejecutivo municipal', 'Exécutif municipal'),
          },
          {
            href: '/municipio/assembleia',
            label: t('Assembleia Municipal', 'Municipal assembly', 'Asamblea municipal', 'Assemblée municipale'),
          },
          {
            href: '/municipio/freguesias',
            label: t('Freguesias', 'Parishes', 'Parroquias', 'Paroisses'),
          },
        ],
      },
      {
        id: 'decisoes',
        title: t('Decisões', 'Decisions', 'Decisiones', 'Décisions'),
        items: [
          {
            href: '/municipio/reunioes',
            label: t('Reuniões de Câmara', 'Council meetings', 'Plenos municipales', 'Conseils municipaux'),
            description: t(
              'Ordens do dia, atas e deliberações, pesquisáveis.',
              'Agendas, minutes and decisions, fully searchable.',
              'Órdenes del día, actas y acuerdos, con búsqueda.',
              'Ordres du jour, PV et délibérations, en recherche plein texte.',
            ),
            featured: true,
          },
          {
            href: '/municipio/reunioes?tipo=assembleia',
            label: t('Sessões da Assembleia', 'Assembly sittings', 'Sesiones de la Asamblea', 'Séances de l’Assemblée'),
          },
        ],
      },
      {
        id: 'organizacao',
        title: t('Organização', 'Organisation', 'Organización', 'Organisation'),
        items: [
          {
            href: '/municipio/organograma',
            label: t('Organograma', 'Org chart', 'Organigrama', 'Organigramme'),
          },
          {
            href: '/municipio/contactos',
            label: t('Serviços e contactos', 'Departments and contacts', 'Servicios y contactos', 'Services et contacts'),
          },
        ],
      },
      {
        id: 'trabalhar',
        title: t('Trabalhar connosco', 'Work with us', 'Trabajar con nosotros', 'Travailler avec nous'),
        items: [
          {
            href: '/municipio/recrutamento',
            label: t('Recrutamento', 'Jobs', 'Empleo', 'Recrutement'),
            featured: true,
          },
          {
            href: '/municipio/contratacao-publica',
            label: t('Contratação pública', 'Public procurement', 'Contratación pública', 'Marchés publics'),
          },
        ],
      },
    ],
  },

  {
    id: 'transparencia',
    href: '/transparencia',
    label: t('Transparência', 'Transparency', 'Transparencia', 'Transparence'),
    description: t(
      'Contas, regulamentos, consultas públicas e dados abertos.',
      'Accounts, by-laws, public consultations and open data.',
      'Cuentas, reglamentos, consultas públicas y datos abiertos.',
      'Comptes, règlements, consultations publiques et données ouvertes.',
    ),
    groups: [
      {
        id: 'contas',
        title: t('Contas', 'Accounts', 'Cuentas', 'Comptes'),
        items: [
          {
            href: '/transparencia/orcamento',
            label: t('Orçamento e contas', 'Budget and accounts', 'Presupuesto y cuentas', 'Budget et comptes'),
            description: t(
              'Explore a despesa por área e compare com o ano anterior.',
              'Explore spending by area and compare with last year.',
              'Explore el gasto por área y compárelo con el año anterior.',
              'Explorez les dépenses par domaine et comparez à l’an dernier.',
            ),
            featured: true,
          },
          {
            href: '/transparencia/dados-abertos',
            label: t('Dados abertos', 'Open data', 'Datos abiertos', 'Données ouvertes'),
          },
        ],
      },
      {
        id: 'normas',
        title: t('Normas', 'Rules', 'Normas', 'Règles'),
        items: [
          {
            href: '/documentos?tipo=regulamento',
            label: t('Regulamentos', 'By-laws', 'Reglamentos', 'Règlements'),
          },
          {
            href: '/documentos?tipo=edital',
            label: t('Editais e avisos', 'Public notices', 'Edictos y avisos', 'Avis officiels'),
          },
        ],
      },
      {
        id: 'participacao',
        title: t('Participação', 'Participation', 'Participación', 'Participation'),
        items: [
          {
            href: '/transparencia/consultas-publicas',
            label: t('Consultas públicas', 'Public consultations', 'Consultas públicas', 'Consultations publiques'),
            featured: true,
          },
          {
            href: '/transparencia/denuncias',
            label: t('Plataforma de denúncias', 'Whistleblowing channel', 'Canal de denuncias', 'Signalement d’irrégularités'),
          },
        ],
      },
    ],
  },

  {
    id: 'viver-e-participar',
    href: '/viver-e-participar',
    label: t('Viver e Participar', 'Living here', 'Vivir y participar', 'Vivre et participer'),
    description: t(
      'Agenda, associações, participação e notícias.',
      'Events, clubs, participation and news.',
      'Agenda, asociaciones, participación y noticias.',
      'Agenda, associations, participation et actualités.',
    ),
    groups: [
      {
        id: 'acontece',
        title: t('Acontece', 'What’s on', 'Sucede', 'Il se passe'),
        items: [
          { href: '/eventos', label: t('Agenda cultural', 'What’s on', 'Agenda cultural', 'Agenda culturel'), featured: true },
          { href: '/noticias', label: t('Notícias', 'News', 'Noticias', 'Actualités'), featured: true },
        ],
      },
      {
        id: 'participar',
        title: t('Participar', 'Take part', 'Participar', 'Participer'),
        items: [
          {
            href: '/viver-e-participar/ocorrencias',
            label: t('Comunicar ocorrência', 'Report a problem', 'Comunicar incidencia', 'Signaler un problème'),
            description: t(
              'Buracos, iluminação, lixo. Com foto e ponto no mapa.',
              'Potholes, street lights, rubbish. With a photo and a map pin.',
              'Baches, alumbrado, basura. Con foto y punto en el mapa.',
              'Nids-de-poule, éclairage, déchets. Avec photo et point sur la carte.',
            ),
            featured: true,
          },
          {
            href: '/viver-e-participar/orcamento-participativo',
            label: t('Orçamento Participativo', 'Participatory budget', 'Presupuesto participativo', 'Budget participatif'),
          },
        ],
      },
      {
        id: 'comunidade',
        title: t('Comunidade', 'Community', 'Comunidad', 'Communauté'),
        items: [
          { href: '/viver-e-participar/associacoes', label: t('Associações', 'Clubs and societies', 'Asociaciones', 'Associations') },
          { href: '/viver-e-participar/desporto', label: t('Desporto', 'Sport', 'Deporte', 'Sport') },
          { href: '/viver-e-participar/juventude', label: t('Juventude', 'Youth', 'Juventud', 'Jeunesse') },
        ],
      },
    ],
  },

  {
    id: 'visitar',
    href: '/visitar',
    tone: 'discover',
    label: t('Visitar', 'Visit', 'Visitar', 'Visiter'),
    description: t(
      'O que ver, o que provar, onde ficar.',
      'What to see, what to taste, where to stay.',
      'Qué ver, qué probar, dónde alojarse.',
      'Que voir, que goûter, où dormir.',
    ),
    groups: [
      {
        id: 'ver-e-fazer',
        title: t('Ver e fazer', 'See and do', 'Ver y hacer', 'Voir et faire'),
        items: [
          {
            href: '/visitar/lagos-do-sabor',
            label: t('Lagos do Sabor', 'The Sabor lakes', 'Lagos del Sabor', 'Lacs du Sabor'),
            featured: true,
          },
          {
            href: '/visitar/percursos-pedestres',
            label: t('Percursos pedestres', 'Walking trails', 'Rutas a pie', 'Sentiers de randonnée'),
            featured: true,
          },
          {
            href: '/visitar/patrimonio',
            label: t('Património', 'Heritage', 'Patrimonio', 'Patrimoine'),
          },
        ],
      },
      {
        id: 'sabores',
        title: t('Sabores', 'Flavours', 'Sabores', 'Saveurs'),
        items: [
          {
            href: '/visitar/produtos-locais',
            label: t('Produtos locais', 'Local produce', 'Productos locales', 'Produits locaux'),
            description: t(
              'Cereja, azeite, castanha e amêndoa.',
              'Cherries, olive oil, chestnuts and almonds.',
              'Cereza, aceite, castaña y almendra.',
              'Cerise, huile d’olive, châtaigne et amande.',
            ),
          },
          { href: '/visitar/cereja-co', label: t('Cereja&co', 'Cereja&co', 'Cereja&co', 'Cereja&co') },
          {
            href: '/visitar/onde-dormir-e-comer',
            label: t('Onde dormir e comer', 'Where to stay and eat', 'Dónde dormir y comer', 'Où dormir et manger'),
          },
          {
            href: '/visitar/festas-e-feiras',
            label: t('Festas e feiras', 'Fairs and festivals', 'Fiestas y ferias', 'Fêtes et foires'),
          },
        ],
      },
      {
        id: 'investir',
        title: t('Investir', 'Invest', 'Invertir', 'Investir'),
        items: [
          {
            href: '/visitar/investir',
            label: t('Zona Industrial', 'Industrial estate', 'Polígono industrial', 'Zone industrielle'),
          },
          {
            href: '/visitar/investir/apoios',
            label: t('Apoios ao empreendedor', 'Business support', 'Apoyo al emprendedor', 'Aides aux entrepreneurs'),
          },
        ],
      },
    ],
  },
];

/** Kleine Leiste über dem Header. */
export const utilityLinks: NavLink[] = [
  {
    href: '/servicos/balcao-digital',
    label: t('Área de Munícipe', 'Citizen account', 'Área del ciudadano', 'Espace citoyen'),
  },
  {
    href: '/municipio/contactos',
    label: t('Contactos', 'Contact us', 'Contacto', 'Contacts'),
  },
];

/** Text-Chips unter der Suchzeile auf der Startseite. */
export const topTasks: NavLink[] = [
  { href: '/servicos/pagamentos', label: t('Pagar a água', 'Pay a water bill', 'Pagar el agua', 'Payer l’eau') },
  {
    href: '/servicos/balcao/certidoes',
    label: t('Pedir certidão', 'Request a certificate', 'Pedir un certificado', 'Demander un certificat'),
  },
  {
    href: '/servicos/marcacoes',
    label: t('Marcar atendimento', 'Book an appointment', 'Reservar cita', 'Prendre rendez-vous'),
  },
  { href: '/servicos/urbanismo/consultar-o-pdm', label: t('Consultar o PDM', 'Check the local plan', 'Consultar el PDM', 'Consulter le PLU') },
  {
    href: '/servicos/agua-e-residuos/recolha-de-monstros',
    label: t('Recolha de monstros', 'Bulky waste pickup', 'Recogida de voluminosos', 'Collecte des encombrants'),
  },
  {
    href: '/viver-e-participar/ocorrencias',
    label: t('Comunicar ocorrência', 'Report a problem', 'Comunicar incidencia', 'Signaler un problème'),
  },
];

/** Rechtliches – Fußzeile. */
export const legalLinks: NavLink[] = [
  { href: '/ficha-tecnica', label: t('Ficha técnica', 'Site credits', 'Ficha técnica', 'Mentions techniques') },
  { href: '/privacidade', label: t('Privacidade', 'Privacy', 'Privacidad', 'Confidentialité') },
  { href: '/cookies', label: t('Cookies', 'Cookies', 'Cookies', 'Cookies') },
  { href: '/acessibilidade', label: t('Acessibilidade', 'Accessibility', 'Accesibilidad', 'Accessibilité') },
  { href: '/mapa-do-site', label: t('Mapa do site', 'Site map', 'Mapa del sitio', 'Plan du site') },
];

export const complaintsBook = {
  href: 'https://www.livroreclamacoes.pt/inicio',
  label: t('Livro de Reclamações', 'Complaints book', 'Libro de reclamaciones', 'Livre de réclamations'),
};

/** Flache Liste aller internen Navigationsziele – für Tests und Sitemap. */
export function allNavigationHrefs(): string[] {
  const hrefs = new Set<string>();
  for (const section of mainNavigation) {
    hrefs.add(section.href);
    for (const group of section.groups) {
      for (const item of group.items) hrefs.add(item.href.split('?')[0]);
    }
  }
  for (const item of [...utilityLinks, ...topTasks, ...legalLinks]) {
    hrefs.add(item.href.split('?')[0]);
  }
  return [...hrefs];
}

export function navLabel(item: { label: Translated }, locale: Locale): string {
  return item.label[locale] ?? item.label.pt;
}

export function navDescription(
  item: { description?: Translated },
  locale: Locale,
): string | undefined {
  return item.description ? (item.description[locale] ?? item.description.pt) : undefined;
}
