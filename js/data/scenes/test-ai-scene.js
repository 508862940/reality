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
                id: 'ai_decide',
                text: '🤖 等待Zero的反应（AI决策）',
                action: 'triggerAIDecision',
                npc: 'Zero',
                description: 'Zero会根据当前情况自主决定如何反应'
            },
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
                effects: { energy: -5 },
                // 🧠 记忆系统标记
                memoryType: 'player_choice',
                memoryTags: ['approach', 'brave'],
                emotionImpact: { affection: 5, intrigue: 3 }
            },
            {
                id: 'leave',
                text: '→ 悄悄离开',
                target: 'street_scene',
                effects: { mood: -10 },
                // 🧠 记忆系统标记
                memoryType: 'player_choice',
                memoryTags: ['leave', 'cautious'],
                emotionImpact: { affection: -5, trust: -3 }
            },
            {
                id: 'test_memory',
                text: '🧠 测试记忆系统',
                target: 'memory_test_scene',
                description: '查看Zero的记忆'
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
                effects: { mood: +5 },
                // 🧠 记忆系统标记
                memoryType: 'dialogue',
                memoryTags: ['honest', 'explain'],
                emotionImpact: { trust: 5, respect: 3 }
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
                effects: { energy: -2 },
                // 🧠 记忆系统标记
                memoryType: 'player_choice',
                memoryTags: ['retreat', 'cautious'],
                emotionImpact: { trust: 2 }
            },
            {
                id: 'gift_flower',
                text: '🌹 送他一朵玫瑰',
                target: 'zero_surprised',
                effects: { mood: +10, money: -5 },
                // 🧠 记忆系统标记（测试用）
                memoryType: 'gift',
                memoryTags: ['gift', 'romantic', 'rose'],
                emotionImpact: { affection: 15, intrigue: 8 },
                memoryImportance: 7  // 明确标记重要性
            }
        ]
    },

    // ============================================
    // AI决策分支场景（5种）
    // ============================================

    // 分支1：保护User
    'zero_protects': {
        id: 'zero_protects',
        location: '废弃工厂',
        time: '深夜 02:05',

        text: [
            'Zero的表情突然变得严肃，他快步走到你面前。',
            '"这里不安全，"他低声说道，金色的瞳孔扫视着周围的黑暗，"跟我来。"',
            '他没有等你回答，已经抓住你的手腕，带着你向安全的方向移动。',
            '你能感受到他手心的温度，以及那份不容置疑的保护欲。'
        ],

        choices: [
            {
                text: '→ 跟着他走',
                target: 'meet_zero',
                effects: { mood: +10, energy: -5 }
            },
            {
                text: '💬 继续对话',
                action: 'startAIDialogue',
                npc: 'Zero'
            }
        ]
    },

    // 分支2：远离User
    'zero_distances': {
        id: 'zero_distances',
        location: '废弃工厂',
        time: '深夜 02:05',

        text: [
            'Zero的眼神闪过一丝复杂的情绪，随后转身背对着你。',
            '"...你不应该来这里。"他的声音低沉而疲惫。',
            '"离我远一点，对你比较好。"',
            '他开始向阴影深处走去，似乎不愿与你有更多接触。'
        ],

        choices: [
            {
                text: '→ 追上去',
                target: 'zero_reaction',
                effects: { energy: -10 }
            },
            {
                text: '→ 尊重他的意愿',
                target: 'meet_zero',
                effects: { mood: -5 }
            }
        ]
    },

    // 分支3：热情打招呼
    'zero_greets_warmly': {
        id: 'zero_greets_warmly',
        location: '废弃工厂',
        time: '深夜 02:05',

        text: [
            'Zero看到你，金色的瞳孔里闪过一丝惊讶，随后嘴角微微上扬。',
            '"好久不见，"他走近几步，语气里带着少见的温和，"没想到会在这里遇到你。"',
            '"这么晚了，你怎么会来这种地方？"',
            '他的态度出乎意料的友好，让你放松了戒备。'
        ],

        choices: [
            {
                text: '→ 解释来意',
                target: 'meet_zero',
                effects: { mood: +5 }
            },
            {
                text: '💬 与Zero聊天',
                action: 'startAIDialogue',
                npc: 'Zero'
            }
        ]
    },

    // 分支4：冷淡回应
    'zero_responds_coldly': {
        id: 'zero_responds_coldly',
        location: '废弃工厂',
        time: '深夜 02:05',

        text: [
            'Zero瞥了你一眼，眼神冷漠而疏离。',
            '"......"他没有说话，只是站在原地，像是在等你先开口。',
            '空气中弥漫着令人不安的沉默。',
            '你能感觉到他竖起了一道无形的墙，拒人于千里之外。'
        ],

        choices: [
            {
                text: '→ 主动打招呼',
                target: 'zero_reaction',
                effects: { spirit: -5 }
            },
            {
                text: '→ 保持沉默',
                target: 'meet_zero',
                effects: { mood: -3 }
            },
            {
                text: '💬 尝试对话',
                action: 'startAIDialogue',
                npc: 'Zero'
            }
        ]
    },

    // 分支5：狼魂爆发
    'zero_wolf_outbreak': {
        id: 'zero_wolf_outbreak',
        location: '废弃工厂',
        time: '深夜 02:05',

        text: [
            '⚠️ 危险！',
            'Zero的双眼突然变得血红，胸前的猩红印记开始剧烈闪烁！',
            '一股强大的压迫感扑面而来，你看到他身后浮现出半透明的白色狼影。',
            '"滚...开......"他咬着牙，似乎在拼命压制着什么，"快...走...！"',
            '狼魂的杀戮欲正在侵蚀他的意识！'
        ],

        choices: [
            {
                text: '⚠️ 立刻逃跑！',
                target: 'meet_zero',
                effects: { mood: -20, energy: -15 }
            },
            {
                text: '→ 试图唤醒他',
                target: 'zero_reaction',
                effects: { spirit: -15, energy: -10 }
            }
        ]
    },

    // 🧠 记忆测试场景：送玫瑰后的反应
    'zero_surprised': {
        id: 'zero_surprised',
        location: '废弃工厂',
        time: '深夜 02:10',

        text: [
            'Zero愣住了，金色的瞳孔里闪过难以置信的神色。',
            '他盯着你手中的玫瑰，沉默了很久。',
            '"...为什么？"他的声音有些沙哑，"你知道我是什么样的存在吗？"',
            '但他还是小心翼翼地接过了那朵玫瑰，像是怕碰碎了什么珍贵的东西。',
            '你能看到他眼中一闪而过的温柔。'
        ],

        choices: [
            {
                text: '→ "因为我想送给你"',
                target: 'meet_zero',
                effects: { mood: +15 },
                // 🧠 记忆系统标记
                memoryType: 'dialogue',
                memoryTags: ['honest', 'romantic', 'confession'],
                emotionImpact: { affection: 10, trust: 8 },
                memoryImportance: 8
            },
            {
                text: '→ "只是想让你开心"',
                target: 'meet_zero',
                effects: { mood: +10 },
                // 🧠 记忆系统标记
                memoryType: 'dialogue',
                memoryTags: ['kind', 'caring'],
                emotionImpact: { affection: 8, trust: 5 }
            },
            {
                text: '💬 继续对话（AI模式）',
                action: 'startAIDialogue',
                npc: 'Zero'
            }
        ]
    },

    // 🧪 Phase 2 测试场景：记忆影响决策测试（陌生人 vs 老朋友）
    'test_memory_influence': {
        id: 'test_memory_influence',
        location: '废弃工厂',
        time: '深夜 02:20',

        text: [
            '🧪 Phase 2 测试场景：记忆影响决策',
            '',
            '这是用来测试记忆系统是否真的影响AI决策的场景。',
            '场景设置相同，但Zero的记忆状态不同：',
            '',
            '- 选项1：陌生人状态（无历史记忆）',
            '- 选项2：老朋友状态（大量历史记忆）',
            '',
            '预期结果：相同情境下，老朋友状态的Zero应该更热情、更愿意互动。'
        ],

        choices: [
            {
                id: 'test_stranger',
                text: '🧪 测试1：陌生人状态（无记忆）',
                target: 'test_stranger_greeting',
                memoryType: 'test',
                memoryTags: ['test', 'memory_influence'],
                memoryImportance: 0
            },
            {
                id: 'test_acquaintance',
                text: '🧪 测试2：初识状态（见过5次）',
                target: 'test_acquaintance_greeting',
                memoryType: 'test',
                memoryTags: ['test', 'memory_influence'],
                memoryImportance: 0
            },
            {
                id: 'test_normal_friend',
                text: '🧪 测试3：普通朋友（问候20次）',
                target: 'test_normal_friend_greeting',
                memoryType: 'test',
                memoryTags: ['test', 'memory_influence'],
                memoryImportance: 0
            },
            {
                id: 'test_friend',
                text: '🧪 测试4：老朋友状态（丰富记忆）',
                target: 'test_friend_greeting',
                memoryType: 'test',
                memoryTags: ['test', 'memory_influence'],
                memoryImportance: 0
            },
            {
                id: 'test_rejected',
                text: '🧪 测试5：被拒绝过（拒绝10次）',
                target: 'test_rejected_greeting',
                memoryType: 'test',
                memoryTags: ['test', 'memory_influence'],
                memoryImportance: 0
            },
            {
                id: 'back_to_main',
                text: '← 返回主测试场景',
                target: 'meet_zero',
                memoryImportance: 0
            }
        ]
    },

    // 测试1：陌生人打招呼
    'test_stranger_greeting': {
        id: 'test_stranger_greeting',
        location: '废弃工厂',
        time: '深夜 02:21',

        text: [
            '🧪 测试1：陌生人状态',
            '',
            '你第一次遇见Zero，他对你毫无印象。',
            '（Zero记忆清空：无历史问候、无礼物、无对话）',
            '',
            '你主动走上前打招呼...'
        ],

        choices: [
            {
                id: 'greet_stranger',
                text: '👋 "你好，我叫..." ',
                target: 'stranger_ai_decision',
                // 🧠 触发AI决策前清空Zero记忆
                specialEffect: 'clearZeroMemory',
                memoryType: 'dialogue',
                memoryTags: ['greeting', 'first_meet'],
                memoryImportance: 5
            }
        ]
    },

    // 陌生人AI决策场景
    'stranger_ai_decision': {
        id: 'stranger_ai_decision',
        location: '废弃工厂',
        time: '深夜 02:21',

        text: [
            '🤖 Zero正在做决策...',
            '',
            '（状态：陌生人，好感度0，信赖度0，历史问候0次，收礼0次，对话0次）'
        ],

        choices: [
            {
                id: 'trigger_stranger_ai',
                text: '▶️ 触发AI决策',
                // 🤖 触发AI决策系统
                action: 'triggerAIDecision',
                npc: 'zero',
                context: {
                    player: { health: 100, trauma: 0, mood: 100 },
                    distance: 0.2,
                    hasEnemy: false
                },
                target: 'test_memory_influence'
            }
        ]
    },

    // 🆕 Phase 2.5 测试2：初识状态
    'test_acquaintance_greeting': {
        id: 'test_acquaintance_greeting',
        location: '废弃工厂',
        time: '深夜 02:21',

        text: [
            '🧪 测试2：初识状态',
            '',
            '你和Zero见过几次面，算是认识。',
            '（模拟记忆：问候5次，简单聊过10句，好感度20，信赖度10）',
            '',
            '你走上前打招呼...'
        ],

        choices: [
            {
                id: 'greet_acquaintance',
                text: '👋 "嗨，Zero" ',
                target: 'acquaintance_ai_decision',
                specialEffect: 'injectAcquaintanceMemory',
                memoryType: 'dialogue',
                memoryTags: ['greeting', 'acquaintance'],
                memoryImportance: 3
            }
        ]
    },

    'acquaintance_ai_decision': {
        id: 'acquaintance_ai_decision',
        location: '废弃工厂',
        time: '深夜 02:21',

        text: [
            '🤖 Zero正在做决策...',
            '',
            '（状态：初识，好感度20，信赖度10，问候5次，对话10次）'
        ],

        choices: [
            {
                id: 'trigger_acquaintance_ai',
                text: '▶️ 触发AI决策',
                action: 'triggerAIDecision',
                npc: 'zero',
                context: {
                    player: { health: 100, trauma: 0, mood: 100 },
                    distance: 0.2,
                    hasEnemy: false
                },
                target: 'test_memory_influence'
            }
        ]
    },

    // 🆕 Phase 2.5 测试3：普通朋友状态
    'test_normal_friend_greeting': {
        id: 'test_normal_friend_greeting',
        location: '废弃工厂',
        time: '深夜 02:21',

        text: [
            '🧪 测试3：普通朋友状态',
            '',
            '你和Zero算是普通朋友。',
            '（模拟记忆：问候20次，送过2次礼物，对话40次，好感度40，信赖度35）',
            '',
            '你走上前打招呼...'
        ],

        choices: [
            {
                id: 'greet_normal_friend',
                text: '👋 "Zero！" ',
                target: 'normal_friend_ai_decision',
                specialEffect: 'injectNormalFriendMemory',
                memoryType: 'dialogue',
                memoryTags: ['greeting', 'normal_friend'],
                memoryImportance: 5
            }
        ]
    },

    'normal_friend_ai_decision': {
        id: 'normal_friend_ai_decision',
        location: '废弃工厂',
        time: '深夜 02:21',

        text: [
            '🤖 Zero正在做决策...',
            '',
            '（状态：普通朋友，好感度40，信赖度35，问候20次，礼物2次，对话40次）'
        ],

        choices: [
            {
                id: 'trigger_normal_friend_ai',
                text: '▶️ 触发AI决策',
                action: 'triggerAIDecision',
                npc: 'zero',
                context: {
                    player: { health: 100, trauma: 0, mood: 100 },
                    distance: 0.2,
                    hasEnemy: false
                },
                target: 'test_memory_influence'
            }
        ]
    },

    // 测试4：老朋友打招呼
    'test_friend_greeting': {
        id: 'test_friend_greeting',
        location: '废弃工厂',
        time: '深夜 02:21',

        text: [
            '🧪 测试2：老朋友状态',
            '',
            '你和Zero已经认识很久，有很多共同回忆。',
            '（模拟记忆：历史问候50次，送过5次礼物，深度对话100次）',
            '',
            '你走上前打招呼...'
        ],

        choices: [
            {
                id: 'greet_friend',
                text: '👋 "嘿，Zero！" ',
                target: 'friend_ai_decision',
                // 🧠 触发AI决策前注入大量历史记忆
                specialEffect: 'injectFriendMemory',
                memoryType: 'dialogue',
                memoryTags: ['greeting', 'old_friend'],
                memoryImportance: 5
            }
        ]
    },

    // 老朋友AI决策场景
    'friend_ai_decision': {
        id: 'friend_ai_decision',
        location: '废弃工厂',
        time: '深夜 02:21',

        text: [
            '🤖 Zero正在做决策...',
            '',
            '（状态：老朋友，好感度70，信赖度60，历史问候50次，收礼5次，对话100次）'
        ],

        choices: [
            {
                id: 'trigger_friend_ai',
                text: '▶️ 触发AI决策',
                // 🤖 触发AI决策系统
                action: 'triggerAIDecision',
                npc: 'zero',
                context: {
                    player: { health: 100, trauma: 0, mood: 100 },
                    distance: 0.2,
                    hasEnemy: false
                },
                target: 'test_memory_influence'
            }
        ]
    },

    // 🆕 Phase 2.5 测试5：被拒绝过的状态
    'test_rejected_greeting': {
        id: 'test_rejected_greeting',
        location: '废弃工厂',
        time: '深夜 02:21',

        text: [
            '🧪 测试5：被拒绝过的状态',
            '',
            '你和Zero有过一些互动，但被拒绝了很多次。',
            '（模拟记忆：问候20次，送过3次礼物，对话30次，但被拒绝10次！）',
            '（好感度30，信赖度20 - 拒绝影响了关系发展）',
            '',
            'Zero看起来有些警惕...'
        ],

        choices: [
            {
                id: 'greet_rejected',
                text: '👋 "Zero..." （试探性打招呼）',
                target: 'rejected_ai_decision',
                specialEffect: 'injectRejectedMemory',
                memoryType: 'dialogue',
                memoryTags: ['greeting', 'rejected_before'],
                memoryImportance: 4
            }
        ]
    },

    'rejected_ai_decision': {
        id: 'rejected_ai_decision',
        location: '废弃工厂',
        time: '深夜 02:21',

        text: [
            '🤖 Zero正在做决策...',
            '',
            '（状态：被拒绝过，好感度30，信赖度20，问候20次，礼物3次，对话30次，拒绝10次）'
        ],

        choices: [
            {
                id: 'trigger_rejected_ai',
                text: '▶️ 触发AI决策',
                action: 'triggerAIDecision',
                npc: 'zero',
                context: {
                    player: { health: 100, trauma: 0, mood: 100 },
                    distance: 0.2,
                    hasEnemy: false
                },
                target: 'test_memory_influence'
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

    // 覆盖getNextScene，拦截AI对话场景和AI决策触发
    window.sceneManager.getNextScene = function(choice) {
        console.log('🎭 getNextScene被调用，choice:', choice);

        // ============================================
        // 🤖 AI决策触发逻辑
        // ============================================
        if (choice && choice.action === 'triggerAIDecision') {
            console.log('🤖 触发AI决策系统');

            // 获取Zero的AI决策
            const decision = window.getZeroAIDecision?.();

            if (!decision) {
                console.error('❌ AI决策失败，Zero未初始化');
                return this._originalGetNextScene.call(this, choice);
            }

            console.log('🤖 AI决策结果:', decision.action);
            console.log('   - 效用分数:', decision.utility.toFixed(2));
            console.log('   - 所有分数:', decision.allScores);

            // 根据AI决策结果映射到对应场景
            const actionSceneMap = {
                '保护User': 'zero_protects',
                '远离User': 'zero_distances',
                '热情打招呼': 'zero_greets_warmly',
                '冷淡回应': 'zero_responds_coldly',
                '狼魂爆发': 'zero_wolf_outbreak'
            };

            const targetSceneId = actionSceneMap[decision.action];

            if (targetSceneId && window.TestAIScenes[targetSceneId]) {
                console.log('🤖 加载AI决策场景:', targetSceneId);
                return window.TestAIScenes[targetSceneId];
            } else {
                console.error('❌ 未找到对应场景:', decision.action);
                return this._originalGetNextScene.call(this, choice);
            }
        }

        // ============================================
        // 💬 AI对话触发逻辑（原有）
        // ============================================
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
        // 🔧 修复：加载前先保存当前世界快照（确保回溯功能正常）
        if (window.sceneManager.saveWorldSnapshot) {
            window.sceneManager.saveWorldSnapshot();
            console.log('💾 已保存当前世界快照');
        }

        window.sceneManager.loadScene(window.TestAIScenes[sceneId]);
        console.log('✅ 已加载AI测试场景:', sceneId);
    } else {
        console.error('❌ 无法加载测试场景');
    }
};

// ============================================
// 🧠 记忆系统测试场景（Phase 1）
// ============================================

TestAIScenes['memory_test_scene'] = {
    id: 'memory_test_scene',
    location: '废弃工厂',
    time: '深夜 02:10',
    text: [
        '🧠 记忆系统测试',
        '---',
        (() => {
            if (!window.zero || !window.zero.memory) {
                return '❌ Zero的记忆系统未初始化';
            }

            const summary = window.MemoryIntegration.getMemorySummary('Zero');
            if (!summary) {
                return '❌ 无法获取记忆摘要';
            }

            let text = `✅ Zero的记忆状态：\n\n`;
            text += `📊 短期记忆：${summary.shortTermCount} 条\n`;
            text += `💾 长期记忆：${summary.longTermCount} 条\n\n`;

            if (summary.shortTermCount > 0) {
                text += `📝 最近5条记忆：\n`;
                summary.recentMemories.forEach((m, i) => {
                    text += `${i + 1}. [${m.type}] ${m.content} (Day ${m.gameDay})\n`;
                });
            } else {
                text += `💭 还没有记忆...\n`;
            }

            text += `\n🔢 事件统计：\n`;
            for (const [type, count] of Object.entries(summary.eventCounts)) {
                text += `- ${type}: ${count}次\n`;
            }

            return text;
        })()
    ],
    choices: [
        {
            id: 'add_test_memory',
            text: '➕ 添加测试记忆',
            action: 'custom',
            handler: () => {
                if (window.zero && window.zero.memory) {
                    window.zero.memory.addWithContext({
                        type: 'test_event',
                        content: '这是一条测试记忆',
                        tags: ['test'],
                        emotionImpact: { affection: 10 }
                    });
                    window.MemoryIntegration.syncToWorldState('Zero');
                    alert('✅ 测试记忆已添加！刷新页面后会保留。');
                    window.loadAITestScene('memory_test_scene'); // 刷新场景
                }
            }
        },
        {
            id: 'check_worldstate',
            text: '🔍 检查WorldState',
            action: 'custom',
            handler: () => {
                const data = window.worldState?.state?.npcs?.Zero?.memory;
                console.log('📦 WorldState中的Zero记忆：', data);
                alert(data ? `✅ 记忆已同步到WorldState！\n短期：${data.shortTerm?.length || 0}条\n长期：${data.longTerm?.length || 0}条` : '❌ WorldState中没有记忆数据');
            }
        },
        {
            id: 'clear_memory',
            text: '🗑️ 清空所有记忆',
            action: 'custom',
            handler: () => {
                if (confirm('确定要清空Zero的所有记忆吗？')) {
                    if (window.zero && window.zero.memory) {
                        window.zero.memory.clearAll();
                        window.MemoryIntegration.syncToWorldState('Zero');
                        alert('✅ 记忆已清空');
                        window.loadAITestScene('memory_test_scene');
                    }
                }
            }
        },
        {
            id: 'back',
            text: '← 返回',
            target: 'meet_zero'
        }
    ]
};

console.log('🎮 AI对话测试场景已加载');
console.log('💡 使用 loadAITestScene() 来测试AI对话功能');
console.log('🧠 使用 loadAITestScene("memory_test_scene") 测试记忆系统');