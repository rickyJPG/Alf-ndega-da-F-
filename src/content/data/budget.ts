import type { BudgetYear } from '../types';

/**
 * Orçamento de 2026 com comparação com o ano anterior.
 *
 * Os montantes são ordens de grandeza plausíveis para um município desta
 * dimensão (cerca de 4 500 habitantes). Antes da publicação, substituir pelos
 * valores do orçamento aprovado — a estrutura mantém-se.
 */
export const budget2026: BudgetYear = {
  year: 2026,
  revenue: 12_480_000,
  expense: 12_480_000,
  previousRevenue: 11_920_000,
  previousExpense: 11_640_000,
  inhabitants: 4488,
  categories: [
    {
      id: 'funcoes-gerais',
      label: {
        pt: 'Administração geral',
        en: 'General administration',
        es: 'Administración general',
        fr: 'Administration générale',
      },
      amount: 2_310_000,
      previousAmount: 2_268_000,
      icon: 'building',
      children: [
        { label: { pt: 'Pessoal', en: 'Staff' }, amount: 1_512_000, previousAmount: 1_463_000 },
        { label: { pt: 'Funcionamento', en: 'Running costs' }, amount: 604_000, previousAmount: 621_000 },
        { label: { pt: 'Encargos financeiros', en: 'Financial charges' }, amount: 194_000, previousAmount: 184_000 },
      ],
    },
    {
      id: 'agua-saneamento',
      label: {
        pt: 'Água, saneamento e resíduos',
        en: 'Water, sanitation and waste',
        es: 'Agua, saneamiento y residuos',
        fr: 'Eau, assainissement et déchets',
      },
      amount: 2_640_000,
      previousAmount: 2_180_000,
      icon: 'droplet',
      children: [
        { label: { pt: 'Rede de abastecimento', en: 'Supply network' }, amount: 1_240_000, previousAmount: 890_000 },
        { label: { pt: 'Saneamento e ETAR', en: 'Sewerage and treatment' }, amount: 780_000, previousAmount: 745_000 },
        { label: { pt: 'Recolha de resíduos', en: 'Waste collection' }, amount: 620_000, previousAmount: 545_000 },
      ],
    },
    {
      id: 'obras-vias',
      label: {
        pt: 'Obras municipais e vias',
        en: 'Public works and roads',
        es: 'Obras municipales y viales',
        fr: 'Travaux et voirie',
      },
      amount: 2_180_000,
      previousAmount: 2_412_000,
      icon: 'wrench',
      children: [
        { label: { pt: 'Rede viária', en: 'Road network' }, amount: 1_130_000, previousAmount: 1_402_000 },
        { label: { pt: 'Edifícios municipais', en: 'Municipal buildings' }, amount: 690_000, previousAmount: 668_000 },
        { label: { pt: 'Iluminação pública', en: 'Street lighting' }, amount: 360_000, previousAmount: 342_000 },
      ],
    },
    {
      id: 'educacao',
      label: { pt: 'Educação', en: 'Education', es: 'Educación', fr: 'Éducation' },
      amount: 1_640_000,
      previousAmount: 1_524_000,
      icon: 'graduation',
      children: [
        { label: { pt: 'Refeições e transportes', en: 'Meals and transport' }, amount: 742_000, previousAmount: 688_000 },
        { label: { pt: 'Pessoal não docente', en: 'Non-teaching staff' }, amount: 598_000, previousAmount: 566_000 },
        { label: { pt: 'Manuais e material escolar', en: 'Textbooks and supplies' }, amount: 300_000, previousAmount: 270_000 },
      ],
    },
    {
      id: 'acao-social',
      label: { pt: 'Ação social e saúde', en: 'Social services and health', es: 'Acción social y salud', fr: 'Action sociale et santé' },
      amount: 1_120_000,
      previousAmount: 986_000,
      icon: 'heart',
      children: [
        { label: { pt: 'Apoios diretos a famílias', en: 'Direct support to families' }, amount: 486_000, previousAmount: 402_000 },
        { label: { pt: 'Habitação social', en: 'Social housing' }, amount: 398_000, previousAmount: 364_000 },
        { label: { pt: 'Teleassistência e apoio domiciliário', en: 'Telecare and home support' }, amount: 236_000, previousAmount: 220_000 },
      ],
    },
    {
      id: 'cultura-desporto',
      label: { pt: 'Cultura, desporto e juventude', en: 'Culture, sport and youth', es: 'Cultura, deporte y juventud', fr: 'Culture, sport et jeunesse' },
      amount: 1_060_000,
      previousAmount: 1_098_000,
      icon: 'ticket',
      children: [
        { label: { pt: 'Equipamentos desportivos', en: 'Sports facilities' }, amount: 428_000, previousAmount: 462_000 },
        { label: { pt: 'Programação cultural', en: 'Cultural programme' }, amount: 386_000, previousAmount: 402_000 },
        { label: { pt: 'Apoio ao associativismo', en: 'Support to associations' }, amount: 246_000, previousAmount: 234_000 },
      ],
    },
    {
      id: 'ambiente-florestas',
      label: { pt: 'Ambiente e florestas', en: 'Environment and forests', es: 'Medio ambiente y bosques', fr: 'Environnement et forêts' },
      amount: 780_000,
      previousAmount: 692_000,
      icon: 'leaf',
      children: [
        { label: { pt: 'Defesa da floresta contra incêndios', en: 'Wildfire prevention' }, amount: 412_000, previousAmount: 348_000 },
        { label: { pt: 'Espaços verdes', en: 'Green spaces' }, amount: 368_000, previousAmount: 344_000 },
      ],
    },
    {
      id: 'economia',
      label: { pt: 'Desenvolvimento económico e turismo', en: 'Economic development and tourism', es: 'Desarrollo económico y turismo', fr: 'Développement économique et tourisme' },
      amount: 750_000,
      previousAmount: 480_000,
      icon: 'briefcase',
      children: [
        { label: { pt: 'Apoios à atividade agrícola', en: 'Support to farming' }, amount: 340_000, previousAmount: 196_000 },
        { label: { pt: 'Zona industrial', en: 'Industrial estate' }, amount: 248_000, previousAmount: 158_000 },
        { label: { pt: 'Promoção turística', en: 'Tourism promotion' }, amount: 162_000, previousAmount: 126_000 },
      ],
    },
  ],
  documents: [
    {
      href: '/documentos/orcamento-2026.pdf',
      label: { pt: 'Orçamento e GOP 2026', en: '2026 budget and plan' },
      format: 'pdf',
      bytes: 2_936_012,
    },
    {
      href: '/dados/orcamento-2026.csv',
      label: { pt: 'Orçamento 2026 em CSV', en: '2026 budget as CSV' },
      format: 'csv',
      bytes: 48_128,
    },
  ],
};

export const budgetYears = [budget2026];

/** Despesa por habitante — o indicador mais fácil de entender do bloco. */
export function expensePerInhabitant(year: BudgetYear): number {
  return Math.round(year.expense / year.inhabitants);
}
