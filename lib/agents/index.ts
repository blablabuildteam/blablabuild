/**
 * Agent System - Central export
 * Import and register all agents here
 */

export { agentRegistry, type Agent, type AgentContext, type AgentResponse, type AgentRole, type AgentTrigger } from './agent-registry';

// Core Agents
export { IntakeAnalystAgent } from './intake-analyst-agent';
export { IdeaGeneratorAgent } from './idea-generator-agent';
export { BusinessConsultantAgent } from './business-consultant-agent';
export { QuestionOptimizerAgent } from './question-optimizer-agent';
export { InsightSynthesizerAgent } from './insight-synthesizer-agent';

// Specialist Agents
export { UIUXSpecialistAgent } from './specialists/ui-ux-specialist-agent';
export { OperationalSpecialistAgent } from './specialists/operational-specialist-agent';
export { TaskSpecialistAgent } from './specialists/task-specialist-agent';
export { TechSpecialistAgent } from './specialists/tech-specialist-agent';
export { SMESpecialistAgent } from './specialists/sme-specialist-agent';

// Initialize all agents
import { agentRegistry } from './agent-registry';
import { IntakeAnalystAgent } from './intake-analyst-agent';
import { IdeaGeneratorAgent } from './idea-generator-agent';
import { BusinessConsultantAgent } from './business-consultant-agent';
import { QuestionOptimizerAgent } from './question-optimizer-agent';
import { InsightSynthesizerAgent } from './insight-synthesizer-agent';
import { UIUXSpecialistAgent } from './specialists/ui-ux-specialist-agent';
import { OperationalSpecialistAgent } from './specialists/operational-specialist-agent';
import { TaskSpecialistAgent } from './specialists/task-specialist-agent';
import { TechSpecialistAgent } from './specialists/tech-specialist-agent';
import { SMESpecialistAgent } from './specialists/sme-specialist-agent';

// Register all agents
export function initializeAgents() {
  // Core Agents
  agentRegistry.register(new IntakeAnalystAgent());
  agentRegistry.register(new IdeaGeneratorAgent());
  agentRegistry.register(new BusinessConsultantAgent());
  agentRegistry.register(new QuestionOptimizerAgent());
  agentRegistry.register(new InsightSynthesizerAgent());
  
  // Specialist Agents
  agentRegistry.register(new UIUXSpecialistAgent());
  agentRegistry.register(new OperationalSpecialistAgent());
  agentRegistry.register(new TaskSpecialistAgent());
  agentRegistry.register(new TechSpecialistAgent());
  agentRegistry.register(new SMESpecialistAgent());
  
  console.log('✅ Agents initialized:', agentRegistry.getAllAgents().map(a => a.name).join(', '));
}

// Auto-initialize on import
initializeAgents();

