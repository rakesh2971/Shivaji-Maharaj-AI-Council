import React from 'react';
import { Crown, Shield, Users, ArrowRight, Scale, Cpu, Network, Database, Layers, Heart, Sparkles, Atom, Palette } from 'lucide-react';
import { AGENTS } from '../constants';

interface LandingPageProps {
  onEnter: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnter }) => {
  return (
    <div className="min-h-screen bg-[#1c1917] bg-[url('https://www.transparenttextures.com/patterns/black-linen.png')] text-stone-200 font-sans selection:bg-amber-900/50 flex flex-col">
      
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
             
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
        </div>
      </div>

      {/* Under The Hood Section */}
      <div className="bg-[#1c1917] py-20 px-6 border-t border-stone-800 relative z-20">
        <div className="max-w-6xl mx-auto text-center">
            <div className="mb-12">
              <h2 className="text-sm font-bold text-amber-500 uppercase tracking-[0.3em] mb-4">Engineering</h2>
              <h3 className="text-3xl md:text-4xl font-serif font-bold text-stone-200">Powered by Agentic AI</h3>
            </div>

            {/* Flowchart SVG */}
            <div className="mb-16 overflow-x-auto">
              <div className="min-w-[900px]">
                  <svg viewBox="0 0 900 180" className="w-full h-auto max-w-4xl mx-auto opacity-90 hover:opacity-100 transition-opacity">
                      <defs>
                        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                          <polygon points="0 0, 10 3.5, 0 7" fill="#78716c" />
                        </marker>
                      </defs>
                      
                      {/* User Query */}
                      <g transform="translate(50, 70)">
                        <rect width="120" height="50" rx="8" className="fill-stone-900 stroke-stone-700 stroke-2" />
                        <text x="60" y="30" textAnchor="middle" className="fill-stone-300 text-sm font-bold">User Query</text>
                      </g>

                      {/* Arrow */}
                      <line x1="170" y1="95" x2="210" y2="95" className="stroke-stone-600 stroke-2" markerEnd="url(#arrowhead)" />

                      {/* Orchestrator */}
                      <g transform="translate(220, 70)">
                        <rect width="120" height="50" rx="8" className="fill-stone-900 stroke-amber-600 stroke-2" />
                        <text x="60" y="30" textAnchor="middle" className="fill-amber-500 text-sm font-bold">Orchestrator</text>
                      </g>

                      {/* Arrow */}
                      <line x1="340" y1="95" x2="380" y2="95" className="stroke-stone-600 stroke-2" markerEnd="url(#arrowhead)" />

                      {/* Parallel Agents */}
                      <g transform="translate(390, 45)">
                        <rect width="140" height="100" rx="8" className="fill-stone-900/50 stroke-stone-700 stroke-2 stroke-dasharray-4" />
                        <text x="70" y="20" textAnchor="middle" className="fill-stone-500 text-xs uppercase tracking-wide">Parallel Agents</text>
                        
                        <rect x="20" y="35" width="100" height="20" rx="4" className="fill-stone-800" />
                        <text x="70" y="49" textAnchor="middle" className="fill-stone-400 text-xs">Agent A (Finance)</text>
                        
                        <rect x="20" y="65" width="100" height="20" rx="4" className="fill-stone-800" />
                        <text x="70" y="79" textAnchor="middle" className="fill-stone-400 text-xs">Agent B (Defense)</text>
                      </g>

                      {/* Arrow */}
                      <line x1="530" y1="95" x2="570" y2="95" className="stroke-stone-600 stroke-2" markerEnd="url(#arrowhead)" />

                      {/* Debate Loop */}
                      <g transform="translate(580, 70)">
                        <rect width="120" height="50" rx="8" className="fill-stone-900 stroke-orange-600 stroke-2" />
                        <text x="60" y="30" textAnchor="middle" className="fill-orange-500 text-sm font-bold">Critique Loop</text>
                      </g>

                      {/* Arrow */}
                      <line x1="700" y1="95" x2="740" y2="95" className="stroke-stone-600 stroke-2" markerEnd="url(#arrowhead)" />

                      {/* Final Verdict */}
                      <g transform="translate(750, 70)">
                        <rect width="120" height="50" rx="8" className="fill-stone-900 stroke-emerald-600 stroke-2" />
                        <text x="60" y="30" textAnchor="middle" className="fill-emerald-500 text-sm font-bold">Final Verdict</text>
                      </g>
                  </svg>
              </div>
            </div>

            {/* Tech Badges */}
            <div className="flex flex-wrap justify-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full border bg-stone-900/50 border-stone-800 text-stone-300">
                <Sparkles size={16} className="text-blue-500" />
                <span className="font-mono text-sm">Google Gemini 2.0</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full border bg-stone-900/50 border-stone-800 text-stone-300">
                <Atom size={16} className="text-cyan-400" />
                <span className="font-mono text-sm">React 19</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full border bg-stone-900/50 border-stone-800 text-stone-300">
                <Database size={16} className="text-emerald-500" />
                <span className="font-mono text-sm">Vector RAG</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full border bg-stone-900/50 border-stone-800 text-stone-300">
                <Palette size={16} className="text-pink-400" />
                <span className="font-mono text-sm">Tailwind CSS</span>
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