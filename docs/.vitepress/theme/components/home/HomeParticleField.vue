<template>
  <canvas ref="canvasRef" class="home-particles" aria-hidden="true"></canvas>
  <div v-if="debugDot" ref="dotRef" class="particle-debug-dot" aria-hidden="true"></div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

const DEBUG = false // 红点调试：需要时改为 true 显示光标位置

const canvasRef = ref<HTMLCanvasElement | null>(null)
const dotRef = ref<HTMLDivElement | null>(null)
const debugDot = DEBUG

/** 首页粒子背景：完整粒子阵列，鼠标悬停/滑动处按物理特征疏散
 *  被疏散的粒子点亮炫彩颜色（HSV 动态色相），普通粒子保持克制配色
 *  物理：弹簧回位 + 阻尼 + 光标排斥力场；弱回弹让滑动留下尾迹
 *  降级：≤960px / prefers-reduced-motion / 无 WebGL 时静默跳过
 */
const MOBILE_MQ = '(max-width: 960px)'
const DPR_CAP = 2
const ACCENT_RATIO = 0.06
const STIFFNESS = 0.032   // 回位弹簧刚度（弱化，让疏散尾迹更持久）
const DAMPING = 0.88      // 速度阻尼
const REPEL_RADIUS = 240  // 排斥半径(px)
const REPEL_FORCE = 3.4   // 排斥力度
const ACTIVE_THRESHOLD = 4 // 位移超过该值(px)视为"疏散中"

interface Particle {
  hx: number
  hy: number
  x: number
  y: number
  vx: number
  vy: number
  active: number // 0..1 平滑激活值
  baseAlpha: number // 本底透明度（主题切换时乘以 alphaMul）
  baseSize: number // 本底尺寸（主题切换时乘以 sizeMul）
}

let disposed = false
let rafId = 0
let running = false
/** 粒子运行期清理（resize / 进小屏时调用） */
let runtimeCleanups: Array<() => void> = []
/** 组件生命周期清理（仅 unmount） */
let lifecycleCleanups: Array<() => void> = []

let renderer: any = null
let scene: any = null
let camera: any = null
let geometry: any = null
let material: any = null
let particles: Particle[] = []
let posArray: Float32Array | null = null
let activeArray: Float32Array | null = null
let mouse = { x: -9999, y: -9999 }
let mouseTarget = { x: -9999, y: -9999 }
let width = 0
let height = 0
let dpr = 1
let lastTime = 0

function webglSupported(): boolean {
  try {
    const c = document.createElement('canvas')
    return !!(
      c.getContext('webgl2') ||
      c.getContext('webgl') ||
      (c.getContext as (t: string) => unknown)('experimental-webgl')
    )
  } catch {
    return false
  }
}

function isEligible(): boolean {
  if (typeof window === 'undefined') return false
  // 与 mobile.css 断点一致：小屏彻底不启粒子
  if (window.matchMedia(MOBILE_MQ).matches) return false
  if (window.innerWidth <= 960) return false
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
  return true
}

/** 停掉粒子场；保留媒体查询监听以便回到大屏可重启 */
function teardown(): void {
  pause()
  for (const fn of runtimeCleanups) fn()
  runtimeCleanups = []
  particles = []
  posArray = null
  activeArray = null
  geometry = null
  material = null
  scene = null
  camera = null
  renderer = null
  const canvas = canvasRef.value
  if (canvas) {
    canvas.width = 0
    canvas.height = 0
    canvas.style.display = 'none'
  }
}

function currentPalette() {
  const dark = document.documentElement.classList.contains('dark')
  return dark
    ? { base: [0.82, 0.9, 1], accent: [0.14, 0.82, 0.93], alphaMul: 1, sizeMul: 1 }
    : { base: [0.09, 0.11, 0.16], accent: [0.02, 0.35, 0.45], alphaMul: 1.8, sizeMul: 1.0 }
}

function particleCount(): number {
  const area = window.innerWidth * window.innerHeight
  return Math.max(900, Math.min(2600, Math.round(area / 700)))
}

