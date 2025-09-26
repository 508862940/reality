/**
 * NPC角色数据定义
 * 定义所有NPC的基础信息、性格、喜好等
 */

const NPCProfiles = {
    // ==================== 主要角色 ====================

    /**
     * Zero（凌） - 主要可攻略角色
     */
    Zero: {
        id: 'Zero',
        name: '凌',
        displayName: 'Zero',

        // 基础信息
        profile: {
            age: '未知（外表22岁）',
            gender: 'male',
            height: '183cm',
            appearance: '银白短发，金色瞳孔，身材修长有力',
            occupation: '实验体/守护者',
            location: 'lab_underground' // 初始位置
        },

        // 性格特征
        personality: {
            traits: ['沉默寡言', '冷酷', '保护欲强', '内心温柔'],
            likes: ['安静', '月光', '自由', 'User'],
            dislikes: ['实验', '束缚', '背叛', '狼魂失控'],
            fears: ['失去User', '狼魂完全失控', '永远被困']
        },

        // 初始关系值
        initialRelationship: {
            affection: 30,  // 有一定好感（因为之前的记忆）
            trust: 20,      // 信任度较低（被组织控制）
            stage: 'acquaintance'
        },

        // 礼物反应
        giftReactions: {
            // 喜爱的礼物
            love: ['自由徽章', '月光石', '手工护身符'],
            // 喜欢的礼物
            like: ['安神香', '战术匕首', '黑咖啡'],
            // 中立的礼物
            neutral: ['普通食物', '书籍', '日用品'],
            // 不喜欢的礼物
            dislike: ['甜食', '鲜花', '酒精'],
            // 讨厌的礼物
            hate: ['镇定剂', '项圈', '实验报告']
        },

        // 对话选项影响
        dialoguePreferences: {
            // 增加好感的对话类型
            positive: ['关心', '理解', '支持自由', '相信'],
            // 减少好感的对话类型
            negative: ['怀疑', '命令', '谈论实验', '背叛']
        },

        // 特殊事件
        specialEvents: {
            'wolf_soul_reveal': {
                requirement: { affection: 40, trust: 30 },
                description: '狼魂秘密揭露'
            },
            'first_transformation': {
                requirement: { affection: 60, flags: ['WOLF_SOUL_REVEALED'] },
                description: '首次狼化'
            },
            'confession': {
                requirement: { affection: 75, trust: 60 },
                description: '告白事件'
            }
        },

        // AI对话设定（未来接入API时使用）
        aiSettings: {
            systemPrompt: '你是Zero（凌），一个被军事组织改造的实验体，体内有狼魂。表面冷漠，但对User有特殊感情。说话简短有力，不轻易表露情感。',
            temperature: 0.7,
            maxTokens: 150
        }
    },

    /**
     * Observer（观察者） - 第二可攻略角色
     */
    Observer: {
        id: 'Observer',
        name: '观察者',
        displayName: '？？？',  // 初始显示名

        profile: {
            age: '28',
            gender: 'unknown',  // 性别不明
            height: '175cm',
            appearance: '戴着面具，身着白大褂，身形中等',
            occupation: 'B组织研究员',
            location: 'monitoring_room'
        },

        personality: {
            traits: ['神秘', '理性', '矛盾', '善良本性'],
            likes: ['真相', '正义', '妹妹', '研究'],
            dislikes: ['谎言', '组织的黑暗', '无意义的牺牲'],
            fears: ['失去妹妹的线索', '成为自己所恨的人']
        },

        initialRelationship: {
            affection: 0,
            trust: 0,
            stage: 'stranger'
        },

        giftReactions: {
            love: ['妹妹的照片', '正义徽章', '真相之书'],
            like: ['咖啡', '解密游戏', '古典音乐唱片'],
            neutral: ['普通物品', '食物', '装饰品'],
            dislike: ['武器', '奢侈品', '谎言探测器'],
            hate: ['组织徽章', '实验数据', '背叛的证据']
        },

        dialoguePreferences: {
            positive: ['追求真相', '同情', '理解复仇', '智慧'],
            negative: ['盲从', '愚蠢', '揭露其软弱', '威胁妹妹']
        },

        specialEvents: {
            'reveal_identity': {
                requirement: { affection: 30, trust: 40 },
                description: '揭露真实身份'
            },
            'sister_clue': {
                requirement: { affection: 50, flags: ['FOUND_SISTER_CLUE'] },
                description: '妹妹线索事件'
            },
            'side_switch': {
                requirement: { affection: 70, trust: 80 },
                description: '背叛组织，帮助逃离'
            }
        },

        aiSettings: {
            systemPrompt: '你是观察者，B组织的研究员，表面冷静理性，实则为了寻找失踪的妹妹而潜伏。说话谨慎，经常用隐喻，不轻易透露真实想法。',
            temperature: 0.8,
            maxTokens: 200
        }
    },

    // ==================== 次要角色 ====================

    /**
     * Dr.Chen（陈博士） - 功能型NPC
     */
    DrChen: {
        id: 'DrChen',
        name: '陈博士',
        displayName: '陈博士',

        profile: {
            age: '45',
            gender: 'female',
            appearance: '戴眼镜，白大褂，严肃',
            occupation: '首席研究员',
            location: 'laboratory'
        },

        personality: {
            traits: ['严谨', '冷静', '工作狂'],
            likes: ['科学', '效率', '突破'],
            dislikes: ['感情用事', '失败', '违背科学']
        },

        initialRelationship: {
            affection: 10,
            trust: 5,
            stage: 'stranger'
        },

        giftReactions: {
            love: ['研究资料', '稀有样本'],
            like: ['咖啡', '实验器材'],
            neutral: ['普通物品'],
            dislike: ['娱乐用品', '零食'],
            hate: ['假数据', '破坏品']
        },

        // 功能型NPC的特殊属性
        functions: {
            shop: false,
            quest: true,
            info: true
        }
    },

    /**
     * GuardA（守卫A） - 普通NPC
     */
    GuardA: {
        id: 'GuardA',
        name: '守卫',
        displayName: '守卫A',

        profile: {
            age: '30',
            gender: 'male',
            appearance: '制服，面无表情',
            occupation: '设施守卫',
            location: 'entrance'
        },

        personality: {
            traits: ['忠诚', '警惕', '刻板'],
            likes: ['秩序', '规则'],
            dislikes: ['混乱', '违规']
        },

        initialRelationship: {
            affection: 0,
            trust: 0,
            stage: 'stranger'
        },

        // 简单NPC只有基础反应
        giftReactions: {
            like: ['香烟', '咖啡'],
            neutral: ['其他所有物品']
        },

        functions: {
            shop: false,
            quest: false,
            info: false,
            obstacle: true  // 是障碍型NPC
        }
    }
};

