'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { mkdir, writeFile, readdir, unlink } from 'node:fs/promises';
import { join, extname } from 'node:path';

import { comoSlug, gravar, ler } from '@/lib/admin/deposito';
import { definirBloqueio } from '@/lib/admin/bloqueio';
import { caminhoSeguro, enderecoDe, PREFIXO, RAIZ_DOS_FICHEIROS } from '@/lib/admin/armazem';
import {
  abrirSessao,
  credenciaisValidas,
  fecharSessao,
  renovarSessao,
  temSessao,
} from '@/lib/admin/sessao';
import { news } from '@/content/data/news';
import { events } from '@/content/data/events';
import { alerts } from '@/content/data/alerts';
import { documents } from '@/content/data/documents';
import { hojeIso } from '@/content/data/clock';
import type { Alert, DocumentItem, EventItem, NewsItem } from '@/content/types';

/**
 * Ações do painel de administração.
 *
 * Todas passam pelo mesmo portão: `exigirSessao()`. Uma ação de servidor é
 * um ponto de entrada tão exposto como qualquer rota — se a verificação
 * ficasse só no ecrã, bastaria chamar a ação diretamente para escrever no
 * portal.
 *
 * Depois de cada gravação, `revalidarPortal()` manda o Next reconstruir as
 * páginas afetadas. É por isso que uma notícia publicada aparece no portal
 * em segundos, sem ninguém ter de recompilar nada.
 */

export interface Resultado {
  ok: boolean;
  mensagem?: string;
}

async function exigirSessao(): Promise<void> {
  if (!(await temSessao())) {
    throw new Error('Sessão expirada. Volte a entrar.');
  }
  // Quem está a trabalhar não deve ser desligado a meio de um texto.
  await renovarSessao();
}

/** Reconstrói as páginas públicas afetadas por uma alteração. */
function revalidarPortal(): void {
  // O layout cobre todas as rotas por baixo de /[locale], que é onde o
  // conteúdo aparece. Revalidar caminho a caminho seria mais fino, mas
  // também mais fácil de esquecer ao acrescentar uma página nova.
  revalidatePath('/', 'layout');
}

/* ------------------------------------------------------------------ sessão -- */

export async function entrar(_anterior: Resultado | null, dados: FormData): Promise<Resultado> {
  const tentativa = String(dados.get('palavraPasse') ?? '');

  if (!tentativa) {
    return { ok: false, mensagem: 'Escreva a palavra-passe.' };
  }
  if (!credenciaisValidas(tentativa)) {
    // Sem pistas sobre o que falhou — é o mínimo contra tentativas às cegas.
    return { ok: false, mensagem: 'Palavra-passe incorreta.' };
  }

  await abrirSessao();
  redirect('/admin');
}

export async function sair(): Promise<void> {
  await fecharSessao();
  redirect('/admin/entrar');
}

/* ---------------------------------------------------------------- bloqueio -- */

/**
 * Liga ou desliga o interruptor de emergência do portal público.
 *
 * Ver `src/lib/admin/bloqueio.ts` para o porquê. `revalidarPortal()` é
 * essencial aqui: sem ela, quem já tivesse uma página em cache continuava a
 * vê-la por mais alguns minutos — e o objetivo é cortar o acesso na hora.
 */
export async function alternarBloqueio(bloqueado: boolean, motivo?: string): Promise<Resultado> {
  await exigirSessao();

  // Bloquear só é possível nas instalações de demonstração (DEMO_MODE=true):
  // numa instalação vendida a um município, ninguém deve conseguir desligar
  // o portal inteiro com um clique, nem por engano, nem sequer chamando esta
  // ação diretamente, à revelia do que o ecrã mostra. Desbloquear fica
  // sempre disponível — de outro modo, um estado bloqueado herdado por
  // engano deixaria uma instalação sem DEMO_MODE presa, sem forma de sair.
  if (bloqueado && process.env.DEMO_MODE !== 'true') {
    return { ok: false, mensagem: 'Esta função não está ativada nesta instalação.' };
  }

  await definirBloqueio(bloqueado, motivo?.trim() || undefined);
  revalidarPortal();

  return {
    ok: true,
    mensagem: bloqueado
      ? 'Portal bloqueado. Quem abrir o endereço público já não vê o portal.'
      : 'Portal reaberto ao público.',
  };
}

/* ---------------------------------------------------------------- notícias -- */

function textoDe(dados: FormData, campo: string): string {
  return String(dados.get(campo) ?? '').trim();
}

