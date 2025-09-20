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
                <span class="reset-hint" id="resetHint">可重置</span>
            </div>
        `;

        // 插入到AI输入区之前
        if (this.aiInputArea) {
            this.aiInputArea.insertAdjacentHTML('beforebegin', controlHTML);
        } else {
            lowerSection.insertAdjacentHTML('beforeend', controlHTML);
        }

        this.sceneControlArea = document.getElementById('sceneControlArea');
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
        if (!this.continueEnabled) {
            this.showTip('请先选择一个选项');
            return;
        }

        // 调用场景管理器的继续方法
        if (window.sceneManager) {
            window.sceneManager.proceedToNext();
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
        this.resetCount = 0;
        this.continueEnabled = false;
        this.updateContinueButton(false);

        // 重置提示文本
        const resetHint = document.getElementById('resetHint');
        if (resetHint) {
            resetHint.textContent = '本回合可重置';
            resetHint.style.color = '#94a3b8';
        }
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
}

// 创建全局实例
window.f2Manager = new F2Manager();