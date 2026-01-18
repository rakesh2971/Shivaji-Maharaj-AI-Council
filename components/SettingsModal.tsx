import React, { useState, useEffect } from 'react';
import { Key, Save, ExternalLink, X, Eye, EyeOff } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [apiKey, setApiKey] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('gemini_api_key');
    if (stored) setApiKey(stored);
  }, [isOpen]);

  const handleSave = () => {
    if (apiKey.trim()) {
      localStorage.setItem('gemini_api_key', apiKey.trim());
      // Reload is often good to flush existing service instances
      window.location.reload(); 
    }
    onClose();
  };

  const handleClear = () => {
    localStorage.removeItem('gemini_api_key');
    setApiKey('');
    window.location.reload();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md bg-stone-900 border border-stone-700 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-3 text-amber-500">
              <div className="p-2 bg-amber-900/20 rounded-lg">
                <Key size={24} />
              </div>
              <h2 className="text-xl font-serif font-bold">API Configuration</h2>
            </div>
            <button onClick={onClose} className="text-stone-500 hover:text-stone-300 transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="space-y-4">
            <p className="text-sm text-stone-400">
              To use the Ashta Pradhan simulation, you need to provide your own Google Gemini API Key.
              The key is stored locally in your browser and never sent to our servers.
            </p>
            
            <a 
              href="https://aistudio.google.com/app/apikey" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              Get a free API Key from Google AI Studio <ExternalLink size={12} />
            </a>

            <div className="relative">
              <input
                type={isVisible ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Paste your Gemini API Key here..."
                className="w-full bg-black/40 border border-stone-700 rounded-lg px-4 py-3 text-stone-200 placeholder-stone-600 focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600/50 transition-all font-mono text-sm"
              />
              <button 
                onClick={() => setIsVisible(!isVisible)}
                className="absolute right-3 top-3 text-stone-500 hover:text-stone-300"
              >
                {isVisible ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3">
            {localStorage.getItem('gemini_api_key') && (
              <button 
                onClick={handleClear}
                className="px-4 py-2 text-sm text-red-400 hover:bg-red-950/20 rounded-lg transition-colors"
              >
                Clear Key
              </button>
            )}
            <button
              onClick={handleSave}
              className="flex items-center gap-2 bg-amber-700 hover:bg-amber-600 text-amber-50 px-6 py-2 rounded-lg font-bold text-sm transition-all"
            >
              <Save size={16} />
              Save & Reload
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
