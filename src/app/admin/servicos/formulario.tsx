'use client';

import { useState } from 'react';

import { Icon } from '@/components/ui/icon';
import { guardarServico } from '../acoes';
import { AreaDeTexto, Campo, Escolha, FormularioGravavel } from '../pecas';

/**
 * A ficha de um serviço.
 *
 * Organizada pelas cinco perguntas que um munícipe faz, pela ordem por que
 * as faz: sirvo-me disto? o que levo? quanto demora? quanto custo? como
 * faço? É essa constância que torna o catálogo útil — e é por isso que o
 * formulário as pede todas, em vez de as deixar facultativas.
 */

export interface PassoEmEdicao {
  titulo: string;
  detalhe: string;
}

export interface ServicoEmEdicao {
  id: string;
  titulo: string;
  resumo: string;
  area: string;
  paraQuem: string;
  prazo: string;
  custo: string;
  documentos: string;
  passos: PassoEmEdicao[];
  canais: string[];
  enderecoOnline: string;
  servico: string;
  simbolo: string;
  destaque: boolean;
}

const AREAS = [
  { valor: 'balcao', rotulo: 'Balcão único' },
  { valor: 'urbanismo', rotulo: 'Urbanismo' },
  { valor: 'agua-e-residuos', rotulo: 'Água e resíduos' },
  { valor: 'taxas-e-licencas', rotulo: 'Taxas e licenças' },
  { valor: 'acao-social', rotulo: 'Ação social' },
  { valor: 'educacao', rotulo: 'Educação' },
  { valor: 'saude', rotulo: 'Saúde' },
  { valor: 'apoios', rotulo: 'Apoios' },
];

const CANAIS = [
  { valor: 'online', rotulo: 'Em linha' },
  { valor: 'presencial', rotulo: 'Ao balcão' },
  { valor: 'correio', rotulo: 'Por correio' },
  { valor: 'telefone', rotulo: 'Por telefone' },
];

const SIMBOLOS = [
  { valor: 'fileText', rotulo: 'Documento' },
  { valor: 'droplet', rotulo: 'Água' },
  { valor: 'building', rotulo: 'Edifício' },
  { valor: 'users', rotulo: 'Pessoas' },
  { valor: 'heart', rotulo: 'Apoio social' },
  { valor: 'graduation', rotulo: 'Educação' },
  { valor: 'euro', rotulo: 'Pagamentos' },
  { valor: 'recycle', rotulo: 'Resíduos' },
  { valor: 'wrench', rotulo: 'Obras' },
  { valor: 'leaf', rotulo: 'Ambiente' },
];

const PASSO_VAZIO: PassoEmEdicao = { titulo: '', detalhe: '' };

