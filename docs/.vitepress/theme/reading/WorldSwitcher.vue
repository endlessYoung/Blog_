<script setup lang="ts">
import { applyWorld, world, type World } from '../reading/world'

function choose(next: World) {
  if (world.value === next) return
  applyWorld(next)
}
</script>

<template>
  <div class="ey-switch" role="radiogroup" aria-label="风格">
    <button type="button" role="radio" :aria-checked="world === 'manual'" :class="{ on: world === 'manual' }" @click="choose('manual')">Manual</button>
    <button type="button" role="radio" :aria-checked="world === 'spatial'" :class="{ on: world === 'spatial' }" @click="choose('spatial')">Spatial</button>
    <button type="button" role="radio" :aria-checked="world === 'fluid'" :class="{ on: world === 'fluid' }" @click="choose('fluid')">Fluid</button>
  </div>
</template>

<style scoped>
.ey-switch {
  display: flex;
  margin-right: 8px;
  border-radius: 999px;
  box-shadow: inset 0 0 0 1px color-mix(in srgb, currentColor 22%, transparent);
}
button {
  height: 28px;
  padding: 0 10px;
  border: 0;
  background: transparent;
  color: inherit;
  font: 500 11px/1 ui-monospace, monospace;
  letter-spacing: .06em;
  text-transform: uppercase;
  cursor: pointer;
}
button.on {
  background: color-mix(in srgb, currentColor 12%, transparent);
}
</style>
