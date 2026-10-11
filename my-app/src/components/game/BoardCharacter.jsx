import { useEffect, useRef } from 'react'
import eggImage from '../../assets/ui/dragon_egg.png'
import { loadCharacterFrames, loadGameIcon } from '../../lib/spriteAssets'

export default function BoardCharacter({ image, label, facing = 'right', grounded = false, pose = 'idle', actionStartedAt = null }) {
  const canvasRef = useRef(null)
  useEffect(() => {
    let cancelled = false
    let animation
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    Promise.all([loadCharacterFrames(image), loadGameIcon(eggImage, 'egg')]).then(([frames, egg]) => {
      if (cancelled) return
      const context = canvasRef.current.getContext('2d')
      function draw() {
        if (cancelled) return
        const elapsed = actionStartedAt ? Date.now() - actionStartedAt : 0
        const idleFrame = reducedMotion ? 0 : Math.floor(Date.now() / 300) % 4
        const frameIndex = pose === 'throwing' ? 8 + Math.min(3, Math.max(0, Math.floor(elapsed / 250))) : pose === 'holding' ? 4 + idleFrame : idleFrame
        context.clearRect(0, 0, 160, 160)
        context.save()
        if (facing === 'left') { context.translate(160, 0); context.scale(-1, 1) }
        context.drawImage(frames[frameIndex], 0, 0)
        if (pose === 'holding') context.drawImage(egg, 109, 38, 24, 28)
        if (pose === 'throwing' && elapsed < 350) {
          const isGuest = image.includes('guest_player')
          context.drawImage(egg, isGuest && elapsed < 250 ? 32 : 109, elapsed < 250 ? (isGuest ? 35 : 77) : 30, 24, 28)
        }
        context.restore()
        if (!reducedMotion || pose === 'throwing') animation = window.requestAnimationFrame(draw)
      }
      draw()
    }).catch(() => {})
    return () => { cancelled = true; window.cancelAnimationFrame(animation) }
  }, [image, facing, grounded, pose, actionStartedAt])
  return <canvas ref={canvasRef} width={160} height={grounded ? 120 : 160} className={`board-character board-character-${pose}`} data-facing={facing} data-grounded={grounded} role="img" aria-label={label} />
}
