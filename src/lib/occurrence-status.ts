import type { Occurrence } from '@/content/types';
import type { Dictionary } from '@/i18n';
import type { BadgeTone } from '@/components/ui/badge';

/**
 * Apresentação do estado de tratamento de uma ocorrência.
 *
 * De propósito num módulo próprio e neutro: o estado é preciso tanto no
 * servidor (lista pública) como no cliente (acompanhamento). Se vivesse num
 * ficheiro 'use client', o servidor não o poderia chamar.
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
