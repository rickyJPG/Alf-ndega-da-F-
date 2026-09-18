import Link from 'next/link';
import { notFound } from 'next/navigation';

import { Icon } from '@/components/ui/icon';
import { getDocuments } from '@/content';
import { exigirEntrada } from '@/lib/admin/sessao';
import { ficheiroExiste } from '@/lib/documentos';
import { CabecalhoDaPagina } from '../../pecas';
import { FormularioDeDocumento } from '../formulario';

export const dynamic = 'force-dynamic';

export default async function CorrigirDocumento({ params }: { params: Promise<{ id: string }> }) {
  await exigirEntrada();

  const { id } = await params;
  const documento = (await getDocuments()).find((item) => item.id === decodeURIComponent(id));
  if (!documento) notFound();

  const existe = ficheiroExiste(documento.file.href);

  return (
    <div className="max-w-3xl">
      <CabecalhoDaPagina
        titulo="Corrigir documento"
        accao={
          <Link
            href={`/documentos/${documento.slug}`}
            target="_blank"
            className="inline-flex min-h-12 items-center gap-2 rounded-md border border-line-strong px-4 font-medium text-ink no-underline hover:bg-surface-alt"
          >
            <Icon name="external" size={18} />
            Ver no portal
          </Link>
        }
      />

      {!existe ? (
        <p
          role="status"
          className="mb-6 flex items-start gap-2.5 rounded-md border border-s-4 border-warning bg-warning-surface p-4"
        >
          <Icon name="alert" size={20} className="mt-0.5 shrink-0" />
          <span>
            <strong className="block">Este documento está sem ficheiro.</strong>
            Aparece no portal, mas não há nada para descarregar. Escolha o ficheiro em baixo.
          </span>
        </p>
      ) : null}

      <FormularioDeDocumento
        documento={{
          id: documento.id,
          titulo: documento.title.pt,
          resumo: documento.summary?.pt ?? '',
          tipo: documento.type,
          area: documento.area,
          publicadoEm: documento.publishedAt,
          ...(existe
            ? {
                ficheiroAtual: {
                  href: documento.file.href,
                  formato: documento.file.format,
                  bytes: documento.file.bytes,
                },
              }
            : {}),
        }}
      />
    </div>
  );
}
