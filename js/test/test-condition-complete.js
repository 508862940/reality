/**
 * 条件系统完整测试
 * Stage 5: 综合测试所有条件功能
 */

// 综合测试场景数据
const CompleteTestScenes = {
    // 主测试场景
    main_test: {
        id: 'main_test',
        title: '🧪 条件系统综合测试',
        text: [
            '欢迎来到条件系统综合测试场景！',
            '',
            '这个场景展示了所有条件功能的实际应用。',
            '请尝试不同的预设组合，观察选项的变化。'
        ],
        choices: [
            // === 基础条件测试 ===
            {
                text: '💰 购买装备（需要100金钱）',
                target: 'shop',
                conditions: {
                    attribute: {
                        money: { min: 100 }
                    }
                },
                effects: { money: -100 }
            },

            // === 隐藏选项测试 ===
            {
                text: '🎁 VIP商店（金钱≥200才出现）',
                target: 'vip_shop',
                showConditions: {
                    attribute: {
                        money: { min: 200 }
                    }
                }
            },

            // === 复合条件测试 ===
            {
                text: '⚔️ 挑战BOSS（白天+体力≥60+有武器）',
                target: 'boss_fight',
                conditions: {
                    AND: [
                        {
                            time: {
                                hour: { min: 6, max: 18 }
                            }
                        },
                        {
                            attribute: {
                                energy: { min: 60 }
                            }
                        },
                        {
                            inventory: {
                                items: ['武器']
                            }
                        }
                    ]
                },
                effects: { energy: -30 }
            },

            // === OR条件测试 ===
            {
                text: '🚪 进入密室（钥匙 或 力量≥20）',
                target: 'secret_room',
                conditions: {
                    OR: [
                        {
                            inventory: {
                                items: ['钥匙']
                            }
                        },
                        {
                            attribute: {
                                strength: { min: 20 }
                            }
                        }
                    ]
                }
            },

            // === NOT条件测试 ===
            {
                text: '💤 休息（不在战斗中）',
                target: 'rest',
                conditions: {
                    NOT: [
                        {
                            flag: 'in_combat'
                        }
                    ]
                },
                effects: { energy: 20 }
            },

            // === 天气相关任务 ===
            {
                text: '🌸 赏樱花（春天+晴天）',
                target: 'sakura_viewing',
                showConditions: {
                    AND: [
                        {
                            season: 'spring'
                        },
                        {
                            weather: 'sunny'
                        }
                    ]
                }
            },

            {
                text: '⛄ 堆雪人（冬天+雪天）',
                target: 'build_snowman',
                showConditions: {
                    AND: [
                        {
                            season: 'winter'
                        },
                        {
                            weather: 'snowy'
                        }
                    ]
                }
            },

            // === 关系条件 ===
            {
                text: '💕 约会Zero（好感度≥60）',
                target: 'date_zero',
                conditions: {
                    relationship: {
                        zero_affection: { min: 60 }
                    }
                },
                effects: { mood: 20 }
            },

            // === 位置条件 ===
            {
                text: '🏠 回家（只在公园可用）',
                target: 'go_home',
                conditions: {
                    location: '公园'
                }
            },

            // === 极限测试：超复杂条件 ===
            {
                text: '🌟 隐藏结局（多重条件）',
                target: 'hidden_ending',
                showConditions: {
                    AND: [
                        {
                            attribute: {
                                money: { min: 500 },
                                energy: { min: 80 },
                                mood: { min: 80 }
                            }
                        },
                        {
                            relationship: {
                                zero_affection: { min: 80 }
                            }
                        },
                        {
                            OR: [
                                {
                                    inventory: {
                                        items: ['神秘道具']
                                    }
                                },
                                {
                                    flag: 'all_quests_complete'
                                }
                            ]
                        }
                    ]
                }
            },

            // === 测试工具 ===
            {
                text: '🔧 测试控制台',
                target: 'test_console'
            },

            {
                text: '📊 查看当前状态',
                action: () => {
                    CompleteTestHelper.showCurrentState();
                }
            }
        ]
    },

    // 商店场景
    shop: {
        id: 'shop',
        title: '🛍️ 装备商店',
        text: ['你购买了一把武器！'],
        onEnter: () => {
            // 添加武器到背包
            if (!window.worldState.state.player.inventory.items) {
                window.worldState.state.player.inventory.items = [];
            }
            window.worldState.state.player.inventory.items.push({
                name: '武器',
                count: 1
            });
            console.log('✅ 获得武器！');
        },
        choices: [
            { text: '返回', target: 'main_test' }
        ]
    },

    // VIP商店
    vip_shop: {
        id: 'vip_shop',
        title: '👑 VIP商店',
        text: ['欢迎来到VIP专属商店！这里有特殊道具。'],
        choices: [
            {
                text: '购买神秘道具（300金钱）',
                conditions: {
                    attribute: { money: { min: 300 } }
                },
                effects: { money: -300 },
                action: () => {
                    window.worldState.state.player.inventory.items.push({
                        name: '神秘道具',
                        count: 1
                    });
                    alert('获得神秘道具！');
                }
            },
            { text: '返回', target: 'main_test' }
        ]
    },

    // 测试控制台
    test_console: {
        id: 'test_console',
        title: '🔧 测试控制台',
        text: ['使用按钮快速设置不同的测试状态'],
        choices: [
            {
                text: '设为富豪（500金钱）',
                action: () => {
                    window.worldState.state.player.stats.money = 500;
                    CompleteTestHelper.reload();
                }
            },
            {
                text: '设为白天晴天',
                action: () => {
                    window.timeSystem.setTime({ hour: 12, minute: 0 });
                    window.weatherSystem.forceWeather('sunny', 2);
                    CompleteTestHelper.reload();
                }
            },
            {
                text: '设为冬天雪天',
                action: () => {
                    window.weatherSystem.currentSeason = 'winter';
                    window.weatherSystem.forceWeather('snowy', 2);
                    CompleteTestHelper.reload();
                }
            },
            {
                text: '提升Zero好感',
                action: () => {
                    if (!window.worldState.state.relationships) {
                        window.worldState.state.relationships = {};
                    }
                    if (!window.worldState.state.relationships.zero) {
                        window.worldState.state.relationships.zero = {};
                    }
                    window.worldState.state.relationships.zero.affection = 80;
                    CompleteTestHelper.reload();
                }
            },
            {
                text: '添加所有道具',
                action: () => {
                    const items = window.worldState.state.player.inventory.items || [];
                    items.push(
                        { name: '钥匙', count: 1 },
                        { name: '武器', count: 1 },
                        { name: '神秘道具', count: 1 }
                    );
                    window.worldState.state.player.inventory.items = items;
                    CompleteTestHelper.reload();
                }
            },
            { text: '返回主测试', target: 'main_test' }
        ]
    },

    // 其他场景
    boss_fight: {
        id: 'boss_fight',
        title: '⚔️ BOSS战',
        text: ['你勇敢地挑战了BOSS！'],
        choices: [{ text: '战斗结束', target: 'main_test' }]
    },

    secret_room: {
        id: 'secret_room',
        title: '🚪 密室',
        text: ['你进入了神秘的密室...'],
        choices: [{ text: '离开', target: 'main_test' }]
    },

    rest: {
        id: 'rest',
        title: '💤 休息',
        text: ['你好好休息了一下，恢复了体力。'],
        choices: [{ text: '继续', target: 'main_test' }]
    },

    sakura_viewing: {
        id: 'sakura_viewing',
        title: '🌸 樱花盛开',
        text: ['美丽的樱花在春日阳光下绽放...'],
        choices: [{ text: '返回', target: 'main_test' }]
    },

    build_snowman: {
        id: 'build_snowman',
        title: '⛄ 雪人',
        text: ['你在雪地里堆了一个可爱的雪人！'],
        choices: [{ text: '返回', target: 'main_test' }]
    },

    date_zero: {
        id: 'date_zero',
        title: '💕 约会',
        text: ['你和Zero度过了美好的时光...'],
        choices: [{ text: '返回', target: 'main_test' }]
    },

    go_home: {
        id: 'go_home',
        title: '🏠 回家',
        text: ['你回到了温暖的家。'],
        onEnter: () => {
            window.worldState.state.player.position = {
                location: '家'
            };
        },
        choices: [{ text: '继续', target: 'main_test' }]
    },

    hidden_ending: {
        id: 'hidden_ending',
        title: '🌟 隐藏结局',
        text: [
            '恭喜你达成了所有条件！',
            '这是一个特殊的隐藏结局...',
            '',
            '你的努力得到了回报！'
        ],
        choices: [{ text: '🎊 完成！', target: 'main_test' }]
    }
};

