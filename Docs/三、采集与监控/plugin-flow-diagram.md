# 插件流程串联图

## 1. 插件采集并监控流程

### 入口点
```
用户操作
├── 点击页面悬浮按钮 (content.js)
│   ├── "采集并监控" - 完整采集流程
│   └── "仅采集监控数据" - 监控数据采集
└── 点击插件弹窗按钮 (popup.js)
    ├── "开始采集" - 完整采集流程
    └── "仅采集监控数据" - 打开批量采集页面
```

### 完整采集流程 (采集并监控)
```
scrapeRawData()
├── 更新按钮状态为"采集中..."
├── 提取商品数据 (JSON)
├── 收集图片和视频
├── 筛选图片 (≥800x800px)
├── 生成媒体数据
└── 调用CollectionManager.executeCollection()
    ├── 1. 保存JSON到App
    │   ├── 创建商品文件夹
    │   ├── 保存product.json
    │   ├── 保存monitoring.json (标准数组格式)
    │   └── 保存media.json
    ├── 2. 唤起App
    │   ├── 调用hanliapp://open协议
    │   └── App置于最前窗口
    └── 3. 异步下载媒体
        ├── 第一步：尺寸筛选 (≥800×800px)
        ├── 第二步：本地去重检查
        │   ├── 调用 /api/check-existing-media
        │   ├── 读取本地 media.json
        │   └── 跳过已存在的URL
        └── 第三步：发送下载请求到App
```

### 仅采集监控数据流程
```
collectMonitoringDataOnly()
├── 显示"正在采集数据"提示
├── 提取rawData中的监控数据
├── 格式化监控数据 (字符串类型，包含单位)
├── 直接调用App API更新monitoring.json
├── 隐藏采集提示
├── 显示成功/失败消息
└── 触发自动刷新事件
```

## 2. 批量监控数据采集流程

### 入口点
```
插件弹窗 → "仅采集监控数据" → 打开monitor-collection.html
```

### 页面初始化
```
MonitorCollectionManager.init()
├── 自动加载商品清单 (get-products-list API)
├── 检查今日采集状态 (get-monitoring-data API)
├── 渲染商品列表
├── 设置自动刷新监听
└── 显示"今日已采集"状态
```

### 手动采集流程
```
collectSingleProduct(index)
├── 打开商品URL (新标签页)
├── 发送采集请求 (localStorage)
├── 等待采集结果 (20秒超时，3秒检查)
├── 更新monitoring.json (update-monitoring-data API)
├── 关闭标签页
├── 更新商品状态
└── 触发自动刷新
```

### 自动刷新机制
```
setupAutoRefresh()
├── 监听localStorage事件 (monitoringDataUpdated)
├── 监听postMessage事件 (monitoringDataUpdated)
├── 定期检查状态 (每30秒)
└── 自动刷新UI和状态
```

## 3. 通信机制

### localStorage通信
```
采集请求
├── collectionRequest: {action, taskId, goodsId, url, timestamp}
└── collectionResult_${taskId}: {success, collectedData}

状态更新
├── monitoringDataUpdated: 时间戳
└── 触发自动刷新机制
```

### postMessage通信
```
窗口间通信
├── monitoringDataUpdated: {type, goodsId, timestamp}
└── 跨页面状态同步
```

### API通信
```
App后端API
├── GET /api/monitor/get-products-list
├── GET /api/monitor/get-monitoring-data
├── POST /api/monitor/update-monitoring-data
├── POST /api/save-json-files
├── POST /api/download-media
└── POST /api/check-existing-media (新增)
```

## 4. 状态管理

### 全局状态
- `window.isCollecting` - 防止重复采集
- `window.collectionManager` - 全局采集管理器
- `window.mediaManager` - 全局媒体管理器

### 事件通信
- `hanliCollectionCompleted` - 采集完成事件
- `hanliCollectionFailed` - 采集失败事件
- `hanliPopupMonitoringCollectionCompleted` - 监控采集完成
- `hanliPopupMonitoringCollectionFailed` - 监控采集失败

### 超时机制
- **超时时间**: 20秒
- **检查间隔**: 3秒
- **日志频率**: 每3秒显示剩余时间
- **错误处理**: 超时后显示详细错误信息

## 5. 错误处理

### 采集错误
- 重复点击 → 提示"采集中，请等待"
- 组件未加载 → 提示"请刷新页面"
- App未启动 → 弹窗"打开应用失败"
- 采集超时 → 自动恢复按钮状态

### 网络错误
- API调用失败 → 重试机制
- 连接超时 → 显示错误信息
- 数据格式错误 → 验证和提示

## 6. 文件职责

### popup.js
- 插件弹窗UI
- 连接状态检查
- 调用content.js采集
- 打开批量采集页面
- 监听采集完成事件

### content.js
- 悬浮按钮管理
- 数据提取逻辑
- 状态管理
- 事件分发
- 主题适配

### monitor-collection.js
- 批量采集管理
- 商品清单加载
- 手动采集控制
- 自动刷新机制
- 状态跟踪

### collectionManager.js
- JSON保存
- App唤起
- 媒体文件筛选 (尺寸+本地去重)
- 错误处理
- 弹窗提示

### mediaManager.js
- 媒体收集
- 图片筛选
- 文件下载
- 完成通知
