import type { ServiceItem } from '../types';

/**
 * Katalog der Dienstleistungen.
 *
 * Jeder Eintrag beantwortet dieselben fünf Fragen, in derselben Reihenfolge:
 * Wer? Was mitbringen? Wie lange dauert es? Was kostet es? Wie mache ich es?
 * Das ist der eigentliche Wert gegenüber der alten Seite – dort standen die
 * Antworten verstreut in PDF-Dateien.
 */
export const services: ServiceItem[] = [
  {
    id: 's-pagar-agua',
    slug: 'pagar-a-agua',
    area: 'agua-e-residuos',
    featured: true,
    icon: 'droplet',
    title: { pt: 'Pagar a água', en: 'Pay a water bill', es: 'Pagar el agua', fr: 'Payer l’eau' },
    summary: {
      pt: 'Pague a fatura da água por referência Multibanco, MB WAY ou débito direto.',
      en: 'Pay your water bill by bank reference, MB WAY or direct debit.',
      es: 'Pague la factura del agua por referencia bancaria, MB WAY o domiciliación.',
      fr: 'Payez votre facture d’eau par référence bancaire, MB WAY ou prélèvement.',
    },
    lifeEvents: ['mudar-de-casa'],
    channels: ['online', 'presencial', 'telefone'],
    onlineUrl: '/servicos/pagamentos',
    processingTime: {
      pt: 'Imediato. O pagamento é registado no prazo de 2 dias úteis.',
      en: 'Immediate. Payment is recorded within 2 working days.',
    },
    fee: { pt: 'Gratuito', en: 'Free', es: 'Gratuito', fr: 'Gratuit' },
    audience: {
      pt: 'Titulares de contrato de fornecimento de água.',
      en: 'Water supply account holders.',
    },
    requiredDocuments: {
      pt: ['Número de cliente ou referência da fatura'],
      en: ['Customer number or invoice reference'],
    },
    steps: [
      {
        title: { pt: 'Tenha a fatura à mão', en: 'Have the invoice ready' },
        detail: {
          pt: 'A referência para pagamento está no canto inferior direito da fatura.',
          en: 'The payment reference is in the bottom right corner of the invoice.',
        },
      },
      {
        title: { pt: 'Escolha a forma de pagamento', en: 'Choose how to pay' },
        detail: {
          pt: 'Homebanking, Multibanco, MB WAY ou ao balcão da Tesouraria.',
          en: 'Home banking, ATM, MB WAY or at the treasury counter.',
        },
      },
      {
        title: { pt: 'Guarde o comprovativo', en: 'Keep the receipt' },
        detail: {
          pt: 'Na Área de Munícipe pode consultar o histórico de pagamentos.',
          en: 'Your payment history is available in the citizen account.',
        },
      },
    ],
    department: 'Divisão Financeira — Tesouraria',
    relatedServices: ['contrato-de-agua', 'comunicar-leitura'],
  },
  {
    id: 's-contrato-agua',
    slug: 'contrato-de-agua',
    area: 'agua-e-residuos',
    icon: 'droplet',
    title: {
      pt: 'Fazer contrato de água',
      en: 'Open a water account',
      es: 'Contratar el agua',
      fr: 'Ouvrir un contrat d’eau',
    },
    summary: {
      pt: 'Mudou de casa? Ponha a água em seu nome, em 15 minutos ao balcão.',
      en: 'Moved house? Put the water in your name, 15 minutes at the counter.',
      es: '¿Se ha mudado? Ponga el agua a su nombre en 15 minutos.',
      fr: 'Vous avez déménagé ? Mettez l’eau à votre nom en 15 minutes.',
    },
    lifeEvents: ['mudar-de-casa'],
    channels: ['presencial', 'correio'],
    processingTime: { pt: 'No próprio dia', en: 'Same day' },
    fee: {
      pt: '38,50 € de caução, devolvidos no fim do contrato',
      en: '€38.50 deposit, refunded when the contract ends',
    },
    audience: {
      pt: 'Proprietários ou arrendatários de imóvel no concelho.',
      en: 'Owners or tenants of property in the municipality.',
    },
    requiredDocuments: {
      pt: [
        'Cartão de cidadão do titular',
        'Comprovativo de morada (caderneta predial ou contrato de arrendamento)',
        'IBAN, se quiser débito direto',
        'Leitura atual do contador',
      ],
      en: [
        'Identity card of the account holder',
        'Proof of address (land registry entry or tenancy agreement)',
        'IBAN, if you want direct debit',
        'Current meter reading',
      ],
    },
    steps: [
      {
        title: { pt: 'Marque atendimento', en: 'Book an appointment' },
        detail: {
          pt: 'Evita esperas. Também pode ir sem marcação, no horário normal.',
          en: 'Avoids queues. You can also come without an appointment during opening hours.',
        },
      },
      {
        title: { pt: 'Traga os documentos', en: 'Bring the documents' },
        detail: { pt: 'Originais, para conferência no balcão.', en: 'Originals, checked at the counter.' },
      },
      {
        title: { pt: 'Assine o contrato', en: 'Sign the contract' },
        detail: {
          pt: 'A água fica em seu nome a partir da leitura registada nesse dia.',
          en: 'The supply is in your name from the reading taken that day.',
        },
      },
    ],
    department: 'Divisão de Águas e Saneamento',
    forms: ['d-form-contrato-agua'],
    relatedServices: ['pagar-a-agua'],
  },
  {
    id: 's-certidoes',
    slug: 'certidoes',
    area: 'balcao',
    featured: true,
    icon: 'fileText',
    title: {
      pt: 'Peça a sua certidão',
      en: 'Request a certificate',
      es: 'Pida su certificado',
      fr: 'Demandez votre certificat',
    },
    summary: {
      pt: 'Certidões de teor, de localização, de destaque ou de compropriedade.',
      en: 'Certificates of content, location, plot division or co-ownership.',
      es: 'Certificados de contenido, localización, segregación o copropiedad.',
      fr: 'Certificats de contenu, de localisation, de division ou d’indivision.',
    },
    lifeEvents: ['construir-ou-remodelar', 'mudar-de-casa'],
    channels: ['online', 'presencial', 'correio'],
    onlineUrl: '/servicos/balcao-digital',
    processingTime: { pt: 'Até 10 dias úteis', en: 'Up to 10 working days' },
    fee: {
      pt: '15,80 € por certidão. Isento para fins de habitação própria permanente.',
      en: '€15.80 per certificate. Free when it concerns your own permanent home.',
    },
    audience: {
      pt: 'Qualquer pessoa com interesse legítimo no processo.',
      en: 'Anyone with a legitimate interest in the case.',
    },
    requiredDocuments: {
      pt: [
        'Cartão de cidadão',
        'Identificação do prédio (artigo matricial ou descrição predial)',
        'Indicação da finalidade da certidão',
      ],
      en: [
        'Identity card',
        'Property identification (tax reference or land registry description)',
        'What the certificate is for',
      ],
    },
    steps: [
      {
        title: { pt: 'Preencha o pedido', en: 'Fill in the request' },
        detail: {
          pt: 'Online na Área de Munícipe ou em papel, no balcão.',
          en: 'Online in the citizen account or on paper at the counter.',
        },
      },
      {
        title: { pt: 'Pague a taxa', en: 'Pay the fee' },
        detail: {
          pt: 'Só depois de o pedido ser aceite. Recebe a referência por email.',
          en: 'Only after the request is accepted. The reference arrives by email.',
        },
      },
      {
        title: { pt: 'Levante ou receba', en: 'Collect or receive' },
        detail: {
          pt: 'Pode levantar ao balcão, receber por correio ou descarregar em PDF assinado.',
          en: 'Collect at the counter, receive by post, or download a signed PDF.',
        },
      },
    ],
    legislation: {
      pt: ['Regulamento Municipal de Taxas e Licenças, artigo 12.º'],
    },
    department: 'Divisão de Urbanismo',
    forms: ['d-form-certidao'],
  },
  {
    id: 's-licenca-construcao',
    slug: 'licenca-de-construcao',
    area: 'urbanismo',
    featured: true,
    icon: 'building',
    title: {
      pt: 'Licença de construção',
      en: 'Building permit',
      es: 'Licencia de obra',
      fr: 'Permis de construire',
    },
    summary: {
      pt: 'Construir de novo, ampliar ou alterar. Saiba o que entregar e quanto tempo demora.',
      en: 'New build, extension or alteration. What to submit and how long it takes.',
      es: 'Construir, ampliar o modificar. Qué entregar y cuánto tarda.',
      fr: 'Construire, agrandir ou modifier. Ce qu’il faut fournir et les délais.',
    },
    lifeEvents: ['construir-ou-remodelar'],
    channels: ['online', 'presencial'],
    onlineUrl: '/servicos/balcao-digital',
    processingTime: {
      pt: 'Até 45 dias úteis após a entrega completa do processo',
      en: 'Up to 45 working days after the complete file is submitted',
    },
    fee: {
      pt: 'Variável, calculada sobre a área de construção. Ver o simulador de taxas.',
      en: 'Variable, based on floor area. See the fee calculator.',
    },
    audience: {
      pt: 'Proprietários, usufrutuários ou titulares de direito de superfície.',
      en: 'Owners, usufructuaries or holders of a surface right.',
    },
    requiredDocuments: {
      pt: [
        'Requerimento assinado pelo titular',
        'Certidão da conservatória do registo predial',
        'Projeto de arquitetura, em duplicado e em formato digital',
        'Termo de responsabilidade do autor do projeto',
        'Levantamento topográfico à escala 1:200',
        'Memória descritiva e estimativa orçamental',
      ],
      en: [
        'Application signed by the owner',
        'Land registry certificate',
        'Architectural design, in duplicate and in digital form',
        'Designer’s statement of responsibility',
        'Topographic survey at 1:200',
        'Descriptive report and cost estimate',
      ],
    },
    steps: [
      {
        title: { pt: 'Consulte o PDM primeiro', en: 'Check the local plan first' },
        detail: {
          pt: 'A classificação do solo determina o que pode construir. Poupa meses.',
          en: 'Land classification determines what you may build. It saves months.',
        },
      },
      {
        title: { pt: 'Reúna o processo', en: 'Assemble the file' },
        detail: {
          pt: 'Um processo incompleto suspende o prazo. A lista acima é a checklist.',
          en: 'An incomplete file stops the clock. The list above is the checklist.',
        },
      },
      {
        title: { pt: 'Entregue e acompanhe', en: 'Submit and follow' },
        detail: {
          pt: 'Recebe um número de processo e pode seguir o estado na Área de Munícipe.',
          en: 'You get a case number and can follow progress in the citizen account.',
        },
      },
    ],
    legislation: {
      pt: [
        'Decreto-Lei n.º 555/99, de 16 de dezembro (RJUE), na redação atual',
        'Regulamento Municipal de Urbanização e Edificação',
      ],
    },
    department: 'Divisão de Urbanismo',
    forms: ['d-form-licenca-obra'],
    relatedServices: ['consultar-o-pdm', 'certidoes'],
  },
  {
    id: 's-pdm',
    slug: 'consultar-o-pdm',
    area: 'urbanismo',
    featured: true,
    icon: 'mapPin',
    title: {
      pt: 'Consultar o PDM',
      en: 'Check the local plan',
      es: 'Consultar el PDM',
      fr: 'Consulter le PLU',
    },
    summary: {
      pt: 'Veja como está classificado um terreno antes de comprar ou projetar.',
      en: 'See how a plot is classified before you buy or design.',
      es: 'Vea cómo está clasificado un terreno antes de comprar o proyectar.',
      fr: 'Vérifiez le classement d’une parcelle avant d’acheter ou de concevoir.',
    },
    lifeEvents: ['construir-ou-remodelar', 'abrir-negocio'],
    channels: ['online', 'presencial'],
    processingTime: { pt: 'Consulta imediata', en: 'Immediate' },
    fee: { pt: 'Gratuito', en: 'Free', es: 'Gratuito', fr: 'Gratuit' },
    audience: { pt: 'Aberto a todos', en: 'Open to everyone' },
    requiredDocuments: { pt: ['Nada. É uma consulta livre.'], en: ['Nothing. It is an open consultation.'] },
    steps: [
      {
        title: { pt: 'Abra a planta de ordenamento', en: 'Open the zoning map' },
        detail: {
          pt: 'Procure pela morada ou pelo artigo matricial.',
          en: 'Search by address or by tax reference.',
        },
      },
      {
        title: { pt: 'Leia o regulamento do PDM', en: 'Read the plan’s rules' },
        detail: {
          pt: 'Cada classe de espaço tem regras próprias de ocupação.',
          en: 'Each land class has its own occupancy rules.',
        },
      },
      {
        title: { pt: 'Em dúvida, peça informação prévia', en: 'If in doubt, ask for a preliminary opinion' },
        detail: {
          pt: 'É a forma segura de saber o que pode fazer antes de gastar em projeto.',
          en: 'The safe way to know what you may do before paying for a design.',
        },
      },
    ],
    department: 'Divisão de Urbanismo',
    relatedServices: ['licenca-de-construcao'],
  },
  {
    id: 's-marcar-atendimento',
    slug: 'marcar-atendimento',
    area: 'balcao',
    featured: true,
    icon: 'calendar',
    title: {
      pt: 'Marcar atendimento',
      en: 'Book an appointment',
      es: 'Reservar cita',
      fr: 'Prendre rendez-vous',
    },
    summary: {
      pt: 'Escolha o serviço, o dia e a hora. Chega e é atendido.',
      en: 'Pick the service, the day and the time. Arrive and be seen.',
      es: 'Elija el servicio, el día y la hora. Llega y le atienden.',
      fr: 'Choisissez le service, le jour et l’heure. Vous arrivez, on vous reçoit.',
    },
    lifeEvents: ['construir-ou-remodelar', 'mudar-de-casa', 'apoio-social', 'abrir-negocio'],
    channels: ['online', 'telefone'],
    onlineUrl: '/servicos/marcacoes',
    processingTime: { pt: 'Confirmação imediata', en: 'Confirmed immediately' },
    fee: { pt: 'Gratuito', en: 'Free', es: 'Gratuito', fr: 'Gratuit' },
    audience: { pt: 'Aberto a todos', en: 'Open to everyone' },
    requiredDocuments: {
      pt: ['Nome, telefone e email para a confirmação'],
      en: ['Name, phone and email for the confirmation'],
    },
    steps: [
      {
        title: { pt: 'Escolha o serviço', en: 'Choose the service' },
        detail: { pt: 'Cada serviço tem a sua duração típica.', en: 'Each service has its typical duration.' },
      },
      {
        title: { pt: 'Escolha dia e hora', en: 'Choose day and time' },
        detail: { pt: 'Só aparecem as horas realmente livres.', en: 'Only genuinely free slots are shown.' },
      },
      {
        title: { pt: 'Confirme', en: 'Confirm' },
        detail: {
          pt: 'Recebe a confirmação por email, com a lista do que trazer.',
          en: 'You get an email confirmation with the list of what to bring.',
        },
      },
    ],
    department: 'Atendimento ao Munícipe',
  },
  {
    id: 's-monstros',
    slug: 'recolha-de-monstros',
    area: 'agua-e-residuos',
    featured: true,
    icon: 'trash',
    title: {
      pt: 'Recolha de monstros',
      en: 'Bulky waste pickup',
      es: 'Recogida de voluminosos',
      fr: 'Collecte des encombrants',
    },
    summary: {
      pt: 'Móveis velhos, colchões, eletrodomésticos. Marcamos a recolha à porta.',
      en: 'Old furniture, mattresses, appliances. We collect from your door.',
      es: 'Muebles viejos, colchones, electrodomésticos. Recogemos en su puerta.',
      fr: 'Vieux meubles, matelas, électroménager. Nous collectons devant chez vous.',
    },
    lifeEvents: ['mudar-de-casa', 'ambiente'],
    channels: ['online', 'telefone'],
    onlineUrl: '/servicos/agua-e-residuos/monstros',
    processingTime: { pt: 'Recolha no prazo de 10 dias úteis', en: 'Collection within 10 working days' },
    fee: { pt: 'Gratuito, até 3 volumes por pedido', en: 'Free, up to 3 items per request' },
    audience: { pt: 'Residentes no concelho', en: 'Residents of the municipality' },
    requiredDocuments: {
      pt: ['Morada exata e descrição do que vai colocar na rua'],
      en: ['Exact address and a description of what will be left out'],
    },
    steps: [
      {
        title: { pt: 'Peça a recolha', en: 'Request the pickup' },
        detail: { pt: 'Online ou pelo telefone 279 468 120.', en: 'Online or by phone on 279 468 120.' },
      },
      {
        title: { pt: 'Coloque na rua na véspera', en: 'Put it out the evening before' },
        detail: {
          pt: 'Nunca antes: monstros na rua fora de data dão origem a coima.',
          en: 'Never earlier: items left out off-schedule are subject to a fine.',
        },
      },
    ],
    department: 'Divisão de Ambiente',
  },
  {
    id: 's-apoio-social',
    slug: 'apoio-social',
    area: 'acao-social',
    icon: 'heart',
    title: {
      pt: 'Pedir apoio social',
      en: 'Apply for social support',
      es: 'Solicitar ayuda social',
      fr: 'Demander une aide sociale',
    },
    summary: {
      pt: 'Apoio ao arrendamento, medicamentos, obras em casa e tarifário social da água.',
      en: 'Help with rent, medicines, home repairs and the social water tariff.',
      es: 'Ayuda al alquiler, medicamentos, obras en casa y tarifa social del agua.',
      fr: 'Aide au loyer, médicaments, travaux et tarif social de l’eau.',
    },
    lifeEvents: ['apoio-social'],
    channels: ['presencial', 'telefone'],
    processingTime: { pt: 'Decisão até 30 dias úteis', en: 'Decision within 30 working days' },
    fee: { pt: 'Gratuito', en: 'Free', es: 'Gratuito', fr: 'Gratuit' },
    audience: {
      pt: 'Agregados familiares com rendimento per capita abaixo do limiar definido no regulamento.',
      en: 'Households with per-capita income below the threshold set in the by-law.',
    },
    requiredDocuments: {
      pt: [
        'Cartão de cidadão de todos os membros do agregado',
        'Última declaração de IRS ou comprovativo de isenção',
        'Comprovativos de rendimento dos últimos três meses',
        'Recibo de renda ou prestação de crédito à habitação',
      ],
      en: [
        'Identity card for every member of the household',
        'Latest tax return or exemption certificate',
        'Proof of income for the last three months',
        'Rent receipt or mortgage statement',
      ],
    },
    steps: [
      {
        title: { pt: 'Fale connosco primeiro', en: 'Talk to us first' },
        detail: {
          pt: 'O atendimento social ajuda a perceber a que apoios tem direito.',
          en: 'The social services desk helps identify which support you qualify for.',
        },
      },
      {
        title: { pt: 'Entregue o processo', en: 'Submit the file' },
        detail: {
          pt: 'Presencialmente, com marcação. Há apoio no preenchimento.',
          en: 'In person, by appointment. Help with the forms is available.',
        },
      },
      {
        title: { pt: 'Aguarde a visita técnica', en: 'Wait for the assessment visit' },
        detail: {
          pt: 'A técnica de serviço social marca a visita por telefone.',
          en: 'The social worker arranges the visit by phone.',
        },
      },
    ],
    department: 'Divisão de Ação Social',
    forms: ['d-form-apoio-social'],
  },
  {
    id: 's-licenca-ruido',
    slug: 'licenca-especial-de-ruido',
    area: 'taxas-e-licencas',
    icon: 'megaphone',
    title: {
      pt: 'Licença especial de ruído',
      en: 'Special noise permit',
      es: 'Licencia especial de ruido',
      fr: 'Autorisation spéciale de bruit',
    },
    summary: {
      pt: 'Para festas, obras fora de horas ou espetáculos ao ar livre.',
      en: 'For parties, out-of-hours works or open-air events.',
      es: 'Para fiestas, obras fuera de horario o espectáculos al aire libre.',
      fr: 'Pour fêtes, travaux hors horaires ou spectacles en plein air.',
    },
    lifeEvents: ['abrir-negocio'],
    channels: ['online', 'presencial'],
    processingTime: { pt: 'Até 15 dias úteis. Peça com antecedência.', en: 'Up to 15 working days. Apply early.' },
    fee: { pt: '27,40 € por dia de licença', en: '€27.40 per licensed day' },
    audience: {
      pt: 'Promotores de eventos, empresas de construção, associações.',
      en: 'Event organisers, construction firms, associations.',
    },
    requiredDocuments: {
      pt: [
        'Requerimento com data, hora de início e de fim',
        'Planta de localização',
        'Autorização do proprietário do espaço, se aplicável',
      ],
      en: [
        'Application stating date, start and end time',
        'Location plan',
        'Landowner’s permission, where applicable',
      ],
    },
    steps: [
      {
        title: { pt: 'Peça com 15 dias de antecedência', en: 'Apply 15 days in advance' },
        detail: { pt: 'Pedidos em cima da hora podem não ser deferidos.', en: 'Last-minute requests may be refused.' },
      },
      {
        title: { pt: 'Pague a taxa', en: 'Pay the fee' },
        detail: { pt: 'A licença só é emitida depois do pagamento.', en: 'The permit is issued after payment.' },
      },
    ],
    department: 'Divisão Administrativa',
    forms: ['d-form-ruido'],
  },
  {
    id: 's-apoios-empresas',
    slug: 'apoios-a-empresas',
    area: 'economia',
    icon: 'briefcase',
    title: {
      pt: 'Apoios a quem cria emprego',
      en: 'Support for job creation',
      es: 'Ayudas a quien crea empleo',
      fr: 'Aides à la création d’emploi',
    },
    summary: {
      pt: 'Isenção de taxas, terreno na Zona Industrial e apoio ao investimento.',
      en: 'Fee exemptions, land on the industrial estate and investment support.',
      es: 'Exención de tasas, suelo en el polígono industrial y ayuda a la inversión.',
      fr: 'Exonérations, terrain en zone industrielle et soutien à l’investissement.',
    },
    lifeEvents: ['abrir-negocio'],
    channels: ['presencial', 'online'],
    processingTime: { pt: 'Decisão em reunião de Câmara, até 60 dias', en: 'Decided in Council meeting, within 60 days' },
    fee: { pt: 'Gratuito', en: 'Free', es: 'Gratuito', fr: 'Gratuit' },
    audience: {
      pt: 'Empresas que se instalem ou expandam no concelho e criem postos de trabalho.',
      en: 'Firms setting up or expanding locally and creating jobs.',
    },
    requiredDocuments: {
      pt: [
        'Memória descritiva do investimento',
        'Plano de negócios com previsão de postos de trabalho',
        'Certidão permanente da empresa',
        'Situação regularizada perante o Fisco e a Segurança Social',
      ],
      en: [
        'Description of the investment',
        'Business plan with expected job creation',
        'Company registration certificate',
        'Clear tax and social security status',
      ],
    },
    steps: [
      {
        title: { pt: 'Marque uma reunião', en: 'Arrange a meeting' },
        detail: {
          pt: 'O Gabinete de Apoio ao Empreendedor acompanha o processo de ponta a ponta.',
          en: 'The business support office follows the case from start to finish.',
        },
      },
      {
        title: { pt: 'Formalize a candidatura', en: 'Submit the application' },
        detail: { pt: 'Com o plano de negócios e a documentação legal.', en: 'With the business plan and legal papers.' },
      },
    ],
    department: 'Gabinete de Apoio ao Empreendedor',
  },
  {
    id: 's-transporte-escolar',
    slug: 'transporte-escolar',
    area: 'educacao',
    icon: 'bus',
    title: {
      pt: 'Transporte escolar',
      en: 'School transport',
      es: 'Transporte escolar',
      fr: 'Transport scolaire',
    },
    summary: {
      pt: 'Passe gratuito para alunos residentes a mais de 3 km da escola.',
      en: 'Free pass for pupils living more than 3 km from school.',
      es: 'Abono gratuito para alumnos que viven a más de 3 km del centro.',
      fr: 'Abonnement gratuit pour les élèves habitant à plus de 3 km.',
    },
    lifeEvents: ['estudar', 'ter-um-filho'],
    channels: ['presencial', 'online'],
    processingTime: { pt: 'Até 10 dias úteis', en: 'Up to 10 working days' },
    fee: { pt: 'Gratuito', en: 'Free', es: 'Gratuito', fr: 'Gratuit' },
    audience: {
      pt: 'Alunos do ensino básico e secundário residentes no concelho.',
      en: 'Primary and secondary pupils living in the municipality.',
    },
    requiredDocuments: {
      pt: ['Cartão de cidadão do aluno', 'Comprovativo de matrícula', 'Uma fotografia tipo passe'],
      en: ['Pupil’s identity card', 'Proof of enrolment', 'One passport-style photo'],
    },
    steps: [
      {
        title: { pt: 'Entregue o pedido até 31 de julho', en: 'Apply by 31 July' },
        detail: {
          pt: 'Pedidos posteriores são aceites, mas o passe pode não estar pronto no primeiro dia de aulas.',
          en: 'Later applications are accepted, but the pass may not be ready for the first day of term.',
        },
      },
      {
        title: { pt: 'Levante o passe em setembro', en: 'Collect the pass in September' },
        detail: { pt: 'Na secretaria do agrupamento de escolas.', en: 'At the school cluster office.' },
      },
    ],
    department: 'Divisão de Educação',
    forms: ['d-form-transporte-escolar'],
  },
  {
    id: 's-canil',
    slug: 'recolha-e-adocao-de-animais',
    area: 'saude',
    icon: 'heart',
    title: {
      pt: 'Animais errantes e adoção',
      en: 'Stray animals and adoption',
      es: 'Animales errantes y adopción',
      fr: 'Animaux errants et adoption',
    },
    summary: {
      pt: 'Comunicar um animal errante, adotar no canil municipal, registar o seu animal.',
      en: 'Report a stray, adopt from the municipal kennel, register your pet.',
      es: 'Comunicar un animal errante, adoptar en la perrera municipal, registrar su animal.',
      fr: 'Signaler un animal errant, adopter au chenil municipal, enregistrer votre animal.',
    },
    lifeEvents: ['animais'],
    channels: ['telefone', 'presencial', 'online'],
    processingTime: { pt: 'Recolha no próprio dia em caso de risco', en: 'Same-day pickup where there is a risk' },
    fee: { pt: 'Adoção gratuita, com vacinação e chip incluídos', en: 'Adoption free, vaccination and chip included' },
    audience: { pt: 'Aberto a todos', en: 'Open to everyone' },
    requiredDocuments: {
      pt: ['Para adoção: cartão de cidadão e comprovativo de morada'],
      en: ['For adoption: identity card and proof of address'],
    },
    steps: [
      {
        title: { pt: 'Comunique a ocorrência', en: 'Report it' },
        detail: {
          pt: 'Pelo telefone 279 468 120 ou pelo formulário de ocorrências.',
          en: 'By phone on 279 468 120 or through the report form.',
        },
      },
      {
        title: { pt: 'Visite o canil', en: 'Visit the kennel' },
        detail: { pt: 'Mediante marcação, de segunda a sexta.', en: 'By appointment, Monday to Friday.' },
      },
    ],
    department: 'Médico Veterinário Municipal',
  },
  {
    id: 's-ocupacao-via-publica',
    slug: 'ocupacao-da-via-publica',
    area: 'taxas-e-licencas',
    icon: 'mapPin',
    title: {
      pt: 'Ocupar a via pública',
      en: 'Occupy public space',
      es: 'Ocupar la vía pública',
      fr: 'Occuper la voie publique',
    },
    summary: {
      pt: 'Esplanadas, andaimes, contentores de obra ou bancas de venda.',
      en: 'Terraces, scaffolding, skips or market stalls.',
      es: 'Terrazas, andamios, contenedores de obra o puestos de venta.',
      fr: 'Terrasses, échafaudages, bennes de chantier ou étals.',
    },
    lifeEvents: ['abrir-negocio', 'construir-ou-remodelar'],
    channels: ['online', 'presencial'],
    processingTime: { pt: 'Até 20 dias úteis', en: 'Up to 20 working days' },
    fee: { pt: 'Calculada por m² e por dia. Ver tabela de taxas.', en: 'Calculated per m² per day. See the fee schedule.' },
    audience: { pt: 'Empresas e particulares', en: 'Businesses and individuals' },
    requiredDocuments: {
      pt: ['Requerimento', 'Planta com a área a ocupar', 'Fotografia do local'],
      en: ['Application', 'Plan of the area to occupy', 'Photo of the location'],
    },
    steps: [
      {
        title: { pt: 'Delimite a área', en: 'Define the area' },
        detail: { pt: 'A taxa é calculada ao metro quadrado.', en: 'The fee is per square metre.' },
      },
      {
        title: { pt: 'Garanta a passagem de peões', en: 'Keep the pavement passable' },
        detail: {
          pt: 'Tem de sobrar 1,20 m livres, sem degraus, para cadeiras de rodas e carrinhos de bebé.',
          en: 'A clear 1.20 m without steps must remain, for wheelchairs and prams.',
        },
      },
    ],
    department: 'Divisão Administrativa',
    forms: ['d-form-ocupacao-via'],
  },
  {
    id: 's-comunicar-leitura',
    slug: 'comunicar-leitura',
    area: 'agua-e-residuos',
    icon: 'droplet',
    title: {
      pt: 'Comunicar a leitura do contador',
      en: 'Submit a meter reading',
      es: 'Comunicar la lectura del contador',
      fr: 'Communiquer le relevé du compteur',
    },
    summary: {
      pt: 'Evita estimativas e acertos grandes na fatura seguinte.',
      en: 'Avoids estimates and big corrections on the next bill.',
      es: 'Evita estimaciones y grandes regularizaciones en la factura siguiente.',
      fr: 'Évite les estimations et les gros rattrapages sur la facture suivante.',
    },
    lifeEvents: ['mudar-de-casa'],
    channels: ['online', 'telefone'],
    processingTime: { pt: 'Registada de imediato', en: 'Recorded immediately' },
    fee: { pt: 'Gratuito', en: 'Free', es: 'Gratuito', fr: 'Gratuit' },
    audience: { pt: 'Titulares de contrato de água', en: 'Water account holders' },
    requiredDocuments: {
      pt: ['Número de cliente', 'Leitura atual, em metros cúbicos'],
      en: ['Customer number', 'Current reading, in cubic metres'],
    },
    steps: [
      {
        title: { pt: 'Leia o contador', en: 'Read the meter' },
        detail: {
          pt: 'Registe apenas os números pretos, sem as casas decimais a vermelho.',
          en: 'Record only the black digits, not the red decimals.',
        },
      },
      {
        title: { pt: 'Comunique até ao dia 25', en: 'Report by the 25th' },
        detail: {
          pt: 'Depois dessa data, a leitura entra na faturação do mês seguinte.',
          en: 'After that date, the reading goes on the following month’s bill.',
        },
      },
    ],
    department: 'Divisão de Águas e Saneamento',
  },
];

export function findService(slug: string): ServiceItem | undefined {
  return services.find((service) => service.slug === slug);
}

export const featuredServices = services.filter((service) => service.featured);