export async function guardarNoticia(dados: FormData): Promise<Resultado> {
  await exigirSessao();

  const titulo = textoDe(dados, 'titulo');
  const resumo = textoDe(dados, 'resumo');
  const data = textoDe(dados, 'data');

  if (!titulo) return { ok: false, mensagem: 'A notícia precisa de um título.' };
  if (!resumo) return { ok: false, mensagem: 'Escreva o resumo — é o que aparece na listagem.' };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) return { ok: false, mensagem: 'Indique a data.' };

  const lista = await ler<NewsItem[]>('noticias', news);
  const id = textoDe(dados, 'id');
  const corpo = textoDe(dados, 'corpo')
    .split(/\n{2,}/)
    .map((paragrafo) => paragrafo.trim())
    .filter(Boolean);

  const imagem = textoDe(dados, 'imagem');
  const textoAlternativo = textoDe(dados, 'imagemAlt');

  const existente = id ? lista.find((item) => item.id === id) : undefined;
  const slug = existente?.slug ?? comoSlug(titulo);

  const noticia: NewsItem = {
    ...(existente ?? {}),
    id: existente?.id ?? `n-${data}-${slug}`.slice(0, 90),
    slug,
    date: data,
    category: (textoDe(dados, 'categoria') || 'Município') as NewsItem['category'],
    title: { ...(existente?.title ?? {}), pt: titulo },
    summary: { ...(existente?.summary ?? {}), pt: resumo },
    body: { ...(existente?.body ?? {}), pt: corpo.length > 0 ? corpo : [resumo] },
    tags: existente?.tags ?? [],
    ...(imagem
      ? {
          image: {
            src: imagem,
            alt: { pt: textoAlternativo || titulo },
            // As páginas mostram a fotografia com `fill`, por isso estas
            // medidas não decidem nada do que se vê — servem de proporção
            // de referência, e é a mesma do resto do portal.
            width: existente?.image?.width ?? 1200,
            height: existente?.image?.height ?? 675,
          },
        }
      : existente?.image
        ? { image: existente.image }
        : {}),
    ...(dados.get('arquivo') ? { archive: textoDe(dados, 'arquivo') } : {}),
  } as NewsItem;

  const atualizada = existente
    ? lista.map((item) => (item.id === existente.id ? noticia : item))
    : [noticia, ...lista];

  await gravar('noticias', atualizada);
  revalidarPortal();

  return { ok: true, mensagem: existente ? 'Notícia atualizada.' : 'Notícia publicada.' };
}

export async function apagarNoticia(id: string): Promise<Resultado> {
  await exigirSessao();

  const lista = await ler<NewsItem[]>('noticias', news);
  await gravar(
    'noticias',
    lista.filter((item) => item.id !== id),
  );
  revalidarPortal();

  return { ok: true, mensagem: 'Notícia apagada.' };
}

/* ----------------------------------------------------------------- eventos -- */

export async function guardarEvento(dados: FormData): Promise<Resultado> {
  await exigirSessao();

  const titulo = textoDe(dados, 'titulo');
  const inicio = textoDe(dados, 'inicio');

  if (!titulo) return { ok: false, mensagem: 'O evento precisa de um título.' };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(inicio)) return { ok: false, mensagem: 'Indique a data de início.' };

  const lista = await ler<EventItem[]>('eventos', events);
  const id = textoDe(dados, 'id');
  const existente = id ? lista.find((item) => item.id === id) : undefined;
  const slug = existente?.slug ?? comoSlug(titulo);

  const fim = textoDe(dados, 'fim');
  const hora = textoDe(dados, 'hora');
  // O portal mostra o preço por extenso («Entrada livre», «3 € por equipa»),
  // e é dessa frase que a página do evento deduz se é gratuito. Guardar aqui
  // um sim/não não chegaria à página — tem de ser o mesmo campo.
  const preco = textoDe(dados, 'preco');

  const evento: EventItem = {
    ...(existente ?? {}),
    id: existente?.id ?? `e-${slug}`.slice(0, 90),
    slug,
    startDate: inicio,
    ...(fim ? { endDate: fim } : {}),
    ...(hora ? { startTime: hora } : {}),
    category: (textoDe(dados, 'categoria') || 'Cultura') as EventItem['category'],
    title: { ...(existente?.title ?? {}), pt: titulo },
    summary: { ...(existente?.summary ?? {}), pt: textoDe(dados, 'resumo') },
    location: textoDe(dados, 'local') || existente?.location || 'Alfândega da Fé',
    ...(preco ? { price: { ...(existente?.price ?? {}), pt: preco } } : {}),
  } as EventItem;

  const atualizada = existente
    ? lista.map((item) => (item.id === existente.id ? evento : item))
    : [...lista, evento];

  await gravar('eventos', atualizada);
  revalidarPortal();

  return { ok: true, mensagem: existente ? 'Evento atualizado.' : 'Evento criado.' };
}

