import type { Metadata } from 'next';
import Image from 'next/image';

import { getDictionary } from '@/i18n';
import { isLocale, type Locale } from '@/i18n/config';
import { buildMetadata } from '@/lib/seo';
import { routes } from '@/lib/routes';
import { getFreguesias } from '@/content';
import { tx } from '@/content/types';
import { fotoReal } from '@/lib/imagens';

import { PageHeader, Section } from '@/components/layout/page-shell';
import { Alert } from '@/components/ui/alert';
import { DataTable, Tbody, Td, Th, Thead, Tr } from '@/components/ui/table';
import { TextLink } from '@/components/ui/link';

/**
 * Guia de imagens — o inventário de todas as posições de fotografia.
 *
 * Serve dois propósitos práticos:
 *
 *   • à autarquia, mostra exatamente onde entra cada fotografia, com que
 *     nome de ficheiro e em que proporção — sem precisar de abrir código;
 *   • a quem apresenta o portal, é a prova de que as fotografias são
 *     conteúdo e não programação: trocá-las é copiar ficheiros.
 *
 * Não é indexada por motores de busca.
 */

interface Posicao {
  ficheiro: string;
  onde: string;
  proporcao: string;
  tamanho: string;
}

const POSICOES: { grupo: string; itens: Posicao[] }[] = [
  {
    grupo: 'Página inicial',
    itens: [
      {
        ficheiro: 'hero-alfandega',
        onde: 'Imagem de fundo do destaque, no topo da página inicial',
        proporcao: '16:9',
        tamanho: '1600 × 900',
      },
    ],
  },
  {
    grupo: 'Notícias',
    itens: [
      { ficheiro: 'noticias/orcamento', onde: 'Notícia sobre contas e orçamento', proporcao: '16:9', tamanho: '1200 × 675' },
      { ficheiro: 'noticias/cereja', onde: 'Notícias da campanha da cereja', proporcao: '16:9', tamanho: '1200 × 675' },
      { ficheiro: 'noticias/agua', onde: 'Notícias de água e saneamento', proporcao: '16:9', tamanho: '1200 × 675' },
      { ficheiro: 'noticias/ambiente', onde: 'Notícias de ambiente e floresta', proporcao: '16:9', tamanho: '1200 × 675' },
      { ficheiro: 'noticias/escolas', onde: 'Notícias de educação', proporcao: '16:9', tamanho: '1200 × 675' },
      { ficheiro: 'noticias/social', onde: 'Notícias de ação social', proporcao: '16:9', tamanho: '1200 × 675' },
      { ficheiro: 'noticias/festa', onde: 'Notícias de cultura e festas', proporcao: '16:9', tamanho: '1200 × 675' },
    ],
  },
  {
    grupo: 'Agenda',
    itens: [
      { ficheiro: 'eventos/musica', onde: 'Espetáculos e concertos', proporcao: '3:2', tamanho: '900 × 600' },
      { ficheiro: 'eventos/feira', onde: 'Feiras e mercados', proporcao: '3:2', tamanho: '900 × 600' },
      { ficheiro: 'eventos/exposicao', onde: 'Exposições', proporcao: '3:2', tamanho: '900 × 600' },
    ],
  },
  {
    grupo: 'Visitar',
    itens: [
      { ficheiro: 'visitar/lagos-do-sabor', onde: 'Página dos lagos do Sabor e cartão na página inicial', proporcao: '3:2', tamanho: '1200 × 800' },
      { ficheiro: 'visitar/percursos', onde: 'Percursos pedestres', proporcao: '3:2', tamanho: '1200 × 800' },
      { ficheiro: 'visitar/cereja', onde: 'Produtos locais e galeria', proporcao: '3:2', tamanho: '1200 × 800' },
      { ficheiro: 'visitar/patrimonio', onde: 'Património — o castelo', proporcao: '3:2', tamanho: '1200 × 800' },
      { ficheiro: 'visitar/amendoeiras', onde: 'Amendoeiras em flor', proporcao: '3:2', tamanho: '1200 × 800' },
    ],
  },
];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : 'pt') as Locale;

  return buildMetadata({
    locale,
    path: '/guia-de-imagens',
    title: 'Guia de imagens',
    description: 'Onde entra cada fotografia do portal e como a substituir.',
    noIndex: true,
  });
}

