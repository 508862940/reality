// 高级游戏系统 - 类似DOL的复杂交互

// 扩展的游戏数据
const advancedGameData = {
    // 角色属性（更复杂）
    character: {
        // 基础属性
        health: 100,
        mood: 50,
        money: 100,
        energy: 100,
        hunger: 50,
        hygiene: 80,
        
        // 技能属性
        intelligence: 50,
        strength: 50,
        charisma: 50,
        athletics: 50,
        
        // 状态效果
        effects: [],
        
        // 物品
        inventory: [],
        
        // 关系
        relationships: {
            teacher: { level: 0, mood: 50 },
            student: { level: 0, mood: 50 },
            shopkeeper: { level: 0, mood: 50 }
        }
    },

    // 时间系统
    time: {
        day: 1,
        hour: 8,
        minute: 0,
        week: 1,
        season: 'spring'
    },

    // 复杂的事件系统
    events: {
        // 随机事件
        random: [
            {
                id: 'mysterious_note',
                title: '神秘纸条',
                description: '你在地上发现了一张纸条，上面写着一些奇怪的字。',
                conditions: { location: ['school', 'park'], time: ['morning', 'afternoon'] },
                choices: [
                    { text: '仔细阅读', action: 'read_note', effects: { intelligence: +2, mood: +5 } },
                    { text: '忽略它', action: 'ignore_note', effects: { mood: -2 } },
                    { text: '交给老师', action: 'give_to_teacher', effects: { relationships: { teacher: { level: +1 } } } }
                ]
            },
            {
                id: 'lost_child',
                title: '迷路的小孩',
                description: '你遇到了一个迷路的小孩子，看起来很难过。',
                conditions: { location: ['park'], time: ['afternoon'] },
                choices: [
                    { text: '帮助他', action: 'help_child', effects: { charisma: +3, mood: +10, money: -5 } },
                    { text: '不理他', action: 'ignore_child', effects: { mood: -5 } },
                    { text: '通知保安', action: 'call_security', effects: { intelligence: +1 } }
                ]
            }
        ],

        // 条件事件
        conditional: [
            {
                id: 'exhaustion',
                title: '疲劳过度',
                description: '你感到非常疲惫，需要休息。',
                trigger: { energy: { '<': 20 } },
                choices: [
                    { text: '立即休息', action: 'rest_now', effects: { energy: +50, time: { hour: +2 } } },
                    { text: '坚持一下', action: 'push_through', effects: { energy: -10, health: -5 } }
                ]
            },
            {
                id: 'hunger',
                title: '饥饿',
                description: '你的肚子开始咕咕叫了。',
                trigger: { hunger: { '>': 80 } },
                choices: [
                    { text: '去食堂吃饭', action: 'eat_cafeteria', effects: { hunger: -30, money: -15 } },
                    { text: '吃零食', action: 'eat_snacks', effects: { hunger: -20, health: -5 } },
                    { text: '忍一忍', action: 'endure_hunger', effects: { mood: -5 } }
                ]
            }
        ]
    },

    // 物品系统
    items: {
        'apple': { name: '苹果', price: 5, effects: { hunger: -10, health: +5 } },
        'book': { name: '书本', price: 20, effects: { intelligence: +2 } },
        'energy_drink': { name: '能量饮料', price: 8, effects: { energy: +30, health: -5 } },
        'soap': { name: '肥皂', price: 3, effects: { hygiene: +20 } }
    },

    // 技能系统
    skills: {
        intelligence: {
            name: '智力',
            max: 100,
            effects: ['study_bonus', 'puzzle_solving']
        },
        strength: {
            name: '力量',
            max: 100,
            effects: ['carry_capacity', 'physical_activities']
        },
        charisma: {
            name: '魅力',
            max: 100,
            effects: ['social_bonus', 'persuasion']
        },
        athletics: {
            name: '运动',
            max: 100,
            effects: ['stamina_bonus', 'sports_performance']
        }
    }
};

// 高级游戏逻辑
class AdvancedGameLogic {
    constructor() {
        this.eventHistory = [];
        this.dailyEvents = [];
        this.timeInterval = null;
    }

    // 时间流逝
    startTimeSystem() {
        this.timeInterval = setInterval(() => {
            this.advanceTime();
            this.checkRandomEvents();
            this.checkConditionalEvents();
            this.updateCharacterStats();
        }, 30000); // 每30秒游戏时间前进1分钟
    }

    advanceTime() {
        advancedGameData.time.minute += 1;
        if (advancedGameData.time.minute >= 60) {
            advancedGameData.time.minute = 0;
            advancedGameData.time.hour += 1;
        }
        if (advancedGameData.time.hour >= 24) {
            advancedGameData.time.hour = 0;
            advancedGameData.time.day += 1;
        }
        if (advancedGameData.time.day > 7) {
            advancedGameData.time.day = 1;
            advancedGameData.time.week += 1;
        }
    }

    // 检查随机事件
    checkRandomEvents() {
        const currentTime = this.getTimeOfDay();
        const currentLocation = gameData.character.location;
        
        advancedGameData.events.random.forEach(event => {
            if (this.shouldTriggerEvent(event, currentLocation, currentTime)) {
                this.triggerEvent(event);
            }
        });
    }

