/**
 * 游戏启动引导程序
 * 负责决定是继续游戏还是开始新游戏
 */

class GameBootstrap {
    constructor() {
        this.STORAGE_KEY = 'yoyo_game_state';
        this.isNewGame = false;
        this.isLoading = false;
        this.hasLoaded = false;  // 防止重复加载
    }

    /**
     * 检查是否有存档（优先自动存档）
     */
    async hasSavedGame() {
        // 优先检查IndexedDB中的自动存档
        if (window.saveSystem) {
            try {
                const saves = await window.saveSystem.getSavesList();
                const autoSave = saves.find(save => save.type === 'auto');
                if (autoSave) {
                    console.log('📂 发现自动存档，时间:', new Date(autoSave.timestamp).toLocaleString());
                    this.autoSaveId = autoSave.id;  // 记录存档ID
                    return true;
                }
            } catch (e) {
                console.log('检查IndexedDB存档时出错:', e);
            }
        }

        // 降级到localStorage检查
        const quickSave = localStorage.getItem(this.STORAGE_KEY);
        if (quickSave) {
            try {
                const data = JSON.parse(quickSave);
                // 检查存档是否有效
                if (data && data.scene && data.timestamp) {
                    console.log('📂 发现localStorage存档，时间:', new Date(data.timestamp).toLocaleString());
                    return true;
                }
            } catch (e) {
                console.error('存档数据损坏');
            }
        }

        return false;
    }

