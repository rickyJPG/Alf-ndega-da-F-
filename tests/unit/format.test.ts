import { describe, expect, it } from 'vitest';
import {
  daysUntil,
  formatCurrency,
  formatDate,
  formatDateLong,
  formatDeadline,
  formatFileSize,
  formatNumber,
  formatTime,
} from '@/lib/format';

/**
 * Formatos portugueses. São detalhes que se notam quando estão errados:
 * um «July 25, 2026» num portal municipal denuncia logo que ninguém olhou.
 */
describe('formatação pt-PT', () => {
  it('escreve datas curtas como «25 jul 2026»', () => {
    expect(formatDate('2026-07-25')).toBe('25 jul 2026');
    expect(formatDate('2026-01-05')).toBe('5 jan 2026');
    expect(formatDate('2026-12-31')).toBe('31 dez 2026');
  });

  it('escreve datas por extenso com «de»', () => {
    expect(formatDateLong('2026-03-08')).toBe('8 de março de 2026');
  });

  it('usa o formato de 24 horas', () => {
    expect(formatTime('9:05')).toBe('09:05');
    expect(formatTime('21:30')).toBe('21:30');
  });

  it('formata números e moeda com a convenção portuguesa', () => {
    // Espaço fino como separador de milhares, vírgula decimal, símbolo no fim.
    expect(formatNumber(1234567).replace(/ | /g, ' ')).toBe('1 234 567');
    expect(formatCurrency(12480000).replace(/ | /g, ' ')).toBe('12 480 000 €');
  });

  it('indica o tamanho dos ficheiros com vírgula decimal', () => {
    expect(formatFileSize(2_411_724)).toBe('2,3 MB');
    expect(formatFileSize(76_800)).toBe('75 kB');
  });

  it('conta os dias que faltam em dias inteiros UTC', () => {
    expect(daysUntil('2026-08-06', '2026-07-25')).toBe(12);
    expect(daysUntil('2026-07-25', '2026-07-25')).toBe(0);
    expect(daysUntil('2026-07-24', '2026-07-25')).toBe(-1);
  });

  it('descreve o prazo em texto e atribui o tom certo', () => {
    const labels = {
      today: 'Termina hoje',
      tomorrow: 'Termina amanhã',
      days: (n: number) => `Termina em ${n} dias`,
      ended: 'Prazo terminado',
    };

    expect(formatDeadline('2026-08-06', labels, '2026-07-25')).toMatchObject({
      text: 'Termina em 12 dias',
      tone: 'neutral',
    });
    expect(formatDeadline('2026-07-28', labels, '2026-07-25').tone).toBe('warning');
    expect(formatDeadline('2026-07-26', labels, '2026-07-25')).toMatchObject({
      text: 'Termina amanhã',
      tone: 'danger',
    });
    expect(formatDeadline('2026-07-25', labels, '2026-07-25').text).toBe('Termina hoje');
    expect(formatDeadline('2026-07-01', labels, '2026-07-25').tone).toBe('ended');
  });
});
