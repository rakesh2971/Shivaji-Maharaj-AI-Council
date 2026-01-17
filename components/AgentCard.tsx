import React, { useState, useEffect } from 'react';
import { AgentResponse, AgentRole } from '../types';
import { AGENTS } from '../constants';
import { Shield, Scroll, Coins, Sword, Crown, Scale, Eye, ChevronDown, ChevronUp, AlertTriangle, CheckCircle, Globe, BookOpen } from 'lucide-react';

interface AgentCardProps {
  response: AgentResponse;
  isExpanded?: boolean;
  onToggle?: () => void;
  className?: string;
}

const IconMap = {
  Crown,
  Coins,
  Scroll,
  Sword,
  Eye,
  Scale,
  Globe,
  BookOpen
};

// Internal Typewriter Component for streaming text effect
const Typewriter = ({ text, speed = 10 }: { text?: string; speed?: number }) => {
  const safeText = text || '';
  const [displayedLength, setDisplayedLength] = useState(0);
  const isComplete = displayedLength === safeText.length;

  useEffect(() => {
    // Reset when text changes drastically or component mounts
    setDisplayedLength(0);
    
    if (!safeText) return;

    const interval = setInterval(() => {
      setDisplayedLength((prev) => {
        if (prev >= safeText.length) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, speed);

    return () => clearInterval(interval);
  }, [safeText, speed]);

  return (
    <span>
      {safeText.substring(0, displayedLength)}
      {!isComplete && (
        <span className="animate-pulse inline-block ml-0.5 w-1.5 h-3 bg-amber-500 align-middle shadow-[0_0_5px_rgba(245,158,11,0.5)]"></span>
      )}
    </span>
  );
};

export const AgentCard: React.FC<AgentCardProps> = ({ response, isExpanded = false, onToggle, className = '' }) => {
  if (!response) return null;

  const profile = AGENTS[response.role];
  
  if (!profile) {
    console.warn(`AgentCard received unknown role: ${response.role}`);
    return null;
  }

  const Icon = IconMap[profile.icon as keyof typeof IconMap] || Shield;

  // Color mapping for Tailwind
  const getColorClasses = (color: string) => {
    const map: Record<string, string> = {
      yellow: 'border-yellow-600 bg-yellow-950/30 text-yellow-500 hover:bg-yellow-900/40',
      emerald: 'border-emerald-600 bg-emerald-950/30 text-emerald-500 hover:bg-emerald-900/40',
      blue: 'border-blue-600 bg-blue-950/30 text-blue-500 hover:bg-blue-900/40',
      red: 'border-red-600 bg-red-950/30 text-red-500 hover:bg-red-900/40',
      violet: 'border-violet-600 bg-violet-950/30 text-violet-500 hover:bg-violet-900/40',
      orange: 'border-orange-600 bg-orange-950/30 text-orange-500 hover:bg-orange-900/40',
      cyan: 'border-cyan-600 bg-cyan-950/30 text-cyan-500 hover:bg-cyan-900/40',
      rose: 'border-rose-600 bg-rose-950/30 text-rose-500 hover:bg-rose-900/40',
    };
    return map[color] || 'border-stone-600 bg-stone-900/20 text-stone-500';
  };

  const colorClasses = getColorClasses(profile.color);

  // Safely handle arrays and strings
  const reasoning = Array.isArray(response.reasoning) ? response.reasoning : [];
  const keyConcerns = Array.isArray(response.keyConcerns) ? response.keyConcerns : [];

  return (
    <div className={`border-l-4 rounded-r-lg mb-4 transition-all duration-300 ${colorClasses} border-opacity-60 bg-opacity-10 backdrop-blur-sm ${className}`}>
      <div 
        className="p-4 flex items-center justify-between cursor-pointer"
        onClick={onToggle}
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full bg-stone-950/50 shadow-inner`}>
            <Icon size={24} />
          </div>
          <div>
            <h3 className="font-bold text-lg text-stone-100 font-serif tracking-wide">{profile.name}</h3>
            <p className="text-xs uppercase tracking-wider opacity-70">{profile.title}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <span className="text-xs font-mono opacity-50 block">CONFIDENCE</span>
            <span className={`font-bold ${response.confidence > 80 ? 'text-green-400' : 'text-yellow-400'}`}>
              {response.confidence}%
            </span>
          </div>
          <button className="p-1 hover:bg-white/10 rounded-full transition-colors">
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 pt-0 text-stone-300 border-t border-white/5 animate-in slide-in-from-top-2 duration-200">
          <div className="mt-4 space-y-4">
            
            {/* Summary */}
            <div className="bg-black/20 p-3 rounded italic text-stone-400 border border-white/5">
              "<Typewriter text={response.summary} speed={8} />"
            </div>

            {/* Reasoning */}
            <div>
              <h4 className="text-xs font-bold uppercase text-stone-500 mb-2 flex items-center gap-2">
                <Scroll size={14} /> Strategic Reasoning
              </h4>
              <ul className="space-y-2">
                {reasoning.map((r, i) => (
                  <li key={i} className="flex gap-2 text-sm leading-relaxed">
                    <span className="text-stone-600 mt-1">•</span>
                    <span><Typewriter text={r} speed={5} /></span>
                  </li>
                ))}
                {reasoning.length === 0 && (
                  <li className="text-xs text-stone-500 italic">Reasoning data unavailable.</li>
                )}
              </ul>
            </div>

            {/* Key Concerns */}
            {keyConcerns.length > 0 && (
              <div>
                 <h4 className="text-xs font-bold uppercase text-red-400/80 mb-2 flex items-center gap-2">
                  <AlertTriangle size={14} /> Risk Factors
                </h4>
                <ul className="space-y-1">
                  {keyConcerns.map((c, i) => (
                    <li key={i} className="text-sm text-red-300/80 bg-red-950/20 px-2 py-1 rounded inline-block mr-2 mb-1">
                      <Typewriter text={c} speed={15} />
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommendation */}
            <div className="mt-4 pt-4 border-t border-white/10">
              <h4 className="text-xs font-bold uppercase text-stone-500 mb-2 flex items-center gap-2">
                <CheckCircle size={14} /> Final Recommendation
              </h4>
              <p className="text-md font-semibold text-stone-100">
                <Typewriter text={response.recommendation} speed={10} />
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};