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
            // 1. 优先尝试IndexedDB中的自动存档
            if (this.autoSaveId && window.saveSystem) {
                try {
                    const result = await window.saveSystem.loadSave(this.autoSaveId);
                    if (result && result.gameData) {
                        console.log('✅ 读取IndexedDB自动存档成功，准备恢复', result.id);
                        const normalized = this.normalizeSavePayload(result.gameData);
                        if (normalized && await this.applySavePayload(normalized, {
                            source: 'saveSystem:auto',
                            meta: {
                                id: result.id,
                                type: result.type,
                                timestamp: result.timestamp
                            }
                        })) {
                            console.log('🎮 已从IndexedDB自动存档恢复');
                            return true;
                        }
                        console.warn('⚠️ 自动存档存在但结构无效或恢复失败，继续尝试其他来源');
                    }
                } catch (error) {
                    console.warn('⚠️ 加载IndexedDB自动存档失败，继续尝试localStorage', error);
                }
            }

            // 2. 回退到localStorage
            const savedStr = localStorage.getItem(this.STORAGE_KEY);
            if (!savedStr) {
                return false;
            }

            const localData = JSON.parse(savedStr);
            const normalized = this.normalizeSavePayload(localData);
            if (!normalized) {
                console.warn('⚠️ localStorage存档结构无效，无法恢复');
                return false;
            }

            const restored = await this.applySavePayload(normalized, { source: 'localStorage' });
            if (restored) {
                console.log('🎮 已从localStorage存档恢复');
            }
            return restored;
        } catch (error) {
            console.error('❌ 恢复游戏状态失败:', error);
            return false;
        }
    }

    /**
     * 将不同来源的存档数据整理成统一格式
     */
    normalizeSavePayload(rawData) {
        if (!rawData || typeof rawData !== 'object') {
            return null;
        }

        let cloned;
        try {
            cloned = JSON.parse(JSON.stringify(rawData));
        } catch (error) {
            console.error('⚠️ 无法克隆存档数据:', error);
            return null;
        }

        const hasWorldData = cloned.worldData && typeof cloned.worldData === 'object';
        const sceneFromWorld = hasWorldData && cloned.worldData.currentSceneData ? cloned.worldData.currentSceneData.scene : null;
        const sceneIndexFromWorld = hasWorldData && cloned.worldData.currentSceneData && cloned.worldData.currentSceneData.currentTextIndex !== undefined
            ? cloned.worldData.currentSceneData.currentTextIndex
            : 0;
        const f1FromWorld = hasWorldData && cloned.worldData.f1Content && cloned.worldData.f1Content.html !== undefined
            ? cloned.worldData.f1Content.html
            : '';

        const normalized = {
            character: cloned.character || null,
            gameTime: cloned.gameTime || null,
            worldData: hasWorldData ? cloned.worldData : null,
            scene: cloned.scene || sceneFromWorld || null,
            sceneTextIndex: cloned.sceneTextIndex !== undefined ? cloned.sceneTextIndex : sceneIndexFromWorld,
            f1HTML: cloned.f1HTML !== undefined ? cloned.f1HTML : f1FromWorld,
            extras: {}
        };

        if (cloned.currentSceneId !== undefined) {
            normalized.extras.currentSceneId = cloned.currentSceneId;
        }

        if (cloned.sceneHistory) {
            normalized.extras.sceneHistory = cloned.sceneHistory;
        }

        return normalized;
    }

    /**
     * 根据整理后的存档数据恢复游戏状态
     */
    async applySavePayload(saveData, context = {}) {
        if (!saveData) {
            return false;
        }

        if (!window.gameState) {
            window.gameState = {};
        }

        if (saveData.character) {
            window.gameState.character = saveData.character;
        }

        if (saveData.gameTime) {
            window.gameState.gameTime = saveData.gameTime;
        }

        if (saveData.extras && saveData.extras.currentSceneId !== undefined) {
            window.gameState.currentSceneId = saveData.extras.currentSceneId;
        }

        if (saveData.extras && saveData.extras.sceneHistory) {
            window.gameState.sceneHistory = saveData.extras.sceneHistory;
        }

        if (context.source) {
            window.gameState._restoreSource = context.source;
        }

        if (context.meta && context.meta.id) {
            window.gameState._restoreSaveId = context.meta.id;
        }

        if (context.meta && context.meta.timestamp) {
            window.gameState._restoreTimestamp = context.meta.timestamp;
        }

        window.gameState.restored = true;

        if (saveData.worldData) {
            if (window.worldState && typeof window.worldState.loadFullState === 'function') {
                window.worldState.loadFullState(saveData.worldData);

                // 🧠 暂存记忆数据，等 Zero 初始化后再恢复
                // （不在这里直接恢复，因为 window.zero 可能还没创建）
                window.gameState._pendingWorldData = saveData.worldData;
                console.log('💾 已暂存记忆数据，等待 Zero 初始化后恢复');

                // 🧠 如果 Zero 已经存在，立即恢复记忆
                if (window.zero && window.MemoryIntegration) {
                    console.log('🧠 检测到 Zero 已初始化，立即恢复记忆...');
                    window.MemoryIntegration.restoreFromSave(saveData.worldData, 'Zero');
                }
            } else {
                window.gameState._pendingWorldData = saveData.worldData;
                console.log('⏳ worldState尚未初始化，已暂存worldData等待后续恢复');
            }
        }

        if (saveData.scene) {
            try {
                await this.waitForSceneManager();
                if (window.sceneManager) {
                    window.sceneManager.isRestoring = true;
                    window.sceneManager.currentScene = saveData.scene;
                    window.sceneManager.currentTextIndex = saveData.sceneTextIndex || 0;
                    window.sceneManager.isInChoice = false;
                    window.sceneManager.currentChoice = null;
                    window.sceneManager.previewChoice = null;
                    window.sceneManager.isPreviewMode = false;
                }

                const storyArea = document.getElementById('storyArea');
                if (storyArea && saveData.f1HTML !== undefined) {
                    storyArea.innerHTML = saveData.f1HTML;
                    this.rebindChoiceEvents();
                }
            } catch (error) {
                console.error('⚠️ 恢复场景时出现问题:', error);
            } finally {
                if (window.sceneManager) {
                    window.sceneManager.isRestoring = false;
                }
            }

            setTimeout(() => {
                if (window.sceneManager) {
                    console.log('🔁 恢复完成后的场景检查:', window.sceneManager.currentScene?.id);
                }
                const storyText = document.getElementById('storyText');
                if (storyText) {
                    console.log('📝 F1区域内容预览:', storyText.textContent?.substring(0, 50));
                }
            }, 500);
        } else if (saveData.f1HTML !== undefined) {
            const storyArea = document.getElementById('storyArea');
            if (storyArea) {
                storyArea.innerHTML = saveData.f1HTML;
                this.rebindChoiceEvents();
            }
        }

        if (window.restoreWorldUI) {
            window.restoreWorldUI();
        } else if (window.updateGameUI) {
            window.updateGameUI();
        }

        return true;
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
     * 初始化音频系统
     */
    initializeAudioSystem() {
        try {
            // 创建音频系统实例
            if (!window.audioSystem) {
                window.audioSystem = new AudioSystem();
                console.log('🔊 音频系统已初始化');
            }

            // 从worldState恢复音频设置
            if (window.worldState?.state?.player?.settings?.audio) {
                const audioSettings = window.worldState.state.player.settings.audio;

                // 恢复音量设置（转换0-100到0-1）
                if (audioSettings.volumes) {
                    window.audioSystem.volumes.master = (audioSettings.volumes.master || 80) / 100;
                    window.audioSystem.volumes.bgm = (audioSettings.volumes.bgm || 60) / 100;
                    window.audioSystem.volumes.ambient = (audioSettings.volumes.ambient || 50) / 100;
                    window.audioSystem.volumes.ambientWeather = (audioSettings.volumes.ambientWeather || 50) / 100;
                    window.audioSystem.volumes.ambientTime = (audioSettings.volumes.ambientTime || 40) / 100;
                    window.audioSystem.volumes.ambientLocation = (audioSettings.volumes.ambientLocation || 30) / 100;
                    window.audioSystem.volumes.sfx = (audioSettings.volumes.sfx || 80) / 100;
                }

                // 恢复开关设置
                if (audioSettings.enabled) {
                    window.audioSystem.enabled = { ...audioSettings.enabled };
                }

                // 恢复高级设置
                if (audioSettings.advanced) {
                    window.audioSystem.crossfadeDuration = audioSettings.advanced.crossfadeDuration || 2000;
                }

                console.log('🔊 音频设置已从worldState恢复');
            }
        } catch (error) {
            console.error('❌ 音频系统初始化失败:', error);
        }
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

        // 初始化音频系统
        this.initializeAudioSystem();

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
                        // 安全设置季节
                        try {
                            if (typeof window.weatherSystem.setSeason === 'function') {
                                window.weatherSystem.setSeason(settings.startSeason);
                            } else {
                                // 直接设置属性
                                window.weatherSystem.currentSeason = settings.startSeason;
                                // 如果有这些方法则调用
                                if (typeof window.weatherSystem.generateWeather === 'function') {
                                    window.weatherSystem.generateWeather();
                                }
                                if (typeof window.weatherSystem.updateWeatherDisplay === 'function') {
                                    window.weatherSystem.updateWeatherDisplay();
                                }
                            }
                        } catch (e) {
                            console.warn('设置季节失败，使用默认值:', e);
                        }
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
                            // TODO: 时间系统尚未实现 setTimeSpeed 方法
                            // window.timeSystem.setTimeSpeed(preset.settings.timeSpeed);
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

// ============================================
// 🤖 NPC AI系统初始化
// ============================================

/**
 * 初始化Zero的AI实例
 */
function initializeZeroAI() {
    if (!window.EmotionSystem || !window.MemorySystem || !window.UtilityAI) {
        console.warn('⚠️ NPC AI系统未加载，跳过Zero初始化');
        return null;
    }

    // 创建Zero的NPC实例
    const zero = {
        id: 'Zero',
        name: '凌',

        // 基础状态（从worldState同步或使用默认值）
        health: 100,
        mood: 70,
        wolfControl: 70,  // 狼魂控制度
        medication: 80,   // 药物剩余
        guilt: 30,        // 负罪感

        // 集成AI系统
        emotionSystem: new EmotionSystem(),
        memory: new MemorySystem(),
        utilityAI: null
    };

    // 初始化情感状态（根据游戏进度）
    zero.emotionSystem.emotions.affection = 0;   // 陌生人状态
    zero.emotionSystem.emotions.trust = 0;
    zero.emotionSystem.emotions.respect = 0;
    zero.emotionSystem.emotions.intrigue = 0;

    // 创建AI决策引擎
    zero.utilityAI = new UtilityAI(zero);

    console.log('🤖 Zero的AI系统已初始化');
    console.log('   - 情感系统：', zero.emotionSystem.emotions);
    console.log('   - 记忆系统：', zero.memory);
    console.log('   - 决策引擎：', zero.utilityAI);

    return zero;
}

/**
 * 让Zero根据当前情况做出AI决策
 * @returns {Object} - {action: 行为名, utility: 分数, allScores: 所有分数}
 */
window.getZeroAIDecision = function() {
    if (!window.zero || !window.zero.utilityAI) {
        console.error('❌ Zero的AI未初始化');
        return null;
    }

    // 构建上下文（从游戏状态获取）
    const context = {
        player: {
            health: window.worldState?.state?.character?.health || 100,
            trauma: window.worldState?.state?.character?.trauma || 0,
            mood: window.worldState?.state?.character?.mood || 100
        },
        distance: 0.3,  // 默认近距离（可以从场景数据获取）
        hasEnemy: window.worldState?.state?.inCombat || false,
        world: {
            weather: window.worldState?.state?.environment?.weather || 'sunny',
            time: window.worldState?.state?.time?.period || 'morning'
        },
        location: window.worldState?.state?.character?.location || 'unknown'
    };

    // AI决策
    const decision = window.zero.utilityAI.decide(context);
    console.log('🤖 Zero的AI决策:', decision.action, '(分数:', decision.utility.toFixed(2), ')');

    return decision;
};

// 初始化Zero并恢复记忆的函数
function initZeroAndRestoreMemory() {
    // 如果 Zero 已存在，跳过初始化
    if (window.zero) {
        console.log('ℹ️ Zero已经初始化过，跳过重复初始化');
        return;
    }

    window.zero = initializeZeroAI();

    if (window.zero) {
        console.log('✅ Zero已准备就绪！');
        console.log('💡 使用 getZeroAIDecision() 来获取Zero的行为决策');

        // 🧠 恢复记忆（双重检查机制）
        // 方式1: 从 _pendingWorldData 恢复（存档加载在 Zero 初始化之前）
        if (window.gameState?._pendingWorldData?.npcs?.Zero?.memory && window.MemoryIntegration) {
            console.log('🧠 从 _pendingWorldData 恢复记忆...');
            window.MemoryIntegration.restoreFromSave(window.gameState._pendingWorldData, 'Zero');
        }
        // 方式2: 从 WorldState 恢复（存档加载在 Zero 初始化之后）
        else if (window.worldState?.state?.npcs?.Zero?.memory && window.MemoryIntegration) {
            console.log('🧠 从 WorldState 恢复记忆...');
            window.MemoryIntegration.restoreFromSave(window.worldState.state, 'Zero');
        } else {
            console.log('ℹ️ 没有待恢复的记忆数据（可能是新游戏）');
        }
    }
}

// 在页面加载完成后初始化Zero（兼容已加载和未加载两种情况）
if (document.readyState === 'loading') {
    // 如果文档还在加载，监听 DOMContentLoaded
    document.addEventListener('DOMContentLoaded', initZeroAndRestoreMemory);
} else {
    // 如果文档已经加载完成，立即执行
    initZeroAndRestoreMemory();
}

console.log('🤖 NPC AI初始化脚本已加载');

