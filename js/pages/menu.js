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
function startNewGame() {
    console.log('开始新游戏...');
    // 保存当前配置
    saveConfig();

    // 清除旧的游戏数据（如果有）
    if (gameConfig.autoSave) {
        const confirmNew = confirm('开始新游戏将覆盖当前的自动存档，是否继续？');
        if (!confirmNew) return;
    }

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
        // 关闭设置面板
        closeSettings();
        // 更新预设信息显示
        updatePresetInfo();
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

        // 找到最新的存档
        const latestSave = saves.sort((a, b) => {
            const timeA = a.data?.timestamp || 0;
            const timeB = b.data?.timestamp || 0;
            return timeB - timeA;
        })[0];

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
// Version: 20250923_084913
