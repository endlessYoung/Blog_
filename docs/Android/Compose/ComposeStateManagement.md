# Jetpack Compose 状态管理详解

在 Jetpack Compose 中，**状态 (State)** 是驱动 UI 更新的核心。与传统的 View 体系不同，Compose 是声明式的：UI 是状态的函数。当应用的状态发生变化时，Compose 会重新执行受影响的 Composable 函数（这个过程称为 **重组 (Recomposition)**），从而更新 UI。

掌握状态管理是成为 Compose 高级开发者的必经之路。本文将深入探讨 Compose 状态管理的各个方面。

## 1. 什么是状态 (State)？

简单来说，状态就是随时间变化的数据。在 Compose 中，当状态发生变化时，UI 会自动刷新。

### `MutableState<T>`

Compose 使用 `MutableState<T>` 来存储可变状态。它是 Compose 运行时集成的观察者模式实现。

```kotlin
interface MutableState<T> : State<T> {
    override var value: T
}
```

当 `value` 发生变化时，读取该 `value` 的 Composable 函数会自动进行重组。

### `remember`

Composable 函数可能会被频繁调用（重组）。如果在函数内部直接定义变量，每次重组时变量都会被重置。为了在重组之间保存状态，我们需要使用 `remember`。

```kotlin
@Composable
fun Counter() {
    // 使用 remember 保存状态，防止重组时重置
    // mutableStateOf 创建一个可观察的状态
    var count by remember { mutableStateOf(0) }

    Button(onClick = { count++ }) {
        Text("Count: $count")
    }
}
```

*   `mutableStateOf(v)`: 创建一个初始值为 `v` 的 `MutableState`。
*   `remember { ... }`: 在内存中缓存计算结果，直到 Composable 离开组合树。

## 2. 状态提升 (State Hoisting)

**状态提升** 是一种设计模式，通过将状态移动到调用者（父组件）中，使子组件变为 **无状态 (Stateless)** 的。

### 为什么要状态提升？

1.  **单一数据源 (Single Source of Truth)**：状态只在一个地方管理，减少 bug。
2.  **可复用性**：无状态组件更容易复用和测试。
3.  **解耦**：UI 逻辑与业务逻辑分离。

### 如何做？

通常将状态变量替换为两个参数：
1.  **value: T**：当前显示的值。
2.  **onValueChange: (T) -> Unit**：请求修改值的事件回调。

```kotlin
// 有状态组件 (Stateful) - 内部管理状态，难以复用
@Composable
fun StatefulCounter() {
    var count by remember { mutableStateOf(0) }
    StatelessCounter(count = count, onIncrement = { count++ })
}

// 无状态组件 (Stateless) - 纯 UI 展示，易于复用和测试
@Composable
fun StatelessCounter(
    count: Int, 
    onIncrement: () -> Unit
) {
    Button(onClick = onIncrement) {
        Text("Count: $count")
    }
}
```

## 3. `remember` vs `rememberSaveable`

`remember` 可以跨重组保存状态，但如果发生 **配置变更**（如屏幕旋转、深色模式切换）或进程被系统回收，`remember` 中的状态会丢失。

如果你希望状态在这些情况下依然保留，应使用 `rememberSaveable`。它会将状态保存到 `Bundle` 中。

```kotlin
@Composable
fun SurvivingCounter() {
    // 屏幕旋转后 count 值依然保留
    var count by rememberSaveable { mutableStateOf(0) }

    Button(onClick = { count++ }) {
        Text("Count: $count")
    }
}
```

对于自定义对象，你需要提供 `Saver` 来告诉 Compose 如何序列化和反序列化该对象。

## 4. 状态持有者 (State Holders) 与 ViewModel

对于简单的 UI 逻辑，可以使用 `remember` 管理状态。但随着逻辑变复杂，应将状态管理逻辑提取到 **状态持有者** 类或 **ViewModel** 中。

