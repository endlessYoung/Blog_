<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { compareScript, emptyStrat, stratCall, stratDrain, stratTick, type Strategy, type StratState } from './model'

const strategies: { id: Strategy; label: string }[] = [
  { id: 'none', label: '无控制' },
  { id: 'mutex', label: 'Mutex' },
  { id: 'single', label: 'SingleFlight' },
  { id: 'cache', label: '缓存' },
]

function labelOf(strategy: Strategy) {
  return strategies.find((item) => item.id === strategy)?.label || strategy
}

const state = ref<StratState>(emptyStrat('single'))
const report = compareScript()
let timer = 0

const running = computed(() => state.value.tasks.filter((task) => task.status === 'running').length)
const parallelKeys = computed(() => new Set(state.value.tasks.filter((task) => task.status === 'running').map((task) => task.key)).size)

function setStrategy(strategy: Strategy) {
  state.value = emptyStrat(strategy)
}

function call(key: string) {
  state.value = stratCall(state.value, key)
}

function replay() {
  let next = emptyStrat(state.value.strategy)
  next = stratCall(next, 'feed:home')
  next = stratCall(next, 'feed:home')
  next = stratCall(next, 'feed:suggest')
  state.value = next
}

function finish() {
  state.value = stratDrain(state.value)
}

function reset() {
  state.value = emptyStrat(state.value.strategy)
}

function waitText(wait: string) {
  if (wait === 'joined') return '等待同一个任务'
  if (wait === 'queued') return '排队，之后自己执行'
  if (wait === 'hit') return '命中缓存'
  return '立即执行'
}

onMounted(() => {
  timer = window.setInterval(() => {
    state.value = stratTick(state.value, 200)
  }, 200)
})

onUnmounted(() => window.clearInterval(timer))
</script>

<template>
  <section class="fd-lab" aria-label="四种并发策略">
    <div class="fd-bar">
      <div class="fd-modes" role="group" aria-label="并发策略">
        <button
          v-for="item in strategies"
          :key="item.id"
          type="button"
          :aria-pressed="state.strategy === item.id"
          @click="setStrategy(item.id)"
        >{{ item.label }}</button>
      </div>
      <button type="button" @click="reset">重置</button>
    </div>
    <div class="fd-actions">
      <button type="button" @click="call('feed:home')">调用 feed:home</button>
      <button type="button" @click="call('feed:suggest')">调用 feed:suggest</button>
      <button type="button" @click="replay">同一组输入</button>
      <button type="button" @click="finish">快进到空闲</button>
    </div>
    <p class="fd-stats" aria-live="polite">
      当前是{{ labelOf(state.strategy) }}。执行 {{ state.tasks.length }} 次，进行中 {{ running }} 个。
      <template v-if="parallelKeys > 1">不同 key 正在并行。</template>
      <template v-else-if="state.queue.length">有 {{ state.queue.length }} 个调用在排队，要等锁释放后自己执行。</template>
      <template v-else>这一刻没有两个 key 同时在执行。</template>
    </p>
    <div class="fd-split">
      <div>
        <p class="fd-label">调用</p>
        <p v-if="!state.calls.length" class="fd-empty">先点「同一组输入」：两次 feed:home，一次 feed:suggest。再用「快进到空闲」后再次调用 feed:home。</p>
        <ol v-else class="fd-log">
          <li v-for="item in state.calls" :key="item.id">
            <b>#{{ item.id }}</b>
            <span>{{ item.key }}</span>
            <span>{{ waitText(item.wait) }}</span>
            <span>{{ item.status === 'queued' ? '排队' : item.status === 'done' ? '完成' : '进行中' }}</span>
            <span>{{ item.resultFrom == null ? '尚无结果' : `结果来自 T${item.resultFrom}` }}</span>
          </li>
        </ol>
      </div>
      <div>
        <p class="fd-label">执行与缓存</p>
        <p v-if="!state.tasks.length && !Object.keys(state.cache).length" class="fd-empty">还没有执行。缓存命中不会产生新任务。</p>
        <ul v-else class="fd-map">
          <li v-for="task in state.tasks" :key="task.id">
            <b>T{{ task.id }}</b>
            <span>{{ task.key }}</span>
            <span>{{ task.callerIds.map((id) => '#' + id).join(' ') }}</span>
            <span>{{ task.status === 'done' ? '已完成' : '执行中' }}</span>
          </li>
          <li v-for="(taskId, key) in state.cache" :key="key">
            <b>缓存</b>
            <span>{{ key }}</span>
            <span>结果来自 T{{ taskId }}</span>
          </li>
        </ul>
      </div>
    </div>
    <div class="fd-table-wrap">
      <table class="fd-table">
        <caption>同一组输入在四种策略下的结果：两次并发的 feed:home，一次 feed:suggest，全部结束后再调用一次 feed:home。</caption>
        <thead>
          <tr>
            <th>策略</th>
            <th>执行次数</th>
            <th>并入同一次</th>
            <th>排队后自己执行</th>
            <th>缓存命中</th>
            <th>不同 key 可并行</th>
            <th>完成后再次调用</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in report" :key="row.strategy" :class="{ on: row.strategy === state.strategy }">
            <th>{{ labelOf(row.strategy) }}</th>
            <td>{{ row.runs }}</td>
            <td>{{ row.joined }}</td>
            <td>{{ row.queued }}</td>
            <td>{{ row.hits }}</td>
            <td>{{ row.parallel ? '可以' : '不可以' }}</td>
            <td>{{ row.after }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
