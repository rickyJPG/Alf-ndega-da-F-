#!/usr/bin/env node
/**
 * Arranca o portal numa porta, depois de o build estar pronto.
 *
 * A bateria de testes levanta três servidores do mesmo build: o normal, um
 * em demonstração e um com a demonstração já terminada. Só o primeiro
 * compila; estes dois esperam por ele.
 *
 * Esperam pela **resposta** do primeiro servidor e não pelo ficheiro
 * `.next/BUILD_ID`: o ficheiro pode ser o de uma compilação anterior, e
 * nesse caso arrancariam com o portal errado e os testes falhariam por uma
 * razão que não tem nada que ver com o que estão a verificar.
 *
 *   node scripts/esperar-e-arrancar.mjs <porta> [porta-a-esperar]
 */
import { spawn } from 'node:child_process';

const porta = process.argv[2];
const portaDeReferencia = process.argv[3] ?? '3100';

if (!porta) {
  console.error('Falta a porta. Uso: node scripts/esperar-e-arrancar.mjs <porta>');
  process.exit(1);
}

const LIMITE_MS = 5 * 60 * 1000;
const INTERVALO_MS = 1000;

async function esperarPeloPrimeiro() {
  const fim = Date.now() + LIMITE_MS;

  while (Date.now() < fim) {
    try {
      const resposta = await fetch(`http://127.0.0.1:${portaDeReferencia}/`, {
        signal: AbortSignal.timeout(4000),
      });
      // Qualquer resposta serve: em demonstração terminada o portal
      // responde 200 com o ecrã de fim, e com o interruptor ligado também.
      if (resposta.status > 0) return;
    } catch {
      // Ainda não está de pé.
    }
    await new Promise((resolver) => setTimeout(resolver, INTERVALO_MS));
  }

  console.error(
    `[esperar-e-arrancar] O servidor da porta ${portaDeReferencia} não respondeu em ` +
      `${LIMITE_MS / 1000} s. Não arranco na ${porta} sem saber que o build está feito.`,
  );
  process.exit(1);
}

await esperarPeloPrimeiro();

const filho = spawn('npx', ['next', 'start', '--port', porta], {
  stdio: 'inherit',
  env: process.env,
});

filho.on('exit', (codigo) => process.exit(codigo ?? 0));
for (const sinal of ['SIGINT', 'SIGTERM']) {
  process.on(sinal, () => filho.kill(sinal));
}
