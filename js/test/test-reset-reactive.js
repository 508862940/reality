/**
 * 测试重置按钮的响应式时光倒流效果
 */

// 测试响应式重置
window.testResetReactive = function() {
    console.log('🧪 ========== 测试响应式重置系统 ==========');

    // 步骤1：检查必要的系统
    console.log('📋 检查系统状态...');
    const checks = {
        'SceneManager': !!window.sceneManager,
        'WorldState': !!window.worldState,
        'ReactiveSystem': !!window.reactiveSystem,
        'ReactiveGameState': !!window.reactiveGameState,
        'F2Manager': !!window.f2Manager
    };

    Object.entries(checks).forEach(([name, exists]) => {
        console.log(`  ${exists ? '✅' : '❌'} ${name}: ${exists ? '已加载' : '未加载'}`);
    });

    if (!checks.SceneManager || !checks.WorldState) {
        console.error('❌ 缺少必要的系统，无法测试');
        return;
    }

    // 步骤2：显示当前状态
    console.log('\n📊 当前游戏状态:');
    if (window.gameState && window.gameState.character) {
        const char = window.gameState.character;
        console.log(`  体力: ${char.health}`);
        console.log(`  心情: ${char.mood}`);
        console.log(`  金钱: ${char.money}`);
        console.log(`  精力: ${char.energy}`);
        console.log(`  位置: ${char.location}`);
    }

    // 步骤3：修改一些数据
    console.log('\n🔧 修改游戏数据进行测试...');
    if (window.reactiveGameState) {
        console.log('  使用响应式系统修改...');
        window.reactiveGameState.health = 50;
        window.reactiveGameState.mood = 30;
        window.reactiveGameState.money = 200;
        console.log('  ✅ 数据已修改（UI应该自动更新）');
    } else if (window.gameState && window.gameState.character) {
        console.log('  使用普通方式修改...');
        window.gameState.character.health = 50;
        window.gameState.character.mood = 30;
        window.gameState.character.money = 200;
        console.log('  ✅ 数据已修改');
    }

    // 步骤4：检查重置能力
    console.log('\n🔄 检查重置能力:');
    console.log(`  可以重置: ${window.sceneManager.canResetToLastStep}`);
    console.log(`  有快照: ${!!window.sceneManager.lastWorldSnapshot}`);

    // 步骤5：提示用户操作
    console.log('\n📝 测试步骤:');
    console.log('  1. 点击F2区的继续按钮（让时间流动）');
    console.log('  2. 重置按钮应该变为黄色可用状态');
    console.log('  3. 点击重置按钮');
    console.log('  4. 观察UI是否自动恢复到之前的状态');
    console.log('\n💡 提示: 重置后所有数值应该自动恢复，不需要刷新页面');

    return true;
};

// 手动触发一次继续（模拟用户操作）
window.testProceedAndReset = function() {
    console.log('🎮 模拟继续和重置流程...');

    // 步骤1：保存初始状态
    const initialStats = window.gameState ? {
        health: window.gameState.character.health,
        mood: window.gameState.character.mood,
        money: window.gameState.character.money
    } : null;

    console.log('📸 初始状态:', initialStats);

    // 步骤2：模拟点击继续
    console.log('\n▶️ 模拟点击继续按钮...');
    if (window.sceneManager && window.sceneManager.proceedToNext) {
        // 如果没有选择，创建一个假选择
        if (!window.sceneManager.currentChoice) {
            window.sceneManager.currentChoice = { text: '测试选择' };
        }
        window.sceneManager.proceedToNext();
        console.log('✅ 继续成功，重置能力应该已刷新');
    }

    // 步骤3：修改数据
    setTimeout(() => {
        console.log('\n🔧 修改数据...');
        if (window.reactiveGameState) {
            window.reactiveGameState.health = 25;
            window.reactiveGameState.mood = 10;
            window.reactiveGameState.money = 999;
        }
        console.log('✅ 数据已修改为: health=25, mood=10, money=999');

        // 步骤4：执行重置
        setTimeout(() => {
            console.log('\n↩️ 执行重置...');
            if (window.sceneManager.canResetToLastStep) {
                window.sceneManager.resetScene();
                console.log('✅ 重置完成！');

                // 检查结果
                setTimeout(() => {
                    const finalStats = window.gameState ? {
                        health: window.gameState.character.health,
                        mood: window.gameState.character.mood,
                        money: window.gameState.character.money
                    } : null;

                    console.log('\n📊 最终状态:', finalStats);
                    console.log('🎯 数据应该恢复到初始值');

                    // 验证
                    if (initialStats && finalStats) {
                        const isRestored =
                            finalStats.health === initialStats.health &&
                            finalStats.mood === initialStats.mood &&
                            finalStats.money === initialStats.money;

                        if (isRestored) {
                            console.log('✅ 测试通过！时光倒流成功！');
                        } else {
                            console.log('❌ 测试失败：数据未正确恢复');
                        }
                    }
                }, 500);
            } else {
                console.log('❌ 无法重置：需要先点击继续按钮');
            }
        }, 1000);
    }, 1000);
};

// 添加测试按钮到页面
window.addResetTestButton = function() {
    const testBtn = document.createElement('button');
    testBtn.textContent = '测试重置';
    testBtn.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 10px 20px;
        background: #8b92f6;
        color: white;
        border: none;
        border-radius: 20px;
        cursor: pointer;
        z-index: 9999;
    `;
    testBtn.onclick = window.testProceedAndReset;
    document.body.appendChild(testBtn);
    console.log('✅ 测试按钮已添加到右下角');
};

console.log('💾 重置测试工具已加载');
console.log('📝 可用命令:');
console.log('  testResetReactive() - 检查系统状态');
console.log('  testProceedAndReset() - 自动测试重置流程');
console.log('  addResetTestButton() - 添加测试按钮');