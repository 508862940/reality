/**
 * AI对话界面测试工具
 * 用于测试F1/F2独立切换的AI对话系统
 */

// 测试方法1：直接切换到AI模式
function testAIMode() {
    console.log('🔧 测试：切换到AI对话模式...');

    if (window.f2Manager) {
        // 切换到AI模式
        window.f2Manager.switchToAIMode();

        // 添加一些测试消息
        setTimeout(() => {
            window.f2Manager.addMessageToHistory('你好！我是Zero，有什么可以帮助你的吗？', 'npc');
        }, 500);

        console.log('✅ 已切换到AI对话模式');
        console.log('📝 提示：');
        console.log('  - F1区域应显示对话历史');
        console.log('  - F2区域应显示输入框');
        console.log('  - 输入消息并发送可看到对话气泡');
    } else {
        console.error('❌ f2Manager未加载');
    }
}

// 测试方法2：添加测试对话
function testAddDialogue() {
    console.log('🔧 测试：添加对话消息...');

    if (window.f2Manager && window.f2Manager.currentMode === 'ai') {
        // 添加一组测试对话
        const dialogues = [
            { text: '早上好，今天天气真不错', sender: 'player' },
            { text: '是啊，阳光很温暖呢。你有什么计划吗？', sender: 'npc' },
            { text: '*看了看窗外*', sender: 'player', isAction: true },
            { text: '我想去公园散步', sender: 'player' },
            { text: '听起来不错！我可以陪你一起去', sender: 'npc' }
        ];

        let delay = 0;
        dialogues.forEach(dialogue => {
            setTimeout(() => {
                if (dialogue.isAction) {
                    // 切换到动作模式
                    const modeToggle = document.getElementById('aiModeToggle');
                    if (modeToggle) {
                        modeToggle.classList.add('action-mode');
                    }
                    window.f2Manager.addMessageToHistory(dialogue.text, dialogue.sender);
                    // 切回对话模式
                    if (modeToggle) {
                        modeToggle.classList.remove('action-mode');
                    }
                } else {
                    window.f2Manager.addMessageToHistory(dialogue.text, dialogue.sender);
                }
            }, delay);
            delay += 800;
        });

        console.log('✅ 正在添加测试对话...');
    } else {
        console.error('❌ 请先切换到AI模式：testAIMode()');
    }
}

// 测试方法3：切回场景模式
function testSceneMode() {
    console.log('🔧 测试：切回场景模式...');

    if (window.f2Manager) {
        window.f2Manager.switchToSceneMode();
        console.log('✅ 已切回场景模式');
    } else {
        console.error('❌ f2Manager未加载');
    }
}

// 测试方法4：完整流程测试
function testFullFlow() {
    console.log('🎬 开始完整流程测试...');

    // 1. 切换到AI模式
    testAIMode();

    // 2. 添加对话
    setTimeout(() => {
        testAddDialogue();
    }, 1000);

    // 3. 5秒后切回场景模式
    setTimeout(() => {
        console.log('⏰ 5秒后将切回场景模式...');
    }, 5000);

    setTimeout(() => {
        testSceneMode();
        console.log('✅ 完整流程测试完成');
    }, 10000);
}

// 测试方法5：通过菜单切换（模拟用户操作）
function testMenuToggle() {
    console.log('🔧 测试：通过菜单切换AI模式...');

    // 打开更多菜单
    const moreBtn = document.getElementById('moreBtn');
    if (moreBtn) {
        moreBtn.click();

        // 点击AI对话模式选项
        setTimeout(() => {
            const aiOption = document.querySelector('[data-action="toggleAIMode"]');
            if (aiOption) {
                aiOption.click();
                console.log('✅ 已通过菜单切换');
            } else {
                console.error('❌ 找不到AI模式选项');
            }
        }, 100);
    } else {
        console.error('❌ 找不到更多按钮');
    }
}

// 添加快捷键测试
document.addEventListener('keydown', (e) => {
    // Alt + A: 切换AI模式
    if (e.altKey && e.key === 'a') {
        e.preventDefault();
        console.log('🎹 快捷键：Alt+A 切换AI模式');
        if (window.f2Manager) {
            if (window.f2Manager.currentMode === 'scene') {
                window.f2Manager.switchToAIMode();
            } else {
                window.f2Manager.switchToSceneMode();
            }
        }
    }

    // Alt + T: 添加测试对话
    if (e.altKey && e.key === 't') {
        e.preventDefault();
        console.log('🎹 快捷键：Alt+T 添加测试对话');
        testAddDialogue();
    }
});

// 在控制台显示帮助信息
console.log('%c🎮 AI对话界面测试工具已加载', 'color: #8b5cf6; font-size: 16px; font-weight: bold');
console.log('%c可用的测试命令：', 'color: #f093fb; font-weight: bold');
console.log('  testAIMode()     - 切换到AI对话模式');
console.log('  testAddDialogue() - 添加测试对话');
console.log('  testSceneMode()  - 切回场景模式');
console.log('  testFullFlow()   - 完整流程测试');
console.log('  testMenuToggle() - 通过菜单切换');
console.log('');
console.log('%c快捷键：', 'color: #f093fb; font-weight: bold');
console.log('  Alt+A - 快速切换AI/场景模式');
console.log('  Alt+T - 添加测试对话');
console.log('');
console.log('💡 提示：先运行 testAIMode() 开始测试');

// 导出到全局
window.testAIMode = testAIMode;
window.testAddDialogue = testAddDialogue;
window.testSceneMode = testSceneMode;
window.testFullFlow = testFullFlow;
window.testMenuToggle = testMenuToggle;

// 添加浮动测试按钮（开发用）
function addTestButton() {
    const testBtn = document.createElement('button');
    testBtn.id = 'aiTestBtn';
    testBtn.innerHTML = '🤖 测试AI对话';
    testBtn.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        padding: 10px 20px;
        background: linear-gradient(135deg, #8b5cf6, #f093fb);
        color: white;
        border: none;
        border-radius: 25px;
        font-size: 14px;
        cursor: pointer;
        z-index: 9999;
        box-shadow: 0 4px 15px rgba(139, 92, 246, 0.3);
        transition: all 0.3s;
    `;

    testBtn.onmouseover = () => {
        testBtn.style.transform = 'scale(1.05)';
        testBtn.style.boxShadow = '0 6px 20px rgba(139, 92, 246, 0.4)';
    };

    testBtn.onmouseout = () => {
        testBtn.style.transform = 'scale(1)';
        testBtn.style.boxShadow = '0 4px 15px rgba(139, 92, 246, 0.3)';
    };

    testBtn.onclick = () => {
        if (window.f2Manager && window.f2Manager.currentMode === 'ai') {
            // 如果已在AI模式，添加测试对话
            testAddDialogue();
        } else {
            // 否则先切换到AI模式
            testAIMode();
            setTimeout(() => {
                testAddDialogue();
            }, 1000);
        }
    };

    document.body.appendChild(testBtn);
    console.log('✅ 测试按钮已添加到右上角');
}

// 页面加载后自动添加测试按钮
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addTestButton);
} else {
    addTestButton();
}