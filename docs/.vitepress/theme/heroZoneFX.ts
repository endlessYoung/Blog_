/**
 * 首页 Hero 左右分区 hover 动效
 *
 * 左区：惯性光斑（lerp 追赶光标，随指针速度呼吸）+ 品牌名解码翻牌（3s 冷却）
 * 右区：journey 插画整区可点；悬停上浮/阳光/光点/文案由 CSS + heroJourneyPanel 承担
 * 关系：hover 任一侧对侧微暗（舞台追光）
 *
 * 门槛：>960px、hover 指针、非 reduced-motion；路由离开时由 dispose 清理。
 */

const DECODE_COOLDOWN = 3000
const DECODE_GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz01<>/#*+='
/* 斜切几何：色板盒 = actions 盒向左扩 132px，顶边从 30% 处切入（与 tech.css 的 clip-path 一致） */
const PANEL_EXTEND = 132
const PANEL_CUT = 0.3
const SPOT_LERP = 0.16
const SPEED_LERP = 0.1
const SPOT_R_MIN = 240
const SPOT_R_SPAN = 100
const SPOT_DIM_MAX = 0.3
const SPEED_CAP = 40

export function initHeroZoneFX(): (() => void) | undefined {
  if (typeof window === 'undefined') return
  if (window.innerWidth <= 960) return
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
  if (matchMedia('(hover: none)').matches) return

  const main = document.querySelector<HTMLElement>(
    '.VPContent.is-home .VPHero.has-image .main, .home-landing .VPHero.has-image .main',
  )
  const heading = main?.querySelector<HTMLElement>('.heading')
  const actions = main?.querySelector<HTMLElement>('.actions')
  if (!main || !heading || !actions) return
  if (main.classList.contains('hero-fx')) return

  const nameEl = main.querySelector<HTMLElement>('.name.clip, .name .clip')
  const originalName = nameEl?.textContent ?? ''

  main.classList.add('hero-fx')

  const spot = document.createElement('div')
  spot.className = 'hero-fx__spot'
  main.insertBefore(spot, main.firstChild)

  const geo = {
    mainLeft: 0,
    mainTop: 0,
    mainHeight: 1,
    edgeTopX: 0,
    edgeSpanX: 0,
  }

  function refreshRects() {
    const mRect = main!.getBoundingClientRect()
    const aRect = actions!.getBoundingClientRect()
    const panelW = aRect.width + PANEL_EXTEND
    geo.mainLeft = mRect.left
    geo.mainTop = mRect.top
    geo.mainHeight = Math.max(mRect.height, 1)
    geo.edgeTopX = aRect.left - PANEL_EXTEND + panelW * PANEL_CUT
    geo.edgeSpanX = panelW * PANEL_CUT
  }

  let zone: 'left' | 'right' | null = null
  let inside = false
  let rafId = 0
  let lastTime = 0
  let tx = 0
  let ty = 0
  let ptx = 0
  let pty = 0
  let sx = 0
  let sy = 0
  let speedNorm = 0
  let decodeTimer: ReturnType<typeof setInterval> | undefined
  let decodeReadyAt = 0
  let disposed = false

  function zoneOf(x: number, y: number): 'left' | 'right' {
    const t = Math.min(Math.max((y - geo.mainTop) / geo.mainHeight, 0), 1)
    return x < geo.edgeTopX - t * geo.edgeSpanX ? 'left' : 'right'
  }

  function enterZone(next: 'left' | 'right') {
    if (next === 'left') {
      main.classList.add('hero-fx--left')
      playDecode()
    } else {
      main.classList.add('hero-fx--right')
    }
  }

  function exitZone(prev: 'left' | 'right') {
    if (prev === 'left') main.classList.remove('hero-fx--left')
    else main.classList.remove('hero-fx--right')
  }

  const lerpK = (base: number, dt: number) => 1 - Math.pow(1 - base, dt)

  function step(now: number) {
    if (disposed) return
    if (!inside) {
      rafId = 0
      return
    }
    const dt = Math.min(Math.max((now - lastTime) / 16.667, 0.5), 3)
    lastTime = now

    const z = zoneOf(tx, ty)
    if (z !== zone) {
      if (zone) exitZone(zone)
      enterZone(z)
      zone = z
    }

    const rawSpeed = Math.hypot(tx - ptx, ty - pty) / dt
    ptx = tx
    pty = ty
    const targetNorm = Math.min(rawSpeed, SPEED_CAP) / SPEED_CAP
    speedNorm += (targetNorm - speedNorm) * lerpK(SPEED_LERP, dt)

    const ks = lerpK(SPOT_LERP, dt)
    sx += (tx - sx) * ks
    sy += (ty - sy) * ks
    main.style.setProperty('--fx-x', `${(sx - geo.mainLeft).toFixed(1)}px`)
    main.style.setProperty('--fx-y', `${(sy - geo.mainTop).toFixed(1)}px`)
    main.style.setProperty('--fx-r', `${(SPOT_R_MIN + SPOT_R_SPAN * speedNorm).toFixed(0)}px`)
    main.style.setProperty('--fx-i', (1 - SPOT_DIM_MAX * speedNorm).toFixed(3))

    rafId = requestAnimationFrame(step)
  }

  function startLoop() {
    if (rafId) return
    lastTime = performance.now()
    rafId = requestAnimationFrame(step)
  }

  function playDecode() {
    if (!nameEl || originalName.length < 3) return
    const now = performance.now()
    if (now < decodeReadyAt) return
    decodeReadyAt = now + DECODE_COOLDOWN

    const count = 2 + Math.floor(Math.random() * 2)
    const indices = [...originalName].map((_, i) => i)
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[indices[i], indices[j]] = [indices[j], indices[i]]
    }
    const windows = indices.slice(0, count).map((idx, order) => ({
      idx,
      start: order * 140,
      end: order * 140 + 320,
    }))
    const total = windows[windows.length - 1].end
    const startAt = performance.now()

    if (decodeTimer) clearInterval(decodeTimer)
    decodeTimer = setInterval(() => {
      const elapsed = performance.now() - startAt
      if (disposed || elapsed >= total) {
        if (decodeTimer) clearInterval(decodeTimer)
        decodeTimer = undefined
        if (nameEl) nameEl.textContent = originalName
        return
      }
      const chars = [...originalName]
      for (const w of windows) {
        if (elapsed >= w.start && elapsed < w.end) {
          chars[w.idx] = DECODE_GLYPHS[Math.floor(Math.random() * DECODE_GLYPHS.length)]
        }
      }
      nameEl!.textContent = chars.join('')
    }, 45)
  }

  const onPointerEnter = (e: PointerEvent) => {
    refreshRects()
    inside = true
    tx = e.clientX
    ty = e.clientY
    if (!zone) {
      sx = tx
      sy = ty
      ptx = tx
      pty = ty
      speedNorm = 0
    }
    startLoop()
  }

  const onPointerMove = (e: PointerEvent) => {
    tx = e.clientX
    ty = e.clientY
    if (!inside) {
      inside = true
      refreshRects()
      startLoop()
    }
  }

  const onPointerLeave = () => {
    inside = false
    if (zone) exitZone(zone)
    zone = null
    speedNorm = 0
  }

  const onViewportChange = () => {
    if (inside) refreshRects()
  }

  main.addEventListener('pointerenter', onPointerEnter)
  main.addEventListener('pointermove', onPointerMove)
  main.addEventListener('pointerleave', onPointerLeave)
  window.addEventListener('resize', onViewportChange)
  window.addEventListener('scroll', onViewportChange, { passive: true })

  return () => {
    disposed = true
    main.removeEventListener('pointerenter', onPointerEnter)
    main.removeEventListener('pointermove', onPointerMove)
    main.removeEventListener('pointerleave', onPointerLeave)
    window.removeEventListener('resize', onViewportChange)
    window.removeEventListener('scroll', onViewportChange)
    if (rafId) cancelAnimationFrame(rafId)
    if (decodeTimer) clearInterval(decodeTimer)
    if (nameEl) nameEl.textContent = originalName
    main.classList.remove('hero-fx', 'hero-fx--left', 'hero-fx--right')
    for (const v of ['--fx-x', '--fx-y', '--fx-r', '--fx-i']) main.style.removeProperty(v)
    spot.remove()
  }
}
