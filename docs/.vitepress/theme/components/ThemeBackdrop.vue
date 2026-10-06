<template>
  <component :is="activeBackdrop" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTheme } from '../composables/useTheme'
import EngineeringBackdrop from '../themes/engineering/Backdrop.vue'
import SpatialBackdrop from '../themes/spatial/Backdrop.vue'

const { currentTheme } = useTheme()

const activeBackdrop = computed(() => {
  if (currentTheme.value === 'spatial') return SpatialBackdrop
  return EngineeringBackdrop
})
</script>
