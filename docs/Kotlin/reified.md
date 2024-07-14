# reified

## 1. 什么是reified关键字？
在Kotlin中，reified是一个特殊的关键字，用于修饰内联函数中的类型参数。这使得在函数内部可以访问类型参数的具体类型。通常情况下，由于类型擦除（type erasure），在运行时是无法直接获取泛型类型参数的具体类型的。reified关键字解决了这个问题。
使用reified关键字的条件
要使用reified关键字，需要遵循以下几点：

函数必须是内联的（使用inline关键字修饰）。
类型参数前需要加上reified关键字。

示例：reified关键字的用法
下面是一个使用reified关键字的简单示例：
::: code-group
``` kotlin
inline fun <reified T> checkType(value: Any) {
    if (value is T) {
        println("Value is of type T.")
    } else {
        println("Value is NOT of type T.")
    }
}

fun main() {
    val stringValue = "Hello, Kotlin!"
    val intValue = 42

    checkType<String>(stringValue) // 输出 "Value is of type T."
    checkType<String>(intValue) // 输出 "Value is NOT of type T."
}
```
:::

在这个示例中，我们定义了一个内联函数checkType，它接受一个reified类型参数T。然后，我们使用is关键字检查传入的value变量是否为类型T。在main函数中，我们用不同的类型参数调用checkType函数来验证它的功能。
获取类型参数的Java类
当你使用reified关键字修饰一个内联函数的类型参数时，你可以通过T::class.java获取类型参数对应的Java类。这在需要访问泛型类型参数的具体类型时非常有用，比如在反射操作中。

下面是一个简单的例子：
::: code-group
``` kotlin
import kotlin.reflect.KClass

inline fun <reified T : Any> getClass(): KClass<T> {
    return T::class
}

inline fun <reified T : Any> getJavaClass(): Class<T> {
    return T::class.java
}

fun main() {
    val stringKClass = getClass<String>()
    println("KClass for String: $stringKClass") // 输出 "KClass for String: class kotlin.String"

    val stringJavaClass = getJavaClass<String>()
    println("Java class for String: $stringJavaClass") // 输出 "Java class for String: class java.lang.String"
}
```
:::

在这个示例中，我们定义了两个内联函数，getClass和getJavaClass，它们都接受一个reified类型参数T。getClass函数返回类型参数对应的KClass对象，而getJavaClass函数返回类型参数对应的Java类。在main函数中，我们用String类型参数调用这两个函数，并输出结果。

## 2. 注意事项
> 需要注意的是，reified关键字不能用于非内联函数，因为它们的类型参数在运行时会被擦除。此外，reified类型参数不能用于普通类和接口，只能用于内联函数。

## 3. 总结
Kotlin中的reified关键字允许我们在内联函数中访问类型参数的具体类型。它在需要访问泛型类型参数的场景中非常有用，例如在反射操作中。本文通过实例介绍了如何使用reified关键字，并讨论了相关注意事项。希望这些示例能够帮助您更好地理解和应用reified关键字。