export type CaseTag = 'marketing' | 'tooling' | 'data' | 'ai-strategy' | 'ai-tools';

export interface CaseStudy {
  id: string;
  client: string;
  logo: string;
  logoInvert?: boolean;
  image?: string;
  detailImage?: string;
  tags: CaseTag[];
  metric: { value: string; label: { nl: string; en: string } };
  title: { nl: string; en: string };
  intro: { nl: string; en: string };
  context: { nl: string; en: string };
  problem: { nl: string; en: string };
  result: { nl: string; en: string };
  metrics: { value: string; label: { nl: string; en: string } }[];
  detailCaption?: { nl: string; en: string };
}

export const TAG_LABEL: Record<CaseTag, { nl: string; en: string }> = {
  marketing: { nl: 'Marketing', en: 'Marketing' },
  tooling: { nl: 'Tooling', en: 'Tooling' },
  data: { nl: 'Data', en: 'Data' },
  'ai-strategy': { nl: 'AI Strategie', en: 'AI Strategy' },
  'ai-tools': { nl: 'AI Tools', en: 'AI Tools' },
};

export const CASE_STUDIES: CaseStudy[] = [
  {
    id: 'adsomnia-transformation',
    client: 'Adsomnia',
    logo: '/logos/Adsomnia.svg',
    image: '/case_images/adsomnia-transformation.jpg',
    detailImage: '/case_images/adsomnia-transformation.jpg',
    tags: ['ai-strategy', 'ai-tools'],
    metric: { value: 'All teams', label: { nl: 'op Claude', en: 'on Claude' } },
    title: {
      nl: 'Elk team op Claude. Eén roadmap uit hun eigen werk.',
      en: 'Every team on Claude. One roadmap from their own work.',
    },
    intro: {
      nl: 'Enablement zodat iedereen Claude in het eigen werk gebruikt, en een inspiratiesessie die pijnpunten per afdeling omzette in de roadmap die we nu op retainer bouwen.',
      en: 'Enablement so everyone can use Claude in their own work, and an inspiration session that turned each department’s pain points into the roadmap we now build on retainer.',
    },
    context: {
      nl: 'Adsomnia draait performance-desks voor media buying, affiliate, e-mail, finance, HR en pricing. De modellen stonden al in huis. Het dagelijkse werk leunde op handmatig trekken, en Claude zat bij de mensen die er zelf mee waren begonnen.',
      en: 'Adsomnia runs performance desks across media buying, affiliate, email, finance, HR and pricing. The models were already in the building. Day-to-day work still leaned on manual pulls, and Claude sat with the people who had started on their own.',
    },
    problem: {
      nl: 'Het moest tegelijk: iedereen vaardig genoeg om Claude in het eigen werk te gebruiken, en één volgorde van pijnpunten en kansen per afdeling.',
      en: 'Both had to move together: every person fluent enough to use Claude in their own job, and one sequence of pain points and opportunities per department.',
    },
    result: {
      nl: 'We hebben het als één transformatie gedraaid. Een on-site showcase nam elk team mee van copilot via analyst en agent naar ecosystem. Daarna bouwde elk team twee weken aan een eigen Claude-case en presenteerde dat huiswerk terug aan het bedrijf. Dezelfde sessie opende de discovery: afdelingen legden use cases op tafel, zagen ze landen op een impact/effort-matrix en pitchten wat bleef. Die zaal werd een geprioriteerde AI-roadmap. Een retainer draagt nu beide sporen — enablement tot de teams het zelf dragen, en productiesupport op de projecten die zij kozen.',
      en: 'We ran it as one transformation. An on-site showcase walked every team from copilot through analyst and agent to ecosystem. Each team then spent two weeks building its own Claude case and presented that homework back to the company. The same session opened discovery: departments put use cases on the table, watched them land on an impact/effort matrix, and pitched what to keep. That room became a prioritised AI roadmap. A retainer now carries both tracks — enablement until the teams own it, and production support on the projects they chose.',
    },
    metrics: [
      { value: 'All', label: { nl: 'teams op Claude', en: 'teams on Claude' } },
      { value: '2 wks', label: { nl: 'bouwen en presenteren', en: 'build and present-back' } },
      { value: 'Live', label: { nl: 'roadmap op retainer', en: 'roadmap on retainer' } },
    ],
    detailCaption: {
      nl: 'Presentatie terug op kantoor: teams laten de Claude-cases zien die ze zelf bouwden.',
      en: 'Present-back in the office: teams showing the Claude cases they built.',
    },
  },
  {
    id: 'thuishaven',
    client: 'Thuishaven',
    logo: '/logos/thuishaven.png',
    tags: ['ai-tools'],
    metric: { value: 'Live', label: { nl: 'tools voor het team', en: 'tools for the team' } },
    title: {
      nl: 'Verkoop, verhuur en de crew in eigen tools.',
      en: 'Sales, hire and the crew in their own tools.',
    },
    intro: {
      nl: 'Een hub voor kaartverkoop en marketing, outreach naar bedrijven in hun eigen stem, en een aparte digitale dienstregistratie voor de crew.',
      en: 'A hub for ticket sales and marketing, outreach to companies in their own voice, and a separate digital shift registration for the crew.',
    },
    context: {
      nl: 'Thuishaven programmeert edities, verhuurt het terrein aan bedrijven en draait avonden met een grote flexibele crew. Cijfers, leads en personeelsformulieren zaten verspreid over systemen en papier.',
      en: 'Thuishaven programmes editions, hires the site out to companies and runs nights with a large flexible crew. Numbers, leads and staff forms were spread across systems and paper.',
    },
    problem: {
      nl: 'Ticketverkoop, advertenties en mail vormden geen enkel beeld. Bedrijfsmails werden met de hand geschreven. HR typte elk papieren formulier over voor de loonadministratie.',
      en: 'Ticket sales, ads and mail were not one picture. Corporate mail was written by hand. HR retyped every paper form for payroll.',
    },
    result: {
      nl: 'We bouwden een hub met twee tools. Het dashboard legt kaartverkoop, paid en e-mail naast elkaar, en het team stelt er vragen over de eigen cijfers in gewone taal. Outreach zoekt bedrijven, schrijft de mail in de stem van Thuishaven en houdt reacties bij. Los daarvan staat de dienstregistratie: de crew vult op de telefoon in, tekent digitaal, en HR krijgt een PDF plus een seintje wanneer iemand aan een contract toe is.',
      en: 'We built a hub with two tools. The dashboard puts ticket sales, paid and email side by side, and the team asks questions about their own numbers in plain language. Outreach finds companies, writes the mail in Thuishaven’s voice and keeps track of replies. Shift registration sits apart from that: the crew fills it in on a phone, signs digitally, and HR gets a PDF plus a signal when someone is due a contract.',
    },
    metrics: [
      { value: '2', label: { nl: 'tools in één hub', en: 'tools in one hub' } },
      { value: 'Chat', label: { nl: 'op live cijfers', en: 'on live numbers' } },
      { value: 'Crew', label: { nl: 'van papier naar telefoon', en: 'from paper to phone' } },
    ],
  },
  {
    id: 'spol',
    client: 'SPØL',
    logo: '/logos/spol-compact.svg',
    logoInvert: false,
    tags: ['marketing'],
    metric: { value: '360°', label: { nl: 'marketing stack', en: 'marketing stack' } },
    title: {
      nl: 'Het hele pakket — van website tot ads.',
      en: 'The full stack — from website to ads.',
    },
    intro: {
      nl: 'Website, techniek, SEO, Google Ads en Meta Ads onder één dak — één team, één lijn.',
      en: 'Website, tech, SEO, Google Ads and Meta Ads under one roof — one team, one line.',
    },
    context: {
      nl: 'SPØL wilde online groeien zonder vijf verschillende bureaus te coördineren.',
      en: 'SPØL wanted to grow online without coordinating five different agencies.',
    },
    problem: {
      nl: 'Website, SEO en paid channels liepen los van elkaar — traag schakelen, dubbel werk, geen helder overzicht.',
      en: 'Website, SEO and paid channels ran separately — slow handoffs, duplicate work, no clear overview.',
    },
    result: {
      nl: 'We namen het hele pakket: technische basis, vindbaarheid, campagnes en optimalisatie — alles op elkaar afgestemd.',
      en: 'We took on the full package: technical foundation, discoverability, campaigns and optimisation — all aligned.',
    },
    metrics: [
      { value: '360°', label: { nl: 'marketing stack', en: 'marketing stack' } },
      { value: '1', label: { nl: 'team', en: 'team' } },
      { value: 'SEO+', label: { nl: 'Google & Meta', en: 'Google & Meta' } },
    ],
  },
  {
    id: 'heatnest',
    client: 'Heatnest',
    logo: '/logos/vector-3.svg',
    tags: ['marketing'],
    metric: { value: 'D2C', label: { nl: 'premium shop', en: 'premium shop' } },
    title: {
      nl: 'Premium merk, premium webshop.',
      en: 'Premium brand, premium storefront.',
    },
    intro: {
      nl: 'Design radiatoren online verkopen — met een shop die past bij het product én converteert.',
      en: 'Selling design radiators online — with a shop that matches the product and converts.',
    },
    context: {
      nl: 'Heatnest bouwt premium aluminium design radiatoren — direct aan consument en projectmarkt.',
      en: 'Heatnest builds premium aluminium design radiators — direct to consumer and project market.',
    },
    problem: {
      nl: 'Een premium product vraagt om een online ervaring die vertrouwen wekt — en custom configurator-logica die niet hapert.',
      en: 'A premium product needs an online experience that builds trust — and configurator logic that doesn\'t break.',
    },
    result: {
      nl: 'Webshop en merkbeleving op één lijn: snelle pages, duidelijke productreis en technische basis die meegroeit.',
      en: 'Storefront and brand experience aligned: fast pages, clear product journey and a technical base that scales.',
    },
    metrics: [
      { value: 'D2C', label: { nl: 'webshop', en: 'storefront' } },
      { value: 'Custom', label: { nl: 'configurator', en: 'configurator' } },
      { value: 'Premium', label: { nl: 'brand UX', en: 'brand UX' } },
    ],
  },
  {
    id: 'adsomnia',
    client: 'Adsomnia',
    logo: '/logos/Adsomnia.svg',
    image: '/case_images/adsomnia1.png',
    detailImage: '/case_images/adsomnia2.png',
    tags: ['ai-tools'],
    metric: { value: '>50%', label: { nl: 'snellere insights', en: 'faster insights' } },
    title: {
      nl: 'Talk-to-Data agent voor Everflow.',
      en: 'A talk-to-data agent for Everflow.',
    },
    intro: {
      nl: 'Een LLM-agent die natuurlijke taal omzet in Everflow-acties en risico\'s automatisch flagt.',
      en: 'An LLM agent that turns natural language into Everflow actions and flags risks automatically.',
    },
    context: {
      nl: 'Affiliate managers en performance analisten in Everflow, verantwoordelijk voor zowel optimalisatie als incidentrespons.',
      en: 'Affiliate managers and performance analysts in Everflow, responsible for both optimization and incident response.',
    },
    problem: {
      nl: 'Handmatige rapportage was traag, repetitief en reactief — kritieke issues werden te laat gezien.',
      en: 'Manual reporting was slow, repetitive and reactive — critical issues were caught too late.',
    },
    result: {
      nl: 'Real-time API workflow met geheugen, met geplande alerts voor LP-fallback traffic en partner conversie drops.',
      en: 'Real-time API workflow with memory, plus scheduled alerts for LP-fallback traffic and partner conversion drops.',
    },
    metrics: [
      { value: '>50%', label: { nl: 'snellere insights', en: 'faster insights' } },
      { value: '24/7', label: { nl: 'monitoring', en: 'monitoring' } },
      { value: 'same-day', label: { nl: 'triage', en: 'triage' } },
    ],
  },
  {
    id: 'comfortzzzone',
    client: 'ComfortzzZone',
    logo: '/logos/confortzzzone.svg',
    image: '/case_images/comfortzzzone1.png',
    detailImage: '/case_images/comfortzzzone2.png',
    tags: ['marketing'],
    metric: { value: 'CWV ↑', label: { nl: 'core web vitals', en: 'core web vitals' } },
    title: {
      nl: 'Headless commerce, premium UX.',
      en: 'Headless commerce, premium UX.',
    },
    intro: {
      nl: 'Next.js + Shopify storefront met sterkere SEO, sneller laden en duidelijker conversie-pad.',
      en: 'Next.js + Shopify storefront with stronger SEO, faster loads and a clearer conversion path.',
    },
    context: {
      nl: 'Premium beddengoed-merk dat moderniseert voor snelheid, schaalbaarheid en mobiele conversie.',
      en: 'Premium bedding brand modernizing for speed, scale and mobile conversion.',
    },
    problem: {
      nl: 'Legacy setup remde performance, iteratie en bracht SEO/CRO risico bij migratie.',
      en: 'Legacy setup limited performance, slowed iteration and risked SEO/CRO during migration.',
    },
    result: {
      nl: 'Modulaire architectuur, herbruikbare typed components, SEO-veilige migratie met content parity.',
      en: 'Modular architecture, reusable typed components, SEO-safe migration with content parity.',
    },
    metrics: [
      { value: 'CWV ↑', label: { nl: 'core web vitals', en: 'core web vitals' } },
      { value: '0', label: { nl: 'ranking-regressies', en: 'ranking regressions' } },
      { value: '↑', label: { nl: 'mobiele conversie', en: 'mobile conversion' } },
    ],
  },
];

export const HOME_FEATURED_CASE_IDS = ['adsomnia-transformation', 'comfortzzzone', 'adsomnia'] as const;

export function getFeaturedCaseStudies(): CaseStudy[] {
  return HOME_FEATURED_CASE_IDS.map(
    (id) => CASE_STUDIES.find((c) => c.id === id)!,
  ).filter(Boolean);
}

export const CLIENT_LOGOS: {
  src: string;
  alt: string;
  height?: number;
  invert?: boolean;
}[] = [
  { src: '/logos/vector-3.svg', alt: 'Heatnest' },
  { src: '/logos/thuishaven.png', alt: 'Thuishaven', height: 62 },
  { src: '/logos/Adsomnia.svg', alt: 'Adsomnia', height: 22 },
  { src: '/logos/confortzzzone.svg', alt: 'ComfortzzZone' },
  { src: '/logos/client-2.svg', alt: 'Stijl' },
  { src: '/logos/655solero.svg', alt: '655Solero', height: 40 },
  { src: '/logos/client-1.svg', alt: 'Client' },
  { src: '/logos/FM_Group.png', alt: 'FM Group', height: 40 },
];
