---
title: 交互图集
description: Endless Young 技术博客核心技术架构交互图表与可视化原语
layout: doc
---

<script setup>
import DiagramCas from './.vitepress/theme/components/Diagram/DiagramCas.vue'
</script>

# 架构与原语交互图集

本站精选的核心系统机制与底层原语交互可视化图集。每张图表均支持交互式步进、状态回放与硬件级时序拆解。

## 01. CAS (Compare-And-Swap) 并发状态机

<DiagramCas />

<div class="figure-note-card">
  <div class="figure-note-title">📖 关联深度剖析文章</div>
  <p class="figure-note-desc">深入分析 Java Unsafe 内存操作、AQS 独占锁实现与 x86 LOCK CMPXCHG 硬件指令级别的总线锁与缓存锁原语。</p>
  <a href="/Java/Integer1000与100的比较" class="figure-note-link">阅读相关文章：Java 并发核心原语解析 →</a>
</div>

---

## 02. Jetpack Compose 智能重组派生拓扑

<div class="figure-card">
  <div class="figure-card-header">
    <span class="figure-card-tag">UI 架构</span>
    <h3 class="figure-card-title">Compose Snapshot 状态快照与重组跳过机制</h3>
  </div>
  <p class="figure-card-desc">
    基于 SlotTable 的树状遍历与状态读取监听机制，精确追踪状态变更对应的最小重组范围，跳过非必要的 Composable 重新执行。
  </p>
  <a href="/Android/Android简介" class="figure-card-link">查看对应的 Compose 源码拆解文章 →</a>
</div>

---

## 03. 现代 Agent 多角色协同与工作流拓扑

<div class="figure-card">
  <div class="figure-card-header">
    <span class="figure-card-tag">AI / Agent</span>
    <h3 class="figure-card-title">LangGraph 循环图与状态流转拓扑</h3>
  </div>
  <p class="figure-card-desc">
    多 Agent 协同中的规划器（Planner）、执行器（Executor）与校验器（Verifier）闭环执行流，结合 Checkpointer 进行状态回滚与人机回环（Human-in-the-loop）。
  </p>
  <a href="/Agent/基础概念" class="figure-card-link">查看 Agent 架构模式文章 →</a>
</div>

<style scoped>
.figure-note-card,
.figure-card {
  margin: 24px 0 40px;
  padding: 20px 24px;
  background: var(--ey-surface);
  border: var(--ey-border-width, 1px) solid var(--ey-line);
  border-radius: var(--ey-radius-md, 4px);
  border-left: 3px solid var(--ey-accent);
}
.figure-note-title,
.figure-card-title {
  font-family: var(--ey-font-display);
  font-size: 16px;
  font-weight: 700;
  color: var(--ey-fg);
  margin-bottom: 8px;
}
.figure-card-tag {
  font-family: var(--ey-font-mono);
  font-size: 11px;
  color: var(--ey-accent);
  letter-spacing: 0.05em;
  text-transform: uppercase;
  margin-bottom: 4px;
  display: block;
}
.figure-note-desc,
.figure-card-desc {
  font-size: 14px;
  color: var(--ey-fg-2);
  line-height: 1.6;
  margin-bottom: 12px;
}
.figure-note-link,
.figure-card-link {
  font-family: var(--ey-font-mono);
  font-size: 13px;
  color: var(--ey-accent);
  text-decoration: none;
  font-weight: 600;
}
.figure-note-link:hover,
.figure-card-link:hover {
  text-decoration: underline;
}
</style>
