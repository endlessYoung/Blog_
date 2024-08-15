# StartActivity之后发生了什么

## 1. 前言

由于Android系统是基于Linux的，原则上说它的应用程序并不只是APK这一种类型，换句话说，所有Linux支持的应用程序都可以通过一定方式运行在Android系统上（比如一些系统级的应用程序）

启动应用程序通常有两种方式：
1. 在Launcher中点击相应的应用程序图标启动
2. 通过startActivity启动

这两种启动方式的流程基本上是一致的，最终都会调用ActivityManagerService的startActivity来完成。

流程图：