export async function apagarEvento(id: string): Promise<Resultado> {
  await exigirSessao();

  const lista = await ler<EventItem[]>('eventos', events);
  await gravar(
    'eventos',
    lista.filter((item) => item.id !== id),
  );
  revalidarPortal();

  return { ok: true, mensagem: 'Evento apagado.' };
}

/* ------------------------------------------------------------------ avisos -- */

export async function guardarAviso(dados: FormData): Promise<Resultado> {
  await exigirSessao();

  const titulo = textoDe(dados, 'titulo');
  const inicio = textoDe(dados, 'inicio');
  const fim = textoDe(dados, 'fim');

  if (!titulo) return { ok: false, mensagem: 'Escreva o texto do aviso.' };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(inicio) || !/^\d{4}-\d{2}-\d{2}$/.test(fim)) {
    return { ok: false, mensagem: 'Indique as datas de início e de fim.' };
  }
  if (fim < inicio) {
    return { ok: false, mensagem: 'A data de fim é anterior à de início.' };
  }

  const lista = await ler<Alert[]>('avisos', alerts);
  const id = textoDe(dados, 'id');
  const existente = id ? lista.find((item) => item.id === id) : undefined;
  const ligacao = textoDe(dados, 'ligacao');

  const aviso: Alert = {
    id: existente?.id ?? `aviso-${comoSlug(titulo)}-${inicio}`.slice(0, 90),
    severity: (textoDe(dados, 'gravidade') || 'info') as Alert['severity'],
    title: { ...(existente?.title ?? {}), pt: titulo },
    ...(ligacao ? { href: ligacao } : {}),
    startsAt: inicio,
    endsAt: fim,
  } as Alert;

  const atualizada = existente
    ? lista.map((item) => (item.id === existente.id ? aviso : item))
    : [aviso, ...lista];

  await gravar('avisos', atualizada);
  revalidarPortal();

  return { ok: true, mensagem: existente ? 'Aviso atualizado.' : 'Aviso publicado.' };
}

export async function apagarAviso(id: string): Promise<Resultado> {
  await exigirSessao();

  const lista = await ler<Alert[]>('avisos', alerts);
  await gravar(
    'avisos',
    lista.filter((item) => item.id !== id),
  );
  revalidarPortal();

  return { ok: true, mensagem: 'Aviso removido.' };
}

/* ---------------------------------------------------------------- imagens -- */

const EXTENSOES_ACEITES = new Set(['.jpg', '.jpeg', '.png', '.webp']);
const TAMANHO_MAXIMO = 8 * 1024 * 1024;

/**
 * Guarda uma fotografia numa posição do portal.
 *
 * O nome do ficheiro é decidido pela posição escolhida, nunca pelo nome que
 * vem do computador de quem carrega — assim não há como escrever fora de
 * public/images, e a fotografia fica logo no sítio onde o portal a procura.
 */
export async function carregarImagem(dados: FormData): Promise<Resultado> {
  await exigirSessao();

  const posicao = textoDe(dados, 'posicao');
  const ficheiro = dados.get('ficheiro');

  if (!posicao || !/^[a-z0-9/-]+$/.test(posicao)) {
    return { ok: false, mensagem: 'Escolha a posição onde a fotografia deve entrar.' };
  }
  if (!(ficheiro instanceof File) || ficheiro.size === 0) {
    return { ok: false, mensagem: 'Escolha um ficheiro de imagem.' };
  }
  if (ficheiro.size > TAMANHO_MAXIMO) {
    return { ok: false, mensagem: 'A imagem é maior do que 8 MB. Reduza-a antes de carregar.' };
  }

  const extensao = extname(ficheiro.name).toLowerCase();
  if (!EXTENSOES_ACEITES.has(extensao)) {
    return { ok: false, mensagem: 'Formatos aceites: JPG, PNG ou WebP.' };
  }

  // Verificação pela assinatura do ficheiro, não pela extensão: um .jpg pode
  // ser qualquer coisa lá dentro.
  const bytes = Buffer.from(await ficheiro.arrayBuffer());
  const ehJpeg = bytes[0] === 0xff && bytes[1] === 0xd8;
  const ehPng = bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  const ehWebp = bytes.subarray(0, 4).toString() === 'RIFF' && bytes.subarray(8, 12).toString() === 'WEBP';
  if (!ehJpeg && !ehPng && !ehWebp) {
    return { ok: false, mensagem: 'O ficheiro não é uma imagem válida.' };
  }

  const extensaoFinal = ehPng ? '.png' : ehWebp ? '.webp' : '.jpg';
  const destino = caminhoSeguro(join('imagens', `${posicao}${extensaoFinal}`));
  if (!destino) return { ok: false, mensagem: 'Posição inválida.' };

  await mkdir(join(destino, '..'), { recursive: true });
  await writeFile(destino, bytes);

  // Se houver outra extensão da mesma posição, sai — senão ficavam duas
  // fotografias a disputar o mesmo sítio.
  for (const outra of ['.jpg', '.jpeg', '.png', '.webp']) {
    const caminho = caminhoSeguro(join('imagens', `${posicao}${outra}`));
    if (caminho && caminho !== destino) await unlink(caminho).catch(() => {});
  }

  revalidarPortal();
  return { ok: true, mensagem: 'Fotografia carregada.' };
}

