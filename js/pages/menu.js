// 主菜单JavaScript逻辑

// 游戏配置（保存到localStorage）
const gameConfig = {
    difficulty: 'normal',
    autoSave: true,
    skipTutorial: false,
    showHints: true,
    volume: {
        master: 70,
        sfx: 80,
        bgm: 50,
        voice: 90
    }
};

// 初始化主菜单
window.addEventListener('DOMContentLoaded', async function() {
    // 创建背景粒子效果
    createParticles();

    // 加载保存的配置
    loadConfig();

    // 初始化音量滑块
    initVolumeSliders();

    // 绑定按钮事件
    setupEventListeners();

    // 初始化SaveSystem（如果还没初始化）
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
        } catch (error) {
            console.error('❌ SaveSystem初始化失败:', error);
        }
    }

    // 检查是否有存档
    await checkSaveFiles();

    // 初始化存档管理对话框功能
    initSaveLoadDialog();
});

// 设置事件监听器
function setupEventListeners() {
    // 主菜单按钮
    const continueGameBtn = document.getElementById('continueGameBtn');
    if (continueGameBtn) {
        continueGameBtn.addEventListener('click', continueGame);
    }

    const newGameBtn = document.getElementById('newGameBtn');
    if (newGameBtn) {
        newGameBtn.addEventListener('click', startNewGame);
    }

    const loadGameBtn = document.getElementById('loadGameBtn');
    if (loadGameBtn) {
        loadGameBtn.addEventListener('click', handleLoadGame);
    }

    const settingsBtn = document.getElementById('settingsBtn');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', openSettings);
    }

    // 游戏百科按钮
    const wikiBtn = document.getElementById('wikiBtn');
    if (wikiBtn) {
        wikiBtn.addEventListener('click', () => {
            window.location.href = 'wiki.html';
        });
    }

    // 设置面板按钮
    const closeSettingsBtn = document.getElementById('closeSettingsBtn');
    if (closeSettingsBtn) {
        closeSettingsBtn.addEventListener('click', closeSettings);
    }

    const openAPISettingsBtn = document.getElementById('openAPISettingsBtn');
    if (openAPISettingsBtn) {
        openAPISettingsBtn.addEventListener('click', openAPISettings);
    }

    // Toggle开关
    document.querySelectorAll('.toggle-switch').forEach(toggle => {
        toggle.addEventListener('click', function() {
            const setting = this.dataset.setting;
            if (setting) {
                toggleSwitch(this, setting);
            }
        });
    });

    // 游戏预设管理
    setupGamePresetListeners();
}

// 创建背景粒子效果
function createParticles() {
    const bgAnimation = document.getElementById('bgAnimation');
    for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        particle.className = 'bg-particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 15 + 's';
        particle.style.animationDuration = (15 + Math.random() * 10) + 's';
        bgAnimation.appendChild(particle);
    }
}

// 处理读取存档按钮点击（同步包装函数）
function handleLoadGame() {
    console.log('🎮 handleLoadGame被调用');

    // 确保SaveSystem已初始化
    if (!window.saveSystem) {
        console.log('⏳ SaveSystem尚未初始化，正在初始化...');

        // 初始化SaveSystem
        Promise.resolve().then(async () => {
            try {
                // 等待数据库初始化
                if (window.Database) {
                    await window.Database.init();
                }
                // 初始化存档系统
                window.saveSystem = new SaveSystem();
                await window.saveSystem.init();
                console.log('✅ SaveSystem初始化成功');

                // 初始化完成后调用loadGame
                await loadGame();
            } catch (error) {
                console.error('❌ SaveSystem初始化失败:', error);
                alert('存档系统初始化失败，请刷新页面重试');
            }
        });
    } else {
        console.log('✅ SaveSystem已初始化，直接调用loadGame');
        // SaveSystem已初始化，直接调用
        loadGame().catch(error => {
            console.error('读取存档失败:', error);
            alert('读取存档失败，请重试');
        });
    }
}

// 继续游戏（加载最新存档）
async function continueGame() {
    console.log('继续游戏...');

    const continueBtn = document.getElementById('continueGameBtn');
    const saveId = continueBtn?.dataset.saveId;

    if (!saveId) {
        console.error('找不到存档ID');
        return;
    }

    try {
        // 使用SaveSystem加载存档
        if (window.saveSystem) {
            const saveData = await window.saveSystem.loadSave(saveId);

            if (saveData && saveData.gameData) {
                // 保存存档信息到sessionStorage
                sessionStorage.setItem('currentSaveId', saveId);
                sessionStorage.setItem('currentSaveData', JSON.stringify(saveData.gameData));

                // 跳转到游戏页面
                window.location.href = 'game-main.html';
            } else {
                alert('存档数据损坏，无法继续游戏');
            }
        }
    } catch (error) {
        console.error('继续游戏失败:', error);
        alert('加载存档失败，请尝试从载入存档菜单选择');
    }
}

