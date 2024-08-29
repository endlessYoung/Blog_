# String的intern方法

String的intern方法用于在运行时将字符串添加到内部的字符串池中，并返回字符串池中的引用

对于任意两个字符串 a 和 b，当且仅当a.equals(b) 为true时，a.intern() == b.intern() 才为true。