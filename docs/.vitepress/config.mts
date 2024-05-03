import { defineConfig } from 'vitepress'
import markdownItKatex from 'markdown-it-katex'
const customElements = [
  'math',
  'maction',
  'maligngroup',
  'malignmark',
  'menclose',
  'merror',
  'mfenced',
  'mfrac',
  'mi',
  'mlongdiv',
  'mmultiscripts',
  'mn',
  'mo',
  'mover',
  'mpadded',
  'mphantom',
  'mroot',
  'mrow',
  'ms',
  'mscarries',
  'mscarry',
  'mscarries',
  'msgroup',
  'mstack',
  'mlongdiv',
  'msline',
  'mstack',
  'mspace',
  'msqrt',
  'msrow',
  'mstack',
  'mstack',
  'mstyle',
  'msub',
  'msup',
  'msubsup',
  'mtable',
  'mtd',
  'mtext',
  'mtr',
  'munder',
  'munderover',
  'semantics',
  'math',
  'mi',
  'mn',
  'mo',
  'ms',
  'mspace',
  'mtext',
  'menclose',
  'merror',
  'mfenced',
  'mfrac',
  'mpadded',
  'mphantom',
  'mroot',
  'mrow',
  'msqrt',
  'mstyle',
  'mmultiscripts',
  'mover',
  'mprescripts',
  'msub',
  'msubsup',
  'msup',
  'munder',
  'munderover',
  'none',
  'maligngroup',
  'malignmark',
  'mtable',
  'mtd',
  'mtr',
  'mlongdiv',
  'mscarries',
  'mscarry',
  'msgroup',
  'msline',
  'msrow',
  'mstack',
  'maction',
  'semantics',
  'annotation',
  'annotation-xml'
]


// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Endlessyoung's Blog",
  description: "这是endlessyoung的个人博客",
  lastUpdated: true,
  base: '/Blog_/',
  markdown: {
    config: (md: any) => {
      md.use(markdownItKatex)
    }
  },
  vue: {
    template: {
      compilerOptions: {
        isCustomElement: (tag: string) => customElements.includes(tag)
      }
    }
  },
  locales: {
    root: {
      label: 'Chinese',
      lang: 'zh-CN'
    }
  },
  lang: 'zh-CN',
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }], // 也是放在/public目录中
    ['link', { rel: 'stylesheet', href:'https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.5.1/katex.min.css'}]
  ],
  themeConfig: {
    logo: '/panda.png',
    nav: [
      { text: 'Home', link: '/common/common_index' },
      { text: 'Android', link: '/Android/Activity' },
      { text: 'JS', link: '/JS/1' },
      { text: 'Java', link: '/Java/Integer1000与100的比较' },
      { text: 'Kotlin', link: '/Kotlin/数据类' },
      { text: 'Python', link: '/Python/1' },
      { text: 'Ai', link: '/Ai/监督学习入门' },
      { text: 'C', link: '/C/1' },
      { text: 'C++', link: '/C++/1' },
      { text: 'Linux', link: '/Linux/Index' },
    ],

    sidebar: {
      '/Android/': [
        {
          text: 'Android基础',
          collapsed: false,
          items: [
            { text: 'Android简介', link: '/Android/Android简介' },
            { text: '活动(Activity)', link: '/Android/Activity' },
            { text: 'Activity的启动模式', link: '/Android/Activity的启动模式' },
            { text: 'LinearLayout', link: '/Android/LinearLayout' },
            { text: 'RelativieLayout', link: '/Android/RelativieLayout' },
            { text: 'ConstraintLayout', link: '/Android/ConstraintLayout' },
            { text: 'FrameLayout', link: '/Android/FrameLayout' },
            { text: 'TableLayout', link: '/Android/TableLayout' },
            { text: 'GridLayout', link: '/Android/GridLayout' },
            { text: '服务(Service)', link: '/Android/Service' },
            { text: '广播(BroadcastReceiver)', link: '/Android/BroadcastReceiver' },
            { text: '内容提供器(ContentProvider)', link: '/Android/ContentProvider' },
            { text: 'Activity栈', link: '/Android/Activity栈' },
            { text: 'Activity的生命周期详解', link: '/Android/Activity的生命周期详解' },
            { text: '进程和应用生命周期', link: '/Android/进程和应用生命周期' },
            { text: '异步任务与多线程', link: '/Android/异步任务与多线程' },
            { text: 'Parcelable和Bundle', link: '/Android/Parcelable和Bundle' },
            { text: 'Service的启动方式', link: '/Android/Service的启动方式' },
            { text: 'Service生命周期', link: '/Android/Service生命周期' },
            { text: '日志详解', link: '/Android/日志详解' },
            { text: 'Intent', link: '/Android/Intent' },
            { text: 'Fragment', link: '/Android/Fragment' },
            { text: 'Binder', link: '/Android/Binder' },
            { text: 'Handler', link: '/Android/Handler' },
            { text: 'AlarmManager', link: '/Android/AlarmManager' },
            { text: 'SurfaceView', link: '/Android/SurfaceView' },
            { text: 'AIDL', link: '/Android/AIDL' },
            { text: 'SharedPreference', link: '/Android/SharedPreference' },
            { text: 'LiveData', link: '/Android/LiveData' },
            { text: '事件分发机制', link: '/Android/事件分发机制' },
            { text: '进程保活', link: '/Android/进程保活' },
            { text: 'Context', link: '/Android/Context' },
            { text: '安卓中的线程和线程池', link: '/Android/安卓中的线程和线程池' },
            { text: '安卓中的IPC通信方式', link: '/Android/安卓中的IPC通信方式' },
            { text: 'SurfaceFlinger', link: '/Android/SurfaceFlinger' },
            { text: 'PhoneWindow', link: '/Android/PhoneWindow' },
          ]
        },
        {
          text: 'debug与调试',
          collapsed: false,
          items: [
            { text: 'dumpsys', link: '/Android/dumpsys' },
            { text: 'ANR问题简析', link: '/Android/ANR问题简析' },
            { text: 'Watchdog', link: '/Android/Watchdog' },
            { text: 'ADB', link: '/Android/ADB' },
            { text: '深入理解crash问题', link: '/Android/深入理解crash问题' },
            { text: 'Application为什么不能作为Dialog的context', link: '/Android/Application为什么不能作为Dialog的context' },
          ]
        },
        {
          text: '编译',
          collapsed: false,
          items: [
            { text: 'Android.mk', link: '/Android/Android.mk' },
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
            { text: '亮度调节', link: '/Android/实践-亮度调节' },
            { text: '手机所有应用', link: '/Android/实践-手机所有应用' },
            { text: 'OpenGL-纹理', link: '/Android/OpenGL-纹理' },
            { text: '路径动画', link: '/Android/实践-路径动画' },
            { text: 'WorkerManager', link: '/Android/实践-WorkerManager' },
            { text: 'recyclerview分组', link: '/Android/实践-recyclerview分组' },
            { text: 'Widget', link: '/Android/实践-Widget' },
          ]
        },
        {
          text: '进阶',
          collapsed: false,
          items: [
            { text: 'logd日志简介及典型案例分析', link: '/Android/logd日志简介及典型案例分析' },
            { text: 'Intent发送数据的上限', link: '/Android/Intent发送数据的上限' },
            { text: 'Looper死循环为什么不会导致应用卡死', link: '/Android/Looper死循环为什么不会导致应用卡死' },
            { text: '使用Handler的postDelay消息队列有什么变化', link: '/Android/使用Handler的postDelay消息队列有什么变化' },
            { text: '如何保证多个handler线程安全', link: '/Android/如何保证多个handler线程安全' },
            { text: 'Binder驱动在哪限制', link: '/Android/Binder驱动在哪限制' },
            { text: 'Lifecycle状态机的作用', link: '/Android/Lifecycle状态机的作用' },
            { text: 'LiveData核心原理', link: '/Android/LiveData核心原理' },
            { text: 'LiveDataBus', link: '/Android/LiveDataBus' },
            { text: 'Hook技术', link: '/Android/Hook技术' },
            { text: 'AMS剖析', link: '/Android/AMS剖析' },
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
            { text: 'Integer1000与100的比较', link: '/Java/Integer1000与100的比较' },
            { text: '动态代理', link: '/Java/动态代理' },
            { text: '反射', link: '/Java/反射' },
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
            { text: 'by lazy和lazy', link: '/Kotlin/by lazy和lazy' },
            { text: '协程', link: '/Kotlin/协程' },
            { text: 'Object关键字', link: '/Kotlin/Object关键字' },
            { text: 'Kotlin中的挂起函数', link: '/Kotlin/Kotlin中的挂起函数' },
            { text: '集合', link: '/Kotlin/集合' },
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
      '/Ai/': [
        {
          text: '机器学习',
          collapsed: false,
          items: [
            { text: '监督学习', link: '/Ai/监督学习' },
            { text: '非监督学习', link: '/Ai/非监督学习' },
            { text: '梯度下降', link: '/Ai/梯度下降' },
            { text: 'Hard sigmoid和soft sigmoid', link: '/Ai/Hard sigmoid和soft sigmoid' },
            { text: 'Rectified Linear Unit', link: '/Ai/Rectified Linear Unit' },
            { text: '深度神经网络', link: '/Ai/深度神经网络' },
            { text: '过拟合', link: '/Ai/过拟合' },
            { text: '深度学习', link: '/Ai/深度学习' },
            { text: '全连接前馈网络(FNN)', link: '/Ai/全连接前馈网络' },
            { text: '卷积神经网络(CNN)', link: '/Ai/卷积神经网络' },
            { text: '正向传播和反向传播', link: '/Ai/正向传播和反向传播' },
            { text: '逻辑回归', link: '/Ai/逻辑回归' },
            { text: '决策树算法', link: '/Ai/决策树算法' },
            { text: '聚类算法', link: '/Ai/聚类算法' },
            { text: '贝叶斯算法', link: '/Ai/贝叶斯算法' },
            { text: '支持向量机算法', link: '/Ai/支持向量机算法' },
            { text: '随机森林算法', link: '/Ai/随机森林算法' },
            { text: '交叉熵', link: '/Ai/交叉熵' },
          ],
        },
        {
          text: 'Pytorch',
          collapsed: false,
          items: [
            { text: 'Pytorch(一)', link: '/Ai/Pytorch(一)' },
            { text: 'Pytorch(一)', link: '/Ai/Pytorch(一)' },
            { text: 'Pytorch(一)', link: '/Ai/Pytorch(一)' },
            { text: 'Pytorch(一)', link: '/Ai/Pytorch(一)' },
            { text: 'Pytorch(一)', link: '/Ai/Pytorch(一)' },
            { text: 'Pytorch(一)', link: '/Ai/Pytorch(一)' },
            { text: 'Pytorch(一)', link: '/Ai/Pytorch(一)' },
          ],
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
      '/Linux/': [
        {
          text: 'Linux',
          items: [
            { text: 'Index', link: '/Linux/' },
            { text: 'One', link: '/Linux/one' },
            { text: 'Two', link: '/Linux/two' }
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
