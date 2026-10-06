/*
 * 所有风格原型共用的内容数据。挂在 window.EY 上，各风格自行渲染。
 * 不包含任何样式或动效逻辑。
 */
;(() => {
  'use strict'

  const pad = (n) => String(n).padStart(2, '0')

  const PARTS = [
    { id: '01', name: '移动开发', en: 'Mobile', count: 207, chapters: [
      { code: 'COMP', name: 'Android 组件', items: ['Activity', 'Activity的启动模式', 'Activity的生命周期详解', 'Service生命周期', '广播(BroadcastReceiver)', '内容提供器(ContentProvider)'] },
      { code: 'MECH', name: 'Android 机制', items: ['Handler', '事件分发机制', 'AIDL', '安卓进程通信的方法', 'Context'] },
      { code: 'COMPOSE', name: 'Jetpack Compose', items: ['Compose Gradle 配置', 'Compose布局系统与 Modifier', 'Jetpack Compose 状态管理详解'] },
      { code: 'KT', name: 'Kotlin', items: ['协程', 'Flow', 'Channel', '委托', '内联函数', 'reified', '逆变和协变'] },
    ] },
    { id: '02', name: '后端', en: 'Backend', count: 35, chapters: [
      { code: 'JAVA', name: 'Java 基础', items: ['Integer1000与100的比较', '动态代理', '反射', 'HashMap'] },
      { code: 'JUC', name: 'Java 并发', items: ['ThreadLocal', 'CAS', '线程池', 'ForkJoinPool', 'CompletableFuture', 'volatile和synchronize的区别'] },
      { code: 'JVM', name: 'JVM', items: ['JVM分区', '新建对象在JVM内存中分配的流程', 'GC算法', '三色标记算法', '双亲委派机制'] },
    ] },
    { id: '03', name: 'AI 与智能体', en: 'AI & Agents', count: 72, chapters: [
      { code: 'AGENT', name: 'Agent', items: ['基础概念', '工作流设计', 'Chunking', 'RAG', 'MCP', 'Agent 安全'] },
      { code: 'ML', name: '机器学习', items: ['监督学习入门', 'K-means', 'Lasso回归', 'sigmoid函数'] },
    ] },
    { id: '04', name: '系统与底层', en: 'Systems', count: 11, chapters: [
      { code: 'CPP', name: 'C++', items: ['头文件的声明规范', '模板', 'C++标准库'] },
    ] },
    { id: '05', name: '算法', en: 'Algorithms', count: 5, chapters: [
      { code: 'ALGO', name: '数据结构与算法', items: ['二分查找', '常见的排序方法', '异或运算交换两数', '合并数组'] },
    ] },
  ]

  const SUMMARY = {
    'CAS': '比较并交换：用一条 CPU 原子指令实现无锁同步，是 Atomic 类和 AQS 的地基。',
    '线程池': '核心线程、任务队列、最大线程数与拒绝策略如何协同工作。',
    'ThreadLocal': '每个线程一份变量副本的实现原理，以及弱引用 key 带来的内存泄漏问题。',
    'volatile和synchronize的区别': '可见性、有序性与原子性：两种关键字分别保证了什么。',
    'JVM分区': '程序计数器、虚拟机栈、本地方法栈、堆与方法区的职责划分。',
    '新建对象在JVM内存中分配的流程': '从 new 指令开始：TLAB、Eden 分配、Minor GC 与晋升老年代的全过程。',
    '三色标记算法': '并发标记时白、灰、黑三种颜色的含义，以及漏标问题的两种解法。',
    '双亲委派机制': '类加载请求为什么先向上委托，以及如何打破这一机制。',
    'GC算法': '标记清除、标记复制、标记整理三种基本算法的取舍。',
    'Handler': 'Looper、MessageQueue 与 Handler 组成的消息循环，主线程为什么不会卡死。',
    '事件分发机制': 'dispatchTouchEvent、onInterceptTouchEvent 与 onTouchEvent 的调用链。',
    '协程': '挂起函数、调度器与结构化并发：Kotlin 协程的核心概念。',
    'Flow': '冷流、操作符与背压：用 Flow 处理异步数据流。',
    'Chunking': 'RAG 中文档切分的策略：固定长度、语义切分与重叠窗口。',
    '工作流设计': '把 Agent 拆成可控的步骤：顺序、分支、循环与人工确认节点。',
    '基础概念': '什么是 Agent：感知、规划、行动与记忆四个组成部分。',
    'HashMap': '数组加链表加红黑树的结构、扩容与哈希扰动。',
    '二分查找': '在有序数组上每次排除一半区间，以及边界条件的写法。',
    'Jetpack Compose 状态管理详解': 'remember、mutableStateOf 与状态提升，重组是如何被触发的。',
  }

  const DATES = {
    'Chunking': '2026-08-03', '工作流设计': '2026-06-24', '基础概念': '2026-06-24',
    'CAS': '2026-07-31', '新建对象在JVM内存中分配的流程': '2026-10-04', 'MCP': '2026-07-12',
    'Jetpack Compose 状态管理详解': '2026-05-30', 'Agent 安全': '2026-07-20', 'RAG': '2026-06-02',
    '三色标记算法': '2026-04-18', '线程池': '2026-05-11',
  }

  /* 带交互图的文章，以及图集里使用的说明 */
  const FIGS = {
    'Handler': { caption: 'Looper 不断从队列取出消息', kind: 'loop' },
    'CAS': { caption: '两个线程竞争同一个变量', kind: 'cas' },
    '新建对象在JVM内存中分配的流程': { caption: '对象在分代之间的流动与晋升', kind: 'gen' },
    '二分查找': { caption: '指针收敛到目标元素', kind: 'bin' },
  }

  const hash = (s) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7)
  const ARTICLES = []
  PARTS.forEach((p) => p.chapters.forEach((c) => c.items.forEach((title, i) => {
    const h = hash(title)
    const num = `${p.id}.${c.code}.${pad(i + 1)}`
    ARTICLES.push({
      id: num, num, title,
      part: p, partName: p.name, chapName: c.name, chapCode: c.code,
      index: i + 1, total: c.items.length,
      date: DATES[title] || `${2024 + (h % 2)}-${pad(1 + (h % 12))}-${pad(1 + (h % 27))}`,
      mins: 4 + (h % 9),
      fig: FIGS[title] || null,
      summary: SUMMARY[title] || `「${c.name}」章节的第 ${i + 1} 篇笔记。演示数据，正文以站点为准。`,
    })
  })))
  const BY_ID = Object.fromEntries(ARTICLES.map((a) => [a.id, a]))
  const BY_TITLE = Object.fromEntries(ARTICLES.map((a) => [a.title, a]))
  const BY_DATE = [...ARTICLES].sort((a, b) => b.date.localeCompare(a.date))

  /* [分组, 词条, 对应文章标题] */
  const TERMS = [
    ['A', 'AIDL', 'AIDL'], ['A', 'Activity', 'Activity'], ['C', 'CAS', 'CAS'], ['C', 'Channel', 'Channel'],
    ['C', 'Chunking', 'Chunking'], ['C', 'CompletableFuture', 'CompletableFuture'], ['C', 'Context', 'Context'],
    ['F', 'Flow', 'Flow'], ['F', 'ForkJoinPool', 'ForkJoinPool'], ['G', 'GC', 'GC算法'], ['H', 'Handler', 'Handler'],
    ['H', 'HashMap', 'HashMap'], ['M', 'MCP', 'MCP'], ['M', 'Modifier', 'Compose布局系统与 Modifier'],
    ['R', 'RAG', 'RAG'], ['R', 'reified', 'reified'], ['T', 'ThreadLocal', 'ThreadLocal'], ['T', 'TLAB', '新建对象在JVM内存中分配的流程'],
    ['V', 'volatile', 'volatile和synchronize的区别'], ['二', '二分查找', '二分查找'], ['三', '三色标记', '三色标记算法'],
    ['双', '双亲委派', '双亲委派机制'], ['协', '协程', '协程'], ['线', '线程池', '线程池'], ['委', '委托', '委托'],
    ['反', '反射', '反射'], ['动', '动态代理', '动态代理'], ['重', '重组', 'Jetpack Compose 状态管理详解'],
  ]

  /* ================= CAS 文章正文 =================
   * 正文 HTML 中的站内链接写成 [[文章标题|显示文本]]，
   * 由各风格用 EY.renderRefs(html, (article, text) => '...') 替换成自己的链接样式。
   */
  const CAS_ARTICLE = {
    created: '2025-01-15',
    sections: [
      {
        title: '什么是 CAS',
        html: `<p><code>CAS</code>（Compare And Swap，比较并交换）是非阻塞同步的实现原理。它是 CPU 硬件提供的指令，从硬件层面保证“比较”与“交换”两个操作作为一个整体原子地完成。CAS 指令包含三个操作数：</p>
          <ol>
            <li><strong>内存位置 V</strong>：需要操作的内存位置，通常是一个共享变量。</li>
            <li><strong>预期值 E</strong>：期望该内存位置当前的值。</li>
            <li><strong>新值 N</strong>：如果内存位置的当前值与预期值相等，就把它更新为新值。</li>
          </ol>
          <p><strong>如果相等，就写入新值；如果不相等，说明已经有别的线程修改过这个位置，本次操作失败。</strong>失败的线程不会被挂起，可以自行决定重试还是放弃。</p>`,
        notes: [{ label: '硬件', html: '在 x86 上，CAS 对应带 <code>lock</code> 前缀的 <code>cmpxchg</code> 指令；ARM 上则由 LDREX / STREX 这类指令对实现。' }],
      },
      {
        title: '在 JDK 中的样子',
        html: `<p><code>AtomicInteger.incrementAndGet()</code> 最终调用 <code>Unsafe.getAndAddInt()</code>：先读取当前值，再用 CAS 尝试写入“当前值 + 1”，失败就回到循环开头。</p>
          {{code}}`,
        notes: [{ label: '可见性', html: '读取用的是 <code>getIntVolatile</code>，保证每次都能看到其他线程最新写入的值，原理见 [[volatile和synchronize的区别|volatile]]。' }],
      },
      {
        title: '动手看一遍',
        scrolly: true,
      },
      {
        title: '应用场景与代价',
        html: `<ul>
            <li><strong>乐观锁</strong>：<code>java.util.concurrent.atomic</code> 包中的 <code>AtomicInteger</code>、<code>AtomicReference</code> 等都基于 CAS 实现。</li>
            <li><strong>无锁数据结构</strong>：无锁队列、无锁栈用 CAS 保证线程安全，[[线程池]] 内部的状态位也用它更新。</li>
          </ul>
          <p><strong>优点</strong>：在不阻塞线程的情况下完成原子操作，避免了锁带来的上下文切换和死锁问题。</p>
          <p><strong>缺点</strong>：</p>
          <ul>
            <li><strong>ABA 问题</strong>：CAS 只比较当前值和预期值，无法知道这个值是否被改过又改回来。可以通过版本号或时间戳解决。</li>
            <li><strong>循环开销</strong>：竞争激烈时 CAS 反复失败，线程一直空转重试，性能反而下降。</li>
            <li><strong>只能保护一个变量</strong>：多个变量需要合并成一个对象，或者改用锁；需要线程隔离时可以考虑 [[ThreadLocal]]。</li>
          </ul>`,
        notes: [
          { label: 'ABA', html: '<code>AtomicStampedReference</code> 为值附带一个版本号，比较时同时比较值和版本。' },
          { label: '高竞争', html: '<code>LongAdder</code> 把一个计数拆到多个槽位上分散竞争，求和时再合并。' },
        ],
      },
    ],
    /* 滚动叙事：每段文字对应交互图的目标步骤 */
    scrollySteps: [
      { step: 0, label: '准备', text: '两个线程 T1、T2 同时对同一个 <code>AtomicInteger</code> 调用 <code>incrementAndGet()</code>，value 初始为 0。继续往下滚动，图会跟着推进；也可以用图下方的按钮单步执行。' },
      { step: 2, label: '同时读取', text: '两个线程几乎同时读取 value，各自拿到 expect = 0。没有任何锁，读取互不影响。' },
      { step: 5, label: 'T1 抢先', text: 'T1 先执行 CAS：内存中的值等于它手里的 expect，都是 0，于是把 value 写成 1，返回成功。' },
      { step: 6, label: 'T2 失败', text: 'T2 随后执行 CAS。它的 expect 还是 0，但内存已经变成 1，比较失败，写入被拒绝。T2 不会被挂起，而是回到循环开头重试。' },
      { step: 9, label: '重试成功', text: 'T2 重新读取到 1，计算出 2，这一次 CAS 成功。' },
      { step: 10, label: '结果', text: '最终 value = 2，两次自增都没有丢失。整个过程没有线程被阻塞，代价是 T2 多执行了一轮循环。把鼠标移到图中的代码行上，相关的寄存器和内存会同时高亮，反过来也一样。' },
    ],
  }

  const JAVA_SRC = `// java.util.concurrent.atomic.AtomicInteger
public final int incrementAndGet() {
    return U.getAndAddInt(this, VALUE, 1) + 1;
}

// jdk.internal.misc.Unsafe
public final int getAndAddInt(Object o, long offset, int delta) {
    int v;
    do {
        v = getIntVolatile(o, offset);          // 读取当前值
    } while (!weakCompareAndSetInt(o, offset, v, v + delta)); // 失败就重试
    return v;
}`

  /* 交互图中展示的简化代码，行号从 1 开始 */
  const CAS_CODE = [
    'public final int incrementAndGet() {',
    '    int expect, update;',
    '    do {',
    '        expect = value.get();',
    '        update = expect + 1;',
    '    } while (!value.compareAndSet(expect, update));',
    '    return update;',
    '}',
  ]

  /* 图中元素与代码行的对应关系，用于双向高亮 */
  const CAS_LINKS = { expect: [4, 6], update: [5, 6], retry: [6], memory: [4, 6] }

  /*
   * 每一步是一个完整快照：
   *   v      内存中的值
   *   t1/t2  { line, expect, update, retry, status, cls }，cls 为 '' | 'ok' | 'fail'
   *   actor  本步执行动作的线程，'t1' | 't2' | null
   *   fx     本步的数据流动：'read'（内存 → 线程）| 'write'（线程 → 内存，成功）| 'fail'（线程 → 内存后弹回）| null
   *   log    本步说明（HTML）
   */
  const CAS_STEPS = (() => {
    const idle = { line: 0, expect: '—', update: '—', retry: 0, status: '就绪', cls: '' }
    const raw = [
      { v: 0, log: '两个线程准备对同一个 <b>AtomicInteger</b> 执行自增，value 初始为 <b>0</b>。' },
      { actor: 't1', t1: { line: 4, expect: 0, status: '读取' }, fx: 'read', log: '<b>T1</b> 读取 value，得到 expect = 0。' },
      { actor: 't2', t2: { line: 4, expect: 0, status: '读取' }, fx: 'read', log: '<b>T2</b> 也读取 value，同样得到 expect = 0。' },
      { actor: 't1', t1: { line: 5, update: 1, status: '计算' }, log: '<b>T1</b> 计算 update = expect + 1 = 1。' },
      { actor: 't2', t2: { line: 5, update: 1, status: '计算' }, log: '<b>T2</b> 计算 update = expect + 1 = 1。' },
      { actor: 't1', v: 1, t1: { line: 6, status: 'CAS 成功', cls: 'ok' }, fx: 'write', log: '<b>T1</b> 执行 compareAndSet(0, 1)：内存值 0 等于 expect，<b>写入成功</b>，value 变为 1。' },
      { actor: 't2', t2: { line: 6, status: 'CAS 失败', cls: 'fail', retry: 1 }, fx: 'fail', log: '<b>T2</b> 执行 compareAndSet(0, 1)：内存值已经是 1，不等于 expect 0，<b>写入被拒绝</b>，回到循环开头。' },
      { actor: 't2', t2: { line: 4, expect: 1, update: '—', status: '重试读取', cls: '' }, fx: 'read', log: '<b>T2</b> 重新读取，expect = 1。' },
      { actor: 't2', t2: { line: 5, update: 2, status: '计算' }, log: '<b>T2</b> 计算 update = 2。' },
      { actor: 't2', v: 2, t2: { line: 6, status: 'CAS 成功', cls: 'ok' }, fx: 'write', log: '<b>T2</b> 执行 compareAndSet(1, 2)，<b>写入成功</b>，value 变为 2。' },
      { t1: { line: 7, status: '返回 1', cls: '' }, t2: { line: 7, status: '返回 2', cls: '' }, log: '两个线程都已返回。value = <b>2</b>，两次自增都生效，没有加锁，也没有丢失更新。' },
    ]
    let prev = { v: 0, t1: { ...idle }, t2: { ...idle } }
    return raw.map((r) => {
      const s = {
        v: r.v ?? prev.v,
        t1: { ...prev.t1, ...(r.t1 || {}) },
        t2: { ...prev.t2, ...(r.t2 || {}) },
        actor: r.actor || null,
        fx: r.fx || null,
        log: r.log,
      }
      prev = s
      return s
    })
  })()

  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

  function renderRefs(html, render) {
    return html.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_, title, text) => {
      const a = BY_TITLE[title]
      return a ? render(a, text || title) : (text || title)
    })
  }

  /* 极简 Java 高亮：返回每行一个 <span class="ln">，关键字 .tok-k，方法名 .tok-t，注释 .tok-c */
  function highlightJava(src) {
    return src.split('\n').map((line) => {
      const ci = line.indexOf('//')
      const code = ci >= 0 ? line.slice(0, ci) : line
      const comment = ci >= 0 ? line.slice(ci) : ''
      const body = esc(code)
        .replace(/\b(public|final|int|long|return|do|while|Object|private|static)\b/g, '<span class="tok-k">$1</span>')
        .replace(/\b(getAndAddInt|incrementAndGet|weakCompareAndSetInt|getIntVolatile)\b/g, '<span class="tok-t">$1</span>')
      return `<span class="ln">${body}${comment ? `<span class="tok-c">${esc(comment)}</span>` : ''}</span>`
    }).join('')
  }

  window.EY = {
    pad, esc,
    PARTS, ARTICLES, BY_ID, BY_TITLE, BY_DATE, TERMS, FIGS,
    TOTAL_ARTICLES: PARTS.reduce((n, p) => n + p.count, 0),
    TOTAL_CHAPTERS: PARTS.reduce((n, p) => n + p.chapters.length, 0),
    LAST_UPDATE: BY_DATE[0].date,
    CAS_ARTICLE, JAVA_SRC, CAS_CODE, CAS_LINKS, CAS_STEPS,
    renderRefs, highlightJava,
    search(q, limit = 12) {
      q = q.trim().toLowerCase()
      if (!q) return BY_DATE.slice(0, 10)
      return ARTICLES.map((a) => {
        const t = a.title.toLowerCase(), n = a.num.toLowerCase()
        let s = 0
        if (n.startsWith(q) || t.startsWith(q)) s = 3
        else if (t.includes(q) || n.includes(q)) s = 2
        else if ((a.partName + a.chapName).toLowerCase().includes(q)) s = 1
        return [s, a]
      }).filter(([s]) => s > 0)
        .sort((x, y) => y[0] - x[0] || y[1].date.localeCompare(x[1].date))
        .slice(0, limit).map(([, a]) => a)
    },
  }
})()
