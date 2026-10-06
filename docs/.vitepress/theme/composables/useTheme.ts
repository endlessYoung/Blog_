/**
 * useTheme.ts
 * 主题 / 明暗模式 / 特效等级 状态管理 Composable
 *
 * SSR 安全：模块顶层不访问 window / document / localStorage
 * 所有 browser API 调用均在 onMounted / 判断 typeof window 之后执行
 */

import { ref, computed, watch, readonly } from 'vue'

// ===================================================================
// 类型定义
// ===================================================================

export type ThemeId = 'engineering' | 'spatial' | 'fluid'
export type ColorMode = 'dark' | 'light'
export type FxLevel = 'auto' | 'high' | 'low' | 'off'

export interface ThemeDescriptor {
  id: ThemeId
  label: string
  icon: string
  darkOnly: boolean  // 流体主题仅深色
  description: string
}

export const THEMES: readonly ThemeDescriptor[] = [
  {
    id: 'engineering',
    label: '工程手册',
    icon: '⊞',
    darkOnly: false,
    description: '12 栏精密网格 · 遥测仪表 · 零特效基线',
  },
  {
    id: 'spatial',
    label: '空间',
    icon: '✦',
    darkOnly: false,
    description: '亚克力毛玻璃 · 弹簧物理 · 3D 视差',
  },
  {
    id: 'fluid',
    label: '流体',
    icon: '≈',
    darkOnly: true,
    description: 'WebGL 流光极光 · 液态 Gooey · 仅深色',
  },
] as const

// 默认值（同时用于 SSR 的 HTML 属性初始值）
export const DEFAULT_THEME: ThemeId = 'engineering'
export const DEFAULT_MODE: ColorMode = 'dark'
export const DEFAULT_FX: FxLevel = 'auto'

// localStorage 键名
const LS_THEME = 'ey-theme'
const LS_FX = 'ey-fx'
// 每个主题各自记忆明暗模式
const lsModeKey = (t: ThemeId) => `ey-mode-${t}`

// ===================================================================
// SSR 安全的 localStorage 工具
// ===================================================================

function safeGetItem(key: string): string | null {
  if (typeof window === 'undefined') return null
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function safeSetItem(key: string, value: string): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, value)
  } catch {
    // 隐私模式 / 禁用时静默失败
  }
}

// ===================================================================
// 从存储 / 系统偏好读取初始值
// ===================================================================

function resolveInitialTheme(): ThemeId {
  const saved = safeGetItem(LS_THEME) as ThemeId | null
  if (saved && THEMES.some((t) => t.id === saved)) return saved
  return DEFAULT_THEME
}

function resolveInitialMode(themeId: ThemeId): ColorMode {
  // 流体强制深色
  const descriptor = THEMES.find((t) => t.id === themeId)
  if (descriptor?.darkOnly) return 'dark'
  // 从各主题独立的存储读取
  const saved = safeGetItem(lsModeKey(themeId)) as ColorMode | null
  if (saved === 'dark' || saved === 'light') return saved
  // 系统偏好
  if (typeof window !== 'undefined') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return DEFAULT_MODE
}

function resolveInitialFx(): FxLevel {
  const saved = safeGetItem(LS_FX) as FxLevel | null
  if (saved && ['auto', 'high', 'low', 'off'].includes(saved)) return saved
  return DEFAULT_FX
}

// ===================================================================
// 响应式状态（模块级单例）
// ===================================================================

const _theme = ref<ThemeId>(DEFAULT_THEME)
const _mode = ref<ColorMode>(DEFAULT_MODE)
const _fx = ref<FxLevel>(DEFAULT_FX)
let _initialized = false

// ===================================================================
// 应用到 DOM
// ===================================================================

function applyToDOM(theme: ThemeId, mode: ColorMode, fx: FxLevel) {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  root.setAttribute('data-theme', theme)
  root.setAttribute('data-mode', mode)
  root.setAttribute('data-fx', fx)

  // 流体主题强制 color-scheme: dark
  const descriptor = THEMES.find((t) => t.id === theme)
  if (descriptor?.darkOnly) {
    root.style.colorScheme = 'dark'
  } else {
    root.style.colorScheme = ''
  }
}

