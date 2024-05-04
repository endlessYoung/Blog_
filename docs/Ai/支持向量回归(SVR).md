# 支持向量回归(SVR)

## 1.支持向量机

支持向量机（Support Vector Machine，SVM）是一种强大的监督学习算法，常用于分类和回归问题。它的主要思想是找到能够有效划分不同类别数据的超平面，并且使得超平面到最近的数据点（支持向量）的距离最大化。

### 工作原理
1. **寻找最大间隔超平面**：SVM 的目标是寻找一个超平面，能够将不同类别的数据点分隔开，并且使得超平面到最近的数据点（支持向量）的距离最大化。这个超平面就是所谓的最大间隔超平面。

2. **处理非线性问题**：对于线性不可分的情况，SVM 可以通过使用核函数将原始特征映射到高维空间中，使得数据在高维空间中线性可分。常用的核函数有线性核、多项式核、高斯核等。

3. **支持向量**：在SVM中，支持向量是指离超平面最近的那些数据点，它们对于定义超平面具有决定性的作用。

### 应用
- **分类问题**：SVM 在许多分类任务中表现出色，特别是在数据维度较高、样本量较小的情况下。
- **回归问题**：SVM 也可以应用于回归问题，通过调整目标函数和参数，实现对连续变量的预测。

### 优点
- 在高维空间中表现良好，适用于高维数据。
- 可以处理非线性问题，通过核函数映射到高维空间。
- 由于间隔最大化的性质，对噪声和离群点具有较强的鲁棒性。

### 缺点
- 对于大规模数据集和高维稀疏数据的训练速度较慢。
- 对于非线性问题，选择合适的核函数和参数需要一定的经验和调优。

### 实现
在实践中，可以使用各种机器学习库（如Scikit-learn、TensorFlow等）来实现SVM。Scikit-learn 提供了 `sklearn.svm` 模块，其中包含了用于分类和回归的 SVM 实现。

::: code-group
``` python
from sklearn import datasets
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC
from sklearn.metrics import accuracy_score

# 加载鸢尾花数据集
iris = datasets.load_iris()
X = iris.data
y = iris.target

# 将数据集划分为训练集和测试集
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# 特征标准化
scaler = StandardScaler()
X_train = scaler.fit_transform(X_train)
X_test = scaler.transform(X_test)

# 创建并训练支持向量机模型
svm_model = SVC(kernel='linear', random_state=42)
svm_model.fit(X_train, y_train)

# 在测试集上进行预测
y_pred = svm_model.predict(X_test)

# 计算准确率
accuracy = accuracy_score(y_test, y_pred)
print("Accuracy:", accuracy)
```
:::


## 2.支持向量机回归

## 3.支持向量机的核函数

支持向量机（SVM）在分类任务中可以使用不同的核函数来构建非线性决策边界。核函数的选择对于SVM模型的性能和泛化能力具有重要影响。以下是常用的几种核函数：

1. **线性核函数**（Linear Kernel）：
   $K(x, x') = x^T x'$
   线性核函数适用于线性可分的数据集，它在特征空间中执行线性划分，适用于特征维度较高的数据集。

2. **多项式核函数**（Polynomial Kernel）：
   $K(x, x') = (\gamma x^T x' + r)^d$
   其中，$(\gamma)$ 是一个常数（控制多项式的影响），$(r)$ 是一个常数（控制多项式的平移），$(d)$ 是多项式的阶数。多项式核函数将数据映射到高维空间中，使得数据在高维空间中变得线性可分。

3. **高斯核函数**（Gaussian Kernel，也称为径向基核函数，Radial Basis Function，RBF）：
   $K(x, x') = \exp\left(-\frac{\|x - x'\|^2}{2\sigma^2}\right)$
   其中，\(\sigma\) 是高斯核函数的带宽参数。高斯核函数将数据映射到无穷维的高维空间中，通过局部的相似性来判断数据点之间的距离，能够处理非线性可分的数据集。

4. **sigmoid核函数**（Sigmoid Kernel）：
   $K(x, x') = \tanh(\gamma x^T x' + r)$
   其中，$(\gamma)$ 是一个常数（控制核函数的斜率），$(r)$ 是一个常数（控制核函数的平移）。sigmoid核函数也可以用于将数据映射到高维空间中，但通常性能不如其他核函数。

5. **自定义核函数**：
   除了上述常用的核函数，SVM还允许用户自定义核函数，只要满足核函数的定义（半正定性、对称性等）即可。自定义核函数能够更好地适应特定数据集的特征和分布。

> 在使用SVM时，可以根据数据集的特点和任务的要求选择合适的核函数。通常情况下，`高斯核函数`在实践中表现较好，因为它能够处理各种复杂的非线性关系。