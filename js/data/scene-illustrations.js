/**
 * 场景插图数据库
 * 存储所有场景和选项对应的插图数据
 */

const SceneIllustrations = {
    // 测试场景 - 宿舍
    'start': {
        default: {
            emoji: '🏠',
            caption: '温馨的宿舍',
            description: '阳光透过窗帘，房间显得格外温暖。'
        },
        choices: {
            'choice_0': { // 起床洗漱
                emoji: '🚿',
                caption: '洗漱台',
                description: '镜子里映出你略显疲惫的脸。'
            },
            'choice_1': { // 再睡一会
                emoji: '🛏️',
                caption: '舒适的床',
                description: '柔软的被子让人不想起床。'
            },
            'choice_2': { // 查看手机 - 使用浮层显示
                emoji: '📱',
                caption: '手机屏幕',
                description: '有几条未读消息和通知。',
                type: 'modal',  // 标记为浮层显示
                title: '手机界面'
            }
        }
    },

    // 图书馆场景
    'library': {
        default: {
            emoji: '📚',
            caption: '安静的图书馆',
            description: '书架间弥漫着淡淡的书香。'
        },
        choices: {
            '找一本轻小说': {
                emoji: '📖',
                caption: '《星之彼端》',
                description: '封面是璀璨的星空，看起来是本冒险故事。'
            },
            '查找学习资料': {
                emoji: '📚',
                caption: '厚重的教科书',
                description: '《高等数学》第三版，看起来就让人头疼。'
            },
            '翻翻杂志': {
                emoji: '📰',
                caption: '时尚杂志',
                description: '最新一期的VOGUE，封面是当红明星。'
            },
            '看漫画': {
                emoji: '📔',
                caption: '热门漫画',
                description: '《进击的巨人》最新一话，剧情正精彩。'
            }
        }
    },

    // 更衣室场景 - 组合插图
    'dressing_room': {
        default: {
            emoji: '👔',
            caption: '更衣室',
            description: '衣架上挂着各种服装。'
        },
        choices: {
            'uniform': {
                emoji: '👔',
                caption: '整洁的校服',
                description: '深蓝色的制服，看起来很正式。'
            },
            'casual': {
                emoji: '👕',
                caption: '休闲装',
                description: '舒适的T恤和牛仔裤。'
            },
            'formal': {
                emoji: '🤵',
                caption: '正装',
                description: '黑色西装，适合重要场合。'
            },
            'watch': {
                emoji: '⌚',
                caption: '精致的手表',
                description: '银色表带，简约设计。'
            },
            'necklace': {
                emoji: '💎',
                caption: '项链',
                description: '细链上挂着小巧的吊坠。'
            },
            // 组合插图
            'uniform+watch': {
                emoji: '👔⌚',
                caption: '校服配手表',
                description: '标准学生装扮，显得很有时间观念。'
            },
            'casual+necklace': {
                emoji: '👕💎',
                caption: '休闲装配项链',
                description: '随性中带着一丝精致。'
            },
            'formal+watch+necklace': {
                emoji: '🤵⌚💎',
                caption: '正装全套',
                description: '完美的正式装扮，适合重要约会。'
            }
        }
    },

    // 食堂场景
    'cafeteria': {
        default: {
            emoji: '🍽️',
            caption: '学校食堂',
            description: '饭菜飘香，人声鼎沸。'
        },
        choices: {
            'bento': {
                emoji: '🍱',
                caption: '精致便当',
                description: '有烤鱼、玉子烧和新鲜蔬菜，营养均衡。'
            },
            'ramen': {
                emoji: '🍜',
                caption: '热腾腾的拉面',
                description: '浓郁的豚骨汤底，配上叉烧和溏心蛋。'
            },
            'sandwich': {
                emoji: '🥪',
                caption: '三明治套餐',
                description: '新鲜的蔬菜和火腿，配薯条和饮料。'
            },
            'curry': {
                emoji: '🍛',
                caption: '咖喱饭',
                description: '香浓的日式咖喱浇在白米饭上。'
            }
        }
    },

    // 天台场景 - 时间变化插图
    'rooftop': {
        default: {
            emoji: '🏫',
            caption: '学校天台',
            description: '可以俯瞰整个校园的绝佳位置。'
        },
        morning: {
            emoji: '🌅',
            caption: '清晨的天台',
            description: '朝阳初升，天空被染成橙红色。'
        },
        noon: {
            emoji: '☀️',
            caption: '正午的天台',
            description: '阳光明媚，微风轻拂。'
        },
        evening: {
            emoji: '🌆',
            caption: '黄昏的天台',
            description: '夕阳西下，远处的城市被镀上金色。'
        },
        night: {
            emoji: '🌃',
            caption: '夜晚的天台',
            description: '繁星点点，城市的灯火闪烁。'
        }
    },

    // 特殊场景 - 遇到重要NPC
    'meet_lin': {
        default: {
            emoji: '👨‍🎓',
            caption: '林学长',
            description: '温文尔雅的学长，总是带着温暖的笑容。'
        },
        choices: {
            'greet': {
                emoji: '👋',
                caption: '打招呼',
                description: '学长回以温暖的笑容。'
            },
            'ask_study': {
                emoji: '📝',
                caption: '请教学习问题',
                description: '学长认真地为你解答。'
            },
            'chat': {
                emoji: '💬',
                caption: '闲聊',
                description: '愉快的对话让时间飞快流逝。'
            }
        }
    },

    // 彩蛋场景
    'secret_room': {
        default: {
            emoji: '🗝️',
            caption: '神秘房间',
            description: '这里似乎隐藏着什么秘密...'
        },
        easterEgg: {
            emoji: '🌈',
            caption: '发现了彩蛋！',
            description: '恭喜你找到了隐藏内容！',
            special: true // 标记为特殊插图
        }
    },

    // 商店场景 - 物品预览
    'shop': {
        default: {
            emoji: '🏪',
            caption: '便利店',
            description: '货架上摆满了各种商品。'
        },
        choices: {
            'drink': {
                emoji: '🥤',
                caption: '饮料',
                description: '冰镇可乐，看着就解渴。'
            },
            'snack': {
                emoji: '🍪',
                caption: '零食',
                description: '各种口味的饼干和薯片。'
            },
            'stationery': {
                emoji: '✏️',
                caption: '文具',
                description: '笔记本和各种颜色的笔。'
            },
            'gift': {
                emoji: '🎁',
                caption: '礼物',
                description: '精美包装的礼品盒。'
            }
        }
    }
};

