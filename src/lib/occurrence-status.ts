import type { Occurrence } from '@/content/types';
import type { Dictionary } from '@/i18n';
import type { BadgeTone } from '@/components/ui/badge';

/**
 * Darstellung des Bearbeitungsstands einer Meldung.
 *
 * Bewusst in einem eigenen, neutralen Modul: die Statusangabe wird sowohl auf
 * dem Server (öffentliche Liste) als auch im Client (Statusverfolgung)
 * gebraucht. Läge sie in einer 'use client'-Datei, wäre der Aufruf vom Server
 * aus nicht möglich.
 */
export const occurrenceStatusTone: Record<Occurrence['status'], BadgeTone> = {
  recebida: 'info',
  'em-resolucao': 'warning',
  resolvida: 'success',
  'sem-seguimento': 'neutral',
};

export function occurrenceStatusLabel(status: Occurrence['status'], dict: Dictionary): string {
  return {
    recebida: dict.reports.statusReceived,
    'em-resolucao': dict.reports.statusInProgress,
    resolvida: dict.reports.statusResolved,
    'sem-seguimento': dict.reports.statusRejected,
  }[status];
}
