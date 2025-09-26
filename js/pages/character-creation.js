// 角色创建JavaScript逻辑

// 角色数据
const characterData = {
    name: '',
    gender: 'female',
    age: 18,
    appearance: {
        hair: 'long',
        hairColor: 'black',
        body: 'normal'
    },
    attributes: {
        int: 5,  // 智力
        str: 5,  // 体力
        cha: 5,  // 魅力
        cou: 5   // 勇气
    },
    maxAttributePoints: 20,  // 最大属性点数
    enabledNPCs: {
        linSenior: true,
        zhangStudent: true,
        nightStudent: true,
        xiaoMing: true
    },
    customNPCs: [],
    difficulty: 'easy'
};

// 原始属性值（用于计算剩余点数）
const baseAttributes = {
    int: 5,
    str: 5,
    cha: 5,
    cou: 5
};

// 初始化
window.addEventListener('DOMContentLoaded', function() {
    // 加载预设配置
    loadPresetSettings();

    // 加载之前的配置（如果有）
    loadPreviousSettings();

    // 更新进度条
    updateProgress();

    // 初始化角色预览
    updateCharacterPreview();

    // 初始化名字输入监听
    document.getElementById('characterName').addEventListener('input', function(e) {
        characterData.name = e.target.value;
        updateProgress();
    });
});

