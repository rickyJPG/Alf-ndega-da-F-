import type { NextConfig } from 'next';
import { legacyRedirects } from './src/lib/redirects';

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
     * Die Bildplatzhalter liegen als SVG vor (public/images, erzeugt von
     * scripts/generate-placeholders.mjs). Next reicht SVG unverändert durch;
     * die Sandbox-CSP darunter verhindert, dass eine SVG-Datei Skripte
     * ausführen könnte. Werden die Platzhalter durch echte Fotos ersetzt,
     * greift wieder die normale AVIF/WebP-Pipeline.
     */
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  experimental: {
    optimizePackageImports: ['@radix-ui/react-navigation-menu', '@radix-ui/react-dialog'],
  },
};

export default nextConfig;
