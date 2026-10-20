<script setup lang="ts">
import { computed } from 'vue'
import type { RvBeat } from '../../guided'

defineOptions({ inheritAttrs: false })

const props = defineProps<{ beat?: RvBeat }>()

const rows = computed(() => {
  const phase = props.beat?.phase
  const row = (name: string, count: string, slots: number, filled: number, on: boolean) => ({
    name,
    count,
    on,
    cells: Array.from({ length: slots }, (_, index) => (index < filled ? 'hold' : 'empty')),
  })
  return [
    row('SCRAP', '—', phase === 'scrap' ? 1 : 0, phase === 'scrap' ? 1 : 0, phase === 'scrap'),
    row('CACHE', '2', 2, phase === 'cache' || phase === 'ext' ? 1 : 0, phase === 'cache' || phase === 'ext'),
    row('EXT', '0', 0, 0, phase === 'ext'),
    row('POOL', '5', 5, phase === 'pool' ? 1 : 0, phase === 'pool'),
  ]
})
</script>

<template>
  <div v-if="beat" class="g-board g-rv">
    <div v-for="row in rows" :key="row.name" class="g-rv-row" :class="{ on: row.on }">
      <b>{{ row.name }}</b>
      <em>{{ row.count }}</em>
      <span>
        <i v-for="(cell, index) in row.cells" :key="`${row.name}-${index}`" :class="cell">{{ cell === 'hold' ? 'A' : '' }}</i>
      </span>
    </div>
  </div>
</template>