export async function removerImagem(posicao: string): Promise<Resultado> {
  await exigirSessao();

  if (!/^[a-z0-9/-]+$/.test(posicao)) {
    return { ok: false, mensagem: 'Posição inválida.' };
  }

  let apagadas = 0;
  for (const extensao of ['.jpg', '.jpeg', '.png', '.webp']) {
    const caminho = caminhoSeguro(join('imagens', `${posicao}${extensao}`));
    if (!caminho) continue;
    await unlink(caminho).then(
      () => {
        apagadas += 1;
      },
      () => {},
    );
  }

  revalidarPortal();
  return {
    ok: true,
    mensagem: apagadas > 0 ? 'Fotografia removida.' : 'Não havia fotografia carregada nesta posição.',
  };
}

/** Lista as fotografias já carregadas para o portal. */
export async function imagensCarregadas(): Promise<string[]> {
  await exigirSessao();

  const raiz = join(RAIZ_DOS_FICHEIROS, 'imagens');
  const encontradas: string[] = [];

  const percorrer = async (pasta: string, prefixo: string) => {
    let entradas;
    try {
      entradas = await readdir(pasta, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entrada of entradas) {
      if (entrada.isDirectory()) {
        await percorrer(join(pasta, entrada.name), `${prefixo}${entrada.name}/`);
      } else if (EXTENSOES_ACEITES.has(extname(entrada.name).toLowerCase())) {
        encontradas.push(prefixo + entrada.name);
      }
    }
  };

  await percorrer(raiz, '');
  return encontradas.sort();
}

/* ------------------------------------------------------------- documentos -- */

/**
 * Formatos aceites para documentos, com a assinatura que cada um tem de ter
 * nos primeiros bytes. Verificar a extensão não chega: um ficheiro chamado
 * `.pdf` pode ser qualquer coisa lá dentro.
 *
 * DOCX, XLSX e ZIP são todos ZIP por baixo — daí partilharem assinatura.
 */
const ASSINATURAS: Record<string, (b: Buffer) => boolean> = {
  '.pdf': (b) => b.subarray(0, 5).toString() === '%PDF-',
  '.docx': (b) => b[0] === 0x50 && b[1] === 0x4b,
  '.xlsx': (b) => b[0] === 0x50 && b[1] === 0x4b,
  '.zip': (b) => b[0] === 0x50 && b[1] === 0x4b,
  // CSV e JSON são texto: não há assinatura para verificar.
  '.csv': () => true,
  '.json': () => true,
};

const TAMANHO_MAXIMO_DOCUMENTO = 25 * 1024 * 1024;

const TIPOS_DE_DOCUMENTO = new Set<DocumentItem['type']>([
  'formulario',
  'regulamento',
  'edital',
  'ata',
  'relatorio',
  'plano',
  'aviso',
  'dados',
]);

/**
 * Grava um documento, com o ficheiro que se descarrega.
 *
 * O nome do ficheiro no disco vem do `slug`, nunca do nome que chega do
 * computador de quem carrega — assim não há como escrever fora de
 * public/documentos, e o endereço do documento mantém-se estável quando
 * alguém substitui o PDF por uma versão corrigida.
 */
export async function guardarDocumento(dados: FormData): Promise<Resultado> {
  await exigirSessao();

  const titulo = textoDe(dados, 'titulo');
  const resumo = textoDe(dados, 'resumo');
  const tipo = textoDe(dados, 'tipo') as DocumentItem['type'];

  if (!titulo) return { ok: false, mensagem: 'O documento precisa de um título.' };
  if (!TIPOS_DE_DOCUMENTO.has(tipo)) return { ok: false, mensagem: 'Escolha o tipo de documento.' };

  const lista = await ler<DocumentItem[]>('documentos', documents);
  const id = textoDe(dados, 'id');
  const existente = id ? lista.find((item) => item.id === id) : undefined;
  const slug = existente?.slug ?? comoSlug(titulo);

  if (!existente && lista.some((item) => item.slug === slug)) {
    return { ok: false, mensagem: 'Já existe um documento com este título. Escolha outro.' };
  }

  // --- o ficheiro ---------------------------------------------------------
  let ficheiroGravado = existente?.file;
  const ficheiro = dados.get('ficheiro');

  if (ficheiro instanceof File && ficheiro.size > 0) {
    if (ficheiro.size > TAMANHO_MAXIMO_DOCUMENTO) {
      return { ok: false, mensagem: 'O ficheiro é maior do que 25 MB.' };
    }

    const extensao = extname(ficheiro.name).toLowerCase();
    const verificar = ASSINATURAS[extensao];
    if (!verificar) {
      return { ok: false, mensagem: 'Formatos aceites: PDF, DOCX, XLSX, CSV, JSON ou ZIP.' };
    }

    const bytes = Buffer.from(await ficheiro.arrayBuffer());
    if (!verificar(bytes)) {
      return { ok: false, mensagem: `O ficheiro não é um ${extensao.slice(1).toUpperCase()} válido.` };
    }

    const destino = caminhoSeguro(join('documentos', `${slug}${extensao}`));
    if (!destino) return { ok: false, mensagem: 'Nome de documento inválido.' };

    await mkdir(join(destino, '..'), { recursive: true });
    await writeFile(destino, bytes);

    // Se antes havia outro formato para o mesmo documento, sai — senão
    // ficavam dois ficheiros a disputar o mesmo sítio.
    for (const outra of Object.keys(ASSINATURAS)) {
      const caminho = caminhoSeguro(join('documentos', `${slug}${outra}`));
      if (caminho && caminho !== destino) await unlink(caminho).catch(() => {});
    }

    ficheiroGravado = {
      href: enderecoDe(`documentos/${slug}${extensao}`),
      label: { ...(existente?.file.label ?? {}), pt: titulo },
      format: extensao.slice(1) as DocumentItem['file']['format'],
      bytes: ficheiro.size,
      ...(existente?.file.extractedText ? { extractedText: existente.file.extractedText } : {}),
    };
  } else if (ficheiroGravado) {
    // Sem ficheiro novo, mas o título pode ter mudado: a etiqueta acompanha.
    ficheiroGravado = { ...ficheiroGravado, label: { ...ficheiroGravado.label, pt: titulo } };
  }

  if (!ficheiroGravado) {
    return { ok: false, mensagem: 'Escolha o ficheiro a publicar.' };
  }

  const publicadoEm = textoDe(dados, 'publicadoEm') || hojeIso();

  const documento: DocumentItem = {
    ...(existente ?? {}),
    id: existente?.id ?? `d-${slug}`.slice(0, 90),
    slug,
    type: tipo,
    area: (textoDe(dados, 'area') || 'municipio') as DocumentItem['area'],
    year: Number(publicadoEm.slice(0, 4)),
    publishedAt: publicadoEm,
    title: { ...(existente?.title ?? {}), pt: titulo },
    ...(resumo ? { summary: { ...(existente?.summary ?? {}), pt: resumo } } : {}),
    file: ficheiroGravado,
  } as DocumentItem;

  const atualizada = existente
    ? lista.map((item) => (item.id === existente.id ? documento : item))
    : [documento, ...lista];

  await gravar('documentos', atualizada);
  revalidarPortal();

  return { ok: true, mensagem: existente ? 'Documento atualizado.' : 'Documento publicado.' };
}

export async function apagarDocumento(id: string): Promise<Resultado> {
  await exigirSessao();

  const lista = await ler<DocumentItem[]>('documentos', documents);
  const documento = lista.find((item) => item.id === id);

  await gravar(
    'documentos',
    lista.filter((item) => item.id !== id),
  );

  // O ficheiro sai com o registo — senão ficava no disco para sempre, sem
  // nada no portal a apontar-lhe, e ainda assim descarregável por quem
  // tivesse o endereço.
  if (documento?.file.href.startsWith(PREFIXO)) {
    const caminho = caminhoSeguro(documento.file.href.slice(PREFIXO.length));
    if (caminho) await unlink(caminho).catch(() => {});
  }

  revalidarPortal();
  return { ok: true, mensagem: 'Documento apagado.' };
}
