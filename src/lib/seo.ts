import type { Metadata } from 'next';
import { site } from './site';
import { locales, localeHtmlLang, localePath, defaultLocale, type Locale } from '@/i18n/config';

/**
 * Metadados comuns e JSON-LD.
 *
 * Para um portal municipal, os dados estruturados não são um brinquedo de
 * SEO: são o que faz com que o horário, o telefone e os eventos apareçam
 * corretos nos resultados de pesquisa e nos assistentes de voz.
 */

export function absoluteUrl(path: string): string {
  return new URL(path, site.url).toString();
}

/** Alternativas hreflang para todas as línguas da mesma página. */
export function languageAlternates(path: string): Record<string, string> {
  const alternates: Record<string, string> = {};
  for (const locale of locales) {
    alternates[localeHtmlLang[locale]] = absoluteUrl(localePath(locale, path));
  }
  alternates['x-default'] = absoluteUrl(localePath(defaultLocale, path));
  return alternates;
}

export function buildMetadata({
  locale,
  path,
  title,
  description,
  image,
  type = 'website',
  publishedTime,
  noIndex,
}: {
  locale: Locale;
  path: string;
  title: string;
  description: string;
  image?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  noIndex?: boolean;
}): Metadata {
  const url = absoluteUrl(localePath(locale, path));

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: languageAlternates(path),
    },
    robots: noIndex ? { index: false, follow: true } : undefined,
    openGraph: {
      type,
      url,
      title,
      description,
      siteName: site.name,
      locale: localeHtmlLang[locale].replace('-', '_'),
      images: image ? [{ url: absoluteUrl(image) }] : undefined,
      ...(publishedTime ? { publishedTime } : {}),
    },
    twitter: {
      card: image ? 'summary_large_image' : 'summary',
      title,
      description,
    },
  };
}

// --- JSON-LD ---------------------------------------------------------------------

export function governmentOrganizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'GovernmentOrganization',
    '@id': `${site.url}/#organization`,
    name: site.legalName,
    alternateName: site.name,
    url: site.url,
    email: site.contact.email,
    telephone: site.contact.phoneE164,
    taxID: site.nif,
    areaServed: {
      '@type': 'AdministrativeArea',
      name: `Concelho de ${site.shortName}`,
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: site.address.street,
      postalCode: site.address.postalCode,
      addressLocality: site.address.city,
      addressRegion: site.address.district,
      addressCountry: site.address.country,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: site.geo.lat,
      longitude: site.geo.lon,
    },
    openingHoursSpecification: site.openingHoursSpec.map((spec) => {
      const [days, hours] = spec.split(' ');
      const [opens, closes] = hours.split('-');
      return {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: days.split('-').map((day) => `https://schema.org/${dayName(day)}`),
        opens,
        closes,
      };
    }),
    sameAs: site.social.map((entry) => entry.href),
  };
}

function dayName(abbreviation: string): string {
  const map: Record<string, string> = {
    Mo: 'Monday',
    Tu: 'Tuesday',
    We: 'Wednesday',
    Th: 'Thursday',
    Fr: 'Friday',
    Sa: 'Saturday',
    Su: 'Sunday',
  };
  return map[abbreviation] ?? abbreviation;
}

export function websiteJsonLd(locale: Locale) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${site.url}/#website`,
    url: site.url,
    name: site.name,
    inLanguage: localeHtmlLang[locale],
    publisher: { '@id': `${site.url}/#organization` },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: absoluteUrl(`${localePath(locale, '/pesquisa')}?q={search_term_string}`),
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function newsArticleJsonLd(options: {
  locale: Locale;
  headline: string;
  description: string;
  datePublished: string;
  dateModified?: string;
  path: string;
  image?: string;
  section: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: options.headline,
    description: options.description,
    datePublished: options.datePublished,
    dateModified: options.dateModified ?? options.datePublished,
    articleSection: options.section,
    inLanguage: localeHtmlLang[options.locale],
    mainEntityOfPage: absoluteUrl(localePath(options.locale, options.path)),
    image: options.image ? [absoluteUrl(options.image)] : undefined,
    author: { '@type': 'GovernmentOrganization', name: site.legalName },
    publisher: { '@id': `${site.url}/#organization` },
  };
}

export function eventJsonLd(options: {
  locale: Locale;
  name: string;
  description: string;
  startDate: string;
  endDate?: string;
  location: string;
  geo?: { lat: number; lon: number };
  path: string;
  isFree: boolean;
  organiser?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: options.name,
    description: options.description,
    startDate: options.startDate,
    endDate: options.endDate ?? options.startDate,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    inLanguage: localeHtmlLang[options.locale],
    url: absoluteUrl(localePath(options.locale, options.path)),
    location: {
      '@type': 'Place',
      name: options.location,
      address: {
        '@type': 'PostalAddress',
        addressLocality: site.address.city,
        addressRegion: site.address.district,
        addressCountry: site.address.country,
      },
      ...(options.geo
        ? { geo: { '@type': 'GeoCoordinates', latitude: options.geo.lat, longitude: options.geo.lon } }
        : {}),
    },
    organizer: { '@type': 'Organization', name: options.organiser ?? site.legalName },
    offers: options.isFree
      ? {
          '@type': 'Offer',
          price: 0,
          priceCurrency: 'EUR',
          availability: 'https://schema.org/InStock',
          url: absoluteUrl(localePath(options.locale, options.path)),
        }
      : undefined,
  };
}

export function governmentServiceJsonLd(options: {
  locale: Locale;
  name: string;
  description: string;
  path: string;
  audience: string;
  channelOnline?: boolean;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'GovernmentService',
    name: options.name,
    description: options.description,
    inLanguage: localeHtmlLang[options.locale],
    serviceType: 'Serviço municipal',
    provider: { '@id': `${site.url}/#organization` },
    areaServed: { '@type': 'AdministrativeArea', name: `Concelho de ${site.shortName}` },
    audience: { '@type': 'Audience', audienceType: options.audience },
    availableChannel: [
      {
        '@type': 'ServiceChannel',
        serviceUrl: absoluteUrl(localePath(options.locale, options.path)),
        ...(options.channelOnline ? {} : { servicePhone: site.contact.phoneE164 }),
        serviceLocation: {
          '@type': 'Place',
          name: site.legalName,
          address: {
            '@type': 'PostalAddress',
            streetAddress: site.address.street,
            postalCode: site.address.postalCode,
            addressLocality: site.address.city,
            addressCountry: site.address.country,
          },
        },
      },
    ],
  };
}

export function breadcrumbJsonLd(locale: Locale, items: { label: string; href?: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      ...(item.href ? { item: absoluteUrl(localePath(locale, item.href)) } : {}),
    })),
  };
}