// ==================== NPC辅助函数 ====================

/**
 * 获取NPC资料
 */
function getNPCProfile(npcId) {
    return NPCProfiles[npcId] || null;
}

/**
 * 获取NPC显示名称
 */
function getNPCDisplayName(npcId) {
    const profile = getNPCProfile(npcId);
    if (!profile) return '未知';

    // 如果关系够好，显示真名
    if (window.relationships) {
        const relationship = window.relationships.getRelationship(npcId);
        if (relationship.stage !== 'stranger' && profile.name !== profile.displayName) {
            return profile.name;
        }
    }

    return profile.displayName;
}

/**
 * 获取NPC当前位置
 */
function getNPCLocation(npcId) {
    const profile = getNPCProfile(npcId);
    if (!profile) return 'unknown';

    // 这里可以根据时间、剧情等动态改变NPC位置
    // 暂时返回默认位置
    return profile.profile.location;
}

/**
 * 检查礼物反应
 */
function checkGiftReaction(npcId, giftId) {
    const profile = getNPCProfile(npcId);
    if (!profile) return 'neutral';

    const reactions = profile.giftReactions;

    if (reactions.love && reactions.love.includes(giftId)) return 'love';
    if (reactions.like && reactions.like.includes(giftId)) return 'like';
    if (reactions.dislike && reactions.dislike.includes(giftId)) return 'dislike';
    if (reactions.hate && reactions.hate.includes(giftId)) return 'hate';

    return 'neutral';
}

/**
 * 处理对话选择的影响
 */
function handleDialogueChoice(npcId, choiceType) {
    const profile = getNPCProfile(npcId);
    if (!profile || !window.relationships) return;

    const preferences = profile.dialoguePreferences;
    let affectionChange = 0;
    let trustChange = 0;

    if (preferences.positive && preferences.positive.includes(choiceType)) {
        affectionChange = 5;
        trustChange = 3;
    } else if (preferences.negative && preferences.negative.includes(choiceType)) {
        affectionChange = -5;
        trustChange = -3;
    }

    if (affectionChange !== 0) {
        window.relationships.adjustAffection(npcId, affectionChange, `dialogue_${choiceType}`);
    }
    if (trustChange !== 0) {
        window.relationships.adjustTrust(npcId, trustChange, `dialogue_${choiceType}`);
    }
}

/**
 * 获取可触发的特殊事件
 */
function getAvailableSpecialEvents(npcId) {
    const profile = getNPCProfile(npcId);
    if (!profile || !profile.specialEvents) return [];

    const available = [];
    const relationship = window.relationships?.getRelationship(npcId);

    for (const [eventId, event] of Object.entries(profile.specialEvents)) {
        let canTrigger = true;

        // 检查好感度和信任度要求
        if (event.requirement.affection && relationship.affection < event.requirement.affection) {
            canTrigger = false;
        }
        if (event.requirement.trust && relationship.trust < event.requirement.trust) {
            canTrigger = false;
        }

        // 检查剧情标记要求
        if (event.requirement.flags && window.storyFlags) {
            for (const flag of event.requirement.flags) {
                if (!window.storyFlags.checkFlag(flag)) {
                    canTrigger = false;
                    break;
                }
            }
        }

        if (canTrigger) {
            available.push({
                id: eventId,
                npcId,
                ...event
            });
        }
    }

    return available;
}

/**
 * 初始化所有NPC关系
 */
function initializeAllNPCs() {
    if (!window.relationships) return;

    for (const [npcId, profile] of Object.entries(NPCProfiles)) {
        if (profile.initialRelationship) {
            window.relationships.initRelationship(npcId, profile.initialRelationship);
        }
    }

    console.log('👥 所有NPC关系已初始化');
}

// 导出到全局
window.NPCProfiles = NPCProfiles;
window.npcHelpers = {
    getNPCProfile,
    getNPCDisplayName,
    getNPCLocation,
    checkGiftReaction,
    handleDialogueChoice,
    getAvailableSpecialEvents,
    initializeAllNPCs
};

// 导出供模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        NPCProfiles,
        getNPCProfile,
        getNPCDisplayName,
        getNPCLocation,
        checkGiftReaction,
        handleDialogueChoice,
        getAvailableSpecialEvents,
        initializeAllNPCs
    };
}

console.log('👥 NPC档案数据已加载');