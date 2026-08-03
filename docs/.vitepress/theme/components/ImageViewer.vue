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
                <div class="image-viewer__zoomctl">
          <button class="image-viewer__zoombtn" type="button" aria-label="缩小" @click="zoomStep(-0.1)">−</button>
          <input
            class="image-viewer__zoomval"
            type="number"
            min="100"
            max="600"
            step="10"
            :value="Math.round(scale * 100)"
            @change="onZoomInput"
            @keydown.enter="onZoomInput"
            aria-label="缩放比例"
          />
          <span class="image-viewer__zoomunit">%</span>
          <button class="image-viewer__zoombtn" type="button" aria-label="放大" @click="zoomStep(0.1)">+</button>
        </div>
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
  const vw = window.innerWidth
  const vh = window.innerHeight
  const w = el.clientWidth
  const h = el.clientHeight
  const ox = el.offsetLeft
  const oy = el.offsetTop
  const s = scale.value
  // 图片始终与视口相交：边缘可到达视口任意一侧（保证最上/最左内容可见）
  panX.value = Math.min(vw - ox, Math.max(-ox - w * s, panX.value))
  panY.value = Math.min(vh - oy, Math.max(-oy - h * s, panY.value))
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
  if (s <= 1) {
    panX.value = 0
    panY.value = 0
  }
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
  const el = mediaRef.value
  if (!el) return
  event.preventDefault()
  const r = el.getBoundingClientRect()
  const margin = 40
  const overMedia =
    event.clientX >= r.left - margin &&
    event.clientX <= r.right + margin &&
    event.clientY >= r.top - margin &&
    event.clientY <= r.bottom + margin
  const factor = event.deltaY < 0 ? 1.12 : 1 / 1.12
  if (overMedia) {
    zoomAt(event.clientX, event.clientY, scale.value * factor)
  }
}

function zoomStep(delta: number): void {
  const el = mediaRef.value
  if (!el) return
  const cx = el.offsetLeft + el.clientWidth / 2
  const cy = el.offsetTop + el.clientHeight / 2
  zoomAt(cx, cy, scale.value + delta)
}

function onZoomInput(event: Event): void {
  const input = event.target as HTMLInputElement
  const percent = Number(input.value)
  if (!Number.isFinite(percent)) return
  const el = mediaRef.value
  if (!el) return
  const cx = el.offsetLeft + el.clientWidth / 2
  const cy = el.offsetTop + el.clientHeight / 2
  zoomAt(cx, cy, percent / 100)
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
  else if (event.key === '+' || event.key === '=') zoomStep(0.1)
  else if (event.key === '-' || event.key === '_') zoomStep(-0.1)
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
  transform-origin: 0 0;
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
.image-viewer__zoomctl {
  position: fixed;
  top: 18px;
  right: 76px;
  z-index: 8;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}
.image-viewer__zoombtn {
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.14);
  color: #fff;
  font-size: 16px;
  line-height: 1;
  cursor: pointer;
  transition: background-color 0.2s;
}
.image-viewer__zoombtn:hover {
  background: rgba(255, 255, 255, 0.28);
}
.image-viewer__zoomval {
  width: 48px;
  height: 28px;
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.25);
  color: #fff;
  font-size: 13px;
  text-align: center;
  -moz-appearance: textfield;
  appearance: textfield;
}
.image-viewer__zoomval::-webkit-outer-spin-button,
.image-viewer__zoomval::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.image-viewer__zoomunit {
  color: #aab4c8;
  font-size: 12px;
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

