import { provide, type Ref } from 'vue'

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
    if (typeof document.startViewTransition !== 'function') {
      apply()
      return
    }
    document.startViewTransition(apply)
  })
}
