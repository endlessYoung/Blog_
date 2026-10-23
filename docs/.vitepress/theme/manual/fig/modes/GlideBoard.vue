<script setup lang="ts">
import { computed } from 'vue'
import type { GlideBeat } from '../../guided'

defineOptions({ inheritAttrs: false })

const props = defineProps<{ beat?: GlideBeat }>()

const tiers = computed(() => {
  const p = props.beat?.phase
  return [
    {
      id: 'active',
      name: 'ACTIVE',
      kind: 'WEAK',
      desc: 'ActiveResources (弱引用)',
      status: p === 'active' ? 'HIT' : (p ? 'MISS' : '—'),
      on: p === 'active',
      passed: p && p !== 'active',
    },
    {
      id: 'memory',
      name: 'MEMORY',
      kind: 'LRU',
      desc: 'LruResourceCache (内存LRU)',
      status: p === 'memory' ? 'HIT' : (['resource', 'data', 'source'].includes(p ?? '') ? 'MISS' : '—'),
      on: p === 'memory',
      passed: ['resource', 'data', 'source'].includes(p ?? ''),
    },
    {
      id: 'resource',
      name: 'RESOURCE',
      kind: 'DISK',
      desc: 'ResourceCacheGenerator (裁剪图)',
      status: p === 'resource' ? 'HIT' : (['data', 'source'].includes(p ?? '') ? 'MISS' : '—'),
      on: p === 'resource',
      passed: ['data', 'source'].includes(p ?? ''),
    },
    {
      id: 'data',
      name: 'DATA',
      kind: 'DISK',
      desc: 'DataCacheGenerator (原图流)',
      status: p === 'data' ? 'HIT' : (p === 'source' ? 'MISS' : '—'),
      on: p === 'data',
      passed: p === 'source',
    },
    {
      id: 'source',
      name: 'SOURCE',
      kind: 'NET',
      desc: 'SourceGenerator (网络/外部数据源)',
      status: p === 'source' ? 'FETCH' : '—',
      on: p === 'source',
      passed: false,
    },
  ]
})
</script>

<template>
  <div v-if="beat" class="g-board g-glide">
    <div
      v-for="tier in tiers"
      :key="tier.id"
      class="g-glide-row"
      :class="{ on: tier.on, passed: tier.passed }"
    >
      <div class="g-glide-tag">
        <b>{{ tier.name }}</b>
        <em>{{ tier.kind }}</em>
      </div>
      <div class="g-glide-desc mono">{{ tier.desc }}</div>
      <div class="g-glide-state">
        <i :class="[tier.status.toLowerCase(), { active: tier.on }]">
          {{ tier.status }}
        </i>
      </div>
    </div>
  </div>
</template>

<style scoped>
.g-glide {
  height: auto;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
  padding: 16px;
}

.g-glide-row {
  display: grid;
  grid-template-columns: 88px minmax(0, 1fr) 56px;
  gap: 10px;
  align-items: center;
  padding: 6px 10px;
  border: 1px solid transparent;
  transition: border-color var(--man-snap, 0.2s), background var(--man-snap, 0.2s);
}

.g-glide-row.on {
  border-color: var(--man-line-2, #333);
  background: color-mix(in srgb, var(--man-fg, #fff) 5%, transparent);
}

.g-glide-tag {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.g-glide-tag b {
  color: var(--man-fg-3, #888);
  font: 600 11px/1 var(--man-mono, monospace);
  letter-spacing: 0.06em;
  transition: color var(--man-snap, 0.2s);
}

.g-glide-tag em {
  color: var(--accent, #3b82f6);
  font: 500 9px/1 var(--man-mono, monospace);
  font-style: normal;
}

.g-glide-row.on .g-glide-tag b {
  color: var(--accent, #3b82f6);
}

.g-glide-desc {
  font-size: 11px;
  color: var(--man-fg-2, #aaa);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.g-glide-row.on .g-glide-desc {
  color: var(--man-fg, #fff);
}

.g-glide-state {
  display: flex;
  justify-content: flex-end;
}

.g-glide-state i {
  display: inline-grid;
  place-items: center;
  padding: 3px 6px;
  min-width: 44px;
  border: 1px solid var(--man-line-2, #444);
  color: var(--man-fg-3, #777);
  font: 600 10px/1 var(--man-mono, monospace);
  font-style: normal;
  transition: all var(--man-snap, 0.2s);
}

.g-glide-state i.hit {
  background: var(--man-fg, #fff);
  border-color: var(--man-fg, #fff);
  color: var(--man-bg, #000);
}

.g-glide-state i.miss {
  color: var(--man-fg-3, #666);
  border-color: var(--man-line-2, #333);
  opacity: 0.4;
}

.g-glide-state i.fetch {
  background: var(--accent, #3b82f6);
  border-color: var(--accent, #3b82f6);
  color: #fff;
}

@media (prefers-reduced-motion: reduce) {
  .g-glide-row,
  .g-glide-state i {
    transition: none;
  }
}
</style>
