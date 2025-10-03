/**
 * 🌤️ 天气系统测试工具
 * 用于快速测试天气系统的各种功能
 */

window.testWeather = {
    /**
     * 显示当前天气状态
     */
    status() {
        console.log('=== 🌤️ 天气系统状态 ===');

        if (!window.weatherSystem) {
            console.error('❌ 天气系统未初始化');
            return;
        }

        const info = window.weatherSystem.getCurrentWeatherInfo();
        console.log('当前天气:', info.icon, info.weather);
        console.log('温度:', info.temperature + '°C');
        console.log('季节:', info.season);
        console.log('能见度:', info.visibility + '%');
        console.log('未来3天预报:', info.forecast);

        if (window.climateManager) {
            const climate = window.climateManager.getCurrentClimate();
            console.log('\n--- 🌍 气候系统状态 ---');
            console.log('年份类型:', climate.yearType);
            console.log('动荡等级:', climate.turbulenceLevel);
            console.log('季节活动:', climate.seasonalEvent || '无');
            console.log('极端天气:', climate.extremeEvent?.name || '无');
        }

        console.log('==================');
        return info;
    },

    /**
     * 强制改变天气
     * @param {string} weatherType - 天气类型 (sunny/cloudy/rainy/stormy/snowy/foggy)
     * @param {number} duration - 持续小时数
     */
    setWeather(weatherType = 'rainy', duration = 4) {
        if (!window.weatherSystem) {
            console.error('❌ 天气系统未初始化');
            return;
        }

        console.log(`🌦️ 强制设置天气: ${weatherType} (持续${duration}小时)`);
        window.weatherSystem.forceWeather(weatherType, duration);

        // 更新UI
        if (window.updateWeatherIcon) {
            window.updateWeatherIcon();
        }
        if (window.createWeatherEffects) {
            window.createWeatherEffects(weatherType);
        }

        return window.weatherSystem.getCurrentWeatherInfo();
    },

    /**
     * 测试所有天气类型
     */
    testAllWeathers() {
        const weathers = ['sunny', 'cloudy', 'rainy', 'stormy', 'snowy', 'foggy'];
        let index = 0;

        console.log('🌈 开始循环测试所有天气类型...');

        const interval = setInterval(() => {
            if (index >= weathers.length) {
                clearInterval(interval);
                console.log('✅ 天气类型测试完成');
                return;
            }

            const weather = weathers[index];
            console.log(`\n${index + 1}/${weathers.length} 测试天气: ${weather}`);
            this.setWeather(weather, 1);
            index++;
        }, 3000); // 每3秒切换一次

        return '测试进行中...（每3秒切换）';
    },

    /**
     * 测试季节变化
     * @param {string} season - spring/summer/autumn/winter
     */
    setSeason(season) {
        if (!window.weatherSystem) {
            console.error('❌ 天气系统未初始化');
            return;
        }

        console.log(`🍂 切换季节到: ${season}`);
        window.weatherSystem.currentSeason = season;
        window.weatherSystem.generateWeather();
        window.weatherSystem.generateForecast();

        return this.status();
    },

    /**
     * 推进时间（测试自动天气变化）
     * @param {number} hours - 推进小时数
     */
    skipHours(hours = 1) {
        if (!window.timeSystem) {
            console.error('❌ 时间系统未初始化');
            return;
        }

        console.log(`⏩ 推进时间 ${hours} 小时...`);
        window.timeSystem.advanceTime(hours * 60, '测试天气系统');

        return this.status();
    },

    /**
     * 推进到跨季节（测试季节变化）
     */
    skipToNextSeason() {
        if (!window.timeSystem) {
            console.error('❌ 时间系统未初始化');
            return;
        }

        const currentSeason = window.timeSystem.getSeason();
        const currentDay = window.timeSystem.currentTime.dayOfYear;

        // 计算到下一季节需要的天数（每季45天）
        const daysToNext = 45 - (currentDay % 45);

        console.log(`🌸 推进到下一季节... (跳过${daysToNext}天)`);
        window.timeSystem.advanceTime(daysToNext * 24 * 60, '跳转到下一季节');

        const newSeason = window.timeSystem.getSeason();
        console.log(`✅ 季节变化: ${currentSeason} → ${newSeason}`);

        return this.status();
    },

    /**
     * 测试气候系统 - 樱花周
     */
    testSakura() {
        if (!window.climateManager) {
            console.error('❌ 气候系统未初始化');
            return;
        }

        console.log('🌸 触发樱花周活动...');
        return window.testClimate.sakura();
    },

    /**
     * 测试气候系统 - 极端天气
     * @param {string} type - heatWave/coldVortex/drought/flood/typhoon
     */
    testExtreme(type = 'heatWave') {
        if (!window.climateManager) {
            console.error('❌ 气候系统未初始化');
            return;
        }

        console.log(`🌪️ 触发极端天气: ${type}`);
        return window.testClimate.extreme(type);
    },

    /**
     * 测试存档和恢复
     */
    testSaveLoad() {
        console.log('\n=== 💾 测试天气系统存档 ===');

        // 1. 保存当前状态
        const savedWeather = window.weatherSystem?.save();
        const savedClimate = window.climateManager?.save();

        console.log('✅ 已保存天气状态:', savedWeather);
        console.log('✅ 已保存气候状态:', savedClimate);

        // 2. 改变天气
        console.log('\n🌦️ 改变天气到暴雨...');
        this.setWeather('stormy');

        // 3. 显示改变后的状态
        console.log('\n当前天气:', window.weatherSystem.currentWeather);

        // 4. 恢复
        console.log('\n📂 恢复原来的天气状态...');
        if (savedWeather) window.weatherSystem.load(savedWeather);
        if (savedClimate) window.climateManager.load(savedClimate);

        // 5. 验证
        console.log('✅ 恢复后的天气:', window.weatherSystem.currentWeather);
        console.log('==================');

        return '存档测试完成';
    },

    /**
     * 测试完整流程
     */
    fullTest() {
        console.log('🧪 开始完整测试流程...\n');

        // 1. 显示初始状态
        console.log('【1/5】初始状态');
        this.status();

        // 2. 测试天气变化
        setTimeout(() => {
            console.log('\n【2/5】测试天气变化');
            this.setWeather('rainy');
        }, 2000);

        // 3. 测试季节变化
        setTimeout(() => {
            console.log('\n【3/5】测试季节变化');
            this.setSeason('summer');
        }, 4000);

        // 4. 测试时间推进
        setTimeout(() => {
            console.log('\n【4/5】测试时间推进');
            this.skipHours(12);
        }, 6000);

        // 5. 测试存档
        setTimeout(() => {
            console.log('\n【5/5】测试存档恢复');
            this.testSaveLoad();
            console.log('\n✅ 完整测试流程结束');
        }, 8000);

        return '测试进行中...（预计10秒完成）';
    },

    /**
     * 显示帮助信息
     */
    help() {
        console.log(`
🌤️ 天气系统测试命令：
================================
基础命令：
  testWeather.status()          - 查看当前天气状态
  testWeather.setWeather(type)  - 强制设置天气
    - 可选类型: sunny, cloudy, rainy, stormy, snowy, foggy
  testWeather.setSeason(season) - 切换季节
    - 可选季节: spring, summer, autumn, winter

时间控制：
  testWeather.skipHours(5)      - 推进5小时
  testWeather.skipToNextSeason()- 跳到下一季节

测试功能：
  testWeather.testAllWeathers() - 循环测试所有天气
  testWeather.testSakura()      - 触发樱花周
  testWeather.testExtreme('heatWave') - 触发极端天气
  testWeather.testSaveLoad()    - 测试存档恢复
  testWeather.fullTest()        - 完整测试流程

================================
示例：
  testWeather.setWeather('rainy', 8)  // 设置雨天持续8小时
  testWeather.setSeason('winter')     // 切换到冬季
  testWeather.skipHours(24)           // 推进一天
================================
        `);
    }
};

// 启动时显示提示
console.log('🌤️ 天气系统测试工具已加载');
console.log('💡 输入 testWeather.help() 查看测试命令');
