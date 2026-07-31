import { ref, shallowRef } from 'vue'

export interface ViewerImage {
  src: string
  alt: string
}

export const viewerActive = ref(false)
export const viewerImages = shallowRef<ViewerImage[]>([])
export const viewerIndex = ref(0)

export function openViewer(images: ViewerImage[], index: number): void {
  viewerImages.value = images
  viewerIndex.value = index
  viewerActive.value = true
}

export function closeViewer(): void {
  viewerActive.value = false
}

export function stepViewer(delta: number): void {
  const len = viewerImages.value.length
  if (len < 2) return
  viewerIndex.value = (viewerIndex.value + delta + len) % len
}

const IMAGE_EXT_RE = /\.(png|jpe?g|gif|webp|avif|svg|bmp|ico)([?#].*)?$/i

function resolveSrc(img: HTMLImageElement): string {
  const anchor = img.closest('a[href]') as HTMLAnchorElement | null
  const href = anchor?.getAttribute('href') || ''
  return IMAGE_EXT_RE.test(href) ? href : img.currentSrc || img.src
}

/** 全局点击监听：正文图片点击时打开查看器（客户端专用） */
export function initImageViewer(): void {
  document.addEventListener('click', (event) => {
    const target = event.target as HTMLElement | null
    const img =
      target instanceof HTMLImageElement ? target : target?.closest?.('img')
    if (!img) return
    if (!img.closest('.vp-doc')) return
    if (img.closest('pre, code')) return

    const nodes = Array.from(document.querySelectorAll<HTMLImageElement>('.vp-doc img')).filter(
      (node) => !node.closest('pre, code'),
    )
    const list: ViewerImage[] = nodes.map((node) => ({
      src: resolveSrc(node),
      alt: node.alt || '',
    }))
    const index = list.findIndex((item) => item.src === resolveSrc(img))
    event.preventDefault()
    openViewer(list, index >= 0 ? index : 0)
  })
}
