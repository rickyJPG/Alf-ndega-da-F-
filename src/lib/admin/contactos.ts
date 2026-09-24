import { cache } from 'react';
import { z } from 'zod';

import { site } from '@/lib/site';
import { ler } from './deposito';

/**
 * Os contactos do Município, editáveis no painel.
 *
 * Mesmo princípio das notícias: a semente são os valores de `src/lib/site.ts`,
 * versionados com o código, e passam a ser lidos de `conteudo/contactos.json`
 * assim que alguém os corrigir. Uma instalação nova comporta-se tal e qual
 * como antes desta secção existir.
 *
 * Porquê tirá-los do código: um número de telefone ou um horário que mude
 * obrigava a uma alteração de código e uma recompilação para uma coisa que
 * qualquer administrativo sabe de cor. Era a lacuna mais gritante do painel.
 *
 * O que **não** entra aqui, de propósito: o nome e a designação legal da
 * autarquia, as coordenadas geográficas, os números de emergência e as redes
 * sociais. São dados que mudam de década em década ou que, se mudarem,
 * exigem mais do que trocar um campo — o mapa, por exemplo, precisa das
 * coordenadas conferidas.
 */

export interface Horario {
  dias: string;
  horas: string;
}

export interface Contactos {
  morada: string;
  codigoPostal: string;
  localidade: string;
  telefone: string;
  fax: string;
  email: string;
  nif: string;
  horarios: Horario[];
}

/** Os valores que vêm com o portal, enquanto ninguém os corrigir. */
export const contactosDeOrigem: Contactos = {
  morada: site.address.street,
  codigoPostal: site.address.postalCode,
  localidade: site.address.city,
  telefone: site.contact.phone,
  fax: site.contact.fax,
  email: site.contact.email,
  nif: site.nif,
  horarios: site.openingHours.map((horario) => ({
    dias: horario.days,
    horas: horario.hours,
  })),
};

/**
 * Os contactos em vigor.
 *
 * Memorizado por renderização, não por processo: o rodapé está em todas as
 * páginas, e há páginas que também os mostram no corpo e na ficha que os
 * motores de busca leem — seriam três leituras do mesmo ficheiro para servir
 * uma página. `cache()` reduz isso a uma, e o pedido seguinte volta a ler,
 * que é o que faz com que uma correção no painel apareça logo.
 */
export const lerContactos = cache(async function lerContactos(): Promise<Contactos> {
  return ler('contactos', contactosDeOrigem);
});

/**
 * O telefone em formato internacional, para os `tel:` e para o JSON-LD.
 *
 * Derivado do número escrito, em vez de ser mais um campo: pedir as duas
 * formas convidava a que ficassem diferentes uma da outra, e o erro só
 * apareceria a quem carregasse no número a partir do telemóvel.
 */
export function telefoneInternacional(telefone: string): string {
  const digitos = telefone.replace(/\D/g, '');
  if (!digitos) return '';
  return digitos.startsWith('351') ? `+${digitos}` : `+351${digitos}`;
}

/* --------------------------------------------------------------- validação -- */

const obrigatorio = (campo: string) => `Escreva ${campo}.`;

export const esquemaDeContactos = z.object({
  morada: z.string().trim().min(3, obrigatorio('a morada')).max(120),
  codigoPostal: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{3}$/, 'O código postal escreve-se como 5350-014.'),
  localidade: z.string().trim().min(2, obrigatorio('a localidade')).max(80),
  telefone: z
    .string()
    .trim()
    .regex(/^[\d\s]{9,20}$/, 'O telefone só leva algarismos e espaços. Ex.: 279 468 120.'),
  // O fax é o único que pode ficar vazio: há serviços que já o desligaram.
  fax: z
    .string()
    .trim()
    .regex(/^$|^[\d\s]{9,20}$/, 'O fax só leva algarismos e espaços, ou fica vazio.'),
  email: z.string().trim().email('Esse endereço de correio não é válido.'),
  nif: z
    .string()
    .trim()
    .regex(/^\d{3}\s?\d{3}\s?\d{3}$/, 'O NIF tem nove algarismos. Ex.: 506 811 663.'),
  horarios: z
    .array(
      z.object({
        dias: z.string().trim().min(1),
        horas: z.string().trim().min(1),
      }),
    )
    .min(1, 'Deixe pelo menos uma linha de horário.'),
});
