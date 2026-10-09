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

export interface FluidField {
  calm(on: boolean): void
  theme(light: boolean): void
  bloom(duration: number): void
  destroy(): void
}

export function mountFluid(canvas: HTMLCanvasElement): FluidField {
  const root = document.documentElement
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const canHover = window.matchMedia('(hover: hover)').matches
  const stub: FluidField = { calm() {}, theme() {}, bloom() {}, destroy() {} }
  if (reduced) {
    root.classList.add('no-webgl')
    return { ...stub, destroy() { root.classList.remove('no-webgl') } }
  }

  let gl: WebGLRenderingContext | null = null
  try {
    gl = canvas.getContext('webgl', { antialias: false, alpha: false, depth: false, powerPreference: 'low-power' })
  } catch {
    gl = null
  }
  if (!gl) {
    root.classList.add('no-webgl')
    return { ...stub, destroy() { root.classList.remove('no-webgl') } }
  }
  const context = gl

  const shader = (type: number, src: string) => {
    const item = context.createShader(type)
    if (!item) throw new Error('shader')
    context.shaderSource(item, src)
    context.compileShader(item)
    if (!context.getShaderParameter(item, context.COMPILE_STATUS)) throw new Error(context.getShaderInfoLog(item) || 'compile')
    return item
  }

  let program: WebGLProgram
  try {
    program = context.createProgram()!
    context.attachShader(program, shader(context.VERTEX_SHADER, VS))
    context.attachShader(program, shader(context.FRAGMENT_SHADER, FS))
    context.linkProgram(program)
    if (!context.getProgramParameter(program, context.LINK_STATUS)) throw new Error('link')
  } catch (error) {
    console.warn('fluid shader fallback', error)
    root.classList.add('no-webgl')
    return { ...stub, destroy() { root.classList.remove('no-webgl') } }
  }

  context.useProgram(program)
  const buffer = context.createBuffer()
  context.bindBuffer(context.ARRAY_BUFFER, buffer)
  context.bufferData(context.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), context.STATIC_DRAW)
  const loc = context.getAttribLocation(program, 'p')
  context.enableVertexAttribArray(loc)
  context.vertexAttribPointer(loc, 2, context.FLOAT, false, 0, 0)
  const U: Record<string, WebGLUniformLocation | null> = {}
  for (const key of ['uRes', 'uPtr', 'uTime', 'uAmt', 'uBloom', 'uLight', 'uScroll', 'uPa']) {
    U[key] = context.getUniformLocation(program, key)
  }

  const st = {
    time: Math.random() * 40,
    amt: 0.95,
    amtT: 0.95,
    speed: 1,
    speedT: 1,
    bloom: 1,
    light: root.classList.contains('dark') ? 0 : 1,
    scroll: 0,
    scrollT: 0,
    px: innerWidth / 2,
    py: innerHeight / 2,
    pxT: innerWidth / 2,
    pyT: innerHeight / 2,
    pa: 0,
    paT: 0,
  }
  let scale = 1
  const resize = () => {
    scale = Math.min(devicePixelRatio || 1, 1.5) * 0.5
    canvas.width = Math.max(2, Math.round(innerWidth * scale))
    canvas.height = Math.max(2, Math.round(innerHeight * scale))
    context.viewport(0, 0, canvas.width, canvas.height)
  }
  const onMove = (event: PointerEvent) => {
    st.pxT = event.clientX
    st.pyT = event.clientY
    st.paT = 1
  }
  const onLeave = () => { st.paT = 0 }
  const onScroll = () => { st.scrollT = scrollY / innerHeight }
  resize()
  window.addEventListener('resize', resize)
  if (canHover) {
    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerleave', onLeave)
  }
  window.addEventListener('scroll', onScroll, { passive: true })

  let raf = 0
  let last = 0
  let lastDraw = 0
  const frame = (now: number) => {
    raf = requestAnimationFrame(frame)
    const dt = Math.min(0.05, (now - (last || now)) / 1000)
    last = now
    const k = (rate: number) => 1 - Math.exp(-dt * rate)
    const below = Math.min(1, Math.max(0, st.scroll / 1.1))
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
    context.uniform2f(U.uRes, canvas.width, canvas.height)
    context.uniform2f(U.uPtr, st.px * scale, (innerHeight - st.py) * scale)
    context.uniform1f(U.uTime, st.time)
    context.uniform1f(U.uAmt, st.amt)
    context.uniform1f(U.uBloom, st.bloom)
    context.uniform1f(U.uLight, st.light)
    context.uniform1f(U.uScroll, st.scroll)
    context.uniform1f(U.uPa, st.pa * (st.speedT < 0.2 ? 0.15 : 1))
    context.drawArrays(context.TRIANGLES, 0, 3)
  }
  const start = () => { if (!raf) { last = 0; raf = requestAnimationFrame(frame) } }
  const stop = () => { cancelAnimationFrame(raf); raf = 0 }
  const onHide = () => (document.hidden ? stop() : start())
  document.addEventListener('visibilitychange', onHide)
  start()

  return {
    calm(on) {
      st.amtT = on ? 0.085 : 0.95
      st.speedT = on ? 0.06 : 1
    },
    theme(light) {
      st.light = light ? 1 : 0
      lastDraw = 0
    },
    bloom(duration) {
      const t0 = performance.now()
      st.bloom = 0
      const tick = (now: number) => {
        const x = Math.min(1, (now - t0) / duration)
        st.bloom = 1 - (1 - x) ** 3
        if (x < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    },
    destroy() {
      stop()
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerleave', onLeave)
      window.removeEventListener('scroll', onScroll)
      document.removeEventListener('visibilitychange', onHide)
      context.getExtension('WEBGL_lose_context')?.loseContext()
      root.classList.remove('no-webgl')
    },
  }
}
