/**
 * 条件系统测试场景
 * Stage 4: Scene Condition Integration 验证
 *
 * 测试目标：
 * 1. 条件检查是否正确工作
 * 2. 选项是否正确灰化
 * 3. 提示信息是否正确显示
 * 4. 点击禁用选项是否被阻止
 */

// 测试场景数据
const testConditionScene = {
    id: 'test_condition_scene',
    title: '🧪 条件系统测试',
    text: [
        '这是一个测试场景，用于验证Stage 4的条件系统集成。',
        '',
        '📊 共有14个选项（12个常规 + 2个隐藏）：',
        '- 灰色🔒 = 条件不满足，不能选择',
        '- 隐藏选项 = 满足特定条件才会出现',
        '',
        '⬇️ 请向下滚动查看所有选项（包括隐藏的）'
    ],
    choices: [
        {
            text: '✅ 无条件选项（应该可点击）',
            target: 'success_no_condition',
            // 没有conditions，应该始终可选
        },
        {
            text: '💰 需要50金钱（检查经济状态）',
            target: 'success_money',
            conditions: {
                // money 作为 attribute 处理
                attribute: {
                    money: { min: 50 }
                }
            }
        },
        {
            text: '🎒 需要特定物品（钥匙×1）',
            target: 'success_item',
            conditions: {
                // items 应该是字符串数组
                items: ['钥匙']
            }
        },
        {
            text: '⏰ 只在白天可选（6:00-18:00）',
            target: 'success_time',
            conditions: {
                time: {
                    hour: { min: 6, max: 18 }
                }
            }
        },
        {
            text: '🌧️ 只在雨天可选',
            target: 'success_weather',
            conditions: {
                weather: ['rainy', 'stormy']
            }
        },
        {
            text: '❄️ 只在冬天可选',
            target: 'success_season',
            conditions: {
                // season 作为 attribute 处理
                attribute: {
                    season: { equal: 'winter' }
                }
            }
        },
        {
            text: '💪 需要力量≥10',
            target: 'success_attribute',
            conditions: {
                attributes: {
                    strength: { min: 10 }
                }
            }
        },
        {
            text: '❤️ 需要与Zero好感度≥50',
            target: 'success_relationship',
            conditions: {
                // relationships 作为 attribute 处理
                attribute: {
                    'zero_affection': { min: 50 }
                }
            }
        },
        {
            text: '🔐 复合条件（金钱≥30 且 体力≥50）',
            target: 'success_complex',
            conditions: {
                // 使用 attributes 合并所有属性检查
                attributes: {
                    money: { min: 30 },
                    energy: { min: 50 }
                }
            }
        },
        {
            text: '⚔️ OR条件（力量≥15 或 敏捷≥15）',
            target: 'success_or',
            conditions: {
                OR: [
                    {
                        attribute: {
                            strength: { min: 15 }
                        }
                    },
                    {
                        attribute: {
                            agility: { min: 15 }
                        }
                    }
                ]
            }
        },
        {
            text: '🚫 NOT条件（不在战斗中）',
            target: 'success_not',
            conditions: {
                NOT: [
                    {
                        flags: ['in_combat']
                    }
                ]
            }
        },
        {
            text: '📍 位置条件（在公园）',
            target: 'success_location',
            conditions: {
                location: '公园'
            }
        },
        {
            text: '🎁 隐藏选项（只有金钱≥100才显示）',
            target: 'success_hidden',
            // showConditions 控制是否显示
            showConditions: {
                attribute: {
                    money: { min: 100 }
                }
            }
        },
        {
            text: '🌟 特殊选项（白天+晴天才显示）',
            target: 'success_special',
            // showConditions 控制是否显示
            showConditions: {
                AND: [
                    {
                        time: {
                            hour: { min: 6, max: 18 }
                        }
                    },
                    {
                        weather: 'sunny'
                    }
                ]
            }
        }
    ]
};

