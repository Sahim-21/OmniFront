import { useState, useEffect, useCallback, useRef } from 'react'

const STORAGE_KEY = 'omnifront.speech'
const DEFAULTS = { voiceURI: '', rate: 1, autoRead: false }

const supported = typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window

function loadSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
    return {
      voiceURI: typeof saved?.voiceURI === 'string' ? saved.voiceURI : DEFAULTS.voiceURI,
      rate: Math.min(2, Math.max(0.5, Number(saved?.rate) || DEFAULTS.rate)),
      autoRead: saved?.autoRead === true
    }
  } catch {
    return DEFAULTS
  }
}

// Remove markdown symbols so they are not read out loud.
export function stripMarkdown(text) {
  return text
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/^\s{0,3}#{1,6}\s+/gm, '')
    .replace(/^\s{0,3}>\s?/gm, '')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    .replace(/^\s*([-*_]\s*){3,}$/gm, ' ')
    .replace(/(\*\*|__|\*|_|~~)/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export default function useSpeech() {
  const [voices, setVoices] = useState([])
  const [settings, setSettings] = useState(loadSettings)
  const [speakingId, setSpeakingId] = useState(null)
  const [isPaused, setIsPaused] = useState(false)
  const currentUtterance = useRef(null)

  // Voices often load late, so listen for voiceschanged
  useEffect(() => {
    if (!supported) return
    const synth = window.speechSynthesis
    const update = () => setVoices(synth.getVoices())
    update()
    synth.addEventListener('voiceschanged', update)
    return () => synth.removeEventListener('voiceschanged', update)
  }, [])

  // Cancel speech on unmount (this also covers logout, which unmounts the chat)
  useEffect(() => {
    if (!supported) return
    return () => window.speechSynthesis.cancel()
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
    } catch {
      // Storage unavailable; settings just won't persist
    }
  }, [settings])

  const selectedVoice = voices.find(v => v.voiceURI === settings.voiceURI) ?? null

  const stop = useCallback(() => {
    if (!supported) return
    currentUtterance.current = null
    window.speechSynthesis.cancel()
    setSpeakingId(null)
    setIsPaused(false)
  }, [])

  const speak = useCallback((id, text) => {
    if (!supported) return
    const clean = stripMarkdown(text)
    if (!clean) return

    // Only one message speaks at a time
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(clean)
    if (selectedVoice) {
      utterance.voice = selectedVoice
      utterance.lang = selectedVoice.lang
    }
    utterance.rate = settings.rate

    // Ignore end/error events from an utterance that was replaced or stopped
    const finish = () => {
      if (currentUtterance.current !== utterance) return
      currentUtterance.current = null
      setSpeakingId(null)
      setIsPaused(false)
    }
    utterance.onend = finish
    utterance.onerror = finish

    currentUtterance.current = utterance
    setSpeakingId(id)
    setIsPaused(false)
    window.speechSynthesis.speak(utterance)
  }, [selectedVoice, settings.rate])

  const pause = useCallback(() => {
    if (!supported) return
    window.speechSynthesis.pause()
    setIsPaused(true)
  }, [])

  const resume = useCallback(() => {
    if (!supported) return
    window.speechSynthesis.resume()
    setIsPaused(false)
  }, [])

  const setVoice = useCallback((voiceURI) => {
    setSettings(prev => ({ ...prev, voiceURI }))
  }, [])

  const setRate = useCallback((rate) => {
    setSettings(prev => ({ ...prev, rate }))
  }, [])

  const setAutoRead = useCallback((autoRead) => {
    setSettings(prev => ({ ...prev, autoRead }))
  }, [])

  return {
    speak,
    pause,
    resume,
    stop,
    speakingId,
    isPaused,
    voices,
    selectedVoice,
    setVoice,
    rate: settings.rate,
    setRate,
    autoRead: settings.autoRead,
    setAutoRead,
    supported
  }
}
