# Fragment找不到id对应view

## 场景还原

在使用 viewbinding 生成页面布局时发现id为btn的自定义view发生crash报错，报错信息：

> java.lang.NullPointerException: Missing required view with ID...

该报错发生的位置为 fragment 的 `onCreateView` 生命周期中。具体为在inflate方法中。由于项目中使用的是viewbinding，因此该行代码为：

::: code-group
``` kotlin
override fun onCreateView(
    inflater: LayoutInflater, container: ViewGroup?,
    savedInstanceState: Bundle?
): View? {
    _binding = FragmentMainBinding.inflate(inflater, container, false)
    val view = binding.root
    return view
}
```
:::

## 原因与解决方案

`viewbinding` 会给当前的fragment布局文件封装一层对应的viewbinding类并通过布局文件的id来生成内部对象供开发者引用。
在查找id对应的view时，该自定义view的对象已经准备好了，但是id为空，虽然节点也已经添加到了rootview中。但是找不到对应的view，造成了空指针。

**发现在自定义view的时候继承的view没有使用带有Attributes类型的构造方法。造成id没有绑定到view上。继承时构造方法添加一个参数即可解决crash。**



