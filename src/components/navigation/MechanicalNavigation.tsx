import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState, type RefObject } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { navigation } from '../../data/site'
import { SystemIndicator } from '../telemetry/SystemIndicator'
import { useMotionSettings } from '../../app/providers/MotionProvider'
import { usePointer } from '../interaction/PointerProvider'

export function MechanicalNavigation() {
  const location = useLocation()
  const { reducedMotion } = useMotionSettings()
  const { setIntent, clearIntent } = usePointer()
  const [open, setOpen] = useState(false)
  const firstMobileLinkRef = useRef<HTMLAnchorElement>(null)

  useEffect(() => setOpen(false), [location.pathname])
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    const focusFrame = requestAnimationFrame(() => firstMobileLinkRef.current?.focus())
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', onKey); cancelAnimationFrame(focusFrame); document.body.style.overflow = '' }
  }, [open])

  const variants = reducedMotion ? { hidden: { opacity: 0 }, visible: { opacity: 1 } } : { hidden: { opacity: 0, y: -10 }, visible: { opacity: 1, y: 0 } }
  return <>
    <header className="mechanical-nav" aria-label="Primary navigation">
      <NavLink to="/" className="mechanical-nav__brand" onPointerEnter={() => setIntent('link', 'HOME')} onPointerLeave={clearIntent}>
        <span className="mechanical-nav__brand-mark">MECHESA</span><span className="mechanical-nav__brand-sub">IIT INDORE / MECHANICAL SYSTEMS</span>
      </NavLink>
      <nav className="mechanical-nav__links" aria-label="Desktop">
        {navigation.map((item, index) => <NavItem key={item.path} href={item.path} label={item.label} number={String(index + 1).padStart(2, '0')} />)}
      </nav>
      <div className="mechanical-nav__status"><SystemIndicator state="online" label="SYSTEM ONLINE" /><button className="mechanical-nav__mobile-trigger" aria-expanded={open} aria-controls="mobile-navigation" onClick={() => setOpen((value) => !value)} onPointerEnter={() => setIntent('button', open ? 'CLOSE' : 'ACCESS')} onPointerLeave={clearIntent}><span>{open ? 'CLOSE' : 'MENU'}</span><i aria-hidden="true" /></button></div>
    </header>
    <AnimatePresence>
      {open && <motion.div id="mobile-navigation" className="mobile-machine-menu" initial="hidden" animate="visible" exit="hidden" variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}>
        <div className="mobile-machine-menu__frame">
          <div className="mobile-machine-menu__head"><span className="technical-small">MECHESA CORE / ACCESS PANEL</span><div className="mobile-machine-menu__status"><SystemIndicator state="online" label="SYSTEM ONLINE" /></div></div>
          <nav className="mobile-machine-menu__links" aria-label="Mobile">
            {navigation.map((item, index) => <motion.div key={item.path} variants={variants} transition={{ delay: reducedMotion ? 0 : index * 0.045 }} initial="hidden" animate="visible" exit="hidden"><NavItem href={item.path} label={item.label} number={String(index + 1).padStart(2, '0')} mobile onNavigate={() => setOpen(false)} linkRef={index === 0 ? firstMobileLinkRef : undefined} /></motion.div>)}
          </nav>
          <div className="mobile-machine-menu__foot"><span className="technical-small">ESC / CLOSE</span><span className="technical-small">BUILD 03 / GLOBAL INTERACTION</span></div>
        </div>
      </motion.div>}
    </AnimatePresence>
  </>
}

function NavItem({ href, label, number, mobile, onNavigate, linkRef }: { href: string; label: string; number: string; mobile?: boolean; onNavigate?: () => void; linkRef?: RefObject<HTMLAnchorElement | null> }) {
  const { setIntent, clearIntent } = usePointer()
  const handleClick = () => {
    onNavigate?.()
  }
  return <NavLink ref={linkRef} to={href} className={({ isActive }) => `mechanical-nav__item${isActive ? ' is-active' : ''}`} onClick={handleClick} onPointerEnter={() => setIntent('link', mobile ? 'OPEN' : 'ACCESS')} onPointerLeave={clearIntent}>
    <span>{number}</span><strong>{label}</strong><i aria-hidden="true" />
  </NavLink>
}
