/**
 * 首页大卡开场运镜：整卡轻推近（96%→100%）+ 淡入。
 * 每次进入首页播放；reduced-motion / 小屏跳过，直接定格。
 */

export function playHeroCinematicEnter(): (() => void) | undefined {
  if (typeof window === 'undefined') return
  if (window.innerWidth <= 960) return

  const main = document.querySelector<HTMLElement>(
    '.VPContent.is-home .VPHero.has-image .main, .home-landing .VPHero.has-image .main',
  )
  if (!main) return

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
  main.classList.add('hero-cine')

  if (reduced) {
    main.classList.add('hero-cine--in')
    return () => {
      main.classList.remove('hero-cine', 'hero-cine--in')
    }
  }

  /* 重启：先回到起幅，双 rAF 后再落幅，保证每次进入都能重播 */
  main.classList.remove('hero-cine--in')
  void main.offsetWidth

  let raf1 = 0
  let raf2 = 0
  let doneTimer: ReturnType<typeof setTimeout> | undefined

  raf1 = requestAnimationFrame(() => {
    raf2 = requestAnimationFrame(() => {
      main.classList.add('hero-cine--in')
      /* 动画结束后去掉 will-change 压力 */
      doneTimer = setTimeout(() => {
        main.classList.add('hero-cine--settled')
      }, 950)
    })
  })

  return () => {
    if (raf1) cancelAnimationFrame(raf1)
    if (raf2) cancelAnimationFrame(raf2)
    if (doneTimer) clearTimeout(doneTimer)
    main.classList.remove('hero-cine', 'hero-cine--in', 'hero-cine--settled')
  }
}
