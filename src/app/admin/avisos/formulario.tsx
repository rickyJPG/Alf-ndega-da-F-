'use client';

import { guardarAviso } from '../acoes';
import { AreaDeTexto, Campo, Escolha, FormularioGravavel } from '../pecas';

/**
 * O formulário de um aviso.
 *
 * Um aviso é a barra que aparece no topo do portal — corte de água, estrada
 * cortada, risco de incêndio. Tem sempre data de fim, e é de propósito: o
 * aviso desaparece sozinho quando deixa de fazer sentido, em vez de ficar
 * meses no ar porque ninguém se lembrou de o tirar.
 */

export interface AvisoEmEdicao {
  id: string;
  titulo: string;
  gravidade: string;
  ligacao: string;
  inicio: string;
  fim: string;
}

const GRAVIDADES = [
  { valor: 'info', rotulo: 'Informação — azul (obras, horários, avisos normais)' },
  { valor: 'warning', rotulo: 'Atenção — amarelo (corte de água, estrada cortada)' },
  { valor: 'danger', rotulo: 'Urgente — vermelho (perigo imediato)' },
];

function daquiADias(dias: number): string {
  const data = new Date();
  data.setDate(data.getDate() + dias);
  return data.toISOString().slice(0, 10);
}

export function FormularioDeAviso({ aviso }: { aviso?: AvisoEmEdicao }) {
  return (
    <FormularioGravavel
      acao={guardarAviso}
      voltarPara={aviso ? '/admin/avisos' : undefined}
      rotuloGravar={aviso ? 'Guardar alterações' : 'Publicar aviso'}
    >
      {aviso ? <input type="hidden" name="id" value={aviso.id} /> : null}

      <AreaDeTexto
        etiqueta="Texto do aviso"
        nome="titulo"
        valor={aviso?.titulo}
        linhas={3}
        obrigatorio
        ajuda="Uma frase completa, com o essencial: o quê, onde e quando. Ex.: «Corte de água em Sambade na quarta-feira, entre as 09:00 e as 16:00.»"
      />

      <Escolha
        etiqueta="Gravidade"
        nome="gravidade"
        valor={aviso?.gravidade ?? 'info'}
        opcoes={GRAVIDADES}
        ajuda="Decide a cor da barra. Guarde o vermelho para o que é mesmo urgente — se for tudo urgente, deixa de haver urgente."
      />

      <div className="grid gap-x-6 md:grid-cols-2">
        <Campo
          etiqueta="Aparece a partir de"
          nome="inicio"
          tipo="date"
          valor={aviso?.inicio ?? new Date().toISOString().slice(0, 10)}
          obrigatorio
        />
        <Campo
          etiqueta="Desaparece depois de"
          nome="fim"
          tipo="date"
          valor={aviso?.fim ?? daquiADias(7)}
          obrigatorio
          ajuda="No dia seguinte a esta data o aviso sai do portal sozinho."
        />
      </div>

      <Campo
        etiqueta="Ligação (facultativo)"
        nome="ligacao"
        valor={aviso?.ligacao}
        ajuda="Endereço de uma página do portal com mais pormenores. Ex.: /servicos/agua-e-residuos"
      />
    </FormularioGravavel>
  );
}
