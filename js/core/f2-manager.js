/**
 * F2区管理器
 * 管理场景控制按钮和AI输入模式的切换
 */

class F2Manager {
    constructor() {
        this.currentMode = 'scene'; // 'scene' 或 'ai'
        this.continueEnabled = false;
        this.resetCount = 0;
        this.maxResets = 1;

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
        // 获取元素
        this.aiInputArea = document.getElementById('aiInputArea');
        this.sceneControlArea = document.getElementById('sceneControlArea');

        // 如果没有场景控制区，创建它
        if (!this.sceneControlArea) {
            this.createSceneControlArea();
        }

        // 默认显示场景模式
        this.switchToSceneMode();
    }

    /**
     * 创建场景控制区
     */
    createSceneControlArea() {
        const lowerSection = document.querySelector('.lower-section');
        if (!lowerSection) return;

        // 在AI输入区之前插入场景控制区
        const controlHTML = `
            <div class="scene-control-area" id="sceneControlArea">
                <button class="control-btn continue-btn" id="continueBtn" onclick="f2Manager.handleContinue()" title="继续">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="M6 12h12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        <path d="M12 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>
                <button class="control-btn reset-btn" id="resetBtn" onclick="f2Manager.handleReset()" title="重置">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="M4 12a8 8 0 1 0 2.343-5.657" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        <path d="M4 6v5h5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>
                <button class="control-btn zoom-btn" id="zoomBtn" onclick="f2Manager.toggleIllustration()" title="查看插图">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <circle cx="10.5" cy="10.5" r="5.5" stroke="currentColor" stroke-width="2"/>
                        <path d="M15.5 15.5 20 20" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                    <span class="has-illustration-indicator" id="illustrationIndicator"></span>
                </button>
                <button class="control-btn more-btn" id="moreBtn" onclick="f2Manager.toggleQuickMenu()" title="更多功能">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <circle cx="12" cy="5" r="2" fill="currentColor"/>
                        <circle cx="12" cy="12" r="2" fill="currentColor"/>
                        <circle cx="12" cy="19" r="2" fill="currentColor"/>
                    </svg>
                </button>
                <span class="reset-hint" id="resetHint">可重置</span>
            </div>

        `;

        // 插入到AI输入区之前
        if (this.aiInputArea) {
            this.aiInputArea.insertAdjacentHTML('beforebegin', controlHTML);
        } else {
            lowerSection.insertAdjacentHTML('beforeend', controlHTML);
        }

        // 插入快捷菜单和遮罩层
        const menuHTML = `
            <!-- 快捷菜单遮罩层 -->
            <div class="quick-menu-overlay" id="quickMenuOverlay" style="display: none;" onclick="f2Manager.closeQuickMenu()"></div>

            <!-- 快捷菜单 -->
            <div class="quick-menu" id="quickMenu" style="display: none;">
                <div class="quick-menu-content">
                    <button class="quick-menu-item" data-action="quickSave">
                        <span class="quick-icon">💾</span>
                        <span class="quick-text">快速存档</span>
                    </button>
                    <button class="quick-menu-item" data-action="loadSave">
                        <span class="quick-icon">📁</span>
                        <span class="quick-text">读取存档</span>
                    </button>
                    <button class="quick-menu-item" data-action="showHistory">
                        <span class="quick-icon">📜</span>
                        <span class="quick-text">历史记录</span>
                    </button>
                    <button class="quick-menu-item" data-action="toggleAutoMode">
                        <span class="quick-icon">⚡</span>
                        <span class="quick-text">自动模式</span>
                    </button>
                </div>
            </div>
        `;
        lowerSection.insertAdjacentHTML('beforeend', menuHTML);

        this.sceneControlArea = document.getElementById('sceneControlArea');
        this.initQuickMenuEvents();
    }