/** 均匀覆盖的抖动网格（避免视觉聚团，保证"阵列"感） */
function buildParticles(count: number): { xs: number[]; ys: number[] } {
  const aspect = width / height
  const cols = Math.max(1, Math.round(Math.sqrt(count * aspect)))
  const rows = Math.max(1, Math.round(count / cols))
  const cellW = width / cols
  const cellH = height / rows
  const xs: number[] = []
  const ys: number[] = []
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (xs.length >= count) break
      const jx = (Math.random() - 0.5) * cellW * 0.6
      const jy = (Math.random() - 0.5) * cellH * 0.6
      xs.push(c * cellW + cellW / 2 + jx)
      ys.push(r * cellH + cellH / 2 + jy)
    }
  }
  return { xs, ys }
}

async function start(): Promise<void> {
  const canvas = canvasRef.value
  if (!canvas || disposed) return
  if (!isEligible()) {
    canvas.style.display = 'none'
    return
  }
  if (!webglSupported()) return
  if (renderer) return // 已在运行

  const THREE = await import('three')
  // 懒加载期间可能已卸载，或缩到小屏
  if (disposed || !canvasRef.value || !isEligible()) return

  const palette = currentPalette()
  dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP)
  width = window.innerWidth
  height = window.innerHeight
  canvas.width = Math.round(width * dpr)
  canvas.height = Math.round(height * dpr)
  canvas.style.width = width + 'px'
  canvas.style.height = height + 'px'
  canvas.style.display = ''

  renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: 'high-performance' })
  renderer.setPixelRatio(dpr)
  renderer.setSize(width, height, false)

  scene = new THREE.Scene()
  camera = new THREE.OrthographicCamera(0, width, 0, height, -1, 1)
  camera.position.z = 1

  const count = particleCount()
  const { xs, ys } = buildParticles(count)

  particles = []
  posArray = new Float32Array(count * 3)
  activeArray = new Float32Array(count)
  const sizes = new Float32Array(count)
  const alphas = new Float32Array(count)
  const accents = new Float32Array(count)
  const hues = new Float32Array(count)

  for (let i = 0; i < count; i++) {
    const sizeScale = 0.55 + Math.random() * 0.9
    const isAccent = Math.random() < ACCENT_RATIO
    const baseAlpha = (0.35 + Math.random() * 0.4) * (isAccent ? 1.2 : 1)
    const baseSize = sizeScale * (1.6 + Math.random() * 2.0)
    particles.push({ hx: xs[i], hy: ys[i], x: xs[i], y: ys[i], vx: 0, vy: 0, active: 0, baseAlpha, baseSize })
    posArray[i * 3] = xs[i]
    posArray[i * 3 + 1] = ys[i]
    posArray[i * 3 + 2] = 0
    sizes[i] = baseSize * palette.sizeMul
    alphas[i] = baseAlpha * palette.alphaMul
    accents[i] = isAccent ? 1 : 0
    hues[i] = Math.random() // 每颗粒子固定色相，随时间漂移
  }

  geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3))
  geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1))
  geometry.setAttribute('aAlpha', new THREE.BufferAttribute(alphas, 1))
  geometry.setAttribute('aAccent', new THREE.BufferAttribute(accents, 1))
  geometry.setAttribute('aHue', new THREE.BufferAttribute(hues, 1))
  geometry.setAttribute('aActive', new THREE.BufferAttribute(activeArray, 1))

  const vertexShader = `
    uniform float uPixelRatio;
    attribute float aSize;
    attribute float aAlpha;
    attribute float aAccent;
    attribute float aHue;
    attribute float aActive;
    varying float vAlpha;
    varying float vAccent;
    varying float vHue;
    varying float vActive;
    void main() {
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      gl_PointSize = aSize * uPixelRatio;
      vAlpha = aAlpha;
      vAccent = aAccent;
      vHue = aHue;
      vActive = aActive;
    }
  `
  const fragmentShader = `
    uniform vec3 uBaseColor;
    uniform vec3 uAccentColor;
    uniform float uTime;
    varying float vAlpha;
    varying float vAccent;
    varying float vHue;
    varying float vActive;
    vec3 hsv2rgb(vec3 c) {
      vec3 p = abs(fract(c.xxx + vec3(0.0, 2.0 / 3.0, 1.0 / 3.0)) * 6.0 - 3.0);
      return c.z * mix(vec3(1.0), clamp(p - 1.0, 0.0, 1.0), c.y);
    }
    void main() {
      vec2 uv = gl_PointCoord - 0.5;
      float d = length(uv);
      float alpha = smoothstep(0.5, 0.1, d) * vAlpha;
      // 疏散中的粒子：HSV 动态炫彩；其余：黑白基色 + 青色点缀
      vec3 vivid = hsv2rgb(vec3(fract(vHue + uTime * 0.04), 0.85, 1.0));
      vec3 calm = mix(uBaseColor, uAccentColor, vAccent);
      vec3 color = mix(calm, vivid, vActive);
      gl_FragColor = vec4(color, alpha * (1.0 + vActive * 0.6));
    }
  `

  material = new THREE.ShaderMaterial({
    uniforms: {
      uPixelRatio: { value: dpr },
      uBaseColor: { value: new THREE.Color(...palette.base) },
      uAccentColor: { value: new THREE.Color(...palette.accent) },
      uTime: { value: 0 },
    },
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
  })

  const points = new THREE.Points(geometry, material)
  points.frustumCulled = false
  scene.add(points)

  const onPointerMove = (e: PointerEvent) => {
    mouseTarget.x = e.clientX
    mouseTarget.y = e.clientY
    if (debugDot && dotRef.value) {
      dotRef.value.style.left = e.clientX + 'px'
      dotRef.value.style.top = e.clientY + 'px'
    }
  }
  const onPointerLeave = () => {
    mouseTarget.x = -9999
    mouseTarget.y = -9999
  }
  const onResize = () => {
    if (!isEligible()) {
      teardown()
      return
    }
    if (!renderer || !camera || !material || !geometry) return
    const oldW = width
    const oldH = height
    width = window.innerWidth
    height = window.innerHeight
    dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP)
    renderer.setSize(width, height, false)
    canvas.width = Math.round(width * dpr)
    canvas.height = Math.round(height * dpr)
    canvas.style.width = width + 'px'
    canvas.style.height = height + 'px'
    camera.left = 0
    camera.right = width
    camera.top = 0
    camera.bottom = height
    camera.updateProjectionMatrix()
    material.uniforms.uPixelRatio.value = dpr
    // 粒子场按比例伸缩，保持铺满新视口
    if (oldW > 0 && oldH > 0) {
      const sx = width / oldW
      const sy = height / oldH
      const arr = posArray
      if (arr) {
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i]
          p.x *= sx
          p.hx *= sx
          p.y *= sy
          p.hy *= sy
          arr[i * 3] = p.x
          arr[i * 3 + 1] = p.y
        }
        geometry.attributes.position.needsUpdate = true
      }
    }
  }
  const applyAlpha = () => {
    const pal = currentPalette()
    const mul = pal.alphaMul
    for (let i = 0; i < particles.length; i++) {
      activeArray![i] = particles[i].baseAlpha * mul
      sizes![i] = particles[i].baseSize * pal.sizeMul
    }
    geometry.attributes.aAlpha.needsUpdate = true
    geometry.attributes.aSize.needsUpdate = true
  }
  const themeObserver = new MutationObserver(() => {
    const p = currentPalette()
    material.uniforms.uBaseColor.value.set(...p.base)
    material.uniforms.uAccentColor.value.set(...p.accent)
    applyAlpha()
  })
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })

  window.addEventListener('pointermove', onPointerMove, { passive: true })
  window.addEventListener('pointerleave', onPointerLeave)
  window.addEventListener('resize', onResize)
  document.addEventListener('visibilitychange', onVisibility)
  runtimeCleanups.push(() => {
    window.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('pointerleave', onPointerLeave)
    window.removeEventListener('resize', onResize)
    document.removeEventListener('visibilitychange', onVisibility)
    themeObserver.disconnect()
    scene.remove(points)
    geometry.dispose()
    material.dispose()
    renderer.dispose()
    renderer = null
  })

  lastTime = performance.now()
  running = true
  const loop = (now: number) => {
    if (!running || disposed) return
    rafId = requestAnimationFrame(loop)
    const dt = Math.min(Math.max((now - lastTime) / 16.667, 0.5), 2)
    lastTime = now
    mouse.x = mouseTarget.x
    mouse.y = mouseTarget.y
    material.uniforms.uTime.value = now * 0.001
    step(dt)
    renderer.render(scene, camera)
  }
  rafId = requestAnimationFrame(loop)
}

