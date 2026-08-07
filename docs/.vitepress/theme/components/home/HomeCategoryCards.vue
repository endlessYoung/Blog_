<template>
  <section ref="rootEl" class="home-cat-cards">
    <div class="home-cat-cards__grid">
      <article
        v-for="(cat, i) in categories"
        :key="cat.title"
        class="home-cat-card"
        :class="`home-cat-card--${i + 1}`"
      >
        <div class="home-cat-card__head">
          <span class="home-cat-card__num">{{ String(i + 1).padStart(2, '0') }}</span>
          <h3 class="home-cat-card__title">{{ cat.title }}</h3>
          <span class="home-cat-card__count"><span class="home-cat-card__count-num">{{ cat.count }}</span><span class="home-cat-card__count-unit">篇</span></span>
        </div>
        <ul v-if="cat.articles.length" class="home-cat-card__list">
          <li v-for="(a, ai) in cat.articles" :key="a.link">
            <a class="home-cat-card__link" :href="a.link">
              <span class="home-cat-card__idx">{{ ai + 1 }}</span>
              <span class="home-cat-card__link-text">{{ a.title }}</span>
            </a>
          </li>
        </ul>
        <p v-else class="home-cat-card__empty">内容整理中，敬请期待…</p>
        <a class="home-cat-card__more" :href="cat.link">查看全部</a>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useData } from 'vitepress'

const { theme } = useData()
interface HomeArticle {
  title: string
  link: string
}
interface HomeCategory {
  title: string
  count: number
  link: string
  articles: HomeArticle[]
}
const categories = computed<HomeCategory[]>(() => (theme.value.homeCategories as HomeCategory[]) || [])

const rootEl = ref<HTMLElement | null>(null)
let countObserver: IntersectionObserver | null = null

onMounted(() => {
  const cards = rootEl.value ? Array.from(rootEl.value.querySelectorAll('.home-cat-card')) : []
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!('IntersectionObserver' in window) || reduced || !cards.length) {
    cards.forEach((c) => c.classList.add('is-count-in'))
    return
  }
  countObserver = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        e.target.classList.add('is-count-in')
        countObserver?.unobserve(e.target)
      }
    }
  }, { threshold: 0.3 })
  cards.forEach((c) => countObserver?.observe(c))
})
onBeforeUnmount(() => countObserver?.disconnect())
</script>

