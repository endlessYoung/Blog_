# Handler、MessageQueue和Looper

## 1. 前言

Looper不断获取MessageQueue中的一个Message，然后交给Handler来处理。

## 2. Handler和Thread的关系

1. 每个Thread只对应一个Looper
2. 每个Looper只对应一个MessageQueue
3. 每个MessageQueue中有N个Message
4. 每个Message中最多指定一个Handler来处理事件

由此可知，Thread和Handler是一对多的关系。

Handler有两个方面的作用：
1. **处理Message，这是它作为处理者的职责所在**
2. **将某个Message压入MessageQueue中**

`Looper` 从 `MessageQueue` 中取出一个Message后，首先会调用**Handler.dispatchMessage**进行消息派发; 后者根据具体的策略将Message分发给相应的负责人。默认情况下Handler的派发流程是：

1. Message.callback(Runnable 对象)是否为空：
在不为空的情况下，将优先通过callback来处理。
2. Handler.mCallback是否为空：
在不为空的情况下，调用mCallback.handleMessage
3. 如果前两个对象都不存在，调用Handler.handleMessage。

由此可见，Handler的扩展子类可以通过重载dispatchMessage或者handleMessage来改变它的默认行为。

## 3. Handler的Post和Send处理函数

Post和Send两个系列的共同点是它们都负责将某个消息压入MessageQueue中；区别在于：
1. Send处理的函数参数直接就是Message，而Post需要先把其他类型的零散信息转换成Message，准备好Message后，程序调用SendMessageDelay来执行下一步。

虽然最终仍然是Handler来处理事件，但是Handler又大费周章将Message压入MessageQueue中，然后再处理。没有采用直接执行。这种做法看起来像是多此一举，但是实际上体现了程序设计的一个良好的习惯，即有序性。

举个例子就是当你现在正在跑步，有人找你借钱。如果你立马下来就借朋友钱显然违法了正常的事情处理逻辑。正常的逻辑应该是告诉朋友等跑不完再借钱或者让秘书来写入你的待办。这就和Handler的处理流程有些相近了。


## 4. MessageQueue

是一个消息队列，具有队列的常规操作：新建队列、元素入队、元素出队、删除元素、销毁队列等。

## 5. Looper

**这里还需要展开写，先简要写一点**

1. Looper的准备：prepare。
2. 创建处理消息的handler
3. Looper开始运作: loop。

Looper类似于发动机，正是由于它的推动，Handler甚至整个程序才活了起来，不断处理新的消息

使用Looper包含两种情况：

1. 主线程：ActivityThread
2. 普通线程

Looper内有一个非常重要的成员变量：

::: code-group
``` java
static final ThreadLocal<Looper> sThreadLocal = new ThreadLocal<Looper>();
```
:::


这是一个静态类型的变量，一旦import到了Looper后，sThreadLocal就已经存在并构建完毕了。ThreadLocal对象是一中特殊的全局变量，因为它的全局性只局限于自己所在的线程，而外界所有线程（即便是同一进程）一概无法访问到它。这从侧面说明，每个线程的Looper都是独立的。

Looper中的这些static操作有点像银行的普通业务服务窗口，它并不指定任何特定的客户，但是去办理业务的人却又是完全可以区分开来的。因为大家手头都会持有反映自己身份的各种证件和申请表格——sThreadLocal。

因而sThreadLocal肯定会创建一个只针对于当前线程的Looper及其他相关数据对象，而整个操作很可能是在prepare中。

mHandler是LooperThread的成员变量，并通过new操作创建了一个Handler实例。而后就开始Looper.loop()进入到了主循环。