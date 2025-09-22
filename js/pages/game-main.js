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

// 异步初始化游戏主函数
async function initializeGame() {
    try {
        console.log('📝 小纸条：开始异步初始化游戏...');

        // 1. 先异步加载gameState
        await loadGameState();

        // 2. 确保gameState不为null
        if (!gameState || !gameState.character) {
            console.log('📝 小纸条：gameState为空，使用默认值');
            gameState = getDefaultGameState();
        }

        // 3. 将gameState设置为全局变量，供其他模块使用
        window.gameState = gameState;

        console.log('📝 小纸条：gameState初始化完成:', gameState);
        console.log('📝 小纸条：window.gameState已设置:', window.gameState);

        // 3. 然后初始化UI
        initializeUI();

        // 4. 绑定输入事件
        setupEventListeners();

        // 5. 导出函数供其他模块使用（必须在startGame之前）
        window.updateGameUI = updateStatus;  // 改名避免冲突
        window.updateLocationTime = updateLocationTime;  // 导出位置时间更新函数
        window.saveGameState = saveGameState;  // 导出游戏保存函数
        window.switchTab = switchTab;
        console.log('📝 小纸条：导出函数到window对象完成');

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
        }
    };
}

// 加载游戏状态
async function loadGameState() {
    try {
        // 优先从IndexedDB加载
        if (window.Database && window.Database.db) {
            const savedState = await window.Database.loadGameState();
            if (savedState) {
                gameState = savedState;
                window.gameState = gameState; // 同步到全局
                console.log('✅ 从IndexedDB加载游戏状态:', gameState);
                return;
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
    document.getElementById('characterName').textContent = gameState.character.name || '角色';

    // 更新状态值
    updateStatus();

    // 更新位置和时间
    updateLocationTime();

    // 初始化标签页内容
    initializeTabContents();
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

    // 更新时间（使用TimeSystem）
    if (window.timeSystem) {
        const timeStr = window.timeSystem.formatTime('icon');
        document.getElementById('currentTime').textContent = timeStr;
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

// 切换标签页
function switchTab(tabName) {
    console.log('🎯 切换到标签页:', tabName);

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
        'social': `
            <div class="tab-content">
                <div class="tab-item-container small-text">
                    <div class="tab-item">林学长: ❤️❤️❤️🤍🤍</div>
                    <div class="tab-item">张同学: ❤️❤️🤍🤍🤍</div>
                    <div class="tab-item">夜同学: ❤️🤍🤍🤍🤍</div>
                    <div class="tab-item">小明: ❤️❤️❤️❤️🤍</div>
                </div>
            </div>
        `,
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
                    <div class="tab-item settings-item" data-action="save-load">💾 存档管理</div>
                    <div class="tab-item settings-item" data-action="quick-save">⚡ 快速存档</div>
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
                        quickSave();
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
                        if (typeof returnToMenu === 'function') returnToMenu();
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
}

// 开始游戏

function startGame() {
    // 显示初始剧情
    const storyArea = document.getElementById('storyArea');

    // 如果有原有的地点系统，使用它
    if (typeof gameData !== 'undefined' && gameData.locations) {
        const location = gameData.locations[gameState.character.location];
        if (location) {
            displayStory(location.description);
            displayChoices(location.options);
        }
    } else {
        // 新版本使用场景管理器加载开场场景
        if (window.sceneManager && window.OpeningScenes) {
            console.log('开始加载开场场景...');
            window.sceneManager.loadScene(window.OpeningScenes.awakening);
        } else {
            console.error('场景管理器或开场场景数据未找到');
        }
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
    gameState.character.location = location;

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

// 保存游戏状态
async function saveGameState() {
    try {
        // 优先保存到IndexedDB
        if (window.Database && window.Database.db) {
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
    // 这里可以添加音效切换逻辑
    console.log('切换音效');
}

// 切换音乐
function toggleMusic() {
    // 这里可以添加音乐切换逻辑
    console.log('切换音乐');
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
        dialog.style.display = 'flex';
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
            dialog.style.display = 'none';
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

// 快速存档
async function quickSave() {
    try {
        // 使用时间戳作为存档ID
        const saveId = `save_${Date.now()}`;
        const saveData = {
            id: saveId,
            name: `快速存档 - ${new Date().toLocaleString('zh-CN')}`,
            ...gameState,
            timestamp: Date.now(),
            location: gameState.character.location || 'unknown',
            playTime: '00:00' // 后续可以实现游戏时长统计
        };

        // 保存到IndexedDB
        if (window.Database && window.Database.db) {
            await window.Database.db.gameState.put(saveData);
            showNotification('⚡ 快速存档成功！');
        } else {
            localStorage.setItem(saveId, JSON.stringify(saveData));
            showNotification('⚡ 快速存档成功（本地）！');
        }
    } catch (error) {
        console.error('快速存档失败:', error);
        showNotification('❌ 快速存档失败', 'error');
    }
}

// 显示存档管理对话框
function showSaveLoadDialog() {
    const dialog = document.getElementById('saveLoadDialog');
    if (dialog) {
        loadSavesList();
        dialog.style.display = 'flex';
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
            dialog.style.display = 'none';
        }, 300);
    }
}

// 加载存档列表
async function loadSavesList() {
    try {
        const savesContainer = document.getElementById('savesList');
        if (!savesContainer) return;

        let saves = [];

        // 从IndexedDB获取所有存档
        if (window.Database && window.Database.db) {
            const allSaves = await window.Database.db.gameState.toArray();
            saves = allSaves.filter(save => save.id !== 'main'); // 排除主存档
        }

        // 按时间排序
        saves.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

        // 渲染存档列表
        if (saves.length === 0) {
            savesContainer.innerHTML = '<div class="no-saves">暂无存档</div>';
        } else {
            savesContainer.innerHTML = saves.map(save => `
                <div class="save-item" data-id="${save.id}">
                    <div class="save-info">
                        <div class="save-name">${save.name || '未命名存档'}</div>
                        <div class="save-details">
                            📍 ${save.location || '未知'} |
                            🕐 ${new Date(save.timestamp || 0).toLocaleString('zh-CN')}
                        </div>
                    </div>
                    <div class="save-actions">
                        <button class="save-btn" onclick="loadSave('${save.id}')">读取</button>
                        <button class="save-btn delete" onclick="deleteSave('${save.id}')">删除</button>
                    </div>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('加载存档列表失败:', error);
    }
}

// 读取存档
async function loadSave(saveId) {
    try {
        let saveData;

        // 从IndexedDB读取
        if (window.Database && window.Database.db) {
            saveData = await window.Database.db.gameState.get(saveId);
        } else {
            // 从localStorage读取
            const data = localStorage.getItem(saveId);
            if (data) {
                saveData = JSON.parse(data);
            }
        }

        if (saveData) {
            // 恢复游戏状态
            gameState = saveData;
            window.gameState = gameState;

            // 刷新UI
            initializeUI();
            updateStatus();
            updateLocationTime();

            hideSaveLoadDialog();
            showNotification('✅ 存档读取成功！');
        } else {
            showNotification('❌ 存档不存在', 'error');
        }
    } catch (error) {
        console.error('读取存档失败:', error);
        showNotification('❌ 读取存档失败', 'error');
    }
}

// 删除存档
async function deleteSave(saveId) {
    if (!confirm('确定要删除这个存档吗？')) return;

    try {
        // 从IndexedDB删除
        if (window.Database && window.Database.db) {
            await window.Database.db.gameState.delete(saveId);
        } else {
            // 从localStorage删除
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

// 立即导出存档系统函数到全局
window.quickSave = quickSave;
window.showSaveLoadDialog = showSaveLoadDialog;
window.hideSaveLoadDialog = hideSaveLoadDialog;
window.loadSave = loadSave;
window.deleteSave = deleteSave;
window.loadSavesList = loadSavesList;