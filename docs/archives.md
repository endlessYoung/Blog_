---
title: 全部文章目录
description: 按技术分类查阅本站的 Android、Kotlin、Java、AI、Agent、Python、数据结构与算法等文章。
hideArticleMeta: true
---

# 全部文章目录

这里按主题列出本站已开放索引的文章。可以直接打开文章，也可以通过[标签目录](/tags/)查找相关内容。尚未完成的占位笔记不列入本目录。

## 数据结构和算法

- [常见的排序方法](/%E6%95%B0%E6%8D%AE%E7%BB%93%E6%9E%84%E5%92%8C%E7%AE%97%E6%B3%95/%E5%B8%B8%E8%A7%81%E7%9A%84%E6%8E%92%E5%BA%8F%E6%96%B9%E6%B3%95.html) — 围绕同一数组对比冒泡、选择、插入、快排和堆排序。聚焦比较基准、交换代价、区间扩展方式与工程选型。
- [二分查找](/%E6%95%B0%E6%8D%AE%E7%BB%93%E6%9E%84%E5%92%8C%E7%AE%97%E6%B3%95/%E4%BA%8C%E5%88%86%E6%9F%A5%E6%89%BE.html) — 二分搜索（Binary Search）是一种在有序数组或列表中查找目标值的高效算法，其时间复杂度是 O(log n)。以下是一些经典的二分搜索题目及其示例：
- [合并数组](/%E6%95%B0%E6%8D%AE%E7%BB%93%E6%9E%84%E5%92%8C%E7%AE%97%E6%B3%95/%E5%90%88%E5%B9%B6%E6%95%B0%E7%BB%84.html) — 给你两个按 非递减顺序 排列的整数数组 nums1 和 nums2，另有两个整数 m 和 n ，分别表示 nums1 和 nums2 中的元素数目。
- [移除元素](/%E6%95%B0%E6%8D%AE%E7%BB%93%E6%9E%84%E5%92%8C%E7%AE%97%E6%B3%95/%E7%A7%BB%E9%99%A4%E5%85%83%E7%B4%A0.html) — 给你一个数组 nums 和一个值 val，你需要 原地 移除所有数值等于 val 的元素。元素的顺序可能发生改变。然后返回 nums 中与 val 不同的元素的数量。
- [异或运算交换两数](/%E6%95%B0%E6%8D%AE%E7%BB%93%E6%9E%84%E5%92%8C%E7%AE%97%E6%B3%95/%E5%BC%82%E6%88%96%E8%BF%90%E7%AE%97.html) — 异或的基本运算法则：一个数和自己异或的结果是0，和0异或的结果是其本身，并且满足交换律和结合律。异或也可以看作是没有进位的加法。例如： a ^ a = 0 和 a ^ 0 = a

## Agent 开发

[Agent 开发分类目录](/Agent/)

- [Chunking](/Agent/Chunking.html)
- [Embedding：AI 如何把世界变成一张数字地图](/Agent/Embedding.html) — 从猫、狗和汽车的向量表示出发，解释 Embedding 如何学习语义距离，以及向量维度、相似度与训练目标之间的关系。

## AI / 机器学习

[AI / 机器学习分类目录](/Ai/)

- [代价函数](/Ai/%E4%BB%A3%E4%BB%B7%E5%87%BD%E6%95%B0.html) — 代价函数（Cost Function）是在机器学习和优化问题中使用的一个重要概念。它是一个衡量模型预测与实际观测之间差异的函数，通常用于评估模型的性能和指导参数优化的过程。
- [弹性网络回归](/Ai/%E5%BC%B9%E6%80%A7%E7%BD%91%E7%BB%9C%E5%9B%9E%E5%BD%92.html) — 弹性网络回归（Elastic Net Regression）是一种结合了岭回归（Ridge Regression）和Lasso回归（Lasso Regression）的线性回归模型，旨在克服它们各自的一些缺点，并同时利用它们的优点。
- [多项式回归](/Ai/%E5%A4%9A%E9%A1%B9%E5%BC%8F%E5%9B%9E%E5%BD%92.html) — 多项式回归是一种非线性回归方法，它通过拟合数据与多项式函数的关系来建立模型。与线性回归不同，多项式回归的模型假设不再是线性的，而是一个多项式函数。
- [极限森林](/Ai/%E6%9E%81%E9%99%90%E6%A3%AE%E6%9E%97.html) — 极限森林（Extremely Randomized Trees），也称为Extra-Trees，是一种集成学习方法，类似于随机森林。它在随机森林的基础上做了一些改进，以进一步增加模型的随机性。
- [监督学习](/Ai/%E7%9B%91%E7%9D%A3%E5%AD%A6%E4%B9%A0%E5%85%A5%E9%97%A8.html) — 回归算法用于预测连续型变量的数值，例如房价、温度、销售额等。它们建立了自变量（输入特征）和因变量（输出标签）之间的关系，并且尝试拟合一条最佳拟合线（或曲线），以最好地预测新的数据点。
- [聚类算法](/Ai/%E8%81%9A%E7%B1%BB%E7%AE%97%E6%B3%95.html) — 聚类算法是一类无监督学习方法，旨在将数据集中的数据点按照它们之间的相似性或距离自动分组成多个类别或簇（clusters），每个簇内的数据对象具有较高的相似性，而不同簇之间的数据对象差异较大。聚类算法不需要预先标记的数据集，即没有预设的类别标签，而是通过数据本身?
- [决策树算法](/Ai/%E5%86%B3%E7%AD%96%E6%A0%91%E7%AE%97%E6%B3%95.html) — 决策树算法是一种流行的机器学习方法，既可以用于分类任务也可以用于回归任务。它通过从训练数据集中学习一系列规则来创建一个树状结构，这个结构能够对新数据进行预测。以下是决策树算法的一些核心概念和步骤：
- [岭回归](/Ai/%E5%B2%AD%E5%9B%9E%E5%BD%92.html) — 岭回归（Ridge Regression）是一种处理多重共线性问题的线性模型正则化方法，与套索回归类似，但采用的是L2正则化，即模型系数平方和的惩罚项。岭回归通过在损失函数中加入正则项，来限制模型系数的大小，从而避免过拟合，提高模型的稳定性。与套索回归相比，岭?
- [逻辑回归](/Ai/%E9%80%BB%E8%BE%91%E5%9B%9E%E5%BD%92.html) — 逻辑回归（Logistic Regression）是一种用于解决分类问题的统计学习方法。尽管其名称中包含“回归”一词，但逻辑回归实际上是一种分类算法，常用于解决二分类问题，也可以扩展到多分类问题。
- [欠拟合和过拟合](/Ai/%E6%AC%A0%E6%8B%9F%E5%90%88%E5%92%8C%E8%BF%87%E6%8B%9F%E5%90%88.html) — 欠拟合发生在模型过于简单，无法捕捉数据中的底层模式时。模型无法从训练数据中学习到足够的特征，导致在训练集上的表现不佳，同时在测试集上的表现也很差。这表明模型没有学到足够的信息去概括数据。
- [全连接前馈网络(FNN)](/Ai/%E5%85%A8%E8%BF%9E%E6%8E%A5%E5%89%8D%E9%A6%88%E7%BD%91%E7%BB%9C.html) — 全连接前馈网络（Fully Connected Feedforward Network）是一种基本的神经网络架构，也被称为多层感知机（Multilayer Perceptron，MLP）。它包含一个或多个隐藏层，每个隐藏层都由多个神经元组成，每个神经元与上一层?
- [深度神经网络](/Ai/%E6%B7%B1%E5%BA%A6%E7%A5%9E%E7%BB%8F%E7%BD%91%E7%BB%9C.html) — 深度神经网络（Deep Neural Network，DNN）是一种由多个神经网络层组成的神经网络模型。与传统的浅层神经网络相比，深度神经网络具有更多的隐藏层，因此能够更有效地学习复杂的非线性关系和特征。
- [生成式AI导论：从“文字接龙”说起](/Ai/AI%E5%AF%BC%E8%AE%BA/%E7%94%9F%E4%BA%A7%E5%BC%8FAI%E7%9A%84%E6%9C%AC%E8%B4%A8.html) — LLM（大型语言模型，如 ChatGPT、Gemini、Claude、DeepSeek 等）的核心机制其实非常简单——就是文字接龙。
- [数据归一化](/Ai/%E6%95%B0%E6%8D%AE%E5%BD%92%E4%B8%80%E5%8C%96.html) — 数据归一化（Normalization 或 Scaling）是一种数据预处理技术，旨在调整数据的尺度，使得不同特征之间具有可比性，或者满足特定算法的输入要求。这一过程对于数据分析、机器学习模型的训练尤为重要，因为它可以带来以下好处：
- [数据降维](/Ai/%E6%95%B0%E6%8D%AE%E9%99%8D%E7%BB%B4.html) — 数据降维是指通过保留数据集中最重要的特征信息，将数据从高维空间转换为低维空间的过程。数据降维旨在减少数据集的维度，同时尽可能地保留原始数据的信息，以便于可视化、压缩和加速机器学习算法的训练和预测。
- [随机森林算法](/Ai/%E9%9A%8F%E6%9C%BA%E6%A3%AE%E6%9E%97%E7%AE%97%E6%B3%95.html) — 随机森林(Random Forest)是一种集成学习方法，用于解决分类和回归问题。它通过构建多个决策树来完成任务，并通过投票（分类）或取平均值（回归）的方式来得到最终的预测结果。以下是随机森林的基本原理和特点：
- [梯度下降](/Ai/%E6%A2%AF%E5%BA%A6%E4%B8%8B%E9%99%8D.html) — 梯度下降是一种优化算法，它通过迭代的方式逐步调整模型参数，以最小化损失函数活优化目标函数。
- [正规方程及其推导](/Ai/%E6%AD%A3%E8%A7%84%E6%96%B9%E7%A8%8B%E5%8F%8A%E5%85%B6%E6%8E%A8%E5%AF%BC.html) — 正规方程是用于解决线性回归问题的一种方法，它不需要迭代，直接通过该方法可以直接求解出最优的参数值。正规方程特别适用于小型数据集，因为对于大数据集，计算和存储完整的矩阵求逆可能会非常昂贵。下面简要介绍正规方程及其推导过程：
- [正向传播和反向传播](/Ai/%E6%AD%A3%E5%90%91%E4%BC%A0%E6%92%AD%E5%92%8C%E5%8F%8D%E5%90%91%E4%BC%A0%E6%92%AD.html) — 正向传播（Forward Propagation）和反向传播（Backpropagation）是深度学习中两个重要的概念，它们共同构成了神经网络的训练过程。正向传播求损失，反向传播回传误差。同时，神经网络每层的每个神经元都可以根据误差信号修正每层的权重。
- [正则化方法](/Ai/%E6%AD%A3%E5%88%99%E5%8C%96%E6%96%B9%E6%B3%95.html) — 正则化方法是一种在机器学习和统计建模中广泛采用的技术，旨在解决模型过拟合问题，提高模型的泛化能力。过拟合指的是模型在训练数据上表现得过于优秀，以至于它学习到了训练数据中的噪声和偶然特征，而不能很好地泛化到未见过的新数据上。其本质是减小w的值来干扰数据的扰动，
- [支持向量回归(SVR)](</Ai/%E6%94%AF%E6%8C%81%E5%90%91%E9%87%8F%E5%9B%9E%E5%BD%92(SVR).html>) — 支持向量机（Support Vector Machine，SVM）是一种强大的监督学习算法，常用于分类和回归问题。它的主要思想是找到能够有效划分不同类别数据的超平面，并且使得超平面到最近的数据点（支持向量）的距离最大化。
- [DESCAN](/Ai/DESCAN.html) — DBSCAN（Density-Based Spatial Clustering of Applications with Noise）是一种密度聚类算法，它基于数据点的密度来发现任意形状的簇，并能够识别噪声数据点。DBSCAN 将密度定义为某个点周围的邻域内的?
- [Hard sigmoid和soft sigmoid](/Ai/Hard%20sigmoid%E5%92%8Csoft%20sigmoid.html) — Hard sigmoid 和 soft sigmoid 是两种不同的激活函数，它们在神经网络中常被用作替代的激活函数。
- [K-means](/Ai/K-means.html) — K-means 聚类算法是一种常用的基于距离的无监督学习算法，用于将数据集分成 K 个不同的簇。它试图通过最小化数据点与所属簇中心的距离来划分数据，使得每个数据点都属于与其最近的簇。
- [Lasso回归](/Ai/Lasso%E5%9B%9E%E5%BD%92.html) — 套索回归（Lasso Regression，全称为Least Absolute Shrinkage and Selection Operator回归）是一种线性模型的正则化方法，用于估计回归模型的系数。它是Ridge回归的一个扩展，同样旨在解决多重共线性问题、?
- [Rectified Linear Unit](/Ai/Rectified%20Linear%20Unit.html) — Rectified Linear Unit (ReLU) 是一种常用的神经网络激活函数，它在深度学习中被广泛应用。