// 成功场景
const successScenes = {
    success_no_condition: {
        id: 'success_no_condition',
        title: '✅ 成功',
        text: ['你选择了无条件选项。这个选项永远可选。'],
        choices: [{ text: '返回测试', target: 'test_condition_scene' }]
    },
    success_money: {
        id: 'success_money',
        title: '💰 成功',
        text: ['你有足够的金钱，选项成功执行。'],
        choices: [{ text: '返回测试', target: 'test_condition_scene' }]
    },
    success_item: {
        id: 'success_item',
        title: '🎒 成功',
        text: ['你有所需的物品，选项成功执行。'],
        choices: [{ text: '返回测试', target: 'test_condition_scene' }]
    },
    success_time: {
        id: 'success_time',
        title: '⏰ 成功',
        text: ['时间条件满足，选项成功执行。'],
        choices: [{ text: '返回测试', target: 'test_condition_scene' }]
    },
    success_weather: {
        id: 'success_weather',
        title: '🌧️ 成功',
        text: ['天气条件满足，选项成功执行。'],
        choices: [{ text: '返回测试', target: 'test_condition_scene' }]
    },
    success_season: {
        id: 'success_season',
        title: '❄️ 成功',
        text: ['季节条件满足，选项成功执行。'],
        choices: [{ text: '返回测试', target: 'test_condition_scene' }]
    },
    success_attribute: {
        id: 'success_attribute',
        title: '💪 成功',
        text: ['属性条件满足，选项成功执行。'],
        choices: [{ text: '返回测试', target: 'test_condition_scene' }]
    },
    success_relationship: {
        id: 'success_relationship',
        title: '❤️ 成功',
        text: ['关系条件满足，选项成功执行。'],
        choices: [{ text: '返回测试', target: 'test_condition_scene' }]
    },
    success_complex: {
        id: 'success_complex',
        title: '🔐 成功',
        text: ['复合条件满足，选项成功执行。'],
        choices: [{ text: '返回测试', target: 'test_condition_scene' }]
    },
    success_or: {
        id: 'success_or',
        title: '⚔️ 成功',
        text: ['OR条件满足，选项成功执行。'],
        choices: [{ text: '返回测试', target: 'test_condition_scene' }]
    },
    success_not: {
        id: 'success_not',
        title: '🚫 成功',
        text: ['NOT条件满足，选项成功执行。'],
        choices: [{ text: '返回测试', target: 'test_condition_scene' }]
    },
    success_location: {
        id: 'success_location',
        title: '📍 成功',
        text: ['位置条件满足，选项成功执行。'],
        choices: [{ text: '返回测试', target: 'test_condition_scene' }]
    },
    success_hidden: {
        id: 'success_hidden',
        title: '🎁 成功',
        text: ['恭喜！你发现了隐藏选项！这个选项只有金钱≥100时才会显示。'],
        choices: [{ text: '返回测试', target: 'test_condition_scene' }]
    },
    success_special: {
        id: 'success_special',
        title: '🌟 成功',
        text: ['特殊选项成功！这个选项只在白天的晴天才会出现。'],
        choices: [{ text: '返回测试', target: 'test_condition_scene' }]
    }
};

// 测试辅助函数
class TestConditionHelper {
    /**
     * 设置测试环境
     */
    static setupTestEnvironment() {
        console.log('🧪 设置条件测试环境...');

        // 确保必要的系统已初始化
        if (!window.worldState) {
            console.error('❌ worldState未初始化');
            return false;
        }

        if (!window.ConditionEngine) {
            console.error('❌ ConditionEngine未加载');
            return false;
        }

        if (!window.sceneManager) {
            console.error('❌ SceneManager未初始化');
            return false;
        }

        // 注册测试场景
        this.registerTestScenes();

        console.log('✅ 测试环境准备完成');
        return true;
    }

    /**
     * 注册测试场景到系统
     */
    static registerTestScenes() {
        // 添加主测试场景
        if (!window.gameScenes) {
            window.gameScenes = {};
        }

        window.gameScenes['test_condition_scene'] = testConditionScene;

        // 添加所有成功场景
        for (const [id, scene] of Object.entries(successScenes)) {
            window.gameScenes[id] = scene;
        }

        console.log('📝 已注册测试场景:', Object.keys(successScenes).length + 1);
    }

