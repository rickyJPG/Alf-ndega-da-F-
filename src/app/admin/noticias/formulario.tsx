'use client';

import { guardarNoticia } from '../acoes';
import { AreaDeTexto, Campo, Escolha, FormularioGravavel } from '../pecas';
import type { Posicao } from '@/lib/admin/posicoes';

/**
 * O formulário de uma notícia — o mesmo para escrever de novo e para corrigir.
 *
 * A ordem dos campos segue a ordem por que se pensa uma notícia: primeiro o
 * que se vai dizer, depois quando e em que assunto entra, e só no fim a
 * fotografia. O identificador vai escondido: é ele que diz à ação se está a
 * criar ou a corrigir.
 */

export interface NoticiaEmEdicao {
  id: string;
  titulo: string;
  resumo: string;
  corpo: string;
  data: string;
  categoria: string;
  imagem: string;
  imagemAlt: string;
}

const CATEGORIAS = [
  'Município',
  'Cultura',
  'Ação Social',
  'Ambiente',
  'Educação',
  'Economia',
  'Desporto',
  'Obras',
  'Saúde',
].map((nome) => ({ valor: nome, rotulo: nome }));

export function FormularioDeNoticia({
  noticia,
  posicoes,
}: {
  noticia?: NoticiaEmEdicao;
  posicoes: Posicao[];
}) {
  const hoje = new Date().toISOString().slice(0, 10);

  return (
    <FormularioGravavel
      acao={guardarNoticia}
      voltarPara="/admin/noticias"
      rotuloGravar={noticia ? 'Guardar alterações' : 'Publicar notícia'}
    >
      {noticia ? <input type="hidden" name="id" value={noticia.id} /> : null}

      <fieldset className="mb-8 rounded-lg border border-line bg-surface p-5">
        <legend className="px-2 font-serif text-lg font-semibold">O que aconteceu</legend>

        <Campo
          etiqueta="Título"
          nome="titulo"
          valor={noticia?.titulo}
          obrigatorio
          ajuda="Uma frase que se perceba sozinha, sem ler o resto. Evite maiúsculas em tudo."
        />

        <AreaDeTexto
          etiqueta="Resumo"
          nome="resumo"
          valor={noticia?.resumo}
          linhas={3}
          obrigatorio
          ajuda="Duas ou três linhas. É o que aparece na listagem e nas partilhas."
        />

        <AreaDeTexto
          etiqueta="Texto da notícia"
          nome="corpo"
          valor={noticia?.corpo}
          linhas={14}
          ajuda="Escreva normalmente. Deixe uma linha em branco entre parágrafos — é assim que ficam separados no portal."
        />
      </fieldset>

      <fieldset className="mb-8 rounded-lg border border-line bg-surface p-5">
        <legend className="px-2 font-serif text-lg font-semibold">Quando e onde entra</legend>

        <div className="grid gap-x-6 md:grid-cols-2">
          <Campo
            etiqueta="Data de publicação"
            nome="data"
            tipo="date"
            valor={noticia?.data ?? hoje}
            obrigatorio
            ajuda="Define a ordem no portal e o endereço da notícia."
          />

          <Escolha
            etiqueta="Assunto"
            nome="categoria"
            valor={noticia?.categoria ?? 'Município'}
            opcoes={CATEGORIAS}
            ajuda="Serve para filtrar a listagem de notícias."
          />
        </div>
      </fieldset>

      <fieldset className="mb-8 rounded-lg border border-line bg-surface p-5">
        <legend className="px-2 font-serif text-lg font-semibold">Fotografia</legend>

        <Escolha
          etiqueta="Imagem"
          nome="imagem"
          valor={noticia?.imagem ?? ''}
          opcoes={[
            { valor: '', rotulo: '— sem fotografia —' },
            ...posicoes.map((posicao) => ({
              valor: posicao.caminho,
              rotulo: `${posicao.grupo}: ${posicao.rotulo}`,
            })),
          ]}
          ajuda="Escolha a posição. A fotografia em si troca-se em Fotografias, e muda em todo o portal de uma vez."
        />

        <Campo
          etiqueta="Descrição da fotografia"
          nome="imagemAlt"
          valor={noticia?.imagemAlt}
          ajuda="O que se vê na imagem, em poucas palavras. É lido a quem não a consegue ver — e é obrigatório por lei."
        />
      </fieldset>
    </FormularioGravavel>
  );
}
