/**
 * F2对话管理器 - PWA优化版
 * 管理AI对话模式的所有交互逻辑
 */

class F2DialogueManager {
    constructor() {
        this.currentMode = 'dialogue'; // 'dialogue' 或 'action'
        this.currentNPC = null;
        this.dialogueHistory = [];
        this.isTyping = false;
        this.container = null;
        this.elements = {};

        // PWA相关
        this.isStandalone = window.matchMedia('(display-mode: standalone)').matches;
        this.isTouchDevice = 'ontouchstart' in window;

        // 初始化
        this.init();
    }

    /**
     * 初始化
     */
    init() {
        // 等待DOM加载
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupDialogueUI());
        } else {
            this.setupDialogueUI();
        }
    }

    /**
     * 创建对话UI结构
     */
    setupDialogueUI() {
        // 查找F2区域容器
        const f2Area = document.querySelector('.area-f2') ||
                      document.querySelector('.lower-section');

        if (!f2Area) {
            console.warn('F2区域未找到，延迟初始化对话UI');
            return;
        }

        // 创建AI对话容器
        this.createDialogueContainer(f2Area);

        // 绑定事件
        this.bindEvents();

        // PWA优化
        this.optimizeForPWA();
    }

    /**
     * 创建对话容器HTML
     */
    createDialogueContainer(parent) {
        const containerHTML = `
            <div class="ai-dialogue-container" id="aiDialogueContainer">
                <!-- 对话头部 -->
                <div class="dialogue-header">
                    <div class="dialogue-npc-avatar" id="dialogueNPCAvatar">
                        <span id="npcAvatarEmoji">🤖</span>
                    </div>
                    <div class="dialogue-npc-info">
                        <div class="dialogue-npc-name" id="dialogueNPCName">AI助手</div>
                        <div class="dialogue-npc-status" id="dialogueNPCStatus">在线</div>
                    </div>
                    <div class="dialogue-mood-indicators">
                        <div class="mood-indicator" id="affectionIndicator" title="好感度">💕</div>
                        <div class="mood-indicator" id="moodIndicator" title="心情">😊</div>
                    </div>
                </div>

                <!-- 对话历史 -->
                <div class="dialogue-history" id="dialogueHistory"></div>

                <!-- 输入区域 -->
                <div class="dialogue-input-area">
                    <div class="dialogue-input-container">
                        <!-- 左侧更多按钮 -->
                        <button class="dialogue-more-btn" id="dialogueMoreBtn" aria-label="更多功能">
                            ⋮
                        </button>

                        <!-- 中间输入框 -->
                        <div class="dialogue-input-wrapper">
                            <input type="text"
                                   class="dialogue-input"
                                   id="dialogueInput"
                                   placeholder="说点什么..."
                                   autocomplete="off"
                                   autocorrect="off"
                                   autocapitalize="off"
                                   spellcheck="false" />

                            <button class="dialogue-mode-toggle"
                                    id="dialogueModeToggle"
                                    aria-label="切换输入模式">
                                💬
                                <span class="mode-tooltip">对话模式</span>
                            </button>
                        </div>

                        <!-- 右侧发送按钮 -->
                        <button class="dialogue-send-btn"
                                id="dialogueSendBtn"
                                aria-label="发送">
                            ➤
                        </button>
                    </div>
                </div>

                <!-- 更多菜单 -->
                <div class="dialogue-more-menu" id="dialogueMoreMenu">
                    <div class="dialogue-menu-item" data-action="history">
                        <span class="menu-item-icon">📜</span>
                        <span>对话历史</span>
                    </div>
                    <div class="dialogue-menu-item" data-action="emoji">
                        <span class="menu-item-icon">😊</span>
                        <span>快速表情</span>
                    </div>
                    <div class="dialogue-menu-item" data-action="save">
                        <span class="menu-item-icon">💾</span>
                        <span>保存对话</span>
                    </div>
                    <div class="dialogue-menu-item" data-action="mute">
                        <span class="menu-item-icon">🔇</span>
                        <span>静音模式</span>
                    </div>
                    <div class="dialogue-menu-item" data-action="persona">
                        <span class="menu-item-icon">🎭</span>
                        <span>切换人格</span>
                    </div>
                    <div class="dialogue-menu-item" data-action="exit">
                        <span class="menu-item-icon">↩️</span>
                        <span>返回场景</span>
                    </div>
                </div>
            </div>
        `;

        // 插入到F2区域
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = containerHTML;
        this.container = tempDiv.firstElementChild;
        parent.appendChild(this.container);

        // 缓存元素引用
        this.cacheElements();
    }

    /**
     * 缓存DOM元素引用
     */
    cacheElements() {
        this.elements = {
            container: this.container,
            history: document.getElementById('dialogueHistory'),
            input: document.getElementById('dialogueInput'),
            sendBtn: document.getElementById('dialogueSendBtn'),
            moreBtn: document.getElementById('dialogueMoreBtn'),
            moreMenu: document.getElementById('dialogueMoreMenu'),
            modeToggle: document.getElementById('dialogueModeToggle'),
            npcAvatar: document.getElementById('dialogueNPCAvatar'),
            npcName: document.getElementById('dialogueNPCName'),
            npcStatus: document.getElementById('dialogueNPCStatus'),
            avatarEmoji: document.getElementById('npcAvatarEmoji'),
            affection: document.getElementById('affectionIndicator'),
            mood: document.getElementById('moodIndicator')
        };
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        // 发送按钮
        this.elements.sendBtn?.addEventListener('click', () => this.sendMessage());

        // 回车发送
        this.elements.input?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // 更多菜单
        this.elements.moreBtn?.addEventListener('click', () => this.toggleMoreMenu());

        // 菜单项点击
        this.elements.moreMenu?.querySelectorAll('.dialogue-menu-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const action = e.currentTarget.dataset.action;
                this.handleMenuAction(action);
            });
        });

        // 模式切换
        this.elements.modeToggle?.addEventListener('click', () => this.toggleMode());

        // NPC头像点击
        this.elements.npcAvatar?.addEventListener('click', () => this.showNPCProfile());

        // 点击外部关闭菜单
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.dialogue-more-btn') &&
                !e.target.closest('.dialogue-more-menu')) {
                this.closeMoreMenu();
            }
        });

        // PWA键盘处理
        if (this.isStandalone) {
            this.handlePWAKeyboard();
        }
    }

    /**
     * 切换到AI对话模式
     */
    switchToDialogueMode(npcData = {}) {
        // 更新NPC信息
        this.currentNPC = npcData;
        this.updateNPCInfo(npcData);

        // 显示对话容器
        this.container?.classList.add('active');

        // 隐藏场景控制区
        const sceneControl = document.getElementById('sceneControlArea');
        if (sceneControl) {
            sceneControl.style.display = 'none';
        }

        // 聚焦输入框（延迟以避免移动端键盘问题）
        setTimeout(() => {
            this.elements.input?.focus();
        }, 300);

        console.log('切换到AI对话模式', npcData);
    }

    /**
     * 退出对话模式
     */
    exitDialogueMode() {
        // 隐藏对话容器
        this.container?.classList.remove('active');

        // 显示场景控制区
        const sceneControl = document.getElementById('sceneControlArea');
        if (sceneControl) {
            sceneControl.style.display = '';
        }

        // 清空输入框
        if (this.elements.input) {
            this.elements.input.value = '';
        }

        console.log('退出AI对话模式');
    }

    /**
     * 更新NPC信息
     */
    updateNPCInfo(npcData) {
        if (this.elements.npcName) {
            this.elements.npcName.textContent = npcData.name || 'AI助手';
        }

        if (this.elements.avatarEmoji) {
            this.elements.avatarEmoji.textContent = npcData.avatar || '🤖';
        }

        if (this.elements.npcStatus) {
            this.elements.npcStatus.textContent = npcData.status || '在线';
        }

        // 更新心情指示器
        this.updateMoodIndicators(npcData);
    }

    /**
     * 更新心情指示器
     */
    updateMoodIndicators(npcData) {
        if (this.elements.affection && npcData.affection !== undefined) {
            const hearts = ['💔', '💙', '💚', '💛', '💕'];
            const level = Math.floor(npcData.affection / 20);
            this.elements.affection.textContent = hearts[Math.min(level, 4)];
        }

        if (this.elements.mood && npcData.mood) {
            const moods = {
                happy: '😊',
                sad: '😢',
                angry: '😡',
                neutral: '😐',
                curious: '🤔'
            };
            this.elements.mood.textContent = moods[npcData.mood] || '😐';
        }
    }

    /**
     * 发送消息
     */
    async sendMessage() {
        const message = this.elements.input?.value?.trim();
        if (!message || this.isTyping) return;

        // 添加玩家消息
        this.addMessage(message, 'player', this.currentMode === 'action');

        // 清空输入框
        this.elements.input.value = '';

        // 显示打字指示器
        this.showTypingIndicator();

        // 调用AI API
        try {
            const response = await this.callAIAPI(message);
            this.hideTypingIndicator();
            this.addMessage(response, 'npc');
        } catch (error) {
            console.error('AI响应错误:', error);
            this.hideTypingIndicator();
            this.addMessage('抱歉，我现在无法回应...', 'npc');
        }
    }

    /**
     * 添加消息到对话历史
     */
    addMessage(text, sender = 'npc', isAction = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-bubble ${sender}`;

        if (isAction) {
            messageDiv.innerHTML = `<span class="dialogue-action">*${text}*</span>`;
        } else {
            messageDiv.textContent = text;
        }

        this.elements.history?.appendChild(messageDiv);

        // 滚动到底部
        this.scrollToBottom();

        // 保存到历史
        this.dialogueHistory.push({
            text,
            sender,
            isAction,
            timestamp: Date.now()
        });
    }

    /**
     * 显示打字指示器
     */
    showTypingIndicator() {
        this.isTyping = true;

        const typingDiv = document.createElement('div');
        typingDiv.className = 'dialogue-typing';
        typingDiv.id = 'typingIndicator';
        typingDiv.innerHTML = `
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        `;

        this.elements.history?.appendChild(typingDiv);
        this.scrollToBottom();
    }

    /**
     * 隐藏打字指示器
     */
    hideTypingIndicator() {
        this.isTyping = false;
        const indicator = document.getElementById('typingIndicator');
        indicator?.remove();
    }

    /**
     * 滚动到底部
     */
    scrollToBottom() {
        if (this.elements.history) {
            this.elements.history.scrollTop = this.elements.history.scrollHeight;
        }
    }

    /**
     * 切换输入模式
     */
    toggleMode() {
        if (this.currentMode === 'dialogue') {
            this.currentMode = 'action';
            this.elements.modeToggle.innerHTML = `
                🎭
                <span class="mode-tooltip">动作模式</span>
            `;
            this.elements.modeToggle.classList.add('action-mode');
            this.elements.input.placeholder = '描述动作...';
        } else {
            this.currentMode = 'dialogue';
            this.elements.modeToggle.innerHTML = `
                💬
                <span class="mode-tooltip">对话模式</span>
            `;
            this.elements.modeToggle.classList.remove('action-mode');
            this.elements.input.placeholder = '说点什么...';
        }
    }

    /**
     * 切换更多菜单
     */
    toggleMoreMenu() {
        this.elements.moreMenu?.classList.toggle('show');
    }

    /**
     * 关闭更多菜单
     */
    closeMoreMenu() {
        this.elements.moreMenu?.classList.remove('show');
    }

    /**
     * 处理菜单动作
     */
    handleMenuAction(action) {
        console.log('菜单动作:', action);

        switch(action) {
            case 'history':
                this.showDialogueHistory();
                break;
            case 'save':
                this.saveDialogue();
                break;
            case 'exit':
                this.exitDialogueMode();
                break;
            // 其他动作...
        }

        this.closeMoreMenu();
    }

    /**
     * 调用AI API
     */
    async callAIAPI(message) {
        // 这里接入实际的AI API
        // 暂时返回模拟响应
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve('这是AI的回复...');
            }, 1000 + Math.random() * 1000);
        });
    }

    /**
     * PWA优化
     */
    optimizeForPWA() {
        // 防止橡皮筋效果
        document.addEventListener('touchmove', (e) => {
            if (e.target.closest('.dialogue-history')) {
                return; // 允许对话历史区域滚动
            }
            if (e.target.closest('.ai-dialogue-container')) {
                e.preventDefault();
            }
        }, { passive: false });

        // 处理视口变化（键盘弹出）
        if (this.isStandalone) {
            window.visualViewport?.addEventListener('resize', () => {
                this.handleViewportResize();
            });
        }
    }

    /**
     * 处理PWA键盘
     */
    handlePWAKeyboard() {
        // iOS键盘处理
        this.elements.input?.addEventListener('focus', () => {
            if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
                setTimeout(() => {
                    document.body.scrollTop = 0;
                    document.documentElement.scrollTop = 0;
                }, 300);
            }
        });
    }

    /**
     * 处理视口变化
     */
    handleViewportResize() {
        // 调整容器高度以适应键盘
        if (window.visualViewport) {
            const height = window.visualViewport.height;
            this.container.style.height = `${height}px`;
        }
    }

    /**
     * 显示对话历史
     */
    showDialogueHistory() {
        console.log('显示对话历史', this.dialogueHistory);
        // TODO: 实现历史查看界面
    }

    /**
     * 保存对话
     */
    saveDialogue() {
        const data = {
            npc: this.currentNPC,
            history: this.dialogueHistory,
            timestamp: Date.now()
        };

        // 保存到localStorage或IndexedDB
        localStorage.setItem(`dialogue_${Date.now()}`, JSON.stringify(data));
        console.log('对话已保存');
    }

    /**
     * 显示NPC资料
     */
    showNPCProfile() {
        console.log('显示NPC资料', this.currentNPC);
        // TODO: 实现NPC资料卡
    }
}

// 创建全局实例
window.f2DialogueManager = new F2DialogueManager();

// 导出供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = F2DialogueManager;
}