    /**
     * 初始化快捷菜单事件
     */
    initQuickMenuEvents() {
        const menuContent = document.querySelector('.quick-menu-content');
        if (menuContent) {
            menuContent.addEventListener('click', (e) => {
                e.stopPropagation();

                const button = e.target.closest('.quick-menu-item');
                if (button) {
                    const action = button.dataset.action;
                    if (action && this[action]) {
                        this[action]();
                    }
                }
            });
        }

        const quickMenu = document.getElementById('quickMenu');
        if (quickMenu) {
            quickMenu.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        }
    }

    /**
     * 切换到场景模式
     */
    switchToSceneMode() {
        this.currentMode = 'scene';

        if (this.aiInputArea) {
            this.aiInputArea.style.display = 'none';
            this.aiInputArea.classList.remove('active');
        }

        if (this.sceneControlArea) {
            this.sceneControlArea.style.display = 'flex';
        }

        // 隐藏AI模式指示器
        const aiIndicator = document.getElementById('aiModeIndicator');
        if (aiIndicator) {
            aiIndicator.classList.remove('active');
        }
    }

    /**
     * 切换到AI模式
     */
    switchToAIMode() {
        this.currentMode = 'ai';

        if (this.sceneControlArea) {
            this.sceneControlArea.style.display = 'none';
        }

        if (this.aiInputArea) {
            this.aiInputArea.style.display = 'block';
            this.aiInputArea.classList.add('active');

            // 自动聚焦输入框
            const input = document.getElementById('aiInput');
            if (input) {
                setTimeout(() => input.focus(), 300);
            }
        }

        // 显示AI模式指示器
        const aiIndicator = document.getElementById('aiModeIndicator');
        if (aiIndicator) {
            aiIndicator.classList.add('active');
        }

        // AI模式不可重置
        this.resetCount = this.maxResets;
    }

    /**
     * 处理继续按钮
     */
    handleContinue() {
        // 使用场景管理器的精确检测逻辑
        if (window.sceneManager) {
            const checkResult = window.sceneManager.canProceedToNext();

            if (!checkResult.canProceed) {
                this.showTip(checkResult.message);
                return;
            }

            // 可以继续，调用场景管理器的继续方法
            window.sceneManager.proceedToNext();
        } else {
            // 后备检查（如果场景管理器不可用）
            if (!this.continueEnabled) {
                this.showTip('请先选择一个选项');
                return;
            }
        }
    }

    /**
     * 处理重置按钮
     */
    handleReset() {
        if (this.resetCount >= this.maxResets) {
            this.showTip('本场景只能重置一次');
            return;
        }

        this.resetCount++;

        // 更新提示
        const resetHint = document.getElementById('resetHint');
        if (resetHint) {
            resetHint.textContent = '已使用重置';
            resetHint.style.color = '#6b7280';
        }

        // 调用场景管理器的重置方法
        if (window.sceneManager) {
            window.sceneManager.resetScene();
        }
    }

    /**
     * 切换插图显示
     */
    toggleIllustration() {
        // 调用插图管理器
        if (window.illustrationManager) {
            window.illustrationManager.toggle();
        } else {
            this.showTip('当前场景没有插图');
        }
    }

    /**
     * 更新继续按钮状态
     * @param {boolean} enabled - 是否启用
     * @param {string} mode - 模式：'preview' 或 'confirmed'
     */
    updateContinueButton(enabled, mode = 'confirmed') {
        this.continueEnabled = enabled;
        const btn = document.getElementById('continueBtn');

        if (btn) {
            if (enabled) {
                btn.classList.remove('disabled');
                btn.style.opacity = '1';

                // 根据模式添加不同的视觉效果
                if (mode === 'preview') {
                    btn.classList.add('preview-ready');
                } else {
                    btn.classList.remove('preview-ready');
                }
            } else {
                btn.classList.add('disabled');
                btn.classList.remove('preview-ready');
                btn.style.opacity = '0.5';
            }
        }
    }

