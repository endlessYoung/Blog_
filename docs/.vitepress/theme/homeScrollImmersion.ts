/**
 * 首页大屏分层视差：
 * --home-immersion：首屏/最新文章进度
 * --home-below：专栏标题进度
 * --cat-reveal：每张专栏卡独立进度（错落入场）
 * --home-cta：底部 CTA 进度
 * 小屏关闭，落到静态终态。
 */

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

function clearCatReveals() {
  document.querySelectorAll<HTMLElement>('.home-cat-card').forEach((el) => {
    el.style.removeProperty('--cat-reveal')
  })
}

export function initHomeScrollImmersion() {
  if (typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return () => {}
  }

  const html = document.documentElement
  const mobileMql =
    typeof matchMedia !== 'undefined' ? matchMedia('(max-width: 959px)') : null
  let raf = 0
  let disposed = false
  let mobileFinalApplied = false

  /** 大屏：略拉长行程，中等强度视差更跟手 */
  const rangeHero = () => Math.min(window.innerHeight * 0.55, 560)

  /** 小屏不做滚动视差：一次性落到最终静态状态 */
  const applyFinalMobile = () => {
    if (mobileFinalApplied) return
    mobileFinalApplied = true
    html.style.setProperty('--home-immersion', '0')
    html.style.setProperty('--home-below', '1')
    html.style.setProperty('--home-cta', '1')
    document.querySelectorAll<HTMLElement>('.home-cat-card').forEach((el) => {
      el.style.setProperty('--cat-reveal', '1')
    })
  }

  const apply = () => {
    if (disposed) return
    if (!isOnVitePressHome()) {
      html.style.removeProperty('--home-immersion')
      html.style.removeProperty('--home-below')
      html.style.removeProperty('--home-cta')
      clearCatReveals()
      mobileFinalApplied = false
      return
    }

    if (mobileMql?.matches) {
      applyFinalMobile()
      return
    }
    mobileFinalApplied = false

    const vh = window.innerHeight || 1
    const y = getScrollY()

    const immersion = smoothstep(0, rangeHero(), y)
    html.style.setProperty('--home-immersion', immersion.toFixed(4))

    const head = document.querySelector('.VPContent.is-home .home-sec-head')
    let below = 0
    if (head) {
      const enter = vh - head.getBoundingClientRect().top
      below = smoothstep(vh * -0.02, vh * 0.5, enter)
    }
    html.style.setProperty('--home-below', below.toFixed(4))

    /* 每张卡独立进度：中等偏戏的错落 */
    const cards = document.querySelectorAll<HTMLElement>('.VPContent.is-home .home-cat-card')
    cards.forEach((card, i) => {
      const enter = vh - card.getBoundingClientRect().top
      const lag = i * 0.04
      const reveal = smoothstep(vh * (0.04 + lag), vh * (0.46 + lag * 0.55), enter)
      card.style.setProperty('--cat-reveal', reveal.toFixed(4))
    })

    const cta = document.querySelector('.VPContent.is-home .home-cta')
    let ctaReveal = 0
    if (cta) {
      const enter = vh - cta.getBoundingClientRect().top
      ctaReveal = smoothstep(vh * 0.02, vh * 0.52, enter)
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
    clearCatReveals()
  }
}