## Android 开发

[Android 开发分类目录](/Android/)

- [安卓常见的内存泄漏点](/Android/%E5%AE%89%E5%8D%93%E5%B8%B8%E8%A7%81%E7%9A%84%E5%86%85%E5%AD%98%E6%B3%84%E6%BC%8F%E7%82%B9.html) — 内存泄漏是指在应用程序运行过程中，由于程序错误或设计不佳，导致无用的内存对象无法被系统及时释放，从而造成内存资源的浪费和应用性能下降的现象。内存泄漏会导致应用程序占用大量的内存资源，降低系统性能，增加系统崩溃的风险，严重影响用户体验，甚至导致应用被系统强制关闭?
- [安卓常见架构](/Android/%E5%AE%89%E5%8D%93%E5%B8%B8%E8%A7%81%E6%9E%B6%E6%9E%84.html) — 在安卓开发中，常见的架构主要有以下几种，每种架构都有其特点、优缺点以及适用场景。以下是它们的详细介绍：
- [安卓典型日志分析](/Android/logd%E6%97%A5%E5%BF%97%E7%AE%80%E4%BB%8B%E5%8F%8A%E5%85%B8%E5%9E%8B%E6%A1%88%E4%BE%8B%E5%88%86%E6%9E%90.html) — 日志接口内容，共分为java层、native层、kernel层等。下面就对每个层级的内容分别进行介绍。
- [安卓进程通信的方法](/Android/%E5%AE%89%E5%8D%93%E8%BF%9B%E7%A8%8B%E9%80%9A%E4%BF%A1%E7%9A%84%E6%96%B9%E6%B3%95.html) — 在 Android 中，进程间通信（IPC，Inter-Process Communication）主要有以下几种方法：
- [安卓性能优化](/Android/%E5%AE%89%E5%8D%93%E6%80%A7%E8%83%BD%E4%BC%98%E5%8C%96.html) — ANR分析主要是通过查看/data/anr下的log，分析主线程堆栈、cpu、锁信息等。但是这种方法有一定的局限性，很多时候是没有办法查看堆栈信息的，例如有些高版本设备需要root权限才能访问/data/anr/目录。这时候就需要应用来实现卡顿、ANR、死锁的?
- [策略模式实现状态校验](/Android/%E7%AD%96%E7%95%A5%E6%A8%A1%E5%BC%8F%E5%AE%9E%E7%8E%B0%E7%8A%B6%E6%80%81%E6%A0%A1%E9%AA%8C.html) — 在登录校验的场景下，建造者模式可以将每个校验策略当做一个“部件”，通过建造者来逐步构建出一个完整的校验流程。每个部件（策略）可以根据需要进行选择或组合。最终的构建结果是一个包含所选策略的校验器（LoginValidator）。
- [从重复请求到SingleFlight](/Android/%E4%BB%8E%E9%87%8D%E5%A4%8D%E8%AF%B7%E6%B1%82%E5%88%B0SingleFlight.html) — 用一个可操作的 Feed 实验室说明，为什么相同的刷新会叠在一起，SingleFlight 合并的是进行中的任务，以及 Room Flow 为什么只负责把数据库的变化交给 UI。
- [多进程模式](/Android/%E5%A4%9A%E8%BF%9B%E7%A8%8B%E6%A8%A1%E5%BC%8F.html) — 在安卓中使用多进程只有一种方法，就是给四大组件在 AndroidManifest 中指定 android:process 属性，我们无法给一个线程或者一个实体类指定其运行时所在的进程。还有另外一种非常规的多进程方法，那就是通过 JNI 在 Nativte 层中?
- [封装阻塞的任务队列](/Android/%E5%B0%81%E8%A3%85%E9%98%BB%E5%A1%9E%E7%9A%84%E4%BB%BB%E5%8A%A1%E9%98%9F%E5%88%97.html) — 多线程环境中，通过队列可以很容易实现数据共享，比如经典的“生产者”和“消费者”模型中，通过队列可以很便利地实现两者之间的数据共享。 假设我们有若干生产者线程，另外又有若干个消费者线程。如果生产者线程需要把准备好的数据共享给消费者线程，利用队列的方式来传递数据，?
- [获取位置信息](/Android/%E8%8E%B7%E5%8F%96%E4%BD%8D%E7%BD%AE%E4%BF%A1%E6%81%AF.html) — 在安卓中获取位置信息以及后台位置信息通常使用 FusedLocationProviderClient 和 LocationManager。为了在后台获取位置信息，需要结合使用位置服务、WorkManager 或 JobScheduler 等后台任务管理工具来确?
- [进程保活](/Android/%E8%BF%9B%E7%A8%8B%E4%BF%9D%E6%B4%BB.html) — 它正在用户与之互动的屏幕顶部运行 Activity（其 onResume() 方法已被调用）。 它具有当前正在运行的 BroadcastReceiver（其 BroadcastReceiver.onReceive() 方法正在执行）。 它有一个 Service?
- [进程和应用生命周期](/Android/%E8%BF%9B%E7%A8%8B%E5%92%8C%E5%BA%94%E7%94%A8%E7%94%9F%E5%91%BD%E5%91%A8%E6%9C%9F.html) — 在大多数情况下，每个 Android 应用都在各自的 Linux 进程中运行。当需要运行应用的一些代码时，系统会为应用创建此进程，并使其保持运行，直到不再需要它且系统需要回收其内存以供其他应用使用。
- [启动相机的方法](/Android/%E5%90%AF%E5%8A%A8%E7%9B%B8%E6%9C%BA%E7%9A%84%E6%96%B9%E6%B3%95.html) — Camera1 API 是安卓早期的相机接口，尽管它在新版本的 Android 中已被弃用，但它仍然被一些旧设备和应用所使用。
- [日志详解](/Android/%E6%97%A5%E5%BF%97%E8%AF%A6%E8%A7%A3.html) — | 日志分类 | 日志说明 | | ------------- | :-----------: | | Log.e | 错误信息：程序崩溃等 | | Log.w | 警告信息 | | Log.i | 一般消息 | | Log.d | 调试信息，打印变量信息 |?
- [如何实现应用重启](/Android/%E5%A6%82%E4%BD%95%E5%AE%9E%E7%8E%B0%E5%BA%94%E7%94%A8%E9%87%8D%E5%90%AF.html) — 在一些手游中经常会有资源更新后自动重启应用的功能，这个是怎么实现的呢？
- [三方库面试题](/Android/%E4%B8%89%E6%96%B9%E5%BA%93%E9%9D%A2%E8%AF%95%E9%A2%98.html) — LeakCanary是在发生内存泄漏的时候去dump内存, 有没有在未发生内存泄漏的时候监控内存的手段。
- [深入理解图形渲染的关键角色和关系](/Android/%E6%B7%B1%E5%85%A5%E7%90%86%E8%A7%A3%E5%9B%BE%E5%BD%A2%E6%B8%B2%E6%9F%93%E7%9A%84%E5%85%B3%E9%94%AE%E8%A7%92%E8%89%B2%E5%92%8C%E5%85%B3%E7%B3%BB.html) — 在安卓图形渲染过程中，会涉及到以下几个角色，我们可以用一个比喻来形象地描述他们之间的关系，以此来加深对安卓的渲染机制的理解：
- [深入理解crash问题](/Android/%E6%B7%B1%E5%85%A5%E7%90%86%E8%A7%A3crash%E9%97%AE%E9%A2%98.html) — 首先，明确崩溃的类型。崩溃问题通常可以分为以下几类：
- [实践-亮度调节](/Android/%E5%AE%9E%E8%B7%B5-%E4%BA%AE%E5%BA%A6%E8%B0%83%E8%8A%82.html) — 本文档的所有代码均为kotlin
- [实践-路径动画](/Android/%E5%AE%9E%E8%B7%B5-%E8%B7%AF%E5%BE%84%E5%8A%A8%E7%94%BB.html)
- [实践-手机所有应用](/Android/%E5%AE%9E%E8%B7%B5-%E6%89%8B%E6%9C%BA%E6%89%80%E6%9C%89%E5%BA%94%E7%94%A8.html)
- [实践-recyclerview分组](/Android/%E5%AE%9E%E8%B7%B5-recyclerview%E5%88%86%E7%BB%84.html)
- [实践-Widget](/Android/%E5%AE%9E%E8%B7%B5-Widget.html) — widget就是安卓的桌面小组件，可以方便快捷的使用app提供的部分功能。
- [实践-WorkManager](/Android/%E5%AE%9E%E8%B7%B5-WorkerManager.html)
- [实现定时循环](/Android/%E5%AE%9E%E7%8E%B0%E5%AE%9A%E6%97%B6%E5%BE%AA%E7%8E%AF.html) — 使用 Handler 的 postDelay(Runnable, delayMillis) 方法实现定时任务。 该方法适用于需要在主线程或其他线程中处理短时间间隔任务的场景，例如更新UI或轻量级任务。
- [事件分发机制](/Android/%E4%BA%8B%E4%BB%B6%E5%88%86%E5%8F%91%E6%9C%BA%E5%88%B6.html) — 要了解事件分发，那我们先说说什么是事件，其实这里的事件指的就是点击事件，当用户触摸屏幕的时候，将会产生点击事件（Touch事件） Touch事件的相关细节（发生触摸的位置、时间等）被封装成MotionEvent对象
- [事件总线EventBus](/Android/%E4%BA%8B%E4%BB%B6%E6%80%BB%E7%BA%BFEventBus.html) — EventBus 是一个开源的 Android 库，用于简化组件之间的通信和解耦。它实现了发布/订阅模式（Publish/Subscribe），允许不同组件在应用内部通过事件进行通信，而不需要显式地持有对方的引用。以下是关于 EventBus 的基本介绍和如何?
- [图形渲染](/Android/%E5%9B%BE%E5%BD%A2%E6%B8%B2%E6%9F%93.html) — 画布是一种绘图 Surface，用于对照位图或 Surface 对象来处理实际位合成。Canvas 包含关于位图、线条、圆形、矩形、文字等的标准计算机绘制方法，并与位图或 Surface 相关联。画布是在屏幕上绘制 2D 对象的最简便方法。基类为 Canvas?
- [为什么主线程可以直接new Handler](/Android/%E4%B8%BA%E4%BB%80%E4%B9%88%E4%B8%BB%E7%BA%BF%E7%A8%8B%E5%8F%AF%E4%BB%A5%E7%9B%B4%E6%8E%A5new%20Handler.html) — 在 Android 中，Handler 是用来处理线程之间的消息通信和异步操作的一个重要工具，通常它用于在非主线程（如后台线程）中发送消息或执行任务，并确保这些任务最终在主线程中执行。对于 Handler 的使用，有一个重要的问题是为什么在 主线程 中可以直接?
- [相机扭曲的解决办法](/Android/%E7%9B%B8%E6%9C%BA%E6%89%AD%E6%9B%B2%E7%9A%84%E8%A7%A3%E5%86%B3%E5%8A%9E%E6%B3%95.html) — 发生相机扭曲的主要原因是surfaceview的宽高比与相机输出图像的最佳宽高比不一致，相机输出图像适配surfaceview的时候被拉伸导致的扭曲。
- [渲染机制](/Android/%E6%B8%B2%E6%9F%93%E6%9C%BA%E5%88%B6.html) — 在 View 涉及到 UI 更新的方法中，几乎都会在最后调用 View#invalidate() 或者 View#requestLayout()：
- [一个App会创建多少个Application对象](/Android/%E4%B8%80%E4%B8%AAApp%E4%BC%9A%E5%88%9B%E5%BB%BA%E5%A4%9A%E5%B0%91%E4%B8%AAApplication%E5%AF%B9%E8%B1%A1.html)
- [帧率和卡顿监控方案](/Android/%E5%B8%A7%E7%8E%87%E5%92%8C%E5%8D%A1%E9%A1%BF%E7%9B%91%E6%8E%A7%E6%96%B9%E6%A1%88.html) — 监控应用的帧率 FPS 是评估应用指标和发现卡顿问题的重要指标。常用的监控应用的FPS的方法有：
- [Activity](/Android/Activity.html) — Activity（活动）是Android应用程序中的一个核心组件，它通常用于表示用户界面的一部分。每个Activity都代表了一个屏幕或用户界面，用户可以与之交互。Activity负责管理用户界面的显示、用户输入的响应以及与其他组件的协作。
- [Activity的启动模式](/Android/Activity%E7%9A%84%E5%90%AF%E5%8A%A8%E6%A8%A1%E5%BC%8F.html) — 可在AndroidManifest.xml中配置该Activity的LaunchMode为以下配置项。
- [Activity和Fragment的低耦合通信](/Android/Activity%E5%92%8CFragment%E7%9A%84%E4%BD%8E%E8%80%A6%E5%90%88%E9%80%9A%E4%BF%A1.html)
- [Activity生命周期详解](/Android/Activity%E7%9A%84%E7%94%9F%E5%91%BD%E5%91%A8%E6%9C%9F%E8%AF%A6%E8%A7%A3.html) — 它会在系统首次创建 Activity 时触发。Activity 会在创建后进入“已创建”状态。在 onCreate() 方法中，您需执行基本应用启动逻辑，该逻辑在 Activity 的整个生命周期中 只应发生一次。例如，onCreate() 的实现可能会将数据?
- [Activity栈](/Android/Activity%E6%A0%88.html) — Android 是通过一种 Activity 栈的方式来管理 Activity 的，一个 Activity 的实例的状态决定它在栈中的位置。处于前台的 Activity 总是在栈的顶端，当前台的 Activity 因为异常或其它原因被销毁时，处于栈第二层的 A?
- [Activity中viewtree的创建过程](/Android/Activity%E4%B8%ADviewtree%E7%9A%84%E5%88%9B%E5%BB%BA%E8%BF%87%E7%A8%8B.html) — Activity与其他组件最大的不同，就是其内部拥有完整的界面显示机制，这涉及了ViewRootImpl, Window以及由他们管理的View Tree等。
- [ActivityManagerService](/Android/ActivityManagerService.html) — AMS 是Android提供的一个用于管理Activity运行状态的系统进程，也是编写APK应用时使用最频繁的系统服务。
- [ActivityThread线程(UI主线程)](</Android/ActivityThread%E7%BA%BF%E7%A8%8B(UI%E4%B8%BB%E7%BA%BF%E7%A8%8B).html>) — 区别： 普通线程只需要prepare就可以了，而主线程使用的是prepareMainLooper。 prepareMainLooper虽然也需要调用prepare方法，其特殊之处在于该线程不允许退出。除此之外没有本质的区别。 普通线程生成一个与Looper绑定?
- [ADB](/Android/ADB.html) — app入口：adb logcat | grep -i displayed
- [AIDL](/Android/AIDL.html) — AIDL全称为 Android Interface Definition Language，中文译为：安卓接口定义语言。可以利用AIDL定义客户端与服务端均认可的编程接口，以便进程间通信(IPC),在安卓中，进程之间存在进程隔离，所以一个进程通常无法访问另一个?
- [AIDL的关键字](/Android/AIDL%E7%9A%84%E5%85%B3%E9%94%AE%E5%AD%97.html) — 好的，下面是 AIDL 中所有关键字和概念的完整列表：
- [AlarmManager](/Android/AlarmManager.html) — AlarmManager 是 Android 中一个用于在特定时间安排应用程序运行的类，可以安排一次性或重复的任务。通常用于设置闹钟、触发后台任务或进行定期更新等场景。
- [AMS和WMS的关系](/Android/AMS%E5%92%8CWMS%E7%9A%84%E5%85%B3%E7%B3%BB.html) — AMS（Activity Manager Service）和WMS（Window Manager Service）是Android系统中两个核心的服务组件，它们共同协作以管理应用程序的界面显示和生命周期。AMS 和 WMS 的交互主要通过 Binder 机制实?
- [AMS剖析](/Android/AMS%E5%89%96%E6%9E%90.html) — 所有的 Android 应用程序都是由 Zygote 进程 fork 而来，在 Zygote 进程中初始化了 Java 运行时，加载了常用的 Java Classes，加载了系统资源等。这些底层基础都会被 Android 应用程序继承。在从 Zygote 中继?
- [AMS如何启动App进程](/Android/AMS%E5%A6%82%E4%BD%95%E5%90%AF%E5%8A%A8App%E8%BF%9B%E7%A8%8B.html) — Android 系统的 Activity Manager Service（AMS）是一个核心系统服务，负责管理应用程序的生命周期，其中包括启动和管理应用进程。下面是 AMS 如何启动应用进程的简要过程：
- [Android ip 命令详解](/Android/Android%20ip%20%E5%91%BD%E4%BB%A4%E8%AF%A6%E8%A7%A3.html) — ip 命令用于管理 Android 设备的网络接口、IP 地址、路由等网络配置。Android 使用 toybox 或 busybox 实现 ip 命令，并且可能缺少部分 GNU/Linux 发行版中的功能。
- [Android.mk](/Android/Android.mk.html) — Android.mk 是Android 提供的一种makefile 文件,注意用来编译生成（exe，so，a，jar，apk）等文件。
- [Android简介](/Android/Android%E7%AE%80%E4%BB%8B.html) — Android是一种基于Linux内核的综合操作系统，即包括各类底层驱动的开发，也包括使用java语言编写，但运行在Dalvik VM（非 Java 虚拟机，Android 4.4 以后运行在ART上）中编译和执行。
- [Android进程和线程](/Android/Android%E8%BF%9B%E7%A8%8B%E5%92%8C%E7%BA%BF%E7%A8%8B.html) — 进程是程序的一个运行实例，以区别于“程序”这一静态的概念；而线程则是CPU调度的基本单位。当前大部分的操作系统都支持多任务运行，这一特性让用户感到计算机好像可以是同时处理很多事情。在只有一个CPU核心的情况下，这种“同时”是一种假象。它是操作系统可以采用分时的?
- [Android文件系统](/Android/Android%E6%96%87%E4%BB%B6%E7%B3%BB%E7%BB%9F.html) — 好的，让我们更全面地深入 Android 文件系统的各个方面，包括所有主要目录及其用途，以及文件系统的架构和管理。
- [Android系统启动流程](/Android/Android%E7%B3%BB%E7%BB%9F%E5%90%AF%E5%8A%A8%E6%B5%81%E7%A8%8B.html) — 从手机开机开始涉及到的关键流程一般可分为以下五个步骤：
- [Android一个APP里面最少有几个线程](/Android/Android%E4%B8%80%E4%B8%AAAPP%E9%87%8C%E9%9D%A2%E6%9C%80%E5%B0%91%E6%9C%89%E5%87%A0%E4%B8%AA%E7%BA%BF%E7%A8%8B.html) — Android一个进程里面最少包含5个线程，分别为：
- [Android与Service通信](/Android/Android%E4%B8%8EService%E9%80%9A%E4%BF%A1.html) — 这是最简单和常见的一种方式，适用于需要一次性操作或简单的后台任务。
- [AndroidTest编译Provider冲突问题](/Android/AndroidTest%E7%BC%96%E8%AF%91Provider%E5%86%B2%E7%AA%81%E9%97%AE%E9%A2%98.html) — 安装AndroidTest的apk时报错信息：
- [ANR问题简析](/Android/ANR%E9%97%AE%E9%A2%98%E7%AE%80%E6%9E%90.html) — ANR问题，相信是每位开发日常都会遇到的问题，对于这类问题的分析，按照官方的推荐，或网络博客的总结思路能解决一定的问题，但是多数时候大家的困惑就是应用本逻辑很简单，耗时很短或应用堆栈完全正常，或者或处于空闲状态，可系统为什么就认为接收者发生ANR了呢？下面将之?
- [AOSP架构](/Android/AOSP%E6%9E%B6%E6%9E%84.html) — AOSP 的软件堆栈包含以下层：
- [APK打包流程](/Android/APK%E6%89%93%E5%8C%85%E6%B5%81%E7%A8%8B.html) — APK文件大致分为两个部分：代码 和 资源，所以打包也就分为这两个部分。 简要流程：
- [App卡顿优化](/Android/App%E5%8D%A1%E9%A1%BF%E4%BC%98%E5%8C%96.html) — LayoutInflater加载xml布局的过程会在主线程使用IO读取xml布局文件进行xml解析，再根据解析结果利用反射创建布局中的View/ViewGroup对象。 可以用AsyncLayoutInflater异步加载。
- [Application为什么不能作为Dialog的context](/Android/Application%E4%B8%BA%E4%BB%80%E4%B9%88%E4%B8%8D%E8%83%BD%E4%BD%9C%E4%B8%BADialog%E7%9A%84context.html) — Dialog的context只能是Activity，而不能是Application，不然会导致弹窗崩溃：
- [AssestManager](/Android/AssestManager.html) — AssetManager 是 Android 中用于访问应用程序资源（如文本文件、图片、音频文件等）的类。它提供了对应用内部资源的访问接口，通常用于读取和管理应用内的原始资源文件。
- [AsyncTask](/Android/AsyncTask.html) — AsyncTask 是 Android 开发中用于执行后台操作并在完成后更新 UI 的一种便捷工具。尽管 AsyncTask 曾经是 Android 开发中的重要组成部分，但它在 Android 11 (API Level 30) 中已被弃用。推荐使用其他方式?
- [Binder](/Android/Binder.html) — 在Android系统中，Binder 是一种用于进程间通信（Inter-Process Communication，IPC）的机制。应用程序是由Activity、Service、Broadcast Receiver和Content Provider四种类型的组?
- [BottomNavigationView](/Android/BottomNavigationView.html) — BottomNavigationView 是 Android 提供的用于底部导航栏的 UI 组件，通常用于在应用中快速切换主要功能模块或页面。它提供了一种简单而直观的方式来导航到不同的目标界面。让我们深入了解 BottomNavigationView 的属性、?
- [BroadcastReceiver](/Android/BroadcastReceiver.html) — BroadcastReceiver（广播接收器）是Android应用程序的一个关键组件，用于接收系统广播消息或应用程序内部广播，并在接收到广播时采取适当的操作。广播是一种轻量级的通信机制，用于在应用程序组件之间或系统组件之间传递消息。
- [Compose布局系统与 Modifier](/Android/Compose/Compose%E5%B8%83%E5%B1%80%E7%B3%BB%E7%BB%9F%20%26%20Modifier.html) — 文档级 · 教学级 · 指南级
- [Compose的gradle配置](/Android/Compose/Compose%E7%9A%84gradle%E9%85%8D%E7%BD%AE.html) — Jetpack Compose 是一个用于构建原生 Android UI 的现代工具包。它使用声明式函数来构建UI组件，不需要我们使用任何xml布局。
- [ContentProvider](/Android/ContentProvider.html) — ContentProvider（内容提供器）是Android应用程序的一个核心组件，用于管理和提供应用程序数据，以便其他应用程序可以访问和共享这些数据。ContentProvider允许应用程序将数据存储在共享数据库中，并提供标准接口，以便其他应用程序可以执行?
- [Context](/Android/Context.html) — 它是Android里的一个上帝类，启动四大组件、获取资源、获取类加载器等重要功能都通过Context 来完成，Activity、Service与Application也都派生自Context，Broadcast Receiver与Content Provide?
- [DataBinding](/Android/DataBinding.html) — DataBinding 是谷歌官方发布的一个框架，顾名思义即为数据绑定，是 MVVM 模式在 Android 上的一种实现，用于降低布局和逻辑的耦合性，使代码逻辑更加清晰。MVVM 相对于 MVP，其实就是将 Presenter 层替换成了 ViewModel?
- [DataStore](/Android/DataStore.html) — Jetpack DataStore是一种数据存储方案，可以使用 protocolBuffer 存储 键值对 或者 数据对象。其使用Kotlin 协程和 Flow，以 异步 和 事务一致性 的方式存储数据。推荐从SharedPreference迁移到DataSt?
- [DecorView](/Android/DecorView.html) — AMS管理着Activity生命周期，每当切换Activity状态时通过Binder告诉ActivityThread，ActivityThread通过Handler切换到主线程(UI线程）执行，最终分别调用到我们熟知的onCreate(xx)/onResume?
- [dumpsys](/Android/dumpsys.html) — dumpsys是Android提供的系统工具，可以用来查看所有系统服务的信息。 在命令行输入如下命令，就可以罗列出当前所有的系统服务名：
- [EventLog日志](/Android/EventLog%E6%97%A5%E5%BF%97.html) — | Num | TagName | 格式 | 功能 | |-------|-------------------------------|-------------------------------------------------------------?
- [Fragment](/Android/Fragment.html)
- [Fragment几种不同的commit方法](/Android/Fragment%E5%87%A0%E7%A7%8D%E4%B8%8D%E5%90%8C%E7%9A%84commit%E6%96%B9%E6%B3%95.html) — FragmentTransaction 是用于在 Android 应用中执行 Fragment 操作的类，如添加、替换、移除等
- [Fragment找不到id对应view](/Android/Fragment%E6%89%BE%E4%B8%8D%E5%88%B0id%E5%AF%B9%E5%BA%94view.html) — 在使用 viewbinding 生成页面布局时发现id为btn的自定义view发生crash报错，报错信息：
- [Fragment转场动画](/Android/Fragment%E8%BD%AC%E5%9C%BA%E5%8A%A8%E7%94%BB.html) — 使用 FragmentTransaction 的 setCustomAnimations() 方法可以实现自定义转场动画,提交带有动画效果的 Fragment 事务。
- [Glide四级缓存](/Android/Glide%E5%9B%9B%E7%BA%A7%E7%BC%93%E5%AD%98.html) — Glide 缓存机制核心逻辑梳理：ActiveResources 弱引用、MemoryCache LRU、RESOURCE 磁盘缓存、DATA 磁盘缓存的检索顺序与互斥流转。
- [Handler](/Android/Handler.html) — Handler 用于线程间通信的消息传递机制。Handler其实就是在主线程起一个子线程，子线程运行并生成 Message，Looper 获取Message并传递给Handler，Handler逐个获取子线程中的Message。
- [Handler、MessageQueue和Looper](/Android/Handler%E3%80%81MessageQueue%E5%92%8CLooper.html) — Looper不断获取MessageQueue中的一个Message，然后交给Handler来处理。
- [Handler.postDelayed()消息时间准确吗](</Android/Handler.postDelayed()%E6%B6%88%E6%81%AF%E6%97%B6%E9%97%B4%E5%87%86%E7%A1%AE%E5%90%97.html>) — Handler.postDelayed() 方法用于在延迟一定时间后执行一个任务，它是 Android 中常用的延时执行操作的方式。尽管这种方法在许多场景中非常实用，但它的时间准确性和可靠性可能会受到多种因素的影响。
- [Intent](/Android/Intent.html) — 即意图，分为显式意图和隐式意图 | 元素名称 | 设置方法|说明与用途| | --------|-------|---------| | Component|setComponent|组件,指定意图的来源与目标| | Action |setAction |动作?
- [Intent发送数据的上限](/Android/Intent%E5%8F%91%E9%80%81%E6%95%B0%E6%8D%AE%E7%9A%84%E4%B8%8A%E9%99%90.html) — Intent携带信息的大小其实是受到Binder的限制（包括Binder的大小和缓存两种限制）。数据以Parcel对象的形式存放在Binder缓存区中。如果数据或返回值比缓存区域大，那么会抛出TransactionTooLargeException异常。
- [invalidate会触发其他View的重绘吗？](/Android/invalidate%E4%BC%9A%E8%A7%A6%E5%8F%91%E5%85%B6%E4%BB%96View%E7%9A%84%E9%87%8D%E7%BB%98%E5%90%97%EF%BC%9F.html) — 在Android中，调用某个View的invalidate()方法并不会直接触发其他View的重绘。invalidate()的作用是标记当前View为“脏”状态，意味着这个View需要重新绘制。系统随后会在合适的时机（通常是UI线程的下一个绘制周期）调用该Vi?
- [Jetpack Compose 状态管理详解](/Android/Compose/ComposeStateManagement.html) — 在 Jetpack Compose 中，状态 (State) 是驱动 UI 更新的核心。与传统的 View 体系不同，Compose 是声明式的：UI 是状态的函数。当应用的状态发生变化时，Compose 会重新执行受影响的 Composable 函数（这个过程称为重组），从而更新 UI。
- [JobScheduler](/Android/JobScheduler.html) — JobScheduler 是 Android 5.0（API 21）引入的系统级后台任务调度 API，旨在帮助开发者以低功耗、系统友好的方式执行后台任务。它提供条件触发、持久化、系统统一调度等机制，是 Google 在 Doze 模式、App Standby?
- [JobService](/Android/Jobservice.html) — JobService 是一个安卓系统组件，继承自Sevice（实际为系统托管的特殊服务），用于在满足任务条件时由系统唤醒并运行。是 JobScheduler 派发任务时调用的组件，用于执行具体的后台逻辑。
- [LeakCanary原理分析](/Android/LeakCanary%E5%8E%9F%E7%90%86%E5%88%86%E6%9E%90.html) — | 模块 | 核心组件/类 | 功能关联 | | ------------ | ------------------------------ | -------------------- | | 监控模块 | ActivityDestroyWatcher |?
- [LiveData](/Android/LiveData.html) — LiveData 是一个持有可观察数据的类，它可以感知组件的生命周期（如 Activity 和 Fragment）。LiveData 能自动管理观察者（即观察数据变化的对象），并确保数据只在可见的 UI 组件上更新，避免内存泄漏。
- [Looper死循环为什么不会导致应用卡死](/Android/Looper%E6%AD%BB%E5%BE%AA%E7%8E%AF%E4%B8%BA%E4%BB%80%E4%B9%88%E4%B8%8D%E4%BC%9A%E5%AF%BC%E8%87%B4%E5%BA%94%E7%94%A8%E5%8D%A1%E6%AD%BB.html) — 导致卡死的是在Ui线程中执行耗时操作导致界面出现掉帧，甚至ANR，Looper.loop()这个操作本身不会导致这个情况。
- [Manifest详解](/Android/Manifest%E8%AF%A6%E8%A7%A3.html) — 在 Android 应用程序开发中，AndroidManifest.xml 是一个非常重要的文件，它描述了应用的基本信息、组件、权限等。
- [MediaPlayer](/Android/MediaPlayer.html) — Idle 状态： 当使用new()方法创建一个MediaPlayer对象或者调用了其reset()方法时，该MediaPlayer对象处于idle状态。这两种方法的一个重要差别就是：如果在这个状态下调用了getDuration()等方法（相当于调用时机不正确）?
- [Notification从发送到显示的流程简析](/Android/Notification%E4%BB%8E%E5%8F%91%E9%80%81%E5%88%B0%E6%98%BE%E7%A4%BA%E7%9A%84%E6%B5%81%E7%A8%8B%E7%AE%80%E6%9E%90.html) — Notificatio主要由三部分组成：发送/更新/取消通知的应用app、系统通知服务、NotificationManagerService 和 通知监听器 NotificationListenerService。应用可以调用 NotificationMana?
- [onResume中获取宽高有效吗？](/Android/onResume%E4%B8%AD%E8%8E%B7%E5%8F%96%E5%AE%BD%E9%AB%98%E6%9C%89%E6%95%88%E5%90%97%EF%BC%9F.html) — View 的测绘绘制流程就是从 ViewRootImpl#performTraversals() 开始的，而这个方法的调用是在 onResume() 方法之后，所以在 onCreate() 和 onResume() 方法中拿不到 View 的测量值。
- [OpenGL ES初步探索](/Android/OpenGL%20ES%E5%88%9D%E6%AD%A5%E6%8E%A2%E7%B4%A2.html) — 本文中代码均为Kotlin
- [OpenGL-纹理](/Android/OpenGL-%E7%BA%B9%E7%90%86.html) — 我们已经了解到，我们可以为每个顶点添加颜色来增加图形的细节，从而创建出有趣的图像。但是，如果想让图形看起来更真实，我们就必须有足够多的顶点，从而指定足够多的颜色。这将会产生很多额外开销，因为每个模型都会需求更多的顶点，每个顶点又需求一个颜色属性。
- [Parcelable 和 Bundle](/Android/Parcelable%E5%92%8CBundle.html) — Parcelable 和 Bundle 对象可跨进程边界使用，例如与 IPC/Binder 事务之间，带有 intent 的 Activity 之间等，还可以用来存储跨配置更改的瞬时状态。本页介绍了使用 Parcelable 和 Bundle 对象的建议和最佳?
- [PhoneWindow](/Android/PhoneWindow.html) — Activity和Dialog在显示过程中都创建了PhoneWindow对象，而PopupWindow和Toast却没有。
- [RecyclerView和ListView区别](/Android/RecyclerView%E5%92%8CListView%E5%8C%BA%E5%88%AB.html) — ListView 需要自定义ViewHolder,判断convertView是否为null，setTag()与getTag()的使用;RecyclerView有规定好的ViewHolder。 ListView 只支持垂直方向的，而RecyclerView，它里?
- [RecyclerView四级缓存](/Android/RecyclerView%E5%9B%9B%E7%BA%A7%E7%BC%93%E5%AD%98.html) — Recycler 按 Scrap、CachedViews、ViewCacheExtension、RecycledViewPool 四级取 ViewHolder。CachedViews 默认 2 格，池里每种 viewType 默认 5 格。Scrap 不限，Extension 默认是 0。
- [RecyclerView性能优化](/Android/RecyclerView%E6%80%A7%E8%83%BD%E4%BC%98%E5%8C%96.html) — RecyclerView 主要有三层缓存
- [RecyclerView知识点汇总](/Android/RecyclerView%E7%9F%A5%E8%AF%86%E7%82%B9%E6%B1%87%E6%80%BB.html) — RecyclerView.Adapter - 处理数据集合并负责绑定视图 ViewHolder - 持有所有的用于绑定数据或者需要操作的View LayoutManager - 负责摆放屎图等相关操作 ItemDecoration - 负责绘制item的分割线?
- [Retrofit](/Android/Retrofit.html) — Retrofit 是一个类型安全的 HTTP 客户端，主要用于与 RESTful API 进行交互，简化了网络请求的流程。
- [Service](/Android/Service.html) — Service（服务）是Android应用程序的一个核心组件，它是一种后台运行的组件，用于执行长时间运行的任务，而不需要用户界面。Service通常用于处理与用户界面无关的操作，如下载文件、播放音乐、处理网络请求等。Service可以在应用程序的生命周期内独立?
- [Service的启动方式和区别](/Android/Service%E7%9A%84%E5%90%AF%E5%8A%A8%E6%96%B9%E5%BC%8F%E5%92%8C%E5%8C%BA%E5%88%AB.html) — （1）Started Service被开启的service通过其他组件调用startService()被创建，这种service可以无限地运行下去，必须调用stopSelf()方法或者其他组件调用stopService()方法来停止它，当service被停止时?
- [Service生命周期](/Android/Service%E7%94%9F%E5%91%BD%E5%91%A8%E6%9C%9F.html) — （1）service整体的生命时间是从onCreate()被调用开始，到onDestroy()方法返回为止。和activity一样，service在onCreate()中进行它的初始化工作，在onDestroy()中释放残留的资源比如，一个音乐播放servic?
- [setContentView之后发生了什么](/Android/setContentView%E4%B9%8B%E5%90%8E%E5%8F%91%E7%94%9F%E4%BA%86%E4%BB%80%E4%B9%88.html) — setContentView 是 Android 开发中用来设置 Activity 显示界面的核心方法，其背后涉及了一系列复杂的步骤来完成界面的加载和渲染。以下是该方法调用后的大致流程，基于 Android 源码的分析：
- [Settings数据库](/Android/Settings%E6%95%B0%E6%8D%AE%E5%BA%93.html) — Settings 是一个存储系统和用户设置的数据库，它主要用于保存设备的配置信息和用户偏好设置。这些设置存储在一个 SQLite 数据库中，并通过 Android 提供的 Settings API 进行访问。settings 相关的数据最后是存在xml中，ap?
- [SharedPreference](/Android/SharedPreference.html) — SharedPreferences是Android的一个接口类，是Android 数据存储（保存内部）的一种方法。主要以*.xml的形式保存在Android /data/data/com.*包名/shared_prefs下，SharedPreferences?
- [Skia：全面解读](/Android/Skia.html) — Skia是一个高性能的2D图形库，被广泛用于各种操作系统和设备，包括Android、Chrome、Flutter、Firefox等。它提供了强大的绘图能力和跨平台支持，成为许多图形应用的核心组件。
- [SparseArray](/Android/SparseArray.html) — Android提供了SparseArray，这也是一种KV形式的数据结构，提供了类似于Map的功能。但是实现方法却和HashMap不一样。它与Map相比，可以说是各有千秋。
- [StartActivity之后发生了什么](/Android/StartActivity%E4%B9%8B%E5%90%8E%E5%8F%91%E7%94%9F%E4%BA%86%E4%BB%80%E4%B9%88.html) — 由于Android系统是基于Linux的，原则上说它的应用程序并不只是APK这一种类型，换句话说，所有Linux支持的应用程序都可以通过一定方式运行在Android系统上（比如一些系统级的应用程序）
- [Surface 和 SurfaceHolder](/Android/Surface%E5%92%8CSurfaceHolder.html) — Surface 对象使应用能够渲染要在屏幕上显示的图像。通过 SurfaceHolder 接口，应用可以编辑和控制 Surface。Surface 通过 BufferQueue 机制在生产者和消费者之间传递图像缓冲区。生产者可以是CPU绘图程序（如Canvas?
- [SystemServer进程的意义](/Android/SystemServer%E8%BF%9B%E7%A8%8B%E7%9A%84%E6%84%8F%E4%B9%89.html) — 系统服务的集中管理者：SystemServer是Android框架层众多核心服务的宿主，这些服务包括但不限于Activity Manager (AMS)、Package Manager (PMS)、Window Manager (WMS)、Power Mana?
- [Thread类](/Android/Thread%E7%B1%BB.html) — 首先要区分线程和线程类的概念。线程是操作系统CPU资源分配的调度单元，属于抽象的范畴，而线程类实际上是可执行的代码。
- [Trace日志简介](/Android/Trace%E6%97%A5%E5%BF%97.html) — 在ANR日志中，重点关注主线程的堆栈跟踪。通常，主线程被阻塞的原因可能包括但不限于：
- [ViewModel 和 LiveData](/Android/ViewModel%20%E5%92%8C%20LiveData.html) — 是一个用于管理和存储与用户界面相关的数据的类。它设计用于存储和管理与界面相关的数据，例如 Activity 或 Fragment 的 UI 数据，而不受设备配置变化（如旋转）的影响。
- [ViewRoot的基本工作方式](/Android/ViewRoot%E7%9A%84%E5%9F%BA%E6%9C%AC%E5%B7%A5%E4%BD%9C%E6%96%B9%E5%BC%8F.html) — 每一颗ViewTree只对应一个ViewRoot。它将和WindowManagerService进行一系列的通信，包括窗口注册，大小调整等，ViewRoot主要的触发源有两种： 比如某个View对象需要更新UI时，它会通过invalidate或者其他方式发起请?
- [ViewTree的遍历](/Android/ViewTree%E7%9A%84%E9%81%8D%E5%8E%86.html) — 如果整个UI界面只是由单一的View对象来描述的，那么它既可以占据整个屏幕空间，也可以有选择地在屏幕上任何一片区域上显示。不过这种理想的情况是不存在的。通常我们面对的View层级都比较深，涉及的view对象比较多。此时系统就要综合来考虑各个view提出的需求。?
- [Vsync机制](/Android/Vsync%E6%9C%BA%E5%88%B6.html) — VSYNC（Vertical Synchronization，垂直同步）是一种图形显示技术，用于在显示屏刷新内容时避免屏幕撕裂（Screen Tearing）现象。它通过将显示设备的刷新率与 GPU（图形处理器）的帧生成速度同步来实现。
- [Watchdog](/Android/Watchdog.html) — Watchdog的中文的“看门狗”，有保护的意思。最早引入Watchdog是在单片机系统中，Linux也引入了Watchdog，在Linux内核下，当Watchdog启动后，便设定了一个定时器，如果在超时时间内没有对/dev/Watchdog进行写操作，则会导?
- [WindowManagerService（WMS）](/Android/WindowManagerService.html) — 从计算机的IO系统角度分析，WMS至少要完成两个功能：
- [WMS中窗口的注册](/Android/WMS%E4%B8%AD%E7%AA%97%E5%8F%A3%E7%9A%84%E6%B3%A8%E5%86%8C.html) — 首先先要明确一下PhoneWindow的概念和作用：其继承自Window类，表达了窗口的一种约束机制；而WMS中的Window则是一个抽象的概念，其有一个WindowState用于描述状态。可以简单理解为：PhoneWindow是应用进程端对于“窗口”的描述，?
- [WorkManager](/Android/WorkManager.html) — WorkManager 是一种用于启动永久性工作的Jetpack的API。持久性工作是指能够在应用和系统重启后仍然保持工作调度状态的工作。
- [Zygote进程的fork](/Android/Zygote%E8%BF%9B%E7%A8%8B%E7%9A%84fork.html) — 在Android系统中，Zygote进程是所有Android应用程序进程的母进程。当系统启动时，会首先启动一个初始化进程Init，Init随后会启动SystemServer进程，而SystemServer进程中会孵化出Zygote进程。Zygote初始化时会预?
- [Zygote如何保证加载速度](/Android/Zygote%E5%A6%82%E4%BD%95%E4%BF%9D%E8%AF%81%E5%8A%A0%E8%BD%BD%E9%80%9F%E5%BA%A6.html) — Zygote在启动时确实会加载大量的类和资源，以确保这些基础元素可以被所有后续的应用进程共享，从而加速它们的启动。为了保证加载速度并优化性能，Zygote采取了以下几种策略：

## C++

- [模板](/C%2B%2B/%E6%A8%A1%E6%9D%BF.html) — 在 C++ 中，模板（Template）是一种参数化的类型，它允许在不知道具体类型的情况下定义类或函数。模板可以用于创建泛型类（可以用于多种数据类型的类）或者泛型函数。这使得代码更加灵活和可重用。 函数模板允许在编写一个函数时使用一个或多个类型参数，这些类型参?
- [头文件的声明规范](/C%2B%2B/%E5%A4%B4%E6%96%87%E4%BB%B6%E7%9A%84%E5%A3%B0%E6%98%8E%E8%A7%84%E8%8C%83.html)

## Flutter

- [dart语言简介](/Flutter/dart%E8%AF%AD%E8%A8%80%E7%AE%80%E4%BB%8B.html) — Object 是 Dart 所有对象的根基类，也就是说在 Dart 中所有类型都是Object的子类(包括Function和Null)，所以任何类型的数据都可以赋值给Object声明的对象。 dynamic与Object声明的变量都可以赋值任意对象，且后期可以?

## Java

[Java分类目录](/Java/)

- [动态代理](/Java/%E5%8A%A8%E6%80%81%E4%BB%A3%E7%90%86.html) — 如果要给eat方法添加吃饭之前要拿筷子和盛饭的动作，一般来说只能在源代码中添加对应的功能。这属于侵入式修改，在成熟的项目中很少会这样修改，因为可能会产生bug。 此时可以利用代理来帮助我们做以上的两个准备工作再去执行原方法，这种方式叫做动态代理，其特点是能够无?
- [对象初始化流程](/Java/%E5%AF%B9%E8%B1%A1%E5%88%9D%E5%A7%8B%E5%8C%96%E6%B5%81%E7%A8%8B.html) — 从JVM和底层角度来看，Java对象的初始化流程涉及到类加载、内存管理、对象布局、以及字节码执行等多个方面。以下是详细的分析：
- [反射](/Java/%E5%8F%8D%E5%B0%84.html) — 反射允许对成员变量，成员方法和构造方法的信息进行编程访问。比如：IDEA的方法提示就是利用的反射。 反射获取到的这些信息不是从java文件中获取的，而是从class字节码中获取的。
- [分代模型的六种垃圾回收器](/Java/%E5%88%86%E4%BB%A3%E6%A8%A1%E5%9E%8B%E7%9A%84%E5%85%AD%E7%A7%8D%E5%9E%83%E5%9C%BE%E5%9B%9E%E6%94%B6%E5%99%A8.html) — 这是一个单线程的收集器，适用于客户端模式下的默认新生代收集器。
- [浮动垃圾](/Java/%E6%B5%AE%E5%8A%A8%E5%9E%83%E5%9C%BE.html) — 在JVM（Java虚拟机）的垃圾回收过程中，“浮动垃圾”是指在并发标记或并发清理阶段由用户线程产生的新垃圾。这些垃圾之所以被称为“浮动”，是因为它们是在垃圾回收器进行标记或清理操作的同时，由于应用程序的持续运行而新产生的垃圾。
- [类之间的关系](/Java/%E7%B1%BB%E4%B9%8B%E9%97%B4%E7%9A%84%E5%85%B3%E7%B3%BB.html) — 是一种最明显也是最一般的关系。例如：Order类依赖Account类，因为Order对象需要访问Account对象来查看信用状态。但是Item类不依赖于Account类，因为Item对象不需要考虑客户账户。因此，如果一个类的方法要使用或操作另一个类的对象，我们?
- [三色标记算法](/Java/%E4%B8%89%E8%89%B2%E6%A0%87%E8%AE%B0%E7%AE%97%E6%B3%95.html) — 三色标记算法通过将对象分为三种颜色状态来追踪和管理内存中的对象。这种方法常用于实现高效的垃圾回收机制，尤其是现代的JVM中。三色标记算法的颜色状态包括 白色、黑色和灰色，每种颜色代表了对象的不同生命周期状态。
- [双亲委派机制](/Java/%E5%8F%8C%E4%BA%B2%E5%A7%94%E6%B4%BE%E6%9C%BA%E5%88%B6.html) — 双亲委派机制 是Java类加载器（ClassLoader）的核心工作机制，它通过层次化的类加载模型保障了Java程序的稳定性和安全性。
- [线程池](/Java/%E7%BA%BF%E7%A8%8B%E6%B1%A0.html) — 线程池其实是一种池化技术的实现，池化技术的核心思想其实就是实现资源的可重复利用，让线程在执行完任务不会销毁去继续处理其他的任务，避免资源重复创建和销毁带来的性能开销。还可以提高响应速度。当任务到达时，任务可以不需要等到线程创建就能立即执行。。另外，线程池还能起?
- [线程池核心线程空闲时处于什么状态](/Java/%E7%BA%BF%E7%A8%8B%E6%B1%A0%E6%A0%B8%E5%BF%83%E7%BA%BF%E7%A8%8B%E7%A9%BA%E9%97%B2%E6%97%B6%E5%A4%84%E4%BA%8E%E4%BB%80%E4%B9%88%E7%8A%B6%E6%80%81.html) — 在线程池中，核心线程在空闲时的状态取决于线程池的配置，尤其是线程池的 keepAliveTime 和相关的线程管理策略。
- [伊甸园区算法](/Java/%E4%BC%8A%E7%94%B8%E5%9B%AD%E5%8C%BA%E7%AE%97%E6%B3%95.html) — 在JVM的内存管理机制中，"伊甸园区" 是新生代的一部分，主要用于存放新创建的对象。当对象首次被创建时，通常会被放置在伊甸园区内。伊甸园区的垃圾回收主要遵循以下算法：
- [CAS](/Java/CAS.html) — CAS (Compare And Swap，比较和交换)，是非阻塞同步的实现原理，它是CPU硬件的指令，从CPU层面保证比较与交换两个操作的原子性。 CAS 指令操作包括三个参数：
- [CompletableFuture](/Java/CompletableFuture.html) — CompletableFuture 是 Java 8 引入的一个类，属于 java.util.concurrent 包，主要用于异步编程和非阻塞操作。它提供了一种更简单和强大的方式来处理异步计算，相较于传统的 Future 类，CompletableFutur?
- [ForkJoinPool](/Java/ForkJoinPool.html) — 把大任务分成小任务，分而治之；让每个线程都有本地任务队列，空闲线程可以“偷”别的线程的任务来做（Work Stealing）
- [GC算法](/Java/GC%E7%AE%97%E6%B3%95.html) — 同一段内存上的标记-清除、复制和整理，以及分代、卡表和三色标记。
- [HashMap的高级用法](/Java/HashMap.html) — 在 HashMap 中，负载因子用于决定何时需要增加 HashMap 的容量。默认的负载因子是 0.75，也就是说，当哈希表的元素数量达到容量的 75% 时，它会自动扩容。
- [Integer1000与100的比较](/Java/Integer1000%E4%B8%8E100%E7%9A%84%E6%AF%94%E8%BE%83.html) — Integer是int的包装类型。有人可能认为下面两种声明方式是一样的，但是实际上是错误的。
- [Java如何保证线程T1，T2，T3 顺序执行](/Java/Java%E5%A6%82%E4%BD%95%E4%BF%9D%E8%AF%81%E7%BA%BF%E7%A8%8BT1%EF%BC%8CT2%EF%BC%8CT3%20%E9%A1%BA%E5%BA%8F%E6%89%A7%E8%A1%8C.html) — Thread.join() 方法会使当前线程等待另一个线程执行完毕后再继续执行。通过在 T1、T2、T3 之间调用 join()，可以确保线程按顺序执行。
- [JVM](/Java/JVM%E6%A6%82%E8%BF%B0.html) — Java虚拟机（JVM）是Java程序的运行时环境，它抽象了底层硬件和操作系统的差异，使得Java程序可以在不同平台上运行。JVM的“分布”可以理解为JVM在不同操作系统和硬件平台上的实现，以及JVM的结构和各个部分的功能分布。
- [JVM分区](/Java/JVM%E5%88%86%E5%8C%BA.html) — JVM内存的管理与分区对于理解Java应用程序的性能、垃圾回收（GC）机制以及内存调优非常关键。JVM内存主要分为以下几个区域，每个区域都有特定的用途和管理机制。
- [String的intern方法](/Java/String%E7%9A%84intern%E6%96%B9%E6%B3%95.html) — String的intern方法用于在运行时将字符串添加到内部的字符串池中，并返回字符串池中的引用
- [ThreadLocal](/Java/ThreadLocal.html) — ThreadLocal是java提供的一个用于线程本地存储的类。它为每个线程提供独立的变量副本。确保变量再多线程环境下的线程安全。每个线程访问ThreadLocal时，都会有自己专属的变量副本，互不干扰，避免了并发访问时共享变量的竞争问题。
- [volatile和synchronize的区别](/Java/volatile%E5%92%8Csynchronize%E7%9A%84%E5%8C%BA%E5%88%AB.html) — volatile 和 synchronized 都是 Java 中用于处理多线程编程的关键字，但它们的作用和机制有所不同

## Kotlin

[Kotlin分类目录](/Kotlin/)

- [操作符重载](/Kotlin/%E6%93%8D%E4%BD%9C%E7%AC%A6%E9%87%8D%E8%BD%BD.html) — 在Kotlin中，操作符重载（Operator Overloading）允许你为类定义或修改运算符的行为。通过定义特定的函数，你可以自定义一些常见的运算符（如 +, -, *, / 等）的行为。Kotlin使用operator关键字来标记这些函数，以表明它们是?
- [初始化数组](/Kotlin/%E5%88%9D%E5%A7%8B%E5%8C%96%E6%95%B0%E7%BB%84.html)
- [泛型](/Kotlin/%E6%B3%9B%E5%9E%8B.html) — Kotlin 的泛型（Generics）提供了一种方式，使类型参数化，允许编写更加通用和可重用的代码。 泛型在 Kotlin 中的使用和 Java 类似，但也有一些独特的特性和改进。下面是对 Kotlin 泛型的详细介绍，包括泛型类、泛型函数、型变（协变与逆变?
- [范围表达式](/Kotlin/%E8%8C%83%E5%9B%B4%E8%A1%A8%E8%BE%BE%E5%BC%8F.html) — Kotlin 的范围表达式（Range Expressions）用于表示一个区间，可以用于检查某个值是否在某个范围内、遍历该范围内的所有值、生成序列等操作。范围表达式主要通过 .. 运算符创建，并且支持多种类型，包括整数、字符等。
- [高并发场景下的协程调度与调优](/Kotlin/%E9%AB%98%E5%B9%B6%E5%8F%91%E5%9C%BA%E6%99%AF%E4%B8%8B%E7%9A%84%E5%8D%8F%E7%A8%8B%E8%B0%83%E5%BA%A6%E4%B8%8E%E8%B0%83%E4%BC%98.html) — | 特性 | withContext() | launch() | |:--------------:|:-----------------------------:|:----------------------------------:| | 是否为挂起函?
- [集合](/Kotlin/%E9%9B%86%E5%90%88.html) — 集合是用于处理一组对象的容器。常见的集合有三种类型。列表类、Set类、Map类。
- [可见性修饰符](/Kotlin/%E5%8F%AF%E8%A7%81%E6%80%A7%E4%BF%AE%E9%A5%B0%E7%AC%A6.html) — Kotlin 是一种功能强大且简洁的编程语言，以其现代特性和清晰的语法而闻名。其中在代码组织和安全性方面扮演重要角色的一个关键因素是可见性修饰符。本文将探讨 Kotlin 中的可见性修饰符是什么以及它们在 Kotlin 中的工作原理，通过简单的代码示例帮助您理?
- [扩展函数](/Kotlin/%E6%89%A9%E5%B1%95%E5%87%BD%E6%95%B0.html)
- [类别名](/Kotlin/%E7%B1%BB%E5%88%AB%E5%90%8D.html) — 在Kotlin中，类别名（type alias）是一种功能，它允许为现有的类型创建别名，以便简化代码或提高可读性。 typealias 关键字用于定义类别名。
- [类型擦除](/Kotlin/%E7%B1%BB%E5%9E%8B%E6%93%A6%E9%99%A4.html) — 类型擦除(Type Erasure) 是Java 和 Kotlin 中的一种机制。在编译时，泛型信息(类型参数)会被移除或者擦除，从而使得在运行时无法直接获取泛型的具体类型。
- [内联函数](/Kotlin/%E5%86%85%E8%81%94%E5%87%BD%E6%95%B0.html) — 当 makeTest() 被inline 修饰时， 在 main() 中原来调用 makeTest() 的地方被替换成了 makeTest() 里面的代码。 也就是说在编译时期，把调用这个函数的地方用这个函数的方法体进行替换
- [逆变和协变](/Kotlin/%E9%80%86%E5%8F%98%E5%92%8C%E5%8D%8F%E5%8F%98.html) — 逆变与协变用来描述类型转换后的继承关系
- [协程](/Kotlin/%E5%8D%8F%E7%A8%8B.html) — 协程是一个轻量化线程，协程Coroutine是最新式的并发编程范式，它是纯编程语言层面的东西，不受制于操作系统。
- [协程的异常处理](/Kotlin/%E5%8D%8F%E7%A8%8B%E7%9A%84%E5%BC%82%E5%B8%B8%E5%A4%84%E7%90%86.html) — 被取消的协程会挂在起点抛出 CancellationException 并且会被协程的机制忽略。 协程构建器有两种形式：自动传播异常（launch：启动不返回值的协程） 或 向用户暴露异常（async 与 produce: 启动协程并期望返回结果）。当构建器用?
- [协程上下文](/Kotlin/%E5%8D%8F%E7%A8%8B%E4%B8%8A%E4%B8%8B%E6%96%87.html) — CoroutineContext 是一个协程的运行环境容器，决定协程的生命周期、运行线程、错误处理机制等核心行为。它由若干个元素组成。
- [协程生命周期](/Kotlin/%E5%8D%8F%E7%A8%8B%E7%94%9F%E5%91%BD%E5%91%A8%E6%9C%9F.html) — 协程中的执行任务由job代表。其能控制协程的生命周期。job可以通过状态来反映协程的执行进程。
- [协程作用域](/Kotlin/%E5%8D%8F%E7%A8%8B%E4%BD%9C%E7%94%A8%E5%9F%9F.html) — 在Android开发中，Kotlin的协程提供了强大的异步编程能力，而不同的协程作用域用于管理协程的生命周期。以下是Android中常用的协程作用域及其区别：
- [协程Job](/Kotlin/%E5%8D%8F%E7%A8%8BJob.html) — Job 是协程的生命周期管理者。每一个协程都有一个关联的 Job, Job 可以用来控制协程的 执行、取消、等待等操作。
- [序列](/Kotlin/%E5%BA%8F%E5%88%97.html) — 在kotlin中， 序列(Sequence) 是一个支持 惰性计算 的集合类型，类似于java的Stream API。序列的主要特点是，它会延迟计算，只在有需要的时候才执行计算，这使得其特别适合处理大型集合或者链式调用中的中间操作。
- [中缀函数](/Kotlin/%E4%B8%AD%E7%BC%80%E5%87%BD%E6%95%B0.html) — 在kotlin中，中缀函数是一种特殊类型的函数，可以使用中缀符号（不需要点符合和圆括号）来调用函数。
- [作用域函数](/Kotlin/%E4%BD%9C%E7%94%A8%E5%9F%9F%E5%87%BD%E6%95%B0.html) — Kotlin中，有一些用于扩展 & 方便开发者编码的内置函数，能大大提高开发者的开发效率, 主要有以下几种：
- [by lazy和lazy](/Kotlin/by%20lazy%E5%92%8Clazy.html) — 委托模式是软件设计模式中的一项基本技巧。在委托模式中，有两个对象参与处理同一个请求，接受请求的对象将请求委托给另一个对象来处理。委托模式是一项基本技巧，许多其他的模式，如状态模式、策略模式、访问者模式本质上是在更特殊的场合采用了委托模式。
- [Channel](/Kotlin/Channel.html) — Channel 是一种热流（Hot Stream） 的通信机制，类似于Go语言中的channel。它允许协程之间进行数据传递和同步。Channel可以被多个生产者和消费者共享，支持双向通信。
- [coroutineContext](/Kotlin/coroutineContext.html) — coroutineContext 是一个 CoroutineContext 类型的对象，它是一个不可变的集合，能够存储和访问协程的多个不同上下文元素。每个元素在协程执行时都有特定的作用，允许你灵活控制协程的行为。
- [Flow](/Kotlin/Flow.html) — kotlin的 Flow 是kotlin协程库的一部分，用于处理异步数据流。类似于RxJava的observable，但是基于Kotlin协程，提供了更简洁的处理异步数据流的方式。
- [kotlin中的挂起函数](/Kotlin/Kotlin%E4%B8%AD%E7%9A%84%E6%8C%82%E8%B5%B7%E5%87%BD%E6%95%B0.html) — 在Kotlin中，可以使用suspend关键字标记函数，以指示它们可以被暂停和恢复。这些函数是长时间运行的函数，可以在协程中使用，是协程生态系统的核心部分。 许多库（如retrofit、room）在其API中使用这些挂起函数从网络或数据库加载数据。
- [Mutex](/Kotlin/Mutex.html) — Mutex 是一个轻量级的同步原语，是kt协程中用于实现互斥锁的工具，它通过确保同一时刻只有一个协程能访问某个资源，避免竟态条件和数据不一致的问题。工作原理类似于传统的线程互斥锁。是协程级别的，不会阻塞线程，而是挂起当前协程直到锁被释放。
- [Object关键字](/Kotlin/Object%E5%85%B3%E9%94%AE%E5%AD%97.html) — object 关键字在 Kotlin 中用于定义单例对象，即只有一个实例的类。它为该实例的全局访问点的创建提供了便利。
- [reified](/Kotlin/reified.html) — 在Kotlin中，reified是一个特殊的关键字，用于修饰内联函数中的类型参数。这使得在函数内部可以访问类型参数的具体类型。通常情况下，由于类型擦除（type erasure），在运行时是无法直接获取泛型类型参数的具体类型的。reified关键字解决了这个问?

## Python

- [numpy的常用方法](/Python/numpy%E7%9A%84%E5%B8%B8%E7%94%A8%E6%96%B9%E6%B3%95.html)

## SQL

- [SQL简介](/SQL/SQL%E5%9F%BA%E7%A1%80/SQL%E7%AE%80%E4%BB%8B.html) — SQL（Structured Query Language）是一种用于管理和操作关系数据库的标准语言，包括数据查询、数据插入、数据更新、数据删除、数据库结构创建和修改等功能。
