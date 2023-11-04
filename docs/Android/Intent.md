# Intent

## 一、什么是Inent
即意图，分为显式意图和隐式意图
| 元素名称 | 设置方法|说明与用途|
| --------|-------|---------|
| Component|setComponent|组件,指定意图的来源与目标|
| Action   |setAction    |动作，指定意图的动作行为|
| Data     |setData      |URI，指定意图要操作的数据路径|
| Category|addCategory   |类别，指定意图的操作类别|
| Type    |setType       |数据类型，指定消息的数据类型|
| Extras    |putData       |扩展信息，指定装载的包裹信息|
| Flags    |setFlags      |标志位，指定活动的启动标志|