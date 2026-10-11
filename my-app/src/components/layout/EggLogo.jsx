import { useEffect, useRef } from 'react'
import eggImage from '../../assets/ui/dragon_egg.png'
import { loadGameIcon } from '../../lib/spriteAssets'

export default function EggLogo() {
  const canvasRef = useRef(null)
  useEffect(() => {
    let cancelled = false
    loadGameIcon(eggImage, 'egg').then((egg) => {
      if (!cancelled) canvasRef.current.getContext('2d').drawImage(egg, 0, 0, 64, 64)
    }).catch(() => {})
    return () => { cancelled = true }
  }, [])
  return <canvas className="top-bar-egg-logo" ref={canvasRef} width={64} height={64} aria-hidden="true" />
}
