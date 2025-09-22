/**
 * 游戏主界面初始化和事件处理
 * 处理所有UI交互事件，确保代码分离
 */

// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', function() {
    // 初始化动画效果
    if (typeof AnimationEffects !== 'undefined') {
        AnimationEffects.init();
        AnimationEffects.createGameAnimations();
    }

    // 确保F2管理器正确初始化
    if (window.f2Manager) {
        console.log('F2管理器已创建:', window.f2Manager);
        // 确保切换到场景模式
        window.f2Manager.switchToSceneMode();
    } else {
        console.warn('F2管理器未找到，可能初始化失败');
    }

    // 加载初始场景
    if (window.sceneManager && window.OpeningScenes) {
        // 使用真实的开场场景
        const openingScene = window.OpeningScenes.awakening;

        // 加载场景
        setTimeout(() => {
            sceneManager.loadScene(openingScene);
        }, 500);
    }

    // 初始化所有事件监听器
    initializeEventListeners();
});

/**
 * 初始化所有事件监听器
 */
function initializeEventListeners() {
    // 功能标签页切换事件
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            if (tabName && typeof switchTab === 'function') {
                switchTab(tabName);
            }
        });
    });

    // AI发送按钮事件
    const aiSendBtn = document.getElementById('aiSendBtn');
    if (aiSendBtn) {
        aiSendBtn.addEventListener('click', function() {
            if (typeof sendAIMessage === 'function') {
                sendAIMessage();
            }
        });
    }

    // AI输入框回车事件
    const aiInput = document.getElementById('aiInput');
    if (aiInput) {
        aiInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                if (typeof sendAIMessage === 'function') {
                    sendAIMessage();
                }
            }
        });
    }
}



/**
 * AI消息发送函数
 */
function sendAIMessage() {
    const input = document.getElementById('aiInput');
    if (input && input.value.trim()) {
        console.log('发送AI消息:', input.value);
        // 这里应该调用AI系统的相关函数
        // 暂时只是清空输入框
        input.value = '';
    }
}

// 导出函数供其他模块使用
window.sendAIMessage = sendAIMessage;