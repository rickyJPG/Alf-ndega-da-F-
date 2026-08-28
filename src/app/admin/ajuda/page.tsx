import Link from 'next/link';

import { Icon, type IconName } from '@/components/ui/icon';
import { exigirEntrada } from '@/lib/admin/sessao';
import { CabecalhoDaPagina } from '../pecas';

/**
 * Ajuda.
 *
 * Escrita para quem nunca mexeu num sítio na internet. Sem palavras como
 * «publicar conteúdo», «gerir ativos» ou «CMS»: cada passo diz o que se
 * carrega e o que acontece a seguir.
 */

export const dynamic = 'force-dynamic';

export default async function PaginaDeAjuda() {
  await exigirEntrada();

  return (
    <div className="max-w-[62rem]">
      <CabecalhoDaPagina
        titulo="Ajuda"
        descricao="Como se faz cada coisa, passo a passo. Não é preciso saber nada de computadores além de escrever e clicar."
      />

      <p className="mb-8 flex items-start gap-2.5 rounded-lg border border-s-4 border-info bg-info-surface p-4">
        <Icon name="info" size={20} className="mt-0.5 shrink-0" />
        <span>
          <strong className="block">Não há nada que se estrague sem remédio.</strong>
          Tudo o que escreve aqui pode ser corrigido ou apagado a seguir. Antes de apagar seja o
          que for, o painel pergunta sempre se é mesmo isso que quer.
        </span>
      </p>

      <div className="grid gap-6 lg:grid-cols-2">
        <Receita
          icone="megaphone"
          titulo="Publicar uma notícia"
          passos={[
            'Clique em Notícias, no menu de cima, e depois em «Escrever notícia».',
            'Escreva o título. É a frase que as pessoas vão ler primeiro — deve perceber-se sozinha.',
            'No resumo, duas ou três linhas com o essencial. É o que aparece na listagem.',
            'No texto, escreva à vontade. Deixe uma linha em branco entre parágrafos.',
            'Escolha a data e o assunto. A data manda na ordem das notícias no portal.',
            'Se quiser fotografia, escolha uma posição na lista e descreva o que se vê.',
            'Clique em «Publicar notícia». Fica no ar em poucos segundos.',
          ]}
        />

        <Receita
          icone="alert"
          titulo="Avisar de um corte de água ou de uma estrada cortada"
          passos={[
            'Clique em Avisos. O formulário está logo aberto, à esquerda.',
            'Escreva a frase toda: o quê, onde e quando. Ex.: «Corte de água em Sambade na quarta-feira, entre as 09:00 e as 16:00.»',
            'Escolha a gravidade. Amarelo para transtornos, vermelho só para perigo.',
            'Ponha a data em que o aviso deixa de fazer sentido. Depois dela sai do portal sozinho.',
            'Clique em «Publicar aviso». Aparece numa barra no topo de todas as páginas.',
          ]}
        />

        <Receita
          icone="calendar"
          titulo="Pôr um evento na agenda"
          passos={[
            'Clique em Agenda e depois em «Pôr na agenda».',
            'Nome do evento, descrição curta e tipo (música, feira, desporto…).',
            'Dia e hora. Se durar vários dias, preencha também o «Até». Se for de manhã à noite, deixe a hora em branco.',
            'Local e preço, por extenso.',
            'Clique em «Pôr na agenda». Passado o dia, o evento sai da agenda sozinho — mas fica guardado.',
          ]}
        />

        <Receita
          icone="camera"
          titulo="Trocar uma fotografia do portal"
          passos={[
            'Clique em Fotografias. Cada quadrado é um sítio do portal, com o nome por baixo.',
            'Encontre o sítio que quer mudar e clique em «Carregar» ou «Trocar».',
            'Escolha a fotografia no computador. Fica trocada assim que a escolher — não há mais nada a fazer.',
            'A fotografia deve ser deitada (mais larga do que alta) e ter menos de 8 MB.',
            'Se se enganar, clique em «Remover» e volte a carregar a certa.',
          ]}
        />
      </div>

      {/* --------------------------------------------------------- perguntas -- */}

      <h2 className="mt-12 mb-4 font-serif text-2xl font-semibold">Perguntas que aparecem sempre</h2>

      <dl className="divide-y divide-line rounded-lg border border-line bg-surface">
        <Pergunta
          pergunta="Escrevi uma coisa errada e já publiquei. E agora?"
          resposta="Vá à lista, clique na notícia (ou no evento, ou no aviso) e corrija. Guarda-se outra vez e o portal atualiza-se. Ninguém tem de fazer mais nada."
        />
        <Pergunta
          pergunta="Onde é que a notícia aparece depois de publicada?"
          resposta="Na página de notícias do portal, e — se for das mais recentes — também na página inicial. Na lista de notícias há um botão «Ver» que a abre exatamente como o munícipe a vê."
        />
        <Pergunta
          pergunta="A fotografia que carreguei aparece em mais sítios do que eu queria."
          resposta="Cada posição é um sítio fixo do portal, e há posições usadas em mais do que uma página. Se precisar de uma posição nova, é um pedido para quem mantém o portal — é uma linha de código, não é um trabalho."
        />
        <Pergunta
          pergunta="Posso escrever em inglês ou em francês?"
          resposta="O painel guarda o texto em português. As traduções que já existem no portal mantêm-se; ao corrigir um texto em português, a tradução antiga fica como estava até alguém a rever. Se precisar de traduzir conteúdo novo, fale com quem mantém o portal."
        />
        <Pergunta
          pergunta="Quem mais consegue entrar aqui?"
          resposta="Quem souber a palavra-passe. É partilhada pela equipa. Se sair alguém da equipa, peça a quem mantém o portal para a trocar."
        />
        <Pergunta
          pergunta="Deixei isto aberto e agora pede outra vez a palavra-passe."
          resposta="A sessão dura doze horas e depois fecha-se sozinha, por segurança. Basta voltar a entrar. O que já tinha guardado está guardado."
        />
        <Pergunta
          pergunta="Onde é que fica guardado o que escrevo?"
          resposta="Em ficheiros no próprio servidor do portal, numa pasta chamada «conteudo». Quem faz as cópias de segurança do servidor está a copiar também tudo o que aqui se escreve."
        />
      </dl>

      {/* ------------------------------------------------------ o que não dá -- */}

      <h2 className="mt-12 mb-3 font-serif text-2xl font-semibold">
        O que ainda não se faz por aqui
      </h2>
      <p className="mb-4 max-w-[62ch] text-ink-muted">
        Estas partes do portal continuam a mudar-se no código. Não é esquecimento: são coisas que
        mudam uma ou duas vezes por ano, e um formulário para cada uma seria mais para manter do
        que para usar. Quando alguma passar a mudar todos os meses, vale a pena trazê-la para aqui.
      </p>
      <ul className="grid list-none gap-2 p-0 sm:grid-cols-2">
        {[
          'Menus e páginas novas',
          'Documentos e formulários para descarregar',
          'Atas e ordens de trabalho das reuniões',
          'Orçamento e prestação de contas',
          'Calendário de recolha de resíduos',
          'Telefones e horários dos serviços',
        ].map((assunto) => (
          <li
            key={assunto}
            className="flex items-center gap-2 rounded-md border border-line bg-surface px-3 py-2 text-sm"
          >
            <Icon name="fileText" size={16} className="shrink-0 text-ink-muted" />
            {assunto}
          </li>
        ))}
      </ul>

      <p className="mt-8 flex items-start gap-2.5 rounded-lg border border-line bg-surface p-4">
        <Icon name="lightbulb" size={20} className="mt-0.5 shrink-0 text-accent-600" />
        <span>
          <strong className="block">Está com dúvidas a meio de uma publicação?</strong>
          Guarde o que já tem — nada se perde — e volte aqui. Ou veja como ficou no portal, pelo
          botão <Link href="/" target="_blank">Ver o portal</Link>, lá em cima.
        </span>
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ peças -- */

function Receita({
  icone,
  titulo,
  passos,
}: {
  icone: IconName;
  titulo: string;
  passos: string[];
}) {
  return (
    <section className="rounded-lg border border-line bg-surface p-5">
      <h2 className="flex items-center gap-2.5 font-serif text-xl font-semibold">
        <Icon name={icone} size={22} className="shrink-0 text-accent-600" />
        {titulo}
      </h2>
      <ol className="mt-3 space-y-2 ps-5">
        {passos.map((passo) => (
          <li key={passo} className="text-ink-muted">
            {passo}
          </li>
        ))}
      </ol>
    </section>
  );
}

function Pergunta({ pergunta, resposta }: { pergunta: string; resposta: string }) {
  return (
    <div className="p-5">
      <dt className="font-semibold text-ink">{pergunta}</dt>
      <dd className="mt-1.5 max-w-[70ch] text-ink-muted">{resposta}</dd>
    </div>
  );
}
