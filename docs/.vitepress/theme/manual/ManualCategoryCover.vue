<script setup lang="ts">
import { computed } from 'vue'
import type { ManualCategory } from '../reading/catalog'

const props = defineProps<{ category: ManualCategory }>()

const descriptions: Partial<Record<string, string>> = {
  '/Android/': 'Binder 调用从一个进程穿过驱动，进入另一个进程',
  '/Kotlin/': '父 Job 派生出并行的子 Job',
  '/Flutter/': 'Dart 可空值经过判空，分别处理 null 和非空值',
  '/Java/': '对象从 JVM 堆的新生代晋升到老年代',
  '/Python/': '两个 NumPy 矩阵逐元素相加',
  '/C++/': '同一个模板分别以 int 和 double 类型实例化',
  '/Ai/': '梯度下降跨过等高线，走向损失较低的位置',
  '/Agent/': '模型调用工具，工具结果回到模型',
  '/数据结构和算法/': '二分查找每一步缩小一半搜索区间',
  '/SQL/': '查询从数据表筛选行和列，生成结果集',
}

const description = computed(() => descriptions[props.category.root])
</script>

<template>
  <figure class="category-cover">
    <figcaption>
      <span class="cover-name">{{ category.name }}</span>
      <span class="cover-count">{{ category.count }} 篇</span>
    </figcaption>
    <div v-if="description" class="cover-plate">
      <svg class="cover-diagram" viewBox="0 0 360 152" role="img" :aria-label="description">
        <g v-if="category.root === '/Android/'">
          <path class="guide" d="M56 40H304 M56 106H304" />
          <rect class="surface" x="48" y="50" width="90" height="46" />
          <rect class="surface" x="222" y="50" width="90" height="46" />
          <path class="guide dashed" d="M160 29V112 M200 29V112" />
          <path class="accent-line" d="M104 73H253l-6-5m6 5-6 5" />
          <circle class="accent-point" cx="104" cy="73" r="3" />
          <rect class="accent-fill" x="170" y="64" width="20" height="18" />
          <text x="93" y="35">客户端进程</text>
          <text x="267" y="35">服务端进程</text>
          <text x="180" y="128">Binder 驱动</text>
        </g>

        <g v-else-if="category.root === '/Kotlin/'">
          <path class="guide dashed" d="M62 54V113H298V54" />
          <path d="M180 50V68H90V94 M180 68H270V94" />
          <path class="accent-line" d="M180 50V94" />
          <rect class="accent-fill" x="138" y="22" width="84" height="28" />
          <rect class="surface" x="68" y="94" width="44" height="21" />
          <rect class="accent-fill" x="158" y="94" width="44" height="21" />
          <rect class="surface" x="248" y="94" width="44" height="21" />
          <text x="180" y="40">父 Job</text>
          <text x="180" y="135">子 Job</text>
        </g>

        <g v-else-if="category.root === '/Flutter/'">
          <path d="M103 75H143 M168 53V37H238 M168 97V113H238" />
          <path class="accent-line" d="M168 97V113H238l-6-5m6 5-6 5" />
          <rect class="surface" x="38" y="58" width="65" height="34" />
          <path class="surface" d="M168 50l28 25-28 25-28-25z" />
          <rect class="surface" x="238" y="23" width="84" height="28" />
          <rect class="accent-fill" x="238" y="99" width="84" height="28" />
          <text x="70" y="79">String?</text>
          <text x="168" y="79">判空</text>
          <text x="280" y="41">null</text>
          <text x="280" y="117">String</text>
        </g>

        <g v-else-if="category.root === '/Java/'">
          <rect class="surface" x="42" y="40" width="276" height="73" />
          <path d="M203 40V113" />
          <path class="guide" d="M159 40V113 M180 40V113" />
          <path class="guide" d="M53 77H146 M53 90H146 M53 103H146 M218 77H305 M218 90H305 M218 103H305" />
          <path class="accent-line" d="M101 89V58H264V89l-5-6m5 6 5-6" />
          <rect class="accent-fill" x="94" y="84" width="14" height="11" />
          <rect class="accent-fill" x="257" y="89" width="14" height="11" />
          <text x="122" y="131">新生代</text>
          <text x="261" y="131">老年代</text>
        </g>

        <g v-else-if="category.root === '/Python/'">
          <rect class="surface" x="41" y="43" width="66" height="66" />
          <rect class="surface" x="147" y="43" width="66" height="66" />
          <rect class="surface" x="253" y="43" width="66" height="66" />
          <path d="M63 43v66 M85 43v66 M41 65h66 M41 87h66
                   M169 43v66 M191 43v66 M147 65h66 M147 87h66
                   M275 43v66 M297 43v66 M253 65h66 M253 87h66" />
          <path d="M122 76h10m-5-5v10 M228 73h10m-10 6h10" />
          <path class="guide dashed" d="M74 50V31H286V50" />
          <rect class="accent-fill" x="63" y="65" width="22" height="22" />
          <rect class="accent-fill" x="169" y="65" width="22" height="22" />
          <rect class="accent-fill" x="275" y="65" width="22" height="22" />
          <text x="180" y="130">逐元素相加</text>
        </g>

        <g v-else-if="category.root === '/C++/'">
          <path class="guide" d="M44 43H135 M44 109H135" />
          <path d="M148 76H182V46H221 M182 76V105H221" />
          <path class="accent-line" d="M148 76H182" />
          <rect class="accent-fill" x="44" y="57" width="104" height="38" />
          <rect class="surface" x="221" y="28" width="97" height="36" />
          <rect class="surface" x="221" y="87" width="97" height="36" />
          <text x="96" y="80">template&lt;T&gt;</text>
          <text x="270" y="50">int</text>
          <text x="270" y="109">double</text>
        </g>

        <g v-else-if="category.root === '/Ai/'">
          <path class="guide" d="M56 27V124H304" />
          <g transform="rotate(-14 180 76)">
            <ellipse cx="180" cy="76" rx="109" ry="47" />
            <ellipse cx="180" cy="76" rx="85" ry="37" />
            <ellipse cx="180" cy="76" rx="61" ry="27" />
            <ellipse cx="180" cy="76" rx="36" ry="16" />
          </g>
          <path class="accent-line" d="M263 101l-29-1-24-5-18-9-12-10m2 8-2-8 8 1" />
          <circle class="accent-point" cx="263" cy="101" r="3" />
          <circle class="accent-point" cx="180" cy="76" r="3" />
          <text x="266" y="133">梯度下降</text>
        </g>

        <g v-else-if="category.root === '/Agent/'">
          <path class="guide dashed" d="M120 76H240" />
          <path class="accent-line" d="M87 57V37H273V57l-5-6m5 6 5-6" />
          <path d="M273 95v20H87V95l-5 6m5-6 5 6" />
          <rect class="surface" x="47" y="57" width="80" height="38" />
          <rect class="surface" x="233" y="57" width="80" height="38" />
          <text x="87" y="80">模型</text>
          <text x="273" y="80">工具</text>
          <text x="180" y="29">调用</text>
          <text x="180" y="132">结果</text>
        </g>

        <g v-else-if="category.root === '/数据结构和算法/'">
          <path class="guide dashed" d="M180 18V133" />
          <path class="surface" d="M58 31h244v21H58z M58 66h122v21H58z M119 101h61v21h-61z" />
          <path class="guide" d="M88.5 31v21 M119 31v21 M149.5 31v21 M180 31v21 M210.5 31v21 M241 31v21 M271.5 31v21
                                 M88.5 66v21 M119 66v21 M149.5 66v21 M149.5 101v21" />
          <path class="accent-line" d="M58 52v14 M180 52v14 M119 87v14 M180 87v14" />
          <rect class="accent-fill" x="149.5" y="101" width="30.5" height="21" />
          <text x="180" y="143">搜索区间</text>
        </g>

        <g v-else-if="category.root === '/SQL/'">
          <rect class="surface" x="42" y="34" width="112" height="84" />
          <rect class="surface" x="236" y="48" width="80" height="56" />
          <path class="guide" d="M70 34v84 M98 34v84 M126 34v84 M42 55h112 M42 76h112 M42 97h112
                                 M276 48v56 M236 67h80 M236 85h80" />
          <rect class="accent-fill" x="98" y="55" width="56" height="42" />
          <path d="M126 55v42 M98 76h56" />
          <path class="accent-line" d="M162 76H227l-6-5m6 5-6 5" />
          <text x="195" y="64">SELECT</text>
          <text x="98" y="135">数据表</text>
          <text x="276" y="123">结果集</text>
        </g>
      </svg>
    </div>
  </figure>
