/**
 * 301-Weiterleitungen von der alten Seite (2015) auf die neue Struktur.
 *
 * Die alte Seite adressierte fast alles über /pages/<id>. Diese Tabelle hält
 * die eingehenden Links aus Suchmaschinen, Merklisten und gedruckten Flyern
 * am Leben. `next.config.ts` liest sie beim Start ein.
 *
 * Pflege durch die Verwaltung: neue Zeile anlegen, `source` ist die alte URL,
 * `destination` die neue. Der Kommentar hinter jeder Zeile nennt den alten
 * Seitentitel, damit nachvollziehbar bleibt, worum es ging.
 */

export interface LegacyRedirect {
  source: string;
  destination: string;
  /** Alter Seitentitel – nur zur Dokumentation. */
  note?: string;
}

export const legacyRedirects: LegacyRedirect[] = [
  // --- Einstiegsseiten der alten Hauptnavigation ---------------------------
  { source: '/index.php', destination: '/', note: 'Startseite' },
  { source: '/pages/1', destination: '/', note: 'Toter Link in der alten Fußzeile' },
  { source: '/pages/2', destination: '/municipio', note: 'Viver' },
  { source: '/pages/3', destination: '/visitar', note: 'Conhecer' },
  { source: '/pages/4', destination: '/visitar/investir', note: 'Investir' },
  { source: '/pages/5', destination: '/viver-e-participar', note: 'Participar' },

  // --- Município ------------------------------------------------------------
  { source: '/pages/285', destination: '/municipio/executivo', note: 'Executivo Municipal' },
  { source: '/pages/286', destination: '/municipio/assembleia', note: 'Assembleia Municipal' },
  { source: '/pages/287', destination: '/municipio/organograma', note: 'Organograma' },
  { source: '/pages/288', destination: '/municipio/reunioes', note: 'Reuniões de Câmara' },
  { source: '/pages/289', destination: '/municipio/contactos', note: 'Contactos' },
  { source: '/pages/297', destination: '/municipio/freguesias', note: 'Freguesias' },
  { source: '/pages/300', destination: '/municipio/recrutamento', note: 'Recursos Humanos' },
  { source: '/pages/301', destination: '/municipio/contratacao-publica', note: 'Contratação Pública' },

  // --- Freguesias – Detailseiten -------------------------------------------
  { source: '/pages/1213', destination: '/municipio/freguesias/alfandega-da-fe' },
  { source: '/pages/1214', destination: '/municipio/freguesias/cerejais' },
  { source: '/pages/1215', destination: '/municipio/freguesias/agrobom-saldonha-vale-pereiro' },
  { source: '/pages/1216', destination: '/municipio/freguesias/eucisia-gouveia-valverde' },
  { source: '/pages/1217', destination: '/municipio/freguesias/ferradosa-sendim-da-serra' },
  { source: '/pages/1218', destination: '/municipio/freguesias/gebelim-soeima' },
  { source: '/pages/1209', destination: '/municipio/freguesias/pombal-vales' },
  { source: '/pages/1210', destination: '/municipio/freguesias/parada-sendim-da-ribeira' },
  { source: '/pages/1211', destination: '/municipio/freguesias/sambade' },
  { source: '/pages/1212', destination: '/municipio/freguesias/vilar-chao' },
  { source: '/pages/1219', destination: '/municipio/freguesias/vilarelhos' },
  { source: '/pages/1220', destination: '/municipio/freguesias/vilares-de-vilarica-vale-frechoso' },

  // --- Serviços -------------------------------------------------------------
  { source: '/pages/310', destination: '/servicos', note: 'Serviços Online' },
  { source: '/pages/311', destination: '/servicos/urbanismo', note: 'Urbanismo' },
  { source: '/pages/312', destination: '/servicos/urbanismo/pdm', note: 'PDM' },
  { source: '/pages/315', destination: '/servicos/agua-e-residuos', note: 'Água e Saneamento' },
  { source: '/pages/318', destination: '/servicos/taxas-e-licencas', note: 'Taxas e Licenças' },
  { source: '/pages/320', destination: '/documentos', note: 'Formulários' },
  { source: '/pages/322', destination: '/servicos/acao-social', note: 'Ação Social' },
  { source: '/pages/324', destination: '/servicos/educacao', note: 'Educação' },
  { source: '/pages/326', destination: '/servicos/apoios', note: 'Apoios e Candidaturas' },

  // --- Transparência ---------------------------------------------------------
  { source: '/pages/400', destination: '/transparencia', note: 'Prestação de contas' },
  { source: '/pages/401', destination: '/transparencia/orcamento', note: 'Orçamento' },
  { source: '/pages/402', destination: '/documentos?tipo=regulamento', note: 'Regulamentos' },
  { source: '/pages/403', destination: '/documentos?tipo=edital', note: 'Editais' },
  { source: '/pages/404', destination: '/transparencia/consultas-publicas', note: 'Consultas Públicas' },
  { source: '/pages/405', destination: '/transparencia/dados-abertos', note: 'Dados' },
  { source: '/pages/2267', destination: '/municipio/reunioes?ano=2026', note: 'Atas – edição 2026' },

  // --- Viver e Participar -----------------------------------------------------
  { source: '/pages/1089', destination: '/noticias', note: 'Notícias' },
  { source: '/pages/1090', destination: '/eventos', note: 'Agenda' },
  { source: '/pages/1100', destination: '/viver-e-participar/orcamento-participativo' },
  { source: '/pages/1102', destination: '/viver-e-participar/associacoes' },
  { source: '/pages/1104', destination: '/viver-e-participar/desporto' },
  { source: '/pages/1106', destination: '/viver-e-participar/juventude' },

  // --- Visitar ----------------------------------------------------------------
  { source: '/pages/1027', destination: '/visitar', note: 'Alfândega da Fé (turismo)' },
  { source: '/pages/1041', destination: '/visitar/percursos-pedestres', note: 'Percursos Pedestres' },
  { source: '/pages/1043', destination: '/visitar/lagos-do-sabor', note: 'Lagos do Sabor' },
  { source: '/pages/1045', destination: '/visitar/produtos-locais', note: 'Produtos Locais' },
  { source: '/pages/1047', destination: '/visitar/onde-dormir-e-comer' },
  { source: '/pages/1049', destination: '/visitar/festas-e-feiras' },

  // --- Veraltet: COVID-19 wandert ins Archiv, raus aus der Navigation --------
  { source: '/pages/1500', destination: '/noticias?arquivo=covid-19', note: 'COVID-19' },
  { source: '/pages/1501', destination: '/noticias?arquivo=covid-19', note: 'COVID-19 – medidas' },

  // --- Alte Anhänge-URLs ------------------------------------------------------
  { source: '/cmalfandegadafe/uploads/writer_file/document/:id/:slug', destination: '/documentos' },
];

/** Für Tests und den Redaktions-Leitfaden. */
export const legacyRedirectCount = legacyRedirects.length;