// 测试辅助工具
const CompleteTestHelper = {
    // 显示当前状态
    showCurrentState() {
        const state = window.worldState.state;
        const info = `
=== 当前游戏状态 ===
💰 金钱: ${state.player.stats.money}
⚡ 体力: ${state.player.stats.energy}
😊 心情: ${state.player.stats.mood}
💪 力量: ${state.player.attributes?.strength || 8}

⏰ 时间: ${window.timeSystem.formatTime()}
🌤️ 天气: ${window.weatherSystem.currentWeather}
🌱 季节: ${window.weatherSystem.currentSeason}
📍 位置: ${state.player.position?.location || '未知'}

🎒 背包:
${(state.player.inventory.items || []).map(item =>
    `  - ${item.name} x${item.count || 1}`
).join('\n') || '  （空）'}

❤️ Zero好感: ${state.relationships?.zero?.affection || 0}
        `;

        alert(info);
        console.log(info);
    },

    // 重新加载当前场景
    reload() {
        const currentScene = window.worldState.state.scene.current;
        window.sceneManager.loadScene(CompleteTestScenes[currentScene] || CompleteTestScenes.main_test);
    },

    // 运行综合测试
    runCompleteTest() {
        console.log('🚀 启动条件系统综合测试...');

        // 注册所有测试场景
        Object.values(CompleteTestScenes).forEach(scene => {
            window.gameScenes[scene.id] = scene;
        });

        // 设置初始状态
        window.worldState.state.player.stats.money = 150;
        window.worldState.state.player.stats.energy = 70;
        window.worldState.state.player.stats.mood = 60;

        // 加载主测试场景
        window.sceneManager.loadScene(CompleteTestScenes.main_test);

        console.log('✅ 综合测试准备完成！');
        console.log('💡 提示：');
        console.log('  - 点击"测试控制台"快速修改状态');
        console.log('  - 点击"查看当前状态"查看详细信息');
        console.log('  - 尝试不同的条件组合');
    }
};

// 导出到全局
window.CompleteTestScenes = CompleteTestScenes;
window.CompleteTestHelper = CompleteTestHelper;

console.log('✅ 条件系统综合测试已加载');
console.log('📝 使用方法: CompleteTestHelper.runCompleteTest()');