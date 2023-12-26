# 实践-Widget

## 1. 什么是widget

widget就是安卓的桌面小组件，可以方便快捷的使用app提供的部分功能。

## 2.开发一个widget的步骤

AppWidget 是通过**BroadcastReceiver**进行控制的。开发AppWidget需要继承**AppWidgetProvider**类，该类继承自BroadcastReceiver。
1. 创建一个**RemoteViews**对象，这个对象加载时指定了桌面小部件的界面布局文件。
2. 设置**RemoteViews**创建时加载的布局文件中各个元素的属性。
3. 创建一个**ComponentName**对象。
4. 调用**AppWidgetManager**更新桌面小部件。


## 3.示例



