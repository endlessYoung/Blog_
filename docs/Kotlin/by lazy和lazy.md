# by lazy和lazy

## 1.前言

**委托模式**是软件设计模式中的一项基本技巧。在委托模式中，有两个对象参与处理同一个请求，接受请求的对象将请求委托给另一个对象来处理。委托模式是一项基本技巧，许多其他的模式，如状态模式、策略模式、访问者模式本质上是在更特殊的场合采用了委托模式。

在java中的委托模式：
``` java
  public class Car {
        public int getCarColor(){
              return 0;
        }
  }
  public class Benz {
         public int getCarColor(){
              return new Car().getCarColor();
        }
  }
  public static void main(String[] args){
        int color =  new Benz().getCarColor();
  }
```

java中的委托的进阶示例

``` java
  public interface BaseCar {
       int getCarColor();
       String getCarName();
       boolean[] isCarDoorOpens();
       boolean isCarDoorOpen(int i);
  }
  public class Car{
       public int getCarColor(){return 0;}
       public String getCarName(){return "Car"}
       public boolean[] isCarDoorOpens(){
            retunr new boolean[]{false,false.false,false};
       }
       public boolean isCarDoorOpen(int i){
            return new boolean[]{false,false.false,false}[i];
       }
  }
  public class Benz implements BaseCar{
       private Car car = new Car();
       public int getCarColor(){return this.car.getCarColor();}
       public String getCarName(){return "Benz"}
       public boolean[] isCarDoorOpens(){
            retunr this.car.isCarDoorOpens();
       }
       public boolean isCarDoorOpen(int i){
            return this.car.isCarDoorOpen(i);
       }
  }
  public static void main(String[] args){
        int color =  new Benz().getCarColor();
  }
```

在这个例子中，类Benz实现了BaseCar，但是除了getCarName方法，其他方法都是调用另一个实现了BaseCar的类Car的方法。而这种一个类的方法是调用另一个类的方法，就是**委托**。在java中当一个接口有很多种方法时，实现委托就得不厌其烦的反复写this.car.method(args)。

Kotlin中引入了by关键字来实现这种委托。

像前面Java在类Benz中那么多实现委托的代码，在Kotlin中直接一行搞定：  

``` kotlin
class Benz (car:Car)：BaseCar by car{

}
```
委托需要个委托人吧，那类委托是不是也要个委托类？所以你懂了没？

我知道你想问，那我有些方法不想委托怎么办？

怎么办？上代码：

``` kotlin
      class Benz (car:Car)：BaseCar by car{
               override fun getCarName():String { return "Benz" }
      }
```

简单来说，就是不需要委托哪个方法，就重写哪个方法咯！

至于by lazy，懒加载，大致相当于Java的
``` java
   OneInterface oi = new OneInterface(){
        public int method(){
             return oneInterfaceImp.method();
        }
   }
```


只是说kotlin简化了写法：

``` kotlin
   val oneInterface:OnInterface by lazy {
        OnInterfaceImp()
   }
```

同样，不想委托的方法，在lazy{}中重写就可以。

