import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useMotionSettings } from '../../app/providers/MotionProvider'

const checks = ['CORE', 'MOTION SYSTEM', 'INTERFACE', 'NAVIGATION']
const SESSION_KEY = 'mechesa-init-v04'
const POWER_ON_MS = 520

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
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!visible) return
    if (reducedMotion) {
      try { window.sessionStorage.setItem(SESSION_KEY, '1') } catch { /* Storage may be unavailable. */ }
      setVisible(false)
      return
    }
    setReady(true)
  }, [visible, reducedMotion])

  return <AnimatePresence>
    {visible && <motion.div
      className="initialization"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: .16, ease: [0.2, 0.8, 0.2, 1] }}
      onAnimationComplete={() => {
        if (!reducedMotion) {
          try { window.sessionStorage.setItem(SESSION_KEY, '1') } catch { /* Storage may be unavailable. */ }
          setVisible(false)
        }
      }}
      role="status"
      aria-live="polite"
    >
      <div className="initialization__frame">
        <div className="initialization__head">
          <span className="technical-small">MECHESA // POWER-ON</span>
          <span className="technical-small">SYSTEM 01</span>
        </div>

        <h1>ENGINEERING SYSTEM ONLINE</h1>

        <div className="initialization__checks">
          {checks.map((item) => <div key={item}>
            <span>{item}</span>
            <motion.b
              initial={{ opacity: 0, x: -3 }}
              animate={{ opacity: ready ? 1 : 0, x: ready ? 0 : -3 }}
              transition={{ duration: .12, delay: .04 }}
            >
              READY
            </motion.b>
          </div>)}
        </div>

        <div className="initialization__bar">
          <motion.i
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: POWER_ON_MS / 1000, ease: [0.2, 0.8, 0.2, 1] }}
          />
        </div>

        <div className="initialization__foot">
          <span className="technical-small">SYSTEM ONLINE</span>
          <span className="technical-small">MECHESA // ENGINEERED MOTION</span>
        </div>
      </div>
    </motion.div>}
  </AnimatePresence>
}