    /**
     * 修改游戏状态来测试不同条件
     */
    static setTestState(preset) {
        const state = window.worldState.state;

        switch(preset) {
            case 'rich':
                if (!state.player) state.player = {};
                if (!state.player.stats) state.player.stats = {};
                state.player.stats.money = 100;
                console.log('💰 设置金钱: 100');
                break;

            case 'poor':
                if (!state.player) state.player = {};
                if (!state.player.stats) state.player.stats = {};
                state.player.stats.money = 10;
                console.log('💸 设置金钱: 10');
                break;

            case 'has_key':
                if (!state.player) state.player = {};
                if (!state.player.inventory) state.player.inventory = {};
                if (!state.player.inventory.items) state.player.inventory.items = [];

                // 检查是否已有钥匙，避免重复添加
                const hasKey = state.player.inventory.items.some(item =>
                    (typeof item === 'string' && item === '钥匙') ||
                    (item.name === '钥匙')
                );

                if (!hasKey) {
                    state.player.inventory.items.push({ name: '钥匙', count: 1 });
                    console.log('🔑 添加物品: 钥匙×1');
                } else {
                    console.log('🔑 已拥有钥匙');
                }
                break;

            case 'daytime':
                if (window.timeSystem) {
                    // setTime 需要对象参数
                    window.timeSystem.setTime({ hour: 12, minute: 0 });
                    // 同步到 worldState
                    if (state.time) {
                        state.time.hour = 12;
                        state.time.minute = 0;
                    }
                    console.log('☀️ 设置时间: 12:00');
                }
                break;

            case 'nighttime':
                if (window.timeSystem) {
                    // setTime 需要对象参数
                    window.timeSystem.setTime({ hour: 22, minute: 0 });
                    // 同步到 worldState
                    if (state.time) {
                        state.time.hour = 22;
                        state.time.minute = 0;
                    }
                    console.log('🌙 设置时间: 22:00');
                }
                break;

            case 'rainy':
                if (window.weatherSystem) {
                    window.weatherSystem.forceWeather('rainy', 2);
                }
                // 直接设置到 worldState
                if (!state.environment) state.environment = {};
                state.environment.weather = 'rainy';
                console.log('🌧️ 设置天气: 雨天');
                break;

            case 'sunny':
                if (window.weatherSystem) {
                    window.weatherSystem.forceWeather('sunny', 2);
                }
                // 直接设置到 worldState
                if (!state.environment) state.environment = {};
                state.environment.weather = 'sunny';
                console.log('☀️ 设置天气: 晴天');
                break;

            case 'winter':
                state.environment.season = 'winter';
                console.log('❄️ 设置季节: 冬天');
                break;

            case 'summer':
                state.environment.season = 'summer';
                console.log('☀️ 设置季节: 夏天');
                break;

            case 'strong':
                if (!state.player) state.player = {};
                if (!state.player.attributes) state.player.attributes = {};
                state.player.attributes.strength = 15;
                console.log('💪 设置力量: 15');
                break;

            case 'weak':
                if (!state.player) state.player = {};
                if (!state.player.attributes) state.player.attributes = {};
                state.player.attributes.strength = 5;
                console.log('💤 设置力量: 5');
                break;

            case 'high_energy':
                if (!state.player) state.player = {};
                if (!state.player.stats) state.player.stats = {};
                state.player.stats.energy = 80;
                console.log('⚡ 设置体力: 80');
                break;

            case 'low_energy':
                if (!state.player) state.player = {};
                if (!state.player.stats) state.player.stats = {};
                state.player.stats.energy = 20;
                console.log('😴 设置体力: 20');
                break;

            case 'park':
                if (!state.player) state.player = {};
                if (!state.player.position) state.player.position = {};
                state.player.position.location = '公园';
                console.log('📍 设置位置: 公园');
                break;

            case 'home':
                if (!state.player) state.player = {};
                if (!state.player.position) state.player.position = {};
                state.player.position.location = '家';
                console.log('🏠 设置位置: 家');
                break;

            case 'zero_friend':
                if (!state.relationships) state.relationships = {};
                state.relationships.zero = { affection: 60 };
                console.log('❤️ 设置Zero好感: 60');
                break;

            case 'zero_stranger':
                if (!state.relationships) state.relationships = {};
                state.relationships.zero = { affection: 10 };
                console.log('💔 设置Zero好感: 10');
                break;

            case 'reset':
                // 重置到基本状态
                if (!state.player) state.player = {};
                if (!state.player.stats) state.player.stats = {};
                state.player.stats.money = 30;
                state.player.stats.energy = 50;
                state.environment.season = 'spring';

                // 清除钥匙
                if (state.player.inventory && state.player.inventory.items) {
                    state.player.inventory.items = state.player.inventory.items.filter(
                        item => item.name !== '钥匙'
                    );
                }

                // 重置属性
                if (!state.player.attributes) state.player.attributes = {};
                state.player.attributes.strength = 8;

                // 重置关系
                if (!state.relationships) state.relationships = {};
                state.relationships.zero = { affection: 25 };

                console.log('🔄 重置到默认状态');
                break;
        }

        // 触发UI更新
        if (window.reactiveSystem) {
            window.reactiveSystem.notify('test.stateChanged', state);
        }
    }

    /**
     * 运行条件测试场景
     */
    static runTest() {
        if (!this.setupTestEnvironment()) {
            console.error('❌ 测试环境设置失败');
            return;
        }

        console.log('🚀 启动条件测试场景...');

        // 切换到测试场景
        if (window.sceneManager) {
            // loadScene 需要场景数据对象，不是ID
            const sceneData = window.gameScenes['test_condition_scene'];
            if (sceneData) {
                window.sceneManager.loadScene(sceneData);
            } else {
                console.error('❌ 测试场景未找到');
            }
        }

        console.log('📋 可用的测试预设:');
        console.log('  TestConditionHelper.setTestState("rich")     - 设置金钱100');
        console.log('  TestConditionHelper.setTestState("poor")     - 设置金钱10');
        console.log('  TestConditionHelper.setTestState("has_key")  - 添加钥匙');
        console.log('  TestConditionHelper.setTestState("daytime")  - 设置白天');
        console.log('  TestConditionHelper.setTestState("nighttime")- 设置夜晚');
        console.log('  TestConditionHelper.setTestState("rainy")    - 设置雨天');
        console.log('  TestConditionHelper.setTestState("winter")   - 设置冬天');
        console.log('  TestConditionHelper.setTestState("strong")   - 设置力量15');
        console.log('  TestConditionHelper.setTestState("park")     - 移动到公园');
        console.log('  TestConditionHelper.setTestState("zero_friend") - Zero好感60');
        console.log('  TestConditionHelper.setTestState("reset")    - 重置状态');
    }

    /**
     * 检查当前哪些选项可用
     */
    static checkAvailableOptions() {
        const choices = document.querySelectorAll('.story-choice');
        const available = [];
        const disabled = [];

        choices.forEach((choice, index) => {
            const text = choice.textContent.trim();
            if (choice.classList.contains('disabled')) {
                disabled.push({ index, text, reason: choice.dataset.failReasons });
            } else {
                available.push({ index, text });
            }
        });

        console.log('✅ 可用选项:', available.length);
        available.forEach(opt => console.log(`  [${opt.index}] ${opt.text}`));

        console.log('❌ 禁用选项:', disabled.length);
        disabled.forEach(opt => console.log(`  [${opt.index}] ${opt.text} - ${opt.reason}`));
    }
}

// 导出到全局
window.TestConditionHelper = TestConditionHelper;

console.log('✅ 条件测试场景已加载');
console.log('📝 使用方法: TestConditionHelper.runTest()');