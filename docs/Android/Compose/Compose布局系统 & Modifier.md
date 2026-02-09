# Compose布局系统与 Modifier

> 文档级 · 教学级 · 指南级

---

## 0. 本文档的定位与阅读方式

**目标读者**：

* 有多年 Android / View / XML 经验的工程师
* 已掌握 Compose 的基础 State 管理（remember / mutableStateOf / State Hoisting 的概念）

**本文目标**：

* 建立 *Compose 布局系统的完整心智模型*
* 从"能写 UI"升级到"**知道为什么这样写**"
* 能在工程中 **预判布局结果、性能与边界行为**

本文不是 API 罗列，而是 **规则 → 机制 → 结论**。

---

## 1. Compose 布局系统的根本模型

### 1.1 布局的三阶段模型（不可跳过）

每一个 Composable 节点都会经历三个阶段：

1. **Constraints（约束）**：父节点向子节点下发
2. **Measure（测量）**：子节点在约束内决定自身尺寸
3. **Placement（放置）**：父节点决定子节点在自身坐标系中的位置

这三阶段是 Compose 布局系统的**物理定律**。

> 任何你觉得"奇怪"的布局结果，都能回溯到这三步。

---

### 1.2 Constraints 的本质

Constraints 由四个值组成：

* minWidth
* maxWidth
* minHeight
* maxHeight

它们描述的是：

> **子节点允许使用的尺寸范围**

重要结论：

* 子节点 **不能突破 max**
* 子节点 **不能小于 min**
* 子节点只能在区间内选择

---

### 1.3 与 View 系统的本质差异

| View 系统                   | Compose                |
|-----------------------------|------------------------|
| LayoutParams                | Constraints            |
| 子 View 决定自己大小        | 父限定，子选择          |
| match_parent / wrap_content | fill / 固定 / 约束协商 |
| measure/layout 强耦合       | 函数式、可组合          |

**关键转变**：

> 在 Compose 中，**父掌控一切尺寸边界**。

---

## 2. 基础布局容器的测量与放置规则

### 2.1 Column 的完整规则

Column 的核心行为：**纵向堆叠**。

测量流程：

1. 父向 Column 下发约束
2. Column 将 *相同的横向约束* 下发给每个子项
3. 子项逐个测量，高度累加
4. Column 高度 = 子项高度总和（受父约束限制）

重要结论：

* Column 不会"压缩"子项高度
* Column 的宽度由父约束决定

---

### 2.2 Row 的完整规则

Row 的核心行为：**横向排布**。

测量流程：

1. 父向 Row 下发约束
2. Row 先测量 *非 weight* 子项
3. 计算剩余宽度
4. 将剩余宽度按 weight 比例分配给 weight 子项

结论：

* weight 是 **后处理规则**
* weight 不参与 wrap_content

---

### 2.3 Box 的完整规则

Box 的核心行为：**叠加**。

测量流程：

1. 父向 Box 下发约束
2. Box 将 *完整约束* 下发给所有子项
3. 子项独立测量
4. Box 尺寸 = 子项最大尺寸

结论：

* Box 不关心子项顺序（只影响绘制层级）

---

## 3. Modifier 的真实执行模型

### 3.1 Modifier 的本质

Modifier 不是属性集合，而是：

> **一条从外到内的节点装饰执行链**

每一个 Modifier 都可能影响：

* Constraints
* Measure 结果
* Placement
* Draw
* Input

---

### 3.2 Modifier 顺序的真实含义

Modifier 链：

* 从上到下声明
* 从外到内执行

这意味着：

* 前面的 Modifier 会改变后面 Modifier 的执行环境

顺序不是"写法差异"，而是**逻辑差异**。

---

## 4. 尺寸 Modifier 的约束行为

### 4.1 fill 系列

fillMaxWidth / fillMaxHeight：

* 含义：使用父提供的最大约束
* 不等价于 match_parent

生效条件：

* 父必须提供有限 max 约束

---

### 4.2 固定尺寸

size / width / height：

* 会直接修改 Constraints
* 优先级高于 fill

优先级规则：

```
size > width/height > fill > wrap
```

---

### 4.3 wrapContent 的陷阱

wrapContentWidth / wrapContentHeight：

* 允许子节点突破父的最小约束
* 常用于 `Text(Modifier.wrapContentWidth())` 实现基线对齐

---

## 5. padding 的测量级影响

padding 的行为不是绘制，而是：

* **减少子节点可用测量空间**

执行过程：

1. 外层接收父约束
2. 扣除 padding 后传给内容
3. 内容测量完成后再加回 padding

