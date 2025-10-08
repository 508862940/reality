// 游戏主界面JavaScript逻辑

// 游戏状态（从localStorage加载或使用默认值）
let gameState = null;

// 当前显示的标签页
let currentTab = 'status';

// AI对话是否激活
let aiModeActive = false;

// 初始化游戏
window.addEventListener('DOMContentLoaded', function() {
    initializeGame();
});

// 页面卸载时的清理
window.addEventListener('beforeunload', function(e) {
    // 触发最后一次自动存档
    if (window.saveSystem && window.saveSystem.autoSaveEnabled) {
        window.saveSystem.triggerAutoSave('page_unload');
    }
});

// 页面完全卸载时停止自动存档定时器
window.addEventListener('unload', function() {
    if (window.saveSystem) {
        window.saveSystem.stopAutoSave();
    }
});

// 异步初始化游戏主函数
async function initializeGame() {
    try {
        console.log('📝 小纸条：开始异步初始化游戏...');

        // 1. 初始化SaveSystem（如果还没初始化）
        if (!window.saveSystem) {
            try {
                // 等待数据库初始化
                if (window.Database) {
                    await window.Database.init();
                }
                // 初始化存档系统
                window.saveSystem = new SaveSystem();
                await window.saveSystem.init();
                console.log('✅ SaveSystem初始化成功');

                // 启动自动存档
                window.saveSystem.startAutoSave();
                console.log('⏰ 自动存档已启动');
            } catch (error) {
                console.error('❌ SaveSystem初始化失败:', error);
            }
        } else {
            // SaveSystem已存在，确保自动存档已启动
            if (window.saveSystem.autoSaveEnabled && !window.saveSystem.autoSaveTimer) {
                window.saveSystem.startAutoSave();
                console.log('⏰ 自动存档已重新启动');
            }
        }

        // 2. 现在SaveSystem已初始化，可以加载gameState
        await loadGameState();

        // 3. 确保gameState不为null
        if (!gameState || !gameState.character) {
            console.log('📝 小纸条：gameState为空，使用默认值');
            gameState = getDefaultGameState();
        }

        // 4. 将gameState设置为全局变量，供其他模块使用
        window.gameState = gameState;

        console.log('📝 小纸条：gameState初始化完成:', gameState);
        console.log('📝 小纸条：window.gameState已设置:', window.gameState);

        // 5. 初始化世界状态管理器
        if (window.worldState) {
            // 从gameState同步数据到worldState
            if (gameState.character) {
                window.worldState.state.player.name = gameState.character.name || '未命名';
                window.worldState.state.player.stats = {
                    health: gameState.character.health || 100,
                    mood: gameState.character.mood || 50,
                    money: gameState.character.money || 100,
                    energy: gameState.character.energy || 80,
                    spirit: gameState.character.spirit || 60
                };
                window.worldState.state.player.position.location = gameState.character.location || 'awakening_room';

                // 同步外观数据 - 优先使用appearanceData，如果没有则使用appearance
                if (gameState.character.appearanceData) {
                    window.worldState.state.player.appearance = gameState.character.appearanceData;
                    console.log('📝 同步appearanceData到worldState:', gameState.character.appearanceData);
                } else if (gameState.character.appearance) {
                    window.worldState.state.player.appearance = gameState.character.appearance;
                    console.log('📝 同步appearance到worldState:', gameState.character.appearance);
                }
            }

            if (gameState.gameTime) {
                window.worldState.state.time = gameState.gameTime;
            }

            // 如果有完整的世界数据，直接加载（包含场景）
            // 或者之前标记了需要恢复世界状态
            if (gameState.worldData || gameState._needRestoreWorld) {
                window.worldState.loadFullState(gameState.worldData);
                console.log('🌍 从存档恢复世界状态（包含场景）');
                delete gameState._needRestoreWorld; // 清除标记
            } else if (gameState.currentSceneData && window.sceneManager) {
                // 兼容：直接恢复场景数据
                const sceneData = gameState.currentSceneData;
                window.sceneManager.currentScene = sceneData.scene;
                window.sceneManager.currentTextIndex = sceneData.currentTextIndex || 0;
                window.sceneManager.isInChoice = sceneData.isInChoice || false;
                // 不在这里调用loadScene，让game-main-init.js统一处理
                console.log('📖 场景数据已设置，等待game-main-init处理');
            }

            // 连接到现有系统
            window.worldState.connectToExistingSystems();
            console.log('🌍 世界状态管理器已初始化');
        }

        // 6. 然后初始化UI
        initializeUI();

        // 4. 绑定输入事件
        setupEventListeners();

        // 5. 导出函数供其他模块使用（必须在startGame之前）
        window.updateGameUI = updateStatus;  // 改名避免冲突
        window.restoreWorldUI = restoreWorldUI;  // 导出完整世界UI恢复函数
        window.updateLocationTime = updateLocationTime;  // 导出位置时间更新函数
        window.saveGameState = saveGameState;  // 导出游戏保存函数
        window.switchTab = switchTab;
        console.log('📝 小纸条：导出函数到window对象完成');

        // 5.5. 🧠 恢复NPC记忆（如果有存档数据）
        if (window.zero && window.MemoryIntegration && window.worldState?.state?.npcs?.Zero?.memory) {
            console.log('🧠 检测到存档中的记忆数据，开始恢复...');
            window.MemoryIntegration.restoreFromSave(window.worldState.state, 'Zero');
            console.log('✅ NPC记忆已恢复');
        }

        // 6. 开始游戏
        startGame();

        console.log('📝 小纸条：游戏初始化完成');

    } catch (error) {
        console.error('游戏初始化失败:', error);
        // 出错时使用默认状态
        gameState = getDefaultGameState();
        window.gameState = gameState; // 同步到全局
        initializeUI();
        setupEventListeners();
        startGame();
    }
}

// 获取默认游戏状态
function getDefaultGameState() {
    return {
        character: {
            name: '默认角色',
            health: 100,
            mood: 50,
            money: 100,
            energy: 80,
            location: 'awakening_room'
        },
        gameTime: {
            day: 1,
            hour: 8,
            minute: 0,
            weekday: 'Monday'
        },
        // 场景是游戏状态的核心部分
        currentSceneId: null,
        currentChoiceId: null,
        sceneHistory: []
    };
}

// 加载游戏状态
async function loadGameState() {
    try {
        // 首先检查是否从menu.html跳转过来的存档
        const saveId = sessionStorage.getItem('currentSaveId');
        const saveDataStr = sessionStorage.getItem('currentSaveData');

        if (saveId && saveDataStr) {
            console.log('📂 检测到从菜单加载的存档:', saveId);
            try {
                gameState = JSON.parse(saveDataStr);
                window.gameState = gameState;

                // 恢复剧情数据
                if (gameState.storyData && window.storyFlags) {
                    window.storyFlags.load(gameState.storyData);
                    console.log('📚 剧情数据已恢复');
                }

                // 恢复关系数据（如果系统存在）
                if (gameState.relationshipData && window.relationships) {
                    window.relationships.load(gameState.relationshipData);
                    console.log('👥 关系数据已恢复');
                }

                // 恢复世界系统数据（包含F1场景）
                if (gameState.worldData) {
                    // 先恢复完整的世界状态（包含场景）
                    if (window.worldState) {
                        window.worldState.loadFullState(gameState.worldData);
                        console.log('🌍 世界状态已恢复（包含F1场景）');
                    }

                    // 然后恢复各子系统
                    if (gameState.worldData.weather && window.weatherSystem) {
                        window.weatherSystem.load(gameState.worldData.weather);
                        console.log('🌤️ 天气数据已恢复');
                    }
                    if (gameState.worldData.economy && window.economySystem) {
                        window.economySystem.load(gameState.worldData.economy);
                        console.log('💰 经济数据已恢复');
                    }
                    if (gameState.worldData.farming && window.farmingSystem) {
                        window.farmingSystem.load(gameState.worldData.farming);
                        console.log('🌱 种植数据已恢复');
                    }
                }

                // 恢复战斗状态（如果存在）
                if (gameState.combatData && window.combatSystem) {
                    window.combatSystem.load(gameState.combatData);
                    console.log('⚔️ 战斗数据已恢复');
                }

                // 恢复场景状态（基于场景ID）
                if (gameState.currentSceneId && window.sceneManager) {
                    // 尝试根据ID加载场景
                    const sceneId = gameState.currentSceneId;
                    console.log('📖 尝试恢复场景:', sceneId);

                    // 从场景数据库获取场景（这里需要场景管理系统支持）
                    if (window.OpeningScenes && window.OpeningScenes[sceneId]) {
                        window.sceneManager.loadScene(window.OpeningScenes[sceneId]);
                        console.log('✅ 场景已恢复:', sceneId);
                    } else {
                        console.warn('⚠️ 无法找到场景:', sceneId);
                    }
                }

                // 清除sessionStorage避免重复加载
                sessionStorage.removeItem('currentSaveId');
                sessionStorage.removeItem('currentSaveData');

                console.log('✅ 从菜单存档加载成功:', gameState);
                return;
            } catch (error) {
                console.error('解析存档数据失败:', error);
            }
        }

        // 检查是否是新游戏（从角色创建来的）
        console.log('🔍 开始检查 newGameState...');
        const newGameState = localStorage.getItem('newGameState');
        console.log('🔍 newGameState 内容:', newGameState ? `存在，长度 ${newGameState.length}` : '不存在');

        if (newGameState) {
            console.log('🎮 检测到新游戏数据');
            gameState = JSON.parse(newGameState);
            window.gameState = gameState;

            // 清除临时标记
            localStorage.removeItem('newGameState');

            console.log('🎉 使用新创建的角色数据');
            console.log('👤 角色外观:', gameState.character?.appearanceData);
            console.log('📋 详细外观数据：', {
                appearance: gameState.character?.appearance,
                appearanceData: gameState.character?.appearanceData,
                gender: gameState.character?.gender
            });

            // 立即保存为自动存档（覆盖旧的）
            if (window.saveSystem) {
                try {
                    // 创建初始的世界状态快照
                    await window.saveSystem.autoSave();
                    console.log('✅ 新游戏数据已保存为自动存档');
                } catch (error) {
                    console.error('保存新游戏自动存档失败:', error);
                }
            }

            return;
        }

        // 检查是否有自动存档（页面刷新时自动恢复）
        if (window.saveSystem) {
            console.log('🔍 正在检查自动存档...');
            try {
                // 获取自动存档
                const autoSaves = await window.saveSystem.getSavesList('auto');
                console.log('📦 找到自动存档数量:', autoSaves ? autoSaves.length : 0);

                if (autoSaves && autoSaves.length > 0) {
                    const autoSave = autoSaves[0]; // 自动存档只有一个
                    console.log('🔄 检测到自动存档:', autoSave);

                    const saveData = await window.saveSystem.loadSave(autoSave.id);
                    console.log('📂 加载的存档数据:', saveData);

                    if (saveData && saveData.gameData) {
                        gameState = saveData.gameData;
                        window.gameState = gameState;

                        console.log('🎮 gameState已设置，包含worldData:', !!gameState.worldData);
                        console.log('🎮 worldData内容:', gameState.worldData);

                        // 注意：worldState可能还没初始化，先保存数据
                        if (gameState.worldData) {
                            // 标记需要恢复worldData
                            gameState._needRestoreWorld = true;
                            console.log('⏳ 标记需要恢复世界状态（worldState稍后初始化）');
                        }

                        console.log('✅ 从自动存档恢复游戏状态');
                        gameState.restored = true;  // 标记已从存档恢复
                        return;
                    } else {
                        console.log('❌ 存档数据无效或不包含gameData');
                    }
                } else {
                    console.log('📭 没有找到自动存档');
                }
            } catch (error) {
                console.error('加载自动存档失败:', error);
            }
        }

        // 如果没有自动存档，检查是否有新游戏数据
        const checkNewGame = localStorage.getItem('newGameState');
        if (checkNewGame) {
            console.log('🎮 发现待处理的新游戏数据，优先处理');
            // 不在这里处理，让下面的代码处理
        } else {
            // 只有在没有新游戏数据时，才从IndexedDB加载
            if (window.Database && window.Database.db) {
                const savedState = await window.Database.loadGameState();
                if (savedState) {
                    gameState = savedState;
                    window.gameState = gameState; // 同步到全局
                    console.log('✅ 从IndexedDB加载游戏状态:', gameState);
                    return;
                }
            }
        }

        // 降级到localStorage（迁移旧数据）
        const localSavedState = localStorage.getItem('gameState');
        if (localSavedState) {
            gameState = JSON.parse(localSavedState);
            window.gameState = gameState; // 同步到全局
            console.log('🔄 从localStorage迁移游戏状态:', gameState);

            // 迁移到IndexedDB
            if (window.Database && window.Database.db) {
                await window.Database.saveGameState(gameState);
                localStorage.removeItem('gameState');
                console.log('✅ 游戏状态已迁移到IndexedDB');
            }
            return;
        }
    } catch (error) {
        console.error('加载游戏状态失败:', error);
    }

    // 如果没有加载到状态，使用默认值
    if (!gameState) {
        console.log('📝 小纸条：使用默认游戏状态');
        gameState = getDefaultGameState();
        window.gameState = gameState; // 同步到全局
    }

    // 同步到原有的gameData（如果存在）
    if (typeof gameData !== 'undefined') {
        gameData.character.health = gameState.character.health;
        gameData.character.mood = gameState.character.mood;
        gameData.character.money = gameState.character.money;
        gameData.character.location = gameState.character.location;
    }
}

