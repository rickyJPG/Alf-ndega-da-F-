import type { ReactNode } from 'react';
import '@/styles/globals.css';

/** Die Offline-Seite bringt ihr eigenes <html> mit – siehe page.tsx. */
export default function OfflineLayout({ children }: { children: ReactNode }) {
  return children;
}
