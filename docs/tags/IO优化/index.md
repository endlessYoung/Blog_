---
title: 标签：IO优化
description: 与「IO优化」相关的文章共 2 篇
hideArticleMeta: true
---

# 标签：IO优化

共 **2** 篇文章：

- [SQLite WAL 索引共享内存、Checkpoint 锁竞争与 fsync 挂起](/Android/SQLite WAL索引共享内存、Checkpoint锁竞争与fsync挂起) — 在 Android 应用的架构设计与持久化存储治理中，SQLite 始终扮演着最为核心的本地基础设施角色。伴随着 Jetpack Room 的普及以及现代移动架构对响应式数据流（如 Flow、Paging3）的深度依赖，数据库访问已经从过去的“偶发读写”演化为高频并发的“实时数据总线”。
- [Page Cache 脏页回压、文件系统日志提交与 fsync 级联阻塞](/Android/Page Cache脏页回压、文件系统日志提交与fsync级联阻塞) — 在 Android 移动端性能工程与流畅度治理的实践中，“把耗时操作移入子线程”一直被很多工程师奉为规避界面卡顿的金科玉律。面对磁盘文件读写、数据库持久化或键值存储更新，开发者的第一反应往往是在协程中切换到 Dispatchers.IO，或者向专属的后台线程池提交任务。 然而，
