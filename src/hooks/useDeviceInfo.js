import { useState, useEffect } from 'react'

const GB = 1024 ** 3

// Browsers only expose rough values, so everything here is an estimate:
// - deviceMemory is rounded and capped (Chrome reports at most 8) and missing in Firefox/Safari.
// - storage.estimate() reports the browser's storage quota, not free disk space.
// - GPU memory (VRAM) cannot be read from the browser at all.
function readSync() {
  const nav = typeof navigator === 'undefined' ? {} : navigator
  return {
    ramGB: typeof nav.deviceMemory === 'number' ? nav.deviceMemory : null,
    ramCapped: typeof nav.deviceMemory === 'number' && nav.deviceMemory >= 8,
    cores: typeof nav.hardwareConcurrency === 'number' ? nav.hardwareConcurrency : null,
  }
}

export default function useDeviceInfo() {
  const [info] = useState(readSync)
  const [storageGB, setStorageGB] = useState(null)

  useEffect(() => {
    let cancelled = false
    if (!navigator.storage?.estimate) return
    navigator.storage.estimate()
      .then(({ quota, usage }) => {
        if (cancelled || typeof quota !== 'number') return
        setStorageGB(Math.max(0, quota - (usage ?? 0)) / GB)
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])

  return { ...info, storageGB }
}
