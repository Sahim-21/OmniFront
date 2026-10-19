import { useEffect, useId, useRef, useState } from 'react'
import { Bot, Check, ChevronDown, Cpu, Layers } from 'lucide-react'
import { MODEL_STATUS, models } from '../models/registry.js'

const ICONS = {
  cpu: Cpu,
  layers: Layers,
}

export default function ModelSelector({ selectedModelId, onSelect }) {
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const rootRef = useRef(null)
  const listId = useId()
  const selected = models.find((model) => model.id === selectedModelId) ?? null

  useEffect(() => {
    if (!open) return undefined

    const onPointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false)
    }
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const openMenu = () => {
    const index = selected ? models.findIndex((model) => model.id === selected.id) : -1
    setActiveIndex(index)
    setOpen(true)
  }

  const choose = (model) => {
    if (model.status !== MODEL_STATUS.AVAILABLE) return
    onSelect(model.id)
    setOpen(false)
  }

  const onTriggerKeyDown = (event) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      openMenu()
    }
  }

  const onListKeyDown = (event) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((index) => (index + 1) % models.length)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((index) => (index <= 0 ? models.length - 1 : index - 1))
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      if (activeIndex >= 0) choose(models[activeIndex])
    } else if (event.key === 'Escape') {
      event.preventDefault()
      setOpen(false)
    }
  }

  const SelectedIcon = selected ? (ICONS[selected.icon] ?? Cpu) : Bot
  const triggerLabel = selected ? selected.name : 'Select Model'

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={selected ? `Select model. Current model: ${selected.name}` : 'Select model'}
        onClick={() => (open ? setOpen(false) : openMenu())}
        onKeyDown={onTriggerKeyDown}
        className="flex items-center gap-1.5 max-w-[11rem] sm:max-w-[14rem] px-2 py-1 rounded-xl border border-[var(--border-subtle)] bg-[var(--chip-fill)] text-[var(--text)] hover:border-[var(--accent-border-30)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-ring-20)] cursor-pointer"
      >
        <SelectedIcon className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" aria-hidden="true" />
        <span className="text-[10px] font-semibold tracking-wide truncate">{triggerLabel}</span>
        <ChevronDown className={`w-3 h-3 text-[var(--text-muted)] shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>

      {open && (
        <div
          id={listId}
          role="listbox"
          aria-label="Select model"
          tabIndex={-1}
          onKeyDown={onListKeyDown}
          ref={(node) => node?.focus()}
          className="absolute left-0 top-[calc(100%+0.35rem)] z-30 w-64 rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl p-1.5"
        >
          <p className="px-2 pt-1 pb-1.5 text-[9px] font-bold tracking-widest uppercase text-[var(--text-muted)]">
            Select Model
          </p>
          <ul className="space-y-1">
            {models.map((model, index) => {
              const Icon = ICONS[model.icon] ?? Cpu
              const available = model.status === MODEL_STATUS.AVAILABLE
              const isSelected = selected?.id === model.id
              const isActive = index === activeIndex

              return (
                <li key={model.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    aria-disabled={!available}
                    disabled={!available}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => choose(model)}
                    className={`w-full text-left rounded-xl px-2.5 py-2 flex items-start gap-2 border transition-colors ${
                      isActive
                        ? 'border-[var(--accent-border-25)] bg-[var(--accent-soft)]'
                        : 'border-transparent'
                    } ${available ? 'cursor-pointer' : 'cursor-not-allowed opacity-70'}`}
                  >
                    <Icon className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${available ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'}`} aria-hidden="true" />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1.5">
                        <span className={`text-[11px] font-semibold ${available ? 'text-[var(--text)]' : 'text-[var(--text-muted)]'}`}>
                          {model.name}
                        </span>
                        {isSelected && <Check className="w-3 h-3 text-[var(--accent)]" aria-hidden="true" />}
                      </span>
                      <span className="block text-[9px] leading-snug text-[var(--text-muted)] mt-0.5">
                        {available ? model.description : 'Coming soon'}
                      </span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}