    /**
     * 更新插图指示器
     */
    updateIllustrationIndicator(hasIllustration, tooltip = '') {
        const indicator = document.getElementById('illustrationIndicator');
        const zoomBtn = document.getElementById('zoomBtn');

        if (!indicator || !zoomBtn) return;

        if (hasIllustration) {
            indicator.style.display = 'inline-block';
            zoomBtn.classList.add('has-content');

            // 更新提示文本
            if (tooltip) {
                zoomBtn.setAttribute('title', tooltip);
            }
        } else {
            indicator.style.display = 'none';
            zoomBtn.classList.remove('has-content');
        }
    }

    /**
     * 重置状态
     */
    resetState() {
        console.log('F2Manager 重置状态...');

        this.resetCount = 0;
        this.continueEnabled = false;

        // 重置继续按钮状态
        const continueBtn = document.getElementById('continueBtn');
        if (continueBtn) {
            this.resetContinueButtonStyles(continueBtn);
            continueBtn.classList.add('disabled');
            continueBtn.classList.remove('preview-ready', 'confirmed');
            continueBtn.style.opacity = '0.5';
        }

        // 重置提示文本
        const resetHint = document.getElementById('resetHint');
        if (resetHint) {
            resetHint.textContent = '可重置';
            resetHint.style.color = '#94a3b8';
        }

        console.log('F2Manager 状态已重置');
    }

    /**
     * 切换快捷菜单
     */
    toggleQuickMenu() {
        const menu = document.getElementById('quickMenu');
        if (!menu) return;

        if (menu.style.display === 'none' || !menu.style.display) {
            this.openQuickMenu();
        } else {
            this.closeQuickMenu();
        }
    }

    /**
     * 打开快捷菜单
     */
    openQuickMenu() {
        const menu = document.getElementById('quickMenu');
        const overlay = document.getElementById('quickMenuOverlay');
        if (!menu) return;

        // 显示遮罩层和菜单
        if (overlay) overlay.style.display = 'block';
        menu.style.display = 'block';

        // 添加动画类
        setTimeout(() => {
            menu.classList.add('active');
        }, 10);
    }

    /**
     * 关闭快捷菜单
     */
    closeQuickMenu() {
        const menu = document.getElementById('quickMenu');
        const overlay = document.getElementById('quickMenuOverlay');
        if (!menu) return;

        menu.classList.remove('active');
        setTimeout(() => {
            menu.style.display = 'none';
            if (overlay) overlay.style.display = 'none';
        }, 300); // 等待动画完成
    }

    /**
     * 快速存档
     */
    quickSave() {
        // 阻止事件冒泡
        if (event) event.stopPropagation();

        // 收集游戏状态
        const saveData = {
            timestamp: new Date().toISOString(),
            scene: window.sceneManager ? window.sceneManager.currentScene : null,
            playerState: this.getPlayerState(),
            location: document.getElementById('currentLocation')?.textContent || '',
            time: document.getElementById('currentTime')?.textContent || ''
        };

        // 保存到localStorage
        localStorage.setItem('quickSave', JSON.stringify(saveData));

        // 显示提示
        this.showTip('已快速存档');
        this.closeQuickMenu();
    }

    /**
     * 读取存档
     */
    loadSave() {
        const saveData = localStorage.getItem('quickSave');
        if (!saveData) {
            this.showTip('没有找到存档');
            this.closeQuickMenu();
            return;
        }

        try {
            const data = JSON.parse(saveData);
            // TODO: 实现加载逻辑
            this.showTip(`读取存档 (${new Date(data.timestamp).toLocaleString()})`);
        } catch (e) {
            this.showTip('存档损坏');
        }

        this.closeQuickMenu();
    }

    /**
     * 显示历史记录
     */
    showHistory() {
        // TODO: 实现历史记录功能
        this.showTip('历史记录功能开发中');
        this.closeQuickMenu();
    }

    /**
     * 切换自动模式
     */
    toggleAutoMode() {
        // TODO: 实现自动模式
        this.showTip('自动模式开发中');
        this.closeQuickMenu();
    }

