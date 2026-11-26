---
title: 标签：性能优化
description: 与「性能优化」相关的文章共 4 篇
hideArticleMeta: true
---

# 标签：性能优化

共 **4** 篇文章：

- [ART 并发复制 GC、CMC 机制与线程安全点停顿](/Android/ART并发复制GC、CMC机制与线程安全点停顿) — 在 Android 现代移动端应用的高性能演进过程中，流畅度治理始终是各工程团队的核心关注点。当我们翻开系统监控日志或在线 APM 告警，常能看到类似这样的反常现象： 界面在列表滑动或动画展开时出现了肉眼可见的顿挫与跳帧，系统丢帧指标亮起红灯。然而开发者检索日志，
- [EAS 能效调度、CPUFreq 调频延迟与 Task Cgroup 核迁移](/Android/EAS能效调度、CPUFreq调频延迟与Task Cgroup核迁移) — 在 Android 性能调优与卡顿治理的深度实践中，许多资深工程师都曾面对过一组极具迷惑性的监控数据： 当线上用户或线下自动化测试频繁上报滑动卡顿、丢帧告警时，我们调取设备全局状态与 APM 指标，往往会发现系统呈现出一种“看似极度闲暇”的假象： - 全局 CPU 使用率仅在 20% 到 30% 之
- [ANR 底层剖析：Input 超时、同步屏障泄漏与优先级反转](/Android/ANR底层剖析：Input超时、同步屏障泄漏与优先级反转) — 在 Android 移动端稳定性治理中，ANR（Application Not Responding，应用无响应）是仅次于 Crash 的核心指标。它直接关联到 Google Play 的坏账率考核与国内各大应用商店的体验分级评定。 在日常排查中，
- [冷启动底层剖析：Zygote 孵化、Page Fault 与 Baseline Profile](/Android/冷启动底层剖析：Zygote孵化、Page Fault与Baseline Profile) — 在移动端体验治理中，冷启动速度直接决定了用户对应用性能的第一印象。 不少工程团队在启动优化上投入了大量精力： - 重构 Application.onCreate()，将非核心 SDK 剥离并推迟初始化； - 使用并行任务图将耗时操作拆分至工作线程池；
