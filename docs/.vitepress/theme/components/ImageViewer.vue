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

        <figure class="image-viewer__stage" :class="{ 'is-zoomed': zoomed }">
          <img
            :src="current.src"
            :alt="current.alt"
            class="image-viewer__image"
            @click="toggleZoom"
          />
          <figcaption v-if="current.alt" class="image-viewer__caption">
            {{ current.alt }}
          </figcaption>
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

const zoomed = ref(false)

const images = computed<ViewerImage[]>(() => viewerImages.value)
const index = computed(() => viewerIndex.value)
const current = computed(() => images.value[index.value] || { src: '', alt: '' })

function close(): void {
  zoomed.value = false
  closeViewer()
}

function step(delta: number): void {
  zoomed.value = false
  stepViewer(delta)
}

function toggleZoom(): void {
  zoomed.value = !zoomed.value
}

function onKeydown(event: KeyboardEvent): void {
  if (!viewerActive.value) return
  if (event.key === 'Escape') close()
  else if (event.key === 'ArrowLeft') step(-1)
  else if (event.key === 'ArrowRight') step(1)
}

watch(viewerActive, (active) => {
  if (!active) zoomed.value = false
})

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
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
.image-viewer__image {
  max-width: 92vw;
  max-height: 84vh;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.55);
  cursor: zoom-in;
  user-select: none;
  -webkit-user-drag: none;
  transition: transform 0.22s ease;
}
.image-viewer__stage.is-zoomed .image-viewer__image {
  transform: scale(2);
  cursor: zoom-out;
}
.image-viewer__caption {
  margin-top: 12px;
  max-width: 80vw;
  font-size: 13px;
  line-height: 1.6;
  text-align: center;
  color: #dbe4ff;
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
