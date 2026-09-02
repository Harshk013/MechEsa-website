import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

export type RepresentationMode = 'reality' | 'blueprint'

const STORAGE_KEY = 'mechesa-representation-mode'

type RepresentationContextValue = {
  mode: RepresentationMode
  setMode: (mode: RepresentationMode) => void
  toggleMode: () => void
  isBlueprint: boolean
  isReality: boolean
}

const RepresentationContext = createContext<RepresentationContextValue | null>(null)

function isRepresentationMode(value: unknown): value is RepresentationMode {
  return value === 'reality' || value === 'blueprint'
}

function readStoredMode(): RepresentationMode {
  if (typeof window === 'undefined') return 'reality'
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    return isRepresentationMode(stored) ? stored : 'reality'
  } catch {
    return 'reality'
  }
}

export function RepresentationProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<RepresentationMode>(readStoredMode)

  const setMode = useCallback((nextMode: RepresentationMode) => {
    setModeState(nextMode)
    try {
      window.localStorage.setItem(STORAGE_KEY, nextMode)
    } catch {
      // Storage can be unavailable in privacy-restricted browser contexts.
    }
  }, [])

  const toggleMode = useCallback(() => {
    setMode(mode === 'reality' ? 'blueprint' : 'reality')
  }, [mode, setMode])

  useEffect(() => {
    document.documentElement.dataset.representation = mode
  }, [mode])

  useEffect(() => {
    const root = document.documentElement
    if (!root.dataset.representation) root.dataset.representation = mode
    return () => {
      // Do not remove the attribute on unmount; AppProviders normally lives for the app lifetime.
    }
  }, [mode])

  const value = useMemo(() => ({
    mode,
    setMode,
    toggleMode,
    isBlueprint: mode === 'blueprint',
    isReality: mode === 'reality',
  }), [mode, setMode, toggleMode])

  return <RepresentationContext.Provider value={value}>{children}</RepresentationContext.Provider>
}

export function useRepresentation() {
  const context = useContext(RepresentationContext)
  if (!context) throw new Error('useRepresentation must be used inside RepresentationProvider')
  return context
}
