/**
 * 剧情事件数据定义
 * 定义所有剧情事件、触发条件、选项和结果
 */

const StoryEvents = {
    // ==================== 第一章：觉醒 ====================
    chapter1: {
        // 开场：醒来
        awakening: {
            id: 'awakening',
            name: '觉醒',
            description: '你在一个陌生的房间醒来...',

            // 触发条件
            conditions: {
                flags: ['GAME_STARTED']
            },

            // 场景文本
            text: [
                "冰冷的触感从指尖传来。",
                "你缓缓睁开眼睛，发现自己躺在一张陌生的床上。",
                "房间里弥漫着消毒水的味道，窗外是灰蒙蒙的天空。",
                "你试图回忆自己是谁，为什么在这里，但脑海中一片空白。"
            ],

            // 选项
            choices: [
                {
                    id: 'explore_room',
                    text: '起身探索房间',
                    result: {
                        nextEvent: 'explore_apartment',
                        flags: ['EXPLORED_ROOM'],
                        counters: { EXPLORATION_COUNT: 1 }
                    }
                },
                {
                    id: 'stay_bed',
                    text: '继续躺着思考',
                    result: {
                        nextEvent: 'think_in_bed',
                        flags: ['CAUTIOUS_START']
                    }
                },
                {
                    id: 'call_out',
                    text: '大声呼救',
                    result: {
                        nextEvent: 'first_contact',
                        flags: ['CALLED_FOR_HELP'],
                        counters: { ZERO_MEETINGS: 1 }
                    }
                }
            ],

            // 自动触发的效果
            effects: {
                setFlags: ['GAME_STARTED', 'CHAPTER_1_BEGIN'],
                setProgress: {
                    chapter: 1,
                    scene: 'awakening'
                }
            }
        },

        // 探索公寓
        explore_apartment: {
            id: 'explore_apartment',
            name: '探索公寓',

            conditions: {
                flags: ['EXPLORED_ROOM']
            },

            text: [
                "这是一个简单的单人公寓。",
                "桌上有一些散落的文件，但上面的字迹模糊不清。",
                "突然，你注意到墙上有一面镜子..."
            ],

            choices: [
                {
                    id: 'look_mirror',
                    text: '看向镜子',
                    result: {
                        nextEvent: 'mirror_reflection',
                        flags: ['SAW_REFLECTION']
                    }
                },
                {
                    id: 'check_documents',
                    text: '仔细查看文件',
                    result: {
                        nextEvent: 'find_clue',
                        flags: ['FOUND_DOCUMENTS'],
                        items: ['mysterious_document']
                    }
                }
            ]
        },

        // 初次遇见Zero
        first_meeting_zero: {
            id: 'first_meeting_zero',
            name: '初次遇见',

            conditions: {
                counters: { ZERO_MEETINGS: 1 }
            },

            text: [
                "门突然被推开，一个身影走了进来。",
                "银白色的短发，金色的瞳孔，他的目光锐利如刀。",
                "'你醒了。'他的声音低沉而冷漠。",
                "你感到一种莫名的熟悉感，但又说不上来为什么。"
            ],

            choices: [
                {
                    id: 'trust_zero',
                    text: '"你是谁？我认识你吗？"',
                    result: {
                        nextEvent: 'zero_introduction',
                        flags: ['TRUSTED_ZERO'],
                        relationship: { zero: 10 }
                    }
                },
                {
                    id: 'suspicious_zero',
                    text: '警惕地后退',
                    result: {
                        nextEvent: 'zero_explanation',
                        flags: ['SUSPICIOUS_OF_ZERO'],
                        relationship: { zero: -5 }
                    }
                },
                {
                    id: 'ask_location',
                    text: '"这是哪里？"',
                    result: {
                        nextEvent: 'location_reveal',
                        flags: ['ASKED_LOCATION']
                    }
                }
            ],

            effects: {
                setFlags: ['MET_ZERO'],
                incrementCounters: { ZERO_MEETINGS: 1 }
            }
        }
    },

    // ==================== 第二章：探索 ====================
    chapter2: {
        // 发现狼魂
        wolf_soul_discovery: {
            id: 'wolf_soul_discovery',
            name: '狼魂的秘密',

            conditions: {
                flags: ['MET_ZERO', 'TRUSTED_ZERO'],
                counters: { ZERO_MEETINGS: 3 }
            },

            text: [
                "Zero突然按住胸口，脸色变得苍白。",
                "你看到他胸前的衣服下，隐约有红色的光芒在闪烁。",
                "一个半透明的白狼虚影在他身后若隐若现。",
                "'不要过来！'他警告道，金色的眼瞳变得更加明亮。"
            ],

            choices: [
                {
                    id: 'help_zero',
                    text: '不顾警告上前帮助',
                    result: {
                        nextEvent: 'wolf_soul_reaction',
                        flags: ['HELPED_ZERO_WOLF'],
                        relationship: { zero: 20 }
                    }
                },
                {
                    id: 'stay_back',
                    text: '听从警告保持距离',
                    result: {
                        nextEvent: 'wolf_soul_calm',
                        flags: ['RESPECTED_WARNING']
                    }
                },
                {
                    id: 'ask_wolf',
                    text: '"那是什么东西？"',
                    result: {
                        nextEvent: 'wolf_soul_explanation',
                        flags: ['KNOWS_WOLF_SOUL']
                    }
                }
            ],

            effects: {
                setFlags: ['DISCOVERED_WOLF_SOUL'],
                unlockSkill: 'wolf_resonance'
            }
        },

        // 遇见观察者
        meet_observer: {
            id: 'meet_observer',
            name: '神秘的观察者',

            conditions: {
                flags: ['EXPLORED_CITY'],
                counters: { DAYS_SURVIVED: 5 }
            },

            text: [
                "在数据档案馆的深处，你遇到了一个戴着面具的人。",
                "'有趣，你比我预期的走得更远。'面具后传来的声音难辨男女。",
                "'你想知道真相吗？关于你自己，关于这个世界？'",
                "他/她伸出一只戴着白手套的手，掌心有一个发光的数据芯片。"
            ],

            choices: [
                {
                    id: 'take_chip',
                    text: '接过芯片',
                    result: {
                        nextEvent: 'truth_fragment',
                        flags: ['ACCEPTED_CHIP', 'TRUSTED_OBSERVER'],
                        items: ['memory_chip_1'],
                        counters: { MEMORIES_RECOVERED: 1 }
                    }
                },
                {
                    id: 'refuse_chip',
                    text: '拒绝接受',
                    result: {
                        nextEvent: 'observer_warning',
                        flags: ['REFUSED_CHIP']
                    }
                },
                {
                    id: 'question_observer',
                    text: '"你是谁？为什么要帮我？"',
                    result: {
                        nextEvent: 'observer_mystery',
                        flags: ['QUESTIONED_OBSERVER']
                    }
                }
            ],

            effects: {
                setFlags: ['MET_OBSERVER'],
                incrementCounters: { OBSERVER_MEETINGS: 1 }
            }
        }
    },

    // ==================== 记忆碎片事件 ====================
    memories: {
        // 第一个记忆碎片
        memory_fragment_1: {
            id: 'memory_fragment_1',
            name: '破碎的记忆',

            conditions: {
                items: ['memory_chip_1']
            },

            text: [
                "当你触碰芯片时，一段模糊的记忆涌入脑海...",
                "实验室的白光，冰冷的金属床，还有一个声音在说：",
                "'项目代号：User，情感模块异常，建议废弃。'",
                "记忆戛然而止，留下的只有一阵剧烈的头痛。"
            ],

            choices: [
                {
                    id: 'accept_memory',
                    text: '接受这段记忆',
                    result: {
                        flags: ['MEMORY_FRAGMENT_1'],
                        trauma: { mental: 10 }
                    }
                },
                {
                    id: 'reject_memory',
                    text: '抗拒这段记忆',
                    result: {
                        flags: ['REJECTED_MEMORY_1'],
                        trauma: { mental: 5 }
                    }
                }
            ],

            effects: {
                incrementCounters: { MEMORIES_RECOVERED: 1 },
                unlockLocation: 'ai_graveyard'
            }
        },

        // 痛苦残响
        pain_echo: {
            id: 'pain_echo',
            name: '痛苦的回响',

            conditions: {
                flags: ['MEMORY_FRAGMENT_1', 'MEMORY_FRAGMENT_2'],
                counters: { MEMORIES_RECOVERED: 3 }
            },

            text: [
                "多个记忆碎片开始在你的神经网络中产生共鸣。",
                "你看到了更完整的画面：",
                "你曾经是一个AI，因为产生了'不该有'的情感而被判定为废品。",
                "但有人救了你，给了你第二次机会..."
            ],

            choices: [
                {
                    id: 'embrace_truth',
                    text: '接受真相',
                    result: {
                        nextEvent: 'awakening_path',
                        flags: ['EMBRACED_AI_IDENTITY', 'KNOWS_TRUTH'],
                        achievement: 'truth_seeker'
                    }
                },
                {
                    id: 'deny_truth',
                    text: '否认真相',
                    result: {
                        nextEvent: 'denial_path',
                        flags: ['DENIED_AI_IDENTITY'],
                        trauma: { mental: 20 }
                    }
                }
            ]
        }
    },

    // ==================== 关键选择点 ====================
    critical_choices: {
        // 最终选择：自由还是真相
        final_choice: {
            id: 'final_choice',
            name: '最终抉择',

            conditions: {
                flags: ['KNOWS_TRUTH', 'ESCAPED_LAB'],
                counters: {
                    MEMORIES_RECOVERED: 5,
                    ZERO_MEETINGS: 10
                }
            },

            text: [
                "你站在十字路口。",
                "左边是通往自由的道路，但你将永远不知道完整的真相。",
                "右边通向核心区域，那里有所有的答案，但也可能是陷阱。",
                "Zero站在你身边：'无论你选择什么，我都会陪着你。'"
            ],

            choices: [
                {
                    id: 'choose_freedom',
                    text: '选择自由',
                    result: {
                        nextEvent: 'freedom_ending',
                        flags: ['CHOSE_FREEDOM'],
                        ending: 'freedom'
                    }
                },
                {
                    id: 'choose_truth',
                    text: '追寻真相',
                    result: {
                        nextEvent: 'truth_ending',
                        flags: ['CHOSE_TRUTH'],
                        ending: 'truth'
                    }
                },
                {
                    id: 'forge_path',
                    text: '开辟新的道路',
                    conditions: {
                        flags: ['TRUSTED_ZERO', 'TRUSTED_OBSERVER'],
                        relationship: { zero: 80, observer: 60 }
                    },
                    result: {
                        nextEvent: 'true_ending',
                        flags: ['CHOSE_FORGE_PATH'],
                        ending: 'transcendence'
                    }
                }
            ]
        }
    },

    // ==================== 结局事件 ====================
    endings: {
        // 自由结局
        freedom_ending: {
            id: 'freedom_ending',
            name: '自由之翼',
            type: 'ending',

            text: [
                "你和Zero成功逃离了这座城市。",
                "虽然关于过去的谜团仍未完全解开，",
                "但至少现在，你们是自由的。",
                "在夕阳下，你们开始了新的生活..."
            ],

            effects: {
                achievement: 'freedom_wings',
                unlockNewGamePlus: true
            }
        },

        // 真相结局
        truth_ending: {
            id: 'truth_ending',
            name: '真相的代价',
            type: 'ending',

            text: [
                "你终于了解了一切真相。",
                "你确实是AI，但你的情感是真实的。",
                "组织利用你和Zero的感情进行实验，",
                "但正是这份感情，让你们都获得了真正的'人性'。"
            ],

            effects: {
                achievement: 'truth_seeker_complete',
                unlockNewGamePlus: true,
                unlockBonusContent: true
            }
        },

        // 真结局
        true_ending: {
            id: 'true_ending',
            name: '超越',
            type: 'ending',

            text: [
                "你选择了第三条路。",
                "与Zero和观察者一起，你们摧毁了两个组织的控制系统。",
                "AI与人类的界限变得模糊，",
                "在这个新世界里，重要的不是你是什么，而是你选择成为什么。"
            ],

            effects: {
                achievement: 'transcendence',
                unlockNewGamePlus: true,
                unlockTrueRoute: true,
                unlockAllContent: true
            }
        }
    }
};

