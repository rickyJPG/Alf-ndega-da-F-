/**
 * Tipos mínimos do Payload CMS.
 *
 * Existem só para que as definições em `cms/collections/` sejam verificadas
 * pelo TypeScript sem instalar o Payload no projeto do portal. Ao mover as
 * coleções para o projeto do CMS, troque este import por:
 *
 *   import type { CollectionConfig } from 'payload';
 *
 * e apague este ficheiro.
 */

export interface FieldBase {
  name: string;
  label?: string | Record<string, string>;
  required?: boolean;
  unique?: boolean;
  localized?: boolean;
  admin?: {
    description?: string;
    position?: 'sidebar';
    readOnly?: boolean;
    /** Ajuda mostrada ao editor, em português. */
    placeholder?: string;
  };
  defaultValue?: unknown;
}

export type Field =
  | (FieldBase & { type: 'text' | 'textarea' | 'email' | 'number' | 'date' | 'checkbox' | 'richText' | 'code' })
  | (FieldBase & { type: 'select'; options: { label: string; value: string }[]; hasMany?: boolean })
  | (FieldBase & { type: 'relationship'; relationTo: string | string[]; hasMany?: boolean })
  | (FieldBase & { type: 'upload'; relationTo: string })
  | (FieldBase & { type: 'array' | 'group'; fields: Field[] })
  | (FieldBase & { type: 'point' });

export interface CollectionConfig {
  slug: string;
  labels?: { singular: string; plural: string };
  admin?: {
    useAsTitle?: string;
    defaultColumns?: string[];
    group?: string;
    description?: string;
  };
  versions?: { drafts: boolean };
  access?: Record<string, unknown>;
  fields: Field[];
}
