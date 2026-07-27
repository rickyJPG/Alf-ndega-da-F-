'use client';

import { useEffect, useRef, useState } from 'react';
import type { Map as LeafletMap, Marker } from 'leaflet';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';

export interface MapPoint {
  lat: number;
  lon: number;
  label: string;
  tone?: 'open' | 'progress' | 'resolved';
  href?: string;
}

const TONE_COLORS: Record<NonNullable<MapPoint['tone']>, string> = {
  open: '#B4232E',
  progress: '#A85D00',
  resolved: '#1E7A46',
};

/**
 * Leaflet-Karte mit OpenStreetMap-Kacheln.
 *
 * Leaflet wird erst im Browser geladen (dynamischer Import), damit es nicht im
 * Server-Bundle landet und die übrigen Seiten nicht belastet.
 *
 * Barrierefreiheit: die Karte ist ein Zusatzangebot, keine Voraussetzung. Der
 * Ort lässt sich immer auch über die Freguesia-Auswahl und die Textbeschreibung
 * angeben, und jeder Punkt steht zusätzlich in einer Liste unter der Karte –
 * eine Karte allein ist mit Screenreader und Tastatur nicht bedienbar.
 */
export function LocationMap({
  center = { lat: 41.3444, lon: -6.9589 },
  zoom = 12,
  points = [],
  selectable = false,
  value,
  onChange,
  label,
  hint,
  className,
}: {
  center?: { lat: number; lon: number };
  zoom?: number;
  points?: MapPoint[];
  selectable?: boolean;
  value?: { lat: number; lon: number } | null;
  onChange?: (position: { lat: number; lon: number }) => void;
  label: string;
  hint?: string;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<Marker | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'failed'>('loading');
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    let cancelled = false;

    /**
     * Das Leaflet-Stylesheet liegt selbst gehostet unter /vendor/leaflet und
     * wird erst hier eingehängt – so belastet es die übrigen Seiten nicht.
     * `npm run vendor` aktualisiert die Kopie nach einem Leaflet-Update.
     */
    function ensureStylesheet() {
      const id = 'leaflet-stylesheet';
      if (document.getElementById(id)) return;
      const link = document.createElement('link');
      link.id = id;
      link.rel = 'stylesheet';
      link.href = '/vendor/leaflet/leaflet.css';
      document.head.append(link);
    }

    async function boot() {
      try {
        ensureStylesheet();
        const L = (await import('leaflet')).default;
        if (cancelled || !containerRef.current || mapRef.current) return;

        const map = L.map(containerRef.current, {
          center: [center.lat, center.lon],
          zoom,
          scrollWheelZoom: false,
        });

        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '© colaboradores do OpenStreetMap',
        }).addTo(map);

        for (const point of points) {
          const color = TONE_COLORS[point.tone ?? 'open'];
          L.circleMarker([point.lat, point.lon], {
            radius: 8,
            color: '#ffffff',
            weight: 2,
            fillColor: color,
            fillOpacity: 1,
          })
            .addTo(map)
            .bindPopup(
              point.href
                ? `<a href="${point.href}">${escapeHtml(point.label)}</a>`
                : escapeHtml(point.label),
            );
        }

        if (selectable) {
          map.on('click', (event) => {
            const { lat, lng } = event.latlng;
            onChange?.({ lat: Number(lat.toFixed(6)), lon: Number(lng.toFixed(6)) });
          });
        }

        mapRef.current = map;
        setStatus('ready');
      } catch {
        setStatus('failed');
      }
    }

    void boot();

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // Die Karte wird einmal aufgebaut; Punkte ändern sich in dieser Ansicht nicht.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Markierung des gewählten Punkts nachführen.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectable) return;

    async function update() {
      const L = (await import('leaflet')).default;
      if (!value) {
        markerRef.current?.remove();
        markerRef.current = null;
        return;
      }
      if (markerRef.current) {
        markerRef.current.setLatLng([value.lat, value.lon]);
      } else {
        markerRef.current = L.circleMarker([value.lat, value.lon], {
          radius: 10,
          color: '#ffffff',
          weight: 3,
          fillColor: '#B4232E',
          fillOpacity: 1,
        }).addTo(map!) as unknown as Marker;
      }
      map!.panTo([value.lat, value.lon]);
    }

    void update();
  }, [value, selectable]);

  function locate() {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        onChange?.({
          lat: Number(position.coords.latitude.toFixed(6)),
          lon: Number(position.coords.longitude.toFixed(6)),
        });
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }

  return (
    <div className={className}>
      <div
        ref={containerRef}
        role="application"
        aria-label={label}
        className={cn(
          'h-80 w-full rounded-lg border border-line bg-surface-alt',
          status !== 'ready' && 'flex items-center justify-center',
        )}
      >
        {status === 'loading' ? <span className="text-ink-muted">A carregar o mapa…</span> : null}
        {status === 'failed' ? (
          <span className="px-4 text-center text-ink-muted">
            O mapa não está disponível. Indique o local na descrição e escolha a freguesia — é
            suficiente para dar seguimento.
          </span>
        ) : null}
      </div>

      {hint ? <p className="mt-2 text-sm text-ink-muted">{hint}</p> : null}

      {selectable ? (
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={locate}
            disabled={locating}
            className="inline-flex min-h-11 items-center gap-2 rounded-md border border-line-strong bg-surface px-4 font-semibold hover:bg-surface-alt disabled:opacity-60"
          >
            <Icon name="mapPin" size={18} />
            {locating ? 'A localizar…' : 'Usar a minha localização'}
          </button>

          <output aria-live="polite" className="text-sm text-ink-muted tabular-nums">
            {value
              ? `Ponto escolhido: ${value.lat.toFixed(5)}, ${value.lon.toFixed(5)}`
              : 'Nenhum ponto escolhido'}
          </output>
        </div>
      ) : null}
    </div>
  );
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
