import type { Alert } from '../types';
import { offsetDays } from './clock';

/**
 * Avisos ativos. Um array vazio significa que não há barra na página inicial.
 *
 * Redação: basta pôr uma data em `endsAt` e o aviso desaparece sozinho.
 * Nichts bleibt versehentlich monatelang stehen.
 */
export const alerts: Alert[] = [
  {
    id: 'aviso-risco-incendio',
    severity: 'warning',
    title: {
      pt: 'Risco de incêndio muito elevado até domingo. Não faça queimadas nem use máquinas com faísca.',
      en: 'Very high wildfire risk until Sunday. No burning, no spark-producing machinery.',
      es: 'Riesgo de incendio muy elevado hasta el domingo. No haga quemas ni use maquinaria que produzca chispas.',
      fr: 'Risque d’incendie très élevé jusqu’à dimanche. Pas de brûlage ni de machines produisant des étincelles.',
    },
    href: '/viver-e-participar/protecao-civil',
    startsAt: offsetDays(-2),
    endsAt: offsetDays(4),
  },
  {
    id: 'aviso-agua-sambade',
    severity: 'info',
    title: {
      pt: 'Corte de água em Sambade na quarta-feira, entre as 09:00 e as 16:00, para reparação da conduta.',
      en: 'Water supply cut in Sambade on Wednesday, 09:00 to 16:00, for pipe repairs.',
      es: 'Corte de agua en Sambade el miércoles, de 09:00 a 16:00, por reparación de la conducción.',
      fr: 'Coupure d’eau à Sambade mercredi, de 09h00 à 16h00, pour réparation de la conduite.',
    },
    href: '/servicos/agua-e-residuos',
    startsAt: offsetDays(-1),
    endsAt: offsetDays(3),
  },
];

/** Apenas o que hoje está realmente em vigor. */
export function activeAlerts(today = new Date().toISOString().slice(0, 10)): Alert[] {
  return alerts.filter((alert) => alert.startsAt <= today && alert.endsAt >= today);
}
