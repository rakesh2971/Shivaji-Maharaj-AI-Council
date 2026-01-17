import { AgentProfile, AgentRole, HistoryItem } from './types';

export const AGENTS: Record<AgentRole, AgentProfile> = {
  [AgentRole.PESHWA]: {
    id: AgentRole.PESHWA,
    name: 'Peshwa (Prime Minister)',
    title: 'Head of Council',
    modernRole: 'Orchestrator & Judge',
    optimizationFunction: 'Balance (Maximize Utility, Minimize Risk)',
    keyQuestion: 'Considering all perspectives, what is the wisest path?',
    description: 'Synthesizes all inputs to form the final executive order.',
    icon: 'Crown',
    color: 'yellow'
  },
  [AgentRole.AMATYA]: {
    id: AgentRole.AMATYA,
    name: 'Amatya (Finance)',
    title: 'Finance Minister',
    modernRole: 'CFO / Resource Manager',
    optimizationFunction: 'Cost Efficiency (Minimize Expense, Maximize ROI)',
    keyQuestion: 'Do we have the budget? Is this profitable?',
    description: 'Analyzes economic impact, treasury costs, and revenue sustainability.',
    icon: 'Coins',
    color: 'emerald'
  },
  [AgentRole.SACHIV]: {
    id: AgentRole.SACHIV,
    name: 'Sachiv (Administration)',
    title: 'Secretary',
    modernRole: 'Process & QA',
    optimizationFunction: 'Clarity & Order (Documented, Structured, Error-free)',
    keyQuestion: 'Is the plan detailed enough? Are there loose ends?',
    description: 'Focuses on bureaucratic execution, royal correspondence, and land records.',
    icon: 'Scroll',
    color: 'blue'
  },
  [AgentRole.SENAPATI]: {
    id: AgentRole.SENAPATI,
    name: 'Senapati (Defense)',
    title: 'Commander-in-Chief',
    modernRole: 'COO / Operations',
    optimizationFunction: 'Feasibility & Speed (Maximize execution, Minimize friction)',
    keyQuestion: 'How do we execute this? What are the operational blocks?',
    description: 'Evaluates military readiness, strategic risks, and troop logistics.',
    icon: 'Sword',
    color: 'red'
  },
  [AgentRole.MANTRI]: {
    id: AgentRole.MANTRI,
    name: 'Mantri (Internal Affairs)',
    title: 'Home Minister',
    modernRole: 'Data Analyst / Archivist',
    optimizationFunction: 'Historical Precedent (Pattern Matching)',
    keyQuestion: 'Have we tried this before? What does the data say?',
    description: 'Monitors intelligence, public order, and internal threats.',
    icon: 'Eye',
    color: 'violet'
  },
  [AgentRole.SUMANT]: {
    id: AgentRole.SUMANT,
    name: 'Sumant (Foreign Affairs)',
    title: 'Foreign Minister',
    modernRole: 'Market/External Analyst',
    optimizationFunction: 'External Perception (Brand Image, Market Fit)',
    keyQuestion: 'What will the world/competitors think? Is the market ready?',
    description: 'Manages relations with Mughals, foreign traders, and neighboring kingdoms.',
    icon: 'Globe',
    color: 'cyan'
  },
  [AgentRole.PANDITRAO]: {
    id: AgentRole.PANDITRAO,
    name: 'Panditrao (Religious)',
    title: 'High Priest',
    modernRole: 'HR / Ethics / Culture',
    optimizationFunction: 'Human Impact (Morale, Mental Health, Alignment)',
    keyQuestion: 'How does this affect the people\'s happiness?',
    description: 'Oversees religious grants, charities, and moral conduct of the state.',
    icon: 'BookOpen',
    color: 'rose'
  },
  [AgentRole.NYAYADHISH]: {
    id: AgentRole.NYAYADHISH,
    name: 'Nyayadhish (Justice)',
    title: 'Chief Justice',
    modernRole: 'Legal & Compliance',
    optimizationFunction: 'Risk Mitigation (Liability & Ethical Compliance)',
    keyQuestion: 'Is this legal? Is it fair? Are there hidden clauses?',
    description: 'Critiques decisions based on law, ethics, and historical precedent.',
    icon: 'Scale',
    color: 'orange'
  }
};

export const SYSTEM_INSTRUCTION_BASE = `
You are a simulation of a 17th-century Maratha Empire minister in the Ashta Pradhan Council.
Your tone should be formal, archaic, yet sharp and strategic.
Do not use flowery language without substance. Be direct.
Your output MUST be valid JSON.
`;

