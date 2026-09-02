import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useMotionSettings } from '../../app/providers/MotionProvider'

const checks = ['CORE', 'MOTION SYSTEM', 'INTERFACE', 'NAVIGATION']
export function InitializationOverlay() {
  const { reducedMotion } = useMotionSettings()
  const [visible, setVisible] = useState(() => sessionStorage.getItem('mechesa-init-v03') !== '1')
  const [ready, setReady] = useState(false)
  useEffect(() => {
    if (!visible) return
    const complete = window.setTimeout(() => setReady(true), reducedMotion ? 120 : 420)
    const dismiss = window.setTimeout(() => { sessionStorage.setItem('mechesa-init-v03', '1'); setVisible(false) }, reducedMotion ? 180 : 820)
    return () => { window.clearTimeout(complete); window.clearTimeout(dismiss) }
  }, [reducedMotion, visible])
  return <AnimatePresence>{visible && <motion.div className="initialization" initial={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reducedMotion ? .08 : .2 }} role="status" aria-live="polite">
    <div className="initialization__frame"><div className="initialization__head"><span className="technical-small">MECHESA // INITIALIZATION</span><span className="technical-small">BUILD 03</span></div><h1>POWERING THE INTERACTION LAYER</h1><div className="initialization__checks">{checks.map((item, index) => <div key={item}><span>{item}</span><motion.b initial={{ opacity: 0 }} animate={{ opacity: ready || reducedMotion ? 1 : 0 }} transition={{ delay: reducedMotion ? 0 : .12 + index * .08 }}>READY</motion.b></div>)}</div><div className="initialization__bar"><motion.i initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: reducedMotion ? .08 : .55, ease: 'linear' }} /></div><div className="initialization__foot"><span className="technical-small">SYSTEM ONLINE</span><span className="technical-small">NO ARTIFICIAL DELAY</span></div></div>
  </motion.div>}</AnimatePresence>
}
