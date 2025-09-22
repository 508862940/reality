/**
 * 响应式NPC与API集成系统
 * 展示如何将响应式系统应用到AI驱动的NPC上
 */

class ReactiveNPCManager {
    constructor() {
        this.npcs = new Map();
        this.apiCache = new Map();  // 缓存API响应
        console.log('🤖 响应式NPC管理器启动');
    }

    /**
     * 初始化一个API驱动的响应式NPC
     */
    async initializeAPILinkedNPC(npcConfig) {
        const { name, apiEndpoint, personality, initialState } = npcConfig;

        // 创建响应式NPC数据
        const reactiveNPC = window.createReactiveNPC(name, {
            ...initialState,
            apiEndpoint: apiEndpoint,
            personality: personality,
            isAIEnabled: true
        });

        // 监听NPC属性变化，触发API调用
        this.setupAPIWatchers(name, reactiveNPC);

        // 保存到管理器
        this.npcs.set(name, reactiveNPC);

        console.log(`🎭 API链接NPC [${name}] 已初始化`);
        return reactiveNPC;
    }

    /**
     * 设置API响应监听器
     */
    setupAPIWatchers(npcName, npcData) {
        // 当玩家与NPC互动时
        window.reactiveSystem.watch(`npc_${npcName}_interaction`, async (interaction) => {
            // 调用API获取NPC响应
            const response = await this.getNPCResponse(npcName, interaction);

            // API返回的数据自动更新响应式属性
            if (response.moodChange) {
                npcData.mood = response.mood;  // 自动触发UI更新！
            }

            if (response.affectionChange) {
                npcData.affection += response.affectionChange;  // 自动更新好感度UI！
            }

            if (response.newDialogue) {
                this.displayNPCDialogue(npcName, response.dialogue);
            }
        });

        // 监听好感度变化，可能触发特殊事件
        window.reactiveSystem.watch(`npc_${npcName}_affection`, async (newAffection) => {
            // 好感度达到阈值时，API触发特殊剧情
            if (newAffection >= 80 && !npcData.specialEventTriggered) {
                const specialEvent = await this.triggerSpecialEvent(npcName);
                if (specialEvent) {
                    npcData.specialEventTriggered = true;
                    this.handleSpecialEvent(specialEvent);
                }
            }
        });
    }

    /**
     * 调用API获取NPC响应
     */
    async getNPCResponse(npcName, playerAction) {
        const npc = this.npcs.get(npcName);
        if (!npc || !npc.apiEndpoint) return null;

        try {
            // 构建上下文
            const context = {
                npcName: npcName,
                personality: npc.personality,
                currentMood: npc.mood,
                affection: npc.affection,
                playerAction: playerAction,
                dialogueHistory: npc.dialogue.slice(-5)  // 最近5条对话
            };

            // 实际API调用（这里是模拟）
            const response = await this.callNPCAPI(npc.apiEndpoint, context);

            return response;
        } catch (error) {
            console.error(`❌ NPC API调用失败:`, error);
            return this.getFallbackResponse(npcName, playerAction);
        }
    }

    /**
     * 模拟API调用（实际使用时替换为真实API）
     */
    async callNPCAPI(endpoint, context) {
        // 模拟API延迟
        await new Promise(resolve => setTimeout(resolve, 500));

        // 模拟Zero的AI响应
        if (context.npcName === 'Zero') {
            const responses = {
                low: {
                    dialogue: "...",
                    mood: "cold",
                    affectionChange: -5
                },
                medium: {
                    dialogue: "需要什么帮助吗？",
                    mood: "neutral",
                    affectionChange: 2
                },
                high: {
                    dialogue: "我会保护你的。",
                    mood: "protective",
                    affectionChange: 5
                }
            };

            // 根据好感度返回不同响应
            if (context.affection < 30) return responses.low;
            if (context.affection < 70) return responses.medium;
            return responses.high;
        }
    }

    /**
     * 触发特殊事件
     */
    async triggerSpecialEvent(npcName) {
        // 高好感度时的特殊剧情
        if (npcName === 'Zero') {
            return {
                type: 'memory_unlock',
                title: '狼魂共鸣',
                description: 'Zero的金色瞳孔闪过一丝温柔...',
                rewards: {
                    unlockedDialogue: ['special_dialogue_1'],
                    newAbility: 'wolf_soul_resonance'
                }
            };
        }
    }

    /**
     * 处理特殊事件
     */
    handleSpecialEvent(event) {
        // 显示特殊事件通知
        window.reactiveSystem.showNotice(`🌟 特殊事件: ${event.title}`);

        // 更新UI显示特殊剧情
        const storyArea = document.getElementById('storyArea');
        if (storyArea) {
            storyArea.innerHTML = `
                <div class="special-event">
                    <h3>${event.title}</h3>
                    <p>${event.description}</p>
                </div>
            `;
        }
    }

    /**
     * 显示NPC对话
     */
    displayNPCDialogue(npcName, dialogue) {
        const storyArea = document.getElementById('storyArea');
        if (storyArea) {
            const dialogueElement = document.createElement('div');
            dialogueElement.className = 'npc-dialogue';
            dialogueElement.innerHTML = `
                <span class="npc-name">${npcName}:</span>
                <span class="npc-text">${dialogue}</span>
            `;
            storyArea.appendChild(dialogueElement);
        }
    }

    /**
     * 获取备用响应（API失败时）
     */
    getFallbackResponse(npcName, playerAction) {
        return {
            dialogue: "...",
            mood: "neutral",
            affectionChange: 0
        };
    }
}

// 初始化响应式NPC管理器
window.reactiveNPCManager = new ReactiveNPCManager();

// 示例：创建Zero作为API驱动的响应式NPC
window.initializeZero = async function() {
    const zero = await window.reactiveNPCManager.initializeAPILinkedNPC({
        name: 'Zero',
        apiEndpoint: '/api/npc/zero',  // 实际API端点
        personality: {
            traits: ['冷静', '保护欲强', '内心温柔'],
            hiddenTrait: '狼魂共鸣'
        },
        initialState: {
            affection: 30,
            mood: 'neutral',
            state: 'guarded',
            wolfSoulEnergy: 80,
            dialogue: []
        }
    });

    console.log('✨ Zero已作为响应式NPC初始化完成');

    // 测试：改变Zero的好感度
    console.log('测试：增加Zero好感度...');
    zero.affection += 10;  // 这会自动触发所有相关UI更新和API调用！
};

// 示例：玩家与NPC互动
window.interactWithNPC = function(npcName, action) {
    const npc = window.reactiveNPCs[npcName];
    if (npc) {
        // 触发互动事件，响应式系统会自动处理
        window.reactiveSystem.notify(`npc_${npcName}_interaction`, action);

        // 记录互动时间
        npc.lastInteraction = new Date().toISOString();

        console.log(`💬 与${npcName}互动: ${action}`);
    }
};