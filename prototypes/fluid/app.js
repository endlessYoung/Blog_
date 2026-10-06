(() => {
  'use strict'

  const EY = window.EY
  const { PARTS, ARTICLES, BY_ID, BY_TITLE, BY_DATE, TERMS, esc, pad } = EY

  const root = document.documentElement
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
  const canHover = matchMedia('(hover: hover)').matches
  const EASE_OUT = 'cubic-bezier(.16, 1, .3, 1)'
  const EASE_IN = 'cubic-bezier(.6, 0, .8, .2)'
  const EASE_SPRING = 'cubic-bezier(.34, 1.56, .64, 1)'
  const EASE_FLOW = 'cubic-bezier(.65, 0, .35, 1)'
  const INTRO_KEY = 'ey-intro-fluid'
  const $ = (s, el = document) => el.querySelector(s)
  const $$ = (s, el = document) => [...el.querySelectorAll(s)]
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v))

  let lastPtr = { x: innerWidth / 2, y: innerHeight / 2, t: 0 }
  addEventListener('pointerdown', (e) => { lastPtr = { x: e.clientX, y: e.clientY, t: performance.now() } }, { passive: true, capture: true })

  /* ================= 流体背景 ================= */
  const fluid = (() => {
    const canvas = $('#fluid')
    const st = {
      time: Math.random() * 40, amt: 0.95, amtT: 0.95, speed: 1, speedT: 1,
      bloom: 1, light: 0, scroll: 0, scrollT: 0,
      px: innerWidth / 2, py: innerHeight / 2, pxT: innerWidth / 2, pyT: innerHeight / 2, pa: 0, paT: 0,
    }
    let gl = null
    if (!reduced) {
      try { gl = canvas.getContext('webgl', { antialias: false, alpha: false, depth: false, powerPreference: 'low-power' }) } catch { gl = null }
    }
    const api = { ok: !!gl, calm() {}, bloom() {}, theme() {} }
    if (!gl) { root.classList.add('no-webgl'); return api }

    const VS = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}'
    const FS = `precision mediump float;
uniform vec2 uRes;uniform vec2 uPtr;uniform float uTime,uAmt,uBloom,uLight,uScroll,uPa;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);
return mix(mix(h(i),h(i+vec2(1.,0.)),u.x),mix(h(i+vec2(0.,1.)),h(i+vec2(1.,1.)),u.x),u.y);}
float fbm(vec2 p){float v=0.,a=.5;mat2 m=mat2(1.6,1.2,-1.2,1.6);for(int i=0;i<5;i++){v+=a*n(p);p=m*p;a*=.5;}return v;}
void main(){
float s=min(uRes.x,uRes.y);
vec2 p=(gl_FragCoord.xy-.5*uRes)/s;
vec2 m=(uPtr-.5*uRes)/s;
vec2 d=m-p;float dl=dot(d,d);
vec2 w=p+d*uPa*.5*exp(-dl*3.5);
float t=uTime;
vec2 sp=w*1.15+vec2(0.,uScroll*.32);
vec2 q=vec2(fbm(sp+vec2(0.,t*.11)),fbm(sp+vec2(5.2,1.3)-t*.08));
vec2 r=vec2(fbm(sp+3.4*q+vec2(1.7,9.2)+t*.14),fbm(sp+3.4*q+vec2(8.3,2.8)-t*.1));
float f=fbm(sp+3.2*r);
vec3 W=vec3(.965,.945,.914);
vec3 INK=vec3(.039,.047,.063);
vec3 B=mix(INK,W,uLight);
vec3 TEAL=mix(vec3(.055,.486,.482),vec3(.42,.74,.71),uLight);
vec3 CORAL=mix(vec3(1.,.353,.212),vec3(1.,.56,.45),uLight);
vec3 AMBER=mix(vec3(1.,.71,.278),vec3(1.,.8,.52),uLight);
vec3 MINT=vec3(.812,.961,.906);
vec3 c=mix(B,TEAL*mix(.75,1.,uLight),smoothstep(.25,.62,f));
c=mix(c,CORAL,smoothstep(.42,.82,f*r.x*1.7));
c=mix(c,AMBER,smoothstep(.6,.98,r.y*f*1.6)*.85);
c=mix(c,MINT,smoothstep(.6,.92,q.x)*smoothstep(.35,.7,f)*mix(.3,.55,uLight));
float rad=length(p);
float edge=uBloom*2.4-.25+(fbm(p*2.4+t*.2)-.5)*.7;
float mk=smoothstep(edge+.04,edge-.4,rad);
vec3 col=mix(B,c,uAmt*mk);
col*=mix(1.,1.-.4*smoothstep(.35,1.35,rad),(1.-uLight)*uAmt);
gl_FragColor=vec4(col,1.);
}`
    const sh = (type, src) => {
      const s = gl.createShader(type)
      gl.shaderSource(s, src)
      gl.compileShader(s)
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s))
      return s
    }
    let prog
    try {
      prog = gl.createProgram()
      gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS))
      gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS))
      gl.linkProgram(prog)
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error('link')
    } catch (err) {
      console.warn('fluid shader fallback', err)
      root.classList.add('no-webgl')
      return api
    }
    gl.useProgram(prog)
    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const loc = gl.getAttribLocation(prog, 'p')
    gl.enableVertexAttribArray(loc)
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
    const U = {}
    for (const k of ['uRes', 'uPtr', 'uTime', 'uAmt', 'uBloom', 'uLight', 'uScroll', 'uPa']) U[k] = gl.getUniformLocation(prog, k)

    // 流体本身很柔，按 0.5 倍内部分辨率绘制再由 CSS 拉伸，DPR 上限 1.5
    let scale = 1
    function resize() {
      scale = Math.min(devicePixelRatio || 1, 1.5) * 0.5
      canvas.width = Math.max(2, Math.round(innerWidth * scale))
      canvas.height = Math.max(2, Math.round(innerHeight * scale))
      gl.viewport(0, 0, canvas.width, canvas.height)
    }
    resize()
    addEventListener('resize', resize)

    if (canHover) {
      addEventListener('pointermove', (e) => { st.pxT = e.clientX; st.pyT = e.clientY; st.paT = 1 }, { passive: true })
      document.addEventListener('pointerleave', () => { st.paT = 0 })
    }
    addEventListener('scroll', () => { st.scrollT = scrollY / innerHeight }, { passive: true })

    let raf = 0, last = 0, lastDraw = 0
    function frame(now) {
      raf = requestAnimationFrame(frame)
      const dt = Math.min(0.05, (now - (last || now)) / 1000)
      last = now
      const k = (rate) => 1 - Math.exp(-dt * rate)
      const below = clamp(st.scroll / 1.1, 0, 1)
      const amtT = st.speedT < 0.2 ? st.amtT : st.amtT - 0.5 * below * below * (3 - 2 * below)
      st.amt += (amtT - st.amt) * k(1.6)
      st.speed += (st.speedT - st.speed) * k(1.6)
      st.px += (st.pxT - st.px) * k(2.6)
      st.py += (st.pyT - st.py) * k(2.6)
      st.pa += (st.paT - st.pa) * k(1.5)
      st.scroll += (st.scrollT - st.scroll) * k(3)
      st.time += dt * st.speed
      const calm = st.speedT < 0.2 && Math.abs(st.amt - amtT) < 0.01
      if (calm && now - lastDraw < 90) return
      lastDraw = now
      gl.uniform2f(U.uRes, canvas.width, canvas.height)
      gl.uniform2f(U.uPtr, st.px * scale, (innerHeight - st.py) * scale)
      gl.uniform1f(U.uTime, st.time)
      gl.uniform1f(U.uAmt, st.amt)
      gl.uniform1f(U.uBloom, st.bloom)
      gl.uniform1f(U.uLight, st.light)
      gl.uniform1f(U.uScroll, st.scroll)
      gl.uniform1f(U.uPa, st.pa * (st.speedT < 0.2 ? 0.15 : 1))
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }
    const start = () => { if (!raf) { last = 0; raf = requestAnimationFrame(frame) } }
    const stop = () => { cancelAnimationFrame(raf); raf = 0 }
    document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()))
    start()

    api.calm = (on) => { st.amtT = on ? 0.085 : 0.95; st.speedT = on ? 0.06 : 1 }
    api.theme = (light) => { st.light = light ? 1 : 0; lastDraw = 0 }
    api.bloom = (dur) => {
      const t0 = performance.now()
      st.bloom = 0
      const tick = (now) => {
        const x = Math.min(1, (now - t0) / dur)
        st.bloom = 1 - Math.pow(1 - x, 3)
        if (x < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }
    return api
  })()

  /* ================= 开场 ================= */
  const heroTitle = $('#heroTitle')
  const liquidDisp = $('#liquidDisp')
  function splitTitle() {
    let i = 0
    $$('.line', heroTitle).forEach((line) => {
      const drop = $('.title-drop', line)
      const text = line.firstChild.textContent
      line.firstChild.remove()
      const frag = document.createDocumentFragment()
      ;[...text].forEach((ch) => {
        const s = document.createElement('span')
        s.className = 'ch'
        s.textContent = ch
        s.style.setProperty('--i', i++)
        frag.append(s)
      })
      line.insertBefore(frag, drop)
    })
  }
  function renderBubbles() {
    const stats = [
      [EY.TOTAL_ARTICLES, '篇文章'],
      [pad(PARTS.length), '个部分'],
      [pad(EY.TOTAL_CHAPTERS), '个章节'],
    ]
    $('#bubbles').innerHTML = stats.map(([v, l], i) => `<div class="bubble b${i + 1}"><dd>${v}</dd><dt>${l}</dt></div>`).join('')
    $('#lastUpdate').textContent = EY.LAST_UPDATE
  }

  let liquidRaf = 0
  function playIntro() {
    sessionStorage.setItem(INTRO_KEY, '1')
    if (reduced) return
    fluid.bloom(2600)
    root.classList.remove('intro')
    void root.offsetWidth
    root.classList.add('intro')
    const chs = $$('.ch', heroTitle)
    const mid = (chs.length - 1) / 2
    chs.forEach((c, i) => {
      c.getAnimations().forEach((a) => a.cancel())
      const d = Math.abs(i - mid)
      c.animate([
        { fontWeight: 300, transform: 'translateY(.05em) scale(.96, .9)', letterSpacing: '.02em' },
        { fontWeight: 720, transform: 'translateY(-.025em) scale(1.02, 1.05)', offset: 0.62 },
        { fontWeight: 620, transform: 'none', letterSpacing: '0em' },
      ], { duration: 1500, delay: 140 + d * 70, easing: EASE_OUT, fill: 'backwards' })
    })
    // 位移滤镜从强到无，结束后移除，避免常驻滤镜的绘制开销
    cancelAnimationFrame(liquidRaf)
    heroTitle.style.filter = 'url(#liquid)'
    const t0 = performance.now()
    const tick = (now) => {
      const x = Math.min(1, (now - t0) / 1900)
      liquidDisp.setAttribute('scale', (34 * Math.pow(1 - x, 2.2)).toFixed(2))
      if (x < 1) liquidRaf = requestAnimationFrame(tick)
      else heroTitle.style.filter = ''
    }
    liquidRaf = requestAnimationFrame(tick)
    $$('.bubble').forEach((b, i) => b.animate(
      [{ transform: 'scale(.55)', opacity: 0.35 }, { transform: 'none', opacity: 1 }],
      { duration: 1100, delay: 650 + i * 120, easing: EASE_SPRING, fill: 'backwards' },
    ))
    setTimeout(() => root.classList.remove('intro'), 2600)
  }

  // 标题字母随指针靠近而变粗
  if (canHover && !reduced) {
    const hero = $('#hero')
    let raf = 0
    hero.addEventListener('pointermove', (e) => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        $$('.ch', heroTitle).forEach((c) => {
          const r = c.getBoundingClientRect()
          const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2)
          const f = Math.exp(-(dx * dx + dy * dy) / (2 * 150 * 150))
          c.style.fontWeight = String(Math.round(620 + 80 * f - 120 * (1 - f) * 0.35))
          c.style.translate = `0 ${(-0.03 * f).toFixed(3)}em`
        })
      })
    })
    hero.addEventListener('pointerleave', () => {
      cancelAnimationFrame(raf)
      $$('.ch', heroTitle).forEach((c) => { c.style.fontWeight = ''; c.style.translate = '' })
    })
  }

  /* ================= 预览面板 ================= */
  const previewStage = $('#previewStage')
  let previewKey = null
  function preview(key, html) {
    if (key === previewKey) return
    previewKey = key
    const old = $('.pv-card:not(.leaving)', previewStage)
    const card = document.createElement('div')
    card.className = 'pv-card'
    card.innerHTML = html
    previewStage.append(card)
    if (!old) return
    if (reduced) { old.remove(); return }
    old.classList.add('leaving')
    old.animate(
      [{ opacity: 1, filter: 'blur(0)', transform: 'none' }, { opacity: 0, filter: 'blur(10px)', transform: 'translateY(-14px) scale(.96)' }],
      { duration: 260, easing: EASE_IN, fill: 'forwards' },
    ).onfinish = () => old.remove()
    const y = lastPtr.y - previewStage.getBoundingClientRect().top
    card.animate(
      [
        { clipPath: `circle(0% at 12% ${clamp(y, 20, 280)}px)`, filter: 'blur(8px)', opacity: 0.4 },
        { clipPath: `circle(150% at 12% ${clamp(y, 20, 280)}px)`, filter: 'blur(0)', opacity: 1 },
      ],
      { duration: 620, delay: 40, easing: EASE_OUT, fill: 'backwards' },
    )
  }
  const partCard = (p) => {
    const recent = BY_DATE.filter((a) => a.part === p).slice(0, 3)
    return `<div class="pv-num">第 ${p.id} 部分 · ${p.en}</div>
      <div class="pv-title">${p.name}</div>
      <p class="pv-sum">${p.chapters.map((c) => c.name).join(' / ')}</p>
      <div class="pv-meta"><span>${p.count} 篇</span><span>${p.chapters.length} 章</span></div>
      <ul>${recent.map((a) => `<li><span>${a.date}</span><span>${a.title}</span></li>`).join('')}</ul>`
  }
  const artCard = (a) => `<div class="pv-num">${a.num}</div>
      <div class="pv-title">${a.title}</div>
      <p class="pv-sum">${a.summary}</p>
      <div class="pv-meta"><span>${a.date}</span><span>${a.mins} 分钟</span>${a.fig ? '<span class="hot">含交互图</span>' : ''}</div>`
  const introCard = () => `<div class="pv-num">从这里开始</div>
      <div class="pv-title">推荐从交互图读起</div>
      <p class="pv-sum">带 FIG 标记的文章包含可以亲手操作的原理图。</p>
      <ul>${ARTICLES.filter((a) => a.fig).map((a) => `<li><span>${a.num}</span><span>${a.title}</span></li>`).join('')}</ul>`

  /* ================= 目录 ================= */
  const partsEl = $('#parts')
  let gooRow = null
  const artLink = (a) => `<a href="#a/${a.id}" class="art-link${a.fig ? ' has-fig' : ''}" data-id="${a.id}"><span class="art-num">${a.num}</span><span class="art-title">${a.title}</span>${a.fig ? '<span class="fig-tag">FIG</span>' : ''}</a>`
  function renderParts() {
    partsEl.innerHTML = `<div class="goo-track" id="gooTrack" aria-hidden="true"><i class="g-lead"></i><i class="g-tail"></i><i class="g-drip"></i></div>` +
      PARTS.map((p) => `
      <div class="part" data-part="${p.id}">
        <button class="part-row" aria-expanded="false" aria-controls="pb-${p.id}">
          <span class="part-num">${p.id}</span>
          <span class="part-name">${p.name}</span>
          <span class="part-en">${p.en}</span>
          <span class="part-count">${p.count}<small>篇</small></span>
          <span class="part-toggle" aria-hidden="true"></span>
        </button>
        <div class="part-body" id="pb-${p.id}" inert>
          <div class="part-inner">
            <div class="chapters">
              ${p.chapters.map((c, ci) => `
                <div class="chap" style="--i:${ci}">
                  <div class="chap-head"><span>${c.name}</span><span>${pad(c.items.length)}</span></div>
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
      if (row) onPartHover(row)
      if (link) preview(link.dataset.id, artCard(BY_ID[link.dataset.id]))
    })
    partsEl.addEventListener('pointerleave', () => gooHide())
    partsEl.addEventListener('focusin', (e) => {
      const row = e.target.closest('.part-row')
      const link = e.target.closest('.art-link')
      if (row) onPartHover(row)
      if (link) preview(link.dataset.id, artCard(BY_ID[link.dataset.id]))
    })
    partsEl.addEventListener('focusout', (e) => { if (!partsEl.contains(e.relatedTarget)) gooHide() })
    partsEl.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return
      const items = $$('.part-row, .part.open .art-link', partsEl)
      const i = items.indexOf(document.activeElement)
      if (i < 0) return
      e.preventDefault()
      items[clamp(i + (e.key === 'ArrowDown' ? 1 : -1), 0, items.length - 1)].focus()
    })
  }
  function onPartHover(row) {
    const p = PARTS.find((x) => x.id === row.parentElement.dataset.part)
    gooTo(row)
    preview(`part-${p.id}`, partCard(p))
  }
  function gooTo(row, follow = false) {
    const track = $('#gooTrack')
    if (gooRow && gooRow !== row) gooRow.classList.remove('hot')
    gooRow = row
    row.classList.add('hot')
    const pr = partsEl.getBoundingClientRect()
    const r = row.getBoundingClientRect()
    const x = r.left - pr.left, y = r.top - pr.top
    const [lead, tail, drip] = track.children
    lead.style.cssText = `width:${r.width}px;height:${r.height}px;translate:${x}px ${y}px`
    tail.style.cssText = `width:${r.width * 0.72}px;height:${r.height * 0.8}px;translate:${x + r.width * 0.14}px ${y + r.height * 0.1}px`
    drip.style.cssText = `width:${r.height * 0.9}px;height:${r.height * 0.9}px;translate:${x + 6}px ${y + r.height * 0.05}px`
    if (!track.classList.contains('on') && !follow) {
      // 首次出现时不滑动，直接在当前行“冒出来”
      track.classList.add('snap')
      void track.offsetWidth
      track.classList.remove('snap')
    }
    track.classList.add('on')
  }
  function gooHide() {
    $('#gooTrack')?.classList.remove('on')
    gooRow?.classList.remove('hot')
    gooRow = null
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
    if (gooRow && !instant) {
      const t0 = performance.now()
      const follow = () => {
        if (!gooRow) return
        gooTo(gooRow, true)
        if (performance.now() - t0 < 720) requestAnimationFrame(follow)
      }
      requestAnimationFrame(follow)
    }
  }

  /* ================= 图集 ================= */
  const MINI = {
    loop: `<div class="mini m-loop">
        <div class="goo-box"><i class="core"></i><i class="q q1"></i><i class="q q2"></i><i class="q q3"></i><i class="out"></i><span class="orbit"><i></i></span></div>
        <span class="lab" style="left:24px;top:132px">MessageQueue</span><span class="lab" style="left:200px;top:40px;translate:-50% 0">Looper</span><span class="lab" style="right:18px;top:132px">Handler</span>
      </div>`,
    cas: `<div class="mini m-cas">
        <div class="goo-box"><i class="v v1"></i><i class="v v2"></i><i class="mem"></i><i class="d d1"></i><i class="d d2"></i><i class="d d3"></i><i class="d d4"></i></div>
        <span class="lab l1">T1</span><span class="lab l2">T2</span>
        <span class="memv"><b>0</b><b>1</b><b>2</b></span>
      </div>`,
    gen: `<div class="mini m-gen">
        <div class="pools"><span>EDEN</span><span>S0</span><span>S1</span><span>OLD</span></div>
        <div class="goo-box"><i class="o o1"></i><i class="o o2"></i><i class="o o3"></i><i class="o o4"></i><i class="o o5"></i></div>
      </div>`,
    bin: `<div class="mini m-bin">
        <div class="cells">${Array.from({ length: 11 }, (_, k) => `<i class="${k === 7 ? 'hit' : ''}"></i>`).join('')}</div>
        <div class="goo-box"><i class="p lo"></i><i class="p hi"></i><i class="p mid"></i></div>
        <span class="lab" style="left:22px;top:150px">lo</span><span class="lab" style="right:22px;top:150px">hi</span>
      </div>`,
  }
  function renderGallery() {
    const track = $('#galleryTrack')
    track.innerHTML = ARTICLES.filter((a) => a.fig).map((a, i) => `
      <div class="fig-card k-${a.fig.kind}" data-id="${a.id}" tabindex="0" role="link" aria-label="${a.title}">
        <div class="fig-stage">${MINI[a.fig.kind]}</div>
        <div class="fig-cap">
          <span class="fig-num" data-vt="num">FIG ${pad(i + 1)} · ${a.num}</span>
          <h3 data-vt="title">${a.fig.caption}</h3>
          <span class="fig-go" aria-hidden="true">→</span>
        </div>
      </div>`).join('')

    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => en.target.classList.toggle('running', en.isIntersecting))
    }, { threshold: 0.35 })
    $$('.fig-card', track).forEach((c) => io.observe(c))

    const g = $('#gallery')
    let down = false, startX = 0, startL = 0, moved = 0, lastX = 0, lastT = 0, vel = 0, raf = 0
    g.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return
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
    $('#log').innerHTML = BY_DATE.slice(0, 8).map((a) => `
      <li class="log-row" tabindex="0" data-id="${a.id}" role="link">
        <span class="log-date">${a.date}</span>
        <span class="art-num">${a.num}</span>
        <span class="art-title">${a.title}</span>
        <span class="log-part">${a.partName} · ${a.chapName}</span>
        <span class="log-arrow" aria-hidden="true">→</span>
      </li>`).join('')
  }
  function renderTerms() {
    const groups = {}
    TERMS.forEach(([g, term, title]) => { (groups[g] ||= []).push([term, BY_TITLE[title]]) })
    $('#terms').innerHTML = Object.entries(groups).map(([g, list]) => `
      <div class="term-group"><h4>${g}</h4>
        <div class="term-list">${list.map(([term, a]) => `<a href="#a/${a.id}" class="term" data-id="${a.id}" data-peek><span class="art-title">${term}</span></a>`).join('')}</div>
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

  const refs = (html) => EY.renderRefs(html, (a, text) => `<a href="#a/${a.id}" class="ref" data-id="${a.id}" data-peek>${esc(text)}</a>`)
  const codeBlock = () => `
    <div class="code">
      <div class="code-head"><span class="code-dots" aria-hidden="true"><i></i><i></i><i></i></span><span>AtomicInteger.java · Unsafe.java</span>
        <button class="copy-btn" data-copy><span class="copy-fill" aria-hidden="true"></span><span class="copy-txt">复制</span></button></div>
      <pre>${EY.highlightJava(EY.JAVA_SRC)}</pre>
    </div>`

  function casBody() {
    const A = EY.CAS_ARTICLE
    return A.sections.map((s, i) => {
      const n = i + 1
      const head = `<header class="sec-head"><span class="sec-num">${pad(n)}</span><h2>${s.title}</h2></header>`
      if (s.scrolly) {
        return `<section class="a-sec a-scrolly" data-sec="${n}" data-title="${s.title}">${head}
          <div class="scrolly">
            <div class="scrolly-text">${A.scrollySteps.map((st, k) => `
              <div class="step" data-step="${st.step}"><span class="step-label"><i>${pad(k + 1)}</i>${st.label}</span><p>${st.text}</p></div>`).join('')}
            </div>
            <div class="scrolly-fig">${casFigure()}</div>
          </div>
        </section>`
      }
      const html = refs(s.html).replace('{{code}}', codeBlock())
      const notes = (s.notes || []).map((no) => `<div class="note"><span class="note-label">${no.label}</span>${refs(no.html)}</div>`).join('')
      return `<section class="a-sec" data-sec="${n}" data-title="${s.title}">${head}
        <div class="prose-row"><div class="prose">${html}</div><aside class="side">${notes}</aside></div>
      </section>`
    }).join('')
  }

  function renderArticle(a) {
    currentId = a.id
    const isCas = a.id === BY_TITLE['CAS'].id
    articleEl.innerHTML = `
      <header class="a-head">
        <button class="a-back" data-action="back"><span aria-hidden="true">←</span> 返回目录</button>
        <span class="a-num" style="view-transition-name: vt-num">${a.num}</span>
        <h1 class="a-title" style="view-transition-name: vt-title">${a.title}</h1>
        <div class="a-meta">
          <span>部分 <b>${a.part.id} ${a.partName}</b></span>
          <span>章节 <b>${a.chapName} ${pad(a.index)}/${pad(a.total)}</b></span>
          ${isCas ? `<span>创建 <b>${EY.CAS_ARTICLE.created}</b></span>` : ''}
          <span>更新 <b>${a.date}</b></span>
          <span>约 <b>${a.mins}</b> 分钟</span>
        </div>
      </header>
      ${isCas ? casBody() : `
        <div class="stub">
          <p>${a.summary}</p>
          <p class="stub-dim">演示页只包含《CAS》的完整正文和交互图。</p>
          <button data-id="${BY_TITLE['CAS'].id}" class="stub-btn">打开 ${BY_TITLE['CAS'].num} CAS <span aria-hidden="true">→</span></button>
        </div>`}`
    document.title = `${a.num} ${a.title} · Endlessyoung`
    stopScrolly()
    if (isCas) {
      mountCas($('#casFig'))
      mountScrolly()
    }
    setupFlask(a.mins)
  }

  function showView(v) {
    view = v
    viewIndex.hidden = v !== 'index'
    viewArticle.hidden = v !== 'article'
    fluid.calm(v === 'article')
    root.classList.toggle('reading', v === 'article')
    if (v === 'index') {
      document.title = 'Endlessyoung · 流动的原理笔记（改版演示）'
      stopScrolly()
      flaskData = null
    }
  }

  /* ================= 页面转场：水滴 ================= */
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
  function blobPoly(cx, cy, R, ph, rough, N, ink) {
    const pts = new Array(N)
    for (let i = 0; i < N; i++) {
      const a = (i / N) * Math.PI * 2
      let k = 0.55 * Math.sin(3 * a + ph) + 0.3 * Math.sin(5 * a - ph * 1.3) + 0.15 * Math.sin(8 * a + ph * 2.1)
      if (ink) k += 0.35 * Math.sin(13 * a - ph * 2.7) + 0.22 * Math.sin(21 * a + ph * 3.3)
      const r = R * (1 + rough * k)
      pts[i] = `${(cx + Math.cos(a) * r).toFixed(1)}px ${(cy + Math.sin(a) * r).toFixed(1)}px`
    }
    return `polygon(${pts.join(',')})`
  }
  function dropFrames(pt, { shrink = false, ink = false } = {}) {
    const far = Math.hypot(Math.max(pt.x, innerWidth - pt.x), Math.max(pt.y, innerHeight - pt.y)) * (ink ? 1.45 : 1.3)
    const offs = [0, 0.12, 0.38, 0.7, 1]
    const rads = [0.5, 0.05, 0.3, 0.7, 1]
    const N = ink ? 120 : 64
    const seed = Math.random() * 6
    const frames = offs.map((o, i) => ({
      offset: o,
      clipPath: blobPoly(pt.x, pt.y, i === 0 ? 0.5 : far * rads[i], seed + i * 1.2, (ink ? 0.22 : 0.12) * (1 - o * 0.75), N, ink),
    }))
    if (!shrink) return frames
    return frames.reverse().map((f) => ({ ...f, offset: 1 - f.offset }))
  }
  function pointOf(el) {
    if (performance.now() - lastPtr.t < 800) return { x: lastPtr.x, y: lastPtr.y }
    if (el && el.getBoundingClientRect) {
      const r = el.getBoundingClientRect()
      if (r.width) return { x: r.left + r.width / 2, y: r.top + r.height / 2 }
    }
    return { x: innerWidth / 2, y: innerHeight / 2 }
  }
  function centerOfEl(el) {
    const r = el?.getBoundingClientRect()
    if (!r || !r.width) return { x: innerWidth / 2, y: innerHeight * 0.4 }
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 }
  }

  function transition(update, { from = null, to = null, back = false, kind = 'page' } = {}) {
    if (!document.startViewTransition || reduced) { update(); return Promise.resolve() }
    root.dataset.vt = kind
    root.classList.toggle('vt-back', back)
    const vt = document.startViewTransition(update)
    vt.ready.then(() => {
      if (kind === 'theme') {
        root.animate({ clipPath: dropFrames(from, { ink: true }) }, { duration: 1150, easing: 'cubic-bezier(.45, 0, .2, 1)', pseudoElement: '::view-transition-new(root)' })
        return
      }
      if (back) {
        const pt = to ? to() : { x: innerWidth / 2, y: innerHeight / 2 }
        root.animate({ clipPath: dropFrames(pt, { shrink: true }) }, { duration: 720, easing: 'cubic-bezier(.55, 0, .3, 1)', pseudoElement: '::view-transition-old(root)', fill: 'forwards' })
        root.animate([{ transform: 'scale(1.04)', filter: 'brightness(.7)' }, { transform: 'none', filter: 'none' }], { duration: 720, easing: EASE_OUT, pseudoElement: '::view-transition-new(root)' })
      } else {
        root.animate({ clipPath: dropFrames(from) }, { duration: 820, easing: 'cubic-bezier(.7, 0, .25, 1)', pseudoElement: '::view-transition-new(root)' })
        root.animate([{ transform: 'none', filter: 'none' }, { transform: 'scale(.965)', filter: 'brightness(.65) blur(2px)' }], { duration: 820, easing: EASE_FLOW, pseudoElement: '::view-transition-old(root)', fill: 'forwards' })
      }
    }).catch(() => {})
    return vt.finished.catch(() => {}).finally(() => {
      root.classList.remove('vt-back')
      delete root.dataset.vt
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
    const from = pointOf(src)
    clearAllVT()
    tagVT(src)
    if (!fromHistory) history.pushState({ id }, '', `#a/${id}`)
    transition(() => {
      closePalette(true)
      clearAllVT()
      renderArticle(a)
      showView('article')
      scrollTo(0, 0)
    }, { from }).then(() => clearAllVT())
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
    const navPt = pointOf(null)
    clearAllVT()
    transition(() => {
      clearAllVT()
      showView('index')
      if (thenScrollTo) {
        $(thenScrollTo)?.scrollIntoView()
        return
      }
      if (lastIndexSrc && lastIndexSrc.dataset.id === id && lastIndexSrc.isConnected) {
        target = lastIndexSrc
        const part = target.closest('.part')
        if (part && !part.classList.contains('open')) setPartOpen(part, true, true)
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
    }, { back: true, to: () => (thenScrollTo ? navPt : centerOfEl(target)) }).then(() => clearAllVT())
  }

  addEventListener('popstate', (e) => {
    if (e.state && e.state.id) openArticle(e.state.id, null, true)
    else goHome(true)
  })

  /* ================= 阅读液位 ================= */
  const flask = $('#flask')
  const flaskDots = $('#flaskDots')
  let flaskData = null
  function setupFlask(mins) {
    const secs = $$('[data-sec]', articleEl)
    if (!secs.length) { flaskData = null; flask.classList.remove('show'); return }
    flaskData = { mins, secs }
    flaskDots.innerHTML = secs.map((s, i) => `<button class="f-dot" data-dot="${i}" aria-label="跳到第 ${i + 1} 节：${s.dataset.title}"><i></i></button>`).join('')
    requestAnimationFrame(() => {
      layoutFlask()
      flask.classList.add('show')
    })
  }
  function layoutFlask() {
    if (!flaskData) return
    const top = articleEl.getBoundingClientRect().top + scrollY
    const total = Math.max(1, articleEl.offsetHeight - innerHeight)
    flaskData.top = top
    flaskData.total = total
    flaskData.offs = flaskData.secs.map((s) => s.getBoundingClientRect().top + scrollY - innerHeight * 0.4)
    updateFlask()
  }
  function updateFlask() {
    if (!flaskData || view !== 'article') return
    const p = clamp((scrollY - flaskData.top + 80) / flaskData.total, 0, 1)
    let cur = 0
    flaskData.offs.forEach((o, i) => { if (scrollY >= o) cur = i })
    flask.style.setProperty('--level', p.toFixed(4))
    $('#flaskPct').textContent = `${Math.round(p * 100)}%`
    const sec = flaskData.secs[cur]
    const label = `${pad(cur + 1)} ${sec.dataset.title}`
    const secEl = $('#flaskSec')
    if (secEl.textContent !== label) {
      secEl.textContent = label
      if (!reduced) secEl.animate([{ filter: 'blur(4px)', opacity: 0.2, transform: 'translateY(4px)' }, { filter: 'none', opacity: 1, transform: 'none' }], { duration: 360, easing: EASE_OUT })
    }
    $('#flaskLeft').textContent = `剩余 ${Math.max(0, Math.ceil(flaskData.mins * (1 - p)))} 分钟`
    $$('.f-dot', flaskDots).forEach((d, i) => { d.classList.toggle('passed', i < cur); d.classList.toggle('now', i === cur) })
  }
  flaskDots.addEventListener('click', (e) => {
    const d = e.target.closest('[data-dot]')
    if (!d || !flaskData) return
    const sec = flaskData.secs[+d.dataset.dot]
    scrollTo({ top: sec.getBoundingClientRect().top + scrollY - 96, behavior: reduced ? 'auto' : 'smooth' })
  })
  $('#flaskOrb').addEventListener('click', () => scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' }))
  let flaskRaf = 0
  addEventListener('scroll', () => { cancelAnimationFrame(flaskRaf); flaskRaf = requestAnimationFrame(updateFlask) }, { passive: true })
  addEventListener('resize', () => layoutFlask())

  /* ================= CAS 交互图 ================= */
  const lineAttr = (k) => EY.CAS_LINKS[k].join(',')
  function casFigure() {
    const thread = (t) => `
      <div class="thread" data-t="${t}">
        <div class="thread-name"><span class="t-badge">${t.toUpperCase()}</span><span class="thread-status">就绪</span></div>
        <div class="reg" data-lines="${lineAttr('expect')}"><span>expect</span><b data-f="expect">—</b></div>
        <div class="reg" data-lines="${lineAttr('update')}"><span>update</span><b data-f="update">—</b></div>
        <div class="reg" data-lines="${lineAttr('retry')}"><span>retry</span><b data-f="retry">0</b></div>
      </div>`
    return `
      <div class="fig" id="casFig">
        <div class="fig-head"><span class="fig-id">图 3 · 02.JUC.02</span><span class="fig-step">步骤 <b class="fig-cur">00</b> / ${pad(EY.CAS_STEPS.length - 1)}</span></div>
        <div class="cas-stage">
          <div class="cas-goo" aria-hidden="true"><i class="g-vessel" data-g="t1"></i><i class="g-mem"></i><i class="g-vessel" data-g="t2"></i></div>
          <div class="cas-ui">
            ${thread('t1')}
            <div class="memory" data-lines="${lineAttr('memory')}">
              <span class="mem-label">value @0x7F3A</span>
              <div class="mem-core"><span class="mem-val">0</span></div>
              <span class="mem-label">AtomicInteger</span>
            </div>
            ${thread('t2')}
          </div>
          <div class="cas-fly" aria-hidden="true"></div>
        </div>
        <div class="fig-code"><span class="line-blob" aria-hidden="true"></span>${EY.CAS_CODE.map((l, i) => `<div class="cl" data-line="${i + 1}"><span class="cl-no">${i + 1}</span><span class="cl-mark"></span><span class="cl-src">${esc(l)}</span></div>`).join('')}</div>
        <div class="fig-log"><p></p></div>
        <div class="fig-foot">
          <div class="fig-progress"><i></i></div>
          <div class="fig-ctrl">
            <button data-c="reset">重置</button>
            <button data-c="prev">上一步</button>
            <button data-c="next" class="primary">单步 →</button>
            <button data-c="play">▶ 播放</button>
            <button data-c="speed" class="speed">1×</button>
          </div>
        </div>
      </div>`
  }

  let cas = null
  function mountCas(fig) {
    const STEPS = EY.CAS_STEPS
    const stage = $('.cas-stage', fig)
    const goo = $('.cas-goo', stage)
    const fly = $('.cas-fly', stage)
    const gMem = $('.g-mem', goo)
    const gV = { t1: $('[data-g="t1"]', goo), t2: $('[data-g="t2"]', goo) }
    const memCore = $('.mem-core', fig)
    const memVal = $('.mem-val', fig)
    const lines = $$('.cl', fig)
    const lineBlob = $('.line-blob', fig)
    const curEl = $('.fig-cur', fig)
    const logEl = $('.fig-log p', fig)
    const bar = $('.fig-progress i', fig)
    const playBtn = $('[data-c="play"]', fig)
    const threads = { t1: $('[data-t="t1"]', fig), t2: $('[data-t="t2"]', fig) }
    const last = STEPS.length - 1
    const speeds = [1, 2, 0.5]
    let speedIdx = 0, cur = 0, pending = null, timer = 0, playing = false
    const speed = () => speeds[speedIdx]

    function rel(el) {
      const r = el.getBoundingClientRect(), sr = stage.getBoundingClientRect()
      return { x: r.left - sr.left, y: r.top - sr.top, w: r.width, h: r.height, cx: r.left - sr.left + r.width / 2, cy: r.top - sr.top + r.height / 2 }
    }
    function layoutGoo() {
      if (!stage.offsetWidth) return
      for (const t of ['t1', 't2']) {
        const b = rel(threads[t])
        gV[t].style.cssText = `width:${b.w}px;height:${b.h}px;translate:${b.x}px ${b.y}px`
      }
      const m = rel(memCore)
      gMem.style.cssText = `width:${m.w}px;height:${m.h}px;translate:${m.x}px ${m.y}px`
    }
    new ResizeObserver(layoutGoo).observe(stage)

    function renderCode(s) {
      let nowLine = 0
      lines.forEach((l) => {
        const n = +l.dataset.line
        $('.cl-mark', l).innerHTML = `${s.t1.line === n ? '<i class="mk m1">1</i>' : ''}${s.t2.line === n ? '<i class="mk m2">2</i>' : ''}`
        const now = !!s.actor && s[s.actor].line === n
        l.classList.toggle('now', now)
        if (now) nowLine = n
      })
      if (nowLine) {
        const l = lines[nowLine - 1]
        lineBlob.style.translate = `0 ${l.offsetTop}px`
        lineBlob.style.height = `${l.offsetHeight}px`
        lineBlob.classList.add('on')
        lineBlob.classList.toggle('t2', s.actor === 't2')
      } else lineBlob.classList.remove('on')
      curEl.textContent = pad(cur)
      if (logEl.innerHTML !== s.log) {
        logEl.innerHTML = s.log
        if (!reduced) logEl.animate([{ opacity: 0, filter: 'blur(5px)', transform: 'translateY(6px)' }, { opacity: 1, filter: 'none', transform: 'none' }], { duration: 380, easing: EASE_OUT })
      }
      bar.style.width = `${(cur / last) * 100}%`
    }
    function pop(el) {
      if (reduced) return
      el.animate([{ transform: 'scale(1.5)', filter: 'blur(3px)', color: 'var(--accent)' }, { transform: 'none', filter: 'none' }], { duration: 480, easing: EASE_SPRING })
    }
    function setText(el, v, animate) {
      const s = String(v)
      if (el.textContent === s) return
      el.textContent = s
      if (animate) pop(el)
    }
    function renderStage(s, animate = false) {
      if (memVal.textContent !== String(s.v)) {
        memVal.textContent = s.v
        if (animate && !reduced) memVal.animate([{ transform: 'scale(.4)', filter: 'blur(8px)', opacity: 0 }, { transform: 'none', filter: 'none', opacity: 1 }], { duration: 560, easing: EASE_SPRING })
      }
      for (const t of ['t1', 't2']) {
        const el = threads[t]
        const st = s[t]
        for (const node of [el, gV[t]]) {
          node.classList.toggle('active', s.actor === t)
          node.classList.toggle('ok', st.cls === 'ok')
          node.classList.toggle('fail', st.cls === 'fail')
        }
        $('.thread-status', el).textContent = st.status
        setText($('[data-f="expect"]', el), st.expect, animate)
        setText($('[data-f="update"]', el), st.update, animate)
        setText($('[data-f="retry"]', el), st.retry, animate)
      }
    }
    function drop(cls, size, label) {
      const g = document.createElement('i')
      g.className = `g-drop ${cls}`
      g.style.width = g.style.height = `${size}px`
      goo.append(g)
      let l = null
      if (label != null) {
        l = document.createElement('span')
        l.className = 'fly-num'
        l.style.width = l.style.height = `${size}px`
        l.textContent = label
        fly.append(l)
      }
      return { g, l, size }
    }
    const at = (x, y, size, sx = 1, sy = sx) => `translate(${(x - size / 2).toFixed(1)}px, ${(y - size / 2).toFixed(1)}px) scale(${sx}, ${sy})`
    function moveBoth(d, frames, opts) {
      const strip = ({ lo, ...f }) => f
      const anims = [d.g.animate(frames.map(strip), opts)]
      if (d.l) anims.push(d.l.animate(frames.map((f) => ({ ...strip(f), opacity: f.lo ?? 1 })), opts))
      return anims
    }
    function wobble(el, sx, sy, dur) {
      if (!el.animate) return
      el.animate([{ scale: '1 1' }, { scale: `${sx} ${sy}` }, { scale: `${2 - sx * 0.98} ${2 - sy * 0.98}` }, { scale: '1 1' }], { duration: dur, easing: 'ease-out' })
    }

    function flow(s, prevS) {
      layoutGoo()
      const actor = s.actor
      const th = threads[actor]
      const m = rel(memCore)
      const mR = m.w / 2
      const D = 30
      const dur = 760 / speed()
      const anims = []
      const nodes = []
      const extra = []
      // 动画期间先显示上一步的值，液滴到达后再更新
      renderStage({ ...s, v: prevS.v, [actor]: {
        ...s[actor],
        expect: s.fx === 'read' ? prevS[actor].expect : s[actor].expect,
        retry: prevS[actor].retry,
        cls: s.fx === 'read' ? s[actor].cls : prevS[actor].cls,
        status: s.fx === 'read' ? s[actor].status : '执行 CAS',
      } })
      if (s.fx === 'read') {
        const to = rel($('[data-f="expect"]', th))
        const dir = Math.sign(to.cx - m.cx)
        const d = drop('read', D, String(s.v))
        nodes.push(d)
        anims.push(...moveBoth(d, [
          { transform: at(m.cx, m.cy, D, 0.4), lo: 0 },
          { transform: at(m.cx + dir * (mR - 4), m.cy, D, 1.2, 0.85), offset: 0.3, lo: 1 },
          { transform: at((m.cx + to.cx) / 2, m.cy - 22, D, 1.18, 0.88), offset: 0.62 },
          { transform: at(to.cx, to.cy, D, 0.55), lo: 0.2 },
        ], { duration: dur, easing: EASE_FLOW, fill: 'forwards' }))
        extra.push(() => wobble(gV[actor], 1.03, 0.98, 420))
      } else {
        const from = rel($('[data-f="update"]', th))
        const dir = Math.sign(m.cx - from.cx)
        const d = drop(s.fx === 'fail' ? 'bad' : 'write', D, String(s[actor].update))
        nodes.push(d)
        if (s.fx === 'write') {
          anims.push(...moveBoth(d, [
            { transform: at(from.cx, from.cy, D, 0.5), lo: 0.2 },
            { transform: at((from.cx + m.cx) / 2, m.cy - 26, D, 1.22, 0.86), offset: 0.45, lo: 1 },
            { transform: at(m.cx - dir * (mR - 2), m.cy, D, 1.1, 0.9), offset: 0.78 },
            { transform: at(m.cx, m.cy, D, 0.5), lo: 0 },
          ], { duration: dur, easing: EASE_FLOW, fill: 'forwards' }))
          extra.push(() => { gMem.animate([{ scale: '1' }, { scale: '1.16' }, { scale: '.97' }, { scale: '1' }], { duration: 640, easing: 'ease-out' }) })
        } else {
          const fd = dur * 1.9
          const hitX = m.cx - dir * (mR + D / 2 + 9)
          anims.push(...moveBoth(d, [
            { transform: at(from.cx, from.cy, D, 0.5), lo: 0.2 },
            { transform: at((from.cx + hitX) / 2, m.cy - 24, D, 1.22, 0.86), offset: 0.2, lo: 1 },
            { transform: at(hitX, m.cy, D, 0.7, 1.25), offset: 0.36, lo: 1 },
            { transform: at(hitX - dir * 6, m.cy, D, 0.2), offset: 0.42, lo: 0 },
            { transform: at(hitX - dir * 6, m.cy, D, 0), lo: 0 },
          ], { duration: fd, easing: 'linear', fill: 'forwards' }))
          const impactAt = fd * 0.36
          const splashT = setTimeout(() => {
            wobble(gMem, 0.9, 1.1, 520)
            // 溅射主要朝上下方向，水平方向略偏回线程一侧，避免小液滴立刻被线程容器吞掉
            const SPRAY = [[0.1, -1], [0.3, 1], [-0.3, -0.7], [-0.15, 0.78], [0.45, -0.4]]
            SPRAY.forEach(([vx, vy], k) => {
              const sz = [20, 17, 15, 17, 14][k]
              const sp = drop('bad', sz, null)
              nodes.push(sp)
              const ox = hitX - dir * vx * 46, oy = m.cy + vy * 74
              anims.push(sp.g.animate([
                { transform: at(hitX, m.cy, sz, 0.5) },
                { transform: at(ox, oy, sz, 1.1), offset: 0.4 },
                { transform: at((ox + from.cx) / 2, (oy + from.cy) / 2 - 10, sz, 1), offset: 0.7 },
                { transform: at(from.cx + (k - 2) * 4, from.cy, sz, 0.4) },
              ], { duration: fd - impactAt - 60, delay: k * 35, easing: EASE_FLOW, fill: 'forwards' }))
            })
          }, impactAt)
          const t = setTimeout(() => pending && pending.done(true), fd + 60)
          pending = {
            anims,
            done: (natural) => {
              clearTimeout(splashT); clearTimeout(t)
              anims.forEach((a) => a.cancel())
              nodes.forEach((n) => { n.g.remove(); n.l?.remove() })
              renderStage(s, true)
              if (natural) wobble(gV[actor], 1.05, 0.96, 520)
              pending = null
            },
          }
          return
        }
      }
      const t = setTimeout(() => pending && pending.done(true), dur)
      pending = {
        anims,
        done: (natural) => {
          clearTimeout(t)
          anims.forEach((a) => a.cancel())
          nodes.forEach((n) => { n.g.remove(); n.l?.remove() })
          renderStage(s, true)
          if (natural) extra.forEach((f) => f())
          pending = null
        },
      }
    }

    function go(n, animate) {
      if (pending) pending.done()
      const prevS = STEPS[cur]
      cur = clamp(n, 0, last)
      const s = STEPS[cur]
      renderCode(s)
      if (animate && s.fx && !reduced) flow(s, prevS)
      else renderStage(s, animate && !reduced)
    }
    function stop() {
      playing = false
      clearTimeout(timer)
      playBtn.textContent = '▶ 播放'
      playBtn.classList.remove('on')
    }
    function play() {
      if (cur >= last) go(0, false)
      playing = true
      playBtn.textContent = '❚❚ 暂停'
      playBtn.classList.add('on')
      const tick = () => {
        if (!playing) return
        if (cur >= last) { stop(); return }
        go(cur + 1, true)
        const s = STEPS[cur]
        timer = setTimeout(tick, (s.fx === 'fail' ? 2000 : 1250) / speed())
      }
      timer = setTimeout(tick, 200)
    }
    function runTo(target) {
      stop()
      if (target <= cur || target - cur > 5) { go(target, false); return }
      const tick = () => {
        if (cur >= target) return
        go(cur + 1, true)
        timer = setTimeout(tick, STEPS[cur].fx === 'fail' ? 900 : 560)
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

    go(0, false)
    cas = { runTo, stop: () => { stop(); if (pending) pending.done() }, get cur() { return cur } }
  }

  /* ================= 滚动叙事 ================= */
  let scrollyIO = null
  function mountScrolly() {
    const steps = $$('.step', articleEl)
    let activeStep = null
    scrollyIO = new IntersectionObserver((entries) => {
      if (!entries.some((en) => en.isIntersecting)) return
      // 相邻两段可能同时落在触发带内，以越过 47% 视口线的最后一段为准
      const line = innerHeight * 0.47
      let pick = steps[0]
      steps.forEach((s) => { if (s.getBoundingClientRect().top <= line) pick = s })
      if (pick === activeStep) return
      activeStep = pick
      steps.forEach((s) => s.classList.toggle('active', s === pick))
      cas && cas.runTo(+pick.dataset.step)
    }, { rootMargin: '-42% 0px -52% 0px' })
    steps.forEach((s) => scrollyIO.observe(s))
  }
  function stopScrolly() {
    scrollyIO?.disconnect()
    scrollyIO = null
    cas?.stop()
    cas = null
  }

  /* ================= 复制：水滴注满 ================= */
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-copy]')
    if (!b) return
    navigator.clipboard?.writeText(EY.JAVA_SRC).catch(() => {})
    const r = b.getBoundingClientRect()
    b.style.setProperty('--cx', `${(e.clientX || r.left + r.width / 2) - r.left}px`)
    b.style.setProperty('--cy', `${(e.clientY || r.top + r.height / 2) - r.top}px`)
    b.classList.add('done')
    const txt = $('.copy-txt', b)
    txt.textContent = '已复制'
    if (!reduced) {
      txt.animate([{ filter: 'blur(4px)', opacity: 0 }, { filter: 'none', opacity: 1 }], { duration: 320, easing: EASE_OUT })
      for (let k = 0; k < 4; k++) {
        const d = document.createElement('i')
        d.className = 'splash'
        b.append(d)
        const ang = -Math.PI / 2 + (k - 1.5) * 0.6
        d.animate([
          { transform: 'translate(-50%, -50%) scale(.4)', opacity: 1 },
          { transform: `translate(calc(-50% + ${Math.cos(ang) * 30}px), calc(-50% + ${Math.sin(ang) * 26}px)) scale(1)`, opacity: 1, offset: 0.55 },
          { transform: `translate(calc(-50% + ${Math.cos(ang) * 38}px), calc(-50% + ${Math.sin(ang) * 18 + 14}px)) scale(.2)`, opacity: 0 },
        ], { duration: 700, delay: k * 30, easing: EASE_OUT }).onfinish = () => d.remove()
      }
    }
    clearTimeout(b._t)
    b._t = setTimeout(() => { b.classList.remove('done'); txt.textContent = '复制' }, 1800)
  })

  /* ================= 链接预览 ================= */
  const peek = $('#peek')
  let peekTimer = 0, hideTimer = 0, peekFor = null
  function showPeek(el) {
    const a = BY_ID[el.dataset.id]
    if (!a) return
    peekFor = el
    peek.innerHTML = `<span class="pk-num">${a.num}</span><h5>${a.title}</h5><p>${a.summary}</p>
      <div class="pk-foot"><span>${a.partName} · ${a.chapName}</span><span>${a.mins} 分钟${a.fig ? ' · 含交互图' : ''}</span></div>`
    peek.hidden = false
    const r = el.getBoundingClientRect()
    const w = peek.offsetWidth, h = peek.offsetHeight
    const left = clamp(r.left + r.width / 2 - w / 2, 12, innerWidth - w - 12)
    const below = r.bottom + 14 + h < innerHeight
    const top = below ? r.bottom + 12 : r.top - h - 12
    peek.style.left = `${left}px`
    peek.style.top = `${top}px`
    const ox = r.left + r.width / 2 - left
    peek.style.transformOrigin = `${ox}px ${below ? 'top' : 'bottom'}`
    if (!reduced) {
      peek.animate([
        { opacity: 0, transform: 'scale(.3)', borderRadius: '50%', filter: 'blur(6px)' },
        { opacity: 1, transform: 'none', borderRadius: '28px', filter: 'none' },
      ], { duration: 460, easing: EASE_SPRING })
    }
  }
  function hidePeek(instant = false) {
    clearTimeout(peekTimer)
    if (peek.hidden) return
    peekFor = null
    if (instant || reduced) { peek.hidden = true; return }
    peek.animate([{ opacity: 1 }, { opacity: 0, transform: 'scale(.85)', filter: 'blur(4px)' }], { duration: 160, easing: EASE_IN })
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

  /* ================= 搜索面板 ================= */
  const palette = $('#palette')
  const pPanel = $('.palette-panel', palette)
  const pInput = $('#paletteInput')
  const pList = $('#paletteList')
  const pHl = $('#paletteHl')
  const pPreview = $('#palettePreview')
  const pCount = $('#paletteCount')
  const nodeCache = new Map()
  let results = []
  let active = 0
  let query = ''

  function openPalette() {
    if (!palette.hidden) return
    hidePeek(true)
    palette.hidden = false
    root.classList.add('palette-open')
    pInput.value = ''
    query = ''
    pList.textContent = ''
    filter()
    pInput.focus()
    if (!reduced) {
      const btn = $('.search-btn').getBoundingClientRect()
      const pr = pPanel.getBoundingClientRect()
      const x = btn.left + btn.width / 2 - pr.left, y = btn.top + btn.height / 2 - pr.top
      pPanel.animate([
        { clipPath: `circle(0px at ${x}px ${y}px)`, opacity: 0.6 },
        { clipPath: `circle(${Math.hypot(pr.width, pr.height) * 1.1}px at ${x}px ${y}px)`, opacity: 1 },
      ], { duration: 620, easing: EASE_OUT })
      $('.palette-backdrop', palette).animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300 })
    }
  }
  function closePalette(instant = false) {
    if (palette.hidden) return
    root.classList.remove('palette-open')
    if (instant || reduced) { palette.hidden = true; return }
    pPanel.animate([
      { opacity: 1, transform: 'none', filter: 'none' }, { opacity: 0, transform: 'scale(.96)', filter: 'blur(6px)' },
    ], { duration: 200, easing: EASE_IN }).onfinish = () => { palette.hidden = true }
    $('.palette-backdrop', palette).animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200 })
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
    else pList.innerHTML = '<li class="p-empty">没有匹配的条目</li>'
    if (!reduced) {
      nodes.forEach((li, i) => {
        const f = first.get(li.dataset.pid)
        const l = li.getBoundingClientRect().top
        if (f != null) {
          if (Math.abs(f - l) > 0.5) li.animate([{ transform: `translateY(${f - l}px)` }, { transform: 'none' }], { duration: 420, easing: EASE_SPRING })
        } else {
          li.animate([{ opacity: 0, transform: 'translateY(10px) scale(.96)', filter: 'blur(4px)' }, { opacity: 1, transform: 'none', filter: 'none' }], { duration: 360, delay: i * 22, easing: EASE_OUT, fill: 'backwards' })
        }
      })
    }
    pCount.textContent = query ? `${results.length} 条结果` : '最近更新'
    setActive(0, true)
  }
  function setActive(i, jump = false) {
    active = clamp(i, 0, results.length - 1)
    const items = $$('.p-item', pList)
    items.forEach((li, k) => li.classList.toggle('active', k === active))
    const a = results[active]
    const li = items[active]
    if (li) {
      li.scrollIntoView({ block: 'nearest' })
      pHl.classList.toggle('jump', jump)
      pHl.style.translate = `0 ${li.offsetTop - pList.scrollTop}px`
      pHl.style.height = `${li.offsetHeight}px`
      pHl.classList.add('on')
    } else pHl.classList.remove('on')
    if (!a) { pPreview.innerHTML = ''; return }
    pPreview.innerHTML = `<span class="pp-num">${a.num}</span><h3>${a.title}</h3><p>${a.summary}</p>
      <dl><dt>部分</dt><dd>${a.part.id} ${a.partName}</dd><dt>章节</dt><dd>${a.chapName}</dd><dt>更新</dt><dd>${a.date}</dd><dt>阅读</dt><dd>${a.mins} 分钟${a.fig ? ' · 含交互图' : ''}</dd></dl>`
    if (!reduced) pPreview.animate([{ opacity: 0.2, filter: 'blur(5px)', transform: 'translateY(6px)' }, { opacity: 1, filter: 'none', transform: 'none' }], { duration: 300, easing: EASE_OUT })
  }
  pList.addEventListener('scroll', () => {
    const li = $$('.p-item', pList)[active]
    if (li) { pHl.classList.add('jump'); pHl.style.translate = `0 ${li.offsetTop - pList.scrollTop}px` }
  }, { passive: true })
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

  /* ================= 明暗：墨滴入水 ================= */
  function toggleTheme() {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark'
    const apply = () => { root.dataset.theme = next; fluid.theme(next === 'light') }
    if (reduced) { apply(); return }
    const pt = centerOfEl($('[data-action="theme"]'))
    if (document.startViewTransition) {
      hidePeek(true)
      clearAllVT()
      transition(apply, { from: pt, kind: 'theme' })
      return
    }
    const ov = document.createElement('div')
    ov.className = 'ink-overlay'
    ov.style.background = next === 'dark' ? '#0A0C10' : '#F6F1E9'
    document.body.append(ov)
    ov.animate({ clipPath: dropFrames(pt, { ink: true }) }, { duration: 900, easing: 'cubic-bezier(.45, 0, .2, 1)', fill: 'forwards' }).finished
      .then(() => { apply(); return ov.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 360, fill: 'forwards' }).finished })
      .then(() => ov.remove())
  }

  /* ================= 顶栏导航水滴 ================= */
  const topnav = $('#topnav')
  const navBlob = $('.nav-blob', topnav)
  if (canHover) {
    topnav.addEventListener('pointerover', (e) => {
      const a = e.target.closest('a')
      if (!a) return
      if (!navBlob.classList.contains('on')) {
        navBlob.classList.add('snap')
        void navBlob.offsetWidth
      }
      navBlob.style.translate = `${a.offsetLeft}px 0`
      navBlob.style.width = `${a.offsetWidth}px`
      navBlob.classList.remove('snap')
      navBlob.classList.add('on')
    })
    topnav.addEventListener('pointerleave', () => navBlob.classList.remove('on'))
  }

  /* ================= 全局事件 ================= */
  document.addEventListener('click', (e) => {
    const act = e.target.closest('[data-action]')
    if (act) {
      const a = act.dataset.action
      if (a === 'home' || a === 'back') goHome()
      if (a === 'palette') openPalette()
      if (a === 'palette-close') closePalette()
      if (a === 'theme') toggleTheme()
      if (a === 'replay') {
        if (view !== 'index') goHome()
        scrollTo({ top: 0, behavior: 'auto' })
        playIntro()
      }
      return
    }
    const nav = e.target.closest('.topnav a, [data-nav]')
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
  splitTitle()
  renderBubbles()
  renderParts()
  renderGallery()
  renderLog()
  renderTerms()
  preview('intro', introCard())

  const m = location.hash.match(/^#a\/(.+)$/)
  if (m && BY_ID[decodeURIComponent(m[1])]) {
    const id = decodeURIComponent(m[1])
    history.replaceState({ id }, '', location.hash)
    renderArticle(BY_ID[id])
    showView('article')
  } else if (!sessionStorage.getItem(INTRO_KEY)) {
    playIntro()
  }
})()
