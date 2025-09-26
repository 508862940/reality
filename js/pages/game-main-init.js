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

    // 初始化AI对话管理器
    if (typeof AIDialogueManager !== 'undefined') {
        window.aiDialogueManager = new AIDialogueManager();
        console.log('🤖 AI对话管理器已初始化');
    }

    // 加载初始场景 - 只有在没有恢复场景的情况下才加载
    if (window.sceneManager && window.OpeningScenes) {
        setTimeout(() => {
            // 检查是否已经恢复了游戏（从存档）
            if (window.gameState && window.gameState.restored) {
                console.log('📖 游戏已从存档恢复，跳过初始场景加载');

                // 如果worldState有待恢复的场景，恢复它
                if (window.worldState && window.worldState.pendingSceneData) {
                    const sceneData = window.worldState.pendingSceneData;
                    console.log('📖 恢复待处理的场景:', sceneData.scene?.id);

                    window.sceneManager.currentScene = sceneData.scene;
                    window.sceneManager.currentTextIndex = sceneData.currentTextIndex || 0;
                    window.sceneManager.isInChoice = false;  // 总是重置为未选择状态

                    // 重置预览相关状态，确保选项可以正常点击
                    window.sceneManager.currentChoice = null;
                    window.sceneManager.previewChoice = null;
                    window.sceneManager.isPreviewMode = false;

                    // 不调用loadScene，因为会覆盖F1内容
                    // F1内容会在下面从worldState恢复

                    // 清除待处理数据
                    window.worldState.pendingSceneData = null;
                }

                // F1内容已在world-state.js的loadFullState中恢复，这里只需要重新绑定事件
                const storyArea = document.getElementById('storyArea');
                if (storyArea) {
                    console.log('📖 重新绑定F1区域选项事件');
                    // 重新绑定选项事件（内容已在world-state中恢复，不要重复设置innerHTML）
                    if (window.gameBootstrap) {
                        window.gameBootstrap.rebindChoiceEvents();
                    }
                }
                return;
            }

            // 检查是否已经有场景（从存档恢复的）
            if (!window.sceneManager.currentScene || window.sceneManager.currentScene.id === 'awakening_placeholder') {
                console.log('📚 没有恢复的场景，加载初始场景');
                const openingScene = window.OpeningScenes.awakening;
                sceneManager.loadScene(openingScene);
            } else {
                console.log('📖 已有恢复的场景:', window.sceneManager.currentScene.id, '，跳过初始场景加载');
            }
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