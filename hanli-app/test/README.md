# Hanli App 测试页面

这个文件夹包含了Hanli App的所有功能测试页面，用于验证各个功能模块的正确性。

## 📁 文件结构

```
test/
├── index.html                          # 测试页面索引（主入口）
├── README.md                           # 本说明文件
├── test-app-launch.html               # App启动测试
├── test-app-startup.html              # App启动流程测试
├── test-button-status.html            # 按钮状态测试
├── test-collection.html               # 数据采集测试
├── test-debug-fetch.html              # Fetch调试测试
├── test-plugin-fetch.html             # 插件Fetch测试
├── test-plugin-launch.html            # 插件启动测试
├── test-product-count-refresh.html    # 产品总数刷新测试
├── test-product-detail-api.html       # 产品详情API测试
├── test-product-detail.html           # 产品详情测试
├── test-product-library-features.html # 产品库功能测试
├── test-product-library.html          # 产品库基础测试
├── test-protocol.html                 # 协议测试
├── test-settings-interaction.html     # 设置交互测试
├── test-settings-modal.html           # 设置弹窗测试
├── test-simple-fetch.html             # 简单Fetch测试
├── test-plugin-modal.html             # 插件弹窗测试
├── test-topbar-adjustments.html       # TopBar调整测试
├── test-window-size.html              # 窗口大小测试
├── test-monitoring-features.html      # 监控功能完整测试
├── test-monitor-collection.html       # 监控数据采集测试
├── test-timeout-mechanism.html        # 超时机制测试
├── test-theme-adaptation.html         # 主题适配测试
├── test-monitoring-json-format.html   # 监控数据格式测试
├── test-products-list-api.html        # 商品清单API测试
├── test-today-collection-status.html  # 今日采集状态测试
└── test-auto-refresh.html             # 自动刷新机制测试
```

## 🚀 快速开始

1. **打开测试索引页面**：
   ```bash
   open hanli-app/test/index.html
   ```

2. **选择要测试的功能**：
   - 点击相应的测试页面链接
   - 按照页面提示进行测试

3. **查看测试结果**：
   - 每个测试页面都有详细的日志输出
   - 绿色表示成功，红色表示失败

## 📋 测试分类

### 🔌 插件功能测试
- **test-plugin-fetch.html**: 测试插件与App的fetch连接
- **test-plugin-launch.html**: 测试插件启动App功能
- **test-collection.html**: 测试数据采集功能
- **test-debug-fetch.html**: 调试fetch请求过程
- **test-simple-fetch.html**: 基础fetch功能测试

### 📱 App功能测试
- **test-app-launch.html**: 测试App启动和窗口管理
- **test-app-startup.html**: 测试完整启动流程
- **test-window-size.html**: 测试窗口大小和最大化
- **test-button-status.html**: 测试按钮交互状态

### 📊 数据功能测试
- **test-product-count-refresh.html**: 测试产品总数自动刷新
- **test-product-library.html**: 测试产品库基础显示
- **test-product-library-features.html**: 测试产品库完整功能
- **test-product-detail.html**: 测试产品详情页面
- **test-product-detail-api.html**: 测试产品详情API

### 🎨 界面功能测试
- **test-topbar-adjustments.html**: 测试TopBar调整
- **test-settings-modal.html**: 测试系统设置弹窗
- **test-settings-interaction.html**: 测试设置弹窗交互

### 🔧 协议和通信测试
- **test-protocol.html**: 测试hanliapp://协议功能

### 📊 监控功能测试
- **test-monitoring-features.html**: 监控功能完整测试（推荐入口）
- **test-monitor-collection.html**: 监控数据采集页面测试
- **test-timeout-mechanism.html**: 超时机制测试（20秒超时，3秒检查）
- **test-theme-adaptation.html**: 主题适配测试（浅色/深色模式）
- **test-monitoring-json-format.html**: 监控数据格式验证测试
- **test-products-list-api.html**: 商品清单API测试
- **test-today-collection-status.html**: 今日采集状态检查测试
- **test-auto-refresh.html**: 自动刷新机制测试

## 🛠️ 使用方法

### 1. 单个功能测试
```bash
# 直接打开特定测试页面
open hanli-app/test/test-product-library-features.html
```

### 2. 批量测试
```bash
# 打开测试索引页面，然后点击"打开所有测试"
open hanli-app/test/index.html
```

### 3. 开发调试
```bash
# 启动App服务器
cd hanli-app
npm start

# 在另一个终端打开测试页面
open hanli-app/test/index.html
```

## 📝 测试说明

### 测试页面特点
- **独立运行**: 每个测试页面都可以独立运行
- **详细日志**: 提供详细的测试过程和结果日志
- **实时反馈**: 测试结果实时显示，便于调试
- **模拟数据**: 使用模拟数据进行测试，不依赖真实数据

### 测试结果解读
- **绿色日志**: 测试通过，功能正常
- **红色日志**: 测试失败，需要检查
- **蓝色日志**: 信息提示，测试过程记录

### 常见问题
1. **测试页面无法加载**: 确保App服务器正在运行
2. **样式显示异常**: 检查CSS文件路径是否正确
3. **功能测试失败**: 查看控制台错误信息，检查相关代码

## 🔄 更新维护

### 添加新测试页面
1. 在test文件夹中创建新的HTML文件
2. 按照现有格式编写测试代码
3. 在index.html中添加链接
4. 更新本README文件

### 修改现有测试
1. 直接编辑对应的HTML文件
2. 测试修改后的功能
3. 更新相关文档

## 📞 技术支持

如果在使用测试页面时遇到问题，请：
1. 查看浏览器控制台的错误信息
2. 检查App服务器是否正常运行
3. 确认相关功能代码是否正确
4. 参考现有测试页面的实现方式

---

**注意**: 这些测试页面仅用于开发和调试，请勿在生产环境中使用。
