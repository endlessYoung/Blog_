import { provide, type Ref } from 'vue'
import { world } from './reading/world'
import { springEase } from './spatial/spring'
import { dropFrames } from './fluid/drops'

export const APPEARANCE_TRANSITION_MS = 400

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function provideAnimatedAppearanceToggle(
  isDark: Ref<boolean>,
  skipViewTransition: () => boolean,
): void {
  provide('toggle-appearance', () => {
    const apply = () => {
      isDark.value = !isDark.value
    }
    if (prefersReducedMotion() || skipViewTransition()) {
      apply()
      return
    }
    const nextDark = !isDark.value
    if (world.value === 'fluid') {
      inkTheme(apply)
      return
    }
    if (world.value === 'spatial') {
      revealTheme(apply, nextDark)
      return
    }
    const bg = nextDark ? '#111214' : '#fafaf8'
    const ov = document.createElement('div')
    ov.className = 'manual-flip'
    for (let i = 0; i < 12; i++) {
      const column = document.createElement('i')
      column.style.background = bg
      ov.append(column)
    }
    document.body.append(ov)
    const ease = 'cubic-bezier(.16, 1, .3, 1)'
    const anims = [...ov.children].map((column, index) =>
      (column as HTMLElement).animate(
        [{ transform: 'rotateY(-92deg)' }, { transform: 'none' }],
        { duration: 360, delay: index * 30, easing: ease, fill: 'backwards' },
      ),
    )
    Promise.all(anims.map((anim) => anim.finished))
      .then(() => {
        apply()
        return ov.animate(
          [{ opacity: 1 }, { opacity: 0 }],
          { duration: 260, easing: 'ease-out', fill: 'forwards' },
        ).finished
      })
      .then(() => ov.remove())
      .catch(() => {
        apply()
        ov.remove()
      })
  })
}

function inkTheme(apply: () => void) {
  const root = document.documentElement
  if (typeof document.startViewTransition !== 'function') {
    apply()
    return
  }
  const nodes = [...document.querySelectorAll<HTMLElement>('.VPSwitchAppearance')]
  const btn = nodes.find((el) => el.getBoundingClientRect().width > 0)
  const rect = btn?.getBoundingClientRect()
  const point = {
    x: rect ? rect.left + rect.width / 2 : window.innerWidth / 2,
    y: rect ? rect.top + rect.height / 2 : 24,
  }
  root.classList.add('vt-theme')
  const transition = document.startViewTransition(() => {
    apply()
  })
  transition.ready.then(() => {
    root.animate(dropFrames(point, { ink: true }), {
      duration: 1150,
      easing: 'cubic-bezier(.45, 0, .2, 1)',
      pseudoElement: '::view-transition-new(root)',
    })
  }).catch(() => {})
  transition.finished.finally(() => {
    root.classList.remove('vt-theme')
  }).catch(() => {
    root.classList.remove('vt-theme')
  })
}

function revealTheme(apply: () => void, nextDark: boolean) {
  const root = document.documentElement
  if (typeof document.startViewTransition !== 'function') {
    apply()
    return
  }
  const nodes = [...document.querySelectorAll<HTMLElement>('.VPSwitchAppearance')]
  const btn = nodes.find((el) => el.getBoundingClientRect().width > 0)
  const rect = btn?.getBoundingClientRect()
  const x = rect ? rect.left + rect.width / 2 : window.innerWidth / 2
  const y = rect ? rect.top + rect.height / 2 : 24
  const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y)) + 260
  const curve = springEase('gentle')
  root.style.setProperty('--tx', `${x}px`)
  root.style.setProperty('--ty', `${y}px`)
  root.classList.add('vt-theme', nextDark ? 'to-dark' : 'to-light')
  const transition = document.startViewTransition(() => {
    apply()
  })
  transition.ready.then(() => {
    root.animate(
      { '--reveal': ['0px', `${radius}px`] },
      {
        duration: curve.duration * 2.2,
        easing: curve.easing,
        pseudoElement: '::view-transition-new(root)',
        fill: 'both',
      },
    )
  }).catch(() => {})
  transition.finished.finally(() => {
    root.classList.remove('vt-theme', 'to-dark', 'to-light')
  }).catch(() => {
    root.classList.remove('vt-theme', 'to-dark', 'to-light')
  })
}
