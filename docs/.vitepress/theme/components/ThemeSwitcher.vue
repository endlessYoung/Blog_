/**
 * ThemeSwitcher.vue
 * 主题切换器 — 放置于导航栏右侧
 *
 * 功能：
 * - 三主题选择（工程/空间/流体）
 * - 深色/浅色切换（流体下禁用并标注"此主题仅深色"）
 * - 特效等级（自动/高/低/关）
 * - 键盘完全可操作（Escape 关闭，上下箭头导航，Enter/Space 选择）
 * - 移动端响应（窄屏收进导航菜单，不做底栏）
 */

<template>
  <div class="ey-theme-switcher" ref="switcherRef">
    <!-- 触发按钮 -->
    <button
      class="ey-theme-switcher__btn"
      :aria-label="`主题设置：当前 ${themeDescriptor.label}，${isDark ? '深色' : '浅色'}`"
      aria-haspopup="dialog"
      :aria-expanded="isOpen"
      @click="toggleMenu"
      @keydown.escape="closeMenu"
    >
      <span class="ey-switcher-icon" aria-hidden="true">{{ themeDescriptor.icon }}</span>
      <span class="ey-switcher-label">{{ themeDescriptor.label }}</span>
      <svg class="ey-switcher-chevron" :class="{ 'ey-switcher-chevron--open': isOpen }" width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
        <path d="M2 4l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      </svg>
    </button>

    <!-- 下拉菜单 -->
    <Transition name="ey-menu">
      <div
        v-if="isOpen"
        ref="menuRef"
        class="ey-theme-menu"
        role="dialog"
        aria-label="主题与显示设置"
        @keydown="handleMenuKey"
      >
        <!-- 主题选择 -->
        <div class="ey-theme-menu__section-label">外观主题</div>
        <button
          v-for="t in themes"
          :key="t.id"
          class="ey-theme-menu__item"
          role="menuitemradio"
          :aria-checked="currentTheme === t.id"
          @click="selectTheme(t.id)"
        >
          <span class="ey-theme-menu__item-icon" aria-hidden="true">{{ t.icon }}</span>
          <span class="ey-theme-menu__item-text">
            {{ t.label }}
            <span v-if="t.darkOnly" class="ey-theme-menu__item-badge">仅深色</span>
          </span>
          <svg v-if="currentTheme === t.id" class="ey-theme-menu__item-check" width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
            <path d="M2 7l3.5 3.5L12 3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
          </svg>
        </button>

        <div class="ey-theme-menu__divider" role="separator"></div>

        <!-- 明暗切换 -->
        <div class="ey-theme-menu__section-label">色彩模式</div>
        <button
          class="ey-theme-menu__item"
          :class="{ 'ey-theme-menu__item--disabled': isFluidDarkOnly }"
          :disabled="isFluidDarkOnly"
          :aria-label="isFluidDarkOnly ? '此主题仅深色' : '切换为深色模式'"
          :aria-pressed="isDark"
          @click="!isFluidDarkOnly && setMode('dark')"
        >
          <span class="ey-theme-menu__item-icon" aria-hidden="true">🌑</span>
          <span>深色</span>
          <svg v-if="isDark" class="ey-theme-menu__item-check" width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
            <path d="M2 7l3.5 3.5L12 3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
          </svg>
        </button>
        <button
          class="ey-theme-menu__item"
          :class="{ 'ey-theme-menu__item--disabled': isFluidDarkOnly }"
          :disabled="isFluidDarkOnly"
          :aria-label="isFluidDarkOnly ? '此主题仅深色' : '切换为浅色模式'"
          :aria-pressed="!isDark"
          @click="!isFluidDarkOnly && setMode('light')"
        >
          <span class="ey-theme-menu__item-icon" aria-hidden="true">☀️</span>
          <span>浅色</span>
          <span v-if="isFluidDarkOnly" class="ey-theme-menu__item-note">此主题仅深色</span>
          <svg v-if="!isDark && !isFluidDarkOnly" class="ey-theme-menu__item-check" width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
            <path d="M2 7l3.5 3.5L12 3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
          </svg>
        </button>

        <div class="ey-theme-menu__divider" role="separator"></div>

        <!-- 特效等级 -->
        <div class="ey-theme-menu__section-label">动效等级</div>
        <button
          v-for="level in fxLevels"
          :key="level.id"
          class="ey-theme-menu__item"
          role="menuitemradio"
          :aria-checked="currentFx === level.id"
          @click="setFx(level.id)"
        >
          <span class="ey-theme-menu__item-icon" aria-hidden="true">{{ level.icon }}</span>
          <span>{{ level.label }}</span>
          <span class="ey-theme-menu__item-note">{{ level.note }}</span>
          <svg v-if="currentFx === level.id" class="ey-theme-menu__item-check" width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
            <path d="M2 7l3.5 3.5L12 3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
          </svg>
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useTheme, type FxLevel, type ThemeId } from '../composables/useTheme'

