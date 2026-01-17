import React, { useEffect, useRef } from 'react';
import { SimulationStep } from '../types';
import { Loader2, CheckCircle2, Circle } from 'lucide-react';

interface TimelineProps {
  steps: SimulationStep[];
  currentPhase: string;
}

export const Timeline: React.FC<TimelineProps> = ({ steps, currentPhase }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom as logs populate
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [steps]);

  return (
    <div className="bg-stone-900/50 p-6 rounded-xl border border-stone-800 backdrop-blur-sm h-full flex flex-col shadow-xl">
      <h3 className="text-lg font-serif font-bold text-stone-300 mb-6 border-b border-stone-800 pb-2 tracking-wide">
        Council Protocol
      </h3>
      
      <div className="space-y-8 relative overflow-y-auto custom-scrollbar pr-2 flex-grow" ref={scrollRef}>
        {/* Vertical Line Connector */}
        <div className="absolute left-3.5 top-2 bottom-2 w-0.5 bg-stone-800 -z-10" />

        {steps.map((step) => {
          const isActive = step.status === 'loading';
          const isCompleted = step.status === 'completed';
          
          let Icon = Circle;
          let colorClass = "text-stone-600 bg-stone-900 border-stone-700";
          
          if (isActive) {
            Icon = Loader2;
            colorClass = "text-amber-500 bg-stone-900 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.2)]";
          } else if (isCompleted) {
            Icon = CheckCircle2;
            colorClass = "text-emerald-500 bg-emerald-950/30 border-emerald-500/50";
          }

          return (
            <div key={step.id} className="relative pl-10 group">
              {/* Icon Marker */}
              <div className={`absolute left-0 top-1 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${colorClass}`}>
                <Icon size={16} className={isActive ? "animate-spin" : ""} />
              </div>

              {/* Content */}
              <div>
                <h4 className={`font-bold text-sm uppercase tracking-wider transition-colors duration-300 ${isActive ? 'text-amber-400' : isCompleted ? 'text-emerald-400' : 'text-stone-500'}`}>
                  {step.phase} Phase
                </h4>
                
                {/* Logs / Details */}
                {(isActive || isCompleted) && step.logs.length > 0 && (
                  <div className="mt-3 space-y-1.5">
                    {step.logs.map((log, idx) => (
                      <p key={idx} className="text-xs text-stone-400 font-mono border-l-2 border-stone-700 pl-3 py-0.5 animate-in fade-in slide-in-from-left-2 duration-300">
                        {log}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};