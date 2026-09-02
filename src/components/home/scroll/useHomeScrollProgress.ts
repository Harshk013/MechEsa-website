import { useContext } from 'react'
import { HomeScrollContext } from './HomeScrollController'

export function useHomeScrollProgress() {
  const context = useContext(HomeScrollContext)
  if (!context) throw new Error('useHomeScrollProgress must be used inside HomeScrollController')
  return context
}
