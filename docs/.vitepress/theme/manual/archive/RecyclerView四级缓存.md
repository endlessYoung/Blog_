---
title: RecyclerView四级缓存
description: Recycler 按 Scrap、CachedViews、ViewCacheExtension、RecycledViewPool 四级取 ViewHolder。CachedViews 默认 2 格，池里每种 viewType 默认 5 格。Scrap 不限，Extension 默认是 0。
categories: [Android]
tags: [android, RecyclerView]
created: 2026-10-19
---

# RecyclerView四级缓存

`Recycler.tryGetViewHolderForPositionByDeadline` 按固定顺序找一块能用的 ViewHolder。四级都没有，才执行 `onCreateViewHolder`。

1. **Scrap**：`mAttachedScrap`、`mChangedScrap`。没有固定格数，这次 layout 卸下多少就放多少。
2. **CachedViews**：`mCachedViews`，`DEFAULT_CACHE_SIZE = 2`。刚滑出屏幕的 holder 留在这里，position 和绑定都还在。
3. **ViewCacheExtension**：默认 `null`，格数是 0。自己实现之后这一级才有东西。
4. **RecycledViewPool**：按 `viewType` 分桶，`DEFAULT_MAX_SCRAP = 5`。每种类型最多 5 个，拿出来要重新绑定。

Scrap 和 CachedViews 按原来的 position 命中时，跳过 `onBindViewHolder`。池只认类型，跳过的是 `onCreateViewHolder`。
