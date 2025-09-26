/**
 * AI对话系统功能检测
 */

console.log('🧪 AI对话系统检测开始');

// 测试1：检查F2管理器是否存在
function testF2Manager() {
    console.log('\n=== 测试1：F2管理器 ===');

    if (window.f2Manager) {
        console.log('✅ F2管理器已加载');
        console.log('当前模式:', window.f2Manager.currentMode);

        // 检查关键方法
        const methods = ['switchToAIMode', 'switchToSceneMode', 'createAIInputArea'];
        methods.forEach(method => {
            if (typeof window.f2Manager[method] === 'function') {
                console.log(`✅ 方法 ${method} 存在`);
            } else {
                console.error(`❌ 方法 ${method} 不存在`);
            }
        });
    } else {
        console.error('❌ F2管理器未加载');
    }
}

// 测试2：检查AI对话管理器
function testAIDialogueManager() {
    console.log('\n=== 测试2：AI对话管理器 ===');

    if (window.aiDialogueManager) {
        console.log('✅ AI对话管理器已加载');
    } else {
        console.error('❌ AI对话管理器未加载（可能被注释掉了）');
    }
}

// 测试3：检查UI元素
function testUIElements() {
    console.log('\n=== 测试3：UI元素检查 ===');

    const elements = {
        'storyArea': 'F1剧情区',
        'sceneControlArea': 'F2场景控制区',
        'aiInputArea': 'AI输入区',
        'dialogueHistoryArea': '对话历史区'
    };

    Object.entries(elements).forEach(([id, name]) => {
        const element = document.getElementById(id);
        if (element) {
            console.log(`✅ ${name} (#${id}) 存在`);
            console.log(`   可见性: ${element.style.display || '显示'}`);
        } else {
            console.warn(`⚠️ ${name} (#${id}) 不存在`);
        }
    });
}

// 测试4：尝试切换到AI模式
function testSwitchToAIMode() {
    console.log('\n=== 测试4：切换到AI模式 ===');

    if (!window.f2Manager) {
        console.error('❌ F2管理器不存在，无法测试');
        return;
    }

    try {
        console.log('尝试切换到AI模式...');
        window.f2Manager.switchToAIMode();

        // 检查切换后的状态
        setTimeout(() => {
            console.log('切换后模式:', window.f2Manager.currentMode);

            // 检查AI输入区是否显示
            const aiInputArea = document.getElementById('aiInputArea');
            if (aiInputArea && aiInputArea.style.display !== 'none') {
                console.log('✅ AI输入区已显示');

                // 检查输入框
                const input = document.getElementById('aiInput');
                if (input) {
                    console.log('✅ AI输入框存在');
                } else {
                    console.error('❌ AI输入框不存在');
                }
            } else {
                console.error('❌ AI输入区未显示或不存在');
            }

            // 切换回场景模式
            console.log('切换回场景模式...');
            window.f2Manager.switchToSceneMode();
        }, 500);
    } catch (error) {
        console.error('❌ 切换失败:', error);
    }
}

// 测试5：检查对话历史显示
function testDialogueHistory() {
    console.log('\n=== 测试5：对话历史显示 ===');

    const historyArea = document.getElementById('dialogueHistoryArea');
    if (historyArea) {
        console.log('✅ 对话历史区域存在');
    } else {
        console.error('❌ 对话历史区域不存在');
        console.log('需要创建dialogueHistoryArea元素来显示对话历史');
    }
}

// 运行所有测试
function runAllTests() {
    console.log('========== AI对话系统测试 ==========');

    testF2Manager();
    testAIDialogueManager();
    testUIElements();
    testSwitchToAIMode();
    testDialogueHistory();

    console.log('\n========== 测试完成 ==========');
    console.log('\n问题汇总：');
    console.log('1. AI对话管理器脚本被注释，需要启用');
    console.log('2. 缺少dialogueHistoryArea元素');
    console.log('3. AI模式下没有对话历史显示区域');
    console.log('4. F1区和F2区的AI模式切换不完整');
}

// 等待页面加载完成后运行测试
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runAllTests);
} else {
    setTimeout(runAllTests, 1000);
}

// 导出测试函数供手动调用
window.testAIDialogue = {
    testF2Manager,
    testAIDialogueManager,
    testUIElements,
    testSwitchToAIMode,
    testDialogueHistory,
    runAllTests
};

console.log('💡 可以手动调用 testAIDialogue.runAllTests() 运行测试');