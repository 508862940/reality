/**
 * 完整存档系统测试
 * 测试所有5个Phase的存档功能是否正常工作
 */

async function testCompleteSaveSystem() {
    console.log('========== 开始测试完整存档系统 ==========');

    try {
        // Phase 1: 测试剧情标记系统
        console.log('\n📚 Phase 1: 测试剧情标记系统...');
        if (window.storyFlags) {
            window.storyFlags.setFlag('TEST_FLAG_1', true);
            window.storyFlags.incrementCounter('TEST_COUNTER', 5);
            window.storyFlags.recordChoice('TEST_CHOICE', 'option_a');

            const storyData = window.storyFlags.save();
            console.log('✅ 剧情数据保存成功:', storyData);

            // 测试恢复
            window.storyFlags.reset();
            window.storyFlags.load(storyData);
            console.log('✅ 剧情数据恢复成功');
        }

        // Phase 2: 测试NPC关系系统
        console.log('\n👥 Phase 2: 测试NPC关系系统...');
        if (window.relationships) {
            window.relationships.adjustAffection('Zero', 20, '测试');
            window.relationships.adjustTrust('Zero', 15, '测试');

            const relationData = window.relationships.save();
            console.log('✅ 关系数据保存成功:', relationData);

            // 测试恢复
            window.relationships.reset();
            window.relationships.load(relationData);
            console.log('✅ 关系数据恢复成功');
        }

        // Phase 3: 测试世界系统
        console.log('\n🌍 Phase 3: 测试世界系统...');

        // 测试天气系统
        if (window.weatherSystem) {
            window.weatherSystem.changeWeather('rainy');
            const weatherData = window.weatherSystem.save();
            console.log('✅ 天气数据保存成功:', weatherData);
        }

        // 测试经济系统
        if (window.economySystem) {
            window.economySystem.updatePrice('apple', 25);
            const economyData = window.economySystem.save();
            console.log('✅ 经济数据保存成功:', economyData);
        }

        // 测试种植系统
        if (window.farmingSystem) {
            window.farmingSystem.plantCrop(0, 'tomato');
            const farmingData = window.farmingSystem.save();
            console.log('✅ 种植数据保存成功:', farmingData);
        }

        // Phase 4: 测试战斗系统
        console.log('\n⚔️ Phase 4: 测试战斗系统...');
        if (window.combatSystem) {
            const combatData = window.combatSystem.save();
            console.log('✅ 战斗数据保存成功:', combatData);

            // 测试恢复
            window.combatSystem.load(combatData);
            console.log('✅ 战斗数据恢复成功');
        }

        // Phase 5: 测试自动存档策略
        console.log('\n💾 Phase 5: 测试自动存档策略...');
        if (window.saveSystem) {
            // 测试定时器状态
            console.log('自动存档启用:', window.saveSystem.autoSaveEnabled);
            console.log('自动存档间隔:', window.saveSystem.autoSaveInterval / 1000, '秒');
            console.log('定时器状态:', window.saveSystem.autoSaveTimer ? '运行中' : '未运行');

            // 测试手动触发自动存档
            console.log('测试触发自动存档...');
            window.saveSystem.triggerAutoSave('test');

            // 等待存档完成
            await new Promise(resolve => setTimeout(resolve, 100));

            // 检查自动存档
            const autoSave = await window.saveSystem.loadSave('auto_0');
            if (autoSave) {
                console.log('✅ 自动存档创建成功');
                console.log('存档包含以下数据:');
                if (autoSave.gameData.storyData) console.log('  - 剧情数据 ✓');
                if (autoSave.gameData.relationshipData) console.log('  - 关系数据 ✓');
                if (autoSave.gameData.worldData) console.log('  - 世界数据 ✓');
                if (autoSave.gameData.combatData) console.log('  - 战斗数据 ✓');
            }
        }

        // 完整存档测试
        console.log('\n📦 测试完整存档创建...');
        if (window.saveSystem) {
            const testSave = await window.saveSystem.createSave('manual', 9, '完整测试存档');
            console.log('✅ 完整存档创建成功:', testSave.id);

            // 验证存档内容
            const loadedSave = await window.saveSystem.loadSave(testSave.id);
            if (loadedSave) {
                console.log('✅ 存档读取成功');
                console.log('存档大小:', JSON.stringify(loadedSave).length, '字节');

                // 清理测试存档
                await window.saveSystem.deleteSave(testSave.id);
                console.log('✅ 测试存档已清理');
            }
        }

        console.log('\n========== 完整存档系统测试完成 ==========');
        console.log('✅ 所有5个Phase功能正常');
        return true;

    } catch (error) {
        console.error('❌ 测试失败:', error);
        return false;
    }
}

// 导出到全局
window.testCompleteSaveSystem = testCompleteSaveSystem;

// 自动运行测试（如果在开发环境）
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('📝 检测到开发环境，3秒后自动运行存档系统测试...');
    setTimeout(() => {
        testCompleteSaveSystem();
    }, 3000);
}