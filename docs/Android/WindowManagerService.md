# WindowManagerService（WMS）

## WMS的功能

从计算机的IO系统角度分析，WMS至少要完成两个功能：
1. 全局的窗口管理（output）窗口管理属于输出的部分，应用程序的显示请求在SurfaceFlinger和WMS的协助下有序地输出给物理屏幕或者其他显示设备。
2. 全局的事件管理派发（input）事件派发属于WMS的输入功能。这同时也是WMS区别于SurfaceFlinger的一个重要因素，因为后者只做有关于显示的事情，而WMS则还要兼顾到对输入事件的派发。WMS的事件源包括但不限于：键盘、屏幕触控与点按事件等等。