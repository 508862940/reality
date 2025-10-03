/**
 * ========================================
 * 条件引擎 & 概率引擎 测试套件
 * ========================================
 * 测试时间：2025-10-02
 * 测试目标：验证 ConditionEngine 和 RandomEngine 功能
 */

class EngineTestSuite {
    constructor() {
        this.testResults = [];
        this.passCount = 0;
        this.failCount = 0;
    }

    // ========================================
    // 测试框架
    // ========================================

    /**
     * 执行测试用例
     */
    test(name, fn) {
        try {
            fn();
            this.testResults.push({ name, status: 'PASS' });
            this.passCount++;
            console.log(`✅ ${name}`);
        } catch (error) {
            this.testResults.push({ name, status: 'FAIL', error: error.message });
            this.failCount++;
            console.error(`❌ ${name}`);
            console.error(`   错误: ${error.message}`);
        }
    }

    /**
     * 断言
     */
    assert(condition, message) {
        if (!condition) {
            throw new Error(message || '断言失败');
        }
    }

    assertEquals(actual, expected, message) {
        if (actual !== expected) {
            throw new Error(message || `预期 ${expected}，实际得到 ${actual}`);
        }
    }

    assertTrue(value, message) {
        this.assert(value === true, message || `预期 true，实际得到 ${value}`);
    }

    assertFalse(value, message) {
        this.assert(value === false, message || `预期 false，实际得到 ${value}`);
    }

    // ========================================
    // ConditionEngine 测试
    // ========================================

