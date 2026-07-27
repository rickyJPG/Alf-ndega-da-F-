import type { ReactNode } from 'react';

/**
 * Layout de raiz. O <html> e o <body> ficam de propósito em
 * app/[locale]/layout.tsx, para que o atributo lang traga a língua real.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
