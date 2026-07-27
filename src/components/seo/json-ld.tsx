/**
 * Rendert strukturierte Daten als JSON-LD.
 *
 * Der Inhalt stammt ausschließlich aus eigenen, typisierten Datenquellen –
 * nie aus Nutzereingaben. `<` wird trotzdem maskiert, damit ein `</script>`
 * in einem Titel den Block nicht aufbrechen kann.
 */
export function JsonLd({ data }: { data: object | object[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  );
}
