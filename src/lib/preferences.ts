/**
 * Anzeige-Einstellungen des Nutzers: Thema und Barrierefreiheits-Optionen.
 *
 * Gespeichert wird ausschließlich lokal (localStorage), nicht in einem Cookie
 * und nicht auf dem Server – es entsteht kein personenbezogenes Datum, das
 * eine Einwilligung bräuchte.
 */

export const PREFS_KEY = 'cmadf:prefs';

export type ThemeChoice = 'system' | 'light' | 'dark';

export interface Preferences {
  theme: ThemeChoice;
  /** Textskalierung, 1 = 100 %. */
  fontScale: number;
  highContrast: boolean;
  looseSpacing: boolean;
  legibleFont: boolean;
  reduceMotion: boolean;
}

export const defaultPreferences: Preferences = {
  theme: 'system',
  fontScale: 1,
  highContrast: false,
  looseSpacing: false,
  legibleFont: false,
  reduceMotion: false,
};

export const FONT_SCALE_STEPS = [0.9, 1, 1.15, 1.3, 1.5] as const;

export function readPreferences(): Preferences {
  if (typeof window === 'undefined') return defaultPreferences;
  try {
    const raw = window.localStorage.getItem(PREFS_KEY);
    if (!raw) return defaultPreferences;
    return { ...defaultPreferences, ...(JSON.parse(raw) as Partial<Preferences>) };
  } catch {
    return defaultPreferences;
  }
}

export function writePreferences(prefs: Preferences): void {
  try {
    window.localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch {
    /* Privater Modus o. Ä. – Einstellungen gelten dann nur für diese Sitzung. */
  }
}

/** Schreibt die Einstellungen als data-Attribute auf <html>. Das CSS macht den Rest. */
export function applyPreferences(prefs: Preferences, root: HTMLElement): void {
  const resolvedTheme =
    prefs.theme === 'system'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      : prefs.theme;

  root.dataset.theme = resolvedTheme;
  root.dataset.themeChoice = prefs.theme;
  root.style.setProperty('--a11y-scale', String(prefs.fontScale));

  toggleAttr(root, 'contrast', prefs.highContrast ? 'high' : null);
  toggleAttr(root, 'spacing', prefs.looseSpacing ? 'loose' : null);
  toggleAttr(root, 'font', prefs.legibleFont ? 'legible' : null);
  toggleAttr(root, 'motion', prefs.reduceMotion ? 'reduced' : null);
}

function toggleAttr(root: HTMLElement, name: string, value: string | null): void {
  if (value === null) root.removeAttribute(`data-${name}`);
  else root.setAttribute(`data-${name}`, value);
}

/**
 * Läuft synchron vor dem ersten Paint – verhindert das Aufblitzen des hellen
 * Themas und Layout-Sprünge durch nachträgliche Textskalierung.
 * Wird als Zeichenkette in ein <script> geschrieben, deshalb ES5-freundlich
 * und ohne Abhängigkeiten.
 */
export const preferencesBootstrapScript = `(function(){try{
var d=document.documentElement;
var p={};try{p=JSON.parse(localStorage.getItem('${PREFS_KEY}')||'{}')||{}}catch(e){}
var c=p.theme||'system';
var t=c==='system'?(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):c;
d.setAttribute('data-theme',t);
d.setAttribute('data-theme-choice',c);
if(p.fontScale)d.style.setProperty('--a11y-scale',String(p.fontScale));
if(p.highContrast)d.setAttribute('data-contrast','high');
if(p.looseSpacing)d.setAttribute('data-spacing','loose');
if(p.legibleFont)d.setAttribute('data-font','legible');
if(p.reduceMotion)d.setAttribute('data-motion','reduced');
}catch(e){}})();`;
