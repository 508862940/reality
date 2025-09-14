// 游戏数据
const gameData = {
    // 角色属性
    character: {
        health: 100,
        mood: 50,
        money: 100,
        location: 'school'
    },

    // 地点数据
    locations: {
        school: {
            name: '学校',
            description: '你站在学校的大门前，可以看到教学楼和操场。阳光洒在校园里，给人一种温暖的感觉。',
            options: [
                { text: '进入教室', target: 'classroom' },
                { text: '去操场', target: 'playground' },
                { text: '去食堂', target: 'cafeteria' },
                { text: '离开学校', target: 'town' }
            ]
        },
        classroom: {
            name: '教室',
            description: '教室里空无一人，桌椅整齐地排列着。黑板上有一些数学公式，阳光从窗户洒进来。',
            options: [
                { text: '坐在座位上', action: 'study' },
                { text: '查看黑板', action: 'checkBoard' },
                { text: '回到走廊', target: 'school' }
            ]
        },
        playground: {
            name: '操场',
            description: '操场上很热闹，有学生在打篮球，有在跑步的。阳光明媚，是个运动的好天气。',
            options: [
                { text: '加入篮球赛', action: 'playBasketball' },
                { text: '跑步锻炼', action: 'runExercise' },
                { text: '坐在长椅上休息', action: 'rest' },
                { text: '回到学校', target: 'school' }
            ]
        },
        cafeteria: {
            name: '食堂',
            description: '食堂里飘着饭菜的香味，现在是午餐时间，有很多学生在排队买饭。',
            options: [
                { text: '排队买饭', action: 'buyFood' },
                { text: '找个座位坐下', action: 'sitDown' },
                { text: '回到学校', target: 'school' }
            ]
        },
        town: {
            name: '小镇',
            description: '你来到了小镇的街道上，可以看到商店、公园和住宅区。这里比学校热闹多了。',
            options: [
                { text: '去商店', target: 'shop' },
                { text: '去公园', target: 'park' },
                { text: '回到学校', target: 'school' }
            ]
        },
        shop: {
            name: '商店',
            description: '商店里商品琳琅满目，从日用品到零食应有尽有。店员正在整理货架。',
            options: [
                { text: '买零食', action: 'buySnacks' },
                { text: '买文具', action: 'buyStationery' },
                { text: '回到街道', target: 'town' }
            ]
        },
        park: {
            name: '公园',
            description: '公园里绿树成荫，有喷泉和长椅。很多人在散步，还有一些孩子在玩耍。',
            options: [
                { text: '散步', action: 'takeWalk' },
                { text: '坐在长椅上', action: 'sitOnBench' },
                { text: '回到街道', target: 'town' }
            ]
        }
    },

    // 事件数据
    events: {
        study: {
            text: '你坐在座位上认真学习，感觉知识增加了。',
            effects: { mood: +5, health: -2 }
        },
        checkBoard: {
            text: '黑板上的数学公式看起来很复杂，但你努力理解着。',
            effects: { mood: +3 }
        },
        playBasketball: {
            text: '你加入了篮球赛，虽然技术一般，但玩得很开心！',
            effects: { health: +10, mood: +15, money: -5 }
        },
        runExercise: {
            text: '你绕着操场跑了几圈，感觉身体更有活力了。',
            effects: { health: +8, mood: +5 }
        },
        rest: {
            text: '你坐在长椅上休息，看着其他同学运动，感觉很放松。',
            effects: { health: +5, mood: +3 }
        },
        buyFood: {
            text: '你买了美味的午餐，营养均衡。',
            effects: { health: +15, mood: +8, money: -20 }
        },
        sitDown: {
            text: '你找了个安静的座位坐下，观察着食堂里的人群。',
            effects: { mood: +2 }
        },
        buySnacks: {
            text: '你买了一些零食，虽然不健康但很好吃。',
            effects: { mood: +10, health: -5, money: -15 }
        },
        buyStationery: {
            text: '你买了一些新的文具，准备好好学习。',
            effects: { mood: +5, money: -25 }
        },
        takeWalk: {
            text: '你在公园里悠闲地散步，欣赏着美丽的风景。',
            effects: { health: +5, mood: +8 }
        },
        sitOnBench: {
            text: '你坐在长椅上，享受着公园里的宁静时光。',
            effects: { mood: +6, health: +3 }
        }
    }
};

