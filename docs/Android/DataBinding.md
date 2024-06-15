# DataBinding

## 1. DataBinding是什么

`DataBinding` 是谷歌官方发布的一个框架，顾名思义即为数据绑定，是 `MVVM` 模式在 Android 上的一种实现，用于降低布局和逻辑的耦合性，使代码逻辑更加清晰。`MVVM` 相对于 `MVP`，其实就是将 `Presenter` 层替换成了 `ViewModel` 层。**DataBinding 能够省去我们一直以来的 findViewById() 步骤，大量减少 Activity 内的代码，数据能够单向或双向绑定到 layout 文件中**，有助于防止内存泄漏，而且能自动进行空检测以避免空指针异常

ActivityMainBinding 是由 Android Data Binding 框架生成的类，用于绑定与 XML 布局文件关联的视图和数据。在 Android 中，Data Binding 允许你以声明性的方式绑定 UI 组件（如 TextView、Button 等）到应用的数据源，例如 ViewModel 或普通的数据对象。

ActivityMainBinding 是根据布局文件 activity_main.xml 自动生成的一个类。这个类包含了用于访问和操作布局中每个视图的实例方法。例如，如果你在布局文件中有一个 TextView 的 id 是 textViewTitle，那么生成的 ActivityMainBinding 类将会包含一个名为 textViewTitle 的属性，通过该属性你可以访问和操作这个 TextView。

如果确实要查看ActivityMainBinding的源码并且还想调试，我们就需要通过另外一种方式：手动编译代码。这两种方式可以通过Android Studio的设置面板修改。

## 2. 为什么配置dataBinding=true后就可以使用了？

> **Android Studio中是依靠gradle来管理项目的，在创建一个项目时，从开始创建一直到创建完毕，整个过程是需要执行很多个    gradle task的，这些task有很多是系统预先帮我们定义好的，比如build task，clean task等，DataBinding相关的task也是系统预先帮我们定义好的。**
> **但是默认情况下，DataBinding相关的task在task列表中是没有的，因为我们没有开启dataBinding，但是一旦我们通过设置dataBinding = true的方式开启DataBinding之后，DataBinding相关的task就会出现在task列表中，每当我们执行编译之类的操作时，就会执行这些dataBinding Task。 这些task的作用就是检查并生成相关dataBinding代码，比如dataBindingExportBuildInfoDebug这个task就是用来导出debug模式下的build信息的。**


## 3. 使用DataBinding的好处

使用 Data Binding 的主要好处包括：

1. 减少样板代码：不再需要在代码中显式地查找和设置视图，而是通过绑定直接访问视图。
2. 提高代码可读性：使用 Data Binding 可以更清晰地表达视图和数据之间的关系，使代码更易于理解和维护。
3. 支持双向绑定：不仅可以将数据绑定到视图，还可以在视图更改时更新数据源

## 4. 使用DataBinding

启用 DataBinding 的方法是在对应 Model 的 build.gradle 文件里加入以下代码，同步后就能引入对 DataBinding 的支持

::: code-group
``` groovy
android {
    buildFeatures {
        viewBinding = true
    }
}
```
:::

启用 DataBinding 后，选中根布局的 `ViewGroup`，按住 Alt + 回车键，点击 “Convert to data binding layout”，就可以生成 DataBinding 需要的布局规则, **dataBinding的本身是对View层状态的一种观察者模式的实现。**

::: code-group
``` java
// 假设 activity_main.xml 中有一个 id 为 textViewTitle 的 TextView
ActivityMainBinding binding = ActivityMainBinding.inflate(getLayoutInflater());
setContentView(binding.getRoot()); // 返回根布局对象

// 设置 TextView 的文本
binding.textViewTitle.setText("Hello, Data Binding!");

```
:::