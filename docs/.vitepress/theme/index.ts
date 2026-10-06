import '@fontsource-variable/space-grotesk'
import Theme from 'vitepress/theme'
import './tokens/engineering.css'
import './tokens/spatial.css'
import './tokens/fluid.css'
import './base.css'
import './style/vp-code-group.css'
import './style/mobile.css'
import './style/appearance-transition.css'

import { h, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { provideAnimatedAppearanceToggle } from './appearanceTransition'
import { initCardTilt } from './cardTilt'
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
import ArticleMetadata from './components/ArticleMetadata.vue'
import SidebarToggle from './components/SidebarToggle.vue'
import NavBrandTitle from './components/NavBrandTitle.vue'
import TocToggle from './components/TocToggle.vue'
import SiteNotFound from './components/SiteNotFound.vue'
import ThemeSwitcher from './components/ThemeSwitcher.vue'
import ArticleBreadcrumb from './components/Article/ArticleBreadcrumb.vue'
import ArticlePrevNext from './components/Article/ArticlePrevNext.vue'
import ThemeBackdrop from './components/ThemeBackdrop.vue'
import ThemeHome from './components/ThemeHome.vue'
import ThemeHero from './components/ThemeHero.vue'
import ThemeToc from './components/ThemeToc.vue'
import DiagramCas from './components/Diagram/DiagramCas.vue'
import { useTheme } from './composables/useTheme'

// 存储滚动位置
const scrollPositions: Record<string, number> = {}

export default {
  ...Theme,
  enhanceApp({ app }: any) {
    if (Theme.enhanceApp) {
      Theme.enhanceApp({ app })
    }
    app.component('DiagramCas', DiagramCas)
    app.component('ThemeHome', ThemeHome)
    app.component('ThemeHero', ThemeHero)
    app.component('ThemeToc', ThemeToc)
  },
  Layout: {
    setup() {
      const route = useRoute()
      const { frontmatter, isDark, page } = useData()
      provideAnimatedAppearanceToggle(
        isDark,
        () => page.value.isNotFound || frontmatter.value.pageClass === 'site-not-found',
      )

      const syncNotFoundLayout = () => {
        if (typeof document === 'undefined') return
        const on = !!(page.value.isNotFound || frontmatter.value.pageClass === 'site-not-found')
        document.querySelector('.Layout')?.classList.toggle('site-not-found', on)
      }
      watch(
        () => [page.value.isNotFound, frontmatter.value.pageClass] as const,
        () => nextTick(syncNotFoundLayout),
        { flush: 'post', immediate: true },
      )

      // 保存与恢复滚动位置
      onMounted(() => {
        const handleScroll = () => {
          scrollPositions[route.path] = window.scrollY
        }
        window.addEventListener('scroll', handleScroll)
        return () => {
          window.removeEventListener('scroll', handleScroll)
        }
      })

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
          if (window.innerWidth > 960) initCardTilt()
        })
      } catch (error) {
        console.error('Error during setup:', error)
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

      // Mermaid 图表渲染：首次加载 + SPA 路由切换后重新扫描
      onMounted(() => {
        nextTick(() => { initMermaid() })
      })
      watch(
        () => route.path,
        () => {
          nextTick(() => { initMermaid() })
        },
      )

      const theme = useTheme()
      onMounted(() => {
        theme.init()
      })

      return () => [
        h(Theme.Layout, null, {
          // 背景层由统一的 ThemeBackdrop 渲染（工程为精密网格，空间为极光流光，流体为 WebGL）
          'layout-top': () => h(ThemeBackdrop),
          'not-found': () => h(SiteNotFound),
          'nav-bar-title-before': () => h(SidebarToggle),
          'nav-bar-title-after': () => h(NavBrandTitle),
          'nav-bar-content-after': () => [h(ThemeSwitcher), h(TocToggle)],
          // 首页完整由三套主题各自的自洽架构接管渲染
          'home-hero-before': () => h(ThemeHome),
          'doc-before': () => [h(ArticleBreadcrumb), h(ArticleMetadata)],
          'doc-after': () => [h(ArticlePrevNext), h(SeriesNav), h(RelatedArticles), h(Comments)],
        }),
        h(ReadingProgress),
        h(ImageViewer),
      ]
    },
  },
}
