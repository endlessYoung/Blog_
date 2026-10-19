import type { ComputedRef, InjectionKey } from 'vue'
import type { FigKind } from './figures'

export interface ManualFigure {
  title: string
  kind: FigKind
  caption: string
}

export const manualFigureKey: InjectionKey<ComputedRef<ManualFigure | undefined>> = Symbol('manual-figure')
export const manualNumKey: InjectionKey<ComputedRef<string>> = Symbol('manual-num')
