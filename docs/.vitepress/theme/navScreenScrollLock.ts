/** 移动菜单打开时锁定底层页面滚动，避免滚轮/触摸穿透 */

function isNavScreenOpen(): boolean {
  return !!document.querySelector('.VPNavScreen, #VPNavScreen')
}

function isInsideNavScreen(target: EventTarget | null): boolean {
  return target instanceof Element && !!target.closest('.VPNavScreen, #VPNavScreen')
}

function onWheel(e: WheelEvent) {
  if (!isNavScreenOpen()) return
  if (!isInsideNavScreen(e.target)) {
    e.preventDefault()
    return
  }

  const screen = document.querySelector('.VPNavScreen') as HTMLElement | null
  if (!screen) return

  const { scrollTop, scrollHeight, clientHeight } = screen
  const atTop = scrollTop <= 0
  const atBottom = scrollTop + clientHeight >= scrollHeight - 1
  if ((e.deltaY < 0 && atTop) || (e.deltaY > 0 && atBottom)) {
    e.preventDefault()
  }
}

let touchStartY = 0

function onTouchStart(e: TouchEvent) {
  touchStartY = e.touches[0]?.clientY ?? 0
}

function onTouchMove(e: TouchEvent) {
  if (!isNavScreenOpen()) return
  if (!isInsideNavScreen(e.target)) {
    e.preventDefault()
    return
  }

  const screen = document.querySelector('.VPNavScreen') as HTMLElement | null
  if (!screen || e.touches.length === 0) return

  const currentY = e.touches[0].clientY
  const deltaY = touchStartY - currentY
  const { scrollTop, scrollHeight, clientHeight } = screen
  const atTop = scrollTop <= 0
  const atBottom = scrollTop + clientHeight >= scrollHeight - 1
  if ((deltaY < 0 && atTop) || (deltaY > 0 && atBottom)) {
    e.preventDefault()
  }
}

function syncLockClass() {
  document.documentElement.classList.toggle('vp-nav-screen-open', isNavScreenOpen())
}

export function initNavScreenScrollLock(): () => void {
  if (typeof document === 'undefined') return () => {}

  const opts: AddEventListenerOptions = { passive: false }
  window.addEventListener('wheel', onWheel, opts)
  window.addEventListener('touchstart', onTouchStart, { passive: true })
  window.addEventListener('touchmove', onTouchMove, opts)

  syncLockClass()
  const mo = new MutationObserver(syncLockClass)
  mo.observe(document.body, { childList: true, subtree: true })

  return () => {
    window.removeEventListener('wheel', onWheel, opts)
    window.removeEventListener('touchstart', onTouchStart)
    window.removeEventListener('touchmove', onTouchMove, opts)
    mo.disconnect()
    document.documentElement.classList.remove('vp-nav-screen-open')
  }
}