// 初始化界面
function initializeUI() {
    // 检查gameState是否已初始化
    if (!gameState || !gameState.character) {
        console.error('❌ gameState未初始化，无法初始化UI');
        return;
    }

    console.log('📝 小纸条：开始初始化UI，gameState.character.mood =', gameState.character.mood);

    // 更新角色名称
    const characterName = gameState.character.name || '角色';
    if (window.portraitManager && typeof window.portraitManager.updateCharacterName === 'function') {
        // 使用立绘管理器更新（会同时更新worldState）
        window.portraitManager.updateCharacterName(characterName);
    } else {
        // 降级到直接DOM操作
        const nameElement = document.getElementById('characterName');
        if (nameElement) {
            nameElement.textContent = characterName;
        }
    }

    // 更新状态值
    updateStatus();

    // 更新位置和时间
    updateLocationTime();

    // 初始化标签页内容
    initializeTabContents();

    // 初始化时间详情浮层（如果函数已定义）
    if (typeof window.initTimeDetailTooltip === 'function') {
        window.initTimeDetailTooltip();
        console.log('✅ 时间详情浮层已初始化');
    }

    // 初始化天气UI系统
    if (typeof window.initWeatherDetailTooltip === 'function') {
        window.initWeatherDetailTooltip();
        console.log('✅ 天气详情浮层已初始化');
    }

    if (typeof window.updateWeatherIcon === 'function') {
        window.updateWeatherIcon();
    }

    if (typeof window.setupWeatherListeners === 'function') {
        window.setupWeatherListeners();
    }

    // 初始化天气特效
    if (window.weatherSystem && typeof window.createWeatherEffects === 'function') {
        const currentWeather = window.weatherSystem.currentWeather;
        window.createWeatherEffects(currentWeather);
    }
}

// 更新状态显示
function updateStatus() {
    console.log(`🎯 UI更新：updateStatus被调用！！！`);
    console.log(`🎯 UI更新：当前mood = ${gameState.character.mood}`);

    // 如果当前在状态标签页，更新状态条
    if (currentTab === 'status') {
        console.log(`📝 小纸条：当前在状态页面，更新状态条`);
        updateStatBar('health', gameState.character.health || 100);
        updateStatBar('mood', gameState.character.mood || 50);
        updateStatBar('money', gameState.character.money || 100);
        updateStatBar('energy', gameState.character.energy || 80);
    } else {
        console.log(`📝 小纸条：当前不在状态页面 (${currentTab})，刷新标签页内容`);
        // 如果不在状态页面，刷新当前标签页内容以确保数据最新
        if (currentTab) {
            const content = getTabContent(currentTab);
            document.getElementById('functionContent').innerHTML = content;
        }
    }

    // 同步到原有系统（如果存在）
    if (typeof updateCharacterPanel === 'function') {
        updateCharacterPanel();
    }
}

/**
 * 完整恢复世界UI（从世界快照恢复所有界面）
 */
function restoreWorldUI() {
    console.log('🌍 开始恢复完整世界UI...');

    if (!window.worldState) {
        console.warn('❌ worldState未初始化，无法恢复UI');
        return;
    }

    const state = window.worldState.state;

    // A区：恢复角色立绘和表情
    const characterName = document.getElementById('characterName');
    if (characterName && state.player) {
        characterName.textContent = state.player.name || '未命名';
        console.log('✅ A区：角色名恢复为', state.player.name);
    }

    // 恢复立绘外观和表情
    if (window.portraitManager) {
        if (state.player && state.player.appearance) {
            window.portraitManager.updateAppearance(state.player.appearance);
            window.portraitManager.updatePortrait();
            console.log('✅ A区：立绘外观已恢复');
        }

        if (state.player && state.player.expression) {
            window.portraitManager.setExpression(state.player.expression);
            console.log('✅ A区：表情状态已恢复', state.player.expression);
        }
    }

    // B区：恢复时间和位置
    if (state.time) {
        updateLocationTime();  // 这个函数已经存在
        console.log('✅ B区：时间已恢复');
    }

    if (state.player && state.player.position) {
        const locationDisplay = document.getElementById('currentLocation');
        if (locationDisplay) {
            // 根据location获取中文名称
            const locationNames = {
                'awakening_room': '觉醒室',
                'classroom': '教室',
                'hallway': '走廊',
                'training_ground': '训练场',
                'dormitory': '宿舍',
                'school': '学校·大门',
                'playground': '学校·操场',
                'cafeteria': '学校·食堂',
                'town': '小镇·街道',
                'shop': '小镇·商店',
                'park': '小镇·公园'
            };
            const locationName = locationNames[state.player.position.location] || state.player.position.location;
            locationDisplay.textContent = locationName;
            console.log('✅ B区：位置恢复为', locationName);
        }
    }

    // C区：恢复场景预览
    const sceneContent = document.querySelector('.scene-content');
    if (sceneContent) {
        if (state.environment) {
            const weatherEmojis = {
                'sunny': '☀️',
                'cloudy': '☁️',
                'rainy': '🌧️',
                'snowy': '❄️'
            };
            const emoji = weatherEmojis[state.environment.weather] || '🌤️';
            const desc = `${emoji} ${state.environment.weather}, ${state.environment.temperature}°C`;

            // 更新场景预览
            if (state.player && state.player.position) {
                updateScenePreview(state.player.position.location);
            }
            console.log('✅ C区：场景预览已恢复');
        }
    }

    // D区：恢复所有状态面板
    updateStatus();  // 状态条

    // 恢复背包（如果当前在背包页）
    if (currentTab === 'inventory' && state.player && state.player.inventory) {
        const content = getTabContent('inventory');
        document.getElementById('functionContent').innerHTML = content;
        console.log('✅ D区：背包数据已恢复');
    }

    // 恢复技能（如果有技能数据）
    if (state.player && state.player.skills) {
        console.log('✅ D区：技能数据已恢复:', state.player.skills);
    }

    // 恢复NPC关系（社交面板）
    if (state.npcs && Object.keys(state.npcs).length > 0) {
        console.log('✅ D区：NPC关系数据已恢复:', Object.keys(state.npcs).length, '个NPC');
        // 如果当前在社交页，刷新显示
        if (currentTab === 'social') {
            const content = getTabContent('social');
            document.getElementById('functionContent').innerHTML = content;
        }
    }

    // 恢复剧情标记（日志系统）
    if (state.story) {
        console.log('✅ D区：剧情进度已恢复:', state.story.mainQuest);
        if (state.story.flags) {
            console.log('✅ D区：剧情标记已恢复:', Object.keys(state.story.flags).length, '个标记');
        }
    }

    // E区：恢复提醒信息（如果有保存的提醒）
    // TODO: 恢复滚动提醒

    // F区：F1和F2已由其他系统处理
    console.log('✅ F区：剧情区域由scene-manager和game-bootstrap处理');

    console.log('🌍 世界UI恢复完成！');
}

// 更新状态条
function updateStatBar(stat, value) {
    console.log(`📝 小纸条：updateStatBar(${stat}, ${value})`);

    const bar = document.getElementById(stat + 'Bar');
    const valueText = document.getElementById(stat + 'Value');

    console.log(`📝 小纸条：找到元素 ${stat}Bar:`, !!bar, `${stat}Value:`, !!valueText);

    if (bar) {
        // 限制值在0-100之间（金钱除外）
        let displayValue = value;
        if (stat !== 'money') {
            displayValue = Math.max(0, Math.min(100, value));
        }

        const width = (stat === 'money' ? Math.min(100, value / 10) : displayValue) + '%';
        bar.style.width = width;
        console.log(`📝 小纸条：设置 ${stat}Bar 宽度为 ${width}`);
    }

    if (valueText) {
        valueText.textContent = value;
        console.log(`📝 小纸条：设置 ${stat}Value 文本为 ${value}`);
    }
}

// 更新位置和时间
function updateLocationTime() {
    // 更新位置
    const location = gameState.character.location || 'school';
    const locationNames = {
        'school': '学校·大门',
        'classroom': '学校·教室',
        'playground': '学校·操场',
        'cafeteria': '学校·食堂',
        'town': '小镇·街道',
        'shop': '小镇·商店',
        'park': '小镇·公园'
    };

    document.getElementById('currentLocation').textContent = locationNames[location] || location;

    // 更新时间（使用新的TimeSystem格式）
    if (window.timeSystem) {
        // 根据屏幕宽度选择不同格式
        let timeStr;
        if (window.innerWidth <= 380) {
            // 超小屏幕：使用超简短格式
            timeStr = window.timeSystem.formatTime('mobile');  // "3/8 07:30"
        } else if (window.innerWidth <= 430) {
            // 一般移动端：使用简短格式，不带图标
            timeStr = window.timeSystem.formatTime('short');  // "3月8日 07:30"
        } else {
            // 桌面端：使用图标格式
            timeStr = window.timeSystem.formatTime('icon');  // "🌸 3月8日 🌅 07:30"
        }
        document.getElementById('currentTime').textContent = timeStr;

        // 在title属性显示详细信息
        const detailStr = window.timeSystem.formatTime('detail');
        document.getElementById('currentTime').title = detailStr;

        // 检查是否是休息日或节日，显示特殊提示
        if (window.timeSystem.isRestDay()) {
            document.getElementById('currentTime').style.color = '#4fc3f7';  // 蓝色表示休息日
        } else {
            document.getElementById('currentTime').style.color = '';  // 恢复默认颜色
        }

        const holiday = window.timeSystem.isHoliday();
        if (holiday) {
            // 如果是节日，在E区显示提醒
            const noticeEl = document.getElementById('noticeText');
            if (noticeEl && !noticeEl.textContent.includes(holiday)) {
                noticeEl.textContent = `🎉 今天是${holiday}！` + noticeEl.textContent;
            }
        }
    } else {
        // 备用方案：使用旧的时间系统
        const time = gameState.gameTime;
        const weekdays = {
            'Monday': '星期一',
            'Tuesday': '星期二',
            'Wednesday': '星期三',
            'Thursday': '星期四',
            'Friday': '星期五',
            'Saturday': '星期六',
            'Sunday': '星期日'
        };

        const timeStr = `${weekdays[time.weekday] || time.weekday} ${String(time.hour).padStart(2, '0')}:${String(time.minute).padStart(2, '0')}`;
        document.getElementById('currentTime').textContent = timeStr;
    }

    // 更新场景
    updateScenePreview(location);
}

// 更新场景预览
function updateScenePreview(location) {
    const sceneEmojis = {
        'school': '🏫',
        'classroom': '📚',
        'playground': '🏃',
        'cafeteria': '🍜',
        'town': '🏘️',
        'shop': '🏪',
        'park': '🌳'
    };

    const sceneNames = {
        'school': '学校场景',
        'classroom': '教室场景',
        'playground': '操场场景',
        'cafeteria': '食堂场景',
        'town': '小镇场景',
        'shop': '商店场景',
        'park': '公园场景'
    };

    const sceneContent = document.querySelector('.scene-content');
    if (sceneContent) {
        sceneContent.innerHTML = `
            <span class="scene-emoji">${sceneEmojis[location] || '📍'}</span>
            <span class="scene-text">${sceneNames[location] || '未知场景'}</span>
        `;
    }
}

// 显示增强通知
function showNotification(message, type = 'info', duration = 3000) {
    // E区通知提醒
    const reminderText = document.getElementById('reminderText');
    if (reminderText) {
        reminderText.textContent = message;
    }

    // 创建或获取通知元素
    let notification = document.querySelector('.game-notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.className = 'game-notification';
        document.body.appendChild(notification);
    }

    // 设置内容和类型
    const icons = {
        success: '✅',
        warning: '⚠️',
        error: '❌',
        info: 'ℹ️'
    };

    notification.innerHTML = `<span>${icons[type] || '💬'}</span><span>${message}</span>`;
    notification.className = `game-notification ${type}`;

    // 显示通知
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);

    // 自动隐藏
    setTimeout(() => {
        notification.classList.remove('show');
    }, duration);

    // 控制台输出
    console.log(`[${type.toUpperCase()}] ${message}`);
}

// 显示存档闪光动画
function showSaveFlash() {
    let flashOverlay = document.querySelector('.save-flash-overlay');
    if (!flashOverlay) {
        flashOverlay = document.createElement('div');
        flashOverlay.className = 'save-flash-overlay';
        document.body.appendChild(flashOverlay);
    }

    flashOverlay.classList.add('active');
    setTimeout(() => {
        flashOverlay.classList.remove('active');
    }, 600);
}

// 显示存档槽位指示
function showSaveSlotIndicator(slotInfo, duration = 2000) {
    let indicator = document.querySelector('.save-slot-indicator');
    if (!indicator) {
        indicator = document.createElement('div');
        indicator.className = 'save-slot-indicator';
        document.body.appendChild(indicator);
    }

    indicator.textContent = slotInfo;
    indicator.classList.add('show');

    setTimeout(() => {
        indicator.classList.remove('show');
    }, duration);
}

// 显示存档进度条
function showSaveProgress(show = true) {
    let progress = document.querySelector('.save-progress');
    if (!progress) {
        progress = document.createElement('div');
        progress.className = 'save-progress';
        document.body.appendChild(progress);
    }

    if (show) {
        progress.classList.add('active');
    } else {
        progress.classList.remove('active');
    }
}

