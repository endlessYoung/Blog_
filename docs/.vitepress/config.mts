import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Endlessyoung's Blog",
  description: "这是endlessyoung的个人博客",
  lastUpdated: true, 
  locales: {
    root: {
      label: 'Chinese',
      lang: 'zh-CN'
    }
  },
  lang: 'zh-CN',
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }], // 也是放在/public目录中
  ],
  themeConfig: {
    logo: '/panda.png',
    nav: [
      { text: 'Home', link: '/common/common_index' },
      { text: 'Examples', link: '/markdown-examples' },
      { text: 'Android', link: '/Android/Activity' },
      { text: 'JS', link: '/JS/1' },
      { text: 'Java', link: '/Java/1' },
      { text: 'Kotlin', link: '/Kotlin/1' },
      { text: 'Python', link: '/Python/1' },
      { text: 'C', link: '/C/1' },
      { text: 'C++', link: '/C++/1' },
    ],

    sidebar: {
      '/Android/': [
        {
          text: 'Android基础',
          collapsed: false,
          items: [
            { text: 'Android简介', link: '/Android/Android简介' },
            { text: '活动(Activity)', link: '/Android/Activity' },
            { text: '服务(Service)', link: '/Android/Service' },
            { text: '广播(BroadcastReceiver)', link: '/Android/BroadcastReceiver' },
            { text: '内容提供器(ContentProvider)', link: '/Android/ContentProvider' },
          ]
        },
        {
          text: '服务(Service)',
          collapsed: false,
          items: [
            { text: '活动', link: '/Android/Activity' },
            { text: '服务', link: '/Android/one' },
            { text: '广播', link: '/Android/two' },
            { text: '安卓类加载器', link: '/Android/安卓类加载器' },
          ]
        },
        {
          text: '广播(BroadcastReceiver)',
          collapsed: false,
          items: [
            { text: '活动', link: '/Android/Activity' },
            { text: '服务', link: '/Android/one' },
            { text: '广播', link: '/Android/two' },
            { text: '安卓类加载器', link: '/Android/安卓类加载器' },
          ]
        },
        {
          text: '内容提供器(ContentProvider)',
          collapsed: false,
          items: [
            { text: '活动', link: '/Android/Activity' },
            { text: '服务', link: '/Android/one' },
            { text: '广播', link: '/Android/two' },
            { text: '安卓类加载器', link: '/Android/安卓类加载器' },
          ]
        },

        
      ],
      '/JS/': [
        {
          text: 'JS',
          items: [
            { text: 'Index', link: '/JS/' },
            { text: 'One', link: '/JS/one' },
            { text: 'Two', link: '/JS/two' }
          ]
        }
      ],
      '/Java/': [
        {
          text: 'Java',
          items: [
            { text: 'Index', link: '/Java/' },
            { text: 'One', link: '/Java/one' },
            { text: 'Two', link: '/Java/two' }
          ]
        }
      ],
      '/Kotlin/': [
        {
          text: 'Kotlin',
          items: [
            { text: 'Index', link: '/Kotlin/' },
            { text: 'One', link: '/Kotlin/one' },
            { text: 'Two', link: '/Kotlin/two' }
          ]
        }
      ],
      '/Python/': [
        {
          text: 'Python',
          items: [
            { text: 'Index', link: '/Python/' },
            { text: 'One', link: '/Python/one' },
            { text: 'Two', link: '/Python/two' }
          ]
        }
      ],
      '/C/': [
        {
          text: 'C',
          items: [
            { text: 'Index', link: '/C/' },
            { text: 'One', link: '/C/one' },
            { text: 'Two', link: '/C/two' }
          ]
        }
      ],
      '/C++/': [
        {
          text: 'C++',
          items: [
            { text: 'Index', link: '/C++/' },
            { text: 'One', link: '/C++/one' },
            { text: 'Two', link: '/C++/two' }
          ]
        }
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/endlessYoung' }
    ],

    search: {
      provider: 'local',
      options: {
        locales: {
          zh: {
            translations: {
              button: {
                buttonText: '搜索文档',
                buttonAriaLabel: '搜索文档'
              },
              modal: {
                noResultsText: '无法找到相关结果',
                resetButtonTitle: '清除查询条件',
                footer: {
                  selectText: '选择',
                  navigateText: '切换'
                }
              }
            }
          }
        }
      }
    },
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2019-present <a href="https://github.com/endlessYoung">Endless Young</a>'
    }
  }
})
