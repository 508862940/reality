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
    // 加载之前的配置（如果有）
    loadPreviousSettings();

    // 更新进度条
    updateProgress();

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
            break;
        case 'hairColor':
            characterData.appearance.hairColor = value;
            break;
        case 'body':
            characterData.appearance.body = value;
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
    document.getElementById('previewAvatar').textContent = avatarMap[characterData.gender] || '👤';
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
            location: 'school',
            relationships: {}
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