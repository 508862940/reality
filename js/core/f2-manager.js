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

        // 如果没有AI输入区，也创建它（但默认隐藏）
        if (!this.aiInputArea) {
            this.createAIInputArea();
        }

        // 确保对话历史区也存在（F1区的AI模式）
        const dialogueHistoryArea = document.getElementById('dialogueHistoryArea');
        if (!dialogueHistoryArea) {
            this.createDialogueHistoryArea();
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
                    <button class="quick-menu-item" data-action="toggleAIMode">
                        <span class="quick-icon">🤖</span>
                        <span class="quick-text">AI对话模式</span>
                    </button>
                    <div class="quick-menu-divider"></div>
                    <button class="quick-menu-item" data-action="quickSave">
                        <span class="quick-icon">⚡</span>
                        <span class="quick-text">快速存档 (F5)</span>
                    </button>
                    <button class="quick-menu-item" data-action="quickLoad">
                        <span class="quick-icon">📖</span>
                        <span class="quick-text">快速读档 (F9)</span>
                    </button>
                    <button class="quick-menu-item" data-action="saveManage">
                        <span class="quick-icon">💾</span>
                        <span class="quick-text">存档管理</span>
                    </button>
                    <div class="quick-menu-divider"></div>
                    <button class="quick-menu-item" data-action="showHistory">
                        <span class="quick-icon">📜</span>
                        <span class="quick-text">历史记录</span>
                    </button>
                    <button class="quick-menu-item" data-action="toggleAutoMode">
                        <span class="quick-icon">🔄</span>
                        <span class="quick-text">自动模式</span>
                    </button>
                    <button class="quick-menu-item" data-action="testAdvanceTime">
                        <span class="quick-icon">⏰</span>
                        <span class="quick-text">+30分钟</span>
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
     * 切换到场景模式（同时切换F1和F2回正常状态）
     */
    switchToSceneMode() {
        this.currentMode = 'scene';

        // F1区域：dialogue-history-area 切换回 story-area
        const storyArea = document.getElementById('storyArea');
        const dialogueHistoryArea = document.getElementById('dialogueHistoryArea');

        if (dialogueHistoryArea) {
            dialogueHistoryArea.style.display = 'none';
            dialogueHistoryArea.classList.remove('active');
        }

        if (storyArea) {
            storyArea.style.display = 'block';
            storyArea.classList.add('active');
        }

        // F2区域：AI输入区 切换回 场景控制区
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
     * 切换到AI模式（同时切换F1和F2）
     */
    switchToAIMode() {
        this.currentMode = 'ai';

        // F1区域：story-area 切换到 dialogue-history-area
        const storyArea = document.getElementById('storyArea');
        const dialogueHistoryArea = document.getElementById('dialogueHistoryArea');

        if (storyArea) {
            storyArea.style.display = 'none';
            storyArea.classList.remove('active');
        }

        // 如果对话历史区不存在，创建它
        if (!dialogueHistoryArea) {
            this.createDialogueHistoryArea();
        } else {
            dialogueHistoryArea.style.display = 'flex';
            dialogueHistoryArea.classList.add('active');
        }

        // F2区域：场景控制区 切换到 AI输入区
        if (this.sceneControlArea) {
            this.sceneControlArea.style.display = 'none';
        }

        // 如果AI输入区不存在，创建它
        if (!this.aiInputArea) {
            this.createAIInputArea();
        } else {
            this.aiInputArea.style.display = 'flex';
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
     * 创建对话历史区（F1区域的AI模式）
     */
    createDialogueHistoryArea() {
        const lowerSection = document.querySelector('.lower-section');
        if (!lowerSection) return;

        // 在story-area后面添加对话历史区
        const historyHTML = `
            <div class="dialogue-history-area" id="dialogueHistoryArea">
                <!-- 对话历史将动态添加 -->
            </div>
        `;

        const storyArea = document.getElementById('storyArea');
        if (storyArea) {
            storyArea.insertAdjacentHTML('afterend', historyHTML);
        }
    }

    /**
     * 创建优化版AI输入区（F2区域的AI模式）
     */
    createAIInputArea() {
        const lowerSection = document.querySelector('.lower-section');
        if (!lowerSection) return;

        // 创建优化版的AI输入区
        const inputHTML = `
            <div class="ai-input-container" id="aiInputArea">
                <div class="ai-input-wrapper">
                    <!-- 左侧更多按钮 -->
                    <button class="ai-more-btn" id="aiMoreBtn" aria-label="更多功能">
                        ⋮
                    </button>

                    <!-- 中间输入区域 -->
                    <div class="ai-input-field-wrapper">
                        <input type="text"
                               class="ai-input-field"
                               id="aiInput"
                               placeholder="说点什么..."
                               autocomplete="off"
                               autocorrect="off"
                               autocapitalize="off"
                               spellcheck="false" />

                        <button class="ai-mode-toggle" id="aiModeToggle" aria-label="切换模式">
                            💬
                        </button>
                    </div>

                    <!-- 右侧发送按钮 -->
                    <button class="ai-send-btn" id="aiSendBtn" aria-label="发送">
                        ➤
                    </button>
                </div>

                <!-- 更多菜单 -->
                <div class="ai-more-menu" id="aiMoreMenu">
                    <div class="ai-menu-item" data-action="history">
                        <span class="menu-item-icon">📜</span>
                        <span>对话历史</span>
                    </div>
                    <div class="ai-menu-item" data-action="emoji">
                        <span class="menu-item-icon">😊</span>
                        <span>快速表情</span>
                    </div>
                    <div class="ai-menu-item" data-action="save">
                        <span class="menu-item-icon">💾</span>
                        <span>保存对话</span>
                    </div>
                    <div class="ai-menu-item" data-action="exit">
                        <span class="menu-item-icon">↩️</span>
                        <span>返回场景</span>
                    </div>
                </div>
            </div>
        `;

        // 确保AI输入区总是在lower-section的底部
        // 先移除可能存在的旧元素
        const existingAI = document.getElementById('aiInputArea');
        if (existingAI) {
            existingAI.remove();
        }

        // 始终插入到lower-section的末尾，确保在底部
        lowerSection.insertAdjacentHTML('beforeend', inputHTML);

        this.aiInputArea = document.getElementById('aiInputArea');

        // 确保lower-section是flex布局，AI输入区在底部
        lowerSection.style.display = 'flex';
        lowerSection.style.flexDirection = 'column';

        // 确保story-area或dialogue-history占用剩余空间
        const storyArea = document.getElementById('storyArea');
        const dialogueArea = document.getElementById('dialogueHistoryArea');

        if (storyArea) {
            storyArea.style.flex = '1';
            storyArea.style.minHeight = '0';
        }

        if (dialogueArea) {
            dialogueArea.style.flex = '1';
            dialogueArea.style.minHeight = '0';
        }
        this.bindAIInputEvents();
    }

    /**
     * 绑定AI输入区事件
     */
    bindAIInputEvents() {
        // 发送按钮
        const sendBtn = document.getElementById('aiSendBtn');
        if (sendBtn) {
            sendBtn.addEventListener('click', () => this.sendAIMessage());
        }

        // 输入框回车发送
        const input = document.getElementById('aiInput');
        if (input) {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendAIMessage();
                }
            });
        }

        // 更多按钮
        const moreBtn = document.getElementById('aiMoreBtn');
        const moreMenu = document.getElementById('aiMoreMenu');
        if (moreBtn && moreMenu) {
            moreBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                moreMenu.classList.toggle('show');
            });

            // 点击外部关闭菜单
            document.addEventListener('click', () => {
                moreMenu.classList.remove('show');
            });

            // 菜单项点击
            moreMenu.querySelectorAll('.ai-menu-item').forEach(item => {
                item.addEventListener('click', (e) => {
                    const action = e.currentTarget.dataset.action;
                    if (action === 'exit') {
                        this.switchToSceneMode();
                    }
                    // 其他动作...
                    moreMenu.classList.remove('show');
                });
            });
        }

        // 模式切换按钮
        const modeToggle = document.getElementById('aiModeToggle');
        if (modeToggle) {
            modeToggle.addEventListener('click', () => {
                const isActionMode = modeToggle.classList.toggle('action-mode');
                modeToggle.textContent = isActionMode ? '🎭' : '💬';
                input.placeholder = isActionMode ? '描述动作...' : '说点什么...';
            });
        }
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
        // 检查场景管理器是否可以重置
        if (!window.sceneManager || !window.sceneManager.canResetToLastStep) {
            this.showTip('需要继续后才能重置');
            return;
        }

        // 调用场景管理器的重置方法
        window.sceneManager.resetScene();

        // 更新重置按钮状态
        this.updateResetButton(false);
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
     * 更新重置按钮状态
     * @param {boolean} canReset - 是否可以重置
     */
    updateResetButton(canReset) {
        const resetBtn = document.getElementById('resetBtn');
        const resetHint = document.getElementById('resetHint');

        if (resetBtn) {
            if (canReset) {
                resetBtn.classList.remove('disabled');
                resetBtn.classList.add('can-reset');
                resetBtn.style.opacity = '1';
            } else {
                resetBtn.classList.add('disabled');
                resetBtn.classList.remove('can-reset');
                resetBtn.style.opacity = '0.5';
            }
        }

        if (resetHint) {
            if (canReset) {
                resetHint.textContent = '可重置';
                resetHint.className = 'reset-hint available';
            } else {
                resetHint.textContent = '需继续';
                resetHint.className = 'reset-hint used';
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
     * 切换AI对话模式
     */
    toggleAIMode() {
        this.closeQuickMenu();

        if (this.currentMode === 'scene') {
            // 切换到AI模式
            this.switchToAIMode();
            if (window.showNotification) {
                window.showNotification('已切换到AI对话模式', 'info');
            }
        } else {
            // 切换回场景模式
            this.switchToSceneMode();
            if (window.showNotification) {
                window.showNotification('已切换到场景模式', 'info');
            }
        }
    }

    /**
     * 快速存档（使用新的快速存档系统）
     */
    async quickSave() {
        // 阻止事件冒泡
        if (event) event.stopPropagation();

        this.closeQuickMenu();

        // 使用新的快速存档函数（F5）
        if (window.quickSave) {
            await window.quickSave();
            return;
        }

        // 降级到旧方法

        // 收集游戏状态
        const saveData = {
            timestamp: new Date().toISOString(),
            scene: window.sceneManager ? window.sceneManager.currentScene : null,
            playerState: this.getPlayerState(),
            location: document.getElementById('currentLocation')?.textContent || '',
            time: document.getElementById('currentTime')?.textContent || ''
        };

        // 保存到IndexedDB（优先）或localStorage（备用）
        try {
            if (window.Database && window.Database.db) {
                await window.Database.db.saveSlots.put({
                    id: 'quickSave',
                    data: saveData,
                    timestamp: Date.now()
                });
                console.log('✅ 快速存档已保存到IndexedDB');
            } else {
                localStorage.setItem('quickSave', JSON.stringify(saveData));
                console.log('💾 快速存档已保存到localStorage（备用）');
            }
        } catch (error) {
            console.error('快速存档保存失败:', error);
            localStorage.setItem('quickSave', JSON.stringify(saveData));
        }

        // 显示提示
        this.showTip('已快速存档');
    }

    /**
     * 快速读档（使用新的F9系统）
     */
    async quickLoad() {
        this.closeQuickMenu();

        // 使用新的快速读档函数（F9）
        if (window.quickLoad) {
            await window.quickLoad();
        } else {
            // 降级到旧的loadSave
            this.loadSave();
        }
    }

    /**
     * 打开存档管理界面
     */
    saveManage() {
        this.closeQuickMenu();

        // 打开存档管理对话框
        if (window.showSaveLoadDialog) {
            window.showSaveLoadDialog();
        } else {
            if (window.showNotification) {
                window.showNotification('存档管理功能暂未实现', 'warning');
            }
        }
    }

    /**
     * 读取存档（旧版本）
     */
    async loadSave() {
        let saveData = null;

        try {
            // 优先从IndexedDB读取
            if (window.Database && window.Database.db) {
                const result = await window.Database.db.saveSlots.get('quickSave');
                if (result) {
                    saveData = JSON.stringify(result.data);
                    console.log('✅ 从IndexedDB读取快速存档');
                }
            }

            // 降级到localStorage
            if (!saveData) {
                saveData = localStorage.getItem('quickSave');
                if (saveData) {
                    console.log('🔄 从localStorage读取快速存档');

                    // 迁移到IndexedDB
                    if (window.Database && window.Database.db) {
                        const parsed = JSON.parse(saveData);
                        await window.Database.db.saveSlots.put({
                            id: 'quickSave',
                            data: parsed,
                            timestamp: Date.now()
                        });
                        localStorage.removeItem('quickSave');
                        console.log('✅ 快速存档已迁移到IndexedDB');
                    }
                }
            }
        } catch (error) {
            console.error('读取快速存档失败:', error);
            saveData = localStorage.getItem('quickSave');
        }

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
     * 时间测试：推进30分钟
     */
    testAdvanceTime() {
        if (window.timeSystem) {
            window.timeSystem.advanceTime(30);
            // 更新时间显示
            if (window.updateLocationTime) {
                window.updateLocationTime();
            }
            this.showTip('时间推进 +30分钟');
        } else {
            this.showTip('时间系统未加载');
        }
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

        // 调用AI对话管理器处理所有逻辑
        if (window.aiDialogueManager) {
            // AI管理器会处理显示消息和回复
            window.aiDialogueManager.sendMessage(message);
        } else {
            // 只在没有AI管理器时才自己处理
            this.addMessageToHistory(message, 'player');
            input.value = '';

            // 显示本地回复
            setTimeout(() => {
                this.addMessageToHistory('AI系统初始化中...', 'npc');
            }, 1000);
        }
    }

    /**
     * 添加消息到对话历史区
     */
    addMessageToHistory(text, sender = 'npc') {
        const historyArea = document.getElementById('dialogueHistoryArea');
        if (!historyArea) return;

        // 创建消息气泡
        const bubble = document.createElement('div');
        bubble.className = `chat-bubble ${sender}`;

        // 检查是否是动作模式
        const modeToggle = document.getElementById('aiModeToggle');
        const isActionMode = modeToggle && modeToggle.classList.contains('action-mode');

        if (isActionMode && sender === 'player') {
            bubble.innerHTML = `<span class="chat-action">*${text}*</span>`;
        } else {
            bubble.textContent = text;
        }

        // 添加到历史区
        historyArea.appendChild(bubble);

        // 滚动到底部
        historyArea.scrollTop = historyArea.scrollHeight;
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
        // 📝 小纸条：场景状态变化了
        console.log('📝 小纸条：F2Manager收到状态变化通知');
        console.log('   当前状态:', sceneState.status);
        console.log('   选择类型:', sceneState.choiceType);
        console.log('   已选数量:', sceneState.selectedCount);
        console.log('   能否继续:', sceneState.canProceed);

        // 更新重置按钮状态
        if (window.sceneManager) {
            this.updateResetButton(window.sceneManager.canResetToLastStep);
        }

        // 根据场景状态更新F2区域的UI
        const continueBtn = document.getElementById('continueBtn');
        const resetBtn = document.getElementById('resetBtn');

        if (!continueBtn || !resetBtn) {
            console.log('❌ 小纸条：找不到继续按钮或重置按钮！');
            return;
        }

        // 先清除所有内联样式，让CSS类生效
        this.resetContinueButtonStyles(continueBtn);
        console.log('🧹 小纸条：已清除按钮内联样式');

        // 根据状态更新按钮样式和行为
        switch (sceneState.status) {
            case 'loading':
                console.log('⏳ 小纸条：按钮设置为加载状态（灰色禁用）');
                continueBtn.classList.add('disabled');
                continueBtn.classList.remove('preview-ready', 'confirmed');
                continueBtn.style.opacity = '0.3';
                resetBtn.style.opacity = '0.3';
                break;

            case 'ready':
                console.log('✅ 小纸条：按钮设置为就绪状态');
                continueBtn.classList.remove('preview-ready', 'confirmed');
                if (sceneState.choiceType === 'text' ||
                   (sceneState.choiceType === 'multi' && sceneState.selectedCount === 0)) {
                    console.log('   → 文本场景或0选择多选，按钮可用（正常色）');
                    continueBtn.classList.remove('disabled');
                    continueBtn.style.opacity = '1';
                } else {
                    console.log('   → 需要选择的场景，按钮禁用（灰色）');
                    continueBtn.classList.add('disabled');
                    continueBtn.style.opacity = '0.5';
                }
                resetBtn.style.opacity = '1';
                break;

            case 'previewing':
                console.log('👀 小纸条：按钮设置为预览状态');
                continueBtn.classList.remove('confirmed');
                if (sceneState.canProceed) {
                    console.log('   → 预览可继续，按钮变蓝色（preview-ready）');
                    continueBtn.classList.remove('disabled');
                    continueBtn.classList.add('preview-ready');
                    continueBtn.style.opacity = '1';
                } else {
                    console.log('   → 预览不可继续，按钮保持灰色');
                    continueBtn.classList.add('disabled');
                    continueBtn.classList.remove('preview-ready');
                    continueBtn.style.opacity = '0.5';
                }
                break;

            case 'confirmed':
                console.log('🎯 小纸条：按钮设置为确认状态（绿色）');
                continueBtn.classList.remove('disabled', 'preview-ready');
                continueBtn.classList.add('confirmed');
                continueBtn.style.opacity = '1';
                break;

            case 'transitioning':
                console.log('🔄 小纸条：按钮设置为转换状态（禁用）');
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