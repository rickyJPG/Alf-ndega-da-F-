import type { NextConfig } from 'next';
import { legacyRedirects } from './src/lib/redirects';
import { dominiosDasFotos } from './src/lib/fotos-do-municipio';

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self), interest-cohort=()' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  // Sprechende URLs statt der alten /pages/<id>-Struktur.
  async redirects() {
    return legacyRedirects.map((entry) => ({
      source: entry.source,
      destination: entry.destination,
      permanent: true,
    }));
  },

  async headers() {
    return [
      { source: '/:path*', headers: securityHeaders },
      {
        source: '/fonts/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        source: '/sw.js',
        headers: [{ key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' }],
      },
    ];
  },

  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [360, 480, 640, 768, 1024, 1280, 1536, 1920],
    imageSizes: [96, 128, 192, 256, 320],
    /**
     * As molduras de espera são SVG (public/images, geradas por
     * scripts/generate-placeholders.mjs). O Next entrega SVG tal como está;
     * a CSP em baixo impede que um ficheiro SVG execute scripts. Substituídas
     * por fotografias, volta a valer a linha normal AVIF/WebP.
     */
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",

    /**
     * Fotografias do concelho servidas pelas origens indicadas no documento
     * do Município (ver src/lib/fotos-do-municipio.ts). Vale enquanto os
     * ficheiros não estiverem alojados no próprio portal — a partir daí,
     * esta lista deixa de ser usada.
     */
    remotePatterns: dominiosDasFotos.map((hostname) => ({
      protocol: 'https' as const,
      hostname,
    })),
  },

  experimental: {
    optimizePackageImports: ['@radix-ui/react-navigation-menu', '@radix-ui/react-dialog'],
  },
};

export default nextConfig;