/** 物理步进：弹簧回位 + 阻尼 + 光标排斥；疏散中粒子平滑点亮 */
function step(dt: number): void {
  const arr = posArray
  const act = activeArray
  if (!arr || !act) return
  const r2 = REPEL_RADIUS * REPEL_RADIUS
  for (let i = 0; i < particles.length; i++) {
    const p = particles[i]
    let fx = (p.hx - p.x) * STIFFNESS
    let fy = (p.hy - p.y) * STIFFNESS
    const dx = p.x - mouse.x
    const dy = p.y - mouse.y
    const d2 = dx * dx + dy * dy
    if (d2 < r2 && d2 > 0.0001) {
      const d = Math.sqrt(d2)
      const falloff = 1 - d / REPEL_RADIUS
      fx += (dx / d) * REPEL_FORCE * falloff
      fy += (dy / d) * REPEL_FORCE * falloff
    }
    p.vx = (p.vx + fx * dt) * Math.pow(DAMPING, dt)
    p.vy = (p.vy + fy * dt) * Math.pow(DAMPING, dt)
    p.x += p.vx * dt
    p.y += p.vy * dt
    arr[i * 3] = p.x
    arr[i * 3 + 1] = p.y
    // 疏散激活：位移超过阈值则点亮，平滑过渡
    const dist = Math.hypot(p.x - p.hx, p.y - p.hy)
    const target = dist > ACTIVE_THRESHOLD ? 1 : 0
    p.active += (target - p.active) * 0.12
    if (p.active > 0.003) act[i] = p.active
    else act[i] = 0
  }
  geometry.attributes.position.needsUpdate = true
  geometry.attributes.aActive.needsUpdate = true
}

