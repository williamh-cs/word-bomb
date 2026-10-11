import { useEffect, useRef } from 'react'
import emptyHeart from '../../assets/ui/empty heart.png'
import fullHeart from '../../assets/ui/full heart.png'
import { loadGameIcon } from '../../lib/spriteAssets'

export default function PlayerHearts({ lives }) {
  const canvasRef = useRef(null)
  const remaining = Math.max(0, Math.min(3, lives))
  useEffect(() => {
    let cancelled = false
    Promise.all([loadGameIcon(fullHeart, 'heart'), loadGameIcon(emptyHeart, 'heart')]).then(([full, empty]) => {
      if (cancelled) return
      const context = canvasRef.current.getContext('2d')
      context.clearRect(0, 0, 104, 32)
      for (let i = 0; i < 3; i += 1) context.drawImage(i < remaining ? full : empty, i * 36, 0, 32, 32)
    }).catch(() => {})
    return () => { cancelled = true }
  }, [remaining])
  return <canvas className="board-player-hearts" ref={canvasRef} width={104} height={32} role="img" aria-label={`${remaining} of 3 lives remaining`} />
}
