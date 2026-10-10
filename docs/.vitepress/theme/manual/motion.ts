import { nextTick } from 'vue'
import { normPath } from '../reading/catalog'
import { RETURN_PREPARE } from '../reading/landing'
import { dropFrames, type DropPoint } from '../fluid/drops'

export const EASE_OUT = 'cubic-bezier(.16, 1, .3, 1)'
const INTRO_KEY = 'ey-manual-intro'
const ACCENT_KEY = 'ey-accent'

export function reducedMotion() {
  return typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function readAccent(): 'orange' | 'blue' {
  if (typeof localStorage === 'undefined') return 'orange'
  return localStorage.getItem(ACCENT_KEY) === 'blue' ? 'blue' : 'orange'
}

export function writeAccent(accent: 'orange' | 'blue') {
  localStorage.setItem(ACCENT_KEY, accent)
  document.documentElement.dataset.accent = accent
}

export function rollOdo(el: HTMLElement, delay = 0) {
  if (reducedMotion()) return
  const digits = [...el.querySelectorAll<HTMLElement>('.odo-d')]
  digits.forEach((digit, i) => {
    const strip = digit.firstElementChild as HTMLElement | null
    if (!strip) return
    const n = Number(digit.dataset.d)
    strip.getAnimations().forEach((anim) => anim.cancel())
    strip.animate(
      [{ transform: `translateY(${-n}em)` }, { transform: `translateY(${-(10 + n)}em)` }],
      { duration: 700 + (digits.length - i) * 140, delay: delay + i * 40, easing: EASE_OUT, fill: 'forwards' },
    )
  })
}

export function shouldPlayIntro() {
  if (reducedMotion()) return false
  try {
    if (sessionStorage.getItem(INTRO_KEY)) return false
    sessionStorage.setItem(INTRO_KEY, '1')
  } catch {
    return false
  }
  return true
}

export function playMastheadIntro(title: HTMLElement, odos: HTMLElement[]) {
  const root = document.documentElement
  root.classList.remove('intro')
  void root.offsetWidth
  root.classList.add('intro')
  title.querySelectorAll<HTMLElement>('.ch').forEach((ch, i) => {
    const dx = (((i * 7) % 5) - 2) * 16
    const dy = (((i * 3) % 3) - 1) * 12
    ch.animate(
      [{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' }],
      { duration: 620, delay: 160 + i * 36, easing: EASE_OUT, fill: 'backwards' },
    )
  })
  odos.forEach((el, i) => rollOdo(el, 500 + i * 90))
  window.setTimeout(() => root.classList.remove('intro'), 2400)
}

interface TransitionRouter {
  go: (to: string) => Promise<void>
}

function clearNames() {
  document.documentElement.classList.remove('vt-fwd', 'vt-back', 'vt-theme')
  document.querySelectorAll<HTMLElement>('[data-vt], .manual-a-num, .spatial-a-num, .fluid-a-num, .a-title, .vp-doc h1').forEach((el) => {
    el.style.viewTransitionName = ''
  })
}

function activeWorld(): 'manual' | 'spatial' | 'fluid' {
  const root = document.documentElement
  if (root.classList.contains('fluid')) return 'fluid'
  if (root.classList.contains('spatial')) return 'spatial'
  return 'manual'
}

function paintFluid(transition: ViewTransition, point: DropPoint, back: boolean) {
  transition.ready.then(() => {
    if (!document.documentElement.classList.contains('fluid')) return
    const root = document.documentElement
    const target = [...document.querySelectorAll<HTMLElement>('[data-vt]')]
      .find((el) => el.style.viewTransitionName === 'vt-num')
    const rect = target?.getBoundingClientRect()
    const at = back && rect && rect.width
      ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
      : point
    if (back) {
      root.animate(dropFrames(at, { shrink: true }), {
        duration: 720,
        easing: 'cubic-bezier(.55, 0, .3, 1)',
        pseudoElement: '::view-transition-old(root)',
        fill: 'forwards',
      })
      root.animate(
        [{ transform: 'scale(1.04)', filter: 'brightness(.7)' }, { transform: 'none', filter: 'none' }],
        { duration: 720, easing: EASE_OUT, pseudoElement: '::view-transition-new(root)' },
      )
      return
    }
    root.animate(dropFrames(at), {
      duration: 820,
      easing: 'cubic-bezier(.7, 0, .25, 1)',
      pseudoElement: '::view-transition-new(root)',
    })
    root.animate(
      [{ transform: 'none', filter: 'none' }, { transform: 'scale(.965)', filter: 'brightness(.65) blur(2px)' }],
      { duration: 820, easing: 'cubic-bezier(.65, 0, .35, 1)', pseudoElement: '::view-transition-old(root)', fill: 'forwards' },
    )
  }).catch(() => {})
}

function canTransition(event: MouseEvent) {
  if (event.button !== 0) return false
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false
  return !reducedMotion() && typeof document.startViewTransition === 'function'
}

function tagPair(num: HTMLElement | null, title: HTMLElement | null) {
  if (num) num.style.viewTransitionName = 'vt-num'
  if (title) title.style.viewTransitionName = 'vt-title'
}

function returnMeta(kind: 'manual' | 'spatial' | 'fluid') {
  if (kind === 'fluid') {
    return {
      key: 'ey-fluid-return',
      event: 'ey-fluid-returned',
      num: '.fluid-a-num',
      link: '.fl-parts a.fluid-art-link',
      part: '.fl-part',
      partNum: '.fl-num',
      partName: '.fl-name',
    }
  }
  if (kind === 'spatial') {
    return {
      key: 'ey-spatial-return',
      event: 'ey-spatial-returned',
      num: '.spatial-a-num',
      link: '.sp-parts a.spatial-art-link',
      part: '.sp-part',
      partNum: '.sp-num',
      partName: '.sp-name',
    }
  }
  return {
    key: 'ey-manual-return',
    event: 'ey-manual-returned',
    num: '.manual-a-num',
    link: '.parts a.manual-art-link',
    part: '.manual-home .part',
    partNum: '.part-num',
    partName: '.part-name',
  }
}

function settle(transition: ViewTransition, after?: () => void) {
  transition.ready.catch(() => {})
  transition.updateCallbackDone.catch(() => {})
  const done = () => {
    after?.()
    clearNames()
  }
  transition.finished.then(done, done)
}

export function bindCatalogTransitions(router: TransitionRouter) {
  const onClick = (event: MouseEvent) => {
    const target = event.target as Element | null
    if (!target) return
    const kind = activeWorld()
    const home = target.closest('.ey-brand, .a-back, .VPNavBarTitle a') as HTMLAnchorElement | null
    const meta = returnMeta(kind)
    const articleNum = document.querySelector<HTMLElement>(meta.num)
    if (home && articleNum) {
      const href = home.getAttribute('href')
      const title = document.querySelector<HTMLElement>('.a-title, .vp-doc h1')
      if (!href || !title) return
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
      const from = normPath(location.pathname)
      try { sessionStorage.setItem(meta.key, from) } catch { /* ignore */ }
      if (!canTransition(event)) return
      event.preventDefault()
      event.stopPropagation()
      tagPair(articleNum, title)
      document.documentElement.classList.add('vt-back')
      const backPoint = { x: event.clientX, y: event.clientY }
      const transition = document.startViewTransition(async () => {
        articleNum.style.viewTransitionName = ''
        title.style.viewTransitionName = ''
        await router.go(href)
        await nextTick()
        window.dispatchEvent(new CustomEvent(RETURN_PREPARE, { detail: from }))
        await nextTick()
        document.body.getBoundingClientRect()
        const next = [...document.querySelectorAll<HTMLAnchorElement>(meta.link)]
          .find((link) => normPath(link.dataset.path || link.getAttribute('href') || '') === from)
        const rect = next?.getBoundingClientRect()
        if (next && rect && rect.height > 2) {
          next.scrollIntoView({ block: 'center', inline: 'nearest' })
          tagPair(
            next.querySelector<HTMLElement>('.art-num'),
            next.querySelector<HTMLElement>('.art-title'),
          )
          return
        }
        const part = next?.closest<HTMLElement>(meta.part)
          || document.querySelector<HTMLElement>(`${meta.part}.landing, ${meta.part}.open`)
        tagPair(
          part?.querySelector<HTMLElement>(meta.partNum) || null,
          part?.querySelector<HTMLElement>(meta.partName) || null,
        )
      })
      if (kind === 'fluid') paintFluid(transition, backPoint, true)
      settle(transition, () => window.dispatchEvent(new Event(meta.event)))
      return
    }

    if (!canTransition(event)) return
    const link = target.closest('a.manual-art-link, a.spatial-art-link, a.fluid-art-link') as HTMLAnchorElement | null
    if (!link) return
    if (link.closest('.gallery.suppress')) {
      event.preventDefault()
      event.stopPropagation()
      return
    }
    const href = link.getAttribute('href')
    if (!href || href.startsWith('http') || href.startsWith('mailto:')) return
    const num = link.querySelector<HTMLElement>('.art-num')
    const title = link.querySelector<HTMLElement>('.art-title')
    if (!num || !title) return

    // If already inside an article (e.g. clicking another article in the side chapter list),
    // do not trigger full-root View Transition which causes old/new page jump & flicker.
    // Instead, let standard VitePress SPA router handle it seamlessly.
    const isCurrentlyArticle = !!document.querySelector('.m-article')
    if (isCurrentlyArticle) {
      return
    }

    event.preventDefault()
    event.stopPropagation()
    tagPair(num, title)
    if (kind === 'spatial') document.documentElement.classList.add('vt-fwd')
    const point = { x: event.clientX, y: event.clientY }
    const transition = document.startViewTransition(async () => {
      num.style.viewTransitionName = ''
      title.style.viewTransitionName = ''
      await router.go(href)
      await nextTick()
      tagPair(
        document.querySelector<HTMLElement>('.manual-a-num, .spatial-a-num, .fluid-a-num'),
        document.querySelector<HTMLElement>('.a-title, .vp-doc h1'),
      )
    })
    if (kind === 'fluid') paintFluid(transition, point, false)
    settle(transition)
  }

  document.addEventListener('click', onClick, true)
  return () => document.removeEventListener('click', onClick, true)
}