    testConditionEngine() {
        console.log('\n🔍 ===== ConditionEngine 测试开始 =====\n');

        // 1. 空条件测试
        this.test('空条件应该返回 true', () => {
            const result = ConditionEngine.check({});
            this.assertTrue(result);
        });

        this.test('null 条件应该返回 true', () => {
            const result = ConditionEngine.check(null);
            this.assertTrue(result);
        });

        // 2. 物品条件测试
        this.test('检查不存在的物品应返回 false', () => {
            const result = ConditionEngine.check({ item: '门禁卡' });
            this.assertFalse(result);
        });

        this.test('提供 context 时物品检查应该通过', () => {
            const context = {
                inventory: { '手机': 1, '钥匙': 1 }
            };
            const result = ConditionEngine.check({ item: '手机' }, context);
            this.assertTrue(result);
        });

        this.test('items 多物品检查', () => {
            const context = {
                inventory: { '手机': 1, '钥匙': 1 }
            };
            const result = ConditionEngine.check({
                items: ['手机', '钥匙']
            }, context);
            this.assertTrue(result);
        });

        this.test('items 多物品检查 - 缺少物品', () => {
            const context = {
                inventory: { '手机': 1 }
            };
            const result = ConditionEngine.check({
                items: ['手机', '钥匙']
            }, context);
            this.assertFalse(result);
        });

        // 3. 属性条件测试
        this.test('属性 min 检查 - 通过', () => {
            const context = {
                character: { intelligence: 80 }
            };
            const result = ConditionEngine.check({
                attribute: { intelligence: { min: 60 } }
            }, context);
            this.assertTrue(result);
        });

        this.test('属性 min 检查 - 失败', () => {
            const context = {
                character: { intelligence: 50 }
            };
            const result = ConditionEngine.check({
                attribute: { intelligence: { min: 60 } }
            }, context);
            this.assertFalse(result);
        });

        this.test('属性 max 检查', () => {
            const context = {
                character: { health: 30 }
            };
            const result = ConditionEngine.check({
                attribute: { health: { max: 50 } }
            }, context);
            this.assertTrue(result);
        });

        this.test('属性 range 检查', () => {
            const context = {
                character: { mood: 60 }
            };
            const result = ConditionEngine.check({
                attribute: { mood: { min: 50, max: 80 } }
            }, context);
            this.assertTrue(result);
        });

        // 4. 时间条件测试
        this.test('时间 hour 检查 - 白天', () => {
            const context = {
                gameTime: { hour: 14 }
            };
            const result = ConditionEngine.check({
                time: { hour: { min: 6, max: 18 } }
            }, context);
            this.assertTrue(result);
        });

        this.test('时间 hour 检查 - 夜晚（跨午夜）', () => {
            const context = {
                gameTime: { hour: 23 }
            };
            const result = ConditionEngine.check({
                time: { hour: { min: 22, max: 5 } }
            }, context);
            this.assertTrue(result);
        });

        this.test('时间 hour 检查 - 夜晚（跨午夜）凌晨部分', () => {
            const context = {
                gameTime: { hour: 2 }
            };
            const result = ConditionEngine.check({
                time: { hour: { min: 22, max: 5 } }
            }, context);
            this.assertTrue(result);
        });

        // 5. 位置条件测试
        this.test('位置检查 - 单个位置', () => {
            const context = {
                location: 'dormitory'
            };
            const result = ConditionEngine.check({
                location: 'dormitory'
            }, context);
            this.assertTrue(result);
        });

        this.test('位置检查 - 多个位置', () => {
            const context = {
                location: 'library'
            };
            const result = ConditionEngine.check({
                locations: ['library', 'classroom', 'lab']
            }, context);
            this.assertTrue(result);
        });

        // 6. 天气条件测试
        this.test('天气检查', () => {
            const context = {
                weather: 'rainy'
            };
            const result = ConditionEngine.check({
                weather: 'rainy'
            }, context);
            this.assertTrue(result);
        });

        // 7. 逻辑运算符测试
        this.test('AND 运算符 - 全部通过', () => {
            const context = {
                inventory: { '手机': 1 },
                character: { intelligence: 80 }
            };
            const result = ConditionEngine.check({
                AND: [
                    { item: '手机' },
                    { attribute: { intelligence: { min: 60 } } }
                ]
            }, context);
            this.assertTrue(result);
        });

        this.test('AND 运算符 - 部分失败', () => {
            const context = {
                inventory: { '手机': 1 },
                character: { intelligence: 40 }
            };
            const result = ConditionEngine.check({
                AND: [
                    { item: '手机' },
                    { attribute: { intelligence: { min: 60 } } }
                ]
            }, context);
            this.assertFalse(result);
        });

        this.test('OR 运算符 - 至少一个通过', () => {
            const context = {
                character: { intelligence: 40 }
            };
            const result = ConditionEngine.check({
                OR: [
                    { item: '门禁卡' },
                    { attribute: { intelligence: { min: 60 } } },
                    { location: 'dormitory' }
                ]
            }, context);
            this.assertFalse(result, '全部失败时应返回 false');
        });

        this.test('OR 运算符 - 有一个通过', () => {
            const context = {
                location: 'dormitory'
            };
            const result = ConditionEngine.check({
                OR: [
                    { item: '门禁卡' },
                    { location: 'dormitory' }
                ]
            }, context);
            this.assertTrue(result);
        });

        this.test('NOT 运算符', () => {
            const context = {
                inventory: {}
            };
            const result = ConditionEngine.check({
                NOT: [{ item: '门禁卡' }]
            }, context);
            this.assertTrue(result, '没有门禁卡时 NOT 应返回 true');
        });

        // 8. 嵌套逻辑测试
        this.test('复杂嵌套逻辑', () => {
            const context = {
                inventory: { '手机': 1 },
                character: { intelligence: 80, stealth: 50 },
                gameTime: { hour: 23 }
            };
            const result = ConditionEngine.check({
                AND: [
                    { item: '手机' },
                    {
                        OR: [
                            { attribute: { intelligence: { min: 60 } } },
                            { attribute: { stealth: { min: 80 } } }
                        ]
                    },
                    { time: { hour: { min: 22, max: 5 } } }
                ]
            }, context);
            this.assertTrue(result);
        });

        // 9. getFailReasons 测试
        this.test('getFailReasons - 单个失败原因', () => {
            const reasons = ConditionEngine.getFailReasons({ item: '门禁卡' });
            this.assert(reasons.length > 0, '应该返回失败原因');
            this.assert(reasons[0].includes('门禁卡'), '应该包含物品名称');
        });

        this.test('getFailReasons - 多个失败原因', () => {
            const context = {
                character: { intelligence: 50 }
            };
            const reasons = ConditionEngine.getFailReasons({
                item: '门禁卡',
                attribute: { intelligence: { min: 80 } }
            }, context);
            this.assert(reasons.length === 2, '应该有两个失败原因');
        });

        // 10. describe 测试
        this.test('describe - 生成描述', () => {
            const description = ConditionEngine.describe({
                item: '门禁卡',
                attribute: { intelligence: { min: 80 } },
                time: { hour: { min: 22, max: 5 } }
            });
            this.assert(description.length > 0, '应该生成描述');
            this.assert(description.includes('门禁卡'), '描述应包含物品');
            this.assert(description.includes('智力'), '描述应包含属性');
        });

        console.log('\n✅ ConditionEngine 测试完成\n');
    }

