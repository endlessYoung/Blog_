<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, shallowRef, watch } from 'vue'
import type { FigKind } from './figures'
import type { FigFrame } from './fig/fields'
import { beatsFor, boardFor } from './fig/registry'
import './fig/register'

const props = defineProps<{
  kind: Exclude<FigKind, 'cas'>
  num: string
  step?: number
  phase?: string
  frames?: FigFrame[]
  code?: string[]
}>()

const beats = beatsFor(props.kind)
const cur = ref(0)
const playing = ref(false)
const speedLabel = ref('1×')
const speeds = [1, 2, 0.5]
let speedIdx = 0
let timer = 0
const control = shallowRef<{ runTo: (target: number) => void } | null>(null)
const codeEl = ref<HTMLElement | null>(null)

const frames = computed(() => props.frames ?? [])
const codeLines = computed(() => props.code ?? [])
const last = computed(() => Math.max((frames.value.length || beats.length) - 1, 0))
const beat = computed(() => beats[cur.value])
const board = computed(() => boardFor(props.kind))
const stepText = computed(() => String(cur.value).padStart(2, '0'))
const lastText = computed(() => String(last.value).padStart(2, '0'))
const progress = computed(() => (last.value === 0 ? 1 : cur.value / last.value))
const activeLines = computed(() => frames.value[cur.value]?.lines ?? [])
const log = computed(() => {
  const text = frames.value[cur.value]?.fields.log
  if (text) return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  return beat.value?.log ?? ''
})

function speed() {
  return speeds[speedIdx]
}

function go(next: number) {
  cur.value = Math.max(0, Math.min(last.value, next))
}

function halt() {
  playing.value = false
  window.clearTimeout(timer)
}

function runTo(target: number) {
  halt()
  if (target <= cur.value || target - cur.value > 5) {
    go(target)
    return
  }
  const tick = () => {
    if (cur.value >= target) return
    go(cur.value + 1)
    timer = window.setTimeout(tick, 480)
  }
  tick()
}

function play() {
  if (cur.value >= last.value) go(0)
  playing.value = true
  const tick = () => {
    if (!playing.value) return
    if (cur.value >= last.value) {
      halt()
      return
    }
    go(cur.value + 1)
    timer = window.setTimeout(tick, 1150 / speed())
  }
  timer = window.setTimeout(tick, 200)
}

function onControl(event: MouseEvent) {
  const button = (event.target as HTMLElement).closest<HTMLElement>('[data-c]')
  if (!button) return
  const command = button.dataset.c
  if (command === 'next') { halt(); go(cur.value + 1) }
  if (command === 'prev') { halt(); go(cur.value - 1) }
  if (command === 'reset') { halt(); go(0) }
  if (command === 'play') playing.value ? halt() : play()
  if (command === 'speed') {
    speedIdx = (speedIdx + 1) % speeds.length
    speedLabel.value = `${speed()}×`
  }
}

function pinCode() {
  const box = codeEl.value
  const line = box?.querySelector<HTMLElement>('.cl.now')
  if (!box || !line) return
  const lineTop = line.getBoundingClientRect().top - box.getBoundingClientRect().top + box.scrollTop
  box.scrollTop = Math.max(0, lineTop - 2)
}

watch(() => props.step, (value) => {
  if (value == null) return
  control.value?.runTo(value)
})

watch(cur, () => {
  if (!codeLines.value.length) return
  nextTick(pinCode)
})

onMounted(() => {
  control.value = { runTo }
  if (props.step) runTo(props.step)
  nextTick(pinCode)
})

onUnmounted(() => halt())
</script>

<template>
  <div class="a-fig" @click="onControl">
    <div class="a-fig-head">
      <span class="mono a-fig-id">图 · {{ num }}</span>
      <span class="mono a-fig-step">STEP <b>{{ stepText }}</b> / {{ lastText }}</span>
    </div>

    <component
      :is="board"
      v-if="board"
      :beat="beat"
      :frames="frames"
      :index="cur"
      :name="phase"
    />

    <div v-if="codeLines.length" ref="codeEl" class="a-fig-code is-scroll">
      <div
        v-for="(line, index) in codeLines"
        :key="index"
        class="cl"
        :class="{ now: activeLines.includes(index + 1) }"
      >
        <span class="cl-no">{{ index + 1 }}</span>
        <span class="cl-mark" />
        <span>{{ line }}</span>
      </div>
    </div>

    <div class="fig-log" v-html="log" />
    <div class="fig-progress"><i :style="{ transform: `scaleX(${progress})` }" /></div>
    <div class="a-fig-ctrl">
      <button type="button" data-c="reset">⟲ 重置</button>
      <button type="button" data-c="prev">← 上一步</button>
      <button type="button" data-c="next" class="primary">单步 →</button>
      <button type="button" data-c="play">{{ playing ? '❚❚ 暂停' : '▶ 播放' }}</button>
      <button type="button" data-c="speed" class="speed">{{ speedLabel }}</button>
    </div>
  </div>
</template>
