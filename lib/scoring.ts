import { Slots } from './types';

export function scoreMaturity(slots: Partial<Slots>): {
  org: number;
  data: number;
  tech: number;
  ops: number;
} {
  // Organization maturity (0-5)
  let org = 2; // default mid-level
  if (slots.goal_long_term && slots.goal_short_term) org += 1;
  if (slots.pain_points && slots.pain_points.length >= 3) org += 0.5;
  if (slots.budget_band && ['25-75k', '75k+'].includes(slots.budget_band)) org += 0.5;

  // Data maturity (0-5)
  let data = 1;
  if (slots.data_integration === 'good') data = 4;
  else if (slots.data_integration === 'fair') data = 2.5;
  else if (slots.data_integration === 'poor') data = 1;
  
  if (slots.tools_analytics) data += 0.5;
  if (slots.score_data_analysis && slots.score_data_analysis >= 7) data += 1;
  else if (slots.score_data_analysis && slots.score_data_analysis <= 3) data -= 0.5;

  // Tech maturity (0-5)
  let tech = 1.5;
  const toolCount = [
    slots.tools_crm,
    slots.tools_marketing,
    slots.tools_analytics,
    slots.tools_cms,
    slots.tools_ads,
  ].filter(Boolean).length;
  tech += toolCount * 0.5;
  
  if (slots.stack && slots.stack.length > 0) tech += 1;

  // Operational maturity (0-5)
  let ops = 2;
  if (slots.score_lead_gen) {
    ops += (slots.score_lead_gen / 10) * 2;
  }
  if (slots.score_conversion) {
    ops += (slots.score_conversion / 10) * 1.5;
  }
  if (slots.manual_hours === '<5') ops += 1;
  else if (slots.manual_hours === '20+') ops -= 1;

  // Normalize to 0-5 range
  const normalize = (score: number) => Math.max(0, Math.min(5, score));

  return {
    org: normalize(org),
    data: normalize(data),
    tech: normalize(tech),
    ops: normalize(ops),
  };
}

export function calculateImpactScore(slots: Partial<Slots>): {
  revenue: number;
  efficiency: number;
  customer: number;
} {
  const scores = {
    revenue: 5,
    efficiency: 5,
    customer: 5,
  };

  // Revenue impact
  if (slots.primary_kpi === 'Revenue' || slots.primary_kpi === 'LeadGen') {
    scores.revenue = 8;
  }
  if (slots.score_lead_gen && slots.score_lead_gen <= 5) {
    scores.revenue += 2;
  }
  if (slots.score_conversion && slots.score_conversion <= 5) {
    scores.revenue += 2;
  }

  // Efficiency impact
  if (slots.manual_hours === '20+') {
    scores.efficiency = 10;
  } else if (slots.manual_hours === '10-20') {
    scores.efficiency = 8;
  } else if (slots.manual_hours === '5-10') {
    scores.efficiency = 6;
  }

  // Customer impact
  if (slots.primary_kpi === 'CSAT' || slots.primary_kpi === 'Churn') {
    scores.customer = 9;
  }
  if (slots.score_communication && slots.score_communication <= 5) {
    scores.customer += 2;
  }

  return {
    revenue: Math.min(10, scores.revenue),
    efficiency: Math.min(10, scores.efficiency),
    customer: Math.min(10, scores.customer),
  };
}

