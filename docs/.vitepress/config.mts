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
  sitemap: {
    hostname: 'https://endlessyoung.github.io/Blog_/',
  },
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
    ['link', { rel: 'icon', href: '/Blog_/favicon.ico' }], // 也是放在/public目录中
    ['link', { rel: 'stylesheet', href: 'https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.5.1/katex.min.css' }]
  ],
  themeConfig: {
    logo: '/panda.png',
    nav: [
      // { text: 'Home', link: '/Ai/监督学习入门' },
      { text: 'Android', link: '/Android/Activity' },
      { text: '数据结构和算法', link: '/数据结构和算法/合并数组' },
      { text: 'Java', link: '/Java/Integer1000与100的比较' },
      { text: 'Kotlin', link: '/Kotlin/数据类' },
      { text: 'Python', link: '/Python/1' },
      { text: 'SQL', link: '/SQL/全文搜索' },
      { text: 'Ai', link: '/Ai/监督学习入门' },
      { text: 'JS', link: '/JS/1' },
      { text: 'C', link: '/C/1' },
      { text: 'C++', link: '/C++/1' },
      { text: 'Linux', link: '/Linux/Index' },

    ],

    sidebar: {
      '/Android/': [
        {
          text: 'Android基础',
          collapsed: true,
          items: [
            { text: 'Android简介', link: '/Android/Android简介' },
            { text: 'Manifest详解', link: '/Android/Manifest详解' },
            { text: '活动(Activity)', link: '/Android/Activity' },
            { text: 'Activity的启动模式', link: '/Android/Activity的启动模式' },
            { text: 'LinearLayout', link: '/Android/LinearLayout' },
            { text: 'RelativieLayout', link: '/Android/RelativieLayout' },
            { text: 'ConstraintLayout', link: '/Android/ConstraintLayout' },
            { text: 'FrameLayout', link: '/Android/FrameLayout' },
            { text: 'TableLayout', link: '/Android/TableLayout' },
            { text: 'GridLayout', link: '/Android/GridLayout' },
            { text: 'SparseArray', link: '/Android/SparseArray' },
            { text: 'RecyclerView和ListView区别', link: '/Android/RecyclerView和ListView区别' },
            { text: 'RecyclerView知识点汇总', link: '/Android/RecyclerView知识点汇总' },
            { text: 'DecorView', link: '/Android/DecorView' },
            { text: 'ViewRoot', link: '/Android/ViewRoot' },
            { text: 'Toast', link: '/Android/Toast' },
            { text: 'DialogFragment', link: '/Android/DialogFragment' },
            { text: 'PopupWindow', link: '/Android/PopupWindow' },
            { text: 'Snackbar', link: '/Android/Snackbar' },
            { text: 'BottomNavigationView', link: '/Android/BottomNavigationView' },
            { text: '服务(Service)', link: '/Android/Service' },
            { text: '广播(BroadcastReceiver)', link: '/Android/BroadcastReceiver' },
            { text: '内容提供器(ContentProvider)', link: '/Android/ContentProvider' },
            { text: 'Activity栈', link: '/Android/Activity栈' },
            { text: 'Activity的生命周期详解', link: '/Android/Activity的生命周期详解' },
            { text: '进程和应用生命周期', link: '/Android/进程和应用生命周期' },
            { text: '异步任务与多线程', link: '/Android/异步任务与多线程' },
            { text: 'Parcelable和Bundle', link: '/Android/Parcelable和Bundle' },
            { text: 'Service的启动方式和区别', link: '/Android/Service的启动方式和区别' },
            { text: 'Service生命周期', link: '/Android/Service生命周期' },
            { text: '各种Service的区别', link: '/Android/各种Service的区别' },
            { text: 'Jobservice', link: '/Android/Jobservice' },
            { text: 'Intent', link: '/Android/Intent' },
            { text: 'Fragment', link: '/Android/Fragment' },
            { text: 'Fragment几种不同的commit方法', link: '/Android/Fragment几种不同的commit方法' },
            { text: 'Fragment转场动画', link: '/Android/Fragment转场动画' },
            { text: 'Handler', link: '/Android/Handler' },
            { text: 'AlarmManager', link: '/Android/AlarmManager' },
            { text: 'SurfaceView', link: '/Android/SurfaceView' },
            { text: 'AIDL', link: '/Android/AIDL' },
            { text: 'SharedPreference', link: '/Android/SharedPreference' },
            { text: 'DataBinding', link: '/Android/DataBinding' },
            { text: 'ViewBinding', link: '/Android/ViewBinding' },
            { text: 'RxBinding', link: '/Android/RxBinding' },
            { text: 'ViewModel 和 LiveData', link: '/Android/ViewModel 和 LiveData' },
            { text: '创建有参ViewModel', link: '/Android/创建有参ViewModel' },
            { text: '事件分发机制', link: '/Android/事件分发机制' },
            { text: 'Context', link: '/Android/Context' },
            { text: 'AssestManager', link: '/Android/AssestManager' },
            { text: 'MediaPlayer', link: '/Android/MediaPlayer' },
            { text: '安卓中的线程和线程池', link: '/Android/安卓中的线程和线程池' },
            { text: '自定义View', link: '/Android/自定义View' },
            { text: 'DataStore', link: '/Android/DataStore' },
          ]
        },
        {
          text: '组件通信',
          collapsed: true,
          items: [
            { text: 'Activity和Fragment的低耦合通信', link: '/Android/Activity和Fragment的低耦合通信' },
            { text: 'Android与Service通信', link: '/Android/Android与Service通信' },
            { text: 'ViewModel通信方案', link: '/Android/ViewModel通信方案' },
            { text: '事件总线EventBus', link: '/Android/事件总线EventBus' },
          ]
        },
        {
          text: 'debug与调试',
          collapsed: true,
          items: [
            { text: '安卓常见的内存泄漏点', link: '/Android/安卓常见的内存泄漏点' },
            { text: 'Fragment找不到id对应view', link: '/Android/Fragment找不到id对应view' },
            { text: 'dumpsys', link: '/Android/dumpsys' },
            { text: 'ANR问题简析', link: '/Android/ANR问题简析' },
            { text: 'Watchdog', link: '/Android/Watchdog' },
            { text: 'ADB', link: '/Android/ADB' },
            { text: 'AndroidTest编译Provider冲突问题', link: '/Android/AndroidTest编译Provider冲突问题' },
            { text: 'AndroidTest测试Service无响应问题', link: '/Android/AndroidTest测试Service无响应问题' },
            { text: '深入理解crash问题', link: '/Android/深入理解crash问题' },
            { text: 'Application为什么不能作为Dialog的context', link: '/Android/Application为什么不能作为Dialog的context' },
            { text: 'App卡顿优化', link: '/Android/App卡顿优化' },
          ]
        },
        {
          text: '编译',
          collapsed: true,
          items: [
            { text: 'Android.mk', link: '/Android/Android.mk' },
            { text: '安卓类加载器', link: '/Android/安卓类加载器' },
            { text: 'APK打包流程', link: '/Android/APK打包流程' },
            { text: 'pageSize', link: '/Android/pageSize' },
          ]
        },
        {
          text: '性能优化-ui',
          collapsed: true,
          items: [
            { text: 'ListView性能优化', link: '/Android/ListView性能优化' },
            { text: 'RecyclerView性能优化', link: '/Android/RecyclerView性能优化' },
          ]
        },
        {
          text: 'JNI',
          collapsed: true,
          items: [
            { text: '初识JNI', link: '/Android/初识JNI' },
            { text: '安卓类加载器', link: '/Android/安卓类加载器' },
          ]
        },
        {
          text: 'Framework',
          collapsed: false,
          items: [
            { text: 'AOSP架构', link: '/Android/AOSP架构' },
            { text: '智能指针', link: '/Android/智能指针' },
            { text: 'Android进程和线程', link: '/Android/Android进程和线程' },
            { text: 'Handler、MessageQueue和Looper', link: '/Android/Handler、MessageQueue和Looper' },
            { text: 'ActivityThread线程(UI主线程)', link: '/Android/ActivityThread线程(UI主线程)' },
            { text: '为什么主线程可以直接new Handler', link: '/Android/为什么主线程可以直接new Handler' },
            { text: 'Handler.postDelayed()消息时间准确吗？', link: '/Android/Handler.postDelayed()消息时间准确吗？' },
            { text: 'IdleHandler', link: '/Android/IdleHandler' },
            { text: '同步屏障', link: '/Android/同步屏障' },
            { text: 'Handler内存泄漏如何解决？', link: '/Android/Handler内存泄漏如何解决？' },
            { text: '如何创建Message？', link: '/Android/如何创建Message？' },
            { text: 'Thread类', link: '/Android/Thread类' },


            { text: 'ActivityManagerService', link: '/Android/ActivityManagerService' },
            { text: 'WindowManagerService', link: '/Android/WindowManagerService' },


            { text: 'Parcel', link: '/Android/Parcel' },
            { text: 'ServiceManager', link: '/Android/ServiceManager' },
            { text: 'Android系统启动流程', link: '/Android/Android系统启动流程' },
            { text: 'init进程在启动其他服务后可以退出吗？', link: '/Android/init进程在启动其他服务后可以退出吗？' },
            { text: 'AMS如何启动App进程', link: '/Android/AMS如何启动App进程' },
            { text: 'AMS和WMS的关系', link: '/Android/AMS和WMS的关系' },
            { text: 'Zygote进程的fork', link: '/Android/zygote进程的fork' },
            { text: 'SystemServer进程的意义', link: '/Android/SystemServer进程的意义' },
            { text: 'Zygote采用socket的原因', link: '/Android/Zygote采用socket的原因' },
            { text: 'AMS对App进程启动和管理的方案', link: '/Android/AMS对App进程启动和管理的方案' },
            { text: 'setContentView之后发生了什么', link: '/Android/setContentView之后发生了什么' },
            { text: 'StartActivity之后发生了什么', link: '/Android/StartActivity之后发生了什么' },
            { text: 'Activity启动过程', link: '/Android/Activity启动过程' },
            { text: 'invalidate会触发其他View的重绘吗？', link: '/Android/invalidate会触发其他view的重绘吗？' },
            { text: 'Activity如何与Window与View进行分工合作的？', link: '/Android/Activity如何与Window与View进行分工合作的？' },
            { text: 'View的绘制过程都是用的同一个canvas吗？', link: '/Android/View的绘制过程都是用的同一个canvas吗？' },
            { text: 'onResume中获取宽高有效吗？', link: '/Android/onResume中获取宽高有效吗？' },
            { text: 'Activity、Window、DecorView 的关系', link: '/Android/Activity、Window、DecorView 的关系' },
            { text: 'SurfaceFlinger', link: '/Android/SurfaceFlinger' },
            { text: 'PhoneWindow', link: '/Android/PhoneWindow' },
            { text: '安卓中的IPC通信方式', link: '/Android/安卓中的IPC通信方式' },
            { text: 'AsyncTask ', link: '/Android/AsyncTask ' },
            { text: 'Binder', link: '/Android/Binder' },
            { text: '进程保活', link: '/Android/进程保活' },
            { text: 'Activity中viewtree的创建过程', link: '/Android/Activity中viewtree的创建过程' },
            { text: 'WMS中窗口的注册', link: '/Android/WMS中窗口的注册' },
            { text: 'ViewRoot的基本工作方式', link: '/Android/ViewRoot的基本工作方式' },
            { text: 'ViewTree的遍历', link: '/Android/ViewTree的遍历' },
          ]
        },
        {
          text: '图形渲染',
          collapsed: false,
          items: [
            { text: '图形渲染', link: '/Android/图形渲染' },
            { text: '渲染机制', link: '/Android/渲染机制' },
            { text: '深入理解图形渲染的关键角色和关系', link: '/Android/深入理解图形渲染的关键角色和关系' },
            { text: 'WindowManagerService', link: '/Android/WindowManagerService' },
            { text: 'Surface和SurfaceHolder', link: '/Android/Surface和SurfaceHolder' },
            { text: 'HWC的合成策略', link: '/Android/HWC的合成策略' },
            { text: 'Activity、View、Window三者之间的关系', link: '/Android/Activity、View、Window三者之间的关系' },
            { text: 'Surface和SurfaceHolder', link: '/Android/Surface和SurfaceHolder' },
            { text: 'Skia', link: '/Android/Skia' },
            { text: 'OpenGL ES', link: '/Android/OpenGL ES' },
            { text: 'vulkan', link: '/Android/vulkan' },
          ]
        },
        {
          text: '序列化',
          collapsed: false,
          items: [
            { text: 'Parcelable', link: '/Android/Parcelable' },
            { text: 'ProtocolBuffers', link: '/Android/ProtocolBuffers' },
          ]
        },
        {
          text: '安全',
          collapsed: false,
          items: [
            { text: '混淆机制', link: '/Android/混淆机制' },
            { text: 'v1和v2签名机制', link: '/Android/v1和v2签名机制' },
            { text: '签名机制', link: '/Android/签名机制' },
            { text: '加固技术', link: '/Android/加固技术' },
            { text: '常见的漏洞', link: '/Android/常见的漏洞' },
            { text: '反破解技术', link: '/Android/反破解技术' },
            { text: '反编译技术', link: '/Android/反编译技术' },
            { text: '敏感信息隐藏技术', link: '/Android/敏感信息隐藏技术' },
          ]
        },
        {
          text: '安卓日志系统',
          collapsed: false,
          items: [
            { text: '日志详解', link: '/Android/日志详解' },
            { text: 'logd日志简介及典型案例分析', link: '/Android/logd日志简介及典型案例分析' },
            { text: 'EventLog日志', link: '/Android/EventLog日志' },
            { text: 'MainLog日志', link: '/Android/MainLog日志' },
            { text: 'RadioLog日志', link: '/Android/RadioLog日志' },
            { text: 'SystemLog日志', link: '/Android/SystemLog日志' },
            { text: 'CrashLog日志', link: '/Android/CrashLog日志' },
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
        },
        {
          text: 'Gradle',
          collapsed: false,
          items: [
            { text: 'build.gradle', link: '/Android/build.gradle' },
            { text: 'build.gradle.kts', link: '/Android/build.gradle.kts' },
            { text: 'proguard-rules.pro', link: '/Android/proguard-rules.pro' },
            { text: 'settings.gradle', link: '/Android/settings.gradle' },
            { text: 'settings.gradle.kts', link: '/Android/settings.gradle.kts' },
          ]
        },
        {
          text: 'NDK',
          collapsed: false,
          items: [
            { text: 'ABI', link: '/Android/ABI' },
            { text: 'JNI', link: '/Android/JNI' },
            { text: 'so文件', link: '/Android/so文件' },
          ]
        }
      ],
      '/Ai/': [
        {
          text: '机器学习',
          collapsed: true,
          items: [
            { text: '监督学习', link: '/Ai/监督学习入门' },
            { text: '非监督学习', link: '/Ai/非监督学习' },
            { text: '数据归一化', link: '/Ai/数据归一化' },
            { text: '数据降维', link: '/Ai/数据降维' },
            { text: '正规方程及其推导', link: '/Ai/正规方程及其推导' },
            { text: '梯度下降', link: '/Ai/梯度下降' },
            { text: 'Hard sigmoid和soft sigmoid', link: '/Ai/Hard sigmoid和soft sigmoid' },
            { text: 'Rectified Linear Unit', link: '/Ai/Rectified Linear Unit' },
            { text: '深度神经网络', link: '/Ai/深度神经网络' },
            { text: '过拟合', link: '/Ai/过拟合' },
            { text: '正则化', link: '/Ai/正则化方法' },
            { text: '深度学习', link: '/Ai/深度学习' },
            { text: '全连接前馈网络(FNN)', link: '/Ai/全连接前馈网络' },
            { text: '卷积神经网络(CNN)', link: '/Ai/卷积神经网络' },
            { text: '正向传播和反向传播', link: '/Ai/正向传播和反向传播' },
            { text: '决策树算法', link: '/Ai/决策树算法' },
            { text: '贝叶斯算法', link: '/Ai/贝叶斯算法' },
            { text: '支持向量机算法', link: '/Ai/支持向量机算法' },
            { text: '随机森林算法', link: '/Ai/随机森林算法' },
            { text: '交叉熵', link: '/Ai/交叉熵' },
          ],
        },
        {
          text: '回归算法',
          collapsed: true,
          items: [
            { text: '线性回归', link: '/Ai/线性回归' },
            { text: '多项式回归', link: '/Ai/多项式回归' },
            { text: '岭回归', link: '/Ai/岭回归' },
            { text: 'Lasso回归', link: '/Ai/Lasso回归' },
            { text: '逻辑回归', link: '/Ai/逻辑回归' },
            { text: '弹性网络回归', link: '/Ai/弹性网络回归' },
            { text: '支持向量回归(SVR)', link: '/Ai/支持向量回归(SVR)' },
            { text: '神经网络回归', link: '/Ai/神经网络回归' },
          ],
        },
        {
          text: '聚类算法',
          collapsed: false,
          items: [
            { text: '聚类算法', link: '/Ai/聚类算法' },
            { text: 'K-means', link: '/Ai/K-means' },
            { text: 'DESCAN', link: '/Ai/DESCAN' },
            { text: '层次聚类', link: '/Ai/层次聚类' },
            { text: '谱聚类', link: '/Ai/谱聚类' },
            { text: '高斯混合模型', link: '/Ai/高斯混合模型' },
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
      '/数据结构和算法/': [
        {
          text: '简单题',
          items: [
            { text: '合并数组', link: '/数据结构和算法/合并数组' },
            { text: '移除元素', link: '/数据结构和算法/移除元素' },
          ]
        }
      ],
      '/Java/': [
        {
          text: 'Java基础',
          collapsed: false,
          items: [
            { text: 'Integer1000与100的比较', link: '/Java/Integer1000与100的比较' },
            { text: '动态代理', link: '/Java/动态代理' },
            { text: '反射', link: '/Java/反射' },
          ]
        },
        {
          text: 'Java并发',
          collapsed: false,
          items: [
            { text: '线程安全性', link: '/Java/线程安全性' },
            { text: '原子性', link: '/Java/原子性' },
            { text: '原子操作类', link: '/Java/原子操作类' },
            { text: '加锁机制', link: '/Java/加锁机制' },
            { text: '偏向锁', link: '/Java/偏向锁' },
            { text: 'Mutex', link: '/Java/Mutex' },
            { text: 'ReentrantLock', link: '/Java/ReentrantLock' },
            { text: 'happens-before', link: '/Java/happens-before' },
            { text: '线程优先级', link: '/Java/线程优先级' },
            { text: '线程的状态', link: '/Java/线程的状态' },
            { text: 'Daemon线程', link: '/Java/Daemon线程' },
            { text: '线程间通信', link: '/Java/线程间通信' },
            { text: '线程池', link: '/Java/线程池' },
            { text: 'Lock接口', link: '/Java/Lock接口' },
            { text: '队列同步器', link: '/Java/队列同步器' },
            { text: '排他锁', link: '/Java/排他锁' },
            { text: 'LockSupport', link: '/Java/LockSupport' },
            { text: 'Condition接口', link: '/Java/Condition接口' },
            { text: 'ConcurrentHashMap', link: '/Java/ConcurrentHashMap' },
            { text: 'ConcurrentLinkedQueue', link: '/Java/ConcurrentLinkedQueue' },
            { text: 'Java的阻塞队列', link: '/Java/Java的阻塞队列' },
            { text: 'CountDownLatch', link: '/Java/CountDownLatch' },
            { text: 'CyclicBarrier', link: '/Java/CyclicBarrier' },
            { text: 'Semaphore', link: '/Java/Semaphore' },
            { text: 'Exchanger', link: '/Java/Exchanger' },
            { text: 'Executor框架', link: '/Java/Executor框架' },
            { text: 'Callable和Runnable区别', link: '/Java/Callable和Runnable区别' },
            { text: 'Future接口', link: '/Java/Future接口' },
            { text: 'FutureTask', link: '/Java/FutureTask' },
          ]
        },
        {
          text: 'JVM',
          collapsed: false,
          items: [
            { text: 'JVM概述', link: '/Java/JVM概述' },
            { text: 'JVM分区', link: '/Java/JVM分区' },
            { text: 'String的intern方法', link: '/Java/String的intern方法' },
            { text: '对象初始化流程', link: '/Java/对象初始化流程' },
          ]
        },
      ],
      '/Kotlin/': [
        {
          text: 'kotlin基础',
          collapsed: true,
          items: [
            { text: '元组', link: '/Kotlin/元组' },
            { text: '集合', link: '/Kotlin/集合' },
            { text: '作用域函数', link: '/Kotlin/作用域函数' },
            { text: '范围表达式', link: '/Kotlin/范围表达式' },
            { text: '编译时常量', link: '/Kotlin/编译时常量' },
            { text: '主构造函数和次构造函数', link: '/Kotlin/主构造函数和次构造函数' },
            { text: '泛型', link: '/Kotlin/泛型' },
            { text: 'reified', link: '/Kotlin/reified' },
            { text: '逆变和协变', link: '/Kotlin/逆变和协变' },
            { text: '类型擦除', link: '/Kotlin/类型擦除' },
            { text: '序列', link: '/Kotlin/序列' },
            { text: '类别名', link: '/Kotlin/类别名' },
            { text: '操作符重载', link: '/Kotlin/操作符重载' },
            { text: '解构声明', link: '/Kotlin/解构声明' },
            { text: '数据类', link: '/Kotlin/数据类' },
            { text: '内联函数', link: '/Kotlin/内联函数' },
            { text: '中缀函数', link: '/Kotlin/中缀函数' },
            { text: 'Any和Unit以及Nothing', link: '/Kotlin/Any和Unit以及Nothing' },
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
            { text: 'by lazy和lazy', link: '/Kotlin/by lazy和lazy' },
            { text: '协程', link: '/Kotlin/协程' },
            { text: 'Object关键字', link: '/Kotlin/Object关键字' },
            { text: 'Kotlin中的挂起函数', link: '/Kotlin/Kotlin中的挂起函数' },
            { text: '集合', link: '/Kotlin/集合' },
            { text: '尾递归', link: '/Kotlin/尾递归' },
          ]
        },
        {
          text: '协程',
          items: [
            { text: '协程', link: '/Kotlin/协程' },
            { text: '通道', link: '/Kotlin/通道' },
            { text: 'Mutex', link: '/Kotlin/Mutex' },
          ]
        },
        {
          text: 'Flow',
          items: [
            { text: 'Flow', link: '/Kotlin/Flow' },
          ]
        },
        {
          text: 'Jetpack Compose',
          items: [
            { text: 'Jetpack Compose', link: '/Kotlin/Jetpack Compose' },
          ]
        }
      ],
      '/Python/': [
        {
          text: 'python基础',
          items: [
            { text: '列表推导式', link: '/Python/列表推导式' },
            { text: '海象运算符', link: '/Python/海象运算符' },
            { text: '切片', link: '/Python/切片' },
            { text: 'range函数', link: '/Python/range函数' },
            { text: '字典', link: '/Python/字典' },
            { text: '数据类', link: '/Python/数据类' },
          ]
        },
        {
          text: 'numpy',
          items: [
            { text: 'numpy的常用方法', link: '/Python/numpy的常用方法' },
            { text: 'One', link: '/Python/one' },
            { text: 'Two', link: '/Python/two' }
          ]
        },
        {
          text: 'ski-learn',
          items: [
            { text: 'Index', link: '/Python/' },
            { text: 'One', link: '/Python/one' },
            { text: 'Two', link: '/Python/two' }
          ]
        },
        {
          text: 'pytorch',
          items: [
            { text: 'Index', link: '/Python/' },
            { text: 'One', link: '/Python/one' },
            { text: 'Two', link: '/Python/two' }
          ]
        }
      ],
      '/SQL/': [
        {
          text: 'SQL基础',
          items: [
            { text: 'SQL简介', link: '/SQL/SQL简介' },
          ]
        },
        {
          text: 'SQL',
          items: [
            { text: '全文搜索', link: '/SQL/全文搜索' },
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
            { text: '头文件的声明规范', link: '/C++/头文件的声明规范' },
            { text: '模板', link: '/C++/模板' },
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
