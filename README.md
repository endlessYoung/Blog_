<p align="center"><sub>源码 · 原理 · 交互图解</sub></p>

<h1 align="center">ENDLESSYOUNG / MANUAL</h1>

<p align="center">Android、Java 与 AI 的学习笔记，一本持续更新的技术手册。</p>

<p align="center"><em>这世界太大，勇敢的少年奔赴天涯。</em></p>

<p align="center">
  <a href="https://endlessyoung.top/">阅读手册</a> ·
  <a href="https://endlessyoung.top/archives.html">全部文章</a> ·
  <a href="https://endlessyoung.top/tags/">标签索引</a> ·
  <a href="https://endlessyoung.top/feed.xml">RSS</a>
</p>

<p align="center">
  <a href="https://github.com/endlessYoung/Blog_/actions/workflows/deploy.yml">
    <img src="https://github.com/endlessYoung/Blog_/actions/workflows/deploy.yml/badge.svg" alt="站点构建与部署状态">
  </a>
</p>

<p align="center">
  <a href="https://endlessyoung.top/">
    <img src=".github/readme/home.png" alt="手册首页：网格排版、章节目录与文章预览" width="100%">
  </a>
</p>

## 从一个具体问题开始

这里记录读源码、做实验和解决问题时留下的笔记：一条消息怎样被处理，一个对象何时被回收，一次重复请求如何被合并。文章沿着调用过程、数据结构和状态变化展开，部分主题配有交互图解，可以边读边操作。

- **[Handler](https://endlessyoung.top/Android/Handler.html)** — 跟着消息在队列中流转，看 Looper 如何取出并分发消息。
- **[RecyclerView 四级缓存](https://endlessyoung.top/Android/RecyclerView四级缓存.html)** — 追踪同一个 ViewHolder，理解四级缓存的查找顺序。
- **[CAS](https://endlessyoung.top/Java/CAS.html)** — 观察两个线程竞争同一个变量时，比较与交换如何决定结果。
- **[从重复请求到 SingleFlight](https://endlessyoung.top/Android/从重复请求到SingleFlight.html)** — 通过 Feed 实验室理解请求合并，以及数据库订阅与网络请求各自负责什么。
- **[Embedding](https://endlessyoung.top/Agent/Embedding.html)** — 从向量表示出发，理解模型如何把语义关系映射到距离。

## 按主题阅读

- **移动开发**：Android 组件、Framework、Jetpack Compose、协程、缓存与性能实践。
- **编程语言**：Java 并发与 JVM、Kotlin 语法与 Flow、Python 与 NumPy、C++ 基础。
- **AI 与智能体**：机器学习算法、向量表示、文档切分与 Agent 工程笔记。
- **数据与系统**：数据结构、排序、二分查找及 SQL 等基础主题。

[全部文章目录](https://endlessyoung.top/archives.html)按分类列出正文，[标签索引](https://endlessyoung.top/tags/)用于查找跨分类的相关内容。

<p align="center">
  <img src=".github/readme/catalog.png" alt="章节目录展开后的文章列表与悬停预览" width="48%">
  &nbsp;
  <img src=".github/readme/article.png" alt="文章阅读页：正文、文章元数据与章节导航" width="48%">
</p>

## 为阅读做的设计

- **手册式编排**：用章节编号、网格和清晰的字号层级组织内容，目录与正文保留阅读位置，方便来回查阅。
- **交互图解**：在消息循环、GC、CAS、排序与缓存等主题中，把执行过程放进文章，让状态变化可见。
- **随时检索**：按 `/` 或 `Ctrl / ⌘ + K` 打开本地搜索，可查找文章标题与正文中的小节。
- **连续阅读**：章节导航、相关阅读、标签和 RSS 提供不同的阅读路径；支持明暗切换、强调色切换与图片放大。

站点基于 **VitePress 2 + Vue 3 + TypeScript** 构建，自定义阅读界面使用 GSAP 编排动效，MiniSearch 提供本地搜索，KaTeX 与 Mermaid 负责公式和图表。文章以 Markdown 保存，构建为静态站点并部署到 GitHub Pages。

## 本地运行

使用 Node.js 22 与 pnpm 9。在仓库根目录执行：

```bash
pnpm install --frozen-lockfile
pnpm docs:dev
```

开发地址为 `http://localhost:5173/`。构建和预览：

```bash
pnpm docs:build
pnpm docs:preview
```

生产构建会生成文章目录、标签页、RSS 和 sitemap，并检查首页资源约束、内部链接、索引标记与 canonical 是否一致。也可以在构建后单独运行 `pnpm docs:seo` 检查已有产物。

## 内容与代码

```text
docs/
├── Android/ · Kotlin/ · Flutter/    移动开发
├── Java/ · Python/ · C++/          编程语言
├── Ai/ · Agent/                   AI 与智能体
├── 数据结构和算法/ · SQL/           数据与算法
├── public/                        站点静态资源
└── .vitepress/                    站点配置、自定义主题与交互组件
scripts/                           目录生成与构建检查
.github/workflows/                 自动构建与发布
```

新增文章放入对应分类目录，在 frontmatter 中填写 `title`、`description`、`categories`、`tags` 和 `created`。首页章节与侧边导航维护在 `docs/.vitepress/config.mts`；文章总目录和标签页由构建脚本生成。未完成的占位笔记使用 `noindex: true`，完成正文后再开放索引。
