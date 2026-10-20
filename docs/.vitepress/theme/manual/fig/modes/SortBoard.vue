<script setup lang="ts">
import { computed } from 'vue'
import type { FigFrame } from '../fields'

defineOptions({ inheritAttrs: false })

const props = defineProps<{
  frames?: FigFrame[]
  index?: number
  name?: string
}>()

function nums(value?: string) {
  if (!value) return []
  return value.split(/[\s,]+/).filter(Boolean).map(Number).filter((n) => !Number.isNaN(n))
}

const frames = computed(() => props.frames ?? [])
const frame = computed(() => frames.value[props.index ?? 0])
const values = computed(() => nums(frame.value?.fields.values))
const hot = computed(() => new Set(nums(frame.value?.fields.hot)))
const done = computed(() => new Set(nums(frame.value?.fields.done)))
const scale = computed(() => Math.max(1, ...frames.value.flatMap((item) => nums(item.fields.values))))
const tag = computed(() => (props.name || '').toUpperCase())

function height(value: number) {
  return `${18 + (value / scale.value) * 82}%`
}
</script>

<template>
  <div v-if="values.length" class="g-board g-sort">
    <p class="g-target mono">{{ tag }}</p>
    <div class="g-bars">
      <i
        v-for="(value, index) in values"
        :key="index"
        :style="{ height: height(value) }"
        :class="{ hot: hot.has(index), done: done.has(index) }"
      ><em>{{ value }}</em></i>
    </div>
  </div>
</template>
