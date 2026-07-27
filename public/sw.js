/**
 * Service Worker do portal do Município de Alfândega da Fé.
 *
 * Estratégia, por ordem de importância:
 *
 *  1. Navegação — rede primeiro. Uma página institucional nunca deve mostrar
 *     informação desatualizada por comodidade de cache. Se a rede falhar,
 *     serve-se a versão em cache e, em último caso, a página offline com os
 *     contactos e números de emergência.
 *  2. Recursos estáticos com impressão digital no nome (_next/static, fontes) —
 *     cache primeiro, porque nunca mudam sem mudar de nome.
 *  3. Tudo o resto — rede, com cache como rede de segurança.
 *
 * Não se guarda nada de páginas com dados pessoais nem respostas de POST.
 */

const VERSION = 'v1';
const STATIC_CACHE = `cmadf-static-${VERSION}`;
const PAGES_CACHE = `cmadf-pages-${VERSION}`;
const OFFLINE_URL = '/offline';

/** O mínimo indispensável para a página offline funcionar. */
const PRECACHE = [
  OFFLINE_URL,
  '/fonts/inter-400-latin.woff2',
  '/fonts/inter-600-latin.woff2',
  '/fonts/source-serif-4-600-latin.woff2',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith('cmadf-') && !key.endsWith(VERSION))
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Nunca guardar respostas da API nem áreas autenticadas.
  if (url.pathname.startsWith('/api/') || url.pathname.includes('/balcao-digital')) return;

  // 1. Navegação
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(PAGES_CACHE).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          return cached ?? caches.match(OFFLINE_URL);
        }),
    );
    return;
  }

  // 2. Recursos imutáveis
  const isImmutable =
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/fonts/') ||
    url.pathname.startsWith('/vendor/');

  if (isImmutable) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ??
          fetch(request).then((response) => {
            const copy = response.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put(request, copy));
            return response;
          }),
      ),
    );
    return;
  }

  // 3. Restante
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok && url.pathname.startsWith('/images/')) {
          const copy = response.clone();
          caches.open(STATIC_CACHE).then((cache) => cache.put(request, copy));
        }
        return response;
      })
      .catch(() => caches.match(request)),
  );
});
