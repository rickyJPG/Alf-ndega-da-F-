/**
 * As fotografias do concelho, por posição do portal.
 *
 * Os endereços vêm do documento entregue pelo Município
 * («Links_Imagens_CM_Alfandega_da_Fe»). Enquanto os ficheiros não estiverem
 * alojados no servidor do portal, as fotografias são carregadas a partir da
 * origem — é isto que faz o portal mostrar já as imagens reais em vez de
 * molduras de espera.
 *
 * A ordem de resolução está em src/lib/imagens.ts:
 *
 *   1. ficheiro local em public/images (o que mandar, quando existir);
 *   2. o endereço aqui indicado;
 *   3. a moldura de espera .svg.
 *
 * Passar para ficheiros locais é, por isso, só copiar as fotografias para
 * public/images — não é preciso mexer nesta tabela nem no conteúdo.
 * `npm run fotos` faz essa cópia de uma vez.
 *
 * ANTES DE PUBLICAR
 * Confirmar com o Município os direitos de cada fotografia e passar a
 * servi-las do próprio domínio. As que vêm de `cm-alfandegadafe.pt` são do
 * Município; as restantes (blogues, sítios de reservas, Wikimedia) precisam
 * de autorização ou de atribuição, e carregar de fora deixa o portal
 * dependente de servidores de terceiros.
 */

/** Fotografias do próprio Município — as de utilização mais segura. */
const MUNICIPIO = {
  castelo:
    'https://www.cm-alfandegadafe.pt/cmalfandegadafe/uploads/poi/image/205/castelo_alfandega_4b747579d9fc5_1_1024_2500.jpg',
  casteloRecorte:
    'https://www.cm-alfandegadafe.pt/imgcrop/cmalfandegadafe/uploads/poi/image/29/castelo_alfandega_4b747579d9fc5_1_736_540.jpg',
  casteloAlto:
    'https://www.cm-alfandegadafe.pt/thumbs/cmalfandegadafe/uploads/poi/image/205/castelo_alfandega_4b747579d9fc5_1_1024_2500_1_736_2500.jpg',
  cerejais:
    'https://www.cm-alfandegadafe.pt/cmalfandegadafe/uploads/poi/image/30/Cerejais_4b7473dcb61aa.jpg',
  pontoDeInteresse:
    'https://www.cm-alfandegadafe.pt/cmalfandegadafe/uploads/poi/image/202/_dsc2541_copiar.jpg',
  parada:
    'https://www.cm-alfandegadafe.pt/thumbs/cmalfandegadafe/uploads/writer_file/image/852/Parada_1_250_250.jpg',
  logotipo:
    'https://www.cm-alfandegadafe.pt/imgcrop/cmalfandegadafe/uploads/image_link/image/2/logo_alfandaga_de_fe_1_314_132.png',
} as const;

/** Fotografias de terceiros indicadas no documento. */
const TERCEIROS = {
  vila: 'https://www.tempodeviajar.com/wp-content/uploads/alfandega-da-fe.jpg',
  paisagem: 'https://www.vagamundos.pt/wp-content/uploads/2020/11/1-147.jpg',
  estrada:
    'https://www.acp.pt/ResourcesUser/ACP/img_lista/ACP-Estrada-Fora-Fins-de-Semana-Alfandega-da-Fe-lista.jpg',
  lagos: 'https://ncultura.pt/wp-content/uploads/2022/12/Um-paraiso-chamado-Lagos-do-Sabor-00.jpg',
  lagosSegunda: 'https://assets.e-konomista.pt/uploads/2022/02/lagos-sabor1.jpg',
  percursos: 'https://www.dareyouspot.com/Routes/LoadImage/533',
  sambade: 'https://www.aldeiasdeportugal.pt/media/2020/12/Sambade-02-cut-1024x1011.jpg',
  sambadeCalcada: 'https://www.aldeiasdeportugal.pt/media/2020/12/Sambade-calcada.jpg',
  sambadeVista: 'https://www.aldeiasdeportugal.pt/media/2020/12/sambade-7.jpg',
  valverde:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Valverde_-_Portugal_%2833040060492%29.jpg/1280px-Valverde_-_Portugal_%2833040060492%29.jpg',
} as const;

/**
 * Posição do portal (o caminho que o conteúdo indica) → fotografia.
 *
 * As posições sem fotografia própria no documento reutilizam a paisagem mais
 * próxima do assunto. A redação deve afiná-las quando tiver material próprio.
 */
export const fotosDoMunicipio: Record<string, string> = {
  // Destaque
  '/images/hero-alfandega.svg': TERCEIROS.vila,

  // Visitar
  '/images/visitar/patrimonio.svg': MUNICIPIO.castelo,
  '/images/visitar/lagos-do-sabor.svg': TERCEIROS.lagos,
  '/images/visitar/cereja.svg': MUNICIPIO.cerejais,
  '/images/visitar/percursos.svg': TERCEIROS.percursos,
  '/images/visitar/amendoeiras.svg': TERCEIROS.paisagem,

  // Notícias
  '/images/noticias/orcamento.svg': MUNICIPIO.casteloRecorte,
  '/images/noticias/cereja.svg': MUNICIPIO.cerejais,
  '/images/noticias/agua.svg': TERCEIROS.lagosSegunda,
  '/images/noticias/ambiente.svg': TERCEIROS.estrada,
  '/images/noticias/escolas.svg': MUNICIPIO.pontoDeInteresse,
  '/images/noticias/social.svg': TERCEIROS.sambadeCalcada,
  '/images/noticias/festa.svg': TERCEIROS.sambadeVista,

  // Agenda
  '/images/eventos/musica.svg': TERCEIROS.paisagem,
  '/images/eventos/feira.svg': MUNICIPIO.pontoDeInteresse,
  '/images/eventos/exposicao.svg': MUNICIPIO.casteloAlto,

  // Freguesias
  '/images/freguesias/alfandega-da-fe.svg': TERCEIROS.vila,
  '/images/freguesias/sambade.svg': TERCEIROS.sambade,
  '/images/freguesias/parada-sendim-da-ribeira.svg': MUNICIPIO.parada,
  '/images/freguesias/eucisia-gouveia-valverde.svg': TERCEIROS.valverde,
  '/images/freguesias/cerejais.svg': MUNICIPIO.cerejais,
  '/images/freguesias/agrobom-saldonha-vale-pereiro.svg': TERCEIROS.paisagem,
  '/images/freguesias/ferradosa-sendim-da-serra.svg': TERCEIROS.lagosSegunda,
  '/images/freguesias/gebelim-soeima.svg': TERCEIROS.estrada,
  '/images/freguesias/pombal-vales.svg': TERCEIROS.sambadeVista,
  '/images/freguesias/vilar-chao.svg': MUNICIPIO.casteloAlto,
  '/images/freguesias/vilarelhos.svg': TERCEIROS.sambadeCalcada,
  '/images/freguesias/vilares-de-vilarica-vale-frechoso.svg': MUNICIPIO.pontoDeInteresse,
};

/** Logótipo oficial servido pelo próprio Município. */
export const logotipoOficial = MUNICIPIO.logotipo;

/** Domínios de onde vêm as fotografias — usados em next.config.ts. */
export const dominiosDasFotos = [
  'www.cm-alfandegadafe.pt',
  'www.tempodeviajar.com',
  'www.vagamundos.pt',
  'www.acp.pt',
  'ncultura.pt',
  'assets.e-konomista.pt',
  'www.dareyouspot.com',
  'www.aldeiasdeportugal.pt',
  'upload.wikimedia.org',
];