    /**
     * 获取玩家状态
     */
    getPlayerState() {
        return {
            health: document.getElementById('healthValue')?.textContent || 100,
            mood: document.getElementById('moodValue')?.textContent || 50,
            money: document.getElementById('moneyValue')?.textContent || 100,
            energy: document.getElementById('energyValue')?.textContent || 80
        };
    }

    /**
     * 显示提示
     */
    showTip(message) {
        // 创建临时提示
        const tip = document.createElement('div');
        tip.className = 'temp-tip';
        tip.textContent = message;
        tip.style.cssText = `
            position: fixed;
            bottom: 100px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(30, 30, 45, 0.95);
            color: #fbbf24;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 12px;
            z-index: 1000;
            animation: tipFadeInOut 2s ease;
        `;

        document.body.appendChild(tip);

        setTimeout(() => {
            tip.remove();
        }, 2000);
    }

    /**
     * 处理AI消息发送
     */
    sendAIMessage() {
        const input = document.getElementById('aiInput');
        if (!input) return;

        const message = input.value.trim();
        if (!message) return;

        // 调用AI对话管理器
        if (window.aiDialogueManager) {
            window.aiDialogueManager.sendMessage(message);
        }

        input.value = '';
    }

    /**
     * 结束AI对话
     */
    endAIDialogue() {
        // 切换回场景模式
        this.switchToSceneMode();

        // 通知场景管理器
        if (window.sceneManager) {
            window.sceneManager.endAIDialogue();
        }
    }

    /**
     * 响应场景状态变化
     * @param {Object} sceneState - 场景状态对象
     */
    onSceneStateChange(sceneState) {
        // 根据场景状态更新F2区域的UI
        const continueBtn = document.getElementById('continueBtn');
        const resetBtn = document.getElementById('resetBtn');

        if (!continueBtn || !resetBtn) return;

        // 先清除所有内联样式，让CSS类生效
        this.resetContinueButtonStyles(continueBtn);

        // 根据状态更新按钮样式和行为
        switch (sceneState.status) {
            case 'loading':
                continueBtn.classList.add('disabled');
                continueBtn.classList.remove('preview-ready', 'confirmed');
                continueBtn.style.opacity = '0.3';
                resetBtn.style.opacity = '0.3';
                break;

            case 'ready':
                continueBtn.classList.remove('preview-ready', 'confirmed');
                if (sceneState.choiceType === 'text' ||
                   (sceneState.choiceType === 'multi' && sceneState.selectedCount === 0)) {
                    continueBtn.classList.remove('disabled');
                    continueBtn.style.opacity = '1';
                } else {
                    continueBtn.classList.add('disabled');
                    continueBtn.style.opacity = '0.5';
                }
                resetBtn.style.opacity = '1';
                break;

            case 'previewing':
                continueBtn.classList.remove('confirmed');
                if (sceneState.canProceed) {
                    continueBtn.classList.remove('disabled');
                    continueBtn.classList.add('preview-ready');
                    continueBtn.style.opacity = '1';
                } else {
                    continueBtn.classList.add('disabled');
                    continueBtn.classList.remove('preview-ready');
                    continueBtn.style.opacity = '0.5';
                }
                break;

            case 'confirmed':
                continueBtn.classList.remove('disabled', 'preview-ready');
                continueBtn.classList.add('confirmed');
                continueBtn.style.opacity = '1';
                break;

            case 'transitioning':
                continueBtn.classList.add('disabled');
                continueBtn.classList.remove('preview-ready', 'confirmed');
                continueBtn.style.opacity = '0.3';
                resetBtn.style.opacity = '0.3';
                break;
        }

        // 调试日志
        console.debug('F2Manager state updated:', sceneState);
    }

    /**
     * 重置继续按钮的内联样式
     */
    resetContinueButtonStyles(continueBtn) {
        // 清除可能影响样式的内联属性
        continueBtn.style.background = '';
        continueBtn.style.transform = '';
        continueBtn.style.boxShadow = '';
    }
}

// 创建全局实例
window.f2Manager = new F2Manager();