# TopBarTabs 需求文档

## 1. 组件位置和显示
- TopBarTabs位于TopBar，且居中
- 最宽宽度不超过TopBar宽度的50%
- Tab不限制数量
- Tab数量过多，总宽度超过定义的容器最大宽度时，支持横向滚动，且不显示滚动条
- Tab的间距为6px

## 2. Tab样式和行为

### Tab默认状态
1. 由"页面类型图标"和"页面标题"组成
2. Tab背景色为透明度较高的颜色，倒角12px
3. 不同页面类型对应的图标，由每个页面定义"PageIcon"，尺寸为24x24px
4. **Tab宽度自适应**：根据内容自适应宽度，无最小宽度限制
5. **文字省略**：Tab文字超出250px宽度时使用省略号

### Tab鼠标悬浮状态
1. **默认状态下**：鼠标悬浮时，左侧类型图标切换为"x"关闭图标
2. **选中状态下**：鼠标悬浮时，保持显示"x"关闭图标
3. **当Tab数量只剩一个时**：无论是否悬浮，都显示类型图标，不显示"x"图标
4. "x"图标鼠标悬浮时，"x"图标的颜色透明度变高
5. **悬浮图标逻辑**：图标和关闭按钮在同一个位置，通过透明度切换显示/隐藏

### Tab当前被选中状态
1. 页面类型图标替换为"x"关闭图标
2. 点击可关闭Tab，关闭后，自动选中上一个Tab
3. **当Tab数量只剩一个时**：无论是否选中，都显示类型图标，不显示"x"图标，因为不支持关闭最后一个Tab
4. 选中某一个Tab时，其他页面为默认状态
5. Tab背景色为透明度较低的颜色，倒角12px
6. "x"图标默认透明度较低，鼠标悬浮到"x"图标时，图标颜色的透明度变高
7. 鼠标悬浮到当前选中的Tab时，暂时没有变化
8. 选中的Tab最小宽度为156px，最大宽度为200px


## 3. 交互逻辑

### 示例场景
侧边栏有"首页"、"Page1"、"Page2"

### 启动App
- 默认选中"首页"，Tab也是选中"首页"

### 页面切换
1. 当点击"Page1"，新增Page1的Tab，并选中该Tab，页面显示Page1内容
2. 当点击"Page2"，新增Page2的Tab，并选中该Tab，页面显示Page2内容
3. 可以通过切换"首页"、"Page1"、"Page2"的Tab，实现页面切换

## 4. 高级功能

### 拖拽排序
- 支持拖拽调整Tab顺序

### 键盘快捷键
- 支持关闭Tab的快捷键（如Ctrl+W）

## 5. 动画效果

### Tab宽度变化动画
- Tab切换时，宽度变化增加动画，2s的EaseInOut缓进缓出动画

### Tab位置移动动画
- 关闭Tab时，Tab的位置移动增加动画，2s的EaseInOut缓进缓出动画

## 6. 页面类型和图标定义

### 页面类型
每个页面都有一个type属性，用于标识页面类型：
- `home`: 首页
- `productDetail`: 产品详情页（更新名称）
- `goodsList`: 商品列表页
- 其他页面类型将在后续开发中定义

### 页面图标
不同页面类型对应不同的图标，使用Phosphor Icons：
- **首页图标**：`ph-house`
- **产品详情图标**：`ph-image`
- **产品库图标**：`ph-package`
- **关闭图标**：`ph-x`
- 图标支持主题切换（浅色/深色模式）

## 7. Tab关闭逻辑

### 关闭非当前Tab
- 关闭其他Tab时，不影响当前选中的Tab
- 当前选中的Tab保持不变

### 关闭当前Tab
- 关闭当前选中的Tab时，自动选中替代Tab
- 优先选择：从左边数，最近的一个Tab
- 备选方案：如果左边没有Tab，则从右边数，最近的一个Tab

## 8. Tab新增方式

### 当前支持
- 侧边栏点击新增Tab
- 产品库列表点击产品标题新增产品详情Tab

### 后续扩展
- 支持更多新增Tab的方式（如右键菜单、快捷键、URL参数等）

## 9. 产品详情Tab系统

### Tab区分机制
- **普通页面**：一个页面类型只有一个Tab（如首页、产品库）
- **产品详情页**：每个产品都有独立的Tab，根据商品ID区分
- **Tab查找**：使用 `findTabByPageTypeAndParam('productDetail', 'productId', goodsId)` 查找特定产品的Tab

### 产品详情Tab行为
1. **首次打开**：创建新的产品详情Tab
2. **重复打开**：切换到已存在的产品详情Tab
3. **Tab标题**：显示 "产品详情 - 产品名称"
4. **数据加载**：切换Tab时自动重新加载对应产品数据

### 技术实现
```javascript
// 产品详情Tab创建逻辑
openProductDetailTab(product) {
    const existingTab = this.tabManager.findTabByPageTypeAndParam('productDetail', 'productId', product.goodsId);
    if (existingTab) {
        // 切换到现有Tab
        this.tabManager.setActiveTab(existingTab.id);
    } else {
        // 创建新Tab
        const pageData = {
            type: 'productDetail',
            title: `产品详情 - ${product.goodsCat3}`,
            productId: product.goodsId
        };
        this.tabManager.addTab(pageData);
    }
}
```

## 备注
- 此文档为需求规格说明，具体实现代码将在后续开发阶段进行
