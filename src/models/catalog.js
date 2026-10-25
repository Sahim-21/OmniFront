// Mock model catalog. A real backend can serve this same shape later.
// sizeGB is the numeric form of `size`; minRam/minVram are in GB.
export const TIERS = ['low', 'medium', 'high']

export const TIER_LABELS = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
}

export const catalog = [
  {
    id: 'ieee',
    name: 'IEEE Model',
    description: 'General-purpose local RAG model tuned for technical and research documents.',
    versions: [
      { tier: 'low', size: '1.2 GB', sizeGB: 1.2, minRam: 4, minVram: 0, speed: 'Fast', quality: 'Basic' },
      { tier: 'medium', size: '4.5 GB', sizeGB: 4.5, minRam: 8, minVram: 4, speed: 'Medium', quality: 'Good' },
      { tier: 'high', size: '12 GB', sizeGB: 12, minRam: 16, minVram: 8, speed: 'Slower', quality: 'Best' },
    ],
  },
  {
    id: 'atlas',
    name: 'Atlas Model',
    description: 'Long-context model for summarizing and cross-referencing large document sets.',
    versions: [
      { tier: 'low', size: '1.8 GB', sizeGB: 1.8, minRam: 4, minVram: 0, speed: 'Fast', quality: 'Basic' },
      { tier: 'medium', size: '6 GB', sizeGB: 6, minRam: 8, minVram: 4, speed: 'Medium', quality: 'Good' },
      { tier: 'high', size: '15 GB', sizeGB: 15, minRam: 16, minVram: 10, speed: 'Slower', quality: 'Best' },
    ],
  },
  {
    id: 'sage',
    name: 'Sage Code Model',
    description: 'Code-aware model for questions about source files and technical specs.',
    versions: [
      { tier: 'low', size: '0.9 GB', sizeGB: 0.9, minRam: 4, minVram: 0, speed: 'Fast', quality: 'Basic' },
      { tier: 'medium', size: '3.8 GB', sizeGB: 3.8, minRam: 8, minVram: 4, speed: 'Medium', quality: 'Good' },
      { tier: 'high', size: '9 GB', sizeGB: 9, minRam: 16, minVram: 6, speed: 'Slower', quality: 'Best' },
    ],
  },
]

export function getCatalogModel(id) {
  return catalog.find((model) => model.id === id) ?? null
}

/**
 * Best (highest) tier whose RAM requirement fits the estimated device.
 * Returns null when RAM is unknown or even the lowest tier does not fit.
 */
export function recommendTier(model, ramGB) {
  if (ramGB == null) return null
  const fitting = model.versions.filter((version) => version.minRam <= ramGB)
  return fitting.length ? fitting[fitting.length - 1].tier : null
}
