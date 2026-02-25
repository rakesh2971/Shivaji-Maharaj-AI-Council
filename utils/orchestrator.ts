import { AgentRole, SimulationState, SimulationStep, AgentResponse, HistoryItem } from '../types';
import { retrieveContext } from '../data/knowledgeBase';
import { AgentService } from '../services/gemini';

// This function generator manages the async flow of the simulation
export async function* runSimulationOrchestration(query: string, history: HistoryItem[]): AsyncGenerator<Partial<SimulationState>> {
  
  // 1. RETRIEVAL PHASE
  const context = retrieveContext(query);
  yield {
    currentPhase: 'Retrieval',
    retrievedContext: context,
    steps: [{ 
      id: 1, 
      phase: 'Retrieval', 
      activeAgents: [], 
      status: 'completed', 
      logs: [`Retrieved ${context.length} relevant documents from Adnyapatra & Archives.`] 
    }]
  };

  // 2. ROUTER PHASE (The Darbar)
  yield {
    currentPhase: 'Router',
    steps: [
      { id: 1, phase: 'Retrieval', activeAgents: [], status: 'completed', logs: [] },
      { id: 2, phase: 'Router', activeAgents: [AgentRole.PESHWA], status: 'loading', logs: ['Peshwa is deciding which ministers to summon...'] }
    ]
  };

  let selectedAgents: AgentRole[] = [];
  try {
    const routerResult = await AgentService.identifyRelevantAgents(query, history);
    // Validate returned agents against our enum
    selectedAgents = routerResult.selected_agents.filter((r: any) => Object.values(AgentRole).includes(r));
    
    // Fallback if router fails or returns empty
    if (selectedAgents.length === 0) {
      selectedAgents = [AgentRole.AMATYA, AgentRole.SENAPATI]; // Default core
    }

    yield {
      steps: [
        { id: 1, phase: 'Retrieval', activeAgents: [], status: 'completed', logs: [] },
        { id: 2, phase: 'Router', activeAgents: [AgentRole.PESHWA], status: 'completed', logs: [`Peshwa selected: ${selectedAgents.join(', ')}. Reason: ${routerResult.reasoning}`] }
      ]
    };
  } catch (e) {
    console.error("Router failed", e);
    selectedAgents = [AgentRole.AMATYA, AgentRole.SENAPATI, AgentRole.SACHIV]; // Fallback
  }

  // 3. DELIBERATION PHASE (Parallel - Dynamic)
  yield {
    currentPhase: 'Deliberation',
    steps: [
      { id: 1, phase: 'Retrieval', activeAgents: [], status: 'completed', logs: [] },
      { id: 2, phase: 'Router', activeAgents: [AgentRole.PESHWA], status: 'completed', logs: [] },
      { id: 3, phase: 'Deliberation', activeAgents: selectedAgents, status: 'loading', logs: [`${selectedAgents.length} Ministers are deliberating...`] }
    ]
  };

  const ministerPromises = selectedAgents.map(role => 
    AgentService.getMinisterOpinion(role, query, context, history)
  );

  const ministerResults = await Promise.all(ministerPromises);
  const ministerResponses: Record<string, AgentResponse> = {};
  
  ministerResults.forEach((res, index) => {
    if(res) {
      // Force the role to match the requested agent role to avoid mismatches
      // The LLM might hallucinate the role string.
      res.role = selectedAgents[index];
      ministerResponses[res.role] = res;
    }
  });

  yield {
    ministerResponses,
    steps: [
      { id: 1, phase: 'Retrieval', activeAgents: [], status: 'completed', logs: [] },
      { id: 2, phase: 'Router', activeAgents: [AgentRole.PESHWA], status: 'completed', logs: [] },
      { id: 3, phase: 'Deliberation', activeAgents: selectedAgents, status: 'completed', logs: ['Ministers have submitted their optimization reports.'] }
    ]
  };

  // 4. CRITIQUE PHASE (Nyayadhish Cross-Examination)
  yield {
    currentPhase: 'Critique',
    steps: [
      { id: 1, phase: 'Retrieval', activeAgents: [], status: 'completed', logs: [] },
      { id: 2, phase: 'Router', activeAgents: [AgentRole.PESHWA], status: 'completed', logs: [] },
      { id: 3, phase: 'Deliberation', activeAgents: [], status: 'completed', logs: [] },
      { id: 4, phase: 'Critique', activeAgents: [AgentRole.NYAYADHISH], status: 'loading', logs: ['Nyayadhish is cross-examining for conflicts...'] }
    ]
  };

  const critique = await AgentService.getCritique(query, ministerResults, history);
  if (critique) {
    critique.role = AgentRole.NYAYADHISH;
  }

  yield {
    critique,
    steps: [
      { id: 1, phase: 'Retrieval', activeAgents: [], status: 'completed', logs: [] },
      { id: 2, phase: 'Router', activeAgents: [AgentRole.PESHWA], status: 'completed', logs: [] },
      { id: 3, phase: 'Deliberation', activeAgents: [], status: 'completed', logs: [] },
      { id: 4, phase: 'Critique', activeAgents: [AgentRole.NYAYADHISH], status: 'completed', logs: ['Cross-examination complete.'] }
    ]
  };

  // 5. SYNTHESIS PHASE
  yield {
    currentPhase: 'Synthesis',
    steps: [
      { id: 1, phase: 'Retrieval', activeAgents: [], status: 'completed', logs: [] },
      { id: 2, phase: 'Router', activeAgents: [AgentRole.PESHWA], status: 'completed', logs: [] },
      { id: 3, phase: 'Deliberation', activeAgents: [], status: 'completed', logs: [] },
      { id: 4, phase: 'Critique', activeAgents: [], status: 'completed', logs: [] },
      { id: 5, phase: 'Synthesis', activeAgents: [AgentRole.PESHWA], status: 'loading', logs: ['Peshwa is balancing the trade-offs...'] }
    ]
  };

  const verdict = await AgentService.getFinalVerdict(query, ministerResults, critique, history);
  if (verdict) {
    verdict.role = AgentRole.PESHWA;
  }

  yield {
    finalVerdict: verdict,
    currentPhase: 'Complete',
    steps: [
      { id: 1, phase: 'Retrieval', activeAgents: [], status: 'completed', logs: [] },
      { id: 2, phase: 'Router', activeAgents: [AgentRole.PESHWA], status: 'completed', logs: [] },
      { id: 3, phase: 'Deliberation', activeAgents: [], status: 'completed', logs: [] },
      { id: 4, phase: 'Critique', activeAgents: [], status: 'completed', logs: [] },
      { id: 5, phase: 'Synthesis', activeAgents: [AgentRole.PESHWA], status: 'completed', logs: ['Final Decree Issued.'] }
    ]
  };
}
