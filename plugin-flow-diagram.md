# 插件流程串联图

## 完整采集流程

### 1. 入口点
```
用户操作
├── 点击页面采集按钮 (content.js)
└── 点击插件弹窗按钮 (popup.js)
```

### 2. 状态检查
```
检查采集状态
├── window.isCollecting (全局状态)
├── CollectionManager 是否加载
├── MediaManager 是否加载
└── scrapeRawData 函数是否可用
```

### 3. 采集执行
```
scrapeRawData()
├── 更新按钮状态为"采集中..."
├── 提取商品数据 (JSON)
├── 收集图片和视频
├── 筛选图片 (≥800x800px)
└── 生成媒体数据
```

### 4. CollectionManager 处理
```
executeCollection()
├── 1. 保存JSON到App
│   ├── 创建商品文件夹
│   ├── 保存product.json
│   ├── 保存monitoring.json
│   └── 保存media.json
├── 2. 唤起App
│   ├── 调用hanliapp://open协议
│   └── App置于最前窗口
└── 3. 异步下载媒体
    ├── 筛选符合要求的图片
    └── 发送下载请求到App
```

### 5. 状态同步
```
采集完成通知
├── MediaManager 下载完成
├── 触发 hanliCollectionCompleted 事件
├── 更新页面按钮为"已采集"
└── 通知 popup.js 恢复按钮状态
```

## 关键修复点

### 1. 全局状态管理
- `window.isCollecting` - 防止重复采集
- `window.collectionManager` - 全局采集管理器
- `window.mediaManager` - 全局媒体管理器

### 2. 事件通信
- `hanliCollectionCompleted` - 采集完成事件
- `hanliCollectionFailed` - 采集失败事件
- `hanliPopupCollectionCompleted` - 通知popup完成
- `hanliPopupCollectionFailed` - 通知popup失败

### 3. 错误处理
- 组件加载检查
- 采集状态检查
- 超时保护机制
- 弹窗错误提示

## 流程验证

### 正常流程
1. 用户点击采集 → 检查状态 → 开始采集 → 保存JSON → 唤起App → 下载媒体 → 完成

### 异常流程
1. 重复点击 → 提示"采集中，请等待"
2. 组件未加载 → 提示"请刷新页面"
3. App未启动 → 弹窗"打开应用失败"
4. 采集超时 → 自动恢复按钮状态

## 文件职责

### popup.js
- 插件弹窗UI
- 连接状态检查
- 调用content.js采集
- 监听采集完成事件

### content.js
- 页面采集按钮
- 数据提取逻辑
- 状态管理
- 事件分发

### collectionManager.js
- JSON保存
- App唤起
- 错误处理
- 弹窗提示

### mediaManager.js
- 媒体收集
- 图片筛选
- 文件下载
- 完成通知
