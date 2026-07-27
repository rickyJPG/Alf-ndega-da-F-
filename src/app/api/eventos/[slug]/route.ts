import { NextResponse } from 'next/server';
import { getAllEvents, getEvent } from '@/content';
import { eventToIcs } from '@/lib/ics';
import { site } from '@/lib/site';

/**
 * `/api/eventos/<slug>.ics` — entrada de calendário para descarregar.
 * É gerada no build; os ficheiros só mudam quando o evento muda.
 */
export async function generateStaticParams() {
  const events = await getAllEvents();
  return events.map((event) => ({ slug: `${event.slug}.ics` }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const event = await getEvent(slug.replace(/\.ics$/, ''));

  if (!event) {
    return new NextResponse('Evento não encontrado', { status: 404 });
  }

  return new NextResponse(eventToIcs(event, site.url), {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="${event.slug}.ics"`,
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
