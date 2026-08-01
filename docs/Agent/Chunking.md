# Chunking

> `Chunking` 是RAG的核心技术之一。`Chunking` 的作用是把长文档切成大小合适、语义完整、可以检索、可以组合的小知识单元。

注意：`Chunking` 的结果会直接影响：
- 检索准确率
- 回答质量
- Token消耗速度
- Agent的推理速度
- Memory的管理能力

## 1. 为什么Agent需要Chunking？

1. 突破上下文窗口限制
大模型的单词输入长度是有上限的。一个长文档、长对话历史如果不进行分块，就会直接超出窗口上限。

``` Mermaid
flowchart LR
    Doc[(📄 文档)] --> Chunk[✂️ Chunker<br/>策略: RecursiveSplit]
    Chunk --> ChunkQ[块队列]
    ChunkQ --> Embed[🧠 Embedder<br/>批量大小: 20]
    Embed --> VecQ[向量队列]
    VecQ --> DB[(🗄️ Vector DB<br/>Milvus)]
    
    ChunkQ -.->|背压控制| Chunk
    VecQ -.->|背压控制| Embed
```