// 切换标签页
function switchTab(tabName) {
    console.log('🎯 切换到标签页:', tabName);

    // 🕐 处理背包时间消耗
    if (currentTab === 'inventory' && tabName !== 'inventory') {
        // 离开背包页面时，如果打开了足够长时间，消耗时间
        if (window.inventoryOpenTime) {
            const timeSpent = Date.now() - window.inventoryOpenTime;
            // 如果在背包页面停留超过3秒，就算作整理背包
            if (timeSpent > 3000) {
                if (window.timeSystem) {
                    window.timeSystem.performAction('standard', 'organize_inventory');
                    if (window.showNotification) {
                        window.showNotification('⏳ 整理背包花费了15分钟', 'info');
                    }
                }
            }
            window.inventoryOpenTime = null;
        }
    }

    // 记录进入背包的时间
    if (tabName === 'inventory') {
        window.inventoryOpenTime = Date.now();
        console.log('📦 开始整理背包...');
    }

    // 更新按钮状态
    document.querySelectorAll('.tab-btn').forEach(btn => {
        if (btn.dataset.tab === tabName) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // 更新内容显示
    const content = getTabContent(tabName);
    const functionContent = document.getElementById('functionContent');
    if (functionContent) {
        functionContent.innerHTML = content;
        console.log('标签页内容已更新:', tabName);
    } else {
        console.error('functionContent元素不存在');
    }

    // 添加事件监听器（延迟执行以确保DOM已更新）
    setTimeout(() => {
        addTabEventListeners(tabName);
    }, 0);

    currentTab = tabName;
}

// 获取标签页内容
function getTabContent(tabName) {
    const contents = {
        'status': `
            <div class="tab-content" id="statusContent">
                <div class="stat-item">
                    <span class="stat-label">体力</span>
                    <div class="stat-bar">
                        <div class="stat-fill" id="healthBar" style="width: ${gameState.character.health}%;"></div>
                    </div>
                    <span class="stat-value" id="healthValue">${gameState.character.health}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">心情</span>
                    <div class="stat-bar">
                        <div class="stat-fill mood" id="moodBar" style="width: ${gameState.character.mood}%;"></div>
                    </div>
                    <span class="stat-value" id="moodValue">${gameState.character.mood}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">金钱</span>
                    <div class="stat-bar">
                        <div class="stat-fill money" id="moneyBar" style="width: ${Math.min(100, gameState.character.money / 10)}%;"></div>
                    </div>
                    <span class="stat-value" id="moneyValue">${gameState.character.money}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">精力</span>
                    <div class="stat-bar">
                        <div class="stat-fill energy" id="energyBar" style="width: ${gameState.character.energy || 80}%;"></div>
                    </div>
                    <span class="stat-value" id="energyValue">${gameState.character.energy || 80}</span>
                </div>
            </div>
        `,
        'inventory': `
            <div class="tab-content">
                <div class="tab-item-container">
                    <div class="tab-item">📚 教科书 x3</div>
                    <div class="tab-item">✏️ 笔记本 x2</div>
                    <div class="tab-item">🍎 苹果 x1</div>
                    <div class="tab-item">💰 金钱: ¥${gameState.character.money}</div>
                </div>
            </div>
        `,
        'map': `
            <div class="tab-content">
                <div class="tab-item-container small-text">
                    <div class="tab-item">📍 当前: ${document.getElementById('currentLocation').textContent}</div>
                    <div class="tab-item">可前往:</div>
                    <div class="tab-item map-location" data-location="classroom">• 教室</div>
                    <div class="tab-item map-location" data-location="playground">• 操场</div>
                    <div class="tab-item map-location" data-location="cafeteria">• 食堂</div>
                    <div class="tab-item map-location" data-location="town">• 小镇</div>
                </div>
            </div>
        `,
        'skills': `
            <div class="tab-content">
                <div class="tab-item-container small-text">
                    <div class="tab-item">智力: ⭐⭐⭐☆☆</div>
                    <div class="tab-item">体力: ⭐⭐⭐⭐☆</div>
                    <div class="tab-item">魅力: ⭐⭐⭐☆☆</div>
                    <div class="tab-item">勇气: ⭐⭐☆☆☆</div>
                </div>
            </div>
        `,
        'social': getSocialTabContent(),
        'journal': `
            <div class="tab-content">
                <div class="tab-item-container micro-text">
                    <div class="tab-item">📅 第${gameState.gameTime.day}天 - ${document.getElementById('currentTime').textContent}</div>
                    <div class="tab-item">• 新的一天开始了</div>
                    <div class="tab-item">• 准备开始冒险</div>
                </div>
            </div>
        `,
        'settings': `
            <div class="tab-content">
                <div class="tab-item-container small-text">
                    <div class="tab-section-title">📁 存档功能</div>
                    <div class="tab-item settings-item" data-action="quick-save">⚡ 快速存档 (F5)</div>
                    <div class="tab-item settings-item" data-action="quick-load">📖 快速读档 (F9)</div>
                    <div class="tab-item settings-item" data-action="save-load">💾 存档管理</div>
                    <div class="tab-item settings-item" data-action="auto-save-toggle">🔄 自动存档: ${window.saveSystem?.autoSaveEnabled ? '开启' : '关闭'}</div>

                    <div class="tab-section-title">🎮 游戏设置</div>
                    <div class="tab-item settings-item" data-action="sound">🔊 音效: 开启</div>
                    <div class="tab-item settings-item" data-action="music">🎵 音乐: 开启</div>
                    <div class="tab-item settings-item" data-action="menu">🏠 返回主菜单</div>
                </div>
            </div>
        `
    };

    const content = contents[tabName] || '<div>加载中...</div>';

    return content;
}

// 获取社交标签页内容
function getSocialTabContent() {
    let content = `
        <div class="tab-content">
            <div class="tab-item-container small-text">
    `;

    // 如果关系系统存在，显示真实数据
    if (window.relationships) {
        const allRelationships = window.relationships.getAllRelationshipSummaries();

        if (Object.keys(allRelationships).length === 0) {
            // 如果还没有任何NPC关系，初始化主要NPC
            if (window.npcHelpers) {
                window.npcHelpers.initializeAllNPCs();
            }
            content += `<div class="tab-item">还没有认识任何人...</div>`;
        } else {
            // 显示所有NPC关系
            for (const [npcId, summary] of Object.entries(allRelationships)) {
                const npcName = window.npcHelpers?.getNPCDisplayName(npcId) || npcId;
                const hearts = getHeartDisplay(summary.affection);
                const stageText = getStageText(summary.stage);

                content += `
                    <div class="tab-item npc-relationship" data-npc="${npcId}">
                        <span class="npc-name">${npcName}</span>
                        <span class="relationship-hearts">${hearts}</span>
                        <span class="relationship-stage">(${stageText})</span>
                    </div>
                `;
            }
        }
    } else {
        // 降级到默认显示
        content += `
            <div class="tab-item">林学长: ❤️❤️❤️🤍🤍</div>
            <div class="tab-item">张同学: ❤️❤️🤍🤍🤍</div>
            <div class="tab-item">夜同学: ❤️🤍🤍🤍🤍</div>
            <div class="tab-item">小明: ❤️❤️❤️❤️🤍</div>
        `;
    }

    content += `
            </div>
        </div>
    `;

    return content;
}

// 显示NPC详细信息
function showNPCDetails(npcId) {
    if (!window.relationships || !window.npcHelpers) {
        console.log('关系系统未加载');
        return;
    }

    const relationship = window.relationships.getRelationship(npcId);
    const profile = window.npcHelpers.getNPCProfile(npcId);

    if (!profile) {
        console.log('未找到NPC资料:', npcId);
        return;
    }

    // 在E区显示NPC信息
    const message = `
        ${profile.name || npcId}
        好感度: ${relationship.affection}/100
        信任度: ${relationship.trust}/100
        关系: ${getStageText(relationship.stage)}
        互动次数: ${relationship.totalInteractions}
    `;

    showNotification(message);
}

// 获取心形显示
function getHeartDisplay(affection) {
    const fullHearts = Math.floor(affection / 20);
    const emptyHearts = 5 - fullHearts;
    return '❤️'.repeat(fullHearts) + '🤍'.repeat(emptyHearts);
}

// 获取关系阶段文本
function getStageText(stage) {
    const stageTexts = {
        'stranger': '陌生人',
        'acquaintance': '认识',
        'friend': '朋友',
        'close': '亲密',
        'lover': '恋人'
    };
    return stageTexts[stage] || stage;
}

// 为标签页内容添加事件监听器
function addTabEventListeners(tabName) {
    console.log('📌 添加事件监听器，标签页:', tabName);

    if (tabName === 'map') {
        document.querySelectorAll('.map-location').forEach(item => {
            item.addEventListener('click', function() {
                const location = this.getAttribute('data-location');
                if (typeof goToLocation === 'function') {
                    goToLocation(location);
                }
            });
        });
    }

    if (tabName === 'social') {
        // 为NPC关系项添加点击事件
        document.querySelectorAll('.npc-relationship').forEach(item => {
            item.addEventListener('click', function() {
                const npcId = this.getAttribute('data-npc');
                showNPCDetails(npcId);
            });
        });
    }

    if (tabName === 'settings') {
        const settingsItems = document.querySelectorAll('.settings-item');
        console.log('🔧 找到设置项:', settingsItems.length, '个');
        settingsItems.forEach(item => {
            item.addEventListener('click', function() {
                const action = this.getAttribute('data-action');
                switch(action) {
                    case 'save-load':
                        showSaveLoadDialog();
                        break;
                    case 'quick-save':
                        // 检查是否可以存档
                        const saveCheck = canSaveGame();
                        if (!saveCheck.canSave) {
                            showNotification(`⚠️ ${saveCheck.reason}`, 'warning');
                        } else {
                            quickSave();
                        }
                        break;
                    case 'quick-load':
                        quickLoad();
                        break;
                    case 'auto-save-toggle':
                        // 切换自动存档状态
                        if (window.saveSystem) {
                            window.saveSystem.autoSaveEnabled = !window.saveSystem.autoSaveEnabled;
                            const status = window.saveSystem.autoSaveEnabled ? '开启' : '关闭';
                            showNotification(`🔄 自动存档已${status}`, 'info');
                            // 刷新设置页面以更新显示
                            switchTab('settings');
                        }
                        break;
                    case 'save':
                        if (typeof saveGame === 'function') saveGame();
                        break;
                    case 'sound':
                        if (typeof toggleSound === 'function') toggleSound();
                        break;
                    case 'music':
                        if (typeof toggleMusic === 'function') toggleMusic();
                        break;
                    case 'menu':
                        if (confirm('确定要返回主菜单吗？未保存的进度将会丢失。')) {
                            // 先进行快速存档
                            quickSave().then(() => {
                                if (typeof returnToMenu === 'function') {
                                    returnToMenu();
                                } else {
                                    window.location.href = 'menu.html';
                                }
                            });
                        }
                        break;
                }
            });
        });
    }
}

// 初始化标签页内容
function initializeTabContents() {
    // 默认显示状态页
    switchTab('status');
}

// 设置事件监听
function setupEventListeners() {
    // 快捷键监听（F5快速存档）
    document.addEventListener('keydown', function(e) {
        // F5 快速存档
        if (e.key === 'F5') {
            e.preventDefault(); // 阻止浏览器刷新
            quickSave();
        }
        // F9 快速读档
        else if (e.key === 'F9') {
            e.preventDefault();
            quickLoad();
        }
    });

    // AI输入回车发送
    const aiInput = document.getElementById('aiInput');
    if (aiInput) {
        aiInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendAIMessage();
            }
        });
    }

    // 标签页切换事件
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const tabName = this.dataset.tab;
            console.log('点击标签:', tabName);
            switchTab(tabName);
        });
    });

    // AI发送按钮
    const aiSendBtn = document.getElementById('aiSendBtn');
    if (aiSendBtn) {
        aiSendBtn.addEventListener('click', sendAIMessage);
    }

    // AI对话结束按钮
    const endAIBtn = document.getElementById('endAIBtn');
    if (endAIBtn) {
        endAIBtn.addEventListener('click', function() {
            if (window.aiDialogueManager) {
                window.aiDialogueManager.endAIDialogue();
            }
        });
    }

    // 返回主菜单对话框按钮
    const cancelReturnBtn = document.getElementById('cancelReturnBtn');
    if (cancelReturnBtn) {
        cancelReturnBtn.addEventListener('click', hideReturnMenuDialog);
    }

    const confirmReturnBtn = document.getElementById('confirmReturnBtn');
    if (confirmReturnBtn) {
        confirmReturnBtn.addEventListener('click', confirmReturnToMenu);
    }

    // 存档对话框按钮
    const closeSaveDialogBtn = document.getElementById('closeSaveDialogBtn');
    if (closeSaveDialogBtn) {
        closeSaveDialogBtn.addEventListener('click', hideSaveLoadDialog);
    }

    const closeSaveDialogBtn2 = document.getElementById('closeSaveDialogBtn2');
    if (closeSaveDialogBtn2) {
        closeSaveDialogBtn2.addEventListener('click', hideSaveLoadDialog);
    }

    const createSaveBtn = document.getElementById('createSaveBtn');
    if (createSaveBtn) {
        createSaveBtn.addEventListener('click', createManualSave);
    }

    // 导入导出按钮
    const exportAllBtn = document.getElementById('exportAllBtn');
    if (exportAllBtn) {
        exportAllBtn.addEventListener('click', async () => {
            try {
                await window.Database.exportAllSaves();
                showNotification('✅ 所有存档导出成功！', 'success');
            } catch (error) {
                showNotification('❌ 导出失败: ' + error.message, 'error');
            }
        });
    }

    const importSavesBtn = document.getElementById('importSavesBtn');
    const importFileInput = document.getElementById('importFileInput');

    if (importSavesBtn && importFileInput) {
        importSavesBtn.addEventListener('click', () => {
            importFileInput.click();
        });

        importFileInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                try {
                    const count = await window.Database.importSaves(file);
                    if (count > 0) {
                        showNotification(`✅ 成功导入 ${count} 个存档！`, 'success');
                        // 刷新存档列表
                        loadSavesList();
                    }
                } catch (error) {
                    showNotification('❌ 导入失败: ' + error.message, 'error');
                }
                // 清空文件输入
                e.target.value = '';
            }
        });
    }
}

