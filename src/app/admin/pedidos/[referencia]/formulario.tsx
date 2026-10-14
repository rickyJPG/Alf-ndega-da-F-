'use client';

import { Icon } from '@/components/ui/icon';
import type { Pedido } from '@/lib/admin/pedidos';
import { ESTADO_EM_PORTUGUES, ESTADOS } from '@/lib/estado-do-pedido';
import { mudarEstadoDoPedido } from '../../acoes';
import { AreaDeTexto, Escolha, FormularioGravavel } from '../../pecas';

/**
 * Mudar o estado de um pedido, e escrever a resposta.
 *
 * Os dois juntos de propósito, num formulário só: mudar para «resolvido»
 * sem dizer o que foi feito deixa o munícipe a ver um rótulo verde e mais
 * nada. Guardando-os na mesma gravação, quem fecha o pedido tem o campo da
 * resposta à frente dos olhos no momento em que o fecha.
 */
export function FormularioDeEstado({ pedido }: { pedido: Pedido }) {
  return (
    <div className="rounded-lg border border-line bg-surface p-5">
      <h2 className="mb-1 font-serif text-xl font-semibold">Estado e resposta</h2>
      <p className="mb-4 flex items-start gap-2 text-sm text-ink-muted">
        <Icon name="info" size={16} className="mt-0.5 shrink-0" />
        <span>
          O munícipe vê o estado e a resposta ao consultar a referência no portal. Não vê mais
          nada — nem o que escreveu de contacto.
        </span>
      </p>

      <FormularioGravavel acao={mudarEstadoDoPedido} rotuloGravar="Guardar estado">
        <input type="hidden" name="referencia" value={pedido.referencia} />

        <Escolha
          etiqueta="Estado"
          nome="estado"
          valor={pedido.estado}
          opcoes={ESTADOS.map((estado) => ({
            valor: estado,
            rotulo: ESTADO_EM_PORTUGUES[estado],
          }))}
          ajuda="«Sem seguimento» é para o que não é da competência da Câmara ou já foi tratado noutro pedido."
        />

        <AreaDeTexto
          etiqueta="Resposta ao munícipe"
          nome="resposta"
          valor={pedido.resposta ?? ''}
          linhas={4}
          ajuda="Uma ou duas frases, escritas para quem fez o pedido. Deixe vazio para não dizer nada por agora."
        />
      </FormularioGravavel>
    </div>
  );
}
