/**
 * 天气特效调试工具
 * 详细输出每个步骤的状态
 */

window.debugWeather = {
    // 详细调试樱花
    sakuraDebug: () => {
        console.log('=== 🌸 樱花特效完整调试 ===\n');

        // 1. 检查系统状态
        console.log('1️⃣ 检查系统状态：');
        console.log('  weatherSystem:', !!window.weatherSystem);
        console.log('  weatherEffectController:', !!window.weatherEffectController);
        console.log('  worldState:', !!window.worldState);
        console.log('  reactiveSystem:', !!window.reactiveSystem);
        console.log('');

        // 2. 检查当前位置
        console.log('2️⃣ 检查当前位置：');
        const currentLoc = window.worldState?.state?.character?.location;
        console.log('  当前位置:', currentLoc);
        console.log('  character对象:', window.worldState?.state?.character);
        console.log('');

        // 3. 切换到公园
        console.log('3️⃣ 切换到公园：');
        if (window.worldState?.state?.character) {
            window.worldState.state.character.location = 'park';
            console.log('  ✅ location已设置为: park');
            console.log('  实际值:', window.worldState.state.character.location);

            // 通知响应式系统
            if (window.reactiveSystem) {
                window.reactiveSystem.notify('character.location', 'park');
                console.log('  ✅ 已通知响应式系统');
            }
        }
        console.log('');

        // 4. 强制切换天气
        console.log('4️⃣ 强制切换天气为sakura：');
        if (window.weatherSystem) {
            window.weatherSystem.forceWeather('sakura', 4);
            console.log('  ✅ forceWeather已调用');
            console.log('  当前天气:', window.weatherSystem.currentWeather);
        }
        console.log('');

        // 5. 检查特效控制器状态
        setTimeout(() => {
            console.log('5️⃣ 检查特效控制器状态（500ms后）：');
            if (window.weatherEffectController) {
                const info = window.weatherEffectController.getEffectInfo();
                console.log('  特效信息:', info);
                console.log('  容器存在:', !!window.weatherEffectController.effectContainer);
                console.log('  粒子数量:', window.weatherEffectController.particles?.length);
                console.log('  当前特效类型:', window.weatherEffectController.currentEffect);

                // 检查容器是否在DOM中
                if (window.weatherEffectController.effectContainer) {
                    const container = window.weatherEffectController.effectContainer;
                    console.log('  容器在DOM中:', document.body.contains(container));
                    console.log('  容器样式:', {
                        display: container.style.display,
                        opacity: container.style.opacity,
                        visibility: container.style.visibility
                    });
                }
            }
            console.log('');

            // 6. 检查天气系统状态
            console.log('6️⃣ 检查天气系统状态：');
            if (window.weatherSystem) {
                console.log('  当前天气:', window.weatherSystem.currentWeather);
                const sakuraConfig = window.weatherSystem.weatherTypes?.sakura;
                console.log('  樱花配置:', sakuraConfig);
                console.log('  可见性条件:', sakuraConfig?.visibilityConditions);
            }
            console.log('');

            console.log('=== 调试完成 ===');
        }, 500);
    },

    // 检查特效映射
    checkMapping: () => {
        console.log('=== 🔍 检查天气→特效映射 ===\n');

        if (window.weatherSystem && window.weatherSystem.getEffectType) {
            const types = ['sunny', 'rainy', 'stormy', 'snowy', 'sakura', 'rainbow', 'meteor_shower', 'polluted'];
            types.forEach(type => {
                const effectType = window.weatherSystem.getEffectType(type);
                console.log(`  ${type} → ${effectType || 'null (无特效)'}`);
            });
        } else {
            console.error('❌ weatherSystem.getEffectType 不存在');
        }
        console.log('');
    },

    // 手动触发特效
    manualEffect: (effectType) => {
        console.log(`=== 🎨 手动创建 ${effectType} 特效 ===\n`);

        if (window.weatherEffectController) {
            // 先切换位置
            if (window.worldState?.state?.character) {
                window.worldState.state.character.location = 'park';
                window.reactiveSystem?.notify('character.location', 'park');
                console.log('✅ 已切换到公园');
            }

            // 直接调用showEffect
            window.weatherEffectController.showEffect(effectType, 1.0);
            console.log(`✅ 已调用 showEffect('${effectType}', 1.0)`);

            // 检查结果
            setTimeout(() => {
                const info = window.weatherEffectController.getEffectInfo();
                console.log('特效信息:', info);

                if (window.weatherEffectController.effectContainer) {
                    console.log('✅ 容器已创建');
                    console.log('粒子数量:', window.weatherEffectController.particles?.length);
                } else {
                    console.error('❌ 容器未创建');
                }
            }, 200);
        }
    },

    // 查看控制台所有相关日志
    checkConsole: () => {
        console.log('=== 📋 请查看上方控制台日志 ===');
        console.log('查找以下关键词：');
        console.log('  - "天气变化"');
        console.log('  - "天气特效"');
        console.log('  - "樱花"');
        console.log('  - "特效可见性"');
        console.log('  - "updateVisibility"');
        console.log('');
        console.log('💡 如果没有相关日志，说明某个环节没有执行');
    },

    // 完整流程测试
    fullTest: () => {
        console.log('=== 🚀 完整流程测试 ===\n');

        console.log('步骤1: 检查映射');
        debugWeather.checkMapping();

        setTimeout(() => {
            console.log('\n步骤2: 樱花调试');
            debugWeather.sakuraDebug();
        }, 1000);

        setTimeout(() => {
            console.log('\n步骤3: 手动创建樱花特效');
            debugWeather.manualEffect('sakura');
        }, 3000);
    }
};

console.log('🐛 天气调试工具已加载！');
console.log('使用方法：');
console.log('  debugWeather.sakuraDebug()  - 详细调试樱花');
console.log('  debugWeather.checkMapping() - 检查天气映射');
console.log('  debugWeather.manualEffect("sakura") - 手动创建特效');
console.log('  debugWeather.fullTest()     - 完整测试流程');