// 游戏初始化
function initGame() {
    updateCharacterPanel();
    updateLocationDisplay();
    updateInteractionOptions();
}

// 更新角色状态面板
function updateCharacterPanel() {
    document.getElementById('health').textContent = gameData.character.health;
    document.getElementById('mood').textContent = gameData.character.mood;
    document.getElementById('money').textContent = gameData.character.money;
}

// 更新地点显示
function updateLocationDisplay() {
    const currentLocation = gameData.locations[gameData.character.location];
    document.getElementById('current-location').textContent = currentLocation.name;
    document.getElementById('location-description').textContent = currentLocation.description;
}

// 更新互动选项
function updateInteractionOptions() {
    const optionsContainer = document.getElementById('interaction-options');
    const currentLocation = gameData.locations[gameData.character.location];
    
    optionsContainer.innerHTML = '';
    
    currentLocation.options.forEach(option => {
        const button = document.createElement('button');
        button.className = 'option-btn';
        button.textContent = option.text;
        
        if (option.target) {
            button.onclick = () => goToLocation(option.target);
        } else if (option.action) {
            button.onclick = () => performAction(option.action);
        }
        
        optionsContainer.appendChild(button);
    });
}

// 前往指定地点
function goToLocation(locationId) {
    gameData.character.location = locationId;
    updateLocationDisplay();
    updateInteractionOptions();
    
    // 显示移动提示
    showEventText(`你来到了${gameData.locations[locationId].name}。`);
}

// 执行动作
function performAction(actionId) {
    const action = gameData.events[actionId];
    if (!action) return;
    
    // 显示事件文本
    showEventText(action.text);
    
    // 应用效果
    if (action.effects) {
        Object.keys(action.effects).forEach(stat => {
            gameData.character[stat] += action.effects[stat];
            // 确保属性值在合理范围内
            if (stat === 'health' || stat === 'mood') {
                gameData.character[stat] = Math.max(0, Math.min(100, gameData.character[stat]));
            }
            if (stat === 'money') {
                gameData.character[stat] = Math.max(0, gameData.character[stat]);
            }
        });
        updateCharacterPanel();
    }
}

// 显示事件文本
function showEventText(text) {
    document.getElementById('event-text').textContent = text;
}

// AI功能相关变量
let currentNPC = null;
let aiChatOpen = false;

// AI聊天功能
function openAIChat() {
    // 根据当前位置确定NPC类型
    const locationToNPC = {
        'classroom': 'teacher',
        'playground': 'student', 
        'shop': 'shopkeeper',
        'park': 'stranger'
    };
    
    currentNPC = locationToNPC[gameData.character.location] || 'student';
    const npc = AIConfig.npcPersonalities[currentNPC];
    
    document.getElementById('ai-npc-name').textContent = npc.name;
    document.getElementById('ai-chat-modal').style.display = 'block';
    aiChatOpen = true;
    
    // 清空之前的对话
    document.getElementById('ai-chat-messages').innerHTML = '';
    
    // 显示NPC的问候语
    addChatMessage('ai', npc.greeting);
    
    // 聚焦输入框
    document.getElementById('ai-chat-input').focus();
}

function closeAIChat() {
    document.getElementById('ai-chat-modal').style.display = 'none';
    aiChatOpen = false;
    currentNPC = null;
}

function handleChatKeyPress(event) {
    if (event.key === 'Enter') {
        sendChatMessage();
    }
}

async function sendChatMessage() {
    const input = document.getElementById('ai-chat-input');
    const message = input.value.trim();
    
    if (!message || !currentNPC) return;
    
    // 显示用户消息
    addChatMessage('user', message);
    input.value = '';
    
    // 显示AI正在思考
    const thinkingMsg = addChatMessage('ai', '正在思考...');
    
    try {
        // 获取AI回应
        const context = {
            location: gameData.locations[gameData.character.location].name,
            health: gameData.character.health,
            mood: gameData.character.mood,
            money: gameData.character.money
        };
        
        const response = await aiConversation.generateResponse(currentNPC, message, context);
        
        // 移除"正在思考"消息，显示实际回应
        thinkingMsg.remove();
        addChatMessage('ai', response);
        
    } catch (error) {
        thinkingMsg.remove();
        addChatMessage('ai', '抱歉，我现在无法回应。请稍后再试。');
    }
}

