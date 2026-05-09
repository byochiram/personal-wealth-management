'use client'

/**
 * Web Speech API wrapper — Indonesian voice → text.
 *
 * Browser support:
 *   - Chrome / Edge / Opera (desktop + Android): excellent
 *   - Safari (iOS 14.5+ / macOS): good (uses Apple's on-device model)
 *   - Firefox: NOT supported (no implementation)
 *
 * For unsupported browsers, `supported` is false — UI should hide the mic
 * button. No fallback to cloud Whisper here (keeps cost predictable).
 *
 * Locale is hard-coded id-ID — works well for Indonesian phrases like
 * "indomaret empat puluh tujuh ribu cash".
 */

import { useCallback, useEffect, useRef, useState } from 'react'

// ---------- Web Speech API typing (browsers ship this under different globals) ----------

interface SpeechRecognitionAlternative {
  transcript: string
  confidence: number
}

interface SpeechRecognitionResult {
  readonly isFinal: boolean
  readonly length: number
  item(index: number): SpeechRecognitionAlternative
  [index: number]: SpeechRecognitionAlternative
}

interface SpeechRecognitionResultList {
  readonly length: number
  item(index: number): SpeechRecognitionResult
  [index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number
  readonly results: SpeechRecognitionResultList
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string
  readonly message: string
}

interface SpeechRecognitionInstance extends EventTarget {
  lang: string
  continuous: boolean
  interimResults: boolean
  maxAlternatives: number
  start(): void
  stop(): void
  abort(): void
  onresult: ((e: SpeechRecognitionEvent) => void) | null
  onerror: ((e: SpeechRecognitionErrorEvent) => void) | null
  onend: (() => void) | null
  onstart: (() => void) | null
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionInstance
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor
    webkitSpeechRecognition?: SpeechRecognitionConstructor
  }
}

// ---------- Hook ----------

interface UseSpeechRecognitionOptions {
  /** Called whenever a final transcript chunk is recognized. */
  onResult?: (transcript: string) => void
  /** Called when recognition ends (either by stop() or naturally). */
  onEnd?: (finalTranscript: string) => void
  /** Called when recognition errors (e.g., 'not-allowed', 'no-speech'). */
  onError?: (error: string) => void
  /** Locale string. Default 'id-ID' (Indonesian). */
  lang?: string
}

export function useSpeechRecognition({
  onResult,
  onEnd,
  onError,
  lang = 'id-ID',
}: UseSpeechRecognitionOptions = {}) {
  const [supported, setSupported] = useState(false)
  const [listening, setListening] = useState(false)
  const [interim, setInterim] = useState('')

  const recogRef = useRef<SpeechRecognitionInstance | null>(null)
  // Accumulate final results across multiple recognition events in one session
  const finalRef = useRef('')

  // Stable refs to callbacks so the effect setting up listeners doesn't re-run
  const onResultRef = useRef(onResult)
  const onEndRef = useRef(onEnd)
  const onErrorRef = useRef(onError)
  useEffect(() => {
    onResultRef.current = onResult
    onEndRef.current = onEnd
    onErrorRef.current = onError
  }, [onResult, onEnd, onError])

  // Detect support + create instance once
  useEffect(() => {
    if (typeof window === 'undefined') return
    const Ctor = window.SpeechRecognition ?? window.webkitSpeechRecognition
    if (!Ctor) {
      setSupported(false)
      return
    }
    setSupported(true)

    const recog = new Ctor()
    recog.lang = lang
    recog.continuous = false      // single utterance — user taps to start, stops on silence
    recog.interimResults = true   // show partial transcripts while speaking
    recog.maxAlternatives = 1

    recog.onstart = () => {
      finalRef.current = ''
      setInterim('')
      setListening(true)
    }

    recog.onresult = (e) => {
      let interimText = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const result = e.results[i]
        const transcript = result[0].transcript
        if (result.isFinal) {
          finalRef.current = (finalRef.current + ' ' + transcript).trim()
          onResultRef.current?.(finalRef.current)
        } else {
          interimText += transcript
        }
      }
      setInterim(interimText)
    }

    recog.onerror = (e) => {
      setListening(false)
      setInterim('')
      onErrorRef.current?.(e.error)
    }

    recog.onend = () => {
      setListening(false)
      setInterim('')
      onEndRef.current?.(finalRef.current)
    }

    recogRef.current = recog

    return () => {
      try {
        recog.abort()
      } catch {
        /* ignore — already stopped */
      }
      recogRef.current = null
    }
  }, [lang])

  const start = useCallback(() => {
    if (!recogRef.current || listening) return
    try {
      recogRef.current.start()
    } catch {
      // start() throws if called while already running — safe to ignore
    }
  }, [listening])

  const stop = useCallback(() => {
    if (!recogRef.current || !listening) return
    try {
      recogRef.current.stop()
    } catch {
      /* ignore */
    }
  }, [listening])

  return {
    supported,
    listening,
    interim, // partial transcript while speaking — useful for live UI feedback
    start,
    stop,
  }
}
