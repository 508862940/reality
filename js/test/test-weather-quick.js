/**
 * 天气特效快速测试工具
 * 用法：在控制台直接输入 testWeather.xxx
 */

window.testWeather = {
    // 快速切换天气
    sunny: () => {
        window.weatherSystem.forceWeather('sunny', 4);
        console.log('☀️ 切换到晴天');
    },

    rain: () => {
        window.weatherSystem.forceWeather('rainy', 4);
        console.log('🌧️ 切换到雨天');
    },

    storm: () => {
        window.weatherSystem.forceWeather('stormy', 4);
        console.log('⛈️ 切换到暴雨');
    },

    snow: () => {
        window.weatherSystem.forceWeather('snowy', 4);
        console.log('❄️ 切换到雪天');
    },

    sakura: () => {
        // 🔥 关键修复：先设置天气（创建特效），再切换位置（updateVisibility检查）
        // 这样updateVisibility()就能找到sakura的visibilityConditions
        window.weatherSystem.forceWeather('sakura', 4);
        console.log('🌸 天气已设置为樱花飘落');

        // 🌸 樱花只在特定位置可见，自动切换到公园
        if (window.worldState?.state?.character) {
            const currentLoc = window.worldState.state.character.location;
            const sakuraLocations = ['park', 'school_yard', 'cherry_blossom_avenue', 'street', 'square', 'commercial_district'];

            if (!sakuraLocations.some(loc => currentLoc.includes(loc))) {
                console.log('📍 当前位置不支持樱花，切换到公园');
                // 🔥 修改位置（会触发Proxy set → notify → updateVisibility重新检查可见性）
                window.worldState.state.character.location = 'park';
            } else {
                console.log('📍 当前位置支持樱花特效');
            }
        }
        console.log('💡 提示：樱花特效只在户外特定区域可见（公园、学校、樱花大道等）');
    },

    rainbow: () => {
        window.weatherSystem.forceWeather('rainbow', 2);
        console.log('🌈 出现彩虹（2小时）');
    },

    meteor: () => {
        // 🔥 关键修复：先设置天气，再检查位置
        window.weatherSystem.forceWeather('meteor_shower', 6);
        console.log('🌠 流星雨天气已设置（6小时）');

        // 🌠 流星雨需要天空可见，自动切换到户外
        if (window.worldState?.state?.character) {
            const currentLoc = window.worldState.state.character.location;
            const outdoorKeywords = ['park', 'square', 'rooftop', 'field', 'street'];

            if (currentLoc.includes('indoor') || currentLoc.includes('underground') || currentLoc.includes('room')) {
                console.log('📍 当前位置天空不可见，切换到公园');
                window.worldState.state.character.location = 'park';
            } else {
                console.log('📍 当前位置天空可见');
            }
        }
        console.log('💡 提示：流星雨只在天空可见的户外区域可见');
    },

    polluted: () => {
        window.weatherSystem.forceWeather('polluted', 8);
        console.log('☢️ 切换到污染天气');
    },

    // 位置切换
    outdoor: () => {
        if (!window.worldState?.state?.character) {
            console.error('❌ worldState未初始化，请先启动游戏或新建游戏');
            return;
        }
        window.worldState.state.character.location = 'outdoor';
        console.log('🏞️ 切换到室外');
    },

    indoor: () => {
        if (!window.worldState?.state?.character) {
            console.error('❌ worldState未初始化，请先启动游戏或新建游戏');
            return;
        }
        window.worldState.state.character.location = 'indoor';
        console.log('🏠 切换到室内（天气特效应该隐藏）');
    },

    park: () => {
        if (!window.worldState?.state?.character) {
            console.error('❌ worldState未初始化，请先启动游戏或新建游戏');
            return;
        }
        window.worldState.state.character.location = 'park';
        console.log('🌳 切换到公园（樱花增强区）');
    },

    underground: () => {
        if (!window.worldState?.state?.character) {
            console.error('❌ worldState未初始化，请先启动游戏或新建游戏');
            return;
        }
        window.worldState.state.character.location = 'underground';
        console.log('🚇 切换到地下（天气特效应该隐藏）');
    },

    // 温度测试
    freezing: () => {
        window.temperatureSystem.updateTemperature(-10);
        console.log('🥶 温度设置为-10°C（严寒）');
    },

    cold: () => {
        window.temperatureSystem.updateTemperature(5);
        console.log('🧊 温度设置为5°C（寒冷）');
    },

    comfortable: () => {
        window.temperatureSystem.updateTemperature(22);
        console.log('😊 温度设置为22°C（舒适）');
    },

    hot: () => {
        window.temperatureSystem.updateTemperature(35);
        console.log('🥵 温度设置为35°C（炎热）');
    },

    // 雨伞控制
    openUmbrella: () => {
        if (!window.worldState?.state?.character) {
            console.error('❌ worldState未初始化，请先启动游戏或新建游戏');
            return;
        }
        if (!window.worldState.state.character.equipped) {
            window.worldState.state.character.equipped = {};
        }
        window.worldState.state.character.equipped.accessory = {id: 'umbrella'};
        console.log('🌂 打开雨伞（雨滴应该避开中央或消失）');
        console.log('💡 提示：需要先切换到雨天才能看到效果 testWeather.rain()');
    },

    closeUmbrella: () => {
        if (!window.worldState?.state?.character) {
            console.error('❌ worldState未初始化，请先启动游戏或新建游戏');
            return;
        }
        if (window.worldState.state.character.equipped) {
            window.worldState.state.character.equipped.accessory = null;
        }
        console.log('❌ 收起雨伞');
    },

    // 工具功能
    clear: () => {
        window.weatherEffectController.removeEffect(true);
        console.log('🧹 清除所有天气特效');
    },

    status: () => {
        console.log('📊 系统状态：');
        console.log('  天气系统:', window.weatherSystem);
        console.log('  温度系统:', window.temperatureSystem);
        console.log('  特效控制器:', window.weatherEffectController);
        console.log('  当前位置:', window.worldState?.state?.character?.location);
        console.log('  当前天气:', window.worldState?.state?.environment?.weather);
        console.log('  环境温度:', window.worldState?.state?.environment?.temperature);
        console.log('  体感温度:', window.temperatureSystem?.currentState?.apparentTemp);
        console.log('  舒适度:', window.temperatureSystem?.currentState?.comfortLevel);
    },

    // 完整测试流程
    fullTest: () => {
        console.log('🚀 开始完整测试流程...\n');

        // 测试1：晴天室外
        console.log('1️⃣ 测试晴天室外');
        testWeather.sunny();
        testWeather.outdoor();

        setTimeout(() => {
            console.log('\n2️⃣ 测试雨天室外');
            testWeather.rain();
        }, 3000);

        setTimeout(() => {
            console.log('\n3️⃣ 测试雨天室内（特效应该隐藏）');
            testWeather.indoor();
        }, 6000);

        setTimeout(() => {
            console.log('\n4️⃣ 测试雨天室外+雨伞');
            testWeather.outdoor();
            testWeather.openUmbrella();
        }, 9000);

        setTimeout(() => {
            console.log('\n5️⃣ 测试樱花天气');
            testWeather.sakura();
            testWeather.closeUmbrella();
        }, 12000);

        setTimeout(() => {
            console.log('\n6️⃣ 测试彩虹');
            testWeather.rainbow();
        }, 15000);

        setTimeout(() => {
            console.log('\n✅ 测试完成！');
            testWeather.status();
        }, 18000);
    },

    // 帮助信息
    help: () => {
        console.log(`
🌤️ 天气特效快速测试工具
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 天气测试：
  testWeather.sunny()      - ☀️ 晴天
  testWeather.rain()       - 🌧️ 雨天
  testWeather.storm()      - ⛈️ 暴雨
  testWeather.snow()       - ❄️ 雪天
  testWeather.sakura()     - 🌸 樱花
  testWeather.rainbow()    - 🌈 彩虹
  testWeather.meteor()     - 🌠 流星雨
  testWeather.polluted()   - ☢️ 污染

📍 位置测试：
  testWeather.outdoor()    - 🏞️ 室外
  testWeather.indoor()     - 🏠 室内（特效隐藏）
  testWeather.park()       - 🌳 公园（樱花增强）
  testWeather.underground()- 🚇 地下（特效隐藏）

🌡️ 温度测试：
  testWeather.freezing()   - 🥶 -10°C 严寒
  testWeather.cold()       - 🧊 5°C 寒冷
  testWeather.comfortable()- 😊 22°C 舒适
  testWeather.hot()        - 🥵 35°C 炎热

🌂 雨伞测试：
  testWeather.openUmbrella() - 打开雨伞
  testWeather.closeUmbrella()- 收起雨伞

🛠️ 工具功能：
  testWeather.clear()      - 🧹 清除所有特效
  testWeather.status()     - 📊 查看系统状态
  testWeather.fullTest()   - 🚀 运行完整测试流程
  testWeather.help()       - 💡 显示此帮助

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💡 提示：直接在控制台输入命令即可使用
        `);
    }
};

// 初始化提示
console.log('🌤️ 天气测试工具已加载！输入 testWeather.help() 查看帮助');
