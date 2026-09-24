'use client';

import { useState } from 'react';

import { Icon } from '@/components/ui/icon';
import type { Contactos } from '@/lib/admin/contactos';
import { guardarContactos } from '../acoes';
import { Campo, FormularioGravavel } from '../pecas';

/**
 * Os contactos do Município.
 *
 * Um formulário só, sem listas nem botão de criar: há um conjunto de
 * contactos e não vários. A única parte que cresce são os horários.
 */
export function FormularioDeContactos({ contactos }: { contactos: Contactos }) {
  const [horarios, setHorarios] = useState(
    contactos.horarios.length > 0 ? contactos.horarios : [{ dias: '', horas: '' }],
  );

  function alterar(indice: number, campo: 'dias' | 'horas', valor: string) {
    setHorarios((atuais) =>
      atuais.map((horario, i) => (i === indice ? { ...horario, [campo]: valor } : horario)),
    );
  }

  return (
    <FormularioGravavel acao={guardarContactos} rotuloGravar="Guardar contactos">
      <fieldset className="mb-8 rounded-lg border border-line bg-surface p-5">
        <legend className="px-2 font-serif text-lg font-semibold">Morada</legend>

        <Campo etiqueta="Rua ou largo" nome="morada" valor={contactos.morada} obrigatorio />

        <div className="grid gap-x-6 md:grid-cols-[minmax(0,12rem)_minmax(0,1fr)]">
          <Campo
            etiqueta="Código postal"
            nome="codigoPostal"
            valor={contactos.codigoPostal}
            obrigatorio
            ajuda="Ex.: 5350-014"
          />
          <Campo
            etiqueta="Localidade"
            nome="localidade"
            valor={contactos.localidade}
            obrigatorio
          />
        </div>
      </fieldset>

      <fieldset className="mb-8 rounded-lg border border-line bg-surface p-5">
        <legend className="px-2 font-serif text-lg font-semibold">Como falar connosco</legend>

        <div className="grid gap-x-6 md:grid-cols-2">
          <Campo
            etiqueta="Telefone"
            nome="telefone"
            valor={contactos.telefone}
            obrigatorio
            ajuda="Algarismos e espaços. Ex.: 279 468 120"
          />
          <Campo
            etiqueta="Fax"
            nome="fax"
            valor={contactos.fax}
            ajuda="Pode ficar vazio, se já não houver."
          />
        </div>

        <Campo
          etiqueta="Correio eletrónico"
          nome="email"
          tipo="email"
          valor={contactos.email}
          obrigatorio
        />

        <Campo
          etiqueta="NIF do Município"
          nome="nif"
          valor={contactos.nif}
          obrigatorio
          ajuda="Nove algarismos. Aparece na página de contactos."
        />
      </fieldset>

      <fieldset className="mb-8 rounded-lg border border-line bg-surface p-5">
        <legend className="px-2 font-serif text-lg font-semibold">Horário de atendimento</legend>
        <p className="mb-4 text-sm text-ink-muted">
          Uma linha por período. Escreva como quer que apareça no portal.
        </p>

        <p className="mb-4 flex items-start gap-2 rounded-md border border-line bg-surface-alt p-3 text-sm text-ink-muted">
          <Icon name="info" size={16} className="mt-0.5 shrink-0" />
          <span>
            Se o horário mudar mesmo (e não só a forma de o escrever), avise quem mantém o portal:
            há uma segunda versão, que só as máquinas leem, e essa continua no código.
          </span>
        </p>

        <ul className="mb-4 list-none space-y-3 p-0">
          {horarios.map((horario, indice) => (
            <li
              key={indice}
              className="grid gap-3 rounded-md border border-line bg-surface-alt p-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_auto] md:items-center"
            >
              <span>
                <label htmlFor={`dia-${indice}`} className="sr-only">
                  Dias da linha {indice + 1}
                </label>
                <input
                  id={`dia-${indice}`}
                  name="dia"
                  value={horario.dias}
                  onChange={(evento) => alterar(indice, 'dias', evento.target.value)}
                  placeholder="Segunda a sexta"
                  className="min-h-11 w-full rounded-md border border-line-strong bg-surface px-3 text-ink"
                />
              </span>

              <span>
                <label htmlFor={`hora-${indice}`} className="sr-only">
                  Horas da linha {indice + 1}
                </label>
                <input
                  id={`hora-${indice}`}
                  name="hora"
                  value={horario.horas}
                  onChange={(evento) => alterar(indice, 'horas', evento.target.value)}
                  placeholder="09:00 – 12:30 e 14:00 – 17:30"
                  className="min-h-11 w-full rounded-md border border-line-strong bg-surface px-3 text-ink"
                />
              </span>

              {horarios.length > 1 ? (
                <button
                  type="button"
                  onClick={() => setHorarios((atuais) => atuais.filter((_, i) => i !== indice))}
                  className="inline-flex min-h-11 items-center justify-center gap-1 rounded-md border border-line-strong bg-surface px-3 text-sm text-ink hover:border-danger hover:text-danger"
                >
                  <Icon name="trash" size={15} />
                  Retirar
                </button>
              ) : (
                <span />
              )}
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={() => setHorarios((atuais) => [...atuais, { dias: '', horas: '' }])}
          className="inline-flex min-h-11 items-center gap-2 rounded-md border border-line-strong px-4 font-medium text-ink hover:border-accent-600"
        >
          <Icon name="plus" size={18} />
          Acrescentar linha
        </button>
      </fieldset>
    </FormularioGravavel>
  );
}
