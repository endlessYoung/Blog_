(() => {
  'use strict'

  const EY = window.EY
  const { pad, esc } = EY
  const root = document.documentElement
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
  const canHover = matchMedia('(hover: hover)').matches
  const EASE = 'cubic-bezier(.4, 0, .2, 1)'
  const INTRO_KEY = 'ey-intro-washi'
  const CAS_ID = EY.BY_TITLE['CAS']?.id || '02.JUC.02'
  const $ = (s, el = document) => el.querySelector(s)
  const $$ = (s, el = document) => [...el.querySelectorAll(s)]
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v))

  history.scrollRestoration = 'manual'

  const CN = ['〇', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十']
  const cn = (n) => (n <= 10 ? CN[n] : n < 20 ? `十${CN[n - 10]}` : `${CN[Math.floor(n / 10)]}十${n % 10 ? CN[n % 10] : ''}`)
  // 竖排时两位以内的数字、缩写横向并排在一个字宽里，更长的数字逐字直立
  const vnum = (n) => {
    const s = String(n)
    return s.length <= 2 ? `<span class="tcy">${s}</span>` : `<span class="upr">${s}</span>`
  }
  const vtext = (s) => esc(s).replace(/[A-Za-z0-9+#-]+/g, (w) => (/^[A-Za-z0-9]{1,2}$/.test(w) ? `<span class="tcy">${w}</span>` : `<span class="lat">${w}</span>`))

  /* ================= 刊头 ================= */
  function renderMasthead() {
    $('#mhStats').innerHTML = [
      [EY.TOTAL_ARTICLES, '篇'], [EY.PARTS.length, '部'], [EY.TOTAL_CHAPTERS, '章'],
    ].map(([n, l]) => `<div><dd>${n}</dd><dt>${l}</dt></div>`).join('')
    $('#mhDate').textContent = `最后更新 ${EY.LAST_UPDATE}`
    $$('.mh-sub, .mh-lede').forEach((el) => { el.innerHTML = vtext(el.textContent) })
    $('#mhEnso').innerHTML = `<g filter="url(#brush)">${enso(200, 200, 168, 2.2)}</g>`
  }

  function playIntro() {
    sessionStorage.setItem(INTRO_KEY, '1')
    if (reduced) return
    const wrap = $('#seal')
    wrap.getAnimations({ subtree: true }).forEach((a) => a.cancel())
    $('.seal', wrap).animate([
      { opacity: 0, transform: 'scale(1.4)', filter: 'blur(3px)' },
      { opacity: 1, transform: 'scale(.93)', filter: 'blur(.4px)', offset: 0.55 },
      { opacity: 1, transform: 'none', filter: 'blur(0)' },
    ], { duration: 820, easing: EASE, fill: 'backwards' })
    $('.seal-bleed', wrap).animate([
      { opacity: 0, transform: 'scale(.8)' },
      { opacity: 0.3, transform: 'scale(1.1)', offset: 0.35 },
      { opacity: 0, transform: 'scale(1.6)' },
    ], { duration: 1500, delay: 360, easing: EASE })
    $$('#mhEnso path').forEach((p, i) => {
      p.getAnimations().forEach((a) => a.cancel())
      p.style.strokeDasharray = '1'
      p.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], {
        duration: i ? 900 : 2200, delay: i ? 500 + i * 700 : 500, easing: EASE, fill: 'backwards',
      })
    })
    $$('.masthead .in').forEach((el) => {
      const o = +el.dataset.o
      el.getAnimations().forEach((a) => a.cancel())
      el.animate([
        { opacity: 0, transform: el.classList.contains('v') ? 'translateY(-16px)' : 'translateY(8px)' },
        { opacity: 1, transform: 'none' },
      ], {
        duration: o === 1 ? 760 : 1000,
        delay: o === 1 ? 110 : 320 + (o - 2) * 190,
        easing: EASE,
        fill: 'backwards',
      })
    })
  }

  /* ================= 目录 ================= */
  const colsEl = $('#cols')
  const stageEl = $('#revealStage')
  const pvStage = $('#previewStage')
  const partById = (id) => EY.PARTS.find((p) => p.id === id)
  let selected = '02'

  const artLink = (a) => `<a href="#a/${a.id}" class="art-link" data-id="${a.id}"><span class="art-num">${pad(a.index)}</span><span class="art-title">${esc(a.title)}</span>${a.fig ? '<span class="fig-mark" title="含交互图">图</span>' : ''}</a>`

  function renderContents() {
    colsEl.innerHTML = EY.PARTS.map((p) => `
      <div class="col${p.id === selected ? ' on' : ''}" data-part="${p.id}">
        <button class="col-btn" data-col aria-expanded="${p.id === selected}" aria-controls="pb-${p.id}" aria-label="第${cn(+p.id)}部 ${p.name}，${p.count} 篇">
          <span class="c-mark" aria-hidden="true"></span>
          <span class="c-num">${vnum(p.id)}</span>
          <span class="c-name">${vtext(p.name)}</span>
          <span class="c-count">${vnum(p.count)} 篇</span>
        </button>
        <div class="col-chaps" aria-hidden="true">${p.chapters.map((c, k) => `<span style="--i:${k}">${vtext(c.name)}</span>`).join('')}</div>
      </div>`).join('')

    stageEl.innerHTML = EY.PARTS.map((p) => `
      <div class="part-body${p.id === selected ? ' in' : ''}" id="pb-${p.id}" data-part="${p.id}"${p.id === selected ? '' : ' hidden inert'}>
        ${p.chapters.map((c, ci) => `
          <div class="chap" style="--i:${ci}">
            <h3 class="chap-head">${esc(c.name)}<small>${c.items.length} 篇</small></h3>
            <ul>${EY.ARTICLES.filter((a) => a.part === p && a.chapCode === c.code).map((a) => `<li>${artLink(a)}</li>`).join('')}</ul>
          </div>`).join('')}
      </div>`).join('')

    colsEl.addEventListener('click', (e) => {
      const b = e.target.closest('[data-col]')
      if (b) selectPart(b.closest('.col').dataset.part)
    })
    colsEl.addEventListener('pointerover', (e) => {
      const col = e.target.closest('.col')
      if (col) peekCol(col)
    })
    colsEl.addEventListener('pointerleave', () => { if (!colsEl.contains(document.activeElement)) peekCol(null) })
    colsEl.addEventListener('focusin', (e) => peekCol(e.target.closest('.col')))
    colsEl.addEventListener('focusout', (e) => { if (!colsEl.contains(e.relatedTarget)) peekCol(null) })

    stageEl.addEventListener('pointerover', (e) => {
      const l = e.target.closest('.art-link')
      if (l) showPreview(l.dataset.id, artPreview(EY.BY_ID[l.dataset.id]))
    })
    stageEl.addEventListener('focusin', (e) => {
      const l = e.target.closest('.art-link')
      if (l) showPreview(l.dataset.id, artPreview(EY.BY_ID[l.dataset.id]))
    })

    $('#contents').addEventListener('keydown', onContentsKey)
    showPreview(`part-${selected}`, partPreview(partById(selected)))
  }

  function peekCol(col) {
    $$('.col', colsEl).forEach((c) => c.classList.toggle('peek-on', c === col))
    const p = partById(col ? col.dataset.part : selected)
    showPreview(`part-${p.id}`, partPreview(p))
  }

  let switchSeq = 0
  function selectPart(id, instant = false) {
    if (id === selected && !instant) return
    const prevBody = $(`#pb-${selected}`)
    const nextBody = $(`#pb-${id}`)
    selected = id
    $$('.col', colsEl).forEach((c) => {
      const on = c.dataset.part === id
      c.classList.toggle('on', on)
      $('.col-btn', c).setAttribute('aria-expanded', String(on))
    })
    showPreview(`part-${id}`, partPreview(partById(id)))
    const seq = ++switchSeq
    const swap = () => {
      if (seq !== switchSeq) return
      const h0 = stageEl.offsetHeight
      $$('.part-body', stageEl).forEach((b) => {
        b.getAnimations().forEach((a) => a.cancel())
        const on = b === nextBody
        b.hidden = !on
        b.inert = !on
        b.classList.remove('in')
      })
      if (instant || reduced) {
        nextBody.classList.add('in')
        return
      }
      const h1 = stageEl.offsetHeight
      stageEl.animate([{ height: `${h0}px` }, { height: `${h1}px` }], { duration: 900, easing: EASE })
      requestAnimationFrame(() => requestAnimationFrame(() => { if (seq === switchSeq) nextBody.classList.add('in') }))
    }
    if (instant || reduced || prevBody === nextBody || prevBody.hidden) { swap(); return }
    prevBody.getAnimations().forEach((a) => a.cancel())
    prevBody.animate([{ opacity: 1 }, { opacity: 0, transform: 'translateY(-6px)' }], { duration: 480, easing: EASE, fill: 'forwards' })
      .finished.then(swap, () => {})
  }

  function onContentsKey(e) {
    const btns = $$('.col-btn', colsEl)
    const bi = btns.indexOf(document.activeElement)
    if (bi >= 0) {
      const step = { ArrowLeft: 1, ArrowRight: -1 }[e.key]
      if (step) {
        e.preventDefault()
        btns[clamp(bi + step, 0, btns.length - 1)].focus()
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        const id = btns[bi].closest('.col').dataset.part
        if (id !== selected) selectPart(id, true)
        $('.art-link', $(`#pb-${id}`))?.focus()
      }
      return
    }
    const link = document.activeElement.closest?.('.art-link')
    if (!link || (e.key !== 'ArrowDown' && e.key !== 'ArrowUp')) return
    e.preventDefault()
    const links = $$('.art-link', $(`#pb-${selected}`))
    const i = links.indexOf(link)
    if (e.key === 'ArrowUp' && i === 0) { $(`.col[data-part="${selected}"] .col-btn`, colsEl).focus(); return }
    links[clamp(i + (e.key === 'ArrowDown' ? 1 : -1), 0, links.length - 1)].focus()
  }

  let pvKey = null
  function showPreview(key, html) {
    if (key === pvKey) return
    pvKey = key
    const old = $$('.pv:not(.leaving)', pvStage)
    const el = document.createElement('div')
    el.className = 'pv'
    el.innerHTML = html
    pvStage.append(el)
    if (reduced) { old.forEach((o) => o.remove()); $$('.pv.leaving', pvStage).forEach((o) => o.remove()); return }
    old.forEach((o) => {
      o.classList.add('leaving')
      o.getAnimations().forEach((a) => a.cancel())
      o.animate([{ opacity: 1 }, { opacity: 0, transform: 'translateY(-6px)' }], { duration: 460, easing: EASE, fill: 'forwards' })
        .onfinish = () => o.remove()
    })
    el.animate([{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], {
      duration: 820, delay: old.length ? 200 : 0, easing: EASE, fill: 'backwards',
    })
  }
  function partPreview(p) {
    const recent = EY.BY_DATE.filter((a) => a.part === p).slice(0, 3)
    return `<div class="pv-no">第${cn(+p.id)}部</div>
      <div class="pv-title">${esc(p.name)}</div>
      <p class="pv-sum">${p.chapters.map((c) => esc(c.name)).join('、')}</p>
      <div class="pv-meta"><span>${p.count} 篇</span><span>${p.chapters.length} 章</span></div>
      <ul class="pv-list">${recent.map((a) => `<li><span>${a.date}</span><span>${esc(a.title)}</span></li>`).join('')}</ul>`
  }
  function artPreview(a) {
    return `<div class="pv-no">${a.num}</div>
      <div class="pv-title">${esc(a.title)}</div>
      <p class="pv-sum">${a.summary}</p>
      <div class="pv-meta"><span>更新 ${a.date}</span><span>约 ${a.mins} 分钟</span>${a.fig ? '<span>含交互图</span>' : ''}</div>`
  }

  /* ================= 图集 ================= */
  function arc(cx, cy, r, a0, a1) {
    const p = (a) => [cx + r * Math.cos((a * Math.PI) / 180), cy + r * Math.sin((a * Math.PI) / 180)].map((v) => v.toFixed(2))
    const [x0, y0] = p(a0)
    const [x1, y1] = p(a1)
    return `M${x0} ${y0} A${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1} ${y1}`
  }
  // 圆相：起笔重、收笔轻，留一道缺口
  const enso = (cx, cy, r, w = 1) => `
    <path class="stroke" pathLength="1" d="${arc(cx, cy, r, -70, 250)}" stroke-width="${3 * w}" />
    <path class="stroke" pathLength="1" d="${arc(cx, cy, r - 0.6 * w, -70, 70)}" stroke-width="${5.2 * w}" opacity=".9" />
    <path class="stroke" pathLength="1" d="${arc(cx, cy, r + 0.5 * w, 205, 266)}" stroke-width="${1.3 * w}" opacity=".7" />`

  const FIG_ART = {
    loop: () => `<svg viewBox="0 0 360 220" class="m-loop" aria-hidden="true">
      <g filter="url(#brush)">${enso(216, 110, 64)}</g>
      <g class="orbit"><circle class="dot" cx="216" cy="46" r="4.5" /></g>
      <line class="thin" x1="102" y1="110" x2="148" y2="110" />
      <circle class="dot feed" cx="102" cy="110" r="3" />
      <g class="stroke" stroke-width="3" filter="url(#brush)">
        <line class="q" x1="58" y1="94" x2="58" y2="126" />
        <line class="q" x1="72" y1="92" x2="72" y2="128" />
        <line class="q" x1="86" y1="95" x2="86" y2="125" />
      </g>
      <text class="lab" x="72" y="158" text-anchor="middle">消息队列</text>
      <text class="lab" x="216" y="204" text-anchor="middle">Looper 循环</text>
    </svg>`,
    cas: () => `<svg viewBox="0 0 360 220" class="m-cas" aria-hidden="true">
      <circle class="stroke" cx="56" cy="100" r="16" stroke-width="1.6" />
      <circle class="stroke" cx="304" cy="100" r="16" stroke-width="1.6" />
      <text class="lab-s" x="56" y="104" text-anchor="middle">T1</text>
      <text class="lab-s" x="304" y="104" text-anchor="middle">T2</text>
      <g filter="url(#brush)">${enso(180, 100, 44)}</g>
      <line class="thin" x1="74" y1="100" x2="134" y2="100" />
      <line class="thin" x1="226" y1="100" x2="286" y2="100" />
      <text class="num n0" x="180" y="112" text-anchor="middle">0</text>
      <text class="num n1" x="180" y="112" text-anchor="middle">1</text>
      <text class="num n2" x="180" y="112" text-anchor="middle">2</text>
      <circle class="dot d1" cx="72" cy="100" r="3.6" />
      <circle class="dot d2" cx="288" cy="100" r="3.6" />
      <g class="s-ok1"><rect class="shu" x="47" y="56" width="18" height="18" rx="1.5" filter="url(#seal-ink)" /><text class="shu-t" x="56" y="69.5" text-anchor="middle">成</text></g>
      <g class="s-fail"><rect class="shu" x="295" y="56" width="18" height="18" rx="1.5" filter="url(#seal-ink)" /><text class="shu-t" x="304" y="69.5" text-anchor="middle">败</text></g>
      <g class="s-ok2"><rect class="shu" x="295" y="56" width="18" height="18" rx="1.5" filter="url(#seal-ink)" /><text class="shu-t" x="304" y="69.5" text-anchor="middle">成</text></g>
      <text class="lab" x="56" y="142" text-anchor="middle">线程一</text>
      <text class="lab" x="304" y="142" text-anchor="middle">线程二</text>
      <text class="lab" x="180" y="174" text-anchor="middle">内存</text>
    </svg>`,
    gen: () => `<svg viewBox="0 0 360 220" class="m-gen" aria-hidden="true">
      <g class="stroke" stroke-width="1.3" filter="url(#brush)">
        <rect x="20" y="60" width="120" height="96" rx="12" />
        <rect x="152" y="60" width="48" height="96" rx="10" />
        <rect x="212" y="60" width="48" height="96" rx="10" />
        <rect x="272" y="60" width="72" height="96" rx="12" />
      </g>
      <circle class="dot" cx="296" cy="88" r="3.5" opacity=".45" />
      <circle class="dot" cx="320" cy="122" r="3.5" opacity=".45" />
      <circle class="dot o3" cx="96" cy="108" r="4.5" />
      <circle class="dot o1" cx="40" cy="92" r="4.5" />
      <circle class="dot o2" cx="40" cy="126" r="4.5" />
      <text class="lab-s" x="80" y="182" text-anchor="middle">Eden</text>
      <text class="lab-s" x="176" y="182" text-anchor="middle">S0</text>
      <text class="lab-s" x="236" y="182" text-anchor="middle">S1</text>
      <text class="lab" x="308" y="182" text-anchor="middle">老年代</text>
    </svg>`,
    bin: () => `<svg viewBox="0 0 360 220" class="m-bin" aria-hidden="true">
      <g class="stroke" filter="url(#brush)">${Array.from({ length: 13 }, (_, i) => {
        const x = 48 + i * 22
        return `<line x1="${x}" y1="160" x2="${x}" y2="${160 - (30 + i * 6)}" stroke-width="${(2.4 + (i % 3) * 0.6).toFixed(1)}" opacity="${i === 9 ? 1 : 0.55}" />`
      }).join('')}</g>
      <rect class="shu hit" x="241" y="62" width="10" height="10" rx="1" filter="url(#seal-ink)" />
      <circle class="dot mid" cx="180" cy="44" r="3.5" />
      <line class="stroke lo" x1="48" y1="178" x2="48" y2="192" stroke-width="1.6" />
      <line class="stroke hi" x1="312" y1="178" x2="312" y2="192" stroke-width="1.6" />
      <text class="lab-s lo" x="48" y="210" text-anchor="middle">lo</text>
      <text class="lab-s hi" x="312" y="210" text-anchor="middle">hi</text>
    </svg>`,
  }

  function renderGallery() {
    const track = $('#galleryTrack')
    track.innerHTML = EY.ARTICLES.filter((a) => a.fig).map((a, i) => `
      <figure class="g-card" data-id="${a.id}" tabindex="0" role="link" aria-label="${esc(a.fig.caption)}，打开 ${esc(a.title)}">
        <div class="g-art">${FIG_ART[a.fig.kind]()}</div>
        <figcaption class="g-cap">
          <span class="g-no" data-vt="num">图${cn(i + 1)} · ${a.num}</span>
          <h3 data-vt="title">${esc(a.fig.caption)}</h3>
          <p>${esc(a.title)}</p>
        </figcaption>
      </figure>`).join('')

    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => en.target.classList.toggle('running', en.isIntersecting))
    }, { threshold: 0.4 })
    $$('.g-card', track).forEach((c) => io.observe(c))

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
        if (Math.abs(v) < 0.2) return
        g.scrollLeft -= v
        v *= 0.955
        raf = requestAnimationFrame(glide)
      }
      if (!reduced) glide()
    })
    g.addEventListener('click', (e) => {
      if (moved > 5) { e.stopPropagation(); e.preventDefault() }
    }, true)
  }

  /* ================= 日志与索引 ================= */
  function renderLog() {
    $('#log').innerHTML = EY.BY_DATE.slice(0, 8).map((a) => `
      <li class="log-row" tabindex="0" data-id="${a.id}">
        <span class="log-date">${a.date}</span>
        <div><span class="art-title">${esc(a.title)}</span><span class="art-num">${a.num}</span></div>
        <span class="log-part">${esc(a.partName)} · ${esc(a.chapName)}</span>
      </li>`).join('')
  }
  function renderTerms() {
    const groups = {}
    EY.TERMS.forEach(([g, term, title]) => { (groups[g] ||= []).push([term, EY.BY_TITLE[title]]) })
    $('#terms').innerHTML = Object.entries(groups).map(([g, list]) => `
      <div class="term-group"><h4>${esc(g)}</h4>
        ${list.map(([term, a]) => `<a href="#a/${a.id}" data-id="${a.id}" data-peek>${esc(term)}</a>`).join('')}
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

  const refLink = (a, text) => `<a href="#a/${a.id}" class="ref" data-id="${a.id}" data-peek>${text}</a>`

  const codeBlock = () => `
    <div class="code">
      <div class="code-head"><span>AtomicInteger.java · Unsafe.java</span><button class="copy-btn" data-copy aria-label="复制代码"><span class="c-idle">复制</span><span class="c-done" aria-live="polite">已复制</span></button></div>
      <pre>${EY.highlightJava(EY.JAVA_SRC)}</pre>
    </div>`

  function casBody() {
    const A = EY.CAS_ARTICLE
    return A.sections.map((s, i) => {
      const head = `<h2 class="sec-name"><span class="sec-no">${cn(i + 1)}</span><span>${vtext(s.title)}</span></h2>`
      if (s.scrolly) {
        return `<section class="a-sec a-grid scrolly-sec" data-sec data-name="${esc(s.title)}">${head}
          <div class="sec-main"><div class="scrolly">
            <div class="scrolly-text">${A.scrollySteps.map((st, k) => `
              <div class="step" data-step="${st.step}"><div class="step-label"><i></i>${cn(k + 1)} · ${st.label}</div><p>${st.text}</p></div>`).join('')}
            </div>
            <div class="scrolly-fig">${casFigure()}</div>
          </div></div>
        </section>`
      }
      const html = EY.renderRefs(s.html, refLink).replace('{{code}}', codeBlock())
      const notes = (s.notes || []).map((n) => `<div class="note"><span class="note-label">注 · ${n.label}</span>${EY.renderRefs(n.html, refLink)}</div>`).join('')
      return `<section class="a-sec a-grid" data-sec data-name="${esc(s.title)}">${head}
        <div class="sec-main prose">${html}</div>
        <aside class="sec-side">${notes}</aside>
      </section>`
    }).join('')
  }

  function renderArticle(a) {
    currentId = a.id
    const isCas = a.id === CAS_ID
    articleEl.innerHTML = `
      <header class="a-head a-grid"><div>
        <button class="a-back" data-action="back">← 返回目录</button>
        <span class="a-num" style="view-transition-name: vt-num">${a.num}</span>
        <h1 class="a-title" style="view-transition-name: vt-title">${esc(a.title)}</h1>
        <div class="a-meta">
          <span>第${cn(+a.part.id)}部 · <b>${esc(a.partName)}</b></span>
          <span>${esc(a.chapName)} · 第 <b>${a.index}</b> 篇 / 共 ${a.total} 篇</span>
          ${isCas ? `<span>创建 <b>${EY.CAS_ARTICLE.created}</b></span>` : ''}
          <span>更新 <b>${a.date}</b></span>
          <span>约 <b>${a.mins}</b> 分钟</span>
        </div>
      </div></header>
      ${isCas ? casBody() : `
        <div class="a-grid"><div class="stub prose">
          <p>${a.summary}</p>
          <p>演示页只包含《CAS》的完整正文和交互图。</p>
          <button data-id="${CAS_ID}">翻到 ${CAS_ID} · CAS →</button>
          <div class="stub-sib">
            <h3>同一章节 · ${esc(a.chapName)}</h3>
            <ul>${EY.ARTICLES.filter((x) => x.part === a.part && x.chapCode === a.chapCode).map((x) => `<li${x.id === a.id ? ' class="here"' : ''}>${artLink(x)}</li>`).join('')}</ul>
          </div>
        </div></div>`}`
    document.title = `${a.num} ${a.title} · Endlessyoung`
    stopScrolly()
    cas = null
    if (isCas) {
      mountCas($('#casFig'))
      mountScrolly()
    }
    setupRail(isCas ? a.mins : 0)
  }

  function showView(v) {
    view = v
    viewIndex.hidden = v !== 'index'
    viewArticle.hidden = v !== 'article'
    if (v === 'index') {
      document.title = 'Endlessyoung · 原理手记（改版演示 · 和纸）'
      rail.classList.remove('show')
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
  function tagHeader() {
    const n = $('.a-num', articleEl)
    const t = $('.a-title', articleEl)
    if (n) n.style.viewTransitionName = 'vt-num'
    if (t) t.style.viewTransitionName = 'vt-title'
  }

  let vtSeq = 0
  function transition(kind, update) {
    if (reduced) { update(); return Promise.resolve() }
    if (!document.startViewTransition) {
      if (kind !== 'page') { update(); return Promise.resolve() }
      const app = $('#app')
      app.getAnimations().forEach((a) => a.cancel())
      return app.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 520, easing: EASE, fill: 'forwards' }).finished
        .then(() => new Promise((r) => setTimeout(r, 120)))
        .then(() => {
          update()
          app.getAnimations().forEach((a) => a.cancel())
          return app.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 760, easing: EASE }).finished
        })
        .catch(() => {})
    }
    const id = ++vtSeq
    root.classList.remove('vt-page', 'vt-theme')
    root.classList.add(`vt-${kind}`)
    const vt = document.startViewTransition(update)
    return vt.finished.catch(() => {}).finally(() => {
      if (id === vtSeq) root.classList.remove(`vt-${kind}`)
    })
  }

  function openArticle(id, src, fromHistory = false) {
    const a = EY.BY_ID[id]
    if (!a) return
    hidePeek(true)
    if (view === 'index') {
      indexScroll = scrollY
      lastIndexSrc = src && viewIndex.contains(src) ? src : null
    }
    clearAllVT()
    tagVT(src)
    if (!fromHistory) history.pushState({ id }, '', `#a/${id}`)
    return transition('page', () => {
      closePalette(true)
      clearAllVT()
      renderArticle(a)
      showView('article')
      scrollTo(0, 0)
    })
  }

  function goHome(fromHistory = false, thenScrollTo = null) {
    if (view === 'index') {
      const opts = { behavior: reduced ? 'auto' : 'smooth' }
      if (thenScrollTo) $(thenScrollTo)?.scrollIntoView(opts)
      else scrollTo({ top: 0, ...opts })
      return Promise.resolve()
    }
    if (!fromHistory) history.pushState({}, '', location.pathname)
    const id = currentId
    clearAllVT()
    if (!thenScrollTo) tagHeader()
    return transition('page', () => {
      clearAllVT()
      showView('index')
      if (thenScrollTo) { $(thenScrollTo)?.scrollIntoView(); return }
      let target = null
      if (lastIndexSrc && lastIndexSrc.dataset.id === id && lastIndexSrc.isConnected) {
        target = lastIndexSrc
        scrollTo(0, indexScroll)
      } else {
        const a = EY.BY_ID[id]
        if (a.part.id !== selected) selectPart(a.part.id, true)
        target = $(`.art-link[data-id="${id}"]`, stageEl)
        if (target) target.scrollIntoView({ block: 'center' })
      }
      tagVT(target)
    }).then(() => clearAllVT())
  }

  addEventListener('popstate', (e) => {
    if (e.state && e.state.id) openArticle(e.state.id, null, true)
    else {
      const m = location.hash.match(/^#a\/(.+)$/)
      if (m && EY.BY_ID[decodeURIComponent(m[1])]) openArticle(decodeURIComponent(m[1]), null, true)
      else goHome(true)
    }
  })

  /* ================= 阅读进度 ================= */
  const rail = $('#rail')
  const railFill = $('#railFill')
  const railDot = $('#railDot')
  const railSec = $('#railSec')
  const railLeft = $('#railLeft')
  let railData = null

  function setupRail(mins) {
    const secs = $$('[data-sec]', articleEl)
    railSec.dataset.v = ''
    railSec.textContent = ''
    if (!secs.length) { railData = null; rail.classList.remove('show'); return }
    railData = { mins, secs }
    requestAnimationFrame(() => {
      updateRail()
      rail.classList.add('show')
    })
  }
  function updateRail() {
    if (!railData || view !== 'article') return
    const max = Math.max(1, root.scrollHeight - innerHeight)
    const p = clamp(scrollY / max, 0, 1)
    const h = rail.clientHeight
    railFill.style.transform = `scaleY(${p})`
    railDot.style.transform = `translateY(${p * h}px)`
    let cur = null
    railData.secs.forEach((s) => { if (s.getBoundingClientRect().top < innerHeight * 0.4) cur = s })
    const name = cur ? cur.dataset.name : ''
    if (railSec.dataset.v !== name) {
      railSec.dataset.v = name
      const old = [...railSec.children]
      const span = document.createElement('span')
      span.innerHTML = name ? vtext(name) : ''
      railSec.append(span)
      if (reduced) old.forEach((o) => o.remove())
      else {
        old.forEach((o) => { o.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 500, easing: EASE, fill: 'forwards' }).onfinish = () => o.remove() })
        span.animate([{ opacity: 0, transform: 'translateY(-8px)' }, { opacity: 1, transform: 'none' }], { duration: 900, delay: 160, easing: EASE, fill: 'backwards' })
      }
    }
    const left = Math.max(0, Math.ceil(railData.mins * (1 - p)))
    railLeft.innerHTML = left ? `余 ${vnum(left)} 分钟` : '读完了'
  }
  let railRaf = 0
  addEventListener('scroll', () => { cancelAnimationFrame(railRaf); railRaf = requestAnimationFrame(updateRail) }, { passive: true })
  rail.addEventListener('click', (e) => {
    if (!railData || view !== 'article') return
    const r = rail.getBoundingClientRect()
    const p = clamp((e.clientY - r.top) / r.height, 0, 1)
    const max = Math.max(1, root.scrollHeight - innerHeight)
    scrollTo({ top: p * max, behavior: reduced ? 'auto' : 'smooth' })
  })

  /* ================= CAS 交互图 ================= */
  let cas = null

  function casFigure() {
    const last = EY.CAS_STEPS.length - 1
    const thread = (t, name) => `
      <div class="thread" data-t="${t}">
        <span class="th-seal" aria-hidden="true"></span>
        <div class="th-head"><span class="th-name">${t.toUpperCase()}</span><span class="th-cn">${name}</span></div>
        <svg class="th-stroke" viewBox="0 0 72 8" aria-hidden="true"><path d="M2 5 C 20 2.6, 44 3, 70 4.4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" /><path d="M2 5 C 10 3.8, 20 3.4, 30 3.6" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" /></svg>
        <span class="th-status xf" data-f="status"><span>就绪</span></span>
        <div class="reg" data-link="expect"><span>expect</span><b class="xf" data-f="expect"><span>—</span></b></div>
        <div class="reg" data-link="update"><span>update</span><b class="xf" data-f="update"><span>—</span></b></div>
        <div class="reg" data-link="retry"><span>retry</span><b class="xf" data-f="retry"><span>0</span></b></div>
      </div>`
    return `
      <figure class="fig" id="casFig" aria-label="CAS 交互图">
        <div class="fig-head"><span class="fig-id">图三 · 两个线程，一个变量</span><span class="fig-step">第 <b class="xf fig-cur"><span>00</span></b> 步 / 共 ${pad(last)} 步</span></div>
        <div class="cas-stage">
          <i class="wire" data-w="t1"></i><i class="wire" data-w="t2"></i>
          ${thread('t1', '线程一')}
          <div class="memory" data-link="memory">
            <svg class="enso" viewBox="0 0 100 100" aria-hidden="true"><g filter="url(#brush)">${enso(50, 50, 44, 0.8)}</g></svg>
            <span class="ripple" aria-hidden="true"></span>
            <div class="mem-in"><span class="mem-label">value</span><b class="mem-val xf"><span>0</span></b><span class="mem-addr">@0x7F3A</span></div>
          </div>
          ${thread('t2', '线程二')}
        </div>
        <div class="fig-code">${EY.CAS_CODE.map((l, i) => `<div class="cl" data-line="${i + 1}"><span class="cl-no">${i + 1}</span><span class="cl-mark"></span><span>${esc(l)}</span></div>`).join('')}</div>
        <div class="fig-log" aria-live="polite"><div></div></div>
        <div class="fig-progress"><i></i></div>
        <div class="fig-ctrl">
          <button data-c="reset">重置</button>
          <button data-c="prev">上一步</button>
          <button data-c="next" class="primary">单步</button>
          <button data-c="play">播放</button>
          <button data-c="speed" class="speed" title="切换速度">1×</button>
        </div>
      </figure>`
  }

  function mountCas(fig) {
    const S = EY.CAS_STEPS
    const last = S.length - 1
    const stage = $('.cas-stage', fig)
    const mem = $('.memory', fig)
    const memVal = $('.mem-val', fig)
    const ripple = $('.ripple', fig)
    const lines = $$('.cl', fig)
    const curEl = $('.fig-cur', fig)
    const logEl = $('.fig-log', fig)
    const bar = $('.fig-progress i', fig)
    const playBtn = $('[data-c="play"]', fig)
    const speedBtn = $('[data-c="speed"]', fig)
    const threads = { t1: $('[data-t="t1"]', fig), t2: $('[data-t="t2"]', fig) }
    const wires = { t1: $('[data-w="t1"]', fig), t2: $('[data-w="t2"]', fig) }
    const dot = document.createElement('span')
    dot.className = 'ink-dot'
    dot.style.opacity = '0'
    stage.append(dot)

    const speeds = [1, 2, 0.5]
    let si = 0
    let cur = 0
    let flight = null
    let timer = 0
    let playing = false
    const live = new Set()
    const sp = () => speeds[si]
    const track = (anim) => { live.add(anim); anim.addEventListener('finish', () => live.delete(anim)); anim.addEventListener('cancel', () => live.delete(anim)); return anim }

    function setX(el, html, animate) {
      html = String(html)
      if (el.dataset.v === html) return
      el.dataset.v = html
      const old = [...el.children]
      const span = document.createElement(el === logEl ? 'div' : 'span')
      span.innerHTML = html
      el.append(span)
      if (!animate) { old.forEach((o) => o.remove()); return }
      old.forEach((o) => {
        if (o.classList.contains('out')) { o.remove(); return }
        o.getAnimations().forEach((a) => a.cancel())
        o.classList.add('out')
        o.setAttribute('aria-hidden', 'true')
        track(o.animate([{ opacity: 1 }, { opacity: 0, transform: 'translateY(-5px)' }], { duration: 520 / sp(), easing: EASE, fill: 'forwards' }))
          .onfinish = () => o.remove()
      })
      track(span.animate([{ opacity: 0, transform: 'translateY(5px)' }, { opacity: 1, transform: 'none' }], { duration: 760 / sp(), delay: 140 / sp(), easing: EASE, fill: 'backwards' }))
    }

    function setSeal(t, cls, animate) {
      const seal = $('.th-seal', threads[t])
      const k = cls === 'ok' || cls === 'fail' ? cls : ''
      if ((seal.dataset.k || '') === k) return
      seal.dataset.k = k
      seal.getAnimations().forEach((a) => a.cancel())
      if (!k) {
        seal.classList.remove('on')
        if (animate) track(seal.animate([{ opacity: 0.95 }, { opacity: 0 }], { duration: 600 / sp(), easing: EASE }))
        return
      }
      seal.textContent = k === 'ok' ? '成' : '败'
      seal.classList.add('on')
      if (animate) {
        track(seal.animate([
          { opacity: 0, transform: 'scale(1.5)', filter: 'url(#seal-ink) blur(2px)' },
          { opacity: 0.95, transform: 'scale(.92)', filter: 'url(#seal-ink) blur(0px)', offset: 0.6 },
          { opacity: 0.95, transform: 'none', filter: 'url(#seal-ink) blur(0px)' },
        ], { duration: 760 / sp(), easing: EASE }))
      }
    }

    function renderStage(s, animate) {
      setX(memVal, s.v, animate)
      for (const t of ['t1', 't2']) {
        const el = threads[t]
        const st = s[t]
        el.classList.toggle('active', s.actor === t)
        setX($('[data-f="status"]', el), st.status, animate)
        setX($('[data-f="expect"]', el), st.expect, animate)
        setX($('[data-f="update"]', el), st.update, animate)
        setX($('[data-f="retry"]', el), st.retry, animate)
        setSeal(t, st.cls, animate)
      }
    }

    function renderCode(s, animate) {
      lines.forEach((l) => {
        const n = +l.dataset.line
        const m = $('.cl-mark', l)
        const mk = `${s.t1.line === n ? '<i>T1</i>' : ''}${s.t2.line === n ? '<i class="t2">T2</i>' : ''}`
        if (m.dataset.v !== mk) { m.dataset.v = mk; m.innerHTML = mk }
        l.classList.toggle('now', !!s.actor && s[s.actor].line === n)
      })
      setX(curEl, pad(cur), animate)
      setX(logEl, s.log, animate)
      bar.style.transform = `scaleX(${cur / last})`
    }

    function layout() {
      const sr = stage.getBoundingClientRect()
      const mr = mem.getBoundingClientRect()
      if (!sr.width) return null
      const cy = mr.top - sr.top + mr.height / 2
      const inset = mr.width * 0.07
      const g = {
        cy,
        edgeL: mr.left - sr.left + inset - 4,
        edgeR: mr.right - sr.left - inset + 4,
        a1: threads.t1.getBoundingClientRect().right - sr.left + 10,
        a2: threads.t2.getBoundingClientRect().left - sr.left - 10,
      }
      Object.assign(wires.t1.style, { left: `${g.a1}px`, top: `${cy}px`, width: `${Math.max(0, g.edgeL - g.a1)}px` })
      Object.assign(wires.t2.style, { left: `${g.edgeR}px`, top: `${cy}px`, width: `${Math.max(0, g.a2 - g.edgeR)}px` })
      return g
    }

    function breathe(delay) {
      return track(ripple.animate([
        { opacity: 0, transform: 'scale(.92)' },
        { opacity: 0.6, transform: 'scale(1)', offset: 0.3 },
        { opacity: 0, transform: 'scale(1.18)' },
      ], { duration: 1100 / sp(), delay, easing: EASE }))
    }

    function fly(s, prevS) {
      const g = layout()
      const t = s.actor
      if (!g) { renderStage(s, true); return }
      const memX = t === 't1' ? g.edgeL : g.edgeR
      const thX = t === 't1' ? g.a1 : g.a2
      const at = (x, o, offset) => ({ transform: `translate(${x}px, ${g.cy}px)`, opacity: o, ...(offset != null ? { offset } : {}) })
      let frames
      let dur = 1000 / sp()
      const hold = { ...s, v: prevS.v, [t]: { ...s[t] } }
      if (s.fx === 'read') {
        frames = [at(memX, 0), at(memX, 1, 0.15), at(thX, 1, 0.85), at(thX, 0)]
        hold[t].expect = prevS[t].expect
      } else if (s.fx === 'write') {
        frames = [at(thX, 0), at(thX, 1, 0.15), at(memX, 1, 0.85), at(memX, 0)]
        Object.assign(hold[t], { cls: prevS[t].cls, status: '比较中' })
        breathe(dur * 0.8)
      } else {
        const back = thX + (memX - thX) * 0.4
        frames = [at(thX, 0), at(thX, 1, 0.1), at(memX, 1, 0.5), at(memX, 1, 0.62), at(back, 0)]
        dur *= 1.5
        Object.assign(hold[t], { cls: prevS[t].cls, retry: prevS[t].retry, status: '比较中' })
        breathe(dur * 0.48)
      }
      renderStage(hold, true)
      const anim = dot.animate(frames, { duration: dur, easing: EASE })
      flight = {
        anim,
        done(animate) {
          flight = null
          renderStage(s, animate)
        },
      }
      anim.onfinish = () => { if (flight && flight.anim === anim) flight.done(true) }
    }

    function settle() {
      if (flight) {
        const f = flight
        f.anim.cancel()
        f.done(false)
      }
      ;[...live].forEach((a) => a.finish())
      $$('.out', fig).forEach((o) => o.remove())
    }

    function go(n, mode) {
      settle()
      const prevS = S[cur]
      cur = clamp(n, 0, last)
      const s = S[cur]
      const animate = !!mode && !reduced
      renderCode(s, animate)
      if (mode === 'full' && !reduced && s.fx && S[cur - 1] === prevS) fly(s, prevS)
      else renderStage(s, animate)
    }

    function stop() {
      playing = false
      clearTimeout(timer)
      playBtn.textContent = '播放'
    }
    function play() {
      if (cur >= last) go(0, 'soft')
      playing = true
      playBtn.textContent = '暂停'
      const tick = () => {
        if (!playing) return
        if (cur >= last) { stop(); return }
        go(cur + 1, 'full')
        timer = setTimeout(tick, 1800 / sp())
      }
      timer = setTimeout(tick, 400)
    }
    function runTo(target) {
      stop()
      if (target === cur) return
      if (target < cur || target - cur > 5) { go(target, 'soft'); return }
      const tick = () => {
        if (cur >= target) return
        go(cur + 1, 'full')
        timer = setTimeout(tick, 1400 / sp())
      }
      tick()
    }

    fig.addEventListener('click', (e) => {
      const b = e.target.closest('[data-c]')
      if (!b) return
      const c = b.dataset.c
      if (c === 'next') { stop(); go(cur + 1, 'full') }
      if (c === 'prev') { stop(); go(cur - 1, 'soft') }
      if (c === 'reset') { stop(); go(0, 'soft') }
      if (c === 'play') playing ? stop() : play()
      if (c === 'speed') { si = (si + 1) % speeds.length; b.textContent = `${sp()}×` }
    })

    const clearRel = () => $$('.rel', fig).forEach((el) => el.classList.remove('rel'))
    fig.addEventListener('pointerover', (e) => {
      const line = e.target.closest('.cl')
      const part = e.target.closest('[data-link]')
      clearRel()
      if (line) {
        const n = +line.dataset.line
        line.classList.add('rel')
        Object.entries(EY.CAS_LINKS).forEach(([key, ls]) => {
          if (ls.includes(n)) $$(`[data-link="${key}"]`, fig).forEach((el) => el.classList.add('rel'))
        })
      } else if (part) {
        $$(`[data-link="${part.dataset.link}"]`, fig).forEach((el) => el.classList.add('rel'))
        ;(EY.CAS_LINKS[part.dataset.link] || []).forEach((n) => $(`.cl[data-line="${n}"]`, fig)?.classList.add('rel'))
      }
    })
    fig.addEventListener('pointerleave', clearRel)

    speedBtn.textContent = '1×'
    go(0, false)
    requestAnimationFrame(layout)
    document.fonts?.ready.then(layout)
    cas = { runTo, stop, layout, get cur() { return cur } }
  }

  addEventListener('resize', () => { cas?.layout() })

  /* ================= 滚动叙事 ================= */
  let scrollyIO = null
  function mountScrolly() {
    const steps = $$('.step', articleEl)
    scrollyIO = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return
        steps.forEach((s) => s.classList.toggle('active', s === en.target))
        cas && cas.runTo(+en.target.dataset.step)
      })
    }, { rootMargin: '-45% 0px -50% 0px' })
    steps.forEach((s) => scrollyIO.observe(s))
  }
  function stopScrolly() {
    scrollyIO?.disconnect()
    scrollyIO = null
    cas?.stop()
  }

  /* ================= 复制 ================= */
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-copy]')
    if (!b) return
    navigator.clipboard?.writeText(EY.JAVA_SRC).catch(() => {})
    b.classList.add('done')
    clearTimeout(b._t)
    b._t = setTimeout(() => b.classList.remove('done'), 2000)
  })

  /* ================= 链接预览 ================= */
  const peek = $('#peek')
  let peekTimer = 0
  let hideTimer = 0
  let peekFor = null
  function showPeek(el) {
    const a = EY.BY_ID[el.dataset.id]
    if (!a) return
    peekFor = el
    peek.getAnimations().forEach((x) => x.cancel())
    peek.innerHTML = `<span class="pk-no">${a.num}</span><h5>${esc(a.title)}</h5><p>${a.summary}</p>
      <div class="pk-foot"><span>${esc(a.partName)} · ${esc(a.chapName)}</span><span>约 ${a.mins} 分钟${a.fig ? ' · 含交互图' : ''}</span></div>`
    peek.hidden = false
    const r = el.getBoundingClientRect()
    const w = peek.offsetWidth
    const h = peek.offsetHeight
    const left = clamp(r.left + r.width / 2 - w / 2, 12, innerWidth - w - 12)
    const below = r.bottom + 14 + h < innerHeight
    peek.style.left = `${left}px`
    peek.style.top = `${below ? r.bottom + 12 : r.top - h - 12}px`
    if (!reduced) {
      peek.animate([{ opacity: 0, transform: `translateY(${below ? 6 : -6}px)` }, { opacity: 1, transform: 'none' }], { duration: 600, easing: EASE })
    }
  }
  function hidePeek(instant = false) {
    clearTimeout(peekTimer)
    if (peek.hidden) return
    peekFor = null
    if (instant || reduced) { peek.hidden = true; return }
    peek.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 400, easing: EASE, fill: 'forwards' })
      .onfinish = (ev) => { if (!peekFor) peek.hidden = true; ev.target.cancel() }
  }
  if (canHover) {
    document.addEventListener('pointerover', (e) => {
      const el = e.target.closest('[data-peek]')
      if (el) {
        clearTimeout(hideTimer)
        if (el === peekFor) return
        clearTimeout(peekTimer)
        peekTimer = setTimeout(() => showPeek(el), 320)
      } else if (e.target.closest('#peek')) {
        clearTimeout(hideTimer)
      }
    })
    document.addEventListener('pointerout', (e) => {
      const el = e.target.closest('[data-peek], #peek')
      if (!el || (e.relatedTarget && el.contains(e.relatedTarget))) return
      clearTimeout(peekTimer)
      hideTimer = setTimeout(() => hidePeek(), 200)
    })
    addEventListener('scroll', () => { if (!peek.hidden) hidePeek() }, { passive: true })
  }

  /* ================= 搜索 ================= */
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
      $('.palette-backdrop', palette).animate([{ opacity: 0 }, { opacity: 1 }], { duration: 800, easing: EASE })
      $('.palette-panel', palette).animate([
        { opacity: 0, transform: 'translateY(10px)' },
        { opacity: 1, transform: 'none' },
      ], { duration: 820, delay: 80, easing: EASE, fill: 'backwards' })
    }
  }
  function closePalette(instant = false) {
    if (palette.hidden) return
    root.classList.remove('palette-open')
    const done = () => {
      palette.hidden = true
      palette.getAnimations({ subtree: true }).forEach((a) => a.cancel())
      if (!instant && lastFocus?.isConnected) lastFocus.focus({ preventScroll: true })
    }
    if (instant || reduced) { done(); return }
    $('.palette-backdrop', palette).animate([{ opacity: 1 }, { opacity: 0 }], { duration: 600, easing: EASE, fill: 'forwards' })
    $('.palette-panel', palette).animate([
      { opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(6px)' },
    ], { duration: 500, easing: EASE, fill: 'forwards' }).onfinish = done
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
      li.setAttribute('role', 'option')
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
    else pList.innerHTML = '<li class="p-empty">没有匹配的条目</li>'
    if (!reduced) {
      let fresh = 0
      nodes.forEach((li) => {
        const f = first.get(li.dataset.pid)
        const l = li.getBoundingClientRect().top
        li.getAnimations().forEach((a) => a.cancel())
        if (f != null) {
          if (Math.abs(f - l) > 0.5) li.animate([{ transform: `translateY(${f - l}px)` }, { transform: 'none' }], { duration: 700, easing: EASE })
        } else {
          li.animate([{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: 700, delay: fresh++ * 40, easing: EASE, fill: 'backwards' })
        }
      })
    }
    pCount.textContent = query ? `${results.length} 条结果` : '最近更新'
    setActive(0)
  }
  function setActive(i) {
    active = clamp(i, 0, results.length - 1)
    const items = $$('.p-item', pList)
    items.forEach((li, k) => li.classList.toggle('active', k === active))
    items[active]?.scrollIntoView({ block: 'nearest' })
    const a = results[active]
    if (!a) { pPreview.innerHTML = ''; pPreview.dataset.v = ''; return }
    if (pPreview.dataset.v === a.id) return
    pPreview.dataset.v = a.id
    pPreview.innerHTML = `<div class="pv-no">${a.num}</div><div class="pv-title">${esc(a.title)}</div><p class="pv-sum">${a.summary}</p>
      <dl><dt>部分</dt><dd>第${cn(+a.part.id)}部 · ${esc(a.partName)}</dd><dt>章节</dt><dd>${esc(a.chapName)}</dd><dt>更新</dt><dd>${a.date}</dd><dt>篇幅</dt><dd>约 ${a.mins} 分钟${a.fig ? ' · 含交互图' : ''}</dd></dl>`
    if (!reduced) pPreview.animate([{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: 600, easing: EASE })
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

  /* ================= 明暗：水墨晕染 ================= */
  const themeLabel = $('.theme-label')
  function toggleTheme(btn) {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark'
    try { localStorage.setItem('ey-theme-washi', next) } catch {}
    const r = btn?.getBoundingClientRect()
    root.style.setProperty('--ink-x', r ? `${r.left + r.width / 2}px` : '100%')
    root.style.setProperty('--ink-y', r ? `${r.top + r.height / 2}px` : '0%')
    clearAllVT()
    transition('theme', () => {
      // 新快照需要直接是终态颜色，否则文字会在墨色里慢慢浮现
      root.classList.add('no-trans')
      root.dataset.theme = next
      themeLabel.textContent = next === 'dark' ? '纸' : '墨'
    }).then(() => root.classList.remove('no-trans'))
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
          goHome().then(() => {
            scrollTo({ top: 0, behavior: 'auto' })
            playIntro()
          })
        } else {
          scrollTo({ top: 0, behavior: 'auto' })
          playIntro()
        }
        return
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
      const row = document.activeElement.closest?.('.log-row, .g-card')
      if (row) openArticle(row.dataset.id, row)
    }
  })

  /* ================= 初始化 ================= */
  if (root.dataset.theme === 'dark') themeLabel.textContent = '纸'
  renderMasthead()
  renderContents()
  renderGallery()
  renderLog()
  renderTerms()

  const m = location.hash.match(/^#a\/(.+)$/)
  const initId = m && decodeURIComponent(m[1])
  if (initId && EY.BY_ID[initId]) {
    history.replaceState({ id: initId }, '', location.hash)
    renderArticle(EY.BY_ID[initId])
    showView('article')
    clearAllVT()
  } else if (!sessionStorage.getItem(INTRO_KEY)) {
    playIntro()
  }
})()
