import { useState, useEffect, useCallback, useRef } from 'react'
import { getCatalogModel } from '../models/catalog.js'

// MOCK downloader. All model operations go through this hook so a real
// backend (download service, local runtime) can replace the timers later.
const STORAGE_KEY = 'omnifront.models'
const DOWNLOAD_MS = 8000
const TICK_MS = 200
// Mock failure rate so the error path can be exercised; set to 0 to disable.
const FAILURE_RATE = 0.1

export const STATUS = {
  NOT_INSTALLED: 'not-installed',
  DOWNLOADING: 'downloading',
  INSTALLED: 'installed',
  ACTIVE: 'active',
}

const keyOf = (modelId, tier) => `${modelId}:${tier}`

function isValidKey(key) {
  if (typeof key !== 'string') return false
  const [modelId, tier] = key.split(':')
  return !!getCatalogModel(modelId)?.versions.some(v => v.tier === tier)
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
    const installed = Array.isArray(saved?.installed) ? saved.installed.filter(isValidKey) : []
    const active = installed.includes(saved?.active) ? saved.active : null
    return { installed, active }
  } catch {
    return { installed: [], active: null }
  }
}

export default function useModelManager({ onError, onSuccess } = {}) {
  const [{ installed, active }, setSaved] = useState(loadState)
  const [downloads, setDownloads] = useState({}) // key -> progress 0..100
  const timers = useRef({})
  const onErrorRef = useRef(onError)
  const onSuccessRef = useRef(onSuccess)

  useEffect(() => {
    onErrorRef.current = onError
    onSuccessRef.current = onSuccess
  }, [onError, onSuccess])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ installed, active }))
    } catch {
      // Storage unavailable; state just won't persist
    }
  }, [installed, active])

  // Stop any running mock downloads on unmount
  useEffect(() => {
    const running = timers.current
    return () => Object.values(running).forEach(clearInterval)
  }, [])

  const clearTimer = (key) => {
    clearInterval(timers.current[key])
    delete timers.current[key]
  }

  const download = useCallback((modelId, tier) => {
    const key = keyOf(modelId, tier)
    if (timers.current[key] || !isValidKey(key)) return

    const label = `${getCatalogModel(modelId).name} (${tier})`
    const failAt = Math.random() < FAILURE_RATE ? 20 + Math.random() * 60 : null
    const fail = (reason) => {
      clearTimer(key)
      setDownloads(({ [key]: _failed, ...rest }) => rest)
      onErrorRef.current?.(`Download failed for ${label}: ${reason}`)
    }

    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      onErrorRef.current?.(`Can't download ${label} while offline. Check your connection and try again.`)
      return
    }

    let progress = 0
    setDownloads(prev => ({ ...prev, [key]: 0 }))
    timers.current[key] = setInterval(() => {
      progress = Math.min(100, progress + 100 / (DOWNLOAD_MS / TICK_MS))
      if (navigator.onLine === false) return fail('connection lost.')
      if (failAt !== null && progress >= failAt) return fail('the server dropped the connection. Please try again.')
      if (progress < 100) {
        setDownloads(prev => ({ ...prev, [key]: progress }))
        return
      }
      clearTimer(key)
      setDownloads(({ [key]: _done, ...rest }) => rest)
      setSaved(prev => (prev.installed.includes(key) ? prev : { ...prev, installed: [...prev.installed, key] }))
      onSuccessRef.current?.(`${label} downloaded. Set it active to start chatting.`)
    }, TICK_MS)
  }, [])

  const cancel = useCallback((modelId, tier) => {
    const key = keyOf(modelId, tier)
    clearTimer(key)
    setDownloads(({ [key]: _cancelled, ...rest }) => rest)
  }, [])

  const remove = useCallback((modelId, tier) => {
    const key = keyOf(modelId, tier)
    setSaved(prev => ({
      installed: prev.installed.filter(k => k !== key),
      active: prev.active === key ? null : prev.active,
    }))
  }, [])

  const setActive = useCallback((modelId, tier) => {
    const key = keyOf(modelId, tier)
    setSaved(prev => (prev.installed.includes(key) ? { ...prev, active: key } : prev))
  }, [])

  const getVersionState = (modelId, tier) => {
    const key = keyOf(modelId, tier)
    if (key in downloads) return { status: STATUS.DOWNLOADING, progress: downloads[key] }
    if (active === key) return { status: STATUS.ACTIVE, progress: 100 }
    if (installed.includes(key)) return { status: STATUS.INSTALLED, progress: 100 }
    return { status: STATUS.NOT_INSTALLED, progress: 0 }
  }

  const activeModel = active
    ? (() => {
        const [modelId, tier] = active.split(':')
        return { modelId, tier, model: getCatalogModel(modelId) }
      })()
    : null

  return { hasInstalled: installed.length > 0, getVersionState, download, cancel, remove, setActive, activeModel }
}
