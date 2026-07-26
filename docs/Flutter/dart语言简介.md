---
created: 2025-04-13
---

## 🚀 基础语法

### 变量定义
```dart
var name = 'Flutter';   // 自动推断类型
// 类似于 JavaScript 中的var，它可以接收任何类型的变量，但最大的不同是 Dart 中 var 变量一旦赋值，类型便会确定，则不能再改变其类型
String name = 'Flutter';
int count = 10;
double ratio = 3.14;
bool isOpen = true;

dynamic t;
Object x;
t = "hi world";
x = 'Hello Object';
//下面代码没有问题
t = 1000;
x = 1000;
```

> Object 是 Dart 所有对象的根基类，也就是说在 Dart 中所有类型都是Object的子类(包括Function和Null)，所以任何类型的数据都可以赋值给Object声明的对象。 dynamic与Object声明的变量都可以赋值任意对象，且后期可以改变赋值的类型，这和 var 是不同的。

### 常量
```dart
final time = DateTime.now(); // 运行时常量，只赋值一次
const pi = 3.14159;          // 编译时常量，值必须在编译期已知
```

---

## 📦 集合类型

### List（数组）
```dart
List<String> names = ['Alice', 'Bob'];
var numbers = [1, 2, 3];
```

### Map（字典）
```dart
Map<String, int> scores = {'Tom': 90, 'Jerry': 85};
```

### Set（集合）
```dart
var fruits = {'apple', 'banana'};
```

---

## 🎯 控制流程

```dart
if (age > 18) {
  print('Adult');
} else {
  print('Minor');
}

for (var i = 0; i < 5; i++) {
  print(i);
}

while (condition) {
  // do something
}
```

---

## 🧱 函数定义

```dart
int add(int a, int b) {
  return a + b;
}

void sayHello([String name = 'World']) {
  print('Hello, $name!');
}

// 匿名函数
var multiply = (a, b) => a * b;
```

---

## 🧩 类与对象

```dart
class Person {
  String name;
  int age;

  Person(this.name, this.age);

  void sayHi() {
    print('Hi, I am $name');
  }
}

var p = Person('Tom', 18);
p.sayHi();
```

---

## 🧬 继承与重写

```dart
class Animal {
  void speak() {
    print('Animal sound');
  }
}

class Dog extends Animal {
  @override
  void speak() {
    print('Bark');
  }
}
```

---

## ❓ 空安全与可空类型

```dart
String? name; // 可以为 null
name = null;

String nonNullName = name ?? 'default'; // null 合并运算符
```

---

## 🔑 工具语法糖

### 构造函数简写
```dart
class Point {
  int x, y;
  Point(this.x, this.y); // 自动赋值
}
```

### 命名参数 & 默认值
```dart
void printInfo({required String name, int age = 0}) {
  print('$name is $age years old');
}
```

---

## 📚 异步编程

```dart
Future<void> fetchData() async {
  var result = await getHttp();  // 等待异步返回
  print(result);
}

Future<String> getHttp() async {
  return 'data';
}
```

---

## 🔄 Stream 和事件流

```dart
Stream<int> counter() async* {
  for (int i = 0; i < 5; i++) {
    yield i;
    await Future.delayed(Duration(seconds: 1));
  }
}

counter().listen((val) => print(val));
```

---