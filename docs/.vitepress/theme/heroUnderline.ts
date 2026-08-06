/** 标语手绘下划线：在 hero 标语下方注入 SVG 波浪线，一笔画出（仅桌面端） */
export function initHeroUnderline(): void {
  if (typeof document === 'undefined') return
  if (window.innerWidth < 960) return

  const textEl = document.querySelector('.VPHero .text')
  if (!textEl || textEl.dataset.underline) return
  if (!(textEl.textContent ?? '').trim()) return
  const mainEl = textEl.closest('.VPHero .main')
  if (!mainEl) return

  const SVG_NS = 'http://www.w3.org/2000/svg'
  const svg = document.createElementNS(SVG_NS, 'svg')
  svg.setAttribute('class', 'hero-underline')
  svg.setAttribute('viewBox', '0 0 1000 24')
  svg.setAttribute('preserveAspectRatio', 'none')
  const path = document.createElementNS(SVG_NS, 'path')
  path.setAttribute('class', 'hero-underline__path')
  path.setAttribute(
    'd',
    'M4,14 C30,20 55,9 82,13 C112,18 140,9 168,12 C198,16 228,8 258,12 C290,17 320,9 352,12 C384,16 414,8 446,11 C478,15 508,9 540,12 C572,16 602,9 634,11 C666,15 696,9 728,11 C760,15 790,9 822,11 C854,15 884,10 916,12 C948,16 978,10 996,12',
  )
  path.setAttribute('vector-effect', 'non-scaling-stroke')
  svg.appendChild(path)
  mainEl.appendChild(svg)
  // 覆盖 tech.css 的 .VPHero .main > * { position: relative }，内联优先级最高
  svg.style.position = 'absolute'

  const position = () => {
    const textRect = textEl.getBoundingClientRect()
    const mainRect = mainEl.getBoundingClientRect()
    svg.style.width = Math.round(textRect.width) + 'px'
    svg.style.height = '16px'
    svg.style.left = Math.round(textRect.left - mainRect.left) + 'px'
    svg.style.top = Math.round(textRect.bottom - mainRect.top + 4) + 'px'
  }
  position()
  const onResize = () => {
    if (!document.body.contains(svg)) {
      window.removeEventListener('resize', onResize)
      return
    }
    position()
  }
  window.addEventListener('resize', onResize)
  textEl.dataset.underline = '1'

  // 等 hero 入场动画结束：重新定位 + 一笔画出；reduced-motion 仅静态显示
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  window.setTimeout(() => {
    position()
    if (reduced) return
    const len = path.getTotalLength()
    path.style.strokeDasharray = String(len)
    path.style.strokeDashoffset = String(len)
    requestAnimationFrame(() => {
      path.style.transition = 'stroke-dashoffset 1.5s cubic-bezier(0.33, 1, 0.68, 1)'
      path.style.strokeDashoffset = '0'
    })
  }, 900)
}