<style scoped>
.home-cat-cards {
  margin: 0 auto;
  max-width: 1152px;
  padding: 0 24px 32px;
}
.home-cat-cards__grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 20px;
}
.home-cat-card {
  position: relative;
  display: flex;
  flex-direction: column;
  min-width: 0;
  padding: 24px 24px 20px;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.09);
  background: rgba(16, 20, 30, 0.4);
  box-shadow:
    0 14px 36px rgba(0, 0, 0, 0.24),
    inset 0 1px 0 rgba(255, 255, 255, 0.04);
  transition:
    transform 0.25s ease,
    border-color 0.25s ease,
    box-shadow 0.25s ease;
}
html:not(.dark) .home-cat-card {
  border-color: rgba(8, 145, 178, 0.13);
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  box-shadow:
    0 14px 36px rgba(15, 23, 42, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
}
.home-cat-card:hover {
  transform: translateY(-3px);
  border-color: rgba(34, 211, 238, 0.4);
}
html:not(.dark) .home-cat-card:hover {
  border-color: rgba(8, 145, 178, 0.35);
}

/* 不对称网格：1 大卡(2行高) + 2 叠卡 + 2 半宽 + 1 全宽 */
.home-cat-card--1 {
  grid-column: 1 / 5;
  grid-row: 1 / 3;
}
.home-cat-card--2 {
  grid-column: 5 / 7;
  grid-row: 1;
}
.home-cat-card--3 {
  grid-column: 5 / 7;
  grid-row: 2;
}
.home-cat-card--4 {
  grid-column: 1 / 4;
  grid-row: 3;
}
.home-cat-card--5 {
  grid-column: 4 / 7;
  grid-row: 3;
}
.home-cat-card--6 {
  grid-column: 1 / 7;
  grid-row: 4;
}

/* 头部：编号 + 标题 + 计数 */
.home-cat-card__head {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 18px;
}
.home-cat-card__num {
  font-family: var(--cyber-font-display, ui-sans-serif, sans-serif);
  font-size: 2rem;
  font-weight: 700;
  line-height: 1;
  letter-spacing: -0.02em;
  color: var(--vp-c-brand-1, #22d3ee);
  opacity: 0.92;
}
html:not(.dark) .home-cat-card__num {
  color: #0e7490;
}
.home-cat-card__title {
  margin: 0;
  font-family: var(--cyber-font-display, ui-sans-serif, sans-serif);
  font-size: 1.15rem;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: #e6e8ee;
}
html:not(.dark) .home-cat-card__title {
  color: #0f172a;
}
.home-cat-card__count {
  margin-left: auto;
  display: inline-flex;
  align-items: baseline;
  gap: 4px;
  white-space: nowrap;
  opacity: 0;
  transform: translateY(6px);
  transition:
    opacity 0.6s ease,
    transform 0.6s ease;
}
.home-cat-card.is-count-in .home-cat-card__count {
  opacity: 1;
  transform: none;
}
.home-cat-card__count::before {
  content: '';
  align-self: center;
  width: 14px;
  height: 2px;
  margin-right: 8px;
  border-radius: 1px;
  background: #22d3ee;
  opacity: 0.5;
}
html:not(.dark) .home-cat-card__count::before {
  background: #0e7490;
}
.home-cat-card__count-num {
  font-family: var(--cyber-font-display, ui-sans-serif, sans-serif);
  font-size: 1.15rem;
  font-weight: 700;
  line-height: 1;
  color: #22d3ee;
  font-variant-numeric: tabular-nums;
}
html:not(.dark) .home-cat-card__count-num {
  color: #0e7490;
}
.home-cat-card__count-unit {
  font-size: 0.72rem;
  color: #8b93a3;
}
html:not(.dark) .home-cat-card__count-unit {
  color: #64748b;
}

/* 链接列表 */
.home-cat-card__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1 1 auto;
}
.home-cat-card__link {
  display: flex;
  align-items: baseline;
  gap: 10px;
  padding: 4px 4px;
  font-size: 0.88rem;
  line-height: 1.55;
  color: #a3a8b5;
  text-decoration: none;
  transition: color 0.25s ease;
}
html:not(.dark) .home-cat-card__link {
  color: #475569;
}
.home-cat-card__idx {
  flex: 0 0 auto;
  width: 1.4em;
  text-align: right;
  font-family: var(--cyber-font-mono, ui-monospace, monospace);
  font-variant-numeric: tabular-nums;
  font-size: 0.78rem;
  color: #22d3ee;
  opacity: 0.9;
}
html:not(.dark) .home-cat-card__idx {
  color: #0e7490;
}
.home-cat-card__link-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  background-image: linear-gradient(#22d3ee, #22d3ee);
  background-repeat: no-repeat;
  background-position: 0 100%;
  background-size: 0% 2px;
  transition:
    color 0.25s ease,
    background-size 0.35s ease;
}
.home-cat-card__link:hover {
  color: #22d3ee;
}
html:not(.dark) .home-cat-card__link:hover {
  color: #0e7490;
}
.home-cat-card__link:hover .home-cat-card__link-text {
  background-size: 100% 2px;
}
/* 去掉全局 a::after 深色/重复下划线，只留上面青色装饰线 */
.home-cat-cards .home-cat-card__link::after,
.home-cat-cards .home-cat-card__more::after {
  content: none !important;
  display: none !important;
  width: 0 !important;
}

/* 空卡占位 */
.home-cat-card__empty {
  flex: 1 1 auto;
  margin: 0;
  padding: 10px 8px;
  font-size: 0.85rem;
  color: #8b93a3;
}
html:not(.dark) .home-cat-card__empty {
  color: #64748b;
}

/* 查看全部 */
.home-cat-card__more {
  margin-top: 16px;
  align-self: flex-start;
  font-size: 0.8rem;
  font-weight: 500;
  color: #8b93a3;
  text-decoration: none;
  transition: color 0.2s ease;
}
html:not(.dark) .home-cat-card__more {
  color: #64748b;
}
.home-cat-card__more:hover {
  color: #22d3ee;
}
html:not(.dark) .home-cat-card__more:hover {
  color: #0e7490;
}

/* 大卡 / 全宽卡：编号与标题更舒展 */
.home-cat-card--1 .home-cat-card__num,
.home-cat-card--6 .home-cat-card__num {
  font-size: 2.6rem;
}
.home-cat-card--1 .home-cat-card__title,
.home-cat-card--6 .home-cat-card__title {
  font-size: 1.5rem;
}
.home-cat-card--1 .home-cat-card__list,
.home-cat-card--6 .home-cat-card__list {
  gap: 8px;
}
.home-cat-card--1 .home-cat-card__link,
.home-cat-card--6 .home-cat-card__link {
  font-size: 0.95rem;
  padding: 5px 4px;
}

@media (max-width: 959px) {
  .home-cat-cards {
    padding: 0 16px 24px;
  }
  .home-cat-cards__grid {
    grid-template-columns: 1fr;
    gap: 14px;
  }
  .home-cat-card--1,
  .home-cat-card--2,
  .home-cat-card--3,
  .home-cat-card--4,
  .home-cat-card--5,
  .home-cat-card--6 {
    grid-column: 1 / -1;
    grid-row: auto;
  }
}

/* 覆盖全局 a 链接色：深色白系、浅色深灰，hover 统一青 */
.home-cat-cards .home-cat-card__link,
.home-cat-cards .home-cat-card__more {
  color: #e6e8ee !important;
}
html:not(.dark) .home-cat-cards .home-cat-card__link,
html:not(.dark) .home-cat-cards .home-cat-card__more {
  color: #334155 !important;
}
.home-cat-cards .home-cat-card__link:hover,
.home-cat-cards .home-cat-card__more:hover {
  color: #22d3ee !important;
}
html:not(.dark) .home-cat-cards .home-cat-card__link:hover,
html:not(.dark) .home-cat-cards .home-cat-card__more:hover {
  color: #0e7490 !important;
}

</style>