结论：

> padding 是测量阶段的参与者

---

## 6. weight 的底层工作方式

weight 的本质：

* 剩余空间分配器

执行顺序：

1. 测量非 weight 子项
2. 计算剩余空间
3. 按权重比例分配
4. 强制子项使用分配尺寸

注意：

* weight 子项不再 wrap_content

---

## 7. clickable / background 的顺序语义

clickable 的作用区域：

* 等于当前 Modifier 链处理完成后的区域

因此：

* clickable 放在 padding 前后，点击区域不同
* background 同理

---

## 8. Modifier 与重组、性能的关系

* Modifier 是不可变对象
* 每次重组都会重新创建 Modifier 链
* Modifier 本身应无状态

错误模式：

* 在 Modifier 中承载业务逻辑
* 在 Modifier 中存储状态

---

## 9. 工程级布局设计原则

1. **外层 Modifier**：布局与约束（size、padding、fill 等）
2. **内层 Modifier**：绘制与交互（background、clickable、border 等）
3. **长 Modifier 链必须拆分**：超过 3-4 个 Modifier 应提取为扩展函数
4. **顺序写错 = 潜在 Bug**：每个工程都应建立团队的 Modifier 顺序规范
5. **性能敏感处避免重复计算**：对于频繁重组的组件，考虑 Modifier.composed 的缓存策略

---

## 10. 实际案例解析

### 案例1：为什么这个 Text 看起来没居中？

```kotlin
Box(modifier = Modifier.fillMaxSize()) {
    Text(
        text = "Hello",
        modifier = Modifier.fillMaxWidth()
    )
}
```

**分析**：fillMaxWidth 导致 Text 占满宽度，无法居中。解决方案：使用 `wrapContentWidth(Alignment.CenterHorizontally)`。

### 案例2：padding 与 size 的顺序

```kotlin
// 版本A
Box(Modifier.size(100.dp).padding(20.dp).background(Color.Red))
// 版本B  
Box(Modifier.padding(20.dp).size(100.dp).background(Color.Red))
```

**差异**：
* A：内容区域 100dp，加 padding 后总尺寸 140dp
* B：先有 padding，再设置 size，总尺寸仍为 100dp，但内容区域只剩 60dp

### 案例3：Row 中的 weight 陷阱

```kotlin
Row {
    Box(Modifier.weight(1f).background(Color.Red))
    Box(Modifier.width(100.dp).background(Color.Blue))
    Box(Modifier.weight(1f).background(Color.Green))
}
```

**行为**：蓝盒固定 100dp，剩余空间由红盒和绿盒平分。

---

## 11. 调试与验证工具

### 11.1 Modifier.debugInspectorInfo

查看 Modifier 链的实际信息：

```kotlin
modifier.debugInspectorInfo { /* 调试信息 */ }
```

### 11.2 Layout Inspector

Android Studio 的 Compose Layout Inspector 可以：

* 查看 Constraints 传递
* 查看实际测量尺寸
* 分析 Modifier 链

### 11.3 自定义 Modifier 调试

```kotlin
fun Modifier.debugConstraints(tag: String) = this.then(
    object : LayoutModifier {
        override fun MeasureScope.measure(
            measurable: Measurable,
            constraints: Constraints
        ): MeasureResult {
            println("[$tag] constraints: $constraints")
            val placeable = measurable.measure(constraints)
            println("[$tag] measured size: ${placeable.width}x${placeable.height}")
            return layout(placeable.width, placeable.height) {
                placeable.placeRelative(0, 0)
            }
        }
    }
)
```

## 12 布局系统的“单次测量”定律 (Single Pass)

这是 `Compose` 优于 `View` 系统最核心的性能基石。
- 物理规则：在一次重组循环中，`Compose` 规定每个节点只能被测量一次。
- 对比 `View` 模式：`View` 系统中 `RelativeLayout` 或 `LinearLayout` 使用 `weight` 时，经常会触发多次 `onMeasure`，导致性能随层级深度指数级下降（$O(2^n)$）。
- `Compose` 的强制性：如果你尝试在自定义布局中对同一个子项调用两次 `measure()`，`Compose` 会直接抛出运行时异常。

## 13 Alignment vs Arrangement

`Alignment`：单个子项, 可用于 Box / Column / Row, 子项在交叉轴（Cross Axis）上的对齐方式
`Arrangement`：全部子项, 可用于 Column / Row, "子项在主轴（Main Axis）上的分布方式（SpaceBetween, Center等）"

