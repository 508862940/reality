/**
 * 🎯 响应式系统 - 让数据变化自动更新UI
 * 像魔法一样，改了数据，界面就自动变！
 */

class ReactiveSystem {
    constructor() {
        // 存储所有的监听器（谁在监听什么数据）
        this.watchers = {};

        // 初始化提示
        console.log('✨ 响应式系统启动！数据变化将自动更新UI');
    }

    /**
     * 创建响应式数据
     * @param {Object} target - 要变成响应式的对象
     * @returns {Proxy} - 返回一个"魔法对象"
     */
    createReactive(target) {
        return new Proxy(target, {
            // 当设置属性时触发
            set: (obj, prop, value) => {
                const oldValue = obj[prop];

                // 如果值没变，不做任何事
                if (oldValue === value) return true;

                // 更新数据
                obj[prop] = value;

                // 打印变化日志
                console.log(`🔄 数据变化: ${prop} 从 ${oldValue} → ${value}`);

                // 触发所有监听这个属性的函数
                this.notify(prop, value, oldValue);

                return true;
            },

            // 当获取属性时触发
            get: (obj, prop) => {
                return obj[prop];
            }
        });
    }

    /**
     * 监听数据变化
     * @param {string} property - 要监听的属性名
     * @param {function} callback - 数据变化时执行的函数
     */
    watch(property, callback) {
        if (!this.watchers[property]) {
            this.watchers[property] = [];
        }
        this.watchers[property].push(callback);

        console.log(`👁️ 开始监听: ${property}`);
    }

    /**
     * 通知所有监听器
     */
    notify(property, newValue, oldValue) {
        // 如果有人在监听这个属性
        if (this.watchers[property]) {
            this.watchers[property].forEach(callback => {
                callback(newValue, oldValue);
            });
        }

        // 如果有人在监听所有变化
        if (this.watchers['*']) {
            this.watchers['*'].forEach(callback => {
                callback(property, newValue, oldValue);
            });
        }
    }

    /**
     * 设置NPC的自动更新规则
     */
    setupNPCBindings(npcName) {
        // NPC好感度变化 → 自动更新对话选项
        this.watch(`npc_${npcName}_affection`, (newVal) => {
            console.log(`💕 ${npcName}好感度: ${newVal}`);
            this.updateNPCDialogue(npcName, newVal);
        });

        // NPC心情变化 → 自动更新立绘表情
        this.watch(`npc_${npcName}_mood`, (newVal) => {
            this.updateNPCSprite(npcName, newVal);
        });

        // NPC状态变化 → 自动更新AI响应模式
        this.watch(`npc_${npcName}_state`, (newVal) => {
            this.updateAIMode(npcName, newVal);
        });
    }

    /**
     * 更新NPC对话（根据好感度）
     */
    updateNPCDialogue(npcName, affection) {
        if (npcName === 'Zero') {
            // Zero的对话会根据好感度变化
            if (affection < 30) {
                // 冷淡状态：简短回应
                console.log('🐺 Zero态度冷淡');
            } else if (affection < 70) {
                // 友好状态：正常对话
                console.log('🐺 Zero愿意交谈');
            } else {
                // 亲密状态：温柔对话
                console.log('🐺 Zero眼神温柔');
                // 解锁特殊对话选项
                this.showNotice('💝 解锁了Zero的特殊对话！');
            }
        }
    }

    /**
     * 更新NPC立绘
     */
    updateNPCSprite(npcName, mood) {
        const spriteEl = document.querySelector('.sprite-placeholder');
        if (spriteEl && npcName === 'Zero') {
            // 根据心情更新Zero的立绘
            if (mood === 'angry') {
                spriteEl.textContent = '😠';
                spriteEl.style.color = '#ff4444';
            } else if (mood === 'happy') {
                spriteEl.textContent = '😊';
                spriteEl.style.color = '#44ff44';
            } else if (mood === 'worried') {
                spriteEl.textContent = '😟';
                spriteEl.style.color = '#ffaa44';
            }
        }
    }

    /**
     * 更新AI响应模式
     */
    updateAIMode(npcName, state) {
        // 当NPC状态改变，AI响应也会改变
        if (window.aiNPCSystem) {
            window.aiNPCSystem.updateNPCContext(npcName, {
                currentState: state,
                responseMode: this.getAIModeByState(state)
            });
        }
    }

    /**
     * 根据状态获取AI模式
     */
    getAIModeByState(state) {
        const modes = {
            'hostile': 'defensive',    // 敌对时防御性回应
            'neutral': 'polite',        // 中立时礼貌回应
            'friendly': 'warm',         // 友好时温暖回应
            'intimate': 'affectionate'  // 亲密时深情回应
        };
        return modes[state] || 'neutral';
    }

