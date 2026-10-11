import { useEffect, useRef } from 'react'
import eggImage from '../assets/dragon_egg.png'
import { loadGameIcon } from '../lib/spriteAssets'
import { getEggFlightPoint } from '../data/eggFlight'

export default function EggHandoff({ handoff, sceneRef }) {
  const canvasRef = useRef(null)
  useEffect(() => {
    let cancelled = false
    let animation
    loadGameIcon(eggImage, 'egg').then((egg) => {
      if (cancelled) return
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      function draw() {
        if (cancelled || !sceneRef.current || !canvasRef.current) return
        const scene = sceneRef.current
        const bounds = scene.getBoundingClientRect()
        const characters = [...scene.querySelectorAll('[data-player-id]')]
        const fromCanvas = characters.find((slot) => slot.dataset.playerId === handoff.fromPlayerId)?.querySelector('canvas.board-character')
        const toCanvas = characters.find((slot) => slot.dataset.playerId === handoff.toPlayerId)?.querySelector('canvas.board-character')
        const canvas = canvasRef.current
        canvas.width = Math.round(bounds.width)
        canvas.height = Math.round(bounds.height)
        const context = canvas.getContext('2d')
        if (!fromCanvas || !toCanvas) return
        function handPoint(character, throwing) {
          const rect = character.getBoundingClientRect()
          const x = character.dataset.facing === 'left' ? 0.245 : 0.755
          const fullHeight = character.dataset.grounded === 'true' ? rect.height / 0.75 : rect.height
          return { x: rect.left - bounds.left + rect.width * x, y: rect.top - bounds.top + fullHeight * (throwing ? 0.275 : 0.325) }
        }
        const from = handPoint(fromCanvas, handoff.reason === 'word')
        const to = handPoint(toCanvas, false)
        const elapsed = Date.now() - handoff.startedAt
        const windup = handoff.reason === 'word' ? 350 : 0
        const progress = (elapsed - windup) / (handoff.endsAt - handoff.startedAt - windup)
        if (progress >= 0 && progress < 1) {
          const arcHeight = reducedMotion ? 0 : Math.min(64, bounds.height * 0.12, Math.abs(to.x - from.x) * 0.12)
          const point = getEggFlightPoint(from, to, progress, arcHeight)
          const size = fromCanvas.getBoundingClientRect().width * 0.16
          context.drawImage(egg, point.x - size / 2, point.y - size * 0.6, size, size * 1.2)
        }
        if (elapsed < handoff.endsAt - handoff.startedAt) animation = window.requestAnimationFrame(draw)
      }
      draw()
    }).catch(() => {})
    return () => { cancelled = true; window.cancelAnimationFrame(animation) }
  }, [handoff, sceneRef])
  return <canvas className="board-egg-flight" ref={canvasRef} aria-hidden="true" />
}
