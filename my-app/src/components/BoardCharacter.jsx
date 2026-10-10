import { useEffect, useRef } from 'react'

export default function BoardCharacter({ image, label }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    let cancelled = false
    let timer
    const sprite = new Image()
    sprite.onload = () => {
      if (cancelled) return
      const size = 160
      const frames = Array.from({ length: 4 }, (_, index) => {
        const frame = document.createElement('canvas')
        frame.width = size
        frame.height = size
        const context = frame.getContext('2d')
        context.drawImage(sprite, index * sprite.width / 4, 0, sprite.width / 4, sprite.height / 3, 0, 0, size, size)
        const pixels = context.getImageData(0, 0, size, size)
        const visited = new Uint8Array(size * size)
        const queue = []
        // Remove only neutral backdrop pixels connected to the frame edges.
        for (let i = 0; i < size; i += 1) {
          queue.push(i, (size - 1) * size + i, i * size, i * size + size - 1)
        }
        while (queue.length) {
          const pixel = queue.pop()
          if (visited[pixel]) continue
          visited[pixel] = 1
          const offset = pixel * 4
          const [red, green, blue] = pixels.data.subarray(offset, offset + 3)
          if (Math.max(red, green, blue) - Math.min(red, green, blue) > 24 || red < 45 || red > 190) continue
          pixels.data[offset + 3] = 0
          const x = pixel % size
          const y = Math.floor(pixel / size)
          if (x > 0) queue.push(pixel - 1)
          if (x < size - 1) queue.push(pixel + 1)
          if (y > 0) queue.push(pixel - size)
          if (y < size - 1) queue.push(pixel + size)
        }
        context.putImageData(pixels, 0, 0)
        return frame
      })
      const context = canvasRef.current.getContext('2d')
      let index = 0
      const draw = () => {
        context.clearRect(0, 0, size, size)
        context.drawImage(frames[index], 0, 0)
        index = (index + 1) % frames.length
      }
      draw()
      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        timer = window.setInterval(draw, 300)
      }
    }
    sprite.src = image
    return () => {
      cancelled = true
      window.clearInterval(timer)
    }
  }, [image])

  return <canvas ref={canvasRef} width={160} height={160} className="board-character" role="img" aria-label={label} />
}
