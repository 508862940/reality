/**
 * AI对话管理器
 * 处理F2区AI模式下的对话交互
 */

class AIDialogueManager {
    constructor() {
        this.currentNPC = null;  // 当前对话的NPC
        this.dialogueHistory = [];  // 对话历史
        this.isProcessing = false;  // 是否正在处理消息
        this.aiMode = false;  // 是否在AI模式

        this.init();
    }

    init() {
        // 绑定输入框事件
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupEvents());
        } else {
            this.setupEvents();
        }
    }

    setupEvents() {
        // AI输入框回车发送
        const aiInput = document.getElementById('aiInput');
        if (aiInput) {
            aiInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage(aiInput.value);
                }
            });
        }

        // AI发送按钮
        const aiSendBtn = document.getElementById('aiSendBtn');
        if (aiSendBtn) {
            aiSendBtn.addEventListener('click', () => {
                const input = document.getElementById('aiInput');
                if (input) this.sendMessage(input.value);
            });
        }
    }

    /**
     * 开启AI对话模式
     * @param {string} npcName - NPC名称
     * @param {Object} context - 对话上下文
     */
    startAIDialogue(npcName, context = {}) {
        this.currentNPC = npcName;
        this.aiMode = true;
        this.dialogueHistory = [];

        console.log(`🤖 开启与${npcName}的AI对话`);

        // 切换到AI模式UI
        if (window.f2Manager) {
            window.f2Manager.switchToAIMode();
        }

        // 显示结束对话按钮
        const endBtn = document.getElementById('endAIBtn');
        if (endBtn) {
            endBtn.style.display = 'block';
        }

        // 显示NPC的开场白
        this.showNPCGreeting(npcName, context);
    }

    /**
     * 显示NPC开场白
     */
    showNPCGreeting(npcName, context) {
        const greetings = {
            'Zero': {
                low: "...",
                medium: "有什么事？",
                high: "需要我帮忙吗？"
            },
            'Observer': {
                default: "有趣...你想聊什么？"
            },
            'default': "你好。"
        };

        // 根据NPC和好感度选择开场白
        let greeting = greetings.default;

        if (greetings[npcName]) {
            const npcGreetings = greetings[npcName];

            // 如果有响应式NPC数据，根据好感度选择
            if (window.reactiveNPCs && window.reactiveNPCs[npcName]) {
                const affection = window.reactiveNPCs[npcName].affection;
                if (affection < 30 && npcGreetings.low) {
                    greeting = npcGreetings.low;
                } else if (affection < 70 && npcGreetings.medium) {
                    greeting = npcGreetings.medium;
                } else if (npcGreetings.high) {
                    greeting = npcGreetings.high;
                }
            } else if (npcGreetings.default) {
                greeting = npcGreetings.default;
            }
        }

        // 显示在对话区
        this.displayMessage('npc', greeting, npcName);
    }

    /**
     * 发送玩家消息
     */
    async sendMessage(message) {
        if (!message || !message.trim()) return;
        if (this.isProcessing) return;

        const input = document.getElementById('aiInput');
        if (input) input.value = '';

        // 显示玩家消息
        this.displayMessage('player', message);

        // 添加到历史
        this.dialogueHistory.push({
            role: 'player',
            content: message
        });

        // 如果没有API，使用预设回复
        if (!window.apiState || !window.apiState.hasValidKey()) {
            this.handleLocalResponse(message);
        } else {
            await this.handleAPIResponse(message);
        }
    }

    /**
     * 处理本地预设回复（无API时）
     */
    handleLocalResponse(playerMessage) {
        this.isProcessing = true;

        // 显示思考状态
        this.showTypingIndicator();

        // 模拟延迟
        setTimeout(() => {
            let response = this.getLocalResponse(playerMessage);

            // 移除思考指示器
            this.hideTypingIndicator();

            // 显示NPC回复
            this.displayMessage('npc', response, this.currentNPC);

            // 更新NPC状态（如果有响应式系统）
            this.updateNPCState(playerMessage, response);

            this.isProcessing = false;
        }, 1000);
    }

    /**
     * 获取本地预设回复
     */
    getLocalResponse(playerMessage) {
        const msg = playerMessage.toLowerCase();

        // Zero的回复逻辑
        if (this.currentNPC === 'Zero') {
            // 关键词检测
            if (msg.includes('狼') || msg.includes('力量')) {
                return "...不要提这个。";
            }
            if (msg.includes('喜欢') || msg.includes('爱')) {
                if (window.reactiveNPCs?.Zero?.affection >= 70) {
                    return "我...也是。";
                } else {
                    return "别说这种话。";
                }
            }
            if (msg.includes('帮') || msg.includes('保护')) {
                return "我会保护你的。";
            }
            if (msg.includes('记忆') || msg.includes('过去')) {
                return "有些事最好忘记。";
            }

            // 默认回复
            const defaults = [
                "嗯。",
                "...",
                "知道了。",
                "不用担心。"
            ];
            return defaults[Math.floor(Math.random() * defaults.length)];
        }

        // 其他NPC的默认回复
        return "我明白了。";
    }

    /**
     * 处理API回复（有API时）
     */
    async handleAPIResponse(playerMessage) {
        this.isProcessing = true;
        this.showTypingIndicator();

        try {
            // 构建上下文
            const context = {
                npc: this.currentNPC,
                history: this.dialogueHistory.slice(-5),  // 最近5条对话
                playerState: this.getPlayerState(),
                npcState: this.getNPCState()
            };

            // 调用API
            const response = await this.callNPCAPI(playerMessage, context);

            this.hideTypingIndicator();
            this.displayMessage('npc', response, this.currentNPC);
            this.updateNPCState(playerMessage, response);

        } catch (error) {
            console.error('AI对话失败:', error);
            this.hideTypingIndicator();
            this.displayMessage('npc', '...（似乎在思考）', this.currentNPC);
        }

        this.isProcessing = false;
    }

    /**
     * 调用NPC API
     */
    async callNPCAPI(message, context) {
        // 这里应该调用实际的API
        // 现在返回模拟结果
        return "这需要连接API才能生成智能回复。";
    }

    /**
     * 显示消息到对话区
     */
    displayMessage(type, message, npcName = null) {
        // AI对话应该添加到dialogueHistoryArea，不是storyArea
        const dialogueHistoryArea = document.getElementById('dialogueHistoryArea');
        if (!dialogueHistoryArea) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-bubble ${type} fade-in`;

        if (type === 'npc') {
            // 如果是API模式，在NPC消息上添加小星星标记
            const hasAPI = window.apiState && window.apiState.hasValidKey();
            const starMark = hasAPI ? '<span class="api-star-mark">✨</span>' : '';

            messageDiv.innerHTML = `
                <span class="dialogue-name">${npcName}:</span>
                <span class="dialogue-text">${message}</span>
                ${starMark}
            `;
        } else {
            messageDiv.innerHTML = `
                <span class="dialogue-name">你:</span>
                <span class="dialogue-text">${message}</span>
            `;
        }

        // 添加到对话历史区
        dialogueHistoryArea.appendChild(messageDiv);

        // 滚动到底部
        dialogueHistoryArea.scrollTop = dialogueHistoryArea.scrollHeight;
    }

    /**
     * 显示思考指示器
     */
    showTypingIndicator() {
        const dialogueHistoryArea = document.getElementById('dialogueHistoryArea');
        if (!dialogueHistoryArea) return;

        const indicator = document.createElement('div');
        indicator.className = 'typing-indicator';
        indicator.id = 'typingIndicator';

        // 两种模式都显示三个点，保持一致性
        indicator.innerHTML = `
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
        `;

        dialogueHistoryArea.appendChild(indicator);
        dialogueHistoryArea.scrollTop = dialogueHistoryArea.scrollHeight;
    }

    /**
     * 隐藏思考指示器
     */
    hideTypingIndicator() {
        const indicator = document.getElementById('typingIndicator');
        if (indicator) {
            indicator.remove();
        }
    }

    /**
     * 更新NPC状态
     */
    updateNPCState(playerMessage, npcResponse) {
        if (!window.reactiveNPCs || !this.currentNPC) return;

        const npc = window.reactiveNPCs[this.currentNPC];
        if (!npc) return;

        // 根据对话内容调整好感度
        const msg = playerMessage.toLowerCase();

        if (this.currentNPC === 'Zero') {
            // 正面互动增加好感
            if (msg.includes('谢谢') || msg.includes('感谢')) {
                npc.affection += 2;
            }
            if (msg.includes('相信') || msg.includes('信任')) {
                npc.affection += 3;
            }

            // 负面互动减少好感
            if (msg.includes('讨厌') || msg.includes('恨')) {
                npc.affection -= 5;
            }

            // 特殊关键词触发状态变化
            if (msg.includes('狼魂') && npc.affection >= 50) {
                npc.mood = 'worried';
                window.reactiveSystem?.showNotice('Zero看起来有些不安...');
            }
        }

        // 记录最后互动时间
        npc.lastInteraction = new Date().toISOString();
    }

    /**
     * 获取玩家状态
     */
    getPlayerState() {
        return {
            health: window.reactiveGameState?.health || 100,
            mood: window.reactiveGameState?.mood || 50,
            location: document.getElementById('currentLocation')?.textContent || '未知'
        };
    }

    /**
     * 获取NPC状态
     */
    getNPCState() {
        if (!window.reactiveNPCs || !this.currentNPC) return {};

        const npc = window.reactiveNPCs[this.currentNPC];
        return {
            affection: npc?.affection || 0,
            mood: npc?.mood || 'neutral',
            state: npc?.state || 'neutral'
        };
    }

    /**
     * 结束AI对话
     */
    endAIDialogue() {
        this.aiMode = false;
        this.currentNPC = null;

        console.log('🤖 AI对话模式结束');

        // 切换回场景模式
        if (window.f2Manager) {
            window.f2Manager.switchToSceneMode();
        }

        // 通知场景管理器AI对话结束
        if (window.sceneManager) {
            window.sceneManager.endAIDialogue();
        }

        // 恢复之前的场景内容或显示默认内容
        const storyArea = document.getElementById('storyArea');
        if (storyArea) {
            // 清除AI对话内容
            const dialogueMessages = storyArea.querySelectorAll('.dialogue-message');
            dialogueMessages.forEach(msg => msg.remove());

            // 清除思考指示器
            const typingIndicator = storyArea.querySelector('.typing-indicator');
            if (typingIndicator) typingIndicator.remove();

            // 恢复之前的内容或显示默认提示
            const beforeContent = storyArea.getAttribute('data-before-ai');
            if (beforeContent) {
                storyArea.innerHTML = beforeContent;
                storyArea.removeAttribute('data-before-ai');
            } else if (window.sceneManager && window.sceneManager.currentScene) {
                // 重新显示当前场景内容
                window.sceneManager.displayScene(window.sceneManager.currentScene);
            } else {
                // 显示默认的返回提示
                storyArea.innerHTML = `
                    <div class="story-text fade-in">
                        <p>对话结束了。</p>
                        <p>你回到了之前的场景。</p>
                    </div>
                `;
            }
        }

        // 隐藏结束对话按钮
        const endBtn = document.getElementById('endAIBtn');
        if (endBtn) {
            endBtn.style.display = 'none';
        }
    }

    /**
     * 检查是否可以触发AI对话
     */
    canTriggerAIDialogue(npcName) {
        // 检查NPC是否支持AI对话
        const aiEnabledNPCs = ['Zero', 'Observer'];
        return aiEnabledNPCs.includes(npcName);
    }
}

// 创建全局实例
window.aiDialogueManager = new AIDialogueManager();