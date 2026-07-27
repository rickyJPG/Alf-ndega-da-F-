# Portal do Município de Alfândega da Fé

Relançamento do sítio institucional do Município de Alfândega da Fé
(distrito de Bragança, Trás-os-Montes), em substituição da versão de 2015.

O princípio que orienta tudo o resto: **primeiro a tarefa, depois a
instituição**. A navegação segue o que as pessoas querem resolver — pagar a
água, pedir uma certidão, marcar atendimento — e não o organigrama dos
serviços.

---

## Índice

1. [Começar](#começar)
2. [Como está organizado](#como-está-organizado)
3. [Sistema de design](#sistema-de-design)
4. [Guia de edição de conteúdos](#guia-de-edição-de-conteúdos)
5. [Acessibilidade](#acessibilidade)
6. [Desempenho](#desempenho)
7. [Testes](#testes)
8. [Instalação em produção](#instalação-em-produção)
9. [O que falta fazer antes do lançamento](#o-que-falta-fazer-antes-do-lançamento)

---

## Começar

Requisitos: Node.js 22 (ou 20.9+) e npm.

```bash
npm install
npm run dev          # http://localhost:3000
```

Comandos disponíveis:

| Comando | O que faz |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Compila para produção (gera 564 páginas estáticas) |
| `npm start` | Serve a versão compilada |
| `npm run typecheck` | Verificação de tipos |
| `npm run lint` | ESLint |
| `npm run test` | Testes unitários (Vitest) |
| `npm run test:e2e` | Testes de ponta a ponta (Playwright) |
| `npm run test:a11y` | Só os testes de acessibilidade |
| `npm run check` | Tipos + lint + testes unitários |
| `npm run fonts` | Volta a descarregar as fontes para `public/fonts` |
| `npm run placeholders` | Regenera as ilustrações de exemplo |
| `npm run vendor` | Atualiza os ficheiros do Leaflet em `public/vendor` |

### Variáveis de ambiente

Nenhuma é obrigatória para desenvolver.

| Variável | Para quê |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Endereço público. Usado em URL canónicas, `sitemap.xml` e JSON-LD. |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | Domínio registado na instância de Plausible. Sem isto, não há qualquer medição. |
| `NEXT_PUBLIC_PLAUSIBLE_SCRIPT_URL` | Endereço do script de medição, alojado por si. |
| `MOCK_TODAY` | `AAAA-MM-DD`. Fixa a data dos dados de exemplo, para testes reproduzíveis. |

---

## Como está organizado

```
src/
  app/                    Rotas (App Router)
    [locale]/             Todas as páginas, sob o segmento de idioma
    api/eventos/[slug]/   Ficheiros .ics por evento
    actions.ts            Server Actions dos formulários
    sitemap.ts robots.ts manifest.ts
  components/
    ui/                   Primitivas: botão, cartão, tabela, campos, símbolos…
    layout/               Cabeçalho, rodapé, avisos, cookies, acessibilidade
    content/              Cartões de notícia, evento, documento, consulta
    home/                 Blocos da página inicial
    features/             Ocorrências, marcações, orçamento, resíduos, mapa
  content/
    types.ts              Modelo de conteúdo (espelha as coleções do CMS)
    data/                 Conteúdos de exemplo
    index.ts              Única porta de entrada para conteúdos
  i18n/                   Configuração e dicionários PT/EN/ES/FR
  lib/                    Tokens de rota, formatos, pesquisa, SEO, redirecionamentos
  styles/                 tokens.css, globals.css, fonts.css
cms/                      Desenho das coleções para o Payload CMS
tests/                    unit/ (Vitest) e e2e/ (Playwright + axe-core)
```

### Endereços

Português é a língua predefinida e **não leva prefixo**. As restantes vivem em
`/en`, `/es` e `/fr`. Os segmentos do caminho mantêm-se em português em todas as
línguas, para que uma ligação partilhada continue a apontar para a mesma página.

```
/servicos/urbanismo/licenca-de-construcao
/en/servicos/urbanismo/licenca-de-construcao
/noticias/2026/07/municipio-sai-da-situacao-de-excesso-de-endividamento
/eventos/exposicao-longe-de-perto
/transparencia/consultas-publicas/regulamento-de-apoios-as-freguesias
```

Todos os endereços são construídos em `src/lib/routes.ts`. Nenhum caminho é
montado à mão no meio do código.

### Ligações antigas

`src/lib/redirects.ts` mantém a tabela de redirecionamentos 301 das antigas URL
`/pages/<id>`. Um teste automático verifica que **todos** os destinos existem —
se alguém apagar uma página sem tratar do redirecionamento, o CI acusa.

Para acrescentar um redirecionamento, basta uma linha:

```ts
{ source: '/pages/1234', destination: '/servicos/balcao/certidoes', note: 'Certidões' },
```

### Conteúdos

Hoje os conteúdos são ficheiros TypeScript em `src/content/data/`. As páginas
**nunca** os importam diretamente: passam sempre por `src/content/index.ts`,
cujas funções já são todas `async`. Ligar um CMS é substituir o corpo dessas
funções — ver [`cms/README.md`](cms/README.md).

---

## Sistema de design

### Identidade: a cereja

Alfândega da Fé é a capital nacional da cereja e é isso que o portal mostra,
sem o transformar em decoração:

- **Faixa de navegação em vermelho-cereja** (`accent-600`), por baixo da faixa
  de identidade. É a barra que separa quem entra do que pode fazer.
- **Brasão** com coroa mural de quatro torres, ramo de cerejas e a barra ondada
  do Sabor, em `src/components/layout/brasao.tsx`.
- **Assinatura** «Município de Alfândega da Fé — Terra da cereja ·
  Trás-os-Montes», escrita como texto e não como imagem: lê-se com leitor de
  ecrã, escala com o texto e não borra em ecrãs de alta densidade.
- **Filete de cereja** por cima de cada `h1` e de cada título de secção. Um
  traço curto, sempre no mesmo sítio, que dá ritmo às páginas sem ruído.
- **Ramo de cerejas** como motivo, usado uma única vez por página.

O cabeçalho tem três faixas, de cima para baixo: barra de serviço (azul
institucional, com Área de Munícipe, contactos, acessibilidade e idioma),
faixa de identidade (brasão, assinatura e pesquisa, sobre branco) e barra de
navegação (vermelho-cereja).

### Cores

Definidas uma única vez em `src/styles/tokens.css` e espelhadas no tema do
Tailwind em `src/styles/globals.css`. Como as utilidades do Tailwind apontam
para as variáveis CSS, o modo escuro e o modo de contraste elevado funcionam
sem duplicar uma única classe.

- **Azul institucional** (`primary-*`) — cabeçalho, rodapé, estrutura.
- **Cereja** (`accent-*`) — usado com parcimónia: a ação principal, o estado
  ativo, o prazo a terminar. Alfândega da Fé é a capital nacional da cereja; o
  acento é o único sítio onde isso aparece.
- **Verde Sabor** (`support-700`) — ambiente e natureza.
- **Escala do IPMA** (`risk-1` a `risk-5`) — risco de incêndio. **Não alterar**:
  são as cores oficiais. Só a cor do texto por cima é nossa, e nos níveis 2 e 3
  (amarelo e laranja) tem de ser escura.

Sem gradientes, sem vidro fosco, sem sombras coloridas. Duas intensidades de
sombra, ambas neutras e discretas.

### Tipografia

- Títulos: **Source Serif 4**
- Texto e interface: **Inter**
- Opção de legibilidade: **Atkinson Hyperlegible**, ligada no painel de
  acessibilidade

As três estão alojadas em `public/fonts`. **Nada é pedido ao Google em tempo de
execução.** No caminho crítico há três cortes; o Atkinson só é descarregado por
quem o ativa.

### Componentes

Todos estão reunidos em **`/styleguide`** — cores, tipografia, botões,
etiquetas, avisos, navegação, campos de formulário, cartões, tabelas, formatos
portugueses e os símbolos disponíveis. É a página a visitar antes de pedir um
componente novo.

Os componentes interativos assentam em **Radix UI** (menu de navegação,
diálogos, separadores, acordeão, balões), o que traz a navegação por teclado e
os atributos ARIA corretos de origem.

---

## Guia de edição de conteúdos

Esta secção é para a equipa de comunicação e para os serviços. **Não é preciso
saber programar** para nada do que se segue depois de o CMS estar ligado; até
lá, as instruções aplicam-se aos ficheiros indicados.

### Publicar uma notícia

Ficheiro: `src/content/data/news.ts` (ou, com CMS, a coleção *Notícias*).

```ts
{
  id: 'n-2026-08-03-piscinas',
  slug: 'piscinas-municipais-com-horario-alargado',   // sem acentos, sem espaços
  date: '2026-08-03',
  category: 'Desporto',
  title: { pt: 'Piscinas com horário alargado em agosto' },
  summary: {
    pt: 'Abrem às 09:00 e fecham às 20:00, todos os dias, até 31 de agosto.',
  },
  body: {
    pt: [
      'Primeiro parágrafo.',
      'Segundo parágrafo.',
    ],
  },
}
```

Três regras que fazem toda a diferença:

1. **O resumo é uma frase completa**, escrita de propósito para a listagem. Não
   é o início do texto cortado — no portal antigo as notícias apareciam
   truncadas a meio de uma palavra.
2. **O `slug` não muda depois de publicado.** Se tiver mesmo de mudar,
   acrescente um redirecionamento em `redirects.ts`.
3. **Toda a imagem leva `alt`** que descreva o que se vê. Se for puramente
   decorativa, use uma cadeia vazia.

### Pôr um aviso no topo do portal

Ficheiro: `src/content/data/alerts.ts`.

A barra de avisos aparece em **todas** as páginas. Reserve-a para o que é mesmo
urgente: proteção civil, cortes de água, risco de incêndio de nível 4 ou 5,
estradas cortadas.

```ts
{
  id: 'aviso-corte-agua-sambade',
  severity: 'warning',              // 'info' | 'warning' | 'danger'
  title: { pt: 'Corte de água em Sambade na quarta-feira, das 09:00 às 16:00.' },
  href: '/servicos/agua-e-residuos',
  startsAt: '2026-08-10',
  endsAt: '2026-08-13',             // obrigatório
}
```

`endsAt` é obrigatório e o aviso desaparece sozinho nessa data. Nível `danger`
não pode ser dispensado pelo visitante — use-o só quando houver risco para
pessoas.

### Acrescentar um serviço

Ficheiro: `src/content/data/services.ts`.

Cada serviço tem de responder às mesmas cinco perguntas, sempre pela mesma
ordem. É exatamente isto que faltava no portal antigo, onde as respostas
estavam espalhadas por PDF:

| Campo | Pergunta que responde |
| --- | --- |
| `audience` | A quem se destina? |
| `requiredDocuments` | O que tenho de levar? |
| `processingTime` | Quanto tempo demora? |
| `fee` | Quanto custa? (`Gratuito` é resposta válida — mas tem de estar escrita) |
| `steps` | Como faço, passo a passo? |

O `area` determina o endereço: um serviço com `area: 'urbanismo'` e
`slug: 'licenca-de-construcao'` fica em `/servicos/urbanismo/licenca-de-construcao`.

### Abrir uma consulta pública

Ficheiro: `src/content/data/consultations.ts`.

Basta indicar `startsAt` e `endsAt`. O portal trata do resto: mostra o estado
(a decorrer, vai abrir, encerrada), calcula o prazo em texto («termina em 12
dias»), destaca-a na página inicial enquanto estiver aberta e faz aparecer o
formulário de participação. Terminado o prazo, tudo isto desaparece sozinho.

### Publicar um documento

Ficheiro: `src/content/data/documents.ts`.

- Se o assunto **também** se resolve online, preencha `onlinePath`. O caminho
  online passa a aparecer primeiro e o PDF fica como alternativa — nunca ao
  contrário.
- `bytes` e `format` são obrigatórios: aparecem no texto da ligação
  («PDF, 2,3 MB»), como exigem as regras de acessibilidade.
- `extractedText` é o texto de dentro do PDF. É o que permite encontrar um
  documento pelo seu conteúdo e não só pelo título. Com o CMS ligado, é
  preenchido automaticamente no carregamento do ficheiro.

### Criar uma página institucional

Ficheiro: `src/content/data/pages.ts`.

As páginas são feitas de **blocos**, não de HTML livre. Assim a hierarquia de
títulos, a largura do texto e os espaçamentos ficam certos, independentemente
de quem edita.

| Bloco | Para quê |
| --- | --- |
| `prose` | Parágrafos de texto |
| `list` | Lista com marcas de verificação |
| `links` | Cartões de ligação para outras páginas |
| `steps` | Passos numerados |
| `callout` | Caixa de destaque (informação, aviso, sucesso) |
| `people` | Composição do executivo ou da assembleia |
| `tenders` | Procedimentos com prazo aberto |
| `datasets` | Conjuntos de dados abertos |
| `contact` | Bloco de contactos |
| `sitemap` | Mapa do portal |

O `path` da página é o seu endereço. Se acrescentar uma ligação na navegação
(`src/lib/navigation.ts`) sem criar a página correspondente, o teste
`tests/unit/content.test.ts` falha — de propósito.

### Substituir as imagens de exemplo

O portal tem imagem em todos os sítios onde o portal antigo a tinha: destaque
da página inicial, cartões de notícia, cartões de evento e páginas de turismo.
As 16 ilustrações em `public/images` são geradas por
`scripts/generate-placeholders.mjs` e servem de marcador de posição — o
repositório não inclui fotografias cujos direitos não estejam esclarecidos.

São cenas reconhecíveis do concelho, na paleta do Município: a vila ao
entardecer entre socalcos de cerejeiras, o cerejal em junho com um ramo em
primeiro plano, os lagos do Sabor, as amendoeiras em flor e o castelo.
`npm run placeholders` volta a gerá-las (o resultado é determinístico: os
mesmos ficheiros em cada execução).

Ao substituir por fotografias reais, **mantenha as proporções**: destaque e
notícias em 16:9, eventos e turismo em 3:2. As dimensões estão declaradas no
conteúdo e é isso que impede o texto de saltar enquanto a imagem carrega.
Basta pôr o ficheiro em `public/images` com o mesmo nome (`.jpg` em vez de
`.svg`) e atualizar o caminho em `src/content/data/`.

### Brasão

`src/components/layout/brasao.tsx` desenha um sinal heráldico simples (escudo,
coroa mural de quatro torres, ramo de cerejas e a barra ondada do Sabor).
**Não é o brasão oficial**: substitua-o pelo ficheiro oficial em SVG antes do
lançamento, mantendo as duas variantes — `cor` para o cabeçalho e `mono` para
o rodapé, que herda a cor do texto. Tem de ser vetorial: o portal não usa um
único símbolo em píxeis.

A assinatura ao lado (`Wordmark`) é texto, não imagem. Se o Município tiver
uma assinatura tipográfica fixada em manual de normas, é aí que se troca.

---

## Acessibilidade

Alvo: **WCAG 2.2 nível AA**, nos termos do Decreto-Lei n.º 83/2018 e da Diretiva
(UE) 2016/2102. A página `/acessibilidade` publica a declaração, com as
limitações conhecidas e a forma de pedir ajuda.

### O que está garantido

- **axe-core sem violações** em 28 modelos de página, mais o modo escuro e o
  modo de contraste elevado, verificado no CI a cada alteração.
- Hierarquia de títulos sequencial, uma só `h1` por página, marcos (`landmarks`)
  com nomes únicos.
- Ligações para saltar para o conteúdo e para a pesquisa.
- Operável só com teclado, com foco sempre visível — incluindo nos campos
  visualmente substituídos pelo rótulo (horas de atendimento, temas da
  newsletter), onde o anel de foco aparece no rótulo.
- Contraste de 4,5:1 no texto e 3:1 nos elementos interativos, verificado
  também em modo escuro.
- Alvos de toque de 44 px nos controlos principais.
- `prefers-reduced-motion` respeitado, com interruptor manual adicional.

### Painel de acessibilidade

Disponível no topo de todas as páginas: tamanho do texto (90 % a 150 %),
contraste elevado, espaçamento entre linhas, letra Atkinson Hyperlegible,
redução de animações e escolha de tema. As preferências ficam **apenas no
equipamento do visitante** (`localStorage`) — não vão para o servidor e não
identificam ninguém, pelo que não carecem de consentimento.

Um pequeno script aplica as preferências antes da primeira pintura: não há
salto de tema nem de tamanho de letra ao carregar.

### Decisões que valem a pena conhecer

- **O mapa nunca é a única via.** No mapa de ocorrências, a mesma informação
  aparece em lista logo abaixo; ao comunicar uma ocorrência, o local pode ser
  indicado por freguesia e descrição, sem tocar no mapa. Cartografia
  interativa não é operável por teclado nem interpretável por leitor de ecrã.
- **Sem CAPTCHA.** Os formulários usam uma armadilha invisível para robôs.
  Nenhum visitante tem de decifrar imagens para falar com o Município.
- **Recusar cookies é tão fácil como aceitar**: mesmo tamanho, mesma posição,
  mesmo peso visual. Sem consentimento não há qualquer medição.

---

## Desempenho

Orçamento verificado no CI (`lighthouserc.json`):

| Métrica | Orçamento | Medido |
| --- | --- | --- |
| JavaScript da página inicial | < 120 kB gzip | **118 kB** |
| — do qual específico da página | — | 1,6 kB |
| LCP | < 2,0 s | verificado no CI |
| CLS | < 0,05 | verificado no CI |
| INP / TBT | < 200 ms | verificado no CI |
| Lighthouse (4 categorias, móvel) | ≥ 95 | verificado no CI |

Como se lá chega:

- Quase tudo são **React Server Components**. Só correm no cliente o mega-menu,
  o menu móvel, o painel de acessibilidade, o troca-idiomas, o aviso de
  cookies e os componentes que são mesmo interativos.
- A pesquisa do cabeçalho é um formulário GET normal: funciona sem JavaScript e
  custa zero kilobytes.
- Os 103 kB partilhados são o mínimo do React 19 com o Next 15 mais as
  primitivas de navegação acessível. É esse o piso desta escolha técnica.
- O Leaflet só é carregado na página de ocorrências, e só no browser.
- Fontes locais com `font-display: swap` e pré-carregamento dos dois cortes do
  caminho crítico.
- Todas as imagens têm proporção declarada — não há saltos de layout.

---

## Testes

```bash
npm run test        # 50 testes unitários
npm run test:e2e    # 106 testes de ponta a ponta (desktop + móvel)
npm run test:a11y   # só acessibilidade
```

**Unitários** (Vitest): formatos portugueses, motor de pesquisa, geração de
ficheiros `.ics` conforme o RFC 5545, integridade dos dicionários e — o mais
útil no dia a dia — **integridade do conteúdo**: nenhuma entrada de navegação
aponta para o vazio, nenhum redirecionamento 301 leva a lado nenhum, nenhum
serviço fica sem responder às cinco perguntas.

**Ponta a ponta** (Playwright): correm contra a compilação de produção, em
ecrã grande e em telemóvel. Verificam os percursos reais — encontrar um serviço
em três cliques, mudar de idioma sem perder a página, comunicar uma ocorrência,
marcar atendimento, recusar cookies — e passam o axe-core por 28 modelos de
página.

Os dados com prazos são gerados em relação a `MOCK_TODAY`, o que torna os
testes reproduzíveis sem congelar o conteúdo da demonstração.

---

## Instalação em produção

### Onde alojar

O portal compila para saída *standalone* do Next.js e corre em qualquer
servidor com Node.js 20+. Recomenda-se alojamento em território da União
Europeia, em infraestrutura do Município ou de um fornecedor nacional.

```bash
npm ci
npm run build
npm start            # porta 3000 por omissão
```

Atrás de um Nginx ou Caddy como proxy inverso, com TLS. Serve `public/` como
estático e passa o resto ao Node.

### Systemd

```ini
[Unit]
Description=Portal do Municipio de Alfandega da Fe
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/portal
Environment=NODE_ENV=production
Environment=NEXT_PUBLIC_SITE_URL=https://www.cm-alfandegadafe.pt
ExecStart=/usr/bin/node node_modules/.bin/next start --port 3000
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

### Cabeçalhos

`next.config.ts` já envia `X-Content-Type-Options`, `X-Frame-Options`,
`Referrer-Policy`, `Permissions-Policy` e `Cross-Origin-Opener-Policy`, além de
cache imutável para as fontes e sem cache para o *service worker*.

Falta uma `Content-Security-Policy`, que deve ser definida no proxy inverso
porque depende do endereço da instância de Plausible. Ponto de partida:

```
default-src 'self';
img-src 'self' data: https://tile.openstreetmap.org;
script-src 'self' 'unsafe-inline' https://plausible.exemplo.pt;
style-src 'self' 'unsafe-inline';
font-src 'self';
connect-src 'self' https://plausible.exemplo.pt;
frame-ancestors 'self';
```

### Medição de utilização

Instale o **Plausible** (ou Matomo) nos servidores do Município e defina
`NEXT_PUBLIC_PLAUSIBLE_DOMAIN` e `NEXT_PUBLIC_PLAUSIBLE_SCRIPT_URL`. Sem estas
variáveis não é carregado qualquer script de medição. Mesmo com elas, nada
acontece antes de o visitante autorizar.

Não use Google Analytics: transfere dados pessoais para fora da UE sem base
legal sólida para uma entidade pública.

### Newsletter

`subscribeNewsletter` em `src/app/actions.ts` valida os dados e tem o ponto de
ligação assinalado. Ligue a um serviço com **duplo opt-in**: só há subscrição
depois de a pessoa clicar na ligação de confirmação enviada por correio
eletrónico.

---

## O que falta fazer antes do lançamento

Coisas que **exigem decisão ou dados do Município** e que não podem ser
inventadas por quem desenvolve:

1. **Brasão oficial** em SVG, a substituir o marcador em
   `src/components/layout/brasao.tsx`.
2. **Fotografias reais**, a substituir as ilustrações em `public/images`,
   mantendo as proporções.
3. **Dados verdadeiros.** Os conteúdos em `src/content/data/` são exemplos
   realistas e verosímeis, construídos a partir de informação pública, mas
   **não são dados oficiais**. Números do orçamento, população, contactos
   diretos das divisões e nomes dos presidentes de junta têm de ser
   confirmados pelos serviços antes de irem para o ar.
4. **Ligar o CMS** — ver [`cms/README.md`](cms/README.md).
5. **Área de Munícipe**: integrar a autenticação com Chave Móvel Digital.
6. **Ligar os formulários ao processo interno.** As Server Actions validam e
   devolvem número de referência, mas os pontos de entrega estão marcados com
   `TODO` em `src/app/actions.ts`.
7. **Risco de incêndio a partir da API do IPMA**, em vez dos valores de
   exemplo em `src/content/data/services-operational.ts`.
8. **Avaliação de acessibilidade por terceiros**, com pessoas com deficiência,
   e atualização da declaração em `src/app/[locale]/acessibilidade/page.tsx`.
   A verificação automática apanha talvez metade dos problemas reais.
9. **Completar as traduções.** A interface está integralmente em quatro
   línguas; os conteúdos longos (notícias, páginas institucionais) estão em
   português, com tradução parcial. O modelo de conteúdo já suporta as quatro.
10. **Rever a tabela de redirecionamentos** com os registos de acesso do portal
    antigo, para apanhar os endereços realmente usados.

---

## Licença e créditos

Conteúdos: Município de Alfândega da Fé.
Cartografia: © colaboradores do OpenStreetMap.
Tipografia: Source Serif 4 e Inter (SIL Open Font License), Atkinson
Hyperlegible (Braille Institute).
