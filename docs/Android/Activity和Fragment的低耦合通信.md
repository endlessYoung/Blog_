# Activity和Fragment的低耦合通信

## 1. Fragment 与 Activity 之间的通信

通常通过接口实现 Fragment 与 Activity 之间的通信：

::: code-group
``` java
// 定义接口
public interface OnFragmentInteractionListener {
    void onFragmentInteraction(String data);
}

// 在 Fragment 中使用接口
@Override
public void onAttach(Context context) {
    super.onAttach(context);
    if (context instanceof OnFragmentInteractionListener) {
        listener = (OnFragmentInteractionListener) context;
    } else {
        throw new RuntimeException(context.toString()
                + " must implement OnFragmentInteractionListener");
    }
}

// 触发接口方法
listener.onFragmentInteraction("some data");

// 在 Activity 中实现接口
public class MyActivity extends AppCompatActivity implements OnFragmentInteractionListener {
    @Override
    public void onFragmentInteraction(String data) {
        // 处理数据
    }
}
```
:::