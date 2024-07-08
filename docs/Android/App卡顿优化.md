# App卡顿优化

## 1. 布局优化

1. 在主线程中，加载sp，或者是缓存加载，JSON解析，可以放到IdleHandler。
2. ViewPager懒加载，用ViewPager2替换为ViewPager，方便懒加载

::: code-group
``` java
ViewPager.offscreenPageLimit = 2
```
:::
3. 布局嵌套层级优化时，自定义继承自ViewGroup的View中，如果本身继承自LinearLayout等布局，则可以考虑根布局使用**merge**标签，如果根布局使用**merge**标签，在LayoutInflater中必须指定attchToParent为true，否则会崩溃，同时**this.addView**就不需要了。
4. 如果view不一定会显示，此时可以使用ViewStub来包裹此View以避免不需要显示View但是又需要加载view消耗资源。ViewStub是一个轻量级的view，它不可见，不占用资源，只有设置ViewStub为Visible或者调用其Inflater()方法时，其对应的布局文件才会初始化。

## 2.布局加载优化

LayoutInflater加载xml布局的过程会在主线程使用IO读取xml布局文件进行xml解析，再根据解析结果利用反射创建布局中的View/ViewGroup对象。
可以用**AsyncLayoutInflater**异步加载。

## 卡顿监控的方式

1. Looper比较适合在发布前进行测试或者小范围灰度测试然后定位问题；
2. ChoreographerHelper适合监控线上环境的app的掉帧情况来计算app在某些场景的流畅度然后有针对性的性能优化；
3. Systrace用来检测滑动的情况，有没有掉帧；
4. BlockCanary卡顿监控：基于Looper的性能监控。