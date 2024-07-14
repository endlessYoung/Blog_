# RecyclerView性能优化

## 1. RecyclerView缓存

**RecyclerView 主要有三层缓存**

> 有时候也可以看作四级，因为 **ScarpHeap** 可以进一步细分为 **AttachedScrap** 和 **CachedViews**。

1. **ViewCache：用于缓存有限数量的 View 对象。**
2. **RecyclerPool：一个可复用的 ViewHolder 池，可以跨多个 RecyclerView 共享。**
3. **ScrapHeap：临时缓存当前屏幕上不可见但可能马上会再次显示的 ViewHolder。**

## 2. ViewCache

`ViewCache`是直接的缓存机制。当`ViewHolder`被移除屏幕时，它首先会被放入`ViewCache`中。这是一个**LRU（最近很少使用）缓存机制**，有一个默认大小（通常是2）。



## 3. RecyclerPool

`RecyclerPool` 是一个全局的**ViewHolder池**，可以跨多个 `ReclerView` 共享。当一个 `ViewHolder` 被回收但没有放入 ViewCache 中时，它将被放入到 `RecyclerPool` 中。 `RecyclerPool` 中。 `RecyclerPool` 根据 `ViewType` 来管理不同类型的 `ViewHolder`。

## 4. ScrapHeap

`ScrapHeap` 是一个临时缓存，用于存储当前屏幕上不可见但是可能马上再次显示的 `ViewHolder`。
`Scrap`分为两类：

1. **AttachedScrap：与ReclerView绑定，但暂时不可见的ViewHolder。**
2. **CacheViews：与ViewCache中的ViewHolder。**

## 5. Recyclerview缓存的工作流程

1. **创建ViewHolder：当RecyclerView需要显示一个新的项时，它首先检查ViewCache中是否有可复用的ViewHolder。如果没有，则检查ReclerPool。如果仍然没有，则创建一个新的ViewHolder。**
2. **绑定数据：找到一个可复用的ViewHolder后，RecyclerView会调用Adapter的onBindViewHoler方法，将数据绑定到ViewHolder。**
3. **回收ViewHolder：当一个项滚出屏幕时，RecyclerView会将其ViewHoler放入ViewCache。如果ViewCache已满，则放入RecyclerPool。临时缓存的ViewHolder则放入ScrapHeap**。
4. **回收复用：当RecyclerView需要显示新的项时，会优先从ViewCache中查找可复用的ViewHolder。如果ViewCache中没有合适的，则从RecyclerPool中查找。**

