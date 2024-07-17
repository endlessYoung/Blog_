# Fragment

## 1. 什么是Fragment


> Fragment 是 Android 应用程序的一部分，是一个可以嵌入在活动（Activity）中的用户界面或行为的模块化部分。Fragment 使得应用程序能够适应各种屏幕尺寸和设备配置，同时保持代码的模块化和可维护性。

## 2. Fragment的生命周期

Fragment 的生命周期与 Activity 的生命周期紧密相关，但也有自己独特的一些生命周期方法。以下是 Fragment 生命周期的主要方法：

1. `onAttach`(Context context): 当 Fragment 与 Activity 相关联时调用。
2. `onCreate`(Bundle savedInstanceState): Fragment 正在被创建时调用。可以在这里初始化一些非图形资源。
3. `onCreateView`(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState): Fragment 创建其视图层次结构时调用。返回一个 View。
4. `onViewCreated`(View view, Bundle savedInstanceState): 在 onCreateView() 方法返回后立即调用。可以在这里进行视图的进一步初始化，如绑定视图、设置监听器等。
5. `onActivityCreated`(Bundle savedInstanceState): Activity 的 onCreate() 方法已经返回时调用。
6. `onStart`(): Fragment 正在变为可见时调用。
7. `onResume`(): Fragment 正在与用户交互时调用。
8. `onPause`(): 用户离开 Fragment 时调用，但 Fragment 仍然可见（部分遮挡）。
9. `onStop`(): Fragment 不再可见时调用。
10. `onDestroyView`(): Fragment 的视图层次结构正在被移除时调用。
11. `onDestroy`(): Fragment 正在被销毁时调用。可以在这里清理资源。
12. `onDetach`(): Fragment 与 Activity 分离时调用。

## 3. 事务管理机制

Fragment 事务管理机制使得我们可以动态地添加、移除、替换和附加 Fragment。也就是FragmentTransaction

FragmentTransaction的方法：
1. `add`(int containerViewId, Fragment fragment): 将 Fragment 添加到容器中。
2. `replace`(int containerViewId, Fragment fragment): 用新的 Fragment 替换当前容器中的 Fragment。
3. `remove`(Fragment fragment): 从容器中移除 Fragment。
4. `attach`(Fragment fragment): 重新附加先前分离的 Fragment。
5. `detach`(Fragment fragment): 分离 Fragment，但不销毁其状态。
6. `addToBackStack`(String name): 将事务添加到返回栈，以便用户可以通过按下返回键撤消事务。

### 事务示例
::: code-group
``` java
FragmentManager fragmentManager = getSupportFragmentManager();
FragmentTransaction fragmentTransaction = fragmentManager.beginTransaction();

// 创建一个新的 Fragment 实例
MyFragment myFragment = new MyFragment();

// 添加 Fragment 到容器中
fragmentTransaction.add(R.id.fragment_container, myFragment);

// 可选：将事务添加到返回栈
fragmentTransaction.addToBackStack(null);

// 提交事务
fragmentTransaction.commit();

```
:::

### 参数传递示例

::: code-group
``` java
// 创建 Fragment 实例
MyFragment fragment = new MyFragment();

// 创建 Bundle 并添加数据
Bundle args = new Bundle();
args.putString("key", "value");

// 设置参数
fragment.setArguments(args);

// 在 Fragment 中获取参数
@Override
public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    if (getArguments() != null) {
        String value = getArguments().getString("key");
    }
}
```
:::


## 4. 需要注意的事项

1. **Fragment 重建: 系统可能会在配置变化（如屏幕旋转）时销毁并重建 Fragment。确保在 `onSaveInstanceState()` 中保存状态，并在 onCreate() 中恢复状态**。
2. **避免在 `Fragment` 中持有对 `Activity` 的强引用，尤其是在长时间运行的任务中。使用 WeakReference 或在 onDetach() 中清理引用。**
3. **嵌套 `Fragment`: 如果使用嵌套 `Fragment`，确保使用子 FragmentManager（`getChildFragmentManager()`）进行管理。**
4. **生命周期问题: 注意 Fragment 的生命周期方法与 Activity 的生命周期方法的交互。例如，在 onCreateView() 和 onDestroyView() 之间管理视图资源，在 `onAttach()` 和 `onDetach()` 之间管理 Activity 资源。**
5. **应该在 `onViewCreated()` 中初始化视图和设置监听器，可以确保这些操作在视图已经被创建之后进行，从而避免空指针异常（NullPointerException）等问题。**