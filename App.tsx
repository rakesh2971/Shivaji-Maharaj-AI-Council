import React, { useState, useEffect } from 'react';
import { runSimulationOrchestration } from './utils/orchestrator';
import { SimulationState, AgentRole, AgentResponse, HistoryItem, SavedSimulation } from './types';
import { Timeline } from './components/Timeline';
import { AgentCard } from './components/AgentCard';
import { generateRoyalDecreePDF } from './utils/pdfGenerator';
import { LandingPage } from './components/LandingPage';
import { Send, BookOpen, Crown, AlertOctagon, Loader2, Star, CheckCircle2, FileDown, ArrowLeft, Menu, PanelLeft } from 'lucide-react';
import { useAuth } from './contexts/AuthContext';
import { HistoryService } from './lib/firebase';
import { HistorySidebar } from './components/HistorySidebar';
import { SettingsModal } from './components/SettingsModal';
import { getApiKey } from './services/gemini';

const INITIAL_STEPS = [
  { id: 1, phase: 'Retrieval' as const, activeAgents: [], status: 'pending' as const, logs: [] },
  { id: 2, phase: 'Router' as const, activeAgents: [], status: 'pending' as const, logs: [] },
  { id: 3, phase: 'Deliberation' as const, activeAgents: [], status: 'pending' as const, logs: [] },
  { id: 4, phase: 'Critique' as const, activeAgents: [], status: 'pending' as const, logs: [] },
  { id: 5, phase: 'Synthesis' as const, activeAgents: [], status: 'pending' as const, logs: [] }
];

