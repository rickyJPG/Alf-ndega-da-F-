import { z } from 'zod';

/**
 * Formularschemas.
 *
 * Os mesmos esquemas correm no navegador (React Hook Form) e outra vez na
 * ação de servidor. A validação no cliente é comodidade, a do servidor é a
 * que vale — desde logo porque é possível submeter sem JavaScript.
 *
 * As mensagens estão em português dentro do esquema porque pertencem ao
 * campo e não à interface.
 */

const REQUIRED = 'Este campo é obrigatório.';

export const emailField = z
  .string()
  .min(1, REQUIRED)
  .email('Indique um endereço de correio eletrónico válido.');

/** Portugiesische Rufnummern: neun Ziffern, Leerzeichen erlaubt. */
export const phoneField = z
  .string()
  .trim()
  .regex(/^(\+351\s?)?\d{3}\s?\d{3}\s?\d{3}$/, 'Indique um número de telefone válido (9 dígitos).');

export const nifField = z
  .string()
  .trim()
  .regex(/^\d{9}$/, 'O NIF tem de ter 9 dígitos.');

/** Campo-armadilha: invisível para as pessoas, irresistível para os robôs. */
const honeypot = z.string().max(0, 'Pedido rejeitado.').optional().or(z.literal(''));

export const consultationSchema = z.object({
  name: z.string().trim().min(2, REQUIRED).max(120, 'Texto demasiado longo.'),
  email: emailField,
  contribution: z
    .string()
    .trim()
    .min(20, 'Escreva um pouco mais, por favor (pelo menos 20 caracteres).')
    .max(5000, 'Texto demasiado longo (máximo 5000 caracteres).'),
  consent: z.literal(true, { message: 'É necessário autorizar o tratamento dos dados.' }),
  empresa_website: honeypot,
});

export type ConsultationInput = z.infer<typeof consultationSchema>;

export const occurrenceCategories = [
  'via-publica',
  'iluminacao',
  'residuos',
  'agua-e-saneamento',
  'espacos-verdes',
  'sinalizacao',
  'outro',
] as const;

export const occurrenceSchema = z.object({
  category: z.enum(occurrenceCategories, { message: 'Escolha uma categoria.' }),
  description: z
    .string()
    .trim()
    .min(15, 'Descreva a ocorrência em pelo menos 15 caracteres.')
    .max(2000, 'Texto demasiado longo.'),
  freguesia: z.string().min(1, 'Escolha a freguesia.'),
  lat: z.number().min(41.0).max(41.7),
  lon: z.number().min(-7.3).max(-6.6),
  name: z.string().trim().max(120).optional().or(z.literal('')),
  email: z.union([emailField, z.literal('')]).optional(),
  phone: z.union([phoneField, z.literal('')]).optional(),
  consent: z.literal(true, { message: 'É necessário autorizar o tratamento dos dados.' }),
  empresa_website: honeypot,
});

export type OccurrenceInput = z.infer<typeof occurrenceSchema>;

export const bookingSchema = z.object({
  serviceId: z.string().min(1, 'Escolha o serviço.'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Escolha o dia.'),
  time: z.string().regex(/^\d{2}:\d{2}$/, 'Escolha a hora.'),
  name: z.string().trim().min(2, REQUIRED).max(120),
  email: emailField,
  phone: phoneField,
  notes: z.string().trim().max(600, 'Texto demasiado longo.').optional().or(z.literal('')),
  consent: z.literal(true, { message: 'É necessário autorizar o tratamento dos dados.' }),
  empresa_website: honeypot,
});

export type BookingInput = z.infer<typeof bookingSchema>;

export const newsletterSchema = z.object({
  email: emailField,
  topics: z.array(z.string()).min(1, 'Escolha pelo menos um tema.'),
  empresa_website: honeypot,
});

export type NewsletterInput = z.infer<typeof newsletterSchema>;