// 开始新游戏
async function startNewGame() {
    console.log('开始新游戏...');

    // 检查是否需要创建预设（新用户）
    if (window.GamePresetManager && window.GamePresetManager.needsPresetCreation()) {
        // 显示预设创建向导
        const shouldCreate = confirm(
            '欢迎来到Reality游戏！\n\n' +
            '首次游戏需要创建一个游戏预设。\n' +
            '预设包含难度、世界设置、NPC设置等配置。\n\n' +
            '是否现在创建预设？'
        );

        if (shouldCreate) {
            // 打开设置面板让用户配置
            openSettings();

            // 引导用户创建预设
            setTimeout(() => {
                alert(
                    '请按以下步骤设置你的游戏：\n\n' +
                    '1. 配置各项游戏设置\n' +
                    '2. 点击"配置AI服务"设置API（可选）\n' +
                    '3. 点击"💾 保存当前预设"\n' +
                    '4. 关闭设置，点击"开始游戏"'
                );
            }, 500);

            return; // 中断开始游戏流程
        }
    }

    // 保存当前配置
    saveConfig();

    // 将当前预设应用到游戏
    if (window.GamePresetManager) {
        const preset = window.GamePresetManager.getActivePreset();
        if (preset) {
            // 存储预设ID供游戏使用
            sessionStorage.setItem('activePresetId', preset.id);
            console.log('📋 使用预设:', preset.name);
        }
    }

    // 检查是否有自动存档
    let hasAutoSave = false;
    if (window.saveSystem) {
        const saves = await window.saveSystem.getSavesList('auto');
        hasAutoSave = saves && saves.length > 0;
    }

    // 如果有自动存档，提示用户
    if (hasAutoSave) {
        const confirmNew = confirm('开始新游戏将覆盖当前的自动存档，是否继续？\n\n注意：手动存档和快速存档不会受影响。');
        if (!confirmNew) return;

        // 删除自动存档
        try {
            const autoSaves = await window.saveSystem.getSavesList('auto');
            for (const save of autoSaves) {
                await window.saveSystem.deleteSave(save.id);
                console.log('✅ 已删除自动存档:', save.id);
            }
        } catch (error) {
            console.error('删除自动存档失败:', error);
        }
    }

    // 清除sessionStorage中的存档数据
    sessionStorage.removeItem('currentSaveId');
    sessionStorage.removeItem('currentSaveData');
    sessionStorage.removeItem('loadSaveOnStart');

    // 标记为新游戏
    sessionStorage.setItem('isNewGame', 'true');

    // 跳转到角色创建界面
    window.location.href = 'character-creation.html';
}

// 读取存档
async function loadGame() {
    console.log('📂 打开存档列表...');
    console.log('🔍 SaveSystem状态:', window.saveSystem ? '已初始化' : '未初始化');

    // 检查是否有存档
    const saves = await getSaveFiles();
    console.log('📦 获取到的存档数量:', saves.length);
    console.log('📦 存档详情:', saves);

    if (saves.length === 0) {
        alert('没有找到存档文件！');
        return;
    }

    // 显示存档列表（这里简化处理）
    let saveList = '选择要读取的存档：\n\n';
    saves.forEach((save, index) => {
        const typeIcon = save.type === 'auto' ? '🔄' :
                        save.type === 'quick' ? '⚡' : '💾';
        saveList += `${index + 1}. ${typeIcon} ${save.name} - ${save.date}\n`;
    });

    const choice = prompt(saveList + '\n输入存档编号：');
    if (choice && saves[parseInt(choice) - 1]) {
        loadSaveFile(saves[parseInt(choice) - 1]);
    }
}

// 打开设置面板
function openSettings() {
    const settingsPanel = document.getElementById('settingsPanel');
    settingsPanel.classList.add('active');
}

// 关闭设置面板
function closeSettings() {
    const settingsPanel = document.getElementById('settingsPanel');
    settingsPanel.classList.remove('active');
    // 保存设置
    saveConfig();
}