    /**
     * 保存完整游戏状态
     */
    saveGameState() {
        try {
            const saveData = {
                timestamp: Date.now(),

                // 1. 最重要：当前场景完整数据
                scene: null,
                sceneTextIndex: 0,

                // 2. F1区域完整HTML（包括文本和选项）
                f1HTML: '',

                // 3. 角色状态
                character: null,

                // 4. 游戏时间
                gameTime: null,

                // 5. 其他状态
                worldData: null
            };

            // 获取场景数据
            if (window.sceneManager && window.sceneManager.currentScene) {
                saveData.scene = JSON.parse(JSON.stringify(window.sceneManager.currentScene));
                saveData.sceneTextIndex = window.sceneManager.currentTextIndex || 0;
                console.log('💾 保存场景:', saveData.scene.id);
            }

            // 保存F1区域完整内容
            const storyArea = document.getElementById('storyArea');
            if (storyArea) {
                saveData.f1HTML = storyArea.innerHTML;
                console.log('💾 保存F1区域，长度:', saveData.f1HTML.length);
            }

            // 保存角色数据
            if (window.gameState) {
                saveData.character = window.gameState.character;
                saveData.gameTime = window.gameState.gameTime;
            }

            // 保存世界状态
            if (window.worldState) {
                saveData.worldData = window.worldState.getFullState();
            }

            // 存储到localStorage
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(saveData));
            console.log('✅ 游戏状态已保存');

            return true;
        } catch (error) {
            console.error('❌ 保存失败:', error);
            return false;
        }
    }

    /**
     * 恢复完整游戏状态
     */
    async loadGameState() {
        try {
            let saveData = null;

            // 优先从自动存档加载
            if (this.autoSaveId && window.saveSystem) {
                try {
                    const result = await window.saveSystem.loadSave(this.autoSaveId);
                    if (result && result.success) {
                        console.log('📂 从自动存档恢复游戏...');
                        // SaveSystem已经处理了恢复，直接返回成功
                        return true;
                    }
                } catch (e) {
                    console.log('加载自动存档失败，尝试localStorage:', e);
                }
            }

            // 降级到localStorage
            const savedStr = localStorage.getItem(this.STORAGE_KEY);
            if (!savedStr) return false;

            saveData = JSON.parse(savedStr);
            console.log('📂 从localStorage恢复游戏状态...');

            // 1. 先恢复gameState
            if (!window.gameState) {
                window.gameState = {};
            }
            if (saveData.character) {
                window.gameState.character = saveData.character;
                console.log('✅ 角色数据已恢复');
            }
            if (saveData.gameTime) {
                window.gameState.gameTime = saveData.gameTime;
                console.log('✅ 游戏时间已恢复');
            }

            // 2. 恢复世界状态
            if (saveData.worldData && window.worldState) {
                window.worldState.loadFullState(saveData.worldData);
                console.log('✅ 世界状态已恢复');
            }

            // 3. 恢复场景（这是最关键的！）
            if (saveData.scene) {
                // 等待sceneManager初始化
                await this.waitForSceneManager();

                // 设置恢复标记，避免触发自动存档
                window.sceneManager.isRestoring = true;

                // 直接设置场景数据
                window.sceneManager.currentScene = saveData.scene;
                window.sceneManager.currentTextIndex = saveData.sceneTextIndex || 0;

                console.log('✅ 场景数据已恢复:', saveData.scene.id);
                console.log('📄 恢复的场景对象:', saveData.scene);

                // 恢复F1区域内容
                const storyArea = document.getElementById('storyArea');
                if (storyArea && saveData.f1HTML) {
                    storyArea.innerHTML = saveData.f1HTML;
                    console.log('✅ F1区域内容已恢复');

                    // 重新绑定选项事件
                    this.rebindChoiceEvents();
                }

                // 清除恢复标记
                setTimeout(() => {
                    window.sceneManager.isRestoring = false;

                    // 调试：检查场景是否还在
                    console.log('🔍 500ms后检查场景:', window.sceneManager.currentScene?.id);
                    const storyText = document.getElementById('storyText');
                    if (storyText) {
                        console.log('🔍 F1区域内容:', storyText.textContent?.substring(0, 50));
                    }
                }, 500);
            }

            // 4. 更新UI - 使用完整的世界UI恢复
            if (window.restoreWorldUI) {
                window.restoreWorldUI();  // 恢复所有区域的UI
            } else if (window.updateGameUI) {
                window.updateGameUI();  // 降级到旧方法
            }

            console.log('🎮 游戏状态恢复完成！');
            return true;

        } catch (error) {
            console.error('❌ 恢复游戏状态失败:', error);
            return false;
        }
    }

    /**
     * 等待sceneManager初始化
     */
    async waitForSceneManager() {
        let attempts = 0;
        while (!window.sceneManager && attempts < 50) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        if (!window.sceneManager) {
            throw new Error('SceneManager初始化超时');
        }
    }

    /**
     * 重新绑定选项按钮事件
     */
    rebindChoiceEvents() {
        const choiceButtons = document.querySelectorAll('.story-choice');
        choiceButtons.forEach(button => {
            // 移除旧的事件监听器
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);

            // 清理预览相关的类名，确保选项可以点击
            newButton.classList.remove('preview', 'selected', 'disabled');

            // 添加新的事件监听器
            newButton.addEventListener('click', function() {
                if (window.sceneManager) {
                    window.sceneManager.selectChoice(this);
                }
            });
        });
        console.log('✅ 重新绑定了', choiceButtons.length, '个选项按钮，已清理预览状态');
    }

    /**
     * 启动游戏（主入口）
     */
    async start() {
        console.log('🎮 游戏启动引导开始...');

        // 检查是否已经加载过了（避免重复加载）
        if (this.hasLoaded) {
            console.log('⚠️ 游戏已经加载过了，跳过重复加载');
            return true;
        }

        // 初始化API设置
        await this.initializeAPISettings();

        // 加载游戏预设设置
        this.loadGamePresetSettings();

        // 检查是否是新游戏（来自菜单）
        const isNewGameFlag = sessionStorage.getItem('isNewGame');
        if (isNewGameFlag === 'true') {
            console.log('🆕 检测到新游戏标记，跳过存档加载');
            sessionStorage.removeItem('isNewGame');  // 清除标记
            this.isNewGame = true;
            this.hasLoaded = true;

            // 设置自动保存
            this.setupAutoSave();

            // 初始化新游戏状态
            if (window.gameState && window.gameState.character) {
                console.log('🎮 开始新游戏，角色:', window.gameState.character.name);
            }

            return false;  // 返回false表示新游戏
        }

        // 检查是否有存档
        const hasSave = await this.hasSavedGame();
        if (hasSave) {
            console.log('📂 检测到存档，准备继续游戏...');

            // 恢复游戏状态
            const success = await this.loadGameState();

            if (success) {
                console.log('✅ 继续之前的游戏');
                this.isNewGame = false;
                this.hasLoaded = true;  // 标记已加载

                // 设置自动保存
                this.setupAutoSave();

                return true;
            } else {
                console.log('⚠️ 存档恢复失败，将开始新游戏');
            }
        }

        // 开始新游戏
        console.log('🆕 开始新游戏');
        this.isNewGame = true;
        this.hasLoaded = true;  // 标记已加载

        // 初始化默认状态
        this.initNewGame();

        // 设置自动保存
        this.setupAutoSave();

        return true;
    }

    /**
     * 初始化API设置
     */
    async initializeAPISettings() {
        try {
            // 获取当前激活的游戏预设
            const presetId = sessionStorage.getItem('activePresetId');
            if (!presetId) {
                console.log('⚠️ 没有找到激活的预设ID，使用默认API设置');
                return;
            }

            // 从localStorage获取游戏预设
            const savedPresets = localStorage.getItem('game_presets');
            if (!savedPresets) {
                console.log('⚠️ 没有找到游戏预设，使用默认API设置');
                return;
            }

            const data = JSON.parse(savedPresets);
            const preset = data.presets.find(p => p.id === presetId);

            if (preset && preset.apiPresetId) {
                // 加载关联的API预设
                if (window.APIPresetManager) {
                    await window.APIPresetManager.init();
                    window.APIPresetManager.switchPreset(preset.apiPresetId);
                    console.log('✅ 已加载API预设:', preset.apiPresetId);
                }

                // 初始化APIState
                if (window.APIState) {
                    await window.APIState.init();
                    console.log('✅ APIState已初始化');
                }
            }
        } catch (error) {
            console.error('初始化API设置失败:', error);
        }
    }

    /**
     * 加载游戏预设设置
     */
    loadGamePresetSettings() {
        try {
            // 获取世界设置（从sessionStorage，由character-creation保存）
            const worldSettings = sessionStorage.getItem('worldSettings');
            if (worldSettings) {
                const settings = JSON.parse(worldSettings);

                // 应用世界设置
                if (window.worldState) {
                    // 应用经济难度
                    if (settings.economyDifficulty) {
                        console.log('📊 应用经济难度:', settings.economyDifficulty);
                        // 这里可以设置价格倍率等
                    }

                    // 应用NPC密度
                    if (settings.npcDensity) {
                        console.log('👥 应用NPC密度:', settings.npcDensity);
                        // 这里可以设置NPC生成率等
                    }

                    // 应用开局季节
                    if (settings.startSeason && window.weatherSystem) {
                        console.log('🌍 应用开局季节:', settings.startSeason);
                        // weatherSystem没有setSeason方法，直接设置currentSeason属性
                        window.weatherSystem.currentSeason = settings.startSeason;
                        window.weatherSystem.generateWeather(); // 重新生成天气
                        window.weatherSystem.updateWeatherDisplay(); // 更新显示
                    }
                }
            }

            // 从预设加载其他设置
            const presetId = sessionStorage.getItem('activePresetId');
            if (presetId) {
                const savedPresets = localStorage.getItem('game_presets');
                if (savedPresets) {
                    const data = JSON.parse(savedPresets);
                    const preset = data.presets.find(p => p.id === presetId);

                    if (preset && preset.settings) {
                        // 应用时间速度
                        if (preset.settings.timeSpeed && window.timeSystem) {
                            console.log('⏰ 应用时间流速:', preset.settings.timeSpeed);
                            window.timeSystem.setTimeSpeed(preset.settings.timeSpeed);
                        }

                        // 应用其他设置...
                        console.log('✅ 游戏预设已应用:', preset.name);
                    }
                }
            }
        } catch (error) {
            console.error('加载游戏预设设置失败:', error);
        }
    }

    /**
     * 初始化新游戏
     */
    initNewGame() {
        // 设置默认gameState
        if (!window.gameState) {
            window.gameState = {
                character: {
                    name: '未命名',
                    health: 100,
                    mood: 50,
                    money: 100,
                    energy: 80,
                    spirit: 60,
                    location: 'awakening_room'
                },
                gameTime: {
                    day: 1,
                    hour: 7,
                    minute: 30,
                    weekday: 1
                }
            };
        }

        // 加载初始场景
        if (window.sceneManager && window.OpeningScenes) {
            window.sceneManager.loadScene(window.OpeningScenes.awakening);
            console.log('✅ 初始场景已加载');
        }
    }

    /**
     * 设置自动保存
     */
    setupAutoSave() {
        // 每30秒自动保存
        setInterval(() => {
            this.saveGameState();
        }, 30000);

        // 场景切换时保存
        if (window.sceneManager) {
            const originalLoadScene = window.sceneManager.loadScene;
            window.sceneManager.loadScene = function(sceneData) {
                const result = originalLoadScene.call(this, sceneData);

                // 延迟保存，确保数据已更新
                if (!this.isRestoring) {
                    setTimeout(() => {
                        window.gameBootstrap.saveGameState();
                    }, 100);
                }

                return result;
            };
        }

        // 页面关闭前保存
        window.addEventListener('beforeunload', () => {
            this.saveGameState();
        });

        console.log('⏰ 自动保存已设置');
    }

    /**
     * 清除存档并重新开始
     */
    clearAndRestart() {
        if (confirm('确定要清除存档并重新开始吗？')) {
            localStorage.removeItem(this.STORAGE_KEY);
            console.log('🗑️ 存档已清除');
            location.reload();
        }
    }
}

// 创建全局实例
window.gameBootstrap = new GameBootstrap();

// 导出快捷命令
window.continueGame = () => window.gameBootstrap.loadGameState();
window.newGame = () => window.gameBootstrap.clearAndRestart();
window.saveGame = () => window.gameBootstrap.saveGameState();

console.log('🎮 游戏启动引导系统已加载');
console.log('命令：');
console.log('  continueGame() - 继续游戏');
console.log('  newGame()      - 新游戏');
console.log('  saveGame()     - 手动保存');