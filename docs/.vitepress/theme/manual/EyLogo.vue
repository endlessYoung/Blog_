<script setup lang="ts">
import { withBase } from 'vitepress'

const props = defineProps<{
  size?: number | string
}>()
</script>

<template>
  <span class="ey-logo-wrap" :style="{ width: (size || 26) + 'px', height: (size || 26) + 'px' }">
    <img
      class="ey-logo-img ey-logo-dark"
      :src="withBase('/logo-dark.png')"
      alt="EY Logo"
      :width="size || 26"
      :height="size || 26"
      loading="eager"
      decoding="async"
    />
    <img
      class="ey-logo-img ey-logo-light"
      :src="withBase('/logo-light.png')"
      alt="EY Logo"
      :width="size || 26"
      :height="size || 26"
      loading="eager"
      decoding="async"
    />
  </span>
</template>

<style scoped>
.ey-logo-wrap {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: visible;
  line-height: 1;
}

.ey-logo-img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.ey-logo-dark {
  display: none;
}

.ey-logo-light {
  display: block;
}

:root.dark .ey-logo-dark,
html.dark .ey-logo-dark {
  display: block;
}

:root.dark .ey-logo-light,
html.dark .ey-logo-light {
  display: none;
}

@media (prefers-reduced-motion: reduce) {
  .ey-logo-img {
    transition: none;
  }
}
</style>
