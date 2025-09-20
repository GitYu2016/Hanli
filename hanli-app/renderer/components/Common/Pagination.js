/**
 * Pagination 组件
 * 负责分页功能的渲染和交互
 * 样式定义在JavaScript中，通过StyleManager管理
 */
class Pagination {
    constructor(containerId = 'pagination-container') {
        this.containerId = containerId;
        this.paginationData = {
            totalItems: 0,
            currentPage: 1,
            itemsPerPage: 100,
            totalPages: 1
        };
        this.onPageChange = null; // 页面变化回调函数
        this.initStyles();
        this.init();
    }

    /**
     * 初始化Pagination样式
     */
    initStyles() {
        // 确保StyleManager已加载
        if (typeof window.styleManager === 'undefined') {
            console.error('StyleManager未加载，请确保已引入StyleManager.js');
            return;
        }

        const styles = {
            // 分页容器
            '.pagination-container': {
                'position': 'absolute',
                'bottom': '20px',
                'right': '28px',
                'display': 'flex',
                'align-items': 'center',
                'justify-content': 'center',
                'padding': '2px 16px',
                'background-color': 'var(--color-background-normal)',
                'z-index': '1000',
                'border-radius': '24px'
            },

            // 分页内容
            '.pagination-content': {
                'display': 'flex',
                'align-items': 'center',
                'justify-content': 'space-between',
                'width': '100%',
                'max-width': '1200px',
                'gap': '16px',
                'font-size': '12px'
            },

            // 分页总数
            '.pagination-total': {
                'color': 'var(--color-text-primary)',
                'font-size': '12px',
                'flex-shrink': '0'
            },

            '.pagination-total strong': {
                'font-weight': '600',
                'color': 'var(--color-text-primary)'
            },

            // 分页控件
            '.pagination-controls': {
                'display': 'flex',
                'align-items': 'center',
                'gap': '12px',
                'flex-shrink': '0'
            },

            // 分页按钮
            '.pagination-btn': {
                'background': 'transparent',
                'border': '1px solid var(--color-border-normal)',
                'color': 'var(--color-text-primary)',
                'padding': '6px 12px',
                'border-radius': '6px',
                'cursor': 'pointer',
                'transition': 'all 0.2s ease',
                'font-size': '12px',
                'white-space': 'nowrap'
            },

            '.pagination-btn:hover:not(:disabled)': {
                'background-color': 'var(--color-background-focused)',
                'border-color': 'var(--color-primary)',
                'color': 'var(--color-primary)'
            },

            '.pagination-btn:disabled': {
                'opacity': '0.4',
                'cursor': 'not-allowed'
            },

            // 分页跳转
            '.pagination-jump': {
                'display': 'flex',
                'align-items': 'center',
                'gap': '4px',
                'font-size': '12px',
                'white-space': 'nowrap'
            },

            '.pagination-jump input': {
                'width': '40px',
                'height': '18px',
                'border': '1px solid var(--color-border-normal)',
                'border-radius': 'var(--radius-small)',
                'background-color': 'var(--color-background-normal)',
                'color': 'var(--color-text-primary)',
                'text-align': 'center',
                'font-size': '12px',
                'padding': '0 4px'
            },

            '.pagination-jump input:focus': {
                'outline': 'none',
                'background-color': 'var(--color-background-focused)',
                'border-color': 'var(--color-primary)',
                'color': 'var(--color-text-primary)'
            },

            '.pagination-jump input::placeholder': {
                'color': 'var(--color-text-secondary)'
            },

            // 响应式设计
            '@media (max-width: 768px)': {
                '.pagination-container': {
                    'padding': '16px'
                },
                '.pagination-content': {
                    'flex-direction': 'column',
                    'gap': '12px'
                },
                '.pagination-controls': {
                    'gap': '8px'
                },
                '.pagination-btn': {
                    'padding': '4px 8px',
                    'font-size': '11px'
                }
            }
        };

        // 应用样式
        window.styleManager.defineStyles('Pagination', styles);
    }

