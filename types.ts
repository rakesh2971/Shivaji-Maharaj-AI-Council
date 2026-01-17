export enum AgentRole {
  PESHWA = 'Peshwa',
  AMATYA = 'Amatya',
  SACHIV = 'Sachiv',
  SENAPATI = 'Senapati',
  MANTRI = 'Mantri',
  SUMANT = 'Sumant',
  PANDITRAO = 'Panditrao',
  NYAYADHISH = 'Nyayadhish',
}

export interface AgentProfile {
  id: AgentRole;
  name: string;
  title: string;
  modernRole: string; // e.g. "CFO"
  optimizationFunction: string; // The "Bias"
  keyQuestion: string; 
  description: string;
  icon: string; // Lucide icon name
  color: string; // Tailwind color class stub
}

export interface AgentResponse {
  role: AgentRole;
  summary: string;
  reasoning: string[];
  recommendation: string;
  confidence: number; // 0-100
  keyConcerns?: string[];
}

export interface HistoryItem {
  query: string;
  ministerResponses: Record<string, AgentResponse>;
  finalVerdict?: AgentResponse;
}

export interface SimulationStep {
  id: number;
  phase: 'Retrieval' | 'Router' | 'Deliberation' | 'Critique' | 'Synthesis' | 'Complete';
  activeAgents: AgentRole[];
  status: 'pending' | 'loading' | 'completed';
  logs: string[];
}

export interface SimulationState {
  isSimulating: boolean;
  currentPhase: SimulationStep['phase'];
  query: string;
  retrievedContext: string[]; // RAG snippets
  ministerResponses: Record<string, AgentResponse>;
  critique?: AgentResponse;
  finalVerdict?: AgentResponse;
  steps: SimulationStep[];
  error?: string;
}

export interface RAGDocument {
  id: string;
  source: string;
  content: string;
  tags: string[];
}