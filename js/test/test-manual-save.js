/**
 * 手动存档测试脚本
 * 验证手动存档是否保存了完整的世界快照
 */

const ManualSaveTest = {
    testResults: {
        passed: 0,
        failed: 0,
        tests: []
    },

    // 记录测试结果
    logTest(name, passed, message = '') {
        this.testResults.tests.push({ name, passed, message });
        if (passed) {
            this.testResults.passed++;
            console.log(`✅ ${name}`);
        } else {
            this.testResults.failed++;
            console.error(`❌ ${name}: ${message}`);
        }
    },

    // 1. 测试手动存档创建
    async testManualSaveCreation() {
        console.log('\n=== 测试手动存档创建 ===');

        try {
            // 模拟用户输入存档名称
            const originalPrompt = window.prompt;
            window.prompt = () => '测试存档 - 手动';

            // 创建手动存档
            const result = await window.createManualSave();

            // 恢复prompt
            window.prompt = originalPrompt;

            // 验证存档是否创建成功
            const saves = await window.saveSystem.getSavesList('manual');
            const testSave = saves.find(s => s.name && s.name.includes('测试存档'));

            this.logTest('手动存档创建', !!testSave);

            if (testSave) {
                this.logTest('存档包含ID', !!testSave.id);
                this.logTest('存档包含时间戳', !!testSave.timestamp);
                this.logTest('存档类型正确', testSave.type === 'manual');
                this.logTest('存档包含槽位信息', testSave.slot !== undefined);

                return testSave;
            }

            return null;

        } catch (error) {
            this.logTest('手动存档创建', false, error.message);
            return null;
        }
    },

    // 2. 测试世界快照数据完整性
    async testWorldSnapshotIntegrity(saveId) {
        console.log('\n=== 测试世界快照数据完整性 ===');

        if (!saveId) {
            this.logTest('世界快照测试', false, '没有可用的存档ID');
            return;
        }

        try {
            const saveData = await window.saveSystem.loadSave(saveId);
            const gameData = saveData.gameData;

            // 验证worldData存在
            this.logTest('包含worldData', !!gameData.worldData);

            if (gameData.worldData) {
                const worldData = gameData.worldData;

                // 验证世界状态组件
                this.logTest('包含时间数据', !!worldData.time);
                this.logTest('包含玩家数据', !!worldData.player);
                this.logTest('包含环境数据', !!worldData.environment);
                this.logTest('包含故事数据', !!worldData.story);

                // 验证引擎系统数据
                console.log('🔍 调试worldData结构:', Object.keys(worldData));

                // 深入检查 engineStates
                if (worldData.engineStates) {
                    console.log('📦 engineStates内容:', worldData.engineStates);
                    console.log('  engineStates键:', Object.keys(worldData.engineStates));
                }

                // 检查是否有引擎数据（可能在engineStates或直接在worldData下）
                const hasEngineData = worldData.engineStates || worldData.economy || worldData.relationships;
                this.logTest('包含引擎系统', !!hasEngineData);

                // 天气系统可能在environment.weather或engineStates.weather
                const hasWeather = worldData.engineStates?.weather ||
                                 worldData.environment?.weather ||
                                 worldData.weather;

                // 经济和关系直接在worldData下
                const hasEconomy = worldData.economy;
                const hasRelationships = worldData.relationships;

                // 种植系统在engineStates下
                const hasFarming = worldData.engineStates?.farming || worldData.farming;

                this.logTest('包含天气系统', !!hasWeather);
                this.logTest('包含经济系统', !!hasEconomy);
                this.logTest('包含种植系统', !!hasFarming);
                this.logTest('包含关系系统', !!hasRelationships);

                // 验证场景数据
                this.logTest('包含当前场景', !!worldData.currentSceneData);
                if (worldData.currentSceneData) {
                    this.logTest('场景包含ID', !!worldData.currentSceneData.scene?.id);
                }

                // 验证F1内容
                this.logTest('包含F1内容', !!worldData.f1Content);

                console.log('📊 世界快照内容详情:');
                console.log('  时间:', worldData.time?.day, '天', worldData.time?.hour + ':' + worldData.time?.minute);
                console.log('  玩家:', worldData.player?.name, '位置:', worldData.player?.position?.location);
                console.log('  场景:', worldData.currentSceneData?.scene?.id);
                // 计算实际的引擎系统数量
                const engineCount = ['weather', 'economy', 'farming', 'relationships']
                    .filter(key => worldData[key]).length;
                console.log('  引擎数量:', engineCount);
                console.log('  F1内容长度:', worldData.f1Content?.html?.length || 0);
            }

        } catch (error) {
            this.logTest('世界快照数据完整性', false, error.message);
        }
    },

    // 3. 对比手动存档与快速存档的数据结构
    async testDataStructureConsistency() {
        console.log('\n=== 测试数据结构一致性 ===');

        try {
            // 创建快速存档作为对比
            window.lastQuickSaveTime = 0; // 重置冷却
            await window.quickSave();

            // 等待3秒冷却时间
            console.log('⏳ 等待3秒冷却时间...');
            await new Promise(resolve => setTimeout(resolve, 3100));

            // 创建手动存档
            const originalPrompt = window.prompt;
            window.prompt = () => '对比测试';
            await window.createManualSave();
            window.prompt = originalPrompt;

            // 获取两种存档
            const quickSaves = await window.saveSystem.getSavesList('quick');
            const manualSaves = await window.saveSystem.getSavesList('manual');

            const quickSave = quickSaves[quickSaves.length - 1]; // 最新的快速存档
            const manualSave = manualSaves.find(s => s.name && s.name.includes('对比测试'));

            console.log('快速存档数量:', quickSaves.length);
            console.log('手动存档数量:', manualSaves.length);
            console.log('手动存档列表:', manualSaves.map(s => s.name));

            if (quickSave && manualSave) {
                const quickData = (await window.saveSystem.loadSave(quickSave.id)).gameData;
                const manualData = (await window.saveSystem.loadSave(manualSave.id)).gameData;

                // 对比数据结构
                this.logTest('都包含worldData', !!quickData.worldData && !!manualData.worldData);

                if (quickData.worldData && manualData.worldData) {
                    const quickKeys = Object.keys(quickData.worldData).sort();
                    const manualKeys = Object.keys(manualData.worldData).sort();

                    this.logTest('worldData结构一致',
                        JSON.stringify(quickKeys) === JSON.stringify(manualKeys));

                    // 对比引擎数量
                    // 计算引擎数量（可能在engines子对象或直接在worldData下）
                    const quickEngineCount = quickData.worldData.engines ?
                        Object.keys(quickData.worldData.engines).length :
                        ['weather', 'economy', 'farming', 'relationships'].filter(k => quickData.worldData[k]).length;

                    const manualEngineCount = manualData.worldData.engines ?
                        Object.keys(manualData.worldData.engines).length :
                        ['weather', 'economy', 'farming', 'relationships'].filter(k => manualData.worldData[k]).length;

                    const quickEngines = quickEngineCount;
                    const manualEngines = manualEngineCount;

                    this.logTest('引擎系统数量一致', quickEngines === manualEngines);

                    console.log('📊 数据结构对比:');
                    console.log('  快速存档引擎:', quickEngines);
                    console.log('  手动存档引擎:', manualEngines);
                    console.log('  快速存档worldData键:', quickKeys);
                    console.log('  手动存档worldData键:', manualKeys);
                }
            } else {
                this.logTest('获取对比存档', false, '无法获取快速存档或手动存档');
            }

        } catch (error) {
            this.logTest('数据结构一致性', false, error.message);
        }
    },

    // 4. 测试手动存档读取恢复
    async testManualSaveRestore() {
        console.log('\n=== 测试手动存档读取恢复 ===');

        // 保存原始值
        const originalHealth = window.gameState.character.health;
        const originalMood = window.gameState.character.mood;

        try {
            // 先修改一些数据

            window.gameState.character.health = 25;
            window.gameState.character.mood = 15;

            // 等待3秒冷却时间
            console.log('⏳ 等待3秒冷却时间...');
            await new Promise(resolve => setTimeout(resolve, 3100));

            // 创建手动存档
            const originalPrompt = window.prompt;
            window.prompt = () => '恢复测试';
            await window.createManualSave();
            window.prompt = originalPrompt;

            // 再次修改数据
            window.gameState.character.health = 99;
            window.gameState.character.mood = 99;

            // 找到测试存档并读取
            const saves = await window.saveSystem.getSavesList('manual');
            const testSave = saves.find(s => s.name && s.name.includes('恢复测试'));

            console.log('查找恢复测试存档，所有存档名称:', saves.map(s => s.name));
            console.log('找到的测试存档:', testSave);

            if (testSave) {
                const success = await window.loadSaveGame(testSave.id);

                this.logTest('存档读取成功', success);

                // 验证数据恢复
                const healthRestored = window.gameState.character.health === 25;
                const moodRestored = window.gameState.character.mood === 15;

                this.logTest('健康值正确恢复', healthRestored);
                this.logTest('心情值正确恢复', moodRestored);

                console.log('🔄 恢复结果:');
                console.log('  健康值:', window.gameState.character.health, '(应为25)');
                console.log('  心情值:', window.gameState.character.mood, '(应为15)');
            } else {
                this.logTest('手动存档读取恢复', false, '找不到测试存档');
            }

        } catch (error) {
            this.logTest('手动存档读取恢复', false, error.message);
        } finally {
            // 无论测试是否成功，都恢复原始值
            console.log('🔄 恢复原始数值...');
            window.gameState.character.health = originalHealth;
            window.gameState.character.mood = originalMood;

            // 触发响应式更新
            if (window.reactiveGameState) {
                window.reactiveGameState.health = originalHealth;
                window.reactiveGameState.mood = originalMood;
            }

            console.log(`✅ 已恢复: 健康=${originalHealth}, 心情=${originalMood}`);
        }
    },

    // 5. 清理测试存档
    async cleanupTestSaves() {
        console.log('\n=== 清理测试存档 ===');

        try {
            const saves = await window.saveSystem.getSavesList('manual');
            let deletedCount = 0;

            for (const save of saves) {
                if (save.name && (
                    save.name.includes('测试存档') ||
                    save.name.includes('对比测试') ||
                    save.name.includes('恢复测试')
                )) {
                    await window.saveSystem.deleteSave(save.id);
                    deletedCount++;
                }
            }

            console.log(`🗑️ 已清理 ${deletedCount} 个测试存档`);

        } catch (error) {
            console.error('❌ 清理测试存档失败:', error);
        }
    },

    // 运行完整测试
    async runFullTest() {
        console.log('🧪 开始手动存档完整测试...\n');

        this.testResults = {
            passed: 0,
            failed: 0,
            tests: []
        };

        // 运行测试
        const testSave = await this.testManualSaveCreation();
        if (testSave) {
            await this.testWorldSnapshotIntegrity(testSave.id);
        }
        await this.testDataStructureConsistency();
        await this.testManualSaveRestore();
        await this.cleanupTestSaves();

        // 输出结果
        console.log('\n' + '='.repeat(50));
        console.log('📊 手动存档测试结果:');
        console.log(`✅ 通过: ${this.testResults.passed}`);
        console.log(`❌ 失败: ${this.testResults.failed}`);
        console.log(`📝 总计: ${this.testResults.passed + this.testResults.failed}`);

        const passRate = (this.testResults.passed / (this.testResults.passed + this.testResults.failed) * 100).toFixed(1);
        console.log(`🎯 通过率: ${passRate}%`);

        if (passRate === '100.0') {
            console.log('🎉 手动存档完全正常！与快速存档功能一致！');
        } else if (passRate >= 80) {
            console.log('👍 手动存档基本正常，少数问题需要修复');
        } else {
            console.log('⚠️ 手动存档存在问题，需要进一步修复');
        }

        return this.testResults;
    }
};

// 导出到全局
window.ManualSaveTest = ManualSaveTest;

console.log('🧪 手动存档测试脚本已加载');
console.log('使用方法:');
console.log('  ManualSaveTest.runFullTest() - 运行完整测试');
console.log('  ManualSaveTest.testManualSaveCreation() - 测试创建');
console.log('  ManualSaveTest.testWorldSnapshotIntegrity(saveId) - 测试数据完整性');
console.log('  ManualSaveTest.testDataStructureConsistency() - 测试结构一致性');
console.log('  ManualSaveTest.testManualSaveRestore() - 测试读取恢复');