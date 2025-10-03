/**
 * 天气系统RandomEngine集成测试
 * Stage 4: 验证天气生成使用RandomEngine
 */

const WeatherRandomTest = {
    /**
     * 测试天气生成分布
     */
    testWeatherDistribution() {
        console.log('🎲 测试：天气生成分布（100次）');

        if (!window.weatherSystem || !window.RandomEngine) {
            console.error('❌ weatherSystem或RandomEngine未加载');
            return;
        }

        const results = {};
        const testCount = 100;

        // 保存当前天气
        const originalWeather = window.weatherSystem.currentWeather;
        const originalSeason = window.weatherSystem.currentSeason;

        // 测试春季天气分布
        window.weatherSystem.currentSeason = 'spring';

        for (let i = 0; i < testCount; i++) {
            window.weatherSystem.generateWeather();
            const weather = window.weatherSystem.currentWeather;
            results[weather] = (results[weather] || 0) + 1;
        }

        console.log('📊 春季天气分布:');
        for (const [weather, count] of Object.entries(results)) {
            const percentage = (count / testCount * 100).toFixed(1);
            const weatherInfo = window.weatherSystem.weatherTypes[weather];
            console.log(`  ${weatherInfo.icon} ${weatherInfo.name}: ${count}次 (${percentage}%)`);
        }

        // 恢复原状
        window.weatherSystem.currentWeather = originalWeather;
        window.weatherSystem.currentSeason = originalSeason;

        return results;
    },

    /**
     * 测试四季天气分布
     */
    testAllSeasons() {
        console.log('\n🌍 测试：四季天气分布对比');

        const seasons = ['spring', 'summer', 'autumn', 'winter'];
        const seasonNames = {
            spring: '春季',
            summer: '夏季',
            autumn: '秋季',
            winter: '冬季'
        };

        const results = {};

        seasons.forEach(season => {
            window.weatherSystem.currentSeason = season;
            const seasonResults = {};

            for (let i = 0; i < 100; i++) {
                window.weatherSystem.generateWeather();
                const weather = window.weatherSystem.currentWeather;
                seasonResults[weather] = (seasonResults[weather] || 0) + 1;
            }

            results[season] = seasonResults;

            console.log(`\n📊 ${seasonNames[season]}:`);
            for (const [weather, count] of Object.entries(seasonResults)) {
                const percentage = (count / 100).toFixed(0);
                const weatherInfo = window.weatherSystem.weatherTypes[weather];
                console.log(`  ${weatherInfo.icon} ${weatherInfo.name}: ${percentage}%`);
            }
        });

        return results;
    },

    /**
     * 测试温度生成
     */
    testTemperature() {
        console.log('\n🌡️ 测试：温度生成范围');

        const seasons = ['spring', 'summer', 'autumn', 'winter'];
        const seasonNames = {
            spring: '春季',
            summer: '夏季',
            autumn: '秋季',
            winter: '冬季'
        };

        seasons.forEach(season => {
            window.weatherSystem.currentSeason = season;
            const temps = [];

            for (let i = 0; i < 50; i++) {
                window.weatherSystem.generateWeather();
                temps.push(window.weatherSystem.currentTemperature);
            }

            const min = Math.min(...temps);
            const max = Math.max(...temps);
            const avg = (temps.reduce((a, b) => a + b) / temps.length).toFixed(1);

            const expectedRange = window.weatherSystem.seasons[season].temperature;

            console.log(`${seasonNames[season]}: ${min}°C ~ ${max}°C (平均 ${avg}°C) | 预期范围: ${expectedRange.min}°C ~ ${expectedRange.max}°C`);
        });
    },

    /**
     * 测试天气预报生成
     */
    testForecast() {
        console.log('\n🔮 测试：天气预报生成');

        window.weatherSystem.generateForecast();
        const forecast = window.weatherSystem.forecast;

        console.log('未来3天预报:');
        forecast.forEach((day, index) => {
            const weatherInfo = window.weatherSystem.weatherTypes[day.weather];
            console.log(`  第${day.day}天: ${weatherInfo.icon} ${weatherInfo.name} ${day.temperature}°C`);
        });

        // 验证预报是否存入worldState
        if (window.worldState?.state?.environment?.forecast) {
            console.log('✅ 预报已同步到worldState');
        } else {
            console.warn('⚠️ 预报未同步到worldState');
        }
    },

    /**
     * 测试气候修正
     */
    testClimateModifier() {
        console.log('\n🌍 测试：气候系统修正（如果存在）');

        if (!window.climateManager) {
            console.log('ℹ️ 气候管理器未加载，跳过此测试');
            return;
        }

        const seasons = ['spring', 'summer', 'autumn', 'winter'];

        console.log('基础降水修正:');
        seasons.forEach(season => {
            const modifier = window.climateManager.getRainfallModifier(season);
            console.log(`  ${season}: ${modifier.toFixed(2)}x`);
        });

        // 测试动荡年影响
        console.log('\n测试动荡年影响:');
        const originalLevel = window.climateManager.currentState.turbulenceLevel;

        window.climateManager.currentState.turbulenceLevel = 0;
        console.log(`  平和年(0): ${window.climateManager.getRainfallModifier('spring').toFixed(2)}x`);

        window.climateManager.currentState.turbulenceLevel = 1;
        console.log(`  轻度动荡(1): ${window.climateManager.getRainfallModifier('spring').toFixed(2)}x`);

        window.climateManager.currentState.turbulenceLevel = 2;
        console.log(`  中度动荡(2): ${window.climateManager.getRainfallModifier('spring').toFixed(2)}x`);

        // 恢复原状
        window.climateManager.currentState.turbulenceLevel = originalLevel;
    },

    /**
     * 测试季节活动（樱花周、夏日祭等）
     */
    testSeasonalEvents() {
        console.log('\n🎉 测试：季节活动天气影响');

        if (!window.climateManager) {
            console.log('ℹ️ 气候管理器未加载，跳过此测试');
            return;
        }

        // 测试樱花周
        console.log('\n🌸 樱花周测试:');
        window.weatherSystem.currentSeason = 'spring';
        window.climateManager.checkSeasonalEvents('spring', 2);

        const sakuraEvent = window.climateManager.seasonalEvents.spring[0];
        console.log(`  活动状态: ${sakuraEvent.active ? '✅ 进行中' : '❌ 未激活'}`);
        console.log(`  活动名称: ${sakuraEvent.name}`);
        console.log(`  活动描述: ${sakuraEvent.description}`);
        console.log(`  情绪加成: +${sakuraEvent.effects.mood}`);
        console.log(`  浪漫加成: +${sakuraEvent.effects.romance}`);

        if (sakuraEvent.active) {
            // 生成100次春季樱花周天气
            const results = {};
            for (let i = 0; i < 100; i++) {
                window.weatherSystem.generateWeather();
                const weather = window.weatherSystem.currentWeather;
                results[weather] = (results[weather] || 0) + 1;
            }

            console.log('  天气分布:');
            for (const [weather, count] of Object.entries(results)) {
                const weatherInfo = window.weatherSystem.weatherTypes[weather];
                console.log(`    ${weatherInfo.icon} ${weatherInfo.name}: ${count}%`);
            }
        }

        // 测试夏日祭
        console.log('\n🎆 夏日祭测试:');
        window.weatherSystem.currentSeason = 'summer';
        window.climateManager.checkSeasonalEvents('summer', 6);

        const festivalEvent = window.climateManager.seasonalEvents.summer[0];
        console.log(`  活动状态: ${festivalEvent.active ? '✅ 进行中' : '❌ 未激活'}`);
        console.log(`  活动名称: ${festivalEvent.name}`);
        console.log(`  活动描述: ${festivalEvent.description}`);
        console.log(`  情绪加成: +${festivalEvent.effects.mood}`);

        if (festivalEvent.active) {
            // 生成100次夏日祭天气
            const results = {};
            for (let i = 0; i < 100; i++) {
                window.weatherSystem.generateWeather();
                const weather = window.weatherSystem.currentWeather;
                results[weather] = (results[weather] || 0) + 1;
            }

            console.log('  天气分布:');
            for (const [weather, count] of Object.entries(results)) {
                const weatherInfo = window.weatherSystem.weatherTypes[weather];
                console.log(`    ${weatherInfo.icon} ${weatherInfo.name}: ${count}%`);
            }
        }
    },

    /**
     * 完整测试套件
     */
    runAll() {
        console.log('🧪 ==========================================');
        console.log('🧪 天气系统RandomEngine集成测试');
        console.log('🧪 ==========================================\n');

        this.testWeatherDistribution();
        this.testAllSeasons();
        this.testTemperature();
        this.testForecast();
        this.testClimateModifier();
        this.testSeasonalEvents();

        console.log('\n✅ 所有测试完成！');
        console.log('\n💡 使用方法:');
        console.log('  WeatherRandomTest.runAll()           - 运行所有测试');
        console.log('  WeatherRandomTest.testWeatherDistribution() - 测试天气分布');
        console.log('  WeatherRandomTest.testAllSeasons()   - 测试四季对比');
        console.log('  WeatherRandomTest.testTemperature()  - 测试温度范围');
        console.log('  WeatherRandomTest.testForecast()     - 测试天气预报');
        console.log('  WeatherRandomTest.testSeasonalEvents() - 测试季节活动');
    }
};

// 导出到全局
window.WeatherRandomTest = WeatherRandomTest;

console.log('✅ 天气RandomEngine测试工具已加载');
console.log('📝 使用 WeatherRandomTest.runAll() 开始测试');
