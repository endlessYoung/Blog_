# Fragment转场动画


## 1. 实现方法一：setCustomAnimations

使用 `FragmentTransaction` 的 `setCustomAnimations()` 方法可以实现自定义转场动画,提交带有动画效果的 Fragment 事务。

### 1. 定义动画资源

创建四个动画资源文件，分别表示进入、退出、返回进入和返回退出动画

1. `res/anim/slide_in_right.xml`

::: code-group
``` xml
<set xmlns:android="http://schemas.android.com/apk/res/android">
    <translate
        android:duration="300"
        android:fromXDelta="100%p"
        android:toXDelta="0%p"/>
</set>
```
:::

2. `res/anim/slide_out_left.xml`

::: code-group
``` xml
<set xmlns:android="http://schemas.android.com/apk/res/android">
    <translate
        android:duration="300"
        android:fromXDelta="0%p"
        android:toXDelta="-100%p"/>
</set>
```
:::

3. `res/anim/slide_in_left.xml`

::: code-group
``` xml
<set xmlns:android="http://schemas.android.com/apk/res/android">
    <translate
        android:duration="300"
        android:fromXDelta="-100%p"
        android:toXDelta="0%p"/>
</set>
```
:::

4. `res/anim/slide_out_right.xml`

::: code-group
``` xml
<set xmlns:android="http://schemas.android.com/apk/res/android">
    <translate
        android:duration="300"
        android:fromXDelta="0%p"
        android:toXDelta="100%p"/>
</set>
```
:::

### 2. 设置动画并提交事务

::: code-group
``` java
FragmentManager fragmentManager = getSupportFragmentManager();
FragmentTransaction fragmentTransaction = fragmentManager.beginTransaction();

// 设置自定义动画
fragmentTransaction.setCustomAnimations(
    R.anim.slide_in_right,  // enter
    R.anim.slide_out_left,  // exit
    R.anim.slide_in_left,   // popEnter
    R.anim.slide_out_right  // popExit
);

// 添加或替换 Fragment
MyFragment newFragment = new MyFragment();
fragmentTransaction.replace(R.id.fragment_container, newFragment);

// 可选：将事务添加到返回栈
fragmentTransaction.addToBackStack(null);

// 提交事务
fragmentTransaction.commit();
```
:::

## 2. 另一种实现方法: Transition API

使用 `Transition API` 实现复杂动画
对于更复杂的动画效果，可以使用 Android 的 Transition API。以下是一个简单示例，使用 Fragment 的 setEnterTransition 和 setExitTransition 方法设置动画：

::: code-group
``` java
// 在 Fragment 中设置进入和退出动画
@Override
public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    // 创建 Transition 对象
    Transition slide = new Slide(Gravity.END);
    slide.setDuration(300);

    // 设置进入和退出动画
    setEnterTransition(slide);
    setExitTransition(slide);
}
```
:::