import { describe, expect, it } from 'vitest';
import { services } from '@/content/data/services';
import { documents } from '@/content/data/documents';
import { news } from '@/content/data/news';
import { events } from '@/content/data/events';
import { freguesias } from '@/content/data/freguesias';
import { editorialPages } from '@/content/data/pages';
import { consultations } from '@/content/data/consultations';
import { allNavigationHrefs, mainNavigation } from '@/lib/navigation';
import { legacyRedirects } from '@/lib/redirects';
import { serviceAreas } from '@/lib/routes';
import { locales } from '@/i18n/config';

/**
 * Testes de integridade do conteúdo.
 *
 * Não verificam código: verificam que quem edita conteúdo não deixa uma
 * ligação a apontar para o vazio. É o erro mais comum num portal municipal e
 * o mais fácil de apanhar automaticamente.
 */

/** Todos os caminhos que o portal sabe servir. */
function knownPaths(): Set<string> {
  const paths = new Set<string>(['/']);

  for (const page of editorialPages) paths.add(`/${page.path}`);
  for (const service of services) paths.add(`/servicos/${service.area}/${service.slug}`);
  for (const area of serviceAreas) paths.add(`/servicos/${area}`);
  for (const document of documents) paths.add(`/documentos/${document.slug}`);
  for (const event of events) paths.add(`/eventos/${event.slug}`);
  for (const freguesia of freguesias) paths.add(`/municipio/freguesias/${freguesia.slug}`);
  for (const consultation of consultations) {
    paths.add(`/transparencia/consultas-publicas/${consultation.slug}`);
  }
  for (const item of news) {
    paths.add(`/noticias/${item.date.slice(0, 4)}/${item.date.slice(5, 7)}/${item.slug}`);
  }

  // Rotas com ficheiro próprio.
  for (const path of [
    '/servicos',
    '/servicos/marcacoes',
    '/servicos/agua-e-residuos/recolha',
    '/noticias',
    '/eventos',
    '/documentos',
    '/transparencia',
    '/transparencia/orcamento',
    '/transparencia/consultas-publicas',
    '/municipio/contactos',
    '/municipio/freguesias',
    '/municipio/reunioes',
    '/viver-e-participar/ocorrencias',
    '/viver-e-participar/orcamento-participativo',
    '/pesquisa',
    '/acessibilidade',
    '/styleguide',
  ]) {
    paths.add(path);
  }

  return paths;
}

describe('integridade da navegação', () => {
  const paths = knownPaths();

  it('todas as entradas de navegação apontam para uma página existente', () => {
    const broken = allNavigationHrefs().filter((href) => !paths.has(href.split('?')[0]));
    expect(broken).toEqual([]);
  });

  it('todos os destinos dos redirecionamentos 301 existem', () => {
    const broken = legacyRedirects
      .map((redirect) => redirect.destination.split('?')[0])
      .filter((destination) => !destination.includes(':') && !paths.has(destination));
    expect(broken).toEqual([]);
  });

  it('as ligações internas das páginas editoriais são válidas', () => {
    const broken: string[] = [];
    for (const page of editorialPages) {
      for (const block of page.blocks) {
        if (block.type !== 'links') continue;
        for (const link of block.links) {
          if (link.external) continue;
          const path = `/${link.href.replace(/^\//, '')}`.split('?')[0];
          if (!paths.has(path)) broken.push(`${page.path} → ${link.href}`);
        }
      }
    }
    expect(broken).toEqual([]);
  });

  it('os caminhos indicados nos documentos para tratar online existem', () => {
    const broken = documents
      .map((document) => document.onlinePath)
      .filter((path): path is string => Boolean(path))
      .filter((path) => !paths.has(path));
    expect(broken).toEqual([]);
  });

  it('os serviços relacionados existem todos', () => {
    const slugs = new Set(services.map((service) => service.slug));
    const broken = services.flatMap((service) =>
      (service.relatedServices ?? []).filter((slug) => !slugs.has(slug)),
    );
    expect(broken).toEqual([]);
  });

  it('os formulários associados a serviços existem no catálogo', () => {
    const ids = new Set(documents.map((document) => document.id));
    const broken = services.flatMap((service) =>
      (service.forms ?? []).filter((id) => !ids.has(id)),
    );
    expect(broken).toEqual([]);
  });

  it('a navegação principal tem no máximo cinco entradas e dois níveis', () => {
    expect(mainNavigation.length).toBeLessThanOrEqual(5);
    for (const section of mainNavigation) {
      expect(section.groups.length).toBeGreaterThan(0);
      for (const group of section.groups) {
        expect(group.items.length).toBeGreaterThan(0);
      }
    }
  });

  it('cada entrada de navegação tem rótulo nas quatro línguas', () => {
    for (const section of mainNavigation) {
      for (const locale of locales) {
        expect(section.label[locale], `${section.id} · ${locale}`).toBeTruthy();
      }
      for (const group of section.groups) {
        for (const item of group.items) {
          for (const locale of locales) {
            expect(item.label[locale], `${item.href} · ${locale}`).toBeTruthy();
          }
        }
      }
    }
  });
});

describe('integridade do conteúdo', () => {
  it('não há slugs repetidos', () => {
    const collections = [
      services.map((item) => item.slug),
      documents.map((item) => item.slug),
      events.map((item) => item.slug),
      freguesias.map((item) => item.slug),
      editorialPages.map((item) => item.path),
    ];
    for (const slugs of collections) {
      expect(new Set(slugs).size).toBe(slugs.length);
    }
  });

  it('as notícias têm data válida e resumo', () => {
    for (const item of news) {
      expect(item.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(item.summary.pt.length).toBeGreaterThan(20);
      expect(item.body.pt.length).toBeGreaterThan(0);
    }
  });

  it('todas as imagens têm texto alternativo', () => {
    for (const item of news) {
      if (item.image) expect(item.image.alt.pt.length).toBeGreaterThan(10);
    }
    for (const event of events) {
      if (event.image) expect(event.image.alt.pt.length).toBeGreaterThan(10);
    }
  });

  it('cada serviço responde às cinco perguntas essenciais', () => {
    for (const service of services) {
      expect(service.audience.pt, service.slug).toBeTruthy();
      expect(service.processingTime.pt, service.slug).toBeTruthy();
      expect(service.fee.pt, service.slug).toBeTruthy();
      expect(service.requiredDocuments.pt.length, service.slug).toBeGreaterThan(0);
      expect(service.steps.length, service.slug).toBeGreaterThan(0);
      expect(service.department, service.slug).toBeTruthy();
    }
  });

  it('cada serviço pertence a uma área com página própria', () => {
    for (const service of services) {
      expect(serviceAreas as readonly string[]).toContain(service.area);
    }
  });

  it('as consultas públicas têm um período coerente', () => {
    for (const consultation of consultations) {
      expect(consultation.startsAt < consultation.endsAt, consultation.slug).toBe(true);
    }
  });

  it('as freguesias são doze e todas têm presidente e sede', () => {
    expect(freguesias).toHaveLength(12);
    for (const freguesia of freguesias) {
      expect(freguesia.president).toBeTruthy();
      expect(freguesia.seat).toBeTruthy();
      expect(freguesia.villages.length).toBeGreaterThan(0);
    }
  });
});
