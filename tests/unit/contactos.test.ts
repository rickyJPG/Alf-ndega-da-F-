import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { esquemaDeContactos, telefoneInternacional } from '@/lib/admin/contactos';

/**
 * Contactos do Município.
 *
 * São dados que aparecem em todo o portal e no que os motores de busca leem.
 * Um código postal com um algarismo a mais ou um endereço de correio
 * malformado não estraga uma página — estraga todas, e no sítio onde um
 * munícipe vai procurar quando precisa mesmo de falar com a câmara.
 */

describe('validação dos contactos', () => {
  const validos = {
    morada: 'Largo de D. Dinis',
    codigoPostal: '5350-014',
    localidade: 'Alfândega da Fé',
    telefone: '279 468 120',
    fax: '279 462 780',
    email: 'municipio@cm-alfandegadafe.pt',
    nif: '506 811 663',
    horarios: [{ dias: 'Segunda a sexta', horas: '09:00 – 12:30' }],
  };

  it('aceita os valores do Município', () => {
    expect(esquemaDeContactos.safeParse(validos).success).toBe(true);
  });

  it('exige o código postal na forma portuguesa', () => {
    for (const mau of ['5350014', '535-014', '5350-14', 'abcd-efg', '']) {
      expect(esquemaDeContactos.safeParse({ ...validos, codigoPostal: mau }).success).toBe(false);
    }
    expect(esquemaDeContactos.safeParse({ ...validos, codigoPostal: '5350-014' }).success).toBe(
      true,
    );
  });

  it('recusa um endereço de correio que não é endereço', () => {
    expect(esquemaDeContactos.safeParse({ ...validos, email: 'municipio' }).success).toBe(false);
    expect(esquemaDeContactos.safeParse({ ...validos, email: 'a@b' }).success).toBe(false);
  });

  it('o NIF tem nove algarismos, com ou sem espaços', () => {
    expect(esquemaDeContactos.safeParse({ ...validos, nif: '506811663' }).success).toBe(true);
    expect(esquemaDeContactos.safeParse({ ...validos, nif: '50681166' }).success).toBe(false);
    expect(esquemaDeContactos.safeParse({ ...validos, nif: 'PT506811663' }).success).toBe(false);
  });

  it('deixa o fax vazio — há serviços que já o desligaram', () => {
    expect(esquemaDeContactos.safeParse({ ...validos, fax: '' }).success).toBe(true);
  });

  it('não deixa ficar sem horário nenhum', () => {
    expect(esquemaDeContactos.safeParse({ ...validos, horarios: [] }).success).toBe(false);
  });

  it('a mensagem de erro diz o que corrigir, em português', () => {
    const resultado = esquemaDeContactos.safeParse({ ...validos, codigoPostal: '5350014' });
    expect(resultado.success).toBe(false);
    if (resultado.success) return;
    expect(resultado.error.issues[0].message).toContain('5350-014');
  });
});

describe('telefone em formato internacional', () => {
  it('acrescenta o indicativo de Portugal e tira os espaços', () => {
    expect(telefoneInternacional('279 468 120')).toBe('+351279468120');
  });

  it('não duplica o indicativo se já lá estiver', () => {
    expect(telefoneInternacional('+351 279 468 120')).toBe('+351279468120');
    expect(telefoneInternacional('351279468120')).toBe('+351279468120');
  });

  it('devolve vazio quando não há número', () => {
    expect(telefoneInternacional('')).toBe('');
  });
});

describe('semente e ficheiro gravado', () => {
  let pasta: string;

  beforeEach(() => {
    pasta = mkdtempSync(join(tmpdir(), 'contactos-'));
    vi.spyOn(process, 'cwd').mockReturnValue(pasta);
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    rmSync(pasta, { recursive: true, force: true });
  });

  it('sem ficheiro, devolve os valores que vêm com o portal', async () => {
    const { lerContactos, contactosDeOrigem } = await import('@/lib/admin/contactos');
    expect(await lerContactos()).toEqual(contactosDeOrigem);
  });

  it('com ficheiro, devolve o que a redação gravou', async () => {
    const { gravar } = await import('@/lib/admin/deposito');
    const { lerContactos, contactosDeOrigem } = await import('@/lib/admin/contactos');

    await gravar('contactos', { ...contactosDeOrigem, telefone: '279 000 111' });

    expect((await lerContactos()).telefone).toBe('279 000 111');
  });
});