// 开始游戏

async function startGame() {
    console.log('🎮 startGame被调用');

    // 检查是否已经从存档恢复（在initializeGame中已处理）
    if (window.gameState && window.gameState.restored) {
        console.log('✅ 游戏已在初始化时从存档恢复，无需重复处理');
        return;
    }

    // 使用新的启动引导系统
    if (window.gameBootstrap) {
        const continued = await window.gameBootstrap.start();

        if (continued && !window.gameBootstrap.isNewGame) {
            // 已经从存档恢复，不需要做任何事
            console.log('✅ 游戏已从存档恢复，继续之前的进度');
            return;
        }
    }

    // 只有新游戏才会执行到这里
    // 显示初始剧情
    const storyArea = document.getElementById('storyArea');

    // 如果有原有的地点系统，使用它
    if (typeof gameData !== 'undefined' && gameData.locations) {
        const location = gameData.locations[gameState.character.location];
        if (location) {
            displayStory(location.description);
            displayChoices(location.options);
        }
    } else if (window.gameBootstrap && window.gameBootstrap.isNewGame) {
        // 新游戏已经在gameBootstrap中初始化了
        console.log('📚 新游戏已初始化');
    }
}

// 显示剧情文本
function displayStory(text) {
    const storyArea = document.getElementById('storyArea');
    const storyDiv = document.createElement('div');
    storyDiv.className = 'story-text';
    storyDiv.innerHTML = `<p>${text}</p>`;
    storyArea.appendChild(storyDiv);

    // 滚动到底部
    storyArea.scrollTop = storyArea.scrollHeight;
}

// 显示选项
function displayChoices(options) {
    const storyArea = document.getElementById('storyArea');
    const choiceBlock = document.createElement('div');
    choiceBlock.className = 'choice-block';

    let choiceHTML = '<div class="choice-block-title">你可以：</div>';

    options.forEach(option => {
        if (option.target) {
            choiceHTML += `<button class="choice-item" onclick="goToLocation('${option.target}')">${option.text}</button>`;
        } else if (option.action) {
            choiceHTML += `<button class="choice-item" onclick="performAction('${option.action}')">${option.text}</button>`;
        }
    });

    // 添加AI对话选项
    choiceHTML += `<button class="choice-item ai-choice" onclick="activateAIMode()">✨ 自由对话（AI模式）</button>`;

    choiceBlock.innerHTML = choiceHTML;
    storyArea.appendChild(choiceBlock);

    // 滚动到底部
    storyArea.scrollTop = storyArea.scrollHeight;
}

// 显示默认选项
function displayDefaultChoices() {
    const options = [
        { text: '进入教室', target: 'classroom' },
        { text: '去操场', target: 'playground' },
        { text: '去食堂', target: 'cafeteria' },
        { text: '离开学校', target: 'town' }
    ];
    displayChoices(options);
}

// 前往地点（集成原有的goToLocation或创建新的）
window.goToLocation = function(location) {
    // 更新游戏状态
    const previousLocation = gameState.character.location;
    gameState.character.location = location;

    if (window.reactiveSystem) {
        window.reactiveSystem.notify('character.location', location, previousLocation);
    }

    // 如果原有系统有这个函数，调用它
    if (typeof window.originalGoToLocation === 'function') {
        window.originalGoToLocation(location);
    } else if (typeof gameData !== 'undefined' && gameData.locations && gameData.locations[location]) {
        // 使用gameData中的地点数据
        const locationData = gameData.locations[location];
        gameData.character.location = location;

        // 清空剧情区
        const storyArea = document.getElementById('storyArea');
        storyArea.innerHTML = '';

        // 显示新地点
        displayStory(`你来到了${locationData.name}。`);
        displayStory(locationData.description);
        displayChoices(locationData.options);

        // 更新界面
        updateLocationTime();
    } else {
        // 简单的地点切换
        displayStory(`你前往了${location}。`);
        updateLocationTime();
        // 不再显示默认选项，由场景管理器处理
    }

    // 保存游戏状态
    saveGameState();
};

// 执行动作（集成原有的performAction或创建新的）
window.performAction = function(action) {
    // 如果原有系统有这个函数，调用它
    if (typeof window.originalPerformAction === 'function') {
        window.originalPerformAction(action);
    } else if (typeof gameData !== 'undefined' && gameData.events && gameData.events[action]) {
        // 使用gameData中的事件数据
        const event = gameData.events[action];

        // 显示事件文本
        displayStory(event.text);

        // 应用效果
        if (event.effects) {
            for (let stat in event.effects) {
                if (gameState.character[stat] !== undefined) {
                    gameState.character[stat] += event.effects[stat];
                    // 限制范围
                    if (stat !== 'money') {
                        gameState.character[stat] = Math.max(0, Math.min(100, gameState.character[stat]));
                    }
                }
                // 同步到原有系统
                if (typeof gameData !== 'undefined' && gameData.character) {
                    gameData.character[stat] = gameState.character[stat];
                }
            }
        }

        // 更新界面
        updateStatus();

        // 显示当前地点的选项 - 已禁用，使用场景管理器
        // const location = gameState.character.location;
        // if (gameData.locations[location]) {
        //     displayChoices(gameData.locations[location].options);
        // }
    } else {
        // 默认动作处理
        displayStory(`你执行了动作：${action}`);
    }

    // 保存游戏状态
    saveGameState();
};

// 激活AI对话模式
function activateAIMode() {
    const aiInputArea = document.getElementById('aiInputArea');
    const aiModeIndicator = document.getElementById('aiModeIndicator');

    aiInputArea.classList.add('active');
    aiModeIndicator.classList.add('active');
    aiModeActive = true;

    displayStory('【AI对话模式已激活】现在你可以自由对话了。输入"结束对话"可以退出AI模式。');

    document.getElementById('aiInput').focus();
}

// 发送AI消息
function sendAIMessage() {
    const aiInput = document.getElementById('aiInput');
    const message = aiInput.value.trim();

    if (!message) return;

    // 检查是否结束对话
    if (message === '结束对话') {
        deactivateAIMode();
        return;
    }

    // 显示玩家消息
    displayStory(`<span style="color: #8b92f6;">你：</span>"${message}"`);

    // 清空输入
    aiInput.value = '';

    // 调用AI（如果AI系统可用）
    if (typeof aiConversation !== 'undefined' && aiConversation.generateResponse) {
        aiConversation.generateResponse('npc', message).then(response => {
            displayStory(`<span class="npc-important">NPC：</span>"${response}"`);
        }).catch(error => {
            displayStory('（AI响应失败，请检查API配置）');
        });
    } else {
        // 模拟AI响应
        setTimeout(() => {
            const responses = [
                "这是个有趣的想法，能告诉我更多吗？",
                "我理解你的感受，让我们一起努力吧。",
                "嗯，这个问题确实需要仔细思考...",
                "你真的很特别，我很高兴能和你聊天。",
                "如果你需要帮助，随时可以找我。"
            ];
            const response = responses[Math.floor(Math.random() * responses.length)];
            displayStory(`<span class="npc-important">NPC：</span>"${response}"`);
        }, 1000);
    }
}

// 退出AI模式
function deactivateAIMode() {
    const aiInputArea = document.getElementById('aiInputArea');
    const aiModeIndicator = document.getElementById('aiModeIndicator');

    aiInputArea.classList.remove('active');
    aiModeIndicator.classList.remove('active');
    aiModeActive = false;

    displayStory('【AI对话模式已关闭】');

    // 显示当前地点的选项 - 已禁用，使用场景管理器
    // const location = gameState.character.location;
    // if (typeof gameData !== 'undefined' && gameData.locations && gameData.locations[location]) {
    //     displayChoices(gameData.locations[location].options);
    // }
}

// 保存游戏状态（用于自动保存）
async function saveGameState() {
    try {
        // 使用新的SaveSystem进行自动存档
        if (window.saveSystem) {
            await window.saveSystem.autoSave();
            console.log('✅ 自动存档完成');
        } else if (window.Database && window.Database.db) {
            // 降级到旧的数据库方法
            await window.Database.saveGameState(gameState);
            console.log('✅ 游戏状态已保存到IndexedDB');
        } else {
            // 降级到localStorage
            localStorage.setItem('gameState', JSON.stringify(gameState));
            console.log('💾 游戏状态已保存到localStorage（备用）');
        }
    } catch (error) {
        console.error('保存游戏状态失败:', error);
        // 出错时使用localStorage备用
        localStorage.setItem('gameState', JSON.stringify(gameState));
    }
}

// 保存游戏
function saveGame() {
    saveGameState();
    alert('游戏已保存！');
}

// 切换音效
function toggleSound() {
    if (window.audioSystem) {
        window.audioSystem.enabled.sfx = !window.audioSystem.enabled.sfx;
        const btn = document.querySelector('[data-action="sound"]');
        if (btn) {
            btn.textContent = `🔊 音效: ${window.audioSystem.enabled.sfx ? '开启' : '关闭'}`;
        }

        // 播放确认音效（如果开启）
        if (window.audioSystem.enabled.sfx) {
            window.audioSystem.playSFX('assets/sounds/sfx/ui/toggle_on.mp3');
        }

        // 保存到worldState
        if (window.worldState?.state?.player?.settings?.audio) {
            window.worldState.state.player.settings.audio.enabled.sfx = window.audioSystem.enabled.sfx;
        }

        console.log(`音效已${window.audioSystem.enabled.sfx ? '开启' : '关闭'}`);
    }
}

// 切换音乐
function toggleMusic() {
    if (window.audioSystem) {
        const wasEnabled = window.audioSystem.enabled.bgm;
        window.audioSystem.enabled.bgm = !wasEnabled;
        window.audioSystem.enabled.ambient = !wasEnabled;

        const btn = document.querySelector('[data-action="music"]');
        if (btn) {
            btn.textContent = `🎵 音乐: ${!wasEnabled ? '开启' : '关闭'}`;
        }

        // 如果关闭音乐，暂停所有背景音
        if (wasEnabled) {
            window.audioSystem.bgmPlayer.pause();
            Object.values(window.audioSystem.ambientLayers).forEach(layer => layer.pause());
        } else {
            // 恢复播放
            if (window.audioSystem.currentBGM) {
                window.audioSystem.bgmPlayer.play();
            }
            // 恢复环境音
            Object.values(window.audioSystem.ambientLayers).forEach(layer => {
                if (layer.src && layer.paused) {
                    layer.play();
                }
            });
        }

        // 保存到worldState
        if (window.worldState?.state?.player?.settings?.audio) {
            window.worldState.state.player.settings.audio.enabled.bgm = window.audioSystem.enabled.bgm;
            window.worldState.state.player.settings.audio.enabled.ambient = window.audioSystem.enabled.ambient;
        }

        // 播放确认音效
        if (window.audioSystem.enabled.sfx) {
            window.audioSystem.playSFX('assets/sounds/sfx/ui/toggle_on.mp3');
        }

        console.log(`音乐已${!wasEnabled ? '开启' : '关闭'}`);
    }
}

// 返回主菜单
async function returnToMenu() {
    // 显示自定义确认对话框
    showReturnMenuDialog();
}

// 显示返回主菜单确认对话框
function showReturnMenuDialog() {
    const dialog = document.getElementById('returnMenuDialog');
    if (dialog) {
        dialog.classList.remove('hidden');
        // 添加淡入动画
        setTimeout(() => {
            dialog.classList.add('active');
        }, 10);
    } else {
        // 如果对话框不存在，使用默认确认
        if (confirm('返回主菜单将保存当前进度，确定要返回吗？')) {
            confirmReturnToMenu();
        }
    }
}

// 隐藏返回主菜单确认对话框
function hideReturnMenuDialog() {
    const dialog = document.getElementById('returnMenuDialog');
    if (dialog) {
        dialog.classList.remove('active');
        setTimeout(() => {
            dialog.classList.add('hidden');
        }, 300);
    }
}

// 确认返回主菜单
async function confirmReturnToMenu() {
    try {
        // 显示保存提示
        const dialog = document.getElementById('returnMenuDialog');
        if (dialog) {
            const content = dialog.querySelector('.dialog-content p');
            if (content) {
                content.textContent = '正在保存游戏进度...';
            }
        }

        // 保存游戏状态
        await saveGameState();

        // 延迟一下让用户看到保存提示
        setTimeout(() => {
            window.location.href = 'menu.html';
        }, 500);
    } catch (error) {
        console.error('保存游戏失败:', error);
        alert('保存游戏失败，是否仍要返回主菜单？');
        window.location.href = 'menu.html';
    }
}

