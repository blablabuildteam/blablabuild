export type CaseTag = 'marketing' | 'tooling' | 'data';

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
}

export const TAG_LABEL: Record<CaseTag, { nl: string; en: string }> = {
  marketing: { nl: 'Marketing', en: 'Marketing' },
  tooling: { nl: 'Tooling', en: 'Tooling' },
  data: { nl: 'Data', en: 'Data' },
};

export const CASE_STUDIES: CaseStudy[] = [
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
    tags: ['data', 'tooling'],
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
  {
    id: 'stijl',
    client: 'Stijl Herenmode',
    logo: '/logos/client-2.svg',
    image: '/case_images/stijl1.png',
    detailImage: '/case_images/stijl2.png',
    tags: ['tooling'],
    metric: { value: '↓ fees', label: { nl: 'lagere kosten', en: 'lower fees' } },
    title: {
      nl: 'Custom POS — buiten Shopify om.',
      en: 'Custom POS — outside Shopify.',
    },
    intro: {
      nl: 'Mollie terminals direct geïntegreerd voor in-store betalingen, retouren en ruilingen.',
      en: 'Mollie terminals integrated directly for in-store payments, refunds and exchanges.',
    },
    context: {
      nl: 'Retailer met fysieke winkels en e-commerce, afhankelijk van Shopify voor dagelijkse transacties.',
      en: 'Retailer with physical stores and e-commerce, dependent on Shopify for daily transactions.',
    },
    problem: {
      nl: 'Shopify\'s standaard setup blokkeerde Mollie-integraties en forceerde dure platformkosten.',
      en: 'Shopify\'s default setup blocked Mollie integrations and forced costly platform fees.',
    },
    result: {
      nl: 'Custom POS met Mollie terminals, transacties terug-gesynchroniseerd voor rapportage en reconciliatie.',
      en: 'Custom POS with Mollie terminals, transactions synced back for reporting and reconciliation.',
    },
    metrics: [
      { value: '↓ fees', label: { nl: 'lagere kosten', en: 'lower fees' } },
      { value: '100%', label: { nl: 'controle', en: 'control' } },
      { value: '↑ flow', label: { nl: 'in-store snelheid', en: 'in-store speed' } },
    ],
  },
];

export const HOME_FEATURED_CASE_IDS = ['adsomnia', 'comfortzzzone', 'stijl'] as const;

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
