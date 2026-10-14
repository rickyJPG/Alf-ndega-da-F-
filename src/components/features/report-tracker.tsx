'use client';

import { useState, useTransition } from 'react';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n';
import { formatDate } from '@/lib/format';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/field';
import { Icon } from '@/components/ui/icon';
import { consultarPedido } from '@/app/actions';
import {
  estadoLabel,
  estadoTone,
  referenciaValida,
  tipoLabel,
  type VistaPublica,
} from '@/lib/estado-do-pedido';

/**
 * Acompanhamento do estado pelo número de referência.
 *
 * A procura corre no servidor. Antes corria aqui, sobre a lista de
 * ocorrências que a página já trazia — e isso só não era um problema porque
 * a lista era inventada. Com pedidos verdadeiros, trazer a coleção para o
 * navegador poria o nome e o contacto de todos os munícipes na página de
 * qualquer visitante.
 *
 * O servidor devolve uma vista sem dados de contacto — nem os do próprio.
 * Quem escreve um número não prova ser quem o pediu, e uma referência não é
 * uma senha.
 *
 * Serve as três referências, não só as ocorrências: quem tem um AT- de uma
 * marcação escreve-o aqui, e é melhor responder do que mandá-lo procurar
 * outro ecrã.
 */
export function ReportTracker({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const [referencia, setReferencia] = useState('');
  const [resultado, setResultado] = useState<VistaPublica | null | undefined>(undefined);
  const [maltratada, setMaltratada] = useState(false);
  const [aProcurar, procurar] = useTransition();

  function pesquisar() {
    // Um engano de escrita distingue-se de «não existe»: a mensagem que
    // ajuda é diferente, e dizer «não encontrámos» a quem escreveu o
    // formato errado manda-o procurar o papel em vez de corrigir a linha.
    if (!referenciaValida(referencia)) {
      setMaltratada(true);
      setResultado(undefined);
      return;
    }

    setMaltratada(false);
    procurar(async () => {
      setResultado(await consultarPedido(referencia));
    });
  }

  return (
    <div>
      <form
        className="flex flex-col gap-4 sm:flex-row sm:items-end"
        onSubmit={(evento) => {
          evento.preventDefault();
          pesquisar();
        }}
      >
        <TextField
          className="flex-1"
          label={dict.reports.reference}
          placeholder="OC-2026-0001"
          value={referencia}
          onChange={(evento) => setReferencia(evento.target.value)}
          hint="A referência foi-lhe mostrada quando registou o pedido."
          error={maltratada ? 'O formato é OC-2026-0001 — três letras, o ano e quatro algarismos.' : undefined}
        />
        <Button type="submit" variant="secondary" icon="search" disabled={aProcurar}>
          {aProcurar ? 'A procurar…' : dict.common.search}
        </Button>
      </form>

      <div aria-live="polite" className="mt-6">
        {resultado === null ? (
          <p className="rounded-md border border-line bg-surface-alt p-5 text-ink-muted">
            Não encontrámos nenhum pedido com essa referência. Confirme o número no comprovativo
            que lhe foi mostrado; se o pedido foi feito ao balcão ou por telefone, não aparece
            aqui.
          </p>
        ) : null}

        {resultado ? (
          <article className="rounded-lg border border-line bg-surface p-5">
            <div className="flex flex-wrap items-center gap-3">
              <Badge tone={estadoTone[resultado.estado]}>
                {estadoLabel(resultado.estado, dict)}
              </Badge>
              <span className="font-serif text-lg font-semibold tabular-nums">
                {resultado.referencia}
              </span>
              <span className="text-sm text-ink-muted">{tipoLabel(resultado.tipo, dict)}</span>
            </div>

            {resultado.resumo ? <p className="mt-3">{resultado.resumo}</p> : null}

            <dl className="mt-4 grid gap-3 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-semibold text-ink-muted">Registado a</dt>
                <dd>{formatDate(resultado.criadoEm.slice(0, 10), locale)}</dd>
              </div>
              {resultado.atualizadoEm ? (
                <div>
                  <dt className="text-sm font-semibold text-ink-muted">Última atualização</dt>
                  <dd>{formatDate(resultado.atualizadoEm.slice(0, 10), locale)}</dd>
                </div>
              ) : null}
            </dl>

            {resultado.resposta ? (
              <p className="mt-4 flex items-start gap-2.5 rounded-md border-s-4 border-primary-600 bg-primary-100/50 p-4">
                <Icon name="info" size={18} className="mt-0.5 shrink-0 text-primary-700" />
                <span>{resultado.resposta}</span>
              </p>
            ) : null}
          </article>
        ) : null}
      </div>
    </div>
  );
}
