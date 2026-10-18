<script setup lang="ts">
import { onMounted, onUnmounted, ref, shallowRef, watch } from 'vue'
import type { FigKind } from './figures'

defineExpose({
  runTo(target: number) {
    control.value?.runTo(target)
  },
})

const props = defineProps<{
  kind: FigKind
  num: string
  caption: string
  step?: number
}>()

const root = ref<HTMLElement | null>(null)
const control = shallowRef<{ runTo: (target: number) => void } | null>(null)
let stop: (() => void) | undefined

watch(() => props.step, (value) => {
  if (value == null) return
  control.value?.runTo(value)
})

const CODE = [
  'public final int incrementAndGet() {',
  '    int expect, update;',
  '    do {',
  '        expect = value.get();',
  '        update = expect + 1;',
  '    } while (!value.compareAndSet(expect, update));',
  '    return update;',
  '}',
]

type ThreadState = {
  line: number
  expect: string | number
  update: string | number
  retry: number
  status: string
  cls: string
}

type Step = {
  v: number
  t1: ThreadState
  t2: ThreadState
  actor: 't1' | 't2' | null
  fx: 'read' | 'write' | 'fail' | null
  log: string
}

function buildSteps(): Step[] {
  const idle: ThreadState = { line: 0, expect: '—', update: '—', retry: 0, status: '就绪', cls: '' }
  const raw: Partial<Step> & { t1?: Partial<ThreadState>; t2?: Partial<ThreadState> }[] = [
    { v: 0, log: '两个线程准备对同一个 <b>AtomicInteger</b> 执行自增，value 初始为 <b>0</b>。' },
    { actor: 't1', t1: { line: 4, expect: 0, status: '读取' }, fx: 'read', log: '<b>T1</b> 读取 value，得到 expect = 0。' },
    { actor: 't2', t2: { line: 4, expect: 0, status: '读取' }, fx: 'read', log: '<b>T2</b> 也读取 value，同样得到 expect = 0。' },
    { actor: 't1', t1: { line: 5, update: 1, status: '计算' }, log: '<b>T1</b> 计算 update = expect + 1 = 1。' },
    { actor: 't2', t2: { line: 5, update: 1, status: '计算' }, log: '<b>T2</b> 计算 update = expect + 1 = 1。' },
    { actor: 't1', v: 1, t1: { line: 6, status: 'CAS ✓', cls: 'ok' }, fx: 'write', log: '<b>T1</b> 执行 compareAndSet(0, 1)：内存值 0 等于 expect，<b>写入成功</b>，value 变为 1。' },
    { actor: 't2', t2: { line: 6, status: 'CAS ✗', cls: 'fail', retry: 1 }, fx: 'fail', log: '<b>T2</b> 执行 compareAndSet(0, 1)：内存值已经是 1，不等于 expect 0，<b>写入被拒绝</b>，回到循环开头。' },
    { actor: 't2', t2: { line: 4, expect: 1, update: '—', status: '重试读取', cls: '' }, fx: 'read', log: '<b>T2</b> 重新读取，expect = 1。' },
    { actor: 't2', t2: { line: 5, update: 2, status: '计算' }, log: '<b>T2</b> 计算 update = 2。' },
    { actor: 't2', v: 2, t2: { line: 6, status: 'CAS ✓', cls: 'ok' }, fx: 'write', log: '<b>T2</b> 执行 compareAndSet(1, 2)，<b>写入成功</b>，value 变为 2。' },
    { t1: { line: 7, status: '返回 1', cls: '' }, t2: { line: 7, status: '返回 2', cls: '' }, log: '两个线程都已返回。value = <b>2</b>，两次自增都生效，没有加锁，也没有丢失更新。' },
  ]
  let prev: Step = { v: 0, t1: { ...idle }, t2: { ...idle }, actor: null, fx: null, log: '' }
  return raw.map((item) => {
    const step: Step = {
      v: item.v ?? prev.v,
      t1: { ...prev.t1, ...(item.t1 || {}) },
      t2: { ...prev.t2, ...(item.t2 || {}) },
      actor: item.actor || null,
      fx: item.fx || null,
      log: item.log || '',
    }
    if (!item.t1 && prev.t1.cls) step.t1.cls = prev.t1.cls
    prev = step
    return step
  })
}

