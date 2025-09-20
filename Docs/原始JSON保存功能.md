# 原始JSON保存功能

## 功能概述

在每次商品采集时，插件现在会自动保存原始的JSON数据到商品文件夹中，按照 `rawdata_goodsId_时间` 的格式命名。

## 实现细节

### 1. 插件端修改

#### CollectionManager.js
- 修改 `createFolderAndSaveJson` 方法，增加 `rawData` 参数
- 修改 `executeCollection` 和 `executeCollectionWithProgress` 方法，支持传递原始数据
- 在发送到服务端的数据中包含原始JSON数据

#### content.js
- 在调用 `executeCollectionWithProgress` 时传递 `rawData` 参数

### 2. 服务端修改

#### server.js
- 修改 `saveJsonFiles` 函数，支持保存原始JSON文件
- 修改 `/api/save-json-files` API接口，接收原始数据参数
- 按照 `rawdata_{goodsId}_{collectTime}.json` 格式命名原始JSON文件

## 文件结构

采集完成后，商品文件夹结构如下：

```
data/
└── goods-library/
    └── {goodsId}/
        ├── product.json          # 商品信息数据
        ├── monitoring.json       # 监控数据
        ├── media.json           # 媒体文件信息
        ├── media-temp.json      # 临时媒体文件信息
        ├── rawdata_{goodsId}_{时间}.json  # 原始JSON数据（新增）
        └── images/              # 图片文件夹
            ├── image1.jpg
            └── image2.jpg
```

## 命名规则

- **格式**: `rawdata_{goodsId}_{YYYYMMDDHHMM}.json`
- **示例**: `rawdata_123456789012_202412011430.json`
- **说明**: 
  - `rawdata`: 固定前缀，标识这是原始数据文件
  - `goodsId`: 商品ID（12位数字）
  - `时间`: 采集时间，格式为年月日时分（YYYYMMDDHHMM）

## 使用场景

1. **数据备份**: 保存完整的原始数据，便于后续分析
2. **数据对比**: 可以对比不同时间采集的数据变化
3. **问题排查**: 当处理后的数据出现问题时，可以查看原始数据
4. **数据恢复**: 如果需要重新处理数据，可以使用原始JSON文件

## 注意事项

1. 原始JSON文件只在使用插件采集时才会生成
2. 每次采集都会生成新的原始JSON文件，不会覆盖之前的文件
3. 原始JSON文件包含完整的页面数据，文件大小可能较大
4. 建议定期清理过期的原始JSON文件以节省存储空间

## 测试

可以使用 `test/test-raw-json-save.html` 文件进行功能测试：

1. 打开测试页面
2. 测试应用连接状态
3. 查看文件结构说明
4. 进行实际采集测试

## 相关文件

- `hanli-plugin/collectionManager.js` - 采集管理器
- `hanli-plugin/content.js` - 内容脚本
- `hanli-app/server.js` - 服务端API
- `test/test-raw-json-save.html` - 功能测试页面
