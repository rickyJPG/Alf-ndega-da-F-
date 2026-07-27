import Link from 'next/link';
import type { DocumentItem } from '@/content/types';
import { tx } from '@/content/types';
import { localePath, type Locale } from '@/i18n/config';
import { formatDate, formatFileSize } from '@/lib/format';
import type { Dictionary } from '@/i18n';
import { Icon } from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const typeLabels: Record<DocumentItem['type'], string> = {
  formulario: 'Formulário',
  regulamento: 'Regulamento',
  edital: 'Edital',
  ata: 'Ata',
  relatorio: 'Relatório',
  plano: 'Plano',
  aviso: 'Aviso',
  dados: 'Dados abertos',
};

/**
 * Zeile im Dokumentenkatalog.
 *
 * Wo ein Vorgang auch online geht, steht der Online-Weg zuerst und das PDF
 * daneben als Alternative – nicht umgekehrt. Format und Dateigröße stehen im
 * Linktext, wie es die Barrierefreiheits-Vorgaben verlangen.
 */
export function DocumentRow({
  document,
  locale,
  dict,
  className,
}: {
  document: DocumentItem;
  locale: Locale;
  dict: Dictionary;
  className?: string;
}) {
  return (
    <li
      className={cn(
        'flex flex-col gap-3 border-b border-line py-4 last:border-b-0 md:flex-row md:items-start md:justify-between md:gap-6',
        className,
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="mb-1.5 flex flex-wrap items-center gap-2">
          <Badge tone={document.type === 'edital' || document.type === 'aviso' ? 'warning' : 'neutral'}>
            {typeLabels[document.type]}
          </Badge>
          <time dateTime={document.publishedAt} className="text-sm text-ink-muted">
            {formatDate(document.publishedAt, locale)}
          </time>
        </div>

        <h3 className="font-serif text-lg">
          <Link
            href={localePath(locale, `/documentos/${document.slug}`)}
            className="text-ink no-underline hover:underline underline-offset-[0.2em]"
          >
            {tx(document.title, locale)}
          </Link>
        </h3>

        {document.summary ? (
          <p className="mt-1 text-sm text-ink-muted">{tx(document.summary, locale)}</p>
        ) : null}
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-2">
        {document.onlinePath ? (
          <Link
            href={localePath(locale, document.onlinePath)}
            className="inline-flex min-h-11 items-center gap-2 rounded-md border border-accent-600 bg-accent-600 px-4 font-semibold text-white no-underline hover:bg-accent-hover"
          >
            <Icon name="arrowRight" size={17} />
            {dict.documents.doOnline}
          </Link>
        ) : null}

        <a
          href={document.file.href}
          download
          className="inline-flex min-h-11 items-center gap-2 rounded-md border border-line-strong bg-surface px-4 text-ink no-underline hover:bg-surface-alt"
        >
          <Icon name="download" size={17} />
          <span>
            {document.onlinePath ? dict.documents.pdfAlternative : dict.common.download}{' '}
            <span className="whitespace-nowrap text-ink-muted">
              ({document.file.format.toUpperCase()}, {formatFileSize(document.file.bytes, locale)})
            </span>
          </span>
        </a>
      </div>
    </li>
  );
}

export { typeLabels as documentTypeLabels };