onMounted(() => {
  const fig = root.value
  if (!fig || !fig.classList.contains('is-cas')) return
  const steps = buildSteps()
  const stage = fig.querySelector<HTMLElement>('.cas-stage')!
  const mem = fig.querySelector<HTMLElement>('.memory')!
  const memVal = fig.querySelector<HTMLElement>('.mem-val')!
  const lines = [...fig.querySelectorAll<HTMLElement>('.cl')]
  const curEl = fig.querySelector<HTMLElement>('.fig-cur')!
  const logEl = fig.querySelector<HTMLElement>('.fig-log')!
  const bar = fig.querySelector<HTMLElement>('.fig-progress i')!
  const playBtn = fig.querySelector<HTMLElement>('[data-c="play"]')!
  const speedBtn = fig.querySelector<HTMLElement>('[data-c="speed"]')!
  const threads = {
    t1: fig.querySelector<HTMLElement>('[data-t="t1"]')!,
    t2: fig.querySelector<HTMLElement>('[data-t="t2"]')!,
  }
  const last = steps.length - 1
  const speeds = [1, 2, 0.5]
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const ease = 'cubic-bezier(.16, 1, .3, 1)'
  let speedIdx = 0
  let cur = 0
  let pending: { anim: Animation; done: () => void } | null = null
  let timer = 0
  let playing = false
  const speed = () => speeds[speedIdx]
  const pad = (n: number) => String(n).padStart(2, '0')
  const q = <T extends Element>(sel: string, base: ParentNode = fig) => base.querySelector<T>(sel)!

  function renderCode(step: Step) {
    lines.forEach((line) => {
      const n = Number(line.dataset.line)
      const mark = q<HTMLElement>('.cl-mark', line)
      mark.innerHTML = `${step.t1.line === n ? '<i>T1</i>' : ''}${step.t2.line === n ? '<i class="t2">T2</i>' : ''}`
      line.classList.toggle('now', !!step.actor && step[step.actor].line === n)
    })
    curEl.textContent = pad(cur)
    logEl.innerHTML = step.log
    bar.style.transform = `scaleX(${cur / last})`
  }

  function renderStage(step: Step) {
    memVal.textContent = String(step.v)
    ;(['t1', 't2'] as const).forEach((name) => {
      const el = threads[name]
      const state = step[name]
      el.classList.toggle('active', step.actor === name)
      el.classList.toggle('ok', state.cls === 'ok')
      el.classList.toggle('fail', state.cls === 'fail')
      q('.thread-status', el).textContent = state.status
      q('[data-f="expect"]', el).textContent = String(state.expect)
      q('[data-f="update"]', el).textContent = String(state.update)
      q('[data-f="retry"]', el).textContent = String(state.retry)
    })
  }

  function centerOf(el: HTMLElement) {
    const rect = el.getBoundingClientRect()
    const stageRect = stage.getBoundingClientRect()
    return { x: rect.left - stageRect.left + rect.width / 2, y: rect.top - stageRect.top + rect.height / 2 }
  }

  function restartClass(el: HTMLElement, cls: string) {
    el.classList.remove(cls)
    void el.offsetWidth
    el.classList.add(cls)
  }

  function flyToken(step: Step, prev: Step) {
    if (!step.actor || !step.fx) return
    const thread = threads[step.actor]
    const memCenter = centerOf(memVal)
    const token = document.createElement('span')
    token.className = 'a-token'
    stage.append(token)
    const halfW = () => token.offsetWidth / 2
    const halfH = () => token.offsetHeight / 2
    const duration = 560 / speed()
    let anim: Animation
    if (step.fx === 'read') {
      token.textContent = String(step.v)
      const to = centerOf(q('[data-f="expect"]', thread))
      anim = token.animate([
        { transform: `translate(${memCenter.x - halfW()}px, ${memCenter.y - halfH()}px) scale(.6)`, opacity: 0 },
        { transform: `translate(${memCenter.x - halfW()}px, ${memCenter.y - halfH()}px) scale(1)`, opacity: 1, offset: 0.15 },
        { transform: `translate(${to.x - halfW()}px, ${to.y - halfH()}px)`, opacity: 1 },
      ], { duration, easing: ease })
    } else {
      const from = centerOf(q('[data-f="update"]', thread))
      token.textContent = String(step[step.actor].update)
      const frames: Keyframe[] = [
        { transform: `translate(${from.x - halfW()}px, ${from.y - halfH()}px) scale(.6)`, opacity: 0 },
        { transform: `translate(${from.x - halfW()}px, ${from.y - halfH()}px) scale(1)`, opacity: 1, offset: 0.12 },
        { transform: `translate(${memCenter.x - halfW()}px, ${memCenter.y - halfH()}px)`, opacity: 1, offset: step.fx === 'fail' ? 0.55 : 1 },
      ]
      if (step.fx === 'fail') frames.push({ transform: `translate(${from.x - halfW()}px, ${from.y - halfH()}px) scale(.8)`, opacity: 0 })
      anim = token.animate(frames, { duration: step.fx === 'fail' ? duration * 1.5 : duration, easing: ease })
      if (step.fx === 'fail') window.setTimeout(() => restartClass(mem, 'shake'), duration * 0.8)
    }
    const held = {
      ...step,
      v: prev.v,
      [step.actor]: {
        ...step[step.actor],
        expect: step.fx === 'read' ? prev[step.actor].expect : step[step.actor].expect,
      },
    } as Step
    renderStage(held)
    thread.classList.add('active')
    pending = {
      anim,
      done: () => {
        token.remove()
        renderStage(step)
        if (step.fx === 'write') restartClass(mem, 'flash')
        pending = null
      },
    }
    anim.onfinish = () => pending?.done()
  }

  function go(next: number, animate: boolean) {
    if (pending) {
      pending.anim.cancel()
      pending.done()
    }
    const prev = steps[cur]
    cur = Math.max(0, Math.min(last, next))
    const step = steps[cur]
    renderCode(step)
    if (animate && step.fx && !reduced) flyToken(step, prev)
    else renderStage(step)
  }

  function halt() {
    playing = false
    window.clearTimeout(timer)
    playBtn.textContent = '▶ 播放'
  }

  function runTo(target: number) {
    halt()
    if (target <= cur || target - cur > 5) {
      go(target, false)
      return
    }
    const tick = () => {
      if (cur >= target) return
      go(cur + 1, true)
      timer = window.setTimeout(tick, 480)
    }
    tick()
  }

  function play() {
    if (cur >= last) go(0, false)
    playing = true
    playBtn.textContent = '❚❚ 暂停'
    const tick = () => {
      if (!playing) return
      if (cur >= last) {
        halt()
        return
      }
      go(cur + 1, true)
      timer = window.setTimeout(tick, 1150 / speed())
    }
    timer = window.setTimeout(tick, 200)
  }

  const onClick = (event: Event) => {
    const button = (event.target as HTMLElement).closest<HTMLElement>('[data-c]')
    if (!button) return
    const command = button.dataset.c
    if (command === 'next') { halt(); go(cur + 1, true) }
    if (command === 'prev') { halt(); go(cur - 1, false) }
    if (command === 'reset') { halt(); go(0, false) }
    if (command === 'play') playing ? halt() : play()
    if (command === 'speed') {
      speedIdx = (speedIdx + 1) % speeds.length
      button.textContent = `${speed()}×`
    }
  }

  const clearRel = () => fig.querySelectorAll('.rel').forEach((el) => el.classList.remove('rel'))
  const onOver = (event: Event) => {
    const target = event.target as HTMLElement
    const line = target.closest<HTMLElement>('.cl')
    const part = target.closest<HTMLElement>('[data-lines]')
    clearRel()
    if (line) {
      const n = line.dataset.line
      fig.querySelectorAll<HTMLElement>('[data-lines]').forEach((el) => {
        if (el.dataset.lines?.split(',').includes(n || '')) el.classList.add('rel')
      })
      line.classList.add('rel')
    } else if (part?.dataset.lines) {
      part.classList.add('rel')
      part.dataset.lines.split(',').forEach((n) => fig.querySelector(`.cl[data-line="${n}"]`)?.classList.add('rel'))
    }
  }

  fig.addEventListener('click', onClick)
  fig.addEventListener('pointerover', onOver)
  fig.addEventListener('pointerleave', clearRel)
  speedBtn.textContent = '1×'
  go(0, false)
  control.value = { runTo }
  if (props.step) runTo(props.step)
  stop = () => {
    halt()
    pending?.anim.cancel()
    fig.removeEventListener('click', onClick)
    fig.removeEventListener('pointerover', onOver)
    fig.removeEventListener('pointerleave', clearRel)
  }
})

