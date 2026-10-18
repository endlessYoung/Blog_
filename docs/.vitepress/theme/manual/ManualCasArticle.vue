<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { withBase } from 'vitepress'
import ManualArticleFigure from './ManualArticleFigure.vue'

defineProps<{ num: string }>()

const root = ref<HTMLElement | null>(null)
const activeStep = ref(0)
let copyTimer = 0
let frame = 0
let detach = () => {}

const SOURCE = `// java.util.concurrent.atomic.AtomicInteger
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

const GLYPHS = '▓▒░<>/{}#01ABCDEF*+'

const steps = [
  { step: 0, label: '01 · 准备', text: '两个线程 T1、T2 同时对同一个 AtomicInteger 调用 incrementAndGet()，value 初始为 0。继续往下滚动，右侧的图会跟着推进；也可以用图下方的按钮单步执行。' },
  { step: 2, label: '02 · 同时读取', text: '两个线程几乎同时读取 value，各自拿到 expect = 0。没有任何锁，读取互不影响。' },
  { step: 5, label: '03 · T1 抢先', text: 'T1 先执行 CAS：内存中的值等于它手里的 expect，都是 0，于是把 value 写成 1，返回成功。' },
  { step: 6, label: '04 · T2 失败', text: 'T2 随后执行 CAS。它的 expect 还是 0，但内存已经变成 1，比较失败，写入被拒绝。T2 不会被挂起，而是回到循环开头重试。' },
  { step: 9, label: '05 · 重试成功', text: 'T2 重新读取到 1，计算出 2，这一次 CAS 成功。' },
  { step: 10, label: '06 · 结果', text: '最终 value = 2，两次自增都没有丢失。整个过程没有线程被阻塞，代价是 T2 多执行了一轮循环。' },
]

function decode(el: HTMLElement, text: string) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    el.textContent = text
    return
  }
  const start = performance.now()
  const frame = (now: number) => {
    const t = Math.min(1, (now - start) / 420)
    const shown = Math.floor(t * text.length)
    let out = text.slice(0, shown)
    for (let i = shown; i < text.length; i++) out += GLYPHS[(Math.random() * GLYPHS.length) | 0]
    el.textContent = out
    if (t < 1) requestAnimationFrame(frame)
  }
  requestAnimationFrame(frame)
}

async function copy(event: MouseEvent) {
  const button = event.currentTarget as HTMLElement
  try {
    await navigator.clipboard.writeText(SOURCE)
  } catch {
    /* clipboard may be blocked; the label still confirms the gesture */
  }
  button.classList.add('done')
  decode(button, '已复制 ✓')
  window.clearTimeout(copyTimer)
  copyTimer = window.setTimeout(() => {
    button.classList.remove('done')
    decode(button, '复制')
  }, 1800)
}

onMounted(() => {
  const host = root.value
  if (!host) return
  const nodes = [...host.querySelectorAll<HTMLElement>('.cas-step')]
  const sync = () => {
    const line = window.innerHeight * 0.46
    let current = nodes[0]
    nodes.forEach((node) => {
      if (node.getBoundingClientRect().top <= line) current = node
    })
    const next = Number(current?.dataset.step || 0)
    if (next === activeStep.value) return
    activeStep.value = next
  }
  const onScroll = () => {
    cancelAnimationFrame(frame)
    frame = requestAnimationFrame(sync)
  }
  sync()
  window.addEventListener('scroll', onScroll, { passive: true })
  detach = () => window.removeEventListener('scroll', onScroll)
})

onUnmounted(() => {
  detach()
  cancelAnimationFrame(frame)
  window.clearTimeout(copyTimer)
})
</script>

<template>
  <article ref="root" class="cas-doc">
    <section class="cas-sec">
      <p class="cas-num mono">§1</p>
      <h2 id="cas-what">什么是 CAS</h2>
      <p><code>CAS</code>（Compare And Swap，比较并交换）是非阻塞同步的实现原理。它是 CPU 硬件提供的指令，从硬件层面保证“比较”与“交换”两个操作作为一个整体原子地完成。CAS 指令包含三个操作数：</p>
      <ol>
        <li><strong>内存位置 V</strong>：需要操作的内存位置，通常是一个共享变量。</li>
        <li><strong>预期值 E</strong>：期望该内存位置当前的值。</li>
        <li><strong>新值 N</strong>：如果内存位置的当前值与预期值相等，就把它更新为新值。</li>
      </ol>
      <p><strong>如果相等，就写入新值；如果不相等，说明已经有别的线程修改过这个位置，本次操作失败。</strong>失败的线程不会被挂起，可以自行决定重试还是放弃。</p>
      <aside class="cas-note">
        <span class="mono">NOTE · 硬件</span>
        在 x86 上，CAS 对应带 <code>lock</code> 前缀的 <code>cmpxchg</code> 指令；ARM 上则由 LDREX / STREX 这类指令对实现。
      </aside>
    </section>

    <section class="cas-sec">
      <p class="cas-num mono">§2</p>
      <h2 id="cas-jdk">在 JDK 中的样子</h2>
      <p><code>AtomicInteger.incrementAndGet()</code> 最终调用 <code>Unsafe.getAndAddInt()</code>：先读取当前值，再用 CAS 尝试写入“当前值 + 1”，失败就回到循环开头。</p>
      <div class="cas-code">
        <div class="cas-code-head mono">
          <span>AtomicInteger.java · Unsafe.java</span>
          <button type="button" class="cas-copy" @click="copy">复制</button>
        </div>
        <pre><span class="ln"><span class="tok-c">// java.util.concurrent.atomic.AtomicInteger</span></span><span class="ln"><span class="tok-k">public final int</span> incrementAndGet() {</span><span class="ln">    <span class="tok-k">return</span> U.getAndAddInt(<span class="tok-k">this</span>, VALUE, 1) + 1;</span><span class="ln">}</span><span class="ln"></span><span class="ln"><span class="tok-c">// jdk.internal.misc.Unsafe</span></span><span class="ln"><span class="tok-k">public final int</span> getAndAddInt(Object o, <span class="tok-k">long</span> offset, <span class="tok-k">int</span> delta) {</span><span class="ln">    <span class="tok-k">int</span> v;</span><span class="ln">    <span class="tok-k">do</span> {</span><span class="ln">        v = getIntVolatile(o, offset);          <span class="tok-c">// 读取当前值</span></span><span class="ln">    } <span class="tok-k">while</span> (!weakCompareAndSetInt(o, offset, v, v + delta)); <span class="tok-c">// 失败就重试</span></span><span class="ln">    <span class="tok-k">return</span> v;</span><span class="ln">}</span></pre>
      </div>
      <aside class="cas-note">
        <span class="mono">NOTE · 可见性</span>
        读取用的是 <code>getIntVolatile</code>，保证每次都能看到其他线程最新写入的值，原理见
        <a class="cas-ref" :href="withBase('/Java/volatile和synchronize的区别')">volatile</a>。
      </aside>
    </section>

    <section class="cas-sec">
      <p class="cas-num mono">§3</p>
      <h2 id="cas-watch">动手看一遍</h2>
      <div class="cas-scrolly">
        <div class="cas-steps">
          <div
            v-for="item in steps"
            :key="item.step"
            class="cas-step"
            :class="{ active: item.step === activeStep }"
            :data-step="item.step"
          >
            <span class="mono">{{ item.label }}</span>
            <p>{{ item.text }}</p>
            <p v-if="item.step === 10">把鼠标移到图中的代码行上，相关的寄存器和内存会同时高亮，反过来也一样。</p>
          </div>
        </div>
        <ManualArticleFigure kind="cas" :num="num" :step="activeStep" caption="两个线程竞争同一个变量" />
      </div>
    </section>

    <section class="cas-sec">
      <p class="cas-num mono">§4</p>
      <h2 id="cas-cost">应用场景与代价</h2>
      <ul>
        <li><strong>乐观锁</strong>：<code>java.util.concurrent.atomic</code> 包中的 <code>AtomicInteger</code>、<code>AtomicReference</code> 等都基于 CAS 实现。</li>
        <li><strong>无锁数据结构</strong>：无锁队列、无锁栈用 CAS 保证线程安全，<a class="cas-ref" :href="withBase('/Java/线程池')">线程池</a> 内部的状态位也用它更新。</li>
      </ul>
      <p><strong>优点</strong>：在不阻塞线程的情况下完成原子操作，避免了锁带来的上下文切换和死锁问题。</p>
      <p><strong>缺点</strong>：</p>
      <ul>
        <li><strong>ABA 问题</strong>：CAS 只比较当前值和预期值，无法知道这个值是否被改过又改回来。可以通过版本号或时间戳解决。</li>
        <li><strong>循环开销</strong>：竞争激烈时 CAS 反复失败，线程一直空转重试，性能反而下降。</li>
        <li><strong>只能保护一个变量</strong>：多个变量需要合并成一个对象，或者改用锁；需要线程隔离时可以考虑 <a class="cas-ref" :href="withBase('/Java/ThreadLocal')">ThreadLocal</a>。</li>
      </ul>
      <aside class="cas-note">
        <span class="mono">NOTE · ABA</span>
        <code>AtomicStampedReference</code> 为值附带一个版本号，比较时同时比较值和版本。
      </aside>
      <aside class="cas-note">
        <span class="mono">NOTE · 高竞争</span>
        <code>LongAdder</code> 把一个计数拆到多个槽位上分散竞争，求和时再合并。
      </aside>
    </section>
  </article>
</template>
