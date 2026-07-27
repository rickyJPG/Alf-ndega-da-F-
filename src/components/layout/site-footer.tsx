import Link from 'next/link';
import { site } from '@/lib/site';
import { complaintsBook, legalLinks, navLabel } from '@/lib/navigation';
import { localePath, type Locale } from '@/i18n/config';
import { fill, type Dictionary } from '@/i18n';
import { getFreguesias } from '@/content';
import { Icon } from '@/components/ui/icon';
import { NewsletterForm } from './newsletter-form';
import { Brasao } from './brasao';

/**
 * Rodapé. Contactos com mapa, horário, números de emergência, freguesias,
 * boletim informativo e informação legal. Os logótipos dos parceiros ficam
 * numa barra recolhida, em vez de catorze lado a lado.
 *
 * Claro, como o resto do portal: fundo neutro, texto a tinta, o filete de
 * cereja em cima como remate. Sem grandes superfícies escuras.
 */
export async function SiteFooter({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const freguesias = await getFreguesias();
  const year = new Date().getFullYear();

  const mapQuery = encodeURIComponent(
    `${site.address.street}, ${site.address.postalCode} ${site.address.city}, Portugal`,
  );

  return (
    <footer className="mt-16 border-t-4 border-accent-600 bg-surface-alt" data-print="hide">
      <h2 className="sr-only">{dict.footer.contactTitle}</h2>

      <div className="container-page grid gap-10 py-12 lg:grid-cols-12 lg:gap-8">
        {/* Contactos */}
        <section className="lg:col-span-4" aria-labelledby="footer-contact">
          <div className="flex items-start gap-3">
            <Brasao size={44} />
            <div>
              <p id="footer-contact" className="font-serif text-lg font-semibold">
                {site.legalName}
              </p>
              <address className="mt-2 not-italic text-ink-muted">
                {site.address.street}
                <br />
                {site.address.postalCode} {site.address.city}
              </address>
            </div>
          </div>

          <ul className="mt-4 flex flex-col gap-2 text-ink-muted">
            <li className="flex items-center gap-2">
              <Icon name="phone" size={17} />
              <a href={`tel:${site.contact.phoneE164}`} className="text-ink underline underline-offset-[0.2em]">
                {site.contact.phone}
              </a>
              <span className="text-sm">({site.contact.callCost})</span>
            </li>
            <li className="flex items-center gap-2">
              <Icon name="mail" size={17} />
              <a
                href={`mailto:${site.contact.email}`}
                className="break-all text-ink underline underline-offset-[0.2em]"
              >
                {site.contact.email}
              </a>
            </li>
          </ul>

          <a
            href={`https://www.openstreetmap.org/search?query=${mapQuery}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 flex items-center gap-2 rounded-md border border-line-strong bg-surface px-3 py-2.5 text-ink hover:border-primary-600"
          >
            <Icon name="mapPin" size={18} />
            {dict.contact.getDirections}
            <Icon name="external" size={14} />
          </a>

          <h3 className="mt-8 font-serif text-lg font-semibold">{dict.footer.hoursTitle}</h3>
          <dl className="mt-2">
            {site.openingHours.map((entry) => (
              <div key={entry.days} className="flex flex-col py-1 sm:flex-row sm:gap-2">
                <dt className="font-medium">{entry.days}</dt>
                <dd className="text-ink-muted">{entry.hours}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Números de emergência */}
        <section className="lg:col-span-3" aria-labelledby="footer-emergency">
          <h3 id="footer-emergency" className="font-serif text-lg font-semibold">
            {dict.footer.emergencyTitle}
          </h3>
          <ul className="mt-3 flex flex-col gap-2">
            {site.emergency.map((entry) => (
              <li key={entry.number + entry.label} className="flex flex-col">
                <a
                  href={`tel:${entry.number.replace(/\s/g, '')}`}
                  className="font-semibold text-ink underline underline-offset-[0.2em] tabular-nums"
                >
                  {entry.number}
                </a>
                <span className="text-sm text-ink-muted">{entry.label}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Freguesias */}
        <section className="lg:col-span-2" aria-labelledby="footer-freguesias">
          <h3 id="footer-freguesias" className="font-serif text-lg font-semibold">
            {dict.footer.freguesiasTitle}
          </h3>
          <ul className="mt-3 flex flex-col gap-1.5">
            {freguesias.map((freguesia) => (
              <li key={freguesia.slug}>
                <Link
                  href={localePath(locale, `/municipio/freguesias/${freguesia.slug}`)}
                  className="text-sm text-ink-muted no-underline hover:text-ink hover:underline underline-offset-[0.2em]"
                >
                  {freguesia.name.replace('União das Freguesias de ', '')}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* Boletim informativo */}
        <section className="lg:col-span-3" aria-labelledby="footer-newsletter">
          <h3 id="footer-newsletter" className="font-serif text-lg font-semibold">
            {dict.footer.newsletterTitle}
          </h3>
          <p className="mt-2 mb-4 text-ink-muted">{dict.footer.newsletterLead}</p>
          <NewsletterForm dict={dict} />

          <ul className="mt-6 flex flex-wrap gap-3">
            {site.social.map((entry) => (
              <li key={entry.label}>
                <a
                  href={entry.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-ink-muted underline underline-offset-[0.2em] hover:text-ink"
                >
                  {entry.label}
                  <Icon name="external" size={13} />
                </a>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Parceiros — recolhidos, em vez de catorze logótipos lado a lado */}
      <div className="border-t border-line">
        <div className="container-page py-4">
          <details className="group">
            <summary className="inline-flex min-h-11 cursor-pointer list-none items-center gap-2 text-sm text-ink-muted hover:text-ink">
              <Icon
                name="chevronRight"
                size={16}
                className="transition-transform group-open:rotate-90"
              />
              {dict.footer.partnersTitle}
              <span>— {dict.footer.partnersToggle}</span>
            </summary>
            <ul className="mt-4 flex flex-wrap gap-3">
              {[
                'República Portuguesa',
                'Portugal 2030',
                'União Europeia — FEDER',
                'CIM Terras de Trás-os-Montes',
                'Norte 2030',
                'PDR 2020',
              ].map((partner) => (
                <li
                  key={partner}
                  className="rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink-muted"
                >
                  {partner}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-sm text-ink-muted">
              Os logótipos oficiais dos parceiros são carregados no CMS e substituem esta lista.
            </p>
          </details>
        </div>
      </div>

      {/* Informação legal */}
      <div className="border-t border-line">
        <div className="container-page flex flex-col gap-4 py-5 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-ink-muted">{fill(dict.footer.copyright, { year })}</p>
          <nav aria-label={dict.footer.legalTitle}>
            <ul className="flex flex-wrap gap-x-5 gap-y-2">
              {legalLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={localePath(locale, item.href)}
                    className="text-sm text-ink-muted no-underline hover:text-ink hover:underline underline-offset-[0.2em]"
                  >
                    {navLabel(item, locale)}
                  </Link>
                </li>
              ))}
              <li>
                <a
                  href={complaintsBook.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-ink-muted underline underline-offset-[0.2em] hover:text-ink"
                >
                  {navLabel(complaintsBook, locale)}
                  <Icon name="external" size={13} />
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  );
}
