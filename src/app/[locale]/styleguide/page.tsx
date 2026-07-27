import type { Metadata } from 'next';

import { getDictionary } from '@/i18n';
import { isLocale, type Locale } from '@/i18n/config';
import { buildMetadata } from '@/lib/seo';
import { routes } from '@/lib/routes';
import { getConsultations, getEvents, getDocuments, getNews } from '@/content';
import { formatCurrency, formatDate, formatDateLong, formatFileSize, formatNumber } from '@/lib/format';

import { PageHeader, Section } from '@/components/layout/page-shell';
import { Button, ButtonLink, IconButton } from '@/components/ui/button';
import { TextLink, FileLink } from '@/components/ui/link';
import { Card, CardBody, CardFooter, CardHeader } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import { Badge, CategoryBadge } from '@/components/ui/badge';
import { Tabs } from '@/components/ui/tabs';
import { Accordion } from '@/components/ui/accordion';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Pagination } from '@/components/ui/pagination';
import { DataTable, Tbody, Td, Th, Thead, Tr } from '@/components/ui/table';
import { CheckboxField, RadioGroupField, SelectField, TextArea, TextField } from '@/components/ui/field';
import { Icon, iconNames } from '@/components/ui/icon';
import { ServiceTile } from '@/components/content/service-tile';
import { NewsCard } from '@/components/content/news-card';
import { EventCard } from '@/components/content/event-card';
import { ConsultationCard } from '@/components/content/consultation-card';
import { DocumentRow } from '@/components/content/document-row';

/**
 * Guia de estilo.
 *
 * Serve três propósitos: mostrar todos os componentes num sítio só, permitir
 * verificar contrastes e estados de foco de uma vez, e dar à equipa de
 * comunicação uma referência do que existe antes de pedir algo novo.
 *
 * Não é indexada por motores de busca.
 */

const COLOR_GROUPS: { title: string; tokens: { name: string; className: string; on: string }[] }[] = [
  {
    title: 'Marca — azul institucional',
    tokens: [
      { name: 'primary-900', className: 'bg-primary-900', on: 'text-white' },
      { name: 'primary-800', className: 'bg-primary-800', on: 'text-white' },
      { name: 'primary-700', className: 'bg-primary-700', on: 'text-white' },
      { name: 'primary-600', className: 'bg-primary-600', on: 'text-white' },
      { name: 'primary-100', className: 'bg-primary-100', on: 'text-primary-900' },
    ],
  },
  {
    title: 'Acento — cereja',
    tokens: [
      { name: 'accent-700', className: 'bg-accent-700', on: 'text-white' },
      { name: 'accent-600', className: 'bg-accent-600', on: 'text-white' },
      { name: 'accent-100', className: 'bg-accent-100', on: 'text-accent-700' },
    ],
  },
  {
    title: 'Semântico',
    tokens: [
      { name: 'info', className: 'bg-info', on: 'text-white' },
      { name: 'success', className: 'bg-success', on: 'text-white' },
      { name: 'warning', className: 'bg-warning', on: 'text-white' },
      { name: 'danger', className: 'bg-danger', on: 'text-white' },
      { name: 'support-700', className: 'bg-support-700', on: 'text-white' },
    ],
  },
  {
    title: 'Risco de incêndio (escala IPMA)',
    tokens: [
      { name: 'risk-1', className: 'bg-risk-1', on: 'text-white' },
      { name: 'risk-2', className: 'bg-risk-2', on: 'text-ink' },
      { name: 'risk-3', className: 'bg-risk-3', on: 'text-ink' },
      { name: 'risk-4', className: 'bg-risk-4', on: 'text-white' },
      { name: 'risk-5', className: 'bg-risk-5', on: 'text-white' },
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
    path: '/styleguide',
    title: 'Guia de estilo',
    description: 'Componentes, cores e tipografia do portal do Município.',
    noIndex: true,
  });
}

