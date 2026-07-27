import type { Metadata } from 'next';

import { getDictionary } from '@/i18n';
import { isLocale, type Locale } from '@/i18n/config';
import { breadcrumbJsonLd, buildMetadata } from '@/lib/seo';
import { routes } from '@/lib/routes';
import { site } from '@/lib/site';
import { formatDateLong } from '@/lib/format';

import { JsonLd } from '@/components/seo/json-ld';
import { PageHeader, Section } from '@/components/layout/page-shell';
import { Alert } from '@/components/ui/alert';
import { Icon } from '@/components/ui/icon';
import { TextLink } from '@/components/ui/link';

/**
 * Declaração de Acessibilidade.
 *
 * Página obrigatória nos termos do Decreto-Lei n.º 83/2018 (transposição da
 * Diretiva (UE) 2016/2102). Tem de indicar o grau de conformidade, as
 * limitações conhecidas, a data da autoavaliação e um canal de resposta.
 *
 * Os dados abaixo estão preenchidos para o relançamento e têm de ser
 * substituídos pelos resultados de uma avaliação real antes de ir para o ar —
 * siehe README, Abschnitt „Declaração de Acessibilidade“.
 */

const ASSESSMENT_DATE = '2026-07-25';

const CONFORMANT = [
  'Toda a informação transmitida por cor é também transmitida por texto ou símbolo.',
  'O contraste do texto normal é de pelo menos 4,5:1 e o dos elementos interativos de pelo menos 3:1.',
  'Todo o portal é utilizável apenas com teclado, com foco sempre visível e sem armadilhas de foco.',
  'As imagens têm texto alternativo; as decorativas são ignoradas pelas tecnologias de apoio.',
  'A estrutura de cabeçalhos é sequencial e cada página tem um só cabeçalho de nível 1.',
  'Existem ligações para saltar diretamente para o conteúdo e para a pesquisa.',
  'O texto pode ser ampliado até 200 % sem perda de conteúdo ou funcionalidade.',
  'Os formulários têm etiquetas visíveis, mensagens de erro em texto e sugestões de correção.',
  'As animações respeitam a preferência do sistema por movimento reduzido.',
  'Os documentos para descarregar indicam o formato e o tamanho no próprio texto da ligação.',
];

const LIMITATIONS = [
  {
    what: 'Documentos PDF anteriores a 2024',
    why: 'Muitos foram digitalizados como imagem e não têm texto selecionável nem estrutura.',
    workaround:
      'O conteúdo essencial está publicado em HTML nas páginas correspondentes. A pedido, fornecemos qualquer documento em formato acessível no prazo de cinco dias úteis.',
  },
  {
    what: 'Mapa interativo das ocorrências',
    why: 'A cartografia interativa não é operável apenas com teclado nem interpretável por leitor de ecrã.',
    workaround:
      'A mesma informação é apresentada em lista, imediatamente abaixo do mapa, e a localização pode ser indicada por freguesia e descrição, sem usar o mapa.',
  },
  {
    what: 'Vídeos publicados antes de 2026',
    why: 'Alguns não têm legendas nem transcrição.',
    workaround:
      'Os vídeos novos são publicados com legendas. Os antigos são legendados a pedido, por ordem de solicitação.',
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
    path: '/acessibilidade',
    title: 'Declaração de Acessibilidade',
    description:
      'Grau de conformidade deste portal com as normas de acessibilidade, limitações conhecidas e como pedir ajuda.',
  });
}

