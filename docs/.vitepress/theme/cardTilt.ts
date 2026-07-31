const MAX_RX = 2.8
const MAX_RY = 3.2

export function initCardTilt() {
  // 小屏 / 触屏设备没有鼠标悬浮导致的 3D 倾斜需求，直接跳过，减少布局压力
  if (typeof matchMedia !== 'undefined') {
    if (
      matchMedia('(hover: none)').matches ||
      matchMedia('(max-width: 959px)').matches
    ) {
      return
    }
  }

  const cards = document.querySelectorAll<HTMLElement>('.VPFeature')

  cards.forEach((card) => {
    card.style.transformStyle = 'preserve-3d'

    card.addEventListener('mousemove', (e: MouseEvent) => {
      const { width, height, left, top } = card.getBoundingClientRect()
      const x = e.clientX - left
      const y = e.clientY - top
      const nx = (x / width) * 2 - 1
      const ny = (y / height) * 2 - 1

      const rotateX = -ny * MAX_RX
      const rotateY = nx * MAX_RY

      card.style.transition = 'transform 0.08s ease-out'
      card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`
    })

    card.addEventListener('mouseleave', () => {
      card.style.transition = 'transform 0.45s cubic-bezier(0.25, 0.8, 0.25, 1)'
      card.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg)'
    })
  })
}
