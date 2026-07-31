import Theme from 'vitepress/theme'
import './style/var.css'
import './style/tech.css'
import './style/vp-code-group.css'
import './custom.css'
import './style/mobile.css'

import { h, onMounted, onUnmounted, nextTick, watch } from 'vue'
import DocumateLazy from './components/DocumateLazy.vue'
import { initCardTilt } from './cardTilt'
import { initHomeScrollImmersion } from './homeScrollImmersion'
import { initNavScreenScrollLock } from './navScreenScrollLock'
import { useData, useRoute } from 'vitepress'
import Comments from './components/Comments.vue'
import SeriesNav from './components/SeriesNav.vue'
import RelatedArticles from './components/RelatedArticles.vue'
import ImageViewer from './components/ImageViewer.vue'
import ReadingProgress from './components/ReadingProgress.vue'
import { initImageViewer } from './imageViewer'
import ArticleMetadata from './components/ArticleMetadata.vue'
import TechBackground from './components/TechBackground.vue'
import HomeHeroEyebrow from './components/home/HomeHeroEyebrow.vue'
import HomeHeroCopySwitch from './components/home/HomeHeroCopySwitch.vue'
import HomeHeroOrb from './components/home/HomeHeroOrb.vue'
import HomeMetricsStrip from './components/home/HomeMetricsStrip.vue'
import HomeSectionHeader from './components/home/HomeSectionHeader.vue'
import HomeBottomCta from './components/home/HomeBottomCta.vue'

// 存储滚动位置
const scrollPositions: Record<string, number> = {}

export default {
  ...Theme,
  Layout: {
    setup() {
      const route = useRoute()
      const { frontmatter } = useData()

      // 保存滚动位置
      onMounted(() => {
        const handleScroll = () => {
          scrollPositions[route.path] = window.scrollY
        }

        window.addEventListener('scroll', handleScroll)

        return () => {
          window.removeEventListener('scroll', handleScroll)
        }
      })

      // 恢复滚动位置
      onMounted(() => {
        nextTick(() => {
          const savedPosition = scrollPositions[route.path]
          if (savedPosition !== undefined) {
            window.scrollTo(0, savedPosition)
          }
        })
      })

      try {
        onMounted(() => {
          initCardTilt();
        });
      } catch (error) {
        console.error('Error during setup:', error);
      }

      let stopNavScrollLock: (() => void) | undefined
      onMounted(() => {
        stopNavScrollLock = initNavScreenScrollLock()
      })
      onUnmounted(() => {
        stopNavScrollLock?.()
      })

      onMounted(() => {
        initImageViewer()
      })

      let stopHomeImmersion: (() => void) | undefined
      const syncHomeImmersion = () => {
        stopHomeImmersion?.()
        stopHomeImmersion = undefined
        if (typeof document === 'undefined') return
        if (frontmatter.value.layout !== 'home') {
          const root = document.documentElement
          root.style.removeProperty('--home-immersion')
          root.style.removeProperty('--home-below')
          root.style.removeProperty('--home-cta')
          return
        }
        const boot = () => {
          stopHomeImmersion = initHomeScrollImmersion()
        }
        // 等 Theme.Layout 把 VPContent / is-home 挂到 DOM 后再挂滚动（单 nextTick 有时偏早）
        nextTick(() => {
          requestAnimationFrame(() => {
            requestAnimationFrame(boot)
          })
        })
      }
      watch(
        () => [route.path, frontmatter.value.layout] as const,
        syncHomeImmersion,
        { immediate: true, flush: 'post' },
      )
      onMounted(() => {
        if (frontmatter.value.layout === 'home') syncHomeImmersion()
      })
      onUnmounted(() => {
        stopHomeImmersion?.()
      })
    },
    render() {
      return [
        h(Theme.Layout, null, {
        'layout-top': () => h(TechBackground),
        'home-hero-before': () => [h(HomeHeroEyebrow), h(HomeHeroCopySwitch)],
        'home-hero-image': () => h(HomeHeroOrb),
        /* 主题大卡外独立区块：RECENT / 最新文章 */
        'home-hero-after': () => h(HomeMetricsStrip),
        'home-features-before': () => h(HomeSectionHeader),
        'home-features-after': () => h(HomeBottomCta),
        'nav-bar-content-before': () =>
          h(DocumateLazy, { endpoint: 'https://izbdbdndfp.us.aircode.run/ask' }),
        'doc-before': () => h(ArticleMetadata),
        'doc-after': () => [h(SeriesNav), h(RelatedArticles), h(Comments)],
        }),
        h(ReadingProgress),
        h(ImageViewer),
      ]
    },
  },
}
