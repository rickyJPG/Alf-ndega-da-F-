import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';

import { getDictionary } from '@/i18n';
import { isLocale, localePath, type Locale } from '@/i18n/config';
import { buildMetadata } from '@/lib/seo';
import { navLabel, topTasks } from '@/lib/navigation';
import { routes } from '@/lib/routes';
import { site } from '@/lib/site';
import { tx } from '@/content/types';
import {
  getBudget,
  getEvents,
  getEventCategories,
  getFeaturedServices,
  getFireRisk,
  getLatestMeeting,
  getNews,
  getOpenConsultations,
  getOpenTenders,
  getServices,
} from '@/content';
import { startOfWeek } from '@/content/data/clock';

import { Section } from '@/components/layout/page-shell';
import { HeroSearch, type Suggestion } from '@/components/home/hero-search';
import { WeekAgenda } from '@/components/home/week-agenda';
import { FireRiskWidget } from '@/components/home/fire-risk-widget';
import { TransparencyWidget } from '@/components/home/transparency-widget';
import { ServiceTile } from '@/components/content/service-tile';
import { NewsCard } from '@/components/content/news-card';
import { ConsultationCard } from '@/components/content/consultation-card';
import { ButtonLink } from '@/components/ui/button';
import { Icon, type IconName } from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/format';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : 'pt') as Locale;
  const dict = getDictionary(locale);

  return buildMetadata({
    locale,
    path: '/',
    title: `${site.name} — ${dict.home.heroTitle}`,
    description: dict.home.heroSubtitle,
    image: '/images/hero-alfandega.svg',
  });
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : 'pt') as Locale;
  const dict = getDictionary(locale);
  const today = new Date().toISOString().slice(0, 10);

  const [
    featured,
    allServices,
    news,
    consultations,
    tenders,
    events,
    eventCategories,
    budget,
    lastMeeting,
    fire,
  ] = await Promise.all([
    getFeaturedServices(),
    getServices(),
    getNews({ limit: 3 }),
    getOpenConsultations(),
    getOpenTenders(),
    getEvents({ limit: 40 }),
    getEventCategories(),
    getBudget(2026),
    getLatestMeeting(),
    getFireRisk(),
  ]);

  // Vorschläge für die Autovervollständigung – serverseitig berechnet.
  const suggestions: Suggestion[] = [
    ...allServices.map((service) => ({
      label: tx(service.title, locale),
      href: routes.service(locale, service),
      hint: dict.services.title,
    })),
    ...news.map((item) => ({
      label: tx(item.title, locale),
      href: routes.newsItem(locale, item),
      hint: dict.news.title,
    })),
    ...consultations.map((item) => ({
      label: tx(item.title, locale),
      href: routes.consultation(locale, item),
      hint: dict.consultations.title,
    })),
  ];

  const weekStart = startOfWeek().toISOString().slice(0, 10);

  const discoverCards: { href: string; title: string; text: string; image: string; alt: string }[] = [
    {
      href: '/visitar/lagos-do-sabor',
      title: 'Lagos do Sabor',
      text: 'Três lagos de águas serenas entre penhascos, onde antes corria o rio bravo.',
      image: '/images/visitar/lagos-do-sabor.svg',
      alt: 'Ilustração das encostas verdes que descem para os lagos do Sabor.',
    },
    {
      href: '/visitar/percursos-pedestres',
      title: 'Percursos pedestres',
      text: 'Nove trilhos marcados, do passeio de meia hora à caminhada de um dia.',
      image: '/images/visitar/percursos.svg',
      alt: 'Ilustração de encostas sobrepostas com socalcos.',
    },
    {
      href: '/visitar/produtos-locais',
      title: 'Cereja, azeite e castanha',
      text: 'A cereja é a mais conhecida. O azeite e a castanha merecem a mesma atenção.',
      image: '/images/visitar/cereja.svg',
      alt: 'Motivo gráfico com cerejas estilizadas.',
    },
  ];

  return (
    <>
      {/* 3. Hero – funktional statt dekorativ */}
      <section aria-labelledby="hero-title" className="relative isolate">
        <div className="absolute inset-0 -z-10">
          <Image
            src="/images/hero-alfandega.svg"
            alt={dict.home.heroImageAlt}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          {/* Deckfläche statt Verlauf: gleichmäßiger Kontrast, kein Farbverlauf. */}
          <div aria-hidden="true" className="absolute inset-0 bg-primary-900/75" />
        </div>

        <div className="container-page py-12 md:py-20">
          <div className="max-w-3xl">
            <h1 id="hero-title" className="text-4xl text-white">
              {dict.home.heroTitle}
            </h1>
            <p className="mt-3 text-lg text-white/90">{dict.home.heroSubtitle}</p>

            <div className="mt-6">
              <HeroSearch
                locale={locale}
                suggestions={suggestions}
                label={dict.common.searchLabel}
                placeholder={dict.common.searchPlaceholder}
                submitLabel={dict.common.search}
                suggestionsLabel={dict.search.suggestions}
              />
            </div>

            <nav aria-label={dict.home.topTasks} className="mt-6">
              <p className="mb-2 text-sm font-semibold text-white/80">{dict.home.topTasks}</p>
              <ul className="flex flex-wrap gap-2">
                {topTasks.map((task) => (
                  <li key={task.href}>
                    <Link
                      href={localePath(locale, task.href)}
                      className="inline-flex min-h-11 items-center rounded-pill border border-white/40 bg-white/10 px-4 text-white no-underline hover:border-white hover:bg-white/20"
                    >
                      {navLabel(task, locale)}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </section>

      {/* 4. Serviços em destaque */}
      <Section
        id="servicos-destaque"
        title={dict.home.servicesTitle}
        lead={dict.home.servicesSubtitle}
        action={
          <ButtonLink href={localePath(locale, '/servicos')} variant="subtle" iconAfter="arrowRight">
            {dict.common.seeAll}
          </ButtonLink>
        }
      >
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((service) => (
            <ServiceTile
              key={service.id}
              href={routes.service(locale, service)}
              icon={service.icon as IconName}
              title={tx(service.title, locale)}
              description={tx(service.summary, locale)}
              online={service.channels.includes('online')}
              onlineLabel={dict.services.onlineBadge}
            />
          ))}
        </ul>
      </Section>

      {/* 5. Avisos e consultas públicas */}
      <Section
        id="avisos"
        tone="alt"
        title={dict.home.noticesTitle}
        lead={dict.home.noticesSubtitle}
        action={
          <ButtonLink
            href={localePath(locale, '/transparencia/consultas-publicas')}
            variant="subtle"
            iconAfter="arrowRight"
          >
            {dict.common.seeAll}
          </ButtonLink>
        }
      >
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {consultations.length === 0 ? (
              <p className="rounded-lg border border-line bg-surface p-6 text-ink-muted">
                {dict.consultations.empty}
              </p>
            ) : (
              <ul className="grid gap-4 md:grid-cols-2">
                {consultations.map((consultation) => (
                  <li key={consultation.id} className="flex">
                    <ConsultationCard
                      consultation={consultation}
                      locale={locale}
                      dict={dict}
                      today={today}
                      className="w-full"
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex flex-col gap-4">
            <section
              aria-labelledby="concursos-title"
              className="rounded-lg border border-line bg-surface p-5"
            >
              <h3 id="concursos-title" className="flex items-center gap-2 font-serif text-lg">
                <Icon name="gavel" size={20} className="text-primary-700" />
                {dict.transparency.openTenders}
              </h3>
              <ul className="mt-3 divide-y divide-line">
                {tenders.slice(0, 4).map((tender) => (
                  <li key={tender.id} className="py-2.5 first:pt-0">
                    <Link
                      href={localePath(locale, '/municipio/contratacao-publica')}
                      className="text-ink no-underline hover:underline underline-offset-[0.2em]"
                    >
                      {tx(tender.title, locale)}
                    </Link>
                    <span className="mt-1 flex flex-wrap items-center gap-2 text-sm text-ink-muted">
                      <Badge tone={tender.kind === 'recrutamento' ? 'info' : 'neutral'}>
                        {tender.reference}
                      </Badge>
                      até {formatDate(tender.deadline, locale)}
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            <FireRiskWidget days={fire.days} advice={fire.advice} locale={locale} dict={dict} />
          </div>
        </div>
      </Section>

      {/* 6. Notícias */}
      <Section
        id="noticias"
        title={dict.home.newsTitle}
        lead={dict.home.newsSubtitle}
        action={
          <ButtonLink href={localePath(locale, '/noticias')} variant="subtle" iconAfter="arrowRight">
            {dict.common.seeAll}
          </ButtonLink>
        }
      >
        <ul className="grid gap-6 md:grid-cols-3">
          {news.map((item, index) => (
            <li key={item.id} className="flex">
              <NewsCard item={item} locale={locale} priority={index === 0} className="w-full" />
            </li>
          ))}
        </ul>
      </Section>

      {/* 7. Agenda */}
      <Section
        id="agenda"
        tone="alt"
        title={dict.home.agendaTitle}
        lead={dict.home.agendaSubtitle}
        action={
          <ButtonLink href={localePath(locale, '/eventos')} variant="subtle" iconAfter="arrowRight">
            {dict.common.seeAll}
          </ButtonLink>
        }
      >
        <WeekAgenda
          events={events}
          locale={locale}
          dict={dict}
          weekStart={weekStart}
          categories={eventCategories}
        />
      </Section>

      {/* 8. Transparência */}
      <Section
        id="transparencia"
        title={dict.home.transparencyTitle}
        lead={dict.home.transparencySubtitle}
        action={
          <ButtonLink
            href={localePath(locale, '/transparencia')}
            variant="subtle"
            iconAfter="arrowRight"
          >
            {dict.common.seeAll}
          </ButtonLink>
        }
      >
        <TransparencyWidget
          budget={budget}
          openTenderCount={tenders.length}
          lastMeeting={lastMeeting}
          locale={locale}
          dict={dict}
        />
      </Section>

      {/* 9. Descobrir Alfândega */}
      <Section
        id="descobrir"
        tone="alt"
        title={dict.home.discoverTitle}
        lead={dict.home.discoverSubtitle}
        action={
          <ButtonLink href={localePath(locale, '/visitar')} variant="secondary" iconAfter="arrowRight">
            {dict.home.discoverCta}
          </ButtonLink>
        }
      >
        <ul className="grid gap-6 md:grid-cols-3">
          {discoverCards.map((card) => (
            <li key={card.href} className="flex">
              <article className="group relative flex w-full flex-col overflow-hidden rounded-lg border border-line bg-surface hover:border-support-700">
                <div className="relative aspect-[3/2] w-full border-b border-line bg-surface-sunken">
                  <Image
                    src={card.image}
                    alt={card.alt}
                    fill
                    sizes="(min-width: 768px) 33vw, 100vw"
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-1 flex-col gap-2 p-5">
                  <h3 className="font-serif text-lg">
                    <Link
                      href={localePath(locale, card.href)}
                      className="text-ink no-underline after:absolute after:inset-0 after:content-[''] hover:underline underline-offset-[0.2em]"
                    >
                      {card.title}
                    </Link>
                  </h3>
                  <p className="text-sm text-ink-muted">{card.text}</p>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}
