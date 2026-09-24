'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

import { manterSessaoAtiva } from './acoes';

/**
 * Avisa o servidor de que alguém está a usar o painel.
 *
 * Não desenha nada. Existe só para que quem passa a manhã a consultar
 * listas — sem publicar nada — não seja desligado como se tivesse estado
 * parado.
 *
 * `usePathname()` na lista de dependências é o que faz isto funcionar. No
 * App Router, o layout fica montado enquanto se navega entre ecrãs do
 * painel: sem essa dependência, o efeito corria uma vez ao abrir o
 * separador e nunca mais, e alguém que navegasse a manhã inteira continuava
 * a ver a sessão a envelhecer. Com ela, corre a cada mudança de ecrã.
 *
 * O custo é um pedido por navegação, e quase sempre sem efeito nenhum:
 * `renovarSessao()` só reescreve o cookie depois de passada metade do
 * prazo. O resto das vezes o servidor lê o cookie e devolve logo.
 *
 * Falhar aqui não tem consequência — se o pedido não chegar, a sessão
 * apenas não é esticada desta vez. Por isso o erro é engolido em vez de
 * aparecer na consola de quem está a trabalhar.
 */
export function ManterSessao() {
  const caminho = usePathname();

  useEffect(() => {
    void manterSessaoAtiva().catch(() => {});
  }, [caminho]);

  return null;
}
