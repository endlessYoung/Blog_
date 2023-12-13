import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Endlessyoung's Blog",
  description: "这是endlessyoung的个人博客",
  lastUpdated: true, 
  base: '/Blog_/',
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
      { text: 'Kotlin', link: '/Kotlin/数据类' },
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
            { text: 'Activity栈', link: '/Android/Activity栈' },
            { text: 'Activity的生命周期详解', link: '/Android/Activity的生命周期详解' },
            { text: '进程和应用生命周期', link: '/Android/进程和应用生命周期' },
            { text: 'Parcelable和Bundle', link: '/Android/Parcelable和Bundle' },
            { text: 'Service的启动方式', link: '/Android/Service的启动方式' },
            { text: 'Service生命周期', link: '/Android/Service生命周期' },
            { text: '日志详解', link: '/Android/日志详解' },
            { text: 'Intent', link: '/Android/Intent' },
            { text: 'Binder', link: '/Android/Binder' },
            { text: 'AlarmManager', link: '/Android/AlarmManager' },
            { text: 'SurfaceView', link: '/Android/SurfaceView' },
          
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
        {
          text: '实践',
          collapsed: false,
          items: [
            { text: '实践-亮度调节', link: '/Android/实践-亮度调节' },
            { text: '实践-手机所有应用', link: '/Android/实践-手机所有应用' },
            { text: 'OpenGL-纹理', link: '/Android/OpenGL-纹理' },
            { text: '实践-路径动画', link: '/Android/实践-路径动画' },
            { text: '实践-WorkerManager', link: '/Android/实践-WorkerManager' },
          ]
        },
        {
          text: '进阶',
          collapsed: false,
          items: [
            { text: 'logd日志简介及典型案例分析', link: '/Android/logd日志简介及典型案例分析' },
          ]
        },
        {
          text: 'OpenGL ES',
          collapsed: false,
          items: [
            { text: 'OpenGL ES初步探索', link: '/Android/OpenGL ES初步探索' },
            { text: '坐标系统', link: '/Android/OpenGL ES坐标系统' },
            { text: '纹理', link: '/Android/OpenGL-纹理' },
          ]
        }

        
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
            { text: '数据类', link: '/Kotlin/数据类' },
            { text: '初始化数组', link: '/Kotlin/初始化数组' },
            { text: '延迟初始化属性', link: '/Kotlin/延迟初始化属性' },
            { text: '扩展函数', link: '/Kotlin/扩展函数' },
            { text: 'sealed类', link: '/Kotlin/sealed类' },
            { text: '高阶函数', link: '/Kotlin/高阶函数' },
            { text: '委托', link: '/Kotlin/委托' },
            { text: 'Lambda表达式', link: '/Kotlin/Lambda表达式' },
            { text: 'lateinit和lazy', link: '/Kotlin/lateinit和lazy' },
            { text: '对象表达式和对象声明有什么区别', link: '/Kotlin/对象表达式和对象声明有什么区别' },
            { text: '顶层函数', link: '/Kotlin/顶层函数' },
            { text: '可见性修饰符', link: '/Kotlin/可见性修饰符' },
            { text: 'Jetpack Compose', link: '/Kotlin/Jetpack Compose' },
            { text: '协程', link: '/Kotlin/协程' },
            { text: '协程', link: '/Kotlin/协程' },
            { text: '协程', link: '/Kotlin/协程' },
            { text: '协程', link: '/Kotlin/协程' },
            { text: '协程', link: '/Kotlin/协程' },
            { text: '协程', link: '/Kotlin/协程' },
            { text: '协程', link: '/Kotlin/协程' },
            { text: '协程', link: '/Kotlin/协程' },
            { text: '协程', link: '/Kotlin/协程' },
            { text: '协程', link: '/Kotlin/协程' },
                            
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
