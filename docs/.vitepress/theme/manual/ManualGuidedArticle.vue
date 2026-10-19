<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { withBase } from 'vitepress'
import ManualGuidedFigure from './ManualGuidedFigure.vue'
import { BIN_BEATS, GC_BEATS, GEN_BEATS, LOOP_BEATS } from './guided'
import type { FigKind } from './figures'

const props = defineProps<{
  kind: Exclude<FigKind, 'cas'>
  num: string
}>()

const root = ref<HTMLElement | null>(null)
const activeStep = ref(0)
const beats = props.kind === 'gen' ? GEN_BEATS : props.kind === 'bin' ? BIN_BEATS : props.kind === 'loop' ? LOOP_BEATS : GC_BEATS
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

const BARRIER = `void post_write_barrier(oop* field, oop new_val) {
    // 地址右移 9 位，对应 512 字节的一张卡
    CARD_TABLE[((size_t)field) >> 9] = 0; // 0 表示 dirty
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

    <template v-else-if="kind === 'loop'">
      <section class="cas-sec">
        <h2 id="loop-why">同一个进程里的线程</h2>
        <p>Handler 传递的是<strong>同一个进程里</strong>、线程之间的消息。跨进程用 Binder 或 Socket。工作线程要更新界面时，不能自己改 View，只能把这件事交给已经在循环取消息的那个线程。</p>
        <aside class="cas-note">
          <span class="mono">NOTE · 主线程</span>
          应用启动时主线程已经准备好 Looper，所以主线程里可以直接 <code>new Handler()</code>。见
          <a class="cas-ref" :href="withBase('/Android/为什么主线程可以直接new Handler')">为什么主线程可以直接 new Handler</a>。
        </aside>
      </section>

      <section class="cas-sec">
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

    <template v-else-if="kind === 'gc'">
      <section class="cas-sec">
        <h2 id="gc-dead">怎么判断对象已死</h2>
        <p>回收之前先要知道哪些对象不可能再被用到。堆和方法区是主要发生垃圾回收的地方。</p>
        <h3 id="gc-count">引用计数</h3>
        <p>每个对象带一个计数器。多一处引用就加 1，引用失效就减 1，计数到 0 就可以回收。两个对象互相引用、外面已经没人指向它们时，计数都还是 1，回收不掉。这就是循环引用。</p>
        <h3 id="gc-reach">可达性</h3>
        <p>HotSpot 用的是可达性分析。从 <strong>GC Roots</strong> 出发，顺着引用往下走。走不到的对象就是不可用的，哪怕它们彼此还连着。</p>
        <p>能当根的包括：栈帧里的局部变量、类的静态字段、常量（包括字符串常量池里的引用）、JNI 引用、被 <code>synchronized</code> 锁住的对象，以及虚拟机自己的一些常驻对象。</p>
      </section>

      <section class="cas-sec">
        <h2 id="gc-three">三种回收</h2>
        <p>对象确认存活之后，剩下的差别是空闲空间怎么留下来。下面同一段内存走三种结果。</p>
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
        <h2 id="gc-gen">分代</h2>
        <p>大多数对象活不长；熬过的轮次越多，越不容易死；跨代引用相对少。所以年轻代用复制，老年代用标记-清除或标记-整理。</p>
        <p>年轻代的 Eden 和两个 Survivor 按 8:1:1 来划，细节在 <a class="cas-ref" :href="withBase('/Java/伊甸园区算法')">伊甸园区算法</a>。一次 Minor GC 后存活对象装不下 Survivor，就由老年代做分配担保，直接晋升。</p>
        <h3 id="gc-card">卡表</h3>
        <p>年轻代里的对象可能被老年代引用。如果为此去扫整个老年代，Minor GC 就变成全堆扫描。HotSpot 用卡表：老年代按 512 字节切成卡页，卡表里每个字节对应一页。这一页里有字段指向年轻代，该字节就标成 dirty。Minor GC 只扫 dirty 的页。</p>
        <p>赋值器写下 <code>obj.field = value</code> 时，写屏障把字段所在的卡标脏。</p>
        <div class="cas-code">
          <div class="cas-code-head mono">
            <span>写后屏障</span>
            <button type="button" class="cas-copy" @click="copy($event, BARRIER)">复制</button>
          </div>
          <pre><span class="ln"><span class="tok-k">void</span> post_write_barrier(oop* field, oop new_val) {</span><span class="ln">    <span class="tok-c">// 地址右移 9 位，对应 512 字节的一张卡</span></span><span class="ln">    CARD_TABLE[((size_t)field) &gt;&gt; 9] = 0; <span class="tok-c">// 0 表示 dirty</span></span><span class="ln">}</span></pre>
        </div>
      </section>

      <section class="cas-sec">
        <h2 id="gc-color">三色标记</h2>
        <p>标记如果全程停住用户线程，大堆会停很久。并发标记让收集线程和用户线程一起执行。对象按扫描进度分成三色：</p>
        <ul>
          <li><strong>白色</strong>：还没访问过。这一轮结束时仍是白色，就是垃圾。</li>
          <li><strong>灰色</strong>：自己访问过了，直接引用的对象还没扫完。</li>
          <li><strong>黑色</strong>：自己和直接引用的对象都扫过了，不会再扫它的直接引用。</li>
        </ul>
        <h3 id="gc-miss">漏标</h3>
        <p>用户线程中途改引用，可能多留一点浮动垃圾，下一轮再收，这不影响正确性。漏标才会把活对象当成白色收掉。</p>
        <p>漏标要同时发生两件事：黑色对象新插入一条指向白色对象的引用；灰色对象删掉了所有通向这个白色对象的引用。黑色不会再被扫描，灰色又走不到它，白色就丢了。</p>
        <h3 id="gc-fix">增量更新与 SATB</h3>
        <p>打破任意一个条件就够了。</p>
        <ul>
          <li><strong>增量更新</strong>，CMS 用。写后屏障记下黑色对象新插入的引用，并发标记结束后把这些黑色对象退回灰色再扫一遍。重新标记阶段仍然要停一会儿。</li>
          <li><strong>原始快照 SATB</strong>，G1 用。写前屏障记下被删掉的旧引用。不管后来引用怎么改，都按这一轮开始时的对象图判断存活。</li>
        </ul>
      </section>

      <section class="cas-sec">
        <h2 id="gc-pick">怎么选</h2>
        <ul>
          <li><strong>标记-清除</strong>：空间都能用，不移动对象，但会留下碎片，之后只能走空闲链表。CMS 的清除阶段是这一路。</li>
          <li><strong>复制</strong>：没有碎片，分配只移动堆顶指针。耗时跟存活对象的数量走，年轻代合适。传统半区只用一半内存，Appel 式能用到大约 90%。</li>
          <li><strong>标记-整理</strong>：也没有碎片，也不预留半区。移动对象还要改全部引用，停顿更重。老年代常用。</li>
        </ul>
      </section>

      <section class="cas-sec">
        <h2 id="gc-later">停顿被挪到并发</h2>
        <p>堆从几 GB 涨到上百 GB 之后，停顿本身成了问题。后面的收集器是在把原来停住的阶段挪到和用户线程一起执行。</p>
        <ul>
          <li><strong>CMS</strong>：标记和清除可以并发。整理仍然要停，浮动垃圾多了会 Concurrent Mode Failure，退回 Serial Old。</li>
          <li><strong>G1</strong>：堆切成同样大小的 Region，按停顿预测挑回收哪些区。并发标记用 SATB。</li>
          <li><strong>ZGC</strong>：染色指针用 64 位地址的高位记下标记状态，读屏障在线程读到旧地址时把指针改过来。标记、转移、重定位都可以并发，停顿和堆的大小解开。</li>
        </ul>
      </section>
    </template>
  </article>
</template>
