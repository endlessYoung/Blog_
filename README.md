# Endlessyoung 的学习笔记库

个人技术博客，记录 Android 系统开发、Java/Kotlin、AI/ML 等方向的学习笔记。内容以源码分析和实践总结为主，持续整理中。

在线访问：[https://endlessyoung.github.io/Blog_/](https://endlessyoung.github.io/Blog_/)

## 内容

目前共 **330+ 篇文章**，按技术方向分类：

| 方向 | 说明 |
|------|------|
| [Android](https://endlessyoung.github.io/Blog_/Android/Activity) | 四大组件、Framework（AMS/WMS/Binder）、性能优化、Compose，约 160 篇 |
| [AI / 机器学习](https://endlessyoung.github.io/Blog_/Ai/监督学习入门) | 监督学习、神经网络、经典算法推导，约 50 篇 |
| [Kotlin](https://endlessyoung.github.io/Blog_/Kotlin/数据类) | 语法、协程、Flow 等，约 45 篇 |
| [Java](https://endlessyoung.github.io/Blog_/Java/Integer1000与100的比较) | 并发、JVM、集合，约 30 篇 |
| [Agent](https://endlessyoung.github.io/Blog_/Agent/Chunking) | Agent / RAG 相关笔记，约 20 篇 |
| 其他 | Python、JS、C/C++、SQL、Linux、数据结构与算法、Flutter |

## 功能

- **本地全文搜索**：VitePress 内置搜索，中文界面
- **数学公式**：KaTeX 渲染，支持 LaTeX 语法
- **Mermaid 图表**：支持深浅色主题自动适配；点击可放大，滚轮缩放 1–6 倍
- **图片查看器**：文章图片点击放大，支持多图切换和滚轮缩放
- **评论系统**：Waline，部署在 Vercel（[waline-service](./waline-service)）
- **SEO**：sitemap、RSS/feed、IndexNow、Bing/Google 站点验证
- **阅读体验**：深色模式、阅读进度条、滚动位置记忆、相关文章推荐、系列导航

## 技术栈

- [VitePress](https://vitepress.dev)（v2 alpha）+ Vue 3
- [mermaid](https://mermaid.js.org)（图表）
- [markdown-it-katex](https://github.com/waylonflinn/markdown-it-katex)（公式）
- [Waline](https://waline.js.org)（评论）
- GitHub Pages 部署，GitHub Actions 自动构建

## 本地开发

需要 pnpm（项目使用 `packageManager: pnpm@9.0.0`）。

```bash
pnpm install        # 安装依赖
pnpm docs:dev       # 本地开发，端口 5173
pnpm docs:build     # 生产构建
pnpm docs:preview   # 预览构建产物
```

## 部署

推送到 `master` 分支后，GitHub Actions 自动构建并部署到 GitHub Pages。

## 链接

- 博客：[https://endlessyoung.github.io/Blog_/](https://endlessyoung.github.io/Blog_/)
- 仓库：[https://github.com/endlessYoung/Blog_](https://github.com/endlessYoung/Blog_)
- Issues：[https://github.com/endlessYoung/Blog_/issues](https://github.com/endlessYoung/Blog_/issues)