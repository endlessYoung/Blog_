import '@fontsource-variable/space-grotesk'
import Theme from 'vitepress/theme'
import './style/var.css'
import './style/tech.css'
import './style/vp-code-group.css'
import './custom.css'
import './style/mobile.css'

import { h, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { initCardTilt } from './cardTilt'
import { initHomeScrollImmersion } from './homeScrollImmersion'
import { initNavScreenScrollLock } from './navScreenScrollLock'
import { initMermaid } from './mermaid'
import { useData, useRoute } from 'vitepress'
import Comments from './components/Comments.vue'
import SeriesNav from './components/SeriesNav.vue'
import RelatedArticles from './components/RelatedArticles.vue'
import ImageViewer from './components/ImageViewer.vue'
import ReadingProgress from './components/ReadingProgress.vue'
import { initImageViewer } from './imageViewer'
import { initOutlineAutoScroll } from './outlineAutoScroll'
import { initHeroUnderline } from './heroUnderline'
import { initHeroZoneFX } from './heroZoneFX'
import { initHeroJourneyPanel } from './heroJourneyPanel'
import { playHeroCinematicEnter } from './heroCinematicEnter'
import ArticleMetadata from './components/ArticleMetadata.vue'
import TechBackground from './components/TechBackground.vue'
import HomeHeroEyebrow from './components/home/HomeHeroEyebrow.vue'
import HomeHeroCopySwitch from './components/home/HomeHeroCopySwitch.vue'
import HomeParticleField from './components/home/HomeParticleField.vue'
import SidebarToggle from './components/SidebarToggle.vue'
import NavBrandTitle from './components/NavBrandTitle.vue'
import TocToggle from './components/TocToggle.vue'
import HomeCategoryCards from './components/home/HomeCategoryCards.vue'
import HomeMetricsStrip from './components/home/HomeMetricsStrip.vue'
import HomeSectionHeader from './components/home/HomeSectionHeader.vue'
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
          if (window.innerWidth > 960) initCardTilt();
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

      // 文章右侧目录：激活项自动滚入可视区（路由切换后重建监听）
      let stopOutlineScroll: (() => void) | undefined
      const syncOutlineScroll = () => {
        stopOutlineScroll?.()
        stopOutlineScroll = undefined
        if (typeof document === 'undefined') return
        nextTick(() => {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              stopOutlineScroll = initOutlineAutoScroll()
            })
          })
        })
      }
      watch(() => route.path, syncOutlineScroll, { immediate: true })
      onUnmounted(() => {
        stopOutlineScroll?.()
      })

      let stopHomeImmersion: (() => void) | undefined
      const syncHomeImmersion = () => {
        stopHomeImmersion?.()
        stopHomeImmersion = undefined
        if (typeof document === 'undefined') return
        if (typeof window !== 'undefined' && window.innerWidth <= 960) {
          // 小屏不启用滚动沉浸动效（mobile.css 已强制静态），避免移动端闪烁
          const root = document.documentElement
          root.style.removeProperty('--home-immersion')
          root.style.removeProperty('--home-below')
          return
        }
        if (frontmatter.value.layout !== 'home') {
          const root = document.documentElement
          root.style.removeProperty('--home-immersion')
          root.style.removeProperty('--home-below')
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

      // Hero 开场运镜 + 分区 hover + journey 背板：仅首页，路由切换时重建/清理
      let stopHeroZoneFX: (() => void) | undefined
      let stopHeroJourneyPanel: (() => void) | undefined
      let stopHeroCine: (() => void) | undefined
      const syncHeroJourneyBg = () => {
        if (typeof document === 'undefined') return
        const root = document.documentElement
        if (frontmatter.value.layout !== 'home') {
          root.style.removeProperty('--hero-journey')
          return
        }
        const base = import.meta.env.BASE_URL || '/'
        root.style.setProperty('--hero-journey', `url("${base}journey.jpg")`)
      }
      const syncHeroZoneFX = () => {
        stopHeroZoneFX?.()
        stopHeroZoneFX = undefined
        stopHeroJourneyPanel?.()
        stopHeroJourneyPanel = undefined
        stopHeroCine?.()
        stopHeroCine = undefined
        if (typeof document === 'undefined') return
        syncHeroJourneyBg()
        if (frontmatter.value.layout !== 'home') return
        nextTick(() => {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              stopHeroCine = playHeroCinematicEnter()
              stopHeroJourneyPanel = initHeroJourneyPanel()
              stopHeroZoneFX = initHeroZoneFX()
            })
          })
        })
      }
      watch(
        () => [route.path, frontmatter.value.layout] as const,
        syncHeroZoneFX,
        { immediate: true, flush: 'post' },
      )
      onUnmounted(() => {
        stopHeroZoneFX?.()
        stopHeroJourneyPanel?.()
        stopHeroCine?.()
      })

      // Mermaid 图表渲染：首次加载 + SPA 路由切换后重新扫描
      onMounted(() => {
        nextTick(() => { initMermaid() })
      })

      // 标语手写动画：首页 + 路由切换后（每次进入首页重新书写）
      onMounted(() => {
        nextTick(() => { initHeroUnderline() })
      })
      watch(
        () => route.path,
        () => {
          nextTick(() => { initHeroUnderline() })
        },
      )
      watch(
        () => route.path,
        () => {
          nextTick(() => { initMermaid() })
        },
      )
      return () => [
        h(Theme.Layout, null, {
        'layout-top': () => h(frontmatter.value.layout === 'home' ? HomeParticleField : TechBackground),
        'nav-bar-title-before': () => h(SidebarToggle),
        'nav-bar-title-after': () => h(NavBrandTitle),
        'nav-bar-content-after': () => h(TocToggle),
        'home-hero-before': () => [h(HomeHeroEyebrow), h(HomeHeroCopySwitch)],
        /* 占位以保留 has-image 布局钩子；HUD 已关闭，视觉只留 journey 大卡 */
        'home-hero-image': () =>
          h('div', { class: 'home-hero-image-off', 'aria-hidden': 'true' }),
        /* 主题大卡外独立区块：RECENT / 最新文章 */
        'home-hero-after': () => h(HomeMetricsStrip),
        'home-features-before': () => h(HomeSectionHeader),
        'home-features-after': () => h(HomeCategoryCards),
        'doc-before': () => h(ArticleMetadata),
        'doc-after': () => [h(SeriesNav), h(RelatedArticles), h(Comments)],
        }),
        h(ReadingProgress),
        h(ImageViewer),
      ]
    },
  },
}
