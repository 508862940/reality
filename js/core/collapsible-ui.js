/**
 * 🎭 可折叠UI系统
 * 管理上半部分(ABCDE区域)的折叠/展开
 */

class CollapsibleUI {
    constructor() {
        this.isCollapsed = false;
        this.touchStartY = null;
        this.isDragging = false;

        this.init();
    }

    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupElements());
        } else {
            this.setupElements();
        }
    }

    setupElements() {
        // 获取关键元素
        this.upperSection = document.querySelector('.upper-section');
        this.lowerSection = document.querySelector('.lower-section');
        this.collapseHandle = null;

        if (!this.upperSection) return;

        // 创建折叠手柄
        this.createCollapseHandle();

        // 绑定事件
        this.bindEvents();

        // PWA特殊处理
        this.setupPWASupport();

        // 恢复上次状态
        this.restoreState();

        console.log('📱 折叠UI系统已初始化');
    }

    /**
     * PWA专属优化
     */
    setupPWASupport() {
        // 检测是否在PWA模式
        const isPWA = window.matchMedia('(display-mode: standalone)').matches ||
                     window.navigator.standalone ||
                     document.referrer.includes('android-app://');

        if (isPWA) {
            console.log('🚀 PWA模式检测到，应用特殊优化');

            // PWA默认折叠（更好的移动体验）
            if (localStorage.getItem('pwa-first-run') !== 'false') {
                setTimeout(() => {
                    this.collapse();
                    localStorage.setItem('pwa-first-run', 'false');
                }, 1000);
            }

            // 适配安全区域（iPhone刘海屏）
            document.documentElement.style.setProperty(
                '--safe-area-top',
                'env(safe-area-inset-top, 20px)'
            );

            // 优化触摸响应
            this.optimizeTouchForPWA();
        }
    }

    /**
     * PWA触摸优化
     */
    optimizeTouchForPWA() {
        // 增加触摸区域
        if (this.collapseHandle) {
            this.collapseHandle.style.height = '40px';
            this.collapseHandle.style.touchAction = 'manipulation';
        }

        // 防止橡皮筋效果
        document.body.style.overscrollBehavior = 'contain';
    }

    /**
     * 创建折叠手柄（拖动条）
     */
    createCollapseHandle() {
        // 在上半部分底部添加拖动条
        const handle = document.createElement('div');
        handle.className = 'collapse-handle';
        handle.innerHTML = `
            <div class="handle-bar"></div>
            <div class="handle-icon">
                <svg width="24" height="12" viewBox="0 0 24 12" fill="currentColor">
                    <path d="M7 10l5-5 5 5" class="arrow-up" />
                    <path d="M7 2l5 5 5-5" class="arrow-down" style="display: none;" />
                </svg>
            </div>
        `;

        this.upperSection.appendChild(handle);
        this.collapseHandle = handle;

        // 添加折叠按钮到E区提醒栏
        this.addFloatingToggle();
    }

    /**
     * 添加浮动切换按钮
     */
    addFloatingToggle() {
        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'floating-toggle-btn';
        toggleBtn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 20 20">
                <path d="M5 7l5-5 5 5" stroke="currentColor" stroke-width="2" fill="none"/>
                <path d="M5 13l5 5 5-5" stroke="currentColor" stroke-width="2" fill="none"/>
            </svg>
        `;
        toggleBtn.title = '折叠/展开信息面板';

        // 添加到页面
        document.body.appendChild(toggleBtn);

        // 绑定点击事件
        toggleBtn.addEventListener('click', () => {
            this.toggle();
        });
    }

    /**
     * 绑定交互事件
     */
    bindEvents() {
        // 拖动条点击
        this.collapseHandle.addEventListener('click', () => {
            this.toggle();
        });

        // 触摸/拖动支持
        this.setupTouchSupport();

        // 键盘快捷键（Ctrl+Up）
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'ArrowUp') {
                e.preventDefault();
                this.toggle();
            }
        });
    }

    /**
     * 设置触摸支持（滑动手势）
     */
    setupTouchSupport() {
        // 在E区（提醒栏）添加滑动检测
        const reminderBar = document.querySelector('.reminder-bar');
        if (!reminderBar) return;

        let startY = 0;
        let currentY = 0;
        let deltaY = 0;

        // 触摸开始
        reminderBar.addEventListener('touchstart', (e) => {
            startY = e.touches[0].clientY;
            this.upperSection.style.transition = 'none';
        });

        // 触摸移动
        reminderBar.addEventListener('touchmove', (e) => {
            currentY = e.touches[0].clientY;
            deltaY = currentY - startY;

            // 向上滑动折叠，向下滑动展开
            if (Math.abs(deltaY) > 10) {
                e.preventDefault();

                // 实时预览效果
                if (deltaY < 0 && !this.isCollapsed) {
                    // 向上滑动预览折叠
                    const progress = Math.min(Math.abs(deltaY) / 200, 1);
                    this.previewCollapse(progress);
                } else if (deltaY > 0 && this.isCollapsed) {
                    // 向下滑动预览展开
                    const progress = Math.min(deltaY / 200, 1);
                    this.previewExpand(progress);
                }
            }
        });

        // 触摸结束
        reminderBar.addEventListener('touchend', (e) => {
            this.upperSection.style.transition = '';

            // 根据滑动距离决定是否触发折叠/展开
            if (Math.abs(deltaY) > 50) {
                if (deltaY < 0 && !this.isCollapsed) {
                    this.collapse();
                } else if (deltaY > 0 && this.isCollapsed) {
                    this.expand();
                } else {
                    // 恢复原状
                    this.isCollapsed ? this.collapse() : this.expand();
                }
            }
        });
    }

    /**
     * 折叠上半部分
     */
    collapse() {
        this.isCollapsed = true;
        this.upperSection.classList.add('collapsed');
        this.lowerSection.classList.add('expanded');

        // 更新箭头方向
        const arrowUp = this.collapseHandle.querySelector('.arrow-up');
        const arrowDown = this.collapseHandle.querySelector('.arrow-down');
        if (arrowUp) arrowUp.style.display = 'none';
        if (arrowDown) arrowDown.style.display = 'block';

        // 保存状态
        localStorage.setItem('ui-collapsed', 'true');

        // 触发自定义事件
        window.dispatchEvent(new CustomEvent('uiCollapsed', {
            detail: { isCollapsed: true }
        }));

        console.log('🎭 UI已折叠 - F区进入全屏模式');
    }

    /**
     * 展开上半部分
     */
    expand() {
        this.isCollapsed = false;
        this.upperSection.classList.remove('collapsed');
        this.lowerSection.classList.remove('expanded');

        // 更新箭头方向
        const arrowUp = this.collapseHandle.querySelector('.arrow-up');
        const arrowDown = this.collapseHandle.querySelector('.arrow-down');
        if (arrowUp) arrowUp.style.display = 'block';
        if (arrowDown) arrowDown.style.display = 'none';

        // 保存状态
        localStorage.setItem('ui-collapsed', 'false');

        // 触发自定义事件
        window.dispatchEvent(new CustomEvent('uiCollapsed', {
            detail: { isCollapsed: false }
        }));

        console.log('📊 UI已展开 - 显示完整信息面板');
    }

    /**
     * 切换折叠状态
     */
    toggle() {
        if (this.isCollapsed) {
            this.expand();
        } else {
            this.collapse();
        }
    }

    /**
     * 预览折叠效果（拖动时）
     */
    previewCollapse(progress) {
        const targetHeight = 60; // 折叠后高度
        const currentHeight = this.upperSection.offsetHeight;
        const newHeight = currentHeight - (currentHeight - targetHeight) * progress;

        this.upperSection.style.height = `${newHeight}px`;
    }

    /**
     * 预览展开效果（拖动时）
     */
    previewExpand(progress) {
        const targetHeight = window.innerHeight * 0.45; // 展开后高度
        const currentHeight = this.upperSection.offsetHeight;
        const newHeight = currentHeight + (targetHeight - currentHeight) * progress;

        this.upperSection.style.height = `${newHeight}px`;
    }

    /**
     * 获取折叠状态
     */
    getState() {
        return {
            isCollapsed: this.isCollapsed,
            upperHeight: this.upperSection?.offsetHeight,
            lowerHeight: this.lowerSection?.offsetHeight
        };
    }

    /**
     * 恢复上次的折叠状态
     */
    restoreState() {
        const savedState = localStorage.getItem('ui-collapsed');
        if (savedState === 'true') {
            this.collapse();
        }
    }
}

// 创建全局实例
window.collapsibleUI = new CollapsibleUI();

// 监听F区内容变化，智能决定是否折叠
window.addEventListener('sceneLoaded', (e) => {
    // 如果是长篇故事，自动折叠上半部分
    const storyText = document.querySelector('.story-text');
    if (storyText && storyText.textContent.length > 500) {
        window.collapsibleUI.collapse();
    }
});

console.log('📱 可折叠UI系统已加载');