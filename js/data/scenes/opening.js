/**
 * 游戏开场场景 - User醒来
 * 表面：普通都市青年的日常生活开始
 */

const OpeningScenes = {
    // 场景001：醒来
    'awakening': {
        id: 'awakening',
        location: '公寓',
        time: '周一 07:30',
        weather: '阴天',

        text: [
            '手机闹钟的铃声把你吵醒。',
            '你躺在狭小的单人床上，盯着天花板发了一会呆。',
            '窗外传来新京市早高峰的喧嚣声，又是新的一天。',
            '奇怪的是，你记不太清昨天做了什么...算了，可能是太累了。'
        ],

        // 状态初始化（注意：没有HP值）
        initStats: {
            energy: 75,    // 体力
            mood: 50,      // 心情
            spirit: 60,    // 精神
            money: 500     // 金钱（初始资金）
        },

        choices: [
            {
                id: 'get_up',
                text: '→ 起床洗漱',
                target: 'morning_routine',
                effects: { energy: -5, spirit: +5 }
            },
            {
                id: 'sleep_more',
                text: '→ 再睡一会',
                target: 'oversleep',
                effects: { energy: +10, mood: +5 }
            },
            {
                id: 'check_phone',
                text: '→ 查看手机',
                target: 'phone_check',
                effects: { spirit: -5 }
            }
        ],

        // 场景插图
        illustrations: {
            default: {
                emoji: '🏠',
                caption: '简陋的公寓',
                description: '只有一张床和基本家具的小房间'
            }
        }
    },

    // 场景002A：日常洗漱
    'morning_routine': {
        id: 'morning_routine',
        location: '公寓·洗手间',
        time: '周一 07:45',

        text: [
            '你走进狭小的洗手间，镜子里映出略显疲惫的脸。',
            '【可自定义外观】',
            '刷牙的时候，你试图回想自己的工作...是什么来着？',
            '记忆有些模糊，但你隐约记得需要去市中心。'
        ],

        choices: [
            {
                id: 'think_harder',
                text: '→ 努力回想',
                target: 'memory_fragment_1',
                effects: { spirit: -10 },
                hiddenTrigger: 'cognitiveStrain' // 隐藏触发器
            },
            {
                id: 'ignore',
                text: '→ 不管了，准备出门',
                target: 'prepare_leave',
                effects: { mood: +5 }
            },
            {
                id: 'check_calendar',
                text: '→ 查看日程',
                target: 'calendar_check'
            }
        ]
    },

    // 场景002B：查看手机
    'phone_check': {
        id: 'phone_check',
        location: '公寓',
        time: '周一 07:35',

        text: [
            '你拿起手机，屏幕显示有几条未读消息。',
            '',
            '【未知号码】：记得今天的约定。',
            '【外卖APP】：早餐五折优惠！',
            '【新闻推送】：新京市昨夜发生小规模停电...',
            '',
            '第一条消息让你感到莫名的不安，但你完全想不起什么约定。'
        ],

        items: ['mysterious_message'], // 获得线索道具（但不明显）

        choices: [
            {
                id: 'reply_message',
                text: '→ 回复神秘消息',
                target: 'reply_unknown',
                effects: { spirit: -5 }
            },
            {
                id: 'order_food',
                text: '→ 点个早餐',
                target: 'breakfast_order',
                effects: { money: -30, energy: +15 }
            },
            {
                id: 'check_news',
                text: '→ 查看新闻详情',
                target: 'news_detail',
                hiddenInfo: 'worldClue_1' // 世界观线索1
            }
        ]
    },

    // 场景003：准备出门
    'prepare_leave': {
        id: 'prepare_leave',
        location: '公寓',
        time: '周一 08:00',

        text: [
            '你换上外出的衣服，看了看这个狭小的房间。',
            '墙上贴着的便利贴写着一些日常提醒，字迹是你的，但内容却感觉陌生。',
            '"记得吃药"、"不要走夜路"、"保持冷静"...',
            '口袋里有钱包、钥匙，还有一个小药瓶，但没有标签。'
        ],

        choices: [
            {
                id: 'take_medicine',
                text: '→ 吃一粒药',
                target: 'medicine_effect',
                effects: { spirit: +20, energy: -10 },
                hiddenEffect: 'suppressWolfResonance' // 隐藏：抑制与Zero的共鸣
            },
            {
                id: 'check_notes',
                text: '→ 仔细查看便利贴',
                target: 'notes_detail',
                hiddenTrigger: 'memoryGap'
            },
            {
                id: 'leave_now',
                text: '→ 直接出门',
                target: 'street_scene'
            }
        ],

        roomLevel: 0  // 房间等级：0级（最基础）
    },

    // 场景004：街道场景
    'street_scene': {
        id: 'street_scene',
        location: '公寓楼下',
        time: '周一 08:15',
        weather: '阴天',

        text: [
            '你走出老旧的公寓楼，新京市的早晨带着一丝凉意。',
            '街道上人来人往，每个人都行色匆匆。',
            '你站在路边，一时不知道该往哪个方向走。',
            '远处的霓虹灯广告牌还在闪烁，这座不夜城从不真正休息。'
        ],

        choices: [
            {
                id: 'go_downtown',
                text: '→ 前往市中心',
                target: 'downtown_intro'
            },
            {
                id: 'nearby_shop',
                text: '→ 去便利店',
                target: 'convenience_store'
            },
            {
                id: 'wander',
                text: '→ 随便走走',
                target: 'random_encounter_1'
            }
        ],

        // 环境描述（为后续揭露真相做铺垫）
        environmentDetails: {
            hiddenCameras: true,  // 隐藏的监控
            normalAppearance: true,  // 表面正常
            subduedAtmosphere: '每个人都像在演戏'
        }
    }
};

// 记忆碎片场景（隐藏剧情）
const MemoryFragments = {
    'memory_fragment_1': {
        id: 'memory_fragment_1',
        isFragment: true,

        text: [
            '你用力回想，头突然一阵刺痛。',
            '一些破碎的画面在脑海中闪过——',
            '白色的房间...某人的声音...一种温暖的感觉...',
            '但就像抓不住的烟雾，这些画面瞬间消散。',
            '你扶着洗手台，等待头痛缓解。'
        ],

        effects: {
            spirit: -15,
            hiddenMark: 'painEcho_1'  // 痛苦残响标记
        },

        choices: [
            {
                id: 'rest',
                text: '→ 休息一下',
                target: 'morning_routine_continue'
            }
        ]
    }
};

// 房间升级数据
const RoomUpgrades = {
    level_0: {
        name: '破旧公寓',
        description: '只有床和基本家具',
        cost: 0,
        features: ['单人床', '简易衣柜']
    },
    level_1: {
        name: '标准公寓',
        description: '增加了书桌和椅子',
        cost: 2000,
        features: ['单人床', '衣柜', '书桌', '椅子']
    },
    level_2: {
        name: '舒适公寓',
        description: '更大的空间，更好的家具',
        cost: 5000,
        features: ['双人床', '衣柜', '书桌', '电脑', '小厨房']
    },
    level_3: {
        name: '豪华公寓',
        description: '宽敞明亮，设施齐全',
        cost: 10000,
        features: ['大床', '步入式衣柜', '工作区', '厨房', '客厅']
    }
};

// 导出场景数据
window.OpeningScenes = OpeningScenes;
window.MemoryFragments = MemoryFragments;
window.RoomUpgrades = RoomUpgrades;