// ==================== 存档系统功能 ====================

/**
 * 检查当前是否可以存档
 * @returns {Object} {canSave: boolean, reason: string}
 */
function canSaveGame() {
    // 1. 检查战斗状态
    if (window.combatSystem && window.combatSystem.isInCombat && window.combatSystem.isInCombat()) {
        return { canSave: false, reason: '战斗中无法存档' };
    }

    // 2. 检查场景切换状态
    if (window.sceneManager && window.sceneManager.isTransitioning) {
        return { canSave: false, reason: '场景切换中无法存档' };
    }

    // 3. 检查AI对话状态
    if (window.aiDialogueManager && window.aiDialogueManager.aiMode) {
        return { canSave: false, reason: 'AI对话中无法存档' };
    }
    if (window.f2Manager && window.f2Manager.currentMode === 'ai') {
        return { canSave: false, reason: 'AI对话模式中无法存档' };
    }

    // 4. 检查是否在选择剧情分支
    if (window.sceneManager && window.sceneManager.isInChoice) {
        return { canSave: false, reason: '选择剧情分支中无法存档' };
    }

    // 5. 检查是否在过场动画或特殊事件中
    if (window.sceneManager && window.sceneManager.currentScene) {
        const scene = window.sceneManager.currentScene;
        if (scene.preventSave || scene.type === 'cutscene') {
            return { canSave: false, reason: '当前场景不允许存档' };
        }
    }

    // 6. 检查是否在播放动画
    if (window.animationSystem && window.animationSystem.isPlaying) {
        return { canSave: false, reason: '动画播放中无法存档' };
    }

    // 7. 检查是否在小游戏中
    if (window.minigameActive) {
        return { canSave: false, reason: '小游戏进行中无法存档' };
    }

    // 8. 检查存档冷却时间（防止频繁存档，3秒冷却）
    if (window.lastQuickSaveTime) {
        const cooldown = 3000; // 3秒
        const timeSinceLastSave = Date.now() - window.lastQuickSaveTime;
        if (timeSinceLastSave < cooldown) {
            const remaining = Math.ceil((cooldown - timeSinceLastSave) / 1000);
            return { canSave: false, reason: `请等待${remaining}秒后再存档` };
        }
    }

    // 9. 检查是否在教程模式
    if (window.tutorialMode) {
        return { canSave: false, reason: '教程模式中无法存档' };
    }

    // 10. 检查是否有未完成的异步操作
    if (window.pendingAsyncOperation) {
        return { canSave: false, reason: '系统处理中，请稍后存档' };
    }

    return { canSave: true, reason: '' };
}

// 快速存档（完整版）
async function quickSave() {
    try {
        // 1. 检查是否可以存档
        const saveCheck = canSaveGame();
        if (!saveCheck.canSave) {
            showNotification(`⚠️ ${saveCheck.reason}`, 'warning');
            console.log('⚠️ 无法存档:', saveCheck.reason);
            return;
        }

        // 2. 确保worldState同步最新数据
        if (window.worldState) {
            // 同步当前gameState到worldState
            if (window.gameState && window.gameState.character) {
                window.worldState.state.player.stats = {
                    health: window.gameState.character.health,
                    mood: window.gameState.character.mood,
                    money: window.gameState.character.money,
                    energy: window.gameState.character.energy,
                    spirit: window.gameState.character.spirit || 60
                };
                window.worldState.state.player.name = window.gameState.character.name;
                window.worldState.state.player.position.location = window.gameState.character.location;
            }

            // 同步时间
            if (window.gameState && window.gameState.gameTime) {
                window.worldState.state.time = window.gameState.gameTime;
            }

            console.log('🔄 已同步最新数据到worldState');
        }

        // 显示存档进度条
        showSaveProgress(true);

        // 记录存档时间（用于冷却检查）
        window.lastQuickSaveTime = Date.now();

        // 3. 使用SaveSystem进行快速存档（会自动调用worldState.getFullState()）
        if (window.saveSystem) {
            const saveData = await window.saveSystem.quickSave();

            // 隐藏进度条
            showSaveProgress(false);

            // 显示存档闪光动画
            showSaveFlash();

            // 显示具体的槽位信息
            const slotInfo = saveData.slot !== undefined ? `💾 快速存档槽位 ${saveData.slot + 1}/3` : '';

            // 显示槽位指示器
            if (slotInfo) {
                showSaveSlotIndicator(slotInfo);
            }

            // 显示成功通知
            showNotification(`快速存档成功！`, 'success');

            console.log('✅ 快速存档完成:', {
                id: saveData.id,
                slot: saveData.slot,
                name: saveData.name,
                hasWorldData: !!saveData.gameData?.worldData,
                hasEngineStates: !!saveData.gameData?.worldData?.engineStates
            });

            return saveData;
        } else {
            // 降级到旧方法（也要保存完整数据）
            const saveId = `quicksave_${Date.now()}`;
            const fullGameState = {
                ...gameState,
                worldData: window.worldState ? window.worldState.getFullState() : null
            };
            const saveData = {
                id: saveId,
                name: `快速存档 - ${new Date().toLocaleString('zh-CN')}`,
                gameData: fullGameState,
                timestamp: Date.now()
            };
            localStorage.setItem(saveId, JSON.stringify(saveData));
            showNotification('⚡ 快速存档成功（本地）！');
            console.log('✅ 本地快速存档完成，包含worldData:', !!saveData.gameData.worldData);
        }
    } catch (error) {
        console.error('快速存档失败:', error);
        showNotification('❌ 快速存档失败: ' + error.message, 'error');
    }
}

// 创建手动存档
async function createManualSave() {
    try {
        // 1. 检查是否可以存档
        const saveCheck = canSaveGame();
        if (!saveCheck.canSave) {
            showNotification(`⚠️ ${saveCheck.reason}`, 'warning');
            console.log('⚠️ 无法存档:', saveCheck.reason);
            return;
        }

        // 2. 确保worldState同步最新数据（与快速存档相同）
        if (window.worldState) {
            // 同步当前gameState到worldState
            if (window.gameState && window.gameState.character) {
                window.worldState.state.player.stats = {
                    health: window.gameState.character.health,
                    mood: window.gameState.character.mood,
                    money: window.gameState.character.money,
                    energy: window.gameState.character.energy,
                    spirit: window.gameState.character.spirit || 60
                };
                window.worldState.state.player.name = window.gameState.character.name;
                window.worldState.state.player.position.location = window.gameState.character.location;
            }

            // 同步时间
            if (window.gameState && window.gameState.gameTime) {
                window.worldState.state.time = window.gameState.gameTime;
            }

            console.log('🔄 已同步最新数据到worldState（手动存档）');
        }

        // 3. 使用新的SaveSystem创建手动存档
        if (window.saveSystem) {
            const saveName = prompt('请输入存档名称：', `存档 - ${new Date().toLocaleString('zh-CN')}`);
            if (saveName === null) return; // 用户取消

            // 显示存档进度条
            showSaveProgress(true);

            // 不传gameData参数（传null），让SaveSystem自己调用getCurrentGameState获取完整世界快照
            const saveData = await window.saveSystem.createSave('manual', null, saveName, null);

            // 隐藏进度条
            showSaveProgress(false);

            // 显示存档闪光动画
            showSaveFlash();

            // 显示槽位信息
            const slotInfo = `💾 手动存档槽位 ${saveData.slot + 1}/10`;
            showSaveSlotIndicator(slotInfo);

            // 显示成功通知
            showNotification('手动存档创建成功！', 'success');

            console.log('✅ 手动存档完成:', {
                id: saveData.id,
                slot: saveData.slot,
                name: saveData.name,
                hasWorldData: !!saveData.gameData?.worldData,
                hasEngineStates: !!saveData.gameData?.worldData?.engines
            });

            // 刷新存档列表
            loadSavesList();
        } else {
            showNotification('❌ 存档系统未初始化', 'error');
        }
    } catch (error) {
        console.error('创建存档失败:', error);
        showNotification('❌ 创建存档失败: ' + error.message, 'error');
    }
}

// 显示存档管理对话框
function showSaveLoadDialog() {
    const dialog = document.getElementById('saveLoadDialog');
    if (dialog) {
        loadSavesList();
        dialog.classList.remove('hidden');
        setTimeout(() => {
            dialog.classList.add('active');
        }, 10);
    } else {
        console.error('存档管理对话框不存在');
    }
}

// 隐藏存档管理对话框
function hideSaveLoadDialog() {
    const dialog = document.getElementById('saveLoadDialog');
    if (dialog) {
        dialog.classList.remove('active');
        setTimeout(() => {
            dialog.classList.add('hidden');
        }, 300);
    }
}

// 加载存档列表
async function loadSavesList() {
    try {
        const savesContainer = document.getElementById('savesList');
        if (!savesContainer) return;

        // 使用新的SaveSystem获取存档列表
        let saves = [];
        if (window.saveSystem) {
            // 获取所有类型的存档
            saves = await window.saveSystem.getSavesList();
            console.log('获取存档列表成功，共', saves.length, '个存档');
        } else if (window.Database && window.Database.db) {
            // 降级到旧方法
            const allSaves = await window.Database.db.gameState.toArray();
            saves = allSaves.filter(save => save.id !== 'main');
        }

        // 按类型和时间排序存档
        saves.sort((a, b) => {
            // 先按类型排序：quick > manual > auto
            const typeOrder = { quick: 0, manual: 1, auto: 2 };
            const typeCompare = typeOrder[a.type] - typeOrder[b.type];
            if (typeCompare !== 0) return typeCompare;
            // 同类型按时间倒序
            return b.timestamp - a.timestamp;
        });

        // 渲染存档列表
        if (saves.length === 0) {
            savesContainer.innerHTML = '<div class="no-saves">暂无存档</div>';
        } else {
            savesContainer.innerHTML = saves.map(save => {
                // 根据存档类型显示不同的图标和颜色
                const typeInfo = {
                    'auto': { icon: '🔄', label: '自动', class: 'type-auto' },
                    'quick': { icon: '⚡', label: '快速', class: 'type-quick' },
                    'manual': { icon: '💾', label: '手动', class: 'type-manual' }
                };
                const type = typeInfo[save.type] || typeInfo.manual;

                // 提取存档信息
                let location = '未知位置';
                let gameDay = 1;
                let hasWorldSnapshot = false;
                let engineCount = 0;

                if (save.gameData?.worldData) {
                    // 新格式：有完整世界快照
                    const wd = save.gameData.worldData;
                    location = wd.player?.position?.location || wd.player?.location || '未知';
                    gameDay = wd.time?.day || 1;
                    hasWorldSnapshot = true;
                    // 计算引擎系统数量
                    if (wd.engineStates) {
                        engineCount = Object.keys(wd.engineStates).length;
                    } else {
                        engineCount = [wd.economy, wd.relationships, wd.weather, wd.farming]
                            .filter(Boolean).length;
                    }
                } else if (save.gameData?.character) {
                    // 旧格式
                    location = save.gameData.character.location || '未知';
                    gameDay = save.gameData.gameTime?.day || 1;
                }

                // 格式化时间
                const date = new Date(save.timestamp || 0);
                const timeStr = date.toLocaleString('zh-CN', {
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                });

                // 存档槽位显示
                const slotInfo = save.slot !== undefined ? `[槽位${save.slot}]` : '';

                return `
                    <div class="save-item ${type.class}" data-id="${save.id}">
                        <div class="save-info">
                            <div class="save-header">
                                <span class="save-icon">${type.icon}</span>
                                <span class="save-name">${save.name || '未命名存档'} ${slotInfo}</span>
                                ${hasWorldSnapshot ? '<span class="world-badge" title="完整世界快照">🌍</span>' : ''}
                            </div>
                            <div class="save-details">
                                <span>📅 第${gameDay}天</span>
                                <span>📍 ${location}</span>
                                <span>🕐 ${timeStr}</span>
                                ${engineCount > 0 ? `<span title="包含${engineCount}个引擎系统">⚙️×${engineCount}</span>` : ''}
                            </div>
                        </div>
                        <div class="save-actions">
                            <button class="save-btn load-btn" onclick="loadSaveGame('${save.id}')">📂 读取</button>
                            <button class="save-btn export-btn" onclick="exportSingleSave('${save.id}')">📤 导出</button>
                            <button class="save-btn delete-btn" onclick="deleteSaveGame('${save.id}')">🗑️ 删除</button>
                        </div>
                    </div>
                `;
            }).join('');
        }
    } catch (error) {
        console.error('加载存档列表失败:', error);
        const savesContainer = document.getElementById('savesList');
        if (savesContainer) {
            savesContainer.innerHTML = '<div class="no-saves">加载存档失败</div>';
        }
    }
}

