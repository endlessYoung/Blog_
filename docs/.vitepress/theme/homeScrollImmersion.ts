/** 首页滚动沉浸：--home-immersion（首屏）、--home-below（专栏网格）、--home-cta（底部 CTA） */

function clamp01(n: number) {
  return Math.min(1, Math.max(0, n))
}

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = clamp01((x - edge0) / (edge1 - edge0))
  return t * t * (3 - 2 * t)
}

function getScrollY(): number {
  if (typeof document === 'undefined') return 0
  const root = document.scrollingElement ?? document.documentElement
  return root.scrollTop ?? window.scrollY ?? document.documentElement.scrollTop ?? 0
}

function isOnVitePressHome(): boolean {
  return !!document.querySelector('.VPContent.is-home, #VPContent.is-home')
}

export function initHomeScrollImmersion() {
  if (typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return () => {}
  }

  const html = document.documentElement
  let raf = 0
  let disposed = false

  const rangeHero = () => Math.min(window.innerHeight * 0.48, 500)

  const apply = () => {
    if (disposed) return
    if (!isOnVitePressHome()) {
      html.style.removeProperty('--home-immersion')
      html.style.removeProperty('--home-below')
      html.style.removeProperty('--home-cta')
      return
    }

    const vh = window.innerHeight || 1
    const y = getScrollY()

    const immersion = smoothstep(0, rangeHero(), y)
    html.style.setProperty('--home-immersion', immersion.toFixed(4))

    const features = document.querySelector('.VPContent.is-home .VPFeatures')
    let below = 0
    if (features) {
      const enter = vh - features.getBoundingClientRect().top
      below = smoothstep(vh * -0.06, vh * 0.48, enter)
    }
    html.style.setProperty('--home-below', below.toFixed(4))

    const cta = document.querySelector('.VPContent.is-home .home-cta')
    let ctaReveal = 0
    if (cta) {
      const enter = vh - cta.getBoundingClientRect().top
      ctaReveal = smoothstep(vh * -0.04, vh * 0.46, enter)
    }
    html.style.setProperty('--home-cta', ctaReveal.toFixed(4))
  }

  const schedule = () => {
    if (raf) return
    raf = requestAnimationFrame(() => {
      raf = 0
      apply()
    })
  }

  const onScroll = () => schedule()

  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll)

  schedule()

  return () => {
    disposed = true
    window.removeEventListener('scroll', onScroll)
    window.removeEventListener('resize', onScroll)
    if (raf) cancelAnimationFrame(raf)
    html.style.removeProperty('--home-immersion')
    html.style.removeProperty('--home-below')
    html.style.removeProperty('--home-cta')
  }
}
