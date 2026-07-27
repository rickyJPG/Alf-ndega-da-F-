import type { FieldValues, Resolver } from 'react-hook-form';
import type { ZodType } from 'zod';

/**
 * Verbindet Zod mit React Hook Form.
 *
 * Bewusst zwölf Zeilen statt einer weiteren Abhängigkeit: derselbe Schema-Typ
 * validiert im Browser und – noch einmal, verbindlich – in der Server-Action.
 */
export function zodResolver<T extends FieldValues>(schema: ZodType<T>): Resolver<T> {
  return async (values) => {
    const result = schema.safeParse(values);

    if (result.success) {
      return { values: result.data, errors: {} };
    }

    const errors: Record<string, { type: string; message: string }> = {};
    for (const issue of result.error.issues) {
      const path = issue.path.join('.');
      // Nur die erste Meldung pro Feld – mehr verwirrt beim Ausfüllen.
      if (path && !errors[path]) {
        errors[path] = { type: issue.code ?? 'validation', message: issue.message };
      }
    }

    return { values: {}, errors: errors as never };
  };
}
