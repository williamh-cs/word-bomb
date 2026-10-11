const cache = new Map()

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('Could not load game artwork.'))
    image.src = url
  })
}

function removeBackdrop(context, width, height, connectedOnly = true) {
  const pixels = context.getImageData(0, 0, width, height)
  const visited = new Uint8Array(width * height)
  const queue = []
  if (connectedOnly) {
    for (let i = 0; i < width; i += 1) queue.push(i, (height - 1) * width + i)
    for (let i = 0; i < height; i += 1) queue.push(i * width, i * width + width - 1)
  } else {
    for (let i = 0; i < width * height; i += 1) queue.push(i)
  }
  while (queue.length) {
    const pixel = queue.pop()
    if (visited[pixel]) continue
    visited[pixel] = 1
    const offset = pixel * 4
    const [red, green, blue] = pixels.data.subarray(offset, offset + 3)
    if (Math.max(red, green, blue) - Math.min(red, green, blue) > 24 || red < 45 || red > 190) continue
    pixels.data[offset + 3] = 0
    if (!connectedOnly) continue
    const x = pixel % width
    const y = Math.floor(pixel / width)
    if (x > 0) queue.push(pixel - 1)
    if (x < width - 1) queue.push(pixel + 1)
    if (y > 0) queue.push(pixel - width)
    if (y < height - 1) queue.push(pixel + width)
  }
  context.putImageData(pixels, 0, 0)
}

function canvas(width, height = width) {
  const result = document.createElement('canvas')
  result.width = width
  result.height = height
  return result
}

function removeMagicItem(context, x, y, width, height) {
  const pixels = context.getImageData(x, y, width, height)
  for (let i = 0; i < pixels.data.length; i += 4) {
    const [red, green, blue] = pixels.data.subarray(i, i + 3)
    const isBlueGlow = blue > red * 1.18 && blue > green * 0.92
    const isWhiteGlow = Math.min(red, green, blue) > 175 && Math.max(red, green, blue) - Math.min(red, green, blue) < 45
    if (isBlueGlow || isWhiteGlow) pixels.data[i + 3] = 0
  }
  context.putImageData(pixels, x, y)
}

export function loadCharacterFrames(url) {
  const key = `character:${url}`
  if (!cache.has(key)) cache.set(key, loadImage(url).then((image) => {
    const isGuest = url.includes('guest_player')
    return Array.from({ length: 12 }, (_, index) => {
      const frame = canvas(160)
      const context = frame.getContext('2d')
      const row = Math.floor(index / 4)
      const column = index % 4
      context.drawImage(image, column * image.width / 4, row * image.height / 3, image.width / 4, image.height / 3, 0, 0, 160, 160)
      removeBackdrop(context, 160, 160)
      // Replace the original item in holding and throwing frames at render time.
      if (row === 1) {
        if (isGuest) context.clearRect(115, 34, 24, 24)
        else removeMagicItem(context, 100, 20, 59, 52)
      }
      if (row === 2 && column === 0) {
        if (isGuest) context.clearRect(31, 35, 24, 23)
        else removeMagicItem(context, 97, 69, 48, 39)
      }
      if (row === 2 && column > 0) {
        if (isGuest) context.clearRect(111, 0, 49, 39)
        else removeMagicItem(context, 99, 0, 61, 40)
      }
      return frame
    })
  }))
  return cache.get(key)
}

export function loadGameIcon(url, kind) {
  const key = `${kind}:${url}`
  if (!cache.has(key)) cache.set(key, loadImage(url).then((image) => {
    const icon = canvas(64)
    const context = icon.getContext('2d')
    if (kind === 'egg') {
      context.drawImage(image, image.width / 4 * 0.28, image.height / 3 * 0.28, image.width / 4 * 0.44, image.height / 3 * 0.55, 0, 0, 64, 64)
    } else {
      context.drawImage(image, image.width * 0.23, image.height * 0.26, image.width * 0.54, image.height * 0.47, 0, 0, 64, 64)
    }
    removeBackdrop(context, 64, 64, false)
    return icon
  }))
  return cache.get(key)
}
