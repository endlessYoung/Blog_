<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { withBase } from 'vitepress'
import ManualGuidedFigure from './ManualGuidedFigure.vue'
import { BIN_BEATS, GEN_BEATS, LOOP_BEATS } from './guided'
import type { FigKind } from './figures'

const props = defineProps<{
  kind: Exclude<FigKind, 'cas'>
  num: string
}>()

const root = ref<HTMLElement | null>(null)
const activeStep = ref(0)
const beats = props.kind === 'gen' ? GEN_BEATS : props.kind === 'bin' ? BIN_BEATS : LOOP_BEATS
let frame = 0
let copyTimer = 0
let detach = () => {}

const KOTLIN = `fun binarySearch(nums: IntArray, target: Int): Int {
    var left = 0
    var right = nums.size - 1
    while (left <= right) {
        val mid = left + (right - left) / 2
        if (nums[mid] == target) return mid
        else if (nums[mid] < target) left = mid + 1
        else right = mid - 1
    }
    return -1
}`

const LOOP = `for (;;) {
    Message msg = queue.next(); // 队列空着就停在这里
    if (msg == null) return;    // quit
    msg.target.dispatchMessage(msg);
}`

const GLYPHS = '▓▒░<>/{}#01ABCDEF*+'

function decode(el: HTMLElement, text: string) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    el.textContent = text
    return
  }
  const start = performance.now()
  const tick = (now: number) => {
    const t = Math.min(1, (now - start) / 420)
    const shown = Math.floor(t * text.length)
    let out = text.slice(0, shown)
    for (let i = shown; i < text.length; i++) out += GLYPHS[(Math.random() * GLYPHS.length) | 0]
    el.textContent = out
    if (t < 1) requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
}