    // ========================================
    // RandomEngine 测试
    // ========================================

    testRandomEngine() {
        console.log('\n🎲 ===== RandomEngine 测试开始 =====\n');

        // 1. weightedRandom 测试
        this.test('weightedRandom - 基础功能', () => {
            const options = [
                { value: 'sunny', weight: 30 },
                { value: 'rainy', weight: 40 },
                { value: 'cloudy', weight: 30 }
            ];
            const result = RandomEngine.weightedRandom(options);
            this.assert(['sunny', 'rainy', 'cloudy'].includes(result),
                `结果应该是选项之一，实际: ${result}`);
        });

        this.test('weightedRandom - 权重分布测试', () => {
            const options = [
                { value: 'A', weight: 90 },
                { value: 'B', weight: 10 }
            ];
            const results = {};
            const iterations = 1000;

            for (let i = 0; i < iterations; i++) {
                const result = RandomEngine.weightedRandom(options);
                results[result] = (results[result] || 0) + 1;
            }

            // A 应该占约 90%，允许 ±15% 误差
            const aRatio = results.A / iterations;
            this.assert(aRatio > 0.75 && aRatio < 1.0,
                `A 的出现率应该在 75%-100% 之间，实际: ${(aRatio * 100).toFixed(1)}%`);
        });

        // 2. roll 测试
        this.test('roll - 100% 成功率', () => {
            for (let i = 0; i < 10; i++) {
                this.assertTrue(RandomEngine.roll(1.0));
            }
        });

        this.test('roll - 0% 成功率', () => {
            for (let i = 0; i < 10; i++) {
                this.assertFalse(RandomEngine.roll(0.0));
            }
        });

        this.test('roll - 50% 成功率分布', () => {
            let successCount = 0;
            const iterations = 1000;
            for (let i = 0; i < iterations; i++) {
                if (RandomEngine.roll(0.5)) successCount++;
            }
            const ratio = successCount / iterations;
            this.assert(ratio > 0.35 && ratio < 0.65,
                `50% 成功率应在 35%-65% 范围内，实际: ${(ratio * 100).toFixed(1)}%`);
        });

        // 3. rollCheck 测试
        this.test('rollCheck - 基础成功率', () => {
            const result = RandomEngine.rollCheck({ base: 0.8 });
            this.assert(result.hasOwnProperty('success'), '应该返回 success 字段');
            this.assert(result.hasOwnProperty('finalRate'), '应该返回 finalRate 字段');
            this.assert(result.hasOwnProperty('roll'), '应该返回 roll 字段');
            this.assertEquals(result.finalRate, 0.8, 'finalRate 应该等于 base');
        });

        this.test('rollCheck - 属性修正', () => {
            const context = {
                character: { intelligence: 80 }
            };
            const result = RandomEngine.rollCheck({
                base: 0.5,
                modifiers: [
                    { attribute: 'intelligence', weight: 0.01 }
                ]
            }, context);

            // 0.5 + 80 * 0.01 = 1.3，应钳制到 1.0
            this.assertEquals(result.finalRate, 1.0, '应该钳制到 1.0');
        });

        this.test('rollCheck - 物品加成', () => {
            const context = {
                inventory: { '幸运符': 1 }
            };
            const result = RandomEngine.rollCheck({
                base: 0.5,
                modifiers: [
                    { item: '幸运符', bonus: 0.2 }
                ]
            }, context);

            this.assertEquals(result.finalRate, 0.7, '0.5 + 0.2 = 0.7');
        });

        this.test('rollCheck - 综合修正', () => {
            const context = {
                character: { intelligence: 60 },
                inventory: { '幸运符': 1 },
                weather: 'rainy'
            };
            const result = RandomEngine.rollCheck({
                base: 0.5,
                modifiers: [
                    { attribute: 'intelligence', weight: 0.01 },  // +0.6
                    { item: '幸运符', bonus: 0.1 },               // +0.1
                    { weather: 'rainy', penalty: 0.15 }           // -0.15
                ]
            }, context);

            // 0.5 + 0.6 + 0.1 - 0.15 = 1.05 -> 钳制到 1.0
            this.assertEquals(result.finalRate, 1.0);
        });

        // 4. calculate 测试
        this.test('calculate - 无修正', () => {
            const rate = RandomEngine.calculate({ base: 0.6 });
            this.assertEquals(rate, 0.6);
        });

        this.test('calculate - 钳制到 0', () => {
            const rate = RandomEngine.calculate({
                base: 0.3,
                modifiers: [
                    { weather: 'stormy', penalty: 0.5 }
                ]
            });
            this.assertEquals(rate, 0, '负数应该钳制到 0');
        });

        // 5. 工具函数测试
        this.test('randomInt - 范围测试', () => {
            for (let i = 0; i < 100; i++) {
                const result = RandomEngine.randomInt(1, 10);
                this.assert(result >= 1 && result <= 10,
                    `结果应在 1-10 之间，实际: ${result}`);
            }
        });

        this.test('randomFloat - 范围测试', () => {
            for (let i = 0; i < 100; i++) {
                const result = RandomEngine.randomFloat(0.5, 1.5);
                this.assert(result >= 0.5 && result <= 1.5,
                    `结果应在 0.5-1.5 之间，实际: ${result}`);
            }
        });

        this.test('randomChoice - 数组选择', () => {
            const array = ['A', 'B', 'C', 'D'];
            for (let i = 0; i < 50; i++) {
                const result = RandomEngine.randomChoice(array);
                this.assert(array.includes(result),
                    `结果应该在数组中，实际: ${result}`);
            }
        });

        this.test('shuffle - 数组打乱', () => {
            const original = [1, 2, 3, 4, 5];
            const shuffled = RandomEngine.shuffle([...original]);

            this.assertEquals(shuffled.length, original.length, '长度应该相同');
            this.assert(original.every(item => shuffled.includes(item)),
                '所有元素应该保留');
        });

        this.test('rollDice - 基础骰子', () => {
            for (let i = 0; i < 50; i++) {
                const result = RandomEngine.rollDice(6);
                this.assert(result >= 1 && result <= 6,
                    `D6 结果应在 1-6 之间，实际: ${result}`);
            }
        });

        this.test('rollDice - 多颗骰子', () => {
            const result = RandomEngine.rollDice(6, 3);
            this.assert(result >= 3 && result <= 18,
                `3D6 结果应在 3-18 之间，实际: ${result}`);
        });

        this.test('rollD20 - D20 骰子', () => {
            for (let i = 0; i < 50; i++) {
                const result = RandomEngine.rollD20();
                this.assert(result >= 1 && result <= 20,
                    `D20 结果应在 1-20 之间，实际: ${result}`);
            }
        });

        console.log('\n✅ RandomEngine 测试完成\n');
    }

