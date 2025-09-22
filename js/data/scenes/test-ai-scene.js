/**
 * AI对话测试场景
 * 用于测试F2区AI对话功能
 */

const TestAIScenes = {
    // 测试场景：遇见Zero
    'meet_zero': {
        id: 'meet_zero',
        location: '废弃工厂',
        time: '深夜 02:00',
        weather: '暴雨',

        text: [
            '你在废弃工厂的阴暗角落里发现了一个身影。',
            '金色的瞳孔在黑暗中闪烁，像狼一样警惕地盯着你。',
            '是Zero。他的身上散发着危险的气息。'
        ],

        choices: [
            {
                id: 'talk_zero',
                text: '💬 与Zero对话（AI模式）',
                action: 'startAIDialogue',
                npc: 'Zero',
                effects: { spirit: -5 },
                description: '开启自由对话模式'
            },
            {
                id: 'approach',
                text: '→ 慢慢靠近',
                target: 'zero_reaction',
                effects: { energy: -5 }
            },
            {
                id: 'leave',
                text: '→ 悄悄离开',
                target: 'street_scene',
                effects: { mood: -10 }
            }
        ],

        // NPC初始状态
        npcState: {
            Zero: {
                mood: 'guarded',
                affection: 30
            }
        }
    },

    // Zero的反应场景
    'zero_reaction': {
        id: 'zero_reaction',
        location: '废弃工厂',
        time: '深夜 02:05',

        text: [
            'Zero微微后退了一步，手已经放在了腰间。',
            '"别过来。" 他的声音低沉而冰冷。',
            '你能感受到空气中弥漫的紧张气氛。'
        ],

        choices: [
            {
                id: 'explain',
                text: '→ 解释来意',
                target: 'zero_calm',
                effects: { mood: +5 }
            },
            {
                id: 'ai_talk',
                text: '💬 尝试对话（AI模式）',
                action: 'startAIDialogue',
                npc: 'Zero',
                context: {
                    tension: 'high',
                    relationship: 'stranger'
                }
            },
            {
                id: 'back_away',
                text: '→ 后退',
                target: 'safe_distance',
                effects: { energy: -2 }
            }
        ]
    },

    // 测试场景：遇见观察者
    'meet_observer': {
        id: 'meet_observer',
        location: '数据档案馆',
        time: '午后 14:30',

        text: [
            '在档案馆的深处，你看到一个穿着白大褂的身影。',
            '他正在翻阅着什么资料，似乎早就注意到了你的到来。',
            '"有趣...你终于来了。" 观察者露出神秘的微笑。'
        ],

        choices: [
            {
                id: 'talk_observer',
                text: '💬 与观察者交谈（AI模式）',
                action: 'startAIDialogue',
                npc: 'Observer',
                effects: { spirit: +5 },
                description: '他似乎知道些什么...'
            },
            {
                id: 'ask_about_past',
                text: '→ 询问过去',
                target: 'observer_cryptic',
                effects: { spirit: -10 }
            },
            {
                id: 'leave_quietly',
                text: '→ 安静离开',
                target: 'archive_entrance',
                effects: { mood: -5 }
            }
        ],

        npcState: {
            Observer: {
                mood: 'interested',
                knowledgeLevel: 'high'
            }
        }
    }
};

// 添加AI对话处理逻辑
window.TestAIScenes = TestAIScenes;

// 扩展场景管理器以支持AI对话触发
if (window.sceneManager) {
    // 保存原始的getNextScene方法
    if (!window.sceneManager._originalGetNextScene) {
        window.sceneManager._originalGetNextScene = window.sceneManager.getNextScene;
    }

    // 覆盖getNextScene，拦截AI对话场景
    window.sceneManager.getNextScene = function(choice) {
        console.log('🎭 getNextScene被调用，choice:', choice);

        // 如果是AI对话选择，不返回场景（这会触发AI对话流程）
        if (choice && choice.action === 'startAIDialogue') {
            console.log('🎭 检测到AI对话选择，开启AI对话模式');

            // 保存对话前的场景内容
            const storyArea = document.getElementById('storyArea');
            if (storyArea) {
                const existingContent = storyArea.innerHTML;
                storyArea.setAttribute('data-before-ai', existingContent);
            }

            // 初始化NPC（如果有响应式系统）
            if (window.createReactiveNPC && !window.reactiveNPCs?.[choice.npc]) {
                const npcState = this.currentScene?.npcState?.[choice.npc] || {};
                window.createReactiveNPC(choice.npc, {
                    affection: npcState.affection || 0,
                    mood: npcState.mood || 'neutral',
                    state: 'talking'
                });
            }

            // 开启AI对话（延迟执行，确保状态已更新）
            setTimeout(() => {
                if (window.aiDialogueManager) {
                    window.aiDialogueManager.startAIDialogue(choice.npc, choice.context || {});
                }

                // 更新场景状态为AI对话模式
                this.updateSceneState({
                    status: 'ai_dialogue',
                    selectedCount: 1,
                    canProceed: false
                });
            }, 100);

            console.log('🎭 AI对话准备就绪');
            return null; // 返回null，不加载新场景
        }

        // 调用原始方法
        return this._originalGetNextScene.call(this, choice);
    };
}

// 测试函数：快速加载测试场景
window.loadAITestScene = function(sceneId = 'meet_zero') {
    if (window.sceneManager && window.TestAIScenes[sceneId]) {
        window.sceneManager.loadScene(window.TestAIScenes[sceneId]);
        console.log('✅ 已加载AI测试场景:', sceneId);
    } else {
        console.error('❌ 无法加载测试场景');
    }
};

console.log('🎮 AI对话测试场景已加载');
console.log('💡 使用 loadAITestScene() 来测试AI对话功能');