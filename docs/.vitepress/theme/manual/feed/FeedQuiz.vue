<script setup lang="ts">
import { reactive } from 'vue'
import { QUIZ } from './quiz'

const picked = reactive<Record<string, number | null>>({})
for (const item of QUIZ) picked[item.id] = null

function choose(id: string, index: number) {
  picked[id] = index
}

function reset() {
  for (const item of QUIZ) picked[item.id] = null
}
</script>

<template>
  <section class="fd-lab" aria-label="理解检查">
    <div class="fd-bar">
      <span class="fd-count">先选，再看解释</span>
      <button type="button" @click="reset">重答</button>
    </div>
    <article v-for="(item, order) in QUIZ" :key="item.id" class="fd-q">
      <p class="fd-prompt">{{ order + 1 }}. {{ item.prompt }}</p>
      <div class="fd-options">
        <button
          v-for="(option, index) in item.options"
          :key="option"
          type="button"
          :aria-pressed="picked[item.id] === index"
          :class="{
            good: picked[item.id] != null && index === item.answer,
            bad: picked[item.id] === index && index !== item.answer,
          }"
          @click="choose(item.id, index)"
        >{{ option }}</button>
      </div>
      <p v-if="picked[item.id] != null" class="fd-note">
        {{ picked[item.id] === item.answer ? '对。' : '还不是。' }}
        {{ item.why }}
      </p>
    </article>
  </section>
</template>