    /**
     * 初始化组件
     */
    async init() {
        this.render();
        // render方法中已经调用了bindEvents，这里不需要重复调用
        
        // 尝试从全局ProductDataManager获取产品总数
        await this.loadGlobalProductCount();
    }

    /**
     * 从全局ProductDataManager加载产品总数
     */
    async loadGlobalProductCount() {
        if (window.productDataManager && !window.productDataManager.lastProductCount) {
            try {
                await window.productDataManager.loadProductCount();
            } catch (error) {
                console.warn('Pagination: 无法从全局ProductDataManager获取产品总数:', error);
            }
        }
    }

    /**
     * 渲染分页组件
     */
    render() {
        const container = document.getElementById(this.containerId);
        if (!container) {
            console.error(`分页容器 ${this.containerId} 不存在`);
            return;
        }

        container.innerHTML = `
            <div class="pagination-content">
                <span class="pagination-total">
                    共 <strong id="pagination-total">0</strong> 条
                    <span id="pagination-filtered-info" style="display: none;">
                        （当前筛选：<strong id="pagination-filtered">0</strong> 条）
                    </span>
                </span>
                <div class="pagination-controls" id="pagination-controls" style="display: none;">
                    <button id="pagination-prev" class="pagination-btn" disabled>
                         上一页
                    </button>
                    <div class="pagination-jump" id="pagination-jump" style="display: none;">
                        跳转到 <input type="number" id="pagination-input" min="1" max="1" value="1"> 页
                    </div>
                    <button id="pagination-next" class="pagination-btn" disabled>
                        下一页 
                    </button>
                </div>
            </div>
        `;
        
        // 重新绑定事件
        this.bindEvents();
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        // 先移除旧的事件监听器
        this.unbindEvents();
        
        // 上一页按钮
        const prevBtn = document.getElementById('pagination-prev');
        if (prevBtn) {
            this.prevBtnHandler = () => {
                this.goToPage(this.paginationData.currentPage - 1);
            };
            prevBtn.addEventListener('click', this.prevBtnHandler);
        }

        // 下一页按钮
        const nextBtn = document.getElementById('pagination-next');
        if (nextBtn) {
            this.nextBtnHandler = () => {
                this.goToPage(this.paginationData.currentPage + 1);
            };
            nextBtn.addEventListener('click', this.nextBtnHandler);
        }

        // 跳转输入框
        const jumpInput = document.getElementById('pagination-input');
        if (jumpInput) {
            this.jumpInputHandler = (e) => {
                if (e.key === 'Enter') {
                    const page = parseInt(e.target.value);
                    if (page >= 1 && page <= this.paginationData.totalPages) {
                        this.goToPage(page);
                    }
                }
            };
            jumpInput.addEventListener('keypress', this.jumpInputHandler);
        }
    }

    /**
     * 解绑事件
     */
    unbindEvents() {
        const prevBtn = document.getElementById('pagination-prev');
        if (prevBtn && this.prevBtnHandler) {
            prevBtn.removeEventListener('click', this.prevBtnHandler);
            this.prevBtnHandler = null;
        }

        const nextBtn = document.getElementById('pagination-next');
        if (nextBtn && this.nextBtnHandler) {
            nextBtn.removeEventListener('click', this.nextBtnHandler);
            this.nextBtnHandler = null;
        }

        const jumpInput = document.getElementById('pagination-input');
        if (jumpInput && this.jumpInputHandler) {
            jumpInput.removeEventListener('keypress', this.jumpInputHandler);
            this.jumpInputHandler = null;
        }
    }

    /**
     * 更新分页数据
     * @param {Object} data - 分页数据
     */
    updatePagination(data) {
        // 如果没有提供totalItems，尝试从全局ProductDataManager获取
        let totalItems = data.totalItems || 0;
        if (totalItems === 0 && window.productDataManager && window.productDataManager.lastProductCount) {
            totalItems = window.productDataManager.lastProductCount;
        }
        
        // 获取筛选后的数量（如果有的话）
        const filteredItems = data.filteredItems || null;
        
        this.paginationData = {
            totalItems: totalItems,
            filteredItems: filteredItems,
            currentPage: data.currentPage || 1,
            itemsPerPage: data.itemsPerPage || 100,
            totalPages: Math.ceil((filteredItems !== null ? filteredItems : totalItems) / (data.itemsPerPage || 100))
        };

        this.renderPagination();
    }

