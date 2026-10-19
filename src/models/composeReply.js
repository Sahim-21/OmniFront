import { MODEL_STATUS } from './registry.js'

export const SELECT_MODEL_PROMPT = 'Please select a model first.'

const UNSUPPORTED_MODEL_MESSAGE =
  'This model is not available. OmniRAG currently runs only the in-browser simulated reply for IEEE Model. No other RAG pipeline is connected, so this request was not sent anywhere.'

function localSimulatedBody(query, documentCount) {
  const lowerQuery = query.toLowerCase()

  if (lowerQuery.includes('architecture') || lowerQuery.includes('doctify')) {
    return `I searched your local vector store for references to **Doctify**. 

Based on **Doctify_Architecture.pdf** (Section 3.2: System Topology):
- The system uses a federated ingestion model.
- Vector embeddings are generated locally using a lightweight transformer (e.g., \`all-MiniLM-L6-v2\`).
- Storage is managed on-device via SQLite and HNSW indexing for rapid retrieval.

Would you like me to extract the API contract details from page 14 of the architecture PDF?`
  }

  if (lowerQuery.includes('hello') || lowerQuery.includes('hi')) {
    return `Greetings! I am your local offline AI. I have vectorized **${documentCount} active document(s)** in your workspace. You can query them directly without sending any data to the cloud.`
  }

  return `Query received: *"${query}"*
Searching local index... **Found 3 relevant chunks** in **Doctify_Architecture.pdf**.

The offline engine synthesized this response entirely on-device. Let me know if you would like to search for other topics or refine the local retrieval chunk settings.`
}

/**
 * Builds the chat reply for the selected model.
 * Only IEEE Model is supported, and it stays on the existing local simulation.
 */
export function composeLocalReply({ query, documentCount, model }) {
  if (!model) {
    return { ok: false, modelId: null, text: SELECT_MODEL_PROMPT }
  }

  if (model.status !== MODEL_STATUS.AVAILABLE) {
    return { ok: false, modelId: model.id, text: UNSUPPORTED_MODEL_MESSAGE }
  }

  const body = localSimulatedBody(query, documentCount)
  const text = `${body}

— ${model.name}: in-browser simulation only. No backend RAG pipeline is connected.`

  return { ok: true, modelId: model.id, text }
}
