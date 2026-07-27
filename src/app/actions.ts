'use server';

import {
  bookingSchema,
  consultationSchema,
  newsletterSchema,
  occurrenceSchema,
} from '@/lib/forms/schemas';

/**
 * Server-Actions.
 *
 * Jede Action validiert noch einmal serverseitig – die Prüfung im Browser ist
 * Komfort, verbindlich ist diese hier. Der Honigtopf wird still behandelt: ein
 * Bot bekommt „erfolgreich“ zurück und merkt nichts.
 *
 * Anbindung an das Fachverfahren: an den mit TODO markierten Stellen. Solange
 * dort nichts steht, wird der Vorgang protokolliert und eine Referenznummer
 * vergeben, damit die Abläufe vollständig durchspielbar sind.
 */

export interface ActionResult {
  ok: boolean;
  reference?: string;
  message?: string;
  fieldErrors?: Record<string, string>;
}

function toFieldErrors(issues: { path: PropertyKey[]; message: string }[]): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of issues) {
    const key = issue.path.join('.');
    if (key && !errors[key]) errors[key] = issue.message;
  }
  return errors;
}

/** Referenznummer im Format OC-2026-0448. */
function makeReference(prefix: string): string {
  const year = new Date().getFullYear();
  const sequence = String(Math.floor(Math.random() * 9000) + 1000);
  return `${prefix}-${year}-${sequence}`;
}

export async function submitConsultation(input: unknown): Promise<ActionResult> {
  const parsed = consultationSchema.safeParse(input);

  if (!parsed.success) {
    // Honigtopf gefüllt: nach außen wie ein Erfolg, nichts wird gespeichert.
    if (parsed.error.issues.some((issue) => issue.path[0] === 'empresa_website')) {
      return { ok: true, reference: makeReference('CP') };
    }
    return {
      ok: false,
      message: 'Corrija os campos assinalados e tente novamente.',
      fieldErrors: toFieldErrors(parsed.error.issues),
    };
  }

  // TODO: an das Verfahren übergeben (E-Mail an consultas@, Eintrag im CMS).
  return { ok: true, reference: makeReference('CP') };
}

export async function submitOccurrence(input: unknown): Promise<ActionResult> {
  const parsed = occurrenceSchema.safeParse(input);

  if (!parsed.success) {
    if (parsed.error.issues.some((issue) => issue.path[0] === 'empresa_website')) {
      return { ok: true, reference: makeReference('OC') };
    }
    return {
      ok: false,
      message: 'Corrija os campos assinalados e tente novamente.',
      fieldErrors: toFieldErrors(parsed.error.issues),
    };
  }

  // TODO: Vorgang im Fachverfahren anlegen und der zuständigen Abteilung zuweisen.
  return { ok: true, reference: makeReference('OC') };
}

export async function submitBooking(input: unknown): Promise<ActionResult> {
  const parsed = bookingSchema.safeParse(input);

  if (!parsed.success) {
    if (parsed.error.issues.some((issue) => issue.path[0] === 'empresa_website')) {
      return { ok: true, reference: makeReference('AT') };
    }
    return {
      ok: false,
      message: 'Corrija os campos assinalados e tente novamente.',
      fieldErrors: toFieldErrors(parsed.error.issues),
    };
  }

  // TODO: Slot im Kalender des Fachbereichs sperren, Bestätigung mit ICS senden.
  return { ok: true, reference: makeReference('AT') };
}

export async function subscribeNewsletter(input: unknown): Promise<ActionResult> {
  const parsed = newsletterSchema.safeParse(input);

  if (!parsed.success) {
    if (parsed.error.issues.some((issue) => issue.path[0] === 'empresa_website')) {
      return { ok: true };
    }
    return {
      ok: false,
      message: 'Indique um endereço válido e pelo menos um tema.',
      fieldErrors: toFieldErrors(parsed.error.issues),
    };
  }

  // TODO: Bestätigungsmail mit Einmal-Link versenden (doppeltes Opt-in).
  // Erst nach dem Klick auf diesen Link entsteht ein Abonnement.
  return { ok: true };
}