</template>

<style scoped>
.category-cover {
  min-width: 0;
  margin: 0;
}

figcaption {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  column-gap: 12px;
  margin-bottom: 12px;
}

.cover-name {
  font: 600 26px/1.15 var(--man-display);
  letter-spacing: -.02em;
}

.cover-count {
  color: var(--man-fg-3);
  font: 500 12px/1.4 var(--man-mono);
  white-space: nowrap;
}

.cover-plate {
  display: grid;
  place-items: center;
  min-height: 128px;
  border: 1px solid var(--man-line-2);
  background:
    linear-gradient(90deg, var(--man-grid) 1px, transparent 1px),
    linear-gradient(var(--man-grid) 1px, transparent 1px),
    var(--surface);
  background-position: center;
  background-size: 16px 16px;
}

.cover-diagram {
  display: block;
  width: 100%;
  height: auto;
  max-height: 176px;
  fill: none;
  stroke: var(--man-fg-2);
  stroke-width: 1.25;
  stroke-linejoin: round;
}

.cover-diagram text {
  fill: var(--man-fg-2);
  stroke: none;
  font: 500 12px var(--man-mono);
  text-anchor: middle;
}

.surface { fill: var(--man-bg); }
.guide { stroke: var(--man-fg-3); opacity: .48; }
.dashed { stroke-dasharray: 4 4; }
.accent-line { stroke: var(--accent); stroke-width: 2; }
.accent-fill { fill: var(--accent-soft); stroke: var(--accent); }
.accent-point { fill: var(--accent); stroke: none; }

@media (max-width: 900px) {
  figcaption { margin-bottom: 8px; }
  .cover-name { font-size: 17px; }
  .cover-plate { min-height: 0; }
  .cover-diagram { height: clamp(106px, 34vw, 128px); }
}
</style>
