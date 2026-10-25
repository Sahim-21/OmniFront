import { useRef } from 'react'
import { Check, Download, Trash2, X, AlertTriangle, Sparkles, Cpu } from 'lucide-react'
import { catalog, recommendTier, TIER_LABELS } from '../models/catalog.js'
import { STATUS } from '../hooks/useModelManager.js'
import useDialogA11y from '../hooks/useDialogA11y.js'

const fmtGB = (gb) => (gb >= 10 ? Math.round(gb) : gb.toFixed(1))

function DeviceSummary({ device }) {
  const ram = device.ramGB == null
    ? 'RAM unknown'
    : `~${device.ramGB}${device.ramCapped ? '+' : ''} GB RAM`
  const cores = device.cores == null ? null : `${device.cores} CPU threads`
  const storage = device.storageGB == null ? null : `~${fmtGB(device.storageGB)} GB browser storage`

  return (
    <div className="mt-4 px-3.5 py-2.5 rounded-2xl bg-[var(--chip-fill)] border border-[var(--border-subtle)] text-[10px] text-[var(--text-muted)] flex flex-wrap items-center gap-x-3 gap-y-1">
      <span className="font-bold tracking-wider uppercase text-[var(--text-subtle)]">Your device (estimate)</span>
      <span className="font-mono text-[var(--text)]">{[ram, cores, storage].filter(Boolean).join(' · ')}</span>
      <span className="basis-full text-[var(--text-subtle)]">
        Browsers only report rough values and cannot see GPU memory, so recommendations use RAM only.
      </span>
    </div>
  )
}

