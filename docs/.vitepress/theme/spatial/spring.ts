export type SpringPreset = 'snappy' | 'gentle' | 'bouncy'

const PRESETS: Record<SpringPreset, { stiffness: number; damping: number; mass: number }> = {
  snappy: { stiffness: 420, damping: 32, mass: 1 },
  gentle: { stiffness: 150, damping: 21, mass: 1 },
  bouncy: { stiffness: 300, damping: 15, mass: 1 },
}

const FALLBACK: Record<SpringPreset, string> = {
  snappy: 'cubic-bezier(.3, 1.25, .4, 1)',
  gentle: 'cubic-bezier(.22, 1.12, .36, 1)',
  bouncy: 'cubic-bezier(.34, 1.6, .45, 1)',
}

interface Curve {
  duration: number
  easing: string
}

const curves: Partial<Record<SpringPreset, Curve>> = {}
let installed = false

function simulate(preset: { stiffness: number; damping: number; mass: number }) {
  const dt = 1 / 240
  let x = 0
  let v = 0
  let t = 0
  let still = 0
  const out = [0]
  while (t < 4) {
    const a = (-preset.stiffness * (x - 1) - preset.damping * v) / preset.mass
    v += a * dt
    x += v * dt
    t += dt
    out.push(x)
    if (Math.abs(1 - x) < 0.001 && Math.abs(v) < 0.02) {
      if (++still > 10) break
    } else still = 0
  }
  out[out.length - 1] = 1
  return { samples: out, duration: t * 1000 }
}

function resample(src: number[], count: number) {
  const res: number[] = []
  for (let i = 0; i < count; i++) {
    const f = (i / (count - 1)) * (src.length - 1)
    const lo = Math.floor(f)
    const hi = Math.min(src.length - 1, lo + 1)
    res.push(src[lo] + (src[hi] - src[lo]) * (f - lo))
  }
  return res
}

export function reducedMotion() {
  return typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function installSprings() {
  if (installed || typeof document === 'undefined') return
  installed = true
  let linearOK = false
  try {
    linearOK = CSS.supports('animation-timing-function', 'linear(0, 1)')
  } catch {
    linearOK = false
  }
  const root = document.documentElement
  ;(Object.keys(PRESETS) as SpringPreset[]).forEach((name) => {
    const { samples, duration } = simulate(PRESETS[name])
    const count = Math.min(90, Math.max(24, Math.round(duration / 12)))
    const curve = resample(samples, count)
    const easing = linearOK
      ? `linear(${curve.map((value) => value.toFixed(4)).join(', ')})`
      : FALLBACK[name]
    const rounded = Math.round(duration)
    curves[name] = { duration: rounded, easing }
    root.style.setProperty(`--spring-${name}`, easing)
    root.style.setProperty(`--spring-${name}-dur`, `${rounded}ms`)
  })
}

export function springEase(preset: SpringPreset) {
  installSprings()
  return curves[preset] || { duration: 720, easing: FALLBACK[preset] }
}

export function springTo(
  el: HTMLElement,
  frames: Keyframe[],
  preset: SpringPreset = 'gentle',
  options: KeyframeAnimationOptions = {},
) {
  const curve = springEase(preset)
  const speed = Number(options.playbackRate || 1)
  return el.animate(frames, {
    duration: reducedMotion() ? 1 : curve.duration / speed,
    easing: curve.easing,
    fill: 'backwards',
    ...options,
  })
}

export function appear(
  el: HTMLElement,
  {
    from = 'translateY(16px) scale(.96)',
    preset = 'gentle',
    delay = 0,
    blur = 8,
    fade = 340,
  }: { from?: string; preset?: SpringPreset; delay?: number; blur?: number; fade?: number } = {},
) {
  if (reducedMotion()) return
  springTo(el, [{ transform: from }, { transform: 'none' }], preset, { delay })
  el.animate(
    [{ opacity: 0, filter: `blur(${blur}px)` }, { opacity: 1, filter: 'blur(0px)' }],
    { duration: fade, delay, easing: 'cubic-bezier(.2, .8, .2, 1)', fill: 'backwards' },
  )
}

const live = new Set<LiveSpring>()
let loop = 0
let lastT = 0

export class LiveSpring {
  x: number
  target: number
  v = 0
  private preset: SpringPreset
  private onUpdate: (value: number) => void
  private eps: number

  constructor(value: number, preset: SpringPreset, onUpdate: (value: number) => void, eps = 0.01) {
    this.x = this.target = value
    this.preset = preset
    this.onUpdate = onUpdate
    this.eps = eps
  }

  to(target: number, velocity?: number) {
    this.target = target
    if (velocity != null) this.v = velocity
    if (reducedMotion()) {
      this.set(target)
      return
    }
    live.add(this)
    if (!loop) {
      lastT = performance.now()
      loop = requestAnimationFrame(tick)
    }
  }

  set(value: number) {
    this.x = this.target = value
    this.v = 0
    live.delete(this)
    this.onUpdate(value)
  }

  stop() {
    live.delete(this)
  }

  step(dt: number) {
    const { stiffness: k, damping: c, mass: m } = PRESETS[this.preset]
    const n = Math.max(1, Math.ceil(dt * 240))
    const h = dt / n
    for (let i = 0; i < n; i++) {
      this.v += ((-k * (this.x - this.target) - c * this.v) / m) * h
      this.x += this.v * h
    }
    const done = Math.abs(this.x - this.target) < this.eps && Math.abs(this.v) < this.eps * 10
    if (done) {
      this.x = this.target
      this.v = 0
    }
    this.onUpdate(this.x)
    return done
  }
}

function tick(now: number) {
  const dt = Math.min(0.05, (now - lastT) / 1000)
  lastT = now
  for (const item of live) {
    if (item.step(dt)) live.delete(item)
  }
  loop = live.size ? requestAnimationFrame(tick) : 0
}