### 使用 ViewModel 管理状态

ViewModel 是管理屏幕级 UI 状态的首选方案，它能感知生命周期并在配置变更后存活。

推荐在 ViewModel 中暴露 `StateFlow` 或 `LiveData`，并在 Compose 中将其转换为 `State`。

```kotlin
class MyViewModel : ViewModel() {
    private val _uiState = MutableStateFlow(MyUiState())
    val uiState: StateFlow<MyUiState> = _uiState.asStateFlow()

    fun updateName(newName: String) {
        _uiState.update { it.copy(name = newName) }
    }
}

data class MyUiState(
    val name: String = "",
    val isLoading: Boolean = false
)
```

在 Composable 中使用：

```kotlin
@Composable
fun MyScreen(viewModel: MyViewModel = viewModel()) {
    // collectAsStateWithLifecycle 需要依赖 androidx.lifecycle:lifecycle-runtime-compose
    // 它是生命周期感知的，比 collectAsState 更安全（应用后台时停止收集）
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()

    TextField(
        value = uiState.name,
        onValueChange = { viewModel.updateName(it) }
    )
}
```

## 5. 高级状态 API

### `derivedStateOf`

如果一个状态是从另一个状态计算得来的，并且计算代价较大，或者你希望减少不必要的重组，可以使用 `derivedStateOf`。

它会将多个状态转换为一个状态，并且只有当 **计算结果发生变化** 时，才会触发读取该状态的 Composable 重组。

```kotlin
val listState = rememberLazyListState()

// 只有当 showButton 的值从 true 变 false 或反之时，才会触发重组
// 如果直接使用 listState.firstVisibleItemIndex > 0，每次滚动都会触发重组
val showButton by remember {
    derivedStateOf {
        listState.firstVisibleItemIndex > 0
    }
}
```

### `SideEffect` 与副作用 API

状态改变通常会触发 UI 更新，但有时我们需要在状态改变时执行非 UI 操作（副作用），如打日志、启动协程、显示 Toast 等。

*   **`LaunchedEffect(key)`**: 当 `key` 变化时，启动一个协程。适合执行挂起函数（如网络请求、动画）。
*   **`DisposableEffect(key)`**: 当 `key` 变化或组件销毁时，执行清理操作（如注册/注销监听器）。
*   **`SideEffect`**: 每次重组成功后执行。适合将 Compose 状态同步到非 Compose 代码系统。

```kotlin
// 示例：当 snackbarHostState 变化时显示 Snackbar
LaunchedEffect(snackbarHostState) {
    snackbarHostState.showSnackbar("Hello Compose")
}
```

## 6. CompositionLocal

通常状态通过参数层层向下传递。但对于一些全局数据（如主题颜色、Context、登录用户信息），层层传递非常繁琐。

`CompositionLocal` 允许我们隐式地在组合树中传递数据。

```kotlin
// 定义一个 CompositionLocal
val LocalActiveUser = compositionLocalOf<User> { error("No user found!") }

@Composable
fun App() {
    val user = User("Alice")
    // 提供值
    CompositionLocalProvider(LocalActiveUser provides user) {
        Descendant()
    }
}

@Composable
fun Descendant() {
    // 读取值，无需通过参数传递
    val user = LocalActiveUser.current
    Text("User: ${user.name}")
}
```

**注意**：不要滥用 `CompositionLocal`，它会使数据流向变得不透明。只用于确实是“隐式环境”的数据。

## 总结

1.  **单一数据源**：尽量将状态提升到父组件或 ViewModel。
2.  **`remember` vs `ViewModel`**：UI 逻辑用 `remember`，业务逻辑用 ViewModel。
3.  **不可变性**：状态对象最好是不可变的（Immutable），修改状态时创建新对象（如 `data class` 的 `copy`）。
4.  **生命周期感知**：使用 `collectAsStateWithLifecycle` 收集 Flow。