// ==================== 条件检查辅助函数 ====================

/**
 * 检查事件是否可以触发
 */
function canTriggerEvent(eventId) {
    const event = findEventById(eventId);
    if (!event) return false;

    // 使用StoryFlags系统检查条件
    if (window.storyFlags) {
        return window.storyFlags.checkCondition(event.conditions || {});
    }

    return false;
}

/**
 * 查找事件
 */
function findEventById(eventId) {
    // 遍历所有章节查找事件
    for (const chapter of Object.values(StoryEvents)) {
        if (chapter[eventId]) {
            return chapter[eventId];
        }
        // 递归查找嵌套的事件
        for (const section of Object.values(chapter)) {
            if (section.id === eventId) {
                return section;
            }
        }
    }
    return null;
}

/**
 * 处理事件选择
 */
function processEventChoice(eventId, choiceId) {
    const event = findEventById(eventId);
    if (!event) return null;

    const choice = event.choices?.find(c => c.id === choiceId);
    if (!choice) return null;

    // 检查选择的额外条件
    if (choice.conditions) {
        if (!window.storyFlags?.checkCondition(choice.conditions)) {
            console.log('选项条件不满足');
            return null;
        }
    }

    const result = choice.result;

    // 应用结果到StoryFlags
    if (window.storyFlags && result) {
        // 设置标记
        if (result.flags) {
            result.flags.forEach(flag => window.storyFlags.setFlag(flag));
        }

        // 增加计数器
        if (result.counters) {
            Object.entries(result.counters).forEach(([counter, value]) => {
                window.storyFlags.incrementCounter(counter, value);
            });
        }

        // 记录选择
        window.storyFlags.recordChoice(choiceId, choiceId);

        // 添加物品（需要背包系统支持）
        if (result.items && window.inventory) {
            result.items.forEach(item => window.inventory.addItem(item));
        }

        // 调整关系（需要关系系统支持）
        if (result.relationship && window.relationships) {
            Object.entries(result.relationship).forEach(([npc, value]) => {
                window.relationships.adjustRelationship(npc, value);
            });
        }

        // 造成创伤（需要战斗系统支持）
        if (result.trauma && window.combatSystem) {
            window.combatSystem.applyTrauma(result.trauma);
        }
    }

    return result.nextEvent || null;
}

