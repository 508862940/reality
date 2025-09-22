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
window.addEventListener('DOMContentLoaded', function() {
    // 创建背景粒子效果
    createParticles();

    // 加载保存的配置
    loadConfig();

    // 初始化音量滑块
    initVolumeSliders();

    // 检查是否有存档
    checkSaveFiles();
});

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
    console.log('打开存档列表...');

    // 检查是否有存档
    const saves = await getSaveFiles();
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
    }
    return saves.length > 0;
}

// 加载存档文件
function loadSaveFile(save) {
    console.log('加载存档:', save);

    // 保存当前选择的存档ID
    sessionStorage.setItem('currentSave', save.id);

    // 跳转到游戏主界面
    window.location.href = 'index.html?load=' + save.id;
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