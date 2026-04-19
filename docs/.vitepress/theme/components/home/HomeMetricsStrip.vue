<template>
  <section class="home-metrics" aria-label="站点特点">
    <div class="home-metrics__inner">
      <div v-for="item in items" :key="item.label" class="home-metrics__cell">
        <span class="home-metrics__k">{{ item.label }}</span>
        <span class="home-metrics__v">{{ item.value }}</span>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const items = [
  { label: '覆盖面', value: '移动端 · 前后端 · 数据与工具' },
  { label: '形式', value: '笔记与系统化梳理皆可' },
  { label: '节奏', value: '业余更新，长期维护' },
]
</script>

<style scoped>
.home-metrics {
  width: 100%;
  max-width: 1152px;
  margin: 0 auto;
  /* 与 Hero 主卡留出呼吸感，避免贴底「挤」在视口里 */
  margin-top: 10px;
  padding: 20px 24px 32px;
}

@media (min-width: 640px) {
  .home-metrics {
    margin-top: 14px;
    padding: 22px 48px 36px;
  }
}

@media (min-width: 960px) {
  .home-metrics {
    margin-top: 18px;
    padding: 24px 64px 40px;
  }
}

.home-metrics__inner {
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: 22px 20px;
  border-radius: 22px;
  border: 1px solid rgba(255, 255, 255, 0.09);
  background:
    linear-gradient(165deg, rgba(12, 12, 18, 0.72) 0%, rgba(8, 9, 14, 0.78) 100%);
  box-shadow:
    0 20px 56px rgba(0, 0, 0, 0.42),
    inset 0 1px 0 rgba(255, 255, 255, 0.05),
    0 0 0 1px rgba(34, 211, 238, 0.06);
  backdrop-filter: blur(18px) saturate(140%);
}

@media (min-width: 768px) {
  .home-metrics__inner {
    flex-direction: row;
    align-items: stretch;
    padding: 26px 12px;
    border-radius: 24px;
  }
}

.home-metrics__cell {
  position: relative;
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 16px 18px;
}

@media (min-width: 768px) {
  .home-metrics__cell {
    padding: 10px 28px;
  }

  .home-metrics__cell:not(:last-child)::after {
    content: '';
    position: absolute;
    right: 0;
    top: 50%;
    width: 1px;
    height: 52px;
    margin-top: -26px;
    background: linear-gradient(
      180deg,
      transparent,
      rgba(34, 211, 238, 0.28),
      rgba(167, 139, 250, 0.22),
      transparent
    );
  }
}

@media (max-width: 767px) {
  .home-metrics__cell:not(:last-child) {
    border-bottom: 1px solid rgba(255, 255, 255, 0.07);
    padding-bottom: 20px;
    margin-bottom: 18px;
  }
}

/* 与 Hero 主文案一致：高对比锌色 + 青点缀，不用低饱和紫小字 */
.home-metrics__k {
  font-family: var(--tech-font-ui, ui-sans-serif, system-ui, sans-serif);
  font-size: 12px;
  font-weight: 650;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(226, 232, 240, 0.88);
}

.home-metrics__k::before {
  content: '';
  display: inline-block;
  width: 6px;
  height: 6px;
  margin-right: 10px;
  border-radius: 2px;
  vertical-align: 0.05em;
  background: linear-gradient(135deg, rgba(34, 211, 238, 0.95), rgba(167, 139, 250, 0.75));
  box-shadow: 0 0 12px rgba(34, 211, 238, 0.35);
}

.home-metrics__v {
  font-family: var(--tech-font-ui, ui-sans-serif, system-ui, sans-serif);
  font-size: clamp(14px, 1.65vw, 16px);
  line-height: 1.65;
  font-weight: 550;
  color: #f4f4f5;
  letter-spacing: 0.01em;
}

:global(html:not(.dark)) .home-metrics__inner {
  border: 1px solid rgba(0, 0, 0, 0.06);
  background: linear-gradient(165deg, rgba(255, 255, 255, 0.95) 0%, rgba(244, 244, 245, 0.92) 100%);
  box-shadow:
    0 20px 56px rgba(15, 23, 42, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.9),
    0 0 0 1px rgba(6, 182, 212, 0.06);
}

:global(html:not(.dark)) .home-metrics__k {
  color: #27272a;
}

:global(html:not(.dark)) .home-metrics__v {
  color: #18181b;
}

@media (max-width: 767px) {
  :global(html:not(.dark)) .home-metrics__cell:not(:last-child) {
    border-bottom-color: rgba(0, 0, 0, 0.06);
  }
}
</style>
