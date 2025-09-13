/**
 * 需求文档弹窗组件
 * 提供需求文档查看功能的弹窗界面
 */
class RequirementsModal {
    constructor(app) {
        this.app = app;
        this.isVisible = false;
        this.element = null;
        this.currentDoc = null;
        
        this.init();
    }

    /**
     * 初始化组件
     */
    init() {
        this.createElement();
        this.bindEvents();
        this.loadRequirementsContent();
    }

    /**
     * 创建DOM元素
     */
    createElement() {
        this.element = document.createElement('div');
        this.element.className = 'requirements-modal';
        this.element.id = 'requirementsModal';
        this.element.style.display = 'none';
        
        this.element.innerHTML = `
            <div class="requirements-modal-content">
                <div class="requirements-modal-header">
                    <h3>需求文档</h3>
                    <button class="requirements-close-btn" id="requirementsCloseBtn" title="关闭文档">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                </div>
                <div class="requirements-modal-body">
                    <div class="requirements-content" id="requirementsContent">
                        <!-- 文档内容将在这里动态生成 -->
                    </div>
                </div>
            </div>
        `;
        
        // 添加到body
        document.body.appendChild(this.element);
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        // 关闭按钮
        const closeBtn = this.element.querySelector('#requirementsCloseBtn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.hide();
            });
        }

        // 点击背景关闭
        this.element.addEventListener('click', (e) => {
            if (e.target === this.element) {
                this.hide();
            }
        });
    }

    /**
     * 显示弹窗
     */
    show() {
        this.element.style.display = 'flex';
        this.isVisible = true;
        this.loadRequirementsContent();
    }

    /**
     * 隐藏弹窗
     */
    hide() {
        this.element.style.display = 'none';
        this.isVisible = false;
    }

    /**
     * 切换弹窗显示状态
     */
    toggle() {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }

    /**
     * 加载需求文档内容
     */
    loadRequirementsContent() {
        const content = this.element.querySelector('#requirementsContent');
        if (!content) return;

        // 显示加载状态
        content.innerHTML = `
            <div class="loading">
                <div class="loading-spinner"></div>
                加载文档中...
            </div>
        `;

        // 模拟加载文档内容
        setTimeout(() => {
            this.renderRequirementsContent();
        }, 500);
    }

    /**
     * 渲染需求文档内容
     */
    renderRequirementsContent() {
        const content = this.element.querySelector('#requirementsContent');
        if (!content) return;

        content.innerHTML = `
            <div class="requirements-container">
                <div class="requirements-sidebar">
                    <h3>项目文档</h3>
                    <div class="doc-tree">
                        <div class="doc-folder">
                            <div class="folder-header" onclick="this.parentElement.classList.toggle('expanded')">
                                <span class="folder-icon">📁</span>
                                <span>产品库模块</span>
                            </div>
                            <div class="folder-content">
                                <div class="doc-item" data-doc="图片管理">
                                    <span class="doc-icon">📄</span>
                                    <span>图片管理</span>
                                </div>
                                <div class="doc-item" data-doc="新建产品">
                                    <span class="doc-icon">📄</span>
                                    <span>新建产品</span>
                                </div>
                            </div>
                        </div>
                        <div class="doc-folder">
                            <div class="folder-header" onclick="this.parentElement.classList.toggle('expanded')">
                                <span class="folder-icon">📁</span>
                                <span>采集模块</span>
                            </div>
                            <div class="folder-content">
                                <div class="doc-item" data-doc="采集文本">
                                    <span class="doc-icon">📄</span>
                                    <span>采集文本</span>
                                </div>
                                <div class="doc-item" data-doc="采集图片">
                                    <span class="doc-icon">📄</span>
                                    <span>采集图片</span>
                                </div>
                            </div>
                        </div>
                        <div class="doc-folder">
                            <div class="folder-header" onclick="this.parentElement.classList.toggle('expanded')">
                                <span class="folder-icon">📁</span>
                                <span>监控模块</span>
                            </div>
                            <div class="folder-content">
                                <div class="doc-item" data-doc="数据图表">
                                    <span class="doc-icon">📄</span>
                                    <span>数据图表</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="requirements-main">
                    <div class="doc-viewer">
                        <div class="empty-state">
                            <div class="empty-icon">📄</div>
                            <p>请从左侧选择一个文档查看</p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // 绑定文档项点击事件
        this.bindDocumentEvents();
    }

    /**
     * 绑定文档事件
     */
    bindDocumentEvents() {
        const docItems = this.element.querySelectorAll('.doc-item');
        docItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const docName = item.dataset.doc;
                this.loadDocument(docName);
                this.setActiveDoc(item);
            });
        });
    }

    /**
     * 加载具体文档
     */
    loadDocument(docName) {
        const viewer = this.element.querySelector('.doc-viewer');
        if (!viewer) return;

        // 显示加载状态
        viewer.innerHTML = `
            <div class="loading">
                <div class="loading-spinner"></div>
                加载文档中...
            </div>
        `;

        // 模拟加载文档内容
        setTimeout(() => {
            this.renderDocument(docName);
        }, 300);
    }

    /**
     * 渲染具体文档内容
     */
    renderDocument(docName) {
        const viewer = this.element.querySelector('.doc-viewer');
        if (!viewer) return;

        // 获取文档内容
        const docContent = this.getDocumentContent(docName);
        
        viewer.innerHTML = `
            <div class="doc-content">
                <h2>${docName}</h2>
                <div class="doc-body">
                    ${docContent}
                </div>
            </div>
        `;

        this.currentDoc = docName;
    }

    /**
     * 获取文档内容
     */
    getDocumentContent(docName) {
        const contents = {
            '图片管理': `
                <h3>一、更新日志</h3>
                <table>
                    <tr><th>日期</th><th>更新内容</th><th>更新人</th></tr>
                    <tr><td>2025-09-12</td><td>初始版本</td><td>[姓名]</td></tr>
                </table>
                
                <h3>二、需求概述</h3>
                <h4>2-1 背景</h4>
                <p><strong>场景</strong>：用户在商品库中需要管理商品的图片资源，包括上传、删除、排序、预览等操作</p>
                <p><strong>问题</strong>：当前缺乏统一的图片管理界面，用户无法方便地管理商品图片</p>
                <p><strong>用户诉求</strong>：希望能够直观地管理商品图片，支持批量操作和图片预览</p>
                <p><strong>功能目标</strong>：提供完整的图片管理功能，提升商品数据管理效率</p>
                
                <h4>2-2 功能价值</h4>
                <p><strong>业务价值</strong>：提升商品数据管理效率，减少人工操作成本</p>
                <p><strong>用户价值</strong>：提供直观易用的图片管理界面，提升用户体验</p>
                
                <h3>三、功能需求</h3>
                <h4>3-1 图片上传</h4>
                <ul>
                    <li>支持拖拽上传：用户可以直接将图片文件拖拽到上传区域</li>
                    <li>支持点击选择：用户可以通过点击按钮选择文件</li>
                    <li>支持多文件上传：一次可以选择多个图片文件</li>
                    <li>支持图片格式：JPG, JPEG, PNG, GIF, WebP, BMP, TIFF, TIF, SVG, ICO, HEIC, HEIF, AVIF, JFIF, PJPG, PJP</li>
                    <li>文件大小限制：单个文件不超过10MB</li>
                    <li>上传进度显示：显示上传进度和状态</li>
                </ul>
                
                <h4>3-2 图片预览</h4>
                <ul>
                    <li>网格布局：以网格形式展示所有图片</li>
                    <li>缩略图显示：显示图片的缩略图</li>
                    <li>点击放大：点击图片可以放大查看</li>
                    <li>图片缩放：支持鼠标滚轮缩放图片</li>
                    <li>图片旋转：支持90度旋转图片</li>
                    <li>全屏查看：支持全屏模式查看图片</li>
                </ul>
                
                <h4>3-3 图片管理</h4>
                <ul>
                    <li>图片删除：支持单个删除和批量删除</li>
                    <li>图片排序：支持拖拽调整图片顺序</li>
                    <li>图片重命名：支持修改图片文件名</li>
                    <li>图片信息：显示图片大小、尺寸、格式等信息</li>
                    <li>选择模式：支持多选图片进行批量操作</li>
                </ul>
            `,
            '新建产品': `
                <h3>一、更新日志</h3>
                <table>
                    <tr><th>日期</th><th>更新内容</th><th>更新人</th></tr>
                    <tr><td>2025-09-12</td><td>初始版本</td><td>[姓名]</td></tr>
                </table>
                
                <h3>二、需求概述</h3>
                <h4>2-1 背景</h4>
                <p><strong>场景</strong>：用户需要在商品库中创建新的产品记录，录入产品的基本信息</p>
                <p><strong>问题</strong>：缺乏标准化的产品创建流程和表单验证</p>
                <p><strong>用户诉求</strong>：希望能够快速准确地录入产品信息，避免数据错误</p>
                <p><strong>功能目标</strong>：提供完整的产品创建功能，确保数据质量和一致性</p>
                
                <h3>三、功能需求</h3>
                <h4>3-1 产品信息录入</h4>
                <ul>
                    <li>产品名称：必填，最大长度100字符</li>
                    <li>产品描述：可选，最大长度500字符</li>
                    <li>产品价格：必填，RMB单位，支持小数点后2位</li>
                    <li>产品重量：必填，g单位，支持小数点后2位</li>
                    <li>产品尺寸：必填，mm单位，格式：长x宽x高</li>
                    <li>产品分类：必填，从预设分类中选择</li>
                    <li>产品标签：可选，支持多个标签，用逗号分隔</li>
                </ul>
                
                <h4>3-2 产品ID生成</h4>
                <ul>
                    <li>自动生成：系统自动生成12位数字ID</li>
                    <li>唯一性检查：确保ID在系统中唯一</li>
                    <li>手动修改：支持用户手动修改ID</li>
                    <li>格式验证：确保ID为12位数字</li>
                </ul>
            `,
            '采集文本': `
                <h3>一、更新日志</h3>
                <table>
                    <tr><th>日期</th><th>更新内容</th><th>更新人</th></tr>
                    <tr><td>2025-09-12</td><td>初始版本</td><td>[姓名]</td></tr>
                </table>
                
                <h3>二、需求概述</h3>
                <h4>2-1 背景</h4>
                <p><strong>场景</strong>：用户在浏览Temu等电商网站时，需要采集商品页面的文本信息</p>
                <p><strong>问题</strong>：手动复制粘贴商品信息效率低下，容易出错</p>
                <p><strong>用户诉求</strong>：希望能够自动采集商品页面的文本数据，提高采集效率</p>
                <p><strong>功能目标</strong>：通过Chrome插件实现自动化的文本数据采集</p>
                
                <h3>三、功能需求</h3>
                <h4>3-1 文本提取</h4>
                <ul>
                    <li>CSS选择器：支持使用CSS选择器定位元素</li>
                    <li>XPath定位：支持使用XPath表达式定位元素</li>
                    <li>正则表达式：支持使用正则表达式匹配文本</li>
                    <li>多元素提取：支持同时提取多个元素的内容</li>
                    <li>属性提取：支持提取元素的属性值</li>
                </ul>
                
                <h4>3-2 数据清洗</h4>
                <ul>
                    <li>HTML标签清理：去除HTML标签，保留纯文本</li>
                    <li>空白字符处理：去除多余的空格、换行符</li>
                    <li>数字格式化：统一数字格式（价格、重量等）</li>
                    <li>编码处理：统一文本编码格式</li>
                    <li>特殊字符处理：处理特殊字符和符号</li>
                </ul>
            `,
            '采集图片': `
                <h3>一、更新日志</h3>
                <table>
                    <tr><th>日期</th><th>更新内容</th><th>更新人</th></tr>
                    <tr><td>2025-09-12</td><td>初始版本</td><td>[姓名]</td></tr>
                </table>
                
                <h3>二、需求概述</h3>
                <h4>2-1 背景</h4>
                <p><strong>场景</strong>：用户在浏览商品页面时，需要采集商品的高质量图片</p>
                <p><strong>问题</strong>：手动保存图片效率低，图片质量无法保证</p>
                <p><strong>用户诉求</strong>：希望能够批量采集商品图片，保持原始质量</p>
                <p><strong>功能目标</strong>：通过Chrome插件实现自动化的图片采集和下载</p>
                
                <h3>三、功能需求</h3>
                <h4>3-1 图片识别</h4>
                <ul>
                    <li>CSS选择器：支持使用CSS选择器定位图片元素</li>
                    <li>图片属性：支持根据src、data-src等属性识别图片</li>
                    <li>图片过滤：过滤掉装饰性图片，只采集商品相关图片</li>
                    <li>图片去重：自动去除重复的图片</li>
                    <li>图片质量：优先选择高质量图片</li>
                </ul>
                
                <h4>3-2 图片下载</h4>
                <ul>
                    <li>批量下载：支持同时下载多张图片</li>
                    <li>下载进度：显示下载进度和状态</li>
                    <li>重试机制：下载失败时自动重试</li>
                    <li>超时处理：设置下载超时时间</li>
                    <li>并发控制：控制同时下载的图片数量</li>
                </ul>
            `,
            '数据图表': `
                <h3>一、更新日志</h3>
                <table>
                    <tr><th>日期</th><th>更新内容</th><th>更新人</th></tr>
                    <tr><td>2025-09-12</td><td>初始版本</td><td>[姓名]</td></tr>
                </table>
                
                <h3>二、需求概述</h3>
                <h4>2-1 背景</h4>
                <p><strong>场景</strong>：用户需要查看商品数据的统计图表，了解数据趋势和分布情况</p>
                <p><strong>问题</strong>：缺乏数据可视化功能，无法直观地分析商品数据</p>
                <p><strong>用户诉求</strong>：希望能够通过图表直观地查看数据统计和趋势</p>
                <p><strong>功能目标</strong>：提供丰富的数据图表功能，支持多种图表类型</p>
                
                <h3>三、功能需求</h3>
                <h4>3-1 图表类型</h4>
                <ul>
                    <li>折线图：展示价格、销量等数据的时间趋势</li>
                    <li>柱状图：对比不同商品或时间段的数据</li>
                    <li>饼图：展示分类占比、来源分布等</li>
                    <li>散点图：展示价格与销量的关系</li>
                    <li>面积图：展示数据累积效果</li>
                </ul>
                
                <h4>3-2 数据筛选</h4>
                <ul>
                    <li>时间范围：支持选择时间范围（日、周、月、年）</li>
                    <li>商品分类：支持按商品分类筛选</li>
                    <li>价格区间：支持按价格区间筛选</li>
                    <li>自定义条件：支持自定义筛选条件</li>
                    <li>多条件组合：支持多个条件组合筛选</li>
                </ul>
            `
        };
        
        return contents[docName] || '<p>文档内容加载中...</p>';
    }

    /**
     * 设置活动文档
     */
    setActiveDoc(activeItem) {
        // 移除所有活动状态
        const docItems = this.element.querySelectorAll('.doc-item');
        docItems.forEach(item => {
            item.classList.remove('active');
        });
        // 设置当前活动项
        activeItem.classList.add('active');
    }

    /**
     * 销毁组件
     */
    destroy() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
        this.element = null;
        this.isVisible = false;
        this.currentDoc = null;
    }
}

// 导出组件
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RequirementsModal;
} else {
    window.RequirementsModal = RequirementsModal;
}