    /**
     * 设置角色属性的自动更新规则
     */
    setupCharacterBindings() {
        // 体力变化 → 自动更新体力条
        this.watch('health', (newVal) => {
            this.updateStatBar('health', newVal);
            this.checkHealthWarning(newVal);
        });

        // 心情变化 → 自动更新心情条
        this.watch('mood', (newVal) => {
            this.updateStatBar('mood', newVal);
            this.updateMoodEmoji(newVal);
        });

        // 金钱变化 → 自动更新金钱显示
        this.watch('money', (newVal) => {
            this.updateStatBar('money', newVal);
            this.checkMoneyStatus(newVal);
        });

        // 精力变化 → 自动更新精力条
        this.watch('energy', (newVal) => {
            this.updateStatBar('energy', newVal);
            this.checkEnergyWarning(newVal);
        });

        // 精神值变化 → 自动更新精神条
        this.watch('spirit', (newVal) => {
            this.updateStatBar('spirit', newVal);
        });

        // 位置变化 → 自动更新位置显示
        this.watch('location', (newVal) => {
            const locEl = document.getElementById('currentLocation');
            if (locEl) {
                locEl.textContent = newVal;
                console.log(`📍 位置更新: ${newVal}`);
            }
            this.updateScenePreview(newVal);
        });

        console.log('🎯 角色属性绑定完成！');
    }

    /**
     * 更新状态条（通用方法）
     */
    updateStatBar(statName, value) {
        // 更新进度条
        const bar = document.getElementById(`${statName}Bar`);
        if (bar) {
            const width = statName === 'money' ? Math.min(100, value / 10) : value;
            bar.style.width = `${width}%`;

            // 添加动画效果
            bar.style.transition = 'width 0.5s ease-out';
        }

        // 更新数值文本
        const text = document.getElementById(`${statName}Value`);
        if (text) {
            // 数字动画效果
            this.animateNumber(text, parseInt(text.textContent) || 0, value);
        }

        console.log(`✅ ${statName}条更新: ${value}`);
    }

    /**
     * 数字动画效果
     */
    animateNumber(element, from, to) {
        const duration = 500; // 动画时长
        const steps = 20; // 动画步数
        const increment = (to - from) / steps;
        let current = from;
        let step = 0;

        const timer = setInterval(() => {
            step++;
            current += increment;

            if (step >= steps) {
                element.textContent = to;
                clearInterval(timer);
            } else {
                element.textContent = Math.round(current);
            }
        }, duration / steps);
    }

    /**
     * 检查体力警告
     */
    checkHealthWarning(health) {
        if (health < 20) {
            this.showNotice('⚠️ 体力过低！需要休息了');
            // 可以添加闪烁效果
            const bar = document.getElementById('healthBar');
            if (bar) {
                bar.style.animation = 'pulse 1s infinite';
            }
        }
    }

    /**
     * 检查精力警告
     */
    checkEnergyWarning(energy) {
        if (energy < 20) {
            this.showNotice('😴 精力不足！该睡觉了');
        }
    }

    /**
     * 更新心情表情
     */
    updateMoodEmoji(mood) {
        let emoji = '😐'; // 默认表情

        if (mood >= 80) emoji = '😄';
        else if (mood >= 60) emoji = '🙂';
        else if (mood >= 40) emoji = '😐';
        else if (mood >= 20) emoji = '😔';
        else emoji = '😢';

        // 如果有表情显示区域，更新它
        const moodEmoji = document.getElementById('moodEmoji');
        if (moodEmoji) {
            moodEmoji.textContent = emoji;
        }

        // 也可以更新角色立绘的表情
        const characterSprite = document.querySelector('.sprite-placeholder');
        if (characterSprite && mood < 30) {
            characterSprite.style.filter = 'grayscale(50%)'; // 心情低时变灰
        } else if (characterSprite) {
            characterSprite.style.filter = 'none';
        }
    }

    /**
     * 检查金钱状态
     */
    checkMoneyStatus(money) {
        if (money < 10) {
            this.showNotice('💸 快没钱了！需要赚钱');
        } else if (money > 1000) {
            this.showNotice('💰 你现在很富有！');
        }
    }

