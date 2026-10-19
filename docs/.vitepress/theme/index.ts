import '@fontsource-variable/space-grotesk'
import Theme from 'vitepress/theme'
import './manual/manual.css'
import './shell/shell.css'
import './shell/topbar.css'
import './shell/palette.css'
import './shell/article.css'
import './shell/notfound.css'

import './manual/feed/feed.css'
import SiteLayout from './shell/SiteLayout.vue'
import ManualScrolly from './manual/ManualScrolly.vue'
import FeedBurstLab from './manual/feed/FeedBurstLab.vue'
import FeedFlightLab from './manual/feed/FeedFlightLab.vue'
import FeedStrategyLab from './manual/feed/FeedStrategyLab.vue'
import FeedRoomLab from './manual/feed/FeedRoomLab.vue'
import FeedQuiz from './manual/feed/FeedQuiz.vue'
import { readAccent } from './manual/motion'

if (typeof document !== 'undefined') {
  const root = document.documentElement
  root.classList.add('manual')
  root.classList.remove('spatial', 'fluid')
  root.dataset.accent = readAccent()
}

export default {
  extends: Theme,
  Layout: SiteLayout,
  enhanceApp({ app }) {
    app.component('ManualScrolly', ManualScrolly)
    app.component('FeedBurstLab', FeedBurstLab)
    app.component('FeedFlightLab', FeedFlightLab)
    app.component('FeedStrategyLab', FeedStrategyLab)
    app.component('FeedRoomLab', FeedRoomLab)
    app.component('FeedQuiz', FeedQuiz)
  },
}
