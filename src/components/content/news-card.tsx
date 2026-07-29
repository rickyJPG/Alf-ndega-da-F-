import Image from 'next/image';
import { fotoReal } from '@/lib/imagens';
import Link from 'next/link';
import type { NewsItem } from '@/content/types';
import { tx } from '@/content/types';
import { localePath, type Locale } from '@/i18n/config';
import { formatDate, isoDate } from '@/lib/format';
import { CategoryBadge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

/**
 * Cartão de notícia.
 *
 * A proporção fixa (16:9) evita saltos do layout. O resumo é uma frase
 * completa guardada no próprio registo — nada é cortado a meio de uma
 * palavra, como acontecia no sítio antigo.
 */
export function NewsCard({
  item,
  locale,
  priority,
  className,
  headingLevel = 3,
}: {
  item: NewsItem;
  locale: Locale;
  priority?: boolean;
  className?: string;
  headingLevel?: 2 | 3 | 4;
}) {
  const [year, month] = item.date.split('-');
  const href = localePath(locale, `/noticias/${year}/${month}/${item.slug}`);
  const Heading = `h${headingLevel}` as 'h2' | 'h3' | 'h4';

  return (
    <article
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-lg border border-line bg-surface',
        'transition-[border-color] duration-[--motion-base] hover:border-primary-600',
        'focus-within:border-primary-600',
        className,
      )}
    >
      {item.image ? (
        <div className="relative aspect-[16/9] w-full overflow-hidden border-b border-line bg-surface-alt">
          <Image
            src={fotoReal(item.image.src)}
            alt={tx(item.image.alt, locale)}
            fill
            sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw"
            priority={priority}
            className="object-cover"
          />
        </div>
      ) : (
        <div
          aria-hidden="true"
          className="aspect-[16/9] w-full border-b border-line bg-surface-alt"
        />
      )}

      <div className="flex flex-1 flex-col gap-2 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <CategoryBadge>{item.category}</CategoryBadge>
          <time dateTime={isoDate(item.date)} className="text-sm text-ink-muted">
            {formatDate(item.date, locale)}
          </time>
        </div>

        <Heading className="font-serif text-xl">
          <Link
            href={href}
            className="text-ink no-underline after:absolute after:inset-0 after:content-[''] hover:underline underline-offset-[0.2em]"
          >
            {tx(item.title, locale)}
          </Link>
        </Heading>

        <p className="text-ink-muted">{tx(item.summary, locale)}</p>
      </div>
    </article>
  );
}
