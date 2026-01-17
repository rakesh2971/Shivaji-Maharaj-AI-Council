import React, { useState } from 'react';
import { runSimulationOrchestration } from './utils/orchestrator';
import { SimulationState, AgentRole, AgentResponse, HistoryItem } from './types';
import { Timeline } from './components/Timeline';
import { AgentCard } from './components/AgentCard';
import { generateRoyalDecreePDF } from './utils/pdfGenerator';
import { Send, BookOpen, Crown, AlertOctagon, Loader2, Star, CheckCircle2, FileDown } from 'lucide-react';

const INITIAL_STEPS = [
  { id: 1, phase: 'Retrieval' as const, activeAgents: [], status: 'pending' as const, logs: [] },
  { id: 2, phase: 'Router' as const, activeAgents: [], status: 'pending' as const, logs: [] },
  { id: 3, phase: 'Deliberation' as const, activeAgents: [], status: 'pending' as const, logs: [] },
  { id: 4, phase: 'Critique' as const, activeAgents: [], status: 'pending' as const, logs: [] },
  { id: 5, phase: 'Synthesis' as const, activeAgents: [], status: 'pending' as const, logs: [] }
];

export default function App() {
  const [query, setQuery] = useState('');
  // History State for Memory
  const [history, setHistory] = useState<HistoryItem[]>([]);
  
  const [state, setState] = useState<SimulationState>({
    isSimulating: false,
    currentPhase: 'Retrieval',
    query: '',
    retrievedContext: [],
    ministerResponses: {},
    steps: [...INITIAL_STEPS],
  });

  const [expandedAgents, setExpandedAgents] = useState<Record<string, boolean>>({});

  // Feedback State
  const [feedback, setFeedback] = useState({ rating: 0, comment: '', submitted: false, isSubmitting: false });

  const toggleAgent = (role: string) => {
    setExpandedAgents(prev => ({ ...prev, [role]: !prev[role] }));
  };

  const handleSimulate = async () => {
    if (!query.trim() || state.isSimulating) return;

    // Reset UI State for new run
    setFeedback({ rating: 0, comment: '', submitted: false, isSubmitting: false });
    setState({
      isSimulating: true,
      currentPhase: 'Retrieval',
      query,
      retrievedContext: [],
      ministerResponses: {},
      critique: undefined,
      finalVerdict: undefined,
      steps: [
        { id: 1, phase: 'Retrieval', activeAgents: [], status: 'loading', logs: ['Querying Adnyapatra archives...'] },
        { id: 2, phase: 'Router', activeAgents: [], status: 'pending', logs: [] },
        { id: 3, phase: 'Deliberation', activeAgents: [], status: 'pending', logs: [] },
        { id: 4, phase: 'Critique', activeAgents: [], status: 'pending', logs: [] },
        { id: 5, phase: 'Synthesis', activeAgents: [], status: 'pending', logs: [] }
      ]
    });
    
    setExpandedAgents({});

    // We capture specific values to add to history later
    let currentMinisterResponses = {};

    try {
      // Pass the *current* history to the orchestrator
      const generator = runSimulationOrchestration(query, history);
      for await (const update of generator) {
        setState(prev => {
          // Auto-expand agents as they finish
          const newExpands = { ...expandedAgents };
          if (update.ministerResponses) {
            currentMinisterResponses = update.ministerResponses;
            Object.keys(update.ministerResponses).forEach(role => newExpands[role] = true);
          }
          if (update.critique) newExpands[AgentRole.NYAYADHISH] = true;
          if (update.finalVerdict) {
            newExpands[AgentRole.PESHWA] = true;
            // Update History on success
            setHistory(prevHist => [
              ...prevHist, 
              { 
                query, 
                ministerResponses: currentMinisterResponses, 
                finalVerdict: update.finalVerdict 
              }
            ]);
          }
          setExpandedAgents(newExpands);

          return { ...prev, ...update };
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setState(prev => ({ ...prev, isSimulating: false }));
    }
  };

  const handleFeedbackSubmit = async () => {
    if (feedback.rating === 0) return;
    setFeedback(prev => ({ ...prev, isSubmitting: true }));
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setFeedback(prev => ({ ...prev, isSubmitting: false, submitted: true }));
  };

  const handleDownloadPDF = () => {
    if (!state.finalVerdict) return;
    generateRoyalDecreePDF(state);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSimulate();
    }
  };

  return (
    <div className="min-h-screen bg-[#1c1917] bg-[url('https://www.transparenttextures.com/patterns/black-linen.png')] text-stone-200 p-4 md:p-8 font-sans selection:bg-amber-900/50">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER */}
        <header className="text-center space-y-2 py-8 border-b border-stone-800">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Crown className="text-amber-600" size={32} />
            <h1 className="text-3xl md:text-5xl font-serif font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-200 to-amber-600">
              Ashta Pradhan AI Council
            </h1>
            <Crown className="text-amber-600" size={32} />
          </div>
          <p className="text-stone-400 max-w-2xl mx-auto font-light">
            Simulating 17th-century Maratha governance. The Peshwa (Router) will summon only the relevant ministers for deliberation.
          </p>
        </header>

        {/* INPUT SECTION */}
        <div className="max-w-3xl mx-auto relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-amber-600 to-orange-600 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative bg-stone-900 rounded-lg border border-stone-700 p-1 flex items-center shadow-2xl">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g., Should we allow the British East India Company to build a factory in Dabhol?"
              className="flex-grow bg-transparent border-none text-lg px-4 py-3 text-stone-100 placeholder-stone-600 focus:ring-0 focus:outline-none"
              disabled={state.isSimulating}
            />
            <button
              onClick={handleSimulate}
              disabled={!query.trim() || state.isSimulating}
              className="bg-amber-700 hover:bg-amber-600 text-amber-50 px-6 py-2 rounded-md font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {state.isSimulating ? <Loader2 className="animate-spin" /> : <Send size={18} />}
              <span>Deliberate</span>
            </button>
          </div>
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-[600px]">
          
          {/* LEFT SIDEBAR */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            <div className="flex-grow">
              <Timeline steps={state.steps} currentPhase={state.currentPhase} />
            </div>
            {state.retrievedContext.length > 0 && (
              <div className="bg-stone-900/50 p-5 rounded-xl border border-stone-800 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4">
                <h3 className="text-sm font-bold text-stone-400 uppercase mb-3 flex items-center gap-2">
                  <BookOpen size={16} /> Historical Context (RAG)
                </h3>
                <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar">
                  {state.retrievedContext.map((ctx, idx) => (
                    <div key={idx} className="text-xs text-stone-500 bg-black/20 p-2 rounded border-l-2 border-stone-700">
                      {ctx}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT CONTENT */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* 1. MINISTERS ROW (Dynamic) */}
            {(state.currentPhase !== 'Retrieval' && state.currentPhase !== 'Router') && (
              <div className="space-y-4">
                <h2 className="text-stone-500 text-sm font-bold uppercase tracking-widest border-b border-stone-800 pb-2 flex justify-between">
                  <span>I. Council Deliberation (Selected Agents)</span>
                  <span className="text-xs text-amber-500">Router Active</span>
                </h2>
                
                {Object.keys(state.ministerResponses).length === 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {[1, 2].map(i => (
                        <div key={i} className="h-24 bg-stone-900/30 border border-stone-800 rounded-lg flex items-center justify-center animate-pulse">
                          <span className="text-stone-700 text-sm font-mono">Peshwa is routing query...</span>
                        </div>
                     ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                    {Object.values(state.ministerResponses).map((response: AgentResponse) => (
                      <AgentCard 
                        key={response.role} 
                        response={response} 
                        isExpanded={expandedAgents[response.role]}
                        onToggle={() => toggleAgent(response.role)}
                        className="animate-in zoom-in-95 duration-500"
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 2. CRITIQUE ROW */}
            {state.critique && (
               <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <h2 className="text-stone-500 text-sm font-bold uppercase tracking-widest border-b border-stone-800 pb-2 flex items-center gap-2">
                  II. Judicial Review <AlertOctagon size={16} className="text-red-900"/>
                </h2>
                <div className="max-w-4xl">
                  <AgentCard 
                    response={state.critique} 
                    isExpanded={expandedAgents[AgentRole.NYAYADHISH]}
                    onToggle={() => toggleAgent(AgentRole.NYAYADHISH)}
                    className="border-orange-500/50"
                  />
                </div>
               </div>
            )}

            {/* 3. FINAL VERDICT */}
            {state.finalVerdict && (
              <>
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                   <div className="flex items-center justify-between border-b border-amber-900/30 pb-2">
                      <h2 className="text-amber-500/70 text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                        III. The Royal Decree <Crown size={16} />
                      </h2>
                      <button 
                        onClick={handleDownloadPDF}
                        className="text-xs flex items-center gap-2 bg-amber-900/30 hover:bg-amber-900/50 text-amber-500 px-3 py-1 rounded transition-colors border border-amber-800/50"
                        title="Seal the Decree (Download PDF)"
                      >
                        <FileDown size={14} /> Seal the Decree
                      </button>
                   </div>
                  <AgentCard 
                    response={state.finalVerdict} 
                    isExpanded={expandedAgents[AgentRole.PESHWA]}
                    onToggle={() => toggleAgent(AgentRole.PESHWA)}
                    className="bg-gradient-to-br from-yellow-950/20 to-black border-yellow-600/60 shadow-lg shadow-yellow-900/20"
                  />
                </div>

                {/* FEEDBACK SECTION */}
                <div className="mt-8 pt-8 border-t border-stone-800 animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <div className="bg-stone-900/50 border border-stone-800 rounded-xl p-6 max-w-2xl mx-auto">
                    {!feedback.submitted ? (
                      <>
                        <h3 className="text-center font-serif text-stone-400 mb-6">Rate the Council's Wisdom</h3>
                        
                        <div className="flex justify-center gap-3 mb-6">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() => setFeedback(prev => ({ ...prev, rating: star }))}
                              className="transition-transform hover:scale-110 focus:outline-none"
                            >
                              <Star 
                                size={32} 
                                className={`${star <= feedback.rating ? 'fill-amber-500 text-amber-500' : 'text-stone-700 hover:text-stone-500'} transition-colors`} 
                              />
                            </button>
                          ))}
                        </div>

                        <textarea
                          value={feedback.comment}
                          onChange={(e) => setFeedback(prev => ({ ...prev, comment: e.target.value }))}
                          placeholder="Share your thoughts on this decree..."
                          className="w-full bg-black/20 border border-stone-700 rounded-lg p-3 text-stone-300 placeholder-stone-600 focus:outline-none focus:border-amber-700/50 mb-4 h-24 resize-none"
                        />

                        <div className="flex justify-end">
                          <button
                            onClick={handleFeedbackSubmit}
                            disabled={feedback.rating === 0 || feedback.isSubmitting}
                            className="bg-stone-800 hover:bg-stone-700 text-stone-300 px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                          >
                            {feedback.isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
                            Submit Feedback
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-8">
                         <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-900/30 text-emerald-500 mb-4">
                           <CheckCircle2 size={24} />
                         </div>
                         <p className="text-stone-300 font-serif text-lg">Your feedback has been recorded in the archives.</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
            
            {state.isSimulating && !state.finalVerdict && Object.keys(state.ministerResponses).length === 0 && (
              <div className="flex items-center justify-center py-12 text-stone-600 animate-pulse">
                <p className="font-serif italic text-lg">Summoning the Council...</p>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}