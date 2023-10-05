# Activity

## 一、什么是Activity

Activity（活动）是Android应用程序中的一个核心组件，它通常用于表示用户界面的一部分。每个`Activity`都代表了一个屏幕或用户界面，用户可以与之交互。Activity负责`管理用户界面的显示`、`用户输入的响应`以及`与其他组件的协作`。

## 二、Activity的主要特点和作用：

1. **用户界面展示**：Activity通常用于展示用户界面，包括各种UI元素，如按钮、文本框、图像等。一个应用程序通常包含多个Activity，用户可以在它们之间进行切换。

2. **生命周期管理**：每个Activity都有自己的生命周期，包括创建、启动、暂停、恢复、停止和销毁等状态。开发者可以在这些状态下执行适当的操作，以便管理资源、保存和恢复状态等。

3. **用户交互**：Activity可以响应用户的交互操作，例如，点击按钮、滑动屏幕、输入文本等。开发者可以通过编写代码来处理用户输入，执行相应的操作。

4. **屏幕导航**：Activity之间可以进行导航和切换。通常，应用程序的不同功能或不同屏幕对应于不同的Activity。用户可以通过点击按钮、导航菜单或其他手势来切换到不同的Activity。

5. **Intent用于通信**：Activity之间可以通过`Intent`对象进行通信。通过Intent，一个Activity可以请求另一个Activity执行特定的操作，也可以传递数据给其他Activity。

6. **多任务处理**：Android系统允许多个Activity同时存在，用户可以在不同的Activity之间进行切换，这使得多任务处理变得容易。

7. **生命周期回调**：Activity提供了一组回调方法，如`onCreate()`、`onRestart()`、`onStart()`、`onResume()`、`onPause()`、`onStop()`和`onDestroy()`等，开发者可以在这些方法中编写自定义代码以响应Activity的生命周期事件。

## 三、Activity的四种基本状态

1. **活动状态（Active/Running）**：
   - 当Activity处于活动状态时，它是用户界面的一部分，并且用户可以与之交互。
   - 进入活动状态通常发生在`onStart()`方法中，然后进一步到达`onResume()`方法。
   - 在活动状态下，Activity可以响应用户的输入、执行各种操作，并显示在屏幕上。

2. **暂停状态（Paused）**：
   - 当另一个Activity部分遮挡当前Activity时，当前Activity进入暂停状态。
   - 进入暂停状态通常发生在`onPause()`方法中。
   - 在暂停状态下，Activity仍然可见，但不能响应用户输入。通常，Activity在这个状态下可以保存必要的数据以备后续恢复。

3. **停止状态（Stopped）**：
   - 当Activity不再可见并被另一个Activity完全覆盖时，它进入停止状态。
   - 进入停止状态通常发生在`onStop()`方法中。
   - 在停止状态下，Activity仍然保留其状态，但不再可见，并且可能会被系统销毁以释放资源。

4. **销毁状态（Destroyed）**：
   - 当Activity被系统销毁或由开发者调用`finish()`方法时，它进入销毁状态。
   - 进入销毁状态通常发生在`onDestroy()`方法中。
   - 在销毁状态下，Activity的实例被彻底销毁，释放其占用的资源。通常，开发者在这个阶段执行一些资源清理操作。

Activity在这些状态之间可以自由转换，取决于用户的操作和系统的管理。例如，当用户切换到另一个Activity时，当前Activity可能进入暂停状态或停止状态，而当用户返回到该Activity时，它可能会重新进入活动状态。


## 三、总结
1. Activity是Android应用程序的重要组件，用于展示用户界面、处理用户输入、管理生命周期和实现不同屏幕之间的导航；
2. 各个Activity之间通过`Intent`进行通信，与用户的交互事件进行导航和切换；
3. Activity有生命周期，`onCreate()`、`onRestart()`、`onStart()`、`onResume()`、`onPause()`、`onStop()`和`onDestroy()`。
4. Activity有四种基本状态，分别是`Active/Running`、`Paused`、`Stopped`、`Destroyed`。