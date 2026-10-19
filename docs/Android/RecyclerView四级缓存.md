---
title: RecyclerView四级缓存
description: Recycler 按 Scrap、CachedViews、ViewCacheExtension、RecycledViewPool 四级取 ViewHolder。CachedViews 默认 2 格，池里每种 viewType 默认 5 格。Scrap 不限，Extension 默认是 0。
categories: [Android]
tags: [android, RecyclerView]
created: 2026-10-19
---

# RecyclerView四级缓存

## 四级分别挡在新建前面

列表滚动时，离开屏幕的 ViewHolder 不会马上丢掉。`Recycler.tryGetViewHolderForPositionByDeadline` 按固定顺序找一块能用的，四级都没有才执行 `onCreateViewHolder`。

- **Scrap**：`mAttachedScrap`、`mChangedScrap`。没有固定格数，这次 layout 卸下多少就放多少。
- **CachedViews**：`mCachedViews`，`DEFAULT_CACHE_SIZE = 2`。刚滑出屏幕的 holder 留在这里，position 和绑定都还在。
- **ViewCacheExtension**：默认 `null`，格数是 0。自己实现 `getViewForPositionAndType` 之后，这一级才有东西。
- **RecycledViewPool**：按 `viewType` 分桶，`DEFAULT_MAX_SCRAP = 5`。每种类型最多 5 个，拿出来要重新绑定。

:::note 顺序
取的时候先问 Extension，问不到才进池。和「池在前、自定义缓存在后」的说法相反。ListView 只有两级，见 [RecyclerView 和 ListView 的区别](/Android/RecyclerView和ListView区别)。
:::

## 一块 ViewHolder 的去向

下面这块叫 A 的 ViewHolder，从还在屏幕上，到滑出屏幕，再到被同类型的新一行拿去绑定。

::::scrolly
:::step 01 · Scrap
layout 开始时，还挂在 RecyclerView 上的 ViewHolder 被放进 mAttachedScrap。同一次 layout 又要这个 position，就从 scrap 拿回来。position 对得上、数据也没变，就不再执行 onBindViewHolder。mChangedScrap 只在预布局里用：notifyItemChanged 之后、动画开始前，变过的 holder 进这里。
:::
:::step 02 · CachedViews
A 滑出屏幕，仍然有效，就进 mCachedViews。默认只留 2 个，setItemViewCacheSize 可以改。这里还记着原来的 position 和已经绑定的数据。马上滑回来，命中的是同一格，不执行 onBindViewHolder。
:::
:::step 03 · Extension
屏幕上要的是一个新 position，scrap 和 CachedViews 里都没有它。Recycler 接着问 mViewCacheExtension.getViewForPositionAndType。这个扩展默认是 null，这一级什么都不返回。缓存满了之后，最旧的 holder 会被解绑送进池里，但送进池之前并不经过这一级。
:::
:::step 04 · RecycledViewPool
A 被解绑后放进 RecycledViewPool，按 viewType 分桶，每类默认最多 5 个。进池时会走到 onViewRecycled，原来的绑定清掉。之后同类型的一项从池里拿走 A，省掉的是 onCreateViewHolder，onBindViewHolder 还是要执行。几个 RecyclerView 可以用 setRecycledViewPool 共用一个池。
:::
:::step 05 · 新建
四级都没有，才执行 onCreateViewHolder 造一块新的，再执行 onBindViewHolder。新建是最贵的一步，前面每一级都是在避开它。
:::
::::

```java
// tryGetViewHolderForPositionByDeadline 的查找顺序
holder = attachedScrap or changedScrap;
if (holder == null) holder = cachedViews;          // DEFAULT_CACHE_SIZE = 2
if (holder == null && extension != null)
    view = extension.getViewForPositionAndType(recycler, position, type);
if (holder == null) holder = pool.getRecycledView(viewType); // 每类 DEFAULT_MAX_SCRAP = 5
if (holder == null) holder = adapter.createViewHolder(parent, type);
if (!holder.isBound()) adapter.onBindViewHolder(holder, position);
```

## 命中之后还要不要绑定

- **Scrap、CachedViews**：按原来的 position 命中，数据还在，跳过 `onBindViewHolder`。
- **RecycledViewPool**：只认 `viewType`，不认 position。跳过的是 `onCreateViewHolder`，绑定要重新执行。
- **ViewCacheExtension**：返回什么由自己决定。没有实现时，这一级等于不存在。

:::note 大小
`setItemViewCacheSize` 改的是 CachedViews 的 2。`setMaxRecycledViews(viewType, max)` 改的是池里那一类的 5。这两级留得越大，滑回去越少绑定，占着的 View 也越多。Scrap 和 Extension 没有这种默认格数。
:::
