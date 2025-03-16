import Theme from 'vitepress/theme'
import './style/var.css'
import './style/vp-code-group.css';

import '@documate/vue/dist/style.css'
import { h, onMounted } from 'vue'
import Documate from '@documate/vue'
import { initCardTransform } from './cardTransform'

export default {
  ...Theme,
  Layout: {
    setup() {
      try {
        onMounted(() => {
          initCardTransform();
        });
      } catch (error) {
        console.error('Error during setup:', error);
      }
    },
    render() {
      return h(Theme.Layout, null, {
        'nav-bar-content-before': () => h(Documate, {
          endpoint: 'https://izbdbdndfp.us.aircode.run/ask',
        }),
      });
    },
  },
}