    /**
     * 渲染分页组件
     */
    renderPagination() {
        const container = document.getElementById(this.containerId);
        const totalEl = document.getElementById('pagination-total');
        const filteredInfoEl = document.getElementById('pagination-filtered-info');
        const filteredEl = document.getElementById('pagination-filtered');
        const controlsEl = document.getElementById('pagination-controls');
        const jumpEl = document.getElementById('pagination-jump');
        const prevBtn = document.getElementById('pagination-prev');
        const nextBtn = document.getElementById('pagination-next');
        const inputEl = document.getElementById('pagination-input');

        if (!container) return;

        // 更新总数
        if (totalEl) {
            totalEl.textContent = this.paginationData.totalItems.toLocaleString();
        }

        // 更新筛选信息
        if (filteredInfoEl && filteredEl) {
            if (this.paginationData.filteredItems !== null && this.paginationData.filteredItems !== this.paginationData.totalItems) {
                filteredEl.textContent = this.paginationData.filteredItems.toLocaleString();
                filteredInfoEl.style.display = 'inline';
            } else {
                filteredInfoEl.style.display = 'none';
            }
        }

        // 如果只有一页，隐藏翻页控件
        if (this.paginationData.totalPages <= 1) {
            container.style.display = 'none';
            return;
        }

        // 显示翻页控件
        container.style.display = 'flex';
        if (controlsEl) {
            controlsEl.style.display = 'flex';
        }

        // 只有超过5页时才显示跳转功能
        if (jumpEl) {
            if (this.paginationData.totalPages > 5) {
                jumpEl.style.display = 'flex';
            } else {
                jumpEl.style.display = 'none';
            }
        }

        // 更新按钮状态
        if (prevBtn) {
            prevBtn.disabled = this.paginationData.currentPage <= 1;
        }
        if (nextBtn) {
            nextBtn.disabled = this.paginationData.currentPage >= this.paginationData.totalPages;
        }

        // 更新输入框
        if (inputEl) {
            inputEl.value = this.paginationData.currentPage;
            inputEl.max = this.paginationData.totalPages;
        }
    }

    /**
     * 跳转到指定页面
     * @param {number} page - 页码
     */
    goToPage(page) {
        if (page < 1 || page > this.paginationData.totalPages) return;

        this.paginationData.currentPage = page;
        this.renderPagination();

        // 触发页面变化回调
        if (this.onPageChange && typeof this.onPageChange === 'function') {
            this.onPageChange(page, this.paginationData);
        }
    }

    /**
     * 设置页面变化回调函数
     * @param {Function} callback - 回调函数
     */
    setOnPageChange(callback) {
        this.onPageChange = callback;
    }

    /**
     * 显示分页组件
     */
    show() {
        const container = document.getElementById(this.containerId);
        if (container) {
            container.style.display = 'flex';
        }
    }

    /**
     * 隐藏分页组件
     */
    hide() {
        const container = document.getElementById(this.containerId);
        if (container) {
            container.style.display = 'none';
        }
    }

    /**
     * 获取当前分页数据
     * @returns {Object} 分页数据
     */
    getPaginationData() {
        return { ...this.paginationData };
    }

    /**
     * 销毁组件
     */
    destroy() {
        // 解绑所有事件
        this.unbindEvents();
        
        const container = document.getElementById(this.containerId);
        if (container) {
            container.innerHTML = '';
        }
        this.onPageChange = null;
        
        // 清理事件处理器引用
        this.prevBtnHandler = null;
        this.nextBtnHandler = null;
        this.jumpInputHandler = null;
    }
}
