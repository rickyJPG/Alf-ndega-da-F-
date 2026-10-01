import { existsSync } from 'node:fs';
import { join, normalize } from 'node:path';
import { cache } from 'react';

import { existeNoArmazem, PREFIXO } from './admin/armazem';
import { dadosAbertosDisponiveis, PREFIXO_DOS_DADOS } from './dados-abertos';

/**
 * O ficheiro de um documento está mesmo no disco?
 *
 * Existe porque o catálogo e os ficheiros são duas coisas separadas: o
 * registo do documento vive em `conteudo/documentos.json`, o ficheiro em
 * `conteudo/ficheiros/documentos/` (ou, para os de demonstração, em
 * `public/documentos/`). Numa instalação nova, o catálogo de exemplo vem
 * cheio e a pasta vem vazia — sem esta verificação, o portal oferecia
 * dezenas de descarregamentos que dão 404, que é a pior forma de um serviço
 * público falhar: em silêncio, já depois do clique.
 *
 * Com ela, o portal mostra o documento e diz que o ficheiro ainda não está
 * disponível, e o painel assinala quais faltam.
 *
 * `cache()` do React guarda o resultado durante um render e não mais: um
 * ficheiro carregado pelo painel passa a ser visto no pedido seguinte, sem
 * reiniciar nada.
 */
export const ficheiroExiste = cache((href: string): boolean => {
  // Só se verificam ficheiros servidos por este portal. Um endereço externo
  // não se consegue verificar daqui e dá-se por bom.
  if (!href.startsWith('/')) return true;

  // Carregado pelo painel: vive em conteudo/ficheiros, não em public/.
  if (href.startsWith(PREFIXO)) return existeNoArmazem(href);

  // Dados abertos: não estão em disco nenhum — são gerados a cada pedido a
  // partir das fontes do portal. Procurá-los em `public/` daria sempre
  // «não existe», e o botão desaparecia.
  if (href.startsWith(PREFIXO_DOS_DADOS)) return dadosAbertosDisponiveis(href);

  const relativo = normalize(href).replace(/^(\.\.[/\\])+/, '').replace(/^[/\\]+/, '');
  const caminho = join(process.cwd(), 'public', relativo);

  // Depois de normalizar, o caminho tem de continuar dentro de public/.
  const raiz = join(process.cwd(), 'public');
  if (!caminho.startsWith(raiz)) return false;

  return existsSync(caminho);
});
