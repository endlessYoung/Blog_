<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { readAccent, writeAccent } from './motion'

const accent = ref<'orange' | 'blue'>('orange')

onMounted(() => {
  accent.value = readAccent()
  document.documentElement.dataset.accent = accent.value
})

function toggle() {
  accent.value = accent.value === 'orange' ? 'blue' : 'orange'
  writeAccent(accent.value)
}
</script>

<template>
  <button
    class="manual-accent"
    type="button"
    title="切换强调色（橙 / 蓝）"
    aria-label="切换强调色"
    @click="toggle"
  >
    <span class="manual-accent-dot" />
  </button>
</template>
