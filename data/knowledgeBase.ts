import { RAGDocument } from '../types';

// In a real backend, this would be in FAISS/Chroma. 
// Here we simulate the "Retrieval" part of RAG with a client-side keyword matcher.
export const KNOWLEDGE_BASE: RAGDocument[] = [
  {
    id: 'adnyapatra_finance_1',
    source: 'Adnyapatra - Treasury Management',
    content: 'The treasury is the lifeblood of the state. Do not overtax the ryots (farmers) in times of famine. A king who fills his treasury by oppression destroys the foundations of his kingdom. Revenue should be collected flexibly based on yield.',
    tags: ['finance', 'tax', 'revenue', 'amatya']
  },
  {
    id: 'adnyapatra_forts_1',
    source: 'Adnyapatra - Fort Administration',
    content: 'Forts are the essence of the kingdom. They should be stocked with grain, ammunition, and water to last for years. Do not trust a single officer with all authority in a fort; maintain a balance between the Havaldar, Sabnis, and Karkhanis.',
    tags: ['defense', 'forts', 'military', 'senapati']
  },
  {
    id: 'military_doctrine_1',
    source: 'Maratha Military Strategy',
    content: 'Guerrilla warfare (Ganimi Kava) is preferred over open field battles against superior numbers. Cut off the enemy\'s supply lines. Avoid engagement during the monsoon unless necessary.',
    tags: ['defense', 'strategy', 'war', 'senapati']
  },
  {
    id: 'governance_land_1',
    source: 'Royal Edict on Land Rights',
    content: 'Watandars (hereditary landholders) should not be allowed to abuse their power. The state must directly administer justice and revenue collection where possible to prevent feudal tyranny.',
    tags: ['administration', 'justice', 'land', 'sachiv', 'nyayadhish']
  },
  {
    id: 'intelligence_1',
    source: 'Principles of Spymaster Bahirji Naik',
    content: 'Intelligence must precede action. Know the enemy\'s intent before they move. Spies should be disguised as merchants, ascetics, or travelers to gather unfiltered news.',
    tags: ['intelligence', 'internal affairs', 'spies', 'mantri']
  },
  {
    id: 'foreign_policy_1',
    source: 'Treaty Protocols with Foreign Powers',
    content: 'Do not trust the foreign merchants (Portuguese, British, Dutch) blindly. They come to trade but aim to conquer. Restrict their factories to the coast; do not allow them near the capital. Maintain diplomatic channels but keep the powder dry.',
    tags: ['foreign', 'diplomacy', 'trade', 'sumant', 'treaty']
  },
  {
    id: 'religious_dharma_1',
    source: 'Decree on Religious Harmony',
    content: 'The King must protect cows and Brahmins, but also respect the holy places of Islam. Grants given to mosques and temples by previous rulers must be continued. Merit is the only caste in service of the Swarajya.',
    tags: ['religion', 'charity', 'culture', 'panditrao', 'ethics']
  }
];

export const retrieveContext = (query: string): string[] => {
  const lowerQuery = query.toLowerCase();
  // Simple heuristic scoring for simulation
  const scoredDocs = KNOWLEDGE_BASE.map(doc => {
    let score = 0;
    doc.tags.forEach(tag => {
      if (lowerQuery.includes(tag)) score += 2;
    });
    if (doc.content.toLowerCase().includes(lowerQuery)) score += 1;
    return { doc, score };
  });

  // Return top 4 matches if score > 0 to accommodate wider context
  return scoredDocs
    .filter(d => d.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map(d => `[Source: ${d.doc.source}] ${d.doc.content}`);
};