export function FormularioDeServico({ servico }: { servico?: ServicoEmEdicao }) {
  const [passos, setPassos] = useState<PassoEmEdicao[]>(
    servico?.passos.length ? servico.passos : [{ ...PASSO_VAZIO }],
  );

  function alterarPasso(indice: number, campo: keyof PassoEmEdicao, valor: string) {
    setPassos((atuais) =>
      atuais.map((passo, i) => (i === indice ? { ...passo, [campo]: valor } : passo)),
    );
  }

  return (
    <FormularioGravavel
      acao={guardarServico}
      voltarPara="/admin/servicos"
      rotuloGravar={servico ? 'Guardar alterações' : 'Criar serviço'}
    >
      {servico ? <input type="hidden" name="id" value={servico.id} /> : null}

      <fieldset className="mb-8 rounded-lg border border-line bg-surface p-5">
        <legend className="px-2 font-serif text-lg font-semibold">O serviço</legend>

        <Campo
          etiqueta="Nome do serviço"
          nome="titulo"
          valor={servico?.titulo}
          obrigatorio
          ajuda="Como o munícipe lhe chamaria. «Pagar a água», não «Gestão de faturação de consumos»."
        />

        <AreaDeTexto
          etiqueta="Numa frase"
          nome="resumo"
          valor={servico?.resumo}
          linhas={2}
          obrigatorio
          ajuda="O que aparece na listagem, por baixo do nome."
        />

        <div className="grid gap-x-6 md:grid-cols-2">
          <Escolha etiqueta="Área" nome="area" valor={servico?.area ?? 'balcao'} opcoes={AREAS} />
          <Escolha
            etiqueta="Símbolo"
            nome="simbolo"
            valor={servico?.simbolo ?? 'fileText'}
            opcoes={SIMBOLOS}
            ajuda="O desenho que acompanha o serviço na listagem."
          />
        </div>

        <Campo
          etiqueta="Serviço responsável"
          nome="servico"
          valor={servico?.servico}
          ajuda="A quem pertence. Ex.: Divisão de Urbanismo."
        />

        <label className="flex items-center gap-2.5 font-medium">
          <input
            type="checkbox"
            name="destaque"
            defaultChecked={servico?.destaque ?? false}
            className="size-5"
          />
          Mostrar em destaque na página inicial
        </label>
      </fieldset>

      {/* ----------------------------------------------- as cinco perguntas -- */}

      <fieldset className="mb-8 rounded-lg border border-line bg-surface p-5">
        <legend className="px-2 font-serif text-lg font-semibold">
          As perguntas de quem chega
        </legend>
        <p className="mb-5 text-sm text-ink-muted">
          Responder a estas por escrito é o que evita uma ida ao balcão só para perguntar. Nenhuma
          pode ficar em branco.
        </p>

        <AreaDeTexto
          etiqueta="A quem se destina"
          nome="paraQuem"
          valor={servico?.paraQuem}
          linhas={2}
          obrigatorio
          ajuda="Ex.: «Proprietários de imóveis no concelho.»"
        />

        <AreaDeTexto
          etiqueta="O que é preciso levar"
          nome="documentos"
          valor={servico?.documentos}
          linhas={5}
          ajuda="Um documento por linha. Deixe vazio se não for preciso levar nada."
        />

        <div className="grid gap-x-6 md:grid-cols-2">
          <Campo
            etiqueta="Quanto tempo demora"
            nome="prazo"
            valor={servico?.prazo}
            obrigatorio
            ajuda="Ex.: «Até 15 dias úteis» ou «Imediato»."
          />
          <Campo
            etiqueta="Quanto custa"
            nome="custo"
            valor={servico?.custo}
            obrigatorio
            ajuda="Ex.: «Gratuito» ou «12,50 €»."
          />
        </div>
      </fieldset>

      {/* ------------------------------------------------------------ passos -- */}

      <fieldset className="mb-8 rounded-lg border border-line bg-surface p-5">
        <legend className="px-2 font-serif text-lg font-semibold">Como se faz</legend>
        <p className="mb-4 text-sm text-ink-muted">
          Os passos, pela ordem. Escreva como se explicasse a alguém ao balcão.
        </p>

        <ol className="mb-4 list-none space-y-4 p-0">
          {passos.map((passo, indice) => (
            <li key={indice} className="rounded-md border border-line bg-surface-alt p-4">
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-ink-muted">Passo {indice + 1}</span>
                {passos.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => setPassos((atuais) => atuais.filter((_, i) => i !== indice))}
                    className="inline-flex min-h-9 items-center gap-1 rounded-md border border-line-strong bg-surface px-2.5 text-sm text-ink hover:border-danger hover:text-danger"
                  >
                    <Icon name="trash" size={15} />
                    Retirar
                  </button>
                ) : null}
              </div>

              <label htmlFor={`passo-${indice}`} className="sr-only">
                Título do passo {indice + 1}
              </label>
              <input
                id={`passo-${indice}`}
                name="passoTitulo"
                value={passo.titulo}
                onChange={(evento) => alterarPasso(indice, 'titulo', evento.target.value)}
                placeholder="O que fazer. Ex.: «Reúna os documentos»"
                className="mb-2 min-h-11 w-full rounded-md border border-line-strong bg-surface px-3 text-ink"
              />

              <label htmlFor={`detalhe-${indice}`} className="sr-only">
                Explicação do passo {indice + 1}
              </label>
              <textarea
                id={`detalhe-${indice}`}
                name="passoDetalhe"
                value={passo.detalhe}
                onChange={(evento) => alterarPasso(indice, 'detalhe', evento.target.value)}
                rows={2}
                placeholder="A explicação, com o pormenor que evita uma segunda vinda."
                className="w-full rounded-md border border-line-strong bg-surface px-3 py-2 text-ink"
              />
            </li>
          ))}
        </ol>

        <button
          type="button"
          onClick={() => setPassos((atuais) => [...atuais, { ...PASSO_VAZIO }])}
          className="inline-flex min-h-11 items-center gap-2 rounded-md border border-line-strong px-4 font-medium text-ink hover:border-accent-600"
        >
          <Icon name="plus" size={18} />
          Acrescentar passo
        </button>
      </fieldset>

      {/* ------------------------------------------------------------ canais -- */}

      <fieldset className="mb-8 rounded-lg border border-line bg-surface p-5">
        <legend className="px-2 font-serif text-lg font-semibold">Onde se trata</legend>

        <div className="mb-5 flex flex-wrap gap-2">
          {CANAIS.map((canal) => (
            <label
              key={canal.valor}
              className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-pill border border-line-strong px-4"
            >
              <input
                type="checkbox"
                name="canais"
                value={canal.valor}
                defaultChecked={servico?.canais.includes(canal.valor) ?? canal.valor === 'presencial'}
                className="size-4"
              />
              {canal.rotulo}
            </label>
          ))}
        </div>

        <Campo
          etiqueta="Endereço para tratar em linha"
          nome="enderecoOnline"
          valor={servico?.enderecoOnline}
          ajuda="Se houver. Ex.: /servicos/pagamentos"
        />
      </fieldset>
    </FormularioGravavel>
  );
}
