/**
 * RandomEngine单元测试
 * Stage 5: 边缘情况和异常处理验证
 */

const RandomEngineUnitTest = {
    /**
     * 测试1：空数组/null处理
     */
    testNullHandling() {
        console.log('🧪 测试1：空数组/null处理');

        // 测试空数组
        const result1 = window.RandomEngine.weightedRandom([]);
        console.log(`  空数组: ${result1 === null ? '✅ 返回null' : '❌ 未正确处理'}`);

        // 测试null
        const result2 = window.RandomEngine.weightedRandom(null);
        console.log(`  null输入: ${result2 === null ? '✅ 返回null' : '❌ 未正确处理'}`);

        // 测试undefined
        const result3 = window.RandomEngine.weightedRandom(undefined);
        console.log(`  undefined输入: ${result3 === null ? '✅ 返回null' : '❌ 未正确处理'}`);
    },

    /**
     * 测试2：权重为0的情况
     */
    testZeroWeights() {
        console.log('\n🧪 测试2：权重为0的情况');

        // 测试所有权重为0
        const allZero = [
            { value: 'A', weight: 0 },
            { value: 'B', weight: 0 },
            { value: 'C', weight: 0 }
        ];
        const result1 = window.RandomEngine.weightedRandom(allZero);
        console.log(`  所有权重为0: ${result1 === 'A' ? '✅ 返回第一个' : `❌ 返回了${result1}`}`);

        // 测试部分权重为0
        const partialZero = [
            { value: 'A', weight: 0 },
            { value: 'B', weight: 0.5 },
            { value: 'C', weight: 0 },
            { value: 'D', weight: 0.5 }
        ];

        const results = {};
        for (let i = 0; i < 100; i++) {
            const result = window.RandomEngine.weightedRandom(partialZero);
            results[result] = (results[result] || 0) + 1;
        }

        const hasOnlyBD = !results['A'] && !results['C'] && results['B'] && results['D'];
        console.log(`  部分权重为0（100次）: ${hasOnlyBD ? '✅ 只选择B和D' : '❌ 选到了权重为0的选项'}`);
        console.log(`    结果: A:${results['A'] || 0} B:${results['B'] || 0} C:${results['C'] || 0} D:${results['D'] || 0}`);
    },

    /**
     * 测试3：极端权重差异
     */
    testExtremeWeights() {
        console.log('\n🧪 测试3：极端权重差异');

        // 一个权重极大，其他极小
        const extremeOptions = [
            { value: 'rare', weight: 0.001 },      // 0.1%
            { value: 'common', weight: 0.999 }      // 99.9%
        ];

        const results = {};
        for (let i = 0; i < 1000; i++) {
            const result = window.RandomEngine.weightedRandom(extremeOptions);
            results[result] = (results[result] || 0) + 1;
        }

        const rarePercent = ((results['rare'] || 0) / 1000 * 100).toFixed(1);
        const commonPercent = ((results['common'] || 0) / 1000 * 100).toFixed(1);

        console.log(`  rare (期望0.1%): ${rarePercent}%`);
        console.log(`  common (期望99.9%): ${commonPercent}%`);

        // 容差5%
        const isCorrect = Math.abs(parseFloat(commonPercent) - 99.9) < 5;
        console.log(`  ${isCorrect ? '✅ 极端权重正常工作' : '⚠️ 分布偏差较大'}`);
    },

    /**
     * 测试4：单个选项
     */
    testSingleOption() {
        console.log('\n🧪 测试4：单个选项');

        const singleOption = [
            { value: 'only', weight: 1.0 }
        ];

        let allCorrect = true;
        for (let i = 0; i < 10; i++) {
            const result = window.RandomEngine.weightedRandom(singleOption);
            if (result !== 'only') {
                allCorrect = false;
                break;
            }
        }

        console.log(`  单个选项（10次）: ${allCorrect ? '✅ 始终返回唯一选项' : '❌ 返回了错误值'}`);
    },

    /**
     * 测试5：权重总和不为1
     */
    testNonNormalizedWeights() {
        console.log('\n🧪 测试5：权重总和不为1');

        // 权重总和 > 1
        const overOne = [
            { value: 'A', weight: 2.0 },
            { value: 'B', weight: 3.0 }
        ];

        const results1 = {};
        for (let i = 0; i < 100; i++) {
            const result = window.RandomEngine.weightedRandom(overOne);
            results1[result] = (results1[result] || 0) + 1;
        }

        const ratioAB = results1['A'] / results1['B'];
        const expectedRatio = 2.0 / 3.0; // 约0.67
        console.log(`  权重2:3 实际比例: ${ratioAB.toFixed(2)} (期望0.67)`);
        console.log(`  ${Math.abs(ratioAB - expectedRatio) < 0.2 ? '✅ 非归一化权重正确处理' : '⚠️ 比例偏差较大'}`);

        // 权重总和 < 1
        const underOne = [
            { value: 'X', weight: 0.1 },
            { value: 'Y', weight: 0.2 }
        ];

        const results2 = {};
        for (let i = 0; i < 100; i++) {
            const result = window.RandomEngine.weightedRandom(underOne);
            results2[result] = (results2[result] || 0) + 1;
        }

        const ratioXY = results2['X'] / results2['Y'];
        const expectedRatioXY = 0.1 / 0.2; // 0.5
        console.log(`  权重0.1:0.2 实际比例: ${ratioXY.toFixed(2)} (期望0.50)`);
        console.log(`  ${Math.abs(ratioXY - expectedRatioXY) < 0.2 ? '✅ 小权重正确处理' : '⚠️ 比例偏差较大'}`);
    },

    /**
     * 测试6：天气系统集成边缘情况
     */
    testWeatherEdgeCases() {
        console.log('\n🧪 测试6：天气系统集成边缘情况');

        // 保存原状态
        const originalSeason = window.weatherSystem.currentSeason;

        // 测试：所有天气概率为0的季节（假设场景）
        window.weatherSystem.currentSeason = 'winter';

        // 临时修改冬季配置，让所有天气都是0（极端测试）
        const originalWinterProb = { ...window.weatherSystem.seasons.winter.weatherProbability };
        window.weatherSystem.seasons.winter.weatherProbability = {
            sunny: 0,
            cloudy: 0,
            rainy: 0,
            stormy: 0,
            foggy: 0,
            snowy: 0
        };

        try {
            window.weatherSystem.generateWeather();
            const weather = window.weatherSystem.currentWeather;
            console.log(`  全0概率季节: ${weather ? `✅ 生成了${weather}（降级处理）` : '❌ 未生成天气'}`);
        } catch (error) {
            console.log(`  全0概率季节: ❌ 抛出错误: ${error.message}`);
        }

        // 恢复配置
        window.weatherSystem.seasons.winter.weatherProbability = originalWinterProb;
        window.weatherSystem.currentSeason = originalSeason;

        // 测试：降水修正为负数（异常情况）
        const originalTurbulence = window.climateManager.currentState.turbulenceLevel;
        window.climateManager.currentState.turbulenceLevel = -1;

        const modifier = window.climateManager.getRainfallModifier('spring');
        console.log(`  负数动荡等级(-1): 修正=${modifier.toFixed(2)} ${modifier >= 0 ? '✅ 未产生负修正' : '❌ 产生了负修正'}`);

        // 恢复
        window.climateManager.currentState.turbulenceLevel = originalTurbulence;
    },

    /**
     * 测试7：randomInt边界值
     */
    testRandomIntBoundaries() {
        console.log('\n🧪 测试7：randomInt边界值');

        // 测试相同min和max
        const same = window.RandomEngine.randomInt(5, 5);
        console.log(`  min=max=5: ${same === 5 ? '✅ 返回5' : `❌ 返回了${same}`}`);

        // 测试min > max（错误输入）
        const reversed = window.RandomEngine.randomInt(10, 5);
        console.log(`  min(10) > max(5): 返回=${reversed} ${reversed >= 5 && reversed <= 10 ? '✅ 自动修正' : '⚠️ 未处理'}`);

        // 测试负数范围
        const results = [];
        for (let i = 0; i < 10; i++) {
            results.push(window.RandomEngine.randomInt(-10, -5));
        }
        const allInRange = results.every(n => n >= -10 && n <= -5);
        console.log(`  负数范围(-10, -5): ${allInRange ? '✅ 全部在范围内' : '❌ 超出范围'}`);
        console.log(`    示例: [${results.slice(0, 5).join(', ')}]`);

        // 测试大范围
        const large = window.RandomEngine.randomInt(0, 1000000);
        console.log(`  大范围(0, 1000000): ${large >= 0 && large <= 1000000 ? '✅ 在范围内' : '❌ 超出范围'} (值=${large})`);
    },

    /**
     * 测试8：性能测试
     */
    testPerformance() {
        console.log('\n🧪 测试8：性能测试');

        const options = [
            { value: 'A', weight: 0.25 },
            { value: 'B', weight: 0.25 },
            { value: 'C', weight: 0.25 },
            { value: 'D', weight: 0.25 }
        ];

        // 测试1万次调用的时间
        const iterations = 10000;
        const startTime = performance.now();

        for (let i = 0; i < iterations; i++) {
            window.RandomEngine.weightedRandom(options);
        }

        const endTime = performance.now();
        const totalTime = (endTime - startTime).toFixed(2);
        const avgTime = (totalTime / iterations).toFixed(4);

        console.log(`  ${iterations}次调用: 总耗时${totalTime}ms`);
        console.log(`  平均每次: ${avgTime}ms`);
        console.log(`  ${parseFloat(totalTime) < 100 ? '✅ 性能良好（<100ms）' : '⚠️ 性能较慢'}`);

        // 测试天气生成性能
        const startWeather = performance.now();
        for (let i = 0; i < 1000; i++) {
            window.weatherSystem.generateWeather();
        }
        const endWeather = performance.now();
        const weatherTime = (endWeather - startWeather).toFixed(2);

        console.log(`  1000次天气生成: ${weatherTime}ms`);
        console.log(`  ${parseFloat(weatherTime) < 200 ? '✅ 天气生成性能良好' : '⚠️ 天气生成较慢'}`);
    },

    /**
     * 运行所有单元测试
     */
    runAll() {
        console.log('🧪 ==========================================');
        console.log('🧪 RandomEngine单元测试套件 - Stage 5');
        console.log('🧪 ==========================================\n');

        this.testNullHandling();
        this.testZeroWeights();
        this.testExtremeWeights();
        this.testSingleOption();
        this.testNonNormalizedWeights();
        this.testWeatherEdgeCases();
        this.testRandomIntBoundaries();
        this.testPerformance();

        console.log('\n✅ 所有单元测试完成！');
        console.log('\n💡 使用方法:');
        console.log('  RandomEngineUnitTest.runAll()  - 运行所有单元测试');
        console.log('  RandomEngineUnitTest.testPerformance()  - 单独测试性能');
    }
};

// 导出到全局
window.RandomEngineUnitTest = RandomEngineUnitTest;

console.log('✅ RandomEngine单元测试工具已加载');
console.log('📝 使用 RandomEngineUnitTest.runAll() 开始测试');
