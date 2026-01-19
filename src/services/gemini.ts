import { GoogleGenAI } from "@google/genai";
import { AgentRole, AgentResponse, HistoryItem } from "../types";
import {
  SYSTEM_INSTRUCTION_BASE,
  getRouterPrompt,
  getMinisterPrompt,
  getCritiquePrompt,
  getPeshwaPrompt,
} from "../constants";

/**
 * Create a Gemini client using a Vite-exposed environment variable.
 * NOTE: This runs in the browser. The API key will be public.
 */
const getClient = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "VITE_GEMINI_API_KEY is not set. Please configure it in Render or your local .env file."
    );
  }

  return new GoogleGenAI({ apiKey });
};

/**
 * Generic helper to call Gemini and parse JSON output
 */
async function callGemini(
  model: string,
  prompt: string,
  systemInstruction: string
): Promise<any> {
  try {
    const ai = getClient();

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("Empty response from Gemini");
    }

    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
}

/**
 * Agent orchestration service
 */
export const AgentService = {
  // ROUTER (Darbar Host)
  async identifyRelevantAgents(
    query: string,
    history: HistoryItem[]
  ): Promise<{ selected_agents: AgentRole[]; reasoning: string }> {
    const prompt = getRouterPrompt(query, history);
    return callGemini(
      "gemini-3-flash-preview",
      prompt,
      SYSTEM_INSTRUCTION_BASE
    );
  },

  // PARALLEL MINISTERS
  async getMinisterOpinion(
    role: AgentRole,
    query: string,
    context: string[],
    history: HistoryItem[]
  ): Promise<AgentResponse> {
    const prompt = getMinisterPrompt(role, query, context, history);
    return callGemini(
      "gemini-3-flash-preview",
      prompt,
      SYSTEM_INSTRUCTION_BASE
    );
  },

  // CRITIC (Judge)
  async getCritique(
    query: string,
    ministerResponses: AgentResponse[],
    history: HistoryItem[]
  ): Promise<AgentResponse> {
    const prompt = getCritiquePrompt(query, ministerResponses, history);
    return callGemini(
      "gemini-3-pro-preview",
      prompt,
      SYSTEM_INSTRUCTION_BASE
    );
  },

  // FINAL VERDICT (Peshwa)
  async getFinalVerdict(
    query: string,
    ministerResponses: AgentResponse[],
    critique: AgentResponse,
    history: HistoryItem[]
  ): Promise<AgentResponse> {
    const prompt = getPeshwaPrompt(
      query,
      ministerResponses,
      critique,
      history
    );
    return callGemini(
      "gemini-3-pro-preview",
      prompt,
      SYSTEM_INSTRUCTION_BASE
    );
  },
};
