<script setup lang="ts">
import { computed } from 'vue'
import type { GcBeat } from '../../guided'

defineOptions({ inheritAttrs: false })

const props = defineProps<{ beat?: GcBeat }>()

const rows = computed(() => {
  const phase = props.beat?.phase
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
  const marked = mixed.map((cell) => ({ ...cell, state: cell.state === 'live' ? 'mark' : 'dead' }))
  const swept = mixed.map((cell) => ({ ...cell, state: cell.state === 'live' ? 'live' : 'hole' }))
  const blank = mixed.map(() => ({ name: '', state: 'hole' }))
  if (phase === 'sweep') return [{ name: 'MARK', cells: marked }, { name: 'HEAP', cells: swept }]
  if (phase === 'copy') return [{ name: 'FROM', cells: blank }, { name: 'TO', cells: packed }]
  if (phase === 'compact') return [{ name: 'MARK', cells: marked }, { name: 'HEAP', cells: packed }]
  return [{ name: 'HEAP', cells: mixed }]
})
</script>

<template>
  <div v-if="rows.length" class="g-board g-gc">
    <div v-for="row in rows" :key="row.name" class="g-mem">
      <b>{{ row.name }}</b>
      <span>
        <i v-for="(cell, index) in row.cells" :key="`${row.name}-${index}`" :class="cell.state">{{ cell.name }}</i>
      </span>
    </div>
  </div>
</template>
