/**
 * AI对话快速测试脚本
 * 在控制台输入 testAI() 即可测试
 */

window.testAI = function() {
    console.log('🚀 开始AI对话测试...');

    // 检查关键元素
    const checks = [
        'aiInputArea',
        'aiInput',
        'aiSendBtn',
        'dialogueHistoryArea'
    ];

    let allGood = true;
    checks.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            console.log(`✅ ${id} 存在`);
        } else {
            console.error(`❌ ${id} 缺失`);
            allGood = false;
        }
    });

    if (!allGood) {
        console.error('❌ 元素检查失败，请刷新页面重试');
        return;
    }

    // 切换到AI模式
    if (window.f2Manager) {
        console.log('🔄 切换到AI模式...');
        window.f2Manager.switchToAIMode();

        setTimeout(() => {
            const aiInputArea = document.getElementById('aiInputArea');
            const dialogueHistoryArea = document.getElementById('dialogueHistoryArea');

            if (aiInputArea && aiInputArea.style.display !== 'none') {
                console.log('✅ AI输入区已显示');
            } else {
                console.error('❌ AI输入区未显示');
            }

            if (dialogueHistoryArea && dialogueHistoryArea.style.display !== 'none') {
                console.log('✅ 对话历史区已显示');
            } else {
                console.error('❌ 对话历史区未显示');
            }

            // 测试发送消息
            const input = document.getElementById('aiInput');
            if (input) {
                input.value = '测试消息';
                console.log('📝 发送测试消息...');
                window.f2Manager.sendAIMessage();

                setTimeout(() => {
                    const bubbles = dialogueHistoryArea?.querySelectorAll('.chat-bubble');
                    console.log(`💬 对话气泡数量: ${bubbles?.length || 0}`);

                    if (bubbles && bubbles.length > 0) {
                        console.log('✅ AI对话系统正常工作！');
                    } else {
                        console.warn('⚠️ 没有看到对话气泡，请检查');
                    }
                }, 1000);
            }
        }, 500);
    } else {
        console.error('❌ F2管理器未加载');
    }
};

console.log('💡 在控制台输入 testAI() 来测试AI对话系统');