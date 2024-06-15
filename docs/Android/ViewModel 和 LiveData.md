# ViewModel 和 LiveData

## 1. 什么是ViewModel、LiveData

是一个用于管理和存储与用户界面相关的数据的类。它设计用于存储和管理与界面相关的数据，例如 Activity 或 Fragment 的 UI 数据，而不受设备配置变化（如旋转）的影响。

LiveData 是一个可观察的数据持有类，它在数据变化时通知其观察者。可以感知生命周期，并确保只在活动生命周期状态（如 STARTED 或 RESUMED）下更新观察者。

## 2. 使用方法

ViewModel 通常是搭配 LiveData 使用
通常情况下，ViewModel 会包含 LiveData 对象作为其成员变量，以便在数据发生变化时通知其观察者（如 Activity 或 Fragment），从而更新 UI。

1. 定义 LiveData 对象

在 ViewModel 中定义一个 LiveData 对象，用于存储需要在 UI 中展示或处理的数据。

::: code-group
``` kotlin
class MyViewModel : ViewModel() {
    private val _data = MutableLiveData<String>()
    
    val data: LiveData<String>
        get() = _data
    
    fun loadData() {
        // 模拟数据加载过程
        val newData = "Updated Data" // 可以从网络请求或数据库获取
        _data.value = newData
    }
}
```
:::

2. 在 Activity 或 Fragment 中观察 ViewModel 中的 LiveData 变化，并更新 UI。

::: code-group
``` kotlin
class MyFragment : Fragment() {
    private lateinit var viewModel: MyViewModel
    private lateinit var textView: TextView
    
    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        // 初始化 ViewModel
        viewModel = ViewModelProvider(this).get(MyViewModel::class.java)
        
        // 初始化视图
        val rootView = inflater.inflate(R.layout.my_fragment, container, false)
        textView = rootView.findViewById(R.id.textView)
        
        // 观察 LiveData 变化
        viewModel.data.observe(viewLifecycleOwner, Observer { newData ->
            // 更新 UI
            textView.text = newData
        })
        
        return rootView
    }
}

```
:::

## 3. 总结

> 总结：在 ViewModel 内部，通过 MutableLiveData 或其子类（如 MediatorLiveData）定义一个 LiveData 对象。通常，我们使用 MutableLiveData，因为它具有可以更新值的功能。在 ViewModel 中的方法（例如 loadData()）中更新 _data 的值。在 Activity 或 Fragment 中通过 observe 方法观察 LiveData 的变化。在 observe 方法中，传入 viewLifecycleOwner 作为 LifecycleOwner，确保只在页面处于活动状态时更新 UI。当 ViewModel 中的 _data 更新时，Observer 中的代码块会被调用，更新 UI 中的 textView 的文本内容。