function onVisibility() {
  if (document.hidden) pause()
  else resume()
}

function pause() {
  running = false
  cancelAnimationFrame(rafId)
}

function resume() {
  if (disposed || !renderer) return
  running = true
  lastTime = performance.now()
  const loop = (now: number) => {
    if (!running || disposed) return
    rafId = requestAnimationFrame(loop)
    const dt = Math.min(Math.max((now - lastTime) / 16.667, 0.5), 2)
    lastTime = now
    mouse.x += (mouseTarget.x - mouse.x) * 0.3
    mouse.y += (mouseTarget.y - mouse.y) * 0.3
    material.uniforms.uTime.value = now * 0.001
    step(dt)
    renderer.render(scene, camera)
  }
  rafId = requestAnimationFrame(loop)
}

onMounted(() => {
  void start()
  const mq = window.matchMedia(MOBILE_MQ)
  const onMq = () => {
    if (!isEligible()) teardown()
    else if (!renderer) void start()
  }
  if (typeof mq.addEventListener === 'function') mq.addEventListener('change', onMq)
  else mq.addListener(onMq)
  lifecycleCleanups.push(() => {
    if (typeof mq.removeEventListener === 'function') mq.removeEventListener('change', onMq)
    else mq.removeListener(onMq)
  })
})
onBeforeUnmount(() => {
  disposed = true
  teardown()
  for (const fn of lifecycleCleanups) fn()
  lifecycleCleanups = []
})
</script>

<style scoped>
.home-particles {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  opacity: 0.9;
}

.particle-debug-dot {
  position: fixed;
  width: 10px;
  height: 10px;
  margin: -5px 0 0 -5px;
  border-radius: 50%;
  background: #ff2d2d;
  box-shadow: 0 0 8px rgba(255, 45, 45, 0.9);
  z-index: 2147483001;
  pointer-events: none;
}
</style>
