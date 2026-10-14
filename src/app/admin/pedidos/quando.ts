import { formatDate } from '@/lib/format';

/**
 * «Há dois dias», em vez de uma data só.
 *
 * Num ecrã de pedidos à espera de resposta, a distância conta mais do que o
 * dia: «há 9 dias» diz logo que alguém está à espera há demasiado tempo, e
 * «12 out 2026» obriga a fazer a conta de cabeça.
 */
export function quandoFoi(iso: string, agora: Date = new Date()): string {
  const dia = iso.slice(0, 10);
  const quando = new Date(`${dia}T00:00:00.000Z`);
  const hoje = new Date(
    Date.UTC(agora.getUTCFullYear(), agora.getUTCMonth(), agora.getUTCDate()),
  );

  const dias = Math.round((hoje.getTime() - quando.getTime()) / 86_400_000);

  if (Number.isNaN(dias)) return formatDate(dia);
  if (dias <= 0) return `Hoje · ${formatDate(dia)}`;
  if (dias === 1) return `Ontem · ${formatDate(dia)}`;
  return `Há ${dias} dias · ${formatDate(dia)}`;
}