// 读取存档
async function loadSaveGame(saveId) {
    try {
        let saveData;

        // 使用新的SaveSystem读取存档
        if (window.saveSystem) {
            saveData = await window.saveSystem.loadSave(saveId);
            console.log('📂 读取的存档数据:', saveData);

            if (saveData && saveData.gameData) {
                // 恢复游戏状态
                console.log('📝 恢复前的gameState:', JSON.parse(JSON.stringify(gameState)));
                console.log('📝 存档中的gameData:', saveData.gameData);

                // 深拷贝存档数据以避免引用问题
                const newGameState = JSON.parse(JSON.stringify(saveData.gameData));
                gameState = newGameState;
                window.gameState = gameState;

                console.log('📝 恢复后的gameState:', gameState);

                // 恢复世界状态（包含F1场景）
                if (gameState.worldData && window.worldState) {
                    window.worldState.loadFullState(gameState.worldData);
                    console.log('🌍 世界状态已恢复（包含F1场景）');

                    // 重新绑定选项事件（如果F1区有选项）
                    if (window.gameBootstrap) {
                        window.gameBootstrap.rebindChoiceEvents();
                    }
                }

                // 同步到响应式系统
                if (window.reactiveGameState && gameState.character) {
                    // 只更新character部分，因为reactiveGameState是基于character的
                    Object.assign(window.reactiveGameState, gameState.character);
                    console.log('✅ 已同步到响应式系统');
                }

                // 使用完整的世界UI恢复函数
                if (window.restoreWorldUI) {
                    window.restoreWorldUI();  // 恢复所有区域
                    console.log('🌍 完整世界UI已恢复');
                } else {
                    // 降级到旧方法
                    initializeUI();
                    updateStatus();
                    updateLocationTime();
                }

                // 确保切换到状态页面并强制更新状态条
                if (window.currentTab !== 'status') {
                    window.switchTab('status');
                }

                // 强制刷新所有状态条（确保UI同步）
                setTimeout(() => {
                    if (gameState.character) {
                        updateStatBar('health', gameState.character.health);
                        updateStatBar('mood', gameState.character.mood);
                        updateStatBar('money', gameState.character.money);
                        updateStatBar('energy', gameState.character.energy);
                        updateStatBar('spirit', gameState.character.spirit || 60);
                        console.log('✅ 状态条已强制刷新');
                    }
                }, 100);

                hideSaveLoadDialog();
                showNotification('✅ 存档读取成功！');
            } else {
                showNotification('❌ 存档不存在', 'error');
            }
        } else {
            // 降级到旧方法
            if (window.Database && window.Database.db) {
                saveData = await window.Database.db.gameState.get(saveId);
            } else {
                const data = localStorage.getItem(saveId);
                if (data) {
                    saveData = JSON.parse(data);
                }
            }

            if (saveData) {
                gameState = saveData;
                window.gameState = gameState;

                initializeUI();
                updateStatus();
                updateLocationTime();

                hideSaveLoadDialog();
                showNotification('✅ 存档读取成功！');
            } else {
                showNotification('❌ 存档不存在', 'error');
            }
        }
    } catch (error) {
        console.error('读取存档失败:', error);
        showNotification('❌ 读取存档失败', 'error');
    }
}

// 导出单个存档
async function exportSingleSave(saveId) {
    try {
        await window.Database.exportSave(saveId);
        showNotification('✅ 存档导出成功！', 'success');
    } catch (error) {
        console.error('导出存档失败:', error);
        showNotification('❌ 导出失败: ' + error.message, 'error');
    }
}

// 删除存档
async function deleteSaveGame(saveId) {
    if (!confirm('确定要删除这个存档吗？')) return;

    try {
        // 使用新的SaveSystem删除存档
        if (window.saveSystem) {
            await window.saveSystem.deleteSave(saveId);
        } else if (window.Database && window.Database.db) {
            // 降级到旧方法
            await window.Database.db.gameState.delete(saveId);
        } else {
            localStorage.removeItem(saveId);
        }

        loadSavesList(); // 刷新列表
        showNotification('🗑️ 存档已删除');
    } catch (error) {
        console.error('删除存档失败:', error);
        showNotification('❌ 删除存档失败', 'error');
    }
}

// 显示通知
function showNotification(message, type = 'success') {
    // 使用E区提醒栏显示通知
    const noticeText = document.getElementById('noticeText');
    if (noticeText) {
        noticeText.textContent = message;
        noticeText.className = `notice-text ${type}`;

        // 3秒后恢复默认
        setTimeout(() => {
            noticeText.className = 'notice-text';
        }, 3000);
    } else {
        // 降级使用alert
        alert(message);
    }
}

// 测试函数：修改游戏数值
function testModifyGameState() {
    console.log('🧪 测试：修改游戏状态');

    // 修改gameState核心数据
    gameState.character.mood = 85;
    gameState.character.money = 999;
    gameState.character.health = 75;
    gameState.gameTime.day = 5;
    gameState.gameTime.hour = 14;

    // 同步到window
    window.gameState = gameState;

    // 同步到响应式系统（会自动更新UI）
    if (window.reactiveGameState) {
        window.reactiveGameState.mood = 85;
        window.reactiveGameState.money = 999;
        window.reactiveGameState.health = 75;
        console.log('✅ 已同步到响应式系统');
    }

    // 先切换到状态页确保能看到更新
    if (currentTab !== 'status') {
        console.log('📝 切换到状态页面以查看更新');
        switchTab('status');
    }

    // 强制刷新D区状态显示
    updateStatus();
    updateLocationTime();  // 更新时间显示

    console.log('✅ 游戏状态已修改:', gameState.character);
    console.log('💡 现在创建存档应该能保存这些修改后的数值');

    // E区显示通知
    showNotification('🧪 测试数据已设置：心情85，金钱999，健康75');
}

// 快速读档功能（F9）
async function quickLoad() {
    // 检查是否可以读档（使用相同的限制）
    const saveCheck = canSaveGame();
    if (!saveCheck.canSave) {
        showNotification(`⚠️ ${saveCheck.reason.replace('存档', '读档')}`, 'warning');
        return;
    }

    try {
        // 获取最新的快速存档
        const quickSaves = await window.saveSystem.getSavesList('quick');
        if (!quickSaves || quickSaves.length === 0) {
            showNotification('❌ 没有找到快速存档', 'error');
            return;
        }

        // 找到最新的快速存档
        const latestSave = quickSaves.reduce((latest, save) => {
            return save.timestamp > latest.timestamp ? save : latest;
        });

        // 显示确认对话框
        const confirmResult = confirm(
            `确定要读取快速存档吗？\n` +
            `存档时间: ${new Date(latestSave.timestamp).toLocaleString()}\n` +
            `当前未保存的进度将会丢失！`
        );

        if (!confirmResult) {
            console.log('📖 用户取消了快速读档');
            return;
        }

        // 显示进度条
        showSaveProgress(true);
        showNotification('⏳ 正在读取快速存档...', 'info');

        // 加载存档
        const success = await loadSaveGame(latestSave.id);

        // 隐藏进度条
        showSaveProgress(false);

        if (success) {
            // 显示闪光动画
            showSaveFlash();
            showNotification('快速存档读取成功！', 'success');
            console.log('📖 快速存档已恢复');
        } else {
            showNotification('快速存档读取失败', 'error');
        }

    } catch (error) {
        console.error('❌ 快速读档失败:', error);
        showNotification('❌ 快速读档失败: ' + error.message, 'error');
    }
}

// 测试数据修改函数（用于验证存档恢复）
function testData() {
    console.log('🧪 修改测试数据...');

    // 修改角色属性
    if (window.gameState && window.gameState.character) {
        window.gameState.character.mood = 85;
        window.gameState.character.money = 999;
        window.gameState.character.health = 75;
        window.gameState.character.energy = 90;

        // 同步到响应式系统（自动更新UI）
        if (window.reactiveGameState) {
            window.reactiveGameState.mood = 85;
            window.reactiveGameState.money = 999;
            window.reactiveGameState.health = 75;
            window.reactiveGameState.energy = 90;
        }

        // 同步到worldState
        if (window.worldState) {
            window.worldState.state.player.stats = {
                health: 75,
                mood: 85,
                money: 999,
                energy: 90,
                spirit: window.gameState.character.spirit || 60
            };
        }

        console.log('✅ 数据修改完成:');
        console.log('  心情: 85');
        console.log('  金钱: 999');
        console.log('  健康: 75');
        console.log('  精力: 90');

        // 切换到状态页面以查看变化
        if (window.currentTab !== 'status') {
            console.log('📝 切换到状态页面');
            window.switchTab('status');
        }

        // 强制更新状态条
        updateStatBar('health', 75);
        updateStatBar('mood', 85);
        updateStatBar('money', 999);
        updateStatBar('energy', 90);
        updateStatBar('spirit', window.gameState.character.spirit || 60);

        // 更新UI显示
        if (window.updateGameUI) {
            window.updateGameUI();
        }

        showNotification('🧪 测试数据已修改', 'success');
        return true;
    } else {
        console.error('❌ gameState未初始化');
        return false;
    }
}

// 立即导出存档系统函数到全局
window.quickSave = quickSave;
window.quickLoad = quickLoad;
window.testData = testData;

// 导出NPC关系测试函数
window.testNPC = {
    // 初始化所有NPC
    init: () => {
        if (window.npcHelpers) {
            window.npcHelpers.initializeAllNPCs();
            console.log('✅ NPC关系已初始化');
            switchTab('social');
        }
    },

    // 增加好感度
    addLove: (npcId, amount = 10) => {
        if (window.relationships) {
            window.relationships.adjustAffection(npcId || 'Zero', amount);
            switchTab('social');
        }
    },

    // 增加信任度
    addTrust: (npcId, amount = 10) => {
        if (window.relationships) {
            window.relationships.adjustTrust(npcId || 'Zero', amount);
            switchTab('social');
        }
    },

    // 送礼物
    gift: (npcId, reaction = 'like') => {
        if (window.relationships) {
            window.relationships.giveGift(npcId || 'Zero', 'test_gift', reaction);
            switchTab('social');
        }
    },

    // 查看关系摘要
    status: () => {
        if (window.relationships) {
            const summaries = window.relationships.getAllRelationshipSummaries();
            console.table(summaries);
        }
    }
};

console.log('💕 NPC测试命令已加载:');
console.log('- testNPC.init() : 初始化所有NPC');
console.log('- testNPC.addLove("Zero", 20) : 增加好感度');
console.log('- testNPC.addTrust("Zero", 10) : 增加信任度');
console.log('- testNPC.gift("Zero", "love") : 送礼物');
console.log('- testNPC.status() : 查看所有关系');
window.createManualSave = createManualSave;
window.showSaveLoadDialog = showSaveLoadDialog;
window.hideSaveLoadDialog = hideSaveLoadDialog;
window.loadSaveGame = loadSaveGame;
window.deleteSaveGame = deleteSaveGame;
window.exportSingleSave = exportSingleSave;
window.loadSavesList = loadSavesList;
window.testModifyGameState = testModifyGameState;  // 导出测试函数

// ==================== 时间详情浮层系统 ====================

function initTimeDetailTooltip() {
    const timeElement = document.getElementById("currentTime");
    if (!timeElement) return;

    let tooltip = document.getElementById("timeDetailTooltip");
    if (!tooltip) {
        tooltip = document.createElement("div");
        tooltip.id = "timeDetailTooltip";
        tooltip.className = "time-detail-tooltip";
        document.body.appendChild(tooltip);
    }

    let longPressTimer = null;
    let isTooltipVisible = false;

    function updateTooltipContent() {
        if (!window.timeSystem) return "";

        const time = window.timeSystem.currentTime;
        const holiday = window.timeSystem.isHoliday();
        const isRest = window.timeSystem.isRestDay();

        let content = `
            <div class="time-detail-content">
                <div class="time-detail-row">
                    <span class="time-detail-label">📅 完整时间</span>
                    <span class="time-detail-value">${window.timeSystem.formatTime("long")}</span>
                </div>
                <div class="time-detail-row">
                    <span class="time-detail-label">🌍 年份/季节</span>
                    <span class="time-detail-value">第${time.year}年 ${window.timeSystem.getSeasonName()}</span>
                </div>
                <div class="time-detail-row">
                    <span class="time-detail-label">📆 年内进度</span>
                    <span class="time-detail-value">${time.dayOfYear}/180天</span>
                </div>
                <div class="time-detail-row">
                    <span class="time-detail-label">⏰ 时段</span>
                    <span class="time-detail-value">${window.timeSystem.getTimeIcon()} ${window.timeSystem.getPeriodName()}</span>
                </div>
        `;

        if (isRest) {
            content += `
                <div class="time-detail-row">
                    <span class="time-detail-label">🏖️ 特殊</span>
                    <span class="time-detail-value time-detail-highlight">休息日</span>
                </div>
            `;
        }

        if (holiday) {
            content += `
                <div class="time-detail-row">
                    <span class="time-detail-label">🎉 节日</span>
                    <span class="time-detail-value time-detail-highlight">${holiday}</span>
                </div>
            `;
        }

        content += `</div>`;
        return content;
    }

    function showTooltip() {
        // 🔥 关键：如果天气浮层正在显示，先关闭它
        const weatherTooltip = document.getElementById("weatherDetailTooltip");
        if (weatherTooltip && weatherTooltip.classList.contains("show")) {
            weatherTooltip.classList.remove("show");
        }

        tooltip.innerHTML = updateTooltipContent();
        const rect = timeElement.getBoundingClientRect();
        // 确保浮层不超出屏幕边界
        const tooltipWidth = 260; // 预估宽度
        let left = rect.left + rect.width / 2;

        // 防止超出右边界
        if (left + tooltipWidth / 2 > window.innerWidth - 10) {
            left = window.innerWidth - tooltipWidth / 2 - 10;
        }
        // 防止超出左边界
        if (left - tooltipWidth / 2 < 10) {
            left = tooltipWidth / 2 + 10;
        }

        tooltip.style.left = left + "px";
        tooltip.style.top = (rect.bottom + 10) + "px";
        tooltip.style.transform = "translateX(-50%)";
        requestAnimationFrame(() => {
            tooltip.classList.add("show");
        });
        isTooltipVisible = true;
    }

    function hideTooltip() {
        tooltip.classList.remove("show");
        isTooltipVisible = false;
    }

    timeElement.addEventListener("mouseenter", () => {
        if (window.innerWidth > 768) showTooltip();
    });

    timeElement.addEventListener("mouseleave", () => {
        if (window.innerWidth > 768) hideTooltip();
    });

    timeElement.addEventListener("touchstart", (e) => {
        e.preventDefault();
        longPressTimer = setTimeout(() => {
            showTooltip();
            if (navigator.vibrate) navigator.vibrate(50);
        }, 500);
    }, { passive: false });

    timeElement.addEventListener("touchend", () => {
        if (longPressTimer) {
            clearTimeout(longPressTimer);
            longPressTimer = null;
        }
        if (isTooltipVisible) {
            setTimeout(hideTooltip, 2000);
        }
    });

    timeElement.addEventListener("touchmove", () => {
        if (longPressTimer) {
            clearTimeout(longPressTimer);
            longPressTimer = null;
        }
    });

    document.addEventListener("click", (e) => {
        if (isTooltipVisible && !timeElement.contains(e.target)) hideTooltip();
    });

    console.log("⏰ 时间详情浮层已初始化");
}