// 打开API配置
function openAPISettings() {
    // 使用新的API设置界面
    if (typeof APISettingsScreen !== 'undefined') {
        APISettingsScreen.open();
        // 不关闭设置面板，保持它打开
        // closeSettings(); // 注释掉这行

        // 更新预设信息显示
        setTimeout(() => {
            updatePresetInfo();
        }, 100);
    } else {
        console.error('API设置界面未加载');
    }
}

// 更新当前预设信息显示
function updatePresetInfo() {
    const infoEl = document.getElementById('current-preset-info');
    if (infoEl && typeof APIPresetManager !== 'undefined') {
        const preset = APIPresetManager.getActivePreset();
        if (preset) {
            const hasKey = preset.apiKey ? '✅' : '❌';
            infoEl.innerHTML = `当前: <strong>${preset.name}</strong> (${preset.provider}) ${hasKey}`;
        }
    }
}

// 兼容旧的函数名
function openAPIConfig() {
    openAPISettings();
    if (typeof window.openAPISettings === 'function') {
        window.openAPISettings();
    } else {
        // 如果还没加载，创建一个临时的配置界面
        const modal = document.getElementById('api-config-modal');
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 600px; background: linear-gradient(135deg, #1a1a2e, #16213e); border-radius: 15px; padding: 20px;">
                <div class="modal-header" style="border-bottom: 2px solid rgba(139, 92, 246, 0.3); padding-bottom: 15px; margin-bottom: 20px;">
                    <h2 style="color: #f093fb;">🤖 AI服务配置</h2>
                    <span class="close-btn" onclick="closeAPIConfig()" style="color: white; cursor: pointer; font-size: 24px;">&times;</span>
                </div>
                <div class="modal-body" style="color: white;">
                    <p style="margin-bottom: 15px;">请选择并配置AI服务：</p>

                    <div class="form-group" style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; color: #e4e4e7;">服务提供商</label>
                        <select id="ai-provider" class="setting-select" style="width: 100%;">
                            <option value="openai">OpenAI (GPT)</option>
                            <option value="gemini">Google Gemini</option>
                            <option value="claude">Anthropic Claude</option>
                            <option value="local">本地服务</option>
                        </select>
                    </div>

                    <div class="form-group" style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; color: #e4e4e7;">API密钥</label>
                        <input type="password" id="api-key" class="setting-input" placeholder="输入你的API密钥" style="width: 100%;">
                    </div>

                    <div class="form-group" style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 5px; color: #e4e4e7;">API端点（可选）</label>
                        <input type="text" id="api-endpoint" class="setting-input" placeholder="默认" style="width: 100%;">
                    </div>

                    <button class="setting-btn" onclick="saveAPIConfig()">保存配置</button>
                </div>
            </div>
        `;
        modal.style.display = 'flex';
        modal.classList.add('active');
    }
}

// 关闭API配置
function closeAPIConfig() {
    const modal = document.getElementById('api-config-modal');
    modal.style.display = 'none';
    modal.classList.remove('active');
}

// 保存API配置
function saveAPIConfig() {
    const provider = document.getElementById('ai-provider').value;
    const apiKey = document.getElementById('api-key').value;
    const endpoint = document.getElementById('api-endpoint').value;

    // 保存到localStorage
    const apiConfig = {
        provider: provider,
        apiKey: apiKey,
        endpoint: endpoint || 'default'
    };

    localStorage.setItem('apiConfig', JSON.stringify(apiConfig));
    alert('API配置已保存！');
    closeAPIConfig();
}

// 切换开关
function toggleSwitch(element, setting) {
    element.classList.toggle('active');
    const isActive = element.classList.contains('active');

    // 更新配置
    switch(setting) {
        case 'autoSave':
            gameConfig.autoSave = isActive;
            break;
        case 'skipTutorial':
            gameConfig.skipTutorial = isActive;
            break;
        case 'showHints':
            gameConfig.showHints = isActive;
            break;
    }

    // 立即保存
    saveConfig();
}

// 初始化音量滑块
function initVolumeSliders() {
    const sliders = {
        'volume-master': 'master',
        'volume-sfx': 'sfx',
        'volume-bgm': 'bgm',
        'volume-voice': 'voice'
    };

    Object.entries(sliders).forEach(([id, type]) => {
        const slider = document.getElementById(id);
        if (slider) {
            slider.value = gameConfig.volume[type];
            slider.addEventListener('input', function(e) {
                gameConfig.volume[type] = parseInt(e.target.value);
                // 这里可以添加实际的音量调整逻辑
                console.log(`${type} volume: ${e.target.value}`);
            });
        }
    });
}

// 加载配置
function loadConfig() {
    const saved = localStorage.getItem('gameConfig');
    if (saved) {
        Object.assign(gameConfig, JSON.parse(saved));

        // 应用配置到UI
        document.getElementById('difficulty-select').value = gameConfig.difficulty;

        // 更新开关状态
        const switches = {
            'autoSave': gameConfig.autoSave,
            'skipTutorial': gameConfig.skipTutorial,
            'showHints': gameConfig.showHints
        };

        Object.entries(switches).forEach(([setting, value]) => {
            const switchElements = document.querySelectorAll('.toggle-switch');
            switchElements.forEach(elem => {
                if (elem.onclick && elem.onclick.toString().includes(setting)) {
                    if (value) {
                        elem.classList.add('active');
                    } else {
                        elem.classList.remove('active');
                    }
                }
            });
        });
    }
}

// 保存配置
function saveConfig() {
    // 更新难度设置
    gameConfig.difficulty = document.getElementById('difficulty-select').value;

    // 保存到localStorage
    localStorage.setItem('gameConfig', JSON.stringify(gameConfig));
    console.log('配置已保存:', gameConfig);
}

// 获取存档文件
async function getSaveFiles() {
    const saves = [];

    // 使用新的SaveSystem获取存档
    if (window.saveSystem) {
        try {
            const allSaves = await window.saveSystem.getSavesList();

            for (const save of allSaves) {
                saves.push({
                    id: save.id,
                    name: save.name || '未命名存档',
                    date: new Date(save.timestamp).toLocaleString('zh-CN'),
                    type: save.type,
                    data: save
                });
            }
            console.log('使用SaveSystem获取到', saves.length, '个存档');
        } catch (error) {
            console.error('从SaveSystem获取存档失败:', error);
        }
    } else {
        // 降级到localStorage（兼容旧存档）
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('save_')) {
                try {
                    const saveData = JSON.parse(localStorage.getItem(key));
                    saves.push({
                        id: key,
                        name: saveData.name || '未命名存档',
                        date: saveData.date || '未知时间',
                        data: saveData
                    });
                } catch (e) {
                    console.error('读取存档失败:', key);
                }
            }
        }
    }

    return saves;
}

// 检查存档文件
async function checkSaveFiles() {
    const saves = await getSaveFiles();
    if (saves.length > 0) {
        console.log(`找到 ${saves.length} 个存档文件`);

        // 优先找自动存档，如果没有就找最新的存档
        let latestSave = saves.find(s => s.type === 'auto');

        if (!latestSave) {
            // 没有自动存档，找最新的存档
            latestSave = saves.sort((a, b) => {
                const timeA = a.data?.timestamp || 0;
                const timeB = b.data?.timestamp || 0;
                return timeB - timeA;
            })[0];
        }

        console.log(`使用存档类型: ${latestSave?.type || '未知'}`);

        // 显示"继续游戏"按钮
        const continueBtn = document.getElementById('continueGameBtn');
        if (continueBtn && latestSave) {
            continueBtn.style.display = 'block';
            continueBtn.classList.add('primary');

            // 移除"新游戏"按钮的primary样式
            const newGameBtn = document.getElementById('newGameBtn');
            if (newGameBtn) {
                newGameBtn.classList.remove('primary');
            }

            // 存储最新存档信息
            continueBtn.dataset.saveId = latestSave.id;
        }
    }
    return saves.length > 0;
}

// 加载存档文件
async function loadSaveFile(save) {
    console.log('加载存档:', save);

    try {
        // 使用SaveSystem读取存档
        if (window.saveSystem && save.id) {
            const saveData = await window.saveSystem.loadSave(save.id);

            if (saveData && saveData.gameData) {
                // 保存当前选择的存档到sessionStorage
                sessionStorage.setItem('currentSaveId', save.id);
                sessionStorage.setItem('currentSaveData', JSON.stringify(saveData.gameData));

                console.log('✅ 存档已加载，准备跳转到游戏页面');
                // 跳转到游戏主界面
                window.location.href = 'game-main.html';
            } else {
                alert('存档数据无效');
            }
        } else {
            // 降级处理
            sessionStorage.setItem('currentSave', save.id);
            window.location.href = 'game-main.html';
        }
    } catch (error) {
        console.error('加载存档失败:', error);
        alert('加载存档失败: ' + error.message);
    }
}

// 监听难度选择变化
document.addEventListener('DOMContentLoaded', function() {
    const difficultySelect = document.getElementById('difficulty-select');
    if (difficultySelect) {
        difficultySelect.addEventListener('change', function() {
            gameConfig.difficulty = this.value;
            saveConfig();
            console.log('难度已更改为:', this.value);
        });
    }
});

// 显示API设置（如果需要的话）
function showAPISettings() {
    console.log('打开API设置...');
    // 可以调用已有的API设置UI
    if (window.APISettingsUI && window.APISettingsUI.show) {
        window.APISettingsUI.show();
    } else {
        alert('API设置功能暂未实现');
    }
}

// ==================== 存档管理功能 ====================

// 初始化存档管理对话框
function initSaveLoadDialog() {
    // 创建存档对话框（如果不存在）
    if (!document.getElementById('saveLoadDialog')) {
        const dialogHTML = `
            <div id="saveLoadDialog" class="dialog-overlay hidden">
                <div class="dialog-box">
                    <div class="dialog-header">
                        <h3>💾 载入存档</h3>
                        <button class="dialog-close" onclick="closeSaveDialog()">×</button>
                    </div>
                    <div class="dialog-content">
                        <div id="savesList" class="saves-list">
                            <div class="no-saves">正在加载存档...</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', dialogHTML);
    }
}

// 加载存档列表（菜单版本）
async function loadSavesList() {
    try {
        const savesContainer = document.getElementById('savesList');
        if (!savesContainer) return;

        // 获取所有存档
        let saves = [];
        if (window.saveSystem) {
            saves = await window.saveSystem.getSavesList();
        }

        // 按类型和时间排序
        saves.sort((a, b) => {
            const typeOrder = { quick: 0, manual: 1, auto: 2 };
            const typeCompare = typeOrder[a.type] - typeOrder[b.type];
            if (typeCompare !== 0) return typeCompare;
            return b.timestamp - a.timestamp;
        });

        // 渲染存档列表
        if (saves.length === 0) {
            savesContainer.innerHTML = '<div class="no-saves">暂无存档</div>';
        } else {
            savesContainer.innerHTML = saves.map(save => {
                // 存档类型信息
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

                if (save.gameData?.worldData) {
                    const wd = save.gameData.worldData;
                    location = wd.player?.position?.location || wd.player?.location || '未知';
                    gameDay = wd.time?.day || 1;
                    hasWorldSnapshot = true;
                }

                // 格式化时间
                const date = new Date(save.timestamp || 0);
                const timeStr = date.toLocaleString('zh-CN', {
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                });

                return `
                    <div class="save-item ${type.class}" data-id="${save.id}">
                        <div class="save-info">
                            <div class="save-header">
                                <span class="save-icon">${type.icon}</span>
                                <span class="save-name">${save.name || '未命名存档'}</span>
                                ${hasWorldSnapshot ? '<span class="world-badge" title="完整世界快照">🌍</span>' : ''}
                            </div>
                            <div class="save-details">
                                <span>📅 第${gameDay}天</span>
                                <span>📍 ${location}</span>
                                <span>🕐 ${timeStr}</span>
                            </div>
                        </div>
                        <div class="save-actions">
                            <button class="save-btn load-btn" onclick="loadFromMenu('${save.id}')">
                                📂 载入
                            </button>
                            <button class="save-btn edit-btn" onclick="renameSaveFromMenu('${save.id}')">
                                ✏️ 重命名
                            </button>
                            <button class="save-btn delete-btn" onclick="deleteSaveFromMenu('${save.id}')">
                                🗑️ 删除
                            </button>
                        </div>
                    </div>
                `;
            }).join('');
        }
    } catch (error) {
        console.error('加载存档列表失败:', error);
    }
}

// 从菜单载入存档
async function loadFromMenu(saveId) {
    try {
        if (window.saveSystem) {
            const saveData = await window.saveSystem.loadSave(saveId);
            if (saveData && saveData.gameData) {
                // 保存到sessionStorage，让游戏页面读取
                sessionStorage.setItem('loadSaveOnStart', 'true');
                sessionStorage.setItem('currentSaveId', saveId);
                sessionStorage.setItem('currentSaveData', JSON.stringify(saveData.gameData));

                // 跳转到游戏页面
                window.location.href = 'game-main.html';
            }
        }
    } catch (error) {
        console.error('载入存档失败:', error);
        alert('载入存档失败，请重试');
    }
}

// 重命名存档（从菜单）
async function renameSaveFromMenu(saveId) {
    try {
        const newName = prompt('请输入新的存档名称：');
        if (newName && newName.trim()) {
            // 获取存档数据
            const saveData = await window.saveSystem.loadSave(saveId);
            if (saveData) {
                // 更新名称
                saveData.name = newName.trim();
                // 保存回数据库
                await window.Database.db.saves.update(saveId, { name: saveData.name });
                // 刷新列表
                await loadSavesList();
                console.log('✅ 存档已重命名');
            }
        }
    } catch (error) {
        console.error('重命名存档失败:', error);
        alert('重命名失败，请重试');
    }
}

// 删除存档（从菜单）
async function deleteSaveFromMenu(saveId) {
    try {
        if (confirm('确定要删除这个存档吗？此操作不可恢复！')) {
            if (window.saveSystem) {
                await window.saveSystem.deleteSave(saveId);
                // 刷新列表
                await loadSavesList();
                console.log('✅ 存档已删除');

                // 如果删除后没有存档了，隐藏继续游戏按钮
                await checkSaveFiles();
            }
        }
    } catch (error) {
        console.error('删除存档失败:', error);
        alert('删除失败，请重试');
    }
}

// 关闭存档对话框
function closeSaveDialog() {
    const dialog = document.getElementById('saveLoadDialog');
    if (dialog) {
        dialog.classList.remove('active');
        setTimeout(() => {
            dialog.classList.add('hidden');
        }, 300);
    }
}

// 更新的handleLoadGame函数
async function handleLoadGame() {
    console.log('打开载入存档界面...');
    const dialog = document.getElementById('saveLoadDialog');
    if (dialog) {
        await loadSavesList();
        dialog.classList.remove('hidden');
        setTimeout(() => {
            dialog.classList.add('active');
        }, 10);
    }
}

// ==================== 游戏预设管理功能 ====================

// 设置游戏预设相关的事件监听器
function setupGamePresetListeners() {
    // 预设选择下拉框
    const presetSelect = document.getElementById('game-preset-select');
    if (presetSelect) {
        updatePresetSelect();  // 初始化下拉列表
        presetSelect.addEventListener('change', (e) => {
            if (window.GamePresetManager) {
                window.GamePresetManager.switchPreset(e.target.value);
                showNotification('预设已切换', 'success');
            }
        });
    }

    // 新建预设按钮
    const newPresetBtn = document.getElementById('new-preset-btn');
    if (newPresetBtn) {
        newPresetBtn.addEventListener('click', createNewPreset);
    }

    // 重命名预设按钮
    const renamePresetBtn = document.getElementById('rename-preset-btn');
    if (renamePresetBtn) {
        renamePresetBtn.addEventListener('click', renameCurrentPreset);
    }

    // 删除预设按钮
    const deletePresetBtn = document.getElementById('delete-preset-btn');
    if (deletePresetBtn) {
        deletePresetBtn.addEventListener('click', deleteCurrentPreset);
    }

    // 保存预设按钮
    const savePresetBtn = document.getElementById('save-preset-btn');
    if (savePresetBtn) {
        savePresetBtn.addEventListener('click', saveCurrentPreset);
    }

    // 导出预设按钮
    const exportPresetBtn = document.getElementById('export-preset-btn');
    if (exportPresetBtn) {
        exportPresetBtn.addEventListener('click', exportPreset);
    }

    // 导入预设按钮
    const importPresetBtn = document.getElementById('import-preset-btn');
    if (importPresetBtn) {
        importPresetBtn.addEventListener('click', () => {
            document.getElementById('import-preset-file').click();
        });
    }

    // 导入文件选择
    const importFile = document.getElementById('import-preset-file');
    if (importFile) {
        importFile.addEventListener('change', handlePresetImport);
    }

    // 自定义属性按钮
    const customizeStatsBtn = document.getElementById('customize-stats-btn');
    if (customizeStatsBtn) {
        customizeStatsBtn.addEventListener('click', openCustomStatsDialog);
    }

    // 自定义NPC按钮
    const customizeNpcsBtn = document.getElementById('customize-npcs-btn');
    if (customizeNpcsBtn) {
        customizeNpcsBtn.addEventListener('click', () => {
            alert('自定义NPC功能即将推出！');
        });
    }
}

// 更新预设选择下拉列表
function updatePresetSelect() {
    if (!window.GamePresetManager) return;

    const select = document.getElementById('game-preset-select');
    if (!select) return;

    // 清空现有选项
    select.innerHTML = '';

    // 添加所有预设
    const presets = window.GamePresetManager.getAllPresets();
    presets.forEach(preset => {
        const option = document.createElement('option');
        option.value = preset.id;
        option.textContent = preset.name;
        select.appendChild(option);
    });

    // 设置当前激活的预设
    select.value = window.GamePresetManager.activePresetId;
}

// 创建新预设
function createNewPreset() {
    const name = prompt('请输入新预设名称：', '我的预设');
    if (name && window.GamePresetManager) {
        const presetId = window.GamePresetManager.createPreset(name);
        if (presetId) {
            updatePresetSelect();
            showNotification(`预设"${name}"已创建`, 'success');
        }
    }
}

// 重命名当前预设
function renameCurrentPreset() {
    if (!window.GamePresetManager) return;

    const current = window.GamePresetManager.getActivePreset();
    if (!current) return;

    const newName = prompt('请输入新名称：', current.name);
    if (newName && newName !== current.name) {
        if (window.GamePresetManager.renamePreset(current.id, newName)) {
            updatePresetSelect();
            showNotification('预设已重命名', 'success');
        }
    }
}

// 删除当前预设
function deleteCurrentPreset() {
    if (!window.GamePresetManager) return;

    const current = window.GamePresetManager.getActivePreset();
    if (!current) return;

    if (confirm(`确定要删除预设"${current.name}"吗？`)) {
        if (window.GamePresetManager.deletePreset(current.id)) {
            updatePresetSelect();
            showNotification('预设已删除', 'success');
        }
    }
}

// 保存当前预设
function saveCurrentPreset() {
    if (!window.GamePresetManager) return;

    if (window.GamePresetManager.updateCurrentPreset()) {
        showNotification('预设已保存', 'success');
    } else {
        showNotification('保存失败', 'error');
    }
}

// 导出预设
function exportPreset() {
    if (!window.GamePresetManager) return;

    const current = window.GamePresetManager.getActivePreset();
    if (!current) return;

    const json = window.GamePresetManager.exportPreset();
    if (json) {
        // 创建下载链接
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `preset_${current.name}_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        showNotification('预设已导出', 'success');
    }
}

// 处理预设导入
function handlePresetImport(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        const json = event.target.result;
        if (window.GamePresetManager) {
            const presetId = window.GamePresetManager.importPreset(json);
            if (presetId) {
                updatePresetSelect();
                document.getElementById('game-preset-select').value = presetId;
                window.GamePresetManager.switchPreset(presetId);
                showNotification('预设导入成功', 'success');
            }
        }
    };
    reader.readAsText(file);

    // 清空文件选择，以便可以再次导入同一文件
    e.target.value = '';
}

// 显示通知
function showNotification(message, type = 'info') {
    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = `preset-notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        background: ${type === 'success' ? '#4ade80' : type === 'error' ? '#f87171' : '#8b5cf6'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(notification);

    // 3秒后自动消失
    setTimeout(() => {
        notification.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}


// 打开自定义属性对话框
function openCustomStatsDialog() {
    // 创建对话框（如果不存在）
    let dialog = document.getElementById('customStatsDialog');
    if (!dialog) {
        const dialogHTML = `
            <div id="customStatsDialog" class="dialog-overlay hidden">
                <div class="dialog-box" style="max-width: 500px;">
                    <div class="dialog-header">
                        <h3>⚙️ 自定义初始属性</h3>
                        <button class="dialog-close" onclick="closeCustomStatsDialog()">×</button>
                    </div>
                    <div class="dialog-content">
                        <div class="stats-info">
                            <p>分配初始属性点（总计25点）</p>
                            <div class="points-display">
                                剩余点数: <span id="statsRemainingPoints">5</span>
                            </div>
                        </div>
                        <div class="stats-sliders">
                            <div class="stat-item">
                                <label>力量 (Strength)</label>
                                <input type="range" id="stat-strength" min="1" max="10" value="5"
                                       oninput="updateStatPoints()">
                                <span class="stat-value" id="stat-strength-value">5</span>
                            </div>
                            <div class="stat-item">
                                <label>敏捷 (Agility)</label>
                                <input type="range" id="stat-agility" min="1" max="10" value="5"
                                       oninput="updateStatPoints()">
                                <span class="stat-value" id="stat-agility-value">5</span>
                            </div>
                            <div class="stat-item">
                                <label>智力 (Intelligence)</label>
                                <input type="range" id="stat-intelligence" min="1" max="10" value="5"
                                       oninput="updateStatPoints()">
                                <span class="stat-value" id="stat-intelligence-value">5</span>
                            </div>
                            <div class="stat-item">
                                <label>魅力 (Charisma)</label>
                                <input type="range" id="stat-charisma" min="1" max="10" value="5"
                                       oninput="updateStatPoints()">
                                <span class="stat-value" id="stat-charisma-value">5</span>
                            </div>
                            <div class="stat-item">
                                <label>幸运 (Luck)</label>
                                <input type="range" id="stat-luck" min="1" max="10" value="5"
                                       oninput="updateStatPoints()">
                                <span class="stat-value" id="stat-luck-value">5</span>
                            </div>
                        </div>
                        <div class="dialog-actions">
                            <button class="setting-btn" onclick="resetStats()">重置</button>
                            <button class="setting-btn" onclick="saveCustomStats()">保存</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', dialogHTML);
        dialog = document.getElementById('customStatsDialog');
    }

    // 加载当前预设的属性值
    if (window.GamePresetManager) {
        const preset = window.GamePresetManager.getActivePreset();
        if (preset && preset.settings.character.initialStats) {
            const stats = preset.settings.character.initialStats;
            document.getElementById('stat-strength').value = stats.strength || 5;
            document.getElementById('stat-agility').value = stats.agility || 5;
            document.getElementById('stat-intelligence').value = stats.intelligence || 5;
            document.getElementById('stat-charisma').value = stats.charisma || 5;
            document.getElementById('stat-luck').value = stats.luck || 5;
            updateStatPoints();
        }
    }

    // 显示对话框
    dialog.classList.remove('hidden');
    setTimeout(() => {
        dialog.classList.add('active');
    }, 10);
}

// 关闭自定义属性对话框
function closeCustomStatsDialog() {
    const dialog = document.getElementById('customStatsDialog');
    if (dialog) {
        dialog.classList.remove('active');
        setTimeout(() => {
            dialog.classList.add('hidden');
        }, 300);
    }
}

// 更新属性点数显示
function updateStatPoints() {
    const stats = ['strength', 'agility', 'intelligence', 'charisma', 'luck'];
    let totalUsed = 0;

    stats.forEach(stat => {
        const slider = document.getElementById(`stat-${stat}`);
        const valueDisplay = document.getElementById(`stat-${stat}-value`);
        if (slider && valueDisplay) {
            const value = parseInt(slider.value);
            valueDisplay.textContent = value;
            totalUsed += value;
        }
    });

    const remaining = 25 - totalUsed;
    const remainingDisplay = document.getElementById('statsRemainingPoints');
    if (remainingDisplay) {
        remainingDisplay.textContent = remaining;
        remainingDisplay.style.color = remaining < 0 ? '#f87171' : remaining === 0 ? '#4ade80' : '#e4e4e7';
    }
}

// 重置属性
function resetStats() {
    const stats = ['strength', 'agility', 'intelligence', 'charisma', 'luck'];
    stats.forEach(stat => {
        const slider = document.getElementById(`stat-${stat}`);
        if (slider) {
            slider.value = 5;
        }
    });
    updateStatPoints();
}

// 保存自定义属性
function saveCustomStats() {
    const remaining = parseInt(document.getElementById('statsRemainingPoints').textContent);
    if (remaining < 0) {
        alert('属性点分配超出限制！请重新分配。');
        return;
    }

    if (remaining > 0) {
        if (!confirm(`您还有${remaining}点未分配，确定要保存吗？`)) {
            return;
        }
    }

    // 收集属性值
    const stats = {
        strength: parseInt(document.getElementById('stat-strength').value),
        agility: parseInt(document.getElementById('stat-agility').value),
        intelligence: parseInt(document.getElementById('stat-intelligence').value),
        charisma: parseInt(document.getElementById('stat-charisma').value),
        luck: parseInt(document.getElementById('stat-luck').value)
    };

    // 保存到当前预设
    if (window.GamePresetManager) {
        const preset = window.GamePresetManager.getActivePreset();
        if (preset) {
            preset.settings.character.initialStats = stats;
            window.GamePresetManager.save();
            showNotification('初始属性已保存', 'success');
        }
    }

    closeCustomStatsDialog();
}

// 导出函数到全局，供HTML的onclick使用
window.handleLoadGame = handleLoadGame;
window.startNewGame = startNewGame;
window.openSettings = openSettings;
window.showAPISettings = showAPISettings;
window.loadGame = loadGame;  // 保留旧的以防万一
window.loadFromMenu = loadFromMenu;
window.renameSaveFromMenu = renameSaveFromMenu;
window.deleteSaveFromMenu = deleteSaveFromMenu;
window.closeSaveDialog = closeSaveDialog;
window.closeCustomStatsDialog = closeCustomStatsDialog;
window.updateStatPoints = updateStatPoints;
window.resetStats = resetStats;
window.saveCustomStats = saveCustomStats;
// Version: 20250923_084913