async function copy(event: MouseEvent, text: string) {
  const button = event.currentTarget as HTMLElement
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    /* clipboard can be blocked; the label still changes */
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
    <template v-if="kind === 'gen'">
      <section class="cas-sec">
        <p class="cas-num mono">§1</p>
        <h2 id="eden-why">分代假设</h2>
        <p>大多数对象活不长。JVM 按这个假设把堆分成年轻代和老年代：年轻代经常回收，老年代放那些活过很多轮的对象。</p>
        <p>年轻代再分成三块：<strong>伊甸园区</strong>，以及两个幸存者区 <strong>S0</strong>、<strong>S1</strong>。新对象先放进伊甸园区。</p>
        <aside class="cas-note">
          <span class="mono">NOTE · 命名</span>
          只回收年轻代的这次收集叫 Minor GC。伊甸园区空间不够时就会触发它。老年代怎么回收，见
          <a class="cas-ref" :href="withBase('/Java/JVM分区')">JVM 分区</a>。
        </aside>
      </section>

      <section class="cas-sec">
        <p class="cas-num mono">§2</p>
        <h2 id="eden-watch">一次对象的去向</h2>
        <div class="cas-scrolly">
          <div class="cas-steps">
            <div v-for="(item, index) in beats" :key="item.label" class="cas-step" :class="{ active: index === activeStep }" :data-step="index">
              <span class="mono">{{ item.label }}</span>
              <p>{{ item.text }}</p>
            </div>
          </div>
          <ManualGuidedFigure :kind="kind" :num="num" :step="activeStep" />
        </div>
      </section>

      <section class="cas-sec">
        <p class="cas-num mono">§3</p>
        <h2 id="eden-flags">三个常用参数</h2>
        <ul>
          <li><code>-XX:NewRatio=3</code>：老年代与年轻代的比例是 3:1。</li>
          <li><code>-XX:SurvivorRatio=8</code>：伊甸园区与每一个幸存者区的比例是 8:1，所以 Eden : S0 : S1 = 8 : 1 : 1。</li>
          <li><code>-XX:MaxTenuringThreshold</code>：对象在幸存者区里要经历多少次 Minor GC 才晋升。默认 15。</li>
        </ul>
        <aside class="cas-note">
          <span class="mono">NOTE · 复制</span>
          Minor GC 不是把对象“挪走”，而是复制到另一块空的区域，然后把原来的区域整块清空。所以两个幸存者区始终有一个是空的。
        </aside>
      </section>
    </template>

    <template v-else-if="kind === 'bin'">
      <section class="cas-sec">
        <p class="cas-num mono">§1</p>
        <h2 id="bin-why">每次丢掉一半</h2>
        <p>二分查找只适用于<strong>已经排好序</strong>的数组。每次取中点比较：相等就返回，目标更大就丢掉左半，更小就丢掉右半。元素个数每比较一次大约减半，比较次数是 log₂ n。</p>
        <div class="cas-code">
          <div class="cas-code-head mono">
            <span>binarySearch.kt</span>
            <button type="button" class="cas-copy" @click="copy($event, KOTLIN)">复制</button>
          </div>
          <pre><span class="ln"><span class="tok-k">fun</span> binarySearch(nums: IntArray, target: Int): Int {</span><span class="ln">    <span class="tok-k">var</span> left = 0</span><span class="ln">    <span class="tok-k">var</span> right = nums.size - 1</span><span class="ln">    <span class="tok-k">while</span> (left &lt;= right) {</span><span class="ln">        <span class="tok-k">val</span> mid = left + (right - left) / 2</span><span class="ln">        <span class="tok-k">if</span> (nums[mid] == target) <span class="tok-k">return</span> mid</span><span class="ln">        <span class="tok-k">else if</span> (nums[mid] &lt; target) left = mid + 1</span><span class="ln">        <span class="tok-k">else</span> right = mid - 1</span><span class="ln">    }</span><span class="ln">    <span class="tok-k">return</span> -1</span><span class="ln">}</span></pre>
        </div>
        <aside class="cas-note">
          <span class="mono">NOTE · 中点</span>
          <code>left + (right - left) / 2</code> 和 <code>(left + right) / 2</code> 的结果一样，但前者在 left、right 很大时不会把两者相加溢出。
        </aside>
      </section>

      <section class="cas-sec">
        <p class="cas-num mono">§2</p>
        <h2 id="bin-watch">找 29</h2>
        <div class="cas-scrolly">
          <div class="cas-steps">
            <div v-for="(item, index) in beats" :key="item.label" class="cas-step" :class="{ active: index === activeStep }" :data-step="index">
              <span class="mono">{{ item.label }}</span>
              <p>{{ item.text }}</p>
            </div>
          </div>
          <ManualGuidedFigure :kind="kind" :num="num" :step="activeStep" />
        </div>
      </section>

      <section class="cas-sec">
        <p class="cas-num mono">§3</p>
        <h2 id="bin-variants">变的是比较条件</h2>
        <ul>
          <li><strong>找不到时的插入位置</strong>：循环条件改成 <code>left &lt; right</code>，结束时 <code>left</code> 就是应该插入的下标。</li>
          <li><strong>旋转升序数组的最小值</strong>：拿 <code>nums[mid]</code> 和 <code>nums[right]</code> 比。中点更大，说明最小值在右半，<code>left = mid + 1</code>；否则 <code>right = mid</code>。</li>
          <li><strong>整数平方根</strong>：比较的不是数组元素，而是 <code>mid * mid</code> 和 x。比 x 小就把 left 右移，循环结束后 right 是不超过 x 的最大平方根。</li>
        </ul>
        <aside class="cas-note">
          <span class="mono">NOTE · 边界</span>
          这些题仍然是每次丢掉一半。真正要分开的是：范围用 <code>left &lt;= right</code> 还是 <code>left &lt; right</code>，以及相等时返回 mid 还是继续收缩。
        </aside>
      </section>
    </template>

    <template v-else>
      <section class="cas-sec">
        <p class="cas-num mono">§1</p>
        <h2 id="loop-why">同一个进程里的线程</h2>
        <p>Handler 传递的是<strong>同一个进程里</strong>、线程之间的消息。跨进程用 Binder 或 Socket。工作线程要更新界面时，不能自己改 View，只能把这件事交给已经在循环取消息的那个线程。</p>
        <aside class="cas-note">
          <span class="mono">NOTE · 主线程</span>
          应用启动时主线程已经准备好 Looper，所以主线程里可以直接 <code>new Handler()</code>。见
          <a class="cas-ref" :href="withBase('/Android/为什么主线程可以直接new Handler')">为什么主线程可以直接 new Handler</a>。
        </aside>
      </section>

      <section class="cas-sec">
        <p class="cas-num mono">§2</p>
        <h2 id="loop-parts">五件东西</h2>
        <ul>
          <li><strong>Message</strong>：要做的事。可以是一个 <code>what</code>，也可以带一个 <code>Runnable</code>。每条消息都有目标 Handler。</li>
          <li><strong>MessageQueue</strong>：用链表保存消息。<code>enqueueMessage</code> 按 <code>when</code> 插入，不是谁先调用谁就一定排在最前。</li>
          <li><strong>Looper</strong>：在一个线程里循环调用 <code>queue.next()</code>，再把取出的消息交给它的 target。</li>
          <li><strong>ThreadLocal</strong>：每个线程自己的 Looper 存在这里，别的线程拿不到。原理见 <a class="cas-ref" :href="withBase('/Java/ThreadLocal')">ThreadLocal</a>。</li>
          <li><strong>Handler</strong>：消息的处理者。发送、处理、移除都从它进来。</li>
        </ul>
      </section>

      <section class="cas-sec">
        <p class="cas-num mono">§3</p>
        <h2 id="loop-watch">取走一条消息</h2>
        <div class="cas-scrolly">
          <div class="cas-steps">
            <div v-for="(item, index) in beats" :key="item.label" class="cas-step" :class="{ active: index === activeStep }" :data-step="index">
              <span class="mono">{{ item.label }}</span>
              <p>{{ item.text }}</p>
            </div>
          </div>
          <ManualGuidedFigure :kind="kind" :num="num" :step="activeStep" />
        </div>
        <div class="cas-code">
          <div class="cas-code-head mono">
            <span>Looper.loop 的主干</span>
            <button type="button" class="cas-copy" @click="copy($event, LOOP)">复制</button>
          </div>
          <pre><span class="ln"><span class="tok-k">for</span> (;;) {</span><span class="ln">    Message msg = queue.next(); <span class="tok-c">// 队列空着就停在这里</span></span><span class="ln">    <span class="tok-k">if</span> (msg == <span class="tok-k">null</span>) <span class="tok-k">return</span>;    <span class="tok-c">// quit</span></span><span class="ln">    msg.target.dispatchMessage(msg);</span><span class="ln">}</span></pre>
        </div>
      </section>
    </template>
  </article>
</template>
