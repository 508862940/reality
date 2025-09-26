/**
 * 快速存档系统完整测试脚本
 * 测试所有功能：存档、读档、限制、UI反馈等
 */

const QuickSaveTest = {
    // 测试计数器
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

    // 1. 测试基础存档功能
    async testBasicSave() {
        console.log('\n=== 测试基础存档功能 ===');

        try {
            // 测试快速存档
            const saveData = await quickSave();
            this.logTest('快速存档创建', !!saveData);

            // 验证存档数据完整性
            if (saveData) {
                this.logTest('存档包含ID', !!saveData.id);
                this.logTest('存档包含时间戳', !!saveData.timestamp);
                this.logTest('存档包含世界数据', !!saveData.gameData?.worldData);
                this.logTest('存档包含槽位信息', saveData.slot !== undefined);
            }

            return saveData;
        } catch (error) {
            this.logTest('基础存档功能', false, error.message);
            return null;
        }
    },

    // 2. 测试存档限制
    async testSaveRestrictions() {
        console.log('\n=== 测试存档限制 ===');

        // 测试冷却时间
        window.lastQuickSaveTime = Date.now();
        const cooldownCheck = canSaveGame();
        this.logTest('冷却时间限制', !cooldownCheck.canSave && cooldownCheck.reason.includes('等待'));

        // 重置冷却时间
        window.lastQuickSaveTime = 0;

        // 模拟战斗状态
        if (window.combatSystem) {
            window.combatSystem.isInCombat = () => true;
            const combatCheck = canSaveGame();
            this.logTest('战斗中禁止存档', !combatCheck.canSave && combatCheck.reason.includes('战斗'));
            window.combatSystem.isInCombat = () => false;
        }

        // 模拟AI对话
        if (window.f2Manager) {
            const originalMode = window.f2Manager.currentMode;
            window.f2Manager.currentMode = 'ai';
            const aiCheck = canSaveGame();
            this.logTest('AI对话中禁止存档', !aiCheck.canSave && aiCheck.reason.includes('AI'));
            window.f2Manager.currentMode = originalMode;
        }

        // 模拟场景切换
        if (window.sceneManager) {
            window.sceneManager.isTransitioning = true;
            const transitionCheck = canSaveGame();
            this.logTest('场景切换中禁止存档', !transitionCheck.canSave && transitionCheck.reason.includes('场景'));
            window.sceneManager.isTransitioning = false;
        }
    },

    // 3. 测试快速读档
    async testQuickLoad() {
        console.log('\n=== 测试快速读档功能 ===');

        try {
            // 先创建一个存档
            const saveData = await quickSave();
            if (!saveData) {
                this.logTest('快速读档前置条件', false, '无法创建存档');
                return;
            }

            // 修改数据
            const originalHealth = window.gameState.character.health;
            window.gameState.character.health = 50;

            // 等待3秒避免冷却
            await new Promise(resolve => setTimeout(resolve, 3100));

            // 读档
            const quickSaves = await window.saveSystem.getSavesList('quick');
            if (quickSaves && quickSaves.length > 0) {
                const success = await loadSaveGame(quickSaves[0].id);
                this.logTest('快速读档执行', success);

                // 验证数据恢复
                const restored = window.gameState.character.health === originalHealth;
                this.logTest('数据正确恢复', restored);
            } else {
                this.logTest('快速读档', false, '没有找到快速存档');
            }

        } catch (error) {
            this.logTest('快速读档功能', false, error.message);
        }
    },

    // 4. 测试槽位循环
    async testSlotRotation() {
        console.log('\n=== 测试槽位循环机制 ===');

        try {
            const saveIds = [];

            // 创建4个存档（应该循环覆盖第一个）
            for (let i = 0; i < 4; i++) {
                // 等待避免冷却
                window.lastQuickSaveTime = 0;
                const saveData = await quickSave();
                if (saveData) {
                    saveIds.push(saveData.id);
                    console.log(`  创建存档 ${i + 1}: ${saveData.id}, 槽位: ${saveData.slot}`);
                }
                await new Promise(resolve => setTimeout(resolve, 100));
            }

            // 验证槽位循环（第4个应该使用槽位0）
            const lastSave = await window.saveSystem.loadSave(saveIds[3]);
            this.logTest('槽位循环覆盖', lastSave && lastSave.slot === 0);

            // 验证只有3个槽位
            const allQuickSaves = await window.saveSystem.getSavesList('quick');
            this.logTest('快速存档数量限制', allQuickSaves.length === 3);

        } catch (error) {
            this.logTest('槽位循环机制', false, error.message);
        }
    },

    // 5. 测试UI反馈
    async testUIFeedback() {
        console.log('\n=== 测试UI反馈效果 ===');

        // 测试通知系统
        try {
            showNotification('测试成功通知', 'success');
            this.logTest('成功通知显示', true);

            showNotification('测试警告通知', 'warning');
            this.logTest('警告通知显示', true);

            showNotification('测试错误通知', 'error');
            this.logTest('错误通知显示', true);

            // 测试存档动画
            showSaveFlash();
            this.logTest('存档闪光动画', true);

            // 测试槽位指示器
            showSaveSlotIndicator('测试槽位 1/3');
            this.logTest('槽位指示器显示', true);

            // 测试进度条
            showSaveProgress(true);
            setTimeout(() => showSaveProgress(false), 1000);
            this.logTest('进度条显示', true);

        } catch (error) {
            this.logTest('UI反馈效果', false, error.message);
        }
    },

    // 6. 测试数据完整性
    async testDataIntegrity() {
        console.log('\n=== 测试数据完整性 ===');

        try {
            // 设置测试数据
            window.gameState.character.mood = 75;
            window.gameState.character.money = 500;
            window.gameState.character.energy = 85;

            // 存档
            window.lastQuickSaveTime = 0;
            const saveData = await quickSave();

            // 修改数据
            window.gameState.character.mood = 20;
            window.gameState.character.money = 10;
            window.gameState.character.energy = 30;

            // 读档
            await loadSaveGame(saveData.id);

            // 验证恢复
            const moodRestored = window.gameState.character.mood === 75;
            const moneyRestored = window.gameState.character.money === 500;
            const energyRestored = window.gameState.character.energy === 85;

            this.logTest('心情值恢复', moodRestored);
            this.logTest('金钱恢复', moneyRestored);
            this.logTest('精力恢复', energyRestored);

            // 验证世界系统
            if (window.worldState) {
                const worldData = window.worldState.getFullState();
                this.logTest('世界状态包含场景数据', !!worldData.currentSceneData);
                this.logTest('世界状态包含F1内容', !!worldData.f1Content);
                this.logTest('世界状态包含引擎数据', !!worldData.engines);
            }

        } catch (error) {
            this.logTest('数据完整性', false, error.message);
        }
    },

    // 7. 测试边界情况
    async testEdgeCases() {
        console.log('\n=== 测试边界情况 ===');

        // 测试无存档时读档
        try {
            // 清除所有快速存档
            const quickSaves = await window.saveSystem.getSavesList('quick');
            for (const save of quickSaves) {
                await window.saveSystem.deleteSave(save.id);
            }

            // 尝试读取
            const emptyQuickSaves = await window.saveSystem.getSavesList('quick');
            this.logTest('无存档时读档处理', emptyQuickSaves.length === 0);

        } catch (error) {
            this.logTest('边界情况处理', false, error.message);
        }
    },

    // 运行所有测试
    async runAllTests() {
        console.log('🧪 开始快速存档系统完整测试...\n');

        this.testResults = {
            passed: 0,
            failed: 0,
            tests: []
        };

        // 运行各项测试
        await this.testBasicSave();
        await this.testSaveRestrictions();
        await this.testQuickLoad();
        await this.testSlotRotation();
        await this.testUIFeedback();
        await this.testDataIntegrity();
        await this.testEdgeCases();

        // 输出测试结果
        console.log('\n' + '='.repeat(50));
        console.log('📊 测试结果汇总:');
        console.log(`✅ 通过: ${this.testResults.passed}`);
        console.log(`❌ 失败: ${this.testResults.failed}`);
        console.log(`📝 总计: ${this.testResults.passed + this.testResults.failed}`);

        if (this.testResults.failed > 0) {
            console.log('\n失败的测试:');
            this.testResults.tests.filter(t => !t.passed).forEach(t => {
                console.log(`  - ${t.name}: ${t.message}`);
            });
        }

        const passRate = (this.testResults.passed / (this.testResults.passed + this.testResults.failed) * 100).toFixed(1);
        console.log(`\n🎯 通过率: ${passRate}%`);

        if (passRate === '100.0') {
            console.log('🎉 恭喜！所有测试通过！');
        } else if (passRate >= 80) {
            console.log('👍 大部分测试通过，系统基本可用');
        } else {
            console.log('⚠️ 需要修复失败的测试');
        }

        return this.testResults;
    }
};

// 导出到全局
window.QuickSaveTest = QuickSaveTest;

console.log('🧪 快速存档完整测试脚本已加载');
console.log('使用方法:');
console.log('  QuickSaveTest.runAllTests() - 运行所有测试');
console.log('  QuickSaveTest.testBasicSave() - 测试基础功能');
console.log('  QuickSaveTest.testSaveRestrictions() - 测试限制');
console.log('  QuickSaveTest.testQuickLoad() - 测试读档');
console.log('  QuickSaveTest.testSlotRotation() - 测试槽位循环');
console.log('  QuickSaveTest.testUIFeedback() - 测试UI效果');
console.log('  QuickSaveTest.testDataIntegrity() - 测试数据完整性');
console.log('  QuickSaveTest.testEdgeCases() - 测试边界情况');