export default async function AccessibilityStatementPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : 'pt') as Locale;
  const dict = getDictionary(locale);

  const crumbs = [
    { label: dict.common.home, href: '/' },
    { label: 'Declaração de Acessibilidade' },
  ];

  return (
    <>
      <JsonLd data={breadcrumbJsonLd(locale, crumbs)} />

      <PageHeader
        title="Declaração de Acessibilidade"
        lead="O Município de Alfândega da Fé compromete-se a tornar este portal acessível a todas as pessoas, independentemente da sua condição."
        tone="alt"
        breadcrumbLabel={dict.common.breadcrumb}
        breadcrumb={[
          { label: dict.common.home, href: routes.home(locale) },
          { label: 'Declaração de Acessibilidade' },
        ]}
      />

      <Section>
        <div className="measure">
          <h2 className="text-2xl">Grau de conformidade</h2>
          <p className="mt-3">
            Este portal está em conformidade com as Diretrizes de Acessibilidade para o Conteúdo da
            Web (WCAG) versão 2.2, nível AA, com as exceções indicadas mais abaixo.
          </p>
          <p className="mt-3">
            A declaração é feita nos termos do Decreto-Lei n.º 83/2018, de 19 de outubro, que
            transpõe a Diretiva (UE) 2016/2102 do Parlamento Europeu e do Conselho.
          </p>

          <dl className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-line bg-surface p-4">
              <dt className="text-sm font-semibold text-ink-muted">Data da declaração</dt>
              <dd className="mt-1 font-medium">{formatDateLong(ASSESSMENT_DATE, locale)}</dd>
            </div>
            <div className="rounded-lg border border-line bg-surface p-4">
              <dt className="text-sm font-semibold text-ink-muted">Método de avaliação</dt>
              <dd className="mt-1 font-medium">
                Autoavaliação, com verificação automática (axe-core) em todos os modelos de página e
                verificação manual com teclado e leitor de ecrã.
              </dd>
            </div>
          </dl>
        </div>
      </Section>

      <Section tone="alt" title="O que já está garantido" headingLevel={2}>
        <ul className="measure flex flex-col gap-2.5">
          {CONFORMANT.map((item) => (
            <li key={item} className="flex items-start gap-2.5">
              <Icon name="checkCircle" size={19} className="mt-0.5 shrink-0 text-success" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Limitações conhecidas" headingLevel={2}>
        <p className="measure mb-6 text-ink-muted">
          Estas são as situações em que sabemos não cumprir integralmente as diretrizes, com a razão
          e a alternativa disponível. Estão em plano de correção.
        </p>
        <ul className="flex flex-col gap-4">
          {LIMITATIONS.map((limitation) => (
            <li key={limitation.what} className="rounded-lg border border-line bg-surface p-5">
              <h3 className="font-serif text-lg font-semibold">{limitation.what}</h3>
              <p className="mt-2 text-ink-muted">
                <span className="font-semibold text-ink">Porquê: </span>
                {limitation.why}
              </p>
              <p className="mt-2 text-ink-muted">
                <span className="font-semibold text-ink">Alternativa: </span>
                {limitation.workaround}
              </p>
            </li>
          ))}
        </ul>
      </Section>

      <Section tone="alt" title="Ferramentas de apoio neste portal" headingLevel={2}>
        <ul className="measure flex flex-col gap-2.5">
          <li className="flex items-start gap-2.5">
            <Icon name="accessibility" size={19} className="mt-0.5 shrink-0 text-primary-700" />
            <span>
              O botão <strong>Acessibilidade</strong>, no topo de todas as páginas, permite aumentar
              o texto até 150 %, ativar o contraste elevado, aumentar o espaçamento entre linhas,
              mudar para uma letra desenhada para baixa visão (Atkinson Hyperlegible) e desligar as
              animações.
            </span>
          </li>
          <li className="flex items-start gap-2.5">
            <Icon name="moon" size={19} className="mt-0.5 shrink-0 text-primary-700" />
            <span>
              O tema claro ou escuro segue a definição do seu sistema e pode ser fixado manualmente.
            </span>
          </li>
          <li className="flex items-start gap-2.5">
            <Icon name="wifiOff" size={19} className="mt-0.5 shrink-0 text-primary-700" />
            <span>
              O portal pode ser instalado no telemóvel e mantém os contactos e números de emergência
              acessíveis sem ligação à Internet.
            </span>
          </li>
        </ul>
      </Section>

      <Section title="Encontrou uma barreira?" headingLevel={2}>
        <div className="measure">
          <p>
            Diga-nos. Descreva o que tentou fazer, em que página, e com que equipamento ou
            tecnologia de apoio. Respondemos no prazo de dez dias úteis e, sempre que possível,
            resolvemos ou fornecemos a informação por outra via.
          </p>

          <ul className="mt-4 flex flex-col gap-2">
            <li className="flex items-center gap-2.5">
              <Icon name="mail" size={19} className="text-primary-700" />
              <TextLink href="mailto:acessibilidade@cm-alfandegadafe.pt">
                acessibilidade@cm-alfandegadafe.pt
              </TextLink>
            </li>
            <li className="flex items-center gap-2.5">
              <Icon name="phone" size={19} className="text-primary-700" />
              <TextLink href={`tel:${site.contact.phoneE164}`}>{site.contact.phone}</TextLink>
            </li>
            <li className="flex items-start gap-2.5">
              <Icon name="mapPin" size={19} className="mt-0.5 text-primary-700" />
              <span>
                {site.legalName}, {site.address.street}, {site.address.postalCode}{' '}
                {site.address.city}
              </span>
            </li>
          </ul>

          <Alert tone="info" title="Se não ficar satisfeito com a resposta" className="mt-8">
            <p>
              Pode apresentar queixa à Agência para a Modernização Administrativa, entidade
              responsável pela supervisão do cumprimento do Decreto-Lei n.º 83/2018, através do
              endereço{' '}
              <TextLink href="https://www.acessibilidade.gov.pt">acessibilidade.gov.pt</TextLink>.
            </p>
          </Alert>

          <p className="mt-8 text-sm text-ink-muted">
            Última revisão desta declaração: {formatDateLong(ASSESSMENT_DATE, locale)}.
          </p>
        </div>
      </Section>
    </>
  );
}
