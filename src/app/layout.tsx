import type { ReactNode } from 'react';

/**
 * Wurzel-Layout. <html> und <body> stehen bewusst in app/[locale]/layout.tsx,
 * damit das lang-Attribut die tatsächliche Sprache trägt.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
