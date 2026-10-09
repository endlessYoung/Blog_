export interface DropPoint {
  x: number
  y: number
}

function blobPoly(cx: number, cy: number, radius: number, phase: number, rough: number, count: number, ink: boolean) {
  const pts: string[] = []
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2
    let k = Math.sin(3 * a + phase) * 0.5 + Math.sin(5 * a - phase * 1.7) * 0.25
    if (ink) k += 0.35 * Math.sin(13 * a - phase * 2.7) + 0.22 * Math.sin(21 * a + phase * 3.3)
    const r = radius * (1 + rough * k)
    pts.push(`${(cx + Math.cos(a) * r).toFixed(1)}px ${(cy + Math.sin(a) * r).toFixed(1)}px`)
  }
  return `polygon(${pts.join(',')})`
}

export function dropFrames(pt: DropPoint, { shrink = false, ink = false }: { shrink?: boolean; ink?: boolean } = {}) {
  const far = Math.hypot(Math.max(pt.x, innerWidth - pt.x), Math.max(pt.y, innerHeight - pt.y)) * (ink ? 1.45 : 1.3)
  const offs = [0, 0.12, 0.38, 0.7, 1]
  const rads = [0.5, 0.05, 0.3, 0.7, 1]
  const count = ink ? 120 : 64
  const seed = Math.random() * 6
  const frames = offs.map((offset, index) => ({
    offset,
    clipPath: blobPoly(pt.x, pt.y, index === 0 ? 0.5 : far * rads[index], seed + index * 1.2, (ink ? 0.22 : 0.12) * (1 - offset * 0.75), count, ink),
  }))
  if (!shrink) return frames
  return frames.reverse().map((frame) => ({ ...frame, offset: 1 - frame.offset }))
}
