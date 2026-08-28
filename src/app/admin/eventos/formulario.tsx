'use client';

import { guardarEvento } from '../acoes';
import { AreaDeTexto, Campo, Escolha, FormularioGravavel } from '../pecas';

export interface EventoEmEdicao {
  id: string;
  titulo: string;
  resumo: string;
  categoria: string;
  inicio: string;
  fim: string;
  hora: string;
  local: string;
  preco: string;
}

const CATEGORIAS = [
  'Cultura',
  'Feira',
  'Desporto',
  'Sessão pública',
  'Infantil',
  'Formação',
  'Música',
].map((nome) => ({ valor: nome, rotulo: nome }));

export function FormularioDeEvento({ evento }: { evento?: EventoEmEdicao }) {
  return (
    <FormularioGravavel
      acao={guardarEvento}
      voltarPara="/admin/eventos"
      rotuloGravar={evento ? 'Guardar alterações' : 'Pôr na agenda'}
    >
      {evento ? <input type="hidden" name="id" value={evento.id} /> : null}

      <fieldset className="mb-8 rounded-lg border border-line bg-surface p-5">
        <legend className="px-2 font-serif text-lg font-semibold">O evento</legend>

        <Campo etiqueta="Nome do evento" nome="titulo" valor={evento?.titulo} obrigatorio />

        <AreaDeTexto
          etiqueta="Descrição"
          nome="resumo"
          valor={evento?.resumo}
          linhas={4}
          ajuda="Duas ou três linhas sobre o que vai acontecer."
        />

        <Escolha
          etiqueta="Tipo"
          nome="categoria"
          valor={evento?.categoria ?? 'Cultura'}
          opcoes={CATEGORIAS}
        />
      </fieldset>

      <fieldset className="mb-8 rounded-lg border border-line bg-surface p-5">
        <legend className="px-2 font-serif text-lg font-semibold">Quando</legend>

        <div className="grid gap-x-6 md:grid-cols-3">
          <Campo
            etiqueta="Dia"
            nome="inicio"
            tipo="date"
            valor={evento?.inicio ?? new Date().toISOString().slice(0, 10)}
            obrigatorio
          />
          <Campo
            etiqueta="Até (se durar mais de um dia)"
            nome="fim"
            tipo="date"
            valor={evento?.fim}
          />
          <Campo
            etiqueta="Hora"
            nome="hora"
            tipo="time"
            valor={evento?.hora}
            ajuda="Em branco = todo o dia."
          />
        </div>
      </fieldset>

      <fieldset className="mb-8 rounded-lg border border-line bg-surface p-5">
        <legend className="px-2 font-serif text-lg font-semibold">Onde e quanto</legend>

        <Campo
          etiqueta="Local"
          nome="local"
          valor={evento?.local}
          ajuda="Ex.: Centro Cultural de Alfândega da Fé, ou Largo da Igreja, Sambade."
        />

        <Campo
          etiqueta="Preço"
          nome="preco"
          valor={evento?.preco ?? 'Entrada livre'}
          ajuda="Escreva por extenso: «Entrada livre», «3 € (inclui seguro)», «Gratuito, inscrição obrigatória»."
        />
      </fieldset>
    </FormularioGravavel>
  );
}