export default function App() {
  const { user } = useAuth();
  const [showLanding, setShowLanding] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  
  // Default sidebar to open on desktop, closed on mobile
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 768;
    }
    return false;
  });
  
  // Data State
  const [query, setQuery] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([]); // Current session context
  const [savedSimulations, setSavedSimulations] = useState<SavedSimulation[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  
  const [state, setState] = useState<SimulationState>({
    isSimulating: false,
    currentPhase: 'Retrieval',
    query: '',
    retrievedContext: [],
    ministerResponses: {},
    steps: [...INITIAL_STEPS],
  });

  const [expandedAgents, setExpandedAgents] = useState<Record<string, boolean>>({});
  const [feedback, setFeedback] = useState({ rating: 0, comment: '', submitted: false, isSubmitting: false });

  // Load history on mount or user change
  useEffect(() => {
    if (user) {
      setIsLoadingHistory(true);
      HistoryService.getHistory(user.uid)
        .then(data => setSavedSimulations(data))
        .catch(err => console.error("Failed to load history", err))
        .finally(() => setIsLoadingHistory(false));
    } else {
      setSavedSimulations([]);
    }
  }, [user]);

  const refreshHistory = () => {
    if (user) {
      HistoryService.getHistory(user.uid).then(setSavedSimulations);
    }
  };

  const toggleAgent = (role: string) => {
    setExpandedAgents(prev => ({ ...prev, [role]: !prev[role] }));
  };

  const handleNewChat = () => {
    setQuery('');
    setHistory([]);
    setFeedback({ rating: 0, comment: '', submitted: false, isSubmitting: false });
    setExpandedAgents({});
    setState({
      isSimulating: false,
      currentPhase: 'Retrieval',
      query: '',
      retrievedContext: [],
      ministerResponses: {},
      steps: [...INITIAL_STEPS],
    });
    // On mobile, sidebar closes automatically via prop logic in Sidebar
  };

  const handleSimulate = async () => {
    if (!query.trim() || state.isSimulating) return;

    // Check for API Key before starting
    if (!getApiKey()) {
      setShowSettings(true);
      return;
    }

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

    let currentMinisterResponses: Record<string, AgentResponse> = {};
    let finalVerdictData: AgentResponse | undefined;
    let critiqueData: AgentResponse | undefined;

    try {
      // Pass 'language' to the orchestrator
      const generator = runSimulationOrchestration(query, history);
      for await (const update of generator) {
        setState(prev => {
          const newExpands = { ...expandedAgents };
          if (update.ministerResponses) {
            currentMinisterResponses = update.ministerResponses;
            Object.keys(update.ministerResponses).forEach(role => newExpands[role] = true);
          }
          if (update.critique) {
            critiqueData = update.critique;
            newExpands[AgentRole.NYAYADHISH] = true;
          }
          if (update.finalVerdict) {
            finalVerdictData = update.finalVerdict;
            newExpands[AgentRole.PESHWA] = true;
            
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

      if (user && finalVerdictData) {
        await HistoryService.saveSimulation(user.uid, {
          query,
          ministerResponses: currentMinisterResponses,
          critique: critiqueData,
          finalVerdict: finalVerdictData
        });
        refreshHistory(); // Update Sidebar list
      }

    } catch (e: any) {
      console.error(e);
      if (e.message === "API_KEY_MISSING") {
        setShowSettings(true);
        setState(prev => ({ 
          ...prev, 
          isSimulating: false, 
          error: "API Key is required to proceed." 
        }));
      } else {
        setState(prev => ({ ...prev, isSimulating: false }));
      }
    } finally {
      if (state.isSimulating) { // Double check we are still simulating before turning off
          setState(prev => ({ ...prev, isSimulating: false }));
      }
    }
  };

  const loadFromHistory = (sim: SavedSimulation) => {
    setQuery(sim.query);
    setState({
      isSimulating: false,
      currentPhase: 'Complete',
      query: sim.query,
      retrievedContext: [], 
      ministerResponses: sim.ministerResponses,
      critique: sim.critique,
      finalVerdict: sim.finalVerdict,
      steps: [
        { id: 1, phase: 'Retrieval', activeAgents: [], status: 'completed', logs: ['Loaded from Archives'] },
        { id: 2, phase: 'Router', activeAgents: [AgentRole.PESHWA], status: 'completed', logs: ['Loaded from Archives'] },
        { id: 3, phase: 'Deliberation', activeAgents: Object.keys(sim.ministerResponses) as AgentRole[], status: 'completed', logs: ['Loaded from Archives'] },
        { id: 4, phase: 'Critique', activeAgents: sim.critique ? [AgentRole.NYAYADHISH] : [], status: 'completed', logs: ['Loaded from Archives'] },
        { id: 5, phase: 'Synthesis', activeAgents: [AgentRole.PESHWA], status: 'completed', logs: ['Decree Restored.'] }
      ]
    });
    
    const allExpanded: Record<string, boolean> = {};
    Object.keys(sim.ministerResponses).forEach(k => allExpanded[k] = true);
    if(sim.critique) allExpanded[AgentRole.NYAYADHISH] = true;
    allExpanded[AgentRole.PESHWA] = true;
    setExpandedAgents(allExpanded);
  };

  const handleFeedbackSubmit = async () => {
    if (feedback.rating === 0) return;
    setFeedback(prev => ({ ...prev, isSubmitting: true }));
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

  if (showLanding) {
    return <LandingPage onEnter={() => setShowLanding(false)} />;
  }

  return (
    <div className="flex h-screen bg-[#1c1917] bg-[url('https://www.transparenttextures.com/patterns/black-linen.png')] text-stone-200 font-sans overflow-hidden">
      
      {/* SETTINGS MODAL */}
      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />

      {/* SIDEBAR */}
      <HistorySidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        onSelectSimulation={loadFromHistory}
        onNewChat={handleNewChat}
        onOpenSettings={() => setShowSettings(true)}
        simulations={savedSimulations}
        isLoading={isLoadingHistory}
      />

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col h-full min-w-0 relative transition-all duration-300">
        
        {/* MOBILE HEADER */}
        <header className="md:hidden flex items-center justify-between p-4 border-b border-stone-800 bg-stone-950/80 backdrop-blur-md z-30">
          <div className="flex items-center gap-3">
             <button 
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 text-stone-400 hover:text-white transition-colors"
              >
                <Menu size={24} />
              </button>
              <span className="font-serif font-bold text-amber-500 flex items-center gap-2">
                 <Crown size={18} /> Ashta Pradhan
              </span>
          </div>
          <button onClick={() => setShowLanding(true)} className="p-2 text-stone-500">
             <ArrowLeft size={20} />
          </button>
        </header>

        {/* DESKTOP HEADER (With Sidebar Toggle) */}
        <div className="hidden md:flex justify-between items-center p-6 pb-2">
           <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
                className="text-stone-500 hover:text-amber-500 transition-colors p-1 rounded-md hover:bg-stone-900"
                title={isSidebarOpen ? "Close Sidebar" : "Open Sidebar"}
              >
                <PanelLeft size={20} />
              </button>
              <div className="text-sm font-mono text-stone-600 uppercase tracking-widest">
                Royal Durbar Protocol v2.0
              </div>
           </div>
           <button 
              onClick={() => setShowLanding(true)}
              className="text-xs text-stone-500 hover:text-amber-500 transition-colors flex items-center gap-2"
           >
              <ArrowLeft size={14} /> Exit Simulation
           </button>
        </div>

        {/* SCROLLABLE CONTENT */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8 scroll-smooth">
          <div className="max-w-7xl mx-auto space-y-8 pb-20">
            
            {/* TITLE (Only if no active simulation to reduce clutter) */}
            {!state.isSimulating && !state.finalVerdict && Object.keys(state.ministerResponses).length === 0 && (
               <div className="text-center py-10 animate-in fade-in zoom-in duration-700">
                  <div className="inline-flex items-center justify-center p-4 rounded-full bg-stone-900/50 border border-stone-800 mb-6 shadow-2xl">
                     <Crown size={48} className="text-amber-600/80" />
                  </div>
                  <h1 className="text-3xl md:text-5xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-600 mb-4">
                     Ashta Pradhan AI Council
                  </h1>
                  <p className="text-stone-500 max-w-lg mx-auto">
                     Pose a query to the Ashta Pradhan. The Peshwa will summon the relevant ministers to deliberate on your behalf.
                  </p>
               </div>
            )}

            {/* INPUT SECTION */}
            <div className={`max-w-3xl mx-auto relative group transition-all duration-500 ${state.isSimulating ? 'opacity-75 pointer-events-none' : ''}`}>
              <div className="absolute -inset-1 bg-gradient-to-r from-amber-600 to-orange-600 rounded-lg blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
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
                  <span className="hidden sm:inline">Deliberate</span>
                </button>
              </div>
            </div>

            {/* MAIN GRID */}
            {(state.isSimulating || Object.keys(state.ministerResponses).length > 0) && (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-[600px] animate-in fade-in slide-in-from-bottom-10 duration-700">
                
                {/* TIMELINE & RAG */}
                <div className="lg:col-span-1 flex flex-col gap-6 order-2 lg:order-1">
                  <div className="flex-grow sticky top-4">
                    <Timeline steps={state.steps} currentPhase={state.currentPhase} />
                    
                    {state.retrievedContext.length > 0 && (
                      <div className="mt-6 bg-stone-900/50 p-5 rounded-xl border border-stone-800 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4">
                        <h3 className="text-sm font-bold text-stone-400 uppercase mb-3 flex items-center gap-2">
                          <BookOpen size={16} /> Historical Context
                        </h3>
                        <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar">
                          {state.retrievedContext.map((ctx, idx) => (
                            <div key={idx} className="text-xs text-stone-500 bg-black/20 p-2 rounded border-l-2 border-stone-700 hover:border-amber-700 transition-colors">
                              {ctx}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* AGENT RESPONSES */}
                <div className="lg:col-span-3 space-y-8 order-1 lg:order-2">
                  
                  {/* I. MINISTERS */}
                  {(state.currentPhase !== 'Retrieval' && state.currentPhase !== 'Router') && (
                    <div className="space-y-4">
                      <h2 className="text-stone-500 text-sm font-bold uppercase tracking-widest border-b border-stone-800 pb-2 flex justify-between items-end">
                        <span>I. Council Deliberation</span>
                        {state.isSimulating && Object.keys(state.ministerResponses).length === 0 && <span className="text-xs text-amber-500 animate-pulse">Ministers are thinking...</span>}
                      </h2>
                      
                      {Object.keys(state.ministerResponses).length === 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           {[1, 2].map(i => (
                              <div key={i} className="h-32 bg-stone-900/30 border border-stone-800/50 rounded-lg flex items-center justify-center animate-pulse">
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
                              className="animate-in zoom-in-95 duration-500 hover:shadow-lg transition-shadow"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* II. CRITIQUE */}
                  {state.critique && (
                     <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                      <h2 className="text-stone-500 text-sm font-bold uppercase tracking-widest border-b border-stone-800 pb-2 flex items-center gap-2 text-red-900/80">
                        II. Judicial Review <AlertOctagon size={16}/>
                      </h2>
                      <div className="max-w-4xl">
                        <AgentCard 
                          response={state.critique} 
                          isExpanded={expandedAgents[AgentRole.NYAYADHISH]}
                          onToggle={() => toggleAgent(AgentRole.NYAYADHISH)}
                          className="border-red-900/30 bg-red-950/10"
                        />
                      </div>
                     </div>
                  )}

                  {/* III. VERDICT */}
                  {state.finalVerdict && (
                    <>
                      <div className="space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                         <div className="flex items-center justify-between border-b border-amber-900/30 pb-2 mt-8">
                            <h2 className="text-amber-500/70 text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                              III. The Royal Decree <Crown size={16} />
                            </h2>
                            <button 
                              onClick={handleDownloadPDF}
                              className="text-xs flex items-center gap-2 bg-amber-900/20 hover:bg-amber-900/40 text-amber-500 px-3 py-1.5 rounded transition-colors border border-amber-800/50"
                            >
                              <FileDown size={14} /> Seal Decree
                            </button>
                         </div>
                        <AgentCard 
                          response={state.finalVerdict} 
                          isExpanded={expandedAgents[AgentRole.PESHWA]}
                          onToggle={() => toggleAgent(AgentRole.PESHWA)}
                          className="bg-gradient-to-br from-amber-950/20 to-black border-amber-600/60 shadow-2xl shadow-amber-900/10 scale-105 transform origin-top"
                        />
                      </div>

                      {/* FEEDBACK */}
                      <div className="mt-12 pt-8 border-t border-stone-800/50 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="bg-stone-900/30 border border-stone-800 rounded-xl p-6 max-w-2xl mx-auto backdrop-blur-sm">
                          {!feedback.submitted ? (
                            <>
                              <h3 className="text-center font-serif text-stone-500 mb-6 text-sm tracking-widest uppercase">Citizen Feedback</h3>
                              
                              <div className="flex justify-center gap-3 mb-6">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <button
                                    key={star}
                                    onClick={() => setFeedback(prev => ({ ...prev, rating: star }))}
                                    className="transition-transform hover:scale-110 focus:outline-none p-1"
                                  >
                                    <Star 
                                      size={28} 
                                      className={`${star <= feedback.rating ? 'fill-amber-600 text-amber-600' : 'text-stone-800 hover:text-stone-600'} transition-colors`} 
                                    />
                                  </button>
                                ))}
                              </div>

                              <textarea
                                value={feedback.comment}
                                onChange={(e) => setFeedback(prev => ({ ...prev, comment: e.target.value }))}
                                placeholder="Share your thoughts on this decree..."
                                className="w-full bg-black/40 border border-stone-800 rounded-lg p-3 text-stone-300 placeholder-stone-700 focus:outline-none focus:border-amber-900/50 mb-4 h-24 resize-none text-sm transition-colors"
                              />

                              <div className="flex justify-end">
                                <button
                                  onClick={handleFeedbackSubmit}
                                  disabled={feedback.rating === 0 || feedback.isSubmitting}
                                  className="bg-stone-800 hover:bg-stone-700 text-stone-300 px-6 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                  {feedback.isSubmitting ? <Loader2 className="animate-spin" size={14} /> : <Send size={14} />}
                                  Submit
                                </button>
                              </div>
                            </>
                          ) : (
                            <div className="text-center py-4">
                               <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-900/20 text-emerald-600 mb-3 border border-emerald-900/30">
                                 <CheckCircle2 size={20} />
                               </div>
                               <p className="text-stone-400 font-serif text-sm">Your feedback has been recorded.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                  
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
