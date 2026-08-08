/**
 * 首页 Hero 右区 journey 背板挂载点。
 * 书页角标已撤；阅读示意待重新定案。
 */

export function initHeroJourneyPanel(): (() => void) | undefined {
  if (typeof window === 'undefined') return
  if (window.innerWidth <= 960) return

  const actions = document.querySelector<HTMLElement>(
    '.VPContent.is-home .VPHero.has-image .actions, .home-landing .VPHero.has-image .actions',
  )
  if (!actions || actions.classList.contains('hero-journey')) return

  actions.classList.add('hero-journey')

  return () => {
    actions.classList.remove('hero-journey')
  }
}