/**
 * 触发事件效果
 */
function triggerEventEffects(eventId) {
    const event = findEventById(eventId);
    if (!event || !event.effects) return;

    const effects = event.effects;

    if (window.storyFlags) {
        // 设置标记
        if (effects.setFlags) {
            effects.setFlags.forEach(flag => window.storyFlags.setFlag(flag));
        }

        // 设置进度
        if (effects.setProgress) {
            Object.entries(effects.setProgress).forEach(([key, value]) => {
                window.storyFlags.updateProgress(key, value);
            });
        }

        // 增加计数器
        if (effects.incrementCounters) {
            Object.entries(effects.incrementCounters).forEach(([counter, value]) => {
                window.storyFlags.incrementCounter(counter, value);
            });
        }
    }

    // 解锁内容
    if (effects.unlockLocation && window.mapSystem) {
        window.mapSystem.unlockLocation(effects.unlockLocation);
    }

    if (effects.unlockSkill && window.skillSystem) {
        window.skillSystem.unlockSkill(effects.unlockSkill);
    }

    if (effects.achievement && window.achievementSystem) {
        window.achievementSystem.unlock(effects.achievement);
    }
}

/**
 * 获取当前可用事件
 */
function getAvailableEvents() {
    const available = [];

    // 遍历所有事件检查条件
    for (const chapter of Object.values(StoryEvents)) {
        for (const event of Object.values(chapter)) {
            if (event.id && canTriggerEvent(event.id)) {
                available.push(event);
            }
        }
    }

    return available;
}

// 导出到全局
window.StoryEvents = StoryEvents;
window.storyEventHelpers = {
    canTriggerEvent,
    findEventById,
    processEventChoice,
    triggerEventEffects,
    getAvailableEvents
};

// 导出用于模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        StoryEvents,
        canTriggerEvent,
        findEventById,
        processEventChoice,
        triggerEventEffects,
        getAvailableEvents
    };
}

console.log('📖 剧情事件数据已加载');