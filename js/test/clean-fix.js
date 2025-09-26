/**
 * 清理修复脚本 - 解决F1区内容混乱问题
 */

(function() {
    'use strict';

    console.log('🧹 开始清理F1区内容混乱...');

    // 清理函数
    function cleanF1Content() {
        const mode = window.f2Manager?.currentMode || 'scene';

        console.log('当前模式:', mode);

        if (mode === 'scene') {
            // 场景模式：只显示剧情，隐藏对话
            const storyArea = document.getElementById('storyArea');
            const dialogueHistoryArea = document.getElementById('dialogueHistoryArea');

            if (storyArea) {
                // 移除任何测试消息（统一使用chat-bubble类）
                const testMessages = storyArea.querySelectorAll('.chat-bubble, .dialogue-message, .typing-indicator');
                testMessages.forEach(msg => {
                    console.log('移除测试消息:', msg.textContent);
                    msg.remove();
                });

                // 确保故事区显示
                storyArea.style.display = 'block';
                console.log('✅ 故事区已显示');
            }

            if (dialogueHistoryArea) {
                // 清空并隐藏对话历史
                dialogueHistoryArea.innerHTML = '';
                dialogueHistoryArea.style.display = 'none';
                console.log('✅ 对话历史已隐藏');
            }

        } else if (mode === 'ai') {
            // AI模式：只显示对话，隐藏剧情
            const storyArea = document.getElementById('storyArea');
            const dialogueHistoryArea = document.getElementById('dialogueHistoryArea');

            if (storyArea) {
                storyArea.style.display = 'none';
                console.log('✅ 故事区已隐藏');
            }

            if (dialogueHistoryArea) {
                dialogueHistoryArea.style.display = 'flex';
                console.log('✅ 对话历史已显示');
            }
        }
    }

    // 重置到干净的场景模式
    function resetToCleanScene() {
        console.log('🔄 重置到干净的场景模式...');

        // 强制切换到场景模式
        if (window.f2Manager) {
            window.f2Manager.switchToSceneMode();
        }

        // 清理内容
        setTimeout(() => {
            cleanF1Content();
            console.log('✅ 已重置到干净的场景模式');
        }, 100);
    }

    // 监听模式切换
    function watchModeSwitch() {
        if (window.f2Manager) {
            // 重写切换方法，确保内容正确切换
            const originalSwitchToScene = window.f2Manager.switchToSceneMode;
            const originalSwitchToAI = window.f2Manager.switchToAIMode;

            window.f2Manager.switchToSceneMode = function() {
                console.log('📝 切换到场景模式');
                originalSwitchToScene.call(this);
                setTimeout(cleanF1Content, 50);
            };

            window.f2Manager.switchToAIMode = function() {
                console.log('🤖 切换到AI模式');
                originalSwitchToAI.call(this);
                setTimeout(cleanF1Content, 50);
            };

            console.log('✅ 已安装模式切换监听器');
        }
    }

    // 导出功能
    window.cleanFix = {
        clean: cleanF1Content,
        reset: resetToCleanScene,
        watch: watchModeSwitch
    };

    // 页面加载后自动执行
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => {
                resetToCleanScene();
                watchModeSwitch();
            }, 500);
        });
    } else {
        setTimeout(() => {
            resetToCleanScene();
            watchModeSwitch();
        }, 500);
    }

    console.log('💡 清理工具已加载');
    console.log('命令:');
    console.log('  cleanFix.clean() - 清理当前模式的内容');
    console.log('  cleanFix.reset() - 重置到干净的场景模式');
    console.log('  cleanFix.watch() - 安装模式切换监听器');
})();