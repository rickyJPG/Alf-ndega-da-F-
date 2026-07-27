/**
 * Escreve dados estruturados em JSON-LD.
 *
 * O conteúdo vem exclusivamente de fontes de dados próprias e tipadas —
 * nunca de dados introduzidos por quem visita. Ainda assim o `<` é
 * escapado, para que um `</script>` num título não parta o bloco.
 */
export function JsonLd({ data }: { data: object | object[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  );
}
