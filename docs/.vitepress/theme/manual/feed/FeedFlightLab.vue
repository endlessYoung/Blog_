<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue'
import { FLIGHT_CODE, FLIGHT_FRAMES } from './flight'

const index = ref(0)
const playing = ref(false)
const dropped = ref<string[]>([])
let timer = 0

const frame = computed(() => FLIGHT_FRAMES[index.value])
const waiters = computed(() => frame.value.waiters.filter((name) => !dropped.value.includes(name)))
const last = FLIGHT_FRAMES.length - 1

function stop() {
  playing.value = false
  window.clearInterval(timer)
}

function go(next: number) {
  index.value = Math.max(0, Math.min(last, next))
  if (index.value === last) stop()
}

function play() {
  if (playing.value) {
    stop()
    return
  }
  if (index.value === last) index.value = 0
  playing.value = true
  timer = window.setInterval(() => go(index.value + 1), 1400)
}

function reset() {
  stop()
  index.value = 0
  dropped.value = []
}

function cancelWaiter(name: string) {
  if (!frame.value.waiters.includes(name) || dropped.value.includes(name)) return
  dropped.value = [...dropped.value, name]
}

onUnmounted(stop)
</script>

<template>
  <section class="fd-lab" aria-label="SingleFlight 逐步执行">
    <div class="fd-bar">
      <div class="fd-actions">
        <button type="button" :disabled="index === 0" @click="go(index - 1)">上一步</button>
        <button type="button" :disabled="index === last" @click="go(index + 1)">下一步</button>
        <button type="button" :aria-pressed="playing" @click="play">{{ playing ? '暂停' : '自动播放' }}</button>
        <button type="button" @click="reset">重置</button>
      </div>
      <span class="fd-count">{{ index + 1 }} / {{ FLIGHT_FRAMES.length }} {{ frame.title }}</span>
    </div>
    <div class="fd-split">
      <div>
        <p class="fd-label">这一步</p>
        <p class="fd-note">{{ frame.action }}</p>
        <p class="fd-note">{{ frame.why }}</p>
        <dl class="fd-facts">
          <div>
            <dt>Deferred</dt>
            <dd>{{ frame.deferred }}</dd>
          </div>
          <div>
            <dt>网络</dt>
            <dd>{{ frame.network }}</dd>
          </div>
          <div>
            <dt>正在等待</dt>
            <dd>{{ waiters.length ? waiters.join('、') : '没有' }}</dd>
          </div>
        </dl>
        <div class="fd-actions">
          <button
            type="button"
            :disabled="!frame.waiters.includes('B') || dropped.includes('B')"
            @click="cancelWaiter('B')"
          >取消等待者 B</button>
        </div>
        <p v-if="dropped.includes('B')" class="fd-note">B 的 await 已取消。D1 继续执行，其余等待者仍会拿到同一次结果。没有单独属于 B 的那一次网络请求。</p>
      </div>
      <div>
        <p class="fd-label">inflight</p>
        <p v-if="!frame.map.length" class="fd-empty">Map 是空的。</p>
        <ul v-else class="fd-map">
          <li v-for="entry in frame.map" :key="entry.id">
            <b>{{ entry.key }}</b>
            <span>{{ entry.id }}</span>
            <span>{{ entry.state }}</span>
          </li>
        </ul>
        <pre class="fd-code"><code><span
          v-for="(line, lineNo) in FLIGHT_CODE"
          :key="lineNo"
          class="fd-line"
          :class="{ on: frame.lines.includes(lineNo + 1) }"
        ><i>{{ lineNo + 1 }}</i>{{ line || ' ' }}</span></code></pre>
      </div>
    </div>
  </section>
</template>
