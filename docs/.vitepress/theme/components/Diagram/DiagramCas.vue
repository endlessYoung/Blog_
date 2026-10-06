<template>
  <figure class="ey-diagram-cas" aria-labelledby="diagram-cas-title">
    <header class="ey-diagram-cas__head">
      <div class="ey-diagram-cas__badge">
        <span class="ey-diagram-cas__dot" aria-hidden="true"></span>
        INTERACTIVE // 硬件级原子原语
      </div>
      <figcaption id="diagram-cas-title" class="ey-diagram-cas__title">
        CAS (Compare-And-Swap) 并发状态机可视化
      </figcaption>
      <p class="ey-diagram-cas__sub">
        动态步进体验硬件级原子比对与无锁自旋机制。支持键盘左右键步进。
      </p>
    </header>

    <!-- 可视化舞台 -->
    <div class="ey-diagram-stage">
      <!-- 主内存区 -->
      <div class="ey-stage-box ey-stage-box--memory">
        <div class="ey-stage-box__label">主内存 (Main Memory)</div>
        <div class="ey-stage-box__val">
          <span class="ey-val-sym">V =</span>
          <span class="ey-val-num">{{ currentState.memoryVal }}</span>
        </div>
      </div>

      <!-- 比对连接线与指示器 -->
      <div class="ey-stage-flow">
        <div
          class="ey-flow-badge"
          :class="`ey-flow-badge--${currentState.result}`"
        >
          <span v-if="currentState.result === 'pending'">比对中...</span>
          <span v-else-if="currentState.result === 'failed'">比对失败 (20 ≠ 10)</span>
          <span v-else-if="currentState.result === 'success'">比对成功并写入！</span>
        </div>
        <div class="ey-flow-arrow" aria-hidden="true">↕</div>
      </div>

      <!-- 线程工作内存区 -->
      <div class="ey-stage-thread">
        <div class="ey-stage-box ey-stage-box--thread">
          <div class="ey-stage-box__label">线程 A 工作寄存器</div>
          <div class="ey-stage-row">
            <div class="ey-reg-item">
              <span class="ey-reg-lbl">预期值 E:</span>
              <span class="ey-reg-val">{{ currentState.threadExpected }}</span>
            </div>
            <div class="ey-reg-item">
              <span class="ey-reg-lbl">更新值 U:</span>
              <span class="ey-reg-val ey-reg-val--accent">{{ currentState.threadUpdate }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 步骤文字说明 -->
    <div class="ey-diagram-desc">
      <div class="ey-desc-step">
        <span class="ey-step-pill">步骤 {{ currentStepIndex + 1 }} / {{ steps.length }}</span>
        <strong class="ey-step-title">{{ currentState.title }}</strong>
      </div>
      <p class="ey-step-text">{{ currentState.desc }}</p>
    </div>

    <!-- 交互控制器 -->
    <nav class="ey-diagram-controls" aria-label="图表步进控制">
      <button
        class="ey-btn-ctrl"
        :disabled="currentStepIndex === 0"
        @click="prevStep"
        aria-label="上一步"
      >
        ← 上一步
      </button>

      <div class="ey-steps-dots" role="tablist" aria-label="步骤快速切换">
        <button
          v-for="(s, idx) in steps"
          :key="s.step"
          class="ey-step-dot"
          :class="{ 'ey-step-dot--active': idx === currentStepIndex }"
          :aria-selected="idx === currentStepIndex"
          role="tab"
          :aria-label="`跳至步骤 ${idx + 1}: ${s.name}`"
          @click="currentStepIndex = idx"
        ></button>
      </div>

      <button
        class="ey-btn-ctrl ey-btn-ctrl--primary"
        :disabled="currentStepIndex === steps.length - 1"
        @click="nextStep"
        aria-label="下一步"
      >
        下一步 →
      </button>
    </nav>

    <!-- 无 JS 替代文本 (noscript) -->
    <noscript>
      <div class="ey-diagram-noscript">
        <h4>CAS 状态机文字替代说明</h4>
        <ol>
          <li v-for="s in steps" :key="s.step">
            <strong>{{ s.title }}</strong>: {{ s.desc }}
          </li>
        </ol>
      </div>
    </noscript>
  </figure>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { CAS_STEPS } from './StateMachine'

const steps = CAS_STEPS
const currentStepIndex = ref(0)

const currentState = computed(() => steps[currentStepIndex.value])

function prevStep() {
  if (currentStepIndex.value > 0) {
    currentStepIndex.value--
  }
}

function nextStep() {
  if (currentStepIndex.value < steps.length - 1) {
    currentStepIndex.value++
  }
}

function handleKey(e: KeyboardEvent) {
  if (e.key === 'ArrowLeft') {
    prevStep()
  } else if (e.key === 'ArrowRight') {
    nextStep()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKey)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKey)
})
</script>

<style scoped>
.ey-diagram-cas {
  margin: var(--ey-space-8, 48px) 0;
  padding: var(--ey-space-6, 32px);
  background: var(--ey-surface);
  border: var(--ey-border-width, 1px) solid var(--ey-line);
  border-radius: var(--ey-radius-lg, 6px);
  position: relative;
}

.ey-diagram-cas__badge {
  display: inline-flex;
  align-items: center;
  gap: var(--ey-space-2, 8px);
  font-family: var(--ey-font-mono);
  font-size: var(--ey-text-xs, 11px);
  letter-spacing: var(--ey-tracking-wider);
  color: var(--ey-accent);
  margin-bottom: var(--ey-space-1, 4px);
}

