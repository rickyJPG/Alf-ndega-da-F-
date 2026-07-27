import type { ReactNode } from 'react';
import '@/styles/globals.css';

/** A página offline traz o seu próprio <html> — ver page.tsx. */
export default function OfflineLayout({ children }: { children: ReactNode }) {
  return children;
}