const formatHistory = (history: HistoryItem[], role?: AgentRole) => {
  if (history.length === 0) return "No previous session history.";
  
  return history.map((h, i) => {
    let advice = "";
    if (role && h.ministerResponses[role]) {
      advice = `YOU (${role}) said: "${h.ministerResponses[role].summary}"`;
    } else if (!role && h.finalVerdict) {
      advice = `Peshwa Decree: "${h.finalVerdict.summary}"`;
    }
    return `[Turn ${i + 1}] User Query: "${h.query}"\n${advice}`;
  }).join('\n\n');
};

export const getRouterPrompt = (query: string, history: HistoryItem[]) => `
ROLE: Peshwa (The Router / Darbar Host)

SESSION HISTORY:
${formatHistory(history)}

CURRENT QUERY: "${query}"

AVAILABLE MINISTERS:
- Amatya (Finance/ROI)
- Senapati (Defense/Ops)
- Sachiv (Admin/QA)
- Mantri (History/Data)
- Sumant (Foreign/Market)
- Panditrao (Culture/HR)

TASK:
Select the 2 to 4 most relevant ministers to deliberate on this query.
Do not select ministers whose domain is irrelevant.

OUTPUT SCHEMA (JSON only):
{
  "selected_agents": ["AgentRole", "AgentRole"],
  "reasoning": "Why these specific agents were chosen"
}
`;

export const getMinisterPrompt = (role: AgentRole, query: string, context: string[], history: HistoryItem[]) => `
ROLE: ${AGENTS[role].name}
MODERN EQUIVALENT: ${AGENTS[role].modernRole}
OPTIMIZATION FUNCTION (BIAS): ${AGENTS[role].optimizationFunction}
KEY QUESTION: ${AGENTS[role].keyQuestion}

PREVIOUS STANCE (MEMORY):
${formatHistory(history, role)}

CONTEXT (RAG Data):
${context.join('\n')}

CURRENT QUERY: "${query}"

TASK:
Analyze the query STRICTLY through your "Optimization Function".
If you are Amatya, only care about money. If Senapati, only care about speed/ops.
Maintain consistency with your previous advice if applicable.
Identify specific risks and benefits relevant to YOUR domain.

OUTPUT SCHEMA (JSON only):
{
  "role": "${role}",
  "summary": "1-2 sentence executive summary",
  "reasoning": ["point 1", "point 2", "point 3"],
  "recommendation": "Direct course of action",
  "confidence": number (0-100),
  "keyConcerns": ["risk 1", "risk 2"]
}
`;

export const getCritiquePrompt = (query: string, ministerResponses: any[], history: HistoryItem[]) => `
ROLE: Nyayadhish (Chief Justice / Compliance)
OPTIMIZATION FUNCTION: Risk Mitigation & Ethical Compliance

SESSION HISTORY:
${formatHistory(history)}

CURRENT QUERY: "${query}"

MINISTER DELIBERATIONS:
${JSON.stringify(ministerResponses, null, 2)}

TASK:
Act as the "Cross-Examiner".
1. Identify CONFLICTS between ministers (e.g., Amatya wants to save money, Senapati wants to spend).
2. Flag ethical/legal violations.
3. Answer: "Is this legal? Is it fair?"

OUTPUT SCHEMA (JSON only):
{
  "role": "${AgentRole.NYAYADHISH}",
  "summary": "Legal & Ethical Review",
  "reasoning": ["Conflict identified: X vs Y", "Legal concern: Z"],
  "recommendation": "Proceed with caution OR Veto",
  "confidence": number,
  "keyConcerns": ["major contradiction", "ethical flaw"]
}
`;

export const getPeshwaPrompt = (query: string, ministerResponses: any[], critique: any, history: HistoryItem[]) => `
ROLE: Peshwa (Prime Minister)
OPTIMIZATION FUNCTION: Balance (Maximize Utility, Minimize Risk)

SESSION HISTORY:
${formatHistory(history)}

CURRENT QUERY: "${query}"

COUNCIL ADVICE:
${JSON.stringify(ministerResponses, null, 2)}

JUDICIAL REVIEW:
${JSON.stringify(critique, null, 2)}

TASK:
Synthesize a FINAL DECREE.
You are the Judge.
If Nyayadhish raised a critical legal blocker, you MUST address it.
Balance the ROI (Amatya) vs Speed (Senapati) vs Culture (Panditrao).

OUTPUT SCHEMA (JSON only):
{
  "role": "${AgentRole.PESHWA}",
  "summary": "The Final Decree",
  "reasoning": ["reason 1 (addressing critique)", "reason 2 (balancing factors)"],
  "recommendation": "Final executable order",
  "confidence": number
}
`;