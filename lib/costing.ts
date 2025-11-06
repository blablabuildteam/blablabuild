import { Slots, Idea } from './types';

// Component cost database (in hours)
const COMPONENT_COSTS = {
  'LLM': { lo: 24, hi: 60, description: 'LLM integration & orchestration' },
  'RAG': { lo: 24, hi: 48, description: 'RAG setup with vector database' },
  'ETL': { lo: 16, hi: 40, description: 'ETL pipeline per data source' },
  'CRM Integration': { lo: 16, hi: 32, description: 'CRM integration (HubSpot/Salesforce)' },
  'API Integrations': { lo: 24, hi: 48, description: 'Multiple API integrations' },
  'Dashboard': { lo: 40, hi: 80, description: 'Custom analytics dashboard' },
  'BI Dashboard': { lo: 40, hi: 80, description: 'BI dashboard with reporting' },
  'Chat Widget': { lo: 40, hi: 80, description: 'Custom chat widget' },
  'Webhook': { lo: 8, hi: 16, description: 'Webhook integrations' },
  'ML Model': { lo: 60, hi: 120, description: 'Custom ML model development' },
  'Data Warehouse': { lo: 40, hi: 80, description: 'Data warehouse setup' },
  'Content Pipeline': { lo: 32, hi: 64, description: 'Automated content pipeline' },
  'CMS Integration': { lo: 16, hi: 32, description: 'CMS integration' },
  'Marketing Automation': { lo: 24, hi: 48, description: 'Marketing automation setup' },
  'Segmentation': { lo: 16, hi: 32, description: 'Customer segmentation' },
  'A/B Testing': { lo: 16, hi: 32, description: 'A/B testing framework' },
  'Analytics': { lo: 16, hi: 32, description: 'Analytics & tracking' },
  'Scheduling': { lo: 8, hi: 16, description: 'Scheduling & automation' },
  'Prediction API': { lo: 32, hi: 64, description: 'Prediction API development' },
  'Knowledge Base': { lo: 16, hi: 40, description: 'Knowledge base setup' },
  'CRM Data': { lo: 16, hi: 32, description: 'CRM data integration' },
};

// Hourly rate (in EUR)
const HOURLY_RATE = 125;

// Complexity multipliers
const COMPLEXITY_FACTORS = {
  low: 0.8,
  medium: 1.0,
  high: 1.3,
  'very high': 1.5,
};

// Maturity adjustments
function getMaturityFactor(maturity?: { org: number; data: number; tech: number; ops: number }): number {
  if (!maturity) return 1.0;
  
  const avgMaturity = (maturity.org + maturity.data + maturity.tech + maturity.ops) / 4;
  
  // Lower maturity = higher implementation cost (more hand-holding needed)
  if (avgMaturity < 2) return 1.3;
  if (avgMaturity < 3) return 1.15;
  if (avgMaturity > 4) return 0.9; // Mature orgs are easier to work with
  return 1.0;
}

export async function estimateCosts(
  idea: Partial<Idea>,
  slots: Partial<Slots>
): Promise<{
  cost_lo: number;
  cost_hi: number;
  cost_assumptions: string;
  confidence: number;
}> {
  if (!idea.stack || idea.stack.length === 0) {
    return {
      cost_lo: 5000,
      cost_hi: 15000,
      cost_assumptions: 'Schatting gebaseerd op gemiddeld project',
      confidence: 0.5,
    };
  }

  // Calculate base hours
  let hoursLo = 0;
  let hoursHi = 0;
  const components: string[] = [];

  for (const component of idea.stack) {
    const cost = COMPONENT_COSTS[component as keyof typeof COMPONENT_COSTS];
    if (cost) {
      hoursLo += cost.lo;
      hoursHi += cost.hi;
      components.push(`${component}: ${cost.lo}-${cost.hi}h`);
    }
  }

  // Add project management & testing (20%)
  hoursLo *= 1.2;
  hoursHi *= 1.2;

  // Apply complexity factor
  const complexityKey = (idea.impact?.toLowerCase() || 'medium') as keyof typeof COMPLEXITY_FACTORS;
  const complexityFactor = COMPLEXITY_FACTORS[complexityKey] || 1.0;
  hoursLo *= complexityFactor;
  hoursHi *= complexityFactor;

  // Apply maturity factor
  const maturityFactor = getMaturityFactor(slots.maturity);
  hoursLo *= maturityFactor;
  hoursHi *= maturityFactor;

  // Apply effort multiplier
  const effortMultipliers = {
    'S': 0.7,
    'M': 1.0,
    'L': 1.4,
    'XL': 2.0,
  };
  const effortMultiplier = effortMultipliers[idea.effort as keyof typeof effortMultipliers] || 1.0;
  hoursLo *= effortMultiplier;
  hoursHi *= effortMultiplier;

  // Convert to EUR
  const costLo = Math.round(hoursLo * HOURLY_RATE / 1000) * 1000; // Round to nearest 1000
  const costHi = Math.round(hoursHi * HOURLY_RATE / 1000) * 1000;

  // Generate assumptions text
  const assumptions = [
    `Componenten: ${components.join(', ')}`,
    `Complexiteit: ${idea.impact || 'Medium'}`,
    `Effort: ${idea.effort || 'M'}`,
    maturityFactor !== 1.0 ? `Maturiteit correctie: ${maturityFactor > 1 ? '+' : ''}${Math.round((maturityFactor - 1) * 100)}%` : null,
    `Inclusief: PM, testing, documentatie`,
    `Uurtarief: €${HOURLY_RATE}`,
  ].filter(Boolean).join(' | ');

  // Confidence based on data quality
  const dataQuality = Object.keys(slots).length / 15; // Assuming ~15 relevant slots
  const confidence = Math.min(0.9, Math.max(0.6, dataQuality * 0.8 + 0.2));

  return {
    cost_lo: costLo,
    cost_hi: costHi,
    cost_assumptions: assumptions,
    confidence: Math.round(confidence * 100) / 100,
  };
}

// T-shirt size based on total cost
export function getTShirtSize(costLo: number, costHi: number): 'S' | 'M' | 'L' | 'XL' {
  const avgCost = (costLo + costHi) / 2;
  
  if (avgCost < 10000) return 'S';
  if (avgCost < 25000) return 'M';
  if (avgCost < 50000) return 'L';
  return 'XL';
}

