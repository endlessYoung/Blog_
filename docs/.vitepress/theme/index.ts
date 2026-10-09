import '@fontsource-variable/space-grotesk'
import Theme from 'vitepress/theme'
import './manual/manual.css'
import './shell/shell.css'
import './shell/topbar.css'
import './shell/palette.css'
import './shell/article.css'
import './shell/notfound.css'

import SiteLayout from './shell/SiteLayout.vue'
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
}