onUnmounted(() => stop?.())
</script>

<template>
  <div v-if="kind === 'cas'" ref="root" class="a-fig is-cas">
    <div class="a-fig-head">
      <span class="mono a-fig-id">图 · {{ num }}</span>
      <span class="mono a-fig-step">STEP <b class="fig-cur">00</b> / 10</span>
    </div>
    <div class="cas-stage">
      <div class="thread" data-t="t1">
        <div class="thread-name"><span>T1</span><span class="thread-status">就绪</span></div>
        <div class="reg" data-lines="4,6"><span>expect</span><b data-f="expect">—</b></div>
        <div class="reg" data-lines="5,6"><span>update</span><b data-f="update">—</b></div>
        <div class="reg" data-lines="6"><span>retry</span><b data-f="retry">0</b></div>
      </div>
      <div class="memory" data-lines="4,6">
        <span class="mono">value @0x7F3A</span>
        <span class="mem-val">0</span>
        <span class="mono">AtomicInteger</span>
      </div>
      <div class="thread" data-t="t2">
        <div class="thread-name"><span>T2</span><span class="thread-status">就绪</span></div>
        <div class="reg" data-lines="4,6"><span>expect</span><b data-f="expect">—</b></div>
        <div class="reg" data-lines="5,6"><span>update</span><b data-f="update">—</b></div>
        <div class="reg" data-lines="6"><span>retry</span><b data-f="retry">0</b></div>
      </div>
    </div>
    <div class="a-fig-code">
      <div v-for="(line, index) in CODE" :key="line" class="cl" :data-line="index + 1">
        <span class="cl-no">{{ index + 1 }}</span>
        <span class="cl-mark" />
        <span>{{ line }}</span>
      </div>
    </div>
    <div class="fig-log" />
    <div class="fig-progress"><i /></div>
    <div class="a-fig-ctrl">
      <button type="button" data-c="reset">⟲ 重置</button>
      <button type="button" data-c="prev">← 上一步</button>
      <button type="button" data-c="next" class="primary">单步 →</button>
      <button type="button" data-c="play">▶ 播放</button>
      <button type="button" data-c="speed" class="speed">1×</button>
    </div>
  </div>

  <div v-else class="a-fig a-fig-mini running">
    <div class="a-fig-head">
      <span class="mono a-fig-id">图 · {{ num }}</span>
    </div>
    <div v-if="kind === 'gen'" class="fig-stage m-gen">
      <div class="zone"><b>EDEN</b></div>
      <div class="zone"><b>S0</b></div>
      <div class="zone"><b>S1</b></div>
      <div class="zone"><b>OLD</b></div>
      <div class="objs"><i class="obj" /><i class="obj" /><i class="obj" /><i class="obj" /></div>
    </div>
    <div v-else-if="kind === 'bin'" class="fig-stage m-bin">
      <div class="bars">
        <i v-for="n in 12" :key="n" :class="{ hit: n === 8 }" :style="{ height: `${18 + (n - 1) * 7}%` }" />
      </div>
      <span class="ptr lo" /><span class="ptr mid" /><span class="ptr hi" />
    </div>
    <div v-else class="fig-stage m-loop">
      <div class="q"><i /><i /><i /></div>
      <div class="ring" />
      <span class="lab" style="left:22px;top:70px">MESSAGEQUEUE</span>
      <span class="lab" style="left:50%;top:26px;transform:translateX(-50%)">LOOPER</span>
    </div>
    <p class="a-fig-cap">{{ caption }}</p>
  </div>
</template>
