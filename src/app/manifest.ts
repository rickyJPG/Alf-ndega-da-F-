import type { MetadataRoute } from 'next';
import { site } from '@/lib/site';

/**
 * PWA-Manifest.
 *
 * A vantagem para um concelho é concreta: o portal pode ficar no ecrã
 * inicial e os contactos, incluindo os números de emergência, continuam
 * acessíveis sem rede — num território com falhas de cobertura isso não é
 * Detail.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: site.name,
    short_name: site.shortName,
    description: 'Portal do Município de Alfândega da Fé — serviços, notícias e agenda.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait-primary',
    background_color: '#ffffff',
    theme_color: '#08283D',
    lang: 'pt-PT',
    dir: 'ltr',
    categories: ['government', 'utilities', 'news'],
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
      { src: '/icon-maskable.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' },
    ],
    shortcuts: [
      {
        name: 'Contactos e emergências',
        short_name: 'Contactos',
        url: '/municipio/contactos',
      },
      {
        name: 'Comunicar ocorrência',
        short_name: 'Ocorrência',
        url: '/viver-e-participar/ocorrencias',
      },
      {
        name: 'Marcar atendimento',
        short_name: 'Marcação',
        url: '/servicos/marcacoes',
      },
    ],
  };
}
