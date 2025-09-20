// 游戏主界面JavaScript逻辑

// 游戏状态（从localStorage加载或使用默认值）
let gameState = null;

// 当前显示的标签页
let currentTab = 'status';

// AI对话是否激活
let aiModeActive = false;

// 初始化游戏
window.addEventListener('DOMContentLoaded', function() {
    // 加载游戏状态
    loadGameState();

    // 初始化界面
    initializeUI();

    // 初始化游戏逻辑
    if (typeof initGame === 'function') {
        initGame();  // 调用原有的game.js中的初始化函数
    }

    // 绑定输入事件
    setupEventListeners();

    // 开始游戏
    startGame();
});

// 加载游戏状态
function loadGameState() {
    const savedState = localStorage.getItem('gameState');
    if (savedState) {
        gameState = JSON.parse(savedState);
        console.log('加载游戏状态:', gameState);
    } else {
        // 如果没有保存的状态，使用默认值
        gameState = {
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
    // 更新状态条
    updateStatBar('health', gameState.character.health || 100);
    updateStatBar('mood', gameState.character.mood || 50);
    updateStatBar('money', gameState.character.money || 100);
    updateStatBar('energy', gameState.character.energy || 80);

    // 同步到原有系统（如果存在）
    if (typeof updateCharacterPanel === 'function') {
        updateCharacterPanel();
    }
}

// 更新状态条
function updateStatBar(stat, value) {
    const bar = document.getElementById(stat + 'Bar');
    const valueText = document.getElementById(stat + 'Value');

    if (bar) {
        // 限制值在0-100之间（金钱除外）
        let displayValue = value;
        if (stat !== 'money') {
            displayValue = Math.max(0, Math.min(100, value));
        }

        bar.style.width = (stat === 'money' ? Math.min(100, value / 10) : displayValue) + '%';
    }

    if (valueText) {
        valueText.textContent = value;
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

    // 更新时间
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
    document.getElementById('functionContent').innerHTML = content;

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
                <div style="padding: 5px;">
                    <div style="margin-bottom: 8px;">📚 教科书 x3</div>
                    <div style="margin-bottom: 8px;">✏️ 笔记本 x2</div>
                    <div style="margin-bottom: 8px;">🍎 苹果 x1</div>
                    <div style="margin-bottom: 8px;">💰 金钱: ¥${gameState.character.money}</div>
                </div>
            </div>
        `,
        'map': `
            <div class="tab-content">
                <div style="padding: 5px; font-size: 12px;">
                    <div style="margin-bottom: 6px;">📍 当前: ${document.getElementById('currentLocation').textContent}</div>
                    <div style="margin-bottom: 4px;">可前往:</div>
                    <div style="margin-left: 10px; cursor: pointer;" onclick="goToLocation('classroom')">• 教室</div>
                    <div style="margin-left: 10px; cursor: pointer;" onclick="goToLocation('playground')">• 操场</div>
                    <div style="margin-left: 10px; cursor: pointer;" onclick="goToLocation('cafeteria')">• 食堂</div>
                    <div style="margin-left: 10px; cursor: pointer;" onclick="goToLocation('town')">• 小镇</div>
                </div>
            </div>
        `,
        'skills': `
            <div class="tab-content">
                <div style="padding: 5px; font-size: 12px;">
                    <div style="margin-bottom: 6px;">智力: ⭐⭐⭐☆☆</div>
                    <div style="margin-bottom: 6px;">体力: ⭐⭐⭐⭐☆</div>
                    <div style="margin-bottom: 6px;">魅力: ⭐⭐⭐☆☆</div>
                    <div style="margin-bottom: 6px;">勇气: ⭐⭐☆☆☆</div>
                </div>
            </div>
        `,
        'social': `
            <div class="tab-content">
                <div style="padding: 5px; font-size: 12px;">
                    <div style="margin-bottom: 6px;">林学长: ❤️❤️❤️🤍🤍</div>
                    <div style="margin-bottom: 6px;">张同学: ❤️❤️🤍🤍🤍</div>
                    <div style="margin-bottom: 6px;">夜同学: ❤️🤍🤍🤍🤍</div>
                    <div style="margin-bottom: 6px;">小明: ❤️❤️❤️❤️🤍</div>
                </div>
            </div>
        `,
        'journal': `
            <div class="tab-content">
                <div style="padding: 5px; font-size: 11px; line-height: 1.4;">
                    <div style="margin-bottom: 6px;">📅 第${gameState.gameTime.day}天 - ${document.getElementById('currentTime').textContent}</div>
                    <div style="margin-bottom: 4px;">• 新的一天开始了</div>
                    <div style="margin-bottom: 4px;">• 准备开始冒险</div>
                </div>
            </div>
        `,
        'settings': `
            <div class="tab-content">
                <div style="padding: 5px; font-size: 12px;">
                    <div style="margin-bottom: 8px; cursor: pointer;" onclick="saveGame()">💾 保存游戏</div>
                    <div style="margin-bottom: 8px; cursor: pointer;" onclick="toggleSound()">🔊 音效: 开启</div>
                    <div style="margin-bottom: 8px; cursor: pointer;" onclick="toggleMusic()">🎵 音乐: 开启</div>
                    <div style="margin-bottom: 8px; cursor: pointer;" onclick="returnToMenu()">🏠 返回主菜单</div>
                </div>
            </div>
        `
    };

    return contents[tabName] || '<div>加载中...</div>';
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
function saveGameState() {
    localStorage.setItem('gameState', JSON.stringify(gameState));
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
function returnToMenu() {
    if (confirm('返回主菜单将保存当前进度，确定要返回吗？')) {
        saveGameState();
        // 返回主菜单
        window.location.href = 'menu.html';
    }
}