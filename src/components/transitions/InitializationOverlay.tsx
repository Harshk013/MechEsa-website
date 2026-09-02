import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useMotionSettings } from '../../app/providers/MotionProvider'

const checks = ['CORE', 'MOTION SYSTEM', 'INTERFACE', 'NAVIGATION']
const SESSION_KEY = 'mechesa-init-v03'

function readInitializationState() {
  if (typeof window === 'undefined') return true
  try {
    return window.sessionStorage.getItem(SESSION_KEY) !== '1'
  } catch {
    return false
  }
}

export function InitializationOverlay() {
  const { reducedMotion } = useMotionSettings()
  const [visible, setVisible] = useState(readInitializationState)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!visible) return
    let firstFrame = 0
    let secondFrame = 0
    firstFrame = requestAnimationFrame(() => {
      setReady(true)
      secondFrame = requestAnimationFrame(() => {
        try { window.sessionStorage.setItem(SESSION_KEY, '1') } catch { /* Storage may be unavailable. */ }
        setVisible(false)
      })
    })
    return () => {
      cancelAnimationFrame(firstFrame)
      cancelAnimationFrame(secondFrame)
    }
  }, [visible])

  return <AnimatePresence>{visible && <motion.div className="initialization" initial={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reducedMotion ? .08 : .2 }} role="status" aria-live="polite">
    <div className="initialization__frame"><div className="initialization__head"><span className="technical-small">MECHESA // INITIALIZATION</span><span className="technical-small">BUILD 03</span></div><h1>POWERING THE INTERACTION LAYER</h1><div className="initialization__checks">{checks.map((item) => <div key={item}><span>{item}</span><motion.b initial={{ opacity: 0 }} animate={{ opacity: ready || reducedMotion ? 1 : 0 }}>READY</motion.b></div>)}</div><div className="initialization__bar"><motion.i initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: reducedMotion ? .08 : .16, ease: 'linear' }} /></div><div className="initialization__foot"><span className="technical-small">SYSTEM ONLINE</span><span className="technical-small">NO ARTIFICIAL WAIT</span></div></div>
  </motion.div>}</AnimatePresence>
}
