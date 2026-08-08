/** 标语手绘下划线已关闭；清理历史注入的 SVG */
export function initHeroUnderline(): void {
  if (typeof document === 'undefined') return
  document.querySelectorAll('.hero-underline').forEach((el) => el.remove())
  document.querySelectorAll('.VPHero .text[data-underline]').forEach((el) => {
    delete (el as HTMLElement).dataset.underline
  })
}
