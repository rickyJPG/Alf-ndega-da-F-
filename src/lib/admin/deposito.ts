import { mkdir, readFile, writeFile, rename } from 'node:fs/promises';
import { join, dirname } from 'node:path';

/**
 * Depósito de conteúdos editáveis.
 *
 * Os conteúdos de arranque continuam em `src/content/data` — são a semente,
 * versionada com o código. Quando alguém edita no painel de administração, a
 * coleção inteira passa a ser lida de `conteudo/<nome>.json`, um ficheiro
 * simples na raiz do projeto.
 *
 * Porquê ficheiros e não base de dados: um município desta dimensão não tem
 * equipa para manter um servidor de base de dados, e todo o conteúdo do
 * portal cabe folgadamente em alguns megabytes de JSON. Ficheiros são fáceis
 * de copiar, de guardar em cópia de segurança e de ler com qualquer editor —
 * ninguém fica preso a nada.
 *
 * A gravação é atómica (escreve para um ficheiro temporário e só depois o
 * renomeia). Assim uma falha a meio nunca deixa um ficheiro truncado, que é
 * como se perde conteúdo a sério.
 */

const RAIZ = join(process.cwd(), 'conteudo');

/** As coleções que o painel sabe editar. */
export type NomeDaColecao =
  | 'noticias'
  | 'eventos'
  | 'avisos'
  | 'paginas'
  | 'servicos'
  | 'definicoes'
  | 'legendas';

function caminho(nome: NomeDaColecao): string {
  return join(RAIZ, `${nome}.json`);
}

/**
 * Lê uma coleção. Sem ficheiro guardado, devolve a semente — é isto que faz
 * o portal funcionar tal e qual antes de alguém editar seja o que for.
 */
export async function ler<T>(nome: NomeDaColecao, semente: T): Promise<T> {
  try {
    const bruto = await readFile(caminho(nome), 'utf8');
    return JSON.parse(bruto) as T;
  } catch (erro) {
    const codigo = (erro as NodeJS.ErrnoException)?.code;
    if (codigo === 'ENOENT') return semente;

    // Ficheiro corrompido ou ilegível: é melhor servir a semente e gritar no
    // registo do que deixar o portal em branco.
    console.error(`[conteúdo] não foi possível ler ${nome}.json:`, erro);
    return semente;
  }
}

/** Grava uma coleção, de forma atómica. */
export async function gravar<T>(nome: NomeDaColecao, dados: T): Promise<void> {
  const destino = caminho(nome);
  await mkdir(dirname(destino), { recursive: true });

  const temporario = `${destino}.${process.pid}.tmp`;
  await writeFile(temporario, `${JSON.stringify(dados, null, 2)}\n`, 'utf8');
  await rename(temporario, destino);
}

/** Já existe versão editada desta coleção? */
export async function foiEditada(nome: NomeDaColecao): Promise<boolean> {
  try {
    await readFile(caminho(nome), 'utf8');
    return true;
  } catch {
    return false;
  }
}

/** Gera um identificador legível a partir de um título. */
export function comoSlug(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}
