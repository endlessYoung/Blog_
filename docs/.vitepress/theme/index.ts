import Theme from 'vitepress/theme'
import './style/var.css'
import './style/vp-code-group.css';

import '@documate/vue/dist/style.css'
import { h, onMounted, nextTick } from 'vue'
import Documate from '@documate/vue'
import { initCardTransform } from './cardTransform'
import { useRoute } from 'vitepress'
import Comments from './components/Comments.vue'
import ArticleMetadata from './components/ArticleMetadata.vue'

// 存储滚动位置
const scrollPositions: Record<string, number> = {}

export default {
  ...Theme,
  Layout: {
    setup() {
      const route = useRoute()

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
          initCardTransform();
        });
      } catch (error) {
        console.error('Error during setup:', error);
      }

      // Watch route to potentially handle visibility if needed, but CSS is preferred.
    },
    render() {
      return h(Theme.Layout, null, {
        'nav-bar-content-before': () =>
          h(Documate, { endpoint: 'https://izbdbdndfp.us.aircode.run/ask' }),
        'doc-before': () => h(ArticleMetadata),
        'doc-after': () => h(Comments)
      })
    },
  },
}
