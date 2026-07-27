import type { MetadataRoute } from 'next';
import { site } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Ergebnisseiten und der Guia de estilo gehören nicht in den Index.
        disallow: ['/pesquisa', '/en/pesquisa', '/es/pesquisa', '/fr/pesquisa', '/styleguide', '/api/'],
      },
    ],
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