export default async function GuiaDeImagensPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : 'pt') as Locale;
  const dict = getDictionary(locale);
  const freguesias = await getFreguesias();

  const total = POSICOES.reduce((soma, grupo) => soma + grupo.itens.length, 0) + freguesias.length;

  return (
    <>
      <PageHeader
        title="Guia de imagens"
        lead={`As ${total} posições de fotografia do portal: onde entram, com que nome e em que proporção.`}
        tone="alt"
        breadcrumbLabel={dict.common.breadcrumb}
        breadcrumb={[{ label: dict.common.home, href: routes.home(locale) }, { label: 'Guia de imagens' }]}
      />

      <Section title="Como se troca uma fotografia">
        <div className="measure">
          <p className="mb-4">
            Todas as imagens que vê no portal são <strong>provisórias</strong>: molduras de
            espera que dizem, no próprio desenho, que fotografia ali entra e com que nome de
            ficheiro. Substituí-las não exige programação.
          </p>
          <ol className="prose-cm mb-6 list-decimal ps-5">
            <li>
              Guarde a fotografia em <code>public/images</code> com o <strong>mesmo nome</strong>
              {' '}da posição que quer preencher, mudando a extensão para <code>.jpg</code>.
              Exemplo: a posição <code>visitar/patrimonio</code> passa a ser o ficheiro{' '}
              <code>public/images/visitar/patrimonio.jpg</code>.
            </li>
            <li>Volte a compilar o portal (ou reinicie o servidor).</li>
            <li>Está feito — o portal passa a mostrar a fotografia em vez da moldura.</li>
          </ol>

          <Alert tone="info" title="Atalhos para a primeira carga" className="mb-6">
            <p className="mb-2">
              <strong>Com terminal:</strong> <code>npm run fotos</code> descarrega de uma vez as
              fotografias escolhidas pelo Município e coloca-as nas posições certas.
            </p>
            <p>
              <strong>Sem terminal:</strong> abra <code>ferramentas/obter-fotos.html</code> no
              navegador. Mostra cada fotografia da lista com o nome de ficheiro que lhe
              corresponde e um botão para a guardar.
            </p>
          </Alert>

          <p className="mb-4">
            <strong>Proporções.</strong> Mantenha a proporção indicada em cada posição. É ela que
            reserva o espaço enquanto a fotografia carrega — sem isso, o texto salta na página e
            a pontuação de desempenho cai.
          </p>
          <p>
            <strong>Texto alternativo.</strong> Cada fotografia tem uma descrição escrita, para
            quem usa leitor de ecrã e para quando a imagem não carrega. Vive junto do conteúdo,
            em <code>src/content/data/</code>, e deve ser atualizada com a fotografia nova.{' '}
            <TextLink href={routes.accessibility(locale)}>Ver a declaração de acessibilidade</TextLink>.
          </p>
        </div>
      </Section>

      {POSICOES.map((grupo) => (
        <Section key={grupo.grupo} tone="alt" title={grupo.grupo} headingLevel={2}>
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {grupo.itens.map((item) => (
              <li key={item.ficheiro} className="rounded-lg border border-line bg-surface p-3">
                <span className="relative block aspect-[3/2] overflow-hidden rounded-md border border-line">
                  <Image
                    src={fotoReal(`/images/${item.ficheiro}.svg`)}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover"
                  />
                </span>
                <p className="mt-3 font-mono text-sm font-semibold break-all">
                  {item.ficheiro}.jpg
                </p>
                <p className="mt-1 text-sm text-ink-muted">{item.onde}</p>
                <p className="mt-1 text-sm text-ink-muted tabular-nums">
                  {item.proporcao} · {item.tamanho} px
                </p>
              </li>
            ))}
          </ul>
        </Section>
      ))}

      <Section title="Freguesias" headingLevel={2} lead="Uma fotografia por freguesia, no topo da respetiva página.">
        <DataTable caption="Posições de fotografia das freguesias">
          <Thead>
            <Tr>
              <Th scope="col">Freguesia</Th>
              <Th scope="col">Ficheiro</Th>
              <Th scope="col">Descrição atual</Th>
            </Tr>
          </Thead>
          <Tbody>
            {freguesias.map((freguesia) => (
              <Tr key={freguesia.slug}>
                <Td>{freguesia.name}</Td>
                <Td>
                  <code className="text-sm break-all">freguesias/{freguesia.slug}.jpg</code>
                </Td>
                <Td>{freguesia.image ? tx(freguesia.image.alt, locale) : '—'}</Td>
              </Tr>
            ))}
          </Tbody>
        </DataTable>
        <p className="measure mt-4 text-sm text-ink-muted">
          Todas em proporção 3:2, 1200 × 800 px.
        </p>
      </Section>
    </>
  );
}
