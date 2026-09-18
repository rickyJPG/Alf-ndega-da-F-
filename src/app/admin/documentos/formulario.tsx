'use client';

import { guardarDocumento } from '../acoes';
import { AreaDeTexto, Campo, Escolha, FormularioGravavel } from '../pecas';

/**
 * O formulário de um documento.
 *
 * O ficheiro é facultativo ao corrigir: quem só quer arranjar um título
 * escrito à pressa não tem de voltar a escolher o PDF. Ao criar de novo, é
 * obrigatório — um documento sem ficheiro não serve para nada.
 */

export interface DocumentoEmEdicao {
  id: string;
  titulo: string;
  resumo: string;
  tipo: string;
  area: string;
  publicadoEm: string;
  ficheiroAtual?: { href: string; formato: string; bytes: number };
}

const TIPOS = [
  { valor: 'formulario', rotulo: 'Formulário — para o munícipe preencher' },
  { valor: 'regulamento', rotulo: 'Regulamento' },
  { valor: 'edital', rotulo: 'Edital' },
  { valor: 'ata', rotulo: 'Ata de reunião' },
  { valor: 'relatorio', rotulo: 'Relatório' },
  { valor: 'plano', rotulo: 'Plano' },
  { valor: 'aviso', rotulo: 'Aviso' },
  { valor: 'dados', rotulo: 'Dados abertos' },
];

const AREAS = [
  { valor: 'municipio', rotulo: 'Município' },
  { valor: 'transparencia', rotulo: 'Transparência' },
  { valor: 'balcao', rotulo: 'Balcão único' },
  { valor: 'urbanismo', rotulo: 'Urbanismo' },
  { valor: 'agua-e-residuos', rotulo: 'Água e resíduos' },
  { valor: 'taxas-e-licencas', rotulo: 'Taxas e licenças' },
  { valor: 'acao-social', rotulo: 'Ação social' },
  { valor: 'educacao', rotulo: 'Educação' },
  { valor: 'saude', rotulo: 'Saúde' },
  { valor: 'apoios', rotulo: 'Apoios' },
];

function tamanhoLegivel(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1).replace('.', ',')} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} kB`;
}

export function FormularioDeDocumento({ documento }: { documento?: DocumentoEmEdicao }) {
  const hoje = new Date().toISOString().slice(0, 10);

  return (
    <FormularioGravavel
      acao={guardarDocumento}
      voltarPara="/admin/documentos"
      rotuloGravar={documento ? 'Guardar alterações' : 'Publicar documento'}
    >
      {documento ? <input type="hidden" name="id" value={documento.id} /> : null}

      <fieldset className="mb-8 rounded-lg border border-line bg-surface p-5">
        <legend className="px-2 font-serif text-lg font-semibold">O documento</legend>

        <Campo
          etiqueta="Título"
          nome="titulo"
          valor={documento?.titulo}
          obrigatorio
          ajuda="Como aparece na listagem e no botão de descarregar. Ex.: «Requerimento de licença de obras»."
        />

        <AreaDeTexto
          etiqueta="Para que serve"
          nome="resumo"
          valor={documento?.resumo}
          linhas={3}
          ajuda="Uma frase que explique quando é que o munícipe precisa deste documento."
        />

        <div className="grid gap-x-6 md:grid-cols-2">
          <Escolha
            etiqueta="Tipo"
            nome="tipo"
            valor={documento?.tipo ?? 'formulario'}
            opcoes={TIPOS}
          />
          <Escolha
            etiqueta="Área"
            nome="area"
            valor={documento?.area ?? 'municipio'}
            opcoes={AREAS}
            ajuda="Onde o documento é listado no portal."
          />
        </div>

        <Campo
          etiqueta="Data de publicação"
          nome="publicadoEm"
          tipo="date"
          valor={documento?.publicadoEm ?? hoje}
          ajuda="Define a ordem na listagem e o ano por que se filtra."
        />
      </fieldset>

      <fieldset className="mb-8 rounded-lg border border-line bg-surface p-5">
        <legend className="px-2 font-serif text-lg font-semibold">Ficheiro</legend>

        {documento?.ficheiroAtual ? (
          <p className="mb-4 rounded-md border border-line bg-surface-alt p-3 text-sm">
            Ficheiro atual:{' '}
            <a href={documento.ficheiroAtual.href} target="_blank" rel="noreferrer">
              {documento.ficheiroAtual.formato.toUpperCase()},{' '}
              {tamanhoLegivel(documento.ficheiroAtual.bytes)}
            </a>
            <span className="mt-1 block text-ink-muted">
              Deixe o campo abaixo vazio para o manter como está.
            </span>
          </p>
        ) : null}

        <Campo
          etiqueta={documento ? 'Substituir por' : 'Ficheiro'}
          nome="ficheiro"
          obrigatorio={!documento}
          ajuda="PDF, DOCX, XLSX, CSV, JSON ou ZIP, até 25 MB. O endereço do documento não muda quando substitui o ficheiro — as ligações já partilhadas continuam a funcionar."
        >
          <input
            id="ficheiro"
            name="ficheiro"
            type="file"
            accept=".pdf,.docx,.xlsx,.csv,.json,.zip"
            required={!documento}
            aria-describedby="ficheiro-ajuda"
            className="mt-2 block w-full rounded-md border border-line-strong bg-surface p-2 text-ink file:me-3 file:rounded file:border-0 file:bg-accent-600 file:px-3 file:py-1.5 file:font-semibold file:text-white"
          />
        </Campo>
      </fieldset>
    </FormularioGravavel>
  );
}
