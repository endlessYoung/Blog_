---
title: 标签：Zygote
description: 与「Zygote」相关的文章共 3 篇
hideArticleMeta: true
---

# 标签：Zygote

共 **3** 篇文章：

- [冷启动底层剖析：Zygote 孵化、Page Fault 与 Baseline Profile](/Android/冷启动底层剖析：Zygote孵化、Page Fault与Baseline Profile) — 在移动端体验治理中，冷启动速度直接决定了用户对应用性能的第一印象。 不少工程团队在启动优化上投入了大量精力： - 重构 Application.onCreate()，将非核心 SDK 剥离并推迟初始化； - 使用并行任务图将耗时操作拆分至工作线程池；
- [Zygote进程的fork](/Android/Zygote进程的fork) — 在Android系统中，Zygote进程是所有Android应用程序进程的母进程。当系统启动时，会首先启动一个初始化进程Init，Init随后会启动SystemServer进程，而SystemServer进程中会孵化出Zygote进程。Zygote初始化时会预?
- [Zygote如何保证加载速度](/Android/Zygote如何保证加载速度) — Zygote在启动时确实会加载大量的类和资源，以确保这些基础元素可以被所有后续的应用进程共享，从而加速它们的启动。为了保证加载速度并优化性能，Zygote采取了以下几种策略：
