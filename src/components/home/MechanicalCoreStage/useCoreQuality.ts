import { useEffect, useState } from 'react'

export function useCoreQuality() {
  const [mobile, setMobile] = useState(false)

  useEffect(() => {
    const media = window.matchMedia('(max-width: 700px)')
    const update = () => setMobile(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  return { mobile, dpr: mobile ? [1, 1.2] as [number, number] : [1, 1.75] as [number, number] }
}