.ey-diagram-cas__dot {
  width: 6px;
  height: 6px;
  background: var(--ey-accent);
  border-radius: var(--ey-radius-sm);
}

.ey-diagram-cas__title {
  font-family: var(--ey-font-display);
  font-size: var(--ey-text-lg, 20px);
  font-weight: 700;
  color: var(--ey-fg);
  margin: 0 0 var(--ey-space-1, 4px);
}

.ey-diagram-cas__sub {
  font-size: var(--ey-text-sm, 13px);
  color: var(--ey-fg-3);
  margin: 0 0 var(--ey-space-6, 32px);
}

/* 舞台布局 */
.ey-diagram-stage {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--ey-space-4, 16px);
  background: var(--ey-code-bg);
  padding: var(--ey-space-6, 32px);
  border-radius: var(--ey-radius-md, 4px);
  border: var(--ey-border-width, 1px) solid var(--ey-line-2);
}

.ey-stage-box {
  background: var(--ey-surface);
  border: var(--ey-border-width, 1px) solid var(--ey-line);
  border-radius: var(--ey-radius-md, 4px);
  padding: var(--ey-space-4, 16px) var(--ey-space-6, 24px);
  min-width: 260px;
  text-align: center;
  transition: all var(--ey-dur-fast) var(--ey-ease-standard);
}

.ey-stage-box--memory {
  border-color: var(--ey-accent-2);
}

.ey-stage-box__label {
  font-family: var(--ey-font-mono);
  font-size: var(--ey-text-xs, 11px);
  color: var(--ey-fg-3);
  margin-bottom: var(--ey-space-2, 8px);
}

.ey-stage-box__val {
  font-family: var(--ey-font-mono);
  font-size: var(--ey-text-xl, 24px);
  font-weight: 700;
  color: var(--ey-fg);
}

.ey-val-sym {
  color: var(--ey-accent-2);
  margin-right: 6px;
}

.ey-stage-flow {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--ey-space-1, 4px);
}

.ey-flow-badge {
  font-family: var(--ey-font-mono);
  font-size: var(--ey-text-xs, 12px);
  padding: 4px 12px;
  border-radius: var(--ey-radius-pill);
  font-weight: 600;
  transition: all var(--ey-dur-fast);
}

.ey-flow-badge--pending {
  background: var(--ey-surface-2);
  color: var(--ey-fg-2);
}

.ey-flow-badge--failed {
  background: var(--ey-vessel-danger);
  color: var(--ey-accent-fail);
}

.ey-flow-badge--success {
  background: var(--ey-vessel-tip);
  color: var(--ey-accent-ok);
}

.ey-flow-arrow {
  color: var(--ey-line-2);
  font-size: 18px;
}

.ey-stage-row {
  display: flex;
  justify-content: center;
  gap: var(--ey-space-6, 24px);
}

.ey-reg-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.ey-reg-lbl {
  font-family: var(--ey-font-mono);
  font-size: var(--ey-text-xs, 11px);
  color: var(--ey-fg-3);
}

.ey-reg-val {
  font-family: var(--ey-font-mono);
  font-size: var(--ey-text-lg, 18px);
  font-weight: 700;
  color: var(--ey-fg);
}

.ey-reg-val--accent {
  color: var(--ey-accent);
}

/* 步骤说明 */
.ey-diagram-desc {
  margin: var(--ey-space-6, 32px) 0;
  padding: var(--ey-space-4, 16px);
  background: var(--ey-surface-2);
  border-left: 3px solid var(--ey-accent);
  border-radius: 0 var(--ey-radius-md) var(--ey-radius-md) 0;
}

.ey-desc-step {
  display: flex;
  align-items: center;
  gap: var(--ey-space-3, 12px);
  margin-bottom: var(--ey-space-2, 8px);
}

.ey-step-pill {
  font-family: var(--ey-font-mono);
  font-size: var(--ey-text-xs, 11px);
  padding: 2px 8px;
  background: var(--ey-accent-soft);
  color: var(--ey-accent);
  border-radius: var(--ey-radius-sm);
  font-weight: 600;
}

.ey-step-title {
  font-size: var(--ey-text-base, 15px);
  color: var(--ey-fg);
}

.ey-step-text {
  font-size: var(--ey-text-sm, 14px);
  color: var(--ey-fg-2);
  margin: 0;
  line-height: var(--ey-leading-normal);
}

/* 控制按钮 */
.ey-diagram-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.ey-btn-ctrl {
  padding: var(--ey-space-2, 8px) var(--ey-space-4, 16px);
  background: var(--ey-surface);
  border: var(--ey-border-width, 1px) solid var(--ey-line);
  border-radius: var(--ey-radius-md, 4px);
  color: var(--ey-fg);
  font-family: var(--ey-font-mono);
  font-size: var(--ey-text-xs, 12px);
  cursor: pointer;
  transition: all var(--ey-dur-fast);
}

.ey-btn-ctrl:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.ey-btn-ctrl--primary {
  background: var(--ey-accent);
  color: var(--ey-accent-ink, #fff);
  border-color: var(--ey-accent);
}

.ey-btn-ctrl--primary:hover:not(:disabled) {
  filter: brightness(1.1);
}

.ey-steps-dots {
  display: flex;
  gap: var(--ey-space-2, 8px);
}

.ey-step-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--ey-line-2);
  border: none;
  padding: 0;
  cursor: pointer;
  transition: all var(--ey-dur-fast);
}

.ey-step-dot--active {
  background: var(--ey-accent);
  transform: scale(1.4);
}
</style>
