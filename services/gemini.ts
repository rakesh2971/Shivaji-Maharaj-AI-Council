import { GoogleGenAI } from '@google/genai';
import { AgentRole, AgentResponse, HistoryItem } from '../types';
import { SYSTEM_INSTRUCTION_BASE, getRouterPrompt, getMinisterPrompt, getCritiquePrompt, getPeshwaPrompt } from '../constants';

// We initialize a new client for each request to ensure fresh state
const getClient = () => {
  // API Key must be obtained exclusively from process.env.API_KEY
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
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
    console.error("Gemini API Error:", error);
    throw error;
  }
}

export const AgentService = {
  // THE ROUTER (Darbar Host)
  async identifyRelevantAgents(query: string, history: HistoryItem[]): Promise<{ selected_agents: AgentRole[], reasoning: string }> {
    const prompt = getRouterPrompt(query, history);
    // Use Flash for low-latency routing
    return callGemini('gemini-3-flash-preview', prompt, SYSTEM_INSTRUCTION_BASE);
  },

  async getMinisterOpinion(role: AgentRole, query: string, context: string[], history: HistoryItem[]): Promise<AgentResponse> {
    const prompt = getMinisterPrompt(role, query, context, history);
    // Using flash for parallel minister agents for speed
    return callGemini('gemini-3-flash-preview', prompt, SYSTEM_INSTRUCTION_BASE);
  },

  async getCritique(query: string, ministerResponses: AgentResponse[], history: HistoryItem[]): Promise<AgentResponse> {
    const prompt = getCritiquePrompt(query, ministerResponses, history);
    // Using Pro for the critic to have deeper reasoning capabilities
    return callGemini('gemini-3-pro-preview', prompt, SYSTEM_INSTRUCTION_BASE);
  },

  async getFinalVerdict(query: string, ministerResponses: AgentResponse[], critique: AgentResponse, history: HistoryItem[]): Promise<AgentResponse> {
    const prompt = getPeshwaPrompt(query, ministerResponses, critique, history);
    // Using Pro for the final synthesis
    return callGemini('gemini-3-pro-preview', prompt, SYSTEM_INSTRUCTION_BASE);
  }
};