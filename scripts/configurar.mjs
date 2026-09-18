#!/usr/bin/env node
import { randomBytes } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Prepara o ficheiro de configuração do portal.
 *
 * Corre sozinho no arranque (ver `npm start` e INICIAR-PORTAL.bat) e é
 * idempotente: se `.env.local` já existir, só acrescenta o que faltar e nunca
 * toca no que lá está.
 *
 * Porquê um ficheiro e não variáveis escritas à mão na linha de comandos:
 * uma variável definida com `set` no Windows vale só naquela janela e
 * desaparece ao fechá-la. Pior — sem `ADMIN_PASSWORD` fixa, o servidor gera
 * uma nova a cada arranque e, como o segredo de assinatura assenta nela,
 * todas as sessões abertas morrem no mesmo instante. Era isso que fazia o
 * painel «esquecer» a palavra-passe entre reinícios.
 */

const RAIZ = process.cwd();
const DESTINO = join(RAIZ, '.env.local');

/**
 * Palavra-passe legível ao telefone: sem caracteres que se confundam.
 *
 * Fora l, 1, o, 0 — e o alfabeto fica com 32 letras de propósito. Como 256
 * é múltiplo de 32, o resto da divisão não favorece nenhuma letra; com 33
 * as primeiras saíam com mais frequência do que as últimas.
 */
function palavraPasseLegivel() {
  const alfabeto = 'abcdefghijkmnpqrstuvwxyz23456789';
  const bytes = randomBytes(16);
  return Array.from(bytes, (b) => alfabeto[b % alfabeto.length])
    .join('')
    .replace(/(.{4})(?=.)/g, '$1-'); // xxxx-xxxx-xxxx-xxxx
}

const segredo = () => randomBytes(32).toString('base64url');

const VALORES = {
  ADMIN_PASSWORD: palavraPasseLegivel,
  ADMIN_SECRET: segredo,
  NEWSLETTER_SECRET: segredo,
};

const CABECALHO = `# Configuração desta instalação do portal.
#
# Ficheiro criado automaticamente. NÃO o envie para o repositório nem o
# partilhe — contém a palavra-passe do painel de administração.
#
# Para mudar a palavra-passe: altere a linha ADMIN_PASSWORD, grave, e
# reinicie o portal. Não mexa nos segredos a não ser que queira desligar
# toda a gente que esteja com sessão aberta.
`;

const existente = existsSync(DESTINO) ? readFileSync(DESTINO, 'utf8') : '';
const linhasNovas = [];

for (const [chave, gerar] of Object.entries(VALORES)) {
  // Linha comentada não conta como definida.
  if (new RegExp(`^\\s*${chave}=`, 'm').test(existente)) continue;
  linhasNovas.push(`${chave}=${gerar()}`);
}

if (linhasNovas.length === 0) {
  if (process.argv.includes('--silencioso')) process.exit(0);
  console.log('Configuração já existente em .env.local — nada a fazer.');
  process.exit(0);
}

const conteudo = existente
  ? `${existente.replace(/\n*$/, '')}\n${linhasNovas.join('\n')}\n`
  : `${CABECALHO}\n${linhasNovas.join('\n')}\n`;

writeFileSync(DESTINO, conteudo, { encoding: 'utf8', mode: 0o600 });

const palavraPasse = /^\s*ADMIN_PASSWORD=(.+)$/m.exec(conteudo)?.[1]?.trim();

console.log(`
====================================================================
  PORTAL CONFIGURADO
====================================================================

  Palavra-passe do painel de administração:

      ${palavraPasse}

  Guarde-a. Fica gravada em .env.local e não volta a mudar, mesmo
  que reinicie o portal.

  O painel abre em:  http://localhost:3000/admin

====================================================================
`);
