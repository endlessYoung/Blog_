import Theme from 'vitepress/theme'
import './style/var.css'

import '@documate/vue/dist/style.css'
import { h } from 'vue'
import Documate from '@documate/vue'

export default {
  ...Theme,
  Layout: h(Theme.Layout, null, {
    'nav-bar-content-before': () => h(Documate, {
      endpoint: 'https://izbdbdndfp.us.aircode.run/ask',
    }),
  }),
}