    // 检查条件事件
    checkConditionalEvents() {
        advancedGameData.events.conditional.forEach(event => {
            if (this.checkEventConditions(event.trigger)) {
                this.triggerEvent(event);
            }
        });
    }

    // 触发事件
    triggerEvent(event) {
        // 防止重复触发
        if (this.eventHistory.includes(event.id)) return;
        
        this.eventHistory.push(event.id);
        this.showEventModal(event);
    }

    // 显示事件模态框
    showEventModal(event) {
        // 创建事件模态框
        const modal = document.createElement('div');
        modal.className = 'event-modal';
        modal.innerHTML = `
            <div class="event-content">
                <h3>${event.title}</h3>
                <p>${event.description}</p>
                <div class="event-choices">
                    ${event.choices.map(choice => 
                        `<button class="event-choice" onclick="handleEventChoice('${event.id}', '${choice.action}')">
                            ${choice.text}
                        </button>`
                    ).join('')}
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    // 处理事件选择
    handleEventChoice(eventId, action) {
        const event = advancedGameData.events.random.find(e => e.id === eventId) ||
                     advancedGameData.events.conditional.find(e => e.id === eventId);
        
        if (event) {
            const choice = event.choices.find(c => c.action === action);
            if (choice && choice.effects) {
                this.applyEffects(choice.effects);
            }
        }
        
        // 移除模态框
        document.querySelector('.event-modal')?.remove();
    }

    // 应用效果
    applyEffects(effects) {
        Object.keys(effects).forEach(stat => {
            if (typeof effects[stat] === 'number') {
                advancedGameData.character[stat] += effects[stat];
                // 确保属性值在合理范围内
                if (stat === 'health' || stat === 'mood' || stat === 'energy' || 
                    stat === 'hunger' || stat === 'hygiene') {
                    advancedGameData.character[stat] = Math.max(0, Math.min(100, advancedGameData.character[stat]));
                }
            }
        });
        
        updateCharacterPanel();
    }

    // 更新角色状态
    updateCharacterStats() {
        // 随时间自然变化
        advancedGameData.character.energy -= 0.5;
        advancedGameData.character.hunger += 0.3;
        advancedGameData.character.hygiene -= 0.2;
        
        // 确保属性值在合理范围内
        Object.keys(advancedGameData.character).forEach(stat => {
            if (typeof advancedGameData.character[stat] === 'number' && 
                ['health', 'mood', 'energy', 'hunger', 'hygiene'].includes(stat)) {
                advancedGameData.character[stat] = Math.max(0, Math.min(100, advancedGameData.character[stat]));
            }
        });
    }

    // 辅助方法
    shouldTriggerEvent(event, location, time) {
        return event.conditions.location.includes(location) && 
               event.conditions.time.includes(time);
    }

    checkEventConditions(conditions) {
        return Object.keys(conditions).every(stat => {
            const condition = conditions[stat];
            const value = advancedGameData.character[stat];
            
            if (typeof condition === 'object') {
                return Object.keys(condition).every(op => {
                    switch(op) {
                        case '<': return value < condition[op];
                        case '>': return value > condition[op];
                        case '<=': return value <= condition[op];
                        case '>=': return value >= condition[op];
                        case '==': return value === condition[op];
                        default: return false;
                    }
                });
            }
            return value === condition;
        });
    }

    getTimeOfDay() {
        const hour = advancedGameData.time.hour;
        if (hour < 6) return 'night';
        if (hour < 12) return 'morning';
        if (hour < 18) return 'afternoon';
        return 'evening';
    }
}

// 全局实例
const advancedGame = new AdvancedGameLogic();

// 初始化高级游戏
function initAdvancedGame() {
    // 启动时间系统
    advancedGame.startTimeSystem();
    
    // 更新UI显示更多属性
    updateAdvancedCharacterPanel();
}

// 更新高级角色面板
function updateAdvancedCharacterPanel() {
    const panel = document.getElementById('character-panel');
    panel.innerHTML = `
        <div class="stat">
            <span class="stat-name">体力:</span>
            <span id="health" class="stat-value">${advancedGameData.character.health}</span>
        </div>
        <div class="stat">
            <span class="stat-name">心情:</span>
            <span id="mood" class="stat-value">${advancedGameData.character.mood}</span>
        </div>
        <div class="stat">
            <span class="stat-name">金钱:</span>
            <span id="money" class="stat-value">${advancedGameData.character.money}</span>
        </div>
        <div class="stat">
            <span class="stat-name">精力:</span>
            <span id="energy" class="stat-value">${advancedGameData.character.energy}</span>
        </div>
        <div class="stat">
            <span class="stat-name">饥饿:</span>
            <span id="hunger" class="stat-value">${advancedGameData.character.hunger}</span>
        </div>
        <div class="stat">
            <span class="stat-name">卫生:</span>
            <span id="hygiene" class="stat-value">${advancedGameData.character.hygiene}</span>
        </div>
    `;
}

// 导出给全局使用
window.advancedGame = advancedGame;
window.advancedGameData = advancedGameData;
