/**
 * AI对话系统最终修复测试
 */

console.log('🎯 AI对话系统最终测试开始');

// 测试F2管理器切换到AI模式
function testAISwitch() {
    console.log('\n=== 测试AI模式切换 ===');

    if (!window.f2Manager) {
        console.error('❌ F2管理器不存在');
        return false;
    }

    console.log('切换前模式:', window.f2Manager.currentMode);

    // 切换到AI模式
    window.f2Manager.switchToAIMode();

    // 检查切换结果
    setTimeout(() => {
        console.log('切换后模式:', window.f2Manager.currentMode);

        // 检查F1区域
        const storyArea = document.getElementById('storyArea');
        const dialogueHistoryArea = document.getElementById('dialogueHistoryArea');

        console.log('F1区域状态:');
        console.log('- storyArea显示:', storyArea?.style.display || 'block');
        console.log('- dialogueHistoryArea显示:', dialogueHistoryArea?.style.display || 'none');

        // 检查F2区域
        const sceneControlArea = document.getElementById('sceneControlArea');
        const aiInputArea = document.getElementById('aiInputArea');

        console.log('F2区域状态:');
        console.log('- sceneControlArea显示:', sceneControlArea?.style.display || 'flex');
        console.log('- aiInputArea显示:', aiInputArea?.style.display || 'none');

        // 测试发送消息
        const aiInput = document.getElementById('aiInput');
        if (aiInput) {
            console.log('✅ AI输入框存在');

            // 模拟输入和发送
            aiInput.value = '你好，测试消息';
            console.log('发送测试消息:', aiInput.value);

            // 触发发送
            window.f2Manager.sendAIMessage();

            // 检查历史区
            setTimeout(() => {
                const bubbles = dialogueHistoryArea?.querySelectorAll('.chat-bubble');
                console.log('对话气泡数量:', bubbles?.length || 0);

                // 切换回场景模式
                console.log('\n切换回场景模式...');
                window.f2Manager.switchToSceneMode();

                setTimeout(() => {
                    console.log('恢复后模式:', window.f2Manager.currentMode);
                    console.log('✅ 测试完成');
                }, 500);
            }, 1500);
        } else {
            console.error('❌ AI输入框不存在');
        }
    }, 500);
}

// 快速诊断
function quickDiagnose() {
    console.log('\n=== 快速诊断 ===');

    const checks = [
        { id: 'storyArea', name: 'F1故事区' },
        { id: 'dialogueHistoryArea', name: 'F1对话历史区' },
        { id: 'sceneControlArea', name: 'F2场景控制区' },
        { id: 'aiInputArea', name: 'F2 AI输入区' },
        { id: 'aiInput', name: 'AI输入框' },
        { id: 'aiSendBtn', name: 'AI发送按钮' },
        { id: 'aiModeIndicator', name: 'AI模式指示器' }
    ];

    let allPassed = true;
    checks.forEach(check => {
        const element = document.getElementById(check.id);
        if (element) {
            console.log(`✅ ${check.name} 存在`);
        } else {
            console.error(`❌ ${check.name} 不存在`);
            allPassed = false;
        }
    });

    return allPassed;
}

// 运行测试
function runTest() {
    if (quickDiagnose()) {
        console.log('\n诊断通过，开始功能测试...');
        testAISwitch();
    } else {
        console.error('\n诊断失败，请检查元素');
    }
}

// 等待页面加载
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runTest);
} else {
    setTimeout(runTest, 1000);
}

// 导出给控制台使用
window.testAIFinal = {
    diagnose: quickDiagnose,
    testSwitch: testAISwitch,
    runAll: runTest
};

console.log('💡 使用 testAIFinal.runAll() 运行完整测试');