import { GoogleGenAI } from '@google/genai';
import { AgentRole, AgentResponse, HistoryItem } from '../types';
import { SYSTEM_INSTRUCTION_BASE, getRouterPrompt, getMinisterPrompt, getCritiquePrompt, getPeshwaPrompt } from '../constants';

// HELPER: Get API Key from storage or env
export const getApiKey = (): string | null => {
  // 1. Check Local Storage (User provided key)
  const storedKey = localStorage.getItem('gemini_api_key');
  if (storedKey) return storedKey;

  // 2. Check Environment Variable (Dev mode or Self-hosted)
  // We use string access to avoid build errors if env is undefined
  if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
    return process.env.API_KEY;
  }
  
  return null;
};

// We initialize a new client for each request to ensure fresh state/key usage
const getClient = () => {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("API_KEY_MISSING");
  }
  return new GoogleGenAI({ apiKey });
};

// Generic function to call Gemini with a prompt and expect JSON
async function callGemini(model: string, prompt: string, systemInstruction: string): Promise<any> {
  try {
    const ai = getClient();
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: 'application/json',
      }
    });
    
    const text = response.text;
    if (!text) throw new Error("Empty response from Gemini");
    
    return JSON.parse(text);
  } catch (error: any) {
    if (error.message === "API_KEY_MISSING") {
      throw error; // Re-throw to be caught by UI
    }
    console.error("Gemini API Error:", error);
    throw error;
  }
}

export const AgentService = {
  // THE ROUTER (Darbar Host)
  async identifyRelevantAgents(query: string, history: HistoryItem[]): Promise<{ selected_agents: AgentRole[], reasoning: string }> {
    const prompt = getRouterPrompt(query, history);
    // Use Flash for low-latency routing
    return callGemini('gemini-2.0-flash', prompt, SYSTEM_INSTRUCTION_BASE);
  },

  async getMinisterOpinion(role: AgentRole, query: string, context: string[], history: HistoryItem[]): Promise<AgentResponse> {
    const prompt = getMinisterPrompt(role, query, context, history);
    // Using flash for parallel minister agents for speed
    return callGemini('gemini-2.0-flash', prompt, SYSTEM_INSTRUCTION_BASE);
  },

  async getCritique(query: string, ministerResponses: AgentResponse[], history: HistoryItem[]): Promise<AgentResponse> {
    const prompt = getCritiquePrompt(query, ministerResponses, history);
    // Using Pro for the critic to have deeper reasoning capabilities
    return callGemini('gemini-2.0-pro-exp-02-05', prompt, SYSTEM_INSTRUCTION_BASE);
  },

  async getFinalVerdict(query: string, ministerResponses: AgentResponse[], critique: AgentResponse, history: HistoryItem[]): Promise<AgentResponse> {
    const prompt = getPeshwaPrompt(query, ministerResponses, critique, history);
    // Using Pro for the final synthesis
    return callGemini('gemini-2.0-pro-exp-02-05', prompt, SYSTEM_INSTRUCTION_BASE);
  }
};
