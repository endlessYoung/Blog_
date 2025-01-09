# HashMap的高级用法

## 1. 初始化时设置初始容量和负载因子

::: code-group
``` java
Map<String, Integer> map = new HashMap<>(64, 0.8f);
// 64 初始容量
// 0.8 负载因子（load factor）
```
:::

在 `HashMap` 中，负载因子用于决定何时需要增加 `HashMap` 的容量。**默认的负载因子是 0.75**，也就是说，当哈希表的元素数量达到容量的 `75%` 时，它会自动扩容。

## 2. 使用compute方法动态计算值

::: code-group
``` java
Map<String, Integer> map = new HashMap<>();
map.put("apple", 1);

map.compute("apple", (key, value) -> value == null ? 1 : value + 1);
System.out.println(map.get("apple")); // 2
```
:::

## 3. 使用merge方法合并值

::: code-group
``` java
Map<String, Integer> map = new HashMap<>();
map.put("apple", 1);
map.merge("apple", 1, Integer::sum);
System.out.println(map.get("apple")); // 2
```
:::

## 4. 使用getOrDefault方法避免空指针
`getOrDefault` 方法可以在键不存在的时候返回默认值，避免空指针异常。

::: code-group
``` java
Map<String, Integer> map = new HashMap<>();
map.put("apple", 1);

int count = map.getOrDefault("banana", 0);
System.out.println(count) // 0
```
:::

## 5. 使用putIfAbsent方法避免覆盖

`putIfAbsent`方法只有在键不存在时才会插入值，避免覆盖已有的值。

::: code-group
``` java
Map<String, Integer> map = new HashMap<>();
map.put("apple", 1);

map.putIfAbsent("apple", 2);
System.out.println(map.get("apple")); // 1
```
:::

## 6. 使用replaceAll方法批量更新值

`replaceAll` 方法可以批量更新 `HashMap` 中的所有值。

::: code-group
``` java
Map<String, Integer> map = new HashMap<>();
map.put("apple", 1);
map.put("banana", 2);

map.replaceAll((key, value) -> value + 2);
System.out.println(map); // {apple=2, banana=4}
```
:::

## 7. 使用computeIfAbsent延迟计算值

`computeIfAbsent` 方法可以在键不存在时动态计算值，并将其放入 `HashMap` 中。
::: code-group
``` java
Map<String, List<String>> map = new HashMap<>();
map.computeIfAbsent("fruits", k -> new ArrayList<>()).add("apple");
System.out.println(map.get("fruits")); // [apple]
```
:::


