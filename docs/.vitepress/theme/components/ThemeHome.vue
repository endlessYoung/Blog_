<template>
  <div class="theme-home-root">
    <component :is="activeHome" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTheme } from '../composables/useTheme'
import EngineeringHome from '../themes/engineering/Home.vue'
import SpatialHome from '../themes/spatial/Home.vue'

const { currentTheme } = useTheme()

const activeHome = computed(() => {
  if (currentTheme.value === 'spatial') return SpatialHome
  // 默认使用工程版 (engineering)
  return EngineeringHome
})
</script>

<style scoped>
.theme-home-root {
  width: 100%;
  min-height: 100vh;
}
</style>
