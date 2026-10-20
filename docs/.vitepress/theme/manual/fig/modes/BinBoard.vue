<script setup lang="ts">
import type { BinBeat } from '../../guided'
import { BIN_TARGET, BIN_VALUES } from '../../guided'

defineOptions({ inheritAttrs: false })

defineProps<{ beat?: BinBeat }>()

function barHeight(value: number) {
  const min = BIN_VALUES[0]
  const max = BIN_VALUES[BIN_VALUES.length - 1]
  return `${18 + ((value - min) / (max - min)) * 78}%`
}

function ptr(index: number) {
  if (index < 0) return '50%'
  return `${((index + 0.5) / BIN_VALUES.length) * 100}%`
}
</script>

<template>
  <div v-if="beat" class="g-board g-bin">
    <p class="g-target mono">TARGET {{ BIN_TARGET }}</p>
    <div class="g-bars">
      <i
        v-for="(value, index) in BIN_VALUES"
        :key="value"
        :style="{ height: barHeight(value) }"
        :class="{ dim: index !== beat.mid && (index < beat.lo || index > beat.hi), mid: index === beat.mid && !beat.found, hit: beat.found && index === beat.mid }"
      ><em>{{ value }}</em></i>
    </div>
    <span class="g-ptr lo" :style="{ left: ptr(beat.lo) }">L</span>
    <span v-if="beat.mid >= 0" class="g-ptr mid" :style="{ left: ptr(beat.mid) }">M</span>
    <span class="g-ptr hi" :style="{ left: ptr(beat.hi) }">H</span>
  </div>
</template>
