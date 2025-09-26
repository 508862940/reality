/**
 * 简单可靠的存档系统
 * 直接保存和恢复整个游戏状态
 */

class SimpleSave {
    constructor() {
        this.SAVE_KEY = 'yoyo_game_auto_save';
    }

    /**
     * 保存当前游戏状态到localStorage
     */
    save() {
        try {
            // 收集所有需要保存的数据
            const saveData = {
                timestamp: Date.now(),

                // 1. 场景数据（最重要！）
                scene: null,
                sceneTextIndex: 0,

                // 2. 角色数据
                character: {
                    name: '未命名',
                    health: 100,
                    mood: 50,
                    money: 100,
                    energy: 80,
                    spirit: 60,
                    location: 'awakening_room'
                },

                // 3. 游戏时间
                gameTime: {
                    day: 1,
                    hour: 7,
                    minute: 30,
                    weekday: 1
                },

                // 4. F1区域HTML内容
                f1Content: ''
            };

            // 获取当前场景
            if (window.sceneManager && window.sceneManager.currentScene) {
                saveData.scene = JSON.parse(JSON.stringify(window.sceneManager.currentScene));
                saveData.sceneTextIndex = window.sceneManager.currentTextIndex || 0;
                console.log('💾 保存场景:', saveData.scene.id);
            }

            // 获取角色数据
            if (window.gameState && window.gameState.character) {
                saveData.character = JSON.parse(JSON.stringify(window.gameState.character));
            }

            // 获取游戏时间
            if (window.gameState && window.gameState.gameTime) {
                saveData.gameTime = JSON.parse(JSON.stringify(window.gameState.gameTime));
            }

            // 保存F1区域内容
            const storyText = document.getElementById('storyText');
            if (storyText) {
                saveData.f1Content = storyText.innerHTML;
            }

            // 保存到localStorage
            localStorage.setItem(this.SAVE_KEY, JSON.stringify(saveData));
            console.log('✅ 游戏已自动保存');

            return true;
        } catch (error) {
            console.error('❌ 保存失败:', error);
            return false;
        }
    }

    /**
     * 从localStorage加载游戏状态
     */
    load() {
        try {
            const savedStr = localStorage.getItem(this.SAVE_KEY);
            if (!savedStr) {
                console.log('📭 没有找到存档');
                return null;
            }

            const saveData = JSON.parse(savedStr);
            console.log('📂 找到存档，时间:', new Date(saveData.timestamp).toLocaleString());

            // 恢复gameState
            if (!window.gameState) {
                window.gameState = {};
            }
            window.gameState.character = saveData.character;
            window.gameState.gameTime = saveData.gameTime;

            // 恢复场景（等sceneManager初始化后）
            if (saveData.scene) {
                console.log('📖 准备恢复场景:', saveData.scene.id);

                // 保存场景数据，等待恢复
                this.pendingScene = saveData.scene;
                this.pendingTextIndex = saveData.sceneTextIndex;
                this.pendingF1Content = saveData.f1Content;

                // 尝试立即恢复
                this.tryRestoreScene();
            }

            return saveData;
        } catch (error) {
            console.error('❌ 读取存档失败:', error);
            return null;
        }
    }

    /**
     * 尝试恢复场景
     */
    tryRestoreScene() {
        if (!this.pendingScene) return false;

        if (window.sceneManager) {
            console.log('🎬 开始恢复场景:', this.pendingScene.id);

            // 设置恢复标记
            window.sceneManager.isRestoring = true;

            // 恢复场景数据
            window.sceneManager.currentScene = this.pendingScene;
            window.sceneManager.currentTextIndex = this.pendingTextIndex || 0;

            // 恢复F1区域内容
            const storyText = document.getElementById('storyText');
            if (storyText && this.pendingF1Content) {
                storyText.innerHTML = this.pendingF1Content;
                console.log('📝 F1区域内容已恢复');
            }

            // 如果F1区域为空，重新构建场景
            if (storyText && !storyText.innerHTML && window.sceneManager.buildScene) {
                console.log('📝 F1区域为空，重新构建场景');
                window.sceneManager.buildScene(this.pendingScene);
            }

            // 清除恢复标记
            setTimeout(() => {
                window.sceneManager.isRestoring = false;
            }, 100);

            // 清除待恢复数据
            this.pendingScene = null;
            this.pendingTextIndex = null;
            this.pendingF1Content = null;

            console.log('✅ 场景恢复完成');
            return true;
        }

        // 如果sceneManager还没准备好，稍后再试
        console.log('⏳ 等待sceneManager初始化...');
        setTimeout(() => this.tryRestoreScene(), 100);
        return false;
    }

    /**
     * 清除存档
     */
    clear() {
        localStorage.removeItem(this.SAVE_KEY);
        console.log('🗑️ 存档已清除');
    }

    /**
     * 设置自动保存
     */
    enableAutoSave(intervalMs = 30000) {
        // 每30秒自动保存
        this.autoSaveInterval = setInterval(() => {
            this.save();
        }, intervalMs);

        // 页面关闭前保存
        window.addEventListener('beforeunload', () => {
            this.save();
        });

        console.log('⏰ 自动保存已启用');
    }
}

// 创建全局实例
window.simpleSave = new SimpleSave();

// 页面加载时尝试恢复 - 暂时禁用，避免与game-bootstrap冲突
// document.addEventListener('DOMContentLoaded', () => {
//     console.log('🎮 简单存档系统已初始化');
//
//     // 延迟一点，等其他系统初始化
//     setTimeout(() => {
//         window.simpleSave.load();
//         window.simpleSave.enableAutoSave();
//     }, 500);
// });

console.log('🎮 简单存档系统已初始化（已禁用自动加载）');

// 监听场景变化，自动保存
if (window.sceneManager) {
    // Hook到loadScene方法
    const originalLoadScene = window.sceneManager.loadScene;
    window.sceneManager.loadScene = function(sceneData) {
        const result = originalLoadScene.call(this, sceneData);

        // 场景切换后保存（延迟一点确保数据更新）
        if (!this.isRestoring) {
            setTimeout(() => {
                window.simpleSave.save();
            }, 100);
        }

        return result;
    };
}

console.log('💾 简单存档系统已加载');
console.log('使用方法:');
console.log('  simpleSave.save()   - 立即保存');
console.log('  simpleSave.load()   - 加载存档');
console.log('  simpleSave.clear()  - 清除存档');