<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, shallowRef, watch } from 'vue'
import { BIN_BEATS, BIN_TARGET, BIN_VALUES, GC_BEATS, GEN_BEATS, LOOP_BEATS, type Zone } from './guided'
import type { FigKind } from './figures'

const props = defineProps<{
  kind: Exclude<FigKind, 'cas'>
  num: string
  step?: number
}>()

const beats = props.kind === 'gen' ? GEN_BEATS : props.kind === 'bin' ? BIN_BEATS : props.kind === 'loop' ? LOOP_BEATS : GC_BEATS
const last = beats.length - 1
const cur = ref(0)
const playing = ref(false)
const speedLabel = ref('1×')
const speeds = [1, 2, 0.5]
let speedIdx = 0
let timer = 0
const control = shallowRef<{ runTo: (target: number) => void } | null>(null)

const beat = computed(() => beats[cur.value])
const stepText = computed(() => String(cur.value).padStart(2, '0'))
const lastText = computed(() => String(last).padStart(2, '0'))
const progress = computed(() => (last === 0 ? 1 : cur.value / last))

const zoneLeft: Record<Zone, string> = { eden: '10%', s0: '40%', s1: '56%', old: '78%' }
const queue = computed(() => {
  const phase = props.kind === 'loop' ? LOOP_BEATS[cur.value].phase : null
  if (!phase || phase === 'build') return []
  const pending = phase === 'queue' || phase === 'next'
  return [
    ...(pending ? [{ name: 'UI', head: phase === 'next' }] : []),
    { name: 'LOG', head: false },
    { name: 'SAVE', head: false },
  ]
})
const gen = computed(() => (props.kind === 'gen' ? GEN_BEATS[cur.value] : null))
const bin = computed(() => (props.kind === 'bin' ? BIN_BEATS[cur.value] : null))
const loop = computed(() => (props.kind === 'loop' ? LOOP_BEATS[cur.value] : null))
const gc = computed(() => (props.kind === 'gc' ? GC_BEATS[cur.value] : null))

const gcRows = computed(() => {
  const phase = gc.value?.phase
  if (!phase) return []
  const mixed = [
    { name: 'A', state: 'live' },
    { name: '', state: 'dead' },
    { name: 'B', state: 'live' },
    { name: '', state: 'dead' },
    { name: '', state: 'dead' },
    { name: 'C', state: 'live' },
  ]
  const packed = [
    { name: 'A', state: 'live' },
    { name: 'B', state: 'live' },
    { name: 'C', state: 'live' },
    { name: '', state: 'free' },
    { name: '', state: 'free' },
    { name: '', state: 'free' },
  ]
  const blank = mixed.map(() => ({ name: '', state: 'hole' }))
  if (phase === 'mark') {
    return [{ name: 'HEAP', cells: mixed.map((cell) => ({ ...cell, state: cell.state === 'live' ? 'mark' : 'dead' })) }]
  }
  if (phase === 'sweep') {
    return [{ name: 'HEAP', cells: mixed.map((cell) => ({ ...cell, state: cell.state === 'live' ? 'live' : 'hole' })) }]
  }
  if (phase === 'copy') return [{ name: 'FROM', cells: blank }, { name: 'TO', cells: packed }]
  if (phase === 'compact') return [{ name: 'HEAP', cells: packed }]
  return [{ name: 'HEAP', cells: mixed }]
})

function barHeight(value: number) {
  const min = BIN_VALUES[0]
  const max = BIN_VALUES[BIN_VALUES.length - 1]
  return `${18 + ((value - min) / (max - min)) * 78}%`
}

function ptr(index: number) {
  if (index < 0) return '50%'
  return `${((index + 0.5) / BIN_VALUES.length) * 100}%`
}

function speed() {
  return speeds[speedIdx]
}

function go(next: number) {
  cur.value = Math.max(0, Math.min(last, next))
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
  if (cur.value >= last) go(0)
  playing.value = true
  const tick = () => {
    if (!playing.value) return
    if (cur.value >= last) {
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

watch(() => props.step, (value) => {
  if (value == null) return
  control.value?.runTo(value)
})

onMounted(() => {
  control.value = { runTo }
  if (props.step) runTo(props.step)
})

onUnmounted(() => halt())
</script>

<template>
  <div class="a-fig" @click="onControl">
    <div class="a-fig-head">
      <span class="mono a-fig-id">图 · {{ num }}</span>
      <span class="mono a-fig-step">STEP <b>{{ stepText }}</b> / {{ lastText }}</span>
    </div>

    <div v-if="gen" class="g-board g-gen">
      <div v-for="zone in (['eden', 's0', 's1', 'old'] as const)" :key="zone" class="g-zone" :class="{ gc: gen.gc && zone === 'eden', hold: gen.a === zone }">
        <b>{{ zone === 'eden' ? 'EDEN' : zone === 'old' ? 'OLD' : zone.toUpperCase() }}</b>
      </div>
      <i class="g-obj" :style="{ left: zoneLeft[gen.a] }">A<em>{{ gen.age }}</em></i>
      <i v-if="gen.showB" class="g-obj ghost" :style="{ left: zoneLeft.eden, top: '108px' }">B</i>
    </div>

    <div v-else-if="bin" class="g-board g-bin">
      <p class="g-target mono">TARGET {{ BIN_TARGET }}</p>
      <div class="g-bars">
        <i
          v-for="(value, index) in BIN_VALUES"
          :key="value"
          :style="{ height: barHeight(value) }"
          :class="{ dim: index !== bin.mid && (index < bin.lo || index > bin.hi), mid: index === bin.mid && !bin.found, hit: bin.found && index === bin.mid }"
        ><em>{{ value }}</em></i>
      </div>
      <span class="g-ptr lo" :style="{ left: ptr(bin.lo) }">L</span>
      <span v-if="bin.mid >= 0" class="g-ptr mid" :style="{ left: ptr(bin.mid) }">M</span>
      <span class="g-ptr hi" :style="{ left: ptr(bin.hi) }">H</span>
    </div>

    <div v-else-if="loop" class="g-board g-loop">
      <div class="g-col">
        <b>WORKER</b>
        <i v-if="loop.phase === 'build'" class="g-msg">UI</i>
      </div>
      <div class="g-col queue">
        <b>QUEUE</b>
        <i v-for="item in queue" :key="item.name" class="g-msg" :class="{ head: item.head }">{{ item.name }}</i>
      </div>
      <div class="g-col ring" :class="{ on: loop.phase === 'take' }">
        <b>LOOPER</b>
        <i class="g-orbit" />
        <i v-if="loop.phase === 'take'" class="g-msg">UI</i>
      </div>
      <div class="g-col" :class="{ on: loop.phase === 'handle' }">
        <b>HANDLER</b>
        <i v-if="loop.phase === 'handle'" class="g-msg">UI</i>
      </div>
    </div>

    <div v-else-if="gc" class="g-board g-gc">
      <div v-for="row in gcRows" :key="row.name" class="g-mem">
        <b>{{ row.name }}</b>
        <span>
          <i v-for="(cell, index) in row.cells" :key="`${row.name}-${index}`" :class="cell.state">{{ cell.name }}</i>
        </span>
      </div>
    </div>

    <div class="fig-log" v-html="beat.log" />
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