const {
  currentTheme,
  currentMode,
  currentFx,
  themeDescriptor,
  isDark,
  isFluidDarkOnly,
  themes,
  init,
  setTheme,
  setMode,
  setFx,
} = useTheme()

onMounted(() => {
  init()
})

const isOpen = ref(false)
const switcherRef = ref<HTMLElement | null>(null)
const menuRef = ref<HTMLElement | null>(null)

const fxLevels: { id: FxLevel; label: string; icon: string; note: string }[] = [
  { id: 'auto', label: '自动', icon: '⚡', note: '按设备性能' },
  { id: 'high', label: '高特效', icon: '🎆', note: '旗舰设备' },
  { id: 'low', label: '低特效', icon: '🔋', note: '省电模式' },
  { id: 'off', label: '关闭', icon: '❌', note: '无障碍/省电' },
]

function toggleMenu() {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    // 打开后聚焦第一个可交互项
    setTimeout(() => {
      const first = menuRef.value?.querySelector<HTMLElement>('.ey-theme-menu__item')
      first?.focus()
    }, 50)
  }
}

function closeMenu() {
  isOpen.value = false
  // 关闭后焦点回到触发按钮
  ;(switcherRef.value?.querySelector('.ey-theme-switcher__btn') as HTMLElement)?.focus()
}

async function selectTheme(id: ThemeId) {
  await setTheme(id)
  closeMenu()
}

// 键盘导航
function handleMenuKey(e: KeyboardEvent) {
  const items = Array.from(menuRef.value?.querySelectorAll<HTMLElement>('.ey-theme-menu__item:not(:disabled)') ?? [])
  const current = document.activeElement as HTMLElement
  const idx = items.indexOf(current)

  if (e.key === 'Escape') {
    e.preventDefault()
    closeMenu()
  } else if (e.key === 'ArrowDown') {
    e.preventDefault()
    items[(idx + 1) % items.length]?.focus()
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    items[(idx - 1 + items.length) % items.length]?.focus()
  } else if (e.key === 'Tab' && !e.shiftKey) {
    // Tab 超出菜单末端时关闭
    if (idx === items.length - 1) {
      closeMenu()
    }
  }
}

// 点击外部关闭
function handleOutsideClick(e: MouseEvent) {
  if (!switcherRef.value?.contains(e.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleOutsideClick, { capture: true })
})

onUnmounted(() => {
  document.removeEventListener('click', handleOutsideClick, { capture: true })
})
</script>

<style scoped>
.ey-switcher-icon {
  font-size: 16px;
  line-height: 1;
}

.ey-switcher-label {
  font-size: var(--ey-text-sm, 13px);
}

/* 窄屏隐藏标签文字，只显示图标 */
@media (max-width: 768px) {
  .ey-switcher-label {
    display: none;
  }
}

.ey-switcher-chevron {
  transition: transform var(--ey-dur-fast, 120ms) var(--ey-ease-standard, ease);
}

.ey-switcher-chevron--open {
  transform: rotate(180deg);
}

.ey-theme-menu__item-text {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
}

.ey-theme-menu__item-badge {
  font-size: var(--ey-text-xs, 11px);
  padding: 1px 5px;
  border-radius: 4px;
  background: var(--ey-accent-soft, rgba(255, 79, 0, 0.14));
  color: var(--ey-accent, #ff4f00);
  font-family: var(--ey-font-mono);
  letter-spacing: 0.04em;
}

.ey-theme-menu__item-check {
  color: var(--ey-accent, #ff4f00);
  flex-shrink: 0;
  margin-left: auto;
}

/* 过渡动画 */
.ey-menu-enter-active,
.ey-menu-leave-active {
  transition: opacity var(--ey-dur-fast, 120ms), transform var(--ey-dur-fast, 120ms);
}

.ey-menu-enter-from,
.ey-menu-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
