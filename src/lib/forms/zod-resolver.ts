import type { FieldValues, Resolver } from 'react-hook-form';
import type { ZodType } from 'zod';

/**
 * Liga o Zod ao React Hook Form.
 *
 * De propósito uma dúzia de linhas em vez de mais uma dependência: o mesmo
 * esquema valida no navegador e — outra vez, de forma vinculativa — na ação
 * de servidor.
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
      // Só a primeira mensagem por campo — mais do que isso confunde.
      if (path && !errors[path]) {
        errors[path] = { type: issue.code ?? 'validation', message: issue.message };
      }
    }

    return { values: {}, errors: errors as never };
  };
}