// ===================================================================
// View Transition 切换
// ===================================================================

async function withViewTransition(update: () => void): Promise<void> {
  if (typeof document === 'undefined') {
    update()
    return
  }
  // 检查是否支持 + 是否禁用动效
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!('startViewTransition' in document) || prefersReduced) {
    update()
    return
  }
  try {
    const vt = (document as any).startViewTransition(update)
    await vt.ready.catch(() => {})
    await vt.finished.catch(() => {})
  } catch {
    update()
  }
}

// ===================================================================
// 公开 Composable
// ===================================================================

export function useTheme() {
  // 客户端初始化（只运行一次）
  function init() {
    if (_initialized) return
    _initialized = true

    _theme.value = resolveInitialTheme()
    _mode.value = resolveInitialMode(_theme.value)
    _fx.value = resolveInitialFx()
    applyToDOM(_theme.value, _mode.value, _fx.value)

    // 监听系统颜色偏好变化（当用户未手动设置时响应）
    if (typeof window !== 'undefined') {
      window
        .matchMedia('(prefers-color-scheme: dark)')
        .addEventListener('change', (e) => {
          const descriptor = THEMES.find((t) => t.id === _theme.value)
          if (descriptor?.darkOnly) return  // 流体忽略系统偏好
          const hasManual = safeGetItem(lsModeKey(_theme.value))
          if (!hasManual) {
            _mode.value = e.matches ? 'dark' : 'light'
            applyToDOM(_theme.value, _mode.value, _fx.value)
          }
        })
    }
  }

  // 切换主题
  async function setTheme(id: ThemeId) {
    const descriptor = THEMES.find((t) => t.id === id)
    if (!descriptor) return

    await withViewTransition(() => {
      _theme.value = id
      // 切换到新主题时恢复该主题上次记忆的明暗模式
      _mode.value = resolveInitialMode(id)
      safeSetItem(LS_THEME, id)
      applyToDOM(_theme.value, _mode.value, _fx.value)
    })
  }

  // 切换明暗（流体主题下按钮已禁用，但防止意外调用）
  async function setMode(mode: ColorMode) {
    const descriptor = THEMES.find((t) => t.id === _theme.value)
    if (descriptor?.darkOnly && mode === 'light') return  // 流体不允许浅色

    await withViewTransition(() => {
      _mode.value = mode
      safeSetItem(lsModeKey(_theme.value), mode)
      applyToDOM(_theme.value, _mode.value, _fx.value)
    })
  }

  function toggleMode() {
    const descriptor = THEMES.find((t) => t.id === _theme.value)
    if (descriptor?.darkOnly) return  // 流体无操作
    setMode(_mode.value === 'dark' ? 'light' : 'dark')
  }

  // 设置特效等级
  function setFx(level: FxLevel) {
    _fx.value = level
    safeSetItem(LS_FX, level)
    applyToDOM(_theme.value, _mode.value, level)
  }

  // 计算属性
  const currentTheme = readonly(_theme)
  const currentMode = readonly(_mode)
  const currentFx = readonly(_fx)

  const themeDescriptor = computed(
    () => THEMES.find((t) => t.id === _theme.value)!
  )
  const isDark = computed(() => _mode.value === 'dark')
  const isFluid = computed(() => _theme.value === 'fluid')
  const isFluidDarkOnly = computed(
    () => THEMES.find((t) => t.id === _theme.value)?.darkOnly ?? false
  )

  return {
    // 状态（只读）
    currentTheme,
    currentMode,
    currentFx,
    themeDescriptor,
    isDark,
    isFluid,
    isFluidDarkOnly,
    // 可用主题列表
    themes: THEMES,
    // 操作
    init,
    setTheme,
    setMode,
    toggleMode,
    setFx,
  }
}
