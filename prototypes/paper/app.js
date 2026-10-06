(() => {
  'use strict'

  const EY = window.EY
  const { pad, esc, BY_ID, BY_TITLE } = EY
  const root = document.documentElement
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
  const canHover = matchMedia('(hover: hover)').matches
  const EASE = 'cubic-bezier(.65, 0, .35, 1)'
  const EASE_OUT = 'cubic-bezier(.33, 1, .68, 1)'
  const EASE_IN = 'cubic-bezier(.32, 0, .67, 0)'
  const PAGE_MS = 760
  const LAMP_MS = 780
  const $ = (s, el = document) => el.querySelector(s)
  const $$ = (s, el = document) => [...el.querySelectorAll(s)]

  const CN = ['〇', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十']
  const cnNum = (n) => (n <= 10 ? CN[n] : n < 20 ? `十${CN[n - 10]}` : `${CN[Math.floor(n / 10)]}十${n % 10 ? CN[n % 10] : ''}`)
  const fmtDate = (d) => {
    const [y, m, day] = d.split('-')
    return `${y} 年 ${+m} 月 ${+day} 日`
  }
  const CAS_ID = BY_TITLE['CAS'].id

  /* ================= 笔触工具 ================= */
  const f1 = (n) => Math.round(n * 10) / 10
  function rng(seed) {
    let s = (seed * 2654435761) >>> 0 || 1
    return () => {
      s = (s * 1664525 + 1013904223) >>> 0
      return s / 4294967296
    }
  }
  function wob(x1, y1, x2, y2, r, j = 1.2) {
    const len = Math.hypot(x2 - x1, y2 - y1) || 1
    const nx = -(y2 - y1) / len, ny = (x2 - x1) / len
    const bow = (r() - 0.5) * Math.min(3.5, len * 0.03) * 2
    const mx = (x1 + x2) / 2 + nx * bow, my = (y1 + y2) / 2 + ny * bow
    const jt = () => (r() - 0.5) * j
    return `M${f1(x1 + jt())} ${f1(y1 + jt())}Q${f1(mx)} ${f1(my)} ${f1(x2 + jt())} ${f1(y2 + jt())}`
  }
  function sketchRect(x, y, w, h, seed, j = 1.4) {
    const r = rng(seed), o = () => 0.5 + r() * 3
    return wob(x - o(), y, x + w + o(), y, r, j)
      + wob(x + w, y - o(), x + w, y + h + o(), r, j)
      + wob(x + w + o(), y + h, x - o(), y + h, r, j)
      + wob(x, y + h + o(), x, y - o(), r, j)
  }
  const boxPaths = (x, y, w, h, seed, cls = '') =>
    `<path class="sk ${cls}" d="${sketchRect(x, y, w, h, seed)}"/><path class="sk ghost ${cls}" d="${sketchRect(x, y, w, h, seed + 11, 2.2)}"/>`
  function sketchEllipse(cx, cy, rx, ry, seed, turns = 1.12) {
    const r = rng(seed), n = 16, a0 = r() * Math.PI * 2
    const pts = []
    for (let i = 0; i <= n * turns; i++) {
      const a = a0 + (i / n) * Math.PI * 2
      const k = 1 + (r() - 0.5) * 0.07 + (i / n) * 0.05
      pts.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k])
    }
    let d = `M${f1(pts[0][0])} ${f1(pts[0][1])}`
    for (let i = 1; i < pts.length - 1; i++) {
      const mx = (pts[i][0] + pts[i + 1][0]) / 2, my = (pts[i][1] + pts[i + 1][1]) / 2
      d += `Q${f1(pts[i][0])} ${f1(pts[i][1])} ${f1(mx)} ${f1(my)}`
    }
    return d
  }
  function sketchArrow(x1, y1, x2, y2, bend, seed, head = 9) {
    const r = rng(seed)
    const len = Math.hypot(x2 - x1, y2 - y1) || 1
    const nx = -(y2 - y1) / len, ny = (x2 - x1) / len
    const cx = (x1 + x2) / 2 + nx * bend + (r() - 0.5) * 3
    const cy = (y1 + y2) / 2 + ny * bend + (r() - 0.5) * 3
    const shaft = `M${f1(x1)} ${f1(y1)}Q${f1(cx)} ${f1(cy)} ${f1(x2)} ${f1(y2)}`
    const a = Math.atan2(y2 - cy, x2 - cx)
    const h1 = [x2 - head * Math.cos(a - 0.42), y2 - head * Math.sin(a - 0.42)]
    const h2 = [x2 - head * 0.9 * Math.cos(a + 0.5), y2 - head * 0.9 * Math.sin(a + 0.5)]
    const headD = `M${f1(h1[0])} ${f1(h1[1])}L${f1(x2)} ${f1(y2)}L${f1(h2[0])} ${f1(h2[1])}`
    const at = (t) => [(1 - t) ** 2 * x1 + 2 * (1 - t) * t * cx + t * t * x2, (1 - t) ** 2 * y1 + 2 * (1 - t) * t * cy + t * t * y2]
    const mid = at(0.5)
    const side = (k) => [mid[0] + nx * k, mid[1] + ny * k]
    return { shaft, head: headD, mid, at, side }
  }
  const cross = (x, y, s, seed) => {
    const r = rng(seed)
    return [wob(x - s, y - s, x + s, y + s, r, 1), wob(x + s, y - s * 1.1, x - s, y + s, r, 1)]
  }

  /* ================= 刊头开场：墨迹渗开 ================= */
  const mhTitle = $('#mhTitle')
  function splitTitle() {
    $$('.l1, .l2', mhTitle).forEach((line) => {
      const text = line.textContent.trim()
      line.textContent = ''
      ;[...text].forEach((ch) => {
        const s = document.createElement('span')
        s.className = 'ch'
        s.textContent = ch
        s.setAttribute('aria-hidden', 'true')
        line.append(s)
      })
    })
  }
  function playIntro() {
    sessionStorage.setItem('ey-intro-paper', '1')
    if (reduced) return
    const chars = $$('.ch', mhTitle)
    chars.forEach((c, i) => {
      const dx = (((i * 7) % 5) - 2) * 1.6
      const dy = (((i * 3) % 3) - 1) * 2.2 + 2
      c.getAnimations().forEach((a) => a.cancel())
      c.animate([
        { opacity: 0.38, filter: 'blur(5px)', transform: `translate(${dx}px, ${dy}px) scale(1.05)` },
        { opacity: 0.88, filter: 'blur(1.4px)', offset: 0.32 },
        { opacity: 1, filter: 'blur(0)', transform: 'none' },
      ], { duration: 900, delay: i * 24, easing: EASE_OUT, fill: 'backwards' })
    })
    const soft = ['.masthead .running-head', '.mh-kicker', '.mh-lede', '.mh-colophon', '.masthead .folio']
    soft.forEach((sel, i) => {
      const el = $(sel)
      el?.animate([{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }],
        { duration: 700, delay: 260 + i * 90, easing: EASE, fill: 'backwards' })
    })
    const fl = $('.mh-flourish path')
    fl?.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: 1000, delay: 620, easing: EASE, fill: 'backwards' })
  }

  /* ================= 目录与索引卡 ================= */
  const partsEl = $('#parts')
  const cardStage = $('#cardStage')
  let cardKey = null
  let cardTimer = 0

  function showCard(key, html, instant = false) {
    if (key === cardKey) return
    cardKey = key
    const old = $('.icard:not(.leaving)', cardStage)
    const card = document.createElement('div')
    card.className = 'icard'
    card.innerHTML = html
    cardStage.append(card)
    if (!old) return
    if (reduced || instant) { old.remove(); return }
    old.classList.add('leaving')
    old.animate([
      { transform: 'rotate(-.8deg)', opacity: 1 },
      { transform: 'translate(-16px, 22px) rotate(-3.2deg)', opacity: 0 },
    ], { duration: 460, easing: EASE, fill: 'forwards' }).onfinish = () => old.remove()
    card.animate([
      { transform: 'translate(14px, -18px) rotate(1.8deg)', opacity: 0 },
      { transform: 'rotate(-.8deg)', opacity: 1 },
    ], { duration: 580, delay: 60, easing: EASE, fill: 'backwards' })
  }
  const queueCard = (key, fn) => {
    clearTimeout(cardTimer)
    cardTimer = setTimeout(() => showCard(key, fn()), 70)
  }
  const partCard = (p, pi) => {
    const recent = EY.BY_DATE.filter((a) => a.part === p).slice(0, 3)
    return `<div class="ic-head"><span>索引卡</span><span>第${CN[pi + 1]}部</span></div>
      <div class="ic-title">${p.name}<small>${p.en}</small></div>
      <ul class="ic-lines">${p.chapters.map((c) => `<li><span>${c.name}</span><span>${cnNum(c.items.length)}篇</span></li>`).join('')}</ul>
      <p class="ic-hand">近来修订：${recent.map((a) => esc(a.title)).join('、')}</p>`
  }
  const artCard = (a) => `<div class="ic-head"><span>索引卡</span><span>${a.num}</span></div>
      <div class="ic-title">${esc(a.title)}</div>
      <p class="ic-sum">${a.summary}</p>
      <p class="ic-hand">${a.partName} · ${a.chapName} · 约 ${a.mins} 分钟${a.fig ? '<b>附手稿图</b>' : ''}</p>
      <p class="ic-date">修订于 ${fmtDate(a.date)}</p>`
  const introCard = () => `<div class="ic-head"><span>索引卡</span><span>导读</span></div>
      <div class="ic-title">从带图的篇目读起</div>
      <p class="ic-sum">标有「图」字的篇目附有可以亲手操作的原理手稿。</p>
      <ul class="ic-lines">${EY.ARTICLES.filter((a) => a.fig).map((a) => `<li><span>${esc(a.title)}</span><span>${a.num}</span></li>`).join('')}</ul>`

  const artLink = (a) => `<a href="#a/${a.id}" class="art-link" data-id="${a.id}"><span class="art-title">${esc(a.title)}</span>${a.fig ? '<span class="fig-mark" title="含交互图">图</span>' : ''}<span class="leader" aria-hidden="true"></span><span class="art-num">${a.num}</span></a>`

  function renderParts() {
    partsEl.innerHTML = EY.PARTS.map((p, pi) => `
      <div class="part" data-part="${p.id}">
        <button class="part-row" aria-expanded="false">
          <span class="part-no">第${CN[pi + 1]}部</span>
          <span class="part-name">${p.name}</span>
          <span class="leader" aria-hidden="true"></span>
          <span class="part-count">${p.count}<small>篇</small></span>
          <span class="part-toggle" aria-hidden="true"><svg viewBox="0 0 20 20"><path d="M5 7.5 Q 10.2 13.8 15 7.2" /></svg></span>
        </button>
        <div class="part-body" inert>
          <div class="part-inner">
            <div class="chapters">
              ${p.chapters.map((c, ci) => `
                <div class="chap" style="--i:${ci}">
                  <div class="chap-head"><span>${c.name}</span><span class="chap-count">${cnNum(c.items.length)}篇</span></div>
                  <ul>${EY.ARTICLES.filter((a) => a.part === p && a.chapCode === c.code).map((a) => `<li>${artLink(a)}</li>`).join('')}</ul>
                </div>`).join('')}
            </div>
          </div>
        </div>
      </div>`).join('')

    partsEl.addEventListener('click', (e) => {
      const row = e.target.closest('.part-row')
      if (row) setPartOpen(row.parentElement, !row.parentElement.classList.contains('open'))
    })
    const onHover = (e) => {
      const row = e.target.closest('.part-row')
      const link = e.target.closest('.art-link')
      if (row) {
        const pi = EY.PARTS.findIndex((x) => x.id === row.parentElement.dataset.part)
        queueCard(`part-${pi}`, () => partCard(EY.PARTS[pi], pi))
      }
      if (link) queueCard(link.dataset.id, () => artCard(BY_ID[link.dataset.id]))
    }
    partsEl.addEventListener('pointerover', onHover)
    partsEl.addEventListener('focusin', onHover)
    partsEl.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return
      const items = $$('.part-row, .part.open .art-link', partsEl)
      const i = items.indexOf(document.activeElement)
      if (i < 0) return
      e.preventDefault()
      items[Math.max(0, Math.min(items.length - 1, i + (e.key === 'ArrowDown' ? 1 : -1)))].focus()
    })
  }
  function setPartOpen(part, open, instant = false) {
    if (instant) {
      const els = $$('.part-body, .chap', part)
      els.forEach((el) => { el.style.transition = 'none' })
      requestAnimationFrame(() => requestAnimationFrame(() => els.forEach((el) => { el.style.transition = '' })))
    }
    part.classList.toggle('open', open)
    $('.part-row', part).setAttribute('aria-expanded', String(open))
    $('.part-body', part).inert = !open
  }

  /* ================= 图集：手稿缩略 ================= */
  function miniTimeline() {
    let css = ''
    let k = 0
    const kf = (frames) => {
      const name = `mk${k++}`
      css += `@keyframes ${name}{${frames}}`
      return `animation-name:${name}`
    }
    return {
      css: () => css,
      draw: (a, b) => kf(`0%,${a}%{stroke-dashoffset:1}${b}%,100%{stroke-dashoffset:0}`),
      show: (a, b) => kf(`0%,${a}%{opacity:0}${b}%,100%{opacity:1}`),
      kf,
    }
  }
  const tl = miniTimeline()
  const mPath = (d, cls, anim) => `<path class="${cls}${anim ? ' ma' : ''}" pathLength="1" d="${d}"${anim ? ` style="${anim}"` : ''}/>`
  const mText = (x, y, txt, cls, anim, size = 15) => `<text x="${x}" y="${y}" class="${cls}${anim ? ' ma' : ''}" font-size="${size}" text-anchor="middle"${anim ? ` style="${anim}"` : ''}>${txt}</text>`

  const MINI = {
    cas() {
      const a1 = sketchArrow(112, 70, 150, 114, 10, 3)
      const a2 = sketchArrow(248, 70, 222, 104, -8, 4)
      const a3 = sketchArrow(230, 140, 300, 98, 18, 5, 8)
      const a4 = sketchArrow(250, 84, 226, 124, -10, 6)
      const [c1, c2] = cross(222, 104, 6, 9)
      return `<g filter="url(#pen)">${boxPaths(22, 34, 88, 58, 1)}${boxPaths(250, 34, 88, 58, 2)}${boxPaths(134, 112, 92, 64, 3)}</g>
        ${mText(66, 69, 'T1', 'hand', '', 18)}${mText(294, 69, 'T2', 'hand', '', 18)}
        ${mText(180, 128, 'value', 'lab', '', 10)}${mText(158, 162, '0', 'hand', '', 26)}
        <g class="ma mfade" filter="url(#pen)">
          ${mPath(a1.shaft, 'ln', tl.draw(6, 15))}${mPath(a1.head, 'ln', tl.draw(14, 17))}
          ${mPath(wob(147, 155, 170, 149, rng(1), 0.5), 'ln acc', tl.draw(18, 21))}
          ${mPath(a2.shaft, 'ln', tl.draw(31, 39))}
          ${mPath(c1, 'ln acc', tl.draw(40, 43))}${mPath(c2, 'ln acc', tl.draw(42, 45))}
          ${mPath(a3.shaft, 'ln acc dash', tl.draw(46, 54))}${mPath(a3.head, 'ln acc', tl.draw(53, 56))}
          ${mPath(a4.shaft, 'ln', tl.draw(62, 70))}${mPath(a4.head, 'ln', tl.draw(69, 72))}
          ${mPath(wob(172, 155, 194, 149, rng(2), 0.5), 'ln acc', tl.draw(73, 76))}
        </g>
        <g class="ma mfade">
          ${mText(182, 162, '1', 'hand', tl.show(21, 26), 26)}
          ${mText(206, 162, '2', 'hand', tl.show(76, 81), 26)}
          ${mText(318, 124, '重试', 'hand acc', tl.show(53, 59), 15)}
        </g>`
    },
    loop() {
      const back = sketchArrow(204, 54, 44, 76, 34, 8, 8)
      const msgs = [0, 1, 2].map((k) => `<g class="ma m-msg" style="animation-delay:${-k * 1.33}s" filter="url(#pen)">${boxPaths(30, 91, 14, 22, 30 + k)}</g>`).join('')
      return `<g filter="url(#pen)">
          <path class="sk" d="${wob(22, 84, 152, 84, rng(11))}"/><path class="sk" d="${wob(22, 120, 152, 120, rng(12))}"/>
          <path class="sk" d="${sketchEllipse(248, 104, 54, 52, 13)}"/>
          <path class="ln faint dash" d="${back.shaft}"/><path class="ln faint" d="${back.head}"/>
        </g>
        ${mText(88, 142, 'MessageQueue', 'lab', '', 11)}${mText(248, 110, 'Looper', 'hand', '', 17)}
        ${mText(124, 36, 'Handler.post', 'hand faint-t', '', 13)}
        ${msgs}
        <g class="ma m-orbit"><circle cx="248" cy="50" r="5" class="dot" filter="url(#pen)"/></g>`
    },
    gen() {
      const zones = [['Eden', 20, 128], ['S0', 156, 48], ['S1', 212, 48], ['Old', 268, 72]]
      const objs = [[48, 92], [86, 122], [112, 82], [60, 140]]
      const c2 = cross(86, 122, 7, 21), c4 = cross(60, 140, 7, 22), c3 = cross(236, 124, 7, 23)
      const mv = (pts) => tl.kf(pts.map(([at, x, y, o = 1]) => `${at}%{transform:translate(${x}px,${y}px);opacity:${o}}`).join(''))
      return `<g filter="url(#pen)">${zones.map(([, x, w], i) => boxPaths(x, 46, w, 112, 40 + i)).join('')}</g>
        ${zones.map(([n, x]) => `<text x="${x + 8}" y="66" class="hand" font-size="14">${n}</text>`).join('')}
        <g class="ma mfade">
          <g class="ma" style="${mv([[0, 0, 0], [32, 0, 0], [44, 132, 4], [56, 132, 4], [66, 188, 4], [80, 188, 4], [88, 256, 10], [100, 256, 10]])}"><circle cx="${objs[0][0]}" cy="${objs[0][1]}" r="7" class="obj" filter="url(#pen)"/></g>
          <g class="ma" style="${mv([[0, 0, 0], [24, 0, 0], [30, 0, 0, 0.22], [100, 0, 0, 0.22]])}"><circle cx="${objs[1][0]}" cy="${objs[1][1]}" r="7" class="obj" filter="url(#pen)"/></g>
          <g class="ma" style="${mv([[0, 0, 0], [32, 0, 0], [44, 124, 42], [56, 124, 42], [66, 124, 42], [76, 124, 42], [80, 124, 42, 0.22], [100, 124, 42, 0.22]])}"><circle cx="${objs[2][0]}" cy="${objs[2][1]}" r="7" class="obj" filter="url(#pen)"/></g>
          <g class="ma" style="${mv([[0, 0, 0], [24, 0, 0], [30, 0, 0, 0.22], [100, 0, 0, 0.22]])}"><circle cx="${objs[3][0]}" cy="${objs[3][1]}" r="7" class="obj" filter="url(#pen)"/></g>
          <g filter="url(#pen)">
            ${mPath(c2[0], 'ln acc', tl.draw(17, 20))}${mPath(c2[1], 'ln acc', tl.draw(19, 22))}
            ${mPath(c4[0], 'ln acc', tl.draw(20, 23))}${mPath(c4[1], 'ln acc', tl.draw(22, 25))}
            ${mPath(c3[0], 'ln acc', tl.draw(70, 73))}${mPath(c3[1], 'ln acc', tl.draw(72, 75))}
          </g>
          ${mText(304, 146, '晋升', 'hand acc', tl.show(86, 91), 14)}
          ${mText(84, 182, 'Minor GC', 'lab', tl.show(14, 20), 11)}
        </g>`
    },
    bin() {
      const bars = Array.from({ length: 12 }, (_, i) => {
        const h = 18 + i * 8
        return boxPaths(26 + i * 26, 150 - h, 16, h, 60 + i)
      })
      const ptr = (cx, label, cls, anim) => `<g class="ma ${cls}" style="${anim}"><path class="ln" pathLength="1" d="${wob(cx, 176, cx, 160, rng(cx), 0.6)}"/><path class="ln" pathLength="1" d="M${cx - 5} 166L${cx} 159L${cx + 5} 166"/>${mText(cx, 192, label, 'hand', '', 13)}</g>`
      const mv = (pts) => tl.kf(pts.map(([at, x, o = 1]) => `${at}%{transform:translateX(${x}px);opacity:${o}}`).join(''))
      return `<g class="ma m-dim" filter="url(#pen)">${bars.slice(0, 6).join('')}</g>
        <g filter="url(#pen)">${bars.slice(6).join('')}</g>
        <g class="ma mfade" filter="url(#pen-soft)">
          ${ptr(34, 'lo', '', mv([[0, 0], [36, 0], [46, 156], [100, 156]]))}
          ${ptr(320, 'hi', '', '')}
          ${ptr(164, 'mid', 'acc-g', mv([[0, 0, 0], [12, 0, 0], [18, 0, 1], [50, 0, 1], [60, 78, 1], [100, 78, 1]]))}
          ${mPath(sketchEllipse(242, 108, 17, 50, 77), 'ln acc', tl.draw(64, 76))}
          ${mText(242, 48, '找到', 'hand acc', tl.show(74, 80), 14)}
        </g>`
    },
  }
  const DUR = { cas: '7s', loop: '4s', gen: '6.5s', bin: '6s' }

  function renderGallery() {
    const track = $('#galleryTrack')
    track.innerHTML = EY.ARTICLES.filter((a) => a.fig).map((a, i) => `
      <div class="plate" data-id="${a.id}" tabindex="0" role="link" aria-label="${esc(a.title)}">
        <div class="plate-fig" style="--dur:${DUR[a.fig.kind]}">
          <svg viewBox="0 0 360 200" class="m-${a.fig.kind}" aria-hidden="true">${MINI[a.fig.kind]()}</svg>
        </div>
        <div class="plate-cap">
          <span class="plate-no" data-vt="num">图${CN[i + 1]} · ${a.num}</span>
          <h3 data-vt="title">${a.fig.caption}</h3>
        </div>
      </div>`).join('')
    const st = document.createElement('style')
    st.textContent = tl.css()
    document.head.append(st)

    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => en.target.classList.toggle('running', en.isIntersecting))
    }, { threshold: 0.2 })
    $$('.plate', track).forEach((c) => io.observe(c))

    const g = $('#gallery')
    let down = false, startX = 0, startL = 0, moved = 0, lastX = 0, lastT = 0, vel = 0, raf = 0
    g.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return
      down = true
      moved = 0
      startX = lastX = e.clientX
      startL = g.scrollLeft
      lastT = performance.now()
      vel = 0
      cancelAnimationFrame(raf)
      e.preventDefault()
    })
    addEventListener('pointermove', (e) => {
      if (!down) return
      const now = performance.now()
      g.scrollLeft = startL - (e.clientX - startX)
      moved = Math.max(moved, Math.abs(e.clientX - startX))
      vel = (e.clientX - lastX) / Math.max(1, now - lastT)
      lastX = e.clientX
      lastT = now
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
        v *= 0.93
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
    $('#log').innerHTML = EY.BY_DATE.slice(0, 8).map((a) => `
      <li class="log-row" tabindex="0" data-id="${a.id}">
        <span class="log-date">${a.date.replace(/-/g, '.')}</span>
        <span class="art-num">${a.num}</span>
        <span class="art-title">${esc(a.title)}</span>
        <span class="log-part">${a.partName} · ${a.chapName}</span>
        <span class="log-go" aria-hidden="true">翻开 →</span>
      </li>`).join('')
  }
  function renderTerms() {
    const groups = {}
    EY.TERMS.forEach(([g, term, title]) => { (groups[g] ||= []).push([term, BY_TITLE[title]]) })
    $('#terms').innerHTML = Object.entries(groups).map(([g, list]) => `
      <div class="term-group"><h4>${g}</h4>
        ${list.map(([term, a]) => `<a href="#a/${a.id}" class="term" data-id="${a.id}" data-peek><span class="art-title">${esc(term)}</span><span class="leader" aria-hidden="true"></span><span class="term-num">${a.num}</span></a>`).join('')}
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

  const refs = (html) => EY.renderRefs(html, (a, text) => `<a href="#a/${a.id}" class="ref" data-id="${a.id}" data-peek>${text}</a>`)
  const codeBlock = () => `
    <figure class="listing">
      <figcaption><span>清单一 · AtomicInteger 与 Unsafe</span>
        <button class="copy-btn" data-copy><span class="copy-text">抄录</span><svg class="copy-tick" viewBox="0 0 20 14" aria-hidden="true"><path pathLength="1" d="M2 8 L7 12 L18 2" /></svg></button>
      </figcaption>
      <pre><code>${EY.highlightJava(EY.JAVA_SRC)}</code></pre>
    </figure>`

  function casBody() {
    const A = EY.CAS_ARTICLE
    let noteNo = 0
    return A.sections.map((sec, i) => {
      const head = `<div class="pg sec-head"><div class="sec-no">第${CN[i + 1]}节</div><h2 class="pg-main">${sec.title}</h2></div>`
      if (sec.scrolly) {
        return `<section class="a-sec" data-sec="${i}" data-name="${sec.title}">${head}
          <div class="scrolly">
            <div class="scrolly-text">${A.scrollySteps.map((s, k) => `
              <div class="step" data-step="${s.step}"><span class="step-label"><b>${pad(k + 1)}</b>${s.label}</span><p>${s.text}</p></div>`).join('')}
            </div>
            <div class="scrolly-fig">${casFigure()}</div>
          </div>
        </section>`
      }
      const body = refs(sec.html).replace('{{code}}', codeBlock())
      const notes = (sec.notes || []).map((n) => `<aside class="mnote"><span class="mnote-label">注${CN[++noteNo]} · ${n.label}</span>${refs(n.html)}</aside>`).join('')
      return `<section class="a-sec" data-sec="${i}" data-name="${sec.title}">${head}
        <div class="pg"><div class="prose pg-main">${body}</div><div class="pg-side">${notes}</div></div>
      </section>`
    }).join('')
  }

  function renderArticle(a) {
    currentId = a.id
    const isCas = a.id === CAS_ID
    const created = isCas ? `初稿 ${fmtDate(EY.CAS_ARTICLE.created)} · ` : ''
    articleEl.innerHTML = `
      <div class="running-head a-rh"><span>${a.partName} · ${a.chapName}</span><span>${a.num}</span></div>
      <header class="a-head pg">
        <div class="pg-wide">
          <button class="a-back" data-action="back">← 返回目录</button>
          <span class="a-num" style="view-transition-name: vt-num">${a.num}</span>
          <h1 class="a-title" style="view-transition-name: vt-title">${esc(a.title)}</h1>
          <p class="a-meta">
            <span>第${CN[+a.part.id]}部 ${a.partName}</span><i>·</i>
            <span>${a.chapName} 第 ${a.index} 篇 / 共 ${a.total} 篇</span><i>·</i>
            <span>${created}修订 ${fmtDate(a.date)}</span><i>·</i>
            <span>约 ${a.mins} 分钟</span>
          </p>
          <div class="rule" aria-hidden="true"></div>
        </div>
      </header>
      ${isCas ? casBody() : `
        <section class="a-sec" data-sec="0" data-name="${esc(a.title)}">
          <div class="pg"><div class="pg-main prose stub">
            <p>${a.summary}</p>
            <p class="stub-hand">演示页只收录了《CAS》的完整正文与手稿图，这一篇暂且留白。</p>
            <button class="stub-btn" data-id="${CAS_ID}">翻到 ${CAS_ID} CAS →</button>
          </div></div>
        </section>`}
      <div class="a-end" aria-hidden="true">❦</div>`
    document.title = `${a.num} ${a.title} · Endlessyoung`
    if (isCas) {
      mountCas($('#casFig'))
      mountScrolly()
    }
    setupReader(a)
  }

  function showView(v) {
    view = v
    viewIndex.hidden = v !== 'index'
    viewArticle.hidden = v !== 'article'
    root.classList.toggle('reading', v === 'article')
    if (v === 'index') {
      document.title = 'Endlessyoung · 纸本（改版演示）'
      readData = null
      stopScrolly()
    }
  }

  /* ================= 页面转场：翻页 ================= */
  let vtToken = 0
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
  function tagHeader() {
    const n = $('.a-num', articleEl)
    const t = $('.a-title', articleEl)
    if (n) n.style.viewTransitionName = 'vt-num'
    if (t) t.style.viewTransitionName = 'vt-title'
  }
  function pageTurn(update, dir) {
    if (!document.startViewTransition || reduced) { update(); return Promise.resolve() }
    const token = ++vtToken
    root.classList.remove('vt-fwd', 'vt-back')
    root.classList.add('vt-page', dir === 'back' ? 'vt-back' : 'vt-fwd')
    const vt = document.startViewTransition(update)
    return vt.finished.catch(() => {}).finally(() => {
      if (token === vtToken) root.classList.remove('vt-page', 'vt-fwd', 'vt-back')
    })
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
    pageTurn(() => {
      closePalette(true)
      clearAllVT()
      renderArticle(a)
      showView('article')
      scrollTo(0, 0)
    }, 'fwd')
  }

  function goHome(fromHistory = false, thenScrollTo = null) {
    if (view === 'index') {
      if (thenScrollTo) $(thenScrollTo)?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' })
      else scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' })
      return
    }
    if (!fromHistory) history.pushState({}, '', location.pathname)
    const id = currentId
    clearAllVT()
    if (!thenScrollTo) tagHeader()
    pageTurn(() => {
      clearAllVT()
      showView('index')
      if (thenScrollTo) { $(thenScrollTo)?.scrollIntoView(); return }
      let target = null
      if (lastIndexSrc && lastIndexSrc.dataset.id === id && lastIndexSrc.isConnected) {
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
    }, 'back').then(() => clearAllVT())
  }

  addEventListener('popstate', (e) => {
    if (e.state && e.state.id) openArticle(e.state.id, null, true)
    else {
      const m = location.hash.match(/^#a\/(.+)$/)
      if (m && BY_ID[decodeURIComponent(m[1])]) openArticle(decodeURIComponent(m[1]), null, true)
      else goHome(true)
    }
  })

  /* ================= 阅读进度：书签丝带与页码 ================= */
  const ribbon = $('#ribbon')
  const folio = $('#readerFolio')
  let readData = null
  let folioHTML = ''
  function setupReader(a) {
    readData = { mins: a.mins, title: a.title, secs: $$('[data-sec]', articleEl) }
    requestAnimationFrame(updateReader)
  }
  function updateReader() {
    if (!readData || view !== 'article') return
    const docH = root.scrollHeight
    const max = Math.max(1, docH - innerHeight)
    const p = Math.min(1, Math.max(0, scrollY / max))
    ribbon.style.setProperty('--p', p.toFixed(4))
    const total = Math.max(1, Math.ceil(docH / innerHeight))
    const page = Math.min(total, Math.floor((scrollY + innerHeight * 0.5) / innerHeight) + 1)
    let name = readData.title
    readData.secs.forEach((s) => { if (s.getBoundingClientRect().top < innerHeight * 0.42) name = s.dataset.name })
    const left = Math.max(0, Math.ceil(readData.mins * (1 - p)))
    const html = `<span>第 ${page} 页 / 共 ${total} 页</span><i></i><span class="rf-sec">${name}</span><i></i><span>${left ? `余约 ${left} 分钟` : '已读完'}</span>`
    if (html !== folioHTML) {
      folioHTML = html
      folio.innerHTML = html
    }
  }
  let readRaf = 0
  addEventListener('scroll', () => { cancelAnimationFrame(readRaf); readRaf = requestAnimationFrame(updateReader) }, { passive: true })
  addEventListener('resize', () => updateReader())

  /* ================= CAS 手稿交互图 ================= */
  const S = EY.CAS_STEPS
  const FW = 600, FH = 320
  const P = (x, y) => `left:${((x / FW) * 100).toFixed(3)}%;top:${((y / FH) * 100).toFixed(3)}%`
  const TB = { t1: [16, 16, 176, 176], t2: [408, 16, 176, 176] }
  const MB = [228, 150, 144, 132]
  const ROWS = [['expect', 88], ['update', 128], ['retry', 168]]
  const GEO = {
    read: { from: [256, 146], to: [200, 86], bend: 16 },
    write: { from: [200, 128], to: [225, 198], bend: 14 },
    fail: { from: [200, 130], to: [225, 196], bend: 14 },
    bounce: { from: [232, 246], to: [104, 200], bend: -24 },
    retryAt: [58, 248],
  }
  const STRIKE = '<svg class="strike" viewBox="0 0 40 20" preserveAspectRatio="none" aria-hidden="true"><path pathLength="1" d="M1 13.5 Q 18 8.5 39 9.5"/></svg>'
  const getter = (key) => (key === 'mem' ? (s) => s.v : ((t, f) => (s) => s[t][f])(...key.split('.')))

  function casFigure() {
    const tBoxes = ['t1', 't2'].map((t, k) => {
      const [x, y, w] = TB[t]
      const rules = [60, 108, 148].map((ry, j) => `<path class="sk faint" d="${wob(x + 10, ry, x + w - 10, ry, rng(40 + k * 5 + j), 0.8)}"/>`).join('')
      return `<g class="tbox" data-box="${t}">${boxPaths(x, y, w, TB[t][3], 20 + k * 7)}${rules}</g>`
    }).join('')
    const thread = (t) => {
      const [x, y, w] = TB[t]
      return `<span class="th-name" style="${P(x + 16, y + 25)}">${t.toUpperCase()}</span>
        <span class="th-status" data-status="${t}" style="${P(x + w - 12, y + 25)}"></span>
        ${ROWS.map(([f, ry]) => `<span class="row-label" style="${P(x + 16, ry)}">${f}</span><span class="slot" data-slot="${t}.${f}" data-link="${f}" style="${P(x + 82, ry)};width:${((w - 90) / FW) * 100}%"></span>`).join('')}`
    }
    return `
      <figure class="fig" id="casFig">
        <figcaption class="fig-head"><span>图三 · 两个线程竞争同一个变量</span><span class="fig-step">第 <b class="fig-cur">00</b> 步 / 共 ${pad(S.length - 1)} 步</span></figcaption>
        <div class="cas-stage">
          <svg class="cas-svg" viewBox="0 0 ${FW} ${FH}" aria-hidden="true">
            <g class="boxes" filter="url(#pen)">${tBoxes}<g class="mbox">${boxPaths(...MB, 31)}</g></g>
            <g class="fx" filter="url(#pen)"></g>
          </svg>
          <div class="mem-hit" data-link="memory" style="${P(MB[0], MB[1])};width:${(MB[2] / FW) * 100}%;height:${(MB[3] / FH) * 100}%"></div>
          ${thread('t1')}${thread('t2')}
          <span class="mem-label" style="${P(300, 172)}">AtomicInteger.value</span>
          <span class="slot mem-slot" data-slot="mem" data-link="memory" style="${P(300, 220)}"></span>
          <span class="mem-addr" style="${P(300, 262)}">@0x7F3A</span>
          <div class="fx-notes"></div>
        </div>
        <div class="fig-code">${EY.CAS_CODE.map((l, i) => `<div class="cl" data-line="${i + 1}"><span class="cl-mark"></span><span class="cl-no">${i + 1}</span><code>${esc(l)}</code></div>`).join('')}</div>
        <p class="fig-log"></p>
        <svg class="fig-prog" viewBox="0 0 600 8" preserveAspectRatio="none" aria-hidden="true">
          <path class="prog-base" d="M2 4.5 Q 150 2.5 300 4.2 T 598 3.8"/>
          <path class="prog-fill" pathLength="1" d="M2 4.5 Q 150 2.5 300 4.2 T 598 3.8"/>
        </svg>
        <div class="fig-ctrl">
          <button data-c="reset">重置</button>
          <button data-c="prev">上一步</button>
          <button data-c="next" class="primary">单步</button>
          <button data-c="play">播放</button>
          <button data-c="speed" class="speed">速度 1×</button>
        </div>
      </figure>`
  }

  let cas = null
  function mountCas(fig) {
    const stage = $('.cas-stage', fig)
    const fxG = $('.fx', fig)
    const notes = $('.fx-notes', fig)
    const lines = $$('.cl', fig)
    const curEl = $('.fig-cur', fig)
    const logEl = $('.fig-log', fig)
    const progEl = $('.prog-fill', fig)
    const playBtn = $('[data-c="play"]', fig)
    const speedBtn = $('[data-c="speed"]', fig)
    const slots = Object.fromEntries($$('[data-slot]', fig).map((el) => [el.dataset.slot, el]))
    const statusEls = { t1: $('[data-status="t1"]', fig), t2: $('[data-status="t2"]', fig) }
    const boxes = { t1: $('[data-box="t1"]', fig), t2: $('[data-box="t2"]', fig) }
    const last = S.length - 1
    const speeds = [1, 2, 0.5]
    let speedIdx = 0
    let cur = 0
    let timer = 0
    let playing = false
    let animOn = false
    let live = []
    let ghosts = []
    const spd = () => speeds[speedIdx]

    const A = (el, kf, o) => {
      if (!animOn || !el) return null
      const a = el.animate(kf, { easing: EASE, fill: 'backwards', ...o, duration: o.duration / spd(), delay: (o.delay || 0) / spd() })
      live.push(a)
      return a
    }
    const inkIn = (el, delay = 0, dur = 420) => A(el, [
      { clipPath: 'inset(-30% 100% -30% -10%)', opacity: 0.4, filter: 'blur(1.2px)' },
      { clipPath: 'inset(-30% -10% -30% -10%)', opacity: 1, filter: 'blur(0)' },
    ], { delay, duration: dur, easing: 'cubic-bezier(.45, .05, .55, .95)' })
    const drawIn = (el, delay, duration) => A(el, [{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { delay, duration })

    function ghostOf(node, delay) {
      if (!animOn || !node) return
      const sr = stage.getBoundingClientRect()
      const r = node.getBoundingClientRect()
      const cs = getComputedStyle(node)
      const g = node.cloneNode(true)
      g.classList.add('ghost-v')
      Object.assign(g.style, {
        left: `${r.left - sr.left}px`, top: `${r.top - sr.top}px`,
        fontSize: cs.fontSize, fontFamily: cs.fontFamily, color: cs.color,
      })
      stage.append(g)
      ghosts.push(g)
      const a = g.animate([{ opacity: +cs.opacity || 1 }, { opacity: 0 }], { duration: 320 / spd(), delay: delay / spd(), fill: 'forwards', easing: EASE })
      live.push(a)
      a.onfinish = () => g.remove()
    }

    function flush() {
      live.forEach((a) => a.cancel())
      live = []
      ghosts.forEach((g) => g.remove())
      ghosts = []
    }

    function hist(key, n) {
      const g = getter(key)
      const val = g(S[n])
      for (let k = n; k >= 1; k--) {
        if (String(g(S[k])) !== String(g(S[k - 1]))) return { prev: g(S[k - 1]), val, at: k }
      }
      return { prev: undefined, val, at: 0 }
    }

    function renderSlot(key, n, delay) {
      const el = slots[key]
      const { prev, val, at } = hist(key, n)
      const changed = animOn && at === n
      let fromRect = null
      if (changed) {
        fromRect = $('.v.cur', el)?.getBoundingClientRect()
        ghostOf($('.v.old', el), delay)
      }
      const showOld = prev !== undefined && prev !== '—' && String(prev) !== String(val)
      el.innerHTML = `${showOld ? `<span class="v old">${prev}${STRIKE}</span>` : ''}<span class="v cur">${val}</span>`
      if (!changed) return
      const oldEl = $('.v.old', el)
      let t = delay
      if (oldEl) {
        if (fromRect) {
          const r = oldEl.getBoundingClientRect()
          const dx = fromRect.left - r.left, dy = fromRect.top - r.top
          if (Math.abs(dx) + Math.abs(dy) > 0.5) {
            A(oldEl, [{ transform: `translate(${dx}px, ${dy}px)`, fontSize: getComputedStyle($('.v.cur', el)).fontSize }, { transform: 'none' }], { delay: t, duration: 340 })
            t += 300
          }
        }
        A(oldEl, [{ opacity: 1 }, { opacity: 0.42 }], { delay: t + 160, duration: 320 })
        drawIn($('path', oldEl), t, 260)
        t += 220
      }
      inkIn($('.v.cur', el), t)
    }

    function renderStatus(t, n) {
      const el = statusEls[t]
      const st = S[n][t]
      const prev = n > 0 ? S[n - 1][t] : null
      const changed = animOn && prev && (prev.status !== st.status || prev.cls !== st.cls)
      if (changed) ghostOf(el.firstElementChild, 0)
      el.className = `th-status ${st.cls}`
      const ul = st.cls === 'ok' ? 'M1 5 Q 30 2.5 59 4.5' : 'M1 4 Q 5 1.5 9 4 T 17 4 T 25 4 T 33 4 T 41 4 T 49 4 T 59 4'
      el.innerHTML = `<span class="st">${st.status}${st.cls ? `<svg class="st-ul" viewBox="0 0 60 8" preserveAspectRatio="none" aria-hidden="true"><path pathLength="1" d="${ul}"/></svg>` : ''}</span>`
      if (changed) {
        inkIn(el.firstElementChild, 140)
        drawIn($('path', el), 520, 380)
      }
    }

    function drawFx(n) {
      fxG.innerHTML = ''
      notes.innerHTML = ''
      const s = S[n]
      if (!s.fx || !s.actor) return
      const t = s.actor
      const m = (p) => (t === 't1' ? p : [FW - p[0], p[1]])
      const B = (b) => (t === 't1' ? b : -b)
      const prevS = S[n - 1]
      const path = (d, cls) => {
        fxG.insertAdjacentHTML('beforeend', `<path class="draw ${cls}" pathLength="1" d="${d}"/>`)
        return fxG.lastElementChild
      }
      const note = (pt, html, cls = '') => {
        notes.insertAdjacentHTML('beforeend', `<span class="fx-note ${cls}" style="${P(pt[0], pt[1])}">${html}</span>`)
        return notes.lastElementChild
      }
      const arrow = (g, seed) => sketchArrow(...m(g.from), ...m(g.to), B(g.bend), seed)
      const lab = (ar) => {
        const a = ar.side(16), b = ar.side(-16)
        return Math.abs(a[0] - FW / 2) < Math.abs(b[0] - FW / 2) ? a : b
      }
      if (s.fx === 'read') {
        const ar = arrow(GEO.read, n)
        drawIn(path(ar.shaft, 'pen-2'), 0, 480)
        drawIn(path(ar.head, 'pen-2'), 440, 160)
        inkIn(note(lab(ar), String(s.v), 'val'), 260)
      } else if (s.fx === 'write') {
        const ar = arrow(GEO.write, n)
        drawIn(path(ar.shaft, 'pen'), 0, 480)
        drawIn(path(ar.head, 'pen'), 440, 160)
        inkIn(note(lab(ar), String(s[t].update), 'val'), 240)
        inkIn(note([300, 302], `内存 ${prevS.v} 等于预期 ${prevS[t].expect}，写入 ${s.v}`, 'memo'), 980, 560)
      } else if (s.fx === 'fail') {
        const ar = arrow(GEO.fail, n)
        const hit = ar.at(0.62)
        drawIn(path(ar.shaft, 'pen'), 0, 420)
        drawIn(path(ar.head, 'pen'), 380, 140)
        const [c1, c2] = cross(hit[0], hit[1], 7, n)
        drawIn(path(c1, 'acc'), 440, 150)
        drawIn(path(c2, 'acc'), 570, 150)
        inkIn(note([300, 302], `内存 ${s.v} 不等于预期 ${s[t].expect}，拒绝写入`, 'memo acc'), 520, 560)
        const bk = arrow(GEO.bounce, n + 3)
        drawIn(path(bk.shaft, 'acc'), 760, 460)
        drawIn(path(bk.head, 'acc'), 1180, 160)
        inkIn(note(m(GEO.retryAt), '重试', 'retry'), 980, 460)
      }
    }

    function renderCode(n) {
      const s = S[n]
      const p = n > 0 ? S[n - 1] : null
      lines.forEach((l) => {
        const k = +l.dataset.line
        const mark = $('.cl-mark', l)
        mark.innerHTML = `${s.t1.line === k ? '<i class="m1">T1</i>' : ''}${s.t2.line === k ? '<i class="m2">T2</i>' : ''}`
        if (p) {
          if (s.t1.line === k && p.t1.line !== k) inkIn($('.m1', mark), 0, 320)
          if (s.t2.line === k && p.t2.line !== k) inkIn($('.m2', mark), 0, 320)
        }
        l.classList.toggle('now', !!s.actor && s[s.actor].line === k)
      })
    }

    function render(n) {
      const s = S[n]
      const slotDelay = s.fx === 'read' ? 500 : s.fx === 'fail' ? 1000 : 0
      for (const t of ['t1', 't2']) {
        boxes[t].classList.toggle('active', s.actor === t)
        renderStatus(t, n)
        ROWS.forEach(([f]) => renderSlot(`${t}.${f}`, n, slotDelay))
      }
      renderSlot('mem', n, s.fx === 'write' ? 540 : 0)
      drawFx(n)
      renderCode(n)
      curEl.textContent = pad(n)
      logEl.innerHTML = s.log
      A(logEl, [{ opacity: 0.25, filter: 'blur(1.5px)' }, { opacity: 1, filter: 'blur(0)' }], { duration: 520 })
      progEl.style.strokeDashoffset = String(1 - n / last)
    }

    const stepMs = (n) => {
      const fx = S[n]?.fx
      return (fx === 'fail' ? 1450 : fx ? 1150 : 700) / spd()
    }

    function go(n, animate) {
      flush()
      const prev = cur
      cur = Math.max(0, Math.min(last, n))
      animOn = !!animate && !reduced && cur === prev + 1
      render(cur)
      animOn = false
    }
    function stop() {
      playing = false
      clearTimeout(timer)
      playBtn.textContent = '播放'
      fig.classList.remove('playing')
    }
    function play() {
      if (cur >= last) go(0, false)
      playing = true
      playBtn.textContent = '暂停'
      fig.classList.add('playing')
      const tick = () => {
        if (!playing) return
        if (cur >= last) { stop(); return }
        go(cur + 1, true)
        timer = setTimeout(tick, stepMs(cur) + 420 / spd())
      }
      timer = setTimeout(tick, 200)
    }
    function runTo(target) {
      stop()
      if (target === cur) return
      if (target < cur || target - cur > 5) { go(target, false); return }
      const tick = () => {
        if (cur >= target) return
        go(cur + 1, true)
        if (cur < target) timer = setTimeout(tick, stepMs(cur) * 0.8)
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
      if (c === 'play') (playing ? stop() : play())
      if (c === 'speed') {
        speedIdx = (speedIdx + 1) % speeds.length
        b.textContent = `速度 ${spd()}×`
      }
    })

    const clearRel = () => $$('.rel', fig).forEach((el) => el.classList.remove('rel'))
    fig.addEventListener('pointerover', (e) => {
      const line = e.target.closest('.cl')
      const part = e.target.closest('[data-link]')
      clearRel()
      if (line) {
        const k = +line.dataset.line
        line.classList.add('rel')
        Object.entries(EY.CAS_LINKS).forEach(([key, ls]) => {
          if (ls.includes(k)) $$(`[data-link="${key}"]`, fig).forEach((el) => el.classList.add('rel'))
        })
      } else if (part) {
        $$(`[data-link="${part.dataset.link}"]`, fig).forEach((el) => el.classList.add('rel'))
        ;(EY.CAS_LINKS[part.dataset.link] || []).forEach((k) => $(`.cl[data-line="${k}"]`, fig)?.classList.add('rel'))
      }
    })
    fig.addEventListener('pointerleave', clearRel)

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

  /* ================= 抄录（复制） ================= */
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-copy]')
    if (!b) return
    navigator.clipboard?.writeText(EY.JAVA_SRC).catch(() => {})
    const txt = $('.copy-text', b)
    const swap = (s) => {
      txt.textContent = s
      if (!reduced) {
        txt.animate([
          { clipPath: 'inset(-20% 100% -20% 0)', opacity: 0.5 },
          { clipPath: 'inset(-20% 0 -20% 0)', opacity: 1 },
        ], { duration: 420, easing: EASE })
      }
    }
    b.classList.add('done')
    swap('已抄录')
    clearTimeout(b._t)
    b._t = setTimeout(() => { b.classList.remove('done'); swap('抄录') }, 1900)
  })

  /* ================= 链接预览：脚注小条 ================= */
  const peek = $('#peek')
  let peekTimer = 0, hideTimer = 0, peekFor = null
  function showPeek(el) {
    const a = BY_ID[el.dataset.id]
    if (!a) return
    peekFor = el
    peek.getAnimations().forEach((x) => x.cancel())
    peek.innerHTML = `<div class="peek-head"><span class="peek-mark">注</span><span>${a.num}</span></div>
      <h5>${esc(a.title)}</h5><p>${a.summary}</p>
      <div class="peek-foot"><span>${a.partName} · ${a.chapName}</span><span>约 ${a.mins} 分钟${a.fig ? ' · 附图' : ''}</span></div>`
    peek.hidden = false
    const r = el.getBoundingClientRect()
    const w = peek.offsetWidth, h = peek.offsetHeight
    const left = Math.min(Math.max(12, r.left + r.width / 2 - w / 2), innerWidth - w - 12)
    const below = r.bottom + 14 + h < innerHeight
    const top = Math.min(Math.max(12, below ? r.bottom + 10 : r.top - h - 10), innerHeight - h - 12)
    peek.style.left = `${left}px`
    peek.style.top = `${top}px`
    if (!reduced) {
      peek.animate([
        { opacity: 0, transform: `translateY(${below ? -5 : 5}px) rotate(-.4deg)` },
        { opacity: 1, transform: 'rotate(-.4deg)' },
      ], { duration: 420, easing: EASE })
    }
  }
  function hidePeek(instant = false) {
    clearTimeout(peekTimer)
    if (peek.hidden) return
    peekFor = null
    if (instant || reduced) { peek.hidden = true; return }
    peek.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 220, easing: EASE_IN })
      .onfinish = () => { if (!peekFor) peek.hidden = true }
  }
  if (canHover) {
    document.addEventListener('pointerover', (e) => {
      const el = e.target.closest('[data-peek]')
      if (el) {
        clearTimeout(hideTimer)
        if (el === peekFor) return
        clearTimeout(peekTimer)
        peekTimer = setTimeout(() => showPeek(el), 300)
      } else if (e.target.closest('#peek')) {
        clearTimeout(hideTimer)
      }
    })
    document.addEventListener('pointerout', (e) => {
      const el = e.target.closest('[data-peek], #peek')
      if (!el || (e.relatedTarget && el.contains(e.relatedTarget))) return
      clearTimeout(peekTimer)
      hideTimer = setTimeout(() => hidePeek(), 180)
    })
    addEventListener('scroll', () => { if (!peek.hidden) hidePeek() }, { passive: true })
  }

  /* ================= Ctrl K 卡片目录 ================= */
  const palette = $('#palette')
  const pInput = $('#paletteInput')
  const pList = $('#paletteList')
  const pPreview = $('#palettePreview')
  const pCount = $('#paletteCount')
  const nodeCache = new Map()
  let results = []
  let active = 0
  let query = ''
  let lastFocus = null

  function openPalette() {
    if (!palette.hidden) return
    lastFocus = document.activeElement
    hidePeek(true)
    palette.hidden = false
    root.classList.add('palette-open')
    pInput.value = ''
    query = ''
    pList.textContent = ''
    filter()
    pInput.focus()
    if (!reduced) {
      $('.palette-panel', palette).animate([
        { opacity: 0, transform: 'translateY(26px) rotate(-.6deg)' },
        { opacity: 1, transform: 'none' },
      ], { duration: 520, easing: EASE })
      $('.palette-backdrop', palette).animate([{ opacity: 0 }, { opacity: 1 }], { duration: 420, easing: EASE })
    }
  }
  function closePalette(instant = false) {
    if (palette.hidden) return
    root.classList.remove('palette-open')
    const done = () => {
      palette.hidden = true
      if (!instant && lastFocus?.isConnected) lastFocus.focus({ preventScroll: true })
    }
    if (instant || reduced) { done(); return }
    $('.palette-backdrop', palette).animate([{ opacity: 1 }, { opacity: 0 }], { duration: 280, easing: EASE, fill: 'forwards' })
    $('.palette-panel', palette).animate([
      { opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(14px)' },
    ], { duration: 280, easing: EASE_IN }).onfinish = done
  }
  function hl(text, q) {
    const t = esc(text)
    if (!q) return t
    const i = text.toLowerCase().indexOf(q)
    if (i < 0) return t
    return `${esc(text.slice(0, i))}<mark>${esc(text.slice(i, i + q.length))}</mark>${esc(text.slice(i + q.length))}`
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
    results = EY.search(query)
    const first = new Map($$('.p-item', pList).map((li) => [li.dataset.pid, li.getBoundingClientRect().top]))
    const nodes = results.map(itemNode)
    if (nodes.length) pList.replaceChildren(...nodes)
    else pList.innerHTML = '<li class="p-empty">卡片柜里没有这一条。</li>'
    if (!reduced) {
      nodes.forEach((li, i) => {
        li.getAnimations().forEach((a) => a.cancel())
        const f = first.get(li.dataset.pid)
        const l = li.getBoundingClientRect().top
        if (f != null) {
          if (Math.abs(f - l) > 0.5) li.animate([{ transform: `translateY(${f - l}px)` }, { transform: 'none' }], { duration: 460, easing: EASE })
        } else {
          li.animate([{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: 420, delay: i * 22, easing: EASE, fill: 'backwards' })
        }
      })
    }
    pCount.textContent = query ? `${results.length} 张卡片` : '最近修订'
    setActive(0)
  }
  function setActive(i) {
    active = Math.max(0, Math.min(results.length - 1, i))
    const items = $$('.p-item', pList)
    items.forEach((li, k) => li.classList.toggle('active', k === active))
    const a = results[active]
    items[active]?.scrollIntoView({ block: 'nearest' })
    if (!a) { pPreview.innerHTML = ''; return }
    pPreview.innerHTML = `<div class="cat-card">
      <div class="cat-call"><span>分类号</span><b>${a.num}</b></div>
      <h3>${esc(a.title)}</h3>
      <p>${a.summary}</p>
      <dl><dt>部</dt><dd>第${CN[+a.part.id]}部 ${a.partName}</dd><dt>章</dt><dd>${a.chapName}</dd><dt>修订</dt><dd>${fmtDate(a.date)}</dd><dt>篇幅</dt><dd>约 ${a.mins} 分钟${a.fig ? ' · 附手稿图' : ''}</dd></dl>
      <span class="cat-hole" aria-hidden="true"></span>
    </div>`
    if (!reduced) pPreview.firstElementChild.animate([{ opacity: 0.3, transform: 'translateY(5px)' }, { opacity: 1, transform: 'none' }], { duration: 380, easing: EASE })
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

  /* ================= 台灯：日读 / 夜读 ================= */
  let lampToken = 0
  function toggleTheme(btn) {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark'
    try { localStorage.setItem('ey-theme-paper', next) } catch {}
    const apply = () => { root.dataset.theme = next }
    if (reduced || !document.startViewTransition) { apply(); return }
    const r = btn.getBoundingClientRect()
    const x = r.left + r.width / 2, y = r.top + r.height / 2
    const R = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y)) + 180
    const on = next === 'light'
    const token = ++lampToken
    root.style.setProperty('--lx', `${x}px`)
    root.style.setProperty('--ly', `${y}px`)
    root.style.setProperty('--lamp-max', `${R}px`)
    root.classList.remove('lamp-on', 'lamp-off', 'vt-page', 'vt-fwd', 'vt-back')
    root.classList.add('vt-lamp', on ? 'lamp-on' : 'lamp-off')
    let ring = null
    const vt = document.startViewTransition(() => {
      apply()
      $$('.lamp-ring').forEach((el) => el.remove())
      ring = document.createElement('div')
      ring.className = `lamp-ring ${on ? 'on' : 'off'}`
      const RR = on ? R : R * 1.25
      Object.assign(ring.style, { left: `${x - RR}px`, top: `${y - RR}px`, width: `${RR * 2}px`, height: `${RR * 2}px` })
      document.body.append(ring)
    })
    vt.ready.then(() => {
      ring?.animate([{ transform: `scale(${on ? 0 : 1})` }, { transform: `scale(${on ? 1 : 0})` }], { duration: LAMP_MS, easing: EASE, fill: 'forwards' })
    }).catch(() => {})
    vt.finished.catch(() => {}).finally(() => {
      ring?.remove()
      if (token === lampToken) root.classList.remove('vt-lamp', 'lamp-on', 'lamp-off')
    })
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
        if (view !== 'index') {
          goHome()
          setTimeout(() => { scrollTo(0, 0); playIntro() }, reduced ? 0 : PAGE_MS)
        } else {
          scrollTo({ top: 0, behavior: 'auto' })
          playIntro()
        }
      }
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
      const row = document.activeElement.closest?.('.log-row, .plate')
      if (row) openArticle(row.dataset.id, row)
    }
  })

  /* ================= 初始化 ================= */
  splitTitle()
  $('#statArticles').textContent = EY.TOTAL_ARTICLES
  $('#statParts').textContent = EY.PARTS.length
  $('#statChapters').textContent = EY.TOTAL_CHAPTERS
  $('#statUpdate').textContent = fmtDate(EY.LAST_UPDATE)
  renderParts()
  renderGallery()
  renderLog()
  renderTerms()
  showCard('intro', introCard(), true)

  const m = location.hash.match(/^#a\/(.+)$/)
  if (m && BY_ID[decodeURIComponent(m[1])]) {
    const id = decodeURIComponent(m[1])
    history.replaceState({ id }, '', location.hash)
    renderArticle(BY_ID[id])
    showView('article')
  } else if (!sessionStorage.getItem('ey-intro-paper')) {
    playIntro()
  }
})()
