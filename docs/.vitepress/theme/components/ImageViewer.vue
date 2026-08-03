<template>
  <Teleport to="body">
    <Transition name="imgv">
      <div
        v-if="viewerActive"
        class="image-viewer"
        role="dialog"
        aria-modal="true"
        aria-label="图片预览"
        @click.self="close"
      >
        <button
          class="image-viewer__close"
          type="button"
          aria-label="关闭预览"
          @click="close"
        >✕</button>

        <button
          v-if="images.length > 1"
          class="image-viewer__arrow image-viewer__arrow--prev"
          type="button"
          aria-label="上一张"
          @click="step(-1)"
        >‹</button>

        <figure class="image-viewer__stage">
          <div
            ref="mediaRef"
            class="image-viewer__media"
            :class="{ 'is-zoomed': scale > 1, 'is-dragging': dragging }"
            :style="{
              transform: `translate(${panX}px, ${panY}px) scale(${scale})`,
              transition: dragging ? 'none' : undefined,
            }"
            @click="toggleZoom"
            @pointerdown="onPointerDown"
            @pointermove="onPointerMove"
            @pointerup="onPointerUp"
            @pointercancel="onPointerUp"
          >
            <img
              v-if="!current.svg"
              :src="current.src"
              :alt="current.alt"
              class="image-viewer__image"
              draggable="false"
            />
            <div
              v-else
              class="image-viewer__svg"
              aria-label="Mermaid 图表"
              v-html="current.svg"
            ></div>
          </div>
        </figure>

        <button
          v-if="images.length > 1"
          class="image-viewer__arrow image-viewer__arrow--next"
          type="button"
          aria-label="下一张"
          @click="step(1)"
        >›</button>

        <span v-if="images.length > 1" class="image-viewer__counter">
          {{ index + 1 }} / {{ images.length }}
        </span>
        <span class="image-viewer__zoom-hint">滚轮缩放 {{ Math.round(scale * 100) }}%</span>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import {
  closeViewer,
  stepViewer,
  viewerActive,
  viewerImages,
  viewerIndex,
  type ViewerImage,
} from '../imageViewer'

const MIN_SCALE = 1
const MAX_SCALE = 6
const scale = ref(1)
const panX = ref(0)
const panY = ref(0)
const dragging = ref(false)
const dragStart = ref({ x: 0, y: 0, px: 0, py: 0 })
const dragMoved = ref(false)
const mediaRef = ref<HTMLElement | null>(null)

const images = computed<ViewerImage[]>(() => viewerImages.value)
const index = computed(() => viewerIndex.value)
const current = computed(() => images.value[index.value] || { src: '', alt: '' })

function resetZoom(): void {
  scale.value = 1
  panX.value = 0
  panY.value = 0
}

function close(): void {
  resetZoom()
  closeViewer()
}

function step(delta: number): void {
  resetZoom()
  stepViewer(delta)
}

function clampPan(): void {
  const el = mediaRef.value
  if (!el) return
  const w = el.clientWidth
  const h = el.clientHeight
  const s = scale.value
  const maxX = Math.max(0, w * (s - 1))
  const maxY = Math.max(0, h * (s - 1))
  panX.value = Math.min(0, Math.max(-maxX, panX.value))
  panY.value = Math.min(0, Math.max(-maxY, panY.value))
}

function zoomAt(clientX: number, clientY: number, newScale: number): void {
  const el = mediaRef.value
  if (!el) return
  const s = Math.min(MAX_SCALE, Math.max(MIN_SCALE, newScale))
  const ox = el.offsetLeft
  const oy = el.offsetTop
  const cx = clientX - ox
  const cy = clientY - oy
  const localX = (cx - panX.value) / scale.value
  const localY = (cy - panY.value) / scale.value
  panX.value = cx - localX * s
  panY.value = cy - localY * s
  scale.value = s
  clampPan()
}

function toggleZoom(event: MouseEvent): void {
  if (dragMoved.value) {
    dragMoved.value = false
    return
  }
  zoomAt(event.clientX, event.clientY, scale.value > 1 ? 1 : 2)
}

function onWheel(event: WheelEvent): void {
  if (!viewerActive.value) return
  event.preventDefault()
  const factor = event.deltaY < 0 ? 1.12 : 1 / 1.12
  zoomAt(event.clientX, event.clientY, scale.value * factor)
}

