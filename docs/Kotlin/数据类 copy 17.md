# 数据类

在 Kotlin 中，数据类是一种特殊的类，主要用于保存数据。它会根据类中定义的属性自动生成标准功能，如 equals()、hashCode()、toString() 和 copy() 方法。下面是一个示例：

``` kotlin
data class Person(val name: String, val age: Int)
val person = Person("Alice", 25)
println(person.toString()) // Person(name=Alice, age=25)
```
