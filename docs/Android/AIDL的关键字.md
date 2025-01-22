# AIDL的关键字

好的，下面是 `AIDL` 中所有关键字和概念的完整列表：

## 1. **interface**
   - 用于定义 AIDL 接口。AIDL 接口包含客户端和服务端之间可以调用的方法。
   - 示例：
     ```aidl
     interface IMyAidlInterface {
         void myMethod();
     }
     ```

## 2. **in**
   - `in` 关键字用于表示方法的输入参数。AIDL 中的输入参数是只读的，不能被修改。
   - 示例：
     ```aidl
     interface IMyAidlInterface {
         void myMethod(in String input);
     }
     ```

## 3. **out**
   - `out` 关键字用于表示输出参数，即方法执行后返回的值。
   - 示例：
     ```aidl
     interface IMyAidlInterface {
         void myMethod(out String result);
     }
     ```

## 4. **inout**
   - `inout` 关键字表示既是输入参数又是输出参数，方法执行后该参数的值会发生变化。
   - 示例：
     ```aidl
     interface IMyAidlInterface {
         void myMethod(inout int value);
     }
     ```

## 5. **parcelable**
   - `parcelable` 关键字用于标识一个可以在进程之间传递的对象类。`Parcelable` 是 Android 特有的接口，用于高效地序列化对象。
   - 示例：
     ```aidl
     parcelable MyData {
         int id;
         String name;
     }
     ```

## 6. **enum**
   - `enum` 关键字用于定义枚举类型，枚举可以是传递的数据类型之一。
   - 示例：
     ```aidl
     enum Status {
         OK,
         ERROR
     }
     ```

## 7. **throws**
   - `throws` 关键字用于声明 AIDL 方法可能抛出的异常。AIDL 方法可以抛出 `RemoteException`。
   - 示例：
     ```aidl
     interface IMyAidlInterface {
         void myMethod() throws RemoteException;
     }
     ```

## 8. **extends**
   - `extends` 关键字用于继承其他 AIDL 接口。继承后，接口会包含父接口的所有方法。
   - 示例：
     ```aidl
     interface IMyAidlInterface extends IBaseInterface {
         void myMethod();
     }
     ```

## 9. **callback**
   - `callback` 用于定义回调接口，服务端通过回调将数据传递给客户端。
   - 示例：
     ```aidl
     interface IMyCallback {
         void onSuccess(String result);
     }

     interface IMyAidlInterface {
         void registerCallback(in IMyCallback callback);
     }
     ```

## 10. **import**
   - `import` 用于引入其他 AIDL 文件中的类型或接口。可以导入类、接口、枚举或 `parcelable`。
   - 示例：
     ```aidl
     import com.example.otherpackage.IMyOtherInterface;

     interface IMyAidlInterface {
         void myMethod();
     }
     ```

## 11. **boolean**
   - `boolean` 用于定义布尔类型的参数。
   - 示例：
     ```aidl
     interface IMyAidlInterface {
         boolean isValid();
     }
     ```

## 12. **byte, short, int, long, float, double, char, String**
   - 这些是 AIDL 中支持的基本数据类型。
   - 示例：
     ```aidl
     interface IMyAidlInterface {
         void myMethod(in int x, in String message);
     }
     ```

## 13. **void**
   - `void` 关键字用于表示方法没有返回值。
   - 示例：
     ```aidl
     interface IMyAidlInterface {
         void doSomething();
     }
     ```

## 14. **remote**
   - `remote` 关键字用来标识一个 AIDL 接口是远程接口，通常需要通过 `Binder` 在不同进程之间进行通信。
   - 示例：
     ```aidl
     interface IMyAidlInterface extends android.os.IInterface {
         void myMethod();
     }
     ```

## 15. **const**
   - `const` 用于声明常量。常量可以在 AIDL 文件中定义，通常用于传递固定值。
   - 示例：
     ```aidl
     const int ERROR_CODE = -1;
     ```

## 16. **Map**
   - AIDL 也支持 `Map` 类型，但它只能传递简单类型（例如 `String` 和基本数据类型）的映射。
   - 示例：
     ```aidl
     import java.util.Map;

     interface IMyAidlInterface {
         void sendData(Map<String, Integer> data);
     }
     ```

## 17. **List**
   - AIDL 支持传递 `List` 类型的数据集合，通常是基本数据类型的列表。
   - 示例：
     ```aidl
     import java.util.List;

     interface IMyAidlInterface {
         void sendList(in List<String> list);
     }
     ```

## 18. **Binder**
   - AIDL 本身是一种通信协议，它利用 `Binder` 在客户端和服务端之间传递数据。`Binder` 是 Android 的 IPC 机制的核心类。
   - 示例：
     ```aidl
     interface IMyAidlInterface {
         void bindService(in Binder service);
     }
     ```

这些是 AIDL 中的关键字和常用概念，涵盖了定义接口、传递数据、异常处理、继承、回调等功能的所有基本内容。