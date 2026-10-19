<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { burstCall, burstProgress, burstStats, burstTick, emptyBurst, type BurstMode, type BurstState } from './model'

const state = ref<BurstState>(emptyBurst('single'))
let timer = 0

const stats = computed(() => burstStats(state.value))

function setMode(mode: BurstMode) {
  state.value = emptyBurst(mode)
}

function call(key: string) {
  state.value = burstCall(state.value, key)
}

function reset() {
  state.value = emptyBurst(state.value.mode)
}

function caller(id: number) {
  return state.value.callers.find((item) => item.id === id)
}

onMounted(() => {
  timer = window.setInterval(() => {
    state.value = burstTick(state.value, 200)
  }, 200)
})

onUnmounted(() => window.clearInterval(timer))
</script>

<template>
  <section class="fd-lab" aria-label="同一批 Feed 请求">
    <div class="fd-bar">
      <div class="fd-modes" role="group" aria-label="请求模式">
        <button type="button" :aria-pressed="state.mode === 'plain'" @click="setMode('plain')">普通请求</button>
        <button type="button" :aria-pressed="state.mode === 'single'" @click="setMode('single')">SingleFlight</button>
      </div>
      <button type="button" @click="reset">重置</button>
    </div>
    <div class="fd-actions">
      <button type="button" @click="call('feed:home')">进入首页</button>
      <button type="button" @click="call('feed:home')">下拉刷新</button>
      <button type="button" @click="call('feed:home')">组件请求 Feed</button>
      <button type="button" @click="call('feed:suggest')">请求推荐</button>
    </div>
    <p class="fd-stats" aria-live="polite">
      调用 {{ stats.calls }} 次，实际请求 {{ stats.runs }} 次，合并 {{ stats.merges }} 次。
      模拟时钟 {{ state.now }} ms，每次请求 1200 ms。
      前三个按钮的 key 都是 feed:home，推荐是 feed:suggest。
    </p>
    <div class="fd-split">
      <div>
        <p class="fd-label">调用</p>
        <p v-if="!state.callers.length" class="fd-empty">还没有调用。连续点前三个按钮，看同一个 key 会不会各发一次网络。</p>
        <ol v-else class="fd-log">
          <li v-for="item in state.callers" :key="item.id">
            <b>#{{ item.id }}</b>
            <span>{{ item.key }}</span>
            <span>{{ item.joined ? '并入' : '发起' }} T{{ item.taskId }}</span>
            <span>{{ item.status === 'done' ? '完成' : '进行中' }}</span>
            <span>{{ item.at }} ms</span>
          </li>
        </ol>
      </div>
      <div>
        <p class="fd-label">任务</p>
        <p v-if="!state.tasks.length" class="fd-empty">任务会出现在这里。同一个任务里的调用方共享这一次执行。</p>
        <div v-else class="fd-tasks">
          <article v-for="task in state.tasks" :key="task.id" class="fd-task">
            <header>
              <b>T{{ task.id }}</b>
              <span>{{ task.key }}</span>
              <span>{{ task.status === 'done' ? '已完成' : '执行中' }}</span>
            </header>
            <div class="fd-meter" aria-hidden="true">
              <i :style="{ transform: `scaleX(${burstProgress(task, state.now)})` }" />
            </div>
            <ul>
              <li v-for="id in task.callerIds" :key="id" :class="{ join: caller(id)?.joined }">
                #{{ id }} {{ caller(id)?.joined ? '并入此任务' : '发起此任务' }}
              </li>
            </ul>
          </article>
        </div>
      </div>
    </div>
  </section>
</template>
