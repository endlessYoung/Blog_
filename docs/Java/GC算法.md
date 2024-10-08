# GC算法

## 一、 标记-清除算法 (Mark-Sweep)

- **原理：**
1. **标记阶段**：从GC Roots（一般是程序的入口，比如：栈、静态变量 等）出发，遍历所有可达的对象并标记。
2. **清除阶段**：遍历堆，回收没有标记的对象。

- 优点：
1. 简单直观：整个过程的逻辑清晰
2. 不需要移动对象：直接回收不需要的对象。

- 缺点：
1. 内存碎片：对象清除后内存不做整理，会产生内存碎片，导致分配大对象时可能没有足够连续的内存。
2. 效率低下：标记和清除过程中需要遍历整个堆，回收速度比较慢。

- 使用场景：常见于老年代的垃圾回收策略，因为对象生命周期较长，不需要频繁的内存整理。

## 二、 复制算法 (Copying)

- 原理：
讲内存分为两个大小相同的空间，每次只使用其中一个空间。当内存快被用完时，GC会将存活的对象复制到另一个空闲空间上，然后一次性清空当前空间。

- 优点：
1. 没有碎片问题：通过将存活对象复制到新空间，直接回收掉不需要的对象，没有内存碎片。
2. 分配速度快：对象始终分配在一段连续的内存区域上，指针推进分配速度快。

- 缺点：
1. 空间浪费：需要预留两个空间，总体内存使用效率比较低。
2. 对象复制开销：存活对象需要不断地复制，复制操作在对象多时可能会影响性能。

- 使用场景：
适用于新生代，因为新生代对象生命周期短，存活的对象相对较少，复制代价低。

## 三、 标记-整理算法 (Mark-Compact)

- 原理：
先标记所有存活的对象，然后将存活对象向一端移动，最后清除边界以外的对象，整理后保证内存空间的连续性。

- 优点：
1. 没有碎片问题：通过对象的移动整理内存，避免了内存碎片的产生。
2. 效率适中：相比于标记-清除，移动对象后不需要过多的内存整理。

- 缺点：
1. 对象移动开销：需要对所有存活对象进行移动，在对象较多时开销较大。
2. 实时性差：在标记和整理过程中，程序可能会暂停，对实时性要求高的程序不友好。

- 使用场景：
适用于老年代，需要减少内存碎片且对象的生命周期较长的场景。


## 四、 分代收集算法 (Generational Garbage Collection)

- 原理：
根据对象的生命周期将内存分为不同区域，通常分为新生代（Young Generation）和老年代（Old Generation）。新生代对象容易“早死”，老年代对象生命周期较长。新生代采用复制算法回收，老年代采用标记-清除或标记-整理。

- 优点：
提高回收效率：通过分代，可以对不同生命周期的对象使用不同的算法，新生代回收效率高，老年代减少回收频率。
减少暂停时间：新生代回收频率高但对象少，回收速度快，减少了程序停顿的时间。
- 缺点：
复杂度高：需要管理不同代的对象，且存在不同代之间对象引用的跨代处理，增加了实现的复杂性。
内存分配压力：当新生代对象晋升到老年代时，老年代可能会面临更大的回收压力。
- 使用场景：
JVM等现代虚拟机普遍采用分代收集算法，适用于各种应用场景。

## 五、 增量式垃圾回收 (Incremental GC)

- 原理：
将一次性完成的垃圾回收过程拆分成多个小步骤，在程序执行过程中逐步执行，减少程序长时间停顿。
- 优点：
减少暂停时间：将一次性全堆回收拆解为多个小步骤执行，避免程序长时间的停顿。
- 缺点：
整体效率降低：增量回收可能需要在GC时进行多次暂停，总体回收效率不如传统GC。
- 使用场景：
适用于实时性要求高的应用场景，如交互式系统、游戏等。

## 六、 并行和并发GC (Parallel and Concurrent GC)

- 原理：
并行GC：多条线程同时执行GC过程，以提高回收效率。
并发GC：垃圾回收和应用线程同时执行，减少GC对应用的影响。
- 优点：
提高效率：利用多线程并行执行GC，提升回收速度。
减少停顿：并发GC可以在应用线程运行的同时进行垃圾回收，降低应用停顿时间。
- 缺点：
资源竞争：GC和应用线程争夺CPU资源，可能影响应用性能。
复杂性增加：并发GC需要处理对象被回收线程修改的问题，算法复杂度较高。
- 使用场景：
大规模、高并发的服务端系统，如数据库、Web服务器等，通常采用并发或并行GC来提升性能。


## 7. 总结：
不同的垃圾回收算法各有优缺点，选择时需要根据应用场景的具体需求来综合考量。现代GC常用分代收集策略结合不同算法，最大化效率并减少应用停顿时间：

1. **新生代**：生命周期短，使用复制算法。
2. **老年代**：生命周期长，使用标记-清除或标记-整理算法。
3. **并发或并行GC**：适用于高并发、大规模应用场景。

这些算法相辅相成，帮助系统自动高效地管理内存，提高应用的稳定性和性能。
