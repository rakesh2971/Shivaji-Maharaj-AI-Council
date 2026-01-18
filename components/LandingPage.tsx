import React from 'react';
import { Crown, Shield, Users, ArrowRight, Scale, Sparkles, Atom, Database, Palette, Heart, LogIn } from 'lucide-react';
import { AGENTS } from '../constants';
import { useAuth } from '../contexts/AuthContext';

interface LandingPageProps {
  onEnter: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnter }) => {
  const { user, signIn, loading } = useAuth();

  return (
    <div className="min-h-screen bg-[#1c1917] bg-[url('https://www.transparenttextures.com/patterns/black-linen.png')] text-stone-200 font-sans selection:bg-amber-900/50 flex flex-col">
      
      {/* Auth Corner */}
      <div className="absolute top-4 right-4 z-50">
        {!loading && (
          user ? (
             <div className="flex items-center gap-3 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-stone-800">
                <img src={user.photoURL || ''} alt="User" className="w-8 h-8 rounded-full border border-amber-500/50" />
                <div className="text-left hidden sm:block">
                  <p className="text-xs text-stone-400">Welcome,</p>
                  <p className="text-sm font-bold text-amber-500">{user.displayName?.split(' ')[0]}</p>
                </div>
             </div>
          ) : (
            <button 
              onClick={signIn}
              className="flex items-center gap-2 bg-stone-900/80 hover:bg-stone-800 text-stone-300 px-4 py-2 rounded-full border border-stone-700 transition-all font-medium text-sm backdrop-blur-sm"
            >
              <LogIn size={16} />
              <span>Sign In</span>
            </button>
          )
        )}
      </div>

      {/* Hero Section */}
      <div className="flex-grow flex flex-col items-center justify-center p-8 text-center relative overflow-hidden min-h-[80vh]">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-black/80 via-transparent to-[#1c1917] pointer-events-none" />
        
        {/* Animated Background Elements */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-amber-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-900/10 rounded-full blur-3xl animate-pulse delay-1000"></div>

        <div className="relative z-10 max-w-5xl mx-auto space-y-8 animate-in fade-in zoom-in duration-1000">
          <div className="inline-flex items-center justify-center p-6 rounded-full bg-gradient-to-br from-amber-900/30 to-black border border-amber-700/50 mb-4 shadow-[0_0_50px_rgba(245,158,11,0.15)] backdrop-blur-sm">
            <Crown size={80} className="text-amber-500 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]" />
          </div>
          
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-500 to-amber-200 tracking-tight drop-shadow-sm leading-tight">
              Ashta Pradhan<br/><span className="text-3xl md:text-5xl lg:text-6xl text-stone-400 font-light tracking-widest uppercase mt-2 block">AI Council</span>
            </h1>
          </div>
          
          <p className="text-xl md:text-2xl text-stone-400 font-light max-w-3xl mx-auto leading-relaxed border-t border-b border-stone-800/50 py-8 my-8">
            Step into the <span className="text-amber-500 font-serif font-bold">17th Century Durbar</span>. <br/>
            An AI simulation of Chhatrapati Shivaji Maharaj's legendary governance system, powered by multi-agent orchestration.
          </p>
          
          <button 
            onClick={onEnter}
            className="group relative inline-flex items-center gap-4 px-10 py-5 bg-gradient-to-r from-amber-800 to-amber-700 hover:from-amber-700 hover:to-amber-600 text-amber-50 text-xl font-serif font-bold rounded-lg transition-all shadow-[0_0_20px_rgba(180,83,9,0.3)] hover:shadow-[0_0_40px_rgba(180,83,9,0.5)] hover:-translate-y-1 overflow-hidden"
          >
            <span className="relative z-10">Enter the Durbar</span>
            <ArrowRight className="group-hover:translate-x-1 transition-transform relative z-10" />
            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
          </button>
        </div>
      </div>

      {/* Features Grid */}
      <div className="bg-stone-950/80 border-t border-stone-800 backdrop-blur-sm py-20 px-6 relative z-20">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center mb-16">
            <h2 className="text-sm font-bold text-amber-500 uppercase tracking-[0.3em] mb-4">Architecture</h2>
            <h3 className="text-3xl md:text-4xl font-serif font-bold text-stone-200">The Governance Protocol</h3>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-24">
            <div className="p-8 rounded-2xl bg-stone-900/50 border border-stone-800 hover:border-amber-900/50 transition-all hover:bg-stone-900 group">
              <div className="w-14 h-14 bg-stone-800 rounded-xl flex items-center justify-center mb-6 group-hover:bg-amber-900/20 transition-colors">
                <Shield className="text-stone-400 group-hover:text-amber-500 transition-colors" size={28} />
              </div>
              <h3 className="text-xl font-serif font-bold mb-3 text-stone-200">Historical RAG</h3>
              <p className="text-stone-500 leading-relaxed">
                The AI retrieves context from the <em>Adnyapatra</em> (Royal Edict) and historical archives to ground every decision in authentic Maratha strategy and ethics.
              </p>
            </div>
            
            <div className="p-8 rounded-2xl bg-stone-900/50 border border-stone-800 hover:border-amber-900/50 transition-all hover:bg-stone-900 group">
              <div className="w-14 h-14 bg-stone-800 rounded-xl flex items-center justify-center mb-6 group-hover:bg-amber-900/20 transition-colors">
                <Users className="text-stone-400 group-hover:text-amber-500 transition-colors" size={28} />
              </div>
              <h3 className="text-xl font-serif font-bold mb-3 text-stone-200">Intelligent Routing</h3>
              <p className="text-stone-500 leading-relaxed">
                You query the Peshwa. The Peshwa dynamically summons only the relevant ministers (e.g., Finance & Defense) to deliberate on your specific problem.
              </p>
            </div>
            
            <div className="p-8 rounded-2xl bg-stone-900/50 border border-stone-800 hover:border-amber-900/50 transition-all hover:bg-stone-900 group">
              <div className="w-14 h-14 bg-stone-800 rounded-xl flex items-center justify-center mb-6 group-hover:bg-amber-900/20 transition-colors">
                <Scale className="text-stone-400 group-hover:text-amber-500 transition-colors" size={28} />
              </div>
              <h3 className="text-xl font-serif font-bold mb-3 text-stone-200">Judicial Critique</h3>
              <p className="text-stone-500 leading-relaxed">
                Before a decree is passed, the <em>Nyayadhish</em> (Chief Justice) cross-examines the council's advice for ethical conflicts, risks, and legal compliance.
              </p>
            </div>
          </div>

          <div className="border-t border-stone-900 pt-20">
             <div className="text-center mb-16">
               <h2 className="text-sm font-bold text-amber-500 uppercase tracking-[0.3em] mb-4">The Cabinet</h2>
               <h3 className="text-3xl md:text-4xl font-serif font-bold text-stone-200">Meet the Ashta Pradhan</h3>
             </div>
             
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-20">
                {Object.values(AGENTS).map((agent, i) => (
                  <div key={agent.id} className="p-6 rounded-xl bg-stone-900/30 border border-stone-800 hover:bg-stone-900 hover:border-stone-700 transition-all group flex flex-col items-center text-center">
                    <div className="mb-4 p-3 rounded-full bg-stone-950 shadow-inner group-hover:scale-110 transition-transform">
                      {/* We render a generic icon based on role if needed, or just text */}
                      <span className={`text-stone-500 group-hover:text-${agent.color}-500 transition-colors font-bold`}>
                        {agent.name.charAt(0)}
                      </span>
                    </div>
                    <div className="text-lg font-serif font-bold text-stone-300 group-hover:text-amber-500 transition-colors mb-1">{agent.name}</div>
                    <div className="text-xs text-stone-600 uppercase tracking-widest font-bold mb-3">{agent.title}</div>
                    <p className="text-xs text-stone-500 line-clamp-3">{agent.description}</p>
                  </div>
                ))}
             </div>
          </div>

          {/* ENGINEERING SECTION (Restored) */}
          <div className="border-t border-stone-900 pt-20 pb-10">
            <div className="text-center mb-12">
               <h2 className="text-sm font-bold text-amber-500 uppercase tracking-[0.3em] mb-4">Engineering</h2>
               <h3 className="text-3xl md:text-4xl font-serif font-bold text-stone-200">Powered by Agentic AI</h3>
            </div>

            {/* Flowchart SVG */}
            <div className="max-w-4xl mx-auto mb-16 overflow-x-auto p-4">
               <div className="min-w-[600px] flex justify-center">
                 <svg width="800" height="200" viewBox="0 0 800 200" className="w-full">
                    {/* Definitions for arrow markers */}
                    <defs>
                      <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
                        <path d="M0,0 L0,6 L9,3 z" fill="#78716c" />
                      </marker>
                    </defs>

                    {/* Nodes */}
                    <g className="text-xs font-mono">
                       {/* Node 1: User Query */}
                       <rect x="50" y="80" width="100" height="40" rx="4" fill="#1c1917" stroke="#78716c" strokeWidth="1" />
                       <text x="100" y="105" textAnchor="middle" fill="#a8a29e">User Query</text>

                       {/* Arrow 1 */}
                       <line x1="150" y1="100" x2="190" y2="100" stroke="#78716c" strokeWidth="1" markerEnd="url(#arrow)" />

                       {/* Node 2: Orchestrator */}
                       <rect x="200" y="70" width="120" height="60" rx="4" fill="#292524" stroke="#f59e0b" strokeWidth="1" />
                       <text x="260" y="105" textAnchor="middle" fill="#fcd34d" fontWeight="bold">Orchestrator</text>
                       
                       {/* Arrow 2 (Split) */}
                       <line x1="320" y1="100" x2="360" y2="100" stroke="#78716c" strokeWidth="1" markerEnd="url(#arrow)" />

                       {/* Node 3: Parallel Agents (Stack effect) */}
                       <rect x="370" y="75" width="120" height="50" rx="4" fill="#1c1917" stroke="#78716c" strokeWidth="1" />
                       <rect x="375" y="80" width="120" height="50" rx="4" fill="#1c1917" stroke="#78716c" strokeWidth="1" />
                       <rect x="380" y="85" width="120" height="50" rx="4" fill="#1c1917" stroke="#a8a29e" strokeWidth="1" />
                       <text x="440" y="115" textAnchor="middle" fill="#e7e5e4">Parallel Agents</text>

                       {/* Arrow 3 */}
                       <line x1="500" y1="110" x2="540" y2="110" stroke="#78716c" strokeWidth="1" markerEnd="url(#arrow)" />

                       {/* Node 4: Debate/Critique */}
                       <rect x="550" y="80" width="100" height="40" rx="4" fill="#1c1917" stroke="#ef4444" strokeWidth="1" />
                       <text x="600" y="105" textAnchor="middle" fill="#fca5a5">Critique</text>

                       {/* Arrow 4 */}
                       <line x1="650" y1="100" x2="690" y2="100" stroke="#78716c" strokeWidth="1" markerEnd="url(#arrow)" />

                       {/* Node 5: Verdict */}
                       <rect x="700" y="70" width="80" height="60" rx="4" fill="#1c1917" stroke="#10b981" strokeWidth="1" />
                       <circle cx="740" cy="90" r="12" fill="#064e3b" />
                       <path d="M734 90 l4 4 l8 -8" stroke="#34d399" strokeWidth="2" fill="none" />
                       <text x="740" y="120" textAnchor="middle" fill="#6ee7b7">Decree</text>
                    </g>
                 </svg>
               </div>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap justify-center gap-4">
              <span className="px-4 py-2 rounded-full bg-blue-900/20 border border-blue-800 text-blue-400 text-sm font-mono flex items-center gap-2">
                <Atom size={16} /> React 19
              </span>
              <span className="px-4 py-2 rounded-full bg-emerald-900/20 border border-emerald-800 text-emerald-400 text-sm font-mono flex items-center gap-2">
                <Sparkles size={16} /> Gemini 2.0 Flash
              </span>
              <span className="px-4 py-2 rounded-full bg-cyan-900/20 border border-cyan-800 text-cyan-400 text-sm font-mono flex items-center gap-2">
                <Palette size={16} /> Tailwind CSS
              </span>
               <span className="px-4 py-2 rounded-full bg-orange-900/20 border border-orange-800 text-orange-400 text-sm font-mono flex items-center gap-2">
                <Database size={16} /> Firebase
              </span>
            </div>
          </div>

        </div>
      </div>
      
      {/* Footer */}
      <footer className="py-12 text-center bg-black border-t border-stone-900 relative z-20">
        <div className="flex flex-col items-center gap-4">
            <p className="text-stone-500 font-serif italic text-lg px-4">
              "He who has the wisdom of many, commits the errors of none."
            </p>
            <div className="flex items-center gap-2 text-stone-400 text-sm mt-2">
                <span>Built with</span>
                <Heart size={14} className="text-orange-600 fill-orange-600" />
                <span>by Rakesh Telang</span>
            </div>
        </div>
      </footer>
    </div>
  );
};