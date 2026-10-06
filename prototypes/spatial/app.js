(() => {
  'use strict'

  const EY = window.EY
  const { PARTS, ARTICLES, BY_ID, BY_TITLE, BY_DATE, TERMS, CAS_ARTICLE, JAVA_SRC, CAS_CODE, CAS_LINKS, CAS_STEPS, esc, pad } = EY
  const root = document.documentElement
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
  const canHover = matchMedia('(hover: hover)').matches
  const INTRO_KEY = 'ey-intro-spatial'
  const CAS = BY_TITLE['CAS']
  const $ = (s, el = document) => el.querySelector(s)
  const $$ = (s, el = document) => [...el.querySelectorAll(s)]
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v))
  const raf2 = (fn) => requestAnimationFrame(() => requestAnimationFrame(fn))
  const cssVar = (name) => getComputedStyle(root).getPropertyValue(name).trim()

  /* ================= 弹簧求解器 ================= */
  const PRESETS = {
    snappy: { stiffness: 420, damping: 32, mass: 1 },
    gentle: { stiffness: 150, damping: 21, mass: 1 },
    bouncy: { stiffness: 300, damping: 15, mass: 1 },
  }
  function simulate({ stiffness, damping, mass }) {
    const dt = 1 / 240
    let x = 0, v = 0, t = 0, still = 0
    const out = [0]
    while (t < 4) {
      const a = (-stiffness * (x - 1) - damping * v) / mass
      v += a * dt
      x += v * dt
      t += dt
      out.push(x)
      if (Math.abs(1 - x) < 0.001 && Math.abs(v) < 0.02) { if (++still > 10) break } else still = 0
    }
    out[out.length - 1] = 1
    return { samples: out, duration: t * 1000 }
  }
  function resample(src, n) {
    const res = []
    for (let i = 0; i < n; i++) {
      const f = (i / (n - 1)) * (src.length - 1)
      const lo = Math.floor(f), hi = Math.min(src.length - 1, lo + 1)
      res.push(src[lo] + (src[hi] - src[lo]) * (f - lo))
    }
    return res
  }
  const linearOK = CSS.supports('animation-timing-function', 'linear(0, 1)')
  const FALLBACK = { snappy: 'cubic-bezier(.3, 1.25, .4, 1)', gentle: 'cubic-bezier(.22, 1.12, .36, 1)', bouncy: 'cubic-bezier(.34, 1.6, .45, 1)' }
  const SPRING = {}
  for (const [k, p] of Object.entries(PRESETS)) {
    const { samples, duration } = simulate(p)
    const curve = resample(samples, clamp(Math.round(duration / 12), 24, 90))
    SPRING[k] = {
      duration: Math.round(duration),
      curve,
      easing: linearOK ? `linear(${curve.map((v) => +v.toFixed(4)).join(', ')})` : FALLBACK[k],
    }
    root.style.setProperty(`--spring-${k}`, SPRING[k].easing)
    root.style.setProperty(`--spring-${k}-dur`, `${SPRING[k].duration}ms`)
  }

  function spring(el, frames, preset = 'gentle', { speed = 1, ...opts } = {}) {
    const s = SPRING[preset]
    return el.animate(frames, { duration: reduced ? 1 : s.duration / speed, easing: s.easing, fill: 'backwards', ...opts })
  }
  /* 位移走弹簧，透明度和模糊走短促的缓出，避免回弹时出现负模糊 */
  function appear(el, { from = 'translateY(16px) scale(.96)', preset = 'gentle', delay = 0, blur = 8, fade = 340, speed = 1 } = {}) {
    if (reduced) return
    spring(el, [{ transform: from }, { transform: 'none' }], preset, { delay, speed })
    el.animate([{ opacity: 0, filter: `blur(${blur}px)` }, { opacity: 1, filter: 'blur(0px)' }], { duration: fade / speed, delay, easing: 'cubic-bezier(.2, .8, .2, 1)', fill: 'backwards' })
  }

  /* 连续弹簧：可中途改目标并保留速度，用于跟随、拖拽停靠和滚动 */
  const live = new Set()
  let loopRaf = 0, lastT = 0
  class Spring {
    constructor(value, preset, onUpdate, eps = 0.01) {
      this.x = this.target = value
      this.v = 0
      this.p = PRESETS[preset]
      this.onUpdate = onUpdate
      this.eps = eps
    }
    to(target, velocity) {
      this.target = target
      if (velocity != null) this.v = velocity
      if (reduced) { this.set(target); return }
      live.add(this)
      if (!loopRaf) { lastT = performance.now(); loopRaf = requestAnimationFrame(tick) }
    }
    set(value) {
      this.x = this.target = value
      this.v = 0
      live.delete(this)
      this.onUpdate(value)
    }
    stop() { live.delete(this) }
    step(dt) {
      const { stiffness: k, damping: c, mass: m } = this.p
      const n = Math.ceil(dt * 240), h = dt / n
      for (let i = 0; i < n; i++) {
        this.v += ((-k * (this.x - this.target) - c * this.v) / m) * h
        this.x += this.v * h
      }
      const done = Math.abs(this.x - this.target) < this.eps && Math.abs(this.v) < this.eps * 10
      if (done) { this.x = this.target; this.v = 0 }
      this.onUpdate(this.x)
      return done
    }
  }
  function tick(now) {
    const dt = Math.min(0.05, (now - lastT) / 1000)
    lastT = now
    for (const s of live) if (s.step(dt)) live.delete(s)
    loopRaf = live.size ? requestAnimationFrame(tick) : 0
  }

  /* 弹簧滚动 */
  const scrollSpring = new Spring(0, 'gentle', (y) => window.scrollTo(0, y), 0.5)
  function scrollToY(y) {
    y = clamp(y, 0, root.scrollHeight - innerHeight)
    if (reduced) { scrollTo(0, y); return }
    scrollSpring.x = scrollY
    scrollSpring.v = 0
    scrollSpring.to(y)
  }
  const topOffset = () => (innerWidth < 900 ? 84 : 98)
  const scrollToEl = (el) => el && scrollToY(el.getBoundingClientRect().top + scrollY - topOffset())
  ;['wheel', 'touchstart', 'keydown', 'pointerdown'].forEach((ev) => addEventListener(ev, () => scrollSpring.stop(), { passive: true }))

  /* ================= 镜面高光与倾斜 ================= */
  const tilts = new WeakMap()
  function tiltOf(el) {
    let t = tilts.get(el)
    if (t) return t
    const apply = () => {
      const rx = t.rx.x, ry = t.ry.x, l = t.l.x
      el.style.transform = Math.abs(rx) + Math.abs(ry) + Math.abs(l) < 0.001 ? '' : `perspective(1100px) rotateX(${rx.toFixed(3)}deg) rotateY(${ry.toFixed(3)}deg) translateY(${(-l * 4).toFixed(2)}px)`
      el.style.setProperty('--lift', l.toFixed(3))
    }
    t = { rx: new Spring(0, 'snappy', apply, 0.005), ry: new Spring(0, 'snappy', apply, 0.005), l: new Spring(0, 'gentle', apply, 0.002) }
    tilts.set(el, t)
    return t
  }
  let tiltEl = null
  function tiltLeave() {
    if (!tiltEl) return
    const t = tiltOf(tiltEl)
    t.rx.to(0); t.ry.to(0); t.l.to(0)
    tiltEl = null
  }
  if (canHover) {
    let pr = 0, pe = null
    document.addEventListener('pointermove', (e) => {
      pe = e
      if (pr) return
      pr = requestAnimationFrame(() => {
        pr = 0
        const target = pe.target instanceof Element ? pe.target : null
        const spec = target && target.closest('[data-spec]')
        if (spec) {
          const r = spec.getBoundingClientRect()
          spec.style.setProperty('--px', `${pe.clientX - r.left}px`)
          spec.style.setProperty('--py', `${pe.clientY - r.top}px`)
        }
        if (reduced) return
        const el = target && !gallery.classList.contains('dragging') ? target.closest('[data-tilt]') : null
        if (el !== tiltEl) tiltLeave()
        if (!el) return
        tiltEl = el
        const r = el.getBoundingClientRect()
        const nx = ((pe.clientX - r.left) / r.width) * 2 - 1
        const ny = ((pe.clientY - r.top) / r.height) * 2 - 1
        const max = (+el.dataset.tilt || 3) * (el.classList.contains('open') ? 0.15 : 1)
        const t = tiltOf(el)
        t.ry.to(nx * max)
        t.rx.to(-ny * max)
        t.l.to(1)
      })
    }, { passive: true })
    document.addEventListener('pointerleave', tiltLeave)
  }

  /* ================= 首页英雄区 ================= */
  const heroTitle = $('#heroTitle')
  function splitHero() {
    const words = heroTitle.textContent.trim().split(/\s+/)
    heroTitle.innerHTML = words.map((w, i) => `<span class="w w${i + 1}" aria-hidden="true">${[...w].map((c) => `<span class="ch">${c}</span>`).join('')}</span>`).join('')
  }
  function renderHero() {
    $('#lastUpdate').textContent = EY.LAST_UPDATE
    $('#statArticles').dataset.count = EY.TOTAL_ARTICLES
    $('#statParts').dataset.count = PARTS.length
    $('#statChapters').dataset.count = EY.TOTAL_CHAPTERS
    const latest = BY_DATE[0]
    const l2 = $('#heroLatest')
    l2.href = `#a/${latest.id}`
    l2.dataset.id = latest.id
    l2.innerHTML = `<span class="layer-label">最近更新</span>
      <span class="latest-num" data-vt="num">${latest.num}</span>
      <span class="latest-title" data-vt="title">${esc(latest.title)}</span>
      <span class="latest-date">${latest.date} · ${latest.chapName}</span>`
    const l1 = $('#heroFeature')
    l1.href = `#a/${CAS.id}`
    l1.dataset.id = CAS.id
    l1.innerHTML = `${MINI.cas()}
      <div class="feat-cap"><span class="feat-title"><b data-vt="title">CAS</b> · ${CAS.fig.caption}</span><span class="feat-num" data-vt="num">${CAS.num}</span></div>`
  }
  function setCounts(animate, delay = 0) {
    $$('[data-count]').forEach((el, i) => {
      const target = +el.dataset.count
      if (!animate || reduced) { el.textContent = target; return }
      el.textContent = '0'
      const s = new Spring(0, 'gentle', (v) => { el.textContent = Math.round(Math.min(v, target)) }, 0.5)
      setTimeout(() => s.to(target), delay + i * 90)
    })
  }

  const heroStack = $('#heroStack')
  const layers = $$('.layer', heroStack)
  const applyParallax = () => layers.forEach((l) => {
    const f = (4 - +l.dataset.depth) * 7
    l.style.translate = `${(par.x.x * f).toFixed(2)}px ${(par.y.x * f).toFixed(2)}px`
  })
  const par = { x: new Spring(0, 'gentle', () => applyParallax(), 0.001), y: new Spring(0, 'gentle', () => applyParallax(), 0.001) }
  if (canHover && !reduced) {
    const hero = $('#hero')
    hero.addEventListener('pointermove', (e) => {
      par.x.to((e.clientX / innerWidth - 0.5) * 2)
      par.y.to((e.clientY / innerHeight - 0.5) * 2)
    })
    hero.addEventListener('pointerleave', () => { par.x.to(0); par.y.to(0) })
  }

  function playIntro() {
    sessionStorage.setItem(INTRO_KEY, '1')
    setCounts(true, 520)
    if (reduced) return
    spring($('.topbar'), [{ transform: 'translateY(-26px) scale(.94)' }, { transform: 'none' }], 'bouncy')
    $('.topbar').animate([{ opacity: 0 }, { opacity: 1 }], { duration: 260, easing: 'ease-out' })
    const rises = $$('#hero [data-rise]')
    appear(rises[0], { from: 'translateY(14px) scale(.92)', delay: 0 })
    $$('.ch', heroTitle).forEach((c, i) => appear(c, { from: 'translateY(30px) scale(.9)', delay: 30 + i * 18, blur: 12, fade: 300 }))
    rises.slice(1).forEach((el, i) => appear(el, { from: 'translateY(18px) scale(.95)', delay: 200 + i * 70 }))
    $$('[data-rise-stack]', heroStack).forEach((el, i) => appear(el, { from: 'translateY(46px) scale(.86)', delay: 320 + i * 130, blur: 18, fade: 520 }))
  }

  /* ================= 进入视口时浮起 ================= */
  let revealBatch = 0
  const revealIO = 'IntersectionObserver' in window ? new IntersectionObserver((entries) => {
    revealBatch = 0
    entries.forEach((en) => {
      if (!en.isIntersecting) return
      revealIO.unobserve(en.target)
      en.target.classList.remove('pre-reveal')
      appear(en.target, { from: 'translateY(28px) scale(.96)', delay: revealBatch++ * 70, blur: 10, fade: 420 })
    })
  }, { rootMargin: '0px 0px -6% 0px' }) : null
  function setupReveal() {
    if (reduced || !revealIO) return
    $$('[data-reveal]').forEach((el) => { el.classList.add('pre-reveal'); revealIO.observe(el) })
  }
  function revealAll() {
    $$('.pre-reveal').forEach((el) => { el.classList.remove('pre-reveal'); revealIO && revealIO.unobserve(el) })
  }

  /* ================= 迷你交互图 ================= */
  const MINI = {
    cas: () => `<div class="g-stage m-cas" aria-hidden="true">
      <span class="mini-cap mc-t t1">T1</span>
      <span class="mini-cap mc-mem"><span>0</span><span>1</span><span>2</span></span>
      <span class="mini-cap mc-t t2">T2</span>
      <span class="mc-x o1"><i class="mini-orb"></i></span>
      <span class="mc-x o2"><i class="mini-orb"></i></span>
    </div>`,
    loop: () => `<div class="g-stage m-loop" aria-hidden="true">
      <span class="mini-cap ml-queue"></span>
      <i class="ml-msg"></i><i class="ml-msg"></i><i class="ml-msg"></i>
      <span class="ml-ring"><span class="ml-arm"><i class="mini-orb"></i></span></span>
      <span class="mini-cap ml-core">Looper</span>
      <span class="m-lab" style="left:9%;bottom:44px">MessageQueue</span>
    </div>`,
    gen: () => `<div class="g-stage m-gen" aria-hidden="true">
      <div class="mg-row">
        <span class="mini-cap mg-zone">Eden</span><span class="mini-cap mg-zone">S0</span><span class="mini-cap mg-zone">S1</span><span class="mini-cap mg-zone">Old</span>
        <div class="mg-objs">${'<span class="mg-o"><i class="mini-orb"></i></span>'.repeat(4)}</div>
      </div>
    </div>`,
    bin: () => `<div class="g-stage m-bin" aria-hidden="true">
      <div class="mb-range"><span class="mb-band"></span><span class="mb-mid"><i class="mini-orb"></i></span></div>
      <div class="mb-bars">${Array.from({ length: 11 }, (_, k) => `<i class="${k === 7 ? 'hit' : ''}" style="height:${26 + k * 7}%"></i>`).join('')}</div>
      <span class="m-lab" style="left:22px;bottom:12px">target = 7</span>
    </div>`,
  }
  function observeStages() {
    if (!('IntersectionObserver' in window)) { $$('.g-stage').forEach((s) => s.classList.add('running')); return }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => en.target.classList.toggle('running', en.isIntersecting && !reduced))
    }, { threshold: 0.35 })
    $$('.g-stage').forEach((s) => io.observe(s))
  }

  /* ================= 目录 ================= */
  const partsEl = $('#parts')
  const artLink = (a) => `<a href="#a/${a.id}" class="art" data-id="${a.id}"><span class="art-num" data-vt="num">${a.num}</span><span class="art-main"><span class="art-title" data-vt="title">${esc(a.title)}</span>${a.fig ? '<span class="fig-tag">FIG</span>' : ''}</span></a>`
  function renderParts() {
    partsEl.innerHTML = PARTS.map((p) => `
      <article class="part glass" data-part="${p.id}" data-spec data-tilt="1.4" data-reveal>
        <button class="part-head" aria-expanded="false" aria-controls="pb-${p.id}">
          <span class="part-num">${p.id}</span>
          <span class="part-titles"><span class="part-name">${p.name}</span><span class="part-en">${p.en}</span></span>
          <span class="part-chips" aria-hidden="true">${p.chapters.map((c) => `<span>${c.name}</span>`).join('')}</span>
          <span class="part-count">${p.count}<small>篇</small></span>
          <span class="part-toggle" aria-hidden="true"><i></i></span>
        </button>
        <div class="part-body" id="pb-${p.id}" inert>
          <div class="part-inner"><div class="chapters">
            ${p.chapters.map((c) => `
              <div class="chap">
                <div class="chap-head"><span>${c.name}</span><span>${pad(c.items.length)}</span></div>
                <ul>${ARTICLES.filter((a) => a.part === p && a.chapCode === c.code).map((a) => `<li>${artLink(a)}</li>`).join('')}</ul>
              </div>`).join('')}
          </div></div>
        </div>
      </article>`).join('')

    partsEl.addEventListener('click', (e) => {
      const head = e.target.closest('.part-head')
      if (head) setPartOpen(head.parentElement, !head.parentElement.classList.contains('open'))
    })
    const onEnter = (e) => {
      const head = e.target.closest('.part-head')
      const link = e.target.closest('.art')
      if (link) preview(link.dataset.id, artCard(BY_ID[link.dataset.id]))
      else if (head) preview(`part-${head.parentElement.dataset.part}`, partCard(PARTS.find((x) => x.id === head.parentElement.dataset.part)))
    }
    partsEl.addEventListener('pointerover', onEnter)
    partsEl.addEventListener('focusin', onEnter)
    partsEl.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return
      const items = $$('.part-head, .part.open .art', partsEl)
      const i = items.indexOf(document.activeElement)
      if (i < 0) return
      e.preventDefault()
      const next = items[clamp(i + (e.key === 'ArrowDown' ? 1 : -1), 0, items.length - 1)]
      next.focus({ preventScroll: true })
      const r = next.getBoundingClientRect()
      if (r.top < topOffset() || r.bottom > innerHeight - 40) scrollToY(scrollY + r.top - innerHeight / 2)
    })
  }
  function setPartOpen(part, open, instant = false) {
    if (part.classList.contains('open') === open) return
    const body = $('.part-body', part)
    const from = body.getBoundingClientRect().height
    body._anim && body._anim.cancel()
    part.classList.toggle('open', open)
    $('.part-head', part).setAttribute('aria-expanded', String(open))
    body.inert = !open
    if (instant || reduced) return
    const to = open ? body.scrollHeight : 0
    body._anim = spring(body, [{ height: `${from}px` }, { height: `${to}px` }], open ? 'gentle' : 'snappy', { fill: 'none' })
    if (open) $$('.chap', part).forEach((c, i) => appear(c, { from: 'translateY(18px) scale(.97)', preset: 'bouncy', delay: 70 + i * 55, blur: 6, fade: 300 }))
  }

  /* ================= 预览面板 ================= */
  const previewStage = $('#previewStage')
  let pvKey = null
  function preview(key, html) {
    if (key === pvKey) return
    pvKey = key
    const old = $('.pv:not(.leaving)', previewStage)
    const card = document.createElement('div')
    card.className = 'pv'
    card.innerHTML = html
    previewStage.append(card)
    if (!old) return
    if (reduced) { old.remove(); return }
    old.classList.add('leaving')
    old.animate([{ opacity: 1, transform: 'none', filter: 'blur(0px)' }, { opacity: 0, transform: 'translateY(-12px) scale(.96)', filter: 'blur(6px)' }],
      { duration: 200, easing: 'cubic-bezier(.5, 0, .75, 0)', fill: 'forwards' }).onfinish = () => old.remove()
    appear(card, { from: 'translateY(18px) scale(.96)', preset: 'snappy', delay: 50, blur: 6, fade: 260 })
    $$('.pv-bars i', card).forEach((b, k) => spring(b, [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], 'bouncy', { delay: 120 + k * 50 }))
  }
  const partCard = (p) => {
    const max = Math.max(...p.chapters.map((c) => c.items.length))
    return `<span class="pv-kicker">第 ${p.id} 部分 · ${p.en}</span>
      <div class="pv-title">${p.name}</div>
      <p class="pv-sum">${p.count} 篇文章，分为 ${p.chapters.length} 个章节。点击展开查看全部条目。</p>
      <ul class="pv-bars">${p.chapters.map((c) => `<li><span>${c.name}</span><i style="width:${(c.items.length / max) * 100}%"></i><b>${c.items.length}</b></li>`).join('')}</ul>`
  }
  const artCard = (a) => `<span class="pv-kicker">${a.num}</span>
      <div class="pv-title">${esc(a.title)}</div>
      <p class="pv-sum">${a.summary}</p>
      <div class="pv-meta"><span>${a.partName} · ${a.chapName}</span><span>${a.date}</span><span>${a.mins} 分钟</span>${a.fig ? '<span class="is-fig">含交互图</span>' : ''}</div>
      <div class="pv-open"><span>第 ${a.index} / ${a.total} 篇 · 点击打开</span><kbd>Enter</kbd></div>`
  const introCard = () => `<span class="pv-kicker">从这里开始</span>
      <div class="pv-title">推荐从交互图读起</div>
      <p class="pv-sum">带 FIG 标记的文章包含可以亲手操作的原理图，能逐步执行、回放和对照代码。</p>
      <ul class="pv-list">${ARTICLES.filter((a) => a.fig).map((a) => `<li><span>${a.num}</span><span>${esc(a.title)}</span></li>`).join('')}</ul>`

  /* ================= 图集 ================= */
  const gallery = $('#gallery')
  const track = $('#galleryTrack')
  function renderGallery() {
    track.innerHTML = ARTICLES.filter((a) => a.fig).map((a, i) => `
      <a class="g-card glass" href="#a/${a.id}" data-id="${a.id}" data-spec data-tilt="5" data-reveal draggable="false">
        ${MINI[a.fig.kind]()}
        <div class="g-cap">
          <span class="g-num">FIG ${pad(i + 1)} · <span data-vt="num">${a.num}</span></span>
          <h3 class="g-title">${a.fig.caption}</h3>
          <span class="g-sub" data-vt="title">${esc(a.title)}</span>
        </div>
      </a>`).join('')

    const settle = new Spring(0, 'gentle', (x) => { gallery.scrollLeft = x }, 0.3)
    let down = false, sx = 0, sl = 0, moved = 0, lx = 0, lt = 0, vel = 0
    gallery.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return
      down = true
      moved = 0
      sx = lx = e.clientX
      sl = gallery.scrollLeft
      lt = performance.now()
      vel = 0
      settle.stop()
      e.preventDefault()
    })
    addEventListener('pointermove', (e) => {
      if (!down) return
      const now = performance.now()
      const dx = e.clientX - sx
      gallery.scrollLeft = sl - dx
      moved = Math.max(moved, Math.abs(dx))
      vel = vel * 0.5 + ((e.clientX - lx) / Math.max(1, now - lt)) * 0.5
      lx = e.clientX
      lt = now
      if (moved > 4 && !gallery.classList.contains('dragging')) { gallery.classList.add('dragging'); tiltLeave() }
    })
    const release = () => {
      if (!down) return
      down = false
      gallery.classList.remove('dragging')
      if (moved < 5) return
      if (performance.now() - lt > 90) vel = 0
      const cards = $$('.g-card', track)
      const max = gallery.scrollWidth - gallery.clientWidth
      const snaps = [...cards.map((c) => clamp(c.offsetLeft - cards[0].offsetLeft, 0, max)), max]
      const proj = gallery.scrollLeft - vel * 280
      const target = snaps.reduce((b, s) => (Math.abs(s - proj) < Math.abs(b - proj) ? s : b), snaps[0])
      settle.x = gallery.scrollLeft
      settle.to(target, -vel * 1000)
    }
    addEventListener('pointerup', release)
    addEventListener('pointercancel', release)
    gallery.addEventListener('click', (e) => {
      if (moved > 5) { e.stopPropagation(); e.preventDefault(); moved = 0 }
    }, true)
  }

  /* ================= 跟随高亮胶囊 ================= */
  function capsule(cap, measure) {
    const y = new Spring(0, 'snappy', (v) => { cap.style.transform = `translateY(${v.toFixed(2)}px)` }, 0.1)
    const h = new Spring(0, 'snappy', (v) => { cap.style.height = `${v.toFixed(2)}px` }, 0.1)
    let shown = false, hot = null
    return function moveTo(el, jump = false) {
      if (hot && hot !== el) hot.classList.remove('hot')
      hot = el
      if (!el) { cap.style.opacity = '0'; shown = false; return }
      el.classList.add('hot')
      const m = measure(el)
      if (!shown || jump) {
        y.set(m.top); h.set(m.height)
        if (!shown && !reduced) spring(cap, [{ scale: '.94' }, { scale: '1' }], 'bouncy')
        cap.style.opacity = '1'
        shown = true
      } else {
        y.to(m.top); h.to(m.height)
      }
    }
  }

  /* ================= 更新日志与索引 ================= */
  function renderLog() {
    const list = $('#log')
    list.innerHTML = BY_DATE.slice(0, 8).map((a) => `
      <li><a class="log-row" href="#a/${a.id}" data-id="${a.id}">
        <span class="log-date">${a.date}</span>
        <span class="art-num" data-vt="num">${a.num}</span>
        <span class="art-title" data-vt="title">${esc(a.title)}</span>
        <span class="log-part">${a.partName} · ${a.chapName}</span>
        <span class="log-arrow" aria-hidden="true"><svg viewBox="0 0 16 16"><path d="M3 8h10M9 4l4 4-4 4" /></svg></span>
      </a></li>`).join('')
    const box = list.parentElement
    const moveTo = capsule($('.hover-cap', box), (el) => {
      const r = el.getBoundingClientRect(), br = box.getBoundingClientRect()
      return { top: r.top - br.top, height: r.height }
    })
    if (canHover) {
      list.addEventListener('pointerover', (e) => { const row = e.target.closest('.log-row'); if (row) moveTo(row) })
      box.addEventListener('pointerleave', () => moveTo(null))
    }
    list.addEventListener('focusin', (e) => { const row = e.target.closest('.log-row'); if (row) moveTo(row) })
    list.addEventListener('focusout', (e) => { if (!list.contains(e.relatedTarget)) moveTo(null) })
  }
  function renderTerms() {
    const groups = {}
    TERMS.forEach(([g, term, title]) => { (groups[g] ||= []).push([term, BY_TITLE[title]]) })
    $('#terms').innerHTML = Object.entries(groups).map(([g, list]) => `
      <div class="term-group"><h4>${g}</h4>
        <div class="term-list">${list.map(([term, a]) => `<a href="#a/${a.id}" class="term" data-id="${a.id}" data-peek>${esc(term)}</a>`).join('')}</div>
      </div>`).join('')
  }

  /* ================= 顶栏导航胶囊 ================= */
  const nav = $('.topnav')
  const navCap = $('.nav-cap')
  const navLinks = $$('a', nav)
  const navX = new Spring(0, 'snappy', (v) => { navCap.style.transform = `translateX(${v.toFixed(2)}px)` }, 0.1)
  const navW = new Spring(0, 'snappy', (v) => { navCap.style.width = `${v.toFixed(2)}px` }, 0.1)
  let navShown = false, navHover = false, navCurrent = null
  function navTo(link) {
    if (!link) { navCap.style.opacity = '0'; navShown = false; return }
    if (!navShown) { navX.set(link.offsetLeft); navW.set(link.offsetWidth); navCap.style.opacity = '1'; navShown = true }
    else { navX.to(link.offsetLeft); navW.to(link.offsetWidth) }
  }
  nav.addEventListener('pointerover', (e) => { const a = e.target.closest('a'); if (a) { navHover = true; navTo(a) } })
  nav.addEventListener('pointerleave', () => { navHover = false; navTo(navCurrent) })
  function updateNavCurrent() {
    let cur = null
    if (view === 'index') {
      navLinks.forEach((a) => {
        const sec = $(a.getAttribute('href'))
        if (sec && sec.getBoundingClientRect().top < innerHeight * 0.45) cur = a
      })
    }
    if (cur === navCurrent) return
    navCurrent = cur
    navLinks.forEach((a) => a.classList.toggle('current', a === cur))
    if (!navHover) navTo(cur)
  }

  /* ================= 文章页 ================= */
  const articleEl = $('#article')
  const viewIndex = $('#view-index')
  const viewArticle = $('#view-article')
  let view = 'index'
  let currentId = null
  let indexScroll = 0
  let lastIndexSrc = null

  const refs = (html) => EY.renderRefs(html, (a, text) => `<a href="#a/${a.id}" class="ref" data-id="${a.id}" data-peek>${text}</a>`)
  const ICON_COPY = '<svg viewBox="0 0 16 16" aria-hidden="true"><rect x="5.5" y="5.5" width="8" height="8" rx="2" /><path d="M10.5 5.5V4a1.5 1.5 0 0 0-1.5-1.5H4A1.5 1.5 0 0 0 2.5 4v5A1.5 1.5 0 0 0 4 10.5h1.5" /></svg>'
  const ICON_CHECK = '<svg class="check" viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8.5l3 3 6-7" /></svg>'
  const codeBlock = () => `<div class="code">
      <div class="code-head"><span>AtomicInteger.java · Unsafe.java</span><button class="copy-btn" data-copy>${ICON_COPY}<span>复制</span></button></div>
      <pre><code>${EY.highlightJava(JAVA_SRC)}</code></pre>
    </div>`

  function casBody() {
    return CAS_ARTICLE.sections.map((s, i) => {
      const head = `<div class="sec-head"><span class="sec-num">${pad(i + 1)}</span><h2>${s.title}</h2></div>`
      if (s.scrolly) {
        return `<section class="scrolly-sec" data-sec="${i}" data-title="${s.title}">${head}
          <div class="scrolly">
            <div class="steps">${CAS_ARTICLE.scrollySteps.map((st, k) => `
              <div class="step" data-step="${st.step}"><div class="step-card">
                <div class="step-label"><b>${k + 1}</b>${st.label}</div><p>${st.text}</p>
              </div></div>`).join('')}
            </div>
            <div class="scrolly-fig">${casFigure()}</div>
          </div>
        </section>`
      }
      const notes = (s.notes || []).map((n) => `<div class="note"><span class="note-label">${n.label}</span>${refs(n.html)}</div>`).join('')
      return `<section class="a-sec glass" data-sec="${i}" data-title="${s.title}">${head}
        <div class="sec-grid"><div class="prose">${refs(s.html).replace('{{code}}', codeBlock())}</div><aside class="notes">${notes}</aside></div>
      </section>`
    }).join('')
  }
  const stub = (a) => `<div class="stub glass">
      <p>${a.summary}</p>
      <p>演示页只包含《CAS》的完整正文和交互图。</p>
      <button class="pill-btn primary" data-id="${CAS.id}">打开 <span data-vt="num">${CAS.num}</span> <span data-vt="title">CAS</span></button>
    </div>`

  function renderArticle(a) {
    currentId = a.id
    const isCas = a.id === CAS.id
    articleEl.innerHTML = `
      <div class="a-top">
        <button class="pill-btn back" data-action="back"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M13 8H3M7 4 3 8l4 4" /></svg>返回目录</button>
        <span class="a-crumb">${a.partName} / ${a.chapName}</span>
      </div>
      <header class="a-head glass" id="aHead" data-spec>
        <span class="a-num" id="aNum">${a.num}</span>
        <h1 class="a-title" id="aTitle">${esc(a.title)}</h1>
        <p class="a-sum">${a.summary}</p>
        <div class="a-meta">
          <span class="meta-pill">部分 <b>${a.part.id} ${a.partName}</b></span>
          <span class="meta-pill">章节 <b>${a.chapName}</b><b class="d">${pad(a.index)}/${pad(a.total)}</b></span>
          ${isCas ? `<span class="meta-pill">创建 <b class="d">${CAS_ARTICLE.created}</b></span>` : ''}
          <span class="meta-pill">更新 <b class="d">${a.date}</b></span>
          <span class="meta-pill">约 <b class="d">${a.mins}</b> 分钟</span>
        </div>
      </header>
      ${isCas ? casBody() : stub(a)}`
    document.title = `${a.num} ${a.title} · Endlessyoung`
    stopScrolly()
    cas = null
    if (isCas) {
      mountCas($('#casFig'))
      mountScrolly()
    }
    setupProgress(a)
  }

  function showView(v) {
    view = v
    viewIndex.hidden = v !== 'index'
    viewArticle.hidden = v !== 'article'
    if (v === 'index') {
      document.title = 'Endlessyoung · 空间（改版演示）'
      hideProgress()
      stopScrolly()
    }
    updateNavCurrent()
  }

  /* ================= 页面转场 ================= */
  function clearAllVT() {
    $$('[style*="view-transition-name"]').forEach((el) => { el.style.viewTransitionName = '' })
  }
  function tagSource(src) {
    if (!src || !src.isConnected) return []
    const t = src.querySelector('[data-vt="title"]')
    const n = src.querySelector('[data-vt="num"]')
    if (!t) { src.style.viewTransitionName = 'vt-title'; return ['vt-title'] }
    src.style.viewTransitionName = 'vt-card'
    t.style.viewTransitionName = 'vt-title'
    if (n) n.style.viewTransitionName = 'vt-num'
    return n ? ['vt-card', 'vt-title', 'vt-num'] : ['vt-card', 'vt-title']
  }
  function tagHeader(names) {
    const map = { 'vt-card': '#aHead', 'vt-title': '#aTitle', 'vt-num': '#aNum' }
    names.forEach((n) => { const el = $(map[n]); if (el) el.style.viewTransitionName = n })
  }
  function transition(update, dir) {
    if (!document.startViewTransition || reduced) { update(); return Promise.resolve() }
    root.classList.add('vt-page', dir === 'back' ? 'vt-back' : 'vt-fwd')
    const vt = document.startViewTransition(update)
    return vt.finished.catch(() => {}).finally(() => root.classList.remove('vt-page', 'vt-fwd', 'vt-back'))
  }

  function openArticle(id, src, fromHistory = false) {
    const a = BY_ID[id]
    if (!a) return Promise.resolve()
    hidePeek(true)
    closeProgSheet(true)
    scrollSpring.stop()
    if (view === 'index') {
      indexScroll = scrollY
      lastIndexSrc = src && viewIndex.contains(src) ? src : null
    }
    clearAllVT()
    const names = tagSource(src)
    if (!fromHistory) history.pushState({ id }, '', `#a/${id}`)
    return transition(() => {
      closePalette(true)
      clearAllVT()
      renderArticle(a)
      tagHeader(names.length ? names : [])
      showView('article')
      scrollTo(0, 0)
    }, 'fwd').then(() => { clearAllVT(); showProgress() })
  }

  function goHome(fromHistory = false, thenScrollTo = null) {
    if (view === 'index') {
      closePalette(true)
      if (thenScrollTo) scrollToEl($(thenScrollTo))
      else scrollToY(0)
      return Promise.resolve()
    }
    if (!fromHistory) history.pushState({}, '', location.pathname + location.search)
    const id = currentId
    hidePeek(true)
    closeProgSheet(true)
    clearAllVT()
    if (!thenScrollTo) tagHeader(['vt-card', 'vt-title', 'vt-num'])
    return transition(() => {
      closePalette(true)
      clearAllVT()
      showView('index')
      revealAll()
      if (thenScrollTo) {
        const el = $(thenScrollTo)
        scrollTo(0, el ? el.getBoundingClientRect().top + scrollY - topOffset() : 0)
        return
      }
      let target = null
      if (lastIndexSrc && lastIndexSrc.isConnected && lastIndexSrc.dataset.id === id) {
        target = lastIndexSrc
        const part = target.closest('.part')
        if (part) setPartOpen(part, true, true)
        scrollTo(0, indexScroll)
      } else {
        const link = $(`.art[data-id="${id}"]`, partsEl)
        if (link) {
          setPartOpen(link.closest('.part'), true, true)
          target = link
          link.scrollIntoView({ block: 'center' })
        }
      }
      tagSource(target)
      updateNavCurrent()
    }, 'back').then(clearAllVT)
  }

  addEventListener('popstate', (e) => {
    if (e.state && e.state.id) openArticle(e.state.id, null, true)
    else goHome(true)
  })

  /* ================= 阅读进度胶囊 ================= */
  const prog = {
    el: $('#progress'), pill: $('#progressPill'), sheet: $('#progressSheet'), list: $('#progressList'),
    ring: $('#ringFg'), sec: $('#progressSec'), left: $('#progressLeft'),
  }
  const RING = 94.25
  const ringSpring = new Spring(0, 'gentle', (v) => { prog.ring.style.strokeDashoffset = (RING * (1 - clamp(v, 0, 1.02))).toFixed(2) }, 0.0005)
  let progData = null
  function setupProgress(a) {
    const secs = $$('[data-sec]', articleEl)
    closeProgSheet(true)
    prog.el.hidden = true
    if (!secs.length) { progData = null; return }
    progData = { secs, mins: a.mins, cur: -1 }
    prog.list.innerHTML = secs.map((s, i) => `<li><button data-jump="${i}"><span>${pad(i + 1)}</span>${s.dataset.title}</button></li>`).join('')
    prog.sec.textContent = ''
    ringSpring.set(0)
  }
  function showProgress() {
    if (!progData || view !== 'article' || !prog.el.hidden) return
    prog.el.hidden = false
    updateProgress()
    appear(prog.pill, { from: 'translateY(40px) scale(.8)', preset: 'bouncy', blur: 6, fade: 260 })
  }
  function hideProgress() { prog.el.hidden = true; closeProgSheet(true) }
  function swapText(el, text, dir) {
    if (el.textContent === text) return
    const first = !el.textContent
    el.textContent = text
    if (!first && !reduced) appear(el, { from: `translateY(${dir * 12}px)`, preset: 'snappy', blur: 3, fade: 200 })
  }
  function updateProgress() {
    if (!progData || view !== 'article' || prog.el.hidden) return
    const total = Math.max(1, root.scrollHeight - innerHeight)
    const p = clamp(scrollY / total, 0, 1)
    ringSpring.to(p)
    let cur = 0
    progData.secs.forEach((s, i) => { if (s.getBoundingClientRect().top < innerHeight * 0.4) cur = i })
    if (cur !== progData.cur) {
      swapText(prog.sec, progData.secs[cur].dataset.title, cur > progData.cur ? 1 : -1)
      progData.cur = cur
      $$('button', prog.list).forEach((b, i) => b.classList.toggle('cur', i === cur))
    }
    prog.left.textContent = p > 0.985 ? '已读完' : `剩余 ${Math.max(1, Math.ceil(progData.mins * (1 - p)))} 分钟`
  }
  function openProgSheet() {
    prog.sheet.hidden = false
    prog.pill.setAttribute('aria-expanded', 'true')
    $$('li', prog.list).forEach((li, i) => appear(li, { from: 'translateY(10px)', preset: 'snappy', delay: 40 + i * 30, blur: 0, fade: 200 }))
    appear(prog.sheet, { from: 'translateY(18px) scale(.9)', preset: 'bouncy', blur: 8, fade: 220 })
  }
  function closeProgSheet(instant = false) {
    if (prog.sheet.hidden) return
    prog.pill.setAttribute('aria-expanded', 'false')
    if (instant || reduced) { prog.sheet.hidden = true; return }
    prog.sheet.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(10px) scale(.95)' }], { duration: 160, easing: 'ease-in' })
      .onfinish = () => { prog.sheet.hidden = true }
  }
  prog.pill.addEventListener('click', () => { prog.sheet.hidden ? openProgSheet() : closeProgSheet() })
  prog.list.addEventListener('click', (e) => {
    const b = e.target.closest('[data-jump]')
    if (!b || !progData) return
    scrollToEl(progData.secs[+b.dataset.jump])
    closeProgSheet()
  })
  document.addEventListener('pointerdown', (e) => { if (!prog.sheet.hidden && !prog.el.contains(e.target)) closeProgSheet() })

  /* ================= CAS 交互图 ================= */
  function casFigure() {
    const last = CAS_STEPS.length - 1
    const thread = (t) => `
      <div class="cap thread" data-t="${t}">
        <div class="t-head"><span class="t-dot"></span><span class="t-name">${t.toUpperCase()}</span><span class="t-status">就绪</span></div>
        <div class="reg" data-link="expect"><span>expect</span><b data-f="expect">—</b></div>
        <div class="reg" data-link="update"><span>update</span><b data-f="update">—</b></div>
        <div class="reg" data-link="retry"><span>retry</span><b data-f="retry">0</b></div>
      </div>`
    return `
      <div class="cas glass" id="casFig">
        <div class="cas-head"><span class="cas-tag">图 3</span><span class="cas-title">两个线程竞争同一个 AtomicInteger</span><span class="cas-step">步骤 <b class="cas-cur">00</b> / ${pad(last)}</span></div>
        <div class="cas-stage">
          <svg class="cas-arcs" aria-hidden="true"><path data-arc="t1-read" /><path data-arc="t1-write" /><path data-arc="t2-read" /><path data-arc="t2-write" /></svg>
          ${thread('t1')}
          <div class="cap memory" data-link="memory">
            <span class="mem-label">value @0x7F3A</span>
            <div class="mem-box"><span class="mem-val">0</span></div>
            <span class="mem-label">AtomicInteger</span>
            <span class="mem-ring"></span>
          </div>
          ${thread('t2')}
        </div>
        <div class="cas-code">
          <span class="line-cap"></span><span class="marker t1">T1</span><span class="marker t2">T2</span>
          ${CAS_CODE.map((l, i) => `<div class="cl" data-line="${i + 1}"><span class="cl-no">${i + 1}</span><span></span><span class="cl-txt">${esc(l)}</span></div>`).join('')}
        </div>
        <div class="cas-log" aria-live="polite"></div>
        <div class="cas-foot">
          <div class="cas-ctrl">
            <button class="pill-btn" data-c="reset">重置</button>
            <button class="pill-btn" data-c="prev">上一步</button>
            <button class="pill-btn primary" data-c="next">单步</button>
            <button class="pill-btn" data-c="play">播放</button>
            <button class="pill-btn speed" data-c="speed" aria-label="切换速度">1×</button>
          </div>
          <div class="cas-track">
            <span class="track-bg"></span><span class="track-fill"></span>
            ${CAS_STEPS.map((_, k) => `<button class="track-dot" data-go="${k}" style="left:${(k / last) * 100}%" aria-label="跳到第 ${k} 步"></button>`).join('')}
          </div>
        </div>
      </div>`
  }

  let cas = null
  function mountCas(fig) {
    const stage = $('.cas-stage', fig)
    const svg = $('.cas-arcs', fig)
    const mem = $('.memory', fig)
    const memBox = $('.mem-box', fig)
    const ring = $('.mem-ring', fig)
    const threads = { t1: $('[data-t="t1"]', fig), t2: $('[data-t="t2"]', fig) }
    const lines = $$('.cl', fig)
    const lineCap = $('.line-cap', fig)
    const markers = { t1: $('.marker.t1', fig), t2: $('.marker.t2', fig) }
    const curEl = $('.cas-cur', fig)
    const logEl = $('.cas-log', fig)
    const fill = $('.track-fill', fig)
    const dots = $$('.track-dot', fig)
    const playBtn = $('[data-c="play"]', fig)
    const speedBtn = $('[data-c="speed"]', fig)
    const last = CAS_STEPS.length - 1
    const speeds = [1, 2, 0.5]
    let speedIdx = 0
    let cur = 0
    let fx = null
    let token = 0
    let seq = 0
    let timer = 0
    let playing = false
    const speed = () => speeds[speedIdx]
    const LINE_H = 28
    const lineY = (n) => (n - 1) * LINE_H
    const capY = new Spring(0, 'snappy', (v) => { lineCap.style.transform = `translateY(${v.toFixed(2)}px)` }, 0.1)
    const mk = {
      t1: new Spring(0, 'bouncy', (v) => { markers.t1.style.transform = `translateY(${v.toFixed(2)}px)` }, 0.1),
      t2: new Spring(0, 'bouncy', (v) => { markers.t2.style.transform = `translateY(${v.toFixed(2)}px)` }, 0.1),
    }

    function place(spr, el, y, animate) {
      const shown = el.style.opacity === '1'
      el.style.opacity = '1'
      if (animate && shown) spr.to(y)
      else spr.set(y)
    }
    function renderCode(s, animate) {
      const now = s.actor ? s[s.actor].line : 0
      lines.forEach((l) => l.classList.toggle('now', +l.dataset.line === now))
      if (now) place(capY, lineCap, lineY(now), animate)
      else lineCap.style.opacity = '0'
      for (const t of ['t1', 't2']) {
        if (s[t].line) place(mk[t], markers[t], lineY(s[t].line), animate)
        else markers[t].style.opacity = '0'
      }
      curEl.textContent = pad(cur)
      fill.style.transform = `scaleX(${cur / last})`
      dots.forEach((d, k) => { d.classList.toggle('passed', k < cur); d.classList.toggle('cur', k === cur) })
      logEl.innerHTML = s.log
      if (animate && !reduced) appear(logEl, { from: 'translateY(8px)', preset: 'snappy', blur: 2, fade: 220, speed: speed() })
    }
    function popEl(el) {
      if (!reduced) spring(el, [{ transform: 'scale(1.55)' }, { transform: 'none' }], 'bouncy', { speed: speed() })
    }
    function setMem(v, animate) {
      const curVal = $('.mem-val:not(.leaving)', memBox)
      if (curVal && curVal.textContent === String(v)) return
      if (!animate || reduced || !curVal) { memBox.innerHTML = `<span class="mem-val">${v}</span>`; return }
      curVal.classList.add('leaving')
      curVal.animate([{ transform: 'none', opacity: 1, filter: 'blur(0px)' }, { transform: 'translateY(-55%) scale(.8)', opacity: 0, filter: 'blur(4px)' }],
        { duration: 240 / speed(), easing: 'cubic-bezier(.5, 0, .75, 0)', fill: 'forwards' }).onfinish = () => curVal.remove()
      const nv = document.createElement('span')
      nv.className = 'mem-val'
      nv.textContent = v
      memBox.append(nv)
      spring(nv, [{ transform: 'translateY(75%) scale(.75)', opacity: 0 }, { transform: 'none', opacity: 1 }], 'bouncy', { speed: speed() })
    }
    function renderStage(s, prevS = null) {
      setMem(s.v, false)
      for (const t of ['t1', 't2']) {
        const el = threads[t], st = s[t]
        el.classList.toggle('active', s.actor === t)
        el.classList.toggle('ok', st.cls === 'ok')
        el.classList.toggle('fail', st.cls === 'fail')
        $('.t-status', el).textContent = st.status
        for (const f of ['expect', 'update', 'retry']) {
          const b = $(`[data-f="${f}"]`, el)
          const val = String(st[f])
          if (b.textContent !== val) {
            b.textContent = val
            if (prevS && val !== '—') popEl(b)
          }
        }
      }
    }

    function center(el) {
      const r = el.getBoundingClientRect(), sr = stage.getBoundingClientRect()
      return { x: r.left - sr.left + r.width / 2, y: r.top - sr.top + r.height / 2 }
    }
    const arcs = {}
    function layoutArcs() {
      const sr = stage.getBoundingClientRect()
      svg.setAttribute('viewBox', `0 0 ${sr.width.toFixed(1)} ${sr.height.toFixed(1)}`)
      const m = center(memBox)
      /* 由期望的弧顶高度反推二次贝塞尔控制点，保证弧线越过胶囊顶部 */
      const arc = (p0, p1, apex) => ({ p0, p1, c: { x: (p0.x + p1.x) / 2, y: 2 * apex - (p0.y + p1.y) / 2 } })
      for (const t of ['t1', 't2']) {
        arcs[`${t}-read`] = arc(m, center($('[data-f="expect"]', threads[t])), 22)
        arcs[`${t}-write`] = arc(center($('[data-f="update"]', threads[t])), m, 44)
      }
      $$('path', svg).forEach((p) => {
        const a = arcs[p.dataset.arc]
        p.setAttribute('d', `M${a.p0.x.toFixed(1)},${a.p0.y.toFixed(1)} Q${a.c.x.toFixed(1)},${a.c.y.toFixed(1)} ${a.p1.x.toFixed(1)},${a.p1.y.toFixed(1)}`)
        p.style.setProperty('--arc', `var(--${p.dataset.arc.startsWith('t2') ? 't2' : 'accent'})`)
      })
    }
    const bez = (a, t) => {
      const u = 1 - t
      return { x: u * u * a.p0.x + 2 * u * t * a.c.x + t * t * a.p1.x, y: u * u * a.p0.y + 2 * u * t * a.c.y + t * t * a.p1.y }
    }
    /* 沿二次贝塞尔弧线飞行，进度取自弹簧曲线，因此落点会略微越过再回弹 */
    function flight(orb, arc, preset, { reverse = false, stretch = 1.3 } = {}) {
      const { curve, duration } = SPRING[preset]
      const frames = curve.map((t) => {
        if (t > 1) t = 1 + (t - 1) * 0.4
        const q = bez(arc, reverse ? 1 - t : t)
        return { transform: `translate(${q.x.toFixed(2)}px, ${q.y.toFixed(2)}px)` }
      })
      return orb.animate(frames, { duration: (duration * stretch) / speed(), easing: 'linear', fill: 'forwards' })
    }
    function pulse(color, strong) {
      if (reduced) return
      const c = cssVar(color)
      ring.animate([
        { boxShadow: `0 0 0 0 ${c}`, opacity: 0.9 },
        { boxShadow: `0 0 0 ${strong ? 22 : 12}px transparent`, opacity: 0 },
      ], { duration: 760 / speed(), easing: 'cubic-bezier(.2, .8, .2, 1)' })
      mem.animate([
        { boxShadow: `inset 0 0 0 1.5px ${c}, 0 0 44px -4px ${c}` },
        { boxShadow: getComputedStyle(mem).boxShadow },
      ], { duration: 900 / speed(), easing: 'ease-out' })
    }
    function lit(name, on) { const p = $(`[data-arc="${name}"]`, svg); p && p.classList.toggle('lit', on) }

    function runFx(s, prevS) {
      const my = ++token
      const t = s.actor
      const th = threads[t]
      const alive = () => my === token
      layoutArcs()
      const orb = document.createElement('span')
      orb.className = `orb ${t}`
      stage.append(orb)
      const anims = []
      const track = (a) => { anims.push(a); return a }
      let resolve
      const promise = new Promise((r) => { resolve = r })
      const arcName = `${t}-${s.fx === 'read' ? 'read' : 'write'}`
      const done = () => {
        orb.remove()
        lit(arcName, false)
        renderStage(s)
        fx = null
        resolve()
      }
      fx = { promise, finish() { token++; anims.forEach((a) => a.cancel()); done() } }
      const absorb = () => track(orb.animate([{ scale: '1', opacity: 1 }, { scale: '.2', opacity: 0 }], { duration: 200 / speed(), easing: 'ease-in', fill: 'forwards' }))
      const nudge = (el, from) => track(spring(el, [{ transform: from }, { transform: 'none' }], 'bouncy', { speed: speed() }))
      lit(arcName, true)
      track(orb.animate([{ scale: '0' }, { scale: '1' }], { duration: SPRING.bouncy.duration / speed(), easing: SPRING.bouncy.easing, fill: 'backwards' }))

      if (s.fx === 'read') {
        renderStage({ ...s, [t]: { ...s[t], expect: prevS[t].expect } })
        orb.textContent = s.v
        nudge(mem, 'scale(.96)')
        track(flight(orb, arcs[arcName], 'gentle')).finished.then(() => {
          if (!alive()) return
          const b = $('[data-f="expect"]', th)
          b.textContent = String(s[t].expect)
          popEl(b)
          nudge(th, 'translateY(4px) scale(.98)')
          absorb().finished.then(() => alive() && done())
        }).catch(() => {})
      } else if (s.fx === 'write') {
        renderStage({ ...s, v: prevS.v })
        orb.textContent = s[t].update
        track(flight(orb, arcs[arcName], 'gentle')).finished.then(() => {
          if (!alive()) return
          setMem(s.v, true)
          pulse('--ok', true)
          nudge(mem, 'scale(1.08)')
          absorb().finished.then(() => alive() && done())
        }).catch(() => {})
      } else {
        renderStage({ ...s, v: prevS.v, [t]: { ...s[t], status: 'CAS 比较中', cls: '', retry: prevS[t].retry } })
        orb.textContent = s[t].update
        track(flight(orb, arcs[arcName], 'snappy', { stretch: 1.5 })).finished.then(() => {
          if (!alive()) return
          orb.classList.add('bad')
          pulse('--fail', false)
          nudge(mem, `translateX(${t === 't2' ? -10 : 10}px) scale(.95, 1.03)`)
          return track(flight(orb, arcs[arcName], 'bouncy', { reverse: true, stretch: 1.2 })).finished.then(() => {
            if (!alive()) return
            renderStage(s, prevS)
            nudge(th, `translateX(${t === 't2' ? 8 : -8}px)`)
            absorb().finished.then(() => alive() && done())
          })
        }).catch(() => {})
      }
    }

    function go(n, animate) {
      if (fx) fx.finish()
      const prevS = CAS_STEPS[cur]
      const next = clamp(n, 0, last)
      const stepped = next === cur + 1
      cur = next
      const s = CAS_STEPS[cur]
      const anim = animate && stepped && !reduced
      renderCode(s, anim)
      if (anim && s.fx) runFx(s, prevS)
      else renderStage(s, anim ? prevS : null)
    }
    const wait = (ms) => new Promise((r) => { timer = setTimeout(r, ms) })
    async function sequence(target, gapFx, gapPlain) {
      const my = ++seq
      while (cur < target && my === seq) {
        go(cur + 1, true)
        const hadFx = !!fx
        if (fx) await fx.promise
        if (my !== seq) return false
        if (cur < target) await wait((hadFx ? gapFx : gapPlain) / speed())
      }
      return my === seq
    }
    function stop() {
      seq++
      clearTimeout(timer)
      playing = false
      playBtn.textContent = '播放'
    }
    function play() {
      if (cur >= last) go(0, false)
      playing = true
      playBtn.textContent = '暂停'
      wait(160).then(() => playing && sequence(last, 520, 900).then((ok) => { if (ok) stop() }))
    }
    function runTo(target) {
      stop()
      if (target <= cur || target - cur > 5) { go(target, false); return }
      sequence(target, 160, 420)
    }

    fig.addEventListener('click', (e) => {
      const dot = e.target.closest('[data-go]')
      if (dot) { stop(); go(+dot.dataset.go, true); return }
      const b = e.target.closest('[data-c]')
      if (!b) return
      const c = b.dataset.c
      if (c === 'next') { stop(); go(cur + 1, true) }
      if (c === 'prev') { stop(); go(cur - 1, false) }
      if (c === 'reset') { stop(); go(0, false) }
      if (c === 'play') playing ? stop() : play()
      if (c === 'speed') { speedIdx = (speedIdx + 1) % speeds.length; b.textContent = `${speed()}×`; popEl(b) }
    })

    const clearRel = () => $$('.rel', fig).forEach((el) => el.classList.remove('rel'))
    fig.addEventListener('pointerover', (e) => {
      const line = e.target.closest('.cl')
      const part = e.target.closest('[data-link]')
      clearRel()
      if (line) {
        const n = +line.dataset.line
        line.classList.add('rel')
        $$('[data-link]', fig).forEach((el) => { if (CAS_LINKS[el.dataset.link].includes(n)) el.classList.add('rel') })
      } else if (part) {
        part.classList.add('rel')
        CAS_LINKS[part.dataset.link].forEach((n) => lines[n - 1] && lines[n - 1].classList.add('rel'))
      }
    })
    fig.addEventListener('pointerleave', clearRel)

    go(0, false)
    raf2(() => fig.isConnected && layoutArcs())
    cas = { runTo, stop, layoutArcs, get cur() { return cur } }
  }
  addEventListener('resize', () => { cas && cas.layoutArcs() })

  /* ================= 滚动叙事 ================= */
  let scrollyIO = null
  function mountScrolly() {
    const steps = $$('.step', articleEl)
    if (!steps.length || !('IntersectionObserver' in window)) return
    scrollyIO = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return
        steps.forEach((s) => s.classList.toggle('active', s === en.target))
        cas && cas.runTo(+en.target.dataset.step)
      })
    }, { rootMargin: '-44% 0px -50% 0px' })
    steps.forEach((s) => scrollyIO.observe(s))
  }
  function stopScrolly() {
    scrollyIO && scrollyIO.disconnect()
    scrollyIO = null
    cas && cas.stop()
  }

  /* ================= 复制反馈 ================= */
  function setCopyState(b, done) {
    const w0 = b.getBoundingClientRect().width
    b.classList.toggle('done', done)
    b.innerHTML = done ? `${ICON_CHECK}<span>已复制</span>` : `${ICON_COPY}<span>复制</span>`
    if (reduced) return
    const w1 = b.getBoundingClientRect().width
    spring(b, [{ width: `${w0}px` }, { width: `${w1}px` }], 'bouncy')
    if (done) {
      b.animate([
        { boxShadow: `0 0 0 0 ${cssVar('--ok')}` },
        { boxShadow: '0 0 0 12px transparent' },
      ], { duration: 640, easing: 'cubic-bezier(.2, .8, .2, 1)' })
      spring($('svg', b), [{ transform: 'scale(.3) rotate(-30deg)' }, { transform: 'none' }], 'bouncy')
    }
  }
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-copy]')
    if (!b) return
    navigator.clipboard && navigator.clipboard.writeText(JAVA_SRC).catch(() => {})
    if (!b.classList.contains('done')) setCopyState(b, true)
    clearTimeout(b._t)
    b._t = setTimeout(() => setCopyState(b, false), 1800)
  })

  /* ================= 链接预览 ================= */
  const peek = $('#peek')
  let peekTimer = 0, hideTimer = 0, peekFor = null
  function showPeek(el) {
    const a = BY_ID[el.dataset.id]
    if (!a || !el.isConnected) return
    peekFor = el
    peek.innerHTML = `<span class="pv-kicker">${a.num}</span><h5>${esc(a.title)}</h5><p>${a.summary}</p>
      <div class="peek-foot"><span>${a.partName} · ${a.chapName}</span><span>${a.mins} 分钟${a.fig ? ' · 含交互图' : ''}</span></div>`
    peek.hidden = false
    const r = el.getBoundingClientRect()
    const w = peek.offsetWidth, h = peek.offsetHeight
    const left = clamp(r.left + r.width / 2 - w / 2, 12, innerWidth - w - 12)
    const below = r.bottom + 14 + h < innerHeight
    peek.style.left = `${left}px`
    peek.style.top = `${below ? r.bottom + 10 : r.top - h - 10}px`
    peek.style.transformOrigin = `${r.left + r.width / 2 - left}px ${below ? '0' : '100%'}`
    peek.getAnimations().forEach((x) => x.cancel())
    appear(peek, { from: `translateY(${below ? -10 : 10}px) scale(.7)`, preset: 'bouncy', blur: 6, fade: 200 })
  }
  function hidePeek(instant = false) {
    clearTimeout(peekTimer)
    if (peek.hidden) return
    peekFor = null
    if (instant || reduced) { peek.hidden = true; return }
    peek.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'scale(.92)' }], { duration: 140, easing: 'ease-in' })
      .onfinish = () => { if (!peekFor) peek.hidden = true }
  }
  if (canHover) {
    document.addEventListener('pointerover', (e) => {
      const el = e.target.closest('[data-peek]')
      if (el) {
        clearTimeout(hideTimer)
        if (el === peekFor) return
        clearTimeout(peekTimer)
        peekTimer = setTimeout(() => showPeek(el), 260)
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
    addEventListener('scroll', () => { if (!peek.hidden) hidePeek() }, { passive: true })
  }

  /* ================= 搜索面板 ================= */
  const palette = $('#palette')
  const sheet = $('.sheet', palette)
  const pInput = $('#paletteInput')
  const pList = $('#paletteList')
  const pPreview = $('#palettePreview')
  const pCount = $('#paletteCount')
  const pCap = document.createElement('li')
  pCap.className = 'p-cap'
  pCap.setAttribute('aria-hidden', 'true')
  const capTo = capsule(pCap, (el) => ({ top: el.offsetTop, height: el.offsetHeight }))
  const nodeCache = new Map()
  let results = []
  let active = 0
  let query = ''

  function openPalette() {
    if (!palette.hidden) return
    hidePeek(true)
    closeProgSheet(true)
    root.style.setProperty('--sy', `${scrollY}px`)
    palette.hidden = false
    root.classList.add('palette-open')
    pInput.value = ''
    query = ''
    pList.replaceChildren(pCap)
    capTo(null)
    filter()
    pInput.focus()
    if (!reduced) {
      appear(sheet, { from: 'translateY(-18px) scale(.93)', preset: 'snappy', blur: 12, fade: 240 })
      $('.palette-scrim', palette).animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, easing: 'ease-out' })
    }
  }
  function closePalette(instant = false) {
    if (palette.hidden) return
    if (instant) {
      const els = [$('#app'), $('.topbar')]
      els.forEach((el) => { el.style.transition = 'none' })
      root.classList.remove('palette-open')
      palette.hidden = true
      raf2(() => els.forEach((el) => { el.style.transition = '' }))
      return
    }
    root.classList.remove('palette-open')
    if (reduced) { palette.hidden = true; return }
    sheet.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(-8px) scale(.96)' }], { duration: 170, easing: 'cubic-bezier(.5, 0, .75, 0)' })
    $('.palette-scrim', palette).animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200 }).onfinish = () => { palette.hidden = true }
  }
  function hl(text, q) {
    if (!q) return esc(text)
    const i = text.toLowerCase().indexOf(q)
    if (i < 0) return esc(text)
    return `${esc(text.slice(0, i))}<mark>${esc(text.slice(i, i + q.length))}</mark>${esc(text.slice(i + q.length))}`
  }
  function itemNode(a) {
    let li = nodeCache.get(a.id)
    if (!li) {
      li = document.createElement('li')
      li.className = 'p-item'
      li.dataset.pid = a.id
      li.setAttribute('role', 'option')
      li.innerHTML = '<span class="art-num" data-vt="num"></span><span class="art-title" data-vt="title"></span><span class="p-part"></span>'
      nodeCache.set(a.id, li)
    }
    $('.art-num', li).innerHTML = hl(a.num, query)
    $('.art-title', li).innerHTML = hl(a.title, query)
    $('.p-part', li).textContent = a.chapName
    return li
  }
  function filter() {
    query = pInput.value.trim().toLowerCase()
    results = EY.search(query)
    const first = new Map($$('.p-item', pList).map((li) => [li.dataset.pid, li.offsetTop]))
    const nodes = results.map(itemNode)
    if (nodes.length) pList.replaceChildren(pCap, ...nodes)
    else {
      const empty = document.createElement('li')
      empty.className = 'p-empty'
      empty.textContent = '没有匹配的条目，换个关键词试试。'
      pList.replaceChildren(pCap, empty)
    }
    if (!reduced) {
      nodes.forEach((li, i) => {
        li.getAnimations().forEach((x) => x.cancel())
        const f = first.get(li.dataset.pid)
        if (f != null) {
          const d = f - li.offsetTop
          if (Math.abs(d) > 0.5) spring(li, [{ transform: `translateY(${d}px)` }, { transform: 'none' }], 'snappy')
        } else {
          appear(li, { from: 'translateY(12px) scale(.97)', preset: 'snappy', delay: Math.min(i, 8) * 16, blur: 3, fade: 200 })
        }
      })
    }
    pCount.textContent = query ? `${results.length} 条结果` : '最近更新'
    setActive(0, true)
  }
  function setActive(i, jump = false) {
    const items = $$('.p-item', pList)
    active = clamp(i, 0, Math.max(0, results.length - 1))
    items.forEach((li, k) => { li.classList.toggle('active', k === active); li.setAttribute('aria-selected', String(k === active)) })
    const a = results[active]
    const li = items[active]
    capTo(li || null, jump)
    if (!a) { pPreview.innerHTML = ''; return }
    const lt = li.offsetTop, lb = lt + li.offsetHeight
    if (lt < pList.scrollTop) pList.scrollTop = lt - 8
    else if (lb > pList.scrollTop + pList.clientHeight) pList.scrollTop = lb - pList.clientHeight + 8
    pPreview.innerHTML = `<span class="pv-kicker">${a.num}</span><h3>${esc(a.title)}</h3><p>${a.summary}</p>
      <dl><dt>部分</dt><dd>${a.part.id} ${a.partName}</dd><dt>章节</dt><dd>${a.chapName} · ${pad(a.index)}/${pad(a.total)}</dd><dt>更新</dt><dd>${a.date}</dd><dt>阅读</dt><dd>约 ${a.mins} 分钟${a.fig ? ' · 含交互图' : ''}</dd></dl>`
    if (!reduced) $$(':scope > *', pPreview).forEach((el, k) => appear(el, { from: 'translateY(8px)', preset: 'snappy', delay: k * 25, blur: 2, fade: 180 }))
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

  /* ================= 明暗切换 ================= */
  function toggleTheme(btn) {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark'
    try { localStorage.setItem('ey-theme-spatial', next) } catch {}
    const icon = $('.theme-icon')
    if (!reduced) spring(icon, [{ transform: 'rotate(-120deg) scale(.5)' }, { transform: 'none' }], 'bouncy')
    if (!document.startViewTransition || reduced) { root.dataset.theme = next; return }
    const r = btn.getBoundingClientRect()
    const x = r.left + r.width / 2, y = r.top + r.height / 2
    const R = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y)) + 260
    root.style.setProperty('--tx', `${x}px`)
    root.style.setProperty('--ty', `${y}px`)
    root.classList.add('vt-theme', next === 'dark' ? 'to-dark' : 'to-light')
    const vt = document.startViewTransition(() => { root.dataset.theme = next })
    vt.ready.then(() => {
      root.animate({ '--reveal': ['0px', `${R}px`] }, {
        duration: SPRING.gentle.duration * 2.2,
        easing: SPRING.gentle.easing,
        pseudoElement: '::view-transition-new(root)',
        fill: 'both',
      })
    }).catch(() => {})
    vt.finished.catch(() => {}).finally(() => root.classList.remove('vt-theme', 'to-dark', 'to-light'))
  }

  /* ================= 全局事件 ================= */
  document.addEventListener('click', (e) => {
    const act = e.target.closest('[data-action]')
    if (act) {
      const a = act.dataset.action
      if (a === 'home' || a === 'back') goHome()
      if (a === 'palette') openPalette()
      if (a === 'palette-close') closePalette()
      if (a === 'theme') toggleTheme(act)
      if (a === 'replay') {
        const run = () => { scrollSpring.stop(); scrollTo(0, 0); playIntro() }
        view === 'article' ? goHome().then(run) : run()
      }
      return
    }
    const navLink = e.target.closest('.topnav a, [data-nav]')
    if (navLink) {
      e.preventDefault()
      goHome(false, navLink.getAttribute('href'))
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
    if (e.key === 'Escape') {
      if (!palette.hidden) { closePalette(); return }
      if (!prog.sheet.hidden) { closeProgSheet(); prog.pill.focus(); return }
    }
    if (e.key === '/' && palette.hidden && !/input|textarea/i.test(document.activeElement.tagName)) {
      e.preventDefault()
      openPalette()
    }
  })
  let scrollRaf = 0
  addEventListener('scroll', () => {
    if (scrollRaf) return
    scrollRaf = requestAnimationFrame(() => { scrollRaf = 0; updateProgress(); updateNavCurrent() })
  }, { passive: true })

  /* ================= 初始化 ================= */
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
  splitHero()
  renderHero()
  renderParts()
  renderGallery()
  renderLog()
  renderTerms()
  preview('intro', introCard())
  observeStages()

  const m = location.hash.match(/^#a\/(.+)$/)
  const deepId = m && decodeURIComponent(m[1])
  if (deepId && BY_ID[deepId]) {
    history.replaceState({ id: deepId }, '', location.hash)
    setCounts(false)
    renderArticle(BY_ID[deepId])
    showView('article')
    showProgress()
  } else {
    setupReveal()
    if (!sessionStorage.getItem(INTRO_KEY)) playIntro()
    else setCounts(false)
    updateNavCurrent()
  }
})()
