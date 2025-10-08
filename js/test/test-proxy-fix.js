/**
 * Proxy修复验证测试
 * 验证character Proxy在存档加载后仍然正常工作
 */

window.testProxyFix = {
    // 测试1：基础Proxy功能
    testBasicProxy: () => {
        console.log('\n=== 测试1：基础Proxy功能 ===');

        const oldLoc = window.worldState.state.character.location;
        console.log('当前位置:', oldLoc);
        console.log('player.position.location:', window.worldState.state.player.position.location);

        // 设置新位置
        window.worldState.state.character.location = 'test_proxy_basic';

        console.log('设置后 character.location:', window.worldState.state.character.location);
        console.log('设置后 player.position.location:', window.worldState.state.player.position.location);

        // 验证
        if (window.worldState.state.player.position.location === 'test_proxy_basic') {
            console.log('✅ Proxy工作正常！');
            return true;
        } else {
            console.error('❌ Proxy未工作！player.position.location未更新');
            return false;
        }
    },

    // 测试2：响应式通知
    testReactiveNotify: () => {
        console.log('\n=== 测试2：响应式通知 ===');

        let notified = false;
        const testHandler = (newValue) => {
            console.log('📢 收到通知，新位置:', newValue);
            notified = true;
        };

        // 临时监听
        window.reactiveSystem.watch('character.location', testHandler);

        // 触发变化
        window.worldState.state.character.location = 'test_notify';

        // 等待一下（通知是同步的，但为了安全等10ms）
        setTimeout(() => {
            if (notified) {
                console.log('✅ 响应式通知正常！');
            } else {
                console.error('❌ 响应式通知失败！');
            }

            // 清理监听器（从listeners数组中移除）
            const listeners = window.reactiveSystem.listeners.get('character.location');
            if (listeners) {
                const index = listeners.indexOf(testHandler);
                if (index > -1) {
                    listeners.splice(index, 1);
                }
            }
        }, 10);
    },

    // 测试3：樱花显示/隐藏
    testSakuraVisibility: async () => {
        console.log('\n=== 测试3：樱花可见性 ===');

        // 1. 设置樱花天气
        console.log('1️⃣ 设置樱花天气...');
        window.weatherSystem.forceWeather('sakura', 4);
        await new Promise(r => setTimeout(r, 500));

        // 2. 切换到户外（公园）
        console.log('2️⃣ 切换到公园...');
        window.worldState.state.character.location = 'park';
        await new Promise(r => setTimeout(r, 500));

        // 检查容器存在且可见
        const container1 = document.getElementById('weatherEffectContainer');
        const visible1 = container1 && container1.style.display !== 'none';
        console.log('公园中樱花可见:', visible1 ? '✅ 是' : '❌ 否');

        // 3. 切换到室内
        console.log('3️⃣ 切换到室内...');
        window.worldState.state.character.location = 'indoor';
        await new Promise(r => setTimeout(r, 500));

        // 检查容器隐藏
        const container2 = document.getElementById('weatherEffectContainer');
        const visible2 = container2 && container2.style.display !== 'none';
        console.log('室内樱花隐藏:', visible2 ? '❌ 未隐藏' : '✅ 已隐藏');

        // 4. 切换回户外
        console.log('4️⃣ 切换回户外...');
        window.worldState.state.character.location = 'park';
        await new Promise(r => setTimeout(r, 500));

        // 检查容器重新显示
        const container3 = document.getElementById('weatherEffectContainer');
        const visible3 = container3 && container3.style.display !== 'none';
        console.log('户外樱花重现:', visible3 ? '✅ 是' : '❌ 否');

        // 总结
        if (visible1 && !visible2 && visible3) {
            console.log('\n🎉 完美！樱花可见性测试通过！');
            return true;
        } else {
            console.error('\n❌ 樱花可见性测试失败');
            return false;
        }
    },

    // 测试4：存档后Proxy仍然工作
    testProxyAfterSave: async () => {
        console.log('\n=== 测试4：存档后Proxy ===');

        // 保存当前位置
        const beforeLoc = window.worldState.state.character.location;
        console.log('存档前位置:', beforeLoc);

        // 创建存档
        console.log('📝 创建测试存档...');
        await window.saveSystem.createSave('manual', 0, 'Proxy测试存档');

        // 修改位置
        window.worldState.state.character.location = 'after_save_test';
        console.log('存档后修改位置:', window.worldState.state.character.location);

        // 加载存档
        console.log('📂 加载存档...');
        const saves = await window.saveSystem.getSavesList('manual');
        if (saves.length > 0) {
            await window.saveSystem.loadSave(saves[0].id);

            // 等待加载完成
            await new Promise(r => setTimeout(r, 1000));

            console.log('加载后位置:', window.worldState.state.character.location);

            // 测试Proxy是否工作
            console.log('测试加载后Proxy...');
            window.worldState.state.character.location = 'proxy_after_load';

            if (window.worldState.state.player.position.location === 'proxy_after_load') {
                console.log('✅ 加载后Proxy工作正常！');
                return true;
            } else {
                console.error('❌ 加载后Proxy失效！');
                console.error('character.location:', window.worldState.state.character.location);
                console.error('player.position.location:', window.worldState.state.player.position.location);
                return false;
            }
        } else {
            console.error('❌ 没有找到存档');
            return false;
        }
    },

    // 运行所有测试
    runAll: async () => {
        console.log('\n🚀 开始完整测试流程...\n');

        const results = {
            basic: false,
            reactive: false,
            sakura: false,
            saveLoad: false
        };

        // 测试1
        results.basic = testProxyFix.testBasicProxy();
        await new Promise(r => setTimeout(r, 500));

        // 测试2
        testProxyFix.testReactiveNotify();
        await new Promise(r => setTimeout(r, 500));

        // 测试3
        results.sakura = await testProxyFix.testSakuraVisibility();
        await new Promise(r => setTimeout(r, 500));

        // 测试4
        results.saveLoad = await testProxyFix.testProxyAfterSave();

        // 总结
        console.log('\n\n=== 测试总结 ===');
        console.log('基础Proxy:', results.basic ? '✅' : '❌');
        console.log('响应式通知:', '⏳ (需手动确认)');
        console.log('樱花可见性:', results.sakura ? '✅' : '❌');
        console.log('存档后Proxy:', results.saveLoad ? '✅' : '❌');

        const passed = results.basic && results.sakura && results.saveLoad;
        console.log('\n' + (passed ? '🎉 所有测试通过！' : '❌ 部分测试失败'));

        return passed;
    },

    // 帮助
    help: () => {
        console.log(`
🔧 Proxy修复验证测试工具
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

测试命令：
  testProxyFix.testBasicProxy()     - 测试基础Proxy功能
  testProxyFix.testReactiveNotify() - 测试响应式通知
  testProxyFix.testSakuraVisibility() - 测试樱花显示/隐藏
  testProxyFix.testProxyAfterSave() - 测试存档后Proxy
  testProxyFix.runAll()             - 运行所有测试

快捷命令（结合天气测试）：
  testWeather.sakura()  - 设置樱花天气
  testWeather.indoor()  - 切换到室内
  testWeather.outdoor() - 切换到户外
  testWeather.park()    - 切换到公园

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💡 使用方法：
  1. 打开游戏（game-main.html）
  2. 新建或继续游戏
  3. 在控制台运行测试命令
        `);
    }
};

// 自动显示帮助
console.log('🔧 Proxy修复测试工具已加载！输入 testProxyFix.help() 查看帮助');
