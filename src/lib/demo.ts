import { hojeIso } from '@/content/data/clock';

/**
 * Modo de demonstração.
 *
 * Serve para mostrar o portal a um município interessado sem que essa
 * demonstração se confunda com o sítio verdadeiro, e sem que fique a
 * funcionar para sempre depois de a conversa acabar.
 *
 * Liga-se com `DEMO_MODE=true` e muda quatro coisas, todas reversíveis por
 * tirar a variável:
 *
 *  1. uma faixa em todas as páginas públicas a dizer que é uma demonstração;
 *  2. `noindex, nofollow` em todas as páginas, `Disallow: /` no robots.txt e
 *     um mapa do sítio vazio — uma demonstração indexada pelo Google seria
 *     um sítio falso do Município a aparecer em pesquisas;
 *  3. um aviso por cima dos formulários que recolhem dados de pessoas, a
 *     pedir que não escrevam dados reais;
 *  4. com `DEMO_VALIDO_ATE`, uma data a partir da qual tudo isto se fecha.
 *
 * **Sem `DEMO_MODE`, nada disto existe** — nem a faixa, nem os avisos, nem a
 * validade. Uma instalação vendida não pode ficar com restos da
 * demonstração, nem pode expirar por alguém se ter esquecido de tirar uma
 * variável. Por isso `DEMO_VALIDO_ATE` sozinha não faz absolutamente nada.
 */

export function emDemonstracao(): boolean {
  return process.env.DEMO_MODE === 'true';
}

/**
 * O último dia em que a demonstração funciona, inclusive.
 *
 * `DEMO_VALIDO_ATE=2026-12-15` quer dizer que o dia 15 ainda está dentro e
 * que a demonstração fecha no dia 16. É assim que uma pessoa lê «válido
 * até» — e, numa funcionalidade que corta o acesso, interpretar à letra o
 * que está escrito vale mais do que ser esperto.
 *
 * Uma data mal escrita é ignorada e o facto fica no registo. A alternativa
 * — tratá-la como já expirada — fechava a demonstração a meio de uma
 * reunião por causa de um erro de escrita.
 */
let avisoDeDataDado = false;

export function validoAte(): string | null {
  if (!emDemonstracao()) return null;

  const bruto = process.env.DEMO_VALIDO_ATE?.trim();
  if (!bruto) return null;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(bruto)) {
    if (!avisoDeDataDado) {
      avisoDeDataDado = true;
      console.warn(
        `\n[demonstração] DEMO_VALIDO_ATE está escrita como "${bruto}" e não é uma data.\n` +
          '[demonstração] A forma certa é AAAA-MM-DD, por exemplo 2026-12-15.\n' +
          '[demonstração] A demonstração continua sem prazo.\n',
      );
    }
    return null;
  }

  return bruto;
}

/**
 * A demonstração já passou do prazo?
 *
 * Comparação de texto entre datas ISO, que ordenam na mesma ordem em que
 * se leem. `hojeIso()` respeita `MOCK_TODAY`, o que torna isto verificável
 * sem esperar pelo calendário.
 */
export function demonstracaoTerminada(): boolean {
  const limite = validoAte();
  return limite !== null && hojeIso() > limite;
}

/** Quantos dias faltam. Negativo depois de terminar, `null` sem prazo. */
export function diasQueFaltam(): number | null {
  const limite = validoAte();
  if (!limite) return null;

  const dia = (iso: string) => Date.parse(`${iso}T00:00:00.000Z`);
  return Math.round((dia(limite) - dia(hojeIso())) / 86_400_000);
}

/**
 * Como retomar a conversa, mostrado no ecrã de fim.
 *
 * Opcional de propósito: sem ela o ecrã não inventa contacto nenhum.
 */
export function contactoDaDemo(): string | undefined {
  const contacto = process.env.DEMO_CONTACTO?.trim();
  return contacto || undefined;
}
