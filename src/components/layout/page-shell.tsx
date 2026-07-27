import type { ReactNode } from 'react';
import { Breadcrumb, type Crumb } from '@/components/ui/breadcrumb';
import { cn } from '@/lib/utils';

/**
 * Gemeinsames Gerüst der Unterseiten: Pfadnavigation, H1, Vorspann.
 * Die Überschriftenhierarchie beginnt hier – jede Seite hat genau eine H1.
 */
export function PageHeader({
  title,
  lead,
  breadcrumb,
  breadcrumbLabel,
  aside,
  tone = 'default',
}: {
  title: string;
  lead?: string;
  breadcrumb?: Crumb[];
  breadcrumbLabel?: string;
  aside?: ReactNode;
  tone?: 'default' | 'alt';
}) {
  return (
    <div className={cn('border-b border-line', tone === 'alt' ? 'bg-surface-alt' : 'bg-surface')}>
      <div className="container-page py-6 md:py-10">
        {breadcrumb ? (
          <Breadcrumb items={breadcrumb} label={breadcrumbLabel} className="mb-5" />
        ) : null}

        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="measure">
            <h1 className="text-3xl">{title}</h1>
            {lead ? <p className="mt-3 text-lg text-ink-muted">{lead}</p> : null}
          </div>
          {aside ? <div className="shrink-0">{aside}</div> : null}
        </div>
      </div>
    </div>
  );
}

export function Section({
  title,
  lead,
  action,
  children,
  id,
  tone = 'default',
  headingLevel = 2,
  className,
}: {
  title?: string;
  lead?: string;
  action?: ReactNode;
  children: ReactNode;
  id?: string;
  tone?: 'default' | 'alt';
  headingLevel?: 2 | 3;
  className?: string;
}) {
  const Heading = `h${headingLevel}` as 'h2' | 'h3';
  const headingId = id ? `${id}-title` : undefined;

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={cn(tone === 'alt' && 'bg-surface-alt', 'py-10 md:py-14', className)}
    >
      <div className="container-page">
        {title ? (
          <div className="mb-6 flex flex-col gap-3 md:mb-8 md:flex-row md:items-end md:justify-between">
            <div className="measure">
              <Heading id={headingId} className="text-2xl">
                {title}
              </Heading>
              {lead ? <p className="mt-2 text-ink-muted">{lead}</p> : null}
            </div>
            {action ? <div className="shrink-0">{action}</div> : null}
          </div>
        ) : null}
        {children}
      </div>
    </section>
  );
}

/** Textspalte für Fließtext – nie breiter als 68 Zeichen. */
export function Prose({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('prose-cm', className)}>{children}</div>;
}
