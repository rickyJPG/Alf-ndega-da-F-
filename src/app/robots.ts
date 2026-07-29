import type { MetadataRoute } from 'next';
import { site } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // As páginas de resultados e o guia de estilo não pertencem ao índice.
        disallow: [
          '/pesquisa',
          '/en/pesquisa',
          '/es/pesquisa',
          '/fr/pesquisa',
          '/styleguide',
          '/guia-de-imagens',
          '/api/',
        ],
      },
    ],
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
