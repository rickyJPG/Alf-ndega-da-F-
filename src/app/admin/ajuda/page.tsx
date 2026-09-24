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
          icone="fileText"
          titulo="Publicar um formulário ou um edital"
          passos={[
            'Clique em Documentos e depois em «Publicar documento».',
            'Escreva o título como quer que apareça no botão de descarregar.',
            'Em «Para que serve», uma frase a dizer quando é que o munícipe precisa dele.',
            'Escolha o tipo (formulário, edital, ata…) e a área do portal onde deve ser listado.',
            'Escolha o ficheiro no computador: PDF, Word, Excel ou ZIP, até 25 MB.',
            'Clique em «Publicar documento». Fica logo disponível para descarregar.',
          ]}
        />

        <Receita
          icone="briefcase"
          titulo="Corrigir uma taxa ou um prazo de um serviço"
          passos={[
            'Clique em Serviços. Estão agrupados por área, como no portal.',
            'Encontre o serviço e clique em «Corrigir».',
            'Na secção «As perguntas de quem chega» estão a taxa, o prazo, a quem se destina e o que é preciso levar.',
            'Corrija o que mudou e guarde. O portal fica atualizado em segundos.',
            'Se o modo de tratar mudou, corrija também os passos, em «Como se faz».',
          ]}
        />

        <Receita
          icone="book"
          titulo="Corrigir o texto de uma página"
          passos={[
            'Clique em Páginas. Estão agrupadas como no menu do portal.',
            'Encontre a página e clique em «Corrigir».',
            'Cada parte da página aparece separada, com um título por cima a dizer o que é.',
            'Corrija o que precisar. Nos textos, deixe uma linha em branco entre parágrafos; nas listas, um item por linha.',
            'Guarde. As galerias, os vídeos e as listas que se preenchem sozinhas ficam onde estão — não são tocadas.',
          ]}
        />

        <Receita
          icone="phone"
          titulo="Mudar o telefone, o horário ou a morada"
          passos={[
            'Clique em Contactos. É um formulário só — não há lista nem nada para escolher.',
            'Corrija o que mudou: morada, código postal, telefone, fax, correio eletrónico ou NIF.',
            'O horário de atendimento tem uma linha por período. «Acrescentar linha» para um período novo, «Retirar» para um que acabou.',
            'Clique em «Guardar contactos».',
            'Fica mudado de uma vez em todo o portal: no rodapé de todas as páginas, na página de contactos, nas fichas dos serviços e na marcação de atendimento.',
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
          pergunta="Corrigi um PDF. Tenho de avisar quem já tem a ligação?"
          resposta="Não. Abra o documento em Documentos, escolha o ficheiro novo em «Substituir por» e guarde. O endereço do documento é o mesmo, por isso todas as ligações que já andam por aí — e-mails, redes sociais, outros sítios — passam a servir a versão corrigida sozinhas."
        />
        <Pergunta
          pergunta="Um documento aparece na lista mas diz «Ficheiro por publicar»."
          resposta="O registo existe, mas o ficheiro ainda não foi carregado. Abra-o em Documentos e escolha o ficheiro. Enquanto isso, o portal não mostra botão de descarregar nenhum — vale mais dizer que ainda não está do que deixar clicar e não acontecer nada."
        />
        <Pergunta
          pergunta="Numa página, há partes que não me deixa mexer."
          resposta="São as galerias de fotografias, os vídeos e as listas que o portal preenche sozinho (eleitos, concursos). Aparecem na lista, para saber que continuam lá, mas mudam-se no código. A caixa de contactos é a exceção: essa muda-se em Contactos, e muda em todas as páginas ao mesmo tempo."
        />

        <Pergunta
          pergunta="Mudei o telefone em Contactos. Tenho de o mudar mais nalgum lado?"
          resposta="Não. Escreve-se num sítio só e aparece em todos: rodapé, página de contactos, fichas dos serviços, marcação de atendimento e a ficha que os motores de busca leem. A única exceção é a página que aparece quando falta a ligação à Internet — essa tem de estar guardada no telemóvel de antemão, por isso só apanha o número novo quando quem mantém o portal o voltar a publicar."
        />
        <Pergunta
          pergunta="Quem mais consegue entrar aqui?"
          resposta="Quem tiver conta, em Contas. Cada pessoa tem a sua, com a sua palavra-passe. Quando alguém sai dos serviços, apaga-se a conta dessa pessoa e as outras ficam como estavam — ninguém tem de decorar uma palavra-passe nova."
        />
        <Pergunta
          pergunta="Esqueci-me da minha palavra-passe."
          resposta="Peça a outra pessoa da equipa que vá a Contas, encontre a sua e clique em «Trocar palavra-passe». Combinam uma nova ali mesmo. Ninguém consegue ver a antiga — nem quem mantém o portal: o que fica guardado não permite voltar atrás."
        />
        <Pergunta
          pergunta="Deixei isto aberto e agora pede outra vez a palavra-passe."
          resposta="A sessão dura uma semana sem se lhe tocar, e renova-se sozinha enquanto andar pelo painel — a publicar ou só a consultar. Ao fim de uma semana sem lá voltar fecha-se, por segurança. Basta entrar outra vez; o que já tinha guardado está guardado."
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
          'Menus e criar páginas novas',
          'Ordens de trabalho das reuniões',
          'Orçamento e prestação de contas',
          'Calendário de recolha de resíduos',
          'Números de emergência e posto de turismo',
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