    // ========================================
    // 集成测试
    // ========================================

    testIntegration() {
        console.log('\n🔗 ===== 集成测试开始 =====\n');

        this.test('场景选项条件检查 + 技能检定', () => {
            // 模拟场景：深夜入侵实验室
            const playerContext = {
                inventory: { '门禁卡': 1, '手机': 1 },
                character: {
                    intelligence: 70,
                    stealth: 60
                },
                gameTime: { hour: 23 },
                location: 'lab_entrance',
                weather: 'foggy'
            };

            // 检查选项条件
            const infiltrateConditions = {
                AND: [
                    { item: '门禁卡' },
                    {
                        OR: [
                            { attribute: { intelligence: { min: 80 } } },
                            { attribute: { stealth: { min: 50 } } }
                        ]
                    },
                    { time: { hour: { min: 22, max: 5 } } }
                ]
            };

            const canInfiltrate = ConditionEngine.check(infiltrateConditions, playerContext);
            this.assertTrue(canInfiltrate, '应该满足潜入条件');

            // 执行技能检定
            const stealthCheck = RandomEngine.rollCheck({
                base: 0.4,
                modifiers: [
                    { attribute: 'stealth', weight: 0.01 },      // +0.6
                    { weather: 'foggy', bonus: 0.15 },           // +0.15（雾天利于潜行）
                    { time: { hour: { min: 22, max: 5 } }, bonus: 0.1 } // +0.1（夜间）
                ]
            }, playerContext);

            // 最终成功率：0.4 + 0.6 + 0.15 + 0.1 = 1.25 -> 1.0
            this.assertEquals(stealthCheck.finalRate, 1.0, '最终成功率应为 100%');

            console.log('   场景模拟成功！');
            console.log(`   - 条件检查: ${canInfiltrate ? '✅ 通过' : '❌ 失败'}`);
            console.log(`   - 技能检定: ${stealthCheck.success ? '✅ 成功' : '❌ 失败'}`);
            console.log(`   - 最终成功率: ${(stealthCheck.finalRate * 100).toFixed(0)}%`);
            console.log(`   - 骰子点数: ${stealthCheck.roll.toFixed(3)}`);
        });

        this.test('天气生成系统模拟', () => {
            // 模拟春季天气权重
            const springWeatherWeights = [
                { value: 'sunny', weight: 40 },
                { value: 'cloudy', weight: 30 },
                { value: 'rainy', weight: 25 },
                { value: 'foggy', weight: 5 }
            ];

            // 生成3天天气预报
            const forecast = [];
            for (let day = 1; day <= 3; day++) {
                const weather = RandomEngine.weightedRandom(springWeatherWeights);
                const temperature = RandomEngine.randomInt(15, 25);
                forecast.push({ day, weather, temperature });
            }

            this.assert(forecast.length === 3, '应该生成3天预报');
            console.log('   天气预报生成成功！');
            forecast.forEach(f => {
                console.log(`   - 第${f.day}天: ${f.weather}, ${f.temperature}°C`);
            });
        });

        console.log('\n✅ 集成测试完成\n');
    }

