<script setup lang="ts">
import type { GenBeat, Zone } from '../../guided'

defineOptions({ inheritAttrs: false })

defineProps<{ beat?: GenBeat }>()

const zoneLeft: Record<Zone, string> = { eden: '10%', s0: '40%', s1: '56%', old: '78%' }
</script>

<template>
  <div v-if="beat" class="g-board g-gen">
    <div v-for="zone in (['eden', 's0', 's1', 'old'] as const)" :key="zone" class="g-zone" :class="{ gc: beat.gc && zone === 'eden', hold: beat.a === zone }">
      <b>{{ zone === 'eden' ? 'EDEN' : zone === 'old' ? 'OLD' : zone.toUpperCase() }}</b>
    </div>
    <i class="g-obj" :class="beat.a" :style="{ left: zoneLeft[beat.a] }">A<em>{{ beat.age }}</em></i>
    <i v-if="beat.showB" class="g-obj ghost" :style="{ left: zoneLeft.eden, top: '108px' }">B</i>
  </div>
</template>