window.initTimeDetailTooltip = initTimeDetailTooltip;


// ==================== 天气UI系统 ====================

/**
 * 初始化天气详情浮层
 */
function initWeatherDetailTooltip() {
    const weatherIcon = document.getElementById("currentWeatherIcon");
    const timeElement = document.getElementById("currentTime");

    if (!weatherIcon) {
        console.warn('❌ 天气图标元素未找到');
        return;
    }

    // 动态创建天气浮层（与时间浮层一致）
    let tooltip = document.getElementById("weatherDetailTooltip");
    if (!tooltip) {
        tooltip = document.createElement("div");
        tooltip.id = "weatherDetailTooltip";
        tooltip.className = "weather-detail-tooltip";
        document.body.appendChild(tooltip);
    }

    let longPressTimer = null;
    let isTooltipVisible = false;

    function updateTooltipContent() {
        if (!window.weatherSystem) {
            return `<div class="weather-detail-content">
                <div class="weather-detail-row">
                    <span class="weather-detail-label">⚠️ 天气系统未初始化</span>
                </div>
            </div>`;
        }

        const weatherInfo = window.weatherSystem.getCurrentWeatherInfo();
        const climateInfo = window.climateManager ? window.climateManager.getCurrentClimate() : null;

        const tempClass = weatherInfo.temperature > 30 ? 'temp-hot' :
                         weatherInfo.temperature < 10 ? 'temp-cold' : 'temp-normal';

        // 获取详细描述
        const currentWeatherType = window.weatherSystem.weatherTypes[window.weatherSystem.currentWeather];
        const detailDesc = currentWeatherType?.detailDescription || weatherInfo.description;

        let content = `
            <div class="weather-detail-content">
                <div class="weather-detail-header">
                    <span class="weather-icon-large">${weatherInfo.icon}</span>
                    <span class="weather-name">${weatherInfo.weather}</span>
                    <span class="weather-description">${detailDesc}</span>
                </div>

                <div class="weather-detail-section">
                    <div class="weather-detail-section-title">📊 当前状况</div>
                    <div class="weather-detail-row">
                        <span class="weather-detail-label">🌡️ 温度</span>
                        <span class="weather-detail-value ${tempClass}">${weatherInfo.temperature}°C</span>
                    </div>
                    <div class="weather-detail-row">
                        <span class="weather-detail-label">🍂 季节</span>
                        <span class="weather-detail-value">${weatherInfo.season}</span>
                    </div>
                    <div class="weather-detail-row">
                        <span class="weather-detail-label">👁️ 能见度</span>
                        <span class="weather-detail-value">${weatherInfo.visibility}%</span>
                    </div>
                </div>
        `;

        // 年份周期和特殊事件部分（总是显示，有占位）
        content += `<div class="weather-detail-divider"></div>`;
        content += `<div class="weather-detail-section">`;
        content += `<div class="weather-detail-section-title">🌍 世界状态</div>`;

        if (climateInfo) {
            const yearNames = {
                'peaceful': '🕊️ 平和之年',
                'turbulent_1': '⚠️ 小动荡之年',
                'turbulent_2': '☢️ 大动荡之年'
            };
            const yearDisplay = yearNames[climateInfo.yearType] || climateInfo.yearType;

            content += `
                <div class="weather-detail-row">
                    <span class="weather-detail-label">📅 年份周期</span>
                    <span class="weather-detail-value weather-detail-highlight">${yearDisplay}</span>
                </div>
            `;
        } else {
            content += `
                <div class="weather-detail-row">
                    <span class="weather-detail-label">📅 年份周期</span>
                    <span class="weather-detail-value weather-detail-placeholder">加载中...</span>
                </div>
            `;
        }

        // 季节活动/节日（总是显示格子）
        let hasEvent = false;
        if (climateInfo) {
            const hasSeasonalEvent = climateInfo.seasonalEvent;
            const hasExtremeEvent = climateInfo.extremeEvent;

            if (hasExtremeEvent) {
                content += `
                    <div class="weather-detail-row weather-detail-row-danger">
                        <span class="weather-detail-label">⚠️ 极端天气</span>
                        <span class="weather-detail-value weather-detail-warning">${climateInfo.extremeEvent.name}</span>
                    </div>
                `;
                hasEvent = true;
            } else if (hasSeasonalEvent) {
                content += `
                    <div class="weather-detail-row weather-detail-row-highlight">
                        <span class="weather-detail-label">🎊 季节活动</span>
                        <span class="weather-detail-value weather-detail-highlight">${climateInfo.seasonalEvent}</span>
                    </div>
                `;
                hasEvent = true;
            }
        }

        // 如果没有事件，显示占位
        if (!hasEvent) {
            content += `
                <div class="weather-detail-row">
                    <span class="weather-detail-label">🎊 特殊事件</span>
                    <span class="weather-detail-value weather-detail-placeholder">暂无活动</span>
                </div>
            `;
        }

        content += `</div>`; // 结束世界状态section

        // 添加天气预报部分
        content += `
            <div class="weather-detail-divider"></div>
            <div class="weather-detail-section">
                <div class="weather-detail-section-title">📅 未来3天预报</div>
        `;

        if (weatherInfo.forecast && weatherInfo.forecast.length > 0) {
            weatherInfo.forecast.forEach((dayForecast, index) => {
                const forecastTemp = dayForecast.temperature;
                const forecastTempClass = forecastTemp > 30 ? 'temp-hot' :
                                         forecastTemp < 10 ? 'temp-cold' : 'temp-normal';
                const forecastWeatherType = window.weatherSystem.weatherTypes[dayForecast.weather];
                const forecastIcon = forecastWeatherType ? forecastWeatherType.icon : '☀️';
                const forecastName = forecastWeatherType ? forecastWeatherType.name : '未知';

                // 🌤️ Stage 3: 显示相对日期
                const dayLabels = ['明天', '后天', '第3天'];
                const dayLabel = dayLabels[index] || `第${index + 1}天`;

                content += `
                    <div class="weather-forecast-item">
                        <span class="forecast-day">${dayLabel}</span>
                        <span class="forecast-icon">${forecastIcon}</span>
                        <span class="forecast-name">${forecastName}</span>
                        <span class="forecast-temp ${forecastTempClass}">${forecastTemp}°C</span>
                    </div>
                `;
            });
        } else {
            content += `
                <div class="weather-forecast-item">
                    <span class="forecast-placeholder">暂无预报数据</span>
                </div>
            `;
        }

        content += `</div></div>`;
        return content;
    }

    function showTooltip() {
        // 🔥 关键：如果时间浮层正在显示，先关闭它
        const timeTooltip = document.getElementById("timeDetailTooltip");
        if (timeTooltip && timeTooltip.classList.contains("show")) {
            timeTooltip.classList.remove("show");
        }

        tooltip.innerHTML = updateTooltipContent();
        const rect = weatherIcon.getBoundingClientRect();

        // 动态计算位置，防止超出屏幕
        const tooltipWidth = 280; // 预估宽度
        let left = rect.left + rect.width / 2;

        // 防止超出右边界
        if (left + tooltipWidth / 2 > window.innerWidth - 10) {
            left = window.innerWidth - tooltipWidth / 2 - 10;
        }
        // 防止超出左边界
        if (left - tooltipWidth / 2 < 10) {
            left = tooltipWidth / 2 + 10;
        }

        tooltip.style.left = left + "px";
        tooltip.style.top = (rect.bottom + 10) + "px";
        tooltip.style.transform = "translateX(-50%)";

        requestAnimationFrame(() => {
            tooltip.classList.add("show");
        });
        isTooltipVisible = true;
    }

    function hideTooltip() {
        tooltip.classList.remove("show");
        isTooltipVisible = false;
    }

    // PC端：鼠标悬停（只在非移动端启用）
    weatherIcon.addEventListener("mouseenter", () => {
        if (window.innerWidth > 768) showTooltip();
    });

    weatherIcon.addEventListener("mouseleave", () => {
        if (window.innerWidth > 768) hideTooltip();
    });

    // 移动端/PWA：长按触发（500ms）
    weatherIcon.addEventListener("touchstart", (e) => {
        e.preventDefault();
        longPressTimer = setTimeout(() => {
            showTooltip();
            // PWA震动反馈
            if (navigator.vibrate) {
                navigator.vibrate(50);
            }
        }, 500);
    }, { passive: false });

    weatherIcon.addEventListener("touchend", () => {
        if (longPressTimer) {
            clearTimeout(longPressTimer);
            longPressTimer = null;
        }
        // 显示后2秒自动关闭
        if (isTooltipVisible) {
            setTimeout(hideTooltip, 2000);
        }
    });

    weatherIcon.addEventListener("touchmove", () => {
        // 手指移动时取消长按
        if (longPressTimer) {
            clearTimeout(longPressTimer);
            longPressTimer = null;
        }
    });

    // 点击其他地方关闭浮层
    document.addEventListener("click", (e) => {
        if (isTooltipVisible && !weatherIcon.contains(e.target)) {
            hideTooltip();
        }
    });

    console.log("🌤️ 天气详情浮层已初始化");
}

/**
 * 更新天气图标显示
 */
function updateWeatherIcon() {
    const weatherIcon = document.getElementById("currentWeatherIcon");
    if (!weatherIcon || !window.weatherSystem) return;

    const weatherInfo = window.weatherSystem.getCurrentWeatherInfo();
    weatherIcon.textContent = weatherInfo.icon;
}

/**
 * 生成天气特效粒子
 */
function createWeatherEffects(weatherType, intensity = 0.5) {
    // 优先处理需要weatherEffectController的特殊天气
    if (window.weatherEffectController) {
        // 🔥 所有特殊天气都由weatherEffectController处理
        const specialWeathers = ['sakura', 'rainbow', 'meteor_shower', 'polluted'];

        // 如果是特殊天气，使用weatherEffectController处理
        if (specialWeathers.includes(weatherType)) {
            console.log('🌈 使用weatherEffectController显示特效:', weatherType);

            // 先移除之前的特殊效果（如果有）
            if (window.weatherEffectController.currentEffect) {
                window.weatherEffectController.removeEffect();
            }

            // 显示新的特殊效果
            window.weatherEffectController.showEffect(weatherType, intensity);

            // 清除基础天气效果
            const rainEffect = document.getElementById('rainEffect');
            const snowEffect = document.getElementById('snowEffect');
            const sakuraEffect = document.getElementById('sakuraEffect');
            if (rainEffect) {
                rainEffect.classList.remove('active', 'stormy');
                rainEffect.innerHTML = '';
            }
            if (snowEffect) {
                snowEffect.classList.remove('active');
                snowEffect.innerHTML = '';
            }
            if (sakuraEffect) {
                sakuraEffect.classList.remove('active');
                sakuraEffect.innerHTML = '';
            }
            return;
        }

        // 如果当前有特殊效果在显示，先移除（切换到普通天气时）
        if (window.weatherEffectController.currentEffect) {
            console.log('清除特殊天气效果:', window.weatherEffectController.currentEffect);
            window.weatherEffectController.removeEffect();
        }
    }

    const rainEffect = document.getElementById('rainEffect');
    const snowEffect = document.getElementById('snowEffect');
    const sakuraEffect = document.getElementById('sakuraEffect');

    if (!rainEffect || !snowEffect || !sakuraEffect) return;

    // 清除所有效果
    rainEffect.classList.remove('active', 'stormy');
    snowEffect.classList.remove('active');
    sakuraEffect.classList.remove('active');
    rainEffect.innerHTML = '';
    snowEffect.innerHTML = '';
    sakuraEffect.innerHTML = '';

    // 根据天气类型生成效果
    switch (weatherType) {
        case 'rainy':
            createRainDrops(rainEffect, Math.floor(50 * intensity));
            rainEffect.classList.add('active');
            break;

        case 'stormy':
            createRainDrops(rainEffect, Math.floor(100 * intensity));
            rainEffect.classList.add('active', 'stormy');
            break;

        case 'snowy':
            createSnowflakes(snowEffect, Math.floor(50 * intensity));
            snowEffect.classList.add('active');
            break;

        // 🔥 樱花效果已由weatherEffectController处理（line 2872）
        case 'sakura':
            // 不做任何操作，特效由weatherEffectController统一管理
            break;
    }
}

