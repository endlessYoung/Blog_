# Activity中viewtree的创建过程

Activity与其他组件最大的不同，就是其内部拥有完整的界面显示机制，这涉及了ViewRootImpl, Window以及由他们管理的View Tree等。

参与View Tree创建的有几个主体，就是ActivityThread、Activity、PhoneWindow、ViewRootImpl和WM（先不严格区分是本地的WindowManager还是服务端的WindowManagerService）。

主要流程：
1. 作为应用程序的主线程，ActivityThread负责处理各种核心事件。比如 "AMS通知应用进程去启动一个 "Activity" 这个任务，最终将转化为ActivityThread所管理的LAUNCH_ACTIVITY消息，然后调用handleLaunchActivity，这是整个ViewTree建立流程的起点。
2. 在handleLaunchActivtiy内部，又可以细分为两个子过程：
   1. performLaunchActivity；
   2. handleResumeActivity（注意，Resume的处理时机有多种情况，我们以此为例）
    ::: code-group
    ``` java
    // frameworks/base/core/java/android/app/ActivityThread.java
    private void handleLaunchActivity(ActivityClientRecord r, Intent customIntent){
        // ...
        Activity a = performLaunchActivity(r, customIntent); // 启动，加载Activity
        if (a != null){
            handleResumeActivity(r.token, false, r.isForward); // Resume这个Activity
            // ...
        }
    }

    // ...
    // performLaunchActivity源码
    ```
    :::

这个函数的主要任务是生成一个Acitvity对象，并调用它的attach方法，然后通过Instrumentation.callActivityOnCreate间接调用Acitvity.onCreate()。其中attach将为Acitvity内部众多全局变量复制-最重要的就是mWindow。

mWindow = PolicyManager.makeNewWindow(this);

这里得到的就是一个PhoneWindow对象，它在每个Activity中有且仅有一个实例。Window在Activity中可以看成"界面的框架抽象"，所以有了Window后，下一步肯定还要生成具体的View内容，即Acitvity中的mDecor。mDecor的原义是装饰，换句话说，他除了包含Activity中实际想要显示的内容外，还必须具备所有应用程序共同的装饰部分。如title，actionbar等。
产生DecorView的过程是由setContentView发起的，这也就是开发者需要在onCreate时调用这个函数的原因。而onCreate本身则是由mInstrumentation.callActivtiyOnCreate(activity, r.state)间接调用的。

Activity中的setContentView本身只是一个中介，它将通过对应的Window对象来完成DecorView的构造：

此处是源码

变量mContentParent是一个ViewGroup对象，它用于容纳contentView，当mContentParent为空时，说明是第一次调用setContentView。此时mDecor也必定是空。因而调用installDecor创建一个DecorView；否则先清理mContentParent中已有的所有View对象，最后通过layoutResID来inflate新的内容（mContentParent就是这个由layoutResID生成的View树的根）。所以，setContentView是可以多次调用的，只不过一般不会这样做。

函数installDecor有两个任务，即生成mDecor和mContentParent。

此处是源码

函数generateDecor实际上只是new一个DecorView对象，而返回值则赋予mDecor。DecorView继承自FrameLayout（在后面会说明原因）

变量mContentParent的创建过程与mDecor有关联，
此处是源码

可以看到，mContentParent是通过generateLayout函数生成的。

此处是源码

上面的代码分为三个步骤：
1. 取出Window样式，如windowIsFloating、windowNoTitle、WindowFullScreen等。这是通过分析styleable.window获得的
mWindowStyle = mContext.ontainStyledAttributes(com.android.internal.R.styleable.Window);
2. 根据上一步得出的样式来挑选符合要求的layout资源，并由layoutResource来表示。
比如：(feature & ((1 << FEATURE_LEFT_ICON) | (1 << FEATURE_RIGHT_ICON)) != 0);

可以得知应用程序的UI界面是否需要左右两个icon——满足这一要求的layout也有两种，我们还需要根据mIsFloating进一步决定是com.android.internal.R.attr.dialogTitleIconsDecorLayout或者com.android.internal.R.layout.screen_title_icons。系统frameWork提供的这些默认layout文件统一存放在frameworks/base/core/res/res/layout中。

根据layoutResource指定的layout文件，来inflate出相应的View对象。然后把这一个新对象addView到mDecor中；最后，整个generateLayout函数的返回值是一个id为ID_ANDORID_CONTENT = com.android.internal.R.id.content的对象，即mContentParent。

由此可知，setContentView实际上做的工作就是把应用程序想要显示的视图加上系统策略中的其他元素（比如Title、ActionBar），合成出用户所看到的最终应用程序的界面。但是setContentView并不负责将这一视图真正显示出来，只是显示content区域。

通过perfomelaunchAcivity，Acitvity内部已经完成了Window和DecorView的创建过程。可以说整颗ViewTree实际上已经生成了，只不过外界还不知道，换句话说，无论是WMS还hi是SurfaceFlinger，都不知道它的存在，所以接下来还需要把它添加到本地的WindowManagerGlobal中，在WindowManagerGlobal中有3个数组mViews，mRoots和mParams，继而注册到WMS中。这就涉及到ViewRootImpl的相关操作

此处是源码

可以看到，变量wm声明的类型是ViewManager。这是因为WindowManager继承自ViewManager，而getWindowManager真正返回的是一个WindowManagerImpl对象。后者的addView又间接调用了WindowManagerGlobal中的实现

此处是源码

如果上面代码段中的index小于0，表示之前从未添加所此View对象，因而程序可以继续执行；否则说明调用者多次添加了同一个view对象，直接返回。

接下来addView需要添加一个新的ViewRootImpl到WidnowManagerGlobal的mRoot数组中。由于事先不知道一个应用程序中会有多少个ViewRoot存在，WindowManagerGlobal采用的是动态存储。

mView记录的是DecorView，mParams记录的是布局属性。这三个数组中的元素的一一对应的，即同一个index在3个数组中得到的元素描述的是同一个Activity中的View树、ViewRoot和布局属性。

最后，函数通过root.setView把DecorView同步记录到ViewRootImpl内部的mView变量中，因为后面ViewRootImpl将会频繁访问到ViewTree，比如当收到某个按键事件或者触摸事件时，需要把它传递给后者进行处理。


