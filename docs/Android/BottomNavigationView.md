# BottomNavigationView

## 1. 什么是BottomNavigationView

`BottomNavigationView` 是 Android 提供的用于底部导航栏的 UI 组件，通常用于在应用中快速切换主要功能模块或页面。它提供了一种简单而直观的方式来导航到不同的目标界面。让我们深入了解 `BottomNavigationView` 的属性、方法和使用注意事项。

## 2. 属性和方法

1. **menu**：

作用：指定底部导航栏的菜单资源文件。

::: code-group
``` xml
<com.google.android.material.bottomnavigation.BottomNavigationView
    android:id="@+id/bottom_navigation"
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    app:menu="@menu/bottom_navigation_menu" />
```
:::

2. **itemIconTint 和 itemTextColor**: 指定导航项图标和文本的颜色。
3. **labelVisibilityMode**: 控制导航项文本的可见性, 可选值包括：
    - `labeled`：始终显示文本标签。
    - `unlabeled`：始终隐藏文本标签。
    - `selected`：仅在选中时显示文本标签。
    - `auto`：根据空间自动显示或隐藏文本标签。
4. **selectedItemId 和 setOnNavigationItemSelectedListener**：设置和监听选中项的变化。


::: code-group
``` java
bottomNavigationView.setSelectedItemId(R.id.menu_item_home);
bottomNavigationView.setOnNavigationItemSelectedListener(item -> {
    // 处理选中项变化的逻辑
    return true; // 返回 true 表示处理了事件
});

```
:::

## 3. 具体使用方法

::: code-group
``` kotlin
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        val navView: BottomNavigationView = binding.navView

        val navController = findNavController(R.id.nav_host_fragment_activity_main)
        // Passing each menu ID as a set of Ids because each
        // menu should be considered as top level destinations.
        val appBarConfiguration = AppBarConfiguration(
            setOf(
                R.id.navigation_home, R.id.navigation_dashboard, R.id.navigation_notifications
            )
        )
        setupActionBarWithNavController(navController, appBarConfiguration)
        navView.setupWithNavController(navController)
    }

    /**
    * 使用 NavController 进行导航控制，包括处理后退行为和更新应用栏标题。
    * 使用 AppBarConfiguration 配置顶级目的地，以确定哪些目的地会显示后退按钮。
    * 将 NavController 与 NavigationView 或 BottomNavigationView 关联，以便在导航项切换时更新界面和执行导航操作。
    */
```
:::