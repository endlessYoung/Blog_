# numpy的常用方法

## 1. 创建矩阵
示例：

::: code-group
``` python
import numpy as np

np.array([1, 2, 3, 4, 5]) # 创建一个一维的矩阵
a = np.zeros((3,2)) # 创建一个全部为0的三行俩列的矩阵
a.shape # 获取矩阵的大小
np.full(shape, fill_value)：# 创建指定形状且元素均为指定值的数组。
np.arange(start, stop, step)：# 创建一个等差数组。
np.ones((2, 4)) # 创建一个全部为1的两行四列的矩阵
np.arange(3, 7) # 创建递增的矩阵 [3,4,5,6]
np.linspace(0, 1, 5) # 返回返回介于...区间的等间距矩阵 [0, 0.25, 0.75, 1]
np.random.rand(2, 4) # 创建一个随机的两行四列的矩阵
np.random.randn(*dims) # 生成指定形状的标准正态分布随机数数组

a = np.zeros((2, 4), dtype=np.int32) 
# numpy矩阵的默认数据类型是64位的浮点数，也可以指定数据类型
'''
可选值：1.np.int8/16/32/64
       2.np.unit8/16/32/64 无符号整型
       3.np.float32/64
       4.bool
       5.str
'''
b = a.astype(int) # 转换数据类型

.reshape(shape) # 改变数组的形状，不改变元素总数。
.transpose() # 或 .T：转置数组，即交换维度。
.flatten() # 将数组展平为一维数组。
```
:::

## 2. 矩阵的四则运算与统计排序

示例
::: code-group
``` python
import numpy as np

a + b
a / b
np.dot(a,b) # 矩阵点乘
a @ b # 矩阵的乘法运算
np.sqrt(a) # 求元素的平方根
np.sin(a)
np.cos(a)
np.power(a)
np.log(a)
a * 5

.sum(axis=None)：# 计算数组元素的和，可指定轴。
.mean(axis=None)：# 计算平均值。
.std(axis=None)：# 计算标准差。
.max(axis=None)：# 找到最大值。
.min(axis=None)：# 找到最小值。
a[start:stop:step] # 切片操作

.argmax(axis=None) # 返回最大值的索引。
.argmin(axis=None) # 返回最小值的索引。
.sort(axis=-1) # 就地排序数组元素，默认按最后一个轴排序。

np.linalg.inv(matrix) # 计算矩阵的逆。
np.linalg.solve(a, b) # 解线性方程组 ax = b。
np.correlate(a, v, mode='valid') # 计算两个一维序列的互相关系数。
np.cov(m, y=None, rowvar=True) # 计算协方差矩阵。
```
:::