function addChatMessage(type, message) {
    const messagesContainer = document.getElementById('ai-chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${type}`;
    messageDiv.textContent = message;
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    return messageDiv;
}

// AI事件生成
async function generateAIEvent() {
    showEventText('AI正在生成一个有趣的事件...');
    
    try {
        // 这里可以调用AI生成随机事件
        const events = [
            '你发现了一个隐藏的小径，通向一个神秘的花园。',
            '一只友好的猫咪向你走来，似乎在寻找什么。',
            '你注意到地上有一张纸条，上面写着一些奇怪的字。',
            '突然下起了雨，你需要在附近找个地方避雨。',
            '你遇到了一个迷路的小孩子，需要帮助他找到回家的路。'
        ];
        
        const randomEvent = events[Math.floor(Math.random() * events.length)];
        
        // 模拟AI生成延迟
        setTimeout(() => {
            showEventText(randomEvent);
            
            // 随机影响角色属性
            const effects = [
                { health: +5, mood: +10 },
                { mood: +15 },
                { health: +8, mood: +5 },
                { health: -3, mood: +5 },
                { mood: +20, money: -10 }
            ];
            
            const effect = effects[Math.floor(Math.random() * effects.length)];
            Object.keys(effect).forEach(stat => {
                gameData.character[stat] += effect[stat];
                gameData.character[stat] = Math.max(0, Math.min(100, gameData.character[stat]));
            });
            
            updateCharacterPanel();
        }, 1500);
        
    } catch (error) {
        showEventText('AI事件生成失败，请稍后再试。');
    }
}

// AI设置功能
function toggleAISettings() {
    const panel = document.getElementById('ai-settings-panel');
    panel.style.display = panel.style.display === 'block' ? 'none' : 'block';
}

function changeAIProvider() {
    const select = document.getElementById('ai-provider-select');
    const selectedProvider = select.value;
    
    // 更新当前使用的AI提供商
    AIConfig.currentProvider = selectedProvider;
    
    // 显示/隐藏API密钥输入框
    const apiKeyInput = document.getElementById('api-key-input');
    if (selectedProvider === 'local') {
        apiKeyInput.style.display = 'none';
    } else {
        apiKeyInput.style.display = 'block';
    }
}

function saveAISettings() {
    const provider = document.getElementById('ai-provider-select').value;
    const apiKey = document.getElementById('api-key-input').value;
    
    // 保存设置到本地存储
    const settings = {
        provider: provider,
        apiKey: apiKey
    };
    
    localStorage.setItem('aiSettings', JSON.stringify(settings));
    
    // 更新配置
    AIConfig.currentProvider = provider;
    if (apiKey) {
        AIConfig.api[provider].apiKey = apiKey;
        AIConfig.api[provider].enabled = true;
    }
    
    alert('AI设置已保存！');
    toggleAISettings();
}

async function testAIConnection() {
    const button = event.target;
    const originalText = button.textContent;
    button.textContent = '测试中...';
    button.disabled = true;
    
    try {
        const response = await aiConversation.generateResponse('student', '你好', {
            location: '测试地点',
            health: 100,
            mood: 50,
            money: 100
        });
        
        alert('AI连接测试成功！\nAI回应：' + response);
    } catch (error) {
        alert('AI连接测试失败：' + error.message);
    } finally {
        button.textContent = originalText;
        button.disabled = false;
    }
}

// 加载保存的AI设置
function loadAISettings() {
    const saved = localStorage.getItem('aiSettings');
    if (saved) {
        const settings = JSON.parse(saved);
        document.getElementById('ai-provider-select').value = settings.provider;
        document.getElementById('api-key-input').value = settings.apiKey || '';
        
        AIConfig.currentProvider = settings.provider;
        if (settings.apiKey) {
            AIConfig.api[settings.provider].apiKey = settings.apiKey;
            AIConfig.api[settings.provider].enabled = true;
        }
        
        changeAIProvider();
    }
}

// 点击模态框外部关闭
window.onclick = function(event) {
    const modal = document.getElementById('ai-chat-modal');
    const settingsPanel = document.getElementById('ai-settings-panel');
    
    if (event.target === modal) {
        closeAIChat();
    }
    
    if (event.target === settingsPanel) {
        toggleAISettings();
    }
}

// 页面加载完成后初始化游戏
document.addEventListener('DOMContentLoaded', function() {
    initGame();
    loadAISettings();
});