export default async function StyleguidePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : 'pt') as Locale;
  const dict = getDictionary(locale);
  const today = new Date().toISOString().slice(0, 10);

  const [news, events, consultations, documents] = await Promise.all([
    getNews({ limit: 1 }),
    getEvents({ limit: 1 }),
    getConsultations(),
    getDocuments({ type: 'formulario' }),
  ]);

  return (
    <>
      <PageHeader
        title="Guia de estilo"
        lead="Todos os componentes do portal num só sítio, para verificar contraste, foco e comportamento."
        tone="alt"
        breadcrumbLabel={dict.common.breadcrumb}
        breadcrumb={[{ label: dict.common.home, href: routes.home(locale) }, { label: 'Guia de estilo' }]}
      />

      {/* Cores */}
      <Section id="cores" title="Cores">
        <p className="measure mb-6 text-ink-muted">
          A cor transporta significado, não decoração. O acento cereja fica reservado à ação
          principal e aos estados ativos. Todas as combinações de texto sobre fundo cumprem 4,5:1.
        </p>
        {COLOR_GROUPS.map((group) => (
          <div key={group.title} className="mb-8">
            <h3 className="mb-3 font-serif text-lg">{group.title}</h3>
            <ul className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {group.tokens.map((token) => (
                <li key={token.name}>
                  <div
                    className={`flex min-h-20 items-end rounded-md border border-line p-3 ${token.className} ${token.on}`}
                  >
                    <code className="text-sm font-semibold">{token.name}</code>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Section>

      {/* Tipografia */}
      <Section id="tipografia" tone="alt" title="Tipografia">
        <div className="measure">
          <p className="mb-6 text-ink-muted">
            Títulos em Source Serif 4, texto e interface em Inter. A escala é fluida e a medida de
            linha nunca ultrapassa 68 caracteres.
          </p>
          <h1 className="text-4xl">Título de nível 1 — 4xl</h1>
          <h2 className="mt-4 text-3xl">Título de nível 2 — 3xl</h2>
          <h3 className="mt-4 text-2xl">Título de nível 3 — 2xl</h3>
          <h4 className="mt-4 text-xl">Título de nível 4 — xl</h4>
          <p className="mt-5 text-lg">
            Parágrafo de destaque, usado nos vorspann das páginas — text-lg.
          </p>
          <p className="mt-3">
            Texto corrido, com a base em 17 px e entrelinha de 1,6. Peça a sua certidão, marque
            atendimento, consulte o PDM. A leitura deve ser confortável para quem tem 70 anos e
            está a usar o telemóvel à luz do dia.
          </p>
          <p className="mt-3 text-sm text-ink-muted">
            Texto secundário — datas, notas de rodapé, indicações de formato e tamanho de ficheiro.
          </p>
        </div>
      </Section>

      {/* Botões */}
      <Section id="botoes" title="Botões e ligações">
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="primary">Ação principal</Button>
          <Button variant="secondary">Ação secundária</Button>
          <Button variant="subtle">Discreto</Button>
          <Button variant="ghost">Fantasma</Button>
          <Button variant="danger">Destrutivo</Button>
          <Button disabled>Desativado</Button>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Button size="sm">Pequeno</Button>
          <Button size="md">Médio</Button>
          <Button size="lg">Grande</Button>
          <Button icon="download">Com símbolo</Button>
          <Button iconAfter="arrowRight">Com seta</Button>
          <IconButton icon="search" label="Pesquisar" variant="subtle" />
          <ButtonLink href={routes.services(locale)} variant="subtle">
            Ligação com aspeto de botão
          </ButtonLink>
        </div>

        <div className="mt-6 flex flex-col gap-2">
          <p>
            <TextLink href={routes.services(locale)}>Ligação interna</TextLink> ·{' '}
            <TextLink href="https://www.portugal.gov.pt">Ligação externa</TextLink> ·{' '}
            <TextLink href={routes.contacts(locale)} quiet>
              Ligação discreta
            </TextLink>
          </p>
          <FileLink href="#" format="pdf" bytes={2_411_724} locale={locale}>
            Plano de trânsito do centro da vila
          </FileLink>
        </div>
      </Section>

      {/* Etiquetas */}
      <Section id="etiquetas" tone="alt" title="Etiquetas e avisos">
        <ul className="flex flex-wrap gap-2">
          <li><Badge>Neutro</Badge></li>
          <li><Badge tone="info">Informação</Badge></li>
          <li><Badge tone="success">Sucesso</Badge></li>
          <li><Badge tone="warning">Aviso</Badge></li>
          <li><Badge tone="danger">Erro</Badge></li>
          <li><Badge tone="accent">Acento</Badge></li>
          <li><Badge tone="support">Ambiente</Badge></li>
          <li><Badge tone="info" icon="check">Com símbolo</Badge></li>
          <li><CategoryBadge>Rubrica</CategoryBadge></li>
        </ul>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <Alert tone="info" title="Informação">
            As reuniões públicas têm período de intervenção no final.
          </Alert>
          <Alert tone="success" title="Pedido enviado">
            Guarde o número de referência para acompanhar o processo.
          </Alert>
          <Alert tone="warning" title="Risco de incêndio elevado">
            Não faça queimadas nem use máquinas que produzam faísca.
          </Alert>
          <Alert tone="danger" title="Não foi possível enviar">
            Corrija os campos assinalados e tente novamente.
          </Alert>
        </div>
      </Section>

      {/* Navegação */}
      <Section id="navegacao" title="Navegação">
        <Breadcrumb
          label="Exemplo de caminho de navegação"
          items={[
            { label: 'Início', href: routes.home(locale) },
            { label: 'Serviços', href: routes.services(locale) },
            { label: 'Licença de construção' },
          ]}
        />

        <div className="mt-8">
          <Tabs
            label="Exemplo de separadores"
            items={[
              { id: 'a', label: 'Primeiro', content: <p>Conteúdo do primeiro separador.</p> },
              { id: 'b', label: 'Segundo', content: <p>Conteúdo do segundo separador.</p> },
              { id: 'c', label: 'Terceiro', content: <p>Conteúdo do terceiro separador.</p> },
            ]}
          />
        </div>

        <div className="mt-8 max-w-2xl">
          <Accordion
            items={[
              {
                id: 'q1',
                title: 'Quanto tempo demora uma licença de construção?',
                content: <p>Até 45 dias úteis depois de o processo estar completo.</p>,
              },
              {
                id: 'q2',
                title: 'Posso entregar o processo online?',
                content: <p>Sim, pela Área de Munícipe, com Chave Móvel Digital.</p>,
              },
            ]}
          />
        </div>

        <Pagination
          className="mt-8"
          currentPage={3}
          totalPages={9}
          buildHref={(page) => `?pagina=${page}`}
          labels={{
            previous: dict.common.previous,
            next: dict.common.next,
            page: dict.common.page,
            of: dict.common.of,
          }}
        />
      </Section>

      {/* Formulários */}
      <Section id="formularios" tone="alt" title="Campos de formulário">
        <div className="grid max-w-4xl gap-6 md:grid-cols-2">
          <TextField label="Nome completo" required placeholder="Maria Silva" />
          <TextField
            label="Correio eletrónico"
            type="email"
            required
            hint="Usamos apenas para lhe responder."
          />
          <TextField
            label="NIF"
            error="O NIF tem de ter 9 dígitos."
            defaultValue="1234"
          />
          <SelectField
            label="Freguesia"
            required
            options={[
              { value: '', label: '— escolha —' },
              { value: 'alfandega-da-fe', label: 'Alfândega da Fé' },
              { value: 'sambade', label: 'Sambade' },
            ]}
          />
          <TextArea label="Mensagem" className="md:col-span-2" hint="Quanto mais concreto, melhor." />
          <RadioGroupField
            legend="Como prefere ser contactado?"
            name="styleguide-contact"
            className="md:col-span-2"
            options={[
              { value: 'email', label: 'Correio eletrónico' },
              { value: 'telefone', label: 'Telefone', hint: 'Ligamos em horário de expediente.' },
              { value: 'carta', label: 'Carta' },
            ]}
          />
          <CheckboxField className="md:col-span-2">
            Autorizo o tratamento dos meus dados para dar resposta a este pedido.
          </CheckboxField>
        </div>
      </Section>

      {/* Cartões */}
      <Section id="cartoes" title="Cartões de conteúdo">
        <h3 className="mb-3 font-serif text-lg">Serviço</h3>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <ServiceTile
            href={routes.services(locale)}
            icon="droplet"
            title="Pagar a água"
            description="Por referência Multibanco, MB WAY ou débito direto."
            online
            onlineLabel={dict.services.onlineBadge}
          />
          <ServiceTile
            href={routes.services(locale)}
            icon="building"
            title="Licença de construção"
            description="Construir de novo, ampliar ou alterar."
          />
        </ul>

        {news[0] ? (
          <>
            <h3 className="mt-10 mb-3 font-serif text-lg">Notícia</h3>
            <div className="max-w-sm">
              <NewsCard item={news[0]} locale={locale} />
            </div>
          </>
        ) : null}

        {events[0] ? (
          <>
            <h3 className="mt-10 mb-3 font-serif text-lg">Evento</h3>
            <div className="max-w-xl">
              <EventCard event={events[0]} locale={locale} dict={dict} />
            </div>
          </>
        ) : null}

        {consultations[0] ? (
          <>
            <h3 className="mt-10 mb-3 font-serif text-lg">Consulta pública</h3>
            <div className="max-w-md">
              <ConsultationCard
                consultation={consultations[0]}
                locale={locale}
                dict={dict}
                today={today}
              />
            </div>
          </>
        ) : null}

        {documents[0] ? (
          <>
            <h3 className="mt-10 mb-3 font-serif text-lg">Documento</h3>
            <ul className="rounded-lg border border-line bg-surface px-5">
              <DocumentRow document={documents[0]} locale={locale} dict={dict} />
            </ul>
          </>
        ) : null}

        <h3 className="mt-10 mb-3 font-serif text-lg">Cartão genérico</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <p className="font-serif text-lg font-semibold">Com cabeçalho</p>
            </CardHeader>
            <CardBody>
              <p className="text-ink-muted">Corpo do cartão.</p>
            </CardBody>
            <CardFooter>
              <TextLink href="#">Ação</TextLink>
            </CardFooter>
          </Card>
          <Card tone="alt">
            <CardBody>
              <p className="font-serif text-lg font-semibold">Fundo alternativo</p>
              <p className="mt-1 text-ink-muted">Para blocos secundários.</p>
            </CardBody>
          </Card>
          <Card tone="accent">
            <CardBody>
              <p className="font-serif text-lg font-semibold">Com acento</p>
              <p className="mt-1 text-ink-muted">Para o que exige atenção.</p>
            </CardBody>
          </Card>
        </div>
      </Section>

      {/* Tabela */}
      <Section id="tabelas" tone="alt" title="Tabelas">
        <DataTable caption="Exemplo de tabela de dados">
          <Thead>
            <Tr>
              <Th>Rubrica</Th>
              <Th numeric>2026</Th>
              <Th numeric>2025</Th>
              <Th numeric>Variação</Th>
            </Tr>
          </Thead>
          <Tbody>
            <Tr>
              <Th scope="row" className="bg-surface font-medium">Água e resíduos</Th>
              <Td numeric>{formatCurrency(2_640_000, locale)}</Td>
              <Td numeric>{formatCurrency(2_180_000, locale)}</Td>
              <Td numeric>+21,1 %</Td>
            </Tr>
            <Tr>
              <Th scope="row" className="bg-surface font-medium">Educação</Th>
              <Td numeric>{formatCurrency(1_640_000, locale)}</Td>
              <Td numeric>{formatCurrency(1_524_000, locale)}</Td>
              <Td numeric>+7,6 %</Td>
            </Tr>
          </Tbody>
        </DataTable>
      </Section>

      {/* Formatos */}
      <Section id="formatos" title="Formatos portugueses">
        <ul className="measure flex flex-col gap-2">
          <li>
            Data curta: <strong>{formatDate('2026-07-25', locale)}</strong>
          </li>
          <li>
            Data por extenso: <strong>{formatDateLong('2026-07-25', locale)}</strong>
          </li>
          <li>
            Hora: <strong>21:30</strong> (sempre 24 horas)
          </li>
          <li>
            Número: <strong>{formatNumber(1_234_567, locale)}</strong>
          </li>
          <li>
            Moeda: <strong>{formatCurrency(12_480_000, locale)}</strong>
          </li>
          <li>
            Ficheiro: <strong>PDF, {formatFileSize(2_411_724, locale)}</strong>
          </li>
        </ul>
      </Section>

      {/* Símbolos */}
      <Section id="simbolos" tone="alt" title="Símbolos">
        <p className="measure mb-6 text-ink-muted">
          {iconNames.length} símbolos, todos vetoriais e herdando a cor do texto. Nenhum símbolo do
          portal é uma imagem de píxeis.
        </p>
        <ul className="grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-8">
          {iconNames.map((name) => (
            <li
              key={name}
              className="flex flex-col items-center gap-1.5 rounded-md border border-line bg-surface p-3"
            >
              <Icon name={name} size={24} className="text-primary-700" />
              <code className="text-center text-xs break-all text-ink-muted">{name}</code>
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}
