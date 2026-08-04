/**
 * 让文章右侧目录（TOC）自动跟随：激活项被挤出可视区时，
 * 滚动 .aside-container 使当前高亮保持可见（不触发页面滚动）。
 */
export function initOutlineAutoScroll(): () => void {
  if (typeof document === 'undefined') return () => {}

  const outline = document.querySelector('.VPDocAsideOutline')
  if (!outline) return () => {}

  let ticking = false
  const scrollActiveIntoView = (): void => {
    ticking = false
    const container = outline.closest('.aside-container') as HTMLElement | null
    const active = outline.querySelector('.outline-link.active') as HTMLElement | null
    if (!container || !active) return
    const pad = 16
    const cRect = container.getBoundingClientRect()
    const aRect = active.getBoundingClientRect()
    if (aRect.top < cRect.top + pad) {
      container.scrollTop -= cRect.top + pad - aRect.top
    } else if (aRect.bottom > cRect.bottom - pad) {
      container.scrollTop += aRect.bottom - (cRect.bottom - pad)
    }
  }

  const observer = new MutationObserver(() => {
    if (!ticking) {
      ticking = true
      requestAnimationFrame(scrollActiveIntoView)
    }
  })
  observer.observe(outline, { subtree: true, attributes: true, attributeFilter: ['class'] })

  return () => observer.disconnect()
}