function onPointerDown(event: PointerEvent): void {
  if (scale.value <= 1) return
  dragging.value = true
  dragMoved.value = false
  dragStart.value = { x: event.clientX, y: event.clientY, px: panX.value, py: panY.value }
  ;(event.currentTarget as HTMLElement).setPointerCapture?.(event.pointerId)
}

function onPointerMove(event: PointerEvent): void {
  if (!dragging.value) return
  const dx = event.clientX - dragStart.value.x
  const dy = event.clientY - dragStart.value.y
  if (Math.abs(dx) + Math.abs(dy) > 4) dragMoved.value = true
  panX.value = dragStart.value.px + dx
  panY.value = dragStart.value.py + dy
  clampPan()
}

function onPointerUp(): void {
  dragging.value = false
}

function onKeydown(event: KeyboardEvent): void {
  if (!viewerActive.value) return
  if (event.key === 'Escape') close()
  else if (event.key === 'ArrowLeft') step(-1)
  else if (event.key === 'ArrowRight') step(1)
}

watch(viewerActive, (active) => {
  if (!active) resetZoom()
})

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
  window.addEventListener('wheel', onWheel, { passive: false })
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  window.removeEventListener('wheel', onWheel)
})
</script>

<style scoped>
.image-viewer {
  position: fixed;
  inset: 0;
  z-index: 2147483000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(3, 6, 12, 0.9);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}
.image-viewer__stage {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0;
  max-width: 92vw;
  max-height: 92vh;
}
.image-viewer__media {
  display: flex;
  align-items: center;
  justify-content: center;
  max-width: 92vw;
  max-height: 84vh;
  cursor: zoom-in;
  transition: transform 0.12s ease-out;
  will-change: transform;
}

.image-viewer__media.is-zoomed {
  cursor: grab;
  touch-action: none;
}

.image-viewer__media.is-zoomed.is-dragging {
  cursor: grabbing;
}
.image-viewer__image {
  max-width: 92vw;
  max-height: 84vh;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.55);
  user-select: none;
  -webkit-user-drag: none;
}
.image-viewer__svg {
  display: flex;
  align-items: center;
  justify-content: center;
  width: fit-content;
  max-width: 92vw;
  max-height: 84vh;
  padding: 14px;
  border-radius: 12px;
  background: #ffffff;
  overflow: auto;
}

.dark .image-viewer__svg {
  background: #0d1117;
}

.image-viewer__svg :deep(svg) {
  display: block;
  flex: 0 0 auto;
  max-width: 100%;
  max-height: 84vh;
}
.image-viewer__close {
  position: fixed;
  top: 18px;
  right: 18px;
  width: 42px;
  height: 42px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
  font-size: 17px;
  cursor: pointer;
  transition: background-color 0.2s;
}
.image-viewer__close:hover {
  background: rgba(255, 255, 255, 0.24);
}
.image-viewer__arrow {
  position: fixed;
  top: 50%;
  transform: translateY(-50%);
  width: 46px;
  height: 46px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
  font-size: 30px;
  line-height: 1;
  cursor: pointer;
  transition: background-color 0.2s;
}
.image-viewer__arrow:hover {
  background: rgba(255, 255, 255, 0.24);
}
.image-viewer__arrow--prev {
  left: 18px;
}
.image-viewer__arrow--next {
  right: 18px;
}
.image-viewer__counter {
  position: fixed;
  bottom: 22px;
  left: 50%;
  transform: translateX(-50%);
  padding: 4px 14px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.14);
  color: #fff;
  font-size: 13px;
}
.image-viewer__zoom-hint {
  position: fixed;
  bottom: 58px;
  left: 50%;
  transform: translateX(-50%);
  padding: 4px 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.1);
  color: #aab4c8;
  font-size: 12px;
  pointer-events: none;
}
.imgv-enter-active,
.imgv-leave-active {
  transition: opacity 0.2s ease;
}
.imgv-enter-from,
.imgv-leave-to {
  opacity: 0;
}
@media (max-width: 640px) {
  .image-viewer__arrow {
    width: 38px;
    height: 38px;
    font-size: 24px;
  }
  .image-viewer__arrow--prev {
    left: 10px;
  }
  .image-viewer__arrow--next {
    right: 10px;
  }
}
</style>

