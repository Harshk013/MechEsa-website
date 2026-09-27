import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState, useCallback } from 'react'
import { useMotionSettings } from '../../app/providers/MotionProvider'

const SESSION_KEY = 'mechesa-init-v04'

const telemetryReadouts = [
  { label: 'SYSTEM', status: 'MECHESA' },
  { label: 'INITIALIZING', status: 'COMPLETE' },
  { label: 'REPRESENTATION', status: 'REALITY' },
  { label: 'CORE', status: 'ONLINE' },
] as const

function readInitializationState() {
  if (typeof window === 'undefined') return true
  try {
    return window.sessionStorage.getItem(SESSION_KEY) !== '1'
  } catch {
    return true
  }
}

export function InitializationOverlay() {
  const { reducedMotion } = useMotionSettings()
  const [visible, setVisible] = useState(readInitializationState)
  const [phase, setPhase] = useState<1 | 2 | 3 | 4 | 5>(1)

  const dismiss = useCallback(() => {
    try {
      window.sessionStorage.setItem(SESSION_KEY, '1')
    } catch {
      // Storage may be unavailable
    }
    setVisible(false)
  }, [])

  useEffect(() => {
    if (!visible) return
    if (reducedMotion) {
      dismiss()
      return
    }

    // Phase 1 -> 2: Subtle grid appears (300ms)
    const t1 = window.setTimeout(() => setPhase(2), 300)
    // Phase 2 -> 3: Technical readouts sequentially register (650ms)
    const t2 = window.setTimeout(() => setPhase(3), 650)
    // Phase 3 -> 4: Association identity resolves (1250ms)
    const t3 = window.setTimeout(() => setPhase(4), 1250)
    // Phase 4 -> 5: Main interface reveal / exit (1750ms)
    const t4 = window.setTimeout(() => {
      setPhase(5)
      dismiss()
    }, 1750)

    // Keyboard shortcut to skip
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === ' ' || e.key === 'Enter') {
        dismiss()
      }
    }
    window.addEventListener('keydown', onKeyDown)

    return () => {
      window.clearTimeout(t1)
      window.clearTimeout(t2)
      window.clearTimeout(t3)
      window.clearTimeout(t4)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [visible, reducedMotion, dismiss])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="initialization"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28, ease: [0.2, 0.8, 0.2, 1] }}
          role="status"
          aria-live="polite"
          onClick={dismiss}
          style={{ cursor: 'pointer' }}
        >
          <div
            className="initialization__frame"
            onClick={(e) => e.stopPropagation()}
            style={{ cursor: 'default' }}
          >
            <div className="initialization__head">
              <span className="technical-small">MECHESA // POWER-ON</span>
              <button
                type="button"
                className="technical-small"
                onClick={dismiss}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--color-text-dim)',
                  cursor: 'pointer',
                  padding: '2px 4px',
                }}
                aria-label="Skip power-on sequence"
              >
                SKIP [ESC] ✕
              </button>
            </div>

            <h1>ENGINEERING SYSTEM ONLINE</h1>

            {/* Phase 3: Small technical readouts with state words */}
            <div className="initialization__checks">
              {telemetryReadouts.map((item, index) => {
                const isReady = phase >= 3 && phase !== 1
                return (
                  <div key={item.label}>
                    <span>{item.label}</span>
                    <motion.b
                      initial={{ opacity: 0, x: -4 }}
                      animate={{
                        opacity: isReady ? 1 : 0,
                        x: isReady ? 0 : -4,
                      }}
                      transition={{ duration: 0.18, delay: index * 0.08 }}
                    >
                      {item.status}
                    </motion.b>
                  </div>
                )
              })}
            </div>

            {/* Power-on state track */}
            <div className="initialization__bar">
              <motion.i
                initial={{ scaleX: 0 }}
                animate={{ scaleX: phase >= 4 ? 1 : phase >= 3 ? 0.65 : 0.25 }}
                transition={{ duration: 0.45, ease: [0.2, 0.8, 0.2, 1] }}
              />
            </div>

            <div className="initialization__foot">
              <span className="technical-small">
                {phase >= 4 ? 'SYSTEM ONLINE' : 'POWERING ON...'}
              </span>
              <span className="technical-small">MECHESA // IIT INDORE</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}