// 选择选项
function selectOption(element, group, value) {
    // 移除同组其他选项的active类
    const parent = element.parentElement;
    parent.querySelectorAll('.option-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    // 添加active类到当前选项
    element.classList.add('active');

    // 更新数据
    switch(group) {
        case 'gender':
            characterData.gender = value;
            updateAvatar();
            break;
        case 'hair':
            characterData.appearance.hair = value;
            updateCharacterPreview();  // 更新预览
            break;
        case 'hairColor':
            characterData.appearance.hairColor = value;
            updateCharacterPreview();  // 更新预览
            break;
        case 'body':
            characterData.appearance.body = value;
            updateCharacterPreview();  // 更新预览
            break;
    }

    updateProgress();
}

// 更新滑块值（年龄）
function updateSliderValue(id, value) {
    document.getElementById(id + 'Value').textContent = value;
    if (id === 'age') {
        characterData.age = parseInt(value);
    }
    updateProgress();
}

// 更新属性值
function updateAttribute(attr, value) {
    const newValue = parseInt(value);
    const oldValue = characterData.attributes[attr];

    // 计算当前使用的总点数
    let totalUsed = 0;
    for (let key in characterData.attributes) {
        if (key !== attr) {
            totalUsed += characterData.attributes[key] - baseAttributes[key];
        }
    }
    totalUsed += newValue - baseAttributes[attr];

    // 检查是否超过最大点数
    if (totalUsed > characterData.maxAttributePoints) {
        // 恢复原值
        document.getElementById(attr + 'Slider').value = oldValue;
        alert('属性点数不足！');
        return;
    }

    // 更新属性值
    characterData.attributes[attr] = newValue;
    document.getElementById(attr + 'Value').textContent = newValue;

    // 更新剩余点数
    updateRemainingPoints();
    updateProgress();
}

// 更新剩余点数显示
function updateRemainingPoints() {
    let totalUsed = 0;
    for (let key in characterData.attributes) {
        totalUsed += characterData.attributes[key] - baseAttributes[key];
    }
    const remaining = characterData.maxAttributePoints - totalUsed;
    document.getElementById('remainingPoints').textContent = remaining;
}

// 更新角色预览
function updateAvatar() {
    const avatarMap = {
        'female': '👧',
        'male': '👦',
        'other': '🧑'
    };

    // 肤色修饰符（暂时默认，可以扩展）
    const skinTone = '🏻'; // 可以根据选择变化

    const emoji = (avatarMap[characterData.gender] || '👤') + skinTone;
    document.getElementById('previewAvatar').textContent = emoji;

    // 同时更新完整预览
    updateCharacterPreview();
}

// 新增：更新完整的角色预览（包括外观描述）
function updateCharacterPreview() {
    const previewContainer = document.querySelector('.character-preview');
    if (!previewContainer) return;

    // 生成描述文字
    const genderText = {
        'female': '女性',
        'male': '男性',
        'other': '中性'
    };

    const hairText = {
        'long': '长发',
        'short': '短发',
        'twintails': '双马尾',
        'ponytail': '单马尾'
    };

    const hairColorText = {
        'black': '黑色',
        'brown': '棕色',
        'blonde': '金色',
        'red': '红色',
        'purple': '紫色'
    };

    const bodyText = {
        'slim': '纤细',
        'normal': '标准',
        'athletic': '健壮',
        'plump': '丰满'
    };

    // 获取当前emoji
    const avatarMap = {
        'female': '👧',
        'male': '👦',
        'other': '🧑'
    };

    const emoji = (avatarMap[characterData.gender] || '👤') + '🏻';

    // 生成描述
    const gender = genderText[characterData.gender] || '未知';
    const hair = hairText[characterData.appearance.hair] || '长发';
    const hairColor = hairColorText[characterData.appearance.hairColor] || '黑色';
    const body = bodyText[characterData.appearance.body] || '标准';

    const description = `${gender}·${hairColor}${hair}·${body}`;

    // 添加发色指示器
    const hairColorHex = {
        'black': '#1a1a1a',
        'brown': '#8B4513',
        'blonde': '#FFD700',
        'red': '#DC143C',
        'purple': '#9370DB'
    };

    const currentHairColor = hairColorHex[characterData.appearance.hairColor] || '#1a1a1a';

    // 更新预览HTML
    previewContainer.innerHTML = `
        <div class="preview-avatar-container">
            <div class="preview-avatar" id="previewAvatar">${emoji}</div>
            <div class="hair-color-indicator" style="background: ${currentHairColor};" title="发色"></div>
        </div>
        <div class="preview-description">${description}</div>
        <style>
            .preview-avatar-container {
                position: relative;
                display: inline-block;
            }
            .preview-description {
                margin-top: 10px;
                font-size: 12px;
                color: #a1a1aa;
                text-align: center;
                padding: 4px 8px;
                background: rgba(139, 92, 246, 0.1);
                border-radius: 12px;
                border: 1px solid rgba(139, 92, 246, 0.2);
            }
            .hair-color-indicator {
                position: absolute;
                top: -5px;
                right: -5px;
                width: 20px;
                height: 20px;
                border-radius: 50%;
                border: 2px solid #fff;
                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            }
        </style>
    `;
}

// 切换NPC
function toggleNPC(element) {
    element.classList.toggle('active');
    const npcId = element.getAttribute('data-npc');
    characterData.enabledNPCs[npcId] = element.classList.contains('active');
    updateProgress();
}

// 选择难度
function selectDifficulty(element, difficulty) {
    // 移除其他难度的active类
    document.querySelectorAll('.difficulty-card').forEach(card => {
        card.classList.remove('active');
    });
    // 添加active类到当前难度
    element.classList.add('active');
    characterData.difficulty = difficulty;

    // 根据难度调整属性点数
    const difficultyPoints = {
        'easy': 25,
        'normal': 20,
        'hard': 15,
        'nightmare': 10
    };
    characterData.maxAttributePoints = difficultyPoints[difficulty];
    updateRemainingPoints();
    updateProgress();
}

// 显示/隐藏自定义NPC表单
function toggleCustomNPC() {
    const form = document.getElementById('customNPCForm');
    form.classList.toggle('active');

    // 清空表单
    if (!form.classList.contains('active')) {
        document.getElementById('npcName').value = '';
        document.getElementById('npcRole').value = '';
        document.getElementById('npcPersonality').value = '';
        document.getElementById('npcSchedule').value = '';
        document.getElementById('npcHobbies').value = '';
    }
}

// 保存自定义NPC
function saveCustomNPC() {
    const npcData = {
        name: document.getElementById('npcName').value,
        role: document.getElementById('npcRole').value,
        personality: document.getElementById('npcPersonality').value,
        schedule: document.getElementById('npcSchedule').value,
        hobbies: document.getElementById('npcHobbies').value,
        avatar: '👤'  // 默认头像
    };

    // 验证必填项
    if (!npcData.name || !npcData.role) {
        alert('请至少填写NPC姓名和角色定位！');
        return;
    }

    // 添加到自定义NPC列表
    characterData.customNPCs.push(npcData);

    // 添加到界面
    addNPCToList(npcData);

    // 关闭表单
    toggleCustomNPC();

    alert('自定义NPC已添加！');
    updateProgress();
}

// 添加NPC到列表显示
function addNPCToList(npcData) {
    const npcList = document.getElementById('npcList');
    const npcItem = document.createElement('div');
    npcItem.className = 'npc-item';
    npcItem.innerHTML = `
        <div class="npc-info">
            <span class="npc-avatar">${npcData.avatar}</span>
            <div class="npc-details">
                <span class="npc-name">${npcData.name}</span>
                <span class="npc-role">${npcData.role}</span>
            </div>
        </div>
        <div class="npc-toggle active" data-npc="custom_${Date.now()}" onclick="toggleNPC(this)">
            <div class="npc-toggle-slider"></div>
        </div>
    `;
    npcList.appendChild(npcItem);
}

// 更新进度条
function updateProgress() {
    let progress = 0;

    // 检查各项是否完成
    if (characterData.name) progress += 20;
    if (characterData.gender) progress += 20;
    if (characterData.appearance.hair && characterData.appearance.hairColor) progress += 20;
    if (Object.keys(characterData.enabledNPCs).some(key => characterData.enabledNPCs[key])) progress += 20;
    if (characterData.difficulty) progress += 20;

    // 更新进度条
    document.getElementById('progressFill').style.width = progress + '%';
}

// 返回主菜单
function goBack() {
    if (confirm('返回主菜单将丢失当前的角色设置，确定要返回吗？')) {
        // 返回菜单
        window.location.href = 'menu.html';
    }
}

// 加载预设中的角色设置
function loadPresetSettings() {
    // 从sessionStorage获取预设ID
    const presetId = sessionStorage.getItem('activePresetId');
    if (!presetId) {
        console.log('没有找到激活的预设ID');
        return;
    }

    // 从localStorage获取预设
    const savedPresets = localStorage.getItem('game_presets');
    if (!savedPresets) {
        console.log('没有找到保存的预设');
        return;
    }

    try {
        const data = JSON.parse(savedPresets);
        const preset = data.presets.find(p => p.id === presetId);

        if (preset && preset.settings) {
            const s = preset.settings;
            console.log('加载预设:', preset.name, s);

            // 应用难度设置
            if (s.difficulty) {
                characterData.difficulty = s.difficulty;
                // 更新UI - 选择对应的难度卡片
                const difficultyCard = document.querySelector(`[data-difficulty="${s.difficulty}"]`);
                if (difficultyCard) {
                    selectDifficulty(difficultyCard, s.difficulty);
                }
            }

            // 应用角色预设
            if (s.character) {
                // 应用性别
                if (s.character.gender) {
                    characterData.gender = s.character.gender;
                    // 更新UI - 选择对应的性别按钮
                    const genderButtons = document.querySelectorAll('.option-group .option-btn');
                    genderButtons.forEach(btn => {
                        btn.classList.remove('active');
                    });
                    const genderMap = {
                        'female': '女性',
                        'male': '男性',
                        'other': '其他'
                    };
                    const targetText = genderMap[s.character.gender];
                    genderButtons.forEach(btn => {
                        if (btn.textContent === targetText) {
                            btn.classList.add('active');
                        }
                    });
                    updateAvatar();
                }

                // 应用体型
                if (s.character.bodyType) {
                    // 转换bodyType格式
                    const bodyTypeMap = {
                        'small': 'slim',
                        'medium': 'normal',
                        'large': 'athletic'
                    };
                    const bodyType = bodyTypeMap[s.character.bodyType] || 'normal';
                    characterData.appearance.body = bodyType;

                    // 更新UI - 选择对应的体型按钮
                    const bodyButtons = document.querySelectorAll('[onclick*="body"]');
                    bodyButtons.forEach(btn => {
                        btn.classList.remove('active');
                        if (btn.getAttribute('onclick').includes(bodyType)) {
                            btn.classList.add('active');
                        }
                    });
                }

                // 应用初始属性
                if (s.character.initialStats) {
                    const stats = s.character.initialStats;

                    // 映射属性（预设系统和角色创建系统的属性名称可能不同）
                    const statMapping = {
                        'strength': 'str',      // 力量 → 体力
                        'intelligence': 'int',  // 智力
                        'charisma': 'cha',     // 魅力
                        'agility': 'cou'       // 敏捷 → 勇气
                    };

                    // 计算总点数
                    let totalPoints = 0;
                    for (let key in stats) {
                        if (key !== 'luck') { // 幸运值不在角色创建中
                            totalPoints += (stats[key] - 5); // 减去基础值
                        }
                    }

                    // 设置最大属性点数
                    characterData.maxAttributePoints = 20 + totalPoints;

                    // 应用到角色数据和UI
                    if (stats.strength !== undefined) {
                        characterData.attributes.str = stats.strength;
                        const slider = document.getElementById('strSlider');
                        if (slider) {
                            slider.value = stats.strength;
                            document.getElementById('strValue').textContent = stats.strength;
                        }
                    }

                    if (stats.intelligence !== undefined) {
                        characterData.attributes.int = stats.intelligence;
                        const slider = document.getElementById('intSlider');
                        if (slider) {
                            slider.value = stats.intelligence;
                            document.getElementById('intValue').textContent = stats.intelligence;
                        }
                    }

                    if (stats.charisma !== undefined) {
                        characterData.attributes.cha = stats.charisma;
                        const slider = document.getElementById('chaSlider');
                        if (slider) {
                            slider.value = stats.charisma;
                            document.getElementById('chaValue').textContent = stats.charisma;
                        }
                    }

                    if (stats.agility !== undefined) {
                        characterData.attributes.cou = stats.agility;
                        const slider = document.getElementById('couSlider');
                        if (slider) {
                            slider.value = stats.agility;
                            document.getElementById('couValue').textContent = stats.agility;
                        }
                    }

                    // 更新剩余点数显示
                    updateRemainingPoints();

                    console.log('已应用预设属性:', stats);
                }
            }

            // 应用世界设置到难度（如果有扩展的难度设置）
            if (s.economyDifficulty || s.npcDensity) {
                // 这些设置会在进入游戏时应用
                sessionStorage.setItem('worldSettings', JSON.stringify({
                    economyDifficulty: s.economyDifficulty || 'normal',
                    npcDensity: s.npcDensity || 'normal',
                    startSeason: s.startSeason || 'spring'
                }));
            }

            console.log('✅ 预设已成功应用到角色创建界面');
        }
    } catch (e) {
        console.error('加载预设失败:', e);
    }
}

// 进入游戏
function enterReality() {
    // 验证必填项
    if (!characterData.name) {
        alert('请输入角色姓名！');
        document.getElementById('characterName').focus();
        return;
    }

    // 检查是否至少启用了一个NPC
    const hasEnabledNPC = Object.values(characterData.enabledNPCs).some(enabled => enabled) ||
                          characterData.customNPCs.length > 0;

    if (!hasEnabledNPC) {
        alert('请至少启用一个NPC！');
        return;
    }

    console.log('角色创建完成，数据：', characterData);

    // 保存角色数据到localStorage
    localStorage.setItem('characterData', JSON.stringify(characterData));

    // 保存游戏初始状态
    const initialGameState = {
        character: {
            name: characterData.name,
            gender: characterData.gender,
            age: characterData.age,
            appearance: characterData.appearance,
            attributes: characterData.attributes,
            // 初始游戏属性
            health: 100,
            mood: 50,
            money: 100,
            location: 'awakening_room',
            relationships: {},
            // 外观数据（立绘系统用）
            appearanceData: {
                gender: characterData.gender,
                bodyType: characterData.appearance.body || 'normal',
                skinTone: 'fair', // 可以扩展
                hairStyle: characterData.appearance.hair || 'long',
                hairColor: characterData.appearance.hairColor || 'black',
                eyeShape: 'round', // 可以扩展
                eyeColor: 'brown'  // 可以扩展
            }
        },
        npcs: characterData.enabledNPCs,
        customNPCs: characterData.customNPCs,
        difficulty: characterData.difficulty,
        gameTime: {
            day: 1,
            hour: 8,
            minute: 0,
            weekday: 'Monday'
        }
    };

    // 初始化NPC关系
    for (let npcId in characterData.enabledNPCs) {
        if (characterData.enabledNPCs[npcId]) {
            initialGameState.character.relationships[npcId] = 0;  // 初始好感度为0
        }
    }

    // 保存初始游戏状态
    localStorage.setItem('gameState', JSON.stringify(initialGameState));

    // 跳转到游戏主界面
    window.location.href = 'game-main.html';
}

// 加载之前的设置（如果有）
function loadPreviousSettings() {
    const savedConfig = localStorage.getItem('gameConfig');
    if (savedConfig) {
        const config = JSON.parse(savedConfig);
        // 应用难度设置
        if (config.difficulty) {
            const difficultyCard = document.querySelector(`[data-difficulty="${config.difficulty}"]`);
            if (difficultyCard) {
                selectDifficulty(difficultyCard, config.difficulty);
            }
        }
    }
}