export const MODEL_STATUS = {
  AVAILABLE: 'available',
  COMING_SOON: 'coming_soon',
}

/**
 * Registry of chat models. Add a new entry here when a real pipeline exists.
 * `status: coming_soon` keeps the option visible but not selectable.
 */
export const models = [
  {
    id: 'ieee',
    name: 'IEEE Model',
    description: 'Uses the existing in-browser simulated reply. No separate backend pipeline is connected.',
    status: MODEL_STATUS.AVAILABLE,
    icon: 'cpu',
  },
  {
    id: 'more-models',
    name: 'More Models — Coming Soon',
    description: 'Additional RAG pipelines are not connected yet.',
    status: MODEL_STATUS.COMING_SOON,
    icon: 'layers',
  },
]

export function getModelById(id) {
  return models.find((model) => model.id === id) ?? null
}

/** Returns the model only when the user has chosen an available one. */
export function resolveSelectedModel(id) {
  if (!id) return null
  const model = getModelById(id)
  if (!model || model.status !== MODEL_STATUS.AVAILABLE) return null
  return model
}
