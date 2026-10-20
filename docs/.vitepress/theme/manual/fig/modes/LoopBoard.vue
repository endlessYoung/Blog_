<script setup lang="ts">
import { computed } from 'vue'
import type { LoopBeat } from '../../guided'

defineOptions({ inheritAttrs: false })

const props = defineProps<{ beat?: LoopBeat }>()

const queue = computed(() => {
  const phase = props.beat?.phase
  if (!phase || phase === 'build') return []
  const pending = phase === 'queue' || phase === 'next'
  return [
    ...(pending ? [{ name: 'UI', head: phase === 'next' }] : []),
    { name: 'LOG', head: false },
    { name: 'SAVE', head: false },
  ]
})
</script>

<template>
  <div v-if="beat" class="g-board g-loop">
    <div class="g-col">
      <b>WORKER</b>
      <i v-if="beat.phase === 'build'" class="g-msg">UI</i>
    </div>
    <div class="g-col queue">
      <b>QUEUE</b>
      <i v-for="item in queue" :key="item.name" class="g-msg" :class="{ head: item.head }">{{ item.name }}</i>
    </div>
    <div class="g-col ring" :class="{ on: beat.phase === 'take' }">
      <b>LOOPER</b>
      <i class="g-orbit" />
      <i v-if="beat.phase === 'take'" class="g-msg">UI</i>
    </div>
    <div class="g-col" :class="{ on: beat.phase === 'handle' }">
      <b>HANDLER</b>
      <i v-if="beat.phase === 'handle'" class="g-msg">UI</i>
    </div>
  </div>
</template>
