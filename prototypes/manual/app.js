(() => {
  'use strict'

  const root = document.documentElement
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
  const canHover = matchMedia('(hover: hover)').matches
  const EASE_OUT = 'cubic-bezier(.16, 1, .3, 1)'
  const EASE_IN = 'cubic-bezier(.7, 0, .84, 0)'
  const EASE_SPRING = 'cubic-bezier(.34, 1.36, .5, 1)'
  const $ = (s, el = document) => el.querySelector(s)
  const $$ = (s, el = document) => [...el.querySelectorAll(s)]
  const pad = (n) => String(n).padStart(2, '0')

  /* ================= 数据 ================= */
  const PARTS = [
    { id: '01', name: '移动开发', count: 207, chapters: [
      { code: 'COMP', name: 'Android 组件', items: ['Activity', 'Activity的启动模式', 'Activity的生命周期详解', 'Service生命周期', '广播(BroadcastReceiver)', '内容提供器(ContentProvider)'] },
      { code: 'MECH', name: 'Android 机制', items: ['Handler', '事件分发机制', 'AIDL', '安卓进程通信的方法', 'Context'] },
      { code: 'COMPOSE', name: 'Jetpack Compose', items: ['Compose Gradle 配置', 'Compose布局系统与 Modifier', 'Jetpack Compose 状态管理详解'] },
      { code: 'KT', name: 'Kotlin', items: ['协程', 'Flow', 'Channel', '委托', '内联函数', 'reified', '逆变和协变'] },
    ] },
    { id: '02', name: '后端', count: 35, chapters: [
      { code: 'JAVA', name: 'Java 基础', items: ['Integer1000与100的比较', '动态代理', '反射', 'HashMap'] },
      { code: 'JUC', name: 'Java 并发', items: ['ThreadLocal', 'CAS', '线程池', 'ForkJoinPool', 'CompletableFuture', 'volatile和synchronize的区别'] },
      { code: 'JVM', name: 'JVM', items: ['JVM分区', '新建对象在JVM内存中分配的流程', 'GC算法', '三色标记算法', '双亲委派机制'] },
    ] },
    { id: '03', name: 'AI 与智能体', count: 72, chapters: [
      { code: 'AGENT', name: 'Agent', items: ['基础概念', '工作流设计', 'Chunking', 'RAG', 'MCP', 'Agent 安全'] },
      { code: 'ML', name: '机器学习', items: ['监督学习入门', 'K-means', 'Lasso回归', 'sigmoid函数'] },
    ] },
    { id: '04', name: '系统与底层', count: 11, chapters: [
      { code: 'CPP', name: 'C++', items: ['头文件的声明规范', '模板', 'C++标准库'] },
    ] },
    { id: '05', name: '算法', count: 5, chapters: [
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

  const FIGS = new Set(['CAS', '新建对象在JVM内存中分配的流程', '二分查找', 'Handler'])

  const hash = (s) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7)
  const ARTICLES = []
  PARTS.forEach((p) => p.chapters.forEach((c) => c.items.forEach((title, i) => {
    const h = hash(title)
    const num = `${p.id}.${c.code}.${pad(i + 1)}`
    const fallbackDate = `${2024 + (h % 2)}-${pad(1 + (h % 12))}-${pad(1 + (h % 27))}`
    ARTICLES.push({
      id: num, num, title,
      part: p, partName: p.name, chapName: c.name, index: i + 1, total: c.items.length,
      date: DATES[title] || fallbackDate,
      mins: 4 + (h % 9),
      fig: FIGS.has(title),
      summary: SUMMARY[title] || `「${c.name}」章节的第 ${i + 1} 篇笔记。演示数据，正文以站点为准。`,
    })
  })))
  const BY_ID = Object.fromEntries(ARTICLES.map((a) => [a.id, a]))
  const BY_TITLE = Object.fromEntries(ARTICLES.map((a) => [a.title, a]))
  const byDate = [...ARTICLES].sort((a, b) => b.date.localeCompare(a.date))

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

  /* ================= 里程表数字 ================= */
  function buildOdo(el) {
    const v = el.dataset.value
    el.textContent = ''
    el.setAttribute('aria-label', v)
    for (const ch of v) {
      if (!/\d/.test(ch)) { el.append(ch); continue }
      const d = document.createElement('span')
      d.className = 'odo-d'
      d.dataset.d = ch
      d.setAttribute('aria-hidden', 'true')
      const s = document.createElement('span')
      s.className = 'odo-s'
      for (let k = 0; k < 20; k++) {
        const n = document.createElement('span')
        n.textContent = k % 10
        s.append(n)
      }
      s.style.transform = `translateY(${-ch}em)`
      d.append(s)
      el.append(d)
    }
  }
  function rollOdo(el, delay = 0) {
    if (reduced) return
    $$('.odo-d', el).forEach((d, i, all) => {
      const s = d.firstChild
      const n = +d.dataset.d
      s.getAnimations().forEach((a) => a.cancel())
      s.animate(
        [{ transform: `translateY(${-n}em)` }, { transform: `translateY(${-(10 + n)}em)` }],
        { duration: 700 + (all.length - i) * 140, delay: delay + i * 40, easing: EASE_OUT, fill: 'forwards' },
      )
    })
  }

  /* ================= 网格与光标 ================= */
  function buildGrid() {
    for (const id of ['gridBase', 'gridGlow']) {
      const el = document.getElementById(id)
      for (let i = 0; i < 12; i++) {
        const c = document.createElement('i')
        c.style.setProperty('--i', i)
        el.append(c)
      }
    }
    if (!canHover) return
    let raf = 0
    addEventListener('pointermove', (e) => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        root.style.setProperty('--mx', `${e.clientX}px`)
        root.style.setProperty('--my', `${e.clientY}px`)
        root.classList.add('pointer-in')
      })
    }, { passive: true })
    document.addEventListener('pointerleave', () => root.classList.remove('pointer-in'))
  }

  /* ================= 刊头开场 ================= */
  const mhTitle = $('#mhTitle')
  function splitTitle() {
    const text = mhTitle.textContent
    mhTitle.textContent = ''
    ;[...text].forEach((ch) => {
      const s = document.createElement('span')
      s.className = 'ch'
      s.textContent = ch
      s.setAttribute('aria-hidden', 'true')
      mhTitle.append(s)
    })
  }
  function playIntro() {
    if (reduced) return
    root.classList.remove('intro')
    void root.offsetWidth
    root.classList.add('intro')
    $$('.ch', mhTitle).forEach((c, i) => {
      const dx = (((i * 7) % 5) - 2) * 16
      const dy = (((i * 3) % 3) - 1) * 12
      c.animate(
        [{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' }],
        { duration: 620, delay: 160 + i * 36, easing: EASE_OUT, fill: 'backwards' },
      )
    })
    $$('.masthead .odo').forEach((el, i) => rollOdo(el, 500 + i * 90))
    setTimeout(() => root.classList.remove('intro'), 2400)
    sessionStorage.setItem('ey-intro', '1')
  }

  /* ================= 翻牌预览 ================= */
  const flapStage = $('#flapStage')
  let flapKey = null
  function flap(key, html) {
    if (key === flapKey) return
    flapKey = key
    const old = $('.flap-card:not(.leaving)', flapStage)
    const card = document.createElement('div')
    card.className = 'flap-card'
    card.innerHTML = html
    flapStage.append(card)
    if (!old) return
    if (reduced) { old.remove(); return }
    old.classList.add('leaving')
    old.animate(
      [{ transform: 'none', opacity: 1 }, { transform: 'translateY(-36%) rotateX(72deg)', opacity: 0 }],
      { duration: 240, easing: EASE_IN, fill: 'forwards' },
    ).onfinish = () => old.remove()
    card.animate(
      [{ transform: 'translateY(36%) rotateX(-72deg)', opacity: 0 }, { transform: 'none', opacity: 1 }],
      { duration: 420, delay: 70, easing: EASE_OUT, fill: 'backwards' },
    )
  }
  const partCard = (p) => {
    const recent = byDate.filter((a) => a.part === p).slice(0, 3)
    return `<div class="fc-num">PART ${p.id}</div>
      <div class="fc-title">${p.name}</div>
      <p class="fc-sum">${p.chapters.map((c) => c.name).join(' / ')}</p>
      <div class="fc-meta mono"><span>${p.count} 篇</span><span>${p.chapters.length} 章</span></div>
      <ul>${recent.map((a) => `<li><span>${a.date}</span><span>${a.title}</span></li>`).join('')}</ul>`
  }
  const artCard = (a) => `<div class="fc-num">${a.num}</div>
      <div class="fc-title">${a.title}</div>
      <p class="fc-sum">${a.summary}</p>
      <div class="fc-meta mono"><span>${a.date}</span><span>${a.mins} MIN</span>${a.fig ? '<span style="color:var(--accent)">含交互图</span>' : ''}</div>`
  const introCard = () => `<div class="fc-num">START HERE</div>
      <div class="fc-title">推荐从交互图开始</div>
      <p class="fc-sum">带 FIG 标记的文章包含可以亲手操作的原理图。</p>
      <ul>${ARTICLES.filter((a) => a.fig).map((a) => `<li><span>${a.num}</span><span>${a.title}</span></li>`).join('')}</ul>`

  /* ================= 目录 ================= */
  const partsEl = $('#parts')
  const artLink = (a) => `<a href="#a/${a.id}" class="art-link${a.fig ? ' has-fig' : ''}" data-id="${a.id}"><span class="art-num">${a.num}</span><span class="art-title">${a.title}</span></a>`
  function renderParts() {
    partsEl.innerHTML = PARTS.map((p) => `
      <div class="part" data-part="${p.id}">
        <button class="part-row" aria-expanded="false">
          <span class="part-num">${p.id}</span>
          <span class="part-name">${p.name}</span>
          <span class="leader"></span>
          <span class="part-count odo" data-value="${p.count}"></span>
          <span class="part-toggle"></span>
        </button>
        <div class="part-body" inert>
          <div class="part-inner">
            <div class="chapters">
              ${p.chapters.map((c, ci) => `
                <div class="chap" style="--i:${ci}">
                  <div class="chap-head mono"><span>${c.name}</span><span>${pad(c.items.length)}</span></div>
                  <ul>${ARTICLES.filter((a) => a.part === p && a.chapName === c.name).map((a) => `<li>${artLink(a)}</li>`).join('')}</ul>
                </div>`).join('')}
            </div>
          </div>
        </div>
      </div>`).join('')

    partsEl.addEventListener('click', (e) => {
      const row = e.target.closest('.part-row')
      if (row) setPartOpen(row.parentElement, !row.parentElement.classList.contains('open'))
    })
    partsEl.addEventListener('pointerover', (e) => {
      const row = e.target.closest('.part-row')
      const link = e.target.closest('.art-link')
      if (row && !row.contains(e.relatedTarget)) onPartHover(row)
      if (link) flap(link.dataset.id, artCard(BY_ID[link.dataset.id]))
    })
    partsEl.addEventListener('focusin', (e) => {
      const row = e.target.closest('.part-row')
      const link = e.target.closest('.art-link')
      if (row) onPartHover(row)
      if (link) flap(link.dataset.id, artCard(BY_ID[link.dataset.id]))
    })
    partsEl.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return
      const items = $$('.part-row, .part.open .art-link', partsEl)
      const i = items.indexOf(document.activeElement)
      if (i < 0) return
      e.preventDefault()
      items[Math.max(0, Math.min(items.length - 1, i + (e.key === 'ArrowDown' ? 1 : -1)))].focus()
    })
  }
  function onPartHover(row) {
    const p = PARTS.find((x) => x.id === row.parentElement.dataset.part)
    rollOdo($('.part-count', row))
    flap(`part-${p.id}`, partCard(p))
  }
  function setPartOpen(part, open, instant = false) {
    if (instant) {
      part.querySelectorAll('.part-body, .chap').forEach((el) => { el.style.transition = 'none' })
      requestAnimationFrame(() => requestAnimationFrame(() => {
        part.querySelectorAll('.part-body, .chap').forEach((el) => { el.style.transition = '' })
      }))
    }
    part.classList.toggle('open', open)
    $('.part-row', part).setAttribute('aria-expanded', String(open))
    $('.part-body', part).inert = !open
  }

  /* ================= 图集 ================= */
  const MINI = {
    'CAS': `<div class="fig-stage m-cas"><div class="mem"><span>0</span><span>1</span><span>2</span></div><div class="th t1">T1</div><div class="th t2">T2</div></div>`,
    '新建对象在JVM内存中分配的流程': `<div class="fig-stage m-gen"><div class="zone"><b>EDEN</b></div><div class="zone"><b>S0</b></div><div class="zone"><b>S1</b></div><div class="zone"><b>OLD</b></div><div class="objs"><i class="obj"></i><i class="obj"></i><i class="obj"></i><i class="obj"></i></div></div>`,
    '二分查找': `<div class="fig-stage m-bin"><div class="bars">${Array.from({ length: 12 }, (_, k) => `<i class="${k === 7 ? 'hit' : ''}" style="height:${18 + k * 7}%"></i>`).join('')}</div><span class="ptr lo"></span><span class="ptr mid"></span><span class="ptr hi"></span></div>`,
    'Handler': `<div class="fig-stage m-loop"><div class="q"><i></i><i></i><i></i></div><div class="ring"></div><span class="lab" style="left:22px;top:70px">MESSAGEQUEUE</span><span class="lab" style="left:50%;top:26px;transform:translateX(-50%)">LOOPER</span></div>`,
  }
  const FIG_CAPTION = {
    'CAS': '两个线程竞争同一个变量',
    '新建对象在JVM内存中分配的流程': '对象在分代之间的流动与晋升',
    '二分查找': '指针收敛到目标元素',
    'Handler': 'Looper 不断从队列取出消息',
  }
  function renderGallery() {
    const track = $('#galleryTrack')
    track.innerHTML = ARTICLES.filter((a) => a.fig).map((a, i) => `
      <div class="fig-card" data-id="${a.id}" tabindex="0">
        ${MINI[a.title]}
        <div class="fig-cap">
          <span class="mono" data-vt="num">FIG ${pad(i + 1)} · ${a.num}</span>
          <h3 data-vt="title">${FIG_CAPTION[a.title]}</h3>
        </div>
      </div>`).join('')

    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => en.target.classList.toggle('running', en.isIntersecting))
    }, { threshold: 0.5 })
    $$('.fig-card', track).forEach((c) => io.observe(c))

    const g = $('#gallery')
    let down = false, startX = 0, startL = 0, moved = 0, lastX = 0, lastT = 0, vel = 0, raf = 0
    g.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'mouse') return
      down = true; moved = 0
      startX = lastX = e.clientX; startL = g.scrollLeft; lastT = performance.now(); vel = 0
      cancelAnimationFrame(raf)
      e.preventDefault()
    })
    addEventListener('pointermove', (e) => {
      if (!down) return
      const now = performance.now()
      g.scrollLeft = startL - (e.clientX - startX)
      moved = Math.max(moved, Math.abs(e.clientX - startX))
      vel = (e.clientX - lastX) / Math.max(1, now - lastT)
      lastX = e.clientX; lastT = now
      g.classList.toggle('dragging', moved > 4)
    })
    addEventListener('pointerup', () => {
      if (!down) return
      down = false
      g.classList.remove('dragging')
      let v = vel * 16
      const glide = () => {
        if (Math.abs(v) < 0.3) return
        g.scrollLeft -= v
        v *= 0.94
        raf = requestAnimationFrame(glide)
      }
      if (!reduced) glide()
    })
    g.addEventListener('click', (e) => {
      if (moved > 5) { e.stopPropagation(); e.preventDefault() }
    }, true)
  }

  /* ================= 更新日志与索引 ================= */
  function renderLog() {
    $('#log').innerHTML = byDate.slice(0, 8).map((a) => `
      <li class="log-row" tabindex="0" data-id="${a.id}">
        <span class="log-date">${a.date}</span>
        <span class="art-num">${a.num}</span>
        <span class="art-title">${a.title}</span>
        <span class="log-part">${a.partName} · ${a.chapName}</span>
        <span class="log-arrow">→</span>
      </li>`).join('')
  }
  function renderTerms() {
    const groups = {}
    TERMS.forEach(([g, term, title]) => { (groups[g] ||= []).push([term, BY_TITLE[title]]) })
    $('#terms').innerHTML = Object.entries(groups).map(([g, list]) => `
      <div class="term-group"><h4>${g}</h4>
        ${list.map(([term, a]) => `<a href="#a/${a.id}" class="u-link" data-id="${a.id}" data-peek>${term}</a>`).join('')}
      </div>`).join('')
  }

  /* ================= 文章页 ================= */
  const articleEl = $('#article')
  const viewIndex = $('#view-index')
  const viewArticle = $('#view-article')
  let view = 'index'
  let currentId = null
  let indexScroll = 0
  let lastIndexSrc = null

  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
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

  const ref = (title, text) => {
    const a = BY_TITLE[title]
    return `<a href="#a/${a.id}" class="ref" data-id="${a.id}" data-peek>${text || title}</a>`
  }

  function casBody() {
    return `
    <section class="a-sec" data-sec="1">
      <div class="row"><span class="sec-num">§1</span><h2 class="main">什么是 CAS</h2></div>
      <div class="row prose">
        <div class="main">
          <p><code>CAS</code>（Compare And Swap，比较并交换）是非阻塞同步的实现原理。它是 CPU 硬件提供的指令，从硬件层面保证“比较”与“交换”两个操作作为一个整体原子地完成。CAS 指令包含三个操作数：</p>
          <ol>
            <li><strong>内存位置 V</strong>：需要操作的内存位置，通常是一个共享变量。</li>
            <li><strong>预期值 E</strong>：期望该内存位置当前的值。</li>
            <li><strong>新值 N</strong>：如果内存位置的当前值与预期值相等，就把它更新为新值。</li>
          </ol>
          <p><strong>如果相等，就写入新值；如果不相等，说明已经有别的线程修改过这个位置，本次操作失败。</strong>失败的线程不会被挂起，可以自行决定重试还是放弃。</p>
        </div>
        <aside class="side"><div class="note"><span class="mono">NOTE · 硬件</span>在 x86 上，CAS 对应带 <code>lock</code> 前缀的 <code>cmpxchg</code> 指令；ARM 上则由 LDREX / STREX 这类指令对实现。</div></aside>
      </div>
    </section>

    <section class="a-sec" data-sec="2">
      <div class="row"><span class="sec-num">§2</span><h2 class="main">在 JDK 中的样子</h2></div>
      <div class="row prose">
        <div class="main">
          <p><code>AtomicInteger.incrementAndGet()</code> 最终调用 <code>Unsafe.getAndAddInt()</code>：先读取当前值，再用 CAS 尝试写入“当前值 + 1”，失败就回到循环开头。</p>
          <div class="code">
            <div class="code-head mono"><span>AtomicInteger.java · Unsafe.java</span><button class="copy-btn" data-copy>复制</button></div>
            <pre>${highlightJava(JAVA_SRC)}</pre>
          </div>
        </div>
        <aside class="side"><div class="note"><span class="mono">NOTE · 可见性</span>读取用的是 <code>getIntVolatile</code>，保证每次都能看到其他线程最新写入的值，原理见 ${ref('volatile和synchronize的区别', 'volatile')}。</div></aside>
      </div>
    </section>

    <section class="a-sec" data-sec="3">
      <div class="row"><span class="sec-num">§3</span><h2 class="main">动手看一遍</h2></div>
      <div class="row scrolly">
        <div class="scrolly-text">
          <div class="step" data-step="0"><span class="mono">01 · 准备</span><p>两个线程 T1、T2 同时对同一个 <code>AtomicInteger</code> 调用 <code>incrementAndGet()</code>，value 初始为 0。继续往下滚动，右侧的图会跟着推进；也可以用图下方的按钮单步执行。</p></div>
          <div class="step" data-step="2"><span class="mono">02 · 同时读取</span><p>两个线程几乎同时读取 value，各自拿到 expect = 0。没有任何锁，读取互不影响。</p></div>
          <div class="step" data-step="5"><span class="mono">03 · T1 抢先</span><p>T1 先执行 CAS：内存中的值等于它手里的 expect，都是 0，于是把 value 写成 1，返回成功。</p></div>
          <div class="step" data-step="6"><span class="mono">04 · T2 失败</span><p>T2 随后执行 CAS。它的 expect 还是 0，但内存已经变成 1，比较失败，写入被拒绝。T2 不会被挂起，而是回到循环开头重试。</p></div>
          <div class="step" data-step="9"><span class="mono">05 · 重试成功</span><p>T2 重新读取到 1，计算出 2，这一次 CAS 成功。</p></div>
          <div class="step" data-step="10"><span class="mono">06 · 结果</span><p>最终 value = 2，两次自增都没有丢失。整个过程没有线程被阻塞，代价是 T2 多执行了一轮循环。<br /><br />把鼠标移到图中的代码行上，相关的寄存器和内存会同时高亮，反过来也一样。</p></div>
        </div>
        <div class="scrolly-fig">${casFigure()}</div>
      </div>
    </section>

    <section class="a-sec" data-sec="4">
      <div class="row"><span class="sec-num">§4</span><h2 class="main">应用场景与代价</h2></div>
      <div class="row prose">
        <div class="main">
          <ul>
            <li><strong>乐观锁</strong>：<code>java.util.concurrent.atomic</code> 包中的 <code>AtomicInteger</code>、<code>AtomicReference</code> 等都基于 CAS 实现。</li>
            <li><strong>无锁数据结构</strong>：无锁队列、无锁栈用 CAS 保证线程安全，${ref('线程池')} 内部的状态位也用它更新。</li>
          </ul>
          <p><strong>优点</strong>：在不阻塞线程的情况下完成原子操作，避免了锁带来的上下文切换和死锁问题。</p>
          <p><strong>缺点</strong>：</p>
          <ul>
            <li><strong>ABA 问题</strong>：CAS 只比较当前值和预期值，无法知道这个值是否被改过又改回来。可以通过版本号或时间戳解决。</li>
            <li><strong>循环开销</strong>：竞争激烈时 CAS 反复失败，线程一直空转重试，性能反而下降。</li>
            <li><strong>只能保护一个变量</strong>：多个变量需要合并成一个对象，或者改用锁；需要线程隔离时可以考虑 ${ref('ThreadLocal')}。</li>
          </ul>
        </div>
        <aside class="side">
          <div class="note"><span class="mono">NOTE · ABA</span><code>AtomicStampedReference</code> 为值附带一个版本号，比较时同时比较值和版本。</div>
          <div class="note"><span class="mono">NOTE · 高竞争</span><code>LongAdder</code> 把一个计数拆到多个槽位上分散竞争，求和时再合并。</div>
        </aside>
      </div>
    </section>`
  }

  function renderArticle(a) {
    currentId = a.id
    const isCas = a.title === 'CAS'
    articleEl.innerHTML = `
      <header class="a-head row">
        <div class="main">
          <button class="a-back mono u-link" data-action="back">← 返回目录</button>
          <span class="a-num" style="view-transition-name: vt-num">${a.num}</span>
          <h1 class="a-title" style="view-transition-name: vt-title">${a.title}</h1>
          <div class="a-meta mono">
            <span>部分 <b>${a.part.id} ${a.partName}</b></span>
            <span>章节 <b>${a.chapName} ${pad(a.index)}/${pad(a.total)}</b></span>
            <span>${isCas ? '创建 <b>2025-01-15</b>' : ''} 更新 <b>${a.date}</b></span>
            <span>约 <b>${a.mins}</b> 分钟</span>
          </div>
        </div>
      </header>
      ${isCas ? casBody() : `
        <div class="row"><div class="main stub">
          <p>${a.summary}</p>
          <p>演示页只包含《CAS》的完整正文和交互图。</p>
          <button data-id="${BY_TITLE['CAS'].id}" class="mono u-link">打开 02.JUC.02 CAS →</button>
        </div></div>`}`
    document.title = `${a.num} ${a.title} · Endlessyoung`
    if (isCas) {
      mountCas($('#casFig'))
      mountScrolly()
    }
    setupRuler(isCas ? a.mins : 0)
  }

  function showView(v) {
    view = v
    viewIndex.hidden = v !== 'index'
    viewArticle.hidden = v !== 'article'
    if (v === 'index') {
      document.title = 'Endlessyoung · 技术参考手册（改版演示）'
      $('#ruler').classList.remove('show')
      stopScrolly()
    }
  }

  /* ================= 页面转场 ================= */
  function clearAllVT() {
    $$('[style*="view-transition-name"]').forEach((el) => { el.style.viewTransitionName = '' })
  }
  function tagVT(src) {
    if (!src || !src.querySelector) return
    const n = src.querySelector('.art-num, [data-vt="num"]')
    const t = src.querySelector('.art-title, [data-vt="title"]') || src
    if (n) n.style.viewTransitionName = 'vt-num'
    t.style.viewTransitionName = 'vt-title'
  }
  function transition(update) {
    if (!document.startViewTransition || reduced) { update(); return Promise.resolve() }
    return document.startViewTransition(update).finished.catch(() => {})
  }

  function openArticle(id, src, fromHistory = false) {
    const a = BY_ID[id]
    if (!a) return
    hidePeek(true)
    if (view === 'index') {
      indexScroll = scrollY
      lastIndexSrc = src && viewIndex.contains(src) ? src : null
    }
    clearAllVT()
    tagVT(src)
    if (!fromHistory) history.pushState({ id }, '', `#a/${id}`)
    transition(() => {
      closePalette(true)
      clearAllVT()
      renderArticle(a)
      showView('article')
      scrollTo(0, 0)
    })
  }

  function goHome(fromHistory = false, thenScrollTo = null) {
    if (view === 'index') {
      if (thenScrollTo) $(thenScrollTo)?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' })
      else scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' })
      return
    }
    if (!fromHistory) history.pushState({}, '', location.pathname)
    const id = currentId
    let target = null
    transition(() => {
      clearAllVT()
      showView('index')
      if (thenScrollTo) {
        $(thenScrollTo)?.scrollIntoView()
        return
      }
      if (lastIndexSrc && lastIndexSrc.dataset.id === id) {
        target = lastIndexSrc
        scrollTo(0, indexScroll)
      } else {
        const link = $(`.art-link[data-id="${id}"]`, partsEl)
        if (link) {
          setPartOpen(link.closest('.part'), true, true)
          target = link
          link.scrollIntoView({ block: 'center' })
        }
      }
      tagVT(target)
    }).then(() => clearAllVT())
  }

  addEventListener('popstate', (e) => {
    if (e.state && e.state.id) openArticle(e.state.id, null, true)
    else goHome(true)
  })

  /* ================= 页边刻度尺 ================= */
  const ruler = $('#ruler')
  const rulerTicks = $('#rulerTicks')
  const rulerCursor = $('#rulerCursor')
  const rulerReadout = $('#rulerReadout')
  let rulerData = null

  function setupRuler(mins) {
    const secs = $$('[data-sec]', articleEl)
    if (!secs.length) { rulerData = null; ruler.classList.remove('show'); return }
    rulerData = { mins, secs }
    requestAnimationFrame(() => {
      layoutRuler()
      ruler.classList.add('show')
    })
  }
  function layoutRuler() {
    if (!rulerData) return
    const top = articleEl.getBoundingClientRect().top + scrollY
    const total = Math.max(1, articleEl.offsetHeight - innerHeight)
    rulerData.top = top
    rulerData.total = total
    rulerData.pcts = rulerData.secs.map((s) => Math.min(1, Math.max(0, (s.getBoundingClientRect().top + scrollY - top - 120) / total)))
    rulerTicks.innerHTML = rulerData.pcts.map((p, i) => `<button class="ruler-tick" style="top:${p * 100}%" data-tick="${i}">§${i + 1}</button>`).join('')
    updateRuler()
  }
  function updateRuler() {
    if (!rulerData || view !== 'article') return
    const p = Math.min(1, Math.max(0, (scrollY - rulerData.top + 120) / rulerData.total))
    const h = rulerTicks.parentElement.clientHeight
    rulerCursor.style.transform = `translateY(${p * h}px)`
    let cur = 0
    rulerData.pcts.forEach((x, i) => { if (p >= x - 0.001) cur = i })
    $$('.ruler-tick', rulerTicks).forEach((t, i) => t.classList.toggle('passed', i <= cur))
    const left = Math.max(0, Math.ceil(rulerData.mins * (1 - p)))
    rulerReadout.innerHTML = `<b>§${cur + 1}</b>剩余 ${left} 分钟`
  }
  rulerTicks.addEventListener('click', (e) => {
    const t = e.target.closest('[data-tick]')
    if (!t) return
    const sec = rulerData.secs[+t.dataset.tick]
    scrollTo({ top: sec.getBoundingClientRect().top + scrollY - 80, behavior: reduced ? 'auto' : 'smooth' })
  })
  let rulerRaf = 0
  addEventListener('scroll', () => { cancelAnimationFrame(rulerRaf); rulerRaf = requestAnimationFrame(updateRuler) }, { passive: true })
  addEventListener('resize', () => layoutRuler())

  /* ================= CAS 交互图 ================= */
  const CODE = [
    'public final int incrementAndGet() {',
    '    int expect, update;',
    '    do {',
    '        expect = value.get();',
    '        update = expect + 1;',
    '    } while (!value.compareAndSet(expect, update));',
    '    return update;',
    '}',
  ]
  function casFigure() {
    const thread = (t) => `
      <div class="thread" data-t="${t}">
        <div class="thread-name"><span>${t.toUpperCase()}</span><span class="thread-status">就绪</span></div>
        <div class="reg" data-lines="4,6"><span>expect</span><b data-f="expect">—</b></div>
        <div class="reg" data-lines="5,6"><span>update</span><b data-f="update">—</b></div>
        <div class="reg" data-lines="6"><span>retry</span><b data-f="retry">0</b></div>
      </div>`
    return `
      <div class="fig" id="casFig">
        <div class="fig-head"><span class="mono fig-id">图 3 · 02.JUC.02</span><span class="mono fig-step">STEP <b class="fig-cur">00</b> / 10</span></div>
        <div class="cas-stage">
          ${thread('t1')}
          <div class="memory" data-lines="4,6"><span class="mono">value @0x7F3A</span><span class="mem-val">0</span><span class="mono">AtomicInteger</span></div>
          ${thread('t2')}
        </div>
        <div class="fig-code">${CODE.map((l, i) => `<div class="cl" data-line="${i + 1}"><span class="cl-no">${i + 1}</span><span class="cl-mark"></span><span>${esc(l)}</span></div>`).join('')}</div>
        <div class="fig-log"></div>
        <div class="fig-progress"><i></i></div>
        <div class="fig-ctrl">
          <button data-c="reset">⟲ 重置</button>
          <button data-c="prev">← 上一步</button>
          <button data-c="next" class="primary">单步 →</button>
          <button data-c="play">▶ 播放</button>
          <button data-c="speed" class="speed">1×</button>
        </div>
      </div>`
  }

  const CAS_STEPS = (() => {
    const idle = { line: 0, expect: '—', update: '—', retry: 0, status: '就绪', cls: '' }
    const raw = [
      { v: 0, log: '两个线程准备对同一个 <b>AtomicInteger</b> 执行自增，value 初始为 <b>0</b>。' },
      { actor: 't1', t1: { line: 4, expect: 0, status: '读取' }, fx: 'read', log: '<b>T1</b> 读取 value，得到 expect = 0。' },
      { actor: 't2', t2: { line: 4, expect: 0, status: '读取' }, fx: 'read', log: '<b>T2</b> 也读取 value，同样得到 expect = 0。' },
      { actor: 't1', t1: { line: 5, update: 1, status: '计算' }, log: '<b>T1</b> 计算 update = expect + 1 = 1。' },
      { actor: 't2', t2: { line: 5, update: 1, status: '计算' }, log: '<b>T2</b> 计算 update = expect + 1 = 1。' },
      { actor: 't1', v: 1, t1: { line: 6, status: 'CAS ✓', cls: 'ok' }, fx: 'write', log: '<b>T1</b> 执行 compareAndSet(0, 1)：内存值 0 等于 expect，<b>写入成功</b>，value 变为 1。' },
      { actor: 't2', t2: { line: 6, status: 'CAS ✗', cls: 'fail', retry: 1 }, fx: 'fail', log: '<b>T2</b> 执行 compareAndSet(0, 1)：内存值已经是 1，不等于 expect 0，<b>写入被拒绝</b>，回到循环开头。' },
      { actor: 't2', t2: { line: 4, expect: 1, update: '—', status: '重试读取', cls: '' }, fx: 'read', log: '<b>T2</b> 重新读取，expect = 1。' },
      { actor: 't2', t2: { line: 5, update: 2, status: '计算' }, log: '<b>T2</b> 计算 update = 2。' },
      { actor: 't2', v: 2, t2: { line: 6, status: 'CAS ✓', cls: 'ok' }, fx: 'write', log: '<b>T2</b> 执行 compareAndSet(1, 2)，<b>写入成功</b>，value 变为 2。' },
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
      if (!r.t1 && prev.t1.cls) s.t1.cls = prev.t1.cls
      prev = s
      return s
    })
  })()

  let cas = null
  function mountCas(fig) {
    const stage = $('.cas-stage', fig)
    const mem = $('.memory', fig)
    const memVal = $('.mem-val', fig)
    const lines = $$('.cl', fig)
    const curEl = $('.fig-cur', fig)
    const logEl = $('.fig-log', fig)
    const bar = $('.fig-progress i', fig)
    const playBtn = $('[data-c="play"]', fig)
    const speedBtn = $('[data-c="speed"]', fig)
    const threads = { t1: $('[data-t="t1"]', fig), t2: $('[data-t="t2"]', fig) }
    const last = CAS_STEPS.length - 1
    const speeds = [1, 2, 0.5]
    let speedIdx = 0
    let cur = 0
    let pending = null
    let timer = 0
    let playing = false

    const speed = () => speeds[speedIdx]

    function renderCode(s) {
      lines.forEach((l) => {
        const n = +l.dataset.line
        const mark = $('.cl-mark', l)
        mark.innerHTML = `${s.t1.line === n ? '<i>T1</i>' : ''}${s.t2.line === n ? '<i class="t2">T2</i>' : ''}`
        l.classList.toggle('now', !!s.actor && s[s.actor].line === n)
      })
      curEl.textContent = pad(cur)
      logEl.innerHTML = s.log
      bar.style.transform = `scaleX(${cur / last})`
    }
    function renderStage(s) {
      memVal.textContent = s.v
      for (const t of ['t1', 't2']) {
        const el = threads[t]
        const st = s[t]
        el.classList.toggle('active', s.actor === t)
        el.classList.toggle('ok', st.cls === 'ok')
        el.classList.toggle('fail', st.cls === 'fail')
        $('.thread-status', el).textContent = st.status
        $('[data-f="expect"]', el).textContent = st.expect
        $('[data-f="update"]', el).textContent = st.update
        $('[data-f="retry"]', el).textContent = st.retry
      }
    }
    function centerOf(el) {
      const r = el.getBoundingClientRect()
      const sr = stage.getBoundingClientRect()
      return { x: r.left - sr.left + r.width / 2, y: r.top - sr.top + r.height / 2 }
    }
    function flyToken(s, prevS) {
      const th = threads[s.actor]
      const memC = centerOf(memVal)
      const token = document.createElement('span')
      token.className = 'token'
      stage.append(token)
      const tw = () => token.offsetWidth / 2
      const th2 = () => token.offsetHeight / 2
      const dur = 560 / speed()
      let anim
      if (s.fx === 'read') {
        token.textContent = String(s.v)
        const to = centerOf($('[data-f="expect"]', th))
        anim = token.animate([
          { transform: `translate(${memC.x - tw()}px, ${memC.y - th2()}px) scale(.6)`, opacity: 0 },
          { transform: `translate(${memC.x - tw()}px, ${memC.y - th2()}px) scale(1)`, opacity: 1, offset: 0.15 },
          { transform: `translate(${to.x - tw()}px, ${to.y - th2()}px)`, opacity: 1 },
        ], { duration: dur, easing: EASE_OUT })
      } else {
        const from = centerOf($('[data-f="update"]', th))
        token.textContent = String(s[s.actor].update)
        const frames = [
          { transform: `translate(${from.x - tw()}px, ${from.y - th2()}px) scale(.6)`, opacity: 0 },
          { transform: `translate(${from.x - tw()}px, ${from.y - th2()}px) scale(1)`, opacity: 1, offset: 0.12 },
          { transform: `translate(${memC.x - tw()}px, ${memC.y - th2()}px)`, opacity: 1, offset: s.fx === 'fail' ? 0.55 : 1 },
        ]
        if (s.fx === 'fail') frames.push({ transform: `translate(${from.x - tw()}px, ${from.y - th2()}px) scale(.8)`, opacity: 0 })
        anim = token.animate(frames, { duration: s.fx === 'fail' ? dur * 1.5 : dur, easing: EASE_OUT })
        if (s.fx === 'fail') setTimeout(() => restartClass(mem, 'shake'), dur * 0.8)
      }
      // 读取时线程的旧值先保持，飞抵后再更新
      renderStage({ ...s, v: prevS.v, [s.actor]: { ...s[s.actor], expect: s.fx === 'read' ? prevS[s.actor].expect : s[s.actor].expect } })
      threads[s.actor].classList.add('active')
      pending = {
        anim,
        done: () => {
          token.remove()
          renderStage(s)
          if (s.fx === 'write') restartClass(mem, 'flash')
          pending = null
        },
      }
      anim.onfinish = () => pending && pending.done()
    }
    function restartClass(el, cls) {
      el.classList.remove(cls)
      void el.offsetWidth
      el.classList.add(cls)
    }
    function go(n, animate) {
      if (pending) { pending.anim.cancel(); pending.done() }
      const prevS = CAS_STEPS[cur]
      cur = Math.max(0, Math.min(last, n))
      const s = CAS_STEPS[cur]
      renderCode(s)
      if (animate && s.fx && !reduced) flyToken(s, prevS)
      else renderStage(s)
    }
    function stop() {
      playing = false
      clearTimeout(timer)
      playBtn.textContent = '▶ 播放'
    }
    function play() {
      if (cur >= last) go(0, false)
      playing = true
      playBtn.textContent = '❚❚ 暂停'
      const tick = () => {
        if (!playing) return
        if (cur >= last) { stop(); return }
        go(cur + 1, true)
        timer = setTimeout(tick, 1150 / speed())
      }
      timer = setTimeout(tick, 200)
    }
    function runTo(target) {
      stop()
      if (target <= cur || target - cur > 5) { go(target, false); return }
      const tick = () => {
        if (cur >= target) return
        go(cur + 1, true)
        timer = setTimeout(tick, 480)
      }
      tick()
    }

    fig.addEventListener('click', (e) => {
      const b = e.target.closest('[data-c]')
      if (!b) return
      const c = b.dataset.c
      if (c === 'next') { stop(); go(cur + 1, true) }
      if (c === 'prev') { stop(); go(cur - 1, false) }
      if (c === 'reset') { stop(); go(0, false) }
      if (c === 'play') playing ? stop() : play()
      if (c === 'speed') { speedIdx = (speedIdx + 1) % speeds.length; b.textContent = `${speed()}×` }
    })

    // 代码行与图元素双向高亮
    const clearRel = () => $$('.rel', fig).forEach((el) => el.classList.remove('rel'))
    fig.addEventListener('pointerover', (e) => {
      const line = e.target.closest('.cl')
      const part = e.target.closest('[data-lines]')
      clearRel()
      if (line) {
        const n = line.dataset.line
        $$('[data-lines]', fig).forEach((el) => {
          if (el.dataset.lines.split(',').includes(n)) el.classList.add('rel')
        })
        line.classList.add('rel')
      } else if (part) {
        part.classList.add('rel')
        part.dataset.lines.split(',').forEach((n) => $(`.cl[data-line="${n}"]`, fig)?.classList.add('rel'))
      }
    })
    fig.addEventListener('pointerleave', clearRel)

    speedBtn.textContent = '1×'
    go(0, false)
    cas = { runTo, stop, get cur() { return cur } }
  }

  /* ================= 滚动叙事 ================= */
  let scrollyIO = null
  function mountScrolly() {
    stopScrolly()
    const steps = $$('.step', articleEl)
    scrollyIO = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return
        steps.forEach((s) => s.classList.toggle('active', s === en.target))
        cas && cas.runTo(+en.target.dataset.step)
      })
    }, { rootMargin: '-42% 0px -52% 0px' })
    steps.forEach((s) => scrollyIO.observe(s))
  }
  function stopScrolly() {
    scrollyIO?.disconnect()
    scrollyIO = null
    cas?.stop()
  }

  /* ================= 复制：解码效果 ================= */
  const GLYPHS = '▓▒░<>/{}#01ABCDEF*+'
  function decode(el, text, duration = 420) {
    if (reduced) { el.textContent = text; return }
    const start = performance.now()
    const frame = (now) => {
      const t = Math.min(1, (now - start) / duration)
      const shown = Math.floor(t * text.length)
      let out = text.slice(0, shown)
      for (let i = shown; i < text.length; i++) out += GLYPHS[(Math.random() * GLYPHS.length) | 0]
      el.textContent = out
      if (t < 1) requestAnimationFrame(frame)
    }
    requestAnimationFrame(frame)
  }
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-copy]')
    if (!b) return
    navigator.clipboard?.writeText(JAVA_SRC).catch(() => {})
    b.classList.add('done')
    decode(b, '已复制 ✓')
    clearTimeout(b._t)
    b._t = setTimeout(() => { b.classList.remove('done'); decode(b, '复制') }, 1800)
  })

  /* ================= 链接预览 ================= */
  const peek = $('#peek')
  let peekTimer = 0, hideTimer = 0, peekFor = null
  function showPeek(el) {
    const a = BY_ID[el.dataset.id]
    if (!a) return
    peekFor = el
    peek.innerHTML = `<span class="mono">${a.num}</span><h5>${a.title}</h5><p>${a.summary}</p>
      <div class="peek-foot mono"><span>${a.partName} · ${a.chapName}</span><span>${a.mins} MIN${a.fig ? ' · FIG' : ''}</span></div>`
    peek.hidden = false
    const r = el.getBoundingClientRect()
    const w = peek.offsetWidth, h = peek.offsetHeight
    const left = Math.min(Math.max(12, r.left + r.width / 2 - w / 2), innerWidth - w - 12)
    const below = r.bottom + 12 + h < innerHeight
    const top = below ? r.bottom + 10 : r.top - h - 10
    peek.style.left = `${left}px`
    peek.style.top = `${top}px`
    peek.style.transformOrigin = `${r.left + r.width / 2 - left}px ${below ? 'top' : 'bottom'}`
    if (!reduced) {
      peek.animate(
        [{ opacity: 0, transform: `translateY(${below ? -6 : 6}px) scale(.94)` }, { opacity: 1, transform: 'none' }],
        { duration: 300, easing: EASE_SPRING },
      )
    }
  }
  function hidePeek(instant = false) {
    clearTimeout(peekTimer)
    if (peek.hidden) return
    peekFor = null
    if (instant || reduced) { peek.hidden = true; return }
    peek.animate([{ opacity: 1 }, { opacity: 0, transform: 'translateY(-4px)' }], { duration: 120, easing: EASE_IN })
      .onfinish = () => { if (!peekFor) peek.hidden = true }
  }
  if (canHover) {
    document.addEventListener('pointerover', (e) => {
      const el = e.target.closest('[data-peek]')
      if (el) {
        clearTimeout(hideTimer)
        if (el === peekFor) return
        clearTimeout(peekTimer)
        peekTimer = setTimeout(() => showPeek(el), 280)
      } else if (e.target.closest('#peek')) {
        clearTimeout(hideTimer)
      }
    })
    document.addEventListener('pointerout', (e) => {
      const el = e.target.closest('[data-peek], #peek')
      if (!el || (e.relatedTarget && el.contains(e.relatedTarget))) return
      clearTimeout(peekTimer)
      hideTimer = setTimeout(() => hidePeek(), 160)
    })
  }

  /* ================= Ctrl K 索引台 ================= */
  const palette = $('#palette')
  const pInput = $('#paletteInput')
  const pList = $('#paletteList')
  const pPreview = $('#palettePreview')
  const pCount = $('#paletteCount')
  const nodeCache = new Map()
  let results = []
  let active = 0
  let query = ''

  function openPalette() {
    if (!palette.hidden) return
    palette.hidden = false
    root.classList.add('palette-open')
    pInput.value = ''
    query = ''
    pList.textContent = ''
    filter()
    pInput.focus()
    if (!reduced) {
      $('.palette-panel', palette).animate([
        { opacity: 0, transform: 'translateY(-10px) scale(.98)', clipPath: 'inset(0 0 100% 0)' },
        { opacity: 1, transform: 'none', clipPath: 'inset(0 0 0% 0)' },
      ], { duration: 360, easing: EASE_OUT })
      $('.palette-backdrop', palette).animate([{ opacity: 0 }, { opacity: 1 }], { duration: 240 })
    }
  }
  function closePalette(instant = false) {
    if (palette.hidden) return
    root.classList.remove('palette-open')
    if (instant || reduced) { palette.hidden = true; return }
    $('.palette-panel', palette).animate([
      { opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(-6px) scale(.985)' },
    ], { duration: 160, easing: EASE_IN }).onfinish = () => { palette.hidden = true }
  }
  function hl(text, q) {
    const t = esc(text)
    if (!q) return t
    const i = text.toLowerCase().indexOf(q)
    if (i < 0) return t
    return `${esc(text.slice(0, i))}<mark>${esc(text.slice(i, i + q.length))}</mark>${esc(text.slice(i + q.length))}`
  }
  function search(q) {
    if (!q) return byDate.slice(0, 10)
    return ARTICLES.map((a) => {
      const t = a.title.toLowerCase(), n = a.num.toLowerCase()
      let s = 0
      if (n.startsWith(q) || t.startsWith(q)) s = 3
      else if (t.includes(q) || n.includes(q)) s = 2
      else if ((a.partName + a.chapName).toLowerCase().includes(q)) s = 1
      return [s, a]
    }).filter(([s]) => s > 0)
      .sort((x, y) => y[0] - x[0] || y[1].date.localeCompare(x[1].date))
      .slice(0, 12).map(([, a]) => a)
  }
  function itemNode(a) {
    let li = nodeCache.get(a.id)
    if (!li) {
      li = document.createElement('li')
      li.className = 'p-item'
      li.dataset.pid = a.id
      li.innerHTML = '<span class="art-num"></span><span class="art-title"></span><span class="p-part"></span>'
      nodeCache.set(a.id, li)
    }
    $('.art-num', li).innerHTML = hl(a.num, query)
    $('.art-title', li).innerHTML = hl(a.title, query)
    $('.p-part', li).textContent = a.chapName
    return li
  }
  function filter() {
    query = pInput.value.trim().toLowerCase()
    results = search(query)
    const first = new Map($$('.p-item', pList).map((li) => [li.dataset.pid, li.getBoundingClientRect().top]))
    const nodes = results.map(itemNode)
    if (nodes.length) pList.replaceChildren(...nodes)
    else pList.innerHTML = '<li class="p-empty">没有匹配的条目</li>'
    if (!reduced) {
      nodes.forEach((li, i) => {
        const f = first.get(li.dataset.pid)
        const l = li.getBoundingClientRect().top
        if (f != null) {
          if (Math.abs(f - l) > 0.5) li.animate([{ transform: `translateY(${f - l}px)` }, { transform: 'none' }], { duration: 280, easing: EASE_OUT })
        } else {
          li.animate([{ opacity: 0, transform: 'translateX(-10px)' }, { opacity: 1, transform: 'none' }], { duration: 240, delay: i * 18, easing: EASE_OUT, fill: 'backwards' })
        }
      })
    }
    pCount.textContent = query ? `${results.length} 条结果` : '最近更新'
    setActive(0)
  }
  function setActive(i) {
    active = Math.max(0, Math.min(results.length - 1, i))
    $$('.p-item', pList).forEach((li, k) => li.classList.toggle('active', k === active))
    const a = results[active]
    const li = $$('.p-item', pList)[active]
    li?.scrollIntoView({ block: 'nearest' })
    if (!a) { pPreview.innerHTML = ''; return }
    pPreview.innerHTML = `<span class="mono">${a.num}</span><h3>${a.title}</h3><p>${a.summary}</p>
      <dl><dt>PART</dt><dd>${a.part.id} ${a.partName}</dd><dt>CHAPTER</dt><dd>${a.chapName}</dd><dt>UPDATED</dt><dd>${a.date}</dd><dt>READ</dt><dd>${a.mins} 分钟${a.fig ? ' · 含交互图' : ''}</dd></dl>`
    if (!reduced) pPreview.firstElementChild.parentElement.animate([{ opacity: 0.2, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: 220, easing: EASE_OUT })
  }
  pInput.addEventListener('input', filter)
  pInput.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive(active + 1) }
    if (e.key === 'ArrowUp') { e.preventDefault(); setActive(active - 1) }
    if (e.key === 'Enter' && results[active]) {
      e.preventDefault()
      openArticle(results[active].id, $$('.p-item', pList)[active])
    }
  })
  pList.addEventListener('pointermove', (e) => {
    const li = e.target.closest('.p-item')
    if (!li) return
    const i = $$('.p-item', pList).indexOf(li)
    if (i !== active) setActive(i)
  })
  pList.addEventListener('click', (e) => {
    const li = e.target.closest('.p-item')
    if (li) openArticle(li.dataset.pid, li)
  })

  /* ================= 明暗翻板 ================= */
  function toggleTheme() {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark'
    if (reduced) { root.dataset.theme = next; return }
    const bg = next === 'dark' ? '#111214' : '#fafaf8'
    const ov = document.createElement('div')
    ov.className = 'flip'
    for (let i = 0; i < 12; i++) {
      const c = document.createElement('i')
      c.style.background = bg
      ov.append(c)
    }
    document.body.append(ov)
    const anims = [...ov.children].map((c, k) => c.animate(
      [{ transform: 'rotateY(-92deg)' }, { transform: 'none' }],
      { duration: 360, delay: k * 30, easing: EASE_OUT, fill: 'backwards' },
    ))
    Promise.all(anims.map((a) => a.finished)).then(() => {
      root.dataset.theme = next
      return ov.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 260, easing: 'ease-out', fill: 'forwards' }).finished
    }).then(() => ov.remove())
  }

  /* ================= 全局事件 ================= */
  document.addEventListener('click', (e) => {
    const act = e.target.closest('[data-action]')
    if (act) {
      const a = act.dataset.action
      if (a === 'home') goHome()
      if (a === 'back') goHome()
      if (a === 'palette') openPalette()
      if (a === 'palette-close') closePalette()
      if (a === 'theme') toggleTheme()
      if (a === 'accent') root.dataset.accent = root.dataset.accent === 'orange' ? 'blue' : 'orange'
      if (a === 'replay') { goHome(); scrollTo(0, 0); playIntro() }
      return
    }
    const nav = e.target.closest('.topnav a')
    if (nav) {
      e.preventDefault()
      goHome(false, nav.getAttribute('href'))
      return
    }
    const link = e.target.closest('[data-id]')
    if (link && !link.closest('#palette')) {
      e.preventDefault()
      openArticle(link.dataset.id, link)
    }
  })
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault()
      palette.hidden ? openPalette() : closePalette()
      return
    }
    if (e.key === 'Escape' && !palette.hidden) { closePalette(); return }
    if (e.key === '/' && palette.hidden && !/input|textarea/i.test(document.activeElement.tagName)) {
      e.preventDefault()
      openPalette()
      return
    }
    if (e.key === 'Enter') {
      const row = document.activeElement.closest?.('.log-row, .fig-card')
      if (row) openArticle(row.dataset.id, row)
    }
  })

  /* ================= 初始化 ================= */
  buildGrid()
  splitTitle()
  $('#chapCount').dataset.value = pad(PARTS.reduce((n, p) => n + p.chapters.length, 0))
  renderParts()
  renderGallery()
  renderLog()
  renderTerms()
  $$('.odo').forEach(buildOdo)
  flap('intro', introCard())

  const m = location.hash.match(/^#a\/(.+)$/)
  if (m && BY_ID[decodeURIComponent(m[1])]) {
    const id = decodeURIComponent(m[1])
    history.replaceState({ id }, '', location.hash)
    renderArticle(BY_ID[id])
    showView('article')
  } else if (!sessionStorage.getItem('ey-intro')) {
    playIntro()
  }
})()