/**
 * 创建雨滴
 */
function createRainDrops(container, count) {
    for (let i = 0; i < count; i++) {
        const drop = document.createElement('div');
        drop.className = 'rain-drop';
        drop.style.left = Math.random() * 100 + '%';
        drop.style.animationDuration = (Math.random() * 0.5 + 0.5) + 's';
        drop.style.animationDelay = Math.random() * 2 + 's';
        container.appendChild(drop);
    }
}

/**
 * 创建雪花
 */
function createSnowflakes(container, count) {
    for (let i = 0; i < count; i++) {
        const flake = document.createElement('div');
        flake.className = 'snowflake';
        flake.style.left = Math.random() * 100 + '%';
        flake.style.animationDuration = (Math.random() * 3 + 2) + 's';
        flake.style.animationDelay = Math.random() * 5 + 's';
        container.appendChild(flake);
    }
}

/**
 * 创建樱花花瓣
 */
function createSakuraPetals(container, count) {
    for (let i = 0; i < count; i++) {
        const petal = document.createElement('div');
        petal.className = 'sakura-petal';
        petal.style.left = Math.random() * 100 + '%';
        petal.style.animationDuration = (Math.random() * 5 + 5) + 's';
        petal.style.animationDelay = Math.random() * 10 + 's';
        container.appendChild(petal);
    }
}

/**
 * 监听天气变化并更新UI和特效
 */
function setupWeatherListeners() {
    if (!window.reactiveSystem) {
        console.warn('❌ reactiveSystem未初始化，无法监听天气变化');
        return;
    }

    // 监听天气变化
    window.reactiveSystem.watch('environment.weather', (newWeather, oldWeather) => {
        console.log(`🌦️ 天气变化: ${oldWeather} → ${newWeather}`);

        // 更新图标
        updateWeatherIcon();

        // 🔥 特效已由weatherSystem.setWeather()统一管理，不需要重复调用
        // weatherEffectController会自动处理特效创建

        // E区显示通知
        const weatherInfo = window.weatherSystem?.getCurrentWeatherInfo();
        if (weatherInfo && window.showNotification) {
            window.showNotification(`天气变化：${weatherInfo.icon} ${weatherInfo.weather}`);
        }
    });

    // 监听季节变化
    window.reactiveSystem.watch('environment.season', (newSeason, oldSeason) => {
        console.log(`🍂 季节变化: ${oldSeason} → ${newSeason}`);
        updateWeatherIcon();
    });

    console.log('🌤️ 天气UI监听器已设置');
}

// 导出到全局
window.initWeatherDetailTooltip = initWeatherDetailTooltip;
window.updateWeatherIcon = updateWeatherIcon;
window.createWeatherEffects = createWeatherEffects;
window.setupWeatherListeners = setupWeatherListeners;


// ==================== 立绘呼吸动画控制系统 ====================

/**
 * 设置角色呼吸动画状态
 * @param {string} state - 呼吸状态: 'normal'|'gentle'|'deep'|'excited'|'sleeping'|'resting'
 */
function setSpriteBreathing(state = 'normal') {
    const sprite = document.getElementById('characterSprite');
    if (!sprite) return;
    
    // 清除所有呼吸类
    sprite.className = sprite.className.replace(/\b(breathing-\w+|resting|excited|sleeping)\b/g, '');
    
    // 添加新的呼吸状态
    switch(state) {
        case 'gentle':
            sprite.classList.add('breathing-gentle');
            break;
        case 'deep':
            sprite.classList.add('breathing-deep');
            break;
        case 'excited':
            sprite.classList.add('excited');  // 使用CSS中定义的excited类
            break;
        case 'sleeping':
            sprite.classList.add('sleeping');
            break;
        case 'resting':
            sprite.classList.add('resting');
            break;
        case 'normal':
        default:
            sprite.classList.add('breathing-normal');
            break;
    }
    
    console.log(`🫁 立绘呼吸状态切换为: ${state}`);
}

/**
 * 根据角色状态自动调整呼吸
 */
function updateBreathingByStatus() {
    if (!window.gameState || !window.gameState.character) return;
    
    const energy = window.gameState.character.energy || 80;
    const mood = window.gameState.character.mood || 50;
    const health = window.gameState.character.health || 100;
    
    // 根据精力值判断呼吸状态
    if (energy < 20) {
        setSpriteBreathing('deep');  // 疲惫，深呼吸
    } else if (energy < 40) {
        setSpriteBreathing('normal');  // 一般状态
    } else if (mood > 80) {
        setSpriteBreathing('excited');  // 兴奋状态
    } else if (energy > 90 && mood > 60) {
        setSpriteBreathing('gentle');  // 精力充沛且心情好，轻柔呼吸
    } else {
        setSpriteBreathing('normal');  // 默认状态
    }
}

// 导出到全局
window.setSpriteBreathing = setSpriteBreathing;
window.updateBreathingByStatus = updateBreathingByStatus;

console.log('🫁 立绘呼吸动画系统已加载');
console.log('使用方法: setSpriteBreathing("gentle") / setSpriteBreathing("deep") / setSpriteBreathing("excited")');

// ==================== 音频UI初始化 ====================

/**
 * 初始化音频UI状态
 */
function initAudioUI() {
    if (!window.audioSystem) return;

    // 更新音效按钮
    const soundBtn = document.querySelector('[data-action="sound"]');
    if (soundBtn) {
        soundBtn.textContent = `🔊 音效: ${window.audioSystem.enabled.sfx ? '开启' : '关闭'}`;
    }

    // 更新音乐按钮
    const musicBtn = document.querySelector('[data-action="music"]');
    if (musicBtn) {
        musicBtn.textContent = `🎵 音乐: ${window.audioSystem.enabled.bgm ? '开启' : '关闭'}`;
    }

    console.log('🔊 音频UI已初始化');
}

// 页面加载完成后初始化音频UI
setTimeout(() => {
    initAudioUI();
}, 100);

// 导出函数
window.initAudioUI = initAudioUI;

// ==================== Wiki百科系统 ====================

/**
 * 打开Wiki百科
 */
function openWiki(categoryId = null, articleId = null) {
    const modal = document.getElementById('wikiModal');
    if (!modal) return;

    // 显示浮层
    modal.style.display = 'flex';

    // 初始化分类
    if (!window.wikiInitialized) {
        initWikiCategories();
        window.wikiInitialized = true;
    }

    // 如果指定了文章，直接显示
    if (articleId) {
        showWikiArticle(articleId);
    } else if (categoryId) {
        showWikiCategory(categoryId);
    } else {
        showWikiHome();
    }

    console.log('📚 Wiki百科已打开');
}

/**
 * 关闭Wiki
 */
function closeWiki() {
    const modal = document.getElementById('wikiModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

/**
 * 初始化分类列表
 */
function initWikiCategories() {
    const container = document.getElementById('wikiCategories');
    if (!container || !window.GameWiki) return;

    container.innerHTML = '';

    window.GameWiki.categories.forEach(category => {
        const categoryItem = document.createElement('div');
        categoryItem.className = 'wiki-category-item';
        categoryItem.onclick = () => showWikiCategory(category.id);

        const articles = window.GameWiki.getArticlesByCategory(category.id);
        const count = articles.length;

        categoryItem.innerHTML = `
            <span class="category-icon">${category.icon}</span>
            <span class="category-name">${category.name}</span>
            <span class="category-count">${count}</span>
        `;

        container.appendChild(categoryItem);
    });
}

/**
 * 显示分类下的文章列表
 */
function showWikiCategory(categoryId) {
    const content = document.getElementById('wikiContent');
    const breadcrumb = document.getElementById('wikiBreadcrumb');
    if (!content || !window.GameWiki) return;

    const category = window.GameWiki.categories.find(c => c.id === categoryId);
    if (!category) return;

    const articles = window.GameWiki.getArticlesByCategory(categoryId);

    // 更新面包屑
    breadcrumb.innerHTML = `
        <span class="breadcrumb-home" onclick="showWikiHome()">首页</span>
        <span class="breadcrumb-separator">›</span>
        <span class="breadcrumb-current">${category.name}</span>
    `;

    // 显示文章列表
    let html = `
        <h1>${category.icon} ${category.name}</h1>
        <div class="wiki-article-list">
    `;

    articles.forEach(article => {
        html += `
            <div class="wiki-article-card" onclick="showWikiArticle('${article.id}')">
                <div class="article-icon">${article.icon}</div>
                <div class="article-info">
                    <h3>${article.title}</h3>
                </div>
                <div class="article-arrow">›</div>
            </div>
        `;
    });

    html += '</div>';
    content.innerHTML = html;
}

/**
 * 显示文章内容
 */
function showWikiArticle(articleId) {
    const content = document.getElementById('wikiContent');
    const breadcrumb = document.getElementById('wikiBreadcrumb');
    if (!content || !window.GameWiki) return;

    const article = window.GameWiki.getArticle(articleId);
    if (!article) return;

    const category = window.GameWiki.categories.find(c => c.id === article.category);

    // 更新面包屑
    breadcrumb.innerHTML = `
        <span class="breadcrumb-home" onclick="showWikiHome()">首页</span>
        <span class="breadcrumb-separator">›</span>
        <span class="breadcrumb-link" onclick="showWikiCategory('${article.category}')">${category?.name || '分类'}</span>
        <span class="breadcrumb-separator">›</span>
        <span class="breadcrumb-current">${article.title}</span>
    `;

    // 显示文章内容
    content.innerHTML = `
        <div class="wiki-article">
            ${article.content}
        </div>
    `;

    // 滚动到顶部
    content.scrollTop = 0;
}

/**
 * 显示首页
 */
function showWikiHome() {
    const content = document.getElementById('wikiContent');
    const breadcrumb = document.getElementById('wikiBreadcrumb');
    if (!content) return;

    breadcrumb.innerHTML = `<span class="breadcrumb-home">首页</span>`;

    content.innerHTML = `
        <div class="wiki-welcome">
            <h1>📚 欢迎来到Reality游戏百科</h1>
            <p>这里有你需要的一切游戏信息和攻略</p>

            <div class="wiki-quick-links">
                <div class="quick-link-card" onclick="showWikiArticle('climate_overview')">
                    <div class="quick-link-icon">🌍</div>
                    <h3>气候系统</h3>
                    <p>了解天气、季节和动荡年</p>
                </div>
                <div class="quick-link-card" onclick="showWikiArticle('climate_seasonal_events')">
                    <div class="quick-link-icon">🎉</div>
                    <h3>季节活动</h3>
                    <p>樱花周、夏日祭等精彩活动</p>
                </div>
                <div class="quick-link-card" onclick="showWikiArticle('climate_tips')">
                    <div class="quick-link-icon">💡</div>
                    <h3>攻略技巧</h3>
                    <p>赚钱、种植、应对极端天气</p>
                </div>
                <div class="quick-link-card" onclick="showWikiArticle('tips_beginner')">
                    <div class="quick-link-icon">📘</div>
                    <h3>新手必读</h3>
                    <p>开局建议和常见问题</p>
                </div>
            </div>

            <div class="wiki-categories-grid">
                ${window.GameWiki.categories.map(cat => `
                    <div class="category-grid-item" onclick="showWikiCategory('${cat.id}')">
                        <div class="category-grid-icon">${cat.icon}</div>
                        <div class="category-grid-name">${cat.name}</div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

/**
 * 搜索Wiki
 */
function searchWiki(keyword) {
    if (!keyword || keyword.length < 2) {
        return;
    }

    const content = document.getElementById('wikiContent');
    const breadcrumb = document.getElementById('wikiBreadcrumb');
    if (!content || !window.GameWiki) return;

    const results = window.GameWiki.searchArticles(keyword);

    breadcrumb.innerHTML = `
        <span class="breadcrumb-home" onclick="showWikiHome()">首页</span>
        <span class="breadcrumb-separator">›</span>
        <span class="breadcrumb-current">搜索: ${keyword}</span>
    `;

    let html = `<h1>🔍 搜索结果 "${keyword}"</h1>`;

    if (results.length === 0) {
        html += '<p class="no-results">未找到相关内容</p>';
    } else {
        html += '<div class="wiki-article-list">';
        results.forEach(article => {
            const category = window.GameWiki.categories.find(c => c.id === article.category);
            html += `
                <div class="wiki-article-card" onclick="showWikiArticle('${article.id}')">
                    <div class="article-icon">${article.icon}</div>
                    <div class="article-info">
                        <h3>${article.title}</h3>
                        <p class="article-category">${category?.name || ''}</p>
                    </div>
                    <div class="article-arrow">›</div>
                </div>
            `;
        });
        html += '</div>';
    }

    content.innerHTML = html;
}

// 导出函数
window.openWiki = openWiki;
window.closeWiki = closeWiki;
window.showWikiCategory = showWikiCategory;
window.showWikiArticle = showWikiArticle;
window.showWikiHome = showWikiHome;
window.searchWiki = searchWiki;

console.log('📚 Wiki百科系统已加载');
console.log('使用 openWiki() 打开百科');
