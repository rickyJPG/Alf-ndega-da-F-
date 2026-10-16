import { afterEach, describe, expect, it, vi } from 'vitest';

import { ehAmbienteDeDesenvolvimento } from '@/lib/ambiente';

/**
 * A regra que decide se as páginas de desenvolvimento existem.
 *
 * O guia de estilo respondia 200 em produção, e o que o escondia era uma
 * linha de `Disallow` no `robots.txt` — um pedido aos motores de busca, não
 * um controlo de acesso. Quem escrevesse o endereço entrava.
 *
 * O teste de ponta a ponta (`tests/e2e/styleguide.spec.ts`) confirma o 404
 * contra o build de produção, que é a prova que conta. Este fixa a regra em
 * si, para que uma inversão de sinal não passe sem ninguém dar por ela.
 */

describe('ambiente', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('em produção, as páginas de desenvolvimento não existem', () => {
    vi.stubEnv('NODE_ENV', 'production');
    expect(ehAmbienteDeDesenvolvimento()).toBe(false);
  });

  it('com o `next dev`, existem', () => {
    vi.stubEnv('NODE_ENV', 'development');
    expect(ehAmbienteDeDesenvolvimento()).toBe(true);
  });

  it('qualquer ambiente que não seja produção comporta-se como desenvolvimento', () => {
    // `!== 'production'` e não `=== 'development'`: o que interessa garantir
    // é o lado de produção, e um ambiente novo com outro nome não deve
    // passar a esconder a página de quem está a trabalhar nela.
    for (const ambiente of ['test', 'staging', '']) {
      vi.stubEnv('NODE_ENV', ambiente);
      expect(ehAmbienteDeDesenvolvimento(), ambiente).toBe(true);
    }
  });
});
