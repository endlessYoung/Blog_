import type { Component } from 'vue'
import type { GuidedBeat } from '../guided'

const beats = new Map<string, GuidedBeat[]>()
const boards = new Map<string, Component>()
const shells = new Map<string, Component>()
const counts = new Map<string, number>()
const stepMaps = new Map<string, (index: number) => number>()

export function registerBeats(kind: string, value: GuidedBeat[]) {
  beats.set(kind, value)
}

export function registerBoard(kind: string, board: Component) {
  boards.set(kind, board)
}

export function registerShell(kind: string, shell: Component) {
  shells.set(kind, shell)
}

export function registerCount(kind: string, count: number) {
  counts.set(kind, count)
}

export function registerStepMap(kind: string, map: (index: number) => number) {
  stepMaps.set(kind, map)
}

export function beatsFor(kind: string): GuidedBeat[] {
  return beats.get(kind) ?? []
}

export function boardFor(kind: string) {
  return boards.get(kind)
}

export function shellFor(kind: string) {
  return shells.get(kind)
}

export function mapStep(kind: string, index: number) {
  return stepMaps.get(kind)?.(index) ?? index
}

export function figureCount(kind: string) {
  return counts.get(kind) ?? beats.get(kind)?.length ?? 0
}

export function hasFigure(kind: string) {
  return shells.has(kind) || boards.has(kind) || (beats.get(kind)?.length ?? 0) > 0
}
