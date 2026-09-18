'use client';

import { Icon } from '@/components/ui/icon';
import { guardarPagina } from '../acoes';
import { AreaDeTexto, Campo, FormularioGravavel } from '../pecas';

/**
 * Editor de uma página do portal.
 *
 * Mostra os blocos pela ordem em que aparecem, e deixa escrever nos que só
 * têm texto. Os outros ficam visíveis mas fechados, com a razão à vista —
 * esconder a galeria de uma página faria parecer que ela desapareceu.
 */

export interface BlocoEmEdicao {
  indice: number;
  tipo: string;
  editavel: boolean;
  /** Descrição em português corrente, para quem não sabe o que é um «bloco». */
  descricao: string;
  titulo: string;
  /** Parágrafos separados por linha em branco, ou itens um por linha. */
  conteudo: string;
}

export interface PaginaEmEdicao {
  caminho: string;
  titulo: string;
  lead: string;
  blocos: BlocoEmEdicao[];
}

export function FormularioDePagina({ pagina }: { pagina: PaginaEmEdicao }) {
  return (
    <FormularioGravavel
      acao={guardarPagina}
      voltarPara="/admin/paginas"
      rotuloGravar="Guardar alterações"
    >
      <input type="hidden" name="caminho" value={pagina.caminho} />

      <fieldset className="mb-8 rounded-lg border border-line bg-surface p-5">
        <legend className="px-2 font-serif text-lg font-semibold">Cabeçalho da página</legend>

        <Campo etiqueta="Título" nome="titulo" valor={pagina.titulo} obrigatorio />
        <AreaDeTexto
          etiqueta="Frase de entrada"
          nome="lead"
          valor={pagina.lead}
          linhas={2}
          ajuda="A frase maior, por baixo do título."
        />
      </fieldset>

      {pagina.blocos.map((bloco) =>
        bloco.editavel ? (
          <fieldset
            key={bloco.indice}
            className="mb-6 rounded-lg border border-line bg-surface p-5"
          >
            <legend className="px-2 text-sm font-semibold tracking-wide text-ink-muted uppercase">
              {bloco.descricao}
            </legend>

            <Campo
              etiqueta="Título desta parte"
              nome={`bloco-${bloco.indice}-titulo`}
              valor={bloco.titulo}
            />

            {bloco.tipo === 'prose' ? (
              <AreaDeTexto
                etiqueta="Texto"
                nome={`bloco-${bloco.indice}-paragrafos`}
                valor={bloco.conteudo}
                linhas={10}
                ajuda="Deixe uma linha em branco entre parágrafos."
              />
            ) : null}

            {bloco.tipo === 'list' ? (
              <AreaDeTexto
                etiqueta="Itens da lista"
                nome={`bloco-${bloco.indice}-itens`}
                valor={bloco.conteudo}
                linhas={8}
                ajuda="Um item por linha."
              />
            ) : null}

            {bloco.tipo === 'callout' ? (
              <AreaDeTexto
                etiqueta="Texto do destaque"
                nome={`bloco-${bloco.indice}-corpo`}
                valor={bloco.conteudo}
                linhas={4}
              />
            ) : null}
          </fieldset>
        ) : (
          <div
            key={bloco.indice}
            className="mb-6 flex items-start gap-2.5 rounded-lg border border-dashed border-line-strong p-4 text-sm"
          >
            <Icon name="info" size={18} className="mt-0.5 shrink-0 text-ink-muted" />
            <span>
              <strong className="block text-ink">{bloco.descricao}</strong>
              <span className="text-ink-muted">
                Continua nesta página, no sítio onde está. Não se altera por aqui — peça a quem
                mantém o portal.
              </span>
            </span>
          </div>
        ),
      )}
    </FormularioGravavel>
  );
}