function VersionCard({ model, version, device, recommended, state, manager }) {
  const { status, progress } = state
  const exceedsRam = device.ramGB != null && version.minRam > device.ramGB
  const isActive = status === STATUS.ACTIVE

  return (
    <div className={`flex flex-col rounded-2xl border p-3.5 transition-colors ${
      isActive
        ? 'bg-[var(--accent-soft)] border-[var(--accent-border-30)]'
        : 'bg-[var(--chip-fill)] border-[var(--border-subtle)]'
    }`}>
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <span className="text-xs font-semibold text-[var(--text)]">{TIER_LABELS[version.tier]}</span>
        {recommended && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-center bg-[color-mix(in_srgb,var(--success)_14%,transparent)] border border-[color-mix(in_srgb,var(--success)_25%,transparent)] text-[9px] font-semibold text-[var(--success)] whitespace-nowrap">
            <Sparkles className="w-2.5 h-2.5" aria-hidden="true" />
            Recommended for your laptop
          </span>
        )}
      </div>

      <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[10px] mb-3">
        <div><dt className="text-[var(--text-subtle)]">Size</dt><dd className="font-mono text-[var(--text)]">{version.size}</dd></div>
        <div><dt className="text-[var(--text-subtle)]">RAM needed</dt><dd className="font-mono text-[var(--text)]">{version.minRam} GB</dd></div>
        <div><dt className="text-[var(--text-subtle)]">Speed</dt><dd className="text-[var(--text)]">{version.speed}</dd></div>
        <div><dt className="text-[var(--text-subtle)]">Quality</dt><dd className="text-[var(--text)]">{version.quality}</dd></div>
        {version.minVram > 0 && (
          <div className="col-span-2"><dt className="text-[var(--text-subtle)]">GPU memory (optional)</dt><dd className="font-mono text-[var(--text)]">{version.minVram} GB</dd></div>
        )}
      </dl>

      {exceedsRam && (
        <p className="flex items-start gap-1.5 mb-3 text-[10px] leading-snug text-[var(--warning)]">
          <AlertTriangle className="w-3 h-3 mt-px shrink-0" aria-hidden="true" />
          Needs {version.minRam} GB RAM; your device reports about {device.ramGB} GB. It may run slowly or fail.
        </p>
      )}

      <div className="mt-auto">
        {status === STATUS.NOT_INSTALLED && (
          <button
            type="button"
            onClick={() => manager.download(model.id, version.tier)}
            className="w-full min-h-11 lg:min-h-0 py-2 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--text)] text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" aria-hidden="true" />
            {exceedsRam ? 'Download anyway' : 'Download'}
          </button>
        )}

        {status === STATUS.DOWNLOADING && (
          <div>
            <div
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(progress)}
              aria-label={`Downloading ${model.name} ${TIER_LABELS[version.tier]}`}
              className="h-1.5 rounded-full bg-[var(--border-subtle)] overflow-hidden"
            >
              <div className="h-full bg-[var(--accent)] transition-[width] duration-200" style={{ width: `${progress}%` }}></div>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-[10px] font-mono text-[var(--text-muted)]">{Math.round(progress)}%</span>
              <button
                type="button"
                onClick={() => manager.cancel(model.id, version.tier)}
                className="min-h-11 lg:min-h-0 px-3 py-1 rounded-lg text-[10px] font-semibold text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-[var(--chip-fill)] transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {status === STATUS.INSTALLED && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => manager.setActive(model.id, version.tier)}
              className="flex-1 min-h-11 lg:min-h-0 py-2 rounded-xl bg-[var(--accent-soft)] hover:bg-[var(--accent-border-25)] border border-[var(--accent-border-25)] text-[var(--accent)] text-[11px] font-semibold transition-colors cursor-pointer"
            >
              Set Active
            </button>
            <button
              type="button"
              onClick={() => manager.remove(model.id, version.tier)}
              className="tap-target p-2 rounded-xl text-[var(--text-subtle)] hover:text-[var(--danger)] hover:bg-[var(--chip-fill)] transition-colors cursor-pointer"
              title="Delete download"
              aria-label={`Delete ${model.name} ${TIER_LABELS[version.tier]}`}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {isActive && (
          <div className="flex items-center gap-2">
            <span className="flex-1 min-h-11 lg:min-h-0 py-2 rounded-xl bg-[var(--accent)] text-[var(--text)] text-[11px] font-semibold flex items-center justify-center gap-1.5">
              <Check className="w-3.5 h-3.5" aria-hidden="true" />
              Active
            </span>
            <button
              type="button"
              onClick={() => manager.remove(model.id, version.tier)}
              className="tap-target p-2 rounded-xl text-[var(--text-subtle)] hover:text-[var(--danger)] hover:bg-[var(--chip-fill)] transition-colors cursor-pointer"
              title="Delete (deactivates this model)"
              aria-label={`Delete ${model.name} ${TIER_LABELS[version.tier]}`}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ModelSelector({ open, onClose, manager, device }) {
  const dialogRef = useRef(null)

  useDialogA11y({ open, onClose, containerRef: dialogRef })

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-[color-mix(in_srgb,var(--bg)_70%,transparent)] backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="models-title"
        tabIndex={-1}
        className="w-full max-w-5xl max-h-[94dvh] overflow-y-auto bg-[var(--surface-glass-60)] backdrop-blur-2xl border border-[var(--border-strong)] shadow-2xl rounded-3xl p-4 sm:p-5 md:p-7 outline-none text-[var(--text)]"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="models-title" className="text-sm font-semibold tracking-wider uppercase">Models</h2>
            <p className="text-[11px] text-[var(--text-muted)] mt-1">
              Downloads are simulated in this preview. Nothing is actually installed on your device.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="tap-target p-1.5 rounded-lg text-[var(--text-subtle)] hover:text-[var(--text)] hover:bg-[var(--chip-fill)] transition-colors cursor-pointer"
            title="Close"
            aria-label="Close models"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <DeviceSummary device={device} />

        <div className="mt-6 space-y-7">
          {catalog.map(model => {
            const recommendedTier = recommendTier(model, device.ramGB)
            return (
              <section key={model.id} aria-label={model.name}>
                <div className="flex items-center gap-2 mb-1">
                  <Cpu className="w-3.5 h-3.5 text-[var(--accent)]" aria-hidden="true" />
                  <h3 className="text-xs font-semibold">{model.name}</h3>
                </div>
                <p className="text-[10px] text-[var(--text-muted)] mb-3">{model.description}</p>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                  {model.versions.map(version => (
                    <VersionCard
                      key={version.tier}
                      model={model}
                      version={version}
                      device={device}
                      recommended={recommendedTier === version.tier}
                      state={manager.getVersionState(model.id, version.tier)}
                      manager={manager}
                    />
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      </div>
    </div>
  )
}
