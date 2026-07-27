import type { Metadata } from 'next';
import { getDictionary } from '@/i18n';
import { defaultLocale } from '@/i18n/config';
import { site } from '@/lib/site';
import { Icon } from '@/components/ui/icon';

/**
 * Offline-Ersatzseite.
 *
 * De propósito fora de /[locale]: é o service worker que a serve quando não
 * há rede, por isso não pode depender de nada que tenha de ser transferido.
 * Os contactos e os números de emergência estão fixos no próprio markup.
 */
export const metadata: Metadata = {
  title: 'Sem ligação',
  robots: { index: false, follow: false },
};

export default function OfflinePage() {
  const dict = getDictionary(defaultLocale);

  return (
    <html lang="pt-PT">
      <body className="bg-surface text-ink">
        <main className="container-page py-16">
          <div className="measure">
            <p className="flex items-center gap-3 text-primary-700">
              <Icon name="wifiOff" size={32} />
              <span className="font-serif text-2xl font-semibold">{dict.errors.offlineTitle}</span>
            </p>
            <p className="mt-4 text-lg text-ink-muted">{dict.errors.offlineLead}</p>
          </div>

          <section className="mt-10" aria-labelledby="offline-emergency">
            <h1 id="offline-emergency" className="text-2xl">
              {dict.contact.emergency}
            </h1>
            <ul className="mt-4 divide-y divide-line rounded-lg border border-line">
              {site.emergency.map((entry) => (
                <li key={entry.label} className="flex items-center justify-between gap-4 p-4">
                  <span>{entry.label}</span>
                  <a
                    href={`tel:${entry.number.replace(/\s/g, '')}`}
                    className="shrink-0 font-serif text-xl font-semibold text-primary-600 underline underline-offset-[0.2em] tabular-nums"
                  >
                    {entry.number}
                  </a>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-10" aria-labelledby="offline-contact">
            <h2 id="offline-contact" className="text-2xl">
              {dict.contact.title}
            </h2>
            <address className="mt-3 not-italic">
              {site.legalName}
              <br />
              {site.address.street}
              <br />
              {site.address.postalCode} {site.address.city}
            </address>
            <p className="mt-3 flex flex-col gap-2">
              <a
                href={`tel:${site.contact.phoneE164}`}
                className="text-primary-600 underline underline-offset-[0.2em]"
              >
                {site.contact.phone}
              </a>
              <a
                href={`mailto:${site.contact.email}`}
                className="text-primary-600 underline underline-offset-[0.2em]"
              >
                {site.contact.email}
              </a>
            </p>

            <h3 className="mt-6 font-serif text-lg">{dict.contact.openingHours}</h3>
            <dl className="mt-2">
              {site.openingHours.map((entry) => (
                <div key={entry.days} className="flex flex-col py-1 sm:flex-row sm:gap-3">
                  <dt className="font-medium sm:w-64">{entry.days}</dt>
                  <dd className="text-ink-muted">{entry.hours}</dd>
                </div>
              ))}
            </dl>
          </section>
        </main>
      </body>
    </html>
  );
}
