<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { emptyRoom, ROOM_NOTES, roomAdvance, roomFail, roomRefresh, roomReset, type RoomState } from './model'

const state = ref<RoomState>(emptyRoom())
let timer = 0

const labels = ['空闲', 'UI 刷新', 'Repository', 'SingleFlight', 'API', 'DAO.upsert', 'Room Flow', 'UI 更新']

function refresh() {
  state.value = roomRefresh(state.value)
}

function setFail(event: Event) {
  const input = event.target as HTMLInputElement
  state.value = roomFail(state.value, input.checked)
}

function step() {
  state.value = roomAdvance(state.value)
}

function reset() {
  state.value = roomReset(state.value.fail)
}

function netText(net: RoomState['net']) {
  if (net === 'loading') return '请求中'
  if (net === 'ok') return '成功'
  if (net === 'error') return '失败'
  return '空闲'
}

onMounted(() => {
  timer = window.setInterval(() => {
    state.value = roomAdvance(state.value)
  }, 800)
})

onUnmounted(() => window.clearInterval(timer))
</script>

<template>
  <section class="fd-lab" aria-label="Room Flow 数据流">
    <div class="fd-bar">
      <div class="fd-actions">
        <button type="button" @click="refresh">刷新 Feed</button>
        <button type="button" @click="step">下一步</button>
        <button type="button" @click="reset">重置</button>
      </div>
      <label class="fd-check">
        <input type="checkbox" :checked="state.fail" @change="setFail">
        让这次网络失败
      </label>
    </div>
    <p class="fd-stats" aria-live="polite">
      网络{{ netText(state.net) }}。并入进行中的刷新 {{ state.merges }} 次。
      {{ state.note }}
    </p>
    <ol class="fd-steps">
      <li v-for="(label, step) in labels" :key="label" :class="{ on: state.step === step, done: state.step > step }">
        <b>{{ step }}</b>
        <span>{{ label }}</span>
        <em>{{ state.step === step ? '当前' : state.step > step ? '已过' : '未到' }}</em>
      </li>
    </ol>
    <div class="fd-split">
      <div>
        <p class="fd-label">网络</p>
        <p class="fd-net">{{ netText(state.net) }}</p>
        <p class="fd-note">{{ ROOM_NOTES[Math.min(state.step, ROOM_NOTES.length - 1)] }}</p>
      </div>
      <div>
        <p class="fd-label">UI 列表</p>
        <ul class="fd-feed">
          <li v-for="row in state.rows" :key="row.id" :class="{ fresh: row.fresh }">
            <b>{{ row.title }}</b>
            <span>{{ row.fresh ? '这次写入的新数据' : '数据库里的已有数据' }}</span>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>
