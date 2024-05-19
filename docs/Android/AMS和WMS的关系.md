# AMS和WMS的关系

AMS（Activity Manager Service）和WMS（Window Manager Service）是Android系统中两个核心的服务组件，它们共同协作以管理应用程序的界面显示和生命周期。AMS 和 WMS 的交互主要通过 Binder 机制实现，这允许它们在不同的进程中运：

1. **职责划分**：

AMS（Activity Manager Service）：负责管理应用程序组件（如Activity、Service、Broadcast Receiver和Content Provider）的整个生命周期。它处理诸如启动、停止、恢复和销毁Activity等任务，并维护Activity栈来管理它们的前后关系。此外，AMS还负责进程管理和调度，根据系统资源状况来决定何时创建、销毁或回收进程。

WMS（Window Manager Service）：专注于管理屏幕上的窗口，包括窗口的大小、位置、Z轴顺序（即堆叠顺序）以及窗口的可见性。WMS负责绘制和布局窗口，处理触摸事件的分配，并确保窗口符合系统视觉规范，如状态栏和导航栏的交互规则。

2. **协同工作**：

当AMS启动一个新的Activity时，它会通知WMS创建一个新的窗口来承载该Activity的界面。AMS和WMS通过Binder接口通信，确保Activity的UI能正确地在屏幕上显示。

WMS在决定窗口如何布局和显示时，会参考AMS维护的Activity栈信息，以确保前台Activity的窗口获得焦点和用户输入。

- **AMS 向 WMS 请求窗口布局更新**：
::: code-group
``` java
// 在 ActivityManagerService.java 中
public class ActivityManagerService extends IActivityManager.Stub {
    // ...
    
    WindowManagerService mWindowManager;

    // 构造函数
    public ActivityManagerService(Context systemContext) {
        // 初始化 WindowManagerService
        mWindowManager = WindowManagerService.main(systemContext, this);
    }

    // 启动 Activity
    public int startActivity(IApplicationThread caller, String callingPackage, Intent intent,
            String resolvedType, IBinder resultTo, String resultWho, int requestCode,
            int flags, ProfilerInfo profilerInfo, Bundle options) {
        // ...

        // 请求 WindowManagerService 更新窗口布局
        mWindowManager.requestLayout();
        
        // ...
    }
    
    // ...
}

```
:::


- **WMS 更新窗口布局**：
::: code-group
``` java
// 在 WindowManagerService.java 中
public class WindowManagerService extends IWindowManager.Stub {
    // ...
    
    ActivityManagerService mActivityManager;

    // 构造函数
    static WindowManagerService main(Context context, ActivityManagerService activityManager) {
        // ...
        return new WindowManagerService(context, activityManager);
    }

    // 构造函数
    WindowManagerService(Context context, ActivityManagerService activityManager) {
        // ...
        mActivityManager = activityManager;
    }

    // 请求布局更新
    public void requestLayout() {
        // 更新窗口布局的逻辑
        // ...
        
        // 通知 ActivityManagerService 窗口布局已更新
        mActivityManager.onWindowLayoutUpdated();
    }
    
    // ...
}
```
:::

3. **生命周期互动**：

Activity的生命周期变化（如从后台到前台）会影响到其对应的窗口状态，这些变化由AMS驱动，并通过AMS与WMS的交互来实现窗口的显示和隐藏。

4. **资源管理**：

在系统资源紧张时，AMS可能会结束一些后台Activity所在的进程来释放资源，而WMS则需要相应地处理窗口的移除，确保用户体验的连续性。