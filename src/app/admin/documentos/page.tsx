import Link from 'next/link';

import { Icon } from '@/components/ui/icon';
import { getDocuments } from '@/content';
import { exigirEntrada } from '@/lib/admin/sessao';
import { ficheiroExiste } from '@/lib/documentos';
import { formatDate, formatFileSize } from '@/lib/format';
import { apagarDocumento } from '../acoes';
import { BotaoApagar, BotaoNovo, CabecalhoDaPagina, Vazio } from '../pecas';

export const dynamic = 'force-dynamic';

const TIPOS: Record<string, string> = {
  formulario: 'Formulário',
  regulamento: 'Regulamento',
  edital: 'Edital',
  ata: 'Ata',
  relatorio: 'Relatório',
  plano: 'Plano',
  aviso: 'Aviso',
  dados: 'Dados abertos',
};

export default async function ListaDeDocumentos() {
  await exigirEntrada();
  const documentos = await getDocuments();

  const emFalta = documentos.filter((documento) => !ficheiroExiste(documento.file.href)).length;

  return (
    <>
      <CabecalhoDaPagina
        titulo="Documentos"
        descricao="Formulários, regulamentos, editais e atas. É daqui que o munícipe os descarrega."
        accao={<BotaoNovo href="/admin/documentos/novo">Publicar documento</BotaoNovo>}
      />

      {emFalta > 0 ? (
        <p
          role="status"
          className="mb-6 flex items-start gap-2.5 rounded-md border border-s-4 border-warning bg-warning-surface p-4"
        >
          <Icon name="alert" size={20} className="mt-0.5 shrink-0" />
          <span>
            <strong className="block">
              {emFalta === 1
                ? 'Um documento está sem ficheiro.'
                : `${emFalta} documentos estão sem ficheiro.`}
            </strong>
            Aparecem no portal, mas quem tentar descarregar não recebe nada. Estão assinalados na
            lista — abra cada um e escolha o ficheiro.
          </span>
        </p>
      ) : null}

      {documentos.length === 0 ? (
        <Vazio icone="fileText" texto="Ainda não há documentos publicados." />
      ) : (
        <ul className="list-none divide-y divide-line rounded-lg border border-line bg-surface p-0">
          {documentos.map((documento) => {
            const existe = ficheiroExiste(documento.file.href);

            return (
              <li key={documento.id} className="flex flex-wrap items-start gap-4 p-4">
                <span
                  className={`flex size-11 shrink-0 items-center justify-center rounded-md border ${
                    existe
                      ? 'border-line bg-surface-alt text-ink-muted'
                      : 'border-warning bg-warning-surface text-ink'
                  }`}
                >
                  <Icon name={existe ? 'fileText' : 'alert'} size={22} />
                </span>

                <div className="min-w-[16rem] flex-1">
                  <Link
                    href={`/admin/documentos/${encodeURIComponent(documento.id)}`}
                    className="font-semibold text-ink no-underline hover:underline"
                  >
                    {documento.title.pt}
                  </Link>
                  {documento.summary?.pt ? (
                    <p className="mt-1 line-clamp-2 max-w-[70ch] text-sm text-ink-muted">
                      {documento.summary.pt}
                    </p>
                  ) : null}
                  <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-muted">
                    <span className="rounded-pill bg-surface-alt px-2 py-0.5 text-xs">
                      {TIPOS[documento.type] ?? documento.type}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Icon name="calendar" size={14} />
                      {formatDate(documento.publishedAt)}
                    </span>
                    {existe ? (
                      <span>
                        {documento.file.format.toUpperCase()}, {formatFileSize(documento.file.bytes)}
                      </span>
                    ) : (
                      <span className="font-medium text-ink">Sem ficheiro</span>
                    )}
                  </p>
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  {existe ? (
                    <a
                      href={documento.file.href}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex min-h-10 items-center gap-1.5 rounded-md border border-line-strong px-3 text-sm font-medium text-ink no-underline hover:bg-surface-alt"
                    >
                      <Icon name="download" size={16} />
                      Abrir
                    </a>
                  ) : null}
                  <Link
                    href={`/admin/documentos/${encodeURIComponent(documento.id)}`}
                    className="inline-flex min-h-10 items-center gap-1.5 rounded-md border border-line-strong px-3 text-sm font-medium text-ink no-underline hover:bg-surface-alt"
                  >
                    <Icon name="wrench" size={16} />
                    Corrigir
                  </Link>
                  <BotaoApagar
                    acao={apagarDocumento}
                    id={documento.id}
                    descricao={`«${documento.title.pt}»`}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
