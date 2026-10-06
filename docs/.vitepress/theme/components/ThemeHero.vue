<template>
  <div class="theme-hero-slot">
    <component
      :is="activeHero"
      :article-count="metrics.totalArticles"
      :section-count="metrics.totalSections"
      :diagram-count="metrics.totalDiagrams"
      :last-update="metrics.lastUpdated"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTheme } from '../composables/useTheme'
import { data as articlesData } from '../data/articles.data'
import EngineeringHero from '../themes/engineering/Hero.vue'
import SpatialHero from '../themes/spatial/Hero.vue'

const { currentTheme } = useTheme()

const metrics = computed(() => articlesData?.metrics || {
  totalArticles: 312,
  totalSections: 5,
  totalDiagrams: 4,
  lastUpdated: '',
})

const activeHero = computed(() => {
  if (currentTheme.value === 'spatial') return SpatialHero
  return EngineeringHero
})
</script>

<style scoped>
.theme-hero-slot {
  min-height: var(--ey-hero-min-h, 520px);
  width: 100%;
}
</style>
