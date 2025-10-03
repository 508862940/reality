/**
 * 条件系统测试场景
 * Stage 4: 验证ConditionEngine与场景系统的集成
 */

const testConditionScenes = {
    // 测试起始场景
    test_start: {
        id: 'test_start',
        location: '测试实验室',
        text: [
            '欢迎来到条件系统测试场景！',
            '这里将测试各种条件类型：物品、属性、时间、天气、位置等。',
            '当前状态：',
            '💰 金钱：{money}',
            '🧠 智力：{intelligence}（假设为60）',
            '🕐 时间：{time}',
            '☀️ 天气：{weather}'
        ],
        choices: [
            {
                text: '1. 测试物品条件',
                target: 'test_item',
                conditions: null  // 无条件，总是可选
            },
            {
                text: '2. 测试属性条件',
                target: 'test_attribute',
                conditions: null
            },
            {
                text: '3. 测试时间条件',
                target: 'test_time',
                conditions: null
            },
            {
                text: '4. 测试天气条件',
                target: 'test_weather',
                conditions: null
            },
            {
                text: '5. 测试复合条件',
                target: 'test_complex',
                conditions: null
            }
        ]
    },

    // 测试1：物品条件
    test_item: {
        id: 'test_item',
        location: '物品测试区',
        text: [
            '🎒 物品条件测试',
            '下面的选项需要特定物品才能选择：'
        ],
        choices: [
            {
                text: '使用门禁卡开门',
                target: 'item_success',
                conditions: {
                    item: '门禁卡'
                }
            },
            {
                text: '使用手机打电话',
                target: 'item_success',
                conditions: {
                    item: '手机'
                }
            },
            {
                text: '使用多个工具（需要手机和钥匙）',
                target: 'item_success',
                conditions: {
                    items: ['手机', '钥匙']
                }
            },
            {
                text: '返回主菜单',
                target: 'test_start'
            }
        ]
    },

    // 测试2：属性条件
    test_attribute: {
        id: 'test_attribute',
        location: '属性测试区',
        text: [
            '📊 属性条件测试',
            '下面的选项需要特定属性值：'
        ],
        choices: [
            {
                text: '简单谜题（智力≥40）',
                target: 'attribute_success',
                conditions: {
                    attribute: {
                        intelligence: { min: 40 }
                    }
                }
            },
            {
                text: '困难谜题（智力≥80）',
                target: 'attribute_success',
                conditions: {
                    attribute: {
                        intelligence: { min: 80 }
                    }
                }
            },
            {
                text: '体力活动（体力≥60）',
                target: 'attribute_success',
                conditions: {
                    attribute: {
                        health: { min: 60 }
                    }
                }
            },
            {
                text: '社交活动（心情50-80之间）',
                target: 'attribute_success',
                conditions: {
                    attribute: {
                        mood: { min: 50, max: 80 }
                    }
                }
            },
            {
                text: '返回主菜单',
                target: 'test_start'
            }
        ]
    },

    // 测试3：时间条件
    test_time: {
        id: 'test_time',
        location: '时间测试区',
        text: [
            '⏰ 时间条件测试',
            '某些活动只在特定时间可用：'
        ],
        choices: [
            {
                text: '早餐（6:00-10:00）',
                target: 'time_success',
                conditions: {
                    time: {
                        hour: { min: 6, max: 10 }
                    }
                }
            },
            {
                text: '午餐（11:00-14:00）',
                target: 'time_success',
                conditions: {
                    time: {
                        hour: { min: 11, max: 14 }
                    }
                }
            },
            {
                text: '晚餐（17:00-20:00）',
                target: 'time_success',
                conditions: {
                    time: {
                        hour: { min: 17, max: 20 }
                    }
                }
            },
            {
                text: '深夜活动（22:00-5:00跨午夜）',
                target: 'time_success',
                conditions: {
                    time: {
                        hour: { min: 22, max: 5 }
                    }
                }
            },
            {
                text: '返回主菜单',
                target: 'test_start'
            }
        ]
    },

    // 测试4：天气条件
    test_weather: {
        id: 'test_weather',
        location: '天气测试区',
        text: [
            '🌤️ 天气条件测试',
            '某些活动受天气影响：'
        ],
        choices: [
            {
                text: '户外野餐（晴天）',
                target: 'weather_success',
                conditions: {
                    weather: 'sunny'
                }
            },
            {
                text: '雨中漫步（雨天）',
                target: 'weather_success',
                conditions: {
                    weather: 'rainy'
                }
            },
            {
                text: '打雪仗（雪天）',
                target: 'weather_success',
                conditions: {
                    weather: 'snowy'
                }
            },
            {
                text: '返回主菜单',
                target: 'test_start'
            }
        ]
    },

    // 测试5：复合条件
    test_complex: {
        id: 'test_complex',
        location: '复合条件测试区',
        text: [
            '🔗 复合条件测试',
            '需要满足多个条件的选项：'
        ],
        choices: [
            {
                text: '深夜潜入（需要：夜晚 + 门禁卡）',
                target: 'complex_success',
                conditions: {
                    AND: [
                        { item: '门禁卡' },
                        { time: { hour: { min: 22, max: 5 } } }
                    ]
                }
            },
            {
                text: '雨天读书（雨天 或 室内位置）',
                target: 'complex_success',
                conditions: {
                    OR: [
                        { weather: 'rainy' },
                        { location: 'library' }
                    ]
                }
            },
            {
                text: '特殊任务（智力≥60 且 有手机 且 不是雾天）',
                target: 'complex_success',
                conditions: {
                    AND: [
                        { attribute: { intelligence: { min: 60 } } },
                        { item: '手机' },
                        { NOT: [{ weather: 'foggy' }] }
                    ]
                }
            },
            {
                text: '返回主菜单',
                target: 'test_start'
            }
        ]
    },

    // 成功场景
    item_success: {
        id: 'item_success',
        text: ['✅ 物品条件满足！你成功使用了物品。'],
        choices: [{ text: '返回测试', target: 'test_item' }]
    },

    attribute_success: {
        id: 'attribute_success',
        text: ['✅ 属性条件满足！你的能力足够完成任务。'],
        choices: [{ text: '返回测试', target: 'test_attribute' }]
    },

    time_success: {
        id: 'time_success',
        text: ['✅ 时间条件满足！正是合适的时间。'],
        choices: [{ text: '返回测试', target: 'test_time' }]
    },

    weather_success: {
        id: 'weather_success',
        text: ['✅ 天气条件满足！天气正好适合这个活动。'],
        choices: [{ text: '返回测试', target: 'test_weather' }]
    },

    complex_success: {
        id: 'complex_success',
        text: ['✅ 复合条件满足！所有条件都符合要求。'],
        choices: [{ text: '返回测试', target: 'test_complex' }]
    }
};

// 导出到全局
window.testConditionScenes = testConditionScenes;

console.log('✅ 条件测试场景已加载');