    // ========================================
    // 运行所有测试
    // ========================================

    runAll() {
        console.log('\n');
        console.log('========================================');
        console.log('🧪 引擎测试套件启动');
        console.log('========================================');
        console.log(`测试时间: ${new Date().toLocaleString('zh-CN')}`);
        console.log('----------------------------------------\n');

        this.testConditionEngine();
        this.testRandomEngine();
        this.testIntegration();

        console.log('========================================');
        console.log('📊 测试总结');
        console.log('========================================');
        console.log(`✅ 通过: ${this.passCount} 项`);
        console.log(`❌ 失败: ${this.failCount} 项`);
        console.log(`📈 通过率: ${((this.passCount / (this.passCount + this.failCount)) * 100).toFixed(1)}%`);
        console.log('========================================\n');

        if (this.failCount > 0) {
            console.log('⚠️ 失败的测试用例:');
            this.testResults
                .filter(r => r.status === 'FAIL')
                .forEach(r => {
                    console.log(`   ❌ ${r.name}`);
                    console.log(`      ${r.error}`);
                });
        }

        return this.failCount === 0;
    }
}

// ========================================
// 导出测试套件
// ========================================

// 浏览器环境
if (typeof window !== 'undefined') {
    window.EngineTestSuite = EngineTestSuite;
    window.runEngineTests = function() {
        const suite = new EngineTestSuite();
        return suite.runAll();
    };
}

// Node.js 环境
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EngineTestSuite;
}
