# Ligação ao CMS

O portal está preparado para um CMS *headless* auto-alojado — **Payload CMS** —
mas **funciona sem ele**. Enquanto não houver CMS, os conteúdos vivem em
ficheiros TypeScript em `src/content/data/`, com a mesma estrutura que as
coleções teriam no CMS.

Esta pasta contém o desenho das coleções, pronto a ser instalado.

## Porquê Payload

- Auto-alojado: os dados dos munícipes e os documentos ficam em servidores do
  Município, não em serviços de terceiros fora da União Europeia.
- Base de dados PostgreSQL, que a maioria das autarquias já opera.
- Interface de edição em português, com controlo de acessos por perfil.
- API REST e GraphQL, o que torna a migração deste portal um trabalho de horas,
  não de semanas.

## O que já está feito

`src/content/index.ts` é a **única** porta de entrada para conteúdos. Nenhuma
página importa dados diretamente. Todas as funções são `async`, mesmo servindo
hoje dados locais — precisamente para que a mudança para o CMS não obrigue a
mexer numa única página.

```ts
// hoje
export async function getNews(): Promise<NewsItem[]> {
  return news;
}

// com o CMS ligado
export async function getNews(): Promise<NewsItem[]> {
  const res = await payload.find({ collection: 'noticias', limit: 100 });
  return res.docs;
}
```

## Passos da migração

1. Instalar o Payload num serviço separado (`cms.cm-alfandegadafe.pt`), com
   PostgreSQL e armazenamento de ficheiros em disco local ou S3 compatível.
2. Copiar as definições de `cms/collections/` para o projeto do Payload e trocar
   o `import type { CollectionConfig } from '../types'` por
   `import type { CollectionConfig } from 'payload'`.
3. Definir `PAYLOAD_API_URL` e `PAYLOAD_API_KEY` no ambiente do portal.
4. Substituir o corpo das funções de `src/content/index.ts` por chamadas à API.
5. Ligar um *webhook* de publicação a `POST /api/revalidate`, que deve chamar
   `revalidateTag()` e `resetSearchIndex()`.

## Extração de texto dos PDF

O campo `extractedText` alimenta a pesquisa dentro dos documentos. No Payload,
acrescente um `hook` `afterChange` na coleção `Documentos` que corra
`pdftotext -layout` sobre o ficheiro carregado e guarde o resultado nesse campo.
Sem esse passo, a pesquisa continua a funcionar — apenas deixa de encontrar
texto que só exista dentro dos PDF.

## Perfis de acesso sugeridos

| Perfil | Pode |
| --- | --- |
| `leitor` | Ver tudo, publicar nada |
| `redator` | Criar e editar notícias, eventos e páginas; não publica |
| `editor` | Tudo o que o redator faz, e publica |
| `servico` | Editar apenas os serviços e documentos da sua divisão |
| `administrador` | Tudo, incluindo alertas e utilizadores |

Os alertas da barra de topo devem estar restritos a `editor` e `administrador`:
é o único conteúdo que aparece em todas as páginas do portal.
