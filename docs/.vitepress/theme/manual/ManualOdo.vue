<script setup lang="ts">
defineProps<{ value: string }>()
</script>

<template>
  <span class="odo" :aria-label="value">
    <template v-for="(ch, i) in value" :key="`${ch}-${i}`">
      <span v-if="/\d/.test(ch)" class="odo-d" :data-d="ch" aria-hidden="true">
        <span class="odo-s" :style="{ transform: `translateY(${-Number(ch)}em)` }">
          <span v-for="k in 20" :key="k">{{ (k - 1) % 10 }}</span>
        </span>
      </span>
      <template v-else>{{ ch }}</template>
    </template>
  </span>
</template>