    /**
     * 更新场景预览
     */
    updateScenePreview(location) {
        const sceneEmojis = {
            '公寓': '🏠',
            '学校': '🏫',
            '教室': '📚',
            '操场': '🏃',
            '食堂': '🍜',
            '小镇': '🏘️',
            '商店': '🏪',
            '公园': '🌳'
        };

        const sceneContent = document.querySelector('.scene-content');
        if (sceneContent) {
            const emoji = sceneEmojis[location] || '📍';
            sceneContent.innerHTML = `
                <span class="scene-emoji">${emoji}</span>
                <span class="scene-text">${location}</span>
            `;
        }
    }

    /**
     * 显示提醒
     */
    showNotice(message) {
        const noticeText = document.getElementById('noticeText');
        if (noticeText) {
            noticeText.textContent = message;

            // 添加闪烁效果引起注意
            noticeText.style.animation = 'none';
            setTimeout(() => {
                noticeText.style.animation = 'slideLeft 10s linear infinite';
            }, 10);
        }
    }

    /**
     * 批量更新（用于场景切换等大量更新）
     */
    batchUpdate(updates) {
        console.log('🔄 批量更新开始');

        // 暂时禁用动画以提高性能
        document.body.style.transition = 'none';

        // 执行所有更新
        Object.keys(updates).forEach(key => {
            if (this.watchers[key]) {
                this.notify(key, updates[key], null);
            }
        });

        // 恢复动画
        setTimeout(() => {
            document.body.style.transition = '';
        }, 100);

        console.log('✅ 批量更新完成');
    }
}

// 创建全局响应式系统实例
window.reactiveSystem = new ReactiveSystem();

// 创建响应式的游戏状态
window.reactiveGameState = null;

// 创建响应式的NPC状态管理
window.reactiveNPCs = {};

// 初始化响应式游戏状态
function initReactiveGameState() {
    if (window.gameState && window.gameState.character) {
        // 创建响应式的角色数据
        window.reactiveGameState = window.reactiveSystem.createReactive(window.gameState.character);

        // 设置自动更新规则
        window.reactiveSystem.setupCharacterBindings();

        console.log('🎮 响应式游戏状态已初始化！');
        console.log('💡 提示：现在修改 reactiveGameState 的属性会自动更新UI');
        console.log('例如：reactiveGameState.mood = 80');

        return true;
    }
    return false;
}

// 等待游戏初始化完成后再初始化响应式系统
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            if (initReactiveGameState()) {
                console.log('✨ 响应式系统准备就绪！');
            } else {
                console.log('⏳ 等待游戏状态加载...');
                // 监听游戏状态加载完成
                const checkInterval = setInterval(() => {
                    if (initReactiveGameState()) {
                        clearInterval(checkInterval);
                    }
                }, 500);
            }
        }, 1000);
    });
} else {
    // 页面已加载，直接初始化
    setTimeout(() => {
        initReactiveGameState();
    }, 1000);
}

// 创建响应式NPC
window.createReactiveNPC = function(npcName, initialData) {
    // 创建这个NPC的响应式数据
    window.reactiveNPCs[npcName] = window.reactiveSystem.createReactive({
        name: npcName,
        affection: initialData.affection || 0,  // 好感度
        mood: initialData.mood || 'neutral',    // 心情
        state: initialData.state || 'neutral',  // 状态
        lastInteraction: null,                  // 上次互动时间
        dialogue: initialData.dialogue || [],   // 对话历史
        ...initialData  // 其他自定义属性
    });

    // 设置这个NPC的响应式绑定
    window.reactiveSystem.setupNPCBindings(npcName);

    console.log(`🎭 创建了响应式NPC: ${npcName}`);
    return window.reactiveNPCs[npcName];
};

// 测试响应式NPC系统
window.testReactiveNPC = function() {
    // 创建Zero的响应式数据
    const zero = window.createReactiveNPC('Zero', {
        affection: 50,
        mood: 'neutral',
        state: 'friendly',
        wolfSoulEnergy: 80  // Zero特有的狼魂能量
    });

    console.log('🧪 测试NPC响应式系统...');
    console.log('Zero初始好感度:', zero.affection);

    // 改变好感度，会自动触发对话更新！
    zero.affection += 30;

    // 改变心情，会自动更新立绘！
    zero.mood = 'happy';

    console.log('✅ NPC响应式测试完成！');
};

// 导出一个简单的测试函数
window.testReactive = function() {
    if (window.reactiveGameState) {
        console.log('🧪 测试响应式系统...');
        console.log('原始心情值:', window.reactiveGameState.mood);

        // 改变心情值，UI会自动更新！
        window.reactiveGameState.mood += 10;

        console.log('✅ 测试完成！检查UI是否已更新');
    } else {
        console.log('❌ 响应式系统还未初始化');
    }
};