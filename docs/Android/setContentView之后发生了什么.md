# setContentView之后发生了什么

setContentView 是 Android 开发中用来设置 Activity 显示界面的核心方法，其背后涉及了一系列复杂的步骤来完成界面的加载和渲染。以下是该方法调用后的大致流程，基于 Android 源码的分析：

调用链路:
当你在 Activity 中调用 setContentView(int layoutResID) 时，这个方法首先会调用 getWindow().setContentView(layoutResID)。这里的 getWindow() 返回的是 PhoneWindow 实例，它是 Window 抽象类的一个具体实现，专门用于处理与界面相关的操作。

1. **PhoneWindow 中的 setContentView**:
在 PhoneWindow 类中，setContentView 方法首先会检查是否有已经存在的视图，如果有，则移除旧视图。然后，它会通过 LayoutInflater 去加载指定的布局资源文件 (layoutResID)。LayoutInflater 负责将 XML 布局文件转换成 View 树结构。

2. **LayoutInflater 加载布局**:
LayoutInflater 从资源管理器中读取布局文件，并递归地创建布局中的所有视图对象。这包括解析 XML 中的各种标签，实例化对应的 View 对象，并设置属性。

3. **DecorView 的创建**:
在 PhoneWindow 中，所有的视图都会被包裹在一个特殊的容器 DecorView 中。DecorView 是一个继承自 FrameLayout 的类，它包含了窗口的装饰元素（如标题栏、状态栏等）以及实际的内容视图。setContentView 最终会将你设置的布局添加到 DecorView 的一个特定 ID (android.R.id.content) 下，或者直接替换掉当前的 ContentFrameLayout（它是 DecorView 的一部分，用于容纳实际内容）。

4. **View 的测量、布局与绘制**:
一旦视图树构建完成，系统会执行 measure（测量）、layout（布局）和 draw（绘制）这三个过程。这是 View 的核心生命周期，确保每个视图知道自己的大小、位置，并最终将自己绘制到屏幕上。

5. **WindowManager 的介入**:
PhoneWindow 通过与 WindowManager 交互，最终将 DecorView 添加到屏幕上的一个窗口中。WindowManager 负责管理窗口的大小、位置以及 Z 轴顺序等。

6. **硬件加速与 Surface**:
如果开启了硬件加速，Surface 会被创建并关联到 Window，Canvas 实际上是在这个 Surface 上进行绘制操作，硬件加速能利用 GPU 提升绘制效率。

综上所述，setContentView 调用后，会触发一连串的初始化、布局加载、视图创建、测量布局绘制以及与系统窗口管理器的交互过程，最终实现 Activity 界面的显示。这一系列步骤确保了开发者定义的布局能够正确、高效地呈现在用户面前。