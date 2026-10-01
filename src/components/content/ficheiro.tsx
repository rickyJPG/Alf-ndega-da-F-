import { Icon } from '@/components/ui/icon';
import { FileLink } from '@/components/ui/link';
import type { Locale } from '@/i18n/config';
import { ficheiroExiste } from '@/lib/documentos';
import type { FileAsset } from '@/content/types';

/**
 * Descarregamentos que só aparecem quando há mesmo o que descarregar.
 *
 * O portal oferece ficheiros em sete sítios diferentes — atas de reuniões,
 * formulários dos serviços, documentos de consultas públicas, prestação de
 * contas, dados abertos. O catálogo e os ficheiros são coisas separadas, e
 * numa instalação nova o catálogo vem cheio e as pastas vêm vazias.
 *
 * Até aqui só a lista de documentos verificava isso. Os outros seis sítios
 * ofereciam o botão de qualquer maneira: o munícipe clicava, recebia um 404,
 * e não tinha como saber se o documento não existe ou se o portal está
 * avariado. É a pior forma de um serviço público falhar — em silêncio, já
 * depois do clique.
 *
 * Vive aqui, numa peça só, para que as sete não possam divergir: se amanhã
 * se decidir mostrar a data prevista em vez de «por publicar», muda-se num
 * sítio e muda em todos.
 */

/** O que fica no lugar do botão quando o ficheiro ainda não existe. */
export function FicheiroPorPublicar({ className }: { className?: string }) {
  return (
    <span
      className={
        className ??
        'inline-flex min-h-11 items-center gap-2 rounded-md border border-line px-4 text-sm text-ink-muted'
      }
    >
      <Icon name="clock" size={17} />
      Ficheiro por publicar
    </span>
  );
}

/**
 * Um `FileLink` que desaparece se o ficheiro não estiver lá.
 *
 * Para os sítios que já usavam `FileLink`. Os que têm desenho próprio
 * chamam `ficheiroExiste()` diretamente e põem `<FicheiroPorPublicar />` no
 * outro ramo.
 */
export function FicheiroDescarregavel({
  ficheiro,
  locale,
  children,
}: {
  ficheiro: FileAsset;
  locale: Locale;
  children: React.ReactNode;
}) {
  if (!ficheiroExiste(ficheiro.href)) {
    return <FicheiroPorPublicar className="inline-flex items-center gap-1.5 text-sm text-ink-muted" />;
  }

  return (
    <FileLink href={ficheiro.href} format={ficheiro.format} bytes={ficheiro.bytes} locale={locale}>
      {children}
    </FileLink>
  );
}
