import React from 'react';
import { SavedSimulation } from '../types';
import { X, MessageSquare, Plus, LogOut, LogIn, Crown, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface HistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSimulation: (sim: SavedSimulation) => void;
  onNewChat: () => void;
  simulations: SavedSimulation[];
  isLoading: boolean;
}

export const HistorySidebar: React.FC<HistorySidebarProps> = ({ 
  isOpen, 
  onClose, 
  onSelectSimulation, 
  onNewChat,
  simulations,
  isLoading
}) => {
  const { user, signIn, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    if (window.innerWidth < 768) onClose(); // Close on mobile after sign out
  };

  const handleSignIn = async () => {
    await signIn();
  };

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Sidebar Container */}
      <div className={`
        fixed md:relative inset-y-0 left-0 z-50 h-full
        bg-stone-950 border-r border-stone-800 flex flex-col
        transition-all duration-300 ease-in-out overflow-hidden
        ${isOpen ? 'translate-x-0 w-[280px]' : '-translate-x-full md:translate-x-0 w-[280px] md:w-0 md:border-r-0'}
      `}>
        {/* Inner Content Container - Fixed Width to prevent squishing */}
        <div className="w-[280px] h-full flex flex-col">
          
          {/* Header / New Chat */}
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between md:hidden mb-2">
              <div className="flex items-center gap-2 text-amber-500 font-serif font-bold">
                <Crown size={18} /> Ashta Pradhan
              </div>
              <button onClick={onClose} className="text-stone-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <button 
              onClick={() => {
                onNewChat();
                if (window.innerWidth < 768) onClose();
              }}
              className="w-full flex items-center gap-3 px-4 py-3 bg-stone-900 hover:bg-stone-800 border border-stone-800 hover:border-amber-700/50 rounded-lg text-stone-200 transition-all group"
            >
              <div className="p-1 rounded bg-stone-800 group-hover:bg-amber-900/40 text-stone-400 group-hover:text-amber-500 transition-colors">
                <Plus size={18} />
              </div>
              <span className="font-semibold text-sm">New Deliberation</span>
            </button>
          </div>

          {/* Scrollable History List */}
          <div className="flex-grow overflow-y-auto custom-scrollbar px-3 pb-2">
            <div className="text-xs font-bold text-stone-500 uppercase tracking-widest px-3 py-2 mb-1">
              History
            </div>
            
            {!user ? (
              <div className="px-3 py-4 text-sm text-stone-500 italic text-center border border-dashed border-stone-800 rounded-lg mx-1">
                Sign in to view your archives
              </div>
            ) : isLoading ? (
              <div className="px-3 py-4 text-center">
                  <div className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-stone-600 border-t-amber-500"></div>
              </div>
            ) : simulations.length === 0 ? (
              <div className="px-3 py-4 text-sm text-stone-600 text-center italic">
                  No councils recorded yet.
              </div>
            ) : (
              <div className="space-y-1">
                {simulations.map((sim) => (
                  <button
                    key={sim.id}
                    onClick={() => {
                      onSelectSimulation(sim);
                      if (window.innerWidth < 768) onClose();
                    }}
                    className="w-full text-left flex items-start gap-3 px-3 py-3 rounded-lg hover:bg-stone-900 group transition-colors relative overflow-hidden"
                  >
                    <MessageSquare size={16} className="mt-0.5 flex-shrink-0 text-stone-600 group-hover:text-amber-500 transition-colors" />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm text-stone-300 truncate group-hover:text-stone-100 transition-colors">
                        {sim.query}
                      </h3>
                      <p className="text-[10px] text-stone-600 mt-0.5">
                        {new Date(sim.date).toLocaleDateString()}
                      </p>
                    </div>
                    {/* Subtle fade for long text */}
                    <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-stone-950/0 via-stone-900/0 to-transparent group-hover:from-stone-900 pointer-events-none" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer / User Profile */}
          <div className="p-4 border-t border-stone-800 bg-stone-950 space-y-2">
            {user ? (
              <div className="flex items-center justify-between p-2 rounded-lg hover:bg-stone-900 transition-colors group cursor-pointer" onClick={(e) => {
                // Optional: Open a user menu
              }}>
                <div className="flex items-center gap-3 overflow-hidden">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="User" className="w-8 h-8 rounded-full border border-stone-700" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-amber-900/30 flex items-center justify-center border border-amber-700/30 text-amber-500">
                      <User size={16} />
                    </div>
                  )}
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-sm font-bold text-stone-200 truncate">{user.displayName}</p>
                    <p className="text-xs text-stone-500 truncate">Free Plan</p>
                  </div>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSignOut();
                  }}
                  className="p-2 text-stone-500 hover:text-red-400 hover:bg-red-950/30 rounded-md transition-all"
                  title="Sign Out"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <button
                onClick={handleSignIn}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-300 transition-colors"
              >
                <LogIn size={18} />
                <div className="text-left">
                  <p className="text-sm font-bold">Sign In</p>
                  <p className="text-[10px] text-stone-500">Save your councils</p>
                </div>
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};