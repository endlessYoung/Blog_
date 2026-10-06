<template>
  <component :is="activeToc" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTheme } from '../composables/useTheme'
import EngineeringToc from '../themes/engineering/Toc.vue'
import SpatialToc from '../themes/spatial/Toc.vue'

const { currentTheme } = useTheme()

const activeToc = computed(() => {
  if (currentTheme.value === 'spatial') return SpatialToc
  return EngineeringToc
})
</script>