// 获取场景插图数据
function getSceneIllustrations(sceneId) {
    return SceneIllustrations[sceneId] || null;
}

// 获取时间相关插图（如天台）
function getTimeBasedIllustration(sceneId, timeOfDay) {
    const scene = SceneIllustrations[sceneId];
    if (!scene) return null;

    // 检查是否有时间相关插图
    if (scene[timeOfDay]) {
        return scene[timeOfDay];
    }

    return scene.default || null;
}

// 检查是否有组合插图
function getCombinationIllustration(sceneId, items) {
    const scene = SceneIllustrations[sceneId];
    if (!scene || !scene.choices) return null;

    // 生成组合键
    const comboKey = items.sort().join('+');

    return scene.choices[comboKey] || null;
}

// 添加更多演示用的场景插图（展示浮层功能）
SceneIllustrations['modal_demo'] = {
    default: {
        emoji: '🎨',
        caption: '浮层演示',
        description: '这是一个使用浮层显示的插图示例',
        type: 'modal',
        title: '插图浮层系统',
        isLarge: true
    }
};

// 为现有的awakening场景添加浮层插图
SceneIllustrations['awakening'] = {
    default: {
        emoji: '🏥',
        caption: '神秘的房间',
        description: '你在一个陌生的白色房间中醒来，墙上的监控摄像头正对着你...',
        type: 'modal',
        title: '苏醒之地',
        isLarge: true
    },
    choices: {
        'examine_mirror': {
            emoji: '🪞',
            caption: '墙上的镜子',
            description: '镜子里映出一个陌生又熟悉的面孔，你的瞳孔中似乎有数字在闪烁...',
            type: 'modal',
            title: '镜中倒影'
        }
    }
};

// 导出
window.SceneIllustrations = SceneIllustrations;
window.getSceneIllustrations = getSceneIllustrations;
window.getTimeBasedIllustration = getTimeBasedIllustration;
window.getCombinationIllustration